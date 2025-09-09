import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

function About() {
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
          <h1 className="text-5xl font-bold mb-4 text-gray-800 dark:text-gray-100">About Commentify</h1>
        </div>

        <div className="prose prose-lg mx-auto dark:prose-invert">
          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100">What is Commentify?</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Commentify is a revolutionary platform that transforms your Spotify playlists into interactive 
              conversation spaces. Share playlist links with friends and family, and let them join the 
              conversation by commenting on your favorite tracks.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Whether you're curating the perfect road trip playlist, sharing your latest discoveries, 
              or creating collaborative collections with friends, Commentify adds a social layer to your 
              music experience through private, link-based sharing.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-200">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Connect</h3>
                <p className="text-gray-600 dark:text-gray-400">Link your Spotify account to access your playlists</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-200">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Share Links</h3>
                <p className="text-gray-600 dark:text-gray-400">Generate shareable links for your playlists and send them to friends</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-200">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Join & Comment</h3>
                <p className="text-gray-600 dark:text-gray-400">Friends click your link, join the playlist, and start commenting on songs</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Features</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Playlist Comments</h4>
                  <p className="text-gray-600 dark:text-gray-400">Add comments to individual songs or entire playlists</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Link-Based Sharing</h4>
                  <p className="text-gray-600 dark:text-gray-400">Generate unique links for your playlists to share with specific people</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Join System</h4>
                  <p className="text-gray-600 dark:text-gray-400">Friends click your link and join the playlist to start commenting</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Privacy by Design</h4>
                  <p className="text-gray-600 dark:text-gray-400">Only people with your link can access and comment on your playlists</p>
                </div>
              </div>
            </div>
          </section>

          <section className="text-center">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Ready to Get Started?</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-8">
              Start sharing your favorite playlists with friends and family through Commentify's private link system.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-[#1DB954] text-white py-4 px-12 rounded-xl hover:bg-[#1ed760] transition-colors text-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started with Spotify
            </button>
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

export default About;
