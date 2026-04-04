const express = require('express');
const router  = express.Router();
const dashboardController = require('./dashboard.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');

router.use(authenticate); // all dashboard routes require login


router.get('/summary',dashboardController.getSummary);
router.get('/by-category', dashboardController.getByCategory);
router.get('/trends', dashboardController.getTrends);

// VIEWER cannot see these — actual transaction details
router.get('/recent',authorize('ADMIN', 'ANALYST','SUPER_ADMIN'),dashboardController.getRecentActivity);

module.exports = router;    