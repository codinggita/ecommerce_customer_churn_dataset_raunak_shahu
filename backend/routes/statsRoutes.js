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

module.exports = router;
