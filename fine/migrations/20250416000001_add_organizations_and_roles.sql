-- Create organizations table
CREATE TABLE organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Add organizationId to users table
ALTER TABLE users ADD COLUMN organizationId INTEGER;

-- Create user_roles table
CREATE TABLE user_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('super_admin', 'org_admin', 'user')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Create index for faster role lookups
CREATE INDEX idx_user_roles_userId ON user_roles(userId);

-- Insert super admin role for specified email
INSERT INTO user_roles (userId, role)
SELECT id, 'super_admin' FROM users WHERE email = 'pdarleyjr@gmail.com';