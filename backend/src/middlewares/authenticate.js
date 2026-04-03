const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../modules/users/user.model');

const authenticate = asyncHandler(async (req, res, next) => {
  // 1. Pull token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Access token missing. Please log in.', 401);
  }

  const token = authHeader.split(' ')[1];

  // 2. Verify signature and expiry
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Access token expired. Please refresh.', 401);
    }
    throw new AppError('Invalid access token.', 401);
  }

  // 3. Confirm user still exists and is active
  const user = await User.findById(decoded.id).select('-password -refreshToken');

  if (!user) {
    throw new AppError('User no longer exists.', 401);
  }

  if (user.status === 'INACTIVE') {
    throw new AppError('Your account has been deactivated. Contact admin.', 403);
  }

  // 4. Attach to request — available in all downstream middleware
  req.user = user;
  next();
});

module.exports = authenticate;