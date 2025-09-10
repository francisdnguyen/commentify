import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPlaylistDetails, getUserProfile } from '../api';
import CommentSection from '../components/CommentSection';
import ThemeToggle from '../components/ThemeToggle';
import SongCommentModal from '../components/SongCommentModal';

function PlaylistDetail() {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Song comments modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [songComments, setSongComments] = useState({});

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
        
        // Fetch playlist details
        const playlistResponse = await getPlaylistDetails(playlistId);
        setPlaylist(playlistResponse.data);
        
        // Fetch user profile separately with its own error handling
        try {
          const userResponse = await getUserProfile();
          setUser(userResponse.data);
        } catch (userErr) {
          console.error('Error fetching user profile:', userErr);
          // Don't fail the whole component if user profile fails
        }
        
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
  }, [playlistId]);

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
    // For now, we'll store comments locally. In a real app, this would be an API call
    const newComment = {
      id: Date.now(),
      text: commentText,
      author: user?.display_name || 'Unknown User', // Use actual Spotify username
      timestamp: new Date().toISOString(),
      songId: songId
    };

    setSongComments(prev => ({
      ...prev,
      [songId]: [...(prev[songId] || []), newComment]
    }));
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
        {/* Theme Toggle */}
        <div className="flex justify-start mb-6">
          <ThemeToggle />
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
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Tracks</h2>
          <div className="space-y-2">
            {playlist.tracks?.items?.map((item, index) => (
              <div
                key={item.track.id}
                onClick={() => openSongModal(item.track)}
                className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 group cursor-pointer"
              >
                <span className="w-8 text-gray-400 dark:text-gray-500">{index + 1}</span>
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
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-600 rounded-full relative"
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
