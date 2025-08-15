'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Fade,
  Grow,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
  Celebration as CelebrationIcon,
  ExitToApp as ExitIcon,
  Work as WorkIcon,
  ArrowForward as ArrowForwardIcon,
  FlagOutlined as GoalIcon,
  EmojiEvents as TrophyIcon,
  Rocket as RocketIcon,
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/lib/hooks/useRelationshipSessions';
import { AddContactActionCard } from './AddContactActionCard';
import { AddMeetingNotesActionCard } from './AddMeetingNotesActionCard';
import { MobileSessionView } from './MobileSessionView';
import type { MeetingArtifactContent } from '@/types/artifact';

interface RelationshipSessionInterfaceProps {
  sessionId: string;
  onClose: () => void;
}

export const RelationshipSessionInterface: React.FC<RelationshipSessionInterfaceProps> = ({
  sessionId,
  onClose,
}) => {
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState<boolean>(false);
  const [showInitialCelebration, setShowInitialCelebration] = useState<boolean>(true);
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { data: session, isLoading, error } = useSession(sessionId);
  // const completeAction = useCompleteSessionAction();
  
  // Hide initial celebration after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialCelebration(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);
  
  // Timer logic with pause/resume support
  useEffect(() => {
    if (!session || isPaused) return;
    
    const startTime = new Date(session.timer_started_at || session.started_at);
    const durationMs = (session.duration_minutes || 30) * 60 * 1000;
    const pausedDurationMs = (session.total_paused_duration || 0) * 1000;
    
    const updateTimer = () => {
      const now = new Date();
      const elapsedMs = now.getTime() - startTime.getTime() - pausedDurationMs;
      const remainingMs = Math.max(0, durationMs - elapsedMs);
      
      setTimeRemaining(Math.ceil(remainingMs / 1000));
      
      if (remainingMs <= 0) {
        setIsTimerRunning(false);
      }
    };
    
    updateTimer();
    
    if (isTimerRunning) {
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [session, isTimerRunning, isPaused]);
  
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
  
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    setIsTimerRunning(!isPaused);
  };
  
  const completeSession = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/relationship-sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete session');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationship-sessions'] });
      onClose();
    }
  });
  
  const handleActionComplete = (actionId: string) => {
    setCompletedActions(prev => new Set(prev).add(actionId));
    setRecentlyCompleted(actionId);
    setShowCelebration(true);
    
    // Clear celebration after 3 seconds
    setTimeout(() => {
      setShowCelebration(false);
      setRecentlyCompleted(null);
    }, 3000);
    
    // Check if all actions are completed
    if (session && completedActions.size + 1 >= session.actions.length) {
      setTimeout(() => {
        setShowCompletionDialog(true);
      }, 3500); // Show completion dialog after celebration
    }
  };
  
  const handleActionSkip = (actionId: string) => {
    setCompletedActions(prev => new Set(prev).add(actionId));
    
    // Check if all actions are handled
    if (session && completedActions.size + 1 >= session.actions.length) {
      setTimeout(() => {
        setShowCompletionDialog(true);
      }, 1000);
    }
  };
  
  const handleEndSession = () => {
    completeSession.mutate();
    setShowCompletionDialog(false);
  };
  
  const handleContinueWorking = () => {
    setShowCompletionDialog(false);
    // User can continue working in the session
  };
  
  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <RocketIcon sx={{ fontSize: 64, mb: 2, animation: 'pulse 2s ease-in-out infinite' }} />
          <Typography variant="h6">Loading your relationship building session...</Typography>
        </Box>
      </Box>
    );
  }
  
  if (error || !session) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 4
      }}>
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>Session Loading Error</Typography>
          Failed to load relationship session. Please try again.
          <Box sx={{ mt: 2 }}>
            <Button onClick={onClose} variant="contained">
              Return to Dashboard
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }
  
  const totalActions = session.actions.length;
  const completedCount = completedActions.size;
  const progress = totalActions > 0 ? (completedCount / totalActions) * 100 : 0;
  const remainingActions = session.actions.filter((action) => !completedActions.has(action.id));
  const allActionsCompleted = completedCount === totalActions;
  
  // Get goal information from session or first action
  const goal = session.goal || session.actions[0]?.goal;
  
  // Calculate current and target counts for the goal
  const currentCount = goal?.goal_contacts?.length || 0;
  const targetCount = goal?.target_contact_count || 50;
  
  // Get current action for mobile view
  const currentAction = remainingActions[0] || null;
  const currentActionIndex = totalActions - remainingActions.length + 1;
  
  // Use mobile view for small screens
  if (isMobile) {
    return (
      <MobileSessionView
        session={session}
        currentAction={currentAction}
        currentActionIndex={currentActionIndex}
        totalActions={totalActions}
        completedActions={completedActions}
        timeRemaining={timeRemaining}
        isPaused={isPaused}
        onActionComplete={handleActionComplete}
        onActionSkip={handleActionSkip}
        onPauseResume={handlePauseResume}
        onClose={onClose}
      />
    );
  }
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 50%, #1976D2 100%)',
        position: 'relative',
        overflow: 'auto',
      }}
    >
      {/* Initial Celebration Overlay */}
      {showInitialCelebration && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <Fade in={showInitialCelebration} timeout={1000}>
            <Box
              sx={{
                textAlign: 'center',
                color: 'white',
                padding: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
              }}
            >
              <TrophyIcon sx={{ fontSize: 80, mb: 2, color: '#FFD700' }} />
              <Typography variant="h3" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '1.75rem', sm: '2rem' } }}>
                Strategic Connection Session
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 500, mx: 'auto', fontWeight: 400, lineHeight: 1.6 }}>
                Time to systematically strengthen your professional network. Each connection builds strategic advantage.
              </Typography>
            </Box>
          </Fade>
        </Box>
      )}

      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          zIndex: 1000,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Main Content */}
      <Box sx={{ p: 4, pt: 6, maxWidth: 1000, mx: 'auto' }}>
        {/* Combined Header Card */}
        <Card
          sx={{
            mb: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Top Row: Goal and Actions Count */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary', 
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    mb: 0.5,
                    display: 'block'
                  }}
                >
                  Strategic Focus
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600, 
                    lineHeight: 1.2,
                    color: 'text.primary',
                  }}
                >
                  {goal?.title || 'Session Active'}
                </Typography>
              </Box>
              <Chip
                label={`${completedCount} of ${totalActions} actions`}
                color="primary"
                variant="outlined"
                sx={{ 
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  height: 32,
                }}
              />
            </Box>

            {/* Bottom Row: Timer and Progress */}
            <Box display="flex" alignItems="center" justifyContent="space-between">
              {/* Timer Section */}
              <Box display="flex" alignItems="center" gap={2}>
                <AccessTimeIcon sx={{ fontSize: 24, color: getTimerColor() === 'success' ? '#10B981' : getTimerColor() === 'warning' ? '#F59E0B' : '#EF4444' }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: getTimerColor() === 'success' ? '#10B981' : getTimerColor() === 'warning' ? '#F59E0B' : '#EF4444',
                    animation: timeRemaining <= 60 ? 'pulse 1s ease-in-out infinite' : 'none',
                  }}
                >
                  {formatTime(timeRemaining)}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handlePauseResume}
                  startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
                  sx={{ 
                    ml: 1,
                    borderRadius: 2,
                    px: 2,
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    borderColor: 'rgba(0,0,0,0.12)',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'rgba(33, 150, 243, 0.04)',
                    },
                  }}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
              </Box>

              {/* Progress Section */}
              <Box sx={{ width: 200 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'rgba(0,0,0,0.08)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                      transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                  }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mt: 0.5, 
                    textAlign: 'center',
                    color: 'text.secondary',
                    fontWeight: 500,
                    display: 'block'
                  }}
                >
                  {progress.toFixed(0)}% Complete
                </Typography>
              </Box>
            </Box>

            {showCelebration && (
              <Grow in={true} timeout={500}>
                <Alert 
                  severity="success" 
                  sx={{ 
                    mt: 3, 
                    bgcolor: 'success.50',
                    border: '2px solid',
                    borderColor: 'success.main',
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      fontSize: '2rem'
                    }
                  }}
                  icon={<CelebrationIcon />}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: '1.125rem' }}>
                    Action completed successfully
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {remainingActions.length > 0 
                      ? `${remainingActions.length} more strategic connection${remainingActions.length > 1 ? 's' : ''} to build.`
                      : 'Strategic session complete. Relationship intelligence enhanced.'
                    }
                  </Typography>
                </Alert>
              </Grow>
            )}
          </CardContent>
        </Card>

        {/* Action Cards */}
        <Box>
          {remainingActions.length > 0 ? (
            // Show only the current action (first remaining action)
            (() => {
              const currentAction = remainingActions[0];
              const currentActionIndex = totalActions - remainingActions.length + 1;
              
              return (
                <Fade in={true} timeout={500} key={currentAction.id}>
                  <Box sx={{ mb: 3 }}>
                    {/* Only show completion celebration if needed */}
                    {recentlyCompleted === currentAction.id && showCelebration && (
                      <Box display="flex" alignItems="center" mb={2}>
                        <Grow in={true} timeout={300}>
                          <Chip
                            label="✓ Completed!"
                            size="medium"
                            color="success"
                            sx={{ 
                              bgcolor: 'success.main',
                              color: 'white',
                              fontWeight: 'bold',
                              animation: 'pulse 1s ease-in-out infinite',
                              '& .MuiChip-label': {
                                fontSize: '0.9rem'
                              }
                            }}
                          />
                        </Grow>
                      </Box>
                    )}
                    
                    {/* Enhanced Action Card */}
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        backdropFilter: 'blur(20px)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-4px) scale(1.01)',
                          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.2)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                        }
                      }}
                    >
                      {currentAction.action_type === 'add_contact_to_goal' ? (
                        <AddContactActionCard
                          actionId={currentAction.id}
                          goalId={currentAction.goal_id || ''}
                          goalTitle={goal?.title || 'Unknown Goal'}
                          currentCount={currentCount}
                          targetCount={targetCount}
                          onComplete={handleActionComplete}
                          onSkip={handleActionSkip}
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
                          onComplete={handleActionComplete}
                          onSkip={handleActionSkip}
                        />
                      )}
                    </Paper>
                  </Box>
                </Fade>
              );
            })()
          ) : (
            !showCompletionDialog && (
              <Card sx={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 2,
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(10px)',
              }}>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
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
                      maxWidth: 500, 
                      mx: 'auto',
                      fontSize: '1.0625rem',
                      lineHeight: 1.6,
                    }}
                  >
                    Strategic connections systematically advanced. Your relationship intelligence grows stronger with each purposeful interaction.
                  </Typography>
                  <Box display="flex" justifyContent="center" gap={2}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => setShowCompletionDialog(true)}
                      startIcon={<ArrowForwardIcon />}
                      sx={{ 
                        px: 5, 
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 500,
                        fontSize: '1.0625rem',
                        minHeight: 52,
                        boxShadow: '0 4px 20px rgba(33, 150, 243, 0.25)',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          boxShadow: '0 6px 24px rgba(33, 150, 243, 0.35)',
                        },
                        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      Continue Building
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )
          )}
        </Box>
      </Box>
      
      {/* Completion Dialog */}
      <Dialog
        open={showCompletionDialog}
        onClose={() => setShowCompletionDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.3)'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <CelebrationIcon color="success" sx={{ fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {allActionsCompleted ? 'Session Complete!' : 'End Session?'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            {allActionsCompleted ? (
              <>
                <Typography variant="h6" gutterBottom>
                  🎉 Congratulations! You&apos;ve completed all {totalActions} relationship building actions.
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  You can continue working in this session or end it now.
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  You&apos;ve completed {completedCount} of {totalActions} actions.
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Would you like to continue working or end the session?
                </Typography>
              </>
            )}
            
            <Divider sx={{ my: 3 }} />
            
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="outlined"
                onClick={handleContinueWorking}
                startIcon={<WorkIcon />}
                fullWidth
                size="large"
                sx={{ py: 2 }}
              >
                Continue Working
                <Typography variant="body2" sx={{ ml: 1, opacity: 0.7 }}>
                  (Keep session open for more relationship building)
                </Typography>
              </Button>
              
              <Button
                variant="contained"
                onClick={handleEndSession}
                startIcon={<ExitIcon />}
                fullWidth
                size="large"
                sx={{ py: 2 }}
                disabled={completeSession.isPending}
              >
                {completeSession.isPending ? 'Ending Session...' : 'End Session'}
                <Typography variant="body2" sx={{ ml: 1, opacity: 0.7 }}>
                  (Close and save progress)
                </Typography>
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}; 