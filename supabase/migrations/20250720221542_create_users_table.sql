-- Create users table to separate user account data from contact data
-- This replaces the overloaded concept of "self-contact" with a proper user table

-- Create the users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Onboarding & Profile
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  profile_completion_score INTEGER DEFAULT 0,
  onboarding_voice_memo_ids UUID[] DEFAULT '{}',
  
  -- Goals & Preferences  
  primary_goal TEXT,
  goal_description TEXT,
  goal_timeline TEXT,
  goal_success_criteria TEXT,
  ways_to_help_others TEXT[] DEFAULT '{}',
  introduction_opportunities TEXT[] DEFAULT '{}',
  knowledge_to_share TEXT[] DEFAULT '{}',
  networking_challenges TEXT[] DEFAULT '{}',
  challenge_feature_mappings JSONB DEFAULT '[]',
  
  -- Profile & Display
  profile_picture TEXT,
  
  -- System References
  self_contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  
  CONSTRAINT check_profile_completion CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100)
);

-- Create indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_onboarding_completed ON public.users(onboarding_completed_at);
CREATE INDEX idx_users_profile_completion ON public.users(profile_completion_score);
CREATE INDEX idx_users_self_contact ON public.users(self_contact_id);
CREATE INDEX idx_users_challenge_mappings ON public.users USING gin(challenge_feature_mappings);

-- Add updated_at trigger
CREATE TRIGGER users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Migration function to populate users table from existing data
CREATE OR REPLACE FUNCTION migrate_self_contacts_to_users()
RETURNS void AS $$
DECLARE
  self_contact_rec RECORD;
  auth_user_rec RECORD;
BEGIN
  -- For each self-contact, create corresponding user record
  FOR self_contact_rec IN 
    SELECT * FROM public.contacts WHERE is_self_contact = TRUE
  LOOP
    -- Get auth user data
    SELECT * INTO auth_user_rec 
    FROM auth.users 
    WHERE id = self_contact_rec.user_id;
    
    IF auth_user_rec.id IS NOT NULL THEN
      -- Insert into users table
      INSERT INTO public.users (
        id,
        email,
        name,
        created_at,
        updated_at,
        onboarding_completed_at,
        profile_completion_score,
        onboarding_voice_memo_ids,
        primary_goal,
        goal_description,
        goal_timeline,
        goal_success_criteria,
        ways_to_help_others,
        introduction_opportunities,
        knowledge_to_share,
        networking_challenges,
        challenge_feature_mappings,
        profile_picture,
        self_contact_id
      ) VALUES (
        self_contact_rec.user_id,
        COALESCE(self_contact_rec.email, auth_user_rec.email),
        COALESCE(self_contact_rec.name, auth_user_rec.raw_user_meta_data->>'full_name'),
        self_contact_rec.created_at,
        self_contact_rec.updated_at,
        self_contact_rec.onboarding_completed_at,
        self_contact_rec.profile_completion_score,
        self_contact_rec.onboarding_voice_memo_ids,
        self_contact_rec.primary_goal,
        self_contact_rec.goal_description,
        self_contact_rec.goal_timeline,
        self_contact_rec.goal_success_criteria,
        self_contact_rec.ways_to_help_others,
        self_contact_rec.introduction_opportunities,
        self_contact_rec.knowledge_to_share,
        self_contact_rec.networking_challenges,
        self_contact_rec.challenge_feature_mappings,
        self_contact_rec.profile_picture,
        self_contact_rec.id
      )
      ON CONFLICT (id) DO NOTHING; -- Skip if already exists
      
      RAISE LOG 'Migrated self-contact % to user %', self_contact_rec.id, self_contact_rec.user_id;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Migration completed. Users table populated from self-contacts.';
END;
$$ LANGUAGE plpgsql;

-- Run the migration
SELECT migrate_self_contacts_to_users();

-- Clean up migration function
DROP FUNCTION migrate_self_contacts_to_users();

-- Update initialize_user_onboarding function to create user record
CREATE OR REPLACE FUNCTION public.initialize_user_onboarding()
RETURNS TRIGGER AS $$
DECLARE
  self_contact_id UUID;
BEGIN
  -- Create user record first
  INSERT INTO public.users (
    id,
    email,
    name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Create self-contact
  self_contact_id := public.get_or_create_self_contact(NEW.id);
  
  -- Update user record with self_contact_id
  UPDATE public.users 
  SET self_contact_id = self_contact_id
  WHERE id = NEW.id;
  
  -- Create onboarding state
  INSERT INTO public.onboarding_state (user_id, started_at, last_activity_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.initialize_user_onboarding() IS 'Updated to create user record and link to self-contact';

-- Update get_or_create_self_contact to work with new architecture
CREATE OR REPLACE FUNCTION public.get_or_create_self_contact(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
  self_contact_id UUID;
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Try to find existing self-contact
  SELECT id INTO self_contact_id
  FROM public.contacts
  WHERE user_id = user_uuid AND is_self_contact = TRUE;
  
  -- If not found, create one
  IF self_contact_id IS NULL THEN
    -- Get user info from new users table first, fallback to auth.users
    SELECT email, name INTO user_email, user_name
    FROM public.users
    WHERE id = user_uuid;
    
    -- Fallback to auth.users if not in users table yet
    IF user_email IS NULL THEN
      SELECT email, COALESCE(raw_user_meta_data->>'full_name', email) 
      INTO user_email, user_name
      FROM auth.users 
      WHERE id = user_uuid;
    END IF;
    
    -- Create self-contact (keep existing structure for now)
    INSERT INTO public.contacts (
      user_id,
      name,
      email,
      is_self_contact,
      relationship_score,
      created_at,
      updated_at
    ) VALUES (
      user_uuid,
      COALESCE(user_name, user_email, 'My Profile'),
      user_email,
      TRUE,
      6, -- Max relationship score for self
      NOW(),
      NOW()
    ) RETURNING id INTO self_contact_id;
  END IF;
  
  RETURN self_contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_or_create_self_contact(user_uuid UUID) IS 'Updated to work with new users table';