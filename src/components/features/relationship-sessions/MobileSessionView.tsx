'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  IconButton,
  SwipeableDrawer,
  Fab,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Close as CloseIcon,
  Timer as TimerIcon,
  CheckCircle as CheckIcon,
  SkipNext as SkipIcon,
  Celebration as CelebrationIcon,
  TouchApp as TouchIcon,
} from '@mui/icons-material';
import { useSwipeable } from 'react-swipeable';
// Type definitions - these match the Supabase schema
interface RelationshipSession {
  id: string;
  user_id: string;
  session_type: string;
  status: string;
  goal_id?: string;
  duration_minutes: number;
  timer_started_at?: string;
  started_at: string;
  total_paused_duration?: number;
  completed_at?: string;
  created_at: string;
  actions: Action[];
  goal?: any;
}

interface Action {
  id: string;
  action_type: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  duration_minutes?: number;
  goal_id?: string;
  contact_id?: string;
  artifact_id?: string;
  session_id?: string;
  context_metadata?: any;
  created_at: string;
  contact?: {
    id: string;
    name: string;
  };
  artifact?: {
    id: string;
    metadata: any;
    created_at: string;
  };
  goal?: any;
}

interface MobileSessionViewProps {
  session: RelationshipSession;
  currentAction: Action | null;
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
  const theme = useTheme();
  const [showGestureHint, setShowGestureHint] = useState(true);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const progress = totalActions > 0 ? (completedActions.size / totalActions) * 100 : 0;

  // Hide gesture hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGestureHint(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    onSwipedDown: () => {
      setBottomDrawerOpen(true);
    },
    preventScrollOnSwipe: true,
    trackMouse: false,
    delta: 50,
  });

  // Long press handler for context
  const handleLongPressStart = () => {
    const timer = setTimeout(() => {
      setBottomDrawerOpen(true);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const getTimerColor = () => {
    if (timeRemaining <= 0) return theme.palette.error.main;
    if (timeRemaining <= 300) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const goal = session.goal || session.actions[0]?.goal;

  return (
    <Box
      {...swipeHandlers}
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Status Bar - Sticky Top */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          px: 2,
          py: 1.5,
        }}
      >
        {/* Timer and Progress Row */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <TimerIcon sx={{ fontSize: 20, color: getTimerColor() }} />
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 'bold',
                color: getTimerColor(),
                fontSize: isSmallMobile ? '1rem' : '1.2rem',
              }}
            >
              {formatTime(timeRemaining)}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              size="small"
              onClick={onPauseResume}
              sx={{ color: theme.palette.primary.main }}
            >
              {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
            </IconButton>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: theme.palette.grey[600] }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)',
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 0.5,
              color: 'text.secondary',
              fontSize: '0.7rem',
            }}
          >
            {completedActions.size} of {totalActions} actions
          </Typography>
        </Box>
      </Box>

      {/* Goal Display - Collapsible */}
      {goal && (
        <Box
          sx={{
            bgcolor: 'white',
            mx: 2,
            mt: 2,
            mb: 1,
            p: 2,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'primary.main',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
            }}
          >
            Current Goal
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              fontWeight: 500,
              lineHeight: 1.3,
              fontSize: isSmallMobile ? '0.9rem' : '1rem',
            }}
          >
            {goal.title}
          </Typography>
        </Box>
      )}

      {/* Main Action Card Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 3,
          position: 'relative',
        }}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
      >
        {currentAction ? (
          <Card
            sx={{
              width: '100%',
              maxWidth: 400,
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
              transform: swipeDirection === 'right' 
                ? 'translateX(100%) rotate(10deg)' 
                : swipeDirection === 'left'
                ? 'translateX(-100%) rotate(-10deg)'
                : 'translateX(0)',
              transition: 'transform 0.3s ease-out',
              opacity: swipeDirection ? 0.5 : 1,
              border: swipeDirection === 'right'
                ? '3px solid #4caf50'
                : swipeDirection === 'left'
                ? '3px solid #ff9800'
                : 'none',
            }}
          >
            <CardContent sx={{ flex: 1, p: 3, position: 'relative' }}>
              {/* Action Number Badge */}
              <Badge
                badgeContent={`${currentActionIndex}/${totalActions}`}
                color="primary"
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  '& .MuiBadge-badge': {
                    fontSize: '0.8rem',
                    height: 24,
                    minWidth: 40,
                  },
                }}
              />

              {/* Action Type */}
              <Typography
                variant="overline"
                sx={{
                  color: 'primary.main',
                  fontWeight: 'bold',
                  display: 'block',
                  mb: 2,
                }}
              >
                {currentAction.action_type.replace(/_/g, ' ').toUpperCase()}
              </Typography>

              {/* Action Title */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  lineHeight: 1.3,
                  fontSize: isSmallMobile ? '1.1rem' : '1.3rem',
                }}
              >
                {currentAction.title}
              </Typography>

              {/* Action Description */}
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 3,
                  fontSize: isSmallMobile ? '0.95rem' : '1rem',
                }}
              >
                {currentAction.description}
              </Typography>

              {/* Duration Chip */}
              <Chip
                label={`${currentAction.duration_minutes || 15} min`}
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                }}
              />

              {/* Priority Indicator */}
              {currentAction.priority && (
                <Chip
                  label={currentAction.priority}
                  size="small"
                  color={
                    currentAction.priority === 'urgent' ? 'error' :
                    currentAction.priority === 'high' ? 'warning' :
                    'default'
                  }
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                  }}
                />
              )}
            </CardContent>
          </Card>
        ) : (
          <Card
            sx={{
              width: '100%',
              maxWidth: 400,
              minHeight: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 3,
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
              background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <CelebrationIcon sx={{ fontSize: 64, color: 'white', mb: 2 }} />
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
                All Done!
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                You've completed all actions in this session. Great work!
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Gesture Hint Overlay */}
      {showGestureHint && currentAction && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 100,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            px: 4,
            pointerEvents: 'none',
            animation: 'fadeOut 5s ease-out forwards',
            '@keyframes fadeOut': {
              '0%': { opacity: 1 },
              '70%': { opacity: 1 },
              '100%': { opacity: 0 },
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SkipIcon sx={{ color: 'white', opacity: 0.8 }} />
            <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
              Swipe left to skip
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
              Swipe right to complete
            </Typography>
            <CheckIcon sx={{ color: 'white', opacity: 0.8 }} />
          </Box>
        </Box>
      )}

      {/* Bottom Action Buttons - Mobile Friendly */}
      {currentAction && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            display: 'flex',
            gap: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={() => onActionSkip(currentAction.id)}
            startIcon={<SkipIcon />}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontSize: isSmallMobile ? '0.9rem' : '1rem',
            }}
          >
            Skip
          </Button>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => onActionComplete(currentAction.id)}
            startIcon={<CheckIcon />}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontSize: isSmallMobile ? '0.9rem' : '1rem',
              background: 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)',
            }}
          >
            Complete
          </Button>
        </Box>
      )}

      {/* Context Drawer */}
      <SwipeableDrawer
        anchor="bottom"
        open={bottomDrawerOpen}
        onClose={() => setBottomDrawerOpen(false)}
        onOpen={() => setBottomDrawerOpen(true)}
        swipeAreaWidth={20}
        disableSwipeToOpen={false}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '70vh',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              width: 40,
              height: 4,
              bgcolor: 'grey.300',
              borderRadius: 2,
              mx: 'auto',
              mb: 2,
            }}
          />
          
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Action Context
          </Typography>
          
          {currentAction && (
            <>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Type: {currentAction.action_type}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Priority: {currentAction.priority || 'Medium'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Duration: {currentAction.duration_minutes || 15} minutes
              </Typography>
              
              {currentAction.context_metadata && (
                <>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 1 }}>
                    Additional Information
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {JSON.stringify(currentAction.context_metadata, null, 2)}
                  </Typography>
                </>
              )}
            </>
          )}
        </Box>
      </SwipeableDrawer>
    </Box>
  );
};