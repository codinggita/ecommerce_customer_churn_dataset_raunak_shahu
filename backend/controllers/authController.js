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

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  deleteProfile,
};
