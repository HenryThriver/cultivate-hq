-- Add RLS policies for feature flags and admin functionality
-- This migration creates secure access patterns for the feature flag system

-- Enable RLS on all new tables
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feature_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND is_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's feature flag status
CREATE OR REPLACE FUNCTION public.is_feature_enabled_for_current_user(flag_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    global_enabled BOOLEAN;
    user_override BOOLEAN;
BEGIN
    -- Get global flag status
    SELECT enabled_globally INTO global_enabled 
    FROM public.feature_flags 
    WHERE name = flag_name;
    
    -- If flag doesn't exist, return false
    IF global_enabled IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check for user-specific override
    SELECT enabled INTO user_override
    FROM public.user_feature_overrides ufo
    JOIN public.feature_flags ff ON ff.id = ufo.feature_flag_id
    WHERE ff.name = flag_name AND ufo.user_id = auth.uid();
    
    -- Return override if exists, otherwise return global setting
    RETURN COALESCE(user_override, global_enabled);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for feature_flags table
-- Admins can do everything, regular users can only read
CREATE POLICY "Admins can manage feature flags" ON public.feature_flags
    FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Users can read feature flags" ON public.feature_flags
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for user_feature_overrides table
-- Admins can manage all overrides, users can only see their own
CREATE POLICY "Admins can manage all user feature overrides" ON public.user_feature_overrides
    FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Users can read their own feature overrides" ON public.user_feature_overrides
    FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for admin_audit_log table
-- Only admins can access audit logs
CREATE POLICY "Only admins can access audit logs" ON public.admin_audit_log
    FOR ALL USING (public.is_current_user_admin());

-- Update users table RLS to allow admins to read all users (for user management)
-- Drop existing policies to recreate them with admin access
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;

-- Recreate user policies with admin access
CREATE POLICY "Users can read their own data" ON public.users
    FOR SELECT USING (id = auth.uid() OR public.is_current_user_admin());

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (id = auth.uid() OR public.is_current_user_admin());

CREATE POLICY "Users can insert their own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL USING (public.is_current_user_admin());

-- Create a view for safe user management (excludes sensitive data)
CREATE OR REPLACE VIEW public.user_management_view AS
SELECT 
    u.id,
    u.email,
    u.name as full_name,
    u.is_admin,
    u.created_at,
    u.updated_at,
    (
        SELECT COUNT(*) 
        FROM public.user_feature_overrides ufo 
        WHERE ufo.user_id = u.id
    ) as feature_override_count
FROM public.users u;

-- Grant necessary permissions
GRANT SELECT ON public.user_management_view TO authenticated;
GRANT ALL ON public.feature_flags TO authenticated;
GRANT ALL ON public.user_feature_overrides TO authenticated;
GRANT ALL ON public.admin_audit_log TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.is_current_user_admin() IS 'Returns true if the current authenticated user has admin privileges';
COMMENT ON FUNCTION public.is_feature_enabled_for_current_user(TEXT) IS 'Returns true if a feature flag is enabled for the current user, considering both global settings and user overrides';
COMMENT ON VIEW public.user_management_view IS 'Safe view for admin user management that excludes sensitive data';