const { body, validationResult } = require('express-validator');

// Validation middleware for todo
const validateTodo = [
  body('title')
    .notEmpty()
    .withMessage('Vui lòng nhập tiêu đề cho todo')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Tiêu đề không được vượt quá 200 ký tự'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Mô tả không được vượt quá 1000 ký tự'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Độ ưu tiên phải là: thấp, trung bình hoặc cao'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Trường công khai phải là đúng hoặc sai'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Định dạng ngày bắt đầu không hợp lệ'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Định dạng ngày hoàn thành không hợp lệ'),
  
  // Custom validation to check if dueDate is after startDate
  body('dueDate')
    .optional()
    .custom((value, { req }) => {
      if (value && req.body.startDate) {
        const startDate = new Date(req.body.startDate);
        const dueDate = new Date(value);
        if (dueDate <= startDate) {
          throw new Error('Thời gian hoàn thành phải sau thời gian bắt đầu');
        }
      }
      return true;
    }),
  
  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }
    next();
  }
];

// Validation middleware for user registration
const validateRegister = [
  body('username')
    .notEmpty()
    .withMessage('Tên đăng nhập là bắt buộc')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Tên đăng nhập phải từ 3-30 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
  
  body('email')
    .notEmpty()
    .withMessage('Email là bắt buộc')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Họ không được vượt quá 50 ký tự'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Tên không được vượt quá 50 ký tự'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }
    next();
  }
];

// Validation middleware for user login
const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('Email là bắt buộc')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }
    next();
  }
];

module.exports = {
  validateTodo,
  validateRegister,
  validateLogin
}; 