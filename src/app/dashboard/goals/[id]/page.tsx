'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Avatar,
  AvatarGroup,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link,
  Alert,
  Skeleton,
  Stack,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Flag as FlagIcon,
  CardGiftcard as POGIcon,
  Help as AskIcon,
  SwapHoriz as ExchangeIcon,
  Timeline as TimelineIcon,
  CheckCircleOutline as MilestoneIcon,
  EditNote as EditNoteIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import AddActionModal from '@/components/features/goals/AddActionModal';
import AssociateContactModal from '@/components/features/goals/AssociateContactModal';
import AddPOGModal from '@/components/features/goals/AddPOGModal';
import AddAskModal from '@/components/features/goals/AddAskModal';
import AddMilestoneModal from '@/components/features/goals/AddMilestoneModal';
import EditGoalModal from '@/components/features/goals/EditGoalModal';

interface GoalDetailParams {
  params: Promise<{ id: string }>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`goal-tabpanel-${index}`}
      aria-labelledby={`goal-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function GoalDetailPage({ params }: GoalDetailParams) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [editingAction, setEditingAction] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPOGModal, setShowPOGModal] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['goal', resolvedParams.id, user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Fetch goal details
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .select('*')
        .eq('id', resolvedParams.id)
        .eq('user_id', user.id)
        .single();

      if (goalError) throw goalError;

      // Fetch goal contacts (basic query without joins to avoid schema issues)
      const { data: goalContactsRaw, error: contactsError } = await supabase
        .from('goal_contacts')
        .select('*')
        .eq('goal_id', resolvedParams.id)
        .eq('user_id', user.id);

      if (contactsError) throw contactsError;

      // Fetch contact details separately if there are goal contacts
      let goalContacts: any[] = [];
      if (goalContactsRaw && goalContactsRaw.length > 0) {
        const contactIds = goalContactsRaw.map(gc => gc.contact_id).filter(Boolean);
        
        if (contactIds.length > 0) {
          const { data: contactDetails } = await supabase
            .from('contacts')
            .select('id, name, email, title, company')
            .in('id', contactIds);
          
          // Merge goal contacts with contact details
          goalContacts = goalContactsRaw.map(gc => ({
            ...gc,
            contacts: contactDetails?.find(c => c.id === gc.contact_id) || {
              id: gc.contact_id,
              name: 'Unknown Contact',
              email: '',
              title: '',
              company: '',
            }
          }));
        } else {
          goalContacts = goalContactsRaw.map(gc => ({
            ...gc,
            contacts: {
              id: gc.contact_id,
              name: 'Unknown Contact',
              email: '',
              title: '',
              company: '',
            }
          }));
        }
      }

      // Fetch actions for this goal
      const { data: actions, error: actionsError } = await supabase
        .from('actions')
        .select('*')
        .eq('goal_id', resolvedParams.id)
        .eq('user_id', user.id)
        .order('priority', { ascending: true })
        .order('due_date', { ascending: true });

      if (actionsError) throw actionsError;

      // Fetch artifacts (POGs and Asks) for this goal
      const { data: artifacts, error: artifactsError } = await supabase
        .from('artifacts')
        .select('*')
        .eq('goal_id', resolvedParams.id)
        .eq('user_id', user.id)
        .in('type', ['pog', 'ask'])
        .order('created_at', { ascending: false });

      if (artifactsError) throw artifactsError;

      // Fetch milestones for this goal
      const { data: milestones, error: milestonesError } = await supabase
        .from('goal_milestones')
        .select('*')
        .eq('goal_id', resolvedParams.id)
        .eq('user_id', user.id)
        .order('order_index', { ascending: true });

      if (milestonesError) throw milestonesError;

      // Calculate stats
      const stats = {
        contactsCount: goalContacts?.length || 0,
        actionsOpen: actions?.filter(a => a.status === 'pending' || a.status === 'in_progress').length || 0,
        actionsCompleted: actions?.filter(a => a.status === 'completed').length || 0,
        asksOpen: artifacts?.filter(a => a.type === 'ask' && a.loop_status !== 'closed').length || 0,
        asksCompleted: artifacts?.filter(a => a.type === 'ask' && a.loop_status === 'closed').length || 0,
        pogsDelivered: artifacts?.filter(a => a.type === 'pog' && (a.loop_status === 'delivered' || a.loop_status === 'closed')).length || 0,
        milestonesTotal: milestones?.length || 0,
        milestonesCompleted: milestones?.filter(m => m.status === 'completed').length || 0,
      };

      return {
        goal,
        contacts: goalContacts || [],
        actions: actions || [],
        artifacts: artifacts || [],
        milestones: milestones || [],
        stats,
      };
    },
    enabled: !!user?.id,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getProgressPercentage = () => {
    if (!data?.stats) return 0;
    const { stats } = data;
    
    const contactProgress = data.goal.target_contact_count ? 
      (stats.contactsCount / data.goal.target_contact_count) : 0;
    const actionProgress = (stats.actionsCompleted + stats.actionsOpen) > 0 ?
      stats.actionsCompleted / (stats.actionsCompleted + stats.actionsOpen) : 0;
    const milestoneProgress = stats.milestonesTotal > 0 ?
      stats.milestonesCompleted / stats.milestonesTotal : 0;
    
    const calculatedProgress = 
      (contactProgress * 0.3) + 
      (actionProgress * 0.3) + 
      (milestoneProgress * 0.4);
    
    return Math.round(calculatedProgress * 100);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" height={400} sx={{ mt: 2 }} />
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Failed to load goal details'}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push('/dashboard/goals')}
          sx={{ mt: 2 }}
        >
          Back to Goals
        </Button>
      </Container>
    );
  }

  const { goal, contacts, actions, artifacts, milestones, stats } = data;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          href="/dashboard" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none',
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' }
          }}
        >
          Dashboard
        </Link>
        <Link 
          href="/dashboard/goals"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none',
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' }
          }}
        >
          Goals
        </Link>
        <Typography color="text.primary">{goal.title}</Typography>
      </Breadcrumbs>

      {/* Goal Header Card */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={goal.status}
                  color={goal.status === 'active' ? 'primary' : 'default'}
                  sx={{ textTransform: 'capitalize' }}
                />
                {goal.is_primary && (
                  <Chip 
                    label="Primary Goal"
                    sx={{ 
                      bgcolor: '#F3E8FF',
                      color: '#7C3AED',
                      fontWeight: 600,
                    }}
                  />
                )}
                {goal.priority === 1 && (
                  <Chip 
                    icon={<FlagIcon />}
                    label="Top Priority"
                    sx={{ 
                      bgcolor: '#FEF3C7',
                      color: '#D97706',
                    }}
                  />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#212121' }}>
                  {goal.title}
                </Typography>
                <IconButton 
                  onClick={() => setShowEditGoalModal(true)}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { 
                      color: 'primary.main',
                      bgcolor: 'primary.50'
                    }
                  }}
                >
                  <EditNoteIcon fontSize="small" />
                </IconButton>
              </Box>
              
              {goal.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                  {goal.description}
                </Typography>
              )}
              
              {/* Quick Stats */}
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#212121' }}>
                      {stats.contactsCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Contacts
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#F59E0B' }}>
                      {stats.actionsOpen}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Open Actions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#10B981' }}>
                      {stats.asksCompleted}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Asks Completed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#2196F3' }}>
                      {getProgressPercentage()}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>
          
          {/* Progress Bar */}
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Overall Progress
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {stats.milestonesCompleted} of {stats.milestonesTotal} milestones
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={getProgressPercentage()}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#E5E7EB',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: getProgressPercentage() >= 75 ? '#10B981' : 
                             getProgressPercentage() >= 50 ? '#2196F3' : 
                             getProgressPercentage() >= 25 ? '#F59E0B' : '#9E9E9E',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab 
            label={`Actions (${stats.actionsOpen})`}
            icon={<AssignmentIcon />}
            iconPosition="start"
          />
          <Tab 
            label={`Contacts (${stats.contactsCount})`}
            icon={<PeopleIcon />}
            iconPosition="start"
          />
          <Tab 
            label="POGs & Asks"
            icon={<TrendingUpIcon />}
            iconPosition="start"
          />
          <Tab 
            label={`Milestones (${stats.milestonesCompleted}/${stats.milestonesTotal})`}
            icon={<FlagIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        {/* Actions Tab */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Actions</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowActionModal(true)}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              fontWeight: 500,
            }}
          >
            Add Action
          </Button>
        </Box>

        {actions.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center', bgcolor: '#FAFAFA' }}>
            <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No actions yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create actionable steps to achieve your goal
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowActionModal(true)}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Create First Action
            </Button>
          </Card>
        ) : (
          <Stack spacing={2}>
            {/* Actions Statistics */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#FEF3C7' }}>
                  <Typography variant="h6" sx={{ color: '#D97706' }}>
                    {stats.actionsOpen}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Actions
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#D1FAE5' }}>
                  <Typography variant="h6" sx={{ color: '#059669' }}>
                    {stats.actionsCompleted}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Actions
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#EDE9FE' }}>
                  <Typography variant="h6" sx={{ color: '#7C3AED' }}>
                    {actions.filter(a => a.priority === '1' || a.priority === 1).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High Priority
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#FEE2E2' }}>
                  <Typography variant="h6" sx={{ color: '#DC2626' }}>
                    {actions.filter(a => a.due_date && new Date(a.due_date) < new Date()).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Actions List */}
            {actions.map((action) => {
              const isOverdue = action.due_date && new Date(action.due_date) < new Date();
              const isHighPriority = action.priority === '1' || action.priority === 1;
              
              return (
                <Card 
                  key={action.id} 
                  sx={{ 
                    border: isOverdue ? '2px solid #FCA5A5' : '1px solid #E0E0E0',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          {action.status === 'completed' ? (
                            <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
                          ) : (
                            <PendingIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
                          )}
                          
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              textDecoration: action.status === 'completed' ? 'line-through' : 'none',
                              opacity: action.status === 'completed' ? 0.7 : 1,
                            }}
                          >
                            {action.title}
                          </Typography>
                          
                          {isHighPriority && (
                            <Chip 
                              label="High" 
                              size="small" 
                              sx={{ 
                                bgcolor: '#FEE2E2', 
                                color: '#DC2626',
                                fontSize: '0.75rem',
                                height: 20
                              }} 
                            />
                          )}
                          
                          {isOverdue && action.status !== 'completed' && (
                            <Chip 
                              label="Overdue" 
                              size="small" 
                              sx={{ 
                                bgcolor: '#FCA5A5', 
                                color: '#FFFFFF',
                                fontSize: '0.75rem',
                                height: 20
                              }} 
                            />
                          )}
                        </Box>
                        
                        {action.description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 2,
                              opacity: action.status === 'completed' ? 0.7 : 1,
                            }}
                          >
                            {action.description}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          {action.due_date && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ScheduleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                Due {new Date(action.due_date).toLocaleDateString()}
                              </Typography>
                            </Box>
                          )}
                          
                          {action.action_type && (
                            <Chip 
                              label={action.action_type}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem', height: 20 }}
                            />
                          )}
                          
                          <Chip 
                            label={action.status}
                            size="small"
                            color={
                              action.status === 'completed' ? 'success' :
                              action.status === 'in_progress' ? 'primary' : 'default'
                            }
                            sx={{ fontSize: '0.75rem', textTransform: 'capitalize', height: 20 }}
                          />
                        </Box>
                      </Box>
                      
                      <IconButton size="small">
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        {/* Contacts Tab */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Goal Contacts</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowContactModal(true)}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              fontWeight: 500,
            }}
          >
            Associate Contact
          </Button>
        </Box>

        {contacts.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center', bgcolor: '#FAFAFA' }}>
            <PeopleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No contacts associated yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Connect contacts to this goal to track relationships and progress
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowContactModal(true)}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Associate First Contact
            </Button>
          </Card>
        ) : (
          <Stack spacing={2}>
            {/* Contact Statistics */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#E3F2FD' }}>
                  <Typography variant="h6" sx={{ color: '#1976D2' }}>
                    {contacts.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Contacts
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#F3E5F5' }}>
                  <Typography variant="h6" sx={{ color: '#7B1FA2' }}>
                    {contacts.filter(c => c.relationship_type === 'key_influencer').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Key Influencers
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#E8F5E8' }}>
                  <Typography variant="h6" sx={{ color: '#2E7D32' }}>
                    {contacts.filter(c => (c.relevance_score ?? 0) >= 8).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High Relevance
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#FFF3E0' }}>
                  <Typography variant="h6" sx={{ color: '#F57C00' }}>
                    {Math.round(contacts.reduce((sum, c) => sum + (c.relevance_score ?? 0), 0) / contacts.length) || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Relevance
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Contacts List */}
            {contacts.map((goalContact) => {
              const contact = goalContact.contacts;
              const relevanceColor = (goalContact.relevance_score ?? 0) >= 8 ? '#10B981' : 
                                   (goalContact.relevance_score ?? 0) >= 6 ? '#F59E0B' : '#6B7280';
              
              return (
                <Card 
                  key={goalContact.id} 
                  sx={{ 
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                        <Avatar
                          alt={contact.name || contact.email}
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: 'primary.main',
                            fontSize: '1.25rem',
                            fontWeight: 600,
                          }}
                        >
                          {contact.name?.charAt(0) || contact.email?.charAt(0)}
                        </Avatar>
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {contact.name || contact.email}
                          </Typography>
                          
                          {contact.title && contact.company && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {contact.title} at {contact.company}
                            </Typography>
                          )}
                          
                          {contact.email && contact.name && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {contact.email}
                            </Typography>
                          )}
                          
                          {goalContact.notes && (
                            <Typography variant="body2" sx={{ 
                              mb: 2, 
                              fontStyle: 'italic',
                              color: 'text.secondary',
                              bgcolor: '#F5F5F5',
                              p: 1,
                              borderRadius: 1,
                              borderLeft: '3px solid #2196F3'
                            }}>
                              "{goalContact.notes}"
                            </Typography>
                          )}
                          
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                            <Chip 
                              label={(goalContact.relationship_type || 'contact').replace('_', ' ')}
                              size="small"
                              color={
                                goalContact.relationship_type === 'key_influencer' ? 'secondary' :
                                goalContact.relationship_type === 'decision_maker' ? 'primary' : 'default'
                              }
                              sx={{ 
                                textTransform: 'capitalize',
                                fontSize: '0.75rem',
                                height: 24
                              }}
                            />
                            
                            <Chip 
                              label={`Relevance: ${goalContact.relevance_score ?? 'N/A'}/10`}
                              size="small"
                              sx={{ 
                                bgcolor: `${relevanceColor}20`,
                                color: relevanceColor,
                                fontSize: '0.75rem',
                                height: 24,
                                fontWeight: 500
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Relevance Score Visual */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 1 }}>
                          <Typography variant="h6" sx={{ 
                            color: relevanceColor,
                            fontWeight: 600,
                            lineHeight: 1
                          }}>
                            {goalContact.relevance_score ?? 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            /10
                          </Typography>
                        </Box>
                        
                        <IconButton size="small">
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    {/* Quick Actions */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2, pt: 2, borderTop: '1px solid #E0E0E0' }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                      >
                        View Profile
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined"
                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                      >
                        Add Notes
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined"
                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                      >
                        Update Relevance
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        {/* POGs & Asks Tab */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">POGs & Asks</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<POGIcon />}
              onClick={() => setShowPOGModal(true)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                fontWeight: 500,
                borderColor: '#10B981',
                color: '#10B981',
                '&:hover': {
                  borderColor: '#059669',
                  bgcolor: '#F0FDF4',
                }
              }}
            >
              Add POG
            </Button>
            <Button
              variant="outlined"
              startIcon={<AskIcon />}
              onClick={() => setShowAskModal(true)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                fontWeight: 500,
                borderColor: '#F59E0B',
                color: '#F59E0B',
                '&:hover': {
                  borderColor: '#D97706',
                  bgcolor: '#FFFBEB',
                }
              }}
            >
              Add Ask
            </Button>
          </Box>
        </Box>

        {artifacts.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center', bgcolor: '#FAFAFA' }}>
            <ExchangeIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No POGs or Asks yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Track your giving and asking activities for this goal
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<POGIcon />}
                onClick={() => setShowPOGModal(true)}
                sx={{ 
                  textTransform: 'none', 
                  px: 3,
                  bgcolor: '#10B981',
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                Create First POG
              </Button>
              <Button
                variant="contained"
                startIcon={<AskIcon />}
                onClick={() => setShowAskModal(true)}
                sx={{ 
                  textTransform: 'none', 
                  px: 3,
                  bgcolor: '#F59E0B',
                  '&:hover': { bgcolor: '#D97706' }
                }}
              >
                Create First Ask
              </Button>
            </Box>
          </Card>
        ) : (
          <Stack spacing={2}>
            {/* POGs & Asks Statistics */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#F0FDF4' }}>
                  <Typography variant="h6" sx={{ color: '#059669' }}>
                    {stats.pogsDelivered}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    POGs Delivered
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#FFFBEB' }}>
                  <Typography variant="h6" sx={{ color: '#D97706' }}>
                    {stats.asksOpen}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Open Asks
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#EBF8FF' }}>
                  <Typography variant="h6" sx={{ color: '#2563EB' }}>
                    {stats.asksCompleted}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Asks Completed
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#F5F3FF' }}>
                  <Typography variant="h6" sx={{ color: '#7C3AED' }}>
                    {stats.pogsDelivered > 0 && stats.asksCompleted > 0 ? 
                      Math.round((stats.pogsDelivered / (stats.pogsDelivered + stats.asksCompleted)) * 100) : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Give/Take Ratio
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Filter Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="text"
                  startIcon={<ExchangeIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                    color: 'primary.main',
                    borderBottom: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 0,
                    pb: 1
                  }}
                >
                  All ({artifacts.length})
                </Button>
                <Button
                  variant="text"
                  startIcon={<POGIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                    color: 'text.secondary'
                  }}
                >
                  POGs ({artifacts.filter(a => a.type === 'pog').length})
                </Button>
                <Button
                  variant="text"
                  startIcon={<AskIcon />}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                    color: 'text.secondary'
                  }}
                >
                  Asks ({artifacts.filter(a => a.type === 'ask').length})
                </Button>
              </Stack>
            </Box>

            {/* Artifacts List */}
            {artifacts.map((artifact) => {
              const isPOG = artifact.type === 'pog';
              const statusColor = artifact.loop_status === 'closed' || artifact.loop_status === 'delivered' ? 
                               '#10B981' : artifact.loop_status === 'active' ? '#F59E0B' : '#6B7280';
              
              return (
                <Card 
                  key={artifact.id} 
                  sx={{ 
                    borderRadius: 2,
                    border: isPOG ? '2px solid #D1FAE5' : '2px solid #FED7AA',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          {isPOG ? (
                            <POGIcon sx={{ color: '#059669', fontSize: 20 }} />
                          ) : (
                            <AskIcon sx={{ color: '#D97706', fontSize: 20 }} />
                          )}
                          
                          <Chip 
                            label={isPOG ? 'POG' : 'ASK'}
                            size="small" 
                            sx={{ 
                              bgcolor: isPOG ? '#D1FAE5' : '#FED7AA',
                              color: isPOG ? '#059669' : '#D97706',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              height: 20,
                              mr: 1
                            }} 
                          />
                          
                          <Chip 
                            label={artifact.loop_status?.replace('_', ' ') || 'pending'}
                            size="small"
                            sx={{ 
                              bgcolor: `${statusColor}20`,
                              color: statusColor,
                              fontSize: '0.75rem',
                              textTransform: 'capitalize',
                              height: 20
                            }}
                          />
                        </Box>
                        
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {(artifact as any).title || `${isPOG ? 'POG' : 'Ask'} - ${new Date(artifact.created_at).toLocaleDateString()}`}
                        </Typography>
                        
                        {(artifact as any).description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                            {(artifact as any).description}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ScheduleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              Created {new Date(artifact.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                          
                          {(artifact as any).tags && (
                            <Chip 
                              label={(artifact as any).tags}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem', height: 20 }}
                            />
                          )}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Status Indicator */}
                        <Box sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%',
                          bgcolor: statusColor,
                          mr: 1
                        }} />
                        
                        <IconButton size="small">
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2, pt: 2, borderTop: '1px solid #E0E0E0' }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                      >
                        View Details
                      </Button>
                      {artifact.loop_status !== 'closed' && (
                        <Button 
                          size="small" 
                          variant="outlined"
                          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                        >
                          Update Status
                        </Button>
                      )}
                      <Button 
                        size="small" 
                        variant="outlined"
                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                      >
                        Add Notes
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        {/* Milestones Tab */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Milestones</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowMilestoneModal(true)}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              fontWeight: 500,
            }}
          >
            Add Milestone
          </Button>
        </Box>

        {milestones.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center', bgcolor: '#FAFAFA' }}>
            <TimelineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No milestones yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Break down your goal into measurable milestones
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowMilestoneModal(true)}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Create First Milestone
            </Button>
          </Card>
        ) : (
          <Stack spacing={2}>
            {/* Milestones Statistics */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#E3F2FD' }}>
                  <Typography variant="h6" sx={{ color: '#1976D2' }}>
                    {stats.milestonesTotal}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Milestones
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#E8F5E8' }}>
                  <Typography variant="h6" sx={{ color: '#2E7D32' }}>
                    {stats.milestonesCompleted}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#FFF3E0' }}>
                  <Typography variant="h6" sx={{ color: '#F57C00' }}>
                    {stats.milestonesTotal - stats.milestonesCompleted}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Remaining
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card sx={{ p: 2, bgcolor: '#F3E5F5' }}>
                  <Typography variant="h6" sx={{ color: '#7B1FA2' }}>
                    {stats.milestonesTotal > 0 ? 
                      Math.round((stats.milestonesCompleted / stats.milestonesTotal) * 100) : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Progress Timeline */}
            <Card sx={{ p: 3, mb: 2, bgcolor: '#FAFAFA' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 2, color: '#616161' }}>
                Milestone Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {milestones.map((milestone, index) => (
                  <React.Fragment key={milestone.id}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%',
                          bgcolor: milestone.status === 'completed' ? '#10B981' : '#E0E0E0',
                          border: milestone.status === 'in_progress' ? '3px solid #2196F3' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 1
                        }}
                      >
                        {milestone.status === 'completed' && (
                          <CheckCircleIcon sx={{ fontSize: 16, color: 'white' }} />
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ 
                        maxWidth: 60, 
                        textAlign: 'center',
                        fontSize: '0.7rem',
                        lineHeight: 1.2,
                        color: milestone.status === 'completed' ? '#10B981' : 'text.secondary'
                      }}>
                        {milestone.title?.substring(0, 20) || `M${index + 1}`}
                      </Typography>
                    </Box>
                    {index < milestones.length - 1 && (
                      <Box 
                        sx={{ 
                          flex: 1, 
                          height: 2, 
                          bgcolor: milestone.status === 'completed' ? '#10B981' : '#E0E0E0',
                          minWidth: 20,
                          mx: 1
                        }} 
                      />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            </Card>

            {/* Milestones List */}
            {milestones.map((milestone, index) => {
              const statusColor = milestone.status === 'completed' ? '#10B981' : 
                                milestone.status === 'in_progress' ? '#2196F3' : '#6B7280';
              const isCompleted = milestone.status === 'completed';
              
              return (
                <Card 
                  key={milestone.id} 
                  sx={{ 
                    borderRadius: 2,
                    border: milestone.status === 'in_progress' ? '2px solid #2196F3' : '1px solid #E0E0E0',
                    transition: 'all 0.2s',
                    opacity: isCompleted ? 0.8 : 1,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              bgcolor: '#F5F5F5',
                              color: '#616161',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              minWidth: 32,
                              textAlign: 'center'
                            }}
                          >
                            #{index + 1}
                          </Typography>
                          
                          {isCompleted ? (
                            <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
                          ) : milestone.status === 'in_progress' ? (
                            <PendingIcon sx={{ color: '#2196F3', fontSize: 20 }} />
                          ) : (
                            <MilestoneIcon sx={{ color: '#6B7280', fontSize: 20 }} />
                          )}
                          
                          <Chip 
                            label={milestone.status.replace('_', ' ')}
                            size="small"
                            sx={{ 
                              bgcolor: `${statusColor}20`,
                              color: statusColor,
                              fontSize: '0.75rem',
                              textTransform: 'capitalize',
                              height: 20
                            }}
                          />
                        </Box>
                        
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            mb: 1,
                            textDecoration: isCompleted ? 'line-through' : 'none',
                          }}
                        >
                          {milestone.title}
                        </Typography>
                        
                        {milestone.description && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: 2,
                              lineHeight: 1.6,
                              opacity: isCompleted ? 0.7 : 1,
                            }}
                          >
                            {milestone.description}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                          {milestone.target_date && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ScheduleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                Target: {new Date(milestone.target_date).toLocaleDateString()}
                              </Typography>
                            </Box>
                          )}
                          
                          {milestone.success_criteria && (
                            <Chip 
                              label="Has Success Criteria"
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem', height: 20 }}
                            />
                          )}
                        </Box>
                        
                        {milestone.success_criteria && (
                          <Box sx={{ 
                            mt: 2, 
                            p: 2, 
                            bgcolor: '#F8F9FA', 
                            borderRadius: 1,
                            borderLeft: '3px solid #6B7280'
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#616161' }}>
                              Success Criteria:
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, color: '#616161' }}>
                              {milestone.success_criteria}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Order indicator */}
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                          {milestone.order_index}
                        </Typography>
                        
                        <IconButton size="small">
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2, pt: 2, borderTop: '1px solid #E0E0E0' }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => {
                          setEditingMilestone(milestone);
                          setShowMilestoneModal(true);
                        }}
                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                      >
                        Edit Details
                      </Button>
                      {!isCompleted && (
                        <Button 
                          size="small" 
                          variant="outlined"
                          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button 
                        size="small" 
                        variant="outlined"
                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                      >
                        Move Up/Down
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </TabPanel>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          setShowEditGoalModal(true);
        }}>Edit Goal</MenuItem>
        <MenuItem onClick={handleMenuClose}>Archive Goal</MenuItem>
        <MenuItem onClick={handleMenuClose}>Delete Goal</MenuItem>
      </Menu>

      {/* Add Action Modal */}
      <AddActionModal
        open={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setEditingAction(null);
        }}
        goalId={resolvedParams.id}
        goalTitle={data?.goal?.title || 'Goal'}
        existingAction={editingAction}
        onSuccess={() => {
          setShowActionModal(false);
          setEditingAction(null);
        }}
      />

      {/* Associate Contact Modal */}
      <AssociateContactModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        goalId={resolvedParams.id}
        goalTitle={data?.goal?.title || 'Goal'}
        onSuccess={() => setShowContactModal(false)}
      />

      {/* Add POG Modal */}
      <AddPOGModal
        open={showPOGModal}
        onClose={() => setShowPOGModal(false)}
        goalId={resolvedParams.id}
        goalTitle={data?.goal?.title || 'Goal'}
        onSuccess={() => setShowPOGModal(false)}
      />

      {/* Add Ask Modal */}
      <AddAskModal
        open={showAskModal}
        onClose={() => setShowAskModal(false)}
        goalId={resolvedParams.id}
        goalTitle={data?.goal?.title || 'Goal'}
        onSuccess={() => setShowAskModal(false)}
      />

      {/* Add/Edit Milestone Modal */}
      <AddMilestoneModal
        open={showMilestoneModal}
        onClose={() => {
          setShowMilestoneModal(false);
          setEditingMilestone(null);
        }}
        goalId={resolvedParams.id}
        goalTitle={data?.goal?.title || 'Goal'}
        existingMilestone={editingMilestone}
        onSuccess={() => {
          setShowMilestoneModal(false);
          setEditingMilestone(null);
        }}
      />

      {/* Edit Goal Modal */}
      <EditGoalModal
        open={showEditGoalModal}
        onClose={() => setShowEditGoalModal(false)}
        goal={data?.goal}
        onSuccess={() => setShowEditGoalModal(false)}
      />
    </Container>
  );
}