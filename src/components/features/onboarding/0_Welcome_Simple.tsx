'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useOnboardingState } from '@/lib/hooks/useOnboardingState';

export const EnhancedWelcomeScreen: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { nextScreen, completeScreen, currentScreen } = useOnboardingState();
  
  // Simple boolean state - no complex timing
  const [animationStarted, setAnimationStarted] = useState(false);
  
  useEffect(() => {
    // Start animations immediately - CSS handles the timing
    const timer = setTimeout(() => setAnimationStarted(true), 100);
    return () => clearTimeout(timer);
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
      sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background Network Effect - Simple CSS animation */}
      <Box
        data-testid="network-background"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: animationStarted ? 0.1 : 0,
          transition: 'opacity 2s ease-in-out',
          background: `
            radial-gradient(circle at 20% 80%, rgba(33, 150, 243, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(33, 203, 243, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(25, 118, 210, 0.2) 0%, transparent 50%)
          `,
        }}
      />

      {/* Main Content Container */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          zIndex: 2,
          maxWidth: { xs: '90vw', sm: '80vw', md: '60vw', lg: '900px' },
          width: 'auto',
        }}
      >
        {/* Brand Name - Fades in first */}
        <Typography
          variant={isMobile ? "h3" : "h2"}
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
            mb: 4,
            opacity: animationStarted ? 1 : 0,
            transform: animationStarted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 1s ease-out 0.5s, transform 1s ease-out 0.5s',
          }}
        >
          Cultivate HQ
        </Typography>

        {/* Tagline - Fades in second */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            lineHeight: 1.3,
            color: theme.palette.text.primary,
            mb: 6,
            opacity: animationStarted ? 1 : 0,
            transform: animationStarted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 1s ease-out 1.5s, transform 1s ease-out 1.5s',
          }}
        >
          Where strategic minds cultivate extraordinary outcomes
        </Typography>

        {/* CTA Button - Fades in last */}
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
            opacity: animationStarted ? 1 : 0,
            transform: animationStarted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 1s ease-out 2.5s, transform 1s ease-out 2.5s, background 0.3s ease, box-shadow 0.3s ease',
          }}
        >
          Begin your transformation
        </Button>
      </Box>

      {/* Reduced Motion Support */}
      <style jsx>{`
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