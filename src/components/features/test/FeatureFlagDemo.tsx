'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Chip, Alert } from '@mui/material';
import { useFeatureFlag } from '@/lib/hooks/useFeatureFlag';

interface FeatureFlagDemoProps {
  flagName: string;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureFlagDemo: React.FC<FeatureFlagDemoProps> = ({ 
  flagName, 
  children, 
  fallback 
}) => {
  const { enabled, loading, error } = useFeatureFlag(flagName);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Loading feature flag: {flagName}...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading feature flag &quot;{flagName}&quot;: {error}
      </Alert>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Feature: {flagName}
          </Typography>
          <Chip
            label={enabled ? 'Enabled' : 'Disabled'}
            color={enabled ? 'success' : 'default'}
            size="small"
          />
        </Box>
        
        {enabled ? (
          children || (
            <Typography color="success.main">
              ✅ This feature is enabled for you!
            </Typography>
          )
        ) : (
          fallback || (
            <Typography color="text.secondary">
              ❌ This feature is not available yet.
            </Typography>
          )
        )}
      </CardContent>
    </Card>
  );
};