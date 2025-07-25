-- Create audit log for admin actions
-- Tracks all administrative changes for security and compliance

CREATE TABLE public.admin_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'enable', 'disable'
    resource_type TEXT NOT NULL, -- 'feature_flag', 'user_override', 'user'
    resource_id UUID,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for audit queries
CREATE INDEX idx_audit_log_admin_user ON public.admin_audit_log(admin_user_id);
CREATE INDEX idx_audit_log_action ON public.admin_audit_log(action);
CREATE INDEX idx_audit_log_resource ON public.admin_audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_created_at ON public.admin_audit_log(created_at);

COMMENT ON TABLE public.admin_audit_log IS 'Audit trail of all administrative actions for security and compliance';