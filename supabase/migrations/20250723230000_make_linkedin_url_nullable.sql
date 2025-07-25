-- Make linkedin_url nullable to avoid dummy data for self-contacts
-- Having a LinkedIn URL triggers API calls, so we should allow NULL for self-contacts

ALTER TABLE public.contacts 
ALTER COLUMN linkedin_url DROP NOT NULL;