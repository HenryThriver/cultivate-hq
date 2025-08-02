-- Fix get_or_create_self_contact function to work without is_self_contact column
-- Self-contact identification is now implicit via user_id matching

CREATE OR REPLACE FUNCTION public.get_or_create_self_contact(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
  self_contact_id UUID;
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Try to find existing self-contact (any contact with matching user_id is a self-contact)
  SELECT id INTO self_contact_id
  FROM public.contacts
  WHERE user_id = user_uuid
  LIMIT 1; -- In case there are multiple, take the first one
  
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
    
    -- Create self-contact (no longer need is_self_contact field)
    INSERT INTO public.contacts (
      user_id,
      name,
      email,
      relationship_score,
      created_at,
      updated_at
    ) VALUES (
      user_uuid,
      COALESCE(user_name, user_email, 'My Profile'),
      user_email,
      6, -- Max relationship score for self
      NOW(),
      NOW()
    ) RETURNING id INTO self_contact_id;
  END IF;
  
  RETURN self_contact_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_or_create_self_contact(user_uuid UUID) IS 'Gets or creates a self-contact record for a user. Self-contact identification is implicit via user_id matching.';