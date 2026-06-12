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
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: err.errors
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate key error',
      errors: err.keyValue
    });
  }

  const details = process.env.NODE_ENV === 'development' ? {
    stack: err.stack,
    details: errors
  } : errors;

  return res.status(statusCode).json({
    success: false,
    message,
    errors: details
  });
};

module.exports = errorHandler;
