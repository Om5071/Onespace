const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
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
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    startDateTime: {
      type: Date,
      index: true
    },
    endDateTime: {
      type: Date
    },
    startTime: {
      type: Date
    },
    endTime: {
      type: Date
    },
    allDay: {
      type: Boolean,
      default: false
    },
    location: {
      type: String,
      default: '',
      trim: true
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    color: {
      type: String,
      default: '#4f46e5'
    },
    reminders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reminder'
      }
    ],
    reminderMinutesBefore: {
      type: Number,
      default: 15
    }
  },
  {
    timestamps: true
  }
);

eventSchema.pre('validate', function (next) {
  if (this.user && !this.userId) this.userId = this.user;
  if (this.userId && !this.user) this.user = this.userId;
  if (this.startDateTime && !this.startTime) this.startTime = this.startDateTime;
  if (this.startTime && !this.startDateTime) this.startDateTime = this.startTime;
  if (this.endDateTime && !this.endTime) this.endTime = this.endDateTime;
  if (this.endTime && !this.endDateTime) this.endDateTime = this.endTime;
  next();
});

eventSchema.index({ user: 1, startDateTime: 1 });
eventSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Event', eventSchema);
