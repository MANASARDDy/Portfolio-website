/**
 * 404 Handler for undefined API endpoints
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
}

/**
 * Centralized Error Handling Middleware
 * Formats errors consistently and protects sensitive technical information.
 */
function errorHandler(err, req, res, next) {
  // Log internal error for debugging
  console.error('[Error Details]:', {
    message: err.message,
    code: err.code,
    status: err.status || 500,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Handle invalid JSON body in incoming requests
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload received in request body.'
    });
  }

  // Handle Database Connection Errors
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({
      success: false,
      message: 'Database service is temporarily unavailable. Please try again shortly.'
    });
  }

  // Handle MySQL Access Denied / Bad DB errors safely
  if (err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'ER_BAD_DB_ERROR') {
    return res.status(500).json({
      success: false,
      message: 'Database service configuration error. Please contact the administrator.'
    });
  }

  // Handle Payload Too Large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request payload exceeds the allowed size limit.'
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const clientMessage = statusCode === 500
    ? 'An unexpected error occurred on the server. Please try again later.'
    : err.message;

  res.status(statusCode).json({
    success: false,
    message: clientMessage
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
