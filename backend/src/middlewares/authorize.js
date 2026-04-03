const AppError = require('../utils/AppError');

// Usage: authorize('ADMIN') or authorize('ADMIN', 'ANALYST')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authenticated.', 401));
  }

  if (!roles.includes(req.user.role)) {
    return next(
      new AppError(
        `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
        403
      )
    );
  }

  next();
};

module.exports = authorize;