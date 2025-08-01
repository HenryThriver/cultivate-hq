-- Seed data for Cultivate HQ local development
-- This creates sophisticated dummy data to demonstrate relationship intelligence capabilities
-- Note: This only runs locally and does NOT affect production data

-- Create/ensure your Google authenticated user exists
-- This recreates your user after db reset
INSERT INTO auth.users (
  id, 
  instance_id, 
  email, 
  email_confirmed_at,
  raw_user_meta_data,
  created_at, 
  updated_at,
  role,
  aud,
  -- Add password for dev login
  encrypted_password,
  -- Set all required fields to prevent auth service errors
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  is_super_admin,
  phone,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  is_anonymous
)
VALUES (
  '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'henry@cultivatehq.com', -- Replace with your actual Google email
  NOW(),
  '{"iss": "https://accounts.google.com", "sub": "google-user-id", "name": "Henry", "email": "henry@cultivatehq.com", "provider": "google"}'::jsonb,
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  -- Password is 'password123'
  crypt('password123', gen_salt('bf')),
  -- Set all fields to prevent NULL scanning errors
  NOW(),
  '',
  NOW(),
  '',
  NOW(),
  '',
  '',
  NOW(),
  NOW(),
  '{}'::jsonb,
  false,
  '',
  '',
  '',
  NOW(),
  '',
  0,
  '',
  NOW(),
  false,
  false
)
ON CONFLICT (id) DO NOTHING;

-- Also create the corresponding identity record for Google OAuth
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
  'google-user-id-12345',
  '{"iss": "https://accounts.google.com", "sub": "google-user-id-12345", "email": "henry@cultivatehq.com", "name": "Henry"}'::jsonb,
  'google',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (provider_id, provider) DO NOTHING;

-- Mark onboarding as complete for dev user
UPDATE public.users 
SET onboarding_completed_at = NOW() 
WHERE id = '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid;

-- Update onboarding state to completed
UPDATE public.onboarding_state 
SET 
  current_screen = 12,
  completed_screens = ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  last_activity_at = NOW(),
  updated_at = NOW()
WHERE user_id = '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid;

-- Create self-contact for the dev user
INSERT INTO public.contacts (id, user_id, name, email, linkedin_url, relationship_score, created_at, updated_at)
VALUES (
  'a0000000-89ab-cdef-0123-456789abcdef'::uuid,
  '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
  'Henry',
  'henry@cultivatehq.com',
  '',
  0,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insert executive-level contacts with relationship scores for KPI tracking
INSERT INTO public.contacts (id, user_id, name, email, linkedin_url, professional_context, personal_context, relationship_score, last_interaction_date, created_at, updated_at)
VALUES 
  (
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'Sarah Chen',
    'sarah.chen@techflow.com',
    'https://linkedin.com/in/sarahchen',
    '{
      "current_role": "VP Product",
      "current_company": "TechFlow Dynamics", 
      "expertise_areas": ["AI/ML Strategy", "Product-Led Growth", "B2B SaaS"],
      "goals": ["Strategic partnerships in AI space", "Board positions at emerging tech companies"],
      "networking_objectives": ["Find technical co-founder for side project", "Connect with AI researchers"],
      "opportunities": ["Introduction to VCs", "Product strategy insights", "Team building advice"]
    }'::jsonb,
    '{
      "interests": ["Classical music", "Marathon running", "Sustainable technology"],
      "family": {
        "partner": {"name": "David", "relationship": "Partner", "details": "Software architect at Meta"},
        "children": [{"name": "Emma", "relationship": "Daughter", "details": "Age 8, loves robotics"}]
      },
      "conversation_starters": {
        "professional": ["Ask about her AI ethics framework", "Discuss the future of product management"],
        "personal": ["Her recent marathon in Boston", "Family trip to Japan last summer"]
      }
    }'::jsonb,
    5.5,
    NOW() - INTERVAL '5 days',
    '2024-01-15'::timestamp,
    '2024-07-20'::timestamp
  ),
  (
    'a2222222-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'Marcus Rodriguez',
    'marcus.rodriguez@innovateai.com',
    'https://linkedin.com/in/marcusrodriguez',
    '{
      "current_role": "Chief Technology Officer",
      "current_company": "InnovateAI Solutions",
      "expertise_areas": ["Machine Learning Infrastructure", "Technical Leadership", "Startup Scaling"],
      "goals": ["IPO preparation", "Expand engineering team globally"],
      "networking_objectives": ["Connect with technical talent", "Find strategic partnerships"],
      "opportunities": ["Technical due diligence", "Engineering culture advice", "ML implementation"]
    }'::jsonb,
    '{
      "interests": ["Photography", "Rock climbing", "Mentoring junior developers"],
      "conversation_starters": {
        "professional": ["His thoughts on the future of AI infrastructure", "Scaling engineering teams"],
        "personal": ["Recent climbing trip to Yosemite", "Photography exhibition in SF"]
      }
    }'::jsonb,
    6.0,
    NOW() - INTERVAL '12 days',
    '2024-02-10'::timestamp,
    '2024-07-18'::timestamp
  ),
  (
    'a3333333-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'Jennifer Walsh',
    'jennifer.walsh@example.com',
    'https://linkedin.com/in/jenniferwalsh',
    '{
      "current_role": "Former CEO",
      "current_company": "InnovateCorp (Exited)",
      "expertise_areas": ["Corporate Strategy", "M&A", "Board Governance", "Digital Transformation"],
      "goals": ["Board positions at high-growth companies", "Angel investing in femtech"],
      "networking_objectives": ["Connect with promising startups", "Find board opportunities"],
      "opportunities": ["Strategic advisory", "Executive coaching", "Investor introductions"]
    }'::jsonb,
    '{
      "interests": ["Wine collecting", "Art curation", "Women in tech mentorship"],
      "family": {
        "children": [
          {"name": "Alex", "relationship": "Son", "details": "Stanford MBA student"},
          {"name": "Taylor", "relationship": "Daughter", "details": "Pediatric resident at UCSF"}
        ]
      },
      "conversation_starters": {
        "professional": ["Her experience with digital transformation", "Board governance best practices"],
        "personal": ["Recent wine tasting trip to Tuscany", "Art collection featuring emerging artists"]
      }
    }'::jsonb,
    6.0,
    NOW() - INTERVAL '8 days',
    '2024-03-05'::timestamp,
    '2024-07-25'::timestamp
  ),
  (
    'a4444444-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'Dr. Amit Patel',
    'amit.patel@stanford.edu',
    'https://linkedin.com/in/drapatel',
    '{
      "current_role": "Director of AI Research",
      "current_company": "Stanford AI Lab",
      "expertise_areas": ["Natural Language Processing", "Ethical AI", "Research Commercialization"],
      "goals": ["Launch AI ethics consultancy", "Publish book on responsible AI"],
      "networking_objectives": ["Connect with industry leaders", "Find commercial applications for research"],
      "opportunities": ["AI ethics consultation", "Research collaboration", "Technical advisory"]
    }'::jsonb,
    '{
      "interests": ["Indian classical music", "Cooking", "Teaching meditation"],
      "family": {
        "partner": {"name": "Priya", "relationship": "Wife", "details": "Pediatric surgeon at Stanford"},
        "children": [{"name": "Arjun", "relationship": "Son", "details": "Age 12, chess prodigy"}]
      },
      "conversation_starters": {
        "professional": ["Latest research on AI bias mitigation", "The future of human-AI collaboration"],
        "personal": ["His meditation practice", "Family cooking traditions"]
      }
    }'::jsonb,
    5.8,
    NOW() - INTERVAL '15 days',
    '2024-01-20'::timestamp,
    '2024-07-22'::timestamp
  )
ON CONFLICT (id) DO NOTHING;

-- Insert strategic artifacts
INSERT INTO public.artifacts (id, contact_id, user_id, type, content, timestamp, ai_parsing_status, created_at, metadata)
VALUES
  -- Voice memo about Sarah Chen
  (
    'b1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'voice_memo',
    'Coffee meeting recap: Sarah mentioned her need for a technical co-founder for her AI ethics startup. She''s particularly interested in finding someone with ML infrastructure experience who shares her values around responsible AI development.',
    NOW() - INTERVAL '2 days',
    'completed',
    NOW() - INTERVAL '2 days',
    '{
      "duration_seconds": 120,
      "location": "Blue Bottle Coffee, Palo Alto",
      "key_topics": ["AI ethics", "Co-founder search", "Technical partnerships"]
    }'::jsonb
  ),
  -- Meeting with Jennifer Walsh
  (
    'b2222222-89ab-cdef-0123-456789abcdef'::uuid,
    'a3333333-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'meeting',
    '{"title": "Strategic Advisory Discussion", "duration_minutes": 45, "key_topics": ["Board positioning", "Strategic advisory opportunities", "Industry trends"], "summary": "Jennifer is actively evaluating board positions at high-growth companies. She mentioned her interest in companies focused on digital transformation and sustainable technology."}'::text,
    NOW() - INTERVAL '3 days',
    'completed',
    NOW() - INTERVAL '3 days',
    '{
      "meeting_type": "coffee_chat",
      "location": "Four Seasons Hotel, SF",
      "attendees": ["Jennifer Walsh", "Demo User"],
      "follow_up_required": true
    }'::jsonb
  ),
  -- Completed POG Loop
  (
    'b3333333-89ab-cdef-0123-456789abcdef'::uuid,
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'loop',
    '{
      "type": "INTRODUCTION",
      "status": "COMPLETED",
      "title": "Strategic AI Partnership Introduction",
      "description": "Facilitate introduction between Sarah Chen (TechFlow) and Marcus Rodriguez (InnovateAI) based on their complementary AI partnership needs",
      "initiator": "user",
      "reciprocity_direction": "giving",
      "actions": [
        {
          "id": "action-1",
          "status": "COMPLETED",
          "action_type": "offer",
          "notes": "Initial introduction email sent",
          "created_at": "' || (NOW() - INTERVAL '7 days')::text || '",
          "completed_at": "' || (NOW() - INTERVAL '7 days')::text || '"
        },
        {
          "id": "action-2",
          "status": "COMPLETED", 
          "action_type": "delivery",
          "notes": "Successful partnership agreement signed - $2.3M ARR impact",
          "created_at": "' || (NOW() - INTERVAL '1 day')::text || '",
          "completed_at": "' || (NOW() - INTERVAL '1 day')::text || '"
        }
      ],
      "completed_at": "' || (NOW() - INTERVAL '1 day')::text || '",
      "outcome": "successful",
      "satisfaction_score": 5,
      "reciprocity_value": 5
    }'::text,
    NOW() - INTERVAL '7 days',
    'completed',
    NOW() - INTERVAL '7 days',
    '{
      "impact_metrics": {
        "revenue_impact": 2300000,
        "relationship_strengthened": true,
        "follow_on_opportunities": 3
      }
    }'::jsonb
  ),
  -- LinkedIn intelligence for Marcus
  (
    'b4444444-89ab-cdef-0123-456789abcdef'::uuid,
    'a2222222-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'linkedin_profile',
    'Marcus Rodriguez - CTO at InnovateAI Solutions',
    NOW() - INTERVAL '5 days',
    'completed',
    NOW() - INTERVAL '5 days',
    '{
      "profile_url": "https://linkedin.com/in/marcusrodriguez",
      "headline": "CTO at InnovateAI | Building the future of ML infrastructure",
      "about": "Passionate about scaling engineering teams and building robust ML systems that solve real-world problems.",
      "experience": [
        {
          "company": "InnovateAI Solutions",
          "title": "Chief Technology Officer",
          "duration": "2 years",
          "description": "Leading technical strategy for Series B AI startup"
        }
      ],
      "recent_activity": {
        "posts_about_expansion": 3,
        "hiring_posts": 5,
        "partnership_mentions": 2
      }
    }'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Note: AI suggestions would be stored in contact_update_suggestions or loop_suggestions tables
-- For seed purposes, we're focusing on core data structure demonstration

-- Create a test relationship session
INSERT INTO public.relationship_sessions (id, user_id, session_type, duration_minutes, status, completed_at, created_at, updated_at)
VALUES
  (
    'c1111111-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'goal_focused',
    45,
    'completed',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- Set up goals for relationship sessions
INSERT INTO public.goals (id, user_id, title, description, target_date, status, progress_percentage, created_at, updated_at)
VALUES
  (
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'Expand Strategic Network in AI/ML',
    'Build meaningful connections with 15 AI/ML leaders to support product strategy initiatives',
    (NOW() + INTERVAL '3 months')::date,
    'active',
    80,
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '2 days'
  ),
  (
    'e2222222-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'Secure 2 Board Advisory Positions',
    'Leverage network to identify and secure board advisory roles at high-growth startups',
    (NOW() + INTERVAL '6 months')::date,
    'active',
    40,
    NOW() - INTERVAL '2 months',
    NOW() - INTERVAL '1 week'
  ),
  (
    'e3333333-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'Build AI Ethics Advisory Network',
    'Connect with 10 AI ethics experts and researchers to support consultancy launch',
    (NOW() + INTERVAL '4 months')::date,
    'active',
    60,
    NOW() - INTERVAL '6 weeks',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- Skip onboarding for the development user
INSERT INTO public.onboarding_state (
  user_id,
  current_screen,
  completed_screens,
  started_at,
  last_activity_at,
  goal_id
)
VALUES (
  '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
  43,  -- Final screen (4.3 Complete)
  ARRAY[0, 10, 11, 12, 20, 30, 31, 32, 40, 41, 42, 43],  -- All screens completed
  NOW() - INTERVAL '1 week',
  NOW() - INTERVAL '1 hour',
  'e1111111-89ab-cdef-0123-456789abcdef'::uuid  -- Link to the AI/ML goal
)
ON CONFLICT (user_id) 
DO UPDATE SET
  current_screen = 43,
  completed_screens = ARRAY[0, 10, 11, 12, 20, 30, 31, 32, 40, 41, 42, 43],
  last_activity_at = NOW() - INTERVAL '1 hour',
  goal_id = 'e1111111-89ab-cdef-0123-456789abcdef'::uuid;

-- Mark onboarding as completed in users table to prevent redirect loop
UPDATE public.users 
SET onboarding_completed_at = NOW() - INTERVAL '1 hour'
WHERE id = '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid;

-- Link goals to contacts through goal_contacts table
INSERT INTO public.goal_contacts (
  user_id,
  goal_id,
  contact_id,
  relevance_score,
  notes,
  created_at
)
VALUES 
  (
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,  -- AI/ML goal
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,  -- Sarah Chen
    0.9,
    'AI/ML expertise - strategic partnership opportunities',
    NOW() - INTERVAL '1 week'
  ),
  (
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,  -- AI/ML goal
    'a2222222-89ab-cdef-0123-456789abcdef'::uuid,  -- Marcus Rodriguez
    0.95,
    'ML Infrastructure expert - technical leadership',
    NOW() - INTERVAL '1 week'
  ),
  (
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'e2222222-89ab-cdef-0123-456789abcdef'::uuid,  -- Board positions goal
    'a3333333-89ab-cdef-0123-456789abcdef'::uuid,  -- Jennifer Walsh
    0.85,
    'Board governance expertise - strategic advisory',
    NOW() - INTERVAL '1 week'
  ),
  (
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'e3333333-89ab-cdef-0123-456789abcdef'::uuid,  -- AI Ethics goal
    'a4444444-89ab-cdef-0123-456789abcdef'::uuid,  -- Dr. Amit Patel
    0.98,
    'AI Ethics research leader - consultancy collaboration',
    NOW() - INTERVAL '1 week'
  )
ON CONFLICT (user_id, goal_id, contact_id) DO NOTHING;

-- Add session actions to the actions table (after goals are created)
INSERT INTO public.actions (
  id, 
  user_id, 
  action_type, 
  title, 
  description, 
  priority, 
  status, 
  goal_id,
  contact_id, 
  session_id,
  estimated_duration_minutes,
  action_data,
  created_source,
  completed_at,
  completed_by_user_id,
  created_at, 
  updated_at
)
VALUES
  (
    'd1111111-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'add_contact_to_goal',
    'Add Sarah to Strategic Network Goal',
    'Added Sarah after coffee meeting to AI/ML strategic network goal',
    'high',
    'completed',
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'c1111111-89ab-cdef-0123-456789abcdef'::uuid,
    15,
    '{"notes": "Added Sarah after coffee meeting", "source": "In-person meeting"}'::jsonb,
    'manual',
    NOW() - INTERVAL '1 day',
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    'd2222222-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'add_meeting_notes',
    'Add Notes from Strategic Discussion with Sarah',
    'Capture insights from strategic AI partnership discussion with Sarah Chen',
    'medium',
    'completed',
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'c1111111-89ab-cdef-0123-456789abcdef'::uuid,
    20,
    '{"loop_type": "introduction", "title": "Strategic AI Partnership Introduction"}'::jsonb,
    'manual',
    NOW() - INTERVAL '1 day',
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- Add pending actions to demonstrate dashboard functionality
INSERT INTO public.actions (
  id, 
  user_id, 
  action_type, 
  title, 
  description, 
  priority, 
  status, 
  contact_id,
  estimated_duration_minutes,
  action_data,
  created_source,
  created_at, 
  updated_at
)
VALUES
  -- POGs (Packets of Generosity) - 5 actions
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'deliver_pog',
    'Facilitate AI Partnership Introduction',
    'Connect Sarah Chen with Marcus Rodriguez - their AI partnership needs are perfectly complementary',
    'high',
    'pending',
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    15,
    '{"type": "introduction", "value_proposition": "AI/ML strategic partnership", "urgency": "high"}'::jsonb,
    'ai_suggestion',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  ),
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'make_introduction',
    'Connect Jennifer with Board Candidate',
    'Introduce Jennifer Walsh to promising startup seeking experienced board member',
    'high',
    'pending',
    'a3333333-89ab-cdef-0123-456789abcdef'::uuid,
    12,
    '{"type": "board_opportunity", "sector": "fintech", "stage": "Series B"}'::jsonb,
    'ai_suggestion',
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '4 hours'
  ),
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'share_content',
    'Share AI Ethics Research with Dr. Patel',
    'Forward relevant AI bias mitigation paper that aligns with his current research',
    'medium',
    'pending',
    'a4444444-89ab-cdef-0123-456789abcdef'::uuid,
    8,
    '{"content_type": "research_paper", "topic": "AI bias mitigation"}'::jsonb,
    'ai_suggestion',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours'
  ),
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'deliver_pog',
    'Provide Technical Co-founder Referral',
    'Share vetted technical co-founder candidates with Sarah for her AI ethics startup',
    'high',
    'pending',
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    20,
    '{"type": "referral", "role": "technical_cofounder", "focus": "AI ethics"}'::jsonb,
    'ai_suggestion',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'make_introduction',
    'Connect Marcus with ML Infrastructure Expert',
    'Introduce Marcus to leading ML infrastructure consultant for scaling guidance',
    'medium',
    'pending',
    'a2222222-89ab-cdef-0123-456789abcdef'::uuid,
    15,
    '{"type": "expert_connection", "domain": "ML infrastructure scaling"}'::jsonb,
    'ai_suggestion',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),

  -- ASKS (Strategic requests) - 4 actions
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'follow_up_ask',
    'Follow up on Board Position Discussion',
    'Check in with Jennifer about the board opportunity she mentioned exploring',
    'high',
    'pending',
    'a3333333-89ab-cdef-0123-456789abcdef'::uuid,
    10,
    '{"context": "board positioning opportunity", "timing": "perfect_window"}'::jsonb,
    'ai_suggestion',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours'
  ),
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'follow_up_ask',
    'Request Stanford AI Lab Introduction',
    'Ask Dr. Patel for strategic introductions within Stanford AI research network',
    'medium',
    'pending',
    'a4444444-89ab-cdef-0123-456789abcdef'::uuid,
    12,
    '{"context": "research commercialization", "network": "Stanford AI Lab"}'::jsonb,
    'ai_suggestion',
    NOW() - INTERVAL '5 hours',
    NOW() - INTERVAL '5 hours'
  ),
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'send_follow_up',
    'Follow up on Partnership Discussion',
    'Circle back with Marcus about potential collaboration opportunities discussed',
    'medium',
    'pending',
    'a2222222-89ab-cdef-0123-456789abcdef'::uuid,
    8,
    '{"context": "strategic partnerships", "topic": "ML collaboration"}'::jsonb,
    'ai_suggestion',
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '8 hours'
  ),
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'follow_up_ask',
    'Request Advisory Role Discussion',
    'Ask Sarah about potential advisory role in her AI ethics startup',
    'high',
    'pending',
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    15,
    '{"context": "advisory opportunity", "timing": "startup launch phase"}'::jsonb,
    'ai_suggestion',
    NOW() - INTERVAL '12 hours',
    NOW() - INTERVAL '12 hours'
  ),

  -- MEETINGS (Meeting notes needed) - 3 actions
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'add_meeting_notes',
    'Add Notes from Coffee with Sarah',
    'Capture strategic insights from recent coffee meeting about AI ethics startup',
    'medium',
    'pending',
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    12,
    '{"meeting_type": "coffee_chat", "topics": ["AI ethics", "startup planning", "technical cofounder search"]}'::jsonb,
    'calendar_sync',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
  ),
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'add_meeting_notes',
    'Document Strategic Discussion with Jennifer',
    'Add context from board governance strategy session at Four Seasons',
    'medium',
    'pending',
    'a3333333-89ab-cdef-0123-456789abcdef'::uuid,
    15,
    '{"meeting_type": "strategic_session", "topics": ["board opportunities", "governance", "industry trends"]}'::jsonb,
    'calendar_sync',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'add_meeting_notes',
    'Capture Insights from Marcus Tech Talk',
    'Document key points from Marcus''s presentation on ML infrastructure scaling',
    'low',
    'pending',
    'a2222222-89ab-cdef-0123-456789abcdef'::uuid,
    10,
    '{"meeting_type": "tech_talk", "topics": ["ML infrastructure", "scaling", "team building"]}'::jsonb,
    'calendar_sync',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),

  -- FOLLOW-UPS (Relationship nurturing) - 4 actions
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'reconnect_with_contact',
    'Reconnect with Dr. Patel on Research',
    'Follow up on his AI ethics book progress and offer support',
    'medium',
    'pending',
    'a4444444-89ab-cdef-0123-456789abcdef'::uuid,
    10,
    '{"reconnection_reason": "book_progress_followup", "context": "AI ethics publication"}'::jsonb,
    'backup_automation',
    NOW() - INTERVAL '5 hours',
    NOW() - INTERVAL '5 hours'
  ),
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'schedule_meeting',
    'Schedule Quarterly Check-in with Jennifer',
    'Set up strategic networking session to discuss board opportunities',
    'medium',
    'pending',
    'a3333333-89ab-cdef-0123-456789abcdef'::uuid,
    8,
    '{"meeting_type": "quarterly_checkin", "focus": "strategic_opportunities"}'::jsonb,
    'backup_automation',
    NOW() - INTERVAL '7 hours',
    NOW() - INTERVAL '7 hours'
  ),
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'reconnect_with_contact',
    'Touch Base with Sarah on Marathon Training',
    'Personal connection: check in on her Boston Marathon preparation',
    'low',
    'pending',
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    5,
    '{"reconnection_reason": "personal_interest", "context": "marathon_training"}'::jsonb,
    'backup_automation',
    NOW() - INTERVAL '10 hours',
    NOW() - INTERVAL '10 hours'
  ),
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'schedule_meeting',
    'Plan Technical Deep-dive with Marcus',
    'Schedule session to discuss ML infrastructure challenges and solutions',
    'medium',
    'pending',
    'a2222222-89ab-cdef-0123-456789abcdef'::uuid,
    12,
    '{"meeting_type": "technical_deepdive", "focus": "ML_infrastructure"}'::jsonb,
    'backup_automation',
    NOW() - INTERVAL '14 hours',
    NOW() - INTERVAL '14 hours'
  ),

  -- CONTACTS (Strategic connections to add) - 2 actions
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'add_contact_to_goal',
    'Add Fintech CEO to Network Goal',
    'Add Sarah''s recommended fintech CEO contact to strategic network expansion goal',
    'medium',
    'pending',
    NULL,
    15,
    '{"goal_context": "strategic_network_expansion", "referral_source": "Sarah Chen", "contact_role": "fintech_CEO"}'::jsonb,
    'manual',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours'
  ),
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'add_contact_to_goal',
    'Add AI Researcher to Ethics Goal',
    'Include Dr. Patel''s colleague from MIT AI Lab in AI ethics network goal',
    'low',
    'pending',
    NULL,
    12,
    '{"goal_context": "AI_ethics_network", "referral_source": "Dr. Amit Patel", "contact_role": "AI_researcher"}'::jsonb,
    'manual',
    NOW() - INTERVAL '18 hours',
    NOW() - INTERVAL '18 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- KPI ENHANCEMENT DATA
-- Additional data to support comprehensive relationship portfolio KPIs
-- ==============================================================================

-- Create additional relationship sessions for KPI momentum tracking (12 weeks of data)
INSERT INTO public.relationship_sessions (id, user_id, session_type, duration_minutes, status, completed_at, actions_completed, goal_id, created_at, updated_at)
VALUES
  -- Week 1-4: Building momentum
  (
    'c2222222-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'goal_focused',
    35,
    'completed',
    NOW() - INTERVAL '84 days',
    2,
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,
    NOW() - INTERVAL '84 days',
    NOW() - INTERVAL '84 days'
  ),
  (
    'c3333333-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'goal_focused',
    42,
    'completed',
    NOW() - INTERVAL '77 days',
    3,
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,
    NOW() - INTERVAL '77 days',
    NOW() - INTERVAL '77 days'
  ),
  -- Week 5-8: Network activation (adding a few more sessions)
  (
    'c4444444-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'goal_focused',
    50,
    'completed',
    NOW() - INTERVAL '35 days',
    4,
    'e2222222-89ab-cdef-0123-456789abcdef'::uuid,
    NOW() - INTERVAL '35 days',
    NOW() - INTERVAL '35 days'
  ),
  (
    'c5555555-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'goal_focused',
    45,
    'completed',
    NOW() - INTERVAL '21 days',
    5,
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,
    NOW() - INTERVAL '21 days',
    NOW() - INTERVAL '21 days'
  ),
  (
    'c6666666-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'goal_focused',
    55,
    'completed',
    NOW() - INTERVAL '14 days',
    6,
    'e3333333-89ab-cdef-0123-456789abcdef'::uuid,
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '14 days'
  )
ON CONFLICT (id) DO NOTHING;

-- Create goal milestones for strategic wins KPI
INSERT INTO public.goal_milestones (id, user_id, goal_id, title, description, status, completed_at, order_index, created_at, updated_at)
VALUES
  (
    'f1111111-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'Connected with 10 AI leaders',
    'Reached halfway to target network size in AI/ML space',
    'completed',
    NOW() - INTERVAL '30 days',
    1,
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '30 days'
  ),
  (
    'f2222222-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'Facilitated $2.3M strategic partnership',
    'Sarah-Marcus introduction led to successful partnership agreement',
    'completed',
    NOW() - INTERVAL '1 day',
    2,
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    'f3333333-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'e2222222-89ab-cdef-0123-456789abcdef'::uuid,
    'Board opportunity identified',
    'Jennifer shared unlisted board position at growth startup',
    'completed',
    NOW() - INTERVAL '10 days',
    1,
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '10 days'
  )
ON CONFLICT (id) DO NOTHING;

-- Create loop analytics for reciprocity tracking
INSERT INTO public.loop_analytics (id, user_id, contact_id, loop_artifact_id, loop_type, status_transitions, completion_time_days, reciprocity_impact, success_score, created_at)
VALUES
  (
    'aa111111-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'b3333333-89ab-cdef-0123-456789abcdef'::uuid,
    'INTRODUCTION',
    '{"QUEUED": "2024-07-20", "ACTIVE": "2024-07-21", "COMPLETED": "2024-07-27"}'::jsonb,
    6,
    6.0,
    9.0,
    NOW() - INTERVAL '1 day'
  ),
  (
    'aa222222-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'a3333333-89ab-cdef-0123-456789abcdef'::uuid,
    'b2222222-89ab-cdef-0123-456789abcdef'::uuid,
    'ASK',
    '{"QUEUED": "2024-07-01", "ACTIVE": "2024-07-02", "COMPLETED": "2024-07-18"}'::jsonb,
    14,
    5.2,
    6.0,
    NOW() - INTERVAL '10 days'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- COMPELLING DEMO DATA FOR STRATEGIC WINS KPI
-- Add completed asks and milestones in last 90 days for impressive metrics
-- ============================================================================

-- Add 3 completed asks for Strategic Wins demo (last 90 days)
INSERT INTO actions (
  id, user_id, contact_id, action_type, title, description, status, 
  created_at, updated_at, completed_at, created_source
) VALUES 
  (
    'da111111-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,  -- Sarah Chen
    'follow_up_ask',
    'Introduction to AI Research Team at Stanford',
    'Asked Sarah to introduce me to her contact in Stanford AI Research lab for potential collaboration',
    'completed',
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '40 days', 
    NOW() - INTERVAL '40 days',
    'manual'
  ),
  (
    'da222222-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'a2222222-89ab-cdef-0123-456789abcdef'::uuid,  -- Marcus Rodriguez
    'deliver_pog',
    'Connect Marcus with Series A Investors',
    'Successfully introduced Marcus to two VCs in my network for his upcoming Series A round',
    'completed',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '25 days', 
    'manual'
  ),
  (
    'da333333-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'a3333333-89ab-cdef-0123-456789abcdef'::uuid,  -- Jennifer Walsh
    'make_introduction',
    'Board Advisory Role at FinTech Startup',
    'Jennifer connected me with CEO of promising FinTech company for potential board advisory position',
    'completed',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '55 days',
    NOW() - INTERVAL '55 days',
    'manual'
  )
ON CONFLICT (id) DO NOTHING;

-- Add 4 more completed milestones for impressive demo (total 7 in last 90 days)
INSERT INTO goal_milestones (
  id, user_id, goal_id, title, description, status, target_date,
  created_at, updated_at, completed_at
) VALUES 
  (
    'da444444-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,  -- AI/ML goal
    'Secured Series A Lead Investor',
    'Successfully connected with Andreessen Horowitz partner who expressed strong interest',
    'completed',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '50 days',
    NOW() - INTERVAL '35 days',
    NOW() - INTERVAL '35 days'
  ),
  (
    'da555555-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'e2222222-89ab-cdef-0123-456789abcdef'::uuid,  -- Board positions goal  
    'Strategic Partnership with Microsoft',
    'Finalized partnership agreement through executive connection at Microsoft',
    'completed',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '40 days',
    NOW() - INTERVAL '20 days', 
    NOW() - INTERVAL '20 days'
  ),
  (
    'da666666-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'e3333333-89ab-cdef-0123-456789abcdef'::uuid,  -- AI Ethics goal
    'Advisory Board at Stanford AI Lab',
    'Accepted advisory position through academic network connections',
    'completed',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '70 days',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days'
  ),
  (
    'da777777-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,  -- AI/ML goal
    'Recruited VP of Engineering',
    'Successfully hired top-tier VP Engineering through warm introduction from Jennifer Walsh',
    'completed',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '80 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
  )
ON CONFLICT (id) DO NOTHING;
