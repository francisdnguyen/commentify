import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const expires_in = params.get('expires_in');

        if (!access_token || !refresh_token) {
          throw new Error('Missing authentication tokens');
        }

        // Store tokens in localStorage with proper expiry time
        const expiryTime = new Date().getTime() + (Number(expires_in) - 300) * 1000; // Subtract 5 minutes for safety
        
        // Set all tokens atomically
        await Promise.all([
          localStorage.setItem('spotify_access_token', access_token),
          localStorage.setItem('spotify_refresh_token', refresh_token),
          localStorage.setItem('spotify_token_expiry', expiryTime.toString())
        ]);

        // Verify the tokens were stored before navigating
        const storedAccessToken = localStorage.getItem('spotify_access_token');
        const storedRefreshToken = localStorage.getItem('spotify_refresh_token');
        const storedExpiry = localStorage.getItem('spotify_token_expiry');

        if (!storedAccessToken || !storedRefreshToken || !storedExpiry) {
          throw new Error('Failed to store authentication tokens');
        }

        // Small delay to ensure state is settled
        await new Promise(resolve => setTimeout(resolve, 500));

        // Navigate to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Failed to complete authentication. Please try again.');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        {error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Completing authentication...</p>
            <h2 className="text-xl font-semibold mt-4 mb-2">Logging you in...</h2>
            <p>Please wait while we complete the authentication process.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;
