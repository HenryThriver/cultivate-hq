'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  alpha,
  useTheme,
  Fade,
  Grow,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  AccountBalance as AccountBalanceIcon,
  Groups as GroupsIcon,
  EventNote as EventNoteIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { SessionStartModal } from '@/components/features/relationship-sessions';
import { useRouter } from 'next/navigation';

// ===============================================
// TYPES
// ===============================================

interface PendingActionCounts {
  pogs: number;
  asks: number;
  followUps: number;
  meetings: number;
  contacts: number;
}

interface RecentSessionData {
  lastSessionDate: string | null;
  daysSinceLastSession: number | null;
  totalSessions: number;
  averageSessionsPerWeek: number;
  momentumMessage: string;
}

interface RelationshipSessionCardProps {
  pendingActions?: PendingActionCounts;
  recentSessions?: RecentSessionData;
  loadingActions?: boolean;
  loadingSessions?: boolean;
  loadingGoals?: boolean;
  onSessionCreated: (sessionId: string) => void;
}

// ===============================================
// ACTION DISPLAY CONFIGURATION
// ===============================================

const getActionConfig = (type: keyof PendingActionCounts, count: number) => {
  const configs = {
    pogs: {
      icon: AccountBalanceIcon,
      label: count === 1 ? 'POG' : 'POGs',
      color: '#059669', // Sage green for wisdom/value creation
      description: 'Packets of Generosity ready to deliver',
      priority: 'high' as const
    },
    asks: {
      icon: PsychologyIcon,
      label: count === 1 ? 'Ask' : 'Asks',
      color: '#2196F3', // Primary blue for strategic requests
      description: 'Strategic requests awaiting follow-up',
      priority: 'high' as const
    },
    meetings: {
      icon: EventNoteIcon,
      label: count === 1 ? 'Meeting' : 'Meetings',
      color: '#F59E0B', // Warm amber for opportunities
      description: 'Meeting insights ready to capture',
      priority: 'medium' as const
    },
    followUps: {
      icon: TrendingUpIcon,
      label: 'Follow-ups',
      color: '#7C3AED', // Deep plum for strategic continuation
      description: 'Relationship touchpoints to nurture',
      priority: 'medium' as const
    },
    contacts: {
      icon: GroupsIcon,
      label: count === 1 ? 'Contact' : 'Contacts',
      color: '#616161', // Neutral for administrative tasks
      description: 'Strategic connections to add',
      priority: 'low' as const
    }
  };
  
  return configs[type];
};

// ===============================================
// COMPACT ACTION DISPLAY
// ===============================================

const ActionDisplay: React.FC<{ 
  type: keyof PendingActionCounts; 
  count: number; 
  index: number;
}> = ({ type, count, index }) => {
  const config = getActionConfig(type, count);
  const IconComponent = config.icon;
  
  const isEmpty = count === 0;
  
  return (
    <Grow
      in={true}
      timeout={600 + (index * 100)} // Faster staggered entrance
      style={{ transformOrigin: 'center center' }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderRadius: 2.5,
          background: isEmpty 
            ? `linear-gradient(135deg, ${alpha('#9E9E9E', 0.04)} 0%, ${alpha('#9E9E9E', 0.02)} 100%)` 
            : `linear-gradient(135deg, ${alpha(config.color, 0.08)} 0%, ${alpha(config.color, 0.04)} 100%)`,
          border: isEmpty 
            ? `1px solid ${alpha('#9E9E9E', 0.08)}` 
            : `1px solid ${alpha(config.color, 0.12)}`,
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: isEmpty ? 'default' : 'pointer',
          minWidth: 80,
          flex: 1,
          opacity: isEmpty ? 0.6 : 1,
          
          '&:hover': isEmpty ? {} : {
            background: `linear-gradient(135deg, ${alpha(config.color, 0.12)} 0%, ${alpha(config.color, 0.06)} 100%)`,
            border: `1px solid ${alpha(config.color, 0.2)}`,
            transform: 'translateY(-2px)',
            boxShadow: `0 6px 20px ${alpha(config.color, 0.15)}`,
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 2,
            background: isEmpty 
              ? `linear-gradient(135deg, #9E9E9E 0%, ${alpha('#9E9E9E', 0.8)} 100%)` 
              : `linear-gradient(135deg, ${config.color} 0%, ${alpha(config.color, 0.8)} 100%)`,
            color: 'white',
            boxShadow: isEmpty 
              ? `0 2px 6px ${alpha('#9E9E9E', 0.2)}` 
              : `0 3px 10px ${alpha(config.color, 0.3)}`,
          }}
        >
          <IconComponent sx={{ fontSize: 16 }} />
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 700,
              color: isEmpty ? 'text.disabled' : 'text.primary',
              lineHeight: 1,
              fontSize: '1rem'
            }}
          >
            {count}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: isEmpty ? 'text.disabled' : 'text.secondary',
              fontSize: '0.75rem',
              fontWeight: 500,
              opacity: isEmpty ? 0.7 : 0.9,
              lineHeight: 1.2
            }}
          >
            {config.label}
          </Typography>
        </Box>
      </Box>
    </Grow>
  );
};

// ===============================================
// MAIN COMPONENT
// ===============================================

export const RelationshipSessionCard: React.FC<RelationshipSessionCardProps> = ({
  pendingActions,
  recentSessions,
  loadingActions = false,
  loadingSessions = false,
  loadingGoals = false,
  onSessionCreated
}) => {
  const theme = useTheme();
  const router = useRouter();
  const [showStartModal, setShowStartModal] = useState(false);

  const handleStartSession = () => {
    setShowStartModal(true);
  };

  const handleSessionCreated = (sessionId: string) => {
    setShowStartModal(false);
    onSessionCreated(sessionId);
  };

  // Calculate total actions and insights
  const totalActions = pendingActions ? 
    pendingActions.pogs + pendingActions.asks + pendingActions.meetings + 
    pendingActions.followUps + pendingActions.contacts : 0;

  const hasHighPriorityActions = pendingActions ? 
    pendingActions.pogs > 0 || pendingActions.asks > 0 : false;

  // Always show all 5 categories, even if count is 0
  const allActionTypes: Array<keyof PendingActionCounts> = ['pogs', 'asks', 'meetings', 'followUps', 'contacts'];
  const actionEntries = allActionTypes.map(type => [type, pendingActions?.[type] || 0] as [keyof PendingActionCounts, number]);

  return (
    <>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 4, md: 5 }, // Golden ratio premium spacing
          borderRadius: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          
          '&:hover': {
            boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.12)}`,
            transform: 'translateY(-4px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          },
          
          // Sophisticated gradient accent
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, #059669 35%, #F59E0B 70%, #7C3AED 100%)`,
            borderRadius: '16px 16px 0 0',
          },
          
          // Subtle texture overlay
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23000" fill-opacity="0.01"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3C/g%3E%3C/svg%3E")',
            pointerEvents: 'none',
            opacity: 0.3,
          }
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
                color: 'white',
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 24 }} />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h5" 
                component="h2"
                sx={{ 
                  fontWeight: 600,
                  color: 'primary.main',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2
                }}
              >
                Start Relationship-Building Session
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  opacity: 0.9,
                  mt: 0.5
                }}
              >
                Time-boxed sessions to advance your most important relationships
              </Typography>
            </Box>
          </Box>

          {/* Session Momentum Display */}
          {!loadingSessions && recentSessions && (
            <Fade in={true} timeout={800}>
              <Box
                sx={{
                  textAlign: 'center',
                  py: 2,
                  px: 3,
                  borderRadius: 3,
                  background: alpha(theme.palette.success.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.08)}`,
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    lineHeight: 1.4
                  }}
                >
                  {recentSessions.momentumMessage}
                </Typography>
                {recentSessions.daysSinceLastSession !== null && recentSessions.daysSinceLastSession > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      fontWeight: 600,
                      color: 'primary.main',
                      fontSize: '0.75rem'
                    }}
                  >
                    {recentSessions.daysSinceLastSession} day{recentSessions.daysSinceLastSession !== 1 ? 's' : ''} since last session
                  </Typography>
                )}
              </Box>
            </Fade>
          )}
        </Box>

        {/* Primary Action Button */}
        <Box sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
          {loadingGoals ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', py: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Analyzing relationship opportunities...
              </Typography>
            </Box>
          ) : (
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={handleStartSession}
              disabled={loadingGoals}
              sx={{ 
                width: '100%',
                py: 2.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.9)} 100%)`,
                boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                textTransform: 'none',
                letterSpacing: '0.3px',
                transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                
                '&:hover': {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)} 0%, ${theme.palette.primary.main} 100%)`,
                  boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-2px)',
                },
                
                '&:disabled': {
                  background: alpha(theme.palette.text.disabled, 0.12),
                  boxShadow: 'none',
                  transform: 'none'
                }
              }}
            >
              Begin Session
            </Button>
          )}
        </Box>

        {/* Actions Pending Section */}
        <Box
          sx={{
            pt: 4,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            position: 'relative',
            zIndex: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                letterSpacing: '-0.01em'
              }}
            >
              Actions Pending
            </Typography>
            {totalActions > 0 && (
              <Chip
                size="small"
                label={`${totalActions} total`}
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  bgcolor: hasHighPriorityActions ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                  color: hasHighPriorityActions ? theme.palette.warning.main : theme.palette.primary.main,
                }}
              />
            )}
          </Box>

          {loadingActions ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', py: 3 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Analyzing pending actions...
              </Typography>
            </Box>
          ) : totalActions === 0 ? (
            <Fade in={true} timeout={1000}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  gap: 2, 
                  py: 4,
                  textAlign: 'center'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                    border: `2px solid ${alpha(theme.palette.success.main, 0.15)}`,
                  }}
                >
                  <AccessTimeIcon 
                    sx={{ 
                      fontSize: 28, 
                      color: theme.palette.success.main,
                      opacity: 0.8 
                    }} 
                  />
                </Box>
                <Box>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'success.main',
                      mb: 0.5
                    }}
                  >
                    All actions completed
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      fontSize: '0.9rem'
                    }}
                  >
                    Excellent momentum. Your relationship portfolio is optimized.
                  </Typography>
                </Box>
              </Box>
            </Fade>
          ) : (
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                alignItems: 'stretch'
              }}
            >
              {actionEntries.map(([type, count], index) => (
                <ActionDisplay 
                  key={type}
                  type={type}
                  count={count}
                  index={index}
                />
              ))}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Session Start Modal */}
      <SessionStartModal
        open={showStartModal}
        onClose={() => setShowStartModal(false)}
        onSessionCreated={handleSessionCreated}
      />
    </>
  );
};