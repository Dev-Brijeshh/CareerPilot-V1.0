/**
 * Catches any request that didn't match a route above it and turns it
 * into a consistent JSON 404 instead of Express's default HTML page.
 * Must be registered after all real routes and before errorMiddleware.
 */
const notFoundMiddleware = (req, res, _next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = notFoundMiddleware;
