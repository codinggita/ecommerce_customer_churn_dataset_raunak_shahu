const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

/**
 * @route   GET /api/v1/analytics/customers/top-buyers
 * @desc    Fetch top customer buyers sorted by total purchases
 * @access  Public
 */
router.get('/customers/top-buyers', analyticsController.getTopBuyers);

/**
 * @route   GET /api/v1/analytics/customers/top-lifetime
 * @desc    Fetch top customers by lifetime value (LTV)
 * @access  Public
 */
router.get('/customers/top-lifetime', analyticsController.getTopLifetimeCustomers);

/**
 * @route   GET /api/v1/analytics/customers/top-credit
 * @desc    Fetch top customers by credit balance
 * @access  Public
 */
router.get('/customers/top-credit', analyticsController.getTopCreditCustomers);

/**
 * @route   GET /api/v1/analytics/customers/top-engagement
 * @desc    Fetch top engaged customers based on frequency and duration
 * @access  Public
 */
router.get('/customers/top-engagement', analyticsController.getTopEngagement);

/**
 * @route   GET /api/v1/analytics/customers/top-mobile-users
 * @desc    Fetch top customers by mobile usage duration
 * @access  Public
 */
router.get('/customers/top-mobile-users', analyticsController.getTopMobileUsers);

module.exports = router;
