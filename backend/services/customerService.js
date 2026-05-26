const { Customer } = require('../models');

/**
 * Fetch multiple customer records with filtering, sorting, and pagination
 */
const getCustomers = async (filter, sortQuery, limit, skip) => {
  let sort = { createdAt: -1 }; // Default sort
  
  if (sortQuery) {
    const isDesc = sortQuery.startsWith('-');
    const field = isDesc ? sortQuery.substring(1) : sortQuery;
    sort = { [field]: isDesc ? -1 : 1 };
  }

  const data = await Customer.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const totalCount = await Customer.countDocuments(filter);
  
  return { data, totalCount };
};

/**
 * Fetch a single customer record by ID
 */
const getCustomerById = async (id) => {
  return await Customer.findOne({ _id: id, isDeleted: { $ne: true } });
};

/**
 * Add a new customer record
 */
const createCustomer = async (customerData) => {
  return await Customer.create(customerData);
};

/**
 * Replace complete customer record (PUT)
 */
const replaceCustomer = async (id, updateData) => {
  return await Customer.findOneAndReplace(
    { _id: id, isDeleted: { $ne: true } },
    { ...updateData, isDeleted: false },
    { new: true, runValidators: true }
  );
};

/**
 * Update specific customer fields (PATCH)
 */
const updateCustomer = async (id, updateData) => {
  return await Customer.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

/**
 * Soft delete a customer record
 */
const deleteCustomer = async (id) => {
  return await Customer.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    { $set: { isDeleted: true } },
    { new: true }
  );
};

/**
 * Check if customer exists by ID
 * @param {String} id - MongoDB ID
 * @returns {Boolean}
 */
const checkCustomerExists = async (id) => {
  const count = await Customer.countDocuments({ _id: id, isDeleted: { $ne: true } });
  return count > 0;
};

/**
 * Create multiple customer records (bulk-create)
 * @param {Array} customersData - Array of customer documents
 * @returns {Array} Created customer documents
 */
const bulkCreateCustomers = async (customersData) => {
  return await Customer.insertMany(customersData, { ordered: false });
};

/**
 * Update multiple customer records together (bulk-update)
 * Supports updating a list of individual updates or updating a common payload to multiple IDs
 */
const bulkUpdateCustomers = async (updatesPayload) => {
  const { ids, updates, list } = updatesPayload;

  // Case 1: Same update applied to multiple IDs
  if (ids && Array.isArray(ids) && updates) {
    return await Customer.updateMany(
      { _id: { $in: ids }, isDeleted: { $ne: true } },
      { $set: updates }
    );
  }

  // Case 2: Individual updates for different documents
  if (list && Array.isArray(list)) {
    const operations = list.map(item => ({
      updateOne: {
        filter: { _id: item.id, isDeleted: { $ne: true } },
        update: { $set: item.data },
      }
    }));
    return await Customer.bulkWrite(operations);
  }

  throw new Error('Invalid bulk update payload format');
};

/**
 * Soft-delete multiple customer records together (bulk-delete)
 * @param {Array} ids - Array of MongoDB IDs
 */
const bulkDeleteCustomers = async (ids) => {
  return await Customer.updateMany(
    { _id: { $in: ids }, isDeleted: { $ne: true } },
    { $set: { isDeleted: true } }
  );
};

/**
 * Retrieve a random customer document using aggregation
 * @returns {Object} Random Customer document
 */
const getRandomCustomer = async () => {
  const results = await Customer.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $sample: { size: 1 } }
  ]);
  return results.length > 0 ? results[0] : null;
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
};
