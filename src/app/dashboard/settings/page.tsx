'use client';

import React from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, CardActionArea, Breadcrumbs, Link } from '@mui/material';
import { Loop as LoopIcon, Settings as SettingsIcon, CalendarToday, Email, Payment } from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerPortal } from '@/hooks/useCustomerPortal';

export default function SettingsPage() {
  const router = useRouter();
  const { redirectToPortal, loading: portalLoading } = useCustomerPortal();

  const settingsOptions = [
    {
      title: 'Loop Templates',
      description: 'Manage templates for common loop workflows like introductions, referrals, and follow-ups',
      icon: <LoopIcon sx={{ fontSize: 40 }} color="primary" />,
      href: '/dashboard/settings/loops'
    },
    {
      title: 'Calendar Integration',
      description: 'Connect Google Calendar to automatically import meetings and sync your schedule',
      icon: <CalendarToday sx={{ fontSize: 40 }} color="primary" />,
      href: '/dashboard/settings/calendar'
    },
    {
      title: 'Gmail Integration',
      description: 'Connect Gmail to automatically import email conversations and sync your communications',
      icon: <Email sx={{ fontSize: 40 }} color="primary" />,
      href: '/dashboard/settings/gmail'
    },
    {
      title: 'Billing & Subscription',
      description: 'Manage your subscription, payment methods, and billing history',
      icon: <Payment sx={{ fontSize: 40 }} color="primary" />,
      href: null, // Special handling for billing portal
      action: 'billing'
    },
    // Future settings options can be added here
    // {
    //   title: 'Contact Settings',
    //   description: 'Configure contact management preferences and defaults',
    //   icon: <ContactsIcon sx={{ fontSize: 40 }} color="primary" />,
    //   href: '/dashboard/settings/contacts'
    // },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link component={NextLink} href="/dashboard" underline="hover" color="inherit">
            Dashboard
          </Link>
          <Typography color="text.primary">Settings</Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon sx={{ fontSize: 40 }} color="primary" />
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure your relationship management preferences and templates
            </Typography>
          </Box>
        </Box>

        {/* Settings Options Grid */}
        <Grid container spacing={3}>
          {settingsOptions.map((option) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={option.title}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea 
                  sx={{ height: '100%', p: 3 }}
                  onClick={() => {
                    if (option.action === 'billing') {
                      redirectToPortal();
                    } else if (option.href) {
                      router.push(option.href);
                    }
                  }}
                  disabled={option.action === 'billing' && portalLoading}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {option.icon}
                    </Box>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {option.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
} 