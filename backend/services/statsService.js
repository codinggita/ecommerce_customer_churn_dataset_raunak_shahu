const { Customer } = require('../models');

/**
 * Get total active customer count
 */
const getCustomerCount = async () => {
  return await Customer.countDocuments({ isDeleted: { $ne: true } });
};

/**
 * Get average customer age
 */
const getAverageAge = async () => {
  const result = await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: null, averageAge: { $avg: '$age' } } }
  ]);
  return result.length > 0 ? result[0].averageAge : 0;
};

/**
 * Get average customer lifetime value
 */
const getAverageLifetimeValue = async () => {
  const result = await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: null, averageLtv: { $avg: '$lifetimeValue' } } }
  ]);
  return result.length > 0 ? result[0].averageLtv : 0;
};

/**
 * Get average customer credit balance
 */
const getAverageCreditBalance = async () => {
  const result = await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: null, averageCredit: { $avg: '$creditBalance' } } }
  ]);
  return result.length > 0 ? result[0].averageCredit : 0;
};

/**
 * Get average order value across all active customers
 */
const getAverageOrderValue = async () => {
  const result = await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: null, averageOov: { $avg: '$averageOrderValue' } } }
  ]);
  return result.length > 0 ? result[0].averageOov : 0;
};

/**
 * Get customer with the highest purchases
 */
const getHighestPurchasesCustomer = async () => {
  return await Customer.findOne({ isDeleted: { $ne: true } }).sort({ purchases: -1 });
};

/**
 * Get customer with the highest lifetime value
 */
const getHighestLifetimeCustomer = async () => {
  return await Customer.findOne({ isDeleted: { $ne: true } }).sort({ lifetimeValue: -1 });
};

/**
 * Get customer with the highest credit balance
 */
const getHighestCreditCustomer = async () => {
  return await Customer.findOne({ isDeleted: { $ne: true } }).sort({ creditBalance: -1 });
};

/**
 * Get customer counts grouped by country
 */
const getCountryCounts = async () => {
  return await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

/**
 * Get customer counts grouped by city
 */
const getCityCounts = async () => {
  return await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: '$city', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

/**
 * Get customer counts grouped by gender
 */
const getGenderCounts = async () => {
  return await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: '$gender', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

/**
 * Get customer counts grouped by churn status
 */
const getChurnCounts = async () => {
  return await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: '$churned', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

/**
 * Get customer counts grouped by signup quarter
 */
const getSignupQuarterCounts = async () => {
  return await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: '$signupQuarter', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
};

/**
 * Get total reviews written by all active customers
 */
const getTotalReviewCount = async () => {
  const result = await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: null, totalReviews: { $sum: '$productReviewsWritten' } } }
  ]);
  return result.length > 0 ? result[0].totalReviews : 0;
};

/**
 * Get average mobile usage metrics
 */
const getAverageMobileUsage = async () => {
  const result = await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: null, averageMobileUsage: { $avg: '$mobileUsage' } } }
  ]);
  return result.length > 0 ? result[0].averageMobileUsage : 0;
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
