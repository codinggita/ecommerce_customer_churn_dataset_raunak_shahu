const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Beginner inline input validation
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and a password of at least 6 characters'
      });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email, isDeleted: { $ne: true } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Create user in database
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'User'
    });

    // Generate JWT token directly
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallbacksecret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Prepare user object response
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userObj,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Inline validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email and select password
    const user = await User.findOne({ email, isDeleted: { $ne: true } }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token directly
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallbacksecret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Prepare user object response
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      data: {
        user: userObj,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'User logged out successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current self profile
 * GET /api/v1/auth/profile
 */
const getProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'User profile fetched successfully',
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile details
 * PATCH /api/v1/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updateData = {};
    if (name) updateData.name = name;

    if (email) {
      // Check if email already used by another active user
      const emailTaken = await User.findOne({
        email,
        _id: { $ne: req.user._id },
        isDeleted: { $ne: true }
      });
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another account'
        });
      }
      updateData.email = email;
    }

    // Save changes to database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete self profile (soft delete)
 * DELETE /api/v1/auth/profile
 */
const deleteProfile = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { isDeleted: true } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'User profile deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password (request reset token)
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email, isDeleted: { $ne: true } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate simple crypto token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour expiry

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset token generated successfully',
      data: { token }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using token
 * POST /api/v1/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token and new password (min 6 characters)'
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
      isDeleted: { $ne: true }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Save new password (pre-save hook hashes it)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change current password
 * POST /api/v1/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password (min 6 characters)'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password'
      });
    }

    // Update to new password
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send OTP validation code to user email
 * POST /api/v1/auth/send-otp
 */
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email, isDeleted: { $ne: true } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate simple 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpire = Date.now() + 600000; // 10 minutes expiry

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: { otp }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP validation code
 * POST /api/v1/auth/verify-otp
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and exactly 6-digit OTP'
      });
    }

    const user = await User.findOne({
      email,
      otpCode: otp,
      otpExpire: { $gt: Date.now() },
      isDeleted: { $ne: true }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark as verified and clear OTP
    user.isEmailVerified = true;
    user.otpCode = undefined;
    user.otpExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully. Email marked as verified.',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email address using token
 * POST /api/v1/auth/verify-email
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token'
      });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() },
      isDeleted: { $ne: true }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired email verification token'
      });
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend email verification token
 * POST /api/v1/auth/resend-verification
 */
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email, isDeleted: { $ne: true } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new secure verification token
    const token = crypto.randomBytes(20).toString('hex');
    user.verificationToken = token;
    user.verificationTokenExpire = Date.now() + 86400000; // 24 hours

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verification token resent successfully',
      data: { token }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active session status details
 * GET /api/v1/auth/session
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

    return res.status(200).json({
      success: true,
      message: 'Session details retrieved successfully',
      data: sessionDetails
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear active session
 * DELETE /api/v1/auth/session
 */
const deleteSession = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Session cleared successfully',
      data: null
    });
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
  deleteSession
};
