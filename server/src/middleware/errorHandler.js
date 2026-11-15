import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

// Runs when no route matched the request
export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Every error in the app ends up here and is returned in one consistent shape:
// { success: false, message: "...", errors?: { field: "..." } }
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';

  if (err.name === 'CastError') {
    // e.g. an invalid MongoDB ObjectId in the URL
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.name === 'ValidationError') {
    // Mongoose schema validation failed
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  } else if (err.code === 11000) {
    // Duplicate value in a unique field (e.g. email)
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    message = `${field} already exists`;
  } else if (err.type === 'entity.parse.failed') {
    // Malformed JSON in the request body
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  const isServerError = statusCode >= 500;
  if (isServerError) console.error(err);

  res.status(statusCode).json({
    success: false,
    // Never leak internal error details to users in production
    message: isServerError && env.nodeEnv === 'production' ? 'Something went wrong' : message,
    ...(err.errors && { errors: err.errors }),
    ...(isServerError && env.nodeEnv !== 'production' && { stack: err.stack }),
  });
}
