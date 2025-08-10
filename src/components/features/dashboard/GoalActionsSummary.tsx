'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Assignment as ActionIcon,
  Flag as GoalIcon,
  Launch as LaunchIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as HighIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';

interface GoalAction {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  action_type: string;
  created_at: string;
  goal: {
    id: string;
    title: string;
    category: string;
  };
  contact?: {
    id: string;
    name: string;
    email: string;
  };
}

export const GoalActionsSummary: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  const { data: actions, isLoading, error } = useQuery({
    queryKey: ['dashboard-goal-actions', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Fetch pending/in_progress actions with goal information
      const { data: actionsData, error: actionsError } = await supabase
        .from('actions')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          due_date,
          action_type,
          created_at,
          contact_id,
          goal_id
        `)
        .eq('user_id', user.id)
        .in('status', ['pending', 'in_progress'])
        .not('goal_id', 'is', null)
        .order('due_date', { ascending: true, nullsLast: true })
        .order('priority', { ascending: true })
        .limit(6);

      if (actionsError) throw actionsError;

      if (!actionsData || actionsData.length === 0) {
        return [];
      }

      // Get unique goal IDs and contact IDs
      const goalIds = [...new Set(actionsData.map(a => a.goal_id).filter(Boolean))];
      const contactIds = [...new Set(actionsData.map(a => a.contact_id).filter(Boolean))];

      // Fetch goal information
      const { data: goalsData } = await supabase
        .from('goals')
        .select('id, title, category')
        .in('id', goalIds);

      // Fetch contact information
      const { data: contactsData } = await supabase
        .from('contacts')
        .select('id, name, email')
        .in('id', contactIds);

      // Combine data
      const enrichedActions: GoalAction[] = actionsData.map(action => {
        const goal = goalsData?.find(g => g.id === action.goal_id);
        const contact = action.contact_id ? contactsData?.find(c => c.id === action.contact_id) : null;

        return {
          ...action,
          goal: goal || { id: action.goal_id, title: 'Unknown Goal', category: 'other' },
          contact: contact || undefined,
        };
      });

      return enrichedActions;
    },
    enabled: !!user?.id,
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high': return '#DC2626';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Normal';
    }
  };

  const getActionTypeLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      outreach: 'Outreach',
      follow_up: 'Follow-up',
      research: 'Research',
      meeting: 'Meeting',
      call: 'Call',
      email: 'Email',
      linkedin: 'LinkedIn',
      introduction: 'Introduction',
      deliver_pog: 'Deliver POG',
      follow_up_ask: 'Follow-up Ask',
      content_creation: 'Content',
      networking: 'Networking',
    };
    return labels[actionType] || 'Action';
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

  const formatDueDate = (dueDateString?: string) => {
    if (!dueDateString) return null;
    
    const dueDate = new Date(dueDateString);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    
    return dueDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDueDateColor = (dueDateString?: string) => {
    if (!dueDateString) return 'text.secondary';
    
    const dueDate = new Date(dueDateString);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'error.main';
    if (diffDays === 0) return 'error.main';
    if (diffDays <= 3) return 'warning.main';
    if (diffDays <= 7) return 'info.main';
    
    return 'text.secondary';
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
          <Alert severity="error">Error loading goal actions</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!actions || actions.length === 0) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ActionIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Goal Actions
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <ActionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No pending goal actions
            </Typography>
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
            <ActionIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Goal Actions
            </Typography>
            <Chip 
              label={actions.length} 
              size="small" 
              sx={{ 
                bgcolor: 'primary.50',
                color: 'primary.main',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
          </Box>
          <Button
            variant="outlined"
            size="small"
            endIcon={<LaunchIcon />}
            onClick={() => router.push('/dashboard/goals')}
            sx={{ textTransform: 'none' }}
          >
            View Goals
          </Button>
        </Box>

        <Stack spacing={1.5}>
          {actions.map((action, index) => (
            <React.Fragment key={action.id}>
              <Box 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'transparent',
                  '&:hover': {
                    bgcolor: 'grey.50',
                    borderColor: 'grey.200',
                  },
                }}
                onClick={() => router.push(`/dashboard/goals/${action.goal.id}`)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600,
                        mb: 0.5,
                        lineHeight: 1.3,
                      }}
                    >
                      {action.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <GoalIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                      <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>
                        {action.goal.title}
                      </Typography>
                    </Box>
                    {action.description && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          mb: 1
                        }}
                      >
                        {action.description}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                    <Chip
                      label={getPriorityLabel(action.priority)}
                      size="small"
                      icon={action.priority === 'urgent' || action.priority === 'high' ? <HighIcon fontSize="small" /> : undefined}
                      sx={{
                        fontSize: '0.7rem',
                        height: '20px',
                        bgcolor: `${getPriorityColor(action.priority)}20`,
                        color: getPriorityColor(action.priority),
                        fontWeight: 600,
                      }}
                    />
                    {action.due_date && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ScheduleIcon sx={{ fontSize: 12, color: getDueDateColor(action.due_date) }} />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: getDueDateColor(action.due_date),
                            fontWeight: 500,
                            fontSize: '0.7rem'
                          }}
                        >
                          {formatDueDate(action.due_date)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={getActionTypeLabel(action.action_type)}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: '18px' }}
                    />
                    <Chip
                      label={getCategoryLabel(action.goal.category)}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: '18px' }}
                    />
                  </Box>
                  {action.contact && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {action.contact.name}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              {index < actions.length - 1 && <Divider sx={{ opacity: 0.3 }} />}
            </React.Fragment>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};