const { Customer } = require('../models');

/**
 * Get top buyers sorted by total purchases descending
 */
const getTopBuyers = async (limit) => {
  return await Customer.find({ isDeleted: { $ne: true } })
    .sort({ purchases: -1 })
    .limit(limit);
};

/**
 * Get top customers by lifetime value (LTV)
 */
const getTopLifetimeCustomers = async (limit) => {
  return await Customer.find({ isDeleted: { $ne: true } })
    .sort({ lifetimeValue: -1 })
    .limit(limit);
};

/**
 * Get top customers by credit balance
 */
const getTopCreditCustomers = async (limit) => {
  return await Customer.find({ isDeleted: { $ne: true } })
    .sort({ creditBalance: -1 })
    .limit(limit);
};

/**
 * Get highly engaged customers based on a projected engagement score (loginFrequency * sessionDuration)
 */
const getTopEngagement = async (limit) => {
  return await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $addFields: {
        engagementScore: { $multiply: ['$loginFrequency', '$sessionDuration'] }
      }
    },
    { $sort: { engagementScore: -1 } },
    { $limit: limit }
  ]);
};

/**
 * Get top mobile app users by mobileUsage
 */
const getTopMobileUsers = async (limit) => {
  return await Customer.find({ isDeleted: { $ne: true } })
    .sort({ mobileUsage: -1 })
    .limit(limit);
};

/**
 * Get top customers by discountRate
 */
const getTopDiscountUsers = async (limit) => {
  return await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $sort: { discountRate: -1 } },
    { $limit: limit }
  ]);
};

/**
 * Get top reviewers by productReviewsWritten
 */
const getTopReviewers = async (limit) => {
  return await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $sort: { productReviewsWritten: -1 } },
    { $limit: limit }
  ]);
};

/**
 * Churn analysis aggregated metrics
 */
const getChurnAnalysis = async () => {
  return await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: '$churned',
        count: { $sum: 1 },
        averageAge: { $avg: '$age' },
        averageLifetimeValue: { $avg: '$lifetimeValue' },
        averageLoginFrequency: { $avg: '$loginFrequency' },
        averageCustomerServiceCalls: { $avg: '$customerServiceCalls' },
        averageCartAbandonmentRate: { $avg: '$cartAbandonmentRate' },
        averageDiscountRate: { $avg: '$discountRate' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

/**
 * Retention cohort analysis metrics grouped by signupQuarter
 */
const getRetentionAnalysis = async () => {
  return await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: '$signupQuarter',
        totalCustomers: { $sum: 1 },
        churnedCount: { $sum: { $cond: [{ $eq: ['$churned', 1] }, 1, 0] } },
        activeCount: { $sum: { $cond: [{ $eq: ['$churned', 0] }, 1, 0] } },
        activeRate: { $avg: { $cond: [{ $eq: ['$churned', 0] }, 1, 0] } },
        averageLifetimeValue: { $avg: '$lifetimeValue' },
        averagePurchases: { $avg: '$purchases' }
      }
    },
    {
      $project: {
        _id: 1,
        totalCustomers: 1,
        churnedCount: 1,
        activeCount: 1,
        retentionRate: { $multiply: ['$activeRate', 100] },
        averageLifetimeValue: 1,
        averagePurchases: 1
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

/**
 * Session analysis metrics grouped by membershipYears
 */
const getSessionAnalysis = async () => {
  return await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: { $floor: '$membershipYears' },
        count: { $sum: 1 },
        averageSessionDuration: { $avg: '$sessionDuration' },
        averageLoginFrequency: { $avg: '$loginFrequency' },
        averagePagesPerSession: { $avg: '$pagesPerSession' },
        averageMobileUsage: { $avg: '$mobileUsage' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
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
};
