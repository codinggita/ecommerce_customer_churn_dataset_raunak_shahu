const ApiResponse = require('../utils/apiResponse');
const authService = require('../services/authService');
const generateToken = require('../utils/generateToken');

/**
 * Register user
 * @route POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await authService.registerUser({ name, email, password, role });
    const token = generateToken(user._id);

    return ApiResponse.success(res, 'User registered successfully', {
      user,
      token,
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser({ email, password });
    const token = generateToken(user._id);

    return ApiResponse.success(res, 'User logged in successfully', {
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * @route POST /api/v1/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    return ApiResponse.success(res, 'User logged out successfully', null);
  } catch (error) {
    next(error);
  }
};

/**
 * Get self profile
 * @route GET /api/v1/auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    return ApiResponse.success(res, 'User profile fetched successfully', req.user);
  } catch (error) {
    next(error);
  }
};

/**
 * Update self profile
 * @route PATCH /api/v1/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updatedUser = await authService.updateUserProfile(req.user._id, { name, email });
    return ApiResponse.success(res, 'User profile updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete self profile (soft delete)
 * @route DELETE /api/v1/auth/profile
 */
const deleteProfile = async (req, res, next) => {
  try {
    await authService.deleteUserProfile(req.user._id);
    return ApiResponse.success(res, 'User profile deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password (request reset link/token)
 * @route POST /api/v1/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const token = await authService.forgotPassword(email);
    return ApiResponse.success(res, 'Password reset token generated successfully', { token });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using token
 * @route POST /api/v1/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    return ApiResponse.success(res, 'Password reset successfully', null);
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 * @route POST /api/v1/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user._id, currentPassword, newPassword);
    return ApiResponse.success(res, 'Password changed successfully', null);
  } catch (error) {
    next(error);
  }
};

/**
 * Send OTP to user email
 * @route POST /api/v1/auth/send-otp
 */
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const otp = await authService.sendOtp(email);
    return ApiResponse.success(res, 'OTP sent successfully', { otp });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP
 * @route POST /api/v1/auth/verify-otp
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    await authService.verifyOtp(email, otp);
    return ApiResponse.success(res, 'OTP verified successfully. Email marked as verified.', null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  deleteProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  sendOtp,
  verifyOtp,
};

/**
 * Verify email using token
 * @route POST /api/v1/auth/verify-email
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    await authService.verifyEmail(token);
    return ApiResponse.success(res, 'Email verified successfully', null);
  } catch (error) {
    next(error);
  }
};

/**
 * Resend email verification token
 * @route POST /api/v1/auth/resend-verification
 */
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const token = await authService.resendVerificationToken(email);
    return ApiResponse.success(res, 'Email verification token resent successfully', { token });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active session status details
 * @route GET /api/v1/auth/session
 */
const getSession = async (req, res, next) => {
  try {
    const sessionDetails = {
      sessionId: req.user._id + '_' + Date.now(),
      userId: req.user._id,
      email: req.user.email,
      role: req.user.role,
      loginTime: req.user.updatedAt,
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || '127.0.0.1',
      isActive: true
    };
    return ApiResponse.success(res, 'Session details retrieved successfully', sessionDetails);
  } catch (error) {
    next(error);
  }
};

/**
 * Clear active session
 * @route DELETE /api/v1/auth/session
 */
const deleteSession = async (req, res, next) => {
  try {
    return ApiResponse.success(res, 'Session cleared successfully', null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  deleteProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  sendOtp,
  verifyOtp,
  verifyEmail,
  resendVerification,
  getSession,
  deleteSession,
};

