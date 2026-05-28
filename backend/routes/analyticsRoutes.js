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

/**
 * @route   GET /api/v1/analytics/customers/top-discount-users
 * @desc    Fetch top customers by discount usage rate
 * @access  Public
 */
router.get('/customers/top-discount-users', analyticsController.getTopDiscountUsers);

/**
 * @route   GET /api/v1/analytics/customers/top-reviewers
 * @desc    Fetch top customer reviewers by reviews count
 * @access  Public
 */
router.get('/customers/top-reviewers', analyticsController.getTopReviewers);

/**
 * @route   GET /api/v1/analytics/customers/churn-analysis
 * @desc    Fetch aggregated metrics for churned vs active customers
 * @access  Public
 */
router.get('/customers/churn-analysis', analyticsController.getChurnAnalysis);

/**
 * @route   GET /api/v1/analytics/customers/retention
 * @desc    Fetch cohort retention statistics grouped by signup quarter
 * @access  Public
 */
router.get('/customers/retention', analyticsController.getRetentionAnalysis);

/**
 * @route   GET /api/v1/analytics/customers/session-analysis
 * @desc    Fetch average session metrics grouped by membership years
 * @access  Public
 */
router.get('/customers/session-analysis', analyticsController.getSessionAnalysis);

/**
 * @route   GET /api/v1/analytics/customers/purchase-analysis
 * @desc    Fetch purchase analytics and brackets breakdown
 * @access  Public
 */
router.get('/customers/purchase-analysis', analyticsController.getPurchaseAnalysis);

/**
 * @route   GET /api/v1/analytics/customers/country-analysis
 * @desc    Fetch country aggregated analytics
 * @access  Public
 */
router.get('/customers/country-analysis', analyticsController.getCountryAnalysis);

/**
 * @route   GET /api/v1/analytics/customers/city-analysis
 * @desc    Fetch city aggregated analytics
 * @access  Public
 */
router.get('/customers/city-analysis', analyticsController.getCityAnalysis);

/**
 * @route   GET /api/v1/analytics/customers/signup-analysis
 * @desc    Fetch signup quarter trend analysis
 * @access  Public
 */
router.get('/customers/signup-analysis', analyticsController.getSignupAnalysis);

/**
 * @route   GET /api/v1/analytics/customers/payment-analysis
 * @desc    Fetch payment method diversity correlation analysis
 * @access  Public
 */
router.get('/customers/payment-analysis', analyticsController.getPaymentAnalysis);

module.exports = router;
