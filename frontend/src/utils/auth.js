import axios from 'axios';

export const getValidToken = async () => {
  const accessToken = localStorage.getItem('spotify_access_token');
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  const tokenExpiry = localStorage.getItem('spotify_token_expiry');

  if (!accessToken || !refreshToken) {
    throw new Error('No authentication tokens found');
  }

  // Check if token is expired or will expire in the next 5 minutes
  if (!tokenExpiry || Date.now() >= Number(tokenExpiry)) {
    try {
      // Request new token using refresh token
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/auth/refresh`, {
        refresh_token: refreshToken
      });

      const { access_token, expires_in } = response.data;
      
      // Update localStorage with new token and expiry time
      const expiryTime = new Date().getTime() + (expires_in - 300) * 1000; // Subtract 5 minutes for safety
      localStorage.setItem('spotify_access_token', access_token);
      localStorage.setItem('spotify_token_expiry', expiryTime.toString());

      return access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Only clear auth-related storage if the refresh token is invalid
      if (error.response?.status === 401) {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_token_expiry');
        window.location.href = '/'; // Force a full page reload to restart auth flow
      }
      throw new Error('Failed to refresh token');
    }
  }

  return accessToken;
};

export const isAuthenticated = () => {
  const accessToken = localStorage.getItem('spotify_access_token');
  const tokenExpiry = localStorage.getItem('spotify_token_expiry');
  
  return accessToken && Date.now() < Number(tokenExpiry);
};
