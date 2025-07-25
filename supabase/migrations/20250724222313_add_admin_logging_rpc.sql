-- Migration: Add log_admin_action RPC function for centralized admin logging
-- This function provides secure logging for admin actions with proper RLS

-- Create admin_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_logs table
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own admin logs
CREATE POLICY "Users can view own admin logs" ON admin_logs
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Only authenticated users can insert admin logs
CREATE POLICY "Authenticated users can insert admin logs" ON admin_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create the log_admin_action RPC function with correct signature
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_user_id UUID,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_details TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    log_id UUID;
    current_user_id UUID;
    details_json JSONB;
BEGIN
    -- Get the current authenticated user
    current_user_id := auth.uid();
    
    -- Ensure user is authenticated
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to log admin actions';
    END IF;
    
    -- Ensure the requesting user matches the admin_user_id (security check)
    IF current_user_id != p_admin_user_id THEN
        RAISE EXCEPTION 'Cannot log admin actions for other users';
    END IF;
    
    -- Parse details JSON if provided
    IF p_details IS NOT NULL THEN
        BEGIN
            details_json := p_details::JSONB;
        EXCEPTION WHEN OTHERS THEN
            details_json := jsonb_build_object('raw_details', p_details);
        END;
    END IF;
    
    -- Insert the admin log entry
    INSERT INTO admin_logs (
        user_id,
        action,
        details,
        ip_address,
        user_agent,
        created_at
    ) VALUES (
        current_user_id,
        p_action || ' (' || p_resource_type || COALESCE(': ' || p_resource_id, '') || ')',
        details_json,
        p_ip_address::INET,
        p_user_agent,
        NOW()
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Grant execute permission to authenticated users  
GRANT EXECUTE ON FUNCTION log_admin_action(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION log_admin_action IS 'Logs admin actions with user context and optional details. Returns the log entry ID.';