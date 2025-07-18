-- Demo users for ats_db
USE ats_db;

INSERT INTO users (email, password, name) VALUES
  ('admin@demo.com', 'admin123', 'Admin User'),
  ('recruiter@demo.com', 'recruiter123', 'Recruiter User'),
  ('panelist@demo.com', 'panelist123', 'Panelist User'),
  ('hr@demo.com', 'hr123', 'HR Manager User');

-- Add roles column if needed
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'Panelist';

UPDATE users SET role = 'Admin' WHERE email = 'admin@demo.com';
UPDATE users SET role = 'Recruiter' WHERE email = 'recruiter@demo.com';
UPDATE users SET role = 'Panelist' WHERE email = 'panelist@demo.com';
UPDATE users SET role = 'HR Manager' WHERE email = 'hr@demo.com';
