-- Seed minimal data for dev user to test relationship session card

-- Create some contacts (avoiding self-contact issue)
INSERT INTO public.contacts (id, user_id, name, email, linkedin_url, is_self_contact)
VALUES 
  (
    'c1111111-0000-0000-0000-000000000001'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'Sarah Chen',
    'sarah.chen@techflow.com',
    'https://linkedin.com/in/sarahchen',
    false
  ),
  (
    'c2222222-0000-0000-0000-000000000002'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'Marcus Rodriguez',
    'marcus@innovateai.com',
    'https://linkedin.com/in/marcusrodriguez',
    false
  ),
  (
    'c3333333-0000-0000-0000-000000000003'::uuid,
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'Jessica Wu',
    'jessica@venturecap.com',
    'https://linkedin.com/in/jessicawu',
    false
  )
ON CONFLICT (id) DO NOTHING;

-- Create a goal
INSERT INTO public.goals (id, user_id, title, description, target_contact_count, status)
VALUES (
  'a1111111-0000-0000-0000-000000000001'::uuid,
  '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
  'AI Leadership Network',
  'Build relationships with AI/ML leaders',
  50,
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- Create pending actions to show in the session card
INSERT INTO public.actions (
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
  created_source
)
VALUES
  -- POGs (3)
  (
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'deliver_pog',
    'Share AI whitepaper with Sarah',
    'Send the new AI ethics framework whitepaper',
    'high',
    'pending',
    'a1111111-0000-0000-0000-000000000001'::uuid,
    'c1111111-0000-0000-0000-000000000001'::uuid,
    NULL,
    15,
    'manual'
  ),
  (
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'make_introduction',
    'Introduce Marcus to CTO candidate',
    'Connect Marcus with senior engineer',
    'medium',
    'pending',
    'a1111111-0000-0000-0000-000000000001'::uuid,
    'c2222222-0000-0000-0000-000000000002'::uuid,
    NULL,
    20,
    'manual'
  ),
  (
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'share_content',
    'Share ML course with team',
    'Send Stanford ML course to Marcus team',
    'low',
    'pending',
    'a1111111-0000-0000-0000-000000000001'::uuid,
    'c2222222-0000-0000-0000-000000000002'::uuid,
    NULL,
    5,
    'manual'
  ),

  -- Asks (2)
  (
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'follow_up_ask',
    'Follow up on funding advice',
    'Check with Jessica on pitch deck feedback',
    'high',
    'pending',
    'a1111111-0000-0000-0000-000000000001'::uuid,
    'c3333333-0000-0000-0000-000000000003'::uuid,
    NULL,
    10,
    'manual'
  ),
  (
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'send_follow_up',
    'Follow up on intro request',
    'Check if Sarah can intro to her VP Engineering',
    'medium',
    'pending',
    'a1111111-0000-0000-0000-000000000001'::uuid,
    'c1111111-0000-0000-0000-000000000001'::uuid,
    NULL,
    10,
    'manual'
  ),

  -- Meetings (1)
  (
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'add_meeting_notes',
    'Add notes from Sarah meeting',
    'Document product strategy discussion',
    'medium',
    'pending',
    'a1111111-0000-0000-0000-000000000001'::uuid,
    'c1111111-0000-0000-0000-000000000001'::uuid,
    NULL,
    20,
    'calendar_sync'
  ),

  -- Follow-ups (2)
  (
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'schedule_meeting',
    'Schedule quarterly check-in',
    'Set up review with Marcus',
    'medium',
    'pending',
    'a1111111-0000-0000-0000-000000000001'::uuid,
    'c2222222-0000-0000-0000-000000000002'::uuid,
    NULL,
    10,
    'manual'
  ),
  (
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'reconnect_with_contact',
    'Reconnect with Jessica',
    'Check in on her new fund launch',
    'low',
    'pending',
    'a1111111-0000-0000-0000-000000000001'::uuid,
    'c3333333-0000-0000-0000-000000000003'::uuid,
    NULL,
    15,
    'ai_suggestion'
  ),

  -- Contacts (1)
  (
    '051032c6-d1cd-4eb4-8b85-33e961fed18b'::uuid,
    'add_contact_to_goal',
    'Add AI researcher to network',
    'Met Dr. Kim at conference',
    'medium',
    'pending',
    'a1111111-0000-0000-0000-000000000001'::uuid,
    NULL,
    NULL,
    10,
    'manual'
  );