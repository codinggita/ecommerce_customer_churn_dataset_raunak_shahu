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

module.exports = {
  getCustomerCount,
  getAverageAge,
  getAverageLifetimeValue,
  getAverageCreditBalance,
  getAverageOrderValue,
};
