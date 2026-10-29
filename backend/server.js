const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const { testConnection, pool } = require('./config/db');
const { verifyEmailConfig, CONTACT_RECEIVER } = require('./config/emailConfig');
const contactRoutes = require('./routes/contactRoutes');
const { getHealthStatus } = require('./controllers/contactController');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Load environment variables from .env (path relative to this file)
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================================================
// 1. SECURITY & CORE MIDDLEWARES
// =============================================================================

// Secure HTTP response headers
app.use(helmet());

// Configure Cross-Origin Resource Sharing (CORS)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman, file://)
    if (!origin || origin === 'null') {
      return callback(null, true);
    }
    // In development, or if the origin is explicitly listed
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: Origin ${origin} not permitted.`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true
}));

// Request body parsers with safe payload limits
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));

// Simple request logger for monitoring API traffic
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// =============================================================================
// 2. API ENDPOINTS
// =============================================================================

// Serve static frontend files (allows browsing the portfolio at http://localhost:5000)
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API overview endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Manasa Reddy Portfolio API',
    endpoints: {
      health: 'GET /api/health',
      contactPost: 'POST /api/contact',
      contactGet: 'GET /api/contact (Admin)'
    }
  });
});

// GET /api/health - Health check endpoint
app.get('/api/health', getHealthStatus);

// Mount Contact routes at /api/contact
app.use('/api/contact', contactRoutes);

// =============================================================================
// 3. ERROR HANDLING & 404
// =============================================================================

// Catch-all for undefined endpoints
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

// =============================================================================
// 4. SERVER INITIALIZATION & DATABASE CHECK
// =============================================================================

async function startServer() {
  console.log('----------------------------------------------------');
  console.log('Starting Personal Portfolio Backend Service...');
  console.log('Environment:', process.env.NODE_ENV || 'development');

  // Verify database connectivity
  const isDbReady = await testConnection();
  if (!isDbReady) {
    console.warn('⚠️  Warning: MySQL connection could not be established immediately.');
    console.warn('    The server will still run and retry connections on requests.');
  }

  // Check email transport configuration
  await verifyEmailConfig();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Portfolio API server is running on http://localhost:${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   Contact Endpoint: http://localhost:${PORT}/api/contact`);
    console.log('----------------------------------------------------');
  });

  // Graceful shutdown handling
  function handleGracefulShutdown(signal) {
    console.log(`\n[Process] Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('[Process] HTTP server closed.');
      try {
        await pool.end();
        console.log('[Database] MySQL connection pool closed.');
      } catch (poolErr) {
        console.error('[Database] Error closing pool:', poolErr.message);
      }
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
}

startServer();

module.exports = app;
