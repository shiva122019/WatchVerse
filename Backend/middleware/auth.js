const AppError = require("../lib/AppError");

/**
 * Authentication guard middleware.
 * Ensures the request is authenticated via Passport session.
 */
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return next(new AppError("Unauthorized. Please log in first.", 401));
}

module.exports = { isAuthenticated };
