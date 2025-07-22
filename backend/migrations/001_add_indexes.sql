-- backend/migrations/001_add_indexes.sql
-- This migration adds indexes to improve query performance and suggests schema changes.
-- Apply this to your existing ats_db database.
-- Example: mysql -u root -p ats_db < backend/migrations/001_add_indexes.sql

USE ats_db;

-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
-- 1. INDEXES FOR FASTER QUERIES
-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --

-- Index on `users.role` for faster role-based lookups.
ALTER TABLE `users` ADD INDEX `idx_role` (`role`);

-- Index on `candidates.name` for sorting and searching.
ALTER TABLE `candidates` ADD INDEX `idx_name` (`name`);

-- Index on `candidates.created_at` for sorting by date.
ALTER TABLE `candidates` ADD INDEX `idx_created_at` (`created_at`);

-- A FULLTEXT index on `candidates` name, email, and tags for optimized searching.
-- This replaces slow `LIKE '%...%'` queries with efficient `MATCH...AGAINST`.
ALTER TABLE `candidates` ADD FULLTEXT INDEX `ft_name_email_tags` (`name`, `email`, `tags`);

-- Index on `feedback.stage` to quickly filter feedback by stage.
-- A composite index with candidate_id is even better.
ALTER TABLE `feedback` ADD INDEX `idx_candidate_stage` (`candidate_id`, `stage`);

-- Index on `recommendations.status` to filter by status.
ALTER TABLE `recommendations` ADD INDEX `idx_candidate_status` (`candidate_id`, `status`);

-- Composite index on `notifications` for fetching a user's notifications efficiently.
-- This is ideal for "show me my unread notifications, newest first".
ALTER TABLE `notifications` ADD INDEX `idx_user_read_created` (`user_id`, `is_read`, `created_at` DESC);

-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
-- 2. (RECOMMENDED) SCHEMA IMPROVEMENT FOR TAGS
-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --

-- The current `tags` column in the `candidates` table uses a comma-separated string,
-- which is inefficient for searching and maintaining data integrity.
-- A better approach is a many-to-many relationship.

-- This is a recommendation for future improvement and is commented out by default.

/*
-- Create a table for all possible tags
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- Create a join table to link candidates and tags
CREATE TABLE IF NOT EXISTS candidate_tags (
  candidate_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (candidate_id, tag_id),
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
*/

SELECT 'Indexes and schema recommendations applied.' AS status;