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
  Skip as SkipIcon,
  CheckCircle as CompleteIcon,
} from '@mui/icons-material';
import { useSwipeable } from 'react-swipeable';
import { AddContactActionCard } from './AddContactActionCard';
import { AddMeetingNotesActionCard } from './AddMeetingNotesActionCard';
import type { MeetingArtifactContent } from '@/types/artifact';

interface MobileSessionViewProps {
  session: any;
  currentAction: any;
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            height: 6,
            borderRadius: 3,
            bgcolor: 'rgba(255,255,255,0.2)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)',
            },
          }}
        />
      </Box>

      {/* Goal Context */}
      {goal && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Card sx={{ 
            bgcolor: 'rgba(255,255,255,0.95)', 
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Current Goal
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {goal.title}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Current Action */}
      <Box sx={{ flex: 1, px: 2, pb: 2 }}>
        {currentAction ? (
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
              mb: 2,
              bgcolor: 'rgba(255,255,255,0.9)',
              borderRadius: 2,
            }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Box display="flex" justifyContent="space-around" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <SwipeLeftIcon sx={{ color: 'warning.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Swipe left to skip
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box display="flex" alignItems="center" gap={1}>
                    <SwipeRightIcon sx={{ color: 'success.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Swipe right to complete
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Action Card with Swipe Animation */}
            <Paper
              elevation={12}
              sx={{
                flex: 1,
                borderRadius: 3,
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '2px solid rgba(33, 150, 243, 0.2)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                transform: swipeDirection === 'right' ? 'translateX(100px) rotate(10deg)' :
                          swipeDirection === 'left' ? 'translateX(-100px) rotate(-10deg)' : 'none',
                transition: 'all 0.3s ease-in-out',
                opacity: swipeDirection ? 0.7 : 1,
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
        ) : (
          // No more actions
          <Card sx={{ 
            bgcolor: 'rgba(255,255,255,0.95)', 
            borderRadius: 3,
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CardContent>
              <CelebrationIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                🎉 Session Complete!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Amazing work! You've completed all relationship building actions.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={onClose}
                sx={{ 
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                Finish Session
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
            gap: 2,
            p: 2,
            bgcolor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
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
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.8)',
                bgcolor: 'rgba(255,255,255,0.1)',
              },
              borderRadius: 3,
              py: 1.5,
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
              bgcolor: 'success.main',
              '&:hover': {
                bgcolor: 'success.dark',
              },
              borderRadius: 3,
              py: 1.5,
            }}
          >
            Complete
          </Button>
        </Box>
      )}
    </Box>
  );
};