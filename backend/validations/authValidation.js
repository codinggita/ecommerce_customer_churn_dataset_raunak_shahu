const { body } = require('express-validator');

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['Admin', 'User']).withMessage('Role must be either Admin or User'),
];

const validateLogin = [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const validateUpdateProfile = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Please provide a valid email'),
];

const validateForgotPassword = [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
];

const validateResetPassword = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
];

const validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
];

const validateSendOtp = [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
];

const validateVerifyOtp = [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 characters long'),
];

const validateVerifyEmail = [
  body('token').notEmpty().withMessage('Verification token is required'),
];

const validateResendVerification = [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
];

const validateVerifyToken = [
  body('token').notEmpty().withMessage('Token is required'),
];

const validateRefreshToken = [
  body('token').notEmpty().withMessage('Token is required'),
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateSendOtp,
  validateVerifyOtp,
  validateVerifyEmail,
  validateResendVerification,
  validateVerifyToken,
  validateRefreshToken,
};
