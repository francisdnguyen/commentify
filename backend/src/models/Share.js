import mongoose from 'mongoose';

const shareSchema = new mongoose.Schema({
  playlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
    required: true
  },
  shareToken: {
    type: String,
    required: true
    // Remove unique: true to avoid conflict with manual index
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permissions: {
    allowComments: {
      type: Boolean,
      default: true
    },
    requireAuth: {
      type: Boolean,
      default: false
    }
  },
  expiresAt: {
    type: Date,
    default: null // null means never expires
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Analytics
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: null
  },
  accessLog: [{
    ip: String,
    userAgent: String,
    accessedAt: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null for anonymous access
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

shareSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for fast share lookups
shareSchema.index({ shareToken: 1 }, { unique: true }); // Primary lookup by token (unique)
shareSchema.index({ playlist: 1 }); // Find shares for a playlist
shareSchema.index({ createdBy: 1 }); // Find shares created by user
shareSchema.index({ expiresAt: 1 }); // Clean up expired shares
shareSchema.index({ isActive: 1, expiresAt: 1 }); // Active, non-expired shares

// Instance method to check if share is valid
shareSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  return true;
};

// Instance method to log access
shareSchema.methods.logAccess = function(ip, userAgent, user = null) {
  this.accessCount += 1;
  this.lastAccessed = new Date();
  this.accessLog.push({
    ip,
    userAgent,
    user,
    accessedAt: new Date()
  });
  
  // Keep only last 100 access logs to prevent document from growing too large
  if (this.accessLog.length > 100) {
    this.accessLog = this.accessLog.slice(-100);
  }
};

export default mongoose.model('Share', shareSchema);