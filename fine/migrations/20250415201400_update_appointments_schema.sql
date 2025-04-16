-- Update appointments table to ensure PostgreSQL compatibility
ALTER TABLE appointments 
  ALTER COLUMN id TYPE SERIAL,
  ALTER COLUMN userId TYPE TEXT NOT NULL,
  ALTER COLUMN title TYPE TEXT NOT NULL,
  ALTER COLUMN description TYPE TEXT,
  ALTER COLUMN location TYPE TEXT,
  ALTER COLUMN startTime TYPE TIMESTAMP NOT NULL,
  ALTER COLUMN endTime TYPE TIMESTAMP NOT NULL,
  ALTER COLUMN createdAt TYPE TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN updatedAt TYPE TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add index for faster queries by userId
CREATE INDEX IF NOT EXISTS idx_appointments_userId ON appointments(userId);

-- Add index for faster date range queries
CREATE INDEX IF NOT EXISTS idx_appointments_startTime ON appointments(startTime);