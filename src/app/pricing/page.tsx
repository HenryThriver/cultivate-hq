'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack, 
  Card,
  CardContent,
  AppBar,
  Toolbar,
  alpha,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  useTheme
} from '@mui/material';
import { 
  Check,
  Speed,
  TrendingUp,
  Psychology,
  AutoAwesome
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { PRODUCT_CONFIG } from '@/lib/stripe';
import Link from 'next/link';

export default function PricingPage() {
  const { loading } = useAuth();
  const theme = useTheme();
  // Remove the toggle state since we're now showing all three tiers
  const { createCheckoutSession, loading: checkoutLoading, error: checkoutError } = useStripeCheckout();

  // Allow all users (authenticated and unauthenticated) to view pricing page
  // No redirects needed - users can access checkout directly

  if (loading) {
    return (
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
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Loading Cultivate HQ...
        </Typography>
      </Box>
    );
  }

  const pricingTiers = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 30,
      period: '/month',
      description: 'Essential relationship intelligence tools',
      features: PRODUCT_CONFIG.monthly.features,
      popular: false,
      buttonText: 'Get Started'
    },
    {
      id: 'annual',
      name: 'Annual',
      price: 300,
      period: '/year',
      monthlyEquivalent: '$25/month',
      description: 'Complete professional relationship system',
      features: PRODUCT_CONFIG.annual.features,
      popular: true,
      buttonText: 'Get Started'
    },
    {
      id: 'supporter',
      name: 'Supporter',
      price: 3000,
      period: '/5 years',
      monthlyEquivalent: '$50/month',
      description: 'Direct creator access + gratitude for supporting the vision',
      features: PRODUCT_CONFIG.supporter.features,
      popular: false,
      buttonText: 'Support the Vision'
    }
  ];

  const handleGetStarted = async (tierId: string) => {
    // Always go directly to checkout - Stripe will handle auth if needed
    await createCheckoutSession(tierId as 'monthly' | 'annual' | 'supporter');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: 'transparent',
          borderBottom: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ py: 1 }}>
            <Typography
              variant="h6"
              component={Link}
              href="/"
              sx={{
                flexGrow: 1,
                textDecoration: 'none',
                color: 'text.primary',
                fontWeight: 600,
                letterSpacing: '-0.02em'
              }}
            >
              Cultivate HQ
            </Typography>
            
            <Stack direction="row" spacing={3} alignItems="center">
              <Typography
                component={Link}
                href="/features"
                variant="body1"
                sx={{
                  textDecoration: 'none',
                  color: 'text.secondary',
                  fontWeight: 500,
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                Features
              </Typography>
              
              <Typography
                component={Link}
                href="/pricing"
                variant="body1"
                sx={{
                  textDecoration: 'none',
                  color: 'primary.main',
                  fontWeight: 500
                }}
              >
                Pricing
              </Typography>

              <Typography
                component={Link}
                href="/about"
                variant="body1"
                sx={{
                  textDecoration: 'none',
                  color: 'text.secondary',
                  fontWeight: 500,
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                About
              </Typography>
              
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                size="medium"
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  borderWidth: 1.5,
                  '&:hover': {
                    borderWidth: 1.5,
                  }
                }}
              >
                Sign In
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Hero Section */}
        <Box 
          sx={{ 
            py: { xs: 8, md: 12 },
            background: `linear-gradient(135deg, ${alpha('#2196F3', 0.02)} 0%, ${alpha('#7C3AED', 0.02)} 100%)`,
            borderBottom: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <Container maxWidth="lg">
            <Stack spacing={6} alignItems="center" textAlign="center">
              {/* Error Alert */}
              {checkoutError && (
                <Alert severity="error" sx={{ borderRadius: 2, maxWidth: '600px' }}>
                  {checkoutError}
                </Alert>
              )}

              <Stack spacing={3} alignItems="center" maxWidth="800px">
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3rem' },
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    color: 'text.primary'
                  }}
                >
                  Invest in your{' '}
                  <Typography
                    component="span"
                    variant="inherit"
                    sx={{ color: 'primary.main' }}
                  >
                    relationship capital
                  </Typography>
                </Typography>
                
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '1.125rem', md: '1.25rem' },
                    fontWeight: 400,
                    color: 'text.secondary',
                    lineHeight: 1.4,
                    maxWidth: '600px'
                  }}
                >
                  Professional-grade relationship intelligence designed for executives who understand that strategic connections drive extraordinary outcomes.
                </Typography>
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Pricing Cards */}
        <Box sx={{ py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Box 
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 4,
                alignItems: 'stretch'
              }}
            >
              {pricingTiers.map((tier) => (
                <Card
                  key={tier.id}
                  sx={{
                    p: 4,
                    border: tier.popular ? '2px solid' : '1px solid',
                    borderColor: tier.popular ? 'primary.main' : 'grey.200',
                    borderRadius: 3,
                    position: 'relative',
                    backgroundColor: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                >
                  {/* Popular Badge */}
                  {tier.popular && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        px: 3,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}
                    >
                      Most Popular
                    </Box>
                  )}

                  <CardContent sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Stack spacing={3} sx={{ flexGrow: 1 }}>
                      {/* Header */}
                      <Box textAlign="center">
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            fontSize: '1.5rem'
                          }}
                        >
                          {tier.name}
                        </Typography>
                        
                        <Stack direction="row" alignItems="baseline" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                          <Typography
                            variant="h3"
                            sx={{
                              fontSize: { xs: '2rem', md: '2.5rem' },
                              fontWeight: 600,
                              color: 'primary.main'
                            }}
                          >
                            ${tier.price}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              color: 'text.secondary',
                              fontWeight: 500
                            }}
                          >
                            {tier.period}
                          </Typography>
                        </Stack>
                        
                        {tier.monthlyEquivalent && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              mb: 2
                            }}
                          >
                            {tier.monthlyEquivalent}
                          </Typography>
                        )}
                        
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '1rem',
                            lineHeight: 1.4
                          }}
                        >
                          {tier.description}
                        </Typography>
                      </Box>

                      {/* Features */}
                      <Box sx={{ flexGrow: 1 }}>
                        <List sx={{ py: 0 }}>
                          {tier.features.map((feature, index) => (
                            <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <Check 
                                  sx={{ 
                                    color: 'primary.main',
                                    fontSize: 18
                                  }} 
                                />
                              </ListItemIcon>
                              <ListItemText 
                                primary={feature}
                                primaryTypographyProps={{
                                  fontSize: '0.875rem',
                                  color: 'text.secondary',
                                  lineHeight: 1.4
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>

                      {/* CTA Button */}
                      <Button
                        onClick={() => handleGetStarted(tier.id)}
                        variant={tier.popular ? 'contained' : 'outlined'}
                        size="large"
                        fullWidth
                        disabled={checkoutLoading}
                        startIcon={checkoutLoading ? <CircularProgress size={20} color="inherit" /> : null}
                        sx={{
                          py: 2,
                          fontSize: '1rem',
                          fontWeight: 500,
                          textTransform: 'none',
                          mt: 'auto'
                        }}
                      >
                        {checkoutLoading ? 'Processing...' : tier.buttonText}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Container>
        </Box>

        {/* Value Proposition */}
        <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'grey.50' }}>
          <Container maxWidth="lg">
            <Stack spacing={8}>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    mb: 3
                  }}
                >
                  Why executives choose Cultivate HQ
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1.125rem',
                    color: 'text.secondary',
                    maxWidth: '600px',
                    mx: 'auto'
                  }}
                >
                  Sophisticated professionals understand that relationship capital is the ultimate competitive advantage. This is your strategic advantage.
                </Typography>
              </Box>
              
              <Stack spacing={6}>
                {[
                  {
                    icon: <TrendingUp />,
                    title: 'Strategic ROI',
                    description: 'One strategic connection can generate opportunities worth thousands of times your investment.',
                    color: theme.palette.primary.main
                  },
                  {
                    icon: <Speed />,
                    title: 'Executive Efficiency',
                    description: 'Systematic relationship building saves hours of cognitive overhead while improving outcomes.',
                    color: theme.palette.sage.main
                  },
                  {
                    icon: <Psychology />,
                    title: 'Professional Intelligence',
                    description: 'AI-powered insights that enhance your natural strategic instincts and executive presence.',
                    color: theme.palette.amber.main
                  },
                  {
                    icon: <AutoAwesome />,
                    title: 'Sustainable Scale',
                    description: 'Build relationship practices that work for 50+ meaningful connections without burnout.',
                    color: theme.palette.plum.main
                  }
                ].map((benefit, index) => (
                  <Card
                    key={index}
                    sx={{
                      p: 4,
                      border: '1px solid',
                      borderColor: 'grey.200',
                      borderRadius: 3,
                      backgroundColor: 'white'
                    }}
                  >
                    <Stack direction="row" spacing={3} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          backgroundColor: alpha(benefit.color, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: benefit.color,
                          flexShrink: 0
                        }}
                      >
                        {benefit.icon}
                      </Box>
                      
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, fontSize: '1.25rem', mb: 1 }}
                        >
                          {benefit.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary', lineHeight: 1.6, fontSize: '1rem' }}
                        >
                          {benefit.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Final CTA */}
        <Box sx={{ py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Box 
              sx={{
                textAlign: 'center',
                p: { xs: 4, md: 6 },
                backgroundColor: alpha('#2196F3', 0.02),
                borderRadius: 3,
                border: '1px solid',
                borderColor: alpha('#2196F3', 0.1)
              }}
            >
              <Stack spacing={4} alignItems="center">
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                    fontWeight: 600,
                    letterSpacing: '-0.02em'
                  }}
                >
                  Ready to transform your relationship building?
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1.125rem',
                    color: 'text.secondary',
                    maxWidth: '500px'
                  }}
                >
                  Join executives who&apos;ve made systematic relationship building their competitive advantage.
                </Typography>
                <Button
                  onClick={() => handleGetStarted('annual')}
                  variant="contained"
                  size="large"
                  disabled={checkoutLoading}
                  startIcon={checkoutLoading ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.125rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    minWidth: 200
                  }}
                >
                  {checkoutLoading ? 'Processing...' : 'Get started today'}
                </Button>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.875rem'
                  }}
                >
                  No setup fees • Cancel anytime • Professional support
                </Typography>
              </Stack>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          mt: 'auto',
          py: 6,
          backgroundColor: 'grey.50',
          borderTop: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        <Container maxWidth="lg">
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={{ xs: 3, md: 6 }}
            justifyContent="space-between"
            alignItems={{ xs: 'center', md: 'flex-start' }}
          >
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Cultivate HQ
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                Where strategic minds cultivate extraordinary outcomes through systematic relationship intelligence.
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600 }}>
                  Product
                </Typography>
                <Typography
                  component={Link}
                  href="/features"
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  Features
                </Typography>
                <Typography
                  component={Link}
                  href="/pricing"
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  Pricing
                </Typography>
                <Typography
                  component={Link}
                  href="/about"
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  About
                </Typography>
              </Stack>
              
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600 }}>
                  Support
                </Typography>
                <Typography
                  component={Link}
                  href="/login"
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  Sign In
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              © 2025 Cultivate HQ. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}