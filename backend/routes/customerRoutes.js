const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/apiResponse');
const constants = require('../config/constants');
const upload = require('../middlewares/uploadMiddleware');
const customerController = require('../controllers/customerController');

/**
 * @route   GET /api/v1/customers/system/health
 * @desc    Check API system health status
 * @access  Public
 */
router.get('/system/health', (req, res) => {
  return ApiResponse.success(res, 'API is healthy', {
    status: 'UP',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

/**
 * @route   GET /api/v1/customers/system/version
 * @desc    Fetch API version details
 * @access  Public
 */
router.get('/system/version', (req, res) => {
  return ApiResponse.success(res, 'API version details fetched successfully', {
    version: constants.API_VERSION,
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * @route   GET /api/v1/customers/system/config
 * @desc    Fetch public configuration details
 * @access  Public
 */
router.get('/system/config', (req, res) => {
  return ApiResponse.success(res, 'Public configuration details fetched successfully', {
    corsOrigin: process.env.CORS_ORIGIN || '*',
    env: process.env.NODE_ENV || 'development',
    debugMode: process.env.DEBUG_MODE === 'true',
  });
});

/**
 * @route   POST /api/v1/customers/import-json
 * @desc    Import/upload customer records from a JSON file
 * @access  Public (for development/seeding)
 */
router.post('/import-json', upload.single('file'), customerController.importJson);

/**
 * @route   POST /api/v1/customers/cache/clear
 * @desc    Clear API query cache
 * @access  Public (for now)
 */
router.post('/cache/clear', customerController.clearCache);

module.exports = router;
