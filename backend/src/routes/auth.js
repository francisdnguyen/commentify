import express from "express";
import dotenv from "dotenv";
import querystring from "querystring";
import axios from "axios";

dotenv.config();
const router = express.Router();

// Spotify OAuth scopes
const SCOPES = [
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private"
];

router.get("/login", (req, res) => {
  const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
  const client_id = process.env.SPOTIFY_CLIENT_ID;

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: client_id,
      scope: SCOPES.join(" "),
      redirect_uri: redirect_uri,
      show_dialog: true // Always show the auth dialog for better UX
    })
  );
});

router.post("/refresh", async (req, res) => {
  const { refresh_token } = req.body;
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      }),
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // If we get a new refresh token, send it back
    const newRefreshToken = response.data.refresh_token;

    res.json({
      access_token: response.data.access_token,
      expires_in: response.data.expires_in,
      ...(newRefreshToken && { refresh_token: newRefreshToken }) // Include new refresh token if provided
    });
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    // Send specific error status based on Spotify's response
    const status = error.response?.status || 500;
    res.status(status).json({ 
      error: 'Failed to refresh token',
      details: error.response?.data?.error || error.message
    });
  }
});

router.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  console.log('Received callback with code:', code);
  console.log('Redirect URI:', redirect_uri);

  if (code) {
    try {
      // Exchange code for tokens
      const response = await axios.post("https://accounts.spotify.com/api/token", 
        querystring.stringify({
          code: code,
          redirect_uri: redirect_uri,
          grant_type: "authorization_code"
        }), {
          headers: {
            "Authorization": "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // Get user profile
      const userProfile = await axios.get('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${access_token}` }
      });

      // Store tokens and user info in session
      req.session.spotifyTokens = {
        access_token,
        refresh_token,
        expires_in,
        userProfile: userProfile.data
      };

      // Redirect to frontend with tokens
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-callback?${querystring.stringify({
        access_token,
        refresh_token,
        expires_in
      })}`);
    } catch (error) {
      console.error("Error during token exchange:", error.response?.data || error.message);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=${encodeURIComponent('Failed to authenticate with Spotify')}`);
    }
  } else {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-error`);
  }
});

router.post("/refresh-token", async (req, res) => {
  const { refresh_token } = req.body;
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!refresh_token) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    const response = await axios.post("https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: refresh_token
      }), {
        headers: {
          "Authorization": "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    res.json({
      access_token: response.data.access_token,
      expires_in: response.data.expires_in
    });
  } catch (error) {
    console.error("Error refreshing token:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});


// Testing
router.get("/me", async (req, res) => {
  const access_token = req.query.access_token;

  if (!access_token) {
    return res.status(400).json({ error: "Access token is required" });
  }

  try {
    const { data } = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    res.json(data);
  } catch (error) {
    console.error("Error fetching user profile:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

export default router;