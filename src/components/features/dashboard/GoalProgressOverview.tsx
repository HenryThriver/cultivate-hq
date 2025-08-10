'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp as ProgressIcon,
  Flag as GoalIcon,
  Star as PrimaryIcon,
  Launch as LaunchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';

interface Goal {
  id: string;
  title: string;
  status: string;
  category: string | null;
  progress_percentage?: number | null;
  is_primary: boolean | null;
  target_date?: string | null;
  target_contact_count?: number | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  description?: string | null;
  timeline?: string | null;
  success_criteria?: string | null;
  priority?: number | null;
  tags?: string[] | null;
  notes?: string | null;
  voice_memo_id?: string | null;
  created_from?: string | null;
  completed_at?: string | null;
}

interface GoalStats {
  contactsCount: number;
  actionsCompleted: number;
  actionsTotal: number;
  milestonesCompleted: number;
  milestonesTotal: number;
}

export const GoalProgressOverview: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const { data: goalsData, isLoading, error } = useQuery({
    queryKey: ['dashboard-goals', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Fetch active goals
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(4); // Show top 4 goals

      if (goalsError) throw goalsError;

      // Batch fetch stats for all goals (fixing N+1 query anti-pattern)
      const goalIds = (goals || []).map(g => g.id);
      const goalStats: Record<string, GoalStats> = {};
      
      if (goalIds.length > 0) {
        // Batch query 1: All goal contacts for all goals
        const { data: allGoalContacts } = await supabase
          .from('goal_contacts')
          .select('goal_id')
          .eq('user_id', user.id)
          .in('goal_id', goalIds)
          .eq('status', 'active');
        
        // Batch query 2: All actions for all goals
        const { data: allActions } = await supabase
          .from('actions')
          .select('goal_id, status')
          .eq('user_id', user.id)
          .in('goal_id', goalIds);
        
        // Batch query 3: All milestones for all goals
        const { data: allMilestones } = await supabase
          .from('goal_milestones')
          .select('goal_id, status')
          .eq('user_id', user.id)
          .in('goal_id', goalIds);
        
        // Process batch data for each goal
        for (const goalId of goalIds) {
          const goalContacts = (allGoalContacts || []).filter(gc => gc.goal_id === goalId);
          const goalActions = (allActions || []).filter(a => a.goal_id === goalId);
          const goalMilestones = (allMilestones || []).filter(m => m.goal_id === goalId);
          
          goalStats[goalId] = {
            contactsCount: goalContacts.length,
            actionsTotal: goalActions.length,
            actionsCompleted: goalActions.filter(a => a.status === 'completed').length,
            milestonesTotal: goalMilestones.length,
            milestonesCompleted: goalMilestones.filter(m => m.status === 'completed').length,
          };
        }
      }
      
      // Create goals with stats
      const goalsWithStats: Array<Goal & { stats: GoalStats }> = (goals || []).map(goal => ({
        ...(goal as Goal),
        stats: goalStats[goal.id] || {
          contactsCount: 0,
          actionsTotal: 0,
          actionsCompleted: 0,
          milestonesTotal: 0,
          milestonesCompleted: 0,
        }
      }));

      return goalsWithStats;
    },
    enabled: !!user?.id,
  });

  const calculateProgress = (goal: Goal & { stats: GoalStats }): number => {
    // Use stored progress if available, otherwise calculate from stats
    if (goal.progress_percentage !== null && goal.progress_percentage !== undefined) {
      return goal.progress_percentage;
    }

    // Multi-factor progress calculation
    const contactProgress = goal.target_contact_count ? 
      (goal.stats.contactsCount / goal.target_contact_count) : 0;
    const actionProgress = goal.stats.actionsTotal > 0 ?
      goal.stats.actionsCompleted / goal.stats.actionsTotal : 0;
    const milestoneProgress = goal.stats.milestonesTotal > 0 ?
      goal.stats.milestonesCompleted / goal.stats.milestonesTotal : 0;

    // Weighted average
    const calculatedProgress = 
      (contactProgress * 0.3) + 
      (actionProgress * 0.3) + 
      (milestoneProgress * 0.4);

    return Math.round(calculatedProgress * 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return '#10B981';
    if (progress >= 50) return '#2196F3';
    if (progress >= 25) return '#F59E0B';
    return '#9E9E9E';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      career_transition: 'Career',
      startup: 'Startup',
      client_relationships: 'Clients',
      investors_partners: 'Investors',
      industry_expansion: 'Expansion',
      learning_mentorship: 'Learning',
      community_deepening: 'Community',
      other: 'Other',
    };
    return labels[category] || 'Other';
  };

  const formatTimeRemaining = (targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    if (diffDays <= 30) return `${diffDays} days left`;
    
    const months = Math.round(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} left`;
  };

  if (isLoading) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Alert severity="error">Error loading goals</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!goalsData || goalsData.length === 0) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <GoalIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Goal Progress
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <GoalIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No active goals yet
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/dashboard/goals')}
              sx={{ textTransform: 'none' }}
            >
              Create Your First Goal
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ProgressIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Goal Progress
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            endIcon={<LaunchIcon />}
            onClick={() => router.push('/dashboard/goals')}
            sx={{ textTransform: 'none' }}
          >
            View All
          </Button>
        </Box>

        <Stack spacing={2}>
          {goalsData.map((goal) => {
            const progress = calculateProgress(goal);
            const progressColor = getProgressColor(progress);

            return (
              <Card 
                key={goal.id} 
                variant="outlined" 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: goal.is_primary ? '2px solid #E3F2FD' : '1px solid #E0E0E0',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-1px)',
                  },
                }}
                onClick={() => router.push(`/dashboard/goals/${goal.id}`)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1, mr: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        {goal.is_primary && (
                          <PrimaryIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                        )}
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600,
                            lineHeight: 1.3,
                          }}
                        >
                          {goal.title}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip
                          label={getCategoryLabel(goal.category || 'other')}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                        {goal.target_date && (
                          <Chip
                            label={formatTimeRemaining(goal.target_date)}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              height: '20px',
                              bgcolor: new Date(goal.target_date) < new Date() ? 'error.50' : 'info.50',
                              color: new Date(goal.target_date) < new Date() ? 'error.main' : 'info.main',
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: progressColor,
                        fontSize: '1.1rem'
                      }}
                    >
                      {progress}%
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#E5E7EB',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          backgroundColor: progressColor,
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {goal.stats.contactsCount} contacts
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {goal.stats.actionsCompleted}/{goal.stats.actionsTotal} actions
                      </Typography>
                      {goal.stats.milestonesTotal > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {goal.stats.milestonesCompleted}/{goal.stats.milestonesTotal} milestones
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};