const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/apiResponse');
const { User } = require('../models');

/**
 * Middleware to protect routes and verify JWT token
 */
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret');

      // Get user from the token, excluding password
      const user = await User.findById(decoded.id);

      if (!user) {
        return ApiResponse.error(res, 'Not authorized, user not found', null, 401);
      }

      if (user.isDeleted) {
        return ApiResponse.error(res, 'Not authorized, user account has been deleted', null, 401);
      }

      req.user = user;
      next();
    } catch (error) {
      return ApiResponse.error(res, 'Not authorized, token failed', null, 401);
    }
  }

  if (!token) {
    return ApiResponse.error(res, 'Not authorized, no token provided', null, 401);
  }
};

/**
 * Middleware to check user roles
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this resource`,
        null,
        403
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
