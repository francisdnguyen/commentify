import React, { useState } from 'react';
import { createPlaylist } from '../api';

const CreatePlaylistModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await createPlaylist(name);
      onSuccess(response.data);
      onClose();
      setName('');
    } catch (err) {
      setError('Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Create New Playlist</h2>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Playlist name"
            className="w-full p-2 border rounded-lg mb-4"
            disabled={loading}
          />
          
          {error && (
            <p className="text-red-500 mb-4">{error}</p>
          )}
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;
