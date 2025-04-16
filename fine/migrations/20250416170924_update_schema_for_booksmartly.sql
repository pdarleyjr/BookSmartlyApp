-- This migration ensures all tables are properly created for BookSmartly

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  organizationId INTEGER,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  accessCode TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create user_roles table if it doesn't exist
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

-- Create appointments table if it doesn't exist
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  clientName TEXT,
  appointmentTypeId INTEGER,
  locationId INTEGER,
  assignedToUserId TEXT,
  price REAL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_userId ON appointments(userId);
CREATE INDEX IF NOT EXISTS idx_appointments_startTime ON appointments(startTime);

-- Create appointment_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS appointment_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organizationId INTEGER,
  name TEXT NOT NULL,
  durationMinutes INTEGER NOT NULL,
  price REAL NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

-- Create locations table if it doesn't exist
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organizationId INTEGER,
  name TEXT NOT NULL,
  address TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);