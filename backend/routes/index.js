const express = require('express');
const router = express.Router();

// Import route modules
const customerRoutes = require('./customerRoutes');
const middlewareRoutes = require('./middlewareRoutes');

// Mount routes to API namespace
router.use('/customers', customerRoutes);
router.use('/middleware', middlewareRoutes);

module.exports = router;
