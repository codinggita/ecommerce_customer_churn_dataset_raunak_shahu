const ApiResponse = require('../utils/apiResponse');
const authService = require('../services/authService');
const generateToken = require('../utils/generateToken');

/**
 * Verify a JWT token
 * @route POST /api/v1/jwt/verify-token
 */
const verifyToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    const data = await authService.verifyJwtToken(token);
    return ApiResponse.success(res, 'Token is valid', {
      decoded: data.decoded,
      user: data.user
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.error(res, 'Invalid token format or signature', null, 400);
    }
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Token has expired', null, 400);
    }
    next(error);
  }
};

/**
 * Refresh a JWT token
 * @route POST /api/v1/jwt/refresh-token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    const data = await authService.verifyJwtToken(token);
    const newToken = generateToken(data.user._id);
    return ApiResponse.success(res, 'Token refreshed successfully', {
      token: newToken
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.error(res, 'Invalid token format or signature', null, 400);
    }
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Token has expired, please log in again', null, 400);
    }
    next(error);
  }
};

module.exports = {
  verifyToken,
  refreshToken,
};
