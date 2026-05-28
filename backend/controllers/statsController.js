const ApiResponse = require('../utils/apiResponse');
const statsService = require('../services/statsService');

/**
 * Fetch total customer count
 * @route GET /api/v1/stats/customers/count
 */
const getCustomerCount = async (req, res, next) => {
  try {
    const count = await statsService.getCustomerCount();
    return ApiResponse.success(res, 'Total customer count fetched successfully', { count });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch average customer age
 * @route GET /api/v1/stats/customers/average-age
 */
const getAverageAge = async (req, res, next) => {
  try {
    const averageAge = await statsService.getAverageAge();
    return ApiResponse.success(res, 'Average customer age fetched successfully', { 
      averageAge: Math.round(averageAge * 100) / 100 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch average customer lifetime value (LTV)
 * @route GET /api/v1/stats/customers/average-lifetime
 */
const getAverageLifetimeValue = async (req, res, next) => {
  try {
    const averageLifetimeValue = await statsService.getAverageLifetimeValue();
    return ApiResponse.success(res, 'Average customer lifetime value fetched successfully', { 
      averageLifetimeValue: Math.round(averageLifetimeValue * 100) / 100 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch average customer credit balance
 * @route GET /api/v1/stats/customers/average-credit
 */
const getAverageCreditBalance = async (req, res, next) => {
  try {
    const averageCreditBalance = await statsService.getAverageCreditBalance();
    return ApiResponse.success(res, 'Average customer credit balance fetched successfully', { 
      averageCreditBalance: Math.round(averageCreditBalance * 100) / 100 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch average order value (AOV)
 * @route GET /api/v1/stats/customers/average-order-value
 */
const getAverageOrderValue = async (req, res, next) => {
  try {
    const averageOrderValue = await statsService.getAverageOrderValue();
    return ApiResponse.success(res, 'Average customer order value fetched successfully', { 
      averageOrderValue: Math.round(averageOrderValue * 100) / 100 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch customer with the highest purchases
 * @route GET /api/v1/stats/customers/highest-purchases
 */
const getHighestPurchasesCustomer = async (req, res, next) => {
  try {
    const customer = await statsService.getHighestPurchasesCustomer();
    if (!customer) {
      return ApiResponse.error(res, 'No customers found', null, 404);
    }
    return ApiResponse.success(res, 'Customer with highest purchases fetched successfully', customer);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch customer with the highest lifetime value
 * @route GET /api/v1/stats/customers/highest-lifetime
 */
const getHighestLifetimeCustomer = async (req, res, next) => {
  try {
    const customer = await statsService.getHighestLifetimeCustomer();
    if (!customer) {
      return ApiResponse.error(res, 'No customers found', null, 404);
    }
    return ApiResponse.success(res, 'Customer with highest lifetime value fetched successfully', customer);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch customer with the highest credit balance
 * @route GET /api/v1/stats/customers/highest-credit
 */
const getHighestCreditCustomer = async (req, res, next) => {
  try {
    const customer = await statsService.getHighestCreditCustomer();
    if (!customer) {
      return ApiResponse.error(res, 'No customers found', null, 404);
    }
    return ApiResponse.success(res, 'Customer with highest credit balance fetched successfully', customer);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch customer counts grouped by country
 * @route GET /api/v1/stats/customers/country-count
 */
const getCountryCounts = async (req, res, next) => {
  try {
    const counts = await statsService.getCountryCounts();
    return ApiResponse.success(res, 'Country customer counts fetched successfully', counts);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch customer counts grouped by city
 * @route GET /api/v1/stats/customers/city-count
 */
const getCityCounts = async (req, res, next) => {
  try {
    const counts = await statsService.getCityCounts();
    return ApiResponse.success(res, 'City customer counts fetched successfully', counts);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch customer counts grouped by gender
 * @route GET /api/v1/stats/customers/gender-count
 */
const getGenderCounts = async (req, res, next) => {
  try {
    const counts = await statsService.getGenderCounts();
    return ApiResponse.success(res, 'Gender customer counts fetched successfully', counts);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch customer counts grouped by churn status
 * @route GET /api/v1/stats/customers/churn-count
 */
const getChurnCounts = async (req, res, next) => {
  try {
    const counts = await statsService.getChurnCounts();
    return ApiResponse.success(res, 'Churn status customer counts fetched successfully', counts);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch customer counts grouped by signup quarter
 * @route GET /api/v1/stats/customers/signup-quarter-count
 */
const getSignupQuarterCounts = async (req, res, next) => {
  try {
    const counts = await statsService.getSignupQuarterCounts();
    return ApiResponse.success(res, 'Signup quarter customer counts fetched successfully', counts);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch total review count across all active customers
 * @route GET /api/v1/stats/customers/review-count
 */
const getTotalReviewCount = async (req, res, next) => {
  try {
    const count = await statsService.getTotalReviewCount();
    return ApiResponse.success(res, 'Total customer review count fetched successfully', { count });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch average mobile usage metric
 * @route GET /api/v1/stats/customers/mobile-usage
 */
const getAverageMobileUsage = async (req, res, next) => {
  try {
    const averageMobileUsage = await statsService.getAverageMobileUsage();
    return ApiResponse.success(res, 'Average customer mobile usage fetched successfully', { 
      averageMobileUsage: Math.round(averageMobileUsage * 100) / 100 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomerCount,
  getAverageAge,
  getAverageLifetimeValue,
  getAverageCreditBalance,
  getAverageOrderValue,
  getHighestPurchasesCustomer,
  getHighestLifetimeCustomer,
  getHighestCreditCustomer,
  getCountryCounts,
  getCityCounts,
  getGenderCounts,
  getChurnCounts,
  getSignupQuarterCounts,
  getTotalReviewCount,
  getAverageMobileUsage,
};
