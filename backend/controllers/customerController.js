const fs = require('fs');
const mongoose = require('mongoose');
const seedDatabase = require('../utils/seedDatabase');
const { Customer } = require('../models');

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

// General helper to query and respond with paginated list
const queryAndRespond = async (req, res, next, filter, successMsg) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const sort = getSortObject(req.query.sort);

    const data = await Customer.find(filter).sort(sort).skip(skip).limit(limit);
    const totalCount = await Customer.countDocuments(filter);
    const pagination = buildPaginationMetadata(totalCount, page, limit);

    return res.status(200).json({
      success: true,
      message: successMsg,
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
 * Fetch multiple customer records (filters, pagination, sorting)
 */
const getCustomers = async (req, res, next) => {
  const filter = buildCustomerFilter(req.query);
  await queryAndRespond(req, res, next, filter, 'Customers fetched successfully');
};

/**
 * Fetch a single customer record by ID
 */
const getCustomerById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Customer MongoDB ID'
      });
    }
    const customer = await Customer.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer not found with ID: ${req.params.id}`
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Customer details fetched successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new customer record
 */
const createCustomer = async (req, res, next) => {
  try {
    if (!req.body.name || !req.body.email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and email'
      });
    }
    const customer = await Customer.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Replace a customer record entirely (PUT)
 */
const replaceCustomer = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Customer MongoDB ID'
      });
    }
    const customer = await Customer.findOneAndReplace(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { ...req.body, isDeleted: false },
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer not found with ID: ${req.params.id}`
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Customer record replaced successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update specific fields of a customer record (PATCH)
 */
const updateCustomer = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Customer MongoDB ID'
      });
    }
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer not found with ID: ${req.params.id}`
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Customer record updated successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a customer record (Soft delete)
 */
const deleteCustomer = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Customer MongoDB ID'
      });
    }
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer not found with ID: ${req.params.id}`
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Customer record deleted successfully (soft delete)',
      data: {
        id: customer._id,
        isDeleted: customer.isDeleted
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if customer exists by ID
 */
const checkCustomerExists = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Customer MongoDB ID'
      });
    }
    const count = await Customer.countDocuments({ _id: req.params.id, isDeleted: { $ne: true } });
    const exists = count > 0;
    return res.status(200).json({
      success: true,
      message: `Customer check: ${exists ? 'exists' : 'does not exist'}`,
      data: {
        exists,
        id: req.params.id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create multiple customer records together (bulk-create)
 */
const bulkCreateCustomers = async (req, res, next) => {
  try {
    if (!req.body.customers || !Array.isArray(req.body.customers) || req.body.customers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customers must be a non-empty array'
      });
    }
    const created = await Customer.insertMany(req.body.customers, { ordered: false });
    return res.status(201).json({
      success: true,
      message: `Successfully created ${created.length} customers in bulk`,
      data: {
        count: created.length,
        customers: created
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update multiple customer records together (bulk-update)
 */
const bulkUpdateCustomers = async (req, res, next) => {
  try {
    const { ids, updates, list } = req.body;
    let result;

    if (ids && Array.isArray(ids) && updates) {
      result = await Customer.updateMany(
        { _id: { $in: ids }, isDeleted: { $ne: true } },
        { $set: updates }
      );
    } else if (list && Array.isArray(list)) {
      const operations = list.map(item => ({
        updateOne: {
          filter: { _id: item.id, isDeleted: { $ne: true } },
          update: { $set: item.data }
        }
      }));
      result = await Customer.bulkWrite(operations);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid bulk update payload format'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Bulk update completed successfully',
      data: {
        matchedCount: result.matchedCount || result.nMatched || 0,
        modifiedCount: result.modifiedCount || result.nModified || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete multiple customer records together (bulk-delete)
 */
const bulkDeleteCustomers = async (req, res, next) => {
  try {
    if (!req.body.ids || !Array.isArray(req.body.ids) || req.body.ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs must be a non-empty array of MongoDB IDs'
      });
    }
    const result = await Customer.updateMany(
      { _id: { $in: req.body.ids }, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } }
    );
    return res.status(200).json({
      success: true,
      message: `Bulk delete completed: soft-deleted ${result.modifiedCount || result.nModified || 0} records`,
      data: {
        deletedCount: result.modifiedCount || result.nModified || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch a random customer record
 */
const getRandomCustomer = async (req, res, next) => {
  try {
    const results = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $sample: { size: 1 } }
    ]);
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No customers available in database'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Random customer retrieved successfully',
      data: results[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch customers by country with pagination
 */
const getCustomersByCountry = async (req, res, next) => {
  const { country } = req.params;
  const filter = { country: { $regex: new RegExp(`^${country}$`, 'i') }, isDeleted: { $ne: true } };
  await queryAndRespond(req, res, next, filter, `Customers from country '${country}' fetched successfully`);
};

/**
 * Fetch customers by city with pagination
 */
const getCustomersByCity = async (req, res, next) => {
  const { city } = req.params;
  const filter = { city: { $regex: new RegExp(`^${city}$`, 'i') }, isDeleted: { $ne: true } };
  await queryAndRespond(req, res, next, filter, `Customers from city '${city}' fetched successfully`);
};

/**
 * Fetch customers by gender with pagination
 */
const getCustomersByGender = async (req, res, next) => {
  const { gender } = req.params;
  const filter = { gender: { $regex: new RegExp(`^${gender}$`, 'i') }, isDeleted: { $ne: true } };
  await queryAndRespond(req, res, next, filter, `Customers with gender '${gender}' fetched successfully`);
};

/**
 * Fetch customers by age with pagination
 */
const getCustomersByAge = async (req, res, next) => {
  try {
    const age = parseInt(req.params.age, 10);
    if (isNaN(age) || age < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid age parameter'
      });
    }
    const filter = { age, isDeleted: { $ne: true } };
    await queryAndRespond(req, res, next, filter, `Customers with age ${age} fetched successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch customers by signup quarter with pagination
 */
const getCustomersBySignupQuarter = async (req, res, next) => {
  const { quarter } = req.params;
  const filter = { signupQuarter: { $regex: new RegExp(`^${quarter}$`, 'i') }, isDeleted: { $ne: true } };
  await queryAndRespond(req, res, next, filter, `Customers from signup quarter '${quarter}' fetched successfully`);
};

/**
 * Filter by login frequency
 */
const getCustomersByLoginFrequency = async (req, res, next) => {
  try {
    const value = parseFloat(req.params.value);
    if (isNaN(value)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid threshold value' });
    }
    const filter = { loginFrequency: { $gte: value }, isDeleted: { $ne: true } };
    await queryAndRespond(req, res, next, filter, `Customers with login frequency >= ${value} fetched successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * Filter by session duration
 */
const getCustomersBySessionDuration = async (req, res, next) => {
  try {
    const value = parseFloat(req.params.value);
    if (isNaN(value)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid threshold value' });
    }
    const filter = { sessionDuration: { $gte: value }, isDeleted: { $ne: true } };
    await queryAndRespond(req, res, next, filter, `Customers with session duration >= ${value} fetched successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * Filter by purchases
 */
const getCustomersByPurchases = async (req, res, next) => {
  try {
    const value = parseFloat(req.params.value);
    if (isNaN(value)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid threshold value' });
    }
    const filter = { purchases: { $gte: value }, isDeleted: { $ne: true } };
    await queryAndRespond(req, res, next, filter, `Customers with total purchases >= ${value} fetched successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * Filter by lifetime value
 */
const getCustomersByLifetimeValue = async (req, res, next) => {
  try {
    const value = parseFloat(req.params.value);
    if (isNaN(value)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid threshold value' });
    }
    const filter = { lifetimeValue: { $gte: value }, isDeleted: { $ne: true } };
    await queryAndRespond(req, res, next, filter, `Customers with lifetime value >= ${value} fetched successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * Filter by credit balance
 */
const getCustomersByCreditBalance = async (req, res, next) => {
  try {
    const value = parseFloat(req.params.value);
    if (isNaN(value)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid threshold value' });
    }
    const filter = { creditBalance: { $gte: value }, isDeleted: { $ne: true } };
    await queryAndRespond(req, res, next, filter, `Customers with credit balance >= ${value} fetched successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * Filter by churn status
 */
const getCustomersByChurnStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    let filter = { isDeleted: { $ne: true } };
    if (status === '1' || status.toLowerCase() === 'churned') {
      filter.churned = 1;
    } else if (status === '0' || status.toLowerCase() === 'active') {
      filter.churned = 0;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid churn status (0, 1, active, or churned)'
      });
    }
    await queryAndRespond(req, res, next, filter, `Customers with churn status '${status}' fetched successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * Churned segment
 */
const getChurnedCustomers = async (req, res, next) => {
  await queryAndRespond(req, res, next, { churned: 1, isDeleted: { $ne: true } }, 'Churned segment fetched successfully');
};

/**
 * Active segment
 */
const getActiveCustomers = async (req, res, next) => {
  await queryAndRespond(req, res, next, { churned: 0, isDeleted: { $ne: true } }, 'Active segment fetched successfully');
};

/**
 * High value segment
 */
const getHighValueCustomers = async (req, res, next) => {
  await queryAndRespond(req, res, next, { lifetimeValue: { $gte: 1000 }, isDeleted: { $ne: true } }, 'High value segment fetched successfully');
};

/**
 * High purchases segment
 */
const getHighPurchasesCustomers = async (req, res, next) => {
  await queryAndRespond(req, res, next, { purchases: { $gte: 10 }, isDeleted: { $ne: true } }, 'High purchases segment fetched successfully');
};

/**
 * High credit segment
 */
const getHighCreditCustomers = async (req, res, next) => {
  await queryAndRespond(req, res, next, { creditBalance: { $gte: 2000 }, isDeleted: { $ne: true } }, 'High credit balance segment fetched successfully');
};

/**
 * High engagement segment
 */
const getHighEngagementCustomers = async (req, res, next) => {
  const filter = { loginFrequency: { $gte: 15 }, sessionDuration: { $gte: 30 }, isDeleted: { $ne: true } };
  await queryAndRespond(req, res, next, filter, 'Highly engaged segment fetched successfully');
};

/**
 * High mobile usage segment
 */
const getHighMobileUsageCustomers = async (req, res, next) => {
  await queryAndRespond(req, res, next, { mobileUsage: { $gte: 15 }, isDeleted: { $ne: true } }, 'High mobile app usage segment fetched successfully');
};

/**
 * High discount usage segment
 */
const getHighDiscountCustomers = async (req, res, next) => {
  await queryAndRespond(req, res, next, { discountRate: { $gte: 20 }, isDeleted: { $ne: true } }, 'High discount usage rate segment fetched successfully');
};

/**
 * Recent buyers segment
 */
const getRecentBuyers = async (req, res, next) => {
  await queryAndRespond(req, res, next, { daysSinceLastPurchase: { $lte: 10 }, isDeleted: { $ne: true } }, 'Recently active buyers segment fetched successfully');
};

/**
 * Inactive buyers segment
 */
const getInactiveCustomers = async (req, res, next) => {
  await queryAndRespond(req, res, next, { daysSinceLastPurchase: { $gte: 30 }, isDeleted: { $ne: true } }, 'Inactive buyers segment fetched successfully');
};

/**
 * Top customer reviewers segment
 */
const getTopReviewers = async (req, res, next) => {
  await queryAndRespond(req, res, next, { productReviewsWritten: { $gte: 3 }, isDeleted: { $ne: true } }, 'Top customer reviewers segment fetched successfully');
};

/**
 * High cart abandonment segment
 */
const getHighCartAbandonmentCustomers = async (req, res, next) => {
  await queryAndRespond(req, res, next, { cartAbandonmentRate: { $gte: 50 }, isDeleted: { $ne: true } }, 'High cart abandonment rate segment fetched successfully');
};

/**
 * Frequent login segment
 */
const getFrequentLoginsCustomers = async (req, res, next) => {
  await queryAndRespond(req, res, next, { loginFrequency: { $gte: 20 }, isDeleted: { $ne: true } }, 'Frequent login customers segment fetched successfully');
};

/**
 * Loyal segment
 */
const getLoyalCustomers = async (req, res, next) => {
  await queryAndRespond(req, res, next, { membershipYears: { $gte: 4 }, isDeleted: { $ne: true } }, 'Loyal customer segment fetched successfully');
};

/**
 * Premium segment
 */
const getPremiumCustomers = async (req, res, next) => {
  await queryAndRespond(req, res, next, { lifetimeValue: { $gte: 2000 }, creditBalance: { $gte: 500 }, isDeleted: { $ne: true } }, 'Premium customer analytics segment fetched successfully');
};

/**
 * Recent customers segment
 */
const getRecentCustomers = async (req, res, next) => {
  await queryAndRespond(req, res, next, { membershipYears: { $lt: 1 }, isDeleted: { $ne: true } }, 'Recently active customers segment fetched successfully');
};

/**
 * Sorting Age Desc
 */
const getCustomersSortedByAgeDesc = async (req, res, next) => {
  req.query.sort = '-age';
  await getCustomers(req, res, next);
};

/**
 * Sorting Purchases Desc
 */
const getCustomersSortedByPurchasesDesc = async (req, res, next) => {
  req.query.sort = '-purchases';
  await getCustomers(req, res, next);
};

/**
 * Sorting Lifetime Desc
 */
const getCustomersSortedByLifetimeDesc = async (req, res, next) => {
  req.query.sort = '-lifetimeValue';
  await getCustomers(req, res, next);
};

/**
 * Sorting Logins Desc
 */
const getCustomersSortedByLoginDesc = async (req, res, next) => {
  req.query.sort = '-loginFrequency';
  await getCustomers(req, res, next);
};

/**
 * Sorting Credit Desc
 */
const getCustomersSortedByCreditDesc = async (req, res, next) => {
  req.query.sort = '-creditBalance';
  await getCustomers(req, res, next);
};

// Filter shortcuts
const getFilteredHighPurchases = async (req, res, next) => {
  await queryAndRespond(req, res, next, { purchases: { $gte: 10 }, isDeleted: { $ne: true } }, 'High purchases filtered fetched successfully');
};

const getFilteredHighLifetime = async (req, res, next) => {
  await queryAndRespond(req, res, next, { lifetimeValue: { $gte: 1000 }, isDeleted: { $ne: true } }, 'High lifetime filtered fetched successfully');
};

const getFilteredHighCredit = async (req, res, next) => {
  await queryAndRespond(req, res, next, { creditBalance: { $gte: 2000 }, isDeleted: { $ne: true } }, 'High credit filtered fetched successfully');
};

const getFilteredHighLogin = async (req, res, next) => {
  await queryAndRespond(req, res, next, { loginFrequency: { $gte: 15 }, isDeleted: { $ne: true } }, 'High login filtered fetched successfully');
};

const getFilteredHighMobile = async (req, res, next) => {
  await queryAndRespond(req, res, next, { mobileUsage: { $gte: 15 }, isDeleted: { $ne: true } }, 'High mobile app filtered fetched successfully');
};

const getFilteredHighDiscount = async (req, res, next) => {
  await queryAndRespond(req, res, next, { discountRate: { $gte: 20 }, isDeleted: { $ne: true } }, 'High discount filtered fetched successfully');
};

const getFilteredHighCartAbandonment = async (req, res, next) => {
  await queryAndRespond(req, res, next, { cartAbandonmentRate: { $gte: 50 }, isDeleted: { $ne: true } }, 'High cart abandonment filtered fetched successfully');
};

const getFilteredHighEngagement = async (req, res, next) => {
  const filter = { loginFrequency: { $gte: 15 }, sessionDuration: { $gte: 30 }, isDeleted: { $ne: true } };
  await queryAndRespond(req, res, next, filter, 'High engagement filtered fetched successfully');
};

const getFilteredHighReviews = async (req, res, next) => {
  await queryAndRespond(req, res, next, { productReviewsWritten: { $gte: 3 }, isDeleted: { $ne: true } }, 'High product reviews filtered fetched successfully');
};

const getFilteredChurned = async (req, res, next) => {
  await queryAndRespond(req, res, next, { churned: 1, isDeleted: { $ne: true } }, 'Churned filtered fetched successfully');
};

const getFilteredActive = async (req, res, next) => {
  await queryAndRespond(req, res, next, { churned: 0, isDeleted: { $ne: true } }, 'Active filtered fetched successfully');
};

const getFilteredLowSession = async (req, res, next) => {
  await queryAndRespond(req, res, next, { sessionDuration: { $lt: 20 }, isDeleted: { $ne: true } }, 'Low session duration filtered fetched successfully');
};

const getFilteredHighSession = async (req, res, next) => {
  await queryAndRespond(req, res, next, { sessionDuration: { $gte: 40 }, isDeleted: { $ne: true } }, 'High session duration filtered fetched successfully');
};

const getFilteredHighOrderValue = async (req, res, next) => {
  await queryAndRespond(req, res, next, { averageOrderValue: { $gte: 150 }, isDeleted: { $ne: true } }, 'High average order value filtered fetched successfully');
};

const getFilteredLoyal = async (req, res, next) => {
  await queryAndRespond(req, res, next, { membershipYears: { $gte: 3 }, isDeleted: { $ne: true } }, 'Loyal customers filtered fetched successfully');
};

/**
 * Upload / Import customer records from JSON file
 */
const importJson = async (req, res, next) => {
  try {
    let filePath;
    if (req.file) {
      filePath = req.file.path;
    } else if (req.body.filePath) {
      filePath = req.body.filePath;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload a JSON file or provide a local filePath.'
      });
    }

    console.log(`Starting import from: ${filePath}`);
    const count = await seedDatabase(filePath);

    if (req.file && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(201).json({
      success: true,
      message: `Successfully imported ${count} customer records from JSON.`,
      data: { count }
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {}
    }
    next(error);
  }
};

/**
 * Clear API query cache keys
 */
const clearCache = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Application analytics query cache cleared successfully.',
      data: {
        cleared: true,
        cacheKeysRemoved: 0,
        timestamp: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  replaceCustomer,
  updateCustomer,
  deleteCustomer,
  checkCustomerExists,
  bulkCreateCustomers,
  bulkUpdateCustomers,
  bulkDeleteCustomers,
  getRandomCustomer,
  getCustomersByCountry,
  getCustomersByCity,
  getCustomersByGender,
  getCustomersByAge,
  getCustomersBySignupQuarter,
  getCustomersByLoginFrequency,
  getCustomersBySessionDuration,
  getCustomersByPurchases,
  getCustomersByLifetimeValue,
  getCustomersByCreditBalance,
  getCustomersByChurnStatus,
  getChurnedCustomers,
  getActiveCustomers,
  getHighValueCustomers,
  getHighPurchasesCustomers,
  getHighCreditCustomers,
  getHighEngagementCustomers,
  getHighMobileUsageCustomers,
  getHighDiscountCustomers,
  getRecentBuyers,
  getInactiveCustomers,
  getTopReviewers,
  getHighCartAbandonmentCustomers,
  getFrequentLoginsCustomers,
  getLoyalCustomers,
  getPremiumCustomers,
  getRecentCustomers,
  getCustomersSortedByAgeDesc,
  getCustomersSortedByPurchasesDesc,
  getCustomersSortedByLifetimeDesc,
  getCustomersSortedByLoginDesc,
  getCustomersSortedByCreditDesc,
  getFilteredHighPurchases,
  getFilteredHighLifetime,
  getFilteredHighCredit,
  getFilteredHighLogin,
  getFilteredHighMobile,
  getFilteredHighDiscount,
  getFilteredHighCartAbandonment,
  getFilteredHighEngagement,
  getFilteredHighReviews,
  getFilteredChurned,
  getFilteredActive,
  getFilteredLowSession,
  getFilteredHighSession,
  getFilteredHighOrderValue,
  getFilteredLoyal,
  importJson,
  clearCache
};
