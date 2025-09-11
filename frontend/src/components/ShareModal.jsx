import React, { useState, useEffect, useCallback } from 'react';
import { createShareLink, getShareLink, updateSharePermissions, revokeShareAccess } from '../api';

const ShareModal = ({ isOpen, onClose, playlistId, playlistName }) => {
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copying, setCopying] = useState(false);
  
  // Form state
  const [allowComments, setAllowComments] = useState(true);
  const [requireAuth, setRequireAuth] = useState(false);
  const [expiresIn, setExpiresIn] = useState(null);

  // Fetch existing share link when modal opens
  const fetchShareLink = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getShareLink(playlistId);
      setShareData(response.data);
      
      // Update form state with existing settings
      setAllowComments(response.data.permissions.allowComments);
      setRequireAuth(response.data.permissions.requireAuth);
    } catch (err) {
      if (err.response?.status === 404) {
        // No existing share link
        setShareData(null);
      } else {
        setError('Failed to fetch share link');
      }
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    if (isOpen && playlistId) {
      fetchShareLink();
    }
  }, [isOpen, playlistId, fetchShareLink]);

  const handleCreateShare = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const options = {
        allowComments,
        requireAuth,
        expiresIn: expiresIn ? parseInt(expiresIn) : null
      };
      
      const response = await createShareLink(playlistId, options);
      setShareData(response.data);
    } catch (err) {
      setError('Failed to create share link');
      console.error('Error creating share link:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const permissions = {
        allowComments,
        requireAuth,
        expiresIn: expiresIn ? parseInt(expiresIn) : null
      };
      
      const response = await updateSharePermissions(playlistId, permissions);
      setShareData(response.data);
    } catch (err) {
      setError('Failed to update permissions');
      console.error('Error updating permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async () => {
    if (!window.confirm('Are you sure you want to revoke share access? This will disable the share link.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await revokeShareAccess(playlistId);
      setShareData(null);
    } catch (err) {
      setError('Failed to revoke access');
      console.error('Error revoking access:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareData?.shareUrl) return;
    
    try {
      setCopying(true);
      await navigator.clipboard.writeText(shareData.shareUrl);
      setTimeout(() => setCopying(false), 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopying(false);
    }
  };

  const formatExpirationDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Share Playlist
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Playlist Info */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              {playlistName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Share this playlist with others so they can view and comment on it.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Existing Share Link */}
          {shareData && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Share Link
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={shareData.shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  disabled={copying}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {copying ? 'Copied!' : 'Copy'}
                </button>
              </div>
              
              {/* Share Stats */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Accessed {shareData.accessCount} times • Expires: {formatExpirationDate(shareData.expiresAt)}
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="space-y-4 mb-6">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Settings</h4>
            
            {/* Allow Comments */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={allowComments}
                onChange={(e) => setAllowComments(e.target.checked)}
                className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Allow others to add comments
              </span>
            </label>

            {/* Require Auth */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={requireAuth}
                onChange={(e) => setRequireAuth(e.target.checked)}
                className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Require login to view
              </span>
            </label>

            {/* Expiration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link expires in
              </label>
              <select
                value={expiresIn || ''}
                onChange={(e) => setExpiresIn(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Never</option>
                <option value="1">1 day</option>
                <option value="7">1 week</option>
                <option value="30">1 month</option>
                <option value="90">3 months</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {shareData ? (
              <>
                <button
                  onClick={handleUpdatePermissions}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Settings'}
                </button>
                <button
                  onClick={handleRevokeAccess}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Revoke
                </button>
              </>
            ) : (
              <button
                onClick={handleCreateShare}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Share Link'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;