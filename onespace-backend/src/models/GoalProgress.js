const mongoose = require('mongoose');

const goalProgressSchema = new mongoose.Schema(
  {
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      index: true
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    loggedDate: {
      type: Date,
      default: Date.now
    },
    progressValue: {
      type: Number,
      default: 0
    },
    valueAdded: {
      type: Number,
      default: 0
    },
    currentTotal: {
      type: Number,
      default: 0
    },
    note: {
      type: String,
      default: '',
      trim: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

goalProgressSchema.pre('validate', function (next) {
  if (this.goal && !this.goalId) this.goalId = this.goal;
  if (this.goalId && !this.goal) this.goal = this.goalId;
  if (this.user && !this.userId) this.userId = this.user;
  if (this.userId && !this.user) this.user = this.userId;
  if (this.valueAdded && !this.progressValue) this.progressValue = this.valueAdded;
  if (this.progressValue && !this.valueAdded) this.valueAdded = this.progressValue;
  if (this.notes && !this.note) this.note = this.notes;
  if (this.note && !this.notes) this.notes = this.note;
  if (this.loggedDate && !this.date) this.date = this.loggedDate;
  if (this.date && !this.loggedDate) this.loggedDate = this.date;
  next();
});

goalProgressSchema.index({ goal: 1, date: -1 });

module.exports = mongoose.model('GoalProgress', goalProgressSchema);
