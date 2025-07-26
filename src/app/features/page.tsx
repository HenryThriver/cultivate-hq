'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack, 
  Grid, 
  Card,
  CardContent,
  alpha,
  CircularProgress,
  useTheme
} from '@mui/material';
import { 
  Search,
  Favorite,
  CenterFocusStrong,
  Event,
  ConnectWithoutContact,
  Insights,
  SmartToy,
  Speed,
  PersonSearch,
  Analytics,
  GroupAdd,
  Campaign,
  CalendarMonth,
  Psychology,
  TrendingUp,
  AutoAwesome,
  LinkedIn,
  School,
  Schedule,
  Forum,
  Language
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getFeaturesByCategory, CATEGORY_INFO } from '@/config/functionalFeatures';
import Link from 'next/link';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { HeroSection, GradientText, CTASection, gradients } from '@/components/marketing';

const categoryIcons = {
  find: Search,
  nurture: Favorite,
  strategy: CenterFocusStrong,
  events: Event
};

const featureIcons = {
  // Find
  linkedin_analysis: LinkedIn,
  smart_introductions: ConnectWithoutContact,
  opportunity_detection: Insights,
  network_mapping: Language,
  
  // Nurture
  contact_intelligence: PersonSearch,
  smart_follow_up: Campaign,
  voice_capture: SmartToy,
  artifact_creation: Forum,
  public_monitoring: Analytics,
  
  // Strategy
  relationship_sessions: CalendarMonth,
  reciprocity_index: AutoAwesome,
  ask_management: Psychology,
  goal_alignment: CenterFocusStrong,
  progress_tracking: TrendingUp,
  natural_queries: Search,
  
  // Events
  event_intelligence: School,
  attendee_targeting: GroupAdd,
  event_hosting: Event,
  meeting_scheduling: Schedule,
  deep_research: School,
  post_event_activation: Speed
};

export default function FeaturesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const categoryColors = {
    find: theme.palette.primary.main,
    nurture: theme.palette.sage.main,
    strategy: theme.palette.amber.main,
    events: theme.palette.plum.main
  };

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

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

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <HeroSection>
        <Stack spacing={8} alignItems="center" textAlign="center">
          <Stack spacing={4} alignItems="center" maxWidth="900px">
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
              Transform every interaction into{' '}
              <GradientText
                component="span"
                variant="inherit"
                gradient={gradients.primary}
                underline
              >
                strategic advantage
              </GradientText>
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
              From finding the right connections to nurturing them strategically, Cultivate HQ provides the intelligence exceptional leaders need to build relationships that accelerate everything.
            </Typography>
          </Stack>
          
          <Button
            component={Link}
            href="/pricing"
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.125rem',
              fontWeight: 500,
              textTransform: 'none',
              minWidth: 200
            }}
          >
            Activate your network net worth
          </Button>
        </Stack>
      </HeroSection>

      {/* Feature Categories */}
      <Box sx={{ py: { xs: 10, md: 16 } }}>
        <Container maxWidth="lg">
          <Stack spacing={16}>
            {Object.entries(CATEGORY_INFO).map(([categoryKey, categoryInfo], index) => {
              const features = getFeaturesByCategory(categoryKey as keyof typeof CATEGORY_INFO);
              const CategoryIcon = categoryIcons[categoryKey as keyof typeof categoryIcons];
              const categoryColor = categoryColors[categoryKey as keyof typeof categoryColors];
              
              return (
                <Box 
                  key={categoryKey} 
                  sx={{ 
                    position: 'relative',
                    ...(index % 2 === 1 && {
                      background: `linear-gradient(135deg, ${alpha(categoryColor, 0.02)} 0%, ${alpha(categoryColor, 0.01)} 100%)`,
                      borderRadius: 4,
                      p: { xs: 4, md: 6 },
                      mx: { xs: -2, md: -4 }
                    })
                  }}
                >
                  {/* Category Header */}
                  <Stack spacing={6} alignItems="center" textAlign="center" sx={{ mb: 10 }}>
                    <Box
                      sx={{
                        width: 96,
                        height: 96,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${alpha(categoryColor, 0.1)} 0%, ${alpha(categoryColor, 0.05)} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: categoryColor,
                        border: `3px solid ${alpha(categoryColor, 0.2)}`,
                        boxShadow: `0 8px 32px ${alpha(categoryColor, 0.1)}`
                      }}
                    >
                      <CategoryIcon sx={{ fontSize: 48 }} />
                    </Box>
                    
                    <Stack spacing={3} alignItems="center" maxWidth="800px">
                      <GradientText
                        variant="h2"
                        gradient={gradients.dark}
                        sx={{
                          fontSize: { xs: '2.25rem', md: '3rem' },
                          fontWeight: 700,
                          letterSpacing: '-0.03em'
                        }}
                      >
                        {categoryInfo.title}
                      </GradientText>
                      
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: '1.25rem',
                          color: 'text.secondary',
                          fontStyle: 'italic',
                          opacity: 0.9
                        }}
                      >
                        {categoryInfo.subtitle}
                      </Typography>
                    </Stack>
                  </Stack>
                  
                  {/* Features Grid */}
                  <Grid container spacing={4}>
                    {features.map((feature) => {
                      const FeatureIcon = featureIcons[feature.key as keyof typeof featureIcons] || ConnectWithoutContact;
                      
                      return (
                        <Grid size={{ xs: 12, md: 6 }} key={feature.key}>
                          <Card
                            sx={{
                              height: '100%',
                              p: 4,
                              border: '1px solid',
                              borderColor: 'grey.200',
                              borderRadius: 3,
                              position: 'relative',
                              overflow: 'hidden',
                              backgroundColor: 'white',
                              transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                background: `linear-gradient(90deg, ${categoryColor} 0%, ${alpha(categoryColor, 0.6)} 100%)`,
                                transform: 'scaleX(0)',
                                transformOrigin: 'left',
                                transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                              },
                              '&:hover': {
                                borderColor: categoryColor,
                                transform: 'translateY(-4px)',
                                boxShadow: `0 12px 32px ${alpha(categoryColor, 0.15)}`,
                                '&::before': {
                                  transform: 'scaleX(1)'
                                }
                              }
                            }}
                          >
                            <CardContent sx={{ p: 0 }}>
                              <Stack spacing={3}>
                                <Stack direction="row" spacing={3} alignItems="flex-start">
                                  <Box
                                    sx={{
                                      width: 64,
                                      height: 64,
                                      borderRadius: 3,
                                      background: `linear-gradient(135deg, ${alpha(categoryColor, 0.1)} 0%, ${alpha(categoryColor, 0.05)} 100%)`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: categoryColor,
                                      flexShrink: 0,
                                      border: `2px solid ${alpha(categoryColor, 0.2)}`,
                                      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                  >
                                    <FeatureIcon sx={{ fontSize: 28 }} />
                                  </Box>
                                  
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography
                                      variant="h6"
                                      sx={{ 
                                        fontWeight: 600, 
                                        fontSize: '1.25rem',
                                        lineHeight: 1.3,
                                        letterSpacing: '-0.01em',
                                        mb: 1
                                      }}
                                    >
                                      {feature.title}
                                    </Typography>
                                  </Box>
                                </Stack>
                                
                                <Typography
                                  variant="body2"
                                  sx={{ 
                                    color: 'text.secondary', 
                                    lineHeight: 1.65,
                                    fontSize: '0.975rem'
                                  }}
                                >
                                  {feature.description}
                                </Typography>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              );
            })}
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <CTASection
        title="Ready to transform your relationship building?"
        subtitle="Stop managing contacts. Start cultivating strategic ecosystems. Experience relationship intelligence designed for exceptional leaders."
        primaryButtonText="View pricing"
        primaryButtonHref="/pricing"
        secondaryButtonText="Get started"
        secondaryButtonHref="/pricing"
        footnote="No setup fees • Cancel anytime • Professional support"
      />
    </MarketingLayout>
  );
}