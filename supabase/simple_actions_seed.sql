-- Simple actions seed data for testing dashboard
INSERT INTO public.actions (
  user_id, 
  action_type, 
  title, 
  description, 
  priority, 
  status, 
  estimated_duration_minutes,
  created_source,
  created_at, 
  updated_at
)
VALUES
  -- POG Actions
  (
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'deliver_pog',
    'Share AI Infrastructure Whitepaper',
    'Send the latest ML infrastructure best practices document',
    'high',
    'pending',
    15,
    'ai_suggestion',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  ),
  (
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'make_introduction',
    'Introduce Jennifer to Femtech CEO',
    'Connect Jennifer Walsh with Lisa Park - perfect board opportunity match',
    'urgent',
    'pending',
    20,
    'manual',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  
  -- Ask Actions
  (
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'follow_up_ask',
    'Follow up on Board Introduction Request',
    'Check in on the board opportunity introduction requested last month',
    'high',
    'pending',
    8,
    'backup_automation',
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '4 hours'
  ),
  (
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'send_follow_up',
    'Follow up on AI Partnership Discussion',
    'Circle back on the partnership opportunities discussed',
    'medium',
    'pending',
    15,
    'ai_suggestion',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours'
  ),
  
  -- Meeting Actions
  (
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'add_meeting_notes',
    'Add Notes from Coffee with Marcus',
    'Capture insights from discussion about ML infrastructure scaling',
    'high',
    'pending',
    20,
    'calendar_sync',
    NOW() - INTERVAL '12 hours',
    NOW() - INTERVAL '12 hours'
  ),
  (
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'add_meeting_notes',
    'Add Notes from Video Call with Dr. Patel',
    'Document conversation about AI ethics framework and collaboration',
    'medium',
    'pending',
    25,
    'calendar_sync',
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '8 hours'
  ),
  
  -- Follow-up Actions
  (
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'reconnect_with_contact',
    'Reconnect with Jennifer Walsh',
    'Strategic check-in after 6 weeks since last interaction',
    'medium',
    'pending',
    15,
    'backup_automation',
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '30 minutes'
  ),
  (
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'schedule_meeting',
    'Schedule Q3 Strategy Session',
    'Book quarterly strategic alignment meeting to discuss AI roadmap',
    'high',
    'pending',
    10,
    'ai_suggestion',
    NOW() - INTERVAL '45 minutes',
    NOW() - INTERVAL '45 minutes'
  ),
  
  -- Contact Actions
  (
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'add_contact_to_goal',
    'Add 3 AI/ML Leaders to Strategic Network',
    'Research and add contacts from recent AI conference attendee list',
    'medium',
    'pending',
    45,
    'backup_automation',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  )
ON CONFLICT (id) DO NOTHING;