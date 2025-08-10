'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { startOfWeek, subDays } from 'date-fns';

interface PortfolioKPIs {
  relationshipMomentum: {
    actionsCompleted: number;
    sessionsCompleted: number;
    currentStreak: number;
    weeklyTrend: number[];
  };
  portfolioActivation: {
    responseRate: number;
    connectedContacts: number;
    reachedOutTo: number;
    weeklyTrend: number[];
  };
  relationshipDepth: {
    qualityIndex: number;
    strategicContacts: number;
    weeklyTrend: number[];
  };
  strategicWins: {
    asksCompleted: number;
    milestonesAchieved: number;
    avgGoalProgress: number;
    weeklyTrend: number[];
  };
}

export function usePortfolioKPIs() {
  return useQuery<PortfolioKPIs>({
    queryKey: ['portfolio-kpis'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const endDate = new Date();
      const startDate = subDays(endDate, 90); // Last quarter

      try {
        // Fetch all KPIs in parallel
        const [momentum, activation, depth, wins] = await Promise.all([
          calculateRelationshipMomentum(user.id, startDate, endDate),
          calculatePortfolioActivation(user.id, startDate, endDate),
          calculateRelationshipDepth(user.id),
          calculateStrategicWins(user.id, startDate, endDate),
        ]);

        return {
          relationshipMomentum: momentum,
          portfolioActivation: activation,
          relationshipDepth: depth,
          strategicWins: wins,
        };
      } catch (error) {
        console.error('Error fetching KPIs:', error);
        
        // Return fallback data on error
        return {
          relationshipMomentum: {
            actionsCompleted: 0,
            sessionsCompleted: 0,
            currentStreak: 0,
            weeklyTrend: Array(12).fill(0),
          },
          portfolioActivation: {
            responseRate: 0,
            connectedContacts: 0,
            reachedOutTo: 0,
            weeklyTrend: Array(12).fill(0),
          },
          relationshipDepth: {
            qualityIndex: 0,
            strategicContacts: 0,
            weeklyTrend: Array(12).fill(0),
          },
          strategicWins: {
            asksCompleted: 0,
            milestonesAchieved: 0,
            avgGoalProgress: 0,
            weeklyTrend: Array(12).fill(0),
          },
        };
      }
    },
    refetchInterval: 300000, // Refresh every 5 minutes (reduced from 1 minute)
  });
}

async function calculateRelationshipMomentum(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  // Actions completed in the period
  const { data: actions, error: actionsError } = await supabase
    .from('actions')
    .select('id, completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', startDate.toISOString())
    .lte('completed_at', endDate.toISOString());

  if (actionsError) throw actionsError;

  // Sessions completed in the period
  const { data: sessions, error: sessionsError } = await supabase
    .from('relationship_sessions')
    .select('id, completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', startDate.toISOString())
    .lte('completed_at', endDate.toISOString());

  if (sessionsError) throw sessionsError;

  // Calculate weekly trend
  const weeklyTrend = calculateWeeklyTrend(actions || [], 'completed_at', 12);

  // Calculate current streak (consecutive weeks with activity)
  const currentStreak = calculateActivityStreak(actions || []);

  return {
    actionsCompleted: actions?.length || 0,
    sessionsCompleted: sessions?.length || 0,
    currentStreak,
    weeklyTrend,
  };
}

async function calculatePortfolioActivation(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  // Get outreach actions (match actual action types in database)
  const { data: outreachActions, error: outreachError } = await supabase
    .from('actions')
    .select('contact_id')
    .eq('user_id', userId)
    .in('action_type', ['deliver_pog', 'follow_up_ask', 'send_follow_up', 'reconnect_with_contact', 'make_introduction', 'schedule_meeting'])
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (outreachError) throw outreachError;

  const reachedOutContacts = new Set(outreachActions?.map(a => a.contact_id) || []);

  // Get connections (artifacts from contacts we reached out to)
  const { data: connections, error: connectionsError } = await supabase
    .from('artifacts')
    .select('contact_id, created_at')
    .eq('user_id', userId)
    .in('type', ['email', 'meeting', 'voice_memo', 'linkedin_message'])
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (connectionsError) throw connectionsError;

  const connectedContacts = new Set(
    connections?.filter(c => reachedOutContacts.has(c.contact_id))
      .map(c => c.contact_id) || []
  );

  const responseRate = reachedOutContacts.size > 0
    ? (connectedContacts.size / reachedOutContacts.size) * 100
    : 0;

  // Calculate weekly trend for connections (simpler approach)
  const weeklyTrend = calculateWeeklyTrend(
    connections || [],
    'created_at',
    12
  );

  return {
    responseRate: Math.round(responseRate),
    connectedContacts: connectedContacts.size,
    reachedOutTo: reachedOutContacts.size,
    weeklyTrend: weeklyTrend,
  };
}

async function calculateRelationshipDepth(userId: string) {
  // Get user's email to exclude self-contacts
  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email;

  // Get all contacts for this user (excluding self-contacts)
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('id, relationship_score, email')
    .eq('user_id', userId)
    .or(`email.is.null,email.neq.${userEmail}`); // Include NULL emails but exclude self-contacts

  if (error) throw error;
  if (!contacts || contacts.length === 0) {
    return {
      qualityIndex: 0,
      strategicContacts: 0,
      weeklyTrend: generateGrowthTrend(0, 12, 0.05),
    };
  }

  const contactIds = contacts.map(c => c.id);
  const ninetyDaysAgo = subDays(new Date(), 90).toISOString();

  // Batch query 1: Get all interaction counts for all contacts at once
  const { data: interactions } = await supabase
    .from('artifacts')
    .select('contact_id, created_at')
    .in('contact_id', contactIds)
    .gte('created_at', ninetyDaysAgo);

  // Count interactions per contact
  const interactionCounts = new Map<string, number>();
  interactions?.forEach(interaction => {
    const count = interactionCounts.get(interaction.contact_id) || 0;
    interactionCounts.set(interaction.contact_id, count + 1);
  });

  // Loop analytics was deprecated - skip reciprocity calculations
  const reciprocityByContact = new Map<string, number>();
  
  // Set default reciprocity score for all contacts since loop analytics is deprecated
  contacts.forEach(contact => {
    reciprocityByContact.set(contact.id, 5); // Default neutral score
  });

  // Calculate composite scores for all contacts
  let totalScore = 0;
  let count = 0;

  for (const contact of contacts) {
    const interactionCount = interactionCounts.get(contact.id) || 0;
    const avgReciprocity = reciprocityByContact.get(contact.id) || 5;

    // Calculate composite score
    const frequencyScore = Math.min(interactionCount * 2, 10);
    const reciprocityScore = avgReciprocity;
    const manualScore = contact.relationship_score || 5;

    const compositeScore = (frequencyScore * 0.4) + (reciprocityScore * 0.3) + (manualScore * 0.3);
    
    totalScore += compositeScore;
    count++;
  }

  const qualityIndex = count > 0 ? totalScore / count : 0;

  // For now, return static trend - would calculate historical in production
  const weeklyTrend = generateGrowthTrend(qualityIndex, 12, 0.05);

  return {
    qualityIndex: Math.round(qualityIndex * 10) / 10,
    strategicContacts: count,
    weeklyTrend,
  };
}

async function calculateStrategicWins(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  // Get asks completed (match actual action types)
  const { data: completedAsks, error: asksError } = await supabase
    .from('actions')
    .select('id, completed_at')
    .eq('user_id', userId)
    .in('action_type', ['follow_up_ask', 'deliver_pog', 'make_introduction'])
    .eq('status', 'completed')
    .gte('completed_at', startDate.toISOString())
    .lte('completed_at', endDate.toISOString());

  if (asksError) throw asksError;

  // Get milestones achieved
  const { data: milestones, error: milestonesError } = await supabase
    .from('goal_milestones')
    .select('id, completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', startDate.toISOString())
    .lte('completed_at', endDate.toISOString());

  if (milestonesError) throw milestonesError;

  // Get average goal progress
  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select('progress_percentage')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (goalsError) throw goalsError;

  const avgProgress = goals?.length
    ? goals.reduce((sum, g) => sum + (g.progress_percentage || 0), 0) / goals.length
    : 0;

  // Calculate weekly trend
  const weeklyTrend = calculateWeeklyTrend(
    [...(completedAsks || []), ...(milestones || [])],
    'completed_at',
    12
  );

  return {
    asksCompleted: completedAsks?.length || 0,
    milestonesAchieved: milestones?.length || 0,
    avgGoalProgress: Math.round(avgProgress),
    weeklyTrend,
  };
}

// Helper functions
function calculateWeeklyTrend(
  items: Array<{ completed_at?: string | null } | { created_at?: string | null }>,
  dateField: string,
  weeks: number
): number[] {
  const trend: number[] = new Array(weeks).fill(0);
  const now = new Date();

  items.forEach(item => {
    const date = item[dateField as keyof typeof item];
    if (date && typeof date === 'string') {
      const itemDate = new Date(date);
      const weeksAgo = Math.floor((now.getTime() - itemDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (weeksAgo >= 0 && weeksAgo < weeks) {
        trend[weeks - 1 - weeksAgo]++;
      }
    }
  });

  return trend;
}

function calculateActivityStreak(actions: Array<{ completed_at?: string | null }>): number {
  if (!actions.length) return 0;
  
  // Sort actions by completion date (most recent first)
  const sortedActions = actions
    .filter(action => action.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());
  
  if (!sortedActions.length) return 0;
  
  // Get unique weeks with activity
  const activeWeeks = new Set<string>();
  sortedActions.forEach(action => {
    const week = startOfWeek(new Date(action.completed_at!)).toISOString();
    activeWeeks.add(week);
  });
  
  // Convert to sorted array (most recent first)
  const sortedWeeks = Array.from(activeWeeks).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  // Count consecutive weeks from most recent activity
  let streak = 1; // Start with 1 since we have at least one week of activity
  
  for (let i = 1; i < sortedWeeks.length; i++) {
    const currentWeek = new Date(sortedWeeks[i - 1]);
    const nextWeek = new Date(sortedWeeks[i]);
    
    // Check if the weeks are consecutive (7 days apart)
    const daysDiff = Math.abs(currentWeek.getTime() - nextWeek.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff <= 7) {
      streak++;
    } else {
      break; // End of consecutive streak
    }
  }
  
  return streak;
}

// Removed unused function calculateWeeklyResponseRates

function generateGrowthTrend(
  currentValue: number,
  weeks: number,
  growthRate: number
): number[] {
  const trend: number[] = [];
  
  for (let i = weeks - 1; i >= 0; i--) {
    const value = currentValue * Math.pow(1 - growthRate, i);
    trend.push(Math.round(value * 10) / 10);
  }

  return trend;
}