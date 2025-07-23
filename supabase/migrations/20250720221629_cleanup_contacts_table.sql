-- Clean up contacts table by removing user-specific fields that are now in users table
-- This migration should run after the users table is created and populated

-- Remove user-specific fields from contacts table that are now in users table
-- These fields are duplicated between contacts and the new users table

-- First, drop dependent views that reference columns we want to remove
DROP VIEW IF EXISTS public.profiles;

-- Drop indexes on fields we're removing
DROP INDEX IF EXISTS public.idx_contacts_subscription_status;

-- Remove subscription-related columns (these should only be in subscriptions table)
ALTER TABLE public.contacts DROP COLUMN IF EXISTS subscription_status;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS subscription_plan;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS stripe_subscription_id;

-- Remove user-specific onboarding and goal fields (now in users table)
ALTER TABLE public.contacts DROP COLUMN IF EXISTS primary_goal;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS goal_description;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS goal_timeline;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS goal_success_criteria;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS profile_completion_score;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS onboarding_completed_at;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS ways_to_help_others;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS introduction_opportunities;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS knowledge_to_share;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS networking_challenges;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS onboarding_voice_memo_ids;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS challenge_feature_mappings;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS profile_picture;

-- Drop indexes on removed fields
DROP INDEX IF EXISTS public.idx_contacts_profile_completion;
DROP INDEX IF EXISTS public.idx_contacts_profile_picture;
DROP INDEX IF EXISTS public.idx_contacts_challenge_feature_mappings;

-- Keep linkedin_analysis_completed_at as it's contact-specific, not user-specific
-- Keep is_self_contact for now to maintain compatibility during transition

-- Add comment to clarify the purpose of contacts table
COMMENT ON TABLE public.contacts IS 'Stores contact information for relationship management. User account data is now in the users table.';

-- Update onboarding_state to reference users table properly
-- (onboarding_state should really reference users, but keeping current structure for compatibility)

-- Add helpful view for accessing user data with their self-contact
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
  u.id as user_id,
  u.email,
  u.name as user_name,
  u.created_at as user_created_at,
  u.updated_at as user_updated_at,
  u.onboarding_completed_at,
  u.profile_completion_score,
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
  -- Self-contact information
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
  c.connection_cadence_days,
  c.linkedin_analysis_completed_at
FROM public.users u
LEFT JOIN public.contacts c ON u.self_contact_id = c.id;

-- Grant access to the view
GRANT SELECT ON public.user_profiles TO authenticated;

-- Note: RLS policies apply through the underlying tables (users and contacts)
COMMENT ON VIEW public.user_profiles IS 'Combines user account data with their self-contact information for easy access';

-- Recreate the profiles view to maintain compatibility with existing code
-- This view now pulls subscription data from the proper subscriptions table
CREATE OR REPLACE VIEW public.profiles AS
SELECT 
  u.id,
  u.email,
  u.name as full_name,
  s.status as subscription_status,
  s.plan_type as subscription_plan,
  s.stripe_customer_id,
  s.stripe_subscription_id,
  u.updated_at
FROM public.users u
LEFT JOIN public.subscriptions s ON u.id = s.user_id;

-- Grant access to the profiles view
GRANT SELECT ON public.profiles TO authenticated;

-- Note: RLS policies apply through the underlying tables (users and subscriptions)
COMMENT ON VIEW public.profiles IS 'Compatibility view that provides user profile data with subscription info from the proper subscriptions table';