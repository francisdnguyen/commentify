import React, { useState, useEffect, useCallback } from 'react';
import { getPlaylistComments, addComment, editComment, deleteComment } from '../api';
import { useCache } from '../contexts/CacheContext';

const CommentSection = ({ playlistId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cache = useCache();

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPlaylistComments(playlistId);
      setComments(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    fetchComments();
  }, [playlistId, fetchComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      console.log('Adding playlist comment...');
      const response = await addComment(playlistId, newComment);
      setComments([response.data, ...comments]);
      setNewComment('');

      // SELECTIVE CACHE INVALIDATION: Clear playlists cache for updated comment status
      cache.clearPlaylistsCache();
      console.log('✅ Cleared playlists cache after adding playlist comment');
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  const handleEditComment = async (commentId, content) => {
    try {
      const response = await editComment(commentId, content);
      setComments(comments.map(comment => 
        comment._id === commentId ? response.data : comment
      ));
      setEditingComment(null);
    } catch (err) {
      setError('Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      console.log('Deleting playlist comment...');
      await deleteComment(commentId);
      setComments(comments.filter(comment => comment._id !== commentId));

      // SELECTIVE CACHE INVALIDATION: Clear playlists cache as comment status may have changed
      cache.clearPlaylistsCache();
      console.log('✅ Cleared playlists cache after deleting playlist comment');
    } catch (err) {
      setError('Failed to delete comment');
    }
  };

  if (loading) return <div>Loading comments...</div>;

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          rows="3"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          Post Comment
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment._id} className="bg-white p-4 rounded-lg shadow">
            {editingComment === comment._id ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleEditComment(comment._id, e.target.content.value);
              }}>
                <textarea
                  name="content"
                  defaultValue={comment.content}
                  className="w-full p-2 border rounded-lg mb-2"
                  rows="3"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingComment(null)}
                    className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold">{comment.user.displayName}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                    {comment.edited && (
                      <span className="text-gray-500 text-sm ml-2">(edited)</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingComment(comment._id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
