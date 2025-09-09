import React from 'react';

function PrivacyPolicy() {
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
          <h1 className="text-5xl font-bold mb-4 text-gray-800">Privacy Policy</h1>
        </div>

        <div className="prose prose-lg mx-auto space-y-8">
          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gray-800">Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you use Commentify, we collect information to provide and improve our services. This includes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Spotify account information (username, email, profile picture)</li>
              <li>Your public playlists from Spotify</li>
              <li>Comments and interactions you make on playlists</li>
              <li>Usage data to improve our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gray-800">How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Enable playlist sharing and commenting features</li>
              <li>Connect you with friends through shared playlist links</li>
              <li>Improve and personalize your experience</li>
              <li>Ensure the security and integrity of our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gray-800">Revoking Access</h2>
            <p className="text-gray-700 leading-relaxed">
              Although you can rest assured that your data is not being stored or used maliciously, if you would like to revoke Commentify's permissions, you can visit your{' '}
              <a 
                href="https://www.spotify.com/us/account/apps/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                apps page
              </a>
              {' '}and click "REMOVE ACCESS" on Commentify.{' '}
              <a 
                href="https://support.spotify.com/us/article/spotify-on-other-apps/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Here
              </a>
              {' '}is a more detailed guide for doing so.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4 text-gray-800">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:francisnguyen5121@gmail.com" className="text-green-600 hover:text-green-700 font-medium">
                francisnguyen5121@gmail.com
              </a>
            </p>
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

export default PrivacyPolicy;