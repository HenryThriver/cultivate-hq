'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { useOnboardingState } from '@/lib/hooks/useOnboardingState';
import OnboardingVoiceRecorder from './OnboardingVoiceRecorder';
import { PremiumCard } from '@/components/ui/premium';
import { ExecutiveLoading } from '@/components/ui/premium/LoadingStates';

interface SelectedStruggle {
  icon: string;
  text: string;
  color: string;
}

interface ChallengesScreenProps {
  skipAnimations?: boolean; // For testing purposes
}

export default function ChallengesScreen({ skipAnimations = false }: ChallengesScreenProps) {
  const { nextScreen, completeScreen, currentScreen, isNavigating, updateState } = useOnboardingState();
  
  // Simplified animation state
  const [animationPhase, setAnimationPhase] = useState<'header' | 'subtitle' | 'recorder' | 'examples' | 'complete'>(
    skipAnimations ? 'complete' : 'header'
  );
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  // Curated struggle examples with emotional colors
  const selectedStruggles: SelectedStruggle[] = [
    {
      icon: '🫩',
      text: 'feel guilty only reaching out when you need something',
      color: '#FF6B6B'
    },
    {
      icon: '😮‍💨',
      text: 'aren\'t confident about what you have to offer',
      color: '#4ECDC4'
    },
    {
      icon: '😬',
      text: 'forget people\'s names, families, interests, and other details they\'ve shared',
      color: '#45B7D1'
    },
    {
      icon: '😵‍💫',
      text: 'are awkward or drained at conferences and events',
      color: '#96CEB4'
    },
    {
      icon: '🙄',
      text: 'lack the systems and routines for consistent outreach and progress',
      color: '#FFB347'
    },
    {
      icon: '😵',
      text: 'are too overwhelmed or don\'t know where to start',
      color: '#DDA0DD'
    }
  ];

  useEffect(() => {
    if (skipAnimations) {
      return;
    }

    // Simple CSS-driven animation sequence
    const sequence = [
      { phase: 'header', delay: 0 },
      { phase: 'subtitle', delay: 4000 },
      { phase: 'recorder', delay: 6000 },
      { phase: 'examples', delay: 7000 },
      { phase: 'complete', delay: 8000 }
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

  const handleRecordingComplete = async (audioFile: File) => {
    setIsProcessing(true);
    setError('');

    try {
      // Create FormData for the voice memo upload
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      formData.append('memo_type', 'challenge');

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
        // Update onboarding state with the voice memo ID
        await updateState({
          challenge_voice_memo_id: result.artifact_id
        });
        
        // Mark this screen as complete
        await completeScreen(currentScreen);
        
        // Move to next screen
        await nextScreen();
      } else {
        throw new Error('Voice memo processing failed');
      }
    } catch (err) {
      console.error('Error processing voice memo:', err);
      setError(err instanceof Error ? err.message : 'Failed to process your voice memo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = async () => {
    try {
      // Mark this screen as complete (even though skipped)
      await completeScreen(currentScreen);
      
      // Move to next screen
      await nextScreen();
    } catch (err) {
      console.error('Error skipping screen:', err);
      setError('Failed to continue. Please try again.');
    }
  };

  const isLoading = isNavigating || isProcessing;

  return (
    <>
      {/* Main content container */}
      <Box sx={{ 
        px: 3,
        pb: 4
      }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          
          {/* Header Messages Area */}
          <Box sx={{ 
            textAlign: 'center',
            mb: 4,
            minHeight: 160,
          }}>
          
            {/* Main Statement */}
            <Typography 
              variant="h1"
              sx={{ 
                textAlign: 'center',
                fontWeight: 500,
                color: '#1a1a1a',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
                lineHeight: 1.2,
                mb: 2,
                opacity: (animationPhase >= 'header' || skipAnimations) ? 1 : 0,
                transform: (animationPhase >= 'header' || skipAnimations) ? 'translateY(0)' : 'translateY(20px)',
                transition: skipAnimations ? 'none' : 'all 1s ease-out',
              }}
            >
              <span>Most relationship building feels like speed dating in business casual.</span>
            </Typography>

            {/* Punch line */}
            <Typography 
              variant="h1"
              sx={{ 
                textAlign: 'center',
                fontWeight: 800,
                color: '#1a1a1a',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
                lineHeight: 1.2,
                opacity: (animationPhase >= 'header' || skipAnimations) ? 1 : 0,
                transform: (animationPhase >= 'header' || skipAnimations) ? 'translateY(0)' : 'translateY(20px)',
                transition: skipAnimations ? 'none' : 'all 1s ease-out 0.5s',
              }}
            >
              You deserve better.
            </Typography>
          </Box>

          {/* Subtitle Section */}
          <Box sx={{ 
            textAlign: 'center',
            mb: 4,
            opacity: (animationPhase >= 'subtitle' || skipAnimations) ? 1 : 0,
            transform: (animationPhase >= 'subtitle' || skipAnimations) ? 'translateY(0)' : 'translateY(20px)',
            transition: skipAnimations ? 'none' : 'all 1s ease-out',
          }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 400,
                lineHeight: 1.4,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                color: 'text.secondary'
              }}
            >
              What creates friction in your relationship building? (Be specific—vague challenges get vague solutions.)
            </Typography>
          </Box>

          {/* Voice Recorder Section */}
          <Box sx={{ 
            opacity: (animationPhase >= 'recorder' || skipAnimations) ? 1 : 0,
            transform: (animationPhase >= 'recorder' || skipAnimations) ? 'translateY(0)' : 'translateY(20px)',
            transition: skipAnimations ? 'none' : 'all 1s ease-out',
          }}>

            {/* Voice recorder */}
            <Box sx={{ 
              mb: 4
            }}>
              <PremiumCard accent="sage">
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 500, color: '#1a1a1a', mb: 2 }}>
                    Share your relationship friction points
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
                    Where does relationship building create friction in your success trajectory? 
                    Specificity unlocks strategic value.
                  </Typography>
                </Box>

                {/* Error Alert */}
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <OnboardingVoiceRecorder
                  memoType="challenge"
                  onRecordingComplete={handleRecordingComplete}
                  title=""
                  description=""
                  isProcessing={isProcessing}
                  disabled={isLoading}
                />
                
                {/* Skip option as subdued text link underneath */}
                <Box sx={{ 
                  textAlign: 'center', 
                  mt: 2
                }}>
                  <Button
                    variant="text"
                    onClick={handleSkip}
                    disabled={isLoading}
                    sx={{ 
                      color: 'text.secondary',
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 400,
                      minHeight: 'auto',
                      p: 1,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    I prefer to proceed without sharing
                  </Button>
                </Box>
              </PremiumCard>
            </Box>

            {/* Examples section */}
            <Box sx={{
              opacity: (animationPhase >= 'examples' || skipAnimations) ? 1 : 0,
              transform: (animationPhase >= 'examples' || skipAnimations) ? 'translateY(0)' : 'translateY(20px)',
              transition: skipAnimations ? 'none' : 'all 1s ease-out',
            }}>
              <Box sx={{ 
                p: 3, 
                borderRadius: 3,
                backgroundColor: '#fafafa',
                border: '1px solid #f0f0f0'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    textAlign: 'center',
                    color: '#666',
                    mb: 2,
                    fontWeight: 500
                  }}
                >
                  You&apos;re not alone if you...
                </Typography>
                
                {selectedStruggles.map((struggle, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: index < 5 ? 1.5 : 0,
                      opacity: (animationPhase >= 'examples' || skipAnimations) ? 1 : 0,
                      transform: (animationPhase >= 'examples' || skipAnimations) ? 'translateX(0)' : 'translateX(-20px)',
                      transition: skipAnimations ? 'none' : `all 0.6s ease-out ${index * 0.1}s`,
                    }}
                  >
                    <Typography sx={{ fontSize: '1.2rem', minWidth: 24 }}>
                      {struggle.icon}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        lineHeight: 1.5,
                        color: '#555'
                      }}
                    >
                      {struggle.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Enhanced loading and processing states */}
      {isProcessing && (
        <Box sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 'var(--z-modal)',
        }}>
          <PremiumCard sx={{ maxWidth: 400, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '3rem', mb: 2 }}>🎧</Typography>
            <ExecutiveLoading type="relationshipIntelligence" />
          </PremiumCard>
        </Box>
      )}

    </>
  );
}