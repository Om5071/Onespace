const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
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
      required: [true, 'Reminder title is required'],
      trim: true,
      maxlength: 200
    },
    relatedType: {
      type: String,
      enum: ['task', 'event', 'goal', 'fitness', 'custom'],
      default: 'custom'
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    reminderDate: {
      type: Date,
      index: true
    },
    reminderTime: {
      type: String,
      default: ''
    },
    remindAt: {
      type: Date
    },
    recurrence: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none'
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    isTriggered: {
      type: Boolean,
      default: false
    },
    isDismissed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

reminderSchema.pre('validate', function (next) {
  if (this.user && !this.userId) this.userId = this.user;
  if (this.userId && !this.user) this.user = this.userId;
  if (this.remindAt && !this.reminderDate) this.reminderDate = this.remindAt;
  if (this.reminderDate && !this.remindAt) this.remindAt = this.reminderDate;
  next();
});

reminderSchema.index({ user: 1, reminderDate: 1, isCompleted: 1 });
reminderSchema.index({ title: 'text' });

module.exports = mongoose.model('Reminder', reminderSchema);
