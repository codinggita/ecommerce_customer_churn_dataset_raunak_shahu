const jwt = require('jsonwebtoken');
const { User } = require('../models');
const customerService = require('../services/customerService');
const statsService = require('../services/statsService');
const analyticsService = require('../services/analyticsService');
const { buildCustomerFilter } = require('../utils/filterBuilder');
const { getPaginationParams, buildPaginationMetadata } = require('../utils/paginationHelper');

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
    const totalCustomers = await statsService.getCustomerCount();
    const averageAge = await statsService.getAverageAge();
    const averageLifetimeValue = await statsService.getAverageLifetimeValue();
    const averageCreditBalance = await statsService.getAverageCreditBalance();
    const averageOrderValue = await statsService.getAverageOrderValue();
    const churnCounts = await statsService.getChurnCounts();

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
    const sort = req.query.sort;

    const { data, totalCount } = await customerService.getCustomers(filter, sort, limit, skip);
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
    const highestPurchases = await statsService.getHighestPurchasesCustomer();
    const highestLifetime = await statsService.getHighestLifetimeCustomer();
    const highestCredit = await statsService.getHighestCreditCustomer();
    const totalReviewCount = await statsService.getTotalReviewCount();
    const averageMobileUsage = await statsService.getAverageMobileUsage();

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
    const churnAnalysis = await analyticsService.getChurnAnalysis();
    const retentionAnalysis = await analyticsService.getRetentionAnalysis();

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
