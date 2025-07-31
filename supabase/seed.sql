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
  aud
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
  'authenticated'
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

-- Insert executive-level contacts
INSERT INTO public.contacts (id, user_id, name, linkedin_url, professional_context, personal_context, created_at, updated_at)
VALUES 
  (
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'Sarah Chen',
    'https://linkedin.com/in/sarahchen',
    '{
      "current_role": "VP Product",
      "current_company": "TechFlow Dynamics", 
      "expertise_areas": ["AI/ML Strategy", "Product-Led Growth", "B2B SaaS"],
      "goals": ["Strategic partnerships in AI space", "Board positions at emerging tech companies"],
      "networking_objectives": ["Find technical co-founder for side project", "Connect with AI researchers"],
      "opportunities_to_help": ["Introduction to VCs", "Product strategy insights", "Team building advice"]
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
    '2024-01-15'::timestamp,
    '2024-07-20'::timestamp
  ),
  (
    'a2222222-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'Marcus Rodriguez',
    'https://linkedin.com/in/marcusrodriguez',
    '{
      "current_role": "Chief Technology Officer",
      "current_company": "InnovateAI Solutions",
      "expertise_areas": ["Machine Learning Infrastructure", "Technical Leadership", "Startup Scaling"],
      "goals": ["IPO preparation", "Expand engineering team globally"],
      "networking_objectives": ["Connect with technical talent", "Find strategic partnerships"],
      "opportunities_to_help": ["Technical due diligence", "Engineering culture advice", "ML implementation"]
    }'::jsonb,
    '{
      "interests": ["Photography", "Rock climbing", "Mentoring junior developers"],
      "conversation_starters": {
        "professional": ["His thoughts on the future of AI infrastructure", "Scaling engineering teams"],
        "personal": ["Recent climbing trip to Yosemite", "Photography exhibition in SF"]
      }
    }'::jsonb,
    '2024-02-10'::timestamp,
    '2024-07-18'::timestamp
  ),
  (
    'a3333333-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'Jennifer Walsh',
    'https://linkedin.com/in/jenniferwalsh',
    '{
      "current_role": "Former CEO",
      "current_company": "InnovateCorp (Exited)",
      "expertise_areas": ["Corporate Strategy", "M&A", "Board Governance", "Digital Transformation"],
      "goals": ["Board positions at high-growth companies", "Angel investing in femtech"],
      "networking_objectives": ["Connect with promising startups", "Find board opportunities"],
      "opportunities_to_help": ["Strategic advisory", "Executive coaching", "Investor introductions"]
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
    '2024-03-05'::timestamp,
    '2024-07-25'::timestamp
  ),
  (
    'a4444444-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'Dr. Amit Patel',
    'https://linkedin.com/in/drapatel',
    '{
      "current_role": "Director of AI Research",
      "current_company": "Stanford AI Lab",
      "expertise_areas": ["Natural Language Processing", "Ethical AI", "Research Commercialization"],
      "goals": ["Launch AI ethics consultancy", "Publish book on responsible AI"],
      "networking_objectives": ["Connect with industry leaders", "Find commercial applications for research"],
      "opportunities_to_help": ["AI ethics consultation", "Research collaboration", "Technical advisory"]
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
  last_activity_at = NOW() - INTERVAL '1 hour';

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