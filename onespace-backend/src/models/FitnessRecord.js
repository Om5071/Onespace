const mongoose = require('mongoose');

const exerciseSetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sets: {
    type: Number,
    default: 1
  },
  reps: {
    type: Number,
    default: 10
  },
  weightKg: {
    type: Number,
    default: 0
  }
});

const fitnessRecordSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['workout', 'weight', 'steps', 'metrics', 'other'],
      default: 'workout'
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true
    },
    workoutType: {
      type: String,
      default: 'Strength'
    },
    duration: {
      type: Number,
      default: 0
    },
    durationMinutes: {
      type: Number,
      default: 0
    },
    caloriesBurned: {
      type: Number,
      default: 0
    },
    steps: {
      type: Number,
      default: 0
    },
    bodyWeight: {
      type: Number,
      default: null
    },
    bodyWeightKg: {
      type: Number,
      default: null
    },
    exercises: [exerciseSetSchema],
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

fitnessRecordSchema.pre('validate', function (next) {
  if (this.user && !this.userId) this.userId = this.user;
  if (this.userId && !this.user) this.user = this.userId;
  if (this.duration && !this.durationMinutes) this.durationMinutes = this.duration;
  if (this.durationMinutes && !this.duration) this.duration = this.durationMinutes;
  if (this.bodyWeight && !this.bodyWeightKg) this.bodyWeightKg = this.bodyWeight;
  if (this.bodyWeightKg && !this.bodyWeight) this.bodyWeight = this.bodyWeightKg;
  next();
});

fitnessRecordSchema.index({ user: 1, date: 1 });
fitnessRecordSchema.index({ workoutType: 'text' });

module.exports = mongoose.model('FitnessRecord', fitnessRecordSchema);
