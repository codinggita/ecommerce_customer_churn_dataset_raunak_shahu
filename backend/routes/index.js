const express = require('express');
const router = express.Router();

// Import route modules
const customerRoutes = require('./customerRoutes');
const middlewareRoutes = require('./middlewareRoutes');
const searchRoutes = require('./searchRoutes');
const statsRoutes = require('./statsRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const authRoutes = require('./authRoutes');
const jwtRoutes = require('./jwtRoutes');
const adminRoutes = require('./adminRoutes');


// Mount routes to API namespace
router.use('/customers', customerRoutes);
router.use('/middleware', middlewareRoutes);
router.use('/search', searchRoutes);
router.use('/stats', statsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/auth', authRoutes);
router.use('/jwt', jwtRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
