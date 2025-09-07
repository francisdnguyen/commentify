import express from 'express';
import {
  getUserPlaylists,
  getPlaylistDetails,
  generateShareableLink,
  createPlaylist
} from '../controllers/playlistController.js';
import {
  addComment,
  getComments,
  deleteComment,
  editComment
} from '../controllers/commentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

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

export default router;
