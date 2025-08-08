import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { MeetingArtifact, POGArtifact, AskArtifact } from '@/types/artifact';

interface UpcomingMeeting {
  meeting: MeetingArtifact;
  agenda: {
    pogs: POGArtifact[];
    asks: AskArtifact[];
    conversationStarters: string[];
    recentTopics: string[];
  };
}

async function fetchUpcomingMeeting(contactId: string): Promise<UpcomingMeeting | null> {
  try {
    // First, get upcoming meetings for the contact
    const { data: meetings, error: meetingError } = await supabase
      .from('artifacts')
      .select('*')
      .eq('contact_id', contactId)
      .eq('type', 'meeting')
      .gte('timestamp', new Date().toISOString())
      .order('timestamp', { ascending: true })
      .limit(1);

    if (meetingError || !meetings || meetings.length === 0) {
      return null;
    }

    const upcomingMeeting = meetings[0] as MeetingArtifact;

    // Get contact's personal and professional context for conversation starters
    const { data: contact } = await supabase
      .from('contacts')
      .select('personal_context, professional_context')
      .eq('id', contactId)
      .single();

    // Fetch active POGs and Asks for agenda building
    const { data: pogs } = await supabase
      .from('artifacts')
      .select('*')
      .eq('contact_id', contactId)
      .eq('type', 'pog')
      .or('metadata->>status.eq.offered,metadata->>status.eq.in_progress')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: asks } = await supabase
      .from('artifacts')
      .select('*')
      .eq('contact_id', contactId)
      .eq('type', 'ask')
      .or('metadata->>status.eq.requested,metadata->>status.eq.in_progress')
      .order('created_at', { ascending: false })
      .limit(5);

    // Fetch recent artifacts for conversation starters
    const { data: recentArtifacts } = await supabase
      .from('artifacts')
      .select('*')
      .eq('contact_id', contactId)
      .in('type', ['voice_memo', 'meeting', 'email'])
      .order('timestamp', { ascending: false })
      .limit(5);

    // Build conversation starters based on contact context and recent interactions
    const conversationStarters: string[] = [];
    const recentTopics: string[] = [];

    // Prioritize conversation starters from contact's personal and professional context
    if (contact?.personal_context) {
      const personalContext = contact.personal_context as any;
      if (personalContext.conversation_starters?.personal) {
        conversationStarters.push(...personalContext.conversation_starters.personal);
      }
      if (personalContext.conversation_starters?.professional) {
        conversationStarters.push(...personalContext.conversation_starters.professional);
      }
    }

    if (contact?.professional_context) {
      const professionalContext = contact.professional_context as any;
      // Add opportunities as conversation topics
      if (professionalContext.opportunities) {
        professionalContext.opportunities.forEach((opp: string) => {
          conversationStarters.push(`Discuss potential collaboration on: ${opp}`);
        });
      }
      // Add goals as conversation topics
      if (professionalContext.goals) {
        professionalContext.goals.forEach((goal: string) => {
          conversationStarters.push(`Ask about progress toward: ${goal}`);
        });
      }
    }

    // Extract topics from recent artifacts for context
    recentArtifacts?.forEach(artifact => {
      if (artifact.ai_insights?.keyTopics) {
        recentTopics.push(...(artifact.ai_insights.keyTopics as string[]));
      }
      // Only add AI conversation starters if we don't have enough from contact context
      if (conversationStarters.length < 5 && artifact.ai_insights?.conversationStarters) {
        conversationStarters.push(...(artifact.ai_insights.conversationStarters as string[]));
      }
    });

    // Only add POG/Ask based starters as last resort if we still don't have enough
    if (conversationStarters.length < 3) {
      pogs?.forEach(pog => {
        const status = pog.metadata?.status;
        const description = pog.metadata?.description || pog.content;
        if (description && status) {
          if (status === 'offered') {
            conversationStarters.push(`Check if they had a chance to review: ${description}`);
          } else if (status === 'in_progress') {
            conversationStarters.push(`Get update on progress with: ${description}`);
          }
        }
      });

      asks?.forEach(ask => {
        const status = ask.metadata?.status;
        const description = ask.metadata?.request_description || ask.content;
        if (description && status) {
          if (status === 'requested') {
            conversationStarters.push(`Follow up on their request for: ${description}`);
          } else if (status === 'in_progress') {
            conversationStarters.push(`Check progress on helping with: ${description}`);
          }
        }
      });
    }

    // Remove duplicates and limit
    const uniqueStarters = [...new Set(conversationStarters)].slice(0, 5);
    const uniqueTopics = [...new Set(recentTopics)].slice(0, 5);

    return {
      meeting: upcomingMeeting,
      agenda: {
        pogs: (pogs || []) as POGArtifact[],
        asks: (asks || []) as AskArtifact[],
        conversationStarters: uniqueStarters,
        recentTopics: uniqueTopics,
      },
    };
  } catch (error) {
    console.error('Error fetching upcoming meeting:', error);
    return null;
  }
}

export const useUpcomingMeeting = (contactId: string | null) => {
  const { data, isLoading, error } = useQuery<UpcomingMeeting | null, Error>({
    queryKey: ['upcoming-meeting', contactId],
    queryFn: () => contactId ? fetchUpcomingMeeting(contactId) : Promise.resolve(null),
    enabled: !!contactId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    upcomingMeeting: data,
    isLoading,
    error,
  };
};