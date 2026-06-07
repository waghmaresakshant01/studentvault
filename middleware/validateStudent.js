const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');

const validateStudentRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required'),
    
  body('rollNo')
    .trim()
    .notEmpty().withMessage('Roll number is required')
    .custom(async (value) => {
      const student = await Student.findOne({ rollNo: value.trim() });
      if (student) {
        throw new Error('A student with this roll number already exists.');
      }
      return true;
    }),

  body('branch')
    .trim()
    .notEmpty().withMessage('Branch is required')
    .custom((value) => {
      const allowedBranches = ['CSE', 'IT', 'ECE', 'ME', 'CE'];
      if (!allowedBranches.includes(value.trim().toUpperCase())) {
        throw new Error('Branch must be one of CSE, IT, ECE, ME, CE');
      }
      return true;
    }),

  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 1, max: 4 }).withMessage('Year must be an integer between 1 and 4'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .custom(async (value) => {
      const student = await Student.findOne({ email: value.toLowerCase().trim() });
      if (student) {
        throw new Error('A student with this email already exists.');
      }
      return true;
    }),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\d{10}$/).withMessage('Phone number must be exactly 10 digits'),
    
  body('address')
    .optional()
    .trim()
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const formattedErrors = errors.array().map(err => ({
    field: err.path,
    message: err.msg
  }));

  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: formattedErrors
  });
};

module.exports = {
  validateStudentRules,
  validate
};
