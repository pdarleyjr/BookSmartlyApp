-- This migration ensures all tables are properly created with correct relationships
-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS appointment_types;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  organizationId INTEGER,
  organizationApproved BOOLEAN DEFAULT FALSE,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organizationId ON users(organizationId);

-- Create organizations table
CREATE TABLE organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  accessCode TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

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

-- Create appointments table
CREATE TABLE appointments (
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
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (appointmentTypeId) REFERENCES appointment_types(id),
  FOREIGN KEY (locationId) REFERENCES locations(id),
  FOREIGN KEY (assignedToUserId) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_appointments_userId ON appointments(userId);
CREATE INDEX idx_appointments_startTime ON appointments(startTime);
CREATE INDEX idx_appointments_appointmentTypeId ON appointments(appointmentTypeId);
CREATE INDEX idx_appointments_locationId ON appointments(locationId);
CREATE INDEX idx_appointments_assignedToUserId ON appointments(assignedToUserId);

-- Create appointment_types table
CREATE TABLE appointment_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organizationId INTEGER,
  name TEXT NOT NULL,
  durationMinutes INTEGER NOT NULL,
  price REAL NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

CREATE INDEX idx_appointment_types_organizationId ON appointment_types(organizationId);

-- Create locations table
CREATE TABLE locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organizationId INTEGER,
  name TEXT NOT NULL,
  address TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

CREATE INDEX idx_locations_organizationId ON locations(organizationId);

-- Insert super admin role for specified email if not exists
INSERT OR IGNORE INTO users (id, email, name, createdAt, updatedAt)
VALUES ('super-admin-id', 'pdarleyjr@gmail.com', 'Super Admin', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO user_roles (userId, role, createdAt, updatedAt)
VALUES ('super-admin-id', 'super_admin', datetime('now'), datetime('now'));