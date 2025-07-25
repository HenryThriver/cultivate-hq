'use client';

import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { FeatureFlagDemo } from '@/components/features/test/FeatureFlagDemo';

export default function TestFeaturesPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Feature Flag Demo
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          This page demonstrates how feature flags work. Create flags in the admin panel and see them in action here.
        </Typography>

        <FeatureFlagDemo flagName="new-dashboard">
          <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="h6" color="success.dark">
              🎉 New Dashboard Feature
            </Typography>
            <Typography color="success.dark">
              You have access to the brand new dashboard experience! This content is only visible when the feature flag is enabled.
            </Typography>
            <Button variant="contained" color="success" sx={{ mt: 2 }}>
              Try New Dashboard
            </Button>
          </Box>
        </FeatureFlagDemo>

        <FeatureFlagDemo flagName="beta-analytics">
          <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
            <Typography variant="h6" color="primary.dark">
              📊 Beta Analytics
            </Typography>
            <Typography color="primary.dark">
              Advanced analytics features are now available! Get insights into your relationship data with our new beta tools.
            </Typography>
            <Button variant="contained" color="primary" sx={{ mt: 2 }}>
              View Analytics
            </Button>
          </Box>
        </FeatureFlagDemo>

        <FeatureFlagDemo flagName="experimental-ai">
          <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="h6" color="warning.dark">
              🤖 Experimental AI Features
            </Typography>
            <Typography color="warning.dark">
              Try our latest AI-powered relationship insights! These features are experimental and may change.
            </Typography>
            <Button variant="contained" color="warning" sx={{ mt: 2 }}>
              Enable AI Assistant
            </Button>
          </Box>
        </FeatureFlagDemo>

        <FeatureFlagDemo flagName="nonexistent-feature">
          <Typography>This shouldn&apos;t show up since the flag doesn&apos;t exist.</Typography>
        </FeatureFlagDemo>
      </Box>
    </Container>
  );
}