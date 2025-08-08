'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
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

interface Goal {
  id: string;
  title: string;
  description?: string;
  target_contact_count?: number;
  progress_percentage?: number;
  target_date?: string;
  status: 'active' | 'completed' | 'paused';
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

interface GoalsPageData {
  goals: Goal[];
  goalContacts: Record<string, GoalContact[]>;
}

export default function GoalsPage() {
  const { user, loading: authLoading } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async (): Promise<GoalsPageData> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Fetch goals
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      // Fetch goal contacts (step 1: basic query without joins)
      const { data: goalContactsRaw, error: goalContactsError } = await supabase
        .from('goal_contacts')
        .select('*')
        .eq('user_id', user.id);

      if (goalContactsError) throw goalContactsError;

      // Get unique contact IDs to fetch contact details
      const contactIds = [...new Set((goalContactsRaw || []).map(gc => gc.contact_id))];
      
      // Fetch contact details (step 2: separate query for contacts)
      const { data: contactsData, error: contactsError } = contactIds.length > 0 ? await supabase
        .from('contacts')
        .select('id, name, email, title, company, profile_picture_url')
        .in('id', contactIds) : { data: [], error: null };

      if (contactsError) throw contactsError;

      // Merge goal contacts with contact details (step 3: client-side join)
      const goalContacts = (goalContactsRaw || []).map(gc => ({
        ...gc,
        contacts: (contactsData || []).find(c => c.id === gc.contact_id) || {
          id: gc.contact_id,
          name: 'Unknown Contact',
          email: '',
          title: '',
          company: '',
          profile_picture_url: null
        }
      }));

      // Group goal contacts by goal_id
      const goalContactsGrouped = goalContacts.reduce((acc: Record<string, GoalContact[]>, gc: GoalContact) => {
        if (!acc[gc.goal_id]) acc[gc.goal_id] = [];
        acc[gc.goal_id].push(gc);
        return acc;
      }, {});

      return {
        goals: goals || [],
        goalContacts: goalContactsGrouped,
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

  const getProgressPercentage = (goal: Goal): number => {
    return goal.progress_percentage || 0;
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'paused': return 'warning';
      default: return 'default';
    }
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
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
                <Skeleton variant="rectangular" height={250} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Error loading goals: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  const goals = data?.goals || [];
  const goalContacts = data?.goalContacts || {};

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GoalsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Goals
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
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
              sx={{ textTransform: 'none' }}
            >
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {goals.map((goal) => {
            const contacts = goalContacts[goal.id] || [];
            const progressPercentage = getProgressPercentage(goal);
            
            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={goal.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    {/* Header with menu */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip
                        label={goal.status}
                        size="small"
                        color={getStatusColor(goal.status) as any}
                        sx={{ textTransform: 'capitalize' }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, goal.id)}
                        sx={{ mt: -0.5 }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Goal title and description */}
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.2 }}>
                      {goal.title}
                    </Typography>
                    {goal.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {goal.description}
                      </Typography>
                    )}

                    {/* Progress */}
                    {goal.target_contact_count && progressPercentage > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {Math.round((progressPercentage / 100) * goal.target_contact_count)} / {goal.target_contact_count} contacts
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progressPercentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    )}

                    {/* Connected contacts */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ContactsIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {contacts.length} connected contact{contacts.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>

                    {/* Contact avatars */}
                    {contacts.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box sx={{ display: 'flex', mr: 1 }}>
                          {contacts.slice(0, 5).map((gc, index) => (
                            <Avatar
                              key={gc.contacts.id}
                              src={gc.contacts.profile_picture_url || undefined}
                              alt={gc.contacts.name || gc.contacts.email}
                              sx={{
                                width: 32,
                                height: 32,
                                border: '2px solid white',
                                ml: index > 0 ? -1 : 0,
                                fontSize: '0.75rem',
                              }}
                            >
                              {gc.contacts.name?.charAt(0) || gc.contacts.email?.charAt(0)}
                            </Avatar>
                          ))}
                        </Box>
                        {contacts.length > 5 && (
                          <Typography variant="caption" color="text.secondary">
                            +{contacts.length - 5} more
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Deadline */}
                    {goal.target_date && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Due {formatDate(goal.target_date)}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ pt: 0 }}>
                    <Button
                      size="small"
                      sx={{ textTransform: 'none' }}
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      sx={{ textTransform: 'none' }}
                    >
                      Add Contact
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
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
    </Container>
  );
}