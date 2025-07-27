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
  MenuItem,
  Grid,
} from '@mui/material';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { HeroSection, GradientText, CTASection, gradients } from '@/components/marketing';
import { Business, Groups, Security, RocketLaunch } from '@mui/icons-material';

export default function EnterpriseContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    jobTitle: '',
    companySize: '',
    industry: '',
    currentSolution: '',
    challenges: '',
    timeline: '',
    budget: '',
    message: '',
    captcha: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [captchaQuestion, setCaptchaQuestion] = useState({ question: '', answer: 0 });
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

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
    
    // Prevent rapid submissions (debounce for 3 seconds)
    const now = Date.now();
    if (now - lastSubmissionTime < 3000) {
      setSubmitStatus('error');
      return;
    }
    
    // Validate captcha
    if (parseInt(formData.captcha) !== captchaQuestion.answer) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setLastSubmissionTime(now);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          formType: 'enterprise',
          subject: 'Enterprise Inquiry'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send enterprise inquiry');
      }
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        company: '',
        jobTitle: '',
        companySize: '',
        industry: '',
        currentSolution: '',
        challenges: '',
        timeline: '',
        budget: '',
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

  const companySizeOptions = [
    { value: '', label: 'Select company size' },
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
  ];

  const timelineOptions = [
    { value: '', label: 'Select timeline' },
    { value: 'immediate', label: 'Immediate (within 1 month)' },
    { value: '1-3months', label: '1-3 months' },
    { value: '3-6months', label: '3-6 months' },
    { value: '6-12months', label: '6-12 months' },
    { value: 'exploring', label: 'Just exploring options' },
  ];

  const budgetOptions = [
    { value: '', label: 'Select budget range' },
    { value: 'under-10k', label: 'Under $10K/year' },
    { value: '10k-25k', label: '$10K - $25K/year' },
    { value: '25k-50k', label: '$25K - $50K/year' },
    { value: '50k-100k', label: '$50K - $100K/year' },
    { value: 'over-100k', label: 'Over $100K/year' },
    { value: 'not-sure', label: 'Not sure yet' },
  ];

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <HeroSection>
        <Stack spacing={6} alignItems="center" textAlign="center">
          <Stack spacing={3} alignItems="center" maxWidth="900px">
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                color: 'text.primary'
              }}
            >
              Transform your organization&apos;s{' '}
              <GradientText
                component="span"
                variant="inherit"
                gradient={gradients.primary}
                underline
              >
                relationship intelligence
              </GradientText>
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.125rem', md: '1.25rem' },
                fontWeight: 400,
                color: 'text.secondary',
                lineHeight: 1.5,
                maxWidth: '800px',
                fontStyle: 'italic',
                opacity: 0.9
              }}
            >
              Enterprise teams leverage Cultivate HQ to systematically track, nurture, and optimize thousands of strategic relationships—transforming scattered connections into measurable competitive advantage.
            </Typography>
          </Stack>

          {/* Value Props */}
          <Grid container spacing={3} sx={{ mt: 4, maxWidth: '900px' }}>
            {[
              {
                icon: <Business sx={{ fontSize: 24 }} />,
                title: 'Enterprise Scale',
                description: 'Support unlimited team members with role-based permissions'
              },
              {
                icon: <Security sx={{ fontSize: 24 }} />,
                title: 'Security First',
                description: 'SOC 2 compliant with advanced security controls'
              },
              {
                icon: <Groups sx={{ fontSize: 24 }} />,
                title: 'Team Intelligence',
                description: 'Unified relationship insights across your entire organization'
              },
              {
                icon: <RocketLaunch sx={{ fontSize: 24 }} />,
                title: 'Custom Solutions',
                description: 'Tailored integrations with your existing tech stack'
              }
            ].map((item, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Stack spacing={1} alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: alpha('#2196F3', 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main',
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    {item.description}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </HeroSection>

      {/* Contact Form Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <Stack spacing={6} alignItems="center">
            {/* Section Header */}
            <Box textAlign="center" maxWidth="700px">
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  mb: 2,
                  background: 'linear-gradient(135deg, #212121 0%, #616161 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                Let&apos;s discuss your enterprise needs
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.125rem',
                  color: 'text.secondary',
                  lineHeight: 1.5,
                }}
              >
                Our enterprise team will craft a custom solution that aligns with your organization&apos;s unique relationship intelligence requirements.
              </Typography>
            </Box>

            {/* Contact Form */}
            <Card
              sx={{
                width: '100%',
                maxWidth: 800,
                p: { xs: 0, md: 2 },
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 3,
                position: 'relative',
                backgroundColor: 'white',
                boxShadow: `0 12px 32px ${alpha('#2196F3', 0.15)}`,
                transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 20px 48px ${alpha('#2196F3', 0.2)}`,
                }
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={4}>
                    {submitStatus === 'success' && (
                      <Alert 
                        severity="success"
                        sx={{
                          borderRadius: 2,
                          backgroundColor: alpha('#4CAF50', 0.1),
                          color: 'success.dark'
                        }}
                      >
                        Thank you for your interest in Cultivate HQ Enterprise. Our team will review your requirements and reach out within 24 hours to schedule a strategic consultation.
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

                    {/* Personal Information */}
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6 }}>
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
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          name="email"
                          label="Work Email"
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
                      </Grid>
                    </Grid>

                    {/* Company Information */}
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          name="company"
                          label="Company Name"
                          value={formData.company}
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
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          name="jobTitle"
                          label="Job Title"
                          value={formData.jobTitle}
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
                      </Grid>
                    </Grid>

                    {/* Company Details */}
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          name="companySize"
                          label="Company Size"
                          value={formData.companySize}
                          onChange={handleInputChange}
                          required
                          fullWidth
                          select
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
                        >
                          {companySizeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          name="industry"
                          label="Industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                          required
                          fullWidth
                          variant="outlined"
                          placeholder="e.g., Financial Services, Technology, Healthcare"
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
                      </Grid>
                    </Grid>

                    {/* Project Details */}
                    <TextField
                      name="currentSolution"
                      label="Current Relationship Management Solution (if any)"
                      value={formData.currentSolution}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      placeholder="e.g., CRM, spreadsheets, manual tracking"
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
                      name="challenges"
                      label="Key Challenges"
                      value={formData.challenges}
                      onChange={handleInputChange}
                      required
                      fullWidth
                      multiline
                      rows={3}
                      variant="outlined"
                      placeholder="What relationship management challenges is your organization facing?"
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

                    {/* Timeline and Budget */}
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          name="timeline"
                          label="Implementation Timeline"
                          value={formData.timeline}
                          onChange={handleInputChange}
                          required
                          fullWidth
                          select
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
                        >
                          {timelineOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          name="budget"
                          label="Annual Budget Range"
                          value={formData.budget}
                          onChange={handleInputChange}
                          required
                          fullWidth
                          select
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
                        >
                          {budgetOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>

                    <TextField
                      name="message"
                      label="Additional Information"
                      value={formData.message}
                      onChange={handleInputChange}
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder="Tell us more about your team's relationship intelligence goals and how we can help..."
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
                      helperText="Security verification"
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
                      {isSubmitting ? 'Submitting your request...' : 'Schedule enterprise consultation'}
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Box textAlign="center" sx={{ mt: 4 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1rem', mb: 2 }}>
                Need immediate assistance? Contact our enterprise team directly at{' '}
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
                  enterprise@cultivate-hq.com
                </Typography>
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                All inquiries are reviewed by our senior team within 24 hours
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <CTASection
        title="Ready to transform how your organization manages relationships?"
        subtitle="Join leading enterprises who've turned relationship chaos into systematic competitive advantage."
        primaryButtonText="View all pricing options"
        primaryButtonHref="/pricing"
        secondaryButtonText="Explore features"
        secondaryButtonHref="/features"
        footnote="Enterprise implementation typically begins within 2-4 weeks"
      />
    </MarketingLayout>
  );
}