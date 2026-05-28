const crypto = require('crypto');
const { User } = require('../models');

/**
 * Register a new user
 */
const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email, isDeleted: { $ne: true } });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'User'
  });

  // Remove password from returned user object
  const userObj = user.toObject();
  delete userObj.password;

  return userObj;
};

/**
 * Login user
 */
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email, isDeleted: { $ne: true } }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Remove password from returned user object
  const userObj = user.toObject();
  delete userObj.password;

  return userObj;
};

/**
 * Update user profile details
 */
const updateUserProfile = async (userId, updateData) => {
  if (updateData.email) {
    const emailTaken = await User.findOne({ 
      email: updateData.email, 
      _id: { $ne: userId },
      isDeleted: { $ne: true }
    });
    if (emailTaken) {
      const error = new Error('Email is already in use by another account');
      error.statusCode = 400;
      throw error;
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return updatedUser;
};

/**
 * Soft delete a user profile
 */
const deleteUserProfile = async (userId) => {
  return await User.findByIdAndUpdate(
    userId,
    { $set: { isDeleted: true } },
    { new: true }
  );
};

/**
 * Generate password reset token and save to DB
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email, isDeleted: { $ne: true } });
  if (!user) {
    const error = new Error('User not found with this email');
    error.statusCode = 404;
    throw error;
  }

  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Set token & expiry
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

  await user.save();

  return resetToken;
};

/**
 * Reset password using token
 */
const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
    isDeleted: { $ne: true }
  });

  if (!user) {
    const error = new Error('Invalid or expired password reset token');
    error.statusCode = 400;
    throw error;
  }

  // Set new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return user;
};

/**
 * Change current password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user || user.isDeleted) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Incorrect current password');
    error.statusCode = 400;
    throw error;
  }

  // Set new password
  user.password = newPassword;
  await user.save();

  return user;
};

/**
 * Generate OTP and save to DB
 */
const sendOtp = async (email) => {
  const user = await User.findOne({ email, isDeleted: { $ne: true } });
  if (!user) {
    const error = new Error('User not found with this email');
    error.statusCode = 404;
    throw error;
  }

  // Generate 6-digit numeric OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Set OTP & expiry
  user.otpCode = otpCode;
  user.otpExpire = Date.now() + 600000; // 10 minutes

  await user.save();

  return otpCode;
};

/**
 * Verify OTP code
 */
const verifyOtp = async (email, otp) => {
  const user = await User.findOne({
    email,
    otpCode: otp,
    otpExpire: { $gt: Date.now() },
    isDeleted: { $ne: true }
  });

  if (!user) {
    const error = new Error('Invalid or expired OTP');
    error.statusCode = 400;
    throw error;
  }

  // Mark as verified and clear OTP fields
  user.isEmailVerified = true;
  user.otpCode = undefined;
  user.otpExpire = undefined;

  await user.save();

  return user;
};

/**
 * Verify email using token
 */
const verifyEmail = async (token) => {
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpire: { $gt: Date.now() },
    isDeleted: { $ne: true }
  });

  if (!user) {
    const error = new Error('Invalid or expired email verification token');
    error.statusCode = 400;
    throw error;
  }

  user.isEmailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;

  await user.save();
  return user;
};

/**
 * Resend verification email token
 */
const resendVerificationToken = async (email) => {
  const user = await User.findOne({ email, isDeleted: { $ne: true } });
  if (!user) {
    const error = new Error('User not found with this email');
    error.statusCode = 404;
    throw error;
  }

  if (user.isEmailVerified) {
    const error = new Error('Email is already verified');
    error.statusCode = 400;
    throw error;
  }

  // Generate secure token
  const token = crypto.randomBytes(20).toString('hex');

  user.verificationToken = token;
  user.verificationTokenExpire = Date.now() + 86400000; // 24 hours

  await user.save();
  return token;
};

/**
 * Verify a JWT token
 */
const verifyJwtToken = async (token) => {
  const jwt = require('jsonwebtoken');
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret');
  
  const user = await User.findById(decoded.id);
  if (!user || user.isDeleted) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return { decoded, user };
};

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  deleteUserProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  sendOtp,
  verifyOtp,
  verifyEmail,
  resendVerificationToken,
  verifyJwtToken,
};
