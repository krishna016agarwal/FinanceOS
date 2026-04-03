const asyncHandler = require('../../utils/asyncHandler');
const sendResponse = require('../../utils/sendResponse');
const dashboardService = require('./dashboard.service');

const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary();
  sendResponse(res, { message: 'Dashboard summary', data: summary });
});

const getByCategory = asyncHandler(async (req, res) => {
  const data = await dashboardService.getByCategory();
  sendResponse(res, { message: 'Category breakdown', data });
});

const getTrends = asyncHandler(async (req, res) => {
  const period = req.query.period || 'monthly';
  const data = await dashboardService.getTrends(period);
  sendResponse(res, { message: `${period} trends`, data });
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const data = await dashboardService.getRecentActivity(limit);
  sendResponse(res, { message: 'Recent activity', data });
});

module.exports = { getSummary, getByCategory, getTrends, getRecentActivity };