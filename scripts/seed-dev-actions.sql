-- Seed actions for the dev user
-- This script adds sample actions to demonstrate the relationship session card

-- First, create some contacts if they don't exist
INSERT INTO public.contacts (id, user_id, name, email, linkedin_url, professional_context, personal_context)
VALUES 
  (
    'c1111111-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'Sarah Chen',
    'sarah.chen@techflow.com',
    'https://linkedin.com/in/sarahchen',
    '{
      "current_role": "VP Product",
      "current_company": "TechFlow Dynamics"
    }'::jsonb,
    '{
      "interests": ["Classical music", "Marathon running"]
    }'::jsonb
  ),
  (
    'c2222222-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'Marcus Rodriguez',
    'marcus@innovateai.com',
    'https://linkedin.com/in/marcusrodriguez',
    '{
      "current_role": "CTO",
      "current_company": "InnovateAI Solutions"
    }'::jsonb,
    '{
      "interests": ["Photography", "Rock climbing"]
    }'::jsonb
  ),
  (
    'c3333333-89ab-cdef-0123-456789abcdef'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'Jessica Wu',
    'jessica@venturecap.com',
    'https://linkedin.com/in/jessicawu',
    '{
      "current_role": "Partner",
      "current_company": "Venture Capital Partners"
    }'::jsonb,
    '{
      "interests": ["Board games", "Wine tasting"]
    }'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Create a goal if it doesn't exist
INSERT INTO public.goals (id, user_id, title, description, target_contact_count, status)
VALUES (
  'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
  '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
  'AI Leadership Network',
  'Build relationships with AI/ML leaders for potential partnerships',
  50,
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- Now insert various types of pending actions
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
  created_source
)
VALUES
  -- POG actions
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'deliver_pog',
    'Share AI whitepaper with Sarah',
    'Send the new AI ethics framework whitepaper that aligns with her work',
    'high',
    'pending',
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'c1111111-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    15,
    '{"pog_type": "resource_share", "value": "AI Ethics Framework Whitepaper"}'::jsonb,
    'manual'
  ),
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'make_introduction',
    'Introduce Marcus to potential CTO candidate',
    'Connect Marcus with the senior engineer from my network who''s looking for CTO opportunities',
    'medium',
    'pending',
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'c2222222-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    20,
    '{"introduction_type": "professional", "mutual_benefit": "hiring"}'::jsonb,
    'manual'
  ),

  -- Ask actions
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'follow_up_ask',
    'Follow up with Jessica on funding advice',
    'Check if she had a chance to review our pitch deck and get her feedback',
    'high',
    'pending',
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'c3333333-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    10,
    '{"ask_type": "feedback", "context": "Series A pitch deck"}'::jsonb,
    'manual'
  ),

  -- Meeting notes actions
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'add_meeting_notes',
    'Add notes from Sarah Chen meeting',
    'Document key insights from product strategy discussion yesterday',
    'medium',
    'pending',
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'c1111111-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    20,
    '{"meeting_date": "2025-01-29", "meeting_type": "strategy_discussion"}'::jsonb,
    'calendar_sync'
  ),

  -- Follow-up actions
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'schedule_meeting',
    'Schedule quarterly check-in with Marcus',
    'Set up our regular technical discussion and partnership review',
    'medium',
    'pending',
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'c2222222-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    10,
    '{"meeting_type": "quarterly_review", "topics": ["technical roadmap", "partnership opportunities"]}'::jsonb,
    'manual'
  ),
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'reconnect_with_contact',
    'Reconnect with Jessica Wu',
    'It''s been 3 months since our last conversation - check in on her new fund',
    'low',
    'pending',
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'c3333333-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    15,
    '{"last_contact": "3 months ago", "reason": "new fund launch"}'::jsonb,
    'ai_suggestion'
  ),

  -- Contact actions
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'add_contact_to_goal',
    'Add new AI researcher to network',
    'Met Dr. Kim at the conference - add to AI Leadership Network goal',
    'medium',
    'pending',
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    NULL,
    10,
    '{"contact_name": "Dr. Kim Lee", "met_at": "AI Conference 2025"}'::jsonb,
    'manual'
  ),
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'add_contact_to_goal',
    'Add startup founder to network',
    'Connect with the ML startup founder from LinkedIn',
    'low',
    'pending', 
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    NULL,
    10,
    '{"contact_name": "Alex Thompson", "source": "LinkedIn"}'::jsonb,
    'manual'
  ),

  -- One more POG for good measure
  (
    gen_random_uuid(),
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'share_content',
    'Share ML course with team',
    'Send the Stanford ML course link to Marcus''s engineering team',
    'low',
    'pending',
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'c2222222-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    5,
    '{"content_type": "educational", "resource": "Stanford CS229"}'::jsonb,
    'manual'
  );