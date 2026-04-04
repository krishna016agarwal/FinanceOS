const AppError = require('../utils/AppError');

const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists. Please use a different value.`, 409);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new AppError('Mongoose validation failed', 422, errors);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Token expired. Please log in again.', 401);

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  // Convert known Mongoose/JWT errors into AppErrors
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKeyError(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // Operational errors: safe to send details to client
 
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors || [],
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Programming errors: don't leak internals
  console.error('UNHANDLED ERROR:', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
    errors: [],
  });
};

module.exports = errorHandler;