'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  IconButton,
  Chip,
  Fade,
  Grow,
  Paper,
  Divider,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
  Celebration as CelebrationIcon,
  SwipeLeft as SwipeLeftIcon,
  SwipeRight as SwipeRightIcon,
  SkipNext as SkipIcon,
  CheckCircle as CompleteIcon,
} from '@mui/icons-material';
import { useSwipeable } from 'react-swipeable';
import { AddContactActionCard } from './AddContactActionCard';
import { AddMeetingNotesActionCard } from './AddMeetingNotesActionCard';
import { SessionErrorBoundary } from './SessionErrorBoundary';
import type { MeetingArtifactContent } from '@/types/artifact';
import type { RelationshipSession, SessionAction } from '@/lib/hooks/useRelationshipSessions';

interface MobileSessionViewProps {
  session: RelationshipSession;
  currentAction: SessionAction;
  currentActionIndex: number;
  totalActions: number;
  completedActions: Set<string>;
  timeRemaining: number;
  isPaused: boolean;
  onActionComplete: (actionId: string) => void;
  onActionSkip: (actionId: string) => void;
  onPauseResume: () => void;
  onClose: () => void;
}

export const MobileSessionView: React.FC<MobileSessionViewProps> = ({
  session,
  currentAction,
  currentActionIndex,
  totalActions,
  completedActions,
  timeRemaining,
  isPaused,
  onActionComplete,
  onActionSkip,
  onPauseResume,
  onClose,
}) => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemaining <= 0) return 'error';
    if (timeRemaining <= 300) return 'warning'; // 5 minutes
    return 'success';
  };

  // Swipe gesture handlers
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      if (currentAction) {
        setSwipeDirection('right');
        setTimeout(() => {
          onActionComplete(currentAction.id);
          setSwipeDirection(null);
        }, 300);
      }
    },
    onSwipedLeft: () => {
      if (currentAction) {
        setSwipeDirection('left');
        setTimeout(() => {
          onActionSkip(currentAction.id);
          setSwipeDirection(null);
        }, 300);
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const goal = session.goal || session.actions[0]?.goal;
  const currentCount = goal?.goal_contacts?.length || 0;
  const targetCount = goal?.target_contact_count || 50;
  const progress = totalActions > 0 ? (completedActions.size / totalActions) * 100 : 0;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 50%, #1976D2 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          pt: 3,
          color: 'white',
        }}
      >
        <SessionErrorBoundary
          fallback={
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTimeIcon sx={{ fontSize: 24, color: 'white' }} />
              <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'white' }}>
                --:--
              </Typography>
            </Box>
          }
        >
          <Box display="flex" alignItems="center" gap={1}>
            <AccessTimeIcon sx={{ 
              fontSize: 24,
              color: getTimerColor() === 'success' ? 'white' : 
                     getTimerColor() === 'warning' ? '#FFD700' : '#FF6B6B'
            }} />
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 'bold',
                color: getTimerColor() === 'success' ? 'white' : 
                       getTimerColor() === 'warning' ? '#FFD700' : '#FF6B6B',
              }}
            >
              {formatTime(timeRemaining)}
            </Typography>
          </Box>
        </SessionErrorBoundary>

        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            onClick={onPauseResume}
            sx={{ color: 'white' }}
            size="small"
          >
            {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
          </IconButton>
          <IconButton
            onClick={onClose}
            sx={{ color: 'white' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Progress */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Action {currentActionIndex} of {totalActions}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {progress.toFixed(0)}% Complete
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.2)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
              transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            },
          }}
        />
      </Box>

      {/* Goal Context */}
      {goal && (
        <Box sx={{ px: 3, pb: 3 }}>
          <Card sx={{ 
            bgcolor: 'rgba(255,255,255,0.98)', 
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  mb: 1,
                  display: 'block'
                }}
              >
                Strategic Focus
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 600, 
                  lineHeight: 1.2,
                  color: 'text.primary',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }}
              >
                {goal.title}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Current Action */}
      <Box sx={{ flex: 1, px: 2, pb: 2 }}>
        {currentAction ? (
          <SessionErrorBoundary 
            onReset={() => setSwipeDirection(null)}
            fallback={
              <Alert severity="error" sx={{ mt: 2 }}>
                Swipe gestures are temporarily unavailable. Please use the buttons below to continue.
              </Alert>
            }
          >
            <Box
              {...swipeHandlers}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
            {/* Swipe Instructions */}
            <Card sx={{ 
              mb: 3,
              bgcolor: 'rgba(255,255,255,0.95)',
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(8px)',
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    mb: 2,
                    display: 'block'
                  }}
                >
                  Navigation
                </Typography>
                <Box display="flex" justifyContent="space-around" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <SwipeLeftIcon sx={{ color: 'warning.main', fontSize: 24 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      Skip
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <SwipeRightIcon sx={{ color: 'success.main', fontSize: 24 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      Complete
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Action Card with Swipe Animation */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                borderRadius: 4,
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(20px)',
                transform: swipeDirection === 'right' ? 'translateX(100px) rotate(8deg)' :
                          swipeDirection === 'left' ? 'translateX(-100px) rotate(-8deg)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: swipeDirection ? 0.8 : 1,
              }}
            >
              {currentAction.action_type === 'add_contact_to_goal' ? (
                <AddContactActionCard
                  actionId={currentAction.id}
                  goalId={currentAction.goal_id || ''}
                  goalTitle={goal?.title || 'Unknown Goal'}
                  currentCount={currentCount}
                  targetCount={targetCount}
                  onComplete={onActionComplete}
                  onSkip={onActionSkip}
                  isMobile={true}
                />
              ) : (
                <AddMeetingNotesActionCard
                  actionId={currentAction.id}
                  meetingArtifactId={currentAction.artifact_id || ''}
                  contactId={currentAction.contact_id || ''}
                  contactName={currentAction.contact?.name || 'Unknown Contact'}
                  contactProfilePicture={null}
                  meetingTitle={(currentAction.artifact?.metadata && typeof currentAction.artifact.metadata === 'object' && 'title' in currentAction.artifact.metadata ? currentAction.artifact.metadata.title as string : undefined) || 'Meeting'}
                  meetingMetadata={currentAction.artifact?.metadata as MeetingArtifactContent || {} as MeetingArtifactContent}
                  onComplete={onActionComplete}
                  onSkip={onActionSkip}
                  isMobile={true}
                />
              )}
            </Paper>
          </Box>
          </SessionErrorBoundary>
        ) : (
          // No more actions
          <Card sx={{ 
            bgcolor: 'rgba(255,255,255,0.98)', 
            borderRadius: 4,
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(20px)',
          }}>
            <CardContent sx={{ p: 5 }}>
              <CelebrationIcon sx={{ fontSize: 72, color: '#10B981', mb: 3 }} />
              <Typography 
                variant="h3" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2,
                  fontSize: { xs: '1.75rem', sm: '2rem' }
                }}
              >
                Session Complete
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  mb: 4,
                  fontSize: '1.0625rem',
                  lineHeight: 1.6,
                  maxWidth: '280px',
                  mx: 'auto'
                }}
              >
                Strategic connections systematically advanced. Your relationship intelligence grows stronger.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={onClose}
                sx={{ 
                  borderRadius: 2,
                  px: 5,
                  py: 1.5,
                  fontSize: '1.0625rem',
                  fontWeight: 500,
                  minWidth: 160,
                  boxShadow: '0 4px 20px rgba(33, 150, 243, 0.25)',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 6px 24px rgba(33, 150, 243, 0.35)',
                  },
                  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Complete Session
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Bottom Action Buttons */}
      {currentAction && (
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            p: 3,
            bgcolor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(15px)',
            borderTop: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={() => onActionSkip(currentAction.id)}
            startIcon={<SkipIcon />}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.6)',
              borderWidth: '1.5px',
              fontWeight: 500,
              fontSize: '1.0625rem',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.9)',
                bgcolor: 'rgba(255,255,255,0.15)',
                transform: 'scale(1.02)',
              },
              borderRadius: 2,
              py: 1.5,
              minHeight: 52,
              transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            Skip
          </Button>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => onActionComplete(currentAction.id)}
            startIcon={<CompleteIcon />}
            sx={{
              bgcolor: '#10B981',
              fontWeight: 500,
              fontSize: '1.0625rem',
              '&:hover': {
                bgcolor: '#059669',
                transform: 'scale(1.02)',
                boxShadow: '0 6px 24px rgba(16, 185, 129, 0.35)',
              },
              borderRadius: 2,
              py: 1.5,
              minHeight: 52,
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.25)',
              transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            Complete
          </Button>
        </Box>
      )}
    </Box>
  );
};