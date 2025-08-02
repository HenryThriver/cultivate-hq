-- Fix user_profiles view to include user_id column
-- This was missing after the is_self_contact removal

-- Drop and recreate the user_profiles view with the correct columns
DROP VIEW IF EXISTS user_profiles;

CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  u.id,
  u.id as user_id,  -- Add the missing user_id column
  u.email,
  u.raw_user_meta_data,
  u.created_at,
  u.updated_at,
  -- Self-contact data is now identified by matching user_id
  c.name,
  c.linkedin_url,
  c.professional_context,
  c.personal_context,
  c.relationship_score
FROM auth.users u
LEFT JOIN public.contacts c ON u.id = c.user_id;
  -- This replaces the is_self_contact = true check

COMMENT ON VIEW user_profiles IS 'User profiles view combining auth.users with self-contact data from public.contacts where user_id matches';