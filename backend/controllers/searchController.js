const ApiResponse = require('../utils/apiResponse');
const customerService = require('../services/customerService');
const { getPaginationParams, buildPaginationMetadata } = require('../utils/paginationHelper');

/**
 * Dynamic customer search matching country, city, gender, quarter, name, email, or churn status
 * @route   GET /api/v1/search/customers
 * @access  Public
 */
const searchCustomers = async (req, res, next) => {
  try {
    const q = req.query.q;
    let filter = { isDeleted: { $ne: true } };

    if (q) {
      const regex = new RegExp(q, 'i');
      const orConditions = [
        { name: regex },
        { email: regex },
        { country: regex },
        { city: regex },
        { gender: regex },
        { signupQuarter: regex }
      ];

      // Match churn status strings or codes
      if (q.toLowerCase() === 'churned' || q === '1') {
        orConditions.push({ churned: 1 });
      } else if (q.toLowerCase() === 'active' || q === '0') {
        orConditions.push({ churned: 0 });
      }

      filter.$or = orConditions;
    }

    const { page, limit, skip } = getPaginationParams(req.query);
    const sort = req.query.sort;

    const { data, totalCount } = await customerService.getCustomers(filter, sort, limit, skip);
    const pagination = buildPaginationMetadata(totalCount, page, limit);

    return ApiResponse.success(res, 'Customers search completed successfully', {
      customers: data,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchCustomers,
};
