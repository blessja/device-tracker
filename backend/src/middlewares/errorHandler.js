class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Wrong MongoDB ID
  if (err.name === "CastError") {
    err.message = "Invalid ID format";
    err.statusCode = 400;
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err.message = `${field} already exists`;
    err.statusCode = 409;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    err.message = "Invalid token";
    err.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    err.message = "Token has expired";
    err.statusCode = 401;
  }

  console.error(`[ERROR] ${err.statusCode}: ${err.message}`);

  res.status(err.statusCode).json({
    success: false,
    error: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, AppError, asyncHandler };
