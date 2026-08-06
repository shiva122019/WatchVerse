const AppError = require("./AppError");

function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  let error = err;

  // If error is not an instance of AppError, wrap or format standard errors
  if (!(error instanceof AppError)) {
    // Mongoose bad ObjectId / CastError
    if (err.name === "CastError") {
      error = new AppError(`Resource not found with id of ${err.value}`, 404);
    }
    // Mongoose duplicate key error (code 11000)
    else if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "field";
      error = new AppError(`Duplicate value entered for ${field}`, 400);
    }
    // Mongoose validation error
    else if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((val) => val.message)
        .join(", ");
      error = new AppError(message, 400);
    }
    // Fallback for unexpected programming bugs
    else {
      error = new AppError(err.message || "Internal Server Error", err.statusCode || 500);
      error.isOperational = false;
    }
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

module.exports = errorHandler;
