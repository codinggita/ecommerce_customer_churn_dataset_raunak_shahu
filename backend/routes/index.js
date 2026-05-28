const express = require('express');
const router = express.Router();

// Import route modules
const customerRoutes = require('./customerRoutes');
const middlewareRoutes = require('./middlewareRoutes');
const searchRoutes = require('./searchRoutes');
const statsRoutes = require('./statsRoutes');
const analyticsRoutes = require('./analyticsRoutes');


// Mount routes to API namespace
router.use('/customers', customerRoutes);
router.use('/middleware', middlewareRoutes);
router.use('/search', searchRoutes);
router.use('/stats', statsRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;

