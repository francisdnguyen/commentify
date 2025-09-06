import React from 'react';
import { Link } from 'react-router-dom';

function PlaylistCard({ playlist }) {
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
        </div>
      </div>
    </div>
  );
}

export default PlaylistCard;
