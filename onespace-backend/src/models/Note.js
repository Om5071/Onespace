const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    content: {
      type: String,
      default: ''
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
    isPinned: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: '#ffffff'
    }
  },
  {
    timestamps: true
  }
);

noteSchema.pre('validate', function (next) {
  if (this.user && !this.userId) this.userId = this.user;
  if (this.userId && !this.user) this.user = this.userId;
  if (this.content && !this.description) this.description = this.content.slice(0, 200);
  if (this.description && !this.content) this.content = this.description;
  next();
});

noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ title: 'text', description: 'text', content: 'text' });

module.exports = mongoose.model('Note', noteSchema);
