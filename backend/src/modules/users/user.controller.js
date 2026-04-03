const asyncHandler = require('../../utils/asyncHandler');
const sendResponse = require('../../utils/sendResponse');
const userService = require('./user.service');

const getAllUsers = asyncHandler(async (req, res) => {
  const { users, meta } = await userService.getAllUsers(req.query);
  sendResponse(res, { message: 'Users fetched', data: { users }, meta });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  sendResponse(res, { message: 'User fetched', data: { user } });
});

const updateRole = asyncHandler(async (req, res) => {
  const user = await userService.updateRole(req.params.id, req.body.role, req.user._id);
  sendResponse(res, { message: 'Role updated successfully', data: { user } });
});

const updateStatus = asyncHandler(async (req, res) => {
  const user = await userService.updateStatus(req.params.id, req.body.status, req.user._id);
  sendResponse(res, { message: 'Status updated successfully', data: { user } });
});

module.exports = { getAllUsers, getUserById, updateRole, updateStatus };