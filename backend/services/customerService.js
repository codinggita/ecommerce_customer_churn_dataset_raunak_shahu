const { Customer } = require('../models');

/**
 * Fetch multiple customer records with filtering, sorting, and pagination
 * @param {Object} filter - MongoDB query filter object
 * @param {String} sortQuery - Sort field name (prepend '-' for desc)
 * @param {Number} limit - Number of records to return
 * @param {Number} skip - Number of records to skip
 * @returns {Object} { data, totalCount }
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
 * @param {String} id - Customer MongoDB ID
 * @returns {Object} Customer document
 */
const getCustomerById = async (id) => {
  return await Customer.findOne({ _id: id, isDeleted: { $ne: true } });
};

/**
 * Add a new customer record
 * @param {Object} customerData - Customer model data
 * @returns {Object} Created Customer document
 */
const createCustomer = async (customerData) => {
  return await Customer.create(customerData);
};

/**
 * Replace complete customer record (PUT)
 * @param {String} id - Customer MongoDB ID
 * @param {Object} updateData - Replacement data
 * @returns {Object} Replaced Customer document
 */
const replaceCustomer = async (id, updateData) => {
  // overwrite: true replaces the document while preserving _id
  return await Customer.findOneAndReplace(
    { _id: id, isDeleted: { $ne: true } },
    { ...updateData, isDeleted: false },
    { new: true, runValidators: true }
  );
};

/**
 * Update specific customer fields (PATCH)
 * @param {String} id - Customer MongoDB ID
 * @param {Object} updateData - Partial update fields
 * @returns {Object} Updated Customer document
 */
const updateCustomer = async (id, updateData) => {
  return await Customer.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

/**
 * Soft delete a customer record by setting isDeleted: true
 * @param {String} id - Customer MongoDB ID
 * @returns {Object} Soft-deleted Customer document
 */
const deleteCustomer = async (id) => {
  return await Customer.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    { $set: { isDeleted: true } },
    { new: true }
  );
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  replaceCustomer,
  updateCustomer,
  deleteCustomer,
};
