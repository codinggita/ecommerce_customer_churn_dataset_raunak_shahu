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

module.exports = {
  getCustomerCount,
  getAverageAge,
  getAverageLifetimeValue,
  getAverageCreditBalance,
  getAverageOrderValue,
};
