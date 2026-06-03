const { Customer } = require('../models');

/**
 * Retrieve top buyers sorted by purchases count
 * @route GET /api/v1/analytics/customers/top-buyers
 */
const getTopBuyers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await Customer.find({ isDeleted: { $ne: true } })
      .sort({ purchases: -1 })
      .limit(limit);
    return res.status(200).json({
      success: true,
      message: 'Top buyers retrieved successfully',
      data
    });
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
    const data = await Customer.find({ isDeleted: { $ne: true } })
      .sort({ lifetimeValue: -1 })
      .limit(limit);
    return res.status(200).json({
      success: true,
      message: 'Top lifetime value customers retrieved successfully',
      data
    });
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
    const data = await Customer.find({ isDeleted: { $ne: true } })
      .sort({ creditBalance: -1 })
      .limit(limit);
    return res.status(200).json({
      success: true,
      message: 'Top credit balance customers retrieved successfully',
      data
    });
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
    const data = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $addFields: {
          engagementScore: { $multiply: ['$loginFrequency', '$sessionDuration'] }
        }
      },
      { $sort: { engagementScore: -1 } },
      { $limit: limit }
    ]);
    return res.status(200).json({
      success: true,
      message: 'Top engaged customers retrieved successfully',
      data
    });
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
    const data = await Customer.find({ isDeleted: { $ne: true } })
      .sort({ mobileUsage: -1 })
      .limit(limit);
    return res.status(200).json({
      success: true,
      message: 'Top mobile usage users retrieved successfully',
      data
    });
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
    const data = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $sort: { discountRate: -1 } },
      { $limit: limit }
    ]);
    return res.status(200).json({
      success: true,
      message: 'Top discount rate users retrieved successfully',
      data
    });
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
    const data = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $sort: { productReviewsWritten: -1 } },
      { $limit: limit }
    ]);
    return res.status(200).json({
      success: true,
      message: 'Top reviewer users retrieved successfully',
      data
    });
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
    const data = await Customer.aggregate([
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
    return res.status(200).json({
      success: true,
      message: 'Churn analysis metrics retrieved successfully',
      data
    });
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
    const data = await Customer.aggregate([
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
    return res.status(200).json({
      success: true,
      message: 'Retention analysis metrics retrieved successfully',
      data
    });
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
    const data = await Customer.aggregate([
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
    return res.status(200).json({
      success: true,
      message: 'Session analysis metrics retrieved successfully',
      data
    });
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
    const data = await Customer.aggregate([
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
    return res.status(200).json({
      success: true,
      message: 'Purchase analysis metrics retrieved successfully',
      data
    });
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
    const data = await Customer.aggregate([
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
    return res.status(200).json({
      success: true,
      message: 'Country analysis metrics retrieved successfully',
      data
    });
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
    const data = await Customer.aggregate([
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
    return res.status(200).json({
      success: true,
      message: 'City analysis metrics retrieved successfully',
      data
    });
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
    const data = await Customer.aggregate([
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
    return res.status(200).json({
      success: true,
      message: 'Signup analysis metrics retrieved successfully',
      data
    });
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
    const data = await Customer.aggregate([
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
    return res.status(200).json({
      success: true,
      message: 'Payment analysis metrics retrieved successfully',
      data
    });
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
