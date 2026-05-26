const express = require('express');
const router = express.Router();

// Import route modules
const customerRoutes = require('./customerRoutes');
const middlewareRoutes = require('./middlewareRoutes');
const searchRoutes = require('./searchRoutes');
const statsRoutes = require('./statsRoutes');


// Mount routes to API namespace
router.use('/customers', customerRoutes);
router.use('/middleware', middlewareRoutes);
router.use('/search', searchRoutes);
router.use('/stats', statsRoutes);

module.exports = router;

