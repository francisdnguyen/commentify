import React from 'react';
import { Link } from 'react-router-dom';
import { generateShareableLink } from '../api';

function PlaylistCard({ playlist }) {
  const handleShare = async () => {
    try {
      const response = await generateShareableLink(playlist.id);
      const shareUrl = `${window.location.origin}${response.data.shareableLink}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error generating share link:', error);
      alert('Failed to generate share link');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <img 
          src={playlist.images[0]?.url || '/placeholder-playlist.png'} 
          alt={playlist.name}
          className="w-24 h-24 object-cover rounded-md"
        />
        <div className="flex-1">
          <Link 
            to={`/playlist/${playlist.id}`}
            className="text-xl font-semibold hover:text-green-600 transition-colors"
          >
            {playlist.name}
          </Link>
          <p className="text-gray-600 mt-1">{playlist.tracks.total} tracks</p>
          <p className="text-gray-500 text-sm mt-2 line-clamp-2">
            {playlist.description || 'No description'}
          </p>
          <div className="flex items-center mt-3 space-x-3">
            <Link
              to={`/playlist/${playlist.id}`}
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
            >
              View Details
            </Link>
            <button
              onClick={handleShare}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              Share
            </button>
            {playlist.hasComments && (
              <span className="text-gray-500 text-sm">
                Has comments
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaylistCard;
