function errorMiddleware(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[ERROR] ${req.method} ${req.url}:`, message);

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

module.exports = errorMiddleware;
