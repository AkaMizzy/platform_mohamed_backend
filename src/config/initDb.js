import mysql from "mysql2/promise";
import pool from "./db.js";

export async function ensureDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.end();
}

export async function ensureSchema() {
  await pool.query(`
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    ALTER TABLE lectures ADD COLUMN IF NOT EXISTS thumbnail_path VARCHAR(500) NULL AFTER file_size
  `);

  await pool.query(`
    ALTER TABLE lectures MODIFY COLUMN description LONGTEXT NULL
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      content_type ENUM('text', 'file') NOT NULL,
      content_text LONGTEXT NULL,
      file_path VARCHAR(500) NULL,
      file_original_name VARCHAR(255) NULL,
      file_mime_type VARCHAR(150) NULL,
      file_size INT UNSIGNED NULL,
      thumbnail_path VARCHAR(500) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    ALTER TABLE articles MODIFY COLUMN description TEXT NULL
  `);

  await pool.query(`
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS file_size INT UNSIGNED NULL AFTER file_mime_type
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`references\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      source_type ENUM('file', 'link') NOT NULL,
      link_url VARCHAR(1000) NULL,
      file_path VARCHAR(500) NULL,
      file_original_name VARCHAR(255) NULL,
      file_mime_type VARCHAR(150) NULL,
      file_size INT UNSIGNED NULL,
      thumbnail_path VARCHAR(500) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    ALTER TABLE \`references\` MODIFY COLUMN description LONGTEXT NULL
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS opinions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content LONGTEXT NOT NULL,
      category ENUM('legal', 'social', 'educational', 'cultural', 'technology', 'public_affairs') NOT NULL,
      topic VARCHAR(255) NULL,
      cover_image_path VARCHAR(500) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`ALTER TABLE opinions DROP COLUMN IF EXISTS excerpt`);
  await pool.query(`ALTER TABLE opinions DROP COLUMN IF EXISTS is_featured`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type ENUM('consultation', 'guidance') NOT NULL,
      sender_name VARCHAR(255) NOT NULL,
      sender_email VARCHAR(255) NULL,
      specialty VARCHAR(255) NULL,
      study_level VARCHAR(100) NULL,
      subject VARCHAR(500) NULL,
      question TEXT NOT NULL,
      answer TEXT NULL,
      is_published TINYINT(1) NOT NULL DEFAULT 0,
      status ENUM('pending', 'answered') NOT NULL DEFAULT 'pending',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      answered_at DATETIME NULL DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    ALTER TABLE questions MODIFY COLUMN answer LONGTEXT NULL
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS about_profile (
      id INT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      title VARCHAR(500) NOT NULL,
      short_bio TEXT NOT NULL,
      full_bio LONGTEXT NOT NULL,
      academic_career LONGTEXT NOT NULL,
      positions LONGTEXT NOT NULL,
      research_interests LONGTEXT NOT NULL,
      contributions LONGTEXT NOT NULL,
      contact_email VARCHAR(255) NOT NULL,
      contact_phone VARCHAR(100) NOT NULL,
      contact_address VARCHAR(500) NOT NULL,
      social_facebook VARCHAR(500) NULL,
      social_twitter VARCHAR(500) NULL,
      social_youtube VARCHAR(500) NULL,
      social_linkedin VARCHAR(500) NULL,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS content_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      content_type ENUM('article', 'opinion', 'reference', 'consultation', 'medical_guidance') NOT NULL,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      excerpt TEXT NULL,
      content_html LONGTEXT NOT NULL,
      status ENUM('draft', 'scheduled', 'published', 'archived') NOT NULL DEFAULT 'draft',
      category VARCHAR(255) NULL,
      tags LONGTEXT NULL,
      author_id INT NULL,
      author_name VARCHAR(255) NOT NULL,
      publication_date DATETIME NULL,
      scheduled_at DATETIME NULL,
      featured_image_url VARCHAR(1000) NULL,
      featured_image_alt VARCHAR(500) NULL,
      featured_image_caption TEXT NULL,
      seo_title VARCHAR(255) NULL,
      seo_description VARCHAR(500) NULL,
      template_key VARCHAR(100) NULL,
      dynamic_fields LONGTEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_content_entries_status (status),
      INDEX idx_content_entries_type (content_type),
      INDEX idx_content_entries_publication_date (publication_date),
      CONSTRAINT fk_content_entries_author
        FOREIGN KEY (author_id) REFERENCES users(id)
        ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}
