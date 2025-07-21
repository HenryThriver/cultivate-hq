'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  CheckCircle, 
  ArrowForward,
  Google as GoogleIcon,
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/AuthContext';
import confetti from 'canvas-confetti';

export default function SuccessPage() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  const sessionId = searchParams.get('session_id');

  // Sophisticated confetti celebration
  useEffect(() => {
    if (!hasTriggeredConfetti) {
      const timer = setTimeout(() => {
        // Refined confetti - elegant, not chaotic
        confetti({
          particleCount: isMobile ? 50 : 80,
          spread: isMobile ? 45 : 60,
          origin: { y: 0.7 },
          colors: ['#2196F3', '#F59E0B', '#059669'], // Blue, Amber, Sage
          shapes: ['circle'],
          scalar: 0.8
        });
        setHasTriggeredConfetti(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasTriggeredConfetti, isMobile]);

  // If user is already authenticated, redirect to onboarding
  useEffect(() => {
    if (user && sessionId) {
      router.push(`/onboarding?session_id=${sessionId}`);
    }
  }, [user, sessionId, router]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Store session ID for after authentication
      if (sessionId) {
        localStorage.setItem('postAuthRedirect', `/onboarding?session_id=${sessionId}`);
      }
      
      const { error } = await signInWithGoogle();
      
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography>Redirecting to onboarding...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        background: `linear-gradient(135deg, ${alpha('#2196F3', 0.015)} 0%, ${alpha('#7C3AED', 0.02)} 100%)`,
        py: { xs: 3, md: 5 }
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          px: { xs: 2, sm: 3, md: 0 }
        }}>
          <Card
            sx={{
              maxWidth: { xs: '100%', md: 640 },
              width: '100%',
              // Design system: Premium card padding (39px golden ratio)
              p: { xs: 3, md: '39px' },
              border: '1px solid',
              borderColor: '#E3F2FD', // Design system: Premium card border
              borderRadius: 3, // Design system: 12px
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', // Design system: Premium card shadow
              backgroundColor: 'white',
              position: 'relative',
              overflow: 'visible',
              // Design system: Card hover - gentle lift
              transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: { xs: 'none', md: 'translateY(-2px)' },
                boxShadow: { 
                  xs: '0 4px 20px rgba(0, 0, 0, 0.08)', 
                  md: '0 8px 32px rgba(0, 0, 0, 0.12)' 
                }
              }
            }}
          >
            {/* Elegant Success Indicator */}
            <Box
              sx={{
                position: 'absolute',
                top: { xs: -20, md: -30 },
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                p: { xs: 1.5, md: 2 },
                boxShadow: '0 4px 20px rgba(33, 150, 243, 0.25)',
                border: '3px solid white'
              }}
            >
              <CheckCircle sx={{ fontSize: { xs: 32, md: 40 }, color: 'white' }} />
            </Box>

            <CardContent sx={{ p: 0, pt: { xs: 3, md: 4 } }}>
              {/* Design system: Use 8px grid spacing - 6 units = 48px */}
              <Stack spacing={6} alignItems="center" textAlign="center">
                
                {/* Hero Section - Simplified with color emphasis and spacing */}
                <Stack spacing={3} alignItems="center" textAlign="center">
                  <Typography
                    variant="h1"
                    sx={{
                      // Design system: H1 desktop scale 40px/48px
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      lineHeight: { xs: '2.5rem', md: '3rem' },
                      fontWeight: 600, // Design system: Semibold for headings
                      letterSpacing: '-0.02em',
                      color: '#F59E0B', // Design system: Warm Amber for celebration
                      maxWidth: '600px'
                    }}
                  >
                    Congratulations.
                  </Typography>
                  
                  <Typography
                    variant="h2"
                    sx={{
                      // Design system: H2 desktop scale 32px/40px
                      fontSize: { xs: '1.75rem', md: '2rem' },
                      lineHeight: { xs: '2.25rem', md: '2.5rem' },
                      fontWeight: 600, // Design system: Semibold
                      letterSpacing: '-0.02em',
                      color: 'primary.main', // Design system: Primary blue
                      maxWidth: '600px'
                    }}
                  >
                    Your relationship superpowers are activated.
                  </Typography>
                </Stack>

                {/* CTA Section - Simplified */}
                <Stack spacing={6} alignItems="center" textAlign="center">
                  <Button
                    onClick={handleSignIn}
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
                    endIcon={!loading ? <ArrowForward /> : null}
                    sx={{
                      // Design system: Primary button 48px height, 24px horizontal padding
                      minHeight: { xs: 52, md: 48 },
                      px: 3, // 24px
                      py: 1.5,
                      fontSize: '1.0625rem', // Design system: 17px
                      fontWeight: 500, // Design system: Medium
                      textTransform: 'none',
                      borderRadius: 1, // Design system: 8px
                      minWidth: 280,
                      backgroundColor: 'primary.main',
                      transform: 'scale(1)',
                      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)', // Design system: Default timing
                      '&:hover': {
                        transform: { xs: 'none', md: 'scale(1.02)' }, // Design system: Confident hover
                        backgroundColor: 'primary.dark'
                      },
                      '&:active': {
                        transform: { xs: 'scale(0.98)', md: 'scale(1.02)' }
                      }
                    }}
                  >
                    {loading ? 'Activating your account...' : 'Login to begin'}
                  </Button>

                  <Typography
                    variant="body1"
                    sx={{
                      // Design system: Body text
                      fontSize: '1.0625rem',
                      lineHeight: '1.5625rem',
                      color: 'text.secondary',
                      maxWidth: '520px'
                    }}
                  >
                    After logging in, you&apos;ll onboard then begin your first strategic <b>relationship building session</b>.
                  </Typography>
                </Stack>


                {/* Error Alert */}
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      borderRadius: 2,
                      fontSize: '1rem'
                    }}
                  >
                    {error}
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}