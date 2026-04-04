const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    // Guard: result.error.errors may be undefined in edge cases
    const errors = result.error?.errors?.map((err) => ({
      field: err.path.slice(1).join('.'),
      message: err.message,
    })) || [];
    
    return next(new AppError('Validation failed', 422, errors));
  }

  // Only override if the parsed version exists
  if (result.data.body !== undefined) req.body = result.data.body;
  if (result.data.query !== undefined) req.query = result.data.query;
  if (result.data.params !== undefined) req.params = result.data.params;

  next();
};

module.exports = validate;