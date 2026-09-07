const mongoose = require('mongoose');

const dailyHabitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['done', 'not done', 'pending'],
    default: 'not done'
  }
});

const dailyExpenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    default: 'General'
  },
  date: {
    type: String
  }
});

const dailyActivitySchema = new mongoose.Schema(
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
    name: {
      type: String,
      trim: true
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurrencePattern: {
      type: String,
      enum: ['daily', 'weekdays', 'weekly', 'custom', 'none'],
      default: 'daily'
    },
    status: {
      type: String,
      enum: ['done', 'not done', 'pending'],
      default: 'not done'
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true
    },
    mood: {
      type: mongoose.Schema.Types.Mixed, // Can be String ('great', 'good', 'neutral', 'bad', 'terrible') or Number (1 to 5)
      default: 'good'
    },
    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
      default: 7
    },
    waterIntakeMl: {
      type: Number,
      min: 0,
      default: 2000
    },
    habits: [dailyHabitSchema],
    expenses: [dailyExpenseSchema],
    notes: {
      type: String,
      default: ''
    },
    journalEntry: {
      type: String,
      default: ''
    },
    energyLevel: {
      type: Number, // 1 to 5
      min: 1,
      max: 5,
      default: 3
    }
  },
  {
    timestamps: true
  }
);

dailyActivitySchema.pre('validate', function (next) {
  if (this.user && !this.userId) this.userId = this.user;
  if (this.userId && !this.user) this.user = this.userId;
  if (this.notes && !this.journalEntry) this.journalEntry = this.notes;
  if (this.journalEntry && !this.notes) this.notes = this.journalEntry;
  next();
});

dailyActivitySchema.index({ user: 1, date: 1 });
dailyActivitySchema.index({ name: 'text' });

module.exports = mongoose.model('DailyActivity', dailyActivitySchema);
