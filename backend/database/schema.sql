-- =============================================================================
-- Portfolio Database Schema Setup
-- Database: portfolio_db
-- Table: contact_messages
-- =============================================================================

-- 1. Create the database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS portfolio_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Switch to portfolio_db
USE portfolio_db;

-- 3. Create the contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional index for faster sorting/querying by date
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_messages(created_at);
