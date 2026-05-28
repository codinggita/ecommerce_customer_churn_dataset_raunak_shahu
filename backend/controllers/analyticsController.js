const ApiResponse = require('../utils/apiResponse');
const analyticsService = require('../services/analyticsService');

/**
 * Retrieve top buyers sorted by purchases count
 * @route GET /api/v1/analytics/customers/top-buyers
 */
const getTopBuyers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await analyticsService.getTopBuyers(limit);
    return ApiResponse.success(res, 'Top buyers retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve top customer records sorted by lifetime value
 * @route GET /api/v1/analytics/customers/top-lifetime
 */
const getTopLifetimeCustomers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await analyticsService.getTopLifetimeCustomers(limit);
    return ApiResponse.success(res, 'Top lifetime value customers retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve top customer records sorted by credit balance
 * @route GET /api/v1/analytics/customers/top-credit
 */
const getTopCreditCustomers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await analyticsService.getTopCreditCustomers(limit);
    return ApiResponse.success(res, 'Top credit balance customers retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve top engaged customer records based on login frequency and session duration
 * @route GET /api/v1/analytics/customers/top-engagement
 */
const getTopEngagement = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await analyticsService.getTopEngagement(limit);
    return ApiResponse.success(res, 'Top engaged customers retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve top customer records sorted by mobile app usage
 * @route GET /api/v1/analytics/customers/top-mobile-users
 */
const getTopMobileUsers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await analyticsService.getTopMobileUsers(limit);
    return ApiResponse.success(res, 'Top mobile usage users retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTopBuyers,
  getTopLifetimeCustomers,
  getTopCreditCustomers,
  getTopEngagement,
  getTopMobileUsers,
};
