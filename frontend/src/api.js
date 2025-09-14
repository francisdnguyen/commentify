import axios from 'axios';
import { getValidToken, isAuthenticated } from './utils/auth';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
});

// Add request interceptor for auth token
api.interceptors.request.use(async config => {
  if (!isAuthenticated()) {
    throw new Error('Not authenticated');
  }
  
  const token = await getValidToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Playlist API calls
export const getUserPlaylists = () => {
  return api.get('/api/playlists');
};

export const getUserProfile = () => {
  return api.get('/api/user/profile');
};

export const getPlaylistDetails = (playlistId) => {
  return api.get(`/api/playlists/${playlistId}`);
};

export const createPlaylist = (name, tracks = []) => {
  return api.post('/api/playlists', { name, tracks });
};

export const generateShareableLink = (playlistId) => {
  return api.get(`/api/playlists/${playlistId}/share`);
};

// Comment API calls
export const getPlaylistComments = (playlistId) => {
  return api.get(`/api/playlists/${playlistId}/comments`);
};

export const addComment = (playlistId, content) => {
  return api.post(`/api/playlists/${playlistId}/comments`, { content });
};

export const editComment = (commentId, content) => {
  return api.put(`/api/comments/${commentId}`, { content });
};

export const deleteComment = (commentId) => {
  return api.delete(`/api/comments/${commentId}`);
};

// Song comment API calls
export const addSongComment = (playlistId, trackId, content) => {
  return api.post(`/api/playlists/${playlistId}/songs/${trackId}/comments`, { content });
};

export const getSongComments = (playlistId, trackId) => {
  return api.get(`/api/playlists/${playlistId}/songs/${trackId}/comments`);
};

export const getAllSongCommentsForPlaylist = (playlistId) => {
  return api.get(`/api/playlists/${playlistId}/song-comments`);
};

// Sharing API calls
export const createShareLink = (playlistId, options = {}) => {
  console.log('🌐 API: Creating share link for playlist:', playlistId, 'with options:', options);
  return api.post(`/api/playlists/${playlistId}/share`, options);
};

export const getShareLink = (playlistId) => {
  console.log('🌐 API: Getting share link for playlist:', playlistId);
  return api.get(`/api/playlists/${playlistId}/share`);
};

export const updateSharePermissions = (playlistId, permissions) => {
  return api.put(`/api/playlists/${playlistId}/share`, permissions);
};

export const revokeShareAccess = (playlistId) => {
  return api.delete(`/api/playlists/${playlistId}/share`);
};

// Public sharing API calls (no authentication required)
export const getSharedPlaylist = (shareToken) => {
  console.log('🌐 API: Getting shared playlist for token:', shareToken);
  const url = `http://localhost:5000/api/shared/${shareToken}`;
  console.log('🌐 API: Full URL:', url);
  return axios.get(url);
};

export const addCommentToShared = (shareToken, content, authorName = 'Anonymous') => {
  return axios.post(`http://localhost:5000/api/shared/${shareToken}/comments`, {
    content,
    authorName
  });
};

export const addSongCommentToShared = (shareToken, songId, content, authorName = 'Anonymous') => {
  return axios.post(`http://localhost:5000/api/shared/${shareToken}/songs/${songId}/comments`, {
    content,
    authorName
  });
};

export const getSharedPlaylistComments = (shareToken) => {
  return axios.get(`http://localhost:5000/api/shared/${shareToken}/comments`);
};

export const markPlaylistAsViewed = (playlistId) => {
  return api.put(`/api/playlists/${playlistId}/mark-viewed`);
};
