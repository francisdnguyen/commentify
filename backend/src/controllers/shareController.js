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
    console.log('🎯 Backend: Creating share link for playlist:', playlistId, 'by user:', req.user?._id);
    
    // Determine if playlistId is a MongoDB ObjectId or Spotify ID
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(playlistId);
    console.log('🔍 Backend: Is MongoDB ObjectId?', isMongoId, 'for playlistId:', playlistId);
    
    let query;
    if (isMongoId) {
      query = { _id: playlistId, owner: req.user._id };
    } else {
      query = { spotifyId: playlistId, owner: req.user._id };
    }
    
    // Verify playlist exists and user owns it
    const playlist = await Playlist.findOne(query);
    if (!playlist) {
      console.log('❌ Backend: Playlist not found. Checking user playlists...');
      const userPlaylists = await Playlist.find({ owner: req.user._id });
      console.log('🔍 Backend: User has these playlists:', userPlaylists.map(p => ({ id: p._id, spotifyId: p.spotifyId, name: p.name })));
      return res.status(404).json({ error: 'Playlist not found or access denied' });
    }
    
    console.log('✅ Backend: Found playlist:', playlist.name);

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
        shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${existingShare.shareToken}`,
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
      shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${shareToken}`,
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
    
    // Determine if playlistId is a MongoDB ObjectId or Spotify ID
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(playlistId);
    let query;
    if (isMongoId) {
      query = { _id: playlistId, owner: req.user._id };
    } else {
      query = { spotifyId: playlistId, owner: req.user._id };
    }
    
    // Verify playlist exists and user owns it
    const playlist = await Playlist.findOne(query);
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
    console.log('👤 Backend: Owner found:', !!owner);
    console.log('🔍 Backend: Owner spotify fields:', owner ? Object.keys(owner.toObject()).filter(k => k.includes('spotify') || k.includes('access') || k.includes('token')) : 'no owner');
    console.log('🔍 Backend: Playlist spotify fields:', share.playlist ? Object.keys(share.playlist.toObject()).filter(k => k.includes('spotify') || k.includes('Id')) : 'no playlist');
    
    if (!owner) {
      return res.status(503).json({ error: 'Unable to access playlist data - owner not found' });
    }
    
    // Check different possible token field names
    const accessToken = owner.spotifyAccessToken || owner.spotify?.accessToken || owner.accessToken;
    if (!accessToken) {
      console.log('❌ Backend: No access token found in any field');
      return res.status(503).json({ error: 'Unable to access playlist data - no token' });
    }
    
    // Check different possible spotify ID field names  
    const spotifyId = share.playlist.spotifyId || share.playlist.spotifyPlaylistId;
    if (!spotifyId) {
      console.log('❌ Backend: No Spotify ID found in any field');
      return res.status(503).json({ error: 'Unable to access playlist data - no spotify ID' });
    }
    
    console.log('✅ Backend: Using Spotify ID:', spotifyId);

    try {
      // Fetch playlist from Spotify using owner's token
      const playlistResponse = await axios.get(
        `https://api.spotify.com/v1/playlists/${spotifyId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      // Fetch all tracks with pagination
      let allTracks = [];
      let nextUrl = `https://api.spotify.com/v1/playlists/${spotifyId}/tracks?limit=50`;
      
      while (nextUrl) {
        const tracksResponse = await axios.get(nextUrl, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        allTracks = allTracks.concat(tracksResponse.data.items);
        nextUrl = tracksResponse.data.next;
      }

      // Get all comments for the playlist (both playlist-level and song-level)
      const allComments = await Comment.find({ playlist: share.playlist._id })
        .populate('user', 'displayName')
        .sort('-createdAt')
        .lean();

      // Separate playlist comments and song comments
      const playlistComments = allComments.filter(comment => !comment.trackId);
      const songComments = allComments.filter(comment => comment.trackId);

      // Organize song comments by trackId
      const songCommentsByTrack = {};
      songComments.forEach(comment => {
        if (!songCommentsByTrack[comment.trackId]) {
          songCommentsByTrack[comment.trackId] = [];
        }
        songCommentsByTrack[comment.trackId].push({
          id: comment._id,
          text: comment.content,
          author: comment.user?.displayName || comment.anonymousName || 'Anonymous',
          timestamp: comment.createdAt,
          songId: comment.trackId
        });
      });

      console.log('✅ Backend: Found comments:', {
        playlistComments: playlistComments.length,
        songComments: songComments.length,
        songCommentsByTrack: Object.keys(songCommentsByTrack).length
      });

      // Return combined data
      res.json({
        playlist: {
          ...playlistResponse.data,
          tracks: {
            ...playlistResponse.data.tracks,
            items: allTracks,
            total: allTracks.length
          },
          comments: playlistComments || [],
          _id: share.playlist._id,
          isShared: true,
          shareInfo: {
            permissions: share.permissions,
            sharedBy: share.createdBy.displayName,
            accessCount: share.accessCount
          }
        },
        songComments: songCommentsByTrack, // Add song comments organized by trackId
        spotifyTracks: allTracks || [],
        comments: playlistComments || [],
        share: {
          shareToken: share.shareToken,
          permissions: share.permissions,
          createdAt: share.createdAt,
          accessCount: share.accessCount + 1,
          expiresAt: share.expiresAt
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
    const { shareToken, songId } = req.params; // songId is optional for playlist-level comments
    const { content, authorName = 'Anonymous' } = req.body;
    
    console.log('🎵 Backend: Adding comment to shared playlist:', { shareToken, songId, content, authorName });
    
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

    // Create comment (song-level if songId provided, playlist-level otherwise)
    const comment = new Comment({
      content: content.trim(),
      playlist: share.playlist._id,
      trackId: songId || null, // Set trackId for song comments, null for playlist comments
      user: req.user?._id || null, // null for anonymous users
      isAnonymous: !req.user,
      anonymousName: req.user ? null : authorName
    });

    await comment.save();

    // Populate user info for response
    await comment.populate('user', 'displayName');

    const response = {
      _id: comment._id,
      content: comment.content,
      user: comment.user || { displayName: comment.anonymousName },
      createdAt: comment.createdAt,
      isAnonymous: comment.isAnonymous,
      trackId: comment.trackId
    };

    console.log('✅ Backend: Comment added successfully:', response);
    res.json(response);

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

// Get user's shared playlists (playlists they shared with others)
// Get the Spotify IDs of playlists shared by the current user
export const getUserSharedPlaylistIds = async (req, res) => {
  try {
    console.log('🔍 Backend: Getting shared playlist IDs for user:', req.user._id);
    
    // Find all active shares created by this user and get just the spotify IDs
    const shares = await Share.find({ 
      createdBy: req.user._id, 
      isActive: true 
    }).populate({
      path: 'playlist',
      select: 'spotifyId' // Only select the spotifyId field
    });

    // Extract just the Spotify IDs
    const sharedPlaylistIds = shares.map(share => share.playlist.spotifyId);

    console.log('✅ Backend: Found', sharedPlaylistIds.length, 'shared playlist IDs:', sharedPlaylistIds);
    res.json({ sharedPlaylistIds });

  } catch (error) {
    console.error('Error getting user shared playlist IDs:', error);
    res.status(500).json({ error: 'Failed to get shared playlist IDs' });
  }
};

export const getUserSharedPlaylists = async (req, res) => {
  try {
    console.log('🔍 Backend: Getting shared playlists for user:', req.user._id);
    
    // Find all active shares created by this user
    const shares = await Share.find({ 
      createdBy: req.user._id, 
      isActive: true 
    }).populate({
      path: 'playlist',
      populate: {
        path: 'owner',
        select: 'displayName spotifyId'
      }
    });

    // Fetch Spotify data for each shared playlist
    const sharedPlaylistsPromises = shares.map(async (share) => {
      try {
        const spotifyId = share.playlist.spotifyId;
        
        // Fetch playlist details from Spotify
        const playlistResponse = await axios.get(`https://api.spotify.com/v1/playlists/${spotifyId}`, {
          headers: {
            'Authorization': `Bearer ${req.user.spotifyAccessToken}`
          }
        });

        // Return the Spotify playlist data with our share info
        return {
          ...playlistResponse.data,
          shareInfo: {
            shareToken: share.shareToken,
            shareUrl: `/shared/${share.shareToken}`,
            createdAt: share.createdAt,
            expiresAt: share.expiresAt,
            accessCount: share.accessCount,
            lastAccessed: share.lastAccessed,
            permissions: share.permissions
          }
        };
      } catch (spotifyError) {
        console.error('Error fetching Spotify data for playlist:', share.playlist.spotifyId, spotifyError.message);
        
        // Fallback to database data if Spotify fetch fails
        return {
          ...share.playlist.toObject(),
          images: [], // Empty array for missing images
          tracks: { total: 0 }, // Default tracks object
          shareInfo: {
            shareToken: share.shareToken,
            shareUrl: `/shared/${share.shareToken}`,
            createdAt: share.createdAt,
            expiresAt: share.expiresAt,
            accessCount: share.accessCount,
            lastAccessed: share.lastAccessed,
            permissions: share.permissions
          }
        };
      }
    });

    const sharedPlaylists = await Promise.all(sharedPlaylistsPromises);

    console.log('✅ Backend: Found', sharedPlaylists.length, 'shared playlists');
    res.json(sharedPlaylists);

  } catch (error) {
    console.error('Error getting user shared playlists:', error);
    res.status(500).json({ error: 'Failed to get shared playlists' });
  }
};

// Get playlists shared WITH the current user (playlists others shared with them)
export const getPlaylistsSharedWithUser = async (req, res) => {
  try {
    console.log('🔍 Backend: Getting playlists shared with user:', req.user._id);
    
    // Find all active shares where:
    // 1. The playlist owner is NOT the current user (they didn't create it)
    // 2. The share allows access (public shares or specific user access)
    const shares = await Share.find({ 
      createdBy: { $ne: req.user._id }, // Not created by current user
      isActive: true 
    }).populate({
      path: 'playlist',
      populate: {
        path: 'owner',
        select: 'displayName spotifyId'
      }
    });

    // Filter shares that the current user can access
    const accessibleShares = shares.filter(share => {
      // If requireAuth is false, anyone can access
      if (!share.permissions.requireAuth) {
        return true;
      }
      
      // If requireAuth is true, check if user has specific access
      // For now, we'll return all non-auth-required shares
      // Later, you could add a collaborators field to shares for specific user access
      return false;
    });

    // Fetch Spotify data for each accessible shared playlist
    const sharedPlaylistsPromises = accessibleShares.map(async (share) => {
      try {
        const spotifyId = share.playlist.spotifyId;
        
        // Use the playlist owner's token to fetch from Spotify
        const ownerUser = await User.findById(share.playlist.owner._id);
        if (!ownerUser || !ownerUser.spotifyAccessToken) {
          console.warn('Owner token not available for playlist:', spotifyId);
          return null;
        }
        
        // Fetch playlist details from Spotify
        const playlistResponse = await axios.get(`https://api.spotify.com/v1/playlists/${spotifyId}`, {
          headers: {
            'Authorization': `Bearer ${ownerUser.spotifyAccessToken}`
          }
        });

        // Return the Spotify playlist data with share info
        return {
          ...playlistResponse.data,
          shareInfo: {
            shareToken: share.shareToken,
            shareUrl: `/shared/${share.shareToken}`,
            createdAt: share.createdAt,
            expiresAt: share.expiresAt,
            accessCount: share.accessCount,
            lastAccessed: share.lastAccessed,
            permissions: share.permissions,
            sharedBy: share.playlist.owner.displayName
          }
        };
      } catch (spotifyError) {
        console.error('Error fetching Spotify data for shared playlist:', share.playlist.spotifyId, spotifyError.message);
        
        // Fallback to database data if Spotify fetch fails
        return {
          ...share.playlist.toObject(),
          images: [], // Empty array for missing images
          tracks: { total: 0 }, // Default tracks object
          shareInfo: {
            shareToken: share.shareToken,
            shareUrl: `/shared/${share.shareToken}`,
            createdAt: share.createdAt,
            expiresAt: share.expiresAt,
            accessCount: share.accessCount,
            lastAccessed: share.lastAccessed,
            permissions: share.permissions,
            sharedBy: share.playlist.owner.displayName
          }
        };
      }
    });

    const sharedWithMePlaylists = (await Promise.all(sharedPlaylistsPromises)).filter(playlist => playlist !== null);

    console.log('✅ Backend: Found', sharedWithMePlaylists.length, 'playlists shared with user');
    res.json(sharedWithMePlaylists);

  } catch (error) {
    console.error('Error getting playlists shared with user:', error);
    res.status(500).json({ error: 'Failed to get playlists shared with user' });
  }
};