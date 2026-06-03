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
    const sort = getSortObject(req.query.sort);

    const data = await Customer.find(filter).sort(sort).skip(skip).limit(limit);
    const totalCount = await Customer.countDocuments(filter);
    const pagination = buildPaginationMetadata(totalCount, page, limit);

    return res.status(200).json({
      success: true,
      message: 'Customers search completed successfully',
      data: {
        customers: data,
        pagination
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchCustomers,
};
