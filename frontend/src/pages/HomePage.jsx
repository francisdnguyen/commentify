import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Check for error message in URL
    const params = new URLSearchParams(window.location.search);
    const errorMsg = params.get('error');
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
    }
  }, []);

  const handleLogin = () => {
    // Direct redirect to Spotify login
    window.location.href = 'http://localhost:5000/auth/login';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Commentify</h1>
          <p className="text-gray-600 mb-8">
            Create and share playlists with comments on each song.
          </p>

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
          >
            Login with Spotify
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
