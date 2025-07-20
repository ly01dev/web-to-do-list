const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tiêu đề là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Mô tả không được vượt quá 1000 ký tự']
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
todoSchema.index({ user: 1, completed: 1 });
todoSchema.index({ user: 1, priority: 1 });
todoSchema.index({ user: 1, dueDate: 1 });
todoSchema.index({ isPublic: 1 });

// Virtual for priority text
todoSchema.virtual('priorityText').get(function() {
  const priorityMap = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao'
  };
  return priorityMap[this.priority] || this.priority;
});

// Ensure virtual fields are serialized
todoSchema.set('toJSON', { virtuals: true });
todoSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Todo', todoSchema); 