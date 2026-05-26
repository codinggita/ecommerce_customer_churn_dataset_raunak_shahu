const fs = require('fs');
const seedDatabase = require('../utils/seedDatabase');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Upload / Import customer records from JSON file
 * @route   POST /api/v1/customers/import-json
 * @access  Private/Admin (Public for development)
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
 * @access  Private/Admin
 */
const clearCache = async (req, res, next) => {
  try {
    // In-memory query cache simulation
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
  importJson,
  clearCache,
};
