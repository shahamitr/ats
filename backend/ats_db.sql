-- ats_db.sql
-- Run this file in your MySQL server to set up the database and tables

CREATE DATABASE IF NOT EXISTS ats_db;
USE ats_db;

-- Users table for authentication

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'Panelist',
  enabled BOOLEAN DEFAULT TRUE
);

-- Candidates table

CREATE TABLE IF NOT EXISTS candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  resume_url VARCHAR(255),
  cv_file VARCHAR(255),
  tags VARCHAR(255),
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Competency Ratings table
CREATE TABLE IF NOT EXISTS competency_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id INT,
  communication INT,
  cultural_fit INT,
  passion INT,
  leadership INT,
  learning_agility INT,
  rated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id),
  FOREIGN KEY (rated_by) REFERENCES users(id)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id INT,
  stage VARCHAR(50),
  feedback_text TEXT,
  panel_member INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id),
  FOREIGN KEY (panel_member) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id INT,
  recommendation_text TEXT,
  status VARCHAR(50),
  recommended_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id),
  FOREIGN KEY (recommended_by) REFERENCES users(id)
);

-- Candidate Interview History table
CREATE TABLE IF NOT EXISTS candidate_interview_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id INT,
  interview_date DATE,
  interview_type VARCHAR(50), -- e.g. Screening, Technical, HR, Executive
  panel_members VARCHAR(255), -- comma-separated user IDs
  feedback TEXT,
  result VARCHAR(50), -- e.g. Selected, Rejected, On Hold
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);
