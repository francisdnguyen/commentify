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
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
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
            setAllPlaylists(playlistsResponse.data);
            setPlaylists(playlistsResponse.data); // Initially show all playlists
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterDropdownOpen && !event.target.closest('.relative')) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  // Filter playlists based on ownership
  const filterPlaylists = (filterType) => {
    if (!userProfile || !allPlaylists.length) return;
    
    let filtered;
    switch (filterType) {
      case 'owned':
        filtered = allPlaylists.filter(playlist => playlist.owner.id === userProfile.id);
        break;
      case 'saved':
        filtered = allPlaylists.filter(playlist => playlist.owner.id !== userProfile.id);
        break;
      default:
        filtered = allPlaylists;
    }
    
    setPlaylists(filtered);
    setFilter(filterType);
    setIsFilterDropdownOpen(false);
  };

  const getFilterDisplayText = () => {
    switch (filter) {
      case 'owned': return 'My Playlists';
      case 'saved': return 'Saved Playlists';
      default: return 'All Playlists';
    }
  };

  const handleCreatePlaylist = (newPlaylist) => {
    const updatedAllPlaylists = [newPlaylist, ...allPlaylists];
    setAllPlaylists(updatedAllPlaylists);
    
    // Apply current filter to include the new playlist if it matches
    if (filter === 'all' || (filter === 'owned' && userProfile && newPlaylist.owner.id === userProfile.id)) {
      setPlaylists([newPlaylist, ...playlists]);
    }
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
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              {getFilterDisplayText()}
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isFilterDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[160px]">
                <button
                  onClick={() => filterPlaylists('all')}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${filter === 'all' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}
                >
                  All Playlists
                </button>
                <button
                  onClick={() => filterPlaylists('owned')}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${filter === 'owned' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}
                >
                  My Playlists
                </button>
                <button
                  onClick={() => filterPlaylists('saved')}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 rounded-b-lg ${filter === 'saved' ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}
                >
                  Saved Playlists
                </button>
              </div>
            )}
          </div>
          
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
