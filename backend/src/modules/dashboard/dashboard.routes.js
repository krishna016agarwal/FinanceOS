const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');

router.use(authenticate);
router.use(authorize('ADMIN', 'ANALYST'));

router.get('/summary', dashboardController.getSummary);
router.get('/by-category', dashboardController.getByCategory);
router.get('/trends', dashboardController.getTrends);
router.get('/recent', dashboardController.getRecentActivity);

module.exports = router;