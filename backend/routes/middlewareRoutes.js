const express = require('express');
const router = express.Router();

// Custom request timing middleware local to these practice routes
router.use((req, res, next) => {
  req.requestTime = new Date();
  next();
});

/**
 * @route   GET /api/v1/middleware/logger
 * @desc    Practice request logging middleware
 * @access  Public
 */
router.get('/logger', (req, res) => {
  console.log(`[Practice Logger] Logger middleware route hit: ${req.method} ${req.originalUrl}`);
  return res.status(200).json({
    success: true,
    message: 'Practice request logging middleware verified successfully',
    data: {
      logged: true,
      method: req.method,
      url: req.originalUrl,
      timestamp: new Date()
    }
  });
});

/**
 * @route   GET /api/v1/middleware/request-time
 * @desc    Practice request timing middleware
 * @access  Public
 */
router.get('/request-time', (req, res) => {
  const duration = new Date() - req.requestTime;
  return res.status(200).json({
    success: true,
    message: 'Practice request timing middleware verified successfully',
    data: {
      requestStartTime: req.requestTime,
      durationMs: duration,
      formattedDuration: `${duration}ms`
    }
  });
});

module.exports = router;
