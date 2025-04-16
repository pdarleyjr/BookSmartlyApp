-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('super_admin', 'org_admin', 'user')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_userId ON user_roles(userId);

-- Insert super admin role for specified email
INSERT OR IGNORE INTO user_roles (userId, role)
SELECT id, 'super_admin' FROM users WHERE email = 'pdarleyjr@gmail.com';