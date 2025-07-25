'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Stack, 
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  alpha,
  useTheme
} from '@mui/material';
import { LinkedIn } from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  const theme = useTheme();

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
                  color: 'text.secondary',
                  fontWeight: 500,
                  '&:hover': {
                    color: 'primary.main'
                  }
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
                  color: 'primary.main',
                  fontWeight: 500
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
                    sx={{ color: 'primary.main' }}
                  >
                    Henry Finkelstein
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
                  Founder of Cultivate HQ, where I'm building the relationship intelligence system I always wished existed.
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
              <Box 
                sx={{ 
                  width: { xs: 280, md: 320 },
                  height: { xs: 280, md: 320 },
                  flexShrink: 0
                }}
              >
                <Card
                  sx={{
                    width: '100%',
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  {/* Placeholder for founder image */}
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'grey.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ color: 'text.secondary' }}
                    >
                      [Your Photo Here]
                    </Typography>
                    {/* When you have an image, replace the Box above with:
                    <Image
                      src="/path-to-your-image.jpg"
                      alt="Henry Finkelstein, Founder of Cultivate HQ"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    */}
                  </Box>
                </Card>
              </Box>

              {/* Story Content */}
              <Box sx={{ flex: 1 }}>
                <Stack spacing={4}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                      mb: 2
                    }}
                  >
                    Why I Built This
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '1.125rem',
                      lineHeight: 1.6,
                      color: 'text.secondary'
                    }}
                  >
                    At Stanford Graduate School of Business, I discovered something that changed my perspective: 
                    relationships aren't just nice-to-have—they're the ultimate competitive advantage. 
                    My professors emphasized this constantly, even dedicating entire courses to networking and relationship building.
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '1.125rem',
                      lineHeight: 1.6,
                      color: 'text.secondary'
                    }}
                  >
                    But here's what frustrated me: despite understanding the importance, the systems they taught us 
                    were overwhelming and impossible to sustain. Complex spreadsheets, manual tracking, 
                    generic approaches that felt more like homework than genuine relationship building. 
                    I tried everything—none of it stuck.
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '1.125rem',
                      lineHeight: 1.6,
                      color: 'text.secondary'
                    }}
                  >
                    Even the "Beyond Connections" course, which I genuinely enjoyed, relied on spreadsheet-based 
                    systems that felt too manual for someone who desperately wanted to maintain meaningful connections 
                    without the administrative burden.
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '1.125rem',
                      lineHeight: 1.6,
                      color: 'text.secondary'
                    }}
                  >
                    That's when I realized: with AI, we could build something fundamentally different. 
                    Not just another CRM, but a truly intelligent system that understands context, 
                    suggests meaningful actions, and makes relationship building feel natural rather than forced.
                  </Typography>

                  <Box
                    sx={{
                      p: 3,
                      backgroundColor: alpha('#2196F3', 0.03),
                      borderLeft: '4px solid',
                      borderColor: 'primary.main',
                      borderRadius: 1
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
                      Cultivate HQ is the tool I built for myself—because I desperately needed a better way 
                      to maintain connections, and nothing else out there really worked for me.
                    </Typography>
                  </Box>

                  {/* LinkedIn Link */}
                  <Box sx={{ pt: 2 }}>
                    <Button
                      component={Link}
                      href="https://www.linkedin.com/in/henryfinkelstein/"
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      size="large"
                      startIcon={
                        <LinkedIn sx={{ fontSize: 24 }} />
                      }
                      sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        px: 3,
                        py: 1.5,
                        borderWidth: 1.5,
                        borderColor: '#0077B5',
                        color: '#0077B5',
                        '&:hover': {
                          borderWidth: 1.5,
                          borderColor: '#005885',
                          backgroundColor: alpha('#0077B5', 0.04),
                          color: '#005885'
                        }
                      }}
                    >
                      Connect with me on LinkedIn
                    </Button>
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
                p: { xs: 4, md: 6 },
                backgroundColor: 'white',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200'
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
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={3}
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
                    sx={{ color: 'text.secondary' }}
                  >
                    or reach out anytime
                  </Typography>
                </Stack>
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