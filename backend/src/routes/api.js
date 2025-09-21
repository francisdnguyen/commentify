import express from 'express';
import {
  getUserPlaylists,
  getPlaylistDetails,
  generateShareableLink,
  createPlaylist,
  getUserProfile,
  markPlaylistAsViewed
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
import {
  createShareLink,
  getShareLink,
  revokeShareAccess,
  updateSharePermissions,
  getSharedPlaylist,
  addCommentToShared,
  getSharedPlaylistComments,
  getUserSharedPlaylists,
  getUserSharedPlaylistIds,
  getPlaylistsSharedWithUser
} from '../controllers/shareController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.get('/user/profile', authenticateToken, getUserProfile);

// Playlist routes
router.get('/playlists', authenticateToken, getUserPlaylists);
router.get('/playlists/:playlistId', authenticateToken, getPlaylistDetails);
router.post('/playlists', authenticateToken, createPlaylist);
router.put('/playlists/:playlistId/mark-viewed', authenticateToken, markPlaylistAsViewed);
// Note: removed old generateShareableLink route - now using getShareLink below

// Comment routes
router.get('/playlists/:playlistId/comments', authenticateToken, getComments);
router.post('/playlists/:playlistId/comments', authenticateToken, addComment);
router.put('/comments/:commentId', authenticateToken, editComment);
router.delete('/comments/:commentId', authenticateToken, deleteComment);

// Song comment routes
router.get('/playlists/:playlistId/songs/:trackId/comments', authenticateToken, getSongComments);
router.post('/playlists/:playlistId/songs/:trackId/comments', authenticateToken, addSongComment);
router.get('/playlists/:playlistId/song-comments', authenticateToken, getAllSongCommentsForPlaylist);

// Sharing routes (authenticated)
router.get('/user/shared-playlists', authenticateToken, getUserSharedPlaylists);
router.get('/user/shared-playlist-ids', authenticateToken, getUserSharedPlaylistIds);
router.get('/user/playlists-shared-with-me', authenticateToken, getPlaylistsSharedWithUser);
router.post('/playlists/:playlistId/share', authenticateToken, createShareLink);
router.get('/playlists/:playlistId/share', authenticateToken, getShareLink);
router.delete('/playlists/:playlistId/share', authenticateToken, revokeShareAccess);
router.put('/playlists/:playlistId/share', authenticateToken, updateSharePermissions);

// Public sharing routes (no authentication required)
router.get('/shared/:shareToken', (req, res, next) => {
  console.log('🛣️  Route: /shared/:shareToken hit with token:', req.params.shareToken);
  next();
}, getSharedPlaylist);
router.post('/shared/:shareToken/comments', addCommentToShared);
router.get('/shared/:shareToken/comments', getSharedPlaylistComments);
router.post('/shared/:shareToken/songs/:songId/comments', addCommentToShared); // Song-level comments for shared playlists

export default router;
