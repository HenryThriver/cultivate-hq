-- Migration to deprecate session_actions table and migrate data to actions table
-- This consolidates all actions into a single, more flexible table structure

BEGIN;

-- ===============================================
-- 1. MIGRATE EXISTING DATA FROM session_actions TO actions
-- ===============================================

-- Insert existing session_actions data into the actions table
INSERT INTO actions (
  id,
  user_id,
  action_type,
  title,
  description,
  priority,
  status,
  goal_id,
  contact_id,
  artifact_id,
  session_id,
  estimated_duration_minutes,
  action_data,
  notes,
  completed_at,
  completed_by_user_id,
  created_source,
  created_at,
  updated_at
)
SELECT 
  sa.id,
  sa.user_id,
  sa.action_type,
  CASE 
    WHEN sa.action_type = 'add_contact' THEN 'Add Contact to Goal'
    WHEN sa.action_type = 'add_meeting_notes' THEN 'Add Meeting Notes'
    WHEN sa.action_type = 'deliver_pog' THEN 'Deliver POG'
    WHEN sa.action_type = 'follow_up_ask' THEN 'Follow Up on Ask'
    ELSE INITCAP(REPLACE(sa.action_type, '_', ' '))
  END as title,
  COALESCE(
    sa.action_data->>'description',
    CASE 
      WHEN sa.action_type = 'add_contact' AND c.name IS NOT NULL THEN 
        'Add ' || c.name || ' to goal and capture strategic context'
      WHEN sa.action_type = 'add_meeting_notes' AND c.name IS NOT NULL THEN 
        'Capture insights and strategic value from meeting with ' || c.name
      ELSE 'Complete strategic relationship action'
    END
  ) as description,
  COALESCE(sa.action_data->>'priority', 'medium') as priority,
  sa.status,
  sa.goal_id,
  sa.contact_id,
  sa.meeting_artifact_id, -- This maps to artifact_id in actions table
  sa.session_id,
  COALESCE((sa.action_data->>'estimated_duration_minutes')::integer, 15) as estimated_duration_minutes,
  sa.action_data,
  sa.action_data->>'notes' as notes,
  sa.completed_at,
  CASE WHEN sa.completed_at IS NOT NULL THEN sa.user_id ELSE NULL END as completed_by_user_id,
  'session_migration' as created_source,
  sa.created_at,
  sa.updated_at
FROM session_actions sa
LEFT JOIN contacts c ON c.id = sa.contact_id
WHERE NOT EXISTS (
  -- Avoid duplicates if this migration has been run before
  SELECT 1 FROM actions a WHERE a.id = sa.id
);

-- ===============================================
-- 2. VERIFY DATA MIGRATION
-- ===============================================

-- Count records to ensure migration worked
DO $$
DECLARE
  session_actions_count INTEGER;
  migrated_actions_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO session_actions_count FROM session_actions;
  SELECT COUNT(*) INTO migrated_actions_count FROM actions WHERE created_source = 'session_migration';
  
  RAISE NOTICE 'Migrated % session_actions to actions table (% total session_actions found)', 
    migrated_actions_count, session_actions_count;
  
  IF migrated_actions_count < session_actions_count THEN
    RAISE WARNING 'Some session_actions may not have been migrated. Review before dropping table.';
  END IF;
END $$;

-- ===============================================
-- 3. UPDATE FOREIGN KEY REFERENCES
-- ===============================================

-- Note: Since we're using the same IDs, existing references should work
-- But we need to verify there are no other tables referencing session_actions

-- Check for any foreign key constraints pointing to session_actions
SELECT conname, conrelid::regclass as referencing_table
FROM pg_constraint 
WHERE confrelid = 'session_actions'::regclass 
  AND contype = 'f';

-- ===============================================
-- 4. DROP session_actions TABLE
-- ===============================================

-- Remove any dependent views first (if they exist)
-- DROP VIEW IF EXISTS session_actions_with_details;

-- Drop the session_actions table
-- Note: This will fail if there are still foreign key references
DROP TABLE IF EXISTS session_actions CASCADE;

-- ===============================================
-- 5. ADD HELPFUL INDEXES FOR ACTIONS TABLE QUERIES
-- ===============================================

-- Index for session-specific queries (replacing session_actions usage)
CREATE INDEX IF NOT EXISTS idx_actions_session_status ON actions(session_id, status) WHERE session_id IS NOT NULL;

-- Index for session actions with contact info (common join pattern)
CREATE INDEX IF NOT EXISTS idx_actions_session_contact ON actions(session_id, contact_id) WHERE session_id IS NOT NULL;

-- ===============================================
-- 6. UPDATE COMMENTS
-- ===============================================

COMMENT ON TABLE actions IS 'Unified actions table - replaces session_actions with more flexible structure';
COMMENT ON COLUMN actions.session_id IS 'Session this action is assigned to (NULL for unassigned actions) - replaces old session_actions table';

-- ===============================================
-- 7. VERIFY FINAL STATE
-- ===============================================

DO $$
DECLARE
  actions_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO actions_count FROM actions;
  RAISE NOTICE 'Migration complete. Total actions in system: %', actions_count;
END $$;

COMMIT;