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
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  TrendingUp as GoalIcon,
  MoreVert as MoreVertIcon,
  Launch as LaunchIcon,
  Star as PrimaryIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Psychology as MentorIcon,
  Groups as CommunityIcon,
  Public as ExpansionIcon,
  AttachMoney as InvestorIcon,
  Handshake as ClientIcon,
  Rocket as StartupIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface ContactGoal {
  id: string;
  title: string;
  isActive: boolean;
  relationship_type: string;
  relevance_score: number;
  how_they_help?: string;
  status?: string;
  progress_percentage?: number;
  category?: string;
}

interface AssociatedGoalsCardProps {
  contactId: string;
  contactName: string;
  goals: ContactGoal[];
  onGoalClick?: (goalId: string) => void;
}

const RELATIONSHIP_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  decision_maker: { label: 'Decision Maker', icon: <BusinessIcon fontSize="small" />, color: '#DC2626' },
  key_influencer: { label: 'Key Influencer', icon: <PersonIcon fontSize="small" />, color: '#7C3AED' },
  gatekeeper: { label: 'Gatekeeper', icon: <PersonIcon fontSize="small" />, color: '#059669' },
  champion: { label: 'Champion', icon: <PersonIcon fontSize="small" />, color: '#F59E0B' },
  mentor: { label: 'Mentor/Advisor', icon: <MentorIcon fontSize="small" />, color: '#2563EB' },
  peer: { label: 'Peer/Colleague', icon: <PersonIcon fontSize="small" />, color: '#6B7280' },
  team_member: { label: 'Team Member', icon: <PersonIcon fontSize="small" />, color: '#10B981' },
  external_expert: { label: 'External Expert', icon: <MentorIcon fontSize="small" />, color: '#8B5CF6' },
  community_member: { label: 'Community Member', icon: <CommunityIcon fontSize="small" />, color: '#06B6D4' },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  career_transition: <PersonIcon fontSize="small" />,
  startup: <StartupIcon fontSize="small" />,
  client_relationships: <ClientIcon fontSize="small" />,
  investors_partners: <InvestorIcon fontSize="small" />,
  industry_expansion: <ExpansionIcon fontSize="small" />,
  learning_mentorship: <MentorIcon fontSize="small" />,
  community_deepening: <CommunityIcon fontSize="small" />,
  other: <GoalIcon fontSize="small" />,
};

export const AssociatedGoalsCard: React.FC<AssociatedGoalsCardProps> = ({
  contactId,
  contactName,
  goals,
  onGoalClick,
}) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedGoal, setSelectedGoal] = React.useState<ContactGoal | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, goal: ContactGoal) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedGoal(goal);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGoal(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'completed': return '#2196F3';
      case 'paused': return '#F59E0B';
      case 'cancelled': return '#9E9E9E';
      default: return '#6B7280';
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 8) return '#DC2626';
    if (score >= 6) return '#F59E0B';
    if (score >= 4) return '#2196F3';
    return '#10B981';
  };

  const handleGoalClick = (goalId: string) => {
    if (onGoalClick) {
      onGoalClick(goalId);
    } else {
      router.push(`/dashboard/goals/${goalId}`);
    }
  };

  if (goals.length === 0) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <GoalIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Associated Goals
            </Typography>
          </Box>
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 3,
              border: '1px dashed #E0E0E0',
              borderRadius: 2,
              bgcolor: '#FAFAFA'
            }}
          >
            <GoalIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {contactName} isn't associated with any goals yet
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => router.push('/dashboard/goals')}
              sx={{ textTransform: 'none' }}
            >
              View All Goals
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
            <GoalIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Associated Goals
            </Typography>
            <Chip 
              label={goals.length} 
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
            All Goals
          </Button>
        </Box>

        <Stack spacing={2}>
          {goals.map((goal) => {
            const relationshipData = RELATIONSHIP_TYPE_LABELS[goal.relationship_type] || 
              { label: goal.relationship_type?.replace('_', ' ') || 'other', icon: <PersonIcon fontSize="small" />, color: '#6B7280' };

            return (
              <Card 
                key={goal.id} 
                variant="outlined" 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-1px)',
                  },
                }}
                onClick={() => handleGoalClick(goal.id)}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                      {goal.category && CATEGORY_ICONS[goal.category]}
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600, 
                          flex: 1,
                          lineHeight: 1.3,
                        }}
                      >
                        {goal.title}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, goal)}
                      sx={{ ml: 1 }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Status and Progress */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Chip
                      label={goal.status || 'active'}
                      size="small"
                      sx={{
                        bgcolor: `${getStatusColor(goal.status || 'active')}20`,
                        color: getStatusColor(goal.status || 'active'),
                        textTransform: 'capitalize',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                      }}
                    />
                    {typeof goal.progress_percentage === 'number' && (
                      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={goal.progress_percentage}
                          sx={{
                            flex: 1,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#E5E7EB',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              background: goal.progress_percentage >= 75 ? '#10B981' : 
                                         goal.progress_percentage >= 50 ? '#2196F3' : 
                                         goal.progress_percentage >= 25 ? '#F59E0B' : '#9E9E9E',
                            },
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 500, minWidth: '35px' }}>
                          {goal.progress_percentage}%
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Relationship Context */}
                  <Box sx={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color: relationshipData.color }}>
                        {relationshipData.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {relationshipData.label}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Relevance:
                      </Typography>
                      <Chip
                        label={`${goal.relevance_score}/10`}
                        size="small"
                        sx={{
                          bgcolor: `${getRelevanceColor(goal.relevance_score)}20`,
                          color: getRelevanceColor(goal.relevance_score),
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          minWidth: '45px',
                        }}
                      />
                    </Box>
                  </Box>

                  {/* How They Help */}
                  {goal.how_they_help && (
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #F3F4F6' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        "{goal.how_they_help}"
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>

        {/* Goal Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              minWidth: 180,
            },
          }}
        >
          <MenuItem onClick={() => {
            if (selectedGoal) handleGoalClick(selectedGoal.id);
            handleMenuClose();
          }}>
            <LaunchIcon fontSize="small" sx={{ mr: 1 }} />
            View Goal Details
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedGoal) {
              router.push(`/dashboard/goals/${selectedGoal.id}?tab=contacts`);
            }
            handleMenuClose();
          }}>
            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
            View Goal Contacts
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={() => {
              router.push('/dashboard/goals');
              handleMenuClose();
            }} 
            sx={{ color: 'text.secondary' }}
          >
            <GoalIcon fontSize="small" sx={{ mr: 1 }} />
            All Goals
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};