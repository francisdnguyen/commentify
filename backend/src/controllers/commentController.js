import Comment from '../models/Comment.js';
import Playlist from '../models/Playlist.js';

// Add a comment to a playlist
export const addComment = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Find or create playlist in our database
    let playlist = await Playlist.findOne({ spotifyId: playlistId });
    if (!playlist) {
      playlist = await Playlist.create({
        spotifyId: playlistId,
        owner: userId,
        isSpotifyPlaylist: true
      });
    }

    // Create the comment
    const comment = await Comment.create({
      content,
      user: userId,
      playlist: playlist._id
    });

    // Populate user info
    await comment.populate('user', 'displayName');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Get all comments for a playlist
export const getComments = async (req, res) => {
  try {
    const { playlistId } = req.params;
    
    // Find playlist
    const playlist = await Playlist.findOne({ spotifyId: playlistId });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Get comments
    const comments = await Comment.find({ playlist: playlist._id })
      .populate('user', 'displayName')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is the comment author
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await comment.remove();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// Edit a comment
export const editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is the comment author
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    comment.content = content;
    comment.edited = true;
    await comment.save();

    await comment.populate('user', 'displayName');
    res.json(comment);
  } catch (error) {
    console.error('Error editing comment:', error);
    res.status(500).json({ error: 'Failed to edit comment' });
  }
};
