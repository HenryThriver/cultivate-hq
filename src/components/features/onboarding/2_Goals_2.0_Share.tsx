'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert,
  Stack,
} from '@mui/material';
import { SkipNext, Help } from '@mui/icons-material';
import { useOnboardingState } from '@/lib/hooks/useOnboardingState';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { useAuth } from '@/lib/contexts/AuthContext';
import OnboardingVoiceRecorder from './OnboardingVoiceRecorder';
import { PremiumCard } from '@/components/ui/premium';

const GOAL_CATEGORIES = [
  'Land a specific role or make a career transition',
  'Grow or launch my startup',
  'Nurture previous and prospective clients / customers',
  'Find investors or strategic partners',
  'Break into a new industry or market',
  'Learn a new skill or find a new mentor',
  'Maintain or deepen relationships within an existing community',
  'Something else'
];

interface GoalsScreenProps {
  skipAnimations?: boolean; // For testing purposes
}

export default function GoalsScreen({ skipAnimations = false }: GoalsScreenProps) {
  const { user } = useAuth();
  const { nextScreen, completeScreen, currentScreen, isNavigating, updateState, state } = useOnboardingState();
  const { isLoading: isLoadingProfile } = useUserProfile();
  
  // Simplified animation state
  const [animationPhase, setAnimationPhase] = useState<'intro' | 'question' | 'categories' | 'confirmation' | 'recorder' | 'complete'>(
    skipAnimations ? 'complete' : 'intro'
  );
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showUnsureFlow, setShowUnsureFlow] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (skipAnimations) {
      return;
    }

    // Simple CSS-driven animation sequence
    const sequence = [
      { phase: 'intro', delay: 0 },
      { phase: 'question', delay: 3500 },
      { phase: 'categories', delay: 5000 }
    ] as const;

    const timeouts: NodeJS.Timeout[] = [];

    sequence.forEach(({ phase, delay }) => {
      const timeout = setTimeout(() => {
        setAnimationPhase(phase);
      }, delay);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [skipAnimations]);

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    setError('');

    // Show confirmation immediately for better UX
    setAnimationPhase('confirmation');

    try {
      // Create initial goal record with selected category
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          create_initial_goal: true,
          goal_category: category
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create goal record');
      }

      const result = await response.json();

      // Store goal ID in onboarding state
      await updateState({
        goal_id: result.goal.id
      });

      // Wait a moment to show confirmation before advancing to recorder
      // For tests, hold the confirmation phase briefly to allow assertions
      const delay = skipAnimations ? 100 : 2000;
      setTimeout(() => {
        setAnimationPhase('recorder');
        setShowUnsureFlow(false);
      }, delay);
    } catch (error) {
      console.error('Error creating initial goal:', error);
      setError(error instanceof Error ? error.message : 'Failed to create goal. Please try again.');
      // Reset to categories on error
      setAnimationPhase('categories');
      setSelectedCategory('');
    }
  };

  const handleUnsureClick = () => {
    setShowUnsureFlow(true);
    setAnimationPhase('recorder'); // Show recorder for unsure flow
    setSelectedCategory('');
  };

  const handleRecordingComplete = async (audioFile: File) => {
    setIsProcessing(true);
    setError('');

    try {
      // Create FormData for the voice memo upload
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      formData.append('memo_type', 'goal');
      if (selectedCategory) {
        formData.append('goal_category', selectedCategory);
      }
      // Link voice memo to existing goal record
      if (state?.goal_id) {
        formData.append('goal_id', state.goal_id);
      }

      // Upload and process the voice memo
      const response = await fetch('/api/voice-memo/onboarding', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process voice memo');
      }

      const result = await response.json();
      
      if (result.success) {
        // Update onboarding state with goal voice memo ID
        await updateState({
          goal_voice_memo_id: result.artifact_id
        });

        // Mark this screen as complete and advance
        await completeScreen('goals');
        await nextScreen();
      } else {
        throw new Error('Voice memo processing failed');
      }
    } catch (err) {
      console.error('Error processing goal voice memo:', err);
      setError(err instanceof Error ? err.message : 'Failed to process your voice memo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipGoals = async () => {
    try {
      await completeScreen('goals');
      await nextScreen();
    } catch (err) {
      console.error('Error skipping goals:', err);
      setError('Failed to continue. Please try again.');
    }
  };

  const isLoading = isNavigating || isProcessing || isLoadingProfile;

  return (
    <Box sx={{ 
      px: 3,
      pb: 4
    }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        
        {/* Header Messages Area */}
        <Box sx={{ 
          textAlign: 'center',
          mb: 4
        }}>
          
          {/* Step 1: Value Proposition */}
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 400,
              lineHeight: 1.3,
              color: '#1a1a1a',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              opacity: (animationPhase >= 'intro' || skipAnimations) ? 1 : 0,
              transform: (animationPhase >= 'intro' || skipAnimations) ? 'translateY(0)' : 'translateY(20px)',
              transition: skipAnimations ? 'none' : 'all 1s ease-out',
              mb: 2
            }}
          >
            Your time is valuable. Your relationships are invaluable.
          </Typography>

          {/* Step 2: Question */}
          <Box sx={{
            opacity: (animationPhase >= 'question' || skipAnimations) ? 1 : 0,
            transform: (animationPhase >= 'question' || skipAnimations) ? 'translateY(0)' : 'translateY(20px)',
            transition: skipAnimations ? 'none' : 'all 1s ease-out',
          }}>
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ 
                fontWeight: 400,
                lineHeight: 1.3,
                color: '#1a1a1a',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                mb: 2
              }}
            >
              What ambitious outcome would make this year legendary?
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                fontStyle: 'italic',
                fontSize: { xs: '0.95rem', md: '1rem' }
              }}
            >
              Be specific. Vague goals get vague results.
            </Typography>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step 3: Goal Categories */}
        <Box sx={{
          opacity: (animationPhase >= 'categories' || skipAnimations) ? 1 : 0,
          transform: (animationPhase >= 'categories' || skipAnimations) ? 'translateY(0)' : 'translateY(20px)',
          transition: skipAnimations ? 'none' : 'all 1s ease-out',
          mb: 4
        }}>
          <PremiumCard>
            <Stack spacing={2}>
              {GOAL_CATEGORIES.map((category, index) => (
                <Button
                  key={index}
                  variant={selectedCategory === category ? 'contained' : 'outlined'}
                  onClick={() => handleCategorySelect(category)}
                  disabled={isLoading}
                  sx={{
                    p: 2.5,
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: { xs: '0.95rem', md: '1.0625rem' },
                    borderRadius: 2,
                    borderWidth: selectedCategory === category ? 0 : 1.5,
                    transition: 'all 200ms var(--ease-confident)',
                    '&:hover': {
                      backgroundColor: selectedCategory === category ? 'primary.dark' : 'primary.50',
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  {category}
                </Button>
              ))}
            </Stack>
          </PremiumCard>

          {/* Unsure Option */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Button
              variant="text"
              onClick={handleUnsureClick}
              disabled={isLoading}
              startIcon={<Help sx={{ fontSize: 16 }} />}
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.875rem',
                fontWeight: 400,
                textTransform: 'none',
                textDecoration: 'underline',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline',
                  color: 'text.primary'
                }
              }}
            >
              I prefer to explore organically
            </Button>
          </Box>
        </Box>

        {/* Step 4: Category Confirmation */}
        {(selectedCategory && !showUnsureFlow && (animationPhase >= 'confirmation' || skipAnimations)) && (
          <Box sx={{
            opacity: 1,
            transform: 'translateY(0)',
            transition: skipAnimations ? 'none' : 'all 1s ease-out',
            mb: 4,
            textAlign: 'center'
          }}>
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ 
                fontWeight: 400,
                lineHeight: 1.3,
                color: '#1a1a1a',
                fontSize: { xs: '1.75rem', md: '2.125rem' },
                mb: 2
              }}
            >
              Perfect! Clarity is the first step to success.
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                fontSize: { xs: '0.95rem', md: '1.2rem' },
                mb: 2
              }}
            >
              You want to{' '}
              <strong style={{ color: '#1976d2' }}>
                {selectedCategory.toLowerCase()}
              </strong>
              .
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                fontSize: { xs: '0.95rem', md: '1rem' },
                lineHeight: 1.5,
                fontStyle: 'italic'
              }}
            >
              Now, let&apos;s paint the picture of your success story.
            </Typography>
          </Box>
        )}

        {/* Step 5: Voice Recorder Section */}
        <Box sx={{
          opacity: (animationPhase >= 'recorder' || skipAnimations) ? 1 : 0,
          transform: (animationPhase >= 'recorder' || skipAnimations) ? 'translateY(0)' : 'translateY(20px)',
          transition: skipAnimations ? 'none' : 'all 1s ease-out',
        }}>
          {showUnsureFlow ? (
            // Unsure Flow Content
            <Box>
              <PremiumCard sx={{ mb: 4, border: '2px solid #fff3e0', backgroundColor: '#fffbf2' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 500, 
                  color: 'warning.dark',
                  mb: 2,
                  fontSize: { xs: '1.1rem', md: '1.25rem' }
                }}>
                  No worries — that&apos;s actually pretty common and totally fine.
                </Typography>
                
                <Typography variant="body1" sx={{ 
                  mb: 3, 
                  lineHeight: 1.6, 
                  color: '#333',
                  fontSize: { xs: '0.95rem', md: '1rem' }
                }}>
                  Let&apos;s start with what you know:
                </Typography>

                <Box component="ul" sx={{ pl: 3, mb: 4, color: '#333' }}>
                  <Typography component="li" variant="body1" sx={{ mb: 2, fontSize: { xs: '0.95rem', md: '1rem' } }}>
                    What&apos;s working well in your professional life right now?
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ mb: 2, fontSize: { xs: '0.95rem', md: '1rem' } }}>
                    What&apos;s frustrating or feeling stuck?
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ mb: 2, fontSize: { xs: '0.95rem', md: '1rem' } }}>
                    What would you change if you could wave a magic wand?
                  </Typography>
                </Box>

                <Typography variant="body1" sx={{ 
                  fontWeight: 500, 
                  color: 'warning.dark', 
                  lineHeight: 1.6,
                  fontSize: { xs: '0.95rem', md: '1rem' }
                }}>
                  Just share whatever comes to mind. We&apos;ll help you identify your goal from what you tell us.
                </Typography>
              </PremiumCard>

              <OnboardingVoiceRecorder
                memoType="goal"
                onRecordingComplete={handleRecordingComplete}
                title="Share what's on your mind"
                description="Tell us about your current professional situation — what's working, what's not, and what you'd like to change."
                isProcessing={isProcessing}
                disabled={isLoading}
              />

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowUnsureFlow(false);
                    setAnimationPhase('categories');
                  }}
                  disabled={isLoading}
                  sx={{ 
                    mr: 2,
                    px: { xs: 3, md: 4 }, 
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '1rem',
                    fontWeight: 500,
                    textTransform: 'none'
                  }}
                >
                  Back to Goal Categories
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={handleSkipGoals}
                  disabled={isLoading}
                  startIcon={<SkipNext />}
                  sx={{ 
                    px: { xs: 3, md: 4 }, 
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '1rem',
                    fontWeight: 500,
                    textTransform: 'none'
                  }}
                >
                  Skip goal-setting for now
                </Button>
              </Box>
            </Box>
          ) : selectedCategory ? (
            // Category Selected - Voice Recorder
            <Box>
              <OnboardingVoiceRecorder
                memoType="goal"
                onRecordingComplete={handleRecordingComplete}
                title="🪄 Wave a magic wand"
                description="You wake up tomorrow and you've achieved your goal brilliantly. Way to go you! 
What does your life look and feel like? How will you know you've succeeded?"
                isProcessing={isProcessing}
                disabled={isLoading}
              />

              {isProcessing && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                    ✨ Analyzing your aspirations and extracting your goals...
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedCategory('');
                    setAnimationPhase('categories');
                  }}
                  disabled={isLoading}
                  sx={{ 
                    px: { xs: 3, md: 4 }, 
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '1rem',
                    fontWeight: 500,
                    textTransform: 'none'
                  }}
                >
                  Choose Different Goal
                </Button>
              </Box>
            </Box>
          ) : null}
        </Box>

        {/* Iyanla Vanzant Quote */}
        <Box sx={{ 
          textAlign: 'center',
          borderTop: '1px solid #e0e0e0',
          pt: 4,
          opacity: (animationPhase >= 'categories' || skipAnimations) ? 1 : 0,
          transition: skipAnimations ? 'none' : 'all 1s ease-out 0.5s',
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontStyle: 'italic',
              color: '#666',
              lineHeight: 1.6,
              maxWidth: 600,
              mx: 'auto',
              fontSize: { xs: '0.875rem', md: '0.875rem' }
            }}
          >
            &quot;The way to achieve your own success is to be willing to help
            somebody else get it first.&quot;
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#999',
              mt: 1,
              display: 'block',
              letterSpacing: '0.5px'
            }}
          >
            — Iyanla Vanzant
          </Typography>
        </Box>
      </Box>

    </Box>
  );
}