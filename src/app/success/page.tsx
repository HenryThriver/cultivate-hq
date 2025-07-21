'use client';

import React, { useEffect, useState, Suspense } from 'react';
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
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  SkipNext as SkipIcon,
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/AuthContext';
import confetti from 'canvas-confetti';

function SuccessPageContent() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const [showEnhancement, setShowEnhancement] = useState(false);
  const [enhancementLoading, setEnhancementLoading] = useState(false);

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

  // If user is already authenticated, show enhancement option or redirect
  useEffect(() => {
    if (user && sessionId) {
      // Check if they just connected integrations
      const connected = searchParams.get('connected');
      if (connected === 'gmail_calendar') {
        // They just connected, redirect to onboarding with success
        router.push(`/onboarding?session_id=${sessionId}&connected=true`);
      } else {
        // Show enhancement option instead of immediate redirect
        setShowEnhancement(true);
      }
    }
  }, [user, sessionId, router, searchParams]);

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
      } else {
        // After successful authentication, the useEffect will show enhancement option
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectServices = async () => {
    try {
      setEnhancementLoading(true);
      setError(null);

      const response = await fetch('/api/google/combined-auth?source=success');
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      }
    } catch (err) {
      setError('Failed to connect services. Please try again.');
      console.error('Connect services error:', err);
    } finally {
      setEnhancementLoading(false);
    }
  };

  const handleSkipEnhancement = () => {
    if (sessionId) {
      router.push(`/onboarding?session_id=${sessionId}`);
    } else {
      router.push('/dashboard');
    }
  };

  // Show enhancement option for authenticated users
  if (user && showEnhancement) {
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
            <Card sx={{ maxWidth: { xs: '100%', md: 640 }, width: '100%', p: { xs: 3, md: '39px' }, borderRadius: 3 }}>
              <CardContent sx={{ p: 0 }}>
                <Stack spacing={6} alignItems="center" textAlign="center">
                  
                  {/* Success Header */}
                  <Stack spacing={3} alignItems="center" textAlign="center">
                    <CheckCircle sx={{ fontSize: 64, color: 'success.main' }} />
                    <Typography variant="h3" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      You&apos;re all set!
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'text.secondary', maxWidth: '500px' }}>
                      Want to supercharge your experience? Connect your Gmail and Calendar now.
                    </Typography>
                  </Stack>

                  {/* Enhancement Benefits */}
                  <Stack spacing={3} sx={{ maxWidth: '520px' }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <EmailIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                      <Box textAlign="left">
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Smart Email Analysis
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Automatically track conversations and relationship context
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={2}>
                      <CalendarIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                      <Box textAlign="left">
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Meeting Intelligence
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sync meetings and get insights on your networking patterns
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>

                  {/* Action Buttons */}
                  <Stack spacing={3} sx={{ width: '100%', maxWidth: '400px' }}>
                    <Button
                      onClick={handleConnectServices}
                      variant="contained"
                      size="large"
                      disabled={enhancementLoading}
                      startIcon={enhancementLoading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
                      sx={{
                        minHeight: 52,
                        fontSize: '1.0625rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        }
                      }}
                    >
                      {enhancementLoading ? 'Connecting...' : 'Connect Gmail & Calendar'}
                    </Button>

                    <Button
                      onClick={handleSkipEnhancement}
                      variant="outlined"
                      size="large"
                      startIcon={<SkipIcon />}
                      disabled={enhancementLoading}
                      sx={{
                        minHeight: 52,
                        fontSize: '1.0625rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        borderRadius: 2,
                      }}
                    >
                      Skip for now
                    </Button>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    You can always connect these services later in your settings
                  </Typography>

                  {/* Error Alert */}
                  {error && (
                    <Alert severity="error" sx={{ borderRadius: 2, width: '100%' }}>
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

  // Show loading state while authenticated but enhancement not yet shown
  if (user && !showEnhancement) {
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
          <Typography>Setting up your experience...</Typography>
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

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}