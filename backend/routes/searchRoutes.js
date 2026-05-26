const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

/**
 * @route   GET /api/v1/search/customers
 * @desc    Search customers matching keyword query
 * @access  Public
 */
router.get('/customers', searchController.searchCustomers);

module.exports = router;
