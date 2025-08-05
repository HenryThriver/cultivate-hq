-- Add LinkedIn sync scheduling functionality

-- Create table for sync schedules
CREATE TABLE linkedin_sync_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  sync_frequency TEXT CHECK (sync_frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'manual')) DEFAULT 'weekly',
  sync_day_of_week INTEGER CHECK (sync_day_of_week >= 0 AND sync_day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  sync_time TIME DEFAULT '09:00:00'::TIME,
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, contact_id)
);

-- Create function to calculate next sync time
CREATE OR REPLACE FUNCTION calculate_next_sync_time(
  frequency TEXT,
  day_of_week INTEGER,
  sync_time TIME,
  last_sync TIMESTAMPTZ
) RETURNS TIMESTAMPTZ AS $$
DECLARE
  next_sync TIMESTAMPTZ;
  base_date DATE;
BEGIN
  -- Use current date if no last sync
  base_date := COALESCE(last_sync::DATE, CURRENT_DATE);
  
  CASE frequency
    WHEN 'daily' THEN
      next_sync := (base_date + INTERVAL '1 day')::DATE + sync_time;
    WHEN 'weekly' THEN
      -- Calculate next occurrence of the specified day of week
      next_sync := (base_date + ((7 + day_of_week - EXTRACT(DOW FROM base_date))::INTEGER % 7 + 7) * INTERVAL '1 day')::DATE + sync_time;
    WHEN 'biweekly' THEN
      next_sync := (base_date + INTERVAL '14 days')::DATE + sync_time;
    WHEN 'monthly' THEN
      next_sync := (base_date + INTERVAL '1 month')::DATE + sync_time;
    ELSE -- manual
      next_sync := NULL;
  END CASE;
  
  -- Ensure next sync is in the future
  WHILE next_sync IS NOT NULL AND next_sync <= NOW() LOOP
    CASE frequency
      WHEN 'daily' THEN
        next_sync := next_sync + INTERVAL '1 day';
      WHEN 'weekly' THEN
        next_sync := next_sync + INTERVAL '7 days';
      WHEN 'biweekly' THEN
        next_sync := next_sync + INTERVAL '14 days';
      WHEN 'monthly' THEN
        next_sync := next_sync + INTERVAL '1 month';
    END CASE;
  END LOOP;
  
  RETURN next_sync;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update next_sync_at
CREATE OR REPLACE FUNCTION update_next_sync_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.next_sync_at = calculate_next_sync_time(
    NEW.sync_frequency,
    NEW.sync_day_of_week,
    NEW.sync_time,
    NEW.last_sync_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_linkedin_sync_schedules_next_sync
  BEFORE INSERT OR UPDATE ON linkedin_sync_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_next_sync_at();

-- Add indexes
CREATE INDEX idx_linkedin_sync_schedules_user_id ON linkedin_sync_schedules(user_id);
CREATE INDEX idx_linkedin_sync_schedules_contact_id ON linkedin_sync_schedules(contact_id);
CREATE INDEX idx_linkedin_sync_schedules_next_sync ON linkedin_sync_schedules(next_sync_at) WHERE is_active = true;

-- Enable RLS
ALTER TABLE linkedin_sync_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own sync schedules" ON linkedin_sync_schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync schedules" ON linkedin_sync_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync schedules" ON linkedin_sync_schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sync schedules" ON linkedin_sync_schedules
  FOR DELETE USING (auth.uid() = user_id);

-- Add default sync schedules for existing contacts with LinkedIn URLs
INSERT INTO linkedin_sync_schedules (user_id, contact_id, sync_frequency, sync_day_of_week)
SELECT DISTINCT c.user_id, c.id, 'weekly', 1 -- Default to weekly on Mondays
FROM contacts c
WHERE c.linkedin_url IS NOT NULL
  AND c.linkedin_url != ''
  AND NOT EXISTS (
    SELECT 1 FROM linkedin_sync_schedules ls 
    WHERE ls.contact_id = c.id
  );

-- Add comment
COMMENT ON TABLE linkedin_sync_schedules IS 'Manages LinkedIn post sync schedules for contacts with configurable frequency';