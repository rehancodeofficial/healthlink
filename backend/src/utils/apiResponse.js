function sendSuccess(res, data = null, message = "Operation successful", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function sendError(res, error = "An error occurred", statusCode = 500) {
  const errorMessage = typeof error === "string" ? error : error?.message || "Internal server error";
  return res.status(statusCode).json({
    success: false,
    error: errorMessage,
  });
}

module.exports = {
  sendSuccess,
  sendError,
};
