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

/**
 * Purchase analysis (averageOrderValue breakdown)
 */
const getPurchaseAnalysis = async () => {
  return await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $project: {
        aovTier: {
          $cond: [
            { $lt: ['$averageOrderValue', 100] },
            'Low (< 100)',
            {
              $cond: [
                { $lt: ['$averageOrderValue', 200] },
                'Medium (100-200)',
                'High (>= 200)'
              ]
            }
          ]
        },
        purchases: 1,
        lifetimeValue: 1,
        churned: 1
      }
    },
    {
      $group: {
        _id: '$aovTier',
        count: { $sum: 1 },
        averagePurchases: { $avg: '$purchases' },
        averageLifetimeValue: { $avg: '$lifetimeValue' },
        churnRate: { $avg: { $cond: [{ $eq: ['$churned', 1] }, 1, 0] } }
      }
    },
    {
      $project: {
        _id: 1,
        count: 1,
        averagePurchases: 1,
        averageLifetimeValue: 1,
        churnRate: { $multiply: ['$churnRate', 100] }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

/**
 * Country analysis (demographic purchase & churn aggregates)
 */
const getCountryAnalysis = async () => {
  return await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: '$country',
        count: { $sum: 1 },
        averageAge: { $avg: '$age' },
        averageLifetimeValue: { $avg: '$lifetimeValue' },
        averagePurchases: { $avg: '$purchases' },
        averageCustomerServiceCalls: { $avg: '$customerServiceCalls' },
        churnRate: { $avg: { $cond: [{ $eq: ['$churned', 1] }, 1, 0] } }
      }
    },
    {
      $project: {
        _id: 1,
        count: 1,
        averageAge: 1,
        averageLifetimeValue: 1,
        averagePurchases: 1,
        averageCustomerServiceCalls: 1,
        churnRate: { $multiply: ['$churnRate', 100] }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

/**
 * City analysis (demographic purchase & churn aggregates)
 */
const getCityAnalysis = async () => {
  return await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: '$city',
        count: { $sum: 1 },
        averageLifetimeValue: { $avg: '$lifetimeValue' },
        averagePurchases: { $avg: '$purchases' },
        averageOrderValue: { $avg: '$averageOrderValue' },
        churnRate: { $avg: { $cond: [{ $eq: ['$churned', 1] }, 1, 0] } }
      }
    },
    {
      $project: {
        _id: 1,
        count: 1,
        averageLifetimeValue: 1,
        averagePurchases: 1,
        averageOrderValue: 1,
        churnRate: { $multiply: ['$churnRate', 100] }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

/**
 * Signup trend analysis
 */
const getSignupAnalysis = async () => {
  return await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: '$signupQuarter',
        count: { $sum: 1 },
        totalLifetimeValue: { $sum: '$lifetimeValue' },
        totalPurchases: { $sum: '$purchases' },
        averageCreditBalance: { $avg: '$creditBalance' },
        averageMembershipYears: { $avg: '$membershipYears' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

/**
 * Payment method diversity correlation analysis
 */
const getPaymentAnalysis = async () => {
  return await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: '$paymentMethodDiversity',
        count: { $sum: 1 },
        averageLifetimeValue: { $avg: '$lifetimeValue' },
        averagePurchases: { $avg: '$purchases' },
        churnRate: { $avg: { $cond: [{ $eq: ['$churned', 1] }, 1, 0] } }
      }
    },
    {
      $project: {
        _id: 1,
        count: 1,
        averageLifetimeValue: 1,
        averagePurchases: 1,
        churnRate: { $multiply: ['$churnRate', 100] }
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
  getPurchaseAnalysis,
  getCountryAnalysis,
  getCityAnalysis,
  getSignupAnalysis,
  getPaymentAnalysis,
};
