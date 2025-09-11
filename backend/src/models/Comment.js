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
    required: true
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

// Create a compound index for playlist and trackId to optimize queries
commentSchema.index({ playlist: 1, trackId: 1 });

export default mongoose.model('Comment', commentSchema);
