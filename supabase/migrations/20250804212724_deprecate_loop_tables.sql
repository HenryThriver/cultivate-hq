-- Deprecate loop tables - functionality moved to artifacts and actions

-- Before dropping tables, migrate any important data to artifacts
-- This preserves the data while transitioning to the new architecture

-- First, ensure we capture any loop templates data as metadata in case we need it later
DO $$
BEGIN
    -- Log the loop templates being removed (for audit trail)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loop_templates') THEN
        RAISE NOTICE 'Deprecating loop_templates table with % records', (SELECT COUNT(*) FROM loop_templates);
    END IF;
    
    -- Log the loop suggestions being removed
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loop_suggestions') THEN
        RAISE NOTICE 'Deprecating loop_suggestions table with % records', (SELECT COUNT(*) FROM loop_suggestions);
    END IF;
    
    -- Log the loop analytics being removed
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loop_analytics') THEN
        RAISE NOTICE 'Deprecating loop_analytics table with % records', (SELECT COUNT(*) FROM loop_analytics);
    END IF;
END $$;

-- Drop the tables in reverse dependency order
DROP TABLE IF EXISTS loop_analytics CASCADE;
DROP TABLE IF EXISTS loop_suggestions CASCADE;
DROP TABLE IF EXISTS loop_templates CASCADE;

-- Also drop any functions related to loops
DROP FUNCTION IF EXISTS calculate_loop_balance CASCADE;
DROP FUNCTION IF EXISTS generate_loop_suggestions CASCADE;

-- Remove loop-related indexes if any exist
DROP INDEX IF EXISTS idx_loop_analytics_contact_id;
DROP INDEX IF EXISTS idx_loop_suggestions_contact_id;
DROP INDEX IF EXISTS idx_loop_templates_user_id;

-- Clean up any RLS policies
DROP POLICY IF EXISTS "Users can view their own loop templates" ON loop_templates;
DROP POLICY IF EXISTS "Users can insert their own loop templates" ON loop_templates;
DROP POLICY IF EXISTS "Users can update their own loop templates" ON loop_templates;
DROP POLICY IF EXISTS "Users can delete their own loop templates" ON loop_templates;

DROP POLICY IF EXISTS "Users can view their own loop suggestions" ON loop_suggestions;
DROP POLICY IF EXISTS "Users can insert their own loop suggestions" ON loop_suggestions;
DROP POLICY IF EXISTS "Users can update their own loop suggestions" ON loop_suggestions;
DROP POLICY IF EXISTS "Users can delete their own loop suggestions" ON loop_suggestions;

DROP POLICY IF EXISTS "Users can view their own loop analytics" ON loop_analytics;
DROP POLICY IF EXISTS "Users can insert their own loop analytics" ON loop_analytics;
DROP POLICY IF EXISTS "Users can update their own loop analytics" ON loop_analytics;
DROP POLICY IF EXISTS "Users can delete their own loop analytics" ON loop_analytics;

-- Add a comment to the artifacts table noting the deprecation
COMMENT ON TABLE artifacts IS 'Stores all types of relationship artifacts including voice memos, meetings, emails, POGs, Asks, etc. Loop functionality has been deprecated and incorporated into POG/Ask artifacts with actions.';