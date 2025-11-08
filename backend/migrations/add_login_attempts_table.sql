-- Migration: Add login_attempts table for brute force protection
-- Run this if you already have an existing database

USE cooking_app;

-- Login attempts tracking (for brute force protection)
CREATE TABLE IF NOT EXISTS login_attempts (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(190) NOT NULL,
    attempts INT DEFAULT 1,
    locked_until DATETIME NULL,
    last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_locked_until (locked_until)
);

