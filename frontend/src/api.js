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
