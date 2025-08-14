-- Migration: Add updated_at column to artifacts table
-- This provides proper tracking of when artifacts are modified

-- Add the updated_at column with default value
ALTER TABLE artifacts 
ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on any UPDATE
CREATE TRIGGER update_artifacts_updated_at 
  BEFORE UPDATE ON artifacts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Set updated_at to created_at for existing records (so they have consistent initial values)
UPDATE artifacts SET updated_at = created_at;

-- Add comment for documentation
COMMENT ON COLUMN artifacts.updated_at IS 'Automatically updated timestamp whenever the record is modified';
COMMENT ON TRIGGER update_artifacts_updated_at ON artifacts IS 'Automatically updates the updated_at column when a record is modified';