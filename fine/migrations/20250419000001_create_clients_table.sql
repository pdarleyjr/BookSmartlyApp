CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organizationId INTEGER,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  dateOfBirth TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

-- Create indexes for better performance
CREATE INDEX idx_clients_organizationId ON clients(organizationId);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_email ON clients(email);