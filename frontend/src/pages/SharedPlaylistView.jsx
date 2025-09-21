import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSharedPlaylist, addSongCommentToShared, getUserProfile } from '../api';
import { isAuthenticated } from '../utils/auth';
import ThemeToggle from '../components/ThemeToggle';
import SongCommentModal from '../components/SongCommentModal';
import LoginButton from '../components/LoginButton';

function SharedPlaylistView() {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  
  console.log('🔗 SharedPlaylistView: Received shareToken from URL:', shareToken);
  console.log('🔗 SharedPlaylistView: ShareToken length:', shareToken?.length);
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Authentication state
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  // Song comments modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [songComments, setSongComments] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const songsPerPage = 50;

  // Anonymous comment state
  const [anonymousName, setAnonymousName] = useState('');

  // Function to decode HTML entities
  const decodeHtmlEntities = (text) => {
    if (!text) return text;
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  };

  useEffect(() => {
    async function loadSharedPlaylist() {
      try {
        setLoading(true);
        
        // Check authentication and load user profile if authenticated
        const authenticated = isAuthenticated();
        setIsUserAuthenticated(authenticated);
        
        if (authenticated) {
          try {
            const profileResponse = await getUserProfile();
            setUserProfile(profileResponse.data);
            console.log('User profile loaded:', profileResponse.data);
          } catch (profileError) {
            console.log('Failed to load user profile:', profileError);
            // User is authenticated but profile failed - continue with anonymous
            setIsUserAuthenticated(false);
          }
        }
        
        // Load playlist data (includes song comments)
        const response = await getSharedPlaylist(shareToken);
        console.log('Shared playlist data:', response.data);
        
        // Update state with fetched data - extract playlist and song comments from response
        setPlaylist(response.data.playlist);
        setSongComments(response.data.songComments || {}); // Use song comments from the main response
        setError(null);
      } catch (err) {
        console.error('Error loading shared playlist:', err);
        if (err.message.includes('404')) {
          setError('Shared playlist not found or the link has expired.');
        } else if (err.message.includes('403')) {
          setError('This shared playlist is no longer accessible.');
        } else {
          setError('Failed to load shared playlist. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }

    if (shareToken) {
      loadSharedPlaylist();
    }
  }, [shareToken]);

  const openSongModal = (song) => {
    setSelectedSong(song);
    setIsModalOpen(true);
  };

  const closeSongModal = () => {
    setIsModalOpen(false);
    setSelectedSong(null);
  };

  const addSongComment = async (songId, comment) => {
    // Use authenticated user's name or require anonymous name
    const commenterName = isUserAuthenticated && userProfile?.display_name 
      ? userProfile.display_name 
      : anonymousName.trim();
    
    if (!commenterName) {
      alert(isUserAuthenticated ? 'Unable to get your Spotify username' : 'Please enter your name to comment');
      return;
    }

    try {
      const response = await addSongCommentToShared(shareToken, songId, comment, commenterName);
      const newComment = response.data;
      
      // Update local state with proper comment format
      setSongComments(prev => ({
        ...prev,
        [songId]: [...(prev[songId] || []), {
          id: newComment._id,
          text: newComment.content,
          author: newComment.user?.displayName || newComment.anonymousName || 'Anonymous',
          timestamp: newComment.createdAt,
          songId: songId
        }]
      }));
      
      console.log('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <ThemeToggle />
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <ThemeToggle />
            <button
              onClick={() => navigate('/')}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Unable to Load Playlist</h2>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate pagination
  const tracks = playlist?.tracks?.items || [];
  const totalSongs = tracks.length;
  const totalPages = Math.ceil(totalSongs / songsPerPage);
  const startIndex = (currentPage - 1) * songsPerPage;
  const endIndex = startIndex + songsPerPage;
  const currentTracks = tracks.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header with Theme Toggle and Back Button */}
        <div className="flex justify-between items-center mb-6">
          <ThemeToggle />
          <button
            onClick={() => navigate('/')}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011 1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
          {/* Shared Playlist Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span className="text-blue-800 dark:text-blue-300 font-medium">
                This is a shared playlist! You can view songs and add comments.
              </span>
            </div>
          </div>

          {/* User Authentication Section */}
          <div className="mb-6">
            {isUserAuthenticated && userProfile ? (
              // Authenticated user section
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="text-green-800 dark:text-green-300 font-medium">
                      Signed in as {userProfile.display_name}
                    </span>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Your comments will show your Spotify username
                    </p>
                  </div>
                </div>
                {userProfile.images?.[0]?.url && (
                  <img 
                    src={userProfile.images[0].url} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full"
                  />
                )}
              </div>
            ) : (
              // Anonymous/Login section
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <span className="text-yellow-800 dark:text-yellow-300 font-medium">
                        Sign in with Spotify for personalized comments
                      </span>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Or continue as anonymous user below
                      </p>
                    </div>
                  </div>
                  <LoginButton />
                </div>
                
                <div>
                  <label htmlFor="anonymous-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name (for anonymous comments)
                  </label>
                  <input
                    type="text"
                    id="anonymous-name"
                    value={anonymousName}
                    onChange={(e) => setAnonymousName(e.target.value)}
                    placeholder="Enter your name to comment on songs"
                    className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

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
                {decodeHtmlEntities(playlist?.description) || ''}
              </p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span>Created by {playlist?.owner?.display_name || 'Unknown'}</span>
                <span className="mx-2">•</span>
                <span>{playlist?.tracks?.total || 0} tracks</span>
                {playlist?.followers?.total !== undefined && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{playlist?.followers?.total} followers</span>
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
              {currentTracks.map((item, index) => {
                if (!item?.track) return null;
                
                const track = item.track;
                const globalIndex = startIndex + index + 1;
                const commentCount = songComments[track.id]?.length || 0;
                
                return (
                  <div
                    key={track.id || index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 group cursor-pointer"
                    onClick={() => openSongModal(track)}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-8 text-center">
                        {globalIndex}
                      </span>
                      <img
                        src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url || '/placeholder-album.png'}
                        alt={track.album?.name || 'Album'}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {track.name || 'Unknown Track'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
                        {track.duration_ms ? 
                          `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}` 
                          : '--:--'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openSongModal(track);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-600 rounded-full relative transition-colors duration-200"
                        title="View comments"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {commentCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {commentCount}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Next
                </button>
              </div>
              
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Song Comment Modal */}
      <SongCommentModal
        isOpen={isModalOpen}
        onClose={closeSongModal}
        song={selectedSong}
        playlistId={`shared-${shareToken}`}
        comments={selectedSong ? songComments[selectedSong.id] || [] : []}
        onAddComment={addSongComment}
        isSharedPlaylist={true}
        anonymousName={anonymousName}
      />
    </div>
  );
}

export default SharedPlaylistView;