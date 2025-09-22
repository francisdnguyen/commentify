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
    await comment.populate('user', 'displayName spotifyId');

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

    // Get playlist comments (those without trackId)
    const comments = await Comment.find({ 
      playlist: playlist._id,
      trackId: { $in: [null, undefined] }
    })
      .populate('user', 'displayName spotifyId')
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

// Add a comment to a specific song in a playlist
export const addSongComment = async (req, res) => {
  try {
    const { playlistId, trackId } = req.params;
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
      console.log('Created new playlist record for:', playlistId);
    }

    // Create the song comment
    const comment = await Comment.create({
      content,
      user: userId,
      playlist: playlist._id,
      trackId: trackId
    });

    console.log('Created song comment:', { 
      playlistId, 
      trackId, 
      content: content.substring(0, 50) + '...',
      playlistObjectId: playlist._id 
    });

    // Populate user info
    await comment.populate('user', 'displayName spotifyId');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding song comment:', error);
    res.status(500).json({ error: 'Failed to add song comment' });
  }
};

// Get all comments for a specific song in a playlist
export const getSongComments = async (req, res) => {
  try {
    const { playlistId, trackId } = req.params;
    
    // Find playlist
    const playlist = await Playlist.findOne({ spotifyId: playlistId });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Get song comments
    const comments = await Comment.find({ 
      playlist: playlist._id,
      trackId: trackId 
    })
      .populate('user', 'displayName spotifyId')
      .sort('-createdAt');

    res.json(comments);
  } catch (error) {
    console.error('Error fetching song comments:', error);
    res.status(500).json({ error: 'Failed to fetch song comments' });
  }
};

// Get all song comments for a playlist (grouped by trackId)
export const getAllSongCommentsForPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    
    // Find playlist
    const playlist = await Playlist.findOne({ spotifyId: playlistId });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Get all song comments for this playlist
    const comments = await Comment.find({ 
      playlist: playlist._id,
      trackId: { $exists: true, $ne: null }
    })
      .populate('user', 'displayName spotifyId')
      .sort('-createdAt');

    // Group comments by trackId
    const groupedComments = comments.reduce((acc, comment) => {
      if (!acc[comment.trackId]) {
        acc[comment.trackId] = [];
      }
      acc[comment.trackId].push(comment);
      return acc;
    }, {});

    res.json(groupedComments);
  } catch (error) {
    console.error('Error fetching song comments:', error);
    res.status(500).json({ error: 'Failed to fetch song comments' });
  }
};
