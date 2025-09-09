import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
      <nav className="py-6 px-12 relative z-10">
        <div className="flex justify-between items-center">
          <ThemeToggle />
          <div className="flex space-x-6">
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

      <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-800 dark:text-gray-100">Privacy Policy</h1>
        </div>

        <div className="prose prose-lg mx-auto dark:prose-invert space-y-8">
          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Information We Collect</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              When you use Commentify, we collect information to provide and improve our services. This includes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Spotify account information (username, email, profile picture)</li>
              <li>Your public playlists from Spotify</li>
              <li>Comments and interactions you make on playlists</li>
              <li>Usage data to improve our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-gray-100">How We Use Your Information</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Enable playlist sharing and commenting features</li>
              <li>Connect you with friends through shared playlist links</li>
              <li>Improve and personalize your experience</li>
              <li>Ensure the security and integrity of our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Revoking Access</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Although you can rest assured that your data is not being stored or used maliciously, if you would like to revoke Commentify's permissions, you can visit your{' '}
              <a 
                href="https://www.spotify.com/us/account/apps/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
              >
                apps page
              </a>
              {' '}and click "REMOVE ACCESS" on Commentify.{' '}
              <a 
                href="https://support.spotify.com/us/article/spotify-on-other-apps/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
              >
                Here
              </a>
              {' '}is a more detailed guide for doing so.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:francisnguyen5121@gmail.com" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
                francisnguyen5121@gmail.com
              </a>
            </p>
          </section>
        </div>
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

export default PrivacyPolicy;