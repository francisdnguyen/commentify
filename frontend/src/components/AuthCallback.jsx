import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const expires_in = params.get('expires_in');

    console.log('Auth callback params:', { access_token, refresh_token, expires_in });

    if (access_token && refresh_token) {
      // Store tokens in localStorage
      localStorage.setItem('spotify_access_token', access_token);
      localStorage.setItem('spotify_refresh_token', refresh_token);
      localStorage.setItem('spotify_token_expiry', new Date().getTime() + expires_in * 1000);

      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      // Handle error
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Logging you in...</h2>
        <p>Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}

export default AuthCallback;
