import axios from 'axios';
import Playlist from '../models/Playlist.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

export const getUserPlaylists = async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      return res.status(401).json({ error: 'No access token provided' });
    }
    
    // Get current user to check last viewed timestamps
    const currentUser = await User.findById(req.user._id);
    
    // Fetch playlists from Spotify API
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    // Get playlists that have comments from our database
    const playlistIds = response.data.items.map(item => item.id);
    const playlistsInDB = await Playlist.find({ 
      spotifyId: { $in: playlistIds } 
    }).select('spotifyId _id');
    
    // Get comments with timestamps for each playlist
    const playlistsWithComments = await Playlist.aggregate([
      {
        $match: {
          spotifyId: { $in: playlistIds }
        }
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'playlist',
          as: 'comments'
        }
      },
      {
        $project: {
          spotifyId: 1,
          comments: {
            $map: {
              input: '$comments',
              as: 'comment',
              in: {
                createdAt: '$$comment.createdAt',
                user: '$$comment.user'
              }
            }
          }
        }
      }
    ]);
    
    // Add new comment count to playlists
    const playlists = response.data.items.map(playlist => {
      const playlistWithComments = playlistsWithComments.find(p => p.spotifyId === playlist.id);
      let newCommentCount = 0;
      
      if (playlistWithComments && playlistWithComments.comments.length > 0) {
        const lastViewed = currentUser?.playlistLastViewed?.get(playlist.id);
        
        if (lastViewed) {
          // Count comments created after last viewed time
          newCommentCount = playlistWithComments.comments.filter(comment => 
            new Date(comment.createdAt) > new Date(lastViewed)
          ).length;
        } else {
          // If never viewed, all comments are new
          newCommentCount = playlistWithComments.comments.length;
        }
      }
      
      return {
        ...playlist,
        hasNewComments: newCommentCount > 0,
        newCommentCount: newCommentCount
      };
    });
    
    res.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
};

export const getPlaylistDetails = async (req, res) => {
  try {
    const { playlistId } = req.params;
    console.log('Fetching playlist details for ID:', playlistId);
    
    // Use the token that was verified in the middleware
    const accessToken = req.accessToken;
    if (!accessToken) {
      return res.status(401).json({ error: 'No access token provided' });
    }

    if (!playlistId) {
      return res.status(400).json({ error: 'Playlist ID is required' });
    }

    // Log the request we're about to make
    console.log('Making Spotify API request for playlist:', playlistId);
    console.log('Using access token:', accessToken.substring(0, 10) + '...');
    
    // Fetch playlist details first
    let playlistResponse, allTracks = [];
    
    try {
      playlistResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      // Fetch all tracks with pagination
      let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`;
      
      while (nextUrl) {
        const tracksResponse = await axios.get(nextUrl, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        allTracks = allTracks.concat(tracksResponse.data.items);
        nextUrl = tracksResponse.data.next; // Spotify provides the next URL or null if no more pages
        
        console.log(`Fetched ${tracksResponse.data.items.length} tracks, total so far: ${allTracks.length}`);
      }
      
      console.log(`Successfully fetched all ${allTracks.length} tracks from playlist`);
    } catch (error) {
      console.error('Error from Spotify API:', error.response?.status, error.response?.data);
      if (error.response?.status === 404) {
        return res.status(404).json({ 
          error: 'Playlist not found on Spotify',
          details: error.response?.data?.error?.message || 'No additional details'
        });
      }
      throw error; // Let the outer catch block handle other errors
    }

    // Find or create playlist in our database
    let playlist = await Playlist.findOne({ spotifyId: playlistId });
    if (!playlist) {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      playlist = new Playlist({
        spotifyId: playlistId,
        name: playlistResponse.data.name,
        owner: req.user._id, // Use the authenticated user's ID
        isSpotifyPlaylist: true
      });
      await playlist.save();
    }

    // Get comments if any exist
    const comments = await Comment.find({ playlist: playlist._id })
      .populate('user', 'displayName')
      .sort('-createdAt')
      .lean();

    // Combine all data
    const responseData = {
      ...playlistResponse.data,
      tracks: {
        ...playlistResponse.data.tracks,
        items: allTracks,
        total: allTracks.length // Update total to reflect actual number of tracks fetched
      },
      comments: comments || [],
      _id: playlist._id
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error in getPlaylistDetails:', error);
    
    // Check if it's an Axios error with a response
    if (error.response) {
      console.error('Response error data:', error.response.data);
      
      if (error.response.status === 404) {
        return res.status(404).json({ 
          error: 'Playlist not found on Spotify',
          details: error.response.data?.error?.message
        });
      }
      
      if (error.response.status === 401) {
        return res.status(401).json({ 
          error: 'Unauthorized access to playlist',
          details: 'Your session might have expired. Please try logging in again.'
        });
      }
    }

    // For any other error
    res.status(500).json({ 
      error: 'Failed to fetch playlist details',
      message: error.message,
      details: error.response?.data?.error?.message || 'Unknown error'
    });
  }
};

export const generateShareableLink = async (req, res) => {
        try {
          const { playlistId } = req.params;
          // Check if playlist exists in our database
          const playlist = await Playlist.findOne({ spotifyId: playlistId });
          if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
          }
          // Generate a unique sharing URL
          const shareableLink = `/playlist/${playlistId}/share`;
          res.json({ shareableLink });
        } catch (error) {
          console.error('Error generating shareable link:', error);
          res.status(500).json({ error: 'Failed to generate shareable link' });
        }
      };

      export const createPlaylist = async (req, res) => {
        try {
          const { name, description = '' } = req.body;
          const accessToken = req.headers.authorization?.split(' ')[1];
          if (!accessToken) {
            return res.status(401).json({ error: 'No access token provided' });
          }
          // Get user's Spotify ID first
          const userResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          const userId = userResponse.data.id;
          // Create playlist in Spotify
          const playlistResponse = await axios.post(
            `https://api.spotify.com/v1/users/${userId}/playlists`,
            {
              name,
              description,
              public: true
            },
            {
              headers: { Authorization: `Bearer ${accessToken}` }
            }
          );
          // Create playlist in our database
          const playlist = await Playlist.create({
            spotifyId: playlistResponse.data.id,
            name: playlistResponse.data.name,
            isSpotifyPlaylist: true
          });
          res.status(201).json({
            ...playlistResponse.data,
            _id: playlist._id
          });
        } catch (error) {
          console.error('Error creating playlist:', error);
          res.status(500).json({ 
            error: 'Failed to create playlist',
            message: error.response?.data?.error?.message || error.message
          });
        }
      };

export const getUserProfile = async (req, res) => {
  try {
    const accessToken = req.accessToken;
    if (!accessToken) {
      return res.status(401).json({ error: 'No access token provided' });
    }

    // Fetch user profile from Spotify API
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    if (error.response?.status === 401) {
      res.status(401).json({ error: 'Invalid or expired token' });
    } else {
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }
};

export const markPlaylistAsViewed = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user._id;

    // Update the user's playlistLastViewed map with current timestamp
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          [`playlistLastViewed.${playlistId}`]: new Date()
        }
      },
      { new: true }
    );

    res.json({ success: true, message: 'Playlist marked as viewed' });
  } catch (error) {
    console.error('Error marking playlist as viewed:', error);
    res.status(500).json({ error: 'Failed to mark playlist as viewed' });
  }
};
