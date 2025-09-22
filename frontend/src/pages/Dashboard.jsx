import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PlaylistCard from '../components/PlaylistCard';
import ThemeToggle from '../components/ThemeToggle';
import { getUserPlaylists, getUserSharedPlaylistIds, getPlaylistsSharedWithMe } from '../api';
import { getValidToken } from '../utils/auth';
import { useCache } from '../contexts/CacheContext';

function Dashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [sharedPlaylistIds, setSharedPlaylistIds] = useState([]);
  const [playlistsSharedWithMe, setPlaylistsSharedWithMe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const cache = useCache();

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      try {
        // SELECTIVE CACHE LOADING
        const cachedUserProfile = cache.getCachedUserProfile();
        const cachedPlaylists = cache.getCachedPlaylists();

        // Strategy: Load user profile from cache instantly, fetch playlists based on cache status
        if (cachedUserProfile && cachedPlaylists) {
          // Both cached - fast load
          if (mounted) {
            setUserProfile(cachedUserProfile);
            setAllPlaylists(cachedPlaylists);
            setPlaylists(cachedPlaylists);
            setLoading(false);
          }
          
          // Still need to fetch shared playlist IDs and playlists shared with me even when cached
          try {
            const [sharedResponse, sharedWithMeResponse] = await Promise.all([
              getUserSharedPlaylistIds(),
              getPlaylistsSharedWithMe()
            ]);
            
            if (mounted) {
              setSharedPlaylistIds(sharedResponse.data.sharedPlaylistIds);
              setPlaylistsSharedWithMe(sharedWithMeResponse.data);
            }
          } catch (sharedError) {
            console.warn('Failed to load shared playlist data (cache path):', sharedError);
          }
          return;
        }

        if (cachedUserProfile && !cachedPlaylists) {
          // Profile cached, playlists cleared (after playlist visit or comment activity)
          if (mounted) {
            setUserProfile(cachedUserProfile); // Show profile immediately
            setLoading(true); // Keep loading for playlists
          }
        } else {
          // Full cache miss
          setLoading(true);
          setError(null);
        }

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

        // Smart fetching: Only fetch what's not cached
        try {
          const requests = [];
          
          // Only fetch user profile if not cached
          if (!cachedUserProfile) {
            requests.push(
              axios.get('https://api.spotify.com/v1/me', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
              })
            );
          }
          
          // Always fetch playlists if not cached (ensures fresh comment status)
          if (!cachedPlaylists) {
            requests.push(getUserPlaylists());
          }

          const responses = await Promise.all(requests);

          if (mounted) {
            let profileData = cachedUserProfile;
            let playlistsData;

            if (!cachedUserProfile && !cachedPlaylists) {
              // Both fetched
              profileData = responses[0].data;
              playlistsData = responses[1].data;
            } else if (!cachedUserProfile && cachedPlaylists) {
              // Only profile fetched (unlikely scenario)
              profileData = responses[0].data;
              playlistsData = cachedPlaylists;
            } else if (cachedUserProfile && !cachedPlaylists) {
              // Only playlists fetched (common after comment addition)
              playlistsData = responses[0].data;
            }

            // Update state
            if (!cachedUserProfile) {
              setUserProfile(profileData);
              cache.setUserProfile(profileData);
            }
            
            if (!cachedPlaylists) {
              setAllPlaylists(playlistsData);
              setPlaylists(playlistsData);
              cache.setPlaylists(playlistsData);
            }

            // Always fetch shared playlist data (not cached)
            try {
              const [sharedResponse, sharedWithMeResponse] = await Promise.all([
                getUserSharedPlaylistIds(),
                getPlaylistsSharedWithMe()
              ]);
              
              setSharedPlaylistIds(sharedResponse.data.sharedPlaylistIds);
              setPlaylistsSharedWithMe(sharedWithMeResponse.data);
              console.log('✅ Shared playlist IDs loaded:', sharedResponse.data.sharedPlaylistIds.length, 'ids');
              console.log('✅ Playlists shared with me loaded:', sharedWithMeResponse.data.length, 'playlists');
            } catch (sharedError) {
              console.warn('Failed to load shared playlist data:', sharedError);
              // Don't fail the whole page if shared playlist data can't be loaded
            }
            
            setLoading(false);
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
      } catch (error) {
        console.error('Unexpected error:', error);
        if (mounted) {
          setError('An unexpected error occurred');
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
      if (isFilterDropdownOpen && !event.target.closest('.relative')) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  // Filter playlists based on ownership and comments
  const applyFilters = useCallback(() => {
    if (!userProfile) return;
    
    let filtered = [];
    
    // Apply ownership and sharing filter
    switch (filter) {
      case 'owned':
        filtered = allPlaylists.filter(playlist => playlist.owner.id === userProfile.id);
        break;
      case 'saved':
        filtered = allPlaylists.filter(playlist => playlist.owner.id !== userProfile.id);
        break;
      case 'shared-by-me':
        // Filter existing playlists to show only those that have been shared
        console.log('🔍 Filtering for shared playlists. IDs:', sharedPlaylistIds);
        filtered = allPlaylists.filter(playlist => sharedPlaylistIds.includes(playlist.id));
        console.log('✅ Found', filtered.length, 'shared playlists');
        break;
      case 'shared-with-me':
        // Show playlists that others have shared with me
        console.log('🔍 Filtering for playlists shared with me:', playlistsSharedWithMe.length);
        filtered = [...playlistsSharedWithMe];
        console.log('✅ Found', filtered.length, 'playlists shared with me');
        break;
      case 'all':
      default:
        // 'all' - show regular playlists only (not shared)
        filtered = [...allPlaylists];
        break;
    }
    
    setPlaylists(filtered);
  }, [filter, allPlaylists, sharedPlaylistIds, playlistsSharedWithMe, userProfile]);

  // Filter playlists based on ownership
  const filterPlaylists = (filterType) => {
    setFilter(filterType);
    setIsFilterDropdownOpen(false);
  };

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const getFilterDisplayText = () => {
    switch (filter) {
      case 'owned': return 'My Playlists';
      case 'saved': return 'Saved Playlists';
      case 'shared-by-me': return 'Shared by Me';
      case 'shared-with-me': return 'Shared with Me';
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              Welcome, {userProfile?.display_name}
              {loading && !userProfile && (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" 
                     title="Loading..."></div>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here are your playlists
              {loading && userProfile && !playlists.length && (
                <span className="ml-2 text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Refreshing comment status...
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
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
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${filter === 'all' ? 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}
                >
                  All Playlists
                </button>
                <button
                  onClick={() => filterPlaylists('owned')}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${filter === 'owned' ? 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}
                >
                  My Playlists
                </button>
                <button
                  onClick={() => filterPlaylists('saved')}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${filter === 'saved' ? 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}
                >
                  Saved Playlists
                </button>
                <button
                  onClick={() => filterPlaylists('shared-by-me')}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${filter === 'shared-by-me' ? 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}
                >
                  Shared by Me
                </button>
                <button
                  onClick={() => filterPlaylists('shared-with-me')}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 rounded-b-lg ${filter === 'shared-with-me' ? 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}
                >
                  Shared with Me
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
