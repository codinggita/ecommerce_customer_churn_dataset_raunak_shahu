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

module.exports = {
  getTopBuyers,
  getTopLifetimeCustomers,
  getTopCreditCustomers,
  getTopEngagement,
  getTopMobileUsers,
};
