/**
 * Custom application error class for centralized error handling.
 *
 * Throw an AppError anywhere in routes, services, or middleware and the
 * global error handler (lib/errorHandler.js) will catch it and return a
 * properly formatted JSON response with the correct HTTP status code.
 *
 * @example
 *   const AppError = require("../lib/AppError");
 *   throw new AppError("User not found", 404);
 */
class AppError extends Error {
  /**
   * @param {string} message  - Human-readable error message sent to the client.
   * @param {number} statusCode - HTTP status code (default 500).
   */
  constructor(message, statusCode = 500) {
    super(message);

    this.statusCode = statusCode;

    // Operational errors are expected (bad input, not found, unauthorized).
    // Non-operational errors are programming bugs that should log a stack trace.
    this.isOperational = true;

    // Keeps the stack trace clean — the constructor frame is excluded.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
