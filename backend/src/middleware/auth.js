import axios from 'axios';
import User from '../models/User.js';

// Middleware to check if user is authenticated
export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token with Spotify
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      // Store both token and user profile for use in controller methods
      req.accessToken = token;
      
      // Find or create user in our database
      let user = await User.findOne({ spotifyId: response.data.id });
      
      if (!user) {
        // Create new user if they don't exist
        user = await User.create({
          spotifyId: response.data.id,
          displayName: response.data.display_name,
          email: response.data.email,
          accessToken: token
        });
      } else {
        // Update existing user's token
        user.accessToken = token;
        await user.save();
      }
      
      req.user = user;
      next();
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Token validation error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        details: error.response.data?.error?.message 
      });
    }
    
    res.status(401).json({ 
      error: 'Token validation failed',
      details: error.message 
    });
  }
};

// Optional authentication middleware - adds user if authenticated, but doesn't require it
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      // No token provided, continue without authentication
      req.user = null;
      req.accessToken = null;
      return next();
    }

    try {
      // Verify token with Spotify
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        // Store both token and user profile for use in controller methods
        req.accessToken = token;
        
        // Find user in our database
        let user = await User.findOne({ spotifyId: response.data.id });
        
        if (!user) {
          // Create new user if they don't exist
          user = await User.create({
            spotifyId: response.data.id,
            displayName: response.data.display_name,
            email: response.data.email,
            accessToken: token
          });
        } else {
          // Update existing user's token
          user.accessToken = token;
          await user.save();
        }
        
        req.user = user;
      } else {
        req.user = null;
        req.accessToken = null;
      }
    } catch (authError) {
      // Token is invalid, but that's okay for optional auth
      req.user = null;
      req.accessToken = null;
    }
    
    next();
  } catch (error) {
    // On any error, just continue without authentication
    console.error('Optional auth error:', error.message);
    req.user = null;
    req.accessToken = null;
    next();
  }
};
