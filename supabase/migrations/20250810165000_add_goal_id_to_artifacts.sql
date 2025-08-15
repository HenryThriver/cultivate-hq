-- Add goal_id to artifacts table to link POGs, Asks, and other artifacts to goals
-- This enables goal-specific tracking of reciprocity and progress

-- Add goal_id column to artifacts table
ALTER TABLE artifacts 
ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES goals(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_artifacts_goal_id ON artifacts(goal_id);

-- Add composite index for goal-specific artifact queries
-- This optimizes queries like: WHERE user_id = ? AND goal_id = ?
CREATE INDEX IF NOT EXISTS idx_artifacts_user_goal 
ON artifacts(user_id, goal_id) 
WHERE goal_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN artifacts.goal_id IS 'Links artifact to a specific goal for goal-oriented tracking';
COMMENT ON INDEX idx_artifacts_user_goal IS 'Composite index for goal-specific artifact queries, filtered to non-null goal_id';

-- Similarly, add goal_id to actions table if it doesn't exist
-- (in case some actions aren't linked to goals yet)
ALTER TABLE actions 
ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES goals(id) ON DELETE SET NULL;

-- The index for actions.goal_id should already exist from the create_actions_table migration