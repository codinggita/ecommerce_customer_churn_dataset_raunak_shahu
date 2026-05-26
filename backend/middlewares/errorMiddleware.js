const ApiResponse = require('../utils/apiResponse');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error stack in development mode or debug mode
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_MODE === 'true') {
    console.error(`[Error] ${err.stack || err}`);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || null;

  // Custom formatting for specific mongoose/validation errors if any
  if (err.name === 'ValidationError') {
    return ApiResponse.error(res, 'Validation Error', err.errors, 400);
  }
  
  if (err.code === 11000) {
    return ApiResponse.error(res, 'Duplicate key error', err.keyValue, 400);
  }

  const payload = process.env.NODE_ENV === 'development' ? {
    stack: err.stack,
    details: errors
  } : errors;

  return ApiResponse.error(res, message, payload, statusCode);
};

module.exports = errorHandler;
