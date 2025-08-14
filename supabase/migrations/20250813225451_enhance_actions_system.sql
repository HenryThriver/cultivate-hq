-- Enhanced Actions System for Relationship Building Intelligence
-- File: supabase/migrations/20250813225451_enhance_actions_system.sql
-- Purpose: Add system intelligence for relationship building sessions

-- ===============================================
-- SYSTEM ACTION TEMPLATES TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS system_action_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key TEXT UNIQUE NOT NULL,
    action_type TEXT NOT NULL,
    title_template TEXT NOT NULL,
    description_template TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    estimated_duration_minutes INTEGER DEFAULT 15,
    trigger_conditions JSONB NOT NULL DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- RELATIONSHIP HEALTH METRICS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS relationship_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
    last_interaction_date DATE,
    interaction_frequency_score INTEGER DEFAULT 0,
    reciprocity_balance DECIMAL DEFAULT 0.0,
    relationship_strength_score INTEGER DEFAULT 5,
    decay_risk_level TEXT DEFAULT 'low',
    recommended_action_types TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT relationship_health_metrics_strength_score_check 
        CHECK (relationship_strength_score BETWEEN 1 AND 10),
    CONSTRAINT relationship_health_metrics_decay_risk_check 
        CHECK (decay_risk_level IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT relationship_health_metrics_frequency_score_check 
        CHECK (interaction_frequency_score BETWEEN 0 AND 100)
);

-- ===============================================
-- ENHANCE ACTIONS TABLE
-- ===============================================

-- Add system generation fields to existing actions table
ALTER TABLE actions ADD COLUMN IF NOT EXISTS created_source TEXT DEFAULT 'manual';
ALTER TABLE actions ADD COLUMN IF NOT EXISTS system_generated BOOLEAN DEFAULT false;
ALTER TABLE actions ADD COLUMN IF NOT EXISTS template_key TEXT;
ALTER TABLE actions ADD COLUMN IF NOT EXISTS trigger_context JSONB DEFAULT '{}';
ALTER TABLE actions ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES relationship_sessions(id) ON DELETE SET NULL;

-- Update the created_source constraint to include new values
ALTER TABLE actions DROP CONSTRAINT IF EXISTS actions_created_source_check;
ALTER TABLE actions ADD CONSTRAINT actions_created_source_check 
    CHECK (created_source IN ('manual', 'ai_generated', 'calendar_sync', 'session_creation', 'system_intelligence'));

-- Update action_type constraint to include relationship session actions
ALTER TABLE actions DROP CONSTRAINT IF EXISTS actions_action_type_check;
ALTER TABLE actions ADD CONSTRAINT actions_action_type_check 
    CHECK (action_type IN (
        'send_message', 'schedule_meeting', 'make_introduction', 'send_follow_up', 
        'deliver_pog', 'follow_up_ask', 'reconnect_with_contact', 'add_meeting_notes',
        'add_contact_to_goal', 'review_goal_progress', 'reach_out_to_contact',
        'discover_new_contacts', 'strengthen_relationship'
    ));

-- ===============================================
-- ADD UPDATED_AT TO ARTIFACTS TABLE
-- ===============================================

-- Add updated_at column to artifacts table
ALTER TABLE artifacts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS update_artifacts_updated_at ON artifacts;
CREATE TRIGGER update_artifacts_updated_at
    BEFORE UPDATE ON artifacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- RLS POLICIES
-- ===============================================

-- Enable RLS on new tables
ALTER TABLE system_action_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_health_metrics ENABLE ROW LEVEL SECURITY;

-- System action templates policies (admin-readable, system-writable)
CREATE POLICY "System action templates are viewable by authenticated users" 
    ON system_action_templates FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "System action templates are manageable by service role" 
    ON system_action_templates FOR ALL 
    TO service_role 
    USING (true);

-- Relationship health metrics policies (user-owned)
CREATE POLICY "Relationship health metrics are viewable by owner" 
    ON relationship_health_metrics FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "Relationship health metrics are manageable by owner" 
    ON relationship_health_metrics FOR ALL 
    TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "Relationship health metrics are manageable by service role" 
    ON relationship_health_metrics FOR ALL 
    TO service_role 
    USING (true);

-- ===============================================
-- INDEXES FOR PERFORMANCE
-- ===============================================

-- System action templates indexes
CREATE INDEX IF NOT EXISTS idx_system_action_templates_active ON system_action_templates(active);
CREATE INDEX IF NOT EXISTS idx_system_action_templates_action_type ON system_action_templates(action_type);
CREATE INDEX IF NOT EXISTS idx_system_action_templates_template_key ON system_action_templates(template_key);

-- Relationship health metrics indexes
CREATE INDEX IF NOT EXISTS idx_relationship_health_metrics_user_id ON relationship_health_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_health_metrics_contact_id ON relationship_health_metrics(contact_id);
CREATE INDEX IF NOT EXISTS idx_relationship_health_metrics_goal_id ON relationship_health_metrics(goal_id);
CREATE INDEX IF NOT EXISTS idx_relationship_health_metrics_decay_risk ON relationship_health_metrics(decay_risk_level);
CREATE INDEX IF NOT EXISTS idx_relationship_health_metrics_last_interaction ON relationship_health_metrics(last_interaction_date);

-- Enhanced actions table indexes
CREATE INDEX IF NOT EXISTS idx_actions_created_source ON actions(created_source);
CREATE INDEX IF NOT EXISTS idx_actions_system_generated ON actions(system_generated);
CREATE INDEX IF NOT EXISTS idx_actions_template_key ON actions(template_key);
CREATE INDEX IF NOT EXISTS idx_actions_session_id ON actions(session_id);

-- ===============================================
-- SEED SYSTEM ACTION TEMPLATES
-- ===============================================

INSERT INTO system_action_templates (template_key, action_type, title_template, description_template, priority, estimated_duration_minutes, trigger_conditions) VALUES

-- Goal Health Templates
('goal_needs_contacts', 'add_contact_to_goal', 'Add New Contact to {{goal_title}}', 'Your goal "{{goal_title}}" needs more contacts. Current: {{current_count}}/{{target_count}}. Find and add a new relevant contact.', 'high', 20, '{"trigger": "goal_health", "condition": "contact_count_below_target"}'),

('goal_review', 'review_goal_progress', 'Review Progress on {{goal_title}}', 'Take 10 minutes to review your progress on "{{goal_title}}" and plan your next moves.', 'medium', 15, '{"trigger": "goal_health", "condition": "no_activity_30_days"}'),

-- Contact Relationship Templates  
('contact_reconnect', 'reconnect_with_contact', 'Reconnect with {{contact_name}}', 'It''s been a while since you connected with {{contact_name}}. Send a thoughtful message to rekindle the relationship.', 'medium', 10, '{"trigger": "relationship_decay", "condition": "no_interaction_90_days"}'),

('strengthen_relationship', 'strengthen_relationship', 'Strengthen Connection with {{contact_name}}', 'Build a stronger relationship with {{contact_name}} through meaningful engagement and value delivery.', 'medium', 15, '{"trigger": "relationship_health", "condition": "low_interaction_frequency"}'),

-- Meeting Follow-up Templates
('meeting_notes', 'add_meeting_notes', 'Add Notes for Meeting with {{contact_name}}', 'Capture key insights and action items from your recent meeting with {{contact_name}} on {{meeting_date}}.', 'high', 10, '{"trigger": "artifact_processing", "condition": "meeting_without_notes"}'),

-- Proactive Relationship Building Templates
('discover_contacts', 'discover_new_contacts', 'Discover New Contacts for {{goal_title}}', 'Research and identify potential new contacts who could help with your goal "{{goal_title}}".', 'medium', 25, '{"trigger": "goal_expansion", "condition": "goal_needs_more_contacts"}'),

('reach_out_contact', 'reach_out_to_contact', 'Reach Out to {{contact_name}}', 'Make initial contact with {{contact_name}} to explore potential collaboration opportunities.', 'medium', 15, '{"trigger": "new_contact_identified", "condition": "contact_added_to_goal"}'),

-- Best Practice Templates
('deliver_value', 'deliver_pog', 'Deliver Value to {{contact_name}}', 'Share something valuable with {{contact_name}} - an introduction, insight, or resource that could help them.', 'high', 15, '{"trigger": "reciprocity_imbalance", "condition": "received_more_than_given"}'),

('schedule_followup', 'schedule_meeting', 'Schedule Follow-up with {{contact_name}}', 'Your last interaction with {{contact_name}} went well. Schedule a follow-up meeting to continue building the relationship.', 'medium', 5, '{"trigger": "positive_interaction", "condition": "recent_successful_interaction"}'),

('send_followup', 'send_follow_up', 'Follow Up with {{contact_name}}', 'Send a thoughtful follow-up message to {{contact_name}} to maintain momentum from your recent interaction.', 'medium', 10, '{"trigger": "interaction_followup", "condition": "interaction_needs_followup"}}')

ON CONFLICT (template_key) DO UPDATE SET
    action_type = EXCLUDED.action_type,
    title_template = EXCLUDED.title_template,
    description_template = EXCLUDED.description_template,
    priority = EXCLUDED.priority,
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    trigger_conditions = EXCLUDED.trigger_conditions,
    updated_at = NOW();

-- ===============================================
-- MIGRATION COMPLETION
-- ===============================================

-- Log successful completion
DO $$
BEGIN
    RAISE NOTICE 'Enhanced actions system migration completed successfully';
    RAISE NOTICE 'Added system_action_templates table with % templates', (SELECT COUNT(*) FROM system_action_templates);
    RAISE NOTICE 'Added relationship_health_metrics table';
    RAISE NOTICE 'Enhanced actions table with system generation fields';
    RAISE NOTICE 'Added updated_at column to artifacts table with trigger';
END $$;