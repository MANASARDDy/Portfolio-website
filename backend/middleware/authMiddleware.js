const crypto = require('crypto');

/**
 * Authentication middleware for administrative endpoints.
 * Validates request header against the configured ADMIN_API_KEY using timing-safe comparison.
 */
function requireAdminAuth(req, res, next) {
  const configuredKey = process.env.ADMIN_API_KEY;

  if (!configuredKey) {
    console.error('[Security Warning] ADMIN_API_KEY is not defined in environment variables.');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: Administrative authentication is not configured.'
    });
  }

  // Check either 'x-api-key' or 'Authorization: Bearer <token>'
  let providedKey = req.header('x-api-key');

  if (!providedKey) {
    const authHeader = req.header('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      providedKey = authHeader.substring(7).trim();
    }
  }

  if (!providedKey) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please provide a valid admin API key via the "x-api-key" or "Authorization: Bearer" header.'
    });
  }

  // Timing-safe comparison to prevent timing attacks
  const keyBuffer = Buffer.from(providedKey);
  const targetBuffer = Buffer.from(configuredKey);

  const isMatch =
    keyBuffer.length === targetBuffer.length &&
    crypto.timingSafeEqual(keyBuffer, targetBuffer);

  if (!isMatch) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Invalid administrative credentials.'
    });
  }

  next();
}

module.exports = {
  requireAdminAuth
};
