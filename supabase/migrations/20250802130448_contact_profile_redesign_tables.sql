-- Contact Profile Redesign: Add Network Intelligence and Goal Targets
-- Migration for: contact_relationships and goal_contact_targets tables

-- =============================================
-- 1. Contact Relationships Table
-- Track connections between contacts for network intelligence
-- =============================================

CREATE TABLE contact_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_a_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  contact_b_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  
  -- Relationship metadata
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'introduced_by_me',    -- I introduced A to B
    'known_connection',    -- A and B know each other (discovered)
    'target_connection'    -- A could potentially connect me to B
  )),
  
  strength TEXT NOT NULL DEFAULT 'medium' CHECK (strength IN ('weak', 'medium', 'strong')),
  context TEXT, -- How they know each other / introduction context
  
  -- Success tracking for introductions
  introduction_date TIMESTAMPTZ,
  introduction_successful BOOLEAN, -- null = unknown, true/false = known outcome
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Prevent duplicate relationships (bidirectional constraint)
  CONSTRAINT unique_contact_relationship UNIQUE(contact_a_id, contact_b_id),
  
  -- Prevent self-relationships
  CONSTRAINT no_self_relationship CHECK (contact_a_id != contact_b_id)
);

-- Index for efficient relationship queries
CREATE INDEX idx_contact_relationships_user_contact_a ON contact_relationships(user_id, contact_a_id);
CREATE INDEX idx_contact_relationships_user_contact_b ON contact_relationships(user_id, contact_b_id);
CREATE INDEX idx_contact_relationships_type ON contact_relationships(relationship_type);

-- Enable RLS
ALTER TABLE contact_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own relationship data
CREATE POLICY "Users can manage their own contact relationships" ON contact_relationships
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- 2. Goal Contact Targets Table  
-- Track specific objectives for each contact within each goal
-- =============================================

CREATE TABLE goal_contact_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Target definition
  target_description TEXT NOT NULL, -- "Get introduction to Keith Ferrazzi"
  target_type TEXT NOT NULL CHECK (target_type IN (
    'introduction',    -- Want intro to someone specific
    'information',     -- Want specific knowledge/insights
    'opportunity',     -- Want job/business opportunity
    'exploration'      -- General relationship building
  )),
  
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'archived')),
  
  -- Success tracking
  achieved_at TIMESTAMPTZ,
  achievement_notes TEXT,
  
  -- Progress tracking
  notes TEXT, -- General notes on progress
  last_progress_update TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- One target per contact per goal
  CONSTRAINT unique_goal_contact_target UNIQUE(goal_id, contact_id)
);

-- Indexes for efficient queries
CREATE INDEX idx_goal_contact_targets_user_goal ON goal_contact_targets(user_id, goal_id);
CREATE INDEX idx_goal_contact_targets_user_contact ON goal_contact_targets(user_id, contact_id);
CREATE INDEX idx_goal_contact_targets_status ON goal_contact_targets(status);
CREATE INDEX idx_goal_contact_targets_priority ON goal_contact_targets(priority);

-- Enable RLS
ALTER TABLE goal_contact_targets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own goal targets
CREATE POLICY "Users can manage their own goal contact targets" ON goal_contact_targets
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- 3. Updated At Triggers
-- Auto-update the updated_at fields
-- =============================================

-- Contact relationships trigger
CREATE TRIGGER on_contact_relationships_updated
  BEFORE UPDATE ON contact_relationships
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Goal contact targets trigger  
CREATE TRIGGER on_goal_contact_targets_updated
  BEFORE UPDATE ON goal_contact_targets
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- =============================================
-- 4. Comments for Documentation
-- =============================================

COMMENT ON TABLE contact_relationships IS 'Tracks relationships between contacts for network intelligence and introduction management';
COMMENT ON COLUMN contact_relationships.relationship_type IS 'Type of relationship: introduced_by_me, known_connection, target_connection';
COMMENT ON COLUMN contact_relationships.strength IS 'Strength of relationship: weak, medium, strong';
COMMENT ON COLUMN contact_relationships.introduction_successful IS 'Whether introduction was successful (null=unknown)';

COMMENT ON TABLE goal_contact_targets IS 'Specific objectives for each contact within each goal';
COMMENT ON COLUMN goal_contact_targets.target_description IS 'What you want to achieve with this contact for this goal';
COMMENT ON COLUMN goal_contact_targets.target_type IS 'Type of target: introduction, information, opportunity, exploration';
COMMENT ON COLUMN goal_contact_targets.achieved_at IS 'When the target was achieved (null if still active)';