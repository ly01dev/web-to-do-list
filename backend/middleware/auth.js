const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify access token middleware
const auth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Token không tồn tại'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
        issuer: 'todolist-app',
        audience: 'todolist-users'
      });

      // Get user from token
      const user = await User.findById(decoded.userId)
        .select('-password -refreshToken')
        .lean();
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Người dùng không tồn tại'
        });
      }

      // Check if user is active
      if (user.isActive === false) {
        return res.status(401).json({
          success: false,
          error: 'Tài khoản đã bị vô hiệu hóa'
        });
      }

      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token đã hết hạn'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Token không hợp lệ'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Token không hợp lệ'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      error: 'Token không tồn tại'
    });
  }
};

// Check if user is admin
const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Yêu cầu đăng nhập'
    });
  }

  if (req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Truy cập bị từ chối. Yêu cầu quyền admin.'
    });
  }
};

// Optional auth - doesn't throw error if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
          issuer: 'todolist-app',
          audience: 'todolist-users'
        });
        
        const user = await User.findById(decoded.userId)
          .select('-password -refreshToken')
          .lean();
        
        if (user && user.isActive !== false) {
          req.user = user;
        }
      }
    } catch (error) {
      // Token is invalid but we don't throw error
      console.log('Optional auth - invalid token:', error.message);
    }
  }

  next();
};

// Rate limiting for sensitive operations
const sensitiveOperationLimiter = (req, res, next) => {
  // This would be implemented with a more sophisticated rate limiting
  // For now, we'll just pass through
  next();
};

module.exports = auth;
module.exports.requireAdmin = requireAdmin;
module.exports.optionalAuth = optionalAuth;
module.exports.sensitiveOperationLimiter = sensitiveOperationLimiter; 