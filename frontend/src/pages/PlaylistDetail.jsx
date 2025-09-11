import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlaylistDetails, getUserProfile, getAllSongCommentsForPlaylist, addSongComment as apiAddSongComment } from '../api';
import CommentSection from '../components/CommentSection';
import ThemeToggle from '../components/ThemeToggle';
import SongCommentModal from '../components/SongCommentModal';
import { useCache } from '../contexts/CacheContext';

function PlaylistDetail() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const cache = useCache();
  const [playlist, setPlaylist] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Song comments modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [songComments, setSongComments] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const songsPerPage = 50;

  // Function to decode HTML entities
  const decodeHtmlEntities = (text) => {
    if (!text) return text;
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check cache first
        const cachedPlaylist = cache.getCachedPlaylistDetails(playlistId);
        const cachedUser = cache.getCachedUserProfile();

        if (cachedPlaylist && cachedUser) {
          console.log('Loading playlist from cache...');
          setPlaylist(cachedPlaylist);
          setUser(cachedUser);
        } else {
          console.log('Cache miss, fetching fresh playlist data...');
          
          // Fetch playlist details
          const playlistResponse = await getPlaylistDetails(playlistId);
          const playlistData = playlistResponse.data;
          setPlaylist(playlistData);
          
          // Cache the playlist data
          cache.setPlaylistDetails(playlistId, playlistData);
          
          // Fetch user profile separately with its own error handling
          try {
            let userData = cachedUser;
            if (!userData) {
              const userResponse = await getUserProfile();
              userData = userResponse.data;
              cache.setUserProfile(userData);
            }
            setUser(userData);
          } catch (userErr) {
            console.error('Error fetching user profile:', userErr);
            // Don't fail the whole component if user profile fails
          }
        }

        // Always fetch song comments fresh (don't cache these)
        try {
          const songCommentsResponse = await getAllSongCommentsForPlaylist(playlistId);
          const rawComments = songCommentsResponse.data;
          
          // Transform backend format to frontend format
          const transformedComments = {};
          Object.keys(rawComments).forEach(trackId => {
            transformedComments[trackId] = rawComments[trackId].map(comment => ({
              id: comment._id,
              text: comment.content,
              author: comment.user?.displayName || 'Anonymous',
              timestamp: comment.createdAt,
              songId: trackId
            }));
          });
          
          setSongComments(transformedComments);
        } catch (songCommentsErr) {
          console.error('Error fetching song comments:', songCommentsErr);
          // Don't fail if song comments can't be loaded
          setSongComments({});
        }

        // Loading will be set to false in the finally block
        
      } catch (err) {
        console.error('Error fetching playlist data:', err.response?.data || err.message);
        if (err.response?.status === 404) {
          setError('Playlist not found');
        } else if (err.response?.status === 401) {
          setError('Authentication error - please try logging in again');
        } else {
          setError('Failed to load playlist: ' + (err.response?.data?.error || err.message));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [playlistId, cache]);

  // Modal functions
  const openSongModal = (song) => {
    setSelectedSong(song);
    setIsModalOpen(true);
  };

  const closeSongModal = () => {
    setIsModalOpen(false);
    setSelectedSong(null);
  };

  const addSongComment = async (songId, commentText) => {
    try {
      // Save comment to backend
      const response = await apiAddSongComment(playlistId, songId, commentText);
      const newComment = response.data;

      // Update local state to show the comment immediately
      setSongComments(prev => ({
        ...prev,
        [songId]: [...(prev[songId] || []), {
          id: newComment._id,
          text: newComment.content,
          author: newComment.user.displayName,
          timestamp: newComment.createdAt,
          songId: songId
        }]
      }));
    } catch (error) {
      console.error('Error adding song comment:', error);
      // Fallback to local storage if backend fails
      const newComment = {
        id: Date.now(),
        text: commentText,
        author: user?.display_name || 'Unknown User',
        timestamp: new Date().toISOString(),
        songId: songId
      };

      setSongComments(prev => ({
        ...prev,
        [songId]: [...(prev[songId] || []), newComment]
      }));
    }
  };

  // Pagination logic
  const totalSongs = playlist?.tracks?.items?.length || 0;
  const totalPages = Math.ceil(totalSongs / songsPerPage);
  const startIndex = (currentPage - 1) * songsPerPage;
  const endIndex = startIndex + songsPerPage;
  const currentSongs = playlist?.tracks?.items?.slice(startIndex, endIndex) || [];

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200 flex items-center justify-center">
      <div className="text-gray-900 dark:text-gray-100 text-xl">Loading playlist...</div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200 flex items-center justify-center">
      <div className="text-red-500 dark:text-red-400 text-xl">{error}</div>
    </div>
  );
  if (!playlist) return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200 flex items-center justify-center">
      <div className="text-gray-900 dark:text-gray-100 text-xl">Playlist not found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header with Theme Toggle and Back Button */}
        <div className="flex justify-between items-center mb-6">
          <ThemeToggle />
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
        {/* Playlist Header */}
        <div className="flex items-start space-x-6 mb-6">
          <img
            src={playlist?.images?.[0]?.url || '/placeholder-playlist.png'}
            alt={playlist?.name || 'Playlist'}
            className="w-48 h-48 object-cover rounded-lg shadow-md"
          />
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">{playlist?.name || 'Untitled Playlist'}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {decodeHtmlEntities(playlist.description) || ''}
            </p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Created by {playlist?.owner?.display_name || 'Unknown'}</span>
              <span className="mx-2">•</span>
              <span>{playlist?.tracks?.total || 0} tracks</span>
              {playlist?.followers?.total !== undefined && (
                <>
                  <span className="mx-2">•</span>
                  <span>{playlist.followers.total} followers</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Tracks</h2>
            {totalSongs > songsPerPage && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {startIndex + 1}-{Math.min(endIndex, totalSongs)} of {totalSongs} tracks
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {currentSongs.map((item, index) => (
              <div
                key={item.track.id}
                onClick={() => openSongModal(item.track)}
                className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 group cursor-pointer"
              >
                <span className="w-12 text-right mr-4 text-gray-400 dark:text-gray-500">{startIndex + index + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{item?.track?.name || 'Unknown Track'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item?.track?.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400 dark:text-gray-500 text-sm">
                    {item?.track?.duration_ms ? 
                      `${Math.floor(item.track.duration_ms / 60000)}:${String(Math.floor((item.track.duration_ms % 60000) / 1000)).padStart(2, '0')}` 
                      : '--:--'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click when clicking the button
                      openSongModal(item.track);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-600 rounded-full relative"
                    title="View comments"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {songComments[item.track.id]?.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {songComments[item.track.id].length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === pageNumber
                            ? 'text-blue-600 bg-blue-50 border border-blue-300 dark:bg-gray-700 dark:text-blue-400 dark:border-blue-600'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <CommentSection playlistId={playlistId} />
        </div>
      </div>

      {/* Song Comment Modal */}
      <SongCommentModal
        isOpen={isModalOpen}
        onClose={closeSongModal}
        song={selectedSong}
        playlistId={playlistId}
        comments={selectedSong ? songComments[selectedSong.id] || [] : []}
        onAddComment={addSongComment}
      />
    </div>
  );
}

export default PlaylistDetail;
