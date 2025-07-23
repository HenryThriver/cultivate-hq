-- Create admin audit log table
-- This migration creates audit logging for admin actions

-- Create admin_audit_log table
CREATE TABLE public.admin_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT admin_audit_log_action_check CHECK (action IN (
        'create', 'update', 'delete', 'read', 'login', 'logout',
        'feature_flag_toggle', 'user_role_change', 'system_config_change'
    )),
    CONSTRAINT admin_audit_log_resource_type_check CHECK (resource_type IN (
        'feature_flag', 'user', 'user_feature_override', 'system_config', 'auth'
    ))
);

-- Create indexes for efficient querying
CREATE INDEX idx_admin_audit_log_admin_user_id ON public.admin_audit_log(admin_user_id);
CREATE INDEX idx_admin_audit_log_action ON public.admin_audit_log(action);
CREATE INDEX idx_admin_audit_log_resource_type ON public.admin_audit_log(resource_type);
CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX idx_admin_audit_log_resource_id ON public.admin_audit_log(resource_id) WHERE resource_id IS NOT NULL;

-- Create a composite index for common queries
CREATE INDEX idx_admin_audit_log_user_action_time ON public.admin_audit_log(admin_user_id, action, created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE public.admin_audit_log IS 'Audit log for admin actions and system changes';
COMMENT ON COLUMN public.admin_audit_log.admin_user_id IS 'ID of the admin user who performed the action';
COMMENT ON COLUMN public.admin_audit_log.action IS 'Type of action performed (create, update, delete, etc.)';
COMMENT ON COLUMN public.admin_audit_log.resource_type IS 'Type of resource affected (feature_flag, user, etc.)';
COMMENT ON COLUMN public.admin_audit_log.resource_id IS 'ID of the specific resource affected';
COMMENT ON COLUMN public.admin_audit_log.details IS 'Additional details about the action in JSON format';
COMMENT ON COLUMN public.admin_audit_log.ip_address IS 'IP address of the admin user';
COMMENT ON COLUMN public.admin_audit_log.user_agent IS 'User agent string of the admin user';

-- Create a function to automatically log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_admin_user_id UUID,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.admin_audit_log (
        admin_user_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent
    ) VALUES (
        p_admin_user_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_details,
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;