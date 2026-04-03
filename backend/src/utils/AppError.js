class AppError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true; // marks errors we deliberately throw vs crashes
    this.errors = errors;      // field-level validation errors go here
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;