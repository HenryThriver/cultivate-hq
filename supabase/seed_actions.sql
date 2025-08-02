-- Seed data for Actions table - creates realistic pending actions
-- This links to existing seed data to create a compelling dashboard experience
-- Note: This only runs locally and does NOT affect production data

-- Note: Using the same user ID from seed.sql
-- User ID: '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'
-- Goals: e1111111, e2222222, e3333333
-- Contacts: a1111111 (Sarah), a2222222 (Marcus), a3333333 (Jennifer), a4444444 (Dr. Amit)
-- Artifacts: b1111111, b2222222, b3333333, b4444444

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
  artifact_id, 
  due_date,
  estimated_duration_minutes,
  action_data,
  created_source,
  notes,
  created_at, 
  updated_at
)
VALUES 
  -- POG Actions (Packets of Generosity)
  (
    'action001-89ab-cdef-0123-456789abcdef'::uuid,
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'deliver_pog',
    'Share AI Infrastructure Whitepaper with Sarah',
    'Send the latest ML infrastructure best practices document that would help with her technical co-founder search',
    'high',
    'pending',
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'b1111111-89ab-cdef-0123-456789abcdef'::uuid,
    NOW() + INTERVAL '2 days',
    15,
    '{"pog_type": "content_sharing", "content_title": "ML Infrastructure Best Practices 2024", "relevance_score": 0.9}'::jsonb,
    'ai_suggestion',
    'Generated from voice memo mentioning her technical co-founder needs',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'action002-89ab-cdef-0123-456789abcdef'::uuid,
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'make_introduction',
    'Introduce Jennifer to Femtech Startup CEO',
    'Connect Jennifer Walsh with Lisa Park (CEO of WellnessTech) - perfect board opportunity match',
    'urgent',
    'pending',
    'e2222222-89ab-cdef-0123-456789abcdef'::uuid,
    'a3333333-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    NOW() + INTERVAL '1 day',
    20,
    '{"introduction_type": "board_opportunity", "mutual_benefit": true, "context": "femtech_investment"}'::jsonb,
    'manual',
    'Perfect match for her board search and femtech investment interests',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    'action003-89ab-cdef-0123-456789abcdef'::uuid,
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'share_content',
    'Send Photography Exhibition Invite to Marcus',
    'Marcus loves photography - invite him to the upcoming tech photography showcase in SF',
    'medium',
    'pending',
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'a2222222-89ab-cdef-0123-456789abcdef'::uuid,
    'b4444444-89ab-cdef-0123-456789abcdef'::uuid,
    NOW() + INTERVAL '5 days',
    10,
    '{"pog_type": "event_invitation", "event_type": "photography", "personal_relevance": true}'::jsonb,
    'ai_suggestion',
    'Based on his photography interest mentioned in LinkedIn profile',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours'
  ),
  (
    'action004-89ab-cdef-0123-456789abcdef'::uuid,
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'deliver_pog',
    'Share Stanford AI Ethics Research with Dr. Patel',
    'Send latest industry report on AI ethics implementation that aligns with his book project',
    'medium',
    'pending',
    'e3333333-89ab-cdef-0123-456789abcdef'::uuid,
    'a4444444-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    NOW() + INTERVAL '1 week',
    12,
    '{"pog_type": "research_sharing", "academic_relevance": true, "book_project_support": true}'::jsonb,
    'ai_suggestion',
    'Supports his AI ethics book and consultancy goals',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
  ),

  -- Ask Actions (Follow-ups and requests)
  (
    'action005-89ab-cdef-0123-456789abcdef'::uuid,
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'follow_up_ask',
    'Follow up on Board Introduction Request to Jennifer',
    'Check in on the board opportunity introduction I requested last month',
    'high',
    'pending',
    'e2222222-89ab-cdef-0123-456789abcdef'::uuid,
    'a3333333-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    NOW() + INTERVAL '2 days',
    8,
    '{"ask_type": "introduction", "original_request_date": "2024-06-15", "follow_up_number": 1}'::jsonb,
    'backup_automation',
    'Original ask sent 6 weeks ago, appropriate time for gentle follow-up',
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '4 hours'
  ),
  (
    'action006-89ab-cdef-0123-456789abcdef'::uuid,
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'send_follow_up',
    'Follow up on AI Partnership Discussion with Sarah',
    'Circle back on the partnership opportunities we discussed - she mentioned having more ideas',
    'medium',
    'pending',
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'b1111111-89ab-cdef-0123-456789abcdef'::uuid,
    NOW() + INTERVAL '3 days',
    15,
    '{"follow_up_type": "partnership_discussion", "previous_context": "voice_memo_analysis"}'::jsonb,
    'ai_suggestion',
    'Voice memo indicated she had more partnership ideas to discuss',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours'
  ),

  -- Meeting Actions
  (
    'action007-89ab-cdef-0123-456789abcdef'::uuid,
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'add_meeting_notes',
    'Add Notes from Coffee with Marcus (July 25)',
    'Capture insights from our discussion about ML infrastructure scaling and team growth',
    'high',
    'pending',
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'a2222222-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    NOW() + INTERVAL '1 day',
    20,
    '{"meeting_date": "2024-07-25", "meeting_type": "coffee", "key_topics": ["ML infrastructure", "team scaling"]}'::jsonb,
    'calendar_sync',
    'Meeting detected from calendar, no substantial notes yet',
    NOW() - INTERVAL '12 hours',
    NOW() - INTERVAL '12 hours'
  ),
  (
    'action008-89ab-cdef-0123-456789abcdef'::uuid,
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'add_meeting_notes',
    'Add Notes from Video Call with Dr. Patel (July 22)',
    'Document our conversation about AI ethics framework and potential collaboration opportunities',
    'medium',
    'pending',
    'e3333333-89ab-cdef-0123-456789abcdef'::uuid,
    'a4444444-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    NOW() + INTERVAL '2 days',
    25,
    '{"meeting_date": "2024-07-22", "meeting_type": "video_call", "key_topics": ["AI ethics", "collaboration"]}'::jsonb,
    'calendar_sync',
    'Calendar meeting needs detailed notes for relationship context',
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '8 hours'
  ),

  -- Follow-up Actions
  (
    'action009-89ab-cdef-0123-456789abcdef'::uuid,
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'reconnect_with_contact',
    'Reconnect with Jennifer Walsh',
    'It has been 6 weeks since our last interaction - time for a strategic check-in',
    'medium',
    'pending',
    'e2222222-89ab-cdef-0123-456789abcdef'::uuid,
    'a3333333-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    NOW() + INTERVAL '1 week',
    15,
    '{"last_interaction": "2024-06-10", "reconnect_reason": "strategic_check_in", "cadence": "monthly"}'::jsonb,
    'backup_automation',
    'Automated based on monthly reconnection cadence',
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '30 minutes'
  ),
  (
    'action010-89ab-cdef-0123-456789abcdef'::uuid,
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'schedule_meeting',
    'Schedule Q3 Strategy Session with Sarah',
    'Book quarterly strategic alignment meeting to discuss AI roadmap and partnership opportunities',
    'high',
    'pending',
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'b1111111-89ab-cdef-0123-456789abcdef'::uuid,
    NOW() + INTERVAL '1 week',
    10,
    '{"meeting_type": "strategic_session", "cadence": "quarterly", "suggested_duration": 60}'::jsonb,
    'ai_suggestion',
    'Based on quarterly strategic meeting pattern and current AI focus',
    NOW() - INTERVAL '45 minutes',
    NOW() - INTERVAL '45 minutes'
  ),

  -- Contact Addition Actions
  (
    'action011-89ab-cdef-0123-456789abcdef'::uuid,
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'add_contact_to_goal',
    'Add 3 AI/ML Leaders to Strategic Network Goal',
    'Research and add contacts from recent AI conference attendee list to expand strategic network',
    'medium',
    'pending',
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    NULL,
    NOW() + INTERVAL '1 week',
    45,
    '{"target_count": 3, "source": "AI_conference_2024", "focus_areas": ["ML infrastructure", "AI strategy", "technical leadership"]}'::jsonb,
    'backup_automation',
    'Goal needs 8 more contacts to reach target of 50',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'action012-89ab-cdef-0123-456789abcdef'::uuid,
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'add_contact_to_goal',
    'Add Board Members to Executive Network Goal',
    'Identify and add 2 board members from Jennifer network to expand executive connections',
    'low',
    'pending',
    'e2222222-89ab-cdef-0123-456789abcdef'::uuid,
    'a3333333-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    NOW() + INTERVAL '2 weeks',
    30,
    '{"target_count": 2, "source": "jennifer_network", "focus_areas": ["board governance", "executive leadership"]}'::jsonb,
    'ai_suggestion',
    'Leverage Jennifer\'s board network for goal expansion',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
  ),

  -- Additional POGs for variety
  (
    'action013-89ab-cdef-0123-456789abcdef'::uuid,
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'make_introduction',
    'Introduce Dr. Patel to AI Ethics Consultant',
    'Connect Dr. Patel with Maria Santos, AI ethics consultant, for his book project collaboration',
    'medium',
    'pending',
    'e3333333-89ab-cdef-0123-456789abcdef'::uuid,
    'a4444444-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    NOW() + INTERVAL '1 week',
    18,
    '{"introduction_type": "collaboration", "mutual_benefit": true, "context": "book_project"}'::jsonb,
    'manual',
    'Support his AI ethics book project with expert collaboration',
    NOW() - INTERVAL '20 minutes',
    NOW() - INTERVAL '20 minutes'
  ),
  (
    'action014-89ab-cdef-0123-456789abcdef'::uuid,
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'share_content',
    'Share Marathon Training App with Sarah',
    'Send recommendation for the new AI-powered marathon training app - perfect for her Boston training',
    'low',
    'pending',
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    NOW() + INTERVAL '1 week',
    8,
    '{"pog_type": "app_recommendation", "personal_relevance": true, "interest": "marathon_running"}'::jsonb,
    'ai_suggestion',
    'Based on her marathon running interest and AI background',
    NOW() - INTERVAL '10 minutes',
    NOW() - INTERVAL '10 minutes'
  ),

  -- One more meeting action
  (
    'action015-89ab-cdef-0123-456789abcdef'::uuid,
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'add_meeting_notes',
    'Add Notes from Jennifer\'s Wine Tasting Event (July 20)',
    'Capture networking insights and board opportunity discussions from the Tuscany wine event',
    'medium',
    'pending',
    'e2222222-89ab-cdef-0123-456789abcdef'::uuid,
    'a3333333-89ab-cdef-0123-456789abcdef'::uuid,
    NULL,
    NOW() + INTERVAL '3 days',
    15,
    '{"meeting_date": "2024-07-20", "event_type": "wine_tasting", "networking_context": true}'::jsonb,
    'calendar_sync',
    'Social event with strategic networking value - needs documentation',
    NOW() - INTERVAL '5 minutes',
    NOW() - INTERVAL '5 minutes'
  )

ON CONFLICT (id) DO NOTHING;

-- Update the actions table to have some assigned to previous sessions for realistic history
-- This creates a mix of assigned and unassigned actions
UPDATE public.actions 
SET session_id = 'c1111111-89ab-cdef-0123-456789abcdef'::uuid,
    status = 'completed',
    completed_at = NOW() - INTERVAL '1 day'
WHERE id IN ('action001-89ab-cdef-0123-456789abcdef'::uuid, 'action007-89ab-cdef-0123-456789abcdef'::uuid);

-- Add some older completed actions for momentum tracking
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
  completed_at,
  estimated_duration_minutes,
  created_source,
  created_at, 
  updated_at
)
VALUES 
  (
    'action016-89ab-cdef-0123-456789abcdef'::uuid,
    '0fa5e172-1cc0-4c5e-aca5-d2f43a3ce8f0'::uuid,
    'deliver_pog',
    'Successfully Introduced Sarah to Marcus',
    'Completed introduction that led to $2.3M partnership - major relationship win!',
    'urgent',
    'completed',
    'e1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'a1111111-89ab-cdef-0123-456789abcdef'::uuid,
    'c1111111-89ab-cdef-0123-456789abcdef'::uuid,
    NOW() - INTERVAL '1 day',
    25,
    'manual',
    NOW() - INTERVAL '1 week',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;