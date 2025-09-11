import React, { createContext, useContext, useReducer } from 'react';

const CacheContext = createContext();

// Cache actions
const CACHE_ACTIONS = {
  SET_USER_PROFILE: 'SET_USER_PROFILE',
  SET_PLAYLISTS: 'SET_PLAYLISTS',
  SET_PLAYLIST_DETAILS: 'SET_PLAYLIST_DETAILS',
  CLEAR_CACHE: 'CLEAR_CACHE',
  CLEAR_PLAYLISTS_CACHE: 'CLEAR_PLAYLISTS_CACHE',
  SET_CACHE_TIMESTAMP: 'SET_CACHE_TIMESTAMP'
};

// Cache reducer
const cacheReducer = (state, action) => {
  switch (action.type) {
    case CACHE_ACTIONS.SET_USER_PROFILE:
      return {
        ...state,
        userProfile: action.payload,
        timestamps: {
          ...state.timestamps,
          userProfile: Date.now()
        }
      };
    
    case CACHE_ACTIONS.SET_PLAYLISTS:
      return {
        ...state,
        playlists: action.payload,
        timestamps: {
          ...state.timestamps,
          playlists: Date.now()
        }
      };
    
    case CACHE_ACTIONS.SET_PLAYLIST_DETAILS:
      return {
        ...state,
        playlistDetails: {
          ...state.playlistDetails,
          [action.payload.id]: action.payload.data
        },
        timestamps: {
          ...state.timestamps,
          [`playlist_${action.payload.id}`]: Date.now()
        }
      };
    
    case CACHE_ACTIONS.CLEAR_CACHE:
      return {
        userProfile: null,
        playlists: null,
        playlistDetails: {},
        timestamps: {}
      };
    
    case CACHE_ACTIONS.CLEAR_PLAYLISTS_CACHE:
      const { playlists: removedPlaylists, ...remainingTimestamps } = state.timestamps;
      return {
        ...state,
        playlists: null,
        timestamps: remainingTimestamps
      };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  userProfile: null,
  playlists: null,
  playlistDetails: {},
  timestamps: {}
};

// Cache expiry time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

export const CacheProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cacheReducer, initialState);

  // Helper function to check if cache is valid
  const isCacheValid = (key) => {
    const timestamp = state.timestamps[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_EXPIRY;
  };

  // Cache actions
  const setUserProfile = (profile) => {
    dispatch({
      type: CACHE_ACTIONS.SET_USER_PROFILE,
      payload: profile
    });
  };

  const setPlaylists = (playlists) => {
    dispatch({
      type: CACHE_ACTIONS.SET_PLAYLISTS,
      payload: playlists
    });
  };

  const setPlaylistDetails = (id, data) => {
    dispatch({
      type: CACHE_ACTIONS.SET_PLAYLIST_DETAILS,
      payload: { id, data }
    });
  };

  const clearCache = () => {
    dispatch({ type: CACHE_ACTIONS.CLEAR_CACHE });
  };

  const clearPlaylistsCache = () => {
    dispatch({ type: CACHE_ACTIONS.CLEAR_PLAYLISTS_CACHE });
  };

  // Getters with cache validation
  const getCachedUserProfile = () => {
    if (isCacheValid('userProfile')) {
      return state.userProfile;
    }
    return null;
  };

  const getCachedPlaylists = () => {
    if (isCacheValid('playlists')) {
      return state.playlists;
    }
    return null;
  };

  const getCachedPlaylistDetails = (id) => {
    if (isCacheValid(`playlist_${id}`)) {
      return state.playlistDetails[id];
    }
    return null;
  };

  const value = {
    // State
    state,
    
    // Actions
    setUserProfile,
    setPlaylists,
    setPlaylistDetails,
    clearCache,
    clearPlaylistsCache,
    
    // Getters
    getCachedUserProfile,
    getCachedPlaylists,
    getCachedPlaylistDetails,
    
    // Utility
    isCacheValid
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};

export default CacheContext;
