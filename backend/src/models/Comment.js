import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  playlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
    required: true
  },
  trackId: {
    type: String,
    default: null // null for playlist comments, string for song comments
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow null for anonymous comments
  },
  // Anonymous comment support
  isAnonymous: {
    type: Boolean,
    default: false
  },
  anonymousName: {
    type: String,
    default: null
  },
  content: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: null
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

commentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Strategic indexes for optimal performance
commentSchema.index({ playlist: 1, trackId: 1 }); // Existing compound index
commentSchema.index({ playlist: 1 }); // Fast playlist comment lookups
commentSchema.index({ trackId: 1 }); // Fast song comment lookups
commentSchema.index({ user: 1 }); // Fast user comment lookups
commentSchema.index({ createdAt: -1 }); // Fast recent comments sorting
commentSchema.index({ playlist: 1, createdAt: -1 }); // Fast recent comments per playlist
commentSchema.index({ playlist: 1, user: 1 }); // Fast user comments per playlist

export default mongoose.model('Comment', commentSchema);
