import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PlaylistCard from '../components/PlaylistCard';
import ThemeToggle from '../components/ThemeToggle';
import { getUserPlaylists } from '../api';
import { getValidToken } from '../utils/auth';
import { useCache } from '../contexts/CacheContext';

function Dashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [commentFilter, setCommentFilter] = useState('all'); // 'all', 'commented', 'uncommented'
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isCommentFilterDropdownOpen, setIsCommentFilterDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const cache = useCache();

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cachedUserProfile = cache.getCachedUserProfile();
        const cachedPlaylists = cache.getCachedPlaylists();

        if (cachedUserProfile && cachedPlaylists) {
          console.log('Loading from cache...');
          if (mounted) {
            setUserProfile(cachedUserProfile);
            setAllPlaylists(cachedPlaylists);
            setPlaylists(cachedPlaylists);
            setLoading(false);
          }
          return;
        }

        console.log('Cache miss, fetching fresh data...');

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
            const profileData = profileResponse.data;
            const playlistsData = playlistsResponse.data;

            // Update state
            setUserProfile(profileData);
            setAllPlaylists(playlistsData);
            setPlaylists(playlistsData);

            // Update cache
            cache.setUserProfile(profileData);
            cache.setPlaylists(playlistsData);
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
  }, [navigate, cache]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if ((isFilterDropdownOpen || isCommentFilterDropdownOpen) && !event.target.closest('.relative')) {
        setIsFilterDropdownOpen(false);
        setIsCommentFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen, isCommentFilterDropdownOpen]);

  // Filter playlists based on ownership and comments
  const applyFilters = () => {
    if (!userProfile || !allPlaylists.length) return;
    
    let filtered = [...allPlaylists];
    
    // Apply ownership filter
    switch (filter) {
      case 'owned':
        filtered = filtered.filter(playlist => playlist.owner.id === userProfile.id);
        break;
      case 'saved':
        filtered = filtered.filter(playlist => playlist.owner.id !== userProfile.id);
        break;
      default:
        // 'all' - no filtering needed
        break;
    }
    
    // Apply comment filter
    switch (commentFilter) {
      case 'commented':
        filtered = filtered.filter(playlist => playlist.hasComments);
        break;
      case 'uncommented':
        filtered = filtered.filter(playlist => !playlist.hasComments);
        break;
      default:
        // 'all' - no filtering needed
        break;
    }
    
    setPlaylists(filtered);
  };

  // Filter playlists based on ownership
  const filterPlaylists = (filterType) => {
    setFilter(filterType);
    setIsFilterDropdownOpen(false);
  };

  // Filter playlists based on comments
  const filterByComments = (commentFilterType) => {
    setCommentFilter(commentFilterType);
    setIsCommentFilterDropdownOpen(false);
  };

  const getCommentFilterDisplayText = () => {
    switch (commentFilter) {
      case 'commented': return 'Has Comments';
      case 'uncommented': return 'No Comments';
      default: return 'All Comments';
    }
  };

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
  }, [filter, commentFilter, allPlaylists, userProfile]);

  const getFilterDisplayText = () => {
    switch (filter) {
      case 'owned': return 'My Playlists';
      case 'saved': return 'Saved Playlists';
      default: return 'All Playlists';
    }
  };

  const handleLogout = () => {
    // Only clear auth-related localStorage items, preserve theme and other settings
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expiry');
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
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome, {userProfile?.display_name}</h1>
            <p className="text-gray-600 dark:text-gray-400">Here are your playlists</p>
          </div>
        </div>
        <div className="flex gap-4">
          {/* Comment Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCommentFilterDropdownOpen(!isCommentFilterDropdownOpen)}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                commentFilter === 'all' 
                  ? 'bg-gray-500 dark:bg-gray-600 text-white hover:bg-gray-600 dark:hover:bg-gray-700'
                  : commentFilter === 'commented'
                  ? 'bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700'
                  : 'bg-orange-500 dark:bg-orange-600 text-white hover:bg-orange-600 dark:hover:bg-orange-700'
              }`}
            >
              {getCommentFilterDisplayText()}
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isCommentFilterDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isCommentFilterDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[160px]">
                <button
                  onClick={() => filterByComments('all')}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${commentFilter === 'all' ? 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}
                >
                  All Comments
                </button>
                <button
                  onClick={() => filterByComments('commented')}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${commentFilter === 'commented' ? 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}
                >
                  Has Comments
                </button>
                <button
                  onClick={() => filterByComments('uncommented')}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 rounded-b-lg ${commentFilter === 'uncommented' ? 'bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-gray-100'}`}
                >
                  No Comments
                </button>
              </div>
            )}
          </div>

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
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors duration-200"
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
      </div>
    </div>
  );
}

export default Dashboard;
