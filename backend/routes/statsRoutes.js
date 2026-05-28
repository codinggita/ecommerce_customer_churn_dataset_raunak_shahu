const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

/**
 * @route   GET /api/v1/stats/customers/count
 * @desc    Fetch total customer count
 * @access  Public
 */
router.get('/customers/count', statsController.getCustomerCount);

/**
 * @route   GET /api/v1/stats/customers/average-age
 * @desc    Fetch average customer age
 * @access  Public
 */
router.get('/customers/average-age', statsController.getAverageAge);

/**
 * @route   GET /api/v1/stats/customers/average-lifetime
 * @desc    Fetch average customer lifetime value
 * @access  Public
 */
router.get('/customers/average-lifetime', statsController.getAverageLifetimeValue);

/**
 * @route   GET /api/v1/stats/customers/average-credit
 * @desc    Fetch average customer credit balance
 * @access  Public
 */
router.get('/customers/average-credit', statsController.getAverageCreditBalance);

/**
 * @route   GET /api/v1/stats/customers/average-order-value
 * @desc    Fetch average customer order value
 * @access  Public
 */
router.get('/customers/average-order-value', statsController.getAverageOrderValue);

/**
 * @route   GET /api/v1/stats/customers/highest-purchases
 * @desc    Fetch customer with highest purchases
 * @access  Public
 */
router.get('/customers/highest-purchases', statsController.getHighestPurchasesCustomer);

/**
 * @route   GET /api/v1/stats/customers/highest-lifetime
 * @desc    Fetch customer with highest lifetime value
 * @access  Public
 */
router.get('/customers/highest-lifetime', statsController.getHighestLifetimeCustomer);

/**
 * @route   GET /api/v1/stats/customers/highest-credit
 * @desc    Fetch customer with highest credit balance
 * @access  Public
 */
router.get('/customers/highest-credit', statsController.getHighestCreditCustomer);

/**
 * @route   GET /api/v1/stats/customers/country-count
 * @desc    Fetch customer counts grouped by country
 * @access  Public
 */
router.get('/customers/country-count', statsController.getCountryCounts);

/**
 * @route   GET /api/v1/stats/customers/city-count
 * @desc    Fetch customer counts grouped by city
 * @access  Public
 */
router.get('/customers/city-count', statsController.getCityCounts);

/**
 * @route   GET /api/v1/stats/customers/gender-count
 * @desc    Fetch customer counts grouped by gender
 * @access  Public
 */
router.get('/customers/gender-count', statsController.getGenderCounts);

/**
 * @route   GET /api/v1/stats/customers/churn-count
 * @desc    Fetch customer counts grouped by churn status
 * @access  Public
 */
router.get('/customers/churn-count', statsController.getChurnCounts);

/**
 * @route   GET /api/v1/stats/customers/signup-quarter-count
 * @desc    Fetch customer counts grouped by signup quarter
 * @access  Public
 */
router.get('/customers/signup-quarter-count', statsController.getSignupQuarterCounts);

/**
 * @route   GET /api/v1/stats/customers/review-count
 * @desc    Fetch total customer reviews written count
 * @access  Public
 */
router.get('/customers/review-count', statsController.getTotalReviewCount);

/**
 * @route   GET /api/v1/stats/customers/mobile-usage
 * @desc    Fetch average mobile usage statistics
 * @access  Public
 */
router.get('/customers/mobile-usage', statsController.getAverageMobileUsage);

module.exports = router;
