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

/**
 * Retrieve top discount rate users
 * @route GET /api/v1/analytics/customers/top-discount-users
 */
const getTopDiscountUsers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await analyticsService.getTopDiscountUsers(limit);
    return ApiResponse.success(res, 'Top discount rate users retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve top reviewers by productReviewsWritten
 * @route GET /api/v1/analytics/customers/top-reviewers
 */
const getTopReviewers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await analyticsService.getTopReviewers(limit);
    return ApiResponse.success(res, 'Top reviewer users retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve churn analysis aggregated metrics
 * @route GET /api/v1/analytics/customers/churn-analysis
 */
const getChurnAnalysis = async (req, res, next) => {
  try {
    const data = await analyticsService.getChurnAnalysis();
    return ApiResponse.success(res, 'Churn analysis metrics retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve retention analysis metrics
 * @route GET /api/v1/analytics/customers/retention
 */
const getRetentionAnalysis = async (req, res, next) => {
  try {
    const data = await analyticsService.getRetentionAnalysis();
    return ApiResponse.success(res, 'Retention analysis metrics retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve session analysis metrics
 * @route GET /api/v1/analytics/customers/session-analysis
 */
const getSessionAnalysis = async (req, res, next) => {
  try {
    const data = await analyticsService.getSessionAnalysis();
    return ApiResponse.success(res, 'Session analysis metrics retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve purchase analysis (AOV breakdown)
 * @route GET /api/v1/analytics/customers/purchase-analysis
 */
const getPurchaseAnalysis = async (req, res, next) => {
  try {
    const data = await analyticsService.getPurchaseAnalysis();
    return ApiResponse.success(res, 'Purchase analysis metrics retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve country aggregated analytics
 * @route GET /api/v1/analytics/customers/country-analysis
 */
const getCountryAnalysis = async (req, res, next) => {
  try {
    const data = await analyticsService.getCountryAnalysis();
    return ApiResponse.success(res, 'Country analysis metrics retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve city aggregated analytics
 * @route GET /api/v1/analytics/customers/city-analysis
 */
const getCityAnalysis = async (req, res, next) => {
  try {
    const data = await analyticsService.getCityAnalysis();
    return ApiResponse.success(res, 'City analysis metrics retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve signup trend analytics
 * @route GET /api/v1/analytics/customers/signup-analysis
 */
const getSignupAnalysis = async (req, res, next) => {
  try {
    const data = await analyticsService.getSignupAnalysis();
    return ApiResponse.success(res, 'Signup analysis metrics retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve payment diversity correlation analytics
 * @route GET /api/v1/analytics/customers/payment-analysis
 */
const getPaymentAnalysis = async (req, res, next) => {
  try {
    const data = await analyticsService.getPaymentAnalysis();
    return ApiResponse.success(res, 'Payment analysis metrics retrieved successfully', data);
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
  getTopDiscountUsers,
  getTopReviewers,
  getChurnAnalysis,
  getRetentionAnalysis,
  getSessionAnalysis,
  getPurchaseAnalysis,
  getCountryAnalysis,
  getCityAnalysis,
  getSignupAnalysis,
  getPaymentAnalysis,
};
