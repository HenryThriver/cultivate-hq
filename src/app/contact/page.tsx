'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Card,
  CardContent,
  alpha,
} from '@mui/material';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { HeroSection, GradientText, CTASection, gradients } from '@/components/marketing';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    captcha: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [captchaQuestion, setCaptchaQuestion] = useState({ question: '', answer: 0 });

  // Generate simple math captcha
  React.useEffect(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({
      question: `What is ${num1} + ${num2}?`,
      answer: num1 + num2,
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate captcha
    if (parseInt(formData.captcha) !== captchaQuestion.answer) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual form submission logic
      // For now, just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        captcha: '',
      });
      
      // Generate new captcha
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      setCaptchaQuestion({
        question: `What is ${num1} + ${num2}?`,
        answer: num1 + num2,
      });
      
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <HeroSection>
        <Stack spacing={6} alignItems="center" textAlign="center">
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
              Let's cultivate{' '}
              <GradientText
                component="span"
                variant="inherit"
                gradient={gradients.primary}
                underline
              >
                strategic connection
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
              Strategic minds deserve strategic support. Share your vision and we'll explore how Cultivate HQ can accelerate your relationship intelligence.
            </Typography>
          </Stack>
        </Stack>
      </HeroSection>

      {/* Contact Form Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <Stack spacing={6} alignItems="center">
            {/* Contact Form */}
            <Card
              sx={{
                width: '100%',
                maxWidth: 600,
                p: { xs: 0, md: 2 },
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 3,
                position: 'relative',
                backgroundColor: 'white',
                transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 32px ${alpha('#2196F3', 0.15)}`,
                  borderColor: alpha('#2196F3', 0.3),
                }
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    {submitStatus === 'success' && (
                      <Alert 
                        severity="success"
                        sx={{
                          borderRadius: 2,
                          backgroundColor: alpha('#4CAF50', 0.1),
                          color: 'success.dark'
                        }}
                      >
                        Strategic connection established. We'll respond within 24 hours.
                      </Alert>
                    )}
                    
                    {submitStatus === 'error' && (
                      <Alert 
                        severity="error"
                        sx={{
                          borderRadius: 2,
                          backgroundColor: alpha('#F44336', 0.1),
                          color: 'error.dark'
                        }}
                      >
                        Please verify your calculation and try again.
                      </Alert>
                    )}

                    <TextField
                      name="name"
                      label="Your Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      fullWidth
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderWidth: 2,
                          }
                        }
                      }}
                    />

                    <TextField
                      name="email"
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      fullWidth
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderWidth: 2,
                          }
                        }
                      }}
                    />

                    <TextField
                      name="subject"
                      label="Subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      fullWidth
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderWidth: 2,
                          }
                        }
                      }}
                    />

                    <TextField
                      name="message"
                      label="Message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      fullWidth
                      multiline
                      rows={5}
                      variant="outlined"
                      placeholder="Share your relationship building goals and how we might cultivate success together..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderWidth: 2,
                          }
                        }
                      }}
                    />

                    <TextField
                      name="captcha"
                      label={captchaQuestion.question}
                      value={formData.captcha}
                      onChange={handleInputChange}
                      required
                      fullWidth
                      variant="outlined"
                      type="number"
                      helperText="Quick verification that you're a strategic thinker, not a bot"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderWidth: 2,
                          }
                        }
                      }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={isSubmitting}
                      fullWidth
                      sx={{
                        py: 2,
                        fontSize: '1.125rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        borderRadius: 2,
                        background: isSubmitting ? undefined : `linear-gradient(135deg, #2196F3 0%, #1976D2 100%)`,
                        boxShadow: isSubmitting ? undefined : `0 4px 20px ${alpha('#2196F3', 0.3)}`,
                        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'scale(1.02) translateY(-1px)',
                          boxShadow: `0 8px 32px ${alpha('#2196F3', 0.4)}`,
                          background: `linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)`,
                        }
                      }}
                    >
                      {isSubmitting ? 'Cultivating connection...' : 'Begin strategic conversation'}
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Box textAlign="center" sx={{ mt: 4 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1rem' }}>
                Prefer direct connection? Reach us at{' '}
                <Typography 
                  component="span" 
                  sx={{ 
                    color: 'primary.main', 
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  hello@cultivate-hq.com
                </Typography>
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <CTASection
        title="Every strategic relationship starts with a conversation"
        subtitle="Join leaders who've discovered that the right connection at the right time changes everything."
        primaryButtonText="View pricing"
        primaryButtonHref="/pricing"
        secondaryButtonText="Explore features"
        secondaryButtonHref="/features"
        footnote="No credit card required • Start cultivating in minutes"
      />
    </MarketingLayout>
  );
}