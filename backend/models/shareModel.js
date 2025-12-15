const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema({
  shareId: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  sharedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  viewCount: {
    type: Number,
    default: 0
  }
});

// Auto-delete expired shares
shareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('share', shareSchema);
