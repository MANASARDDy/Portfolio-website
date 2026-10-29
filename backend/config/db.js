const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Create a connection pool to optimize connection reuse and handle concurrent requests
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_db',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  timezone: '+00:00', // Standardize on UTC timestamps
  charset: 'utf8mb4'
});

/**
 * Test database connectivity and verify table existence.
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Successfully connected to MySQL database: "${process.env.DB_NAME || 'portfolio_db'}"`);

    // Verify contact_messages table exists
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ? AND table_name = 'contact_messages'`,
      [process.env.DB_NAME || 'portfolio_db']
    );

    if (tables.length === 0) {
      console.warn('[Database] Warning: Table "contact_messages" not found. Auto-creating table...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('[Database] Table "contact_messages" verified/created successfully.');
    } else {
      console.log('[Database] Table "contact_messages" is ready.');
    }

    connection.release();
    return true;
  } catch (error) {
    console.error('[Database Error] Failed to connect to MySQL database:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('[Database Hint] Is your MySQL server running on port ' + (process.env.DB_PORT || 3306) + '?');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('[Database Hint] Check DB_USER and DB_PASSWORD credentials in your .env file.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`[Database Hint] Database "${process.env.DB_NAME}" does not exist. Please run schema.sql first.`);
    }
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
