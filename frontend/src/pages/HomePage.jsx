import React, { useEffect, useState } from 'react';

function HomePage() {
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
    <div className="min-h-screen flex flex-col bg-white">
      <nav className="py-4 px-6">
        <ul className="flex justify-end space-x-8">
          <li><a href="/" className="hover:underline">Home</a></li>
          <li><a href="/about" className="hover:underline">About</a></li>
          <li><a href="/privacy-policy" className="hover:underline">Privacy Policy</a></li>
          <li><a href="/contact" className="hover:underline">Contact</a></li>
        </ul>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center -mt-16">
        <h1 className="text-6xl font-bold mb-3">Commentify</h1>
        <h2 className="text-2xl mb-12">Turn Playlists Into Conversations</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          className="bg-[#1DB954] text-white py-2 px-8 rounded hover:bg-[#1ed760] transition-colors text-lg"
        >
          Log in with Spotify
        </button>
      </main>

      <footer className="py-4 px-6">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <span>Made by Francis Nguyen</span>
          <div className="flex items-center space-x-2">
            <a href="/" className="hover:underline">Home</a>
            <span>|</span>
            <a href="/about" className="hover:underline">About</a>
            <span>|</span>
            <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
            <span>|</span>
            <a href="/contact" className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
