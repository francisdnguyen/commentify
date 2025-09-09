import React from 'react';

function Contact() {
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

      <main className="flex-grow container mx-auto px-6 py-12 max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-8 text-gray-800">Contact Me</h1>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl text-gray-700">
              For general inquiries and support, you can contact me at{' '}
              <a href="mailto:francisnguyen5121@gmail.com" className="text-green-600 hover:text-green-700 font-medium">
                francisnguyen5121@gmail.com
              </a>
              {' '}or{' '}
              <a 
                href="https://www.instagram.com/fran.swaaaa/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                DM me on Instagram!
              </a>
            </p>
          </div>
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

export default Contact;
