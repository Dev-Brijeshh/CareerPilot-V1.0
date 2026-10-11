const multer = require("multer");

/**
 * Centralized error handler. Anything thrown (or passed to `next`) in
 * a route/controller ends up here, either via asyncHandler or
 * Express 5's native promise-rejection forwarding.
 *
 * Recognisable error types are translated into a clean status code +
 * message; anything unrecognised falls back to a generic 500 so raw
 * stack traces are never leaked to the client.
 */
const errorMiddleware = (err, req, res, _next) => {
  console.error(err.stack || err.message);

  let statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || "Server Error";

  // Multer errors (file too large, wrong field name, etc.)
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Resume file must be 5MB or smaller"
        : err.message;
  }

  // Mongoose invalid ObjectId (e.g. /api/resumes/not-a-valid-id)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose schema validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Duplicate key (e.g. registering with an email that already exists
  // at the database level, bypassing the controller's own check)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field} already in use`;
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session expired, please log in again";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
