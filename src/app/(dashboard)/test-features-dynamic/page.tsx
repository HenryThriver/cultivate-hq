'use client';

import React from 'react';
import { Box, Container, Typography, Card, CardContent, Chip, Alert, CircularProgress } from '@mui/material';
import { useAllFeatureFlags } from '@/lib/hooks/useFeatureFlag';
import { FeatureFlagDemo } from '@/components/features/test/FeatureFlagDemo';

export default function DynamicTestFeaturesPage() {
  const { flags, loading, error } = useAllFeatureFlags();

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">Error loading feature flags: {error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dynamic Feature Flag Demo
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          This page shows ALL feature flags you&apos;ve created in the admin panel and their current state.
        </Typography>

        {flags.length === 0 ? (
          <Alert severity="info">
            No feature flags created yet. Go to the Admin panel to create some flags first.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {flags.map((flag) => (
              <Card key={flag.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">
                        {flag.name}
                      </Typography>
                      {flag.description && (
                        <Typography variant="body2" color="text.secondary">
                          {flag.description}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={flag.enabled_globally ? 'Globally Enabled' : 'Globally Disabled'}
                        color={flag.enabled_globally ? 'success' : 'default'}
                        size="small"
                      />
                      {flag.has_override && (
                        <Chip
                          label={`Override: ${flag.user_enabled ? 'Enabled' : 'Disabled'}`}
                          color={flag.user_enabled ? 'primary' : 'secondary'}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Component Demo:
                    </Typography>
                    <FeatureFlagDemo flagName={flag.name}>
                      <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                        <Typography variant="h6" color="success.dark">
                          ✨ {flag.name} is Active!
                        </Typography>
                        <Typography color="success.dark">
                          {flag.description || 'This feature is currently enabled for you.'}
                        </Typography>
                      </Box>
                    </FeatureFlagDemo>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}