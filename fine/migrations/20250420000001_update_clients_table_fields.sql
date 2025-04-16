-- Add additional fields to clients table for enhanced CSV import
ALTER TABLE clients ADD COLUMN cellPhone TEXT;
ALTER TABLE clients ADD COLUMN workPhone TEXT;
ALTER TABLE clients ADD COLUMN fax TEXT;
ALTER TABLE clients ADD COLUMN city TEXT;
ALTER TABLE clients ADD COLUMN state TEXT;
ALTER TABLE clients ADD COLUMN zipCode TEXT;
ALTER TABLE clients ADD COLUMN country TEXT;
ALTER TABLE clients ADD COLUMN gender TEXT;
ALTER TABLE clients ADD COLUMN occupation TEXT;
ALTER TABLE clients ADD COLUMN company TEXT;
ALTER TABLE clients ADD COLUMN referredBy TEXT;
ALTER TABLE clients ADD COLUMN emergencyContact TEXT;
ALTER TABLE clients ADD COLUMN emergencyPhone TEXT;
ALTER TABLE clients ADD COLUMN insuranceProvider TEXT;
ALTER TABLE clients ADD COLUMN insuranceId TEXT;