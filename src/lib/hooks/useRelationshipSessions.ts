'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import type { Json } from '@/lib/supabase/database.types';

// ===============================================
// TYPES
// ===============================================

interface CreateSessionAction {
  type: 'add_contact' | 'add_meeting_notes';
  goal_id?: string;
  meeting_artifact_id?: string;
  contact_id?: string;
  title?: string;
  description?: string;
  action_id?: string; // For existing actions
}

// interface SessionAction {
//   id: string;
//   session_id: string;
//   action_type: string;
//   status: string;
//   contact_id?: string;
//   goal_id?: string;
//   meeting_artifact_id?: string;
//   action_data: Record<string, unknown>;
//   completed_at?: string;
//   created_at: string;
//   // Relations
//   contact?: {
//     id: string;
//     name: string;
//     goal_id?: string;
//   };
//   meeting_artifact?: {
//     id: string;
//     metadata: Record<string, unknown>;
//     created_at: string;
//   };
// }

// interface RelationshipSession {
//   id: string;
//   user_id: string;
//   session_type: string;
//   status: string;
//   started_at: string;
//   completed_at?: string;
//   created_at: string;
//   actions: SessionAction[];
// }

// ===============================================
// PENDING ACTIONS ROLL-UP
// ===============================================

interface PendingActionCounts {
  pogs: number;
  asks: number;
  followUps: number;
  meetings: number;
  contacts: number;
}

export function usePendingActions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['pending-actions', user?.id],
    queryFn: async (): Promise<PendingActionCounts> => {
      if (!user) {
        return { pogs: 0, asks: 0, followUps: 0, meetings: 0, contacts: 0 };
      }
      
      const counts = { pogs: 0, asks: 0, followUps: 0, meetings: 0, contacts: 0 };
      
      // Query pending actions from the new actions table
      const { data: actions } = await supabase
        .from('actions')
        .select('action_type')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .is('session_id', null); // Only unassigned actions
      
      // Count actions by type
      (actions || []).forEach(action => {
        switch (action.action_type) {
          case 'deliver_pog':
          case 'make_introduction':
          case 'share_content':
            counts.pogs++;
            break;
          case 'follow_up_ask':
          case 'send_follow_up':
            counts.asks++;
            break;
          case 'reconnect_with_contact':
          case 'schedule_meeting':
            counts.followUps++;
            break;
          case 'add_meeting_notes':
            counts.meetings++;
            break;
          case 'add_contact_to_goal':
            counts.contacts++;
            break;
          default:
            // Other action types don't map to our display categories
            break;
        }
      });
      
      return counts;
    },
    enabled: !!user
  });
}

// ===============================================
// RECENT SESSIONS FOR MOMENTUM DISPLAY
// ===============================================

interface RecentSessionData {
  lastSessionDate: string | null;
  daysSinceLastSession: number | null;
  totalSessions: number;
  averageSessionsPerWeek: number;
  momentumMessage: string;
}

export function useRecentSessions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['recent-sessions', user?.id],
    queryFn: async (): Promise<RecentSessionData> => {
      if (!user) {
        return {
          lastSessionDate: null,
          daysSinceLastSession: null,
          totalSessions: 0,
          averageSessionsPerWeek: 0,
          momentumMessage: 'Ready to start your first relationship-building session?'
        };
      }
      
      // Get recent sessions (last 30 days for average calculation)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: sessions } = await supabase
        .from('relationship_sessions')
        .select('started_at, completed_at, status')
        .eq('user_id', user.id)
        .gte('started_at', thirtyDaysAgo.toISOString())
        .order('started_at', { ascending: false });
      
      const totalSessions = sessions?.length || 0;
      
      // Calculate days since last session
      let daysSinceLastSession: number | null = null;
      let lastSessionDate: string | null = null;
      
      if (sessions && sessions.length > 0) {
        const lastSession = sessions[0];
        lastSessionDate = lastSession.started_at;
        const lastSessionTime = new Date(lastSession.started_at);
        const now = new Date();
        daysSinceLastSession = Math.floor((now.getTime() - lastSessionTime.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      // Calculate average sessions per week (last 30 days)
      const averageSessionsPerWeek = totalSessions > 0 ? (totalSessions / 30) * 7 : 0;
      
      // Generate momentum message
      let momentumMessage = '';
      if (daysSinceLastSession === null) {
        momentumMessage = 'Ready to start your first relationship-building session?';
      } else if (daysSinceLastSession === 0) {
        momentumMessage = 'Great momentum! Ready for another productive session?';
      } else if (daysSinceLastSession <= 2) {
        momentumMessage = 'Excellent consistency! Keep the relationship momentum going.';
      } else if (daysSinceLastSession <= 7) {
        momentumMessage = 'Perfect timing for your next relationship-building session.';
      } else if (daysSinceLastSession <= 14) {
        momentumMessage = 'Your network is ready for some attention. Let\'s reconnect!';
      } else {
        momentumMessage = 'Your relationships are waiting - time to strengthen those connections.';
      }
      
      return {
        lastSessionDate,
        daysSinceLastSession,
        totalSessions,
        averageSessionsPerWeek: Math.round(averageSessionsPerWeek * 10) / 10, // Round to 1 decimal
        momentumMessage
      };
    },
    enabled: !!user
  });
}

// ===============================================
// GOALS FOR RELATIONSHIP BUILDING
// ===============================================

export function useGoalsForRelationshipBuilding() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['goals-relationship-building', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get all active goals with their contact counts and meeting data
      const { data: goals, error } = await supabase
        .from('goals')
        .select(`
          *,
          goal_contacts(
            contact_id,
            contacts!inner(id, name, email)
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');
      
      if (error) throw error;
      
      // Calculate relationship building opportunities for each goal
      const goalsWithOpportunities = await Promise.all(
        (goals || []).map(async (goal) => {
          const contacts = goal.goal_contacts || [];
          const currentCount = contacts.length;
          const targetCount = goal.target_contact_count || 50;
          const needsContacts = currentCount < targetCount;
          
          // Check for meetings needing notes within this goal's contacts
          const contactIds = contacts.map(gc => gc.contact_id);
          let meetingsNeedingNotes = 0;
          
          if (contactIds.length > 0) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const { data: meetings } = await supabase
              .from('artifacts')
              .select('id, content, contact_id')
              .eq('type', 'meeting')
              .in('contact_id', contactIds)
              .gte('created_at', thirtyDaysAgo.toISOString());
            
            // Count meetings without substantial notes/transcript/recording
            meetingsNeedingNotes = (meetings || []).filter(meeting => {
              let meetingContent: Record<string, unknown> = {};
              try {
                meetingContent = typeof meeting.content === 'string' 
                  ? JSON.parse(meeting.content) 
                  : meeting.content || {};
              } catch {
                meetingContent = {};
              }
              
              const hasNotes = meetingContent.notes && typeof meetingContent.notes === 'string' && meetingContent.notes.trim().length > 20;
              const hasTranscript = meetingContent.transcript && typeof meetingContent.transcript === 'string' && meetingContent.transcript.trim().length > 50;
              const hasRecording = meetingContent.recording_url;
              
              return !hasNotes && !hasTranscript && !hasRecording;
            }).length;
          }
          
          // Calculate total opportunities
          const totalOpportunities = (needsContacts ? 1 : 0) + meetingsNeedingNotes;
          
          return {
            ...goal,
            current_contact_count: currentCount,
            target_contact_count: targetCount,
            needs_contacts: needsContacts,
            meetings_needing_notes: meetingsNeedingNotes,
            total_opportunities: totalOpportunities,
            contacts: contacts.map(gc => gc.contacts)
          };
        })
      );
      
      // Return goals with opportunities, sorted by most opportunities first
      return goalsWithOpportunities
        .filter(goal => goal.total_opportunities > 0)
        .sort((a, b) => b.total_opportunities - a.total_opportunities);
    },
    enabled: !!user
  });
}

// ===============================================
// MEETINGS NEEDING NOTES
// ===============================================

export function useMeetingsNeedingNotes() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['meetings-needing-notes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get meetings from last 30 days that may need context
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: meetings, error } = await supabase
        .from('artifacts')
        .select(`
          id, contact_id, metadata, created_at, content,
          contacts!inner(id, name, goal_id)
        `)
        .eq('type', 'meeting')
        .eq('contacts.user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Filter meetings that need additional context
      const meetingsNeedingNotes = [];
      for (const meeting of meetings || []) {
        // Parse meeting content to check for existing notes/transcript
        let meetingContent: Record<string, unknown> = {};
        try {
          meetingContent = typeof meeting.content === 'string' 
            ? JSON.parse(meeting.content) 
            : meeting.content || {};
        } catch {
          meetingContent = {};
        }
        
        // Check if meeting has minimal context
        const hasNotes = meetingContent.notes && typeof meetingContent.notes === 'string' && meetingContent.notes.trim().length > 20;
        const hasTranscript = meetingContent.transcript && typeof meetingContent.transcript === 'string' && meetingContent.transcript.trim().length > 50;
        const hasRecording = meetingContent.recording_url;
        
        // Meeting needs notes if it lacks substantial context
        if (!hasNotes && !hasTranscript && !hasRecording) {
          meetingsNeedingNotes.push({
            id: meeting.id,
            contact_id: meeting.contact_id,
            metadata: meeting.metadata,
            created_at: meeting.created_at,
            contacts: meeting.contacts
          });
        }
      }
      
      return meetingsNeedingNotes.slice(0, 5); // Limit to 5 most recent
    },
    enabled: !!user
  });
}

// ===============================================
// AVAILABLE SESSION ACTIONS
// ===============================================

// ===============================================
// GOAL-SPECIFIC SESSION ACTIONS
// ===============================================

export function useGoalSessionActions(goalId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['goal-session-actions', goalId, user?.id],
    queryFn: async () => {
      if (!user || !goalId) return [];
      
      const actions: CreateSessionAction[] = [];
      
      // Get goal details with contacts
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .select(`
          *,
          goal_contacts(
            contact_id,
            contacts!inner(id, name, email)
          )
        `)
        .eq('id', goalId)
        .eq('user_id', user.id)
        .single();

      if (goalError || !goal) return [];
      
      const contacts = goal.goal_contacts || [];
      const currentCount = contacts.length;
      const targetCount = goal.target_contact_count || 50;
      
      // Always include "add contact" action if below target
      if (currentCount < targetCount) {
        actions.push({
          type: 'add_contact',
          goal_id: goalId,
          goal_title: goal.title,
          current_count: currentCount,
          target_count: targetCount
        } as CreateSessionAction);
      }
      
      // 1. Get orphaned actions (created during calendar sync)
      const { data: orphanedActions, error: orphanedError } = await supabase
        .from('actions')
        .select(`
          id, action_type, contact_id, artifact_id, action_data, created_at, title, description,
          contacts(id, name),
          artifacts!artifact_id(id, metadata, created_at)
        `)
        .eq('user_id', user.id)
        .eq('goal_id', goalId)
        .eq('status', 'pending')
        .is('session_id', null) // Only orphaned actions
        .order('created_at', { ascending: false });

      if (orphanedError) {
        console.error('Error fetching orphaned actions:', orphanedError);
      } else {
        // Add orphaned actions to the actions list
        (orphanedActions || []).forEach(action => {
          const contactData = action.contacts;
          const artifactData = action.artifacts;
          const actionData = action.action_data;
          
          actions.push({
            type: action.action_type as 'add_contact' | 'add_meeting_notes',
            action_id: action.id, // Track the existing action
            meeting_artifact_id: action.artifact_id || undefined,
            contact_id: action.contact_id || undefined,
            contact_name: contactData?.name || 'Unknown Contact',
            title: action.title,
            description: action.description,
            meeting_title: (actionData && typeof actionData === 'object' && 'meeting_title' in actionData ? actionData.meeting_title as string : undefined) || (artifactData?.metadata && typeof artifactData.metadata === 'object' && 'title' in artifactData.metadata ? artifactData.metadata.title as string : undefined) || 'Meeting',
            meeting_date: artifactData?.created_at || action.created_at,
            created_from: (actionData && typeof actionData === 'object' && 'created_from' in actionData ? actionData.created_from as string : undefined) || 'orphaned'
          } as CreateSessionAction);
        });
      }
      
      // 2. Find additional meetings needing notes for this goal's contacts (fallback)
      if (contacts.length > 0) {
        const contactIds = contacts.map((gc) => gc.contact_id);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: meetings, error: meetingsError } = await supabase
          .from('artifacts')
          .select(`
            id, content, contact_id, metadata, created_at,
            contacts!contact_id(id, name)
          `)
          .eq('type', 'meeting')
          .in('contact_id', contactIds)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (meetingsError) {
          console.error('Error fetching meetings:', meetingsError);
        } else {
          // Filter meetings that need notes and aren't already covered by orphaned actions
          const existingMeetingIds = new Set(
            (orphanedActions || []).map(action => action.artifact_id).filter(Boolean)
          );
          
          (meetings || []).forEach(meeting => {
            // Skip if already covered by orphaned action
            if (existingMeetingIds.has(meeting.id)) return;
            
            let meetingContent: Record<string, unknown> = {};
            let hasStructuredContent = false;
            
            try {
              if (typeof meeting.content === 'string') {
                meetingContent = JSON.parse(meeting.content);
                hasStructuredContent = true;
              } else {
                meetingContent = meeting.content || {};
                hasStructuredContent = true;
              }
            } catch {
              meetingContent = {};
              hasStructuredContent = false;
            }
            
            let needsNotes = false;
            
            if (hasStructuredContent) {
              const hasNotes = meetingContent.notes && typeof meetingContent.notes === 'string' && meetingContent.notes.trim().length > 20;
              const hasTranscript = meetingContent.transcript && typeof meetingContent.transcript === 'string' && meetingContent.transcript.trim().length > 50;
              const hasRecording = meetingContent.recording_url;
              needsNotes = !hasNotes && !hasTranscript && !hasRecording;
            } else {
              const contentStr = typeof meeting.content === 'string' ? meeting.content : '';
              needsNotes = contentStr.length < 100;
            }
            
            if (needsNotes) {
              const meetingMetadata = meeting.metadata;
              const contactData = meeting.contacts;
              
              actions.push({
                type: 'add_meeting_notes',
                meeting_artifact_id: meeting.id,
                contact_id: meeting.contact_id,
                contact_name: contactData?.name || 'Unknown Contact',
                meeting_title: (meetingMetadata && typeof meetingMetadata === 'object' && 'title' in meetingMetadata ? meetingMetadata.title as string : undefined) || 'Meeting',
                meeting_date: meeting.created_at,
                created_from: 'dynamic_detection'
              } as CreateSessionAction);
            }
          });
        }
      }
      
      return actions;
    },
    enabled: !!user && !!goalId
  });
}

// ===============================================
// SESSION MANAGEMENT
// ===============================================

export function useCreateSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (params: { 
      goalId: string; 
      durationMinutes: number; 
      actions: CreateSessionAction[] 
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Create session
      const { data: session, error } = await supabase
        .from('relationship_sessions')
        .insert({ 
          user_id: user.id, 
          session_type: 'goal_focused',
          status: 'active',
          goal_id: params.goalId,
          duration_minutes: params.durationMinutes,
          timer_started_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Handle session actions
      if (params.actions.length > 0) {
        const actionsToCreate: Array<{
          session_id: string;
          user_id: string;
          action_type: string;
          title: string;
          description: string;
          priority: string;
          status: string;
          contact_id?: string;
          goal_id?: string;
          artifact_id?: string;
          estimated_duration_minutes: number;
          action_data: Json;
          created_source: string;
        }> = [];
        const orphanedActionsToUpdate: string[] = [];
        
        for (const action of params.actions) {
          // Check if this action already exists as an orphaned action
          const isOrphanedAction = (action as CreateSessionAction & { action_id?: string }).action_id;
          
          if (isOrphanedAction) {
            // Link existing orphaned action to this session
            orphanedActionsToUpdate.push((action as CreateSessionAction & { action_id: string }).action_id);
          } else {
            // Create new action
            const title = action.title || action.type.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            actionsToCreate.push({
              session_id: session.id,
              user_id: user.id,
              action_type: action.type,
              title: title,
              description: action.description || `Complete ${action.type.replace(/_/g, ' ')} action`,
              priority: 'medium',
              status: 'pending',
              contact_id: action.contact_id,
              goal_id: action.goal_id,
              artifact_id: action.meeting_artifact_id,
              estimated_duration_minutes: 15,
              action_data: {} as Json,
              created_source: 'session_creation'
            });
          }
        }
        
        // Update orphaned actions to link them to this session
        if (orphanedActionsToUpdate.length > 0) {
          const { error: updateError } = await supabase
            .from('actions')
            .update({ session_id: session.id })
            .in('id', orphanedActionsToUpdate);
          
          if (updateError) {
            console.error('Error linking orphaned actions to session:', updateError);
            throw updateError;
          }
        }
        
        // Create new actions
        if (actionsToCreate.length > 0) {
          const { error: actionsError } = await supabase
            .from('actions')
            .insert(actionsToCreate);
          
          if (actionsError) {
            console.error('Error creating new session actions:', actionsError);
            throw actionsError;
          }
        }
      }
      
      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationship-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['goal-session-actions'] });
    }
  });
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: ['relationship-session', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('relationship_sessions')
        .select(`
          *,
          goal:goals(
            id, title, description, target_contact_count,
            goal_contacts(
              contact_id,
              contacts!inner(id, name, email)
            )
          ),
          actions:actions(
            *,
            contact:contacts(id, name),
            artifact:artifacts!artifact_id(id, metadata, created_at),
            goal:goals(
              id, title, description, target_contact_count,
              goal_contacts(
                contact_id,
                contacts!inner(id, name, email)
              )
            )
          )
        `)
        .eq('id', sessionId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId
  });
}

export function useCompleteSessionAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      actionId, 
      status, 
      actionData 
    }: { 
      actionId: string; 
      status: 'completed' | 'skipped'; 
      actionData?: Record<string, unknown>;
    }) => {
      const { error } = await supabase
        .from('actions')
        .update({
          status,
          action_data: (actionData || {}) as Json,
          completed_at: new Date().toISOString(),
          completed_by_user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', actionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate session queries
      queryClient.invalidateQueries({ 
        queryKey: ['relationship-session'],
        predicate: (query) => {
          // Invalidate any session query since we don't know which session this action belongs to
          return query.queryKey[0] === 'relationship-session';
        }
      });
    }
  });
} 