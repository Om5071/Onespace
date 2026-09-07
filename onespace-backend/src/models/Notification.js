const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
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
    title: {
      type: String,
      default: '',
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['reminder', 'task', 'event', 'goal', 'fitness', 'system'],
      default: 'system',
      index: true
    },
    sourceType: {
      type: String,
      default: 'system'
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    },
    linkUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.pre('validate', function (next) {
  if (this.user && !this.userId) this.userId = this.user;
  if (this.userId && !this.user) this.user = this.userId;
  if (!this.title && this.message) this.title = this.message.slice(0, 50);
  next();
});

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
