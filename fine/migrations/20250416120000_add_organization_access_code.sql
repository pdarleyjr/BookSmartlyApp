-- Add access code to organizations table
ALTER TABLE organizations ADD COLUMN accessCode TEXT;

-- Update existing organizations with random access codes
UPDATE organizations SET accessCode = substr(hex(randomblob(4)), 1, 8);