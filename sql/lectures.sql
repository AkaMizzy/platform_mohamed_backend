-- Reference schema for the `lectures` table.
-- The server creates this automatically on startup (see src/config/initDb.js);
-- this file is kept for documentation / manual phpMyAdmin import if ever needed.

CREATE DATABASE IF NOT EXISTS `lafrikhi_platform`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `lafrikhi_platform`;

CREATE TABLE IF NOT EXISTS lectures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  youtube_url VARCHAR(500) NULL,
  youtube_id VARCHAR(50) NULL,
  location VARCHAR(255) NULL,
  file_path VARCHAR(500) NULL,
  file_original_name VARCHAR(255) NULL,
  file_mime_type VARCHAR(150) NULL,
  file_size INT UNSIGNED NULL,
  thumbnail_path VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
