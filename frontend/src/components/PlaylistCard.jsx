import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getPlaylistDetails } from '../api';
import ShareModal from './ShareModal';

function PlaylistCard({ playlist }) {
  // Share modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Safety check for playlist data
  if (!playlist) {
    return (
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-600">
        <p className="text-gray-500 dark:text-gray-400 text-center">Playlist data unavailable</p>
      </div>
    );
  }

  // Function to decode HTML entities
  const decodeHtmlEntities = (text) => {
    if (!text) return text;
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const handleShare = async () => {
    try {
      // Ensure playlist exists in our database before sharing
      // This is the same call that playlist details page makes
      console.log('🔍 PlaylistCard: Ensuring playlist exists in database before sharing...');
      await getPlaylistDetails(playlist.id);
      console.log('✅ PlaylistCard: Playlist confirmed in database, opening share modal');
      
      // Now open the share modal
      setIsShareModalOpen(true);
    } catch (error) {
      console.error('❌ PlaylistCard: Error ensuring playlist exists:', error);
      alert('Failed to prepare playlist for sharing. Please try again.');
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 relative">
        {/* New Comments Notification Badge */}
        {playlist.hasNewComments && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
            {playlist.newCommentCount} new comment{playlist.newCommentCount !== 1 ? 's' : ''}
          </div>
        )}
        <div className="flex items-start space-x-4">
          <img 
            src={playlist.images?.[0]?.url || '/placeholder-playlist.png'} 
            alt={playlist.name || 'Untitled Playlist'}
            className="w-24 h-24 object-cover rounded-md"
          />
          <div className="flex-1">
            <Link 
              to={`/playlist/${playlist.id}`}
              className="text-xl font-semibold text-gray-900 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              {playlist.name || 'Untitled Playlist'}
            </Link>
            <p className="text-gray-600 dark:text-gray-100 mt-1">{playlist.tracks?.total || 0} tracks</p>
            <p className="text-gray-500 dark:text-gray-100 text-sm mt-2 line-clamp-2">
              {decodeHtmlEntities(playlist.description)}
            </p>
            <div className="flex items-center mt-3 space-x-3">
              <Link
                to={`/playlist/${playlist.id}`}
                className="px-3 py-1 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-700 text-sm transition-colors duration-200"
              >
                View Details
              </Link>
              <button
                onClick={handleShare}
                className="px-3 py-1 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 text-sm transition-colors duration-200"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        playlistId={playlist.id}
        playlistName={playlist.name}
      />
    </>
  );
}

export default PlaylistCard;
