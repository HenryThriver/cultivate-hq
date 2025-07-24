'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Paper,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Flag as FlagIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * Admin dashboard main page
 * Provides navigation to all admin functions
 */
export default function AdminDashboardPage(): React.JSX.Element {
  const router = useRouter();

  const adminOptions = [
    {
      title: 'Feature Flags',
      description: 'Manage system feature flags and user overrides',
      icon: <FlagIcon sx={{ fontSize: 40 }} />,
      href: '/dashboard/admin/feature-flags',
      color: '#1976d2'
    },
    {
      title: 'User Management',
      description: 'View and manage user accounts and roles',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      href: '/dashboard/admin/users',
      color: '#7c3aed'
    },
    {
      title: 'System Analytics',
      description: 'View system usage and performance metrics',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      href: '/dashboard/admin/analytics',
      color: '#059669'
    },
    {
      title: 'Audit Log',
      description: 'Review admin actions and system changes',
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      href: '/dashboard/admin/audit-log',
      color: '#dc2626'
    },
    {
      title: 'System Settings',
      description: 'Configure global system settings',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      href: '/dashboard/admin/settings',
      color: '#ea580c'
    },
    {
      title: 'Debug Tools',
      description: 'Access debugging and diagnostic tools',
      icon: <TimelineIcon sx={{ fontSize: 40 }} />,
      href: '/dashboard/admin/debug',
      color: '#4f46e5'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={NextLink} href="/dashboard" underline="hover">
          Dashboard
        </Link>
        <Typography color="text.primary">Admin</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage system settings, users, and feature flags for Cultivate HQ
        </Typography>
      </Box>

      {/* Admin Warning Banner */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4, 
          backgroundColor: 'warning.light',
          border: '1px solid',
          borderColor: 'warning.main'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SecurityIcon sx={{ color: 'warning.main' }} />
          <Box>
            <Typography variant="h6" sx={{ color: 'warning.contrastText' }}>
              Administrator Access
            </Typography>
            <Typography variant="body2" sx={{ color: 'warning.contrastText' }}>
              You have admin privileges. All actions are logged for security purposes.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Admin Options Grid */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 3 
        }}
      >
        {adminOptions.map((option) => (
          <Card key={option.title} sx={{ height: '100%', transition: 'transform 0.2s' }}>
            <CardActionArea 
              onClick={() => router.push(option.href)}
              sx={{ height: '100%', p: 3 }}
            >
              <CardContent sx={{ textAlign: 'center', height: '100%' }}>
                <Box sx={{ color: option.color, mb: 2 }}>
                  {option.icon}
                </Box>
                <Typography variant="h6" component="div" gutterBottom>
                  {option.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ minHeight: '2.5em' }}
                >
                  {option.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      {/* Quick Stats Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Quick Stats
        </Typography>
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 3
          }}
        >
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" gutterBottom>
                -
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary" gutterBottom>
                -
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Feature Flags
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                -
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Admin Users
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" gutterBottom>
                -
              </Typography>
              <Typography variant="body2" color="text.secondary">
                User Overrides
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}