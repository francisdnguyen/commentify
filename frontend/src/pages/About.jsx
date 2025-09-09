import React from 'react';

function About() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav className="py-6 px-12 relative z-10">
        <div className="flex justify-end space-x-6">
          <button 
            className="text-xl font-medium px-8 py-4 rounded-full transition-all duration-200 hover:bg-green-500 hover:text-white focus:outline-none"
            onClick={() => window.location.href = '/'}
          >
            Home
          </button>
          <button 
            className="text-xl font-medium px-8 py-4 rounded-full transition-all duration-200 hover:bg-green-500 hover:text-white focus:outline-none"
            onClick={() => window.location.href = '/about'}
          >
            About
          </button>
          <button 
            className="text-xl font-medium px-8 py-4 rounded-full transition-all duration-200 hover:bg-green-500 hover:text-white focus:outline-none"
            onClick={() => window.location.href = '/privacy-policy'}
          >
            Privacy Policy
          </button>
          <button 
            className="text-xl font-medium px-8 py-4 rounded-full transition-all duration-200 hover:bg-green-500 hover:text-white focus:outline-none"
            onClick={() => window.location.href = '/contact'}
          >
            Contact
          </button>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-800">About Commentify</h1>
        </div>

        <div className="prose prose-lg mx-auto">
          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800">What is Commentify?</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Commentify is a revolutionary platform that transforms your Spotify playlists into interactive 
              conversation spaces. Share playlist links with friends and family, and let them join the 
              conversation by commenting on your favorite tracks.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Whether you're curating the perfect road trip playlist, sharing your latest discoveries, 
              or creating collaborative collections with friends, Commentify adds a social layer to your 
              music experience through private, link-based sharing.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Connect</h3>
                <p className="text-gray-600">Link your Spotify account to access your playlists</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Share Links</h3>
                <p className="text-gray-600">Generate shareable links for your playlists and send them to friends</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Join & Comment</h3>
                <p className="text-gray-600">Friends click your link, join the playlist, and start commenting on songs</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800">Features</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-lg">Playlist Comments</h4>
                  <p className="text-gray-600">Add comments to individual songs or entire playlists</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-lg">Link-Based Sharing</h4>
                  <p className="text-gray-600">Generate unique links for your playlists to share with specific people</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-lg">Join System</h4>
                  <p className="text-gray-600">Friends click your link and join the playlist to start commenting</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-lg">Privacy by Design</h4>
                  <p className="text-gray-600">Only people with your link can access and comment on your playlists</p>
                </div>
              </div>
            </div>
          </section>

          <section className="text-center">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800">Ready to Get Started?</h2>
            <p className="text-gray-700 mb-8">
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

      <footer className="py-4 px-6">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <span>Made by Francis Nguyen</span>
          <div className="flex items-center space-x-2">
            <a href="/" className="text-blue-600 underline hover:text-blue-800">Home</a>
            <span>|</span>
            <a href="/about" className="text-blue-600 underline hover:text-blue-800">About</a>
            <span>|</span>
            <a href="/privacy-policy" className="text-blue-600 underline hover:text-blue-800">Privacy Policy</a>
            <span>|</span>
            <a href="/contact" className="text-blue-600 underline hover:text-blue-800">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default About;
