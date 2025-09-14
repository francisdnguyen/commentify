import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  spotifyId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  email: String,
  accessToken: String,
  refreshToken: String,
  tokenExpiry: Date,
  playlistLastViewed: {
    type: Map,
    of: Date,
    default: new Map()
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

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for fast lookups
// Note: spotifyId already has unique: true above, no need for explicit index
userSchema.index({ email: 1 }); // Fast email lookups

export default mongoose.model('User', userSchema);
