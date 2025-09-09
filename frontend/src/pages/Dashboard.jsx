import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PlaylistCard from '../components/PlaylistCard';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import ThemeToggle from '../components/ThemeToggle';
import { getUserPlaylists } from '../api';
import { getValidToken } from '../utils/auth';

function Dashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      try {
        setLoading(true);
        setError(null);

        // Add a small delay to ensure auth state is settled
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get and validate token
        let accessToken;
        try {
          accessToken = await getValidToken();
        } catch (error) {
          console.error('Token validation failed:', error);
          if (mounted) {
            navigate('/');
          }
          return;
        }

        // Fetch data with individual error handling
        try {
          const [profileResponse, playlistsResponse] = await Promise.all([
            axios.get('https://api.spotify.com/v1/me', {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            }),
            getUserPlaylists()
          ]);

          if (mounted) {
            setUserProfile(profileResponse.data);
            setPlaylists(playlistsResponse.data);
          }
        } catch (error) {
          console.error('API request failed:', error);
          if (mounted) {
            setError('Failed to load dashboard data');
            if (error.response?.status === 401) {
              navigate('/');
            }
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleCreatePlaylist = (newPlaylist) => {
    setPlaylists([newPlaylist, ...playlists]);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="text-gray-900 dark:text-gray-100 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome, {userProfile?.display_name}</h1>
            <p className="text-gray-600 dark:text-gray-400">Here are your playlists</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors duration-200"
          >
            Create New Playlist
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map(playlist => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreatePlaylist}
      />
      </div>
    </div>
  );
}

export default Dashboard;
