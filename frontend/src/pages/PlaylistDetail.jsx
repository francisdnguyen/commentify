import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPlaylistDetails } from '../api';
import CommentSection from '../components/CommentSection';
import ThemeToggle from '../components/ThemeToggle';

function PlaylistDetail() {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      try {
        setLoading(true);
        const response = await getPlaylistDetails(playlistId);
        console.log('Playlist data:', response.data);
        setPlaylist(response.data);
      } catch (err) {
        console.error('Error fetching playlist:', err.response?.data || err.message);
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

    fetchPlaylistDetails();
  }, [playlistId]);

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
              {playlist?.description || 'No description'}
            </p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Created by {playlist?.owner?.display_name || 'Unknown'}</span>
              <span className="mx-2">•</span>
              <span>{playlist?.tracks?.total || 0} tracks</span>
              {playlist?.followers?.total && (
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
                className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <span className="w-8 text-gray-400 dark:text-gray-500">{index + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{item?.track?.name || 'Unknown Track'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item?.track?.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}
                  </p>
                </div>
                <span className="text-gray-400 dark:text-gray-500 text-sm">
                  {item?.track?.duration_ms ? 
                    `${Math.floor(item.track.duration_ms / 60000)}:${String(Math.floor((item.track.duration_ms % 60000) / 1000)).padStart(2, '0')}` 
                    : '--:--'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <CommentSection playlistId={playlistId} />
        </div>
      </div>
    </div>
  );
}

export default PlaylistDetail;
