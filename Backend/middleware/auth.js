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

/**
 * Admin authorization middleware.
 * Must be used AFTER isAuthenticated.
 * Returns 403 if the authenticated user is not an admin.
 */
function isAdmin(req, res, next) {
  if (!req.user) {
    return next(new AppError("Unauthorized. Please log in first.", 401));
  }
  if (req.user.role !== "admin") {
    return next(new AppError("Forbidden. Admin access required.", 403));
  }
  return next();
}

/**
 * Banned-user check middleware.
 * Rejects requests from users whose isBanned flag is true.
 * Use after isAuthenticated where needed.
 */
function checkBanned(req, res, next) {
  if (req.user && req.user.isBanned) {
    return next(
      new AppError(
        "Your account has been banned. Please contact support.",
        403,
      ),
    );
  }
  return next();
}

module.exports = { isAuthenticated, isAdmin, checkBanned };
