-- Remove deprecated is_self_contact constraint and field
-- A contact belongs to a user via foreign key - if user_id matches the logged-in user, it's a self-contact

-- First, drop policies that depend on is_self_contact
DROP POLICY IF EXISTS "Users can create voice memos for their self-contact" ON artifacts;

-- Drop the user_profiles view that depends on is_self_contact
DROP VIEW IF EXISTS user_profiles;

-- Drop the problematic unique constraint
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS unique_self_contact_per_user;

-- Drop related indexes
DROP INDEX IF EXISTS idx_contacts_self_contact;
DROP INDEX IF EXISTS idx_contacts_is_self_contact;
DROP INDEX IF EXISTS idx_contacts_is_self;

-- Now we can drop the column
ALTER TABLE contacts DROP COLUMN IF EXISTS is_self_contact;

-- Recreate the user_profiles view without is_self_contact dependency
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  u.id,
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
LEFT JOIN public.contacts c ON u.id = c.user_id
  -- This replaces the is_self_contact = true check
  -- Since we're joining on user_id, this is implicitly the self-contact
WHERE c.id IS NOT NULL; -- Only show users who have a contact record

-- Update the voice memo policy to work without is_self_contact
CREATE POLICY "Users can create voice memos for their contacts" ON artifacts
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND type = 'voice_memo'
    AND contact_id IN (
      SELECT id FROM contacts WHERE user_id = auth.uid()
    )
  );

-- Add a comment explaining the new approach
COMMENT ON TABLE contacts IS 'Contacts table - self-contact identification is implicit via user_id. A contact with user_id matching the authenticated user is the self-contact';