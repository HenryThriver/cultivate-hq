'use client';

import React from 'react';
import { 
  Box, 
  Button,
  Container, 
  Typography, 
  Stack, 
  Card,
  alpha,
  useTheme
} from '@mui/material';
import { LinkedIn } from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';
import { MarketingLayout } from '@/components/layout/MarketingLayout';

export default function AboutPage() {

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
                  Hi, I'm{' '}
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
                    Henry
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
                  Founder of Cultivate HQ, where I'm building the relationship intelligence system I always wanted (to share).
                </Typography>
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Founder Story Section */}
        <Box sx={{ py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
              spacing={6} 
              alignItems="center"
            >
              {/* Image */}
              <Stack 
                spacing={2}
                alignItems="center"
                sx={{ 
                  width: { xs: 280, md: 350 },
                  flexShrink: 0
                }}
              >
                <Card
                  sx={{
                    width: '100%',
                    aspectRatio: '2/3', // Match the natural image ratio (533x800)
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <Image
                    src="/HAF_Headshot_optimized.jpg"
                    alt="Handsome Hank, Founder of Cultivate HQ"
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 280px, 350px"
                    priority
                    quality={85}
                  />
                </Card>
                
                {/* LinkedIn Button */}
                <Button
                  component={Link}
                  href="https://www.linkedin.com/in/henryfinkelstein/"
                  target="_blank"
                  variant="outlined"
                  startIcon={<LinkedIn />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    borderWidth: 1.5,
                    px: 3,
                    py: 1,
                    '&:hover': {
                      borderWidth: 1.5,
                    }
                  }}
                >
                  Connect with me on LinkedIn
                </Button>
              </Stack>

              {/* Story Content */}
              <Box sx={{ flex: 1 }}>
                <Stack spacing={4}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: { xs: '2.25rem', md: '3rem' },
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      lineHeight: 1.1,
                      mb: 3,
                      background: 'linear-gradient(135deg, #212121 0%, #616161 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent'
                    }}
                  >
                    Why I'm building Cultivate HQ
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '1.125rem',
                      lineHeight: 1.6,
                      color: 'text.secondary'
                    }}
                  >
                    When I was a Sloan Fellow at the Stanford Graduate School of Business, I learned that connections define careers. 
                    Smarts and hard work are table stakes - truly exceptional outcomes come from exceptional networks.
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '1.125rem',
                      lineHeight: 1.6,
                      color: 'text.secondary'
                    }}
                  >
                    You know why they call it net-work? Because it's usually miserable. Conferences, mixers, LinkedIn QR codes, oh my! Check out my follower count!
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '1.125rem',
                      lineHeight: 1.6,
                      color: 'text.secondary'
                    }}
                  >
                    For those who care about genuine connection grounded in generosity and care, tools have hardly evolved since Lotus123 and hand written rolodex notes.
                    Do you also have boxes and boxes of unused cards from past roles gathering dust somewhere? And don't get me started on the mindnumbing volume over value of social media.
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '1.125rem',
                      lineHeight: 1.6,
                      color: 'text.secondary'
                    }}
                  >
                    Building meaningful relationships doesn't have to suck. Today's technology unlocks something fundamentally different. 
                    A truly intelligent system that scans the public-sphere, understands historical context, suggests meaningful just-in-time actions, 
                    and makes connection building feel fluid and fun. Elegant efficiency for busy professionals who care too much to waste their time, or yours.
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '1.125rem',
                      lineHeight: 1.6,
                      color: 'text.secondary'
                    }}
                  >
                    What I want, and know is possible, simply didn't exist. I got inspired by Keith Ferrazzi, Ronen Olshansky, and the amazing people at Beyond Connections, and I started building.
                    I hope you enjoy deepening connections that matter with a modern toolkit. Try it, get your mind (lovingly) blown, and you're welcome.
                  </Typography>

                  <Box
                    sx={{
                      p: 3,
                      backgroundColor: '#FAFBFF',
                      borderLeft: '3px solid',
                      borderColor: '#059669', // Sage green for wisdom/insight per design system
                      borderRadius: 2
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: '1.125rem',
                        lineHeight: 1.6,
                        color: 'text.primary',
                        fontWeight: 500,
                        fontStyle: 'italic'
                      }}
                    >
                      Cultivate HQ is the tool I built for myself because I desperately needed a better way 
                      to maintain meaningful, strategic connections at scale.
                    </Typography>
                  </Box>

                </Stack>
              </Box>
            </Stack>
          </Container>
        </Box>

        {/* Call to Action */}
        <Box 
          sx={{ 
            py: { xs: 8, md: 12 },
            backgroundColor: 'grey.50'
          }}
        >
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
                  I'd love to hear your feedback
                </Typography>
                
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1.125rem',
                    color: 'text.secondary',
                    maxWidth: '600px'
                  }}
                >
                  This journey is just beginning, and I'm excited to learn from fellow relationship builders. 
                  Whether you try Cultivate HQ or not, I'd genuinely appreciate hearing about your own 
                  networking challenges and what's worked (or hasn't worked) for you.
                </Typography>
                
                <Stack 
                  direction="column"
                  spacing={2}
                  alignItems="center"
                >
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
                      textTransform: 'none'
                    }}
                  >
                    Try Cultivate HQ
                  </Button>
                  
                  <Typography
                    variant="body2"
                    align="center"
                    sx={{ color: 'text.secondary' }}
                  >
                    or{' '}
                    <Typography
                      component={Link}
                      href="/contact"
                      variant="body2"
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      reach out anytime
                    </Typography>
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Container>
        </Box>
    </MarketingLayout>
  );
}