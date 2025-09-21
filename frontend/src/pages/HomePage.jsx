import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

function HomePage() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
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
    window.location.href = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/auth/login`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
      <nav className="py-6 px-12 relative z-10">
        <div className="flex justify-between items-center">
          <ThemeToggle />
          <div className="flex space-x-4">
            <button 
              className="text-xl font-medium px-8 py-4 rounded-full transition-all duration-200 hover:bg-green-500 hover:text-white focus:outline-none text-gray-900 dark:text-gray-100"
              onClick={() => navigate('/')}
            >
              Home
            </button>
            <button 
              className="text-xl font-medium px-8 py-4 rounded-full transition-all duration-200 hover:bg-green-500 hover:text-white focus:outline-none text-gray-900 dark:text-gray-100"
              onClick={() => navigate('/about')}
            >
              About
            </button>
            <button 
              className="text-xl font-medium px-8 py-4 rounded-full transition-all duration-200 hover:bg-green-500 hover:text-white focus:outline-none text-gray-900 dark:text-gray-100"
              onClick={() => navigate('/privacy-policy')}
            >
              Privacy Policy
            </button>
            <button 
              className="text-xl font-medium px-8 py-4 rounded-full transition-all duration-200 hover:bg-green-500 hover:text-white focus:outline-none text-gray-900 dark:text-gray-100"
              onClick={() => navigate('/contact')}
            >
              Contact
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center -mt-24">
        <h1 className="text-6xl font-bold mb-4 text-gray-800 dark:text-gray-100">Commentify</h1>
        <h2 className="text-2xl mb-16 text-gray-700 dark:text-gray-300">Turn Playlists Into Conversations</h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          className="bg-[#1DB954] text-white py-6 px-16 rounded-xl hover:bg-[#1ed760] transition-colors text-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Log in with Spotify
        </button>
      </main>

      <footer className="py-4 px-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <span className="text-gray-700 dark:text-gray-300">Made by Francis Nguyen</span>
          <div className="flex items-center space-x-2">
            <a href="/" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300">Home</a>
            <span className="text-gray-500 dark:text-gray-400">|</span>
            <a href="/about" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300">About</a>
            <span className="text-gray-500 dark:text-gray-400">|</span>
            <a href="/privacy-policy" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300">Privacy Policy</a>
            <span className="text-gray-500 dark:text-gray-400">|</span>
            <a href="/contact" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
