'use client';

import React from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useIsAdmin } from '@/lib/hooks/useFeatureFlag';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout wrapper for admin routes
 * Ensures only admin users can access admin functionality
 */
export default function AdminLayout({ children }: AdminLayoutProps): React.JSX.Element {
  const { isAdmin, loading, error } = useIsAdmin();

  // Show loading state while checking admin status
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '50vh'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error if there was a problem checking admin status
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Error checking admin access: {error}
      </Alert>
    );
  }

  // Show access denied for non-admin users
  if (!isAdmin) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Access denied. Admin privileges required.
      </Alert>
    );
  }

  // Render admin content for authorized users
  return (
    <Box sx={{ width: '100%' }}>
      {children}
    </Box>
  );
}