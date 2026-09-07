const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  targetDate: {
    type: Date
  }
});

const goalSchema = new mongoose.Schema(
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
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    category: {
      type: String,
      default: 'Personal',
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'cancelled'],
      default: 'active',
      index: true
    },
    targetDate: {
      type: Date,
      required: true
    },
    progressPercent: {
      type: Number,
      default: 0
    },
    metrics: {
      unit: {
        type: String,
        default: '%'
      },
      startValue: {
        type: Number,
        default: 0
      },
      targetValue: {
        type: Number,
        default: 100
      },
      currentValue: {
        type: Number,
        default: 0
      }
    },
    milestones: [milestoneSchema],
    color: {
      type: String,
      default: '#3b82f6'
    }
  },
  {
    timestamps: true
  }
);

goalSchema.pre('validate', function (next) {
  if (this.user && !this.userId) this.userId = this.user;
  if (this.userId && !this.user) this.user = this.userId;
  if (this.metrics?.targetValue > 0) {
    this.progressPercent = Math.min(100, Math.round(((this.metrics.currentValue || 0) / this.metrics.targetValue) * 100));
  }
  next();
});

goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Goal', goalSchema);
