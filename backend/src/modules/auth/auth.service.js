const User = require('../users/user.model');
const AppError = require('../../utils/AppError');
const { generateTokenPair, generateAccessToken } = require('../../utils/generateTokens');
const jwt = require('jsonwebtoken');

const register = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered. Please log in.', 409);
  }

  const user = await User.create({ name, email, password, role });
  const tokens = generateTokenPair(user);

  // Store hashed refresh token
  user.refreshToken = tokens.refreshToken;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return { user, tokens };
};

const login = async ({ email, password }) => {
  // Explicitly select password (hidden by default)
  const user = await User.findOne({ email }).select('+password +refreshToken');

  if (!user || !(await user.comparePassword(password, user.password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (user.status === 'INACTIVE') {
    throw new AppError('Account deactivated. Contact your administrator.', 403);
  }

  const tokens = generateTokenPair(user);

  user.refreshToken = tokens.refreshToken;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return { user, tokens };
};

const refreshAccessToken = async (incomingRefreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new AppError('Refresh token reuse detected. Please log in again.', 401);
  }

  const newAccessToken = generateAccessToken({ id: user._id, email: user.email, role: user.role });
  return { accessToken: newAccessToken };
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null }, { validateBeforeSave: false });
};

module.exports = { register, login, refreshAccessToken, logout };