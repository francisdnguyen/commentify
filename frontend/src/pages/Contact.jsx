import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

function Contact() {
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

      <main className="flex-grow container mx-auto px-6 py-12 max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-8 text-gray-800 dark:text-gray-100">Contact Me</h1>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-2xl text-gray-700 dark:text-gray-300">
              For general inquiries and support, you can contact me at{' '}
              <a href="mailto:francisnguyen5121@gmail.com" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
                francisnguyen5121@gmail.com
              </a>
              {' '}or{' '}
              <a 
                href="https://www.instagram.com/fran.swaaaa/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
              >
                DM me on Instagram!
              </a>
            </p>
          </div>
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

export default Contact;
