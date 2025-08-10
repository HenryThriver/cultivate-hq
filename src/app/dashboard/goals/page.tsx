'use client';

import { useRouter } from 'next/navigation';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  Avatar,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Alert,
  Skeleton,
  Stack,
  Grid,
} from '@mui/material';
import {
  TrackChanges as GoalsIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as ProgressIcon,
  People as ContactsIcon,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import AddGoalModal from '@/components/features/goals/AddGoalModal';

// Helper function to convert technical errors into user-friendly messages
const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (!error) return 'An unexpected error occurred. Please try again.';
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Database connection errors
  if (errorMessage.includes('connection') || errorMessage.includes('network')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  
  // Authentication errors
  if (errorMessage.includes('JWT') || errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
    return 'Your session has expired. Please refresh the page and sign in again.';
  }
  
  // Permission errors
  if (errorMessage.includes('permission') || errorMessage.includes('access denied')) {
    return 'You don\'t have permission to access this information. Please contact support if this seems incorrect.';
  }
  
  // Database constraint errors
  if (errorMessage.includes('constraint') || errorMessage.includes('duplicate')) {
    return 'This action conflicts with existing data. Please check your input and try again.';
  }
  
  // Column/table errors (during migration periods)
  if (errorMessage.includes('column') || errorMessage.includes('table') || errorMessage.includes('relation')) {
    return 'We\'re updating the system. Please refresh the page in a moment and try again.';
  }
  
  // Rate limiting
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  // Generic fallback for unknown errors
  return 'Something went wrong while loading your goals. Please refresh the page and try again.';
};

interface Goal {
  id: string;
  title: string;
  description?: string;
  category?: string;
  timeline?: string;
  success_criteria?: string;
  target_contact_count?: number;
  progress_percentage?: number;
  target_date?: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  priority?: number;
  is_primary?: boolean;
  created_at: string;
  updated_at: string;
}

interface GoalContact {
  id: string;
  contact_id: string;
  goal_id: string;
  relationship_type: string;
  relevance_score: number;
  notes?: string;
  contacts: {
    id: string;
    name?: string;
    email?: string;
    title?: string;
    company?: string;
    profile_picture_url?: string;
  };
}

interface GoalStats {
  contactsCount: number;
  actionsOpen: number;
  actionsCompleted: number;
  asksOpen: number;
  asksCompleted: number;
  pogsDelivered: number;
  milestonesTotal: number;
  milestonesCompleted: number;
}

interface GoalsPageData {
  goals: Goal[];
  goalContacts: Record<string, GoalContact[]>;
  goalStats: Record<string, GoalStats>;
}

export default function GoalsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showAddGoalDialog, setShowAddGoalDialog] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async (): Promise<GoalsPageData> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Fetch goals
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (goalsError) {
        console.error('Error fetching goals:', goalsError);
        throw goalsError;
      }

      // Fetch goal contacts (step 1: basic query without joins)
      const { data: goalContactsRaw, error: goalContactsError } = await supabase
        .from('goal_contacts')
        .select('*')
        .eq('user_id', user.id);

      if (goalContactsError) {
        console.error('Error fetching goal_contacts:', goalContactsError);
        // Continue with empty goal contacts if query fails
      }

      // Get unique contact IDs to fetch contact details
      const validGoalContacts = goalContactsRaw || [];
      const contactIds = [...new Set(validGoalContacts.map(gc => gc.contact_id).filter(id => id))];
      
      // Fetch contact details (step 2: separate query for contacts)
      let contactsData: Array<{
        id: string;
        name?: string;
        email?: string;
        title?: string;
        company?: string;
      }> = [];
      // let contactsError = null;
      
      if (contactIds.length > 0) {
        const { data, error } = await supabase
          .from('contacts')
          .select('id, name, email, title, company')
          .in('id', contactIds);
        
        if (error) {
          console.error('Error fetching contacts:', error);
          // Don't fail the entire query if contacts can't be fetched
          contactsData = [];
        } else {
          contactsData = (data || []).map(contact => ({
            id: contact.id,
            name: contact.name || undefined,
            email: contact.email || undefined,
            title: contact.title || undefined,
            company: contact.company || undefined,
          }));
        }
      }

      // Don't throw on contacts error - it's not critical for the goals page

      // Merge goal contacts with contact details (step 3: client-side join)
      const goalContacts = validGoalContacts.map(gc => {
        const contactDetails = contactsData.find(c => c.id === gc.contact_id);
        
        return {
          ...gc,
          contacts: contactDetails || {
            id: gc.contact_id,
            name: 'Contact Not Found',
            email: '',
            title: '',
            company: ''
          }
        };
      });

      // Group goal contacts by goal_id
      const goalContactsGrouped: Record<string, GoalContact[]> = goalContacts.reduce((acc, gc) => {
        // Only include goal contacts that have valid goal_ids
        if (gc.goal_id) {
          if (!acc[gc.goal_id]) acc[gc.goal_id] = [];
          acc[gc.goal_id].push(gc);
        }
        return acc;
      }, {} as Record<string, GoalContact[]>);

      // Fetch stats for each goal
      const goalStats: Record<string, GoalStats> = {};
      
      for (const goal of goals || []) {
        // Fetch actions stats
        const { data: actionsData, error: actionsError } = await supabase
          .from('actions')
          .select('status', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('goal_id', goal.id);
        
        if (actionsError) console.error('Error fetching actions:', actionsError);
        
        const actionsOpen = (actionsData || []).filter(a => a.status === 'pending' || a.status === 'in_progress').length;
        const actionsCompleted = (actionsData || []).filter(a => a.status === 'completed').length;
        
        // Fetch artifacts stats (POGs and Asks) - handle missing goal_id gracefully
        let asksOpen = 0, asksCompleted = 0, pogsDelivered = 0;
        
        try {
          const { data: artifactsData, error: artifactsError } = await supabase
            .from('artifacts')
            .select('type, loop_status, goal_id')
            .eq('user_id', user.id)
            .eq('goal_id', goal.id)
            .in('type', ['pog', 'ask']);
          
          if (artifactsError) {
            // Check if this is a missing column error
            if (artifactsError.message.includes('goal_id') || artifactsError.code === '42703') {
              console.warn('goal_id column not found in artifacts table - using default values');
            } else {
              console.error('Error fetching artifacts:', artifactsError);
            }
          } else {
            const artifactsList = artifactsData || [];
            asksOpen = artifactsList.filter(a => a.type === 'ask' && a.loop_status !== 'closed').length;
            asksCompleted = artifactsList.filter(a => a.type === 'ask' && a.loop_status === 'closed').length;
            pogsDelivered = artifactsList.filter(a => a.type === 'pog' && (a.loop_status === 'delivered' || a.loop_status === 'closed')).length;
          }
        } catch (error) {
          console.warn('Artifacts query failed, using default values:', error);
        }
        
        // Fetch milestones stats
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('goal_milestones')
          .select('status', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('goal_id', goal.id);
        
        if (milestonesError) console.error('Error fetching milestones:', milestonesError);
        
        const milestonesTotal = (milestonesData || []).length;
        const milestonesCompleted = (milestonesData || []).filter(m => m.status === 'completed').length;
        
        goalStats[goal.id] = {
          contactsCount: (goalContactsGrouped[goal.id] || []).length,
          actionsOpen,
          actionsCompleted,
          asksOpen,
          asksCompleted,
          pogsDelivered,
          milestonesTotal,
          milestonesCompleted,
        };
      }

      return {
        goals: goals || [],
        goalContacts: goalContactsGrouped,
        goalStats,
      };
    },
    enabled: !authLoading && !!user?.id,
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, goalId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedGoalId(goalId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGoalId(null);
  };

  const getProgressPercentage = (goal: Goal, stats: GoalStats): number => {
    // Calculate multi-factor progress
    const contactProgress = goal.target_contact_count ? 
      (stats.contactsCount / goal.target_contact_count) : 0;
    const actionProgress = (stats.actionsCompleted + stats.actionsOpen) > 0 ?
      stats.actionsCompleted / (stats.actionsCompleted + stats.actionsOpen) : 0;
    const milestoneProgress = stats.milestonesTotal > 0 ?
      stats.milestonesCompleted / stats.milestonesTotal : 0;
    
    // Weighted average with milestone progress having most weight
    const calculatedProgress = 
      (contactProgress * 0.3) + 
      (actionProgress * 0.3) + 
      (milestoneProgress * 0.4);
    
    // Use goal's stored progress if higher (allows manual override)
    return Math.max(goal.progress_percentage || 0, Math.round(calculatedProgress * 100));
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'paused': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority?: number) => {
    if (!priority) return 'transparent';
    if (priority === 1) return '#F59E0B'; // Amber for top priority
    if (priority === 2) return '#2196F3'; // Primary blue
    return 'transparent';
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Skeleton variant="text" width={200} height={40} />
          <Stack spacing={3}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={250} sx={{ width: '100%' }} />
            ))}
          </Stack>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {getUserFriendlyErrorMessage(error)}
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Refresh Page
        </Button>
      </Container>
    );
  }

  const goals = data?.goals || [];
  const goalContacts = data?.goalContacts || {};
  const goalStats = data?.goalStats || {};

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 6 }}>
        <Box>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              color: '#212121',
              fontSize: { xs: '2rem', md: '2.5rem' },
              mb: 1
            }}
          >
            Your Goals
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: '1.0625rem' }}
          >
            Track your professional ambitions and build relationships that matter
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddGoalDialog(true)}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 500,
            fontSize: '1rem',
            boxShadow: '0 4px 6px rgba(33, 150, 243, 0.2)',
            '&:hover': {
              boxShadow: '0 6px 12px rgba(33, 150, 243, 0.3)',
            }
          }}
        >
          Create Goal
        </Button>
      </Box>

      {/* Goals Overview */}
      {goals.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <GoalsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No goals yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first goal to start tracking your relationship building objectives
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddGoalDialog(true)}
              sx={{ 
                textTransform: 'none',
                px: 3,
                py: 1.5,
                fontWeight: 500,
                fontSize: '1rem'
              }}
            >
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={3}>
          {goals.map((goal) => {
            const contacts = goalContacts[goal.id] || [];
            const stats = goalStats[goal.id] || {
              contactsCount: 0,
              actionsOpen: 0,
              actionsCompleted: 0,
              asksOpen: 0,
              asksCompleted: 0,
              pogsDelivered: 0,
              milestonesTotal: 0,
              milestonesCompleted: 0,
            };
            const progressPercentage = getProgressPercentage(goal, stats);
            
            return (
              <Card
                key={goal.id}
                onClick={() => router.push(`/dashboard/goals/${goal.id}`)}
                sx={{
                  cursor: 'pointer',
                  position: 'relative',
                  borderRadius: 3,
                  border: goal.is_primary ? '2px solid #E3F2FD' : '1px solid #E0E0E0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(33, 150, 243, 0.15)',
                  },
                }}
                >
                <CardContent sx={{ p: 4 }}>
                  {/* Priority indicator bar */}
                  {goal.priority && goal.priority <= 2 && (
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        bgcolor: getPriorityColor(goal.priority),
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                      }} 
                    />
                  )}
                  
                  {/* Header with status and menu */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={goal.status}
                        size="small"
                        color={getStatusColor(goal.status) as any}
                        sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                      />
                      {goal.is_primary && (
                        <Chip
                          label="Primary"
                          size="small"
                          sx={{ 
                            bgcolor: '#F3E8FF',
                            color: '#7C3AED',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, goal.id);
                      }}
                      sx={{ mt: -0.5 }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Goal title and description */}
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 1.5, 
                      lineHeight: 1.3,
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      color: '#212121'
                    }}
                  >
                    {goal.title}
                  </Typography>
                  {goal.description && (
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 3,
                        lineHeight: 1.6,
                        fontSize: '0.95rem'
                      }}
                    >
                      {goal.description}
                    </Typography>
                  )}

                  {/* Stats Grid */}
                  <Box 
                    sx={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 2,
                      mb: 3,
                      p: 2,
                      bgcolor: '#FAFAFA',
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography 
                        variant="h6" 
                        sx={{ fontWeight: 600, color: '#212121' }}
                      >
                        {stats.contactsCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Contacts
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography 
                        variant="h6" 
                        sx={{ fontWeight: 600, color: stats.actionsOpen > 0 ? '#F59E0B' : '#212121' }}
                      >
                        {stats.actionsOpen}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Open Actions
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography 
                        variant="h6" 
                        sx={{ fontWeight: 600, color: '#4CAF50' }}
                      >
                        {stats.asksCompleted}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Asks Completed
                      </Typography>
                    </Box>
                  </Box>

                  {/* Progress Visualization */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#616161' }}>
                        Overall Progress
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#212121' }}>
                        {progressPercentage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progressPercentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#E5E7EB',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: progressPercentage >= 75 ? '#10B981' : 
                                     progressPercentage >= 50 ? '#2196F3' : 
                                     progressPercentage >= 25 ? '#F59E0B' : '#9E9E9E',
                        },
                      }}
                    />
                    {stats.milestonesTotal > 0 && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ display: 'block', mt: 1 }}
                      >
                        {stats.milestonesCompleted} of {stats.milestonesTotal} milestones completed
                      </Typography>
                    )}
                  </Box>

                  {/* Contact avatars with POG/Ask balance */}
                  {contacts.length > 0 ? (
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ContactsIcon fontSize="small" sx={{ color: '#616161' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#616161' }}>
                            {contacts.length} Key Contact{contacts.length !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                        {(stats.pogsDelivered > 0 || stats.asksOpen > 0) && (
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            {stats.pogsDelivered > 0 && (
                              <Chip 
                                label={`${stats.pogsDelivered} POGs`}
                                size="small"
                                sx={{ 
                                  bgcolor: '#D1FAE5',
                                  color: '#059669',
                                  fontWeight: 500,
                                  fontSize: '0.75rem'
                                }}
                              />
                            )}
                            {stats.asksOpen > 0 && (
                              <Chip 
                                label={`${stats.asksOpen} Asks`}
                                size="small"
                                sx={{ 
                                  bgcolor: '#FED7AA',
                                  color: '#EA580C',
                                  fontWeight: 500,
                                  fontSize: '0.75rem'
                                }}
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: 'flex', mr: 1 }}>
                          {contacts.slice(0, 6).map((gc, index) => (
                            <Avatar
                              key={gc.contacts.id}
                              alt={gc.contacts.name || gc.contacts.email}
                              sx={{
                                width: 36,
                                height: 36,
                                border: '2px solid white',
                                ml: index > 0 ? -1.5 : 0,
                                fontSize: '0.875rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              }}
                            >
                              {gc.contacts.name?.charAt(0) || gc.contacts.email?.charAt(0)}
                            </Avatar>
                          ))}
                        </Box>
                        {contacts.length > 6 && (
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#616161' }}>
                            +{contacts.length - 6} more
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
                        mb: 3, 
                        p: 2, 
                        border: '1px dashed #E0E0E0',
                        borderRadius: 2,
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No contacts associated yet
                      </Typography>
                    </Box>
                  )}

                  {/* Timeline and Category */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    {goal.target_date && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ScheduleIcon fontSize="small" sx={{ color: '#9E9E9E' }} />
                        <Typography variant="body2" sx={{ color: '#616161' }}>
                          Due {formatDate(goal.target_date)}
                        </Typography>
                      </Box>
                    )}
                    {goal.timeline && (
                      <Chip 
                        label={goal.timeline}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )}
                    {goal.category && (
                      <Chip 
                        label={goal.category.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem', textTransform: 'capitalize' }}
                      />
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ px: 4, pb: 3, pt: 0, justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ProgressIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/goals/${goal.id}`);
                      }}
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 500,
                        px: 2,
                        borderRadius: 2
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 500,
                        px: 2,
                        borderRadius: 2
                      }}
                    >
                      Add Action
                    </Button>
                  </Box>
                  {stats.actionsOpen > 0 && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#F59E0B',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 14 }} />
                      {stats.actionsOpen} action{stats.actionsOpen !== 1 ? 's' : ''} pending
                    </Typography>
                  )}
                </CardActions>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 150,
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ProgressIcon fontSize="small" sx={{ mr: 1 }} />
          Update Progress
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ContactsIcon fontSize="small" sx={{ mr: 1 }} />
          Manage Contacts
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'text.secondary' }}>
          Edit Goal
        </MenuItem>
      </Menu>

      {/* Add Goal Modal */}
      <AddGoalModal
        open={showAddGoalDialog}
        onClose={() => setShowAddGoalDialog(false)}
        onSuccess={() => {
          refetch();
        }}
      />
    </Container>
  );
}