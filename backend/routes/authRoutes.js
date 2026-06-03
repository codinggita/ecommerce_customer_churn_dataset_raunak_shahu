const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user & get token
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', protect, authController.getProfile);

/**
 * @route   PATCH /api/v1/auth/profile
 * @desc    Update user profile details
 * @access  Private
 */
router.patch('/profile', protect, authController.updateProfile);

/**
 * @route   DELETE /api/v1/auth/profile
 * @desc    Delete user profile (soft delete)
 * @access  Private
 */
router.delete('/profile', protect, authController.deleteProfile);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset token
 * @access  Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change current password
 * @access  Private
 */
router.post('/change-password', protect, authController.changePassword);

/**
 * @route   POST /api/v1/auth/send-otp
 * @desc    Send OTP code to email
 * @access  Public
 */
router.post('/send-otp', authController.sendOtp);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP code
 * @access  Public
 */
router.post('/verify-otp', authController.verifyOtp);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify email using token
 * @access  Public
 */
router.post('/verify-email', authController.verifyEmail);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Resend email verification token
 * @access  Public
 */
router.post('/resend-verification', authController.resendVerification);

/**
 * @route   GET /api/v1/auth/session
 * @desc    Get current active session details
 * @access  Private
 */
router.get('/session', protect, authController.getSession);

/**
 * @route   DELETE /api/v1/auth/session
 * @desc    Clear active session
 * @access  Private
 */
router.delete('/session', protect, authController.deleteSession);

module.exports = router;
