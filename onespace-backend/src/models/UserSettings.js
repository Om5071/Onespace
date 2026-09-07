const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notificationPrefs: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sound: { type: Boolean, default: true },
      taskReminders: { type: Boolean, default: true },
      eventReminders: { type: Boolean, default: true },
      goalAlerts: { type: Boolean, default: true }
    },
    reminderDefaults: {
      defaultMinutesBefore: { type: Number, default: 15 },
      autoSnoozeMinutes: { type: Number, default: 15 }
    },
    fitnessPrefs: {
      unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
      dailyStepGoal: { type: Number, default: 10000 },
      dailyWaterGoalMl: { type: Number, default: 2500 }
    },
    dataPrefs: {
      autoBackup: { type: Boolean, default: true },
      dateFormat: { type: String, default: 'YYYY-MM-DD' }
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    inAppSound: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

userSettingsSchema.pre('save', function (next) {
  if (this.user && !this.userId) this.userId = this.user;
  if (this.userId && !this.user) this.user = this.userId;
  next();
});

userSettingsSchema.index({ user: 1 }, { unique: true, sparse: true });
userSettingsSchema.index({ userId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('UserSettings', userSettingsSchema);
