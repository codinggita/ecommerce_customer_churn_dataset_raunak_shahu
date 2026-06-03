const { Customer } = require('../models');

/**
 * Fetch total customer count
 * @route GET /api/v1/stats/customers/count
 */
const getCustomerCount = async (req, res, next) => {
  try {
    const count = await Customer.countDocuments({ isDeleted: { $ne: true } });
    return res.status(200).json({
      success: true,
      message: 'Total customer count fetched successfully',
      data: { count }
    });
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
    const result = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, averageAge: { $avg: '$age' } } }
    ]);
    const averageAge = result.length > 0 ? result[0].averageAge : 0;
    return res.status(200).json({
      success: true,
      message: 'Average customer age fetched successfully',
      data: {
        averageAge: Math.round(averageAge * 100) / 100
      }
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
    const result = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, averageLtv: { $avg: '$lifetimeValue' } } }
    ]);
    const averageLifetimeValue = result.length > 0 ? result[0].averageLtv : 0;
    return res.status(200).json({
      success: true,
      message: 'Average customer lifetime value fetched successfully',
      data: {
        averageLifetimeValue: Math.round(averageLifetimeValue * 100) / 100
      }
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
    const result = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, averageCredit: { $avg: '$creditBalance' } } }
    ]);
    const averageCreditBalance = result.length > 0 ? result[0].averageCredit : 0;
    return res.status(200).json({
      success: true,
      message: 'Average customer credit balance fetched successfully',
      data: {
        averageCreditBalance: Math.round(averageCreditBalance * 100) / 100
      }
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
    const result = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, averageOov: { $avg: '$averageOrderValue' } } }
    ]);
    const averageOrderValue = result.length > 0 ? result[0].averageOov : 0;
    return res.status(200).json({
      success: true,
      message: 'Average customer order value fetched successfully',
      data: {
        averageOrderValue: Math.round(averageOrderValue * 100) / 100
      }
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
    const customer = await Customer.findOne({ isDeleted: { $ne: true } }).sort({ purchases: -1 });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'No customers found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Customer with highest purchases fetched successfully',
      data: customer
    });
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
    const customer = await Customer.findOne({ isDeleted: { $ne: true } }).sort({ lifetimeValue: -1 });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'No customers found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Customer with highest lifetime value fetched successfully',
      data: customer
    });
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
    const customer = await Customer.findOne({ isDeleted: { $ne: true } }).sort({ creditBalance: -1 });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'No customers found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Customer with highest credit balance fetched successfully',
      data: customer
    });
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
    const counts = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    return res.status(200).json({
      success: true,
      message: 'Country customer counts fetched successfully',
      data: counts
    });
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
    const counts = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    return res.status(200).json({
      success: true,
      message: 'City customer counts fetched successfully',
      data: counts
    });
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
    const counts = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$gender', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    return res.status(200).json({
      success: true,
      message: 'Gender customer counts fetched successfully',
      data: counts
    });
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
    const counts = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$churned', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    return res.status(200).json({
      success: true,
      message: 'Churn status customer counts fetched successfully',
      data: counts
    });
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
    const counts = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$signupQuarter', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    return res.status(200).json({
      success: true,
      message: 'Signup quarter customer counts fetched successfully',
      data: counts
    });
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
    const result = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, totalReviews: { $sum: '$productReviewsWritten' } } }
    ]);
    const count = result.length > 0 ? result[0].totalReviews : 0;
    return res.status(200).json({
      success: true,
      message: 'Total customer review count fetched successfully',
      data: { count }
    });
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
    const result = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, averageMobileUsage: { $avg: '$mobileUsage' } } }
    ]);
    const averageMobileUsage = result.length > 0 ? result[0].averageMobileUsage : 0;
    return res.status(200).json({
      success: true,
      message: 'Average customer mobile usage fetched successfully',
      data: {
        averageMobileUsage: Math.round(averageMobileUsage * 100) / 100
      }
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
