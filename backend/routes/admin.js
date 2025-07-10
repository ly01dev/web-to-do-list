const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(auth, requireAdmin);

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Admin
router.get('/users', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const role = req.query.role || '';
  const isActive = req.query.isActive;

  const skip = (page - 1) * limit;

  // Build filter
  let filter = {};
  
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { 'profile.firstName': { $regex: search, $options: 'i' } },
      { 'profile.lastName': { $regex: search, $options: 'i' } }
    ];
  }

  if (role) {
    filter.role = role;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  // Get users with pagination
  const users = await User.find(filter)
    .select('-password -refreshToken')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count
  const total = await User.countDocuments(filter);

  // Get user statistics
  const stats = await User.aggregate([
    { $group: {
      _id: null,
      totalUsers: { $sum: 1 },
      activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
      adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
      regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } }
    }}
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0,
        regularUsers: 0
      }
    }
  });
}));

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Admin
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get user's todos count
  const todosCount = await Todo.countDocuments({ user: user._id });
  const completedTodosCount = await Todo.countDocuments({ user: user._id, completed: true });

  res.json({
    success: true,
    data: {
      user,
      stats: {
        totalTodos: todosCount,
        completedTodos: completedTodosCount,
        completionRate: todosCount > 0 ? ((completedTodosCount / todosCount) * 100).toFixed(1) : 0
      }
    }
  });
}));

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Admin
router.put('/users/:id', [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('profile.firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('profile.lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { username, email, role, isActive, profile } = req.body;

  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if username/email already exists (if being updated)
  if (username && username !== user.username) {
    const usernameExists = await User.findOne({ username, _id: { $ne: user._id } });
    if (usernameExists) {
      res.status(400);
      throw new Error('Username already exists');
    }
  }

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already exists');
    }
  }

  // Update user
  if (username) user.username = username;
  if (email) user.email = email;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (profile) {
    if (profile.firstName !== undefined) user.profile.firstName = profile.firstName;
    if (profile.lastName !== undefined) user.profile.lastName = profile.lastName;
    if (profile.avatar !== undefined) user.profile.avatar = profile.avatar;
  }

  await user.save();

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
}));

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
router.delete('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }

  // Delete user's todos
  await Todo.deleteMany({ user: user._id });

  // Delete user
  await User.findByIdAndDelete(user._id);

  res.json({
    success: true,
    message: 'User and associated todos deleted successfully'
  });
}));

// @desc    Reset user password
// @route   POST /api/admin/users/:id/reset-password
// @access  Admin
router.post('/users/:id/reset-password', [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { newPassword } = req.body;

  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Hash new password
  const bcrypt = require('bcryptjs');
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  user.password = hashedPassword;
  await user.save();

  res.json({
    success: true,
    message: 'User password has been reset successfully'
  });
}));

// @desc    Get user password status (not the actual password)
// @route   GET /api/admin/users/:id/password-status
// @access  Admin
router.get('/users/:id/password-status', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('password');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if password is set (not empty)
  const hasPassword = user.password && user.password.length > 0;

  res.json({
    success: true,
    data: {
      hasPassword,
      lastPasswordChange: user.updatedAt,
      passwordStrength: hasPassword ? 'Set' : 'Not set'
    }
  });
}));

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Admin
router.get('/dashboard', asyncHandler(async (req, res) => {
  // User statistics
  const userStats = await User.aggregate([
    { $group: {
      _id: null,
      totalUsers: { $sum: 1 },
      activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
      adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
      regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } }
    }}
  ]);

  // Todo statistics
  const todoStats = await Todo.aggregate([
    { $group: {
      _id: null,
      totalTodos: { $sum: 1 },
      completedTodos: { $sum: { $cond: ['$completed', 1, 0] } },
      pendingTodos: { $sum: { $cond: ['$completed', 0, 1] } }
    }}
  ]);

  // Recent users
  const recentUsers = await User.find()
    .select('username email role isActive createdAt lastLogin')
    .sort({ createdAt: -1 })
    .limit(5);

  // Recent todos
  const recentTodos = await Todo.find()
    .populate('user', 'username email')
    .select('title completed priority createdAt')
    .sort({ createdAt: -1 })
    .limit(10);

  // Users by role
  const usersByRole = await User.aggregate([
    { $group: {
      _id: '$role',
      count: { $sum: 1 }
    }}
  ]);

  // Todos by priority
  const todosByPriority = await Todo.aggregate([
    { $group: {
      _id: '$priority',
      count: { $sum: 1 }
    }}
  ]);

  res.json({
    success: true,
    data: {
      userStats: userStats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0,
        regularUsers: 0
      },
      todoStats: todoStats[0] || {
        totalTodos: 0,
        completedTodos: 0,
        pendingTodos: 0
      },
      recentUsers,
      recentTodos,
      usersByRole,
      todosByPriority
    }
  });
}));

module.exports = router; 