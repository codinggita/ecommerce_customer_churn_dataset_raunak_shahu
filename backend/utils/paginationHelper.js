const { PAGINATION } = require('../config/constants');

/**
 * Extract and validate page, limit, and skip pagination parameters
 * @param {Object} queryParams - req.query object
 * @returns {Object} { page, limit, skip }
 */
const getPaginationParams = (queryParams) => {
  let page = parseInt(queryParams.page, 10);
  let limit = parseInt(queryParams.limit, 10);

  // If invalid page value is sent (including negative/ABC validations)
  if (isNaN(page) || page <= 0) {
    page = PAGINATION.DEFAULT_PAGE;
  }
  
  if (isNaN(limit) || limit <= 0) {
    limit = PAGINATION.DEFAULT_LIMIT;
  } else if (limit > PAGINATION.MAX_LIMIT) {
    limit = PAGINATION.MAX_LIMIT;
  }

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Build standard pagination metadata object
 * @param {Number} totalCount - Total matching records count
 * @param {Number} page - Current page index
 * @param {Number} limit - Current items limit per page
 * @returns {Object} Pagination metadata envelope
 */
const buildPaginationMetadata = (totalCount, page, limit) => {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    totalCount,
    totalPages,
    currentPage: page,
    limit,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

module.exports = {
  getPaginationParams,
  buildPaginationMetadata,
};
