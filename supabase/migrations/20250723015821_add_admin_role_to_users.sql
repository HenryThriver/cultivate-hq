-- Add admin role capability to users table
-- This migration adds an is_admin column to track admin users for feature flag management

-- Add is_admin column to users table with default false
ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Create index for efficient admin lookups
CREATE INDEX idx_users_is_admin ON public.users(is_admin) WHERE is_admin = TRUE;

-- Comment on the column for documentation
COMMENT ON COLUMN public.users.is_admin IS 'Indicates if the user has admin privileges for feature flag management and system administration';

-- Note: After migration, manually update specific users to admin status:
-- UPDATE public.users SET is_admin = TRUE WHERE email = 'admin@cultivatehq.com';