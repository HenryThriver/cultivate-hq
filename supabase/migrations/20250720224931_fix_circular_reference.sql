-- Fix circular reference between users and contacts tables
-- Issue: users.self_contact_id -> contacts.id AND contacts.user_id -> users.id creates circular dependency

-- First drop the user_profiles view that depends on self_contact_id column
DROP VIEW IF EXISTS public.user_profiles;

-- Now remove the self_contact_id column from users table to break circular reference
ALTER TABLE public.users DROP COLUMN IF EXISTS self_contact_id;

-- Add missing indexes identified in code review
CREATE INDEX IF NOT EXISTS idx_contacts_is_self_contact ON public.contacts(is_self_contact) WHERE is_self_contact = true;
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Update user_profiles view to use JOIN instead of direct reference
DROP VIEW IF EXISTS public.user_profiles;
CREATE VIEW public.user_profiles AS
SELECT 
  -- User administrative data (from users table)
  u.id as user_id,
  u.email,
  u.name as user_name,
  u.created_at as user_created_at,
  u.updated_at as user_updated_at,
  u.onboarding_completed_at,
  u.profile_completion_score,
  u.onboarding_voice_memo_ids,
  u.primary_goal,
  u.goal_description,
  u.goal_timeline,
  u.goal_success_criteria,
  u.ways_to_help_others,
  u.introduction_opportunities,
  u.knowledge_to_share,
  u.networking_challenges,
  u.challenge_feature_mappings,
  u.profile_picture,
  
  -- Self-contact relationship data (found via is_self_contact flag)
  c.id as contact_id,
  c.name as contact_name,
  c.company,
  c.title,
  c.linkedin_url,
  c.location,
  c.notes as contact_notes,
  c.relationship_score,
  c.last_interaction_date,
  c.professional_context,
  c.personal_context,
  c.linkedin_data,
  c.connection_cadence_days
FROM public.users u
LEFT JOIN public.contacts c ON u.id = c.user_id AND c.is_self_contact = true;

-- Grant access to the updated view
GRANT SELECT ON public.user_profiles TO authenticated;

-- Create a helper function to get self-contact ID (replacement for removed column)
CREATE OR REPLACE FUNCTION public.get_self_contact_id(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
  self_contact_id UUID;
BEGIN
  SELECT id INTO self_contact_id
  FROM public.contacts
  WHERE user_id = user_uuid AND is_self_contact = true
  LIMIT 1;
  
  RETURN self_contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_self_contact_id(user_uuid UUID) IS 'Helper function to get self-contact ID without circular reference';

-- Update initialize_user_onboarding function to not reference self_contact_id
CREATE OR REPLACE FUNCTION public.initialize_user_onboarding()
RETURNS TRIGGER AS $$
DECLARE
  self_contact_id UUID;
BEGIN
  -- Create user record first (administrative data)
  INSERT INTO public.users (
    id,
    email,
    name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Create self-contact (relationship intelligence data)
  self_contact_id := public.get_or_create_self_contact(NEW.id);
  
  -- Note: No longer setting self_contact_id on users table (circular reference removed)
  
  -- Create onboarding state
  INSERT INTO public.onboarding_state (user_id, started_at, last_activity_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.initialize_user_onboarding() IS 'Creates user and self-contact records without circular reference';

-- Add constraint to ensure only one self-contact per user (data integrity)
-- Drop existing constraint if it exists and recreate it
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS unique_self_contact_per_user;
ALTER TABLE public.contacts ADD CONSTRAINT unique_self_contact_per_user 
  UNIQUE (user_id, is_self_contact) DEFERRABLE INITIALLY DEFERRED;

COMMENT ON CONSTRAINT unique_self_contact_per_user ON public.contacts IS 'Ensures each user has at most one self-contact';

-- Update table comments to reflect the fix
COMMENT ON TABLE public.users IS 'Administrative user data: authentication, billing, preferences. No longer has circular reference to contacts.';
COMMENT ON TABLE public.contacts IS 'Relationship intelligence data: profiles, interactions, timelines. Self-contact identified by is_self_contact=true.';