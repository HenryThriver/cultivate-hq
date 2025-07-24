'use client';

import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { FeatureFlagsManager } from '@/components/features/admin/FeatureFlagsManager';
import { useIsAdmin } from '@/lib/hooks/useFeatureFlag';

export default function AdminPage() {
  const { isAdmin, loading } = useIsAdmin();

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Access Denied
          </Typography>
          <Typography>
            You need admin privileges to access this page.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <FeatureFlagsManager />
      </Box>
    </Container>
  );
}