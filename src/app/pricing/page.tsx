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
  alpha,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  useTheme
} from '@mui/material';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
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
      description: 'Strong foundation for systematic relationship cultivation',
      features: PRODUCT_CONFIG.monthly.features,
      popular: false,
      buttonText: 'Begin transformation'
    },
    {
      id: 'annual',
      name: 'Annual',
      price: 300,
      period: '/year',
      description: 'Comprehensive intelligence platform for relationship mastery',
      features: PRODUCT_CONFIG.annual.features,
      popular: true,
      buttonText: 'Unlock strategic advantage'
    },
    {
      id: 'supporter',
      name: 'Supporter',
      price: 3000,
      period: '/5 years',
      description: 'Elite partnership with creator access and strategic consult privileges',
      features: PRODUCT_CONFIG.supporter.features,
      popular: false,
      buttonText: 'Join elite partnership'
    }
  ];

  const handleGetStarted = async (tierId: string) => {
    if (tierId === 'enterprise') {
      // Navigate to enterprise contact page
      window.location.href = '/enterprise';
      return;
    }
    // Always go directly to checkout - Stripe will handle auth if needed
    await createCheckoutSession(tierId as 'monthly' | 'annual' | 'supporter');
  };

  return (
    <MarketingLayout>
        {/* Hero Section */}
        <Box 
          sx={{ 
            py: { xs: 10, md: 16 },
            background: `
              linear-gradient(135deg, 
                ${alpha('#2196F3', 0.04)} 0%, 
                ${alpha('#7C3AED', 0.03)} 50%, 
                ${alpha('#059669', 0.02)} 100%
              ),
              radial-gradient(circle at 20% 50%, ${alpha('#2196F3', 0.06)} 0%, transparent 50%)
            `,
            borderBottom: '1px solid',
            borderColor: 'grey.200',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.8) 100%)',
              pointerEvents: 'none'
            }
          }}
        >
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
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
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    color: 'text.primary'
                  }}
                >
                  Invest in your{' '}
                  <Typography
                    component="span"
                    variant="inherit"
                    sx={{ 
                      background: `linear-gradient(135deg, #2196F3 0%, #7C3AED 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-8px',
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: `linear-gradient(90deg, #2196F3 0%, #7C3AED 100%)`,
                        borderRadius: '2px',
                        opacity: 0.3
                      }
                    }}
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
                    lineHeight: 1.5,
                    maxWidth: '700px',
                    fontStyle: 'italic',
                    opacity: 0.9
                  }}
                >
                  Most executives treat relationships like afterthoughts. The smartest ones treat them like strategic assets. Transform your approach from transactional networking to systematic relationship intelligence.
                </Typography>
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Pricing Cards */}
        <Box sx={{ py: { xs: 8, md: 12 }, overflow: 'visible' }}>
          <Container maxWidth="lg" sx={{ overflow: 'visible' }}>
            <Box 
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 4,
                alignItems: 'stretch',
                // Add padding top to accommodate the popular badge
                pt: 3,
                // Ensure overflow is visible for badges
                overflow: 'visible'
              }}
            >
              {pricingTiers.map((tier) => (
                <Card
                  key={tier.id}
                  sx={{
                    p: tier.popular ? 5 : 4,
                    border: tier.popular ? '2px solid' : '1px solid',
                    borderColor: tier.popular ? 'primary.main' : 'grey.200',
                    borderRadius: 4,
                    position: 'relative',
                    backgroundColor: tier.popular ? 'white' : 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    transform: tier.popular ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: tier.popular 
                      ? `0 12px 32px ${alpha('#2196F3', 0.15)}` 
                      : '0 2px 8px rgba(0, 0, 0, 0.08)',
                    transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                    // Ensure overflow is visible for badges
                    overflow: 'visible',
                    '&:hover': {
                      transform: tier.popular ? 'scale(1.05) translateY(-4px)' : 'translateY(-4px)',
                      boxShadow: tier.popular 
                        ? `0 20px 48px ${alpha('#2196F3', 0.2)}` 
                        : '0 8px 24px rgba(0, 0, 0, 0.12)'
                    }
                  }}
                >
                  {/* Popular Badge */}
                  {tier.popular && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -1,
                        left: '50%',
                        transform: 'translateX(-50%) translateY(-50%)',
                        background: 'linear-gradient(135deg, #212121 0%, #424242 100%)',
                        color: 'white',
                        px: 3,
                        py: 0.75,
                        borderRadius: 1.5,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        letterSpacing: '0.02em',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        zIndex: 1000,
                        whiteSpace: 'nowrap'
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
                        
                        {tier.price !== null ? (
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
                        ) : (
                          <Typography
                            variant="h4"
                            sx={{
                              fontSize: { xs: '1.5rem', md: '2rem' },
                              fontWeight: 600,
                              color: 'primary.main',
                              mb: 1
                            }}
                          >
                            Custom Pricing
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

        {/* Enterprise Section */}
        <Box sx={{ py: { xs: 6, md: 8 } }}>
          <Container maxWidth="lg">
            <Card
              sx={{
                p: { xs: 4, md: 6 },
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 4,
                position: 'relative',
                background: `
                  linear-gradient(135deg, 
                    ${alpha('#2196F3', 0.06)} 0%, 
                    ${alpha('#7C3AED', 0.04)} 100%
                  ),
                  radial-gradient(circle at 30% 70%, ${alpha('#2196F3', 0.08)} 0%, transparent 50%)
                `,
                boxShadow: `0 12px 32px ${alpha('#2196F3', 0.15)}`,
                transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 20px 48px ${alpha('#2196F3', 0.2)}`,
                }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: 'center',
                  gap: { xs: 4, md: 6 },
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {/* Content */}
                <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.75rem', md: '2.25rem' },
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      mb: 2,
                      background: 'linear-gradient(135deg, #212121 0%, #616161 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent'
                    }}
                  >
                    Enterprise Solutions
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.125rem' },
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      mb: 3,
                      maxWidth: { md: '500px' }
                    }}
                  >
                    Custom relationship intelligence platform for organizations ready to scale strategic connections across entire teams. Get dedicated support, advanced security, and tailored integrations.
                  </Typography>
                  
                  {/* Enterprise Features */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    {[
                      'Unlimited team members',
                      'Dedicated success manager',
                      'Custom integrations',
                      'Advanced security & compliance',
                      'Priority support & SLA'
                    ].map((feature, index) => (
                      <Box
                        key={index}
                        sx={{
                          px: 2,
                          py: 0.5,
                          backgroundColor: alpha('#2196F3', 0.1),
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: alpha('#2196F3', 0.2)
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: 'primary.main'
                          }}
                        >
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* CTA */}
                <Box sx={{ textAlign: 'center', minWidth: { md: '200px' } }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      fontWeight: 600,
                      color: 'primary.main',
                      mb: 1
                    }}
                  >
                    Custom Pricing
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 3,
                      fontSize: '0.875rem'
                    }}
                  >
                    Tailored to your organization&apos;s needs
                  </Typography>
                  <Button
                    onClick={() => window.location.href = '/enterprise'}
                    variant="contained"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 500,
                      textTransform: 'none',
                      borderRadius: 2,
                      background: `linear-gradient(135deg, #2196F3 0%, #1976D2 100%)`,
                      boxShadow: `0 4px 20px ${alpha('#2196F3', 0.3)}`,
                      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'scale(1.02) translateY(-1px)',
                        boxShadow: `0 8px 32px ${alpha('#2196F3', 0.4)}`,
                        background: `linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)`,
                      }
                    }}
                  >
                    Contact for pricing
                  </Button>
                </Box>
              </Box>
            </Card>
          </Container>
        </Box>

        {/* Value Proposition */}
        <Box 
          sx={{ 
            py: { xs: 10, md: 16 }, 
            background: `
              linear-gradient(135deg, 
                ${alpha('#F5F5F5', 0.8)} 0%, 
                ${alpha('#FAFAFA', 0.9)} 100%
              ),
              radial-gradient(circle at 70% 30%, ${alpha('#2196F3', 0.03)} 0%, transparent 50%)
            `,
            position: 'relative'
          }}
        >
          <Container maxWidth="lg">
            <Stack spacing={8}>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2.25rem', md: '3rem' },
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    mb: 4,
                    background: 'linear-gradient(135deg, #212121 0%, #616161 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  Why leaders choose Cultivate HQ
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1.25rem',
                    color: 'text.secondary',
                    maxWidth: '700px',
                    mx: 'auto',
                    fontStyle: 'italic',
                    opacity: 0.9
                  }}
                >
                  While others collect business cards, exceptional leaders cultivate strategic ecosystems. Transform relationship chaos into systematic advantage—because your next breakthrough is one connection away.
                </Typography>
              </Box>
              
              <Stack spacing={6}>
                {[
                  {
                    icon: <TrendingUp />,
                    title: 'Exponential Returns',
                    description: 'A single well-timed introduction can unlock opportunities worth millions. Strategic relationship capital compounds faster than any traditional investment.',
                    color: theme.palette.primary.main
                  },
                  {
                    icon: <Speed />,
                    title: 'Cognitive Liberation',
                    description: 'Eliminate relationship maintenance overwhelm. Focus your mental energy on strategy while the system handles connection intelligence.',
                    color: theme.palette.sage.main
                  },
                  {
                    icon: <Psychology />,
                    title: 'Strategic Amplification',
                    description: 'AI-powered pattern recognition that surfaces opportunities your busy schedule might miss. Augment your executive intuition with systematic intelligence.',
                    color: theme.palette.amber.main
                  },
                  {
                    icon: <AutoAwesome />,
                    title: 'Sustainable Excellence',
                    description: 'Cultivate 50+ meaningful relationships without sacrificing depth or authenticity. Quality scales when systems handle complexity.',
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
                p: { xs: 6, md: 8 },
                background: `
                  linear-gradient(135deg, 
                    ${alpha('#2196F3', 0.06)} 0%, 
                    ${alpha('#7C3AED', 0.04)} 100%
                  ),
                  radial-gradient(circle at 50% 50%, ${alpha('#2196F3', 0.08)} 0%, transparent 70%)
                `,
                borderRadius: 4,
                border: '1px solid',
                borderColor: alpha('#2196F3', 0.15),
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.7) 100%)',
                  pointerEvents: 'none'
                }
              }}
            >
              <Stack spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '2rem', md: '2.75rem' },
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg, #212121 0%, #616161 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                  }}
                >
                  Ready to transform your relationship building?
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1.25rem',
                    color: 'text.secondary',
                    maxWidth: '600px',
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                    opacity: 0.9
                  }}
                >
                  Stop networking. Start cultivating. Join leaders who've transformed relationship chaos into systematic advantage—because your next breakthrough is one strategic connection away.
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
                  {checkoutLoading ? 'Processing...' : 'Begin strategic transformation'}
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
    </MarketingLayout>
  );
}