const express = require('express');
const router = express.Router();
const jwtController = require('../controllers/jwtController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/v1/jwt/verify-token
 * @desc    Verify if JWT token is valid
 * @access  Public
 */
router.post('/verify-token', jwtController.verifyToken);

/**
 * @route   POST /api/v1/jwt/refresh-token
 * @desc    Get new JWT token using existing valid token
 * @access  Public
 */
router.post('/refresh-token', jwtController.refreshToken);

/**
 * @route   GET /api/v1/jwt/profile
 * @desc    Fetch authenticated user's profile details using JWT
 * @access  Private (Authenticated)
 */
router.get('/profile', protect, jwtController.getJwtProfile);

/**
 * @route   GET /api/v1/jwt/dashboard
 * @desc    Retrieve dashboard statistics summary using JWT
 * @access  Private (Authenticated)
 */
router.get('/dashboard', protect, jwtController.getJwtDashboard);

/**
 * @route   GET /api/v1/jwt/private-customers
 * @desc    Guarded customer list query with filters, sorting, and pagination
 * @access  Private (Authenticated)
 */
router.get('/private-customers', protect, jwtController.getPrivateCustomers);

/**
 * @route   GET /api/v1/jwt/private-stats
 * @desc    Guarded statistics metrics for high-level summary
 * @access  Private (Authenticated)
 */
router.get('/private-stats', protect, jwtController.getPrivateStats);

/**
 * @route   GET /api/v1/jwt/admin
 * @desc    Admin-role only test endpoint
 * @access  Private (Admin Role Only)
 */
router.get('/admin', protect, authorize('Admin'), jwtController.getAdminData);

/**
 * @route   GET /api/v1/jwt/customer-insights
 * @desc    Insights query restricted to authorized roles (Admin)
 * @access  Private (Admin Role Only)
 */
router.get('/customer-insights', protect, authorize('Admin'), jwtController.getCustomerInsights);

module.exports = router;
