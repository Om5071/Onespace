const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      trim: true
    },
    fileType: {
      type: String,
      default: ''
    },
    mimeType: {
      type: String,
      default: ''
    },
    fileSize: {
      type: Number,
      required: true
    },
    storagePath: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    notes: {
      type: String,
      default: ''
    },
    uploadDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    lastModifiedDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

documentSchema.pre('validate', function (next) {
  if (this.user && !this.userId) this.userId = this.user;
  if (this.userId && !this.user) this.user = this.userId;
  if (!this.originalName && this.fileName) this.originalName = this.fileName;
  if (!this.fileType && this.mimeType) this.fileType = this.mimeType;
  this.lastModifiedDate = new Date();
  next();
});

documentSchema.index({ user: 1, uploadDate: -1 });
documentSchema.index({ fileName: 'text', originalName: 'text', notes: 'text' });

module.exports = mongoose.model('Document', documentSchema);
