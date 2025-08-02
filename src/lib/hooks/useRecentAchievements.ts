import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';

export interface Achievement {
  id: string;
  type: 'goal_completed' | 'loop_completed' | 'milestone_reached' | 'network_growth' | 'reciprocity_milestone';
  title: string;
  description: string;
  timestamp: string;
  value?: string | number;
  contact?: {
    id: string;
    name: string;
    avatar?: string;
  };
  celebrationLevel: 'subtle' | 'moderate' | 'significant';
}

export function useRecentAchievements() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch completed goals
      const { data: completedGoals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', thirtyDaysAgo.toISOString())
        .order('completed_at', { ascending: false })
        .limit(5);

      // Fetch high-value completed actions
      const { data: completedActions } = await supabase
        .from('actions')
        .select(`
          *,
          contact:contacts(id, name),
          goal:goals(title)
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .in('action_type', ['deliver_pog', 'make_introduction', 'follow_up_ask'])
        .gte('completed_at', thirtyDaysAgo.toISOString())
        .order('completed_at', { ascending: false })
        .limit(10);

      // Fetch successful loop completions
      const { data: loopAnalytics } = await supabase
        .from('loop_analytics')
        .select(`
          *,
          contact:contacts(id, name)
        `)
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .gte('success_score', 4.0)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch milestone artifacts
      const { data: milestoneArtifacts } = await supabase
        .from('artifacts')
        .select(`
          *,
          contact:contacts(id, name)
        `)
        .eq('user_id', user.id)
        .eq('type', 'milestone')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      // Transform data into achievements
      const achievements: Achievement[] = [];

      // Process completed goals
      completedGoals?.forEach(goal => {
        achievements.push({
          id: `goal-${goal.id}`,
          type: 'goal_completed',
          title: 'Goal Achieved!',
          description: goal.title,
          timestamp: formatTimestamp(goal.completed_at),
          value: goal.progress_percentage ? `${goal.progress_percentage}%` : undefined,
          celebrationLevel: (goal.priority ?? 0) >= 4 ? 'significant' : 'moderate'
        });
      });

      // Process high-value actions
      completedActions?.forEach(action => {
        const typeMap = {
          'deliver_pog': {
            title: 'Value Delivered',
            type: 'network_growth' as const
          },
          'make_introduction': {
            title: 'Strategic Introduction Made',
            type: 'network_growth' as const
          },
          'follow_up_ask': {
            title: 'Ask Successfully Followed Up',
            type: 'loop_completed' as const
          }
        };

        const mapping = typeMap[action.action_type as keyof typeof typeMap];
        if (mapping) {
          achievements.push({
            id: `action-${action.id}`,
            type: mapping.type,
            title: mapping.title,
            description: action.title,
            timestamp: formatTimestamp(action.completed_at),
            contact: action.contact ? { id: action.contact.id, name: action.contact.name || '' } : undefined,
            celebrationLevel: action.priority === 'urgent' || action.priority === 'high' ? 'moderate' : 'subtle'
          });
        }
      });

      // Process loop analytics
      loopAnalytics?.forEach(loop => {
        // Ensure success score is bounded between 0-5 and format nicely
        const boundedScore = Math.min(Math.max(loop.success_score || 0, 0), 5);
        const scoreDisplay = boundedScore >= 4.5 ? 'Excellent' : 
                           boundedScore >= 4.0 ? 'Great' : 
                           boundedScore >= 3.0 ? 'Good' : 'Completed';
        
        achievements.push({
          id: `loop-${loop.id}`,
          type: 'loop_completed',
          title: 'Loop Successfully Completed',
          description: `${loop.loop_type} completed with excellent results`,
          timestamp: formatTimestamp(loop.created_at),
          value: scoreDisplay,
          contact: loop.contact ? { id: loop.contact.id, name: loop.contact.name || '' } : undefined,
          celebrationLevel: boundedScore >= 4.5 ? 'significant' : 'moderate'
        });
      });

      // Process milestones
      milestoneArtifacts?.forEach(milestone => {
        const metadata = milestone.metadata as Record<string, any>;
        achievements.push({
          id: `milestone-${milestone.id}`,
          type: 'milestone_reached',
          title: 'Milestone Reached',
          description: metadata?.description || milestone.content || 'Important milestone achieved',
          timestamp: formatTimestamp(milestone.created_at),
          contact: milestone.contact ? { id: milestone.contact.id, name: milestone.contact.name || '' } : undefined,
          celebrationLevel: 'moderate'
        });
      });

      // Sort by timestamp and limit to top 10
      return achievements
        .sort((a, b) => {
          const timeA = parseRelativeTime(a.timestamp);
          const timeB = parseRelativeTime(b.timestamp);
          return timeB - timeA;
        })
        .slice(0, 10);
    },
    enabled: !!user?.id,
    refetchInterval: 60000 // Refresh every minute
  });
}

function formatTimestamp(timestamp: string | null): string {
  if (!timestamp) return 'Recently';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function parseRelativeTime(timestamp: string): number {
  // Parse timestamps like "3 hours ago" back to milliseconds for sorting
  const now = Date.now();
  const match = timestamp.match(/(\d+)\s+(minute|hour|day|week)s?\s+ago/);
  
  if (!match) {
    // If it's a date string, parse it
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? now : date.getTime();
  }

  const [, amount, unit] = match;
  const value = parseInt(amount);
  
  const multipliers = {
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000
  };

  return now - (value * multipliers[unit as keyof typeof multipliers]);
}