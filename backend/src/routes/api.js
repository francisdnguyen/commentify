import express from 'express';
import {
  getUserPlaylists,
  getPlaylistDetails,
  generateShareableLink,
  createPlaylist,
  getUserProfile
} from '../controllers/playlistController.js';
import {
  addComment,
  getComments,
  deleteComment,
  editComment,
  addSongComment,
  getSongComments,
  getAllSongCommentsForPlaylist
} from '../controllers/commentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.get('/user/profile', authenticateToken, getUserProfile);

// Playlist routes
router.get('/playlists', authenticateToken, getUserPlaylists);
router.get('/playlists/:playlistId', authenticateToken, getPlaylistDetails);
router.post('/playlists', authenticateToken, createPlaylist);
router.get('/playlists/:playlistId/share', authenticateToken, generateShareableLink);

// Comment routes
router.get('/playlists/:playlistId/comments', authenticateToken, getComments);
router.post('/playlists/:playlistId/comments', authenticateToken, addComment);
router.put('/comments/:commentId', authenticateToken, editComment);
router.delete('/comments/:commentId', authenticateToken, deleteComment);

// Song comment routes
router.get('/playlists/:playlistId/songs/:trackId/comments', authenticateToken, getSongComments);
router.post('/playlists/:playlistId/songs/:trackId/comments', authenticateToken, addSongComment);
router.get('/playlists/:playlistId/song-comments', authenticateToken, getAllSongCommentsForPlaylist);

export default router;
