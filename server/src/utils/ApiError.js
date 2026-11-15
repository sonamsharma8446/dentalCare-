// Throw this anywhere in a controller or service: throw new ApiError(404, 'Product not found')
// The error handler turns it into a clean JSON response.
// `errors` is optional and holds per-field messages, e.g. { email: 'Enter a valid email address' }
export default class ApiError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
