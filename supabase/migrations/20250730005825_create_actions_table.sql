-- Create Actions Table Migration
-- This replaces the session_actions approach with a more flexible actions system

BEGIN;

-- ===============================================
-- 1. CREATE ACTIONS TABLE
-- ===============================================

CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Action classification
  action_type TEXT NOT NULL CHECK (action_type IN (
    'deliver_pog',
    'follow_up_ask', 
    'add_meeting_notes',
    'add_contact_to_goal',
    'reconnect_with_contact',
    'review_goal',
    'schedule_meeting',
    'send_follow_up',
    'make_introduction',
    'share_content',
    'other'
  )),
  
  -- Action details
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'cancelled')),
  
  -- Relationships (all optional - an action can relate to any combination)
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  artifact_id UUID REFERENCES artifacts(id) ON DELETE SET NULL,
  session_id UUID REFERENCES relationship_sessions(id) ON DELETE SET NULL,
  
  -- Scheduling and timing
  due_date TIMESTAMPTZ,
  estimated_duration_minutes INTEGER DEFAULT 15,
  scheduled_for TIMESTAMPTZ,
  
  -- Action metadata
  action_data JSONB DEFAULT '{}',
  notes TEXT,
  
  -- Completion tracking
  completed_at TIMESTAMPTZ,
  completed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Automation fields
  created_source TEXT DEFAULT 'manual' CHECK (created_source IN ('manual', 'ai_suggestion', 'calendar_sync', 'backup_automation', 'artifact_processing')),
  recurring_pattern TEXT, -- For backup actions like "reconnect every 3 months"
  parent_action_id UUID REFERENCES actions(id) ON DELETE SET NULL, -- For follow-up chains
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===============================================
-- 2. INDEXES FOR PERFORMANCE
-- ===============================================

CREATE INDEX idx_actions_user_id ON actions(user_id);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_actions_user_status ON actions(user_id, status);
CREATE INDEX idx_actions_session_id ON actions(session_id);
CREATE INDEX idx_actions_goal_id ON actions(goal_id);
CREATE INDEX idx_actions_contact_id ON actions(contact_id);
CREATE INDEX idx_actions_artifact_id ON actions(artifact_id);
CREATE INDEX idx_actions_due_date ON actions(due_date);
CREATE INDEX idx_actions_priority ON actions(priority);
CREATE INDEX idx_actions_action_type ON actions(action_type);
CREATE INDEX idx_actions_created_source ON actions(created_source);

-- Composite indexes for common queries
CREATE INDEX idx_actions_pending_user ON actions(user_id, status, priority) WHERE status = 'pending';
CREATE INDEX idx_actions_session_assignment ON actions(user_id, status, session_id) WHERE status IN ('pending', 'in_progress');

-- ===============================================
-- 3. RLS POLICIES
-- ===============================================

ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own actions" ON actions
  FOR ALL USING (auth.uid() = user_id);

-- ===============================================
-- 4. UPDATE TRIGGERS
-- ===============================================

CREATE TRIGGER on_actions_updated
  BEFORE UPDATE ON actions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ===============================================
-- 5. COMMENTS FOR DOCUMENTATION
-- ===============================================

COMMENT ON TABLE actions IS 'Actionable items that can be completed during relationship-building sessions';
COMMENT ON COLUMN actions.action_type IS 'Type of action to be performed';
COMMENT ON COLUMN actions.goal_id IS 'Optional: Goal this action relates to';
COMMENT ON COLUMN actions.contact_id IS 'Optional: Contact this action relates to';
COMMENT ON COLUMN actions.artifact_id IS 'Optional: Artifact this action was generated from or relates to';
COMMENT ON COLUMN actions.session_id IS 'Session this action is assigned to (NULL for unassigned actions)';
COMMENT ON COLUMN actions.created_source IS 'How this action was created (manual, AI, automation, etc.)';
COMMENT ON COLUMN actions.recurring_pattern IS 'For backup actions: how often they should recur';
COMMENT ON COLUMN actions.parent_action_id IS 'For follow-up chains: the action this follows from';

-- ===============================================
-- 6. SAMPLE DATA FOR TESTING
-- ===============================================

-- Note: Sample data will be populated by seed script or manual insertion
-- This migration only creates the structure

COMMIT;