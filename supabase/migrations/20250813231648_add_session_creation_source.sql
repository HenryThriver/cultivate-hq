-- Migration: Add session_creation as allowed value for actions.created_source
-- This allows actions created during relationship building session setup to have a proper semantic label

-- Drop the existing constraint
ALTER TABLE actions DROP CONSTRAINT IF EXISTS actions_created_source_check;

-- Add the constraint with the new value included
ALTER TABLE actions ADD CONSTRAINT actions_created_source_check 
  CHECK (created_source = ANY (ARRAY[
    'manual'::text, 
    'ai_suggestion'::text, 
    'calendar_sync'::text, 
    'backup_automation'::text, 
    'artifact_processing'::text,
    'session_creation'::text
  ]));

-- Add a comment to document the new value
COMMENT ON CONSTRAINT actions_created_source_check ON actions IS 
  'Ensures created_source is one of: manual, ai_suggestion, calendar_sync, backup_automation, artifact_processing, session_creation';