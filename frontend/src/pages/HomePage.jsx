import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  
  const handleLogin = (e) => {
    e.preventDefault();
    const width = 450;
    const height = 730;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    const authWindow = window.open(
      'http://localhost:5000/auth/login',
      'Spotify Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    window.addEventListener('message', (event) => {
      console.log('Received message:', event.data);
      console.log('Origin:', event.origin);
      
      if (event.origin !== 'http://127.0.0.1:5000') {
        console.log('Origin mismatch, expected http://127.0.0.1:5000');
        return;
      }
      
      if (event.data.type === 'spotify-auth-success') {
        console.log('Auth success, storing tokens');
        const { access_token, refresh_token, expires_in } = event.data;
        localStorage.setItem('spotify_access_token', access_token);
        localStorage.setItem('spotify_refresh_token', refresh_token);
        localStorage.setItem('spotify_token_expiry', new Date().getTime() + expires_in * 1000);
        authWindow.close();
        navigate('/dashboard');
      } else {
        console.log('Unexpected message type:', event.data.type);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Commentify</h1>
        <p className="text-xl mb-8">Share your thoughts on your favorite music</p>
        <button
          onClick={handleLogin}
          className="bg-green-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-green-600 transition-colors"
        >
          Login with Spotify
        </button>
      </div>
    </div>
  );
}

export default HomePage;
