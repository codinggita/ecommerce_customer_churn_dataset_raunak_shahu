const jwt = require('jsonwebtoken');
const { User, Customer } = require('../models');

// Inline helper to get pagination offsets
const getPaginationParams = (queryParams) => {
  let page = parseInt(queryParams.page, 10);
  let limit = parseInt(queryParams.limit, 10);

  if (isNaN(page) || page <= 0) page = 1;
  if (isNaN(limit) || limit <= 0) {
    limit = 10;
  } else if (limit > 100) {
    limit = 100;
  }

  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// Inline helper to format pagination details
const buildPaginationMetadata = (totalCount, page, limit) => {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    totalCount,
    totalPages,
    currentPage: page,
    limit,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages
  };
};

// Inline helper to parse Mongoose sort directions
const getSortObject = (sortQuery) => {
  let sort = { createdAt: -1 };
  if (sortQuery) {
    const isDesc = sortQuery.startsWith('-');
    const field = isDesc ? sortQuery.substring(1) : sortQuery;
    sort = { [field]: isDesc ? -1 : 1 };
  }
  return sort;
};

// Helper for parsing numeric inputs safely
const parseNumber = (val) => {
  if (val === undefined || val === null || val === '') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
};

// Inline helper to compile query parameter filters
const buildCustomerFilter = (queryParams) => {
  const filter = { isDeleted: { $ne: true } };

  if (queryParams.country) filter.country = { $regex: new RegExp(`^${queryParams.country}$`, 'i') };
  if (queryParams.city) filter.city = { $regex: new RegExp(`^${queryParams.city}$`, 'i') };
  if (queryParams.gender) filter.gender = { $regex: new RegExp(`^${queryParams.gender}$`, 'i') };
  if (queryParams.signupQuarter) filter.signupQuarter = { $regex: new RegExp(`^${queryParams.signupQuarter}$`, 'i') };

  const minAge = parseNumber(queryParams.minAge);
  const maxAge = parseNumber(queryParams.maxAge);
  if (minAge !== null || maxAge !== null) {
    filter.age = {};
    if (minAge !== null) filter.age.$gte = minAge;
    if (maxAge !== null) filter.age.$lte = maxAge;
  }
  if (queryParams.age) {
    const age = parseNumber(queryParams.age);
    if (age !== null) filter.age = age;
  }

  if (queryParams.churned !== undefined && queryParams.churned !== '') {
    const churnedVal = parseNumber(queryParams.churned);
    if (churnedVal !== null) filter.churned = churnedVal;
  }

  if (queryParams.membershipYears !== undefined && queryParams.membershipYears !== '') {
    const mYears = parseNumber(queryParams.membershipYears);
    if (mYears !== null) filter.membershipYears = mYears;
  }

  if (queryParams.minPurchases !== undefined && queryParams.minPurchases !== '') {
    const minPurchases = parseNumber(queryParams.minPurchases);
    if (minPurchases !== null) filter.purchases = { $gte: minPurchases };
  }

  if (queryParams.minLifetime !== undefined && queryParams.minLifetime !== '') {
    const minLifetime = parseNumber(queryParams.minLifetime);
    if (minLifetime !== null) filter.lifetimeValue = { $gte: minLifetime };
  }

  if (queryParams.minCredit !== undefined && queryParams.minCredit !== '') {
    const minCredit = parseNumber(queryParams.minCredit);
    if (minCredit !== null) filter.creditBalance = { $gte: minCredit };
  }

  if (queryParams.minLoginFrequency !== undefined && queryParams.minLoginFrequency !== '') {
    const minLogin = parseNumber(queryParams.minLoginFrequency);
    if (minLogin !== null) filter.loginFrequency = { $gte: minLogin };
  }

  if (queryParams.minMobileUsage !== undefined && queryParams.minMobileUsage !== '') {
    const minMobile = parseNumber(queryParams.minMobileUsage);
    if (minMobile !== null) filter.mobileUsage = { $gte: minMobile };
  }

  if (queryParams.minDiscount !== undefined && queryParams.minDiscount !== '') {
    const minDiscount = parseNumber(queryParams.minDiscount);
    if (minDiscount !== null) filter.discountRate = { $gte: minDiscount };
  }

  return filter;
};

/**
 * Verify a JWT token
 * @route POST /api/v1/jwt/verify-token
 */
const verifyToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token'
      });
    }

    // Verify token inline
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret');
    const user = await User.findById(decoded.id);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        decoded,
        user
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token format or signature'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Token has expired'
      });
    }
    next(error);
  }
};

/**
 * Refresh a JWT token
 * @route POST /api/v1/jwt/refresh-token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token'
      });
    }

    // Verify token inline
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret');
    const user = await User.findById(decoded.id);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new token directly
    const newToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallbacksecret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token format or signature'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Token has expired, please log in again'
      });
    }
    next(error);
  }
};

/**
 * Fetch authenticated user's profile details using JWT
 * @route GET /api/v1/jwt/profile
 */
const getJwtProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'JWT authenticated user profile fetched successfully',
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve dashboard statistics summary using JWT
 * @route GET /api/v1/jwt/dashboard
 */
const getJwtDashboard = async (req, res, next) => {
  try {
    const totalCustomers = await Customer.countDocuments({ isDeleted: { $ne: true } });

    const avgAgeRes = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, averageAge: { $avg: '$age' } } }
    ]);
    const averageAge = avgAgeRes.length > 0 ? avgAgeRes[0].averageAge : 0;

    const avgLtvRes = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, averageLtv: { $avg: '$lifetimeValue' } } }
    ]);
    const averageLifetimeValue = avgLtvRes.length > 0 ? avgLtvRes[0].averageLtv : 0;

    const avgCreditRes = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, averageCredit: { $avg: '$creditBalance' } } }
    ]);
    const averageCreditBalance = avgCreditRes.length > 0 ? avgCreditRes[0].averageCredit : 0;

    const avgOovRes = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, averageOov: { $avg: '$averageOrderValue' } } }
    ]);
    const averageOrderValue = avgOovRes.length > 0 ? avgOovRes[0].averageOov : 0;

    const churnCounts = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$churned', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      message: 'Dashboard statistics fetched successfully',
      data: {
        totalCustomers,
        averageAge: Math.round(averageAge * 100) / 100,
        averageLifetimeValue: Math.round(averageLifetimeValue * 100) / 100,
        averageCreditBalance: Math.round(averageCreditBalance * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        churnCounts
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Guarded customer list query with filters, sorting, and pagination
 * @route GET /api/v1/jwt/private-customers
 */
const getPrivateCustomers = async (req, res, next) => {
  try {
    const filter = buildCustomerFilter(req.query);
    const { page, limit, skip } = getPaginationParams(req.query);
    const sort = getSortObject(req.query.sort);

    const data = await Customer.find(filter).sort(sort).skip(skip).limit(limit);
    const totalCount = await Customer.countDocuments(filter);
    const pagination = buildPaginationMetadata(totalCount, page, limit);

    return res.status(200).json({
      success: true,
      message: 'Guarded customer records fetched successfully',
      data: {
        customers: data,
        pagination
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Guarded statistics metrics for high-level summary
 * @route GET /api/v1/jwt/private-stats
 */
const getPrivateStats = async (req, res, next) => {
  try {
    const highestPurchases = await Customer.findOne({ isDeleted: { $ne: true } }).sort({ purchases: -1 });
    const highestLifetime = await Customer.findOne({ isDeleted: { $ne: true } }).sort({ lifetimeValue: -1 });
    const highestCredit = await Customer.findOne({ isDeleted: { $ne: true } }).sort({ creditBalance: -1 });

    const totalReviewCountRes = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, totalReviews: { $sum: '$productReviewsWritten' } } }
    ]);
    const totalReviewCount = totalReviewCountRes.length > 0 ? totalReviewCountRes[0].totalReviews : 0;

    const averageMobileUsageRes = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, averageMobileUsage: { $avg: '$mobileUsage' } } }
    ]);
    const averageMobileUsage = averageMobileUsageRes.length > 0 ? averageMobileUsageRes[0].averageMobileUsage : 0;

    return res.status(200).json({
      success: true,
      message: 'Guarded customer statistics metrics fetched successfully',
      data: {
        highestPurchasesCustomer: highestPurchases,
        highestLifetimeCustomer: highestLifetime,
        highestCreditCustomer: highestCredit,
        totalReviewCount,
        averageMobileUsage: Math.round(averageMobileUsage * 100) / 100
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin-role only test endpoint
 * @route GET /api/v1/jwt/admin
 */
const getAdminData = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Admin resource accessed successfully',
      data: {
        adminUser: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        },
        authorized: true,
        timestamp: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Insights query restricted to authorized roles
 * @route GET /api/v1/jwt/customer-insights
 */
const getCustomerInsights = async (req, res, next) => {
  try {
    const churnAnalysis = await Customer.aggregate([
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

    const retentionAnalysis = await Customer.aggregate([
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
      message: 'Customer insights analysis fetched successfully',
      data: {
        churnAnalysis,
        retentionAnalysis,
        insights: [
          'Customers with more customer service calls have a higher probability of churning.',
          'High value customer segments show higher loyalty in recent cohorts.',
          'Mobile app engagement correlates positively with overall lifetime value.'
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyToken,
  refreshToken,
  getJwtProfile,
  getJwtDashboard,
  getPrivateCustomers,
  getPrivateStats,
  getAdminData,
  getCustomerInsights
};
