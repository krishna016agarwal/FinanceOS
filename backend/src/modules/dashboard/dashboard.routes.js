const express = require('express');
const router  = express.Router();
const dashboardController = require('./dashboard.controller');
const authenticate        = require('../../middlewares/authenticate');
const authorize           = require('../../middlewares/authorize');

router.use(authenticate); // all dashboard routes require login

// VIEWER can see these — high level numbers only
router.get('/summary',     authorize('ADMIN', 'ANALYST', 'VIEWER'), dashboardController.getSummary);
router.get('/by-category', authorize('ADMIN', 'ANALYST', 'VIEWER'), dashboardController.getByCategory);
router.get('/trends',      authorize('ADMIN', 'ANALYST', 'VIEWER'), dashboardController.getTrends);

// VIEWER cannot see these — actual transaction details
router.get('/recent',      authorize('ADMIN', 'ANALYST'),           dashboardController.getRecentActivity);

module.exports = router;