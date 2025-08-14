-- Migration: Enhance Actions System for Relationship Building Sessions
-- Phase 1.1: Database Schema Enhancements

-- Create table for system action templates
CREATE TABLE IF NOT EXISTS system_action_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  action_type TEXT NOT NULL,
  title_template TEXT NOT NULL,
  description_template TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_duration_minutes INTEGER DEFAULT 15,
  trigger_conditions JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_system_action_templates_active ON system_action_templates(active);
CREATE INDEX idx_system_action_templates_template_key ON system_action_templates(template_key);
CREATE INDEX idx_system_action_templates_action_type ON system_action_templates(action_type);

-- Extend actions table with new columns
ALTER TABLE actions 
ADD COLUMN IF NOT EXISTS recurrence_rule TEXT,
ADD COLUMN IF NOT EXISTS generation_trigger TEXT,
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES system_action_templates(id),
ADD COLUMN IF NOT EXISTS context_metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS system_generated BOOLEAN DEFAULT false;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_actions_template_id ON actions(template_id);
CREATE INDEX IF NOT EXISTS idx_actions_system_generated ON actions(system_generated);
CREATE INDEX IF NOT EXISTS idx_actions_generation_trigger ON actions(generation_trigger);

-- Create table for tracking action generation history
CREATE TABLE IF NOT EXISTS action_generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  actions_generated INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for history tracking
CREATE INDEX idx_action_generation_history_user_id ON action_generation_history(user_id);
CREATE INDEX idx_action_generation_history_goal_id ON action_generation_history(goal_id);
CREATE INDEX idx_action_generation_history_trigger_type ON action_generation_history(trigger_type);
CREATE INDEX idx_action_generation_history_created_at ON action_generation_history(created_at DESC);

-- Create table for relationship health metrics
CREATE TABLE IF NOT EXISTS relationship_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  last_interaction_date TIMESTAMPTZ,
  interaction_frequency_days INTEGER,
  total_interactions INTEGER DEFAULT 0,
  pogs_given INTEGER DEFAULT 0,
  asks_made INTEGER DEFAULT 0,
  pogs_received INTEGER DEFAULT 0,
  asks_received INTEGER DEFAULT 0,
  reciprocity_balance NUMERIC(3,2) DEFAULT 0,
  relationship_strength TEXT CHECK (relationship_strength IN ('strong', 'moderate', 'weak', 'dormant')),
  calculated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, contact_id)
);

-- Add indexes for health metrics
CREATE INDEX idx_relationship_health_metrics_user_contact ON relationship_health_metrics(user_id, contact_id);
CREATE INDEX idx_relationship_health_metrics_strength ON relationship_health_metrics(relationship_strength);
CREATE INDEX idx_relationship_health_metrics_last_interaction ON relationship_health_metrics(last_interaction_date);

-- Insert initial system action templates
INSERT INTO system_action_templates (template_key, action_type, title_template, description_template, priority, estimated_duration_minutes, trigger_conditions, active) VALUES
  ('monthly_goal_review', 'review_goal', 'Monthly Review: {goal_title}', 'Assess progress, refine strategy, identify next contacts', 'high', 30, '{"schedule": "first_monday_of_month"}', true),
  ('contact_discovery', 'add_contacts', 'Add 5 strategic contacts to {goal_title}', 'Identify and add professionals who can help advance this goal', 'medium', 25, '{"condition": "contact_count < target * 0.5"}', true),
  ('dormant_reconnection', 'reconnect', 'Reconnect with {contact_name}', 'It''s been {days_since} days - share value or check in', 'low', 15, '{"condition": "last_interaction > 90_days"}', true),
  ('weekly_goal_check', 'review_goal', 'Weekly check-in: {goal_title}', 'Quick progress review and priority adjustment', 'medium', 15, '{"schedule": "weekly"}', true),
  ('reciprocity_balance_pog', 'send_pog', 'Send value to {contact_name}', 'Balance the relationship by sharing something valuable', 'medium', 20, '{"condition": "reciprocity_balance < -2"}', true),
  ('reciprocity_balance_ask', 'make_ask', 'Request help from {contact_name}', 'Strengthen the relationship by making an appropriate ask', 'low', 15, '{"condition": "reciprocity_balance > 2"}', true),
  ('milestone_celebration', 'celebrate', 'Celebrate milestone: {milestone_description}', 'Acknowledge and reflect on this achievement', 'high', 10, '{"condition": "milestone_reached"}', true),
  ('quarterly_relationship_audit', 'audit_relationships', 'Quarterly relationship audit for {goal_title}', 'Comprehensive review of all relationships in this goal', 'high', 45, '{"schedule": "quarterly"}', true),
  ('empty_goal_bootstrap', 'add_contacts', 'Bootstrap {goal_title} with initial contacts', 'Add 3-5 key contacts to get started with this goal', 'urgent', 20, '{"condition": "contact_count = 0"}', true),
  ('stale_goal_revival', 'review_goal', 'Revive stale goal: {goal_title}', 'This goal needs attention - review and re-energize', 'high', 25, '{"condition": "no_activity > 30_days"}', true)
ON CONFLICT (template_key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for system_action_templates
CREATE TRIGGER update_system_action_templates_updated_at 
  BEFORE UPDATE ON system_action_templates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for new tables
ALTER TABLE system_action_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_health_metrics ENABLE ROW LEVEL SECURITY;

-- System action templates are read-only for all authenticated users
CREATE POLICY "System action templates are viewable by all authenticated users"
  ON system_action_templates FOR SELECT
  TO authenticated
  USING (active = true);

-- Action generation history is viewable by the user who owns it
CREATE POLICY "Users can view their own action generation history"
  ON action_generation_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Relationship health metrics are viewable and modifiable by the user who owns them
CREATE POLICY "Users can view their own relationship health metrics"
  ON relationship_health_metrics FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own relationship health metrics"
  ON relationship_health_metrics FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own relationship health metrics"
  ON relationship_health_metrics FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own relationship health metrics"
  ON relationship_health_metrics FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Add comment documentation
COMMENT ON TABLE system_action_templates IS 'Templates for system-generated actions in relationship building sessions';
COMMENT ON TABLE action_generation_history IS 'History of system-generated actions for analytics and debugging';
COMMENT ON TABLE relationship_health_metrics IS 'Calculated metrics for relationship health and maintenance';

COMMENT ON COLUMN actions.recurrence_rule IS 'Optional recurrence pattern for repeating actions (e.g., weekly, monthly)';
COMMENT ON COLUMN actions.generation_trigger IS 'What triggered the creation of this action (e.g., goal_health, relationship_decay)';
COMMENT ON COLUMN actions.template_id IS 'Reference to the template used to generate this action';
COMMENT ON COLUMN actions.context_metadata IS 'Additional context data for action execution (contact info, suggestions, etc.)';
COMMENT ON COLUMN actions.system_generated IS 'Whether this action was created by the system or manually by the user';