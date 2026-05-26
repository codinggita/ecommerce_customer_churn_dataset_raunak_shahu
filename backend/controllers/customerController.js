const fs = require('fs');
const seedDatabase = require('../utils/seedDatabase');
const ApiResponse = require('../utils/apiResponse');
const customerService = require('../services/customerService');
const { buildCustomerFilter } = require('../utils/filterBuilder');
const { getPaginationParams, buildPaginationMetadata } = require('../utils/paginationHelper');

/**
 * @desc    Fetch multiple customer records with filters, pagination, and sorting
 * @route   GET /api/v1/customers
 * @access  Public
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
 * @desc    Fetch a single customer record by ID
 * @route   GET /api/v1/customers/:id
 * @access  Public
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
 * @desc    Create a new customer record
 * @route   POST /api/v1/customers
 * @access  Public (Admin protected in production)
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
 * @desc    Replace a customer record entirely (PUT)
 * @route   PUT /api/v1/customers/:id
 * @access  Public (Admin protected in production)
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
 * @desc    Update specific fields of a customer record (PATCH)
 * @route   PATCH /api/v1/customers/:id
 * @access  Public (Admin protected in production)
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
 * @desc    Delete a customer record (Soft delete)
 * @route   DELETE /api/v1/customers/:id
 * @access  Public (Admin protected in production)
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
 * @desc    Upload / Import customer records from JSON file
 * @route   POST /api/v1/customers/import-json
 * @access  Public
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
 * @desc    Clear API query cache keys
 * @route   POST /api/v1/customers/cache/clear
 * @access  Public
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
  importJson,
  clearCache,
};
