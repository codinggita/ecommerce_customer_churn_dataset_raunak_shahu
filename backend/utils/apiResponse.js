class ApiResponse {
  /**
   * Send a success response
   * @param {Object} res - Express response object
   * @param {String} message - Response message
   * @param {any} data - Response payload data
   * @param {Number} statusCode - HTTP status code
   */
  static success(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Send an error response
   * @param {Object} res - Express response object
   * @param {String} message - Error description message
   * @param {any} errors - Validation errors or details
   * @param {Number} statusCode - HTTP status code
   */
  static error(res, message, errors = null, statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}

module.exports = ApiResponse;
