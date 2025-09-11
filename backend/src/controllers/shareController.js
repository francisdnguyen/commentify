import { v4 as uuidv4 } from 'uuid';
import Playlist from '../models/Playlist.js';
import Share from '../models/Share.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import axios from 'axios';

// Generate a shareable link for a playlist
export const createShareLink = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { allowComments = true, requireAuth = false, expiresIn = null } = req.body;
    
    // Verify playlist exists and user owns it
    const playlist = await Playlist.findOne({ spotifyId: playlistId, owner: req.user._id });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found or access denied' });
    }

    // Check if a share already exists
    let existingShare = await Share.findOne({ 
      playlist: playlist._id, 
      isActive: true 
    });

    if (existingShare) {
      // Update existing share settings
      existingShare.permissions.allowComments = allowComments;
      existingShare.permissions.requireAuth = requireAuth;
      
      // Update expiration
      if (expiresIn) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + expiresIn);
        existingShare.expiresAt = expirationDate;
      } else {
        existingShare.expiresAt = null;
      }
      
      await existingShare.save();
      
      return res.json({
        shareToken: existingShare.shareToken,
        shareUrl: `${req.protocol}://${req.get('host')}/shared/${existingShare.shareToken}`,
        permissions: existingShare.permissions,
        expiresAt: existingShare.expiresAt,
        accessCount: existingShare.accessCount
      });
    }

    // Generate new share token
    const shareToken = uuidv4();
    
    // Calculate expiration date if provided
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresIn);
    }

    // Create new share
    const newShare = new Share({
      playlist: playlist._id,
      shareToken,
      createdBy: req.user._id,
      permissions: {
        allowComments,
        requireAuth
      },
      expiresAt
    });

    await newShare.save();

    // Update playlist with share info
    playlist.shareToken = shareToken;
    playlist.isPublic = true;
    playlist.shareSettings = {
      allowComments,
      requireAuth,
      expiresAt
    };
    await playlist.save();

    res.json({
      shareToken,
      shareUrl: `${req.protocol}://${req.get('host')}/shared/${shareToken}`,
      permissions: {
        allowComments,
        requireAuth
      },
      expiresAt,
      accessCount: 0
    });

  } catch (error) {
    console.error('Error generating share link:', error);
    res.status(500).json({ error: 'Failed to generate share link' });
  }
};

// Get existing share link for a playlist
export const getShareLink = async (req, res) => {
  try {
    const { playlistId } = req.params;
    
    // Verify playlist exists and user owns it
    const playlist = await Playlist.findOne({ spotifyId: playlistId, owner: req.user._id });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found or access denied' });
    }

    // Find active share
    const share = await Share.findOne({ 
      playlist: playlist._id, 
      isActive: true 
    });

    if (!share || !share.isValid()) {
      return res.status(404).json({ error: 'No active share link found' });
    }

    res.json({
      shareToken: share.shareToken,
      shareUrl: `${req.protocol}://${req.get('host')}/shared/${share.shareToken}`,
      permissions: share.permissions,
      expiresAt: share.expiresAt,
      accessCount: share.accessCount,
      lastAccessed: share.lastAccessed
    });

  } catch (error) {
    console.error('Error getting share link:', error);
    res.status(500).json({ error: 'Failed to get share link' });
  }
};

// Revoke share access
export const revokeShareAccess = async (req, res) => {
  try {
    const { playlistId } = req.params;
    
    // Verify playlist exists and user owns it
    const playlist = await Playlist.findOne({ spotifyId: playlistId, owner: req.user._id });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found or access denied' });
    }

    // Deactivate all shares for this playlist
    await Share.updateMany(
      { playlist: playlist._id },
      { isActive: false }
    );

    // Update playlist
    playlist.shareToken = null;
    playlist.isPublic = false;
    await playlist.save();

    res.json({ message: 'Share access revoked successfully' });

  } catch (error) {
    console.error('Error revoking share access:', error);
    res.status(500).json({ error: 'Failed to revoke share access' });
  }
};

// Update share permissions
export const updateSharePermissions = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { allowComments, requireAuth, expiresIn } = req.body;
    
    // Verify playlist exists and user owns it
    const playlist = await Playlist.findOne({ spotifyId: playlistId, owner: req.user._id });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found or access denied' });
    }

    // Find active share
    const share = await Share.findOne({ 
      playlist: playlist._id, 
      isActive: true 
    });

    if (!share) {
      return res.status(404).json({ error: 'No active share found' });
    }

    // Update permissions
    if (allowComments !== undefined) share.permissions.allowComments = allowComments;
    if (requireAuth !== undefined) share.permissions.requireAuth = requireAuth;
    
    // Update expiration
    if (expiresIn !== undefined) {
      if (expiresIn === null) {
        share.expiresAt = null;
      } else {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + expiresIn);
        share.expiresAt = expirationDate;
      }
    }

    await share.save();

    // Update playlist settings too
    playlist.shareSettings = {
      allowComments: share.permissions.allowComments,
      requireAuth: share.permissions.requireAuth,
      expiresAt: share.expiresAt
    };
    await playlist.save();

    res.json({
      shareToken: share.shareToken,
      shareUrl: `${req.protocol}://${req.get('host')}/shared/${share.shareToken}`,
      permissions: share.permissions,
      expiresAt: share.expiresAt,
      accessCount: share.accessCount
    });

  } catch (error) {
    console.error('Error updating share permissions:', error);
    res.status(500).json({ error: 'Failed to update share permissions' });
  }
};

// PUBLIC ENDPOINTS (No authentication required)

// Access shared playlist via token
export const getSharedPlaylist = async (req, res) => {
  try {
    const { shareToken } = req.params;
    
    // Find and validate share
    const share = await Share.findOne({ shareToken, isActive: true })
      .populate('playlist')
      .populate('createdBy', 'displayName');
    
    if (!share || !share.isValid()) {
      return res.status(404).json({ error: 'Shared playlist not found or expired' });
    }

    // Log access
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    share.logAccess(ip, userAgent, req.user?._id);
    await share.save();

    // Get playlist details from Spotify
    // For shared playlists, we need to fetch from Spotify without user authentication
    // We'll use the playlist owner's token for this
    const owner = await User.findById(share.playlist.owner);
    if (!owner || !owner.spotifyAccessToken) {
      return res.status(503).json({ error: 'Unable to access playlist data' });
    }

    try {
      // Fetch playlist from Spotify using owner's token
      const playlistResponse = await axios.get(
        `https://api.spotify.com/v1/playlists/${share.playlist.spotifyId}`,
        {
          headers: { Authorization: `Bearer ${owner.spotifyAccessToken}` }
        }
      );

      // Fetch all tracks with pagination
      let allTracks = [];
      let nextUrl = `https://api.spotify.com/v1/playlists/${share.playlist.spotifyId}/tracks?limit=50`;
      
      while (nextUrl) {
        const tracksResponse = await axios.get(nextUrl, {
          headers: { Authorization: `Bearer ${owner.spotifyAccessToken}` }
        });
        
        allTracks = allTracks.concat(tracksResponse.data.items);
        nextUrl = tracksResponse.data.next;
      }

      // Get comments for the playlist
      const comments = await Comment.find({ playlist: share.playlist._id })
        .populate('user', 'displayName')
        .sort('-createdAt')
        .lean();

      // Return combined data
      res.json({
        playlist: {
          ...playlistResponse.data,
          tracks: {
            ...playlistResponse.data.tracks,
            items: allTracks,
            total: allTracks.length
          },
          comments: comments || [],
          _id: share.playlist._id,
          isShared: true,
          shareInfo: {
            permissions: share.permissions,
            sharedBy: share.createdBy.displayName,
            accessCount: share.accessCount
          }
        }
      });

    } catch (spotifyError) {
      console.error('Error fetching from Spotify:', spotifyError);
      return res.status(503).json({ error: 'Unable to fetch playlist from Spotify' });
    }

  } catch (error) {
    console.error('Error accessing shared playlist:', error);
    res.status(500).json({ error: 'Failed to access shared playlist' });
  }
};

// Add comment to shared playlist
export const addCommentToShared = async (req, res) => {
  try {
    const { shareToken } = req.params;
    const { content, authorName = 'Anonymous' } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Find and validate share
    const share = await Share.findOne({ shareToken, isActive: true })
      .populate('playlist');
    
    if (!share || !share.isValid()) {
      return res.status(404).json({ error: 'Shared playlist not found or expired' });
    }

    // Check if comments are allowed
    if (!share.permissions.allowComments) {
      return res.status(403).json({ error: 'Comments not allowed for this shared playlist' });
    }

    // Create comment
    const comment = new Comment({
      content: content.trim(),
      playlist: share.playlist._id,
      user: req.user?._id || null, // null for anonymous users
      isAnonymous: !req.user,
      anonymousName: req.user ? null : authorName
    });

    await comment.save();

    // Populate user info for response
    await comment.populate('user', 'displayName');

    res.json({
      _id: comment._id,
      content: comment.content,
      user: comment.user || { displayName: comment.anonymousName },
      createdAt: comment.createdAt,
      isAnonymous: comment.isAnonymous
    });

  } catch (error) {
    console.error('Error adding comment to shared playlist:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Get comments for shared playlist
export const getSharedPlaylistComments = async (req, res) => {
  try {
    const { shareToken } = req.params;
    
    // Find and validate share
    const share = await Share.findOne({ shareToken, isActive: true })
      .populate('playlist');
    
    if (!share || !share.isValid()) {
      return res.status(404).json({ error: 'Shared playlist not found or expired' });
    }

    // Get comments
    const comments = await Comment.find({ playlist: share.playlist._id })
      .populate('user', 'displayName')
      .sort('-createdAt')
      .lean();

    // Format comments for response
    const formattedComments = comments.map(comment => ({
      _id: comment._id,
      content: comment.content,
      user: comment.user || { displayName: comment.anonymousName || 'Anonymous' },
      createdAt: comment.createdAt,
      isAnonymous: comment.isAnonymous || false
    }));

    res.json(formattedComments);

  } catch (error) {
    console.error('Error getting shared playlist comments:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
};