-- Add admin role support to users table
-- This enables feature flag administration capabilities

ALTER TABLE public.users 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Create index for efficient admin lookups
CREATE INDEX idx_users_is_admin ON public.users(is_admin) WHERE is_admin = TRUE;

COMMENT ON COLUMN public.users.is_admin IS 'Indicates if user has admin privileges for feature flag management';