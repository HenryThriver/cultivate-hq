-- Create feature flags system tables
-- This migration creates the core feature flag infrastructure

-- Create feature_flags table
CREATE TABLE public.feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    enabled_globally BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT feature_flags_name_check CHECK (name ~ '^[a-z0-9_-]+$'),
    CONSTRAINT feature_flags_name_length CHECK (char_length(name) BETWEEN 1 AND 100)
);

-- Create user_feature_overrides table
CREATE TABLE public.user_feature_overrides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    feature_flag_id UUID NOT NULL REFERENCES public.feature_flags(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Unique constraint to prevent duplicate overrides
    UNIQUE(user_id, feature_flag_id)
);

-- Create indexes for efficient lookups
CREATE INDEX idx_feature_flags_name ON public.feature_flags(name);
CREATE INDEX idx_feature_flags_enabled_globally ON public.feature_flags(enabled_globally);
CREATE INDEX idx_user_feature_overrides_user_id ON public.user_feature_overrides(user_id);
CREATE INDEX idx_user_feature_overrides_feature_flag_id ON public.user_feature_overrides(feature_flag_id);
CREATE INDEX idx_user_feature_overrides_enabled ON public.user_feature_overrides(enabled);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_feature_flags_updated_at 
    BEFORE UPDATE ON public.feature_flags 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_feature_overrides_updated_at 
    BEFORE UPDATE ON public.user_feature_overrides 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.feature_flags IS 'Global feature flags that can be enabled/disabled system-wide';
COMMENT ON COLUMN public.feature_flags.name IS 'Unique identifier for the feature flag (snake_case)';
COMMENT ON COLUMN public.feature_flags.enabled_globally IS 'Whether the feature is enabled globally for all users';

COMMENT ON TABLE public.user_feature_overrides IS 'Per-user overrides for feature flags';
COMMENT ON COLUMN public.user_feature_overrides.enabled IS 'Whether the feature is enabled for this specific user (overrides global setting)';

-- Insert some example feature flags
INSERT INTO public.feature_flags (name, description, enabled_globally) VALUES
    ('new_dashboard_ui', 'Enable the redesigned dashboard interface', FALSE),
    ('advanced_analytics', 'Enable advanced analytics features', FALSE),
    ('beta_features', 'Enable beta features for testing', FALSE),
    ('debug_mode', 'Enable debug mode with additional logging', FALSE);