const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/apiResponse');
const constants = require('../config/constants');
const upload = require('../middlewares/uploadMiddleware');
const customerController = require('../controllers/customerController');
const { 
  validateCreate, 
  validateUpdate, 
  validateId,
  validateBulkCreate,
  validateBulkUpdate,
  validateBulkDelete 
} = require('../validations/customerValidation');
const validate = require('../middlewares/validationMiddleware');

// --- SYSTEM & UTILITY ROUTES (Place before parameter routes) ---

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
 * @access  Public
 */
router.post('/import-json', upload.single('file'), customerController.importJson);

/**
 * @route   POST /api/v1/customers/cache/clear
 * @desc    Clear API query cache
 * @access  Public
 */
router.post('/cache/clear', customerController.clearCache);

/**
 * @route   GET /api/v1/customers/random
 * @desc    Fetch a random customer record (Must be registered before /:id)
 * @access  Public
 */
router.get('/random', customerController.getRandomCustomer);

/**
 * @route   GET /api/v1/customers/exists/:id
 * @desc    Check whether customer exists or not (Must be registered before /:id)
 * @access  Public
 */
router.get('/exists/:id', validateId, validate, customerController.checkCustomerExists);


// --- STATIC CATEGORICAL SEGMENTS ---

/**
 * @route   GET /api/v1/customers/churned
 * @desc    Fetch churned customers
 * @access  Public
 */
router.get('/churned', customerController.getChurnedCustomers);

/**
 * @route   GET /api/v1/customers/active
 * @desc    Fetch active customers
 * @access  Public
 */
router.get('/active', customerController.getActiveCustomers);

/**
 * @route   GET /api/v1/customers/high-value
 * @desc    Fetch customers with high lifetime value
 * @access  Public
 */
router.get('/high-value', customerController.getHighValueCustomers);

/**
 * @route   GET /api/v1/customers/high-purchases
 * @desc    Fetch customers with high purchases
 * @access  Public
 */
router.get('/high-purchases', customerController.getHighPurchasesCustomers);

/**
 * @route   GET /api/v1/customers/high-credit
 * @desc    Fetch customers with high credit balance
 * @access  Public
 */
router.get('/high-credit', customerController.getHighCreditCustomers);

/**
 * @route   GET /api/v1/customers/high-engagement
 * @desc    Fetch highly engaged customers
 * @access  Public
 */
router.get('/high-engagement', customerController.getHighEngagementCustomers);

/**
 * @route   GET /api/v1/customers/high-mobile-usage
 * @desc    Fetch high mobile app users
 * @access  Public
 */
router.get('/high-mobile-usage', customerController.getHighMobileUsageCustomers);

/**
 * @route   GET /api/v1/customers/high-discount-users
 * @desc    Fetch high discount rate users
 * @access  Public
 */
router.get('/high-discount-users', customerController.getHighDiscountCustomers);

/**
 * @route   GET /api/v1/customers/recent-buyers
 * @desc    Fetch recently active buyers
 * @access  Public
 */
router.get('/recent-buyers', customerController.getRecentBuyers);

/**
 * @route   GET /api/v1/customers/inactive
 * @desc    Fetch inactive buyers
 * @access  Public
 */
router.get('/inactive', customerController.getInactiveCustomers);

/**
 * @route   GET /api/v1/customers/top-reviewers
 * @desc    Fetch customers writing most reviews
 * @access  Public
 */
router.get('/top-reviewers', customerController.getTopReviewers);


// --- DEMOGRAPHIC SPECIFIC ROUTING ---

/**
 * @route   GET /api/v1/customers/country/:country
 * @desc    Fetch customers belonging to a specific country
 * @access  Public
 */
router.get('/country/:country', customerController.getCustomersByCountry);

/**
 * @route   GET /api/v1/customers/city/:city
 * @desc    Fetch customers belonging to a specific city
 * @access  Public
 */
router.get('/city/:city', customerController.getCustomersByCity);

/**
 * @route   GET /api/v1/customers/gender/:gender
 * @desc    Fetch customers using gender
 * @access  Public
 */
router.get('/gender/:gender', customerController.getCustomersByGender);

/**
 * @route   GET /api/v1/customers/age/:age
 * @desc    Fetch customers using age
 * @access  Public
 */
router.get('/age/:age', customerController.getCustomersByAge);

/**
 * @route   GET /api/v1/customers/signup-quarter/:quarter
 * @desc    Fetch customers using signup quarter
 * @access  Public
 */
router.get('/signup-quarter/:quarter', customerController.getCustomersBySignupQuarter);


// --- BEHAVIORAL & METRIC ROUTING ---

/**
 * @route   GET /api/v1/customers/login-frequency/:value
 * @desc    Fetch customers by login frequency (>= value)
 * @access  Public
 */
router.get('/login-frequency/:value', customerController.getCustomersByLoginFrequency);

/**
 * @route   GET /api/v1/customers/session-duration/:value
 * @desc    Fetch customers by session duration (>= value)
 * @access  Public
 */
router.get('/session-duration/:value', customerController.getCustomersBySessionDuration);

/**
 * @route   GET /api/v1/customers/purchases/:value
 * @desc    Fetch customers by total purchases (>= value)
 * @access  Public
 */
router.get('/purchases/:value', customerController.getCustomersByPurchases);

/**
 * @route   GET /api/v1/customers/lifetime/:value
 * @desc    Fetch customers by lifetime value (>= value)
 * @access  Public
 */
router.get('/lifetime/:value', customerController.getCustomersByLifetimeValue);

/**
 * @route   GET /api/v1/customers/credit/:value
 * @desc    Fetch customers by credit balance (>= value)
 * @access  Public
 */
router.get('/credit/:value', customerController.getCustomersByCreditBalance);

/**
 * @route   GET /api/v1/customers/churn-status/:status
 * @desc    Fetch customers using churn status
 * @access  Public
 */
router.get('/churn-status/:status', customerController.getCustomersByChurnStatus);


// --- BULK OPERATIONS ---

/**
 * @route   POST /api/v1/customers/bulk-create
 * @desc    Insert multiple customer records together
 * @access  Public
 */
router.post('/bulk-create', validateBulkCreate, validate, customerController.bulkCreateCustomers);

/**
 * @route   PATCH /api/v1/customers/bulk-update
 * @desc    Update multiple customer records together
 * @access  Public
 */
router.patch('/bulk-update', validateBulkUpdate, validate, customerController.bulkUpdateCustomers);

/**
 * @route   DELETE /api/v1/customers/bulk-delete
 * @desc    Delete multiple customer records
 * @access  Public
 */
router.delete('/bulk-delete', validateBulkDelete, validate, customerController.bulkDeleteCustomers);


// --- CORE CRUD ROUTES ---

/**
 * @route   GET /api/v1/customers
 * @desc    Fetch multiple customer records (handles filtering, sorting, pagination)
 * @access  Public
 */
router.get('/', customerController.getCustomers);

/**
 * @route   POST /api/v1/customers
 * @desc    Add a new customer record
 * @access  Public
 */
router.post('/', validateCreate, validate, customerController.createCustomer);

/**
 * @route   GET /api/v1/customers/:id
 * @desc    Fetch single customer record by ID
 * @access  Public
 */
router.get('/:id', validateId, validate, customerController.getCustomerById);

/**
 * @route   PUT /api/v1/customers/:id
 * @desc    Replace complete customer record (PUT)
 * @access  Public
 */
router.put('/:id', validateId, validate, validateCreate, validate, customerController.replaceCustomer);

/**
 * @route   PATCH /api/v1/customers/:id
 * @desc    Update specific customer fields (PATCH)
 * @access  Public
 */
router.patch('/:id', validateId, validate, validateUpdate, validate, customerController.updateCustomer);

/**
 * @route   DELETE /api/v1/customers/:id
 * @desc    Remove customer record from database (Soft delete)
 * @access  Public
 */
router.delete('/:id', validateId, validate, customerController.deleteCustomer);

module.exports = router;
