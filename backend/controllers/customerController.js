const fs = require('fs');
const seedDatabase = require('../utils/seedDatabase');
const ApiResponse = require('../utils/apiResponse');
const customerService = require('../services/customerService');
const { buildCustomerFilter } = require('../utils/filterBuilder');
const { getPaginationParams, buildPaginationMetadata } = require('../utils/paginationHelper');

/**
 * Fetch multiple customer records (filters, pagination, sorting)
 */
const getCustomers = async (req, res, next) => {
  try {
    const filter = buildCustomerFilter(req.query);
    const { page, limit, skip } = getPaginationParams(req.query);
    const sort = req.query.sort;

    const { data, totalCount } = await customerService.getCustomers(filter, sort, limit, skip);
    const pagination = buildPaginationMetadata(totalCount, page, limit);

    return ApiResponse.success(res, 'Customers fetched successfully', {
      customers: data,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch a single customer record by ID
 */
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    
    if (!customer) {
      return ApiResponse.error(res, `Customer not found with ID: ${req.params.id}`, null, 404);
    }

    return ApiResponse.success(res, 'Customer details fetched successfully', customer);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new customer record
 */
const createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    return ApiResponse.success(res, 'Customer created successfully', customer, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Replace a customer record entirely (PUT)
 */
const replaceCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.replaceCustomer(req.params.id, req.body);
    
    if (!customer) {
      return ApiResponse.error(res, `Customer not found with ID: ${req.params.id}`, null, 404);
    }

    return ApiResponse.success(res, 'Customer record replaced successfully', customer);
  } catch (error) {
    next(error);
  }
};

/**
 * Update specific fields of a customer record (PATCH)
 */
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    
    if (!customer) {
      return ApiResponse.error(res, `Customer not found with ID: ${req.params.id}`, null, 404);
    }

    return ApiResponse.success(res, 'Customer record updated successfully', customer);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a customer record (Soft delete)
 */
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.deleteCustomer(req.params.id);
    
    if (!customer) {
      return ApiResponse.error(res, `Customer not found with ID: ${req.params.id}`, null, 404);
    }

    return ApiResponse.success(res, 'Customer record deleted successfully (soft delete)', {
      id: customer._id,
      isDeleted: customer.isDeleted,
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
    const exists = await customerService.checkCustomerExists(req.params.id);
    return ApiResponse.success(res, `Customer check: ${exists ? 'exists' : 'does not exist'}`, {
      exists,
      id: req.params.id,
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
    const created = await customerService.bulkCreateCustomers(req.body.customers);
    return ApiResponse.success(res, `Successfully created ${created.length} customers in bulk`, {
      count: created.length,
      customers: created,
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update multiple customer records together (bulk-update)
 */
const bulkUpdateCustomers = async (req, res, next) => {
  try {
    const result = await customerService.bulkUpdateCustomers(req.body);
    return ApiResponse.success(res, 'Bulk update completed successfully', {
      matchedCount: result.matchedCount || result.nMatched || 0,
      modifiedCount: result.modifiedCount || result.nModified || 0,
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
    const result = await customerService.bulkDeleteCustomers(req.body.ids);
    return ApiResponse.success(res, `Bulk delete completed: soft-deleted ${result.modifiedCount || result.nModified || 0} records`, {
      deletedCount: result.modifiedCount || result.nModified || 0,
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
    const customer = await customerService.getRandomCustomer();
    if (!customer) {
      return ApiResponse.error(res, 'No customers available in database', null, 404);
    }
    return ApiResponse.success(res, 'Random customer retrieved successfully', customer);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch customers by country with pagination
 * @route GET /api/v1/customers/country/:country
 */
const getCustomersByCountry = async (req, res, next) => {
  try {
    const { country } = req.params;
    const filter = { country: { $regex: new RegExp(`^${country}$`, 'i') }, isDeleted: { $ne: true } };
    const { page, limit, skip } = getPaginationParams(req.query);
    const sort = req.query.sort;

    const { data, totalCount } = await customerService.getCustomers(filter, sort, limit, skip);
    const pagination = buildPaginationMetadata(totalCount, page, limit);

    return ApiResponse.success(res, `Customers from country '${country}' fetched successfully`, {
      customers: data,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch customers by city with pagination
 * @route GET /api/v1/customers/city/:city
 */
const getCustomersByCity = async (req, res, next) => {
  try {
    const { city } = req.params;
    const filter = { city: { $regex: new RegExp(`^${city}$`, 'i') }, isDeleted: { $ne: true } };
    const { page, limit, skip } = getPaginationParams(req.query);
    const sort = req.query.sort;

    const { data, totalCount } = await customerService.getCustomers(filter, sort, limit, skip);
    const pagination = buildPaginationMetadata(totalCount, page, limit);

    return ApiResponse.success(res, `Customers from city '${city}' fetched successfully`, {
      customers: data,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch customers by gender with pagination
 * @route GET /api/v1/customers/gender/:gender
 */
const getCustomersByGender = async (req, res, next) => {
  try {
    const { gender } = req.params;
    const filter = { gender: { $regex: new RegExp(`^${gender}$`, 'i') }, isDeleted: { $ne: true } };
    const { page, limit, skip } = getPaginationParams(req.query);
    const sort = req.query.sort;

    const { data, totalCount } = await customerService.getCustomers(filter, sort, limit, skip);
    const pagination = buildPaginationMetadata(totalCount, page, limit);

    return ApiResponse.success(res, `Customers with gender '${gender}' fetched successfully`, {
      customers: data,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch customers by age with pagination
 * @route GET /api/v1/customers/age/:age
 */
const getCustomersByAge = async (req, res, next) => {
  try {
    const { age } = req.params;
    const ageNum = parseInt(age, 10);

    if (isNaN(ageNum)) {
      return ApiResponse.error(res, 'Invalid age value. Age must be a numeric integer.', null, 400);
    }

    const filter = { age: ageNum, isDeleted: { $ne: true } };
    const { page, limit, skip } = getPaginationParams(req.query);
    const sort = req.query.sort;

    const { data, totalCount } = await customerService.getCustomers(filter, sort, limit, skip);
    const pagination = buildPaginationMetadata(totalCount, page, limit);

    return ApiResponse.success(res, `Customers of age ${age} fetched successfully`, {
      customers: data,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch customers by signup quarter with pagination
 * @route GET /api/v1/customers/signup-quarter/:quarter
 */
const getCustomersBySignupQuarter = async (req, res, next) => {
  try {
    const { quarter } = req.params;
    const filter = { signupQuarter: { $regex: new RegExp(`^${quarter}$`, 'i') }, isDeleted: { $ne: true } };
    const { page, limit, skip } = getPaginationParams(req.query);
    const sort = req.query.sort;

    const { data, totalCount } = await customerService.getCustomers(filter, sort, limit, skip);
    const pagination = buildPaginationMetadata(totalCount, page, limit);

    return ApiResponse.success(res, `Customers registered in quarter '${quarter}' fetched successfully`, {
      customers: data,
      pagination,
    });
  } catch (error) {
    next(error);
  }
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
      return ApiResponse.error(res, 'Please upload a JSON file or provide a local filePath.', null, 400);
    }

    console.log(`Starting import from: ${filePath}`);
    const count = await seedDatabase(filePath);

    // Clean up uploaded temp file
    if (req.file && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return ApiResponse.success(res, `Successfully imported ${count} customer records from JSON.`, { count }, 201);
  } catch (error) {
    // Clean up uploaded temp file in case of error
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
    return ApiResponse.success(res, 'Application analytics query cache cleared successfully.', {
      cleared: true,
      cacheKeysRemoved: 0,
      timestamp: new Date(),
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
  importJson,
  clearCache,
};
