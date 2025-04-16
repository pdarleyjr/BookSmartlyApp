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

-- Update appointments table with new fields
ALTER TABLE appointments ADD COLUMN clientName TEXT;
ALTER TABLE appointments ADD COLUMN appointmentTypeId INTEGER;
ALTER TABLE appointments ADD COLUMN locationId INTEGER;
ALTER TABLE appointments ADD COLUMN assignedToUserId TEXT;
ALTER TABLE appointments ADD COLUMN price REAL;