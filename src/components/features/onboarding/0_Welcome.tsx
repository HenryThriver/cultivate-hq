'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useOnboardingState } from '@/lib/hooks/useOnboardingState';
import { NetworkFormationBackground } from './0_Welcome_Components/NetworkFormationBackground';
import { PreviewCardsContainer } from './0_Welcome_Components/PreviewCardsContainer';
import { GoalCelebrationCard } from './0_Welcome_Components/cards/GoalCelebrationCard';
import { TypewriterText } from './0_Welcome_Components/TypewriterText';

// Animation timing constants
const ANIMATION_TIMINGS = {
  SEQUENCE_START: 1000, // Initial delay before typewriter starts
  TYPEWRITER_CHAR_DELAY: 150, // Delay between each character
  TYPEWRITER_CURSOR_DELAY: 1000, // How long cursor shows after typing
  POST_TYPEWRITER_DELAY: 2500, // Delay after typewriter completes
  FLOAT_TO_NETWORK_DELAY: 400, // Delay from float start to network appearance
  NETWORK_TO_CARDS_DELAY: 600, // Delay from network to cards
  CARDS_DISPLAY_DURATION: 8500, // How long cards are shown
  CELEBRATION_TRANSITION_DELAY: 200, // Delay to show celebration card
  CELEBRATION_DISPLAY_DURATION: 3000, // How long celebration card is shown
  TAGLINE_TRANSITION_DELAY: 100, // Delay from celebration to tagline
  TAGLINE_TO_BUTTON_DELAY: 1800, // Delay from tagline to button
} as const;

interface EnhancedWelcomeScreenProps {
  skipAnimations?: boolean; // For testing purposes
}

export const EnhancedWelcomeScreen: React.FC<EnhancedWelcomeScreenProps> = ({ 
  skipAnimations = false 
}) => {
  const router = useRouter();
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Currently unused
  const { nextScreen, completeScreen, currentScreen } = useOnboardingState();
  
  const [phase, setPhase] = useState<'initial' | 'typewriter' | 'float' | 'cards' | 'celebration' | 'tagline' | 'button'>('initial');
  const [showNetwork, setShowNetwork] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const animationTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    if (skipAnimations) {
      // For testing: show all content immediately
      if (isMounted) {
        setPhase('button');
        setShowNetwork(true);
        setShowCards(true);
        setShowCelebration(true);
      }
      return;
    }
    
    // Start the sequence - exact timing from original
    const timer = setTimeout(() => {
      if (isMounted) setPhase('typewriter');
    }, ANIMATION_TIMINGS.SEQUENCE_START);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [skipAnimations]);

  // Cleanup all animation timeouts on unmount
  useEffect(() => {
    return () => {
      animationTimeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleTypewriterComplete = useCallback(() => {
    const safeSetTimeout = (callback: () => void, delay: number) => {
      const timeout = setTimeout(callback, delay);
      animationTimeoutsRef.current.push(timeout);
      return timeout;
    };
    
    // Start animation sequence after typewriter completes
    safeSetTimeout(() => {
      setPhase('float'); // Start floating the text up
      
      // Show network background
      safeSetTimeout(() => {
        setShowNetwork(true);
        
        // Show preview cards
        safeSetTimeout(() => {
          setPhase('cards');
          setShowCards(true);
          
          // Hide cards and transition to celebration
          safeSetTimeout(() => {
            setShowCards(false);
            
            // Show celebration card
            safeSetTimeout(() => {
              setPhase('celebration');
              setShowCelebration(true);
              
              // Hide celebration and show tagline
              safeSetTimeout(() => {
                setShowCelebration(false);
                
                // Show tagline
                safeSetTimeout(() => {
                  setPhase('tagline');
                  
                  // Show final CTA button
                  safeSetTimeout(() => {
                    setPhase('button');
                  }, ANIMATION_TIMINGS.TAGLINE_TO_BUTTON_DELAY);
                }, ANIMATION_TIMINGS.TAGLINE_TRANSITION_DELAY);
              }, ANIMATION_TIMINGS.CELEBRATION_DISPLAY_DURATION);
            }, ANIMATION_TIMINGS.CELEBRATION_TRANSITION_DELAY);
          }, ANIMATION_TIMINGS.CARDS_DISPLAY_DURATION);
        }, ANIMATION_TIMINGS.NETWORK_TO_CARDS_DELAY);
      }, ANIMATION_TIMINGS.FLOAT_TO_NETWORK_DELAY);
    }, ANIMATION_TIMINGS.POST_TYPEWRITER_DELAY);
  }, []);

  const handleBeginClick = async () => {
    try {
      await completeScreen(currentScreen);
      await nextScreen();
    } catch (error) {
      console.error('Error progressing to next screen:', error);
      router.push('/onboarding');
    }
  };

  return (
    <Box 
      role="main"
      sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Network Background */}
      {showNetwork && (
        <NetworkFormationBackground 
          nodeCount={25}
          maxConnections={35}
          animationDuration={4000}
        />
      )}
      
      {/* Preview Cards */}
      {showCards && (
        <PreviewCardsContainer 
          startDelay={0}
          cardDisplayDuration={2000}
          cardStaggerDelay={800}
        />
      )}

      {/* Main Content Container */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          zIndex: 3,
          maxWidth: { xs: '90vw', sm: '80vw', md: '60vw', lg: '900px' },
          width: 'auto',
          position: 'relative',
          // Float animation - moves up when transitioning to cards
          transform: phase === 'float' || phase === 'cards' || phase === 'celebration' || phase === 'tagline' || phase === 'button' 
            ? 'translateY(-80px)' : 'translateY(0)',
          transition: 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {/* Brand Name with Typewriter Effect */}
        {phase === 'typewriter' && (
          <Box sx={{ mb: 4 }}>
            <TypewriterText
              text="Cultivate HQ"
              onComplete={handleTypewriterComplete}
              skipAnimation={skipAnimations}
              speed={ANIMATION_TIMINGS.TYPEWRITER_CHAR_DELAY}
              delay={500}
              showCursor={false}
              variant="h2"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 50%, #1976D2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.75rem' },
                lineHeight: 1.1,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              }}
            />
          </Box>
        )}

        {/* Floating brand name (same size, just repositioned) */}
        {(phase === 'float' || phase === 'cards' || phase === 'celebration' || phase === 'tagline' || phase === 'button') && (
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 50%, #1976D2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontSize: { xs: '2.5rem', sm: '3rem', md: '3.75rem' },
              lineHeight: 1.1,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              mb: phase === 'celebration' || phase === 'tagline' || phase === 'button' ? 4 : 0,
            }}
          >
            Cultivate HQ
          </Typography>
        )}

        {/* Celebration Card - Big success card centered below Cultivate HQ */}
        {showCelebration && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              opacity: 0,
              transform: 'translateY(20px)',
              animation: 'celebration-appear 1.2s ease-out forwards',
              '@keyframes celebration-appear': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(20px) scale(0.95)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0) scale(1)',
                },
              },
            }}
          >
            <GoalCelebrationCard />
          </Box>
        )}

        {/* Tagline - Appears after celebration card */}
        {(phase === 'tagline' || phase === 'button') && (
          <Typography
            variant="h3"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              lineHeight: 1.3,
              color: theme.palette.text.primary,
              mb: 6,
              opacity: 0,
              transform: 'translateY(15px)',
              animation: phase === 'tagline' ? 'tagline-appear 0.8s ease-out 300ms forwards' : 'none',
              ...(phase === 'button' && { opacity: 1, transform: 'translateY(0)' }),
            }}
          >
            Where strategic minds cultivate extraordinary outcomes
          </Typography>
        )}

        {/* CTA Button - Final element */}
        {phase === 'button' && (
          <Button
            variant="contained"
            size="large"
            onClick={handleBeginClick}
            sx={{
              fontSize: '1.1rem',
              fontWeight: 600,
              py: 2,
              px: 4,
              borderRadius: '50px',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1976D2 0%, #1976D2 100%)',
                transform: 'translateY(-2px)',
              },
              boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
              opacity: 0,
              transform: 'translateY(15px)',
              animation: 'button-appear 0.8s ease-out 200ms forwards'
            }}
          >
            Begin your transformation
          </Button>
        )}
      </Box>

      {/* Global CSS Animations */}
      <style jsx>{`
        @keyframes tagline-appear {
          from { 
            opacity: 0; 
            transform: translateY(15px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes button-appear {
          from { 
            opacity: 0; 
            transform: translateY(15px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            transition-delay: 0ms !important;
          }
        }
      `}</style>
    </Box>
  );
};