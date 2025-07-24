-- Create feature flags system tables
-- Supports global flags with per-user overrides

-- Main feature flags table
CREATE TABLE public.feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    enabled_globally BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User-specific feature flag overrides
CREATE TABLE public.user_feature_overrides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    feature_flag_id UUID NOT NULL REFERENCES public.feature_flags(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure only one override per user per flag
    UNIQUE(user_id, feature_flag_id)
);

-- Create indexes for performance
CREATE INDEX idx_feature_flags_name ON public.feature_flags(name);
CREATE INDEX idx_feature_flags_enabled ON public.feature_flags(enabled_globally);
CREATE INDEX idx_user_overrides_user_id ON public.user_feature_overrides(user_id);
CREATE INDEX idx_user_overrides_flag_id ON public.user_feature_overrides(feature_flag_id);

-- Add updated_at triggers
CREATE TRIGGER feature_flags_updated_at 
    BEFORE UPDATE ON public.feature_flags 
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER user_feature_overrides_updated_at 
    BEFORE UPDATE ON public.user_feature_overrides 
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_updated_at();

-- Comments
COMMENT ON TABLE public.feature_flags IS 'Global feature flags that can be enabled/disabled for all users';
COMMENT ON TABLE public.user_feature_overrides IS 'User-specific overrides for feature flags';