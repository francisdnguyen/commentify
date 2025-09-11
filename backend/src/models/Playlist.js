import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  spotifyId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'comment', 'admin'],
      default: 'comment'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Sharing functionality
  shareToken: {
    type: String,
    unique: true,
    sparse: true // Only create index for non-null values
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareSettings: {
    allowComments: {
      type: Boolean,
      default: true
    },
    requireAuth: {
      type: Boolean,
      default: false // Allow anonymous access by default
    },
    expiresAt: {
      type: Date,
      default: null // null means never expires
    }
  },
  isSpotifyPlaylist: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

playlistSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for fast playlist lookups
playlistSchema.index({ spotifyId: 1 }, { unique: true }); // Fast Spotify playlist lookups (unique)
playlistSchema.index({ owner: 1 }); // Fast user playlists lookups
playlistSchema.index({ 'collaborators.user': 1 }); // Fast collaborator lookups
playlistSchema.index({ owner: 1, createdAt: -1 }); // Fast recent user playlists
// Note: shareToken already has unique: true, sparse: true above, no need for explicit index
playlistSchema.index({ isPublic: 1 }); // Fast public playlist discovery

export default mongoose.model('Playlist', playlistSchema);
