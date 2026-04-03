const asyncHandler = require('../../utils/asyncHandler');
const sendResponse = require('../../utils/sendResponse');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.register(req.body);

  sendResponse(res, {
    statusCode: 201,
    message: 'Account created successfully',
    data: {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.login(req.body);

  sendResponse(res, {
    statusCode: 200,
    message: 'Login successful',
    data: {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { accessToken } = await authService.refreshAccessToken(req.body.refreshToken);

  sendResponse(res, {
    statusCode: 200,
    message: 'Access token refreshed',
    data: { accessToken },
  });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);

  sendResponse(res, {
    statusCode: 200,
    message: 'Logged out successfully',
    data: null,
  });
});

const getMe = asyncHandler(async (req, res) => {
  sendResponse(res, {
    statusCode: 200,
    message: 'Profile fetched',
    data: { user: req.user },
  });
});

module.exports = { register, login, refreshToken, logout, getMe };