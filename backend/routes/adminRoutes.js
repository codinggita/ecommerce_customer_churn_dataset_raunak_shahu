const express = require('express');
const router = express.Router();
const path = require('path');
const seedDatabase = require('../utils/seedDatabase');

/**
 * @route   POST /api/v1/admin/seed
 * @desc    Seed the database with the bundled dataset (protected by admin key)
 * @access  Private (requires ADMIN_KEY header)
 */
router.post('/seed', async (req, res) => {
  try {
    // Basic protection: require a secret key
    const adminKey = req.headers['x-admin-key'];
    if (!adminKey || adminKey !== process.env.ADMIN_SEED_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or missing admin key'
      });
    }

    const datasetPath = path.join(__dirname, '../data/ecommerce_customer_churn_dataset.json');
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    res.write(`data: {"status":"started","message":"Seeding database..."}\n\n`);
    
    const totalSeeded = await seedDatabase(datasetPath);
    
    res.write(`data: {"status":"done","message":"Successfully seeded ${totalSeeded} records","total":${totalSeeded}}\n\n`);
    res.end();

  } catch (error) {
    console.error('Seed route error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

/**
 * @route   GET /api/v1/admin/status
 * @desc    Get database record count (quick status check)
 * @access  Private (requires ADMIN_KEY header)
 */
router.get('/status', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (!adminKey || adminKey !== process.env.ADMIN_SEED_KEY) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { Customer } = require('../models');
    const count = await Customer.countDocuments({ isDeleted: false });
    
    return res.json({
      success: true,
      data: { totalRecords: count }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
