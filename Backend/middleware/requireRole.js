const AppError = require("../lib/AppError");

/**
 * Role-based authorization middleware factory.
 * @param  {...string} allowedRoles
 * @returns {Function} Express middleware
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Unauthorized. Please log in first.", 401));
    }

    const userRole = req.user.role || "member";
    if (!allowedRoles.includes(userRole)) {
      return next(
        new AppError(
          `Access denied. Requires one of the following roles: ${allowedRoles.join(", ")}`,
          403,
        ),
      );
    }

    next();
  };
}

module.exports = { requireRole };
