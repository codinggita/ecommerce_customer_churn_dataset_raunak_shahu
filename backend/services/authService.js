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

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  deleteUserProfile,
};
