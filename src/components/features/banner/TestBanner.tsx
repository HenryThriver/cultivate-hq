'use client';

import React from 'react';
import { Alert, Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useFeatureFlag } from '@/lib/hooks/useFeatureFlag';
import { useSearchParams } from 'next/navigation';

interface TestBannerProps {
  onDismiss?: () => void;
}

export const TestBanner: React.FC<TestBannerProps> = ({ onDismiss }) => {
  const { enabled: flagEnabled } = useFeatureFlag('banner');
  const searchParams = useSearchParams();
  const bannerQueryParam = searchParams?.get('banner') === '1';
  
  // Show banner if either the feature flag is enabled OR banner=1 query param is present
  const shouldShowBanner = flagEnabled || bannerQueryParam;

  if (!shouldShowBanner) {
    return null;
  }

  return (
    <Alert 
      severity="info" 
      sx={{ 
        mb: 2,
        bgcolor: 'warning.light',
        color: 'warning.dark',
        '& .MuiAlert-icon': {
          color: 'warning.dark'
        }
      }}
      action={
        onDismiss && (
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onDismiss}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        )
      }
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" fontWeight="bold">
          🧪 This is a test environment
        </Typography>
        {bannerQueryParam && (
          <Typography variant="caption" sx={{ 
            px: 1, 
            py: 0.5, 
            bgcolor: 'rgba(0,0,0,0.1)', 
            borderRadius: 1,
            fontSize: '0.7rem'
          }}>
            ?banner=1
          </Typography>
        )}
        {flagEnabled && (
          <Typography variant="caption" sx={{ 
            px: 1, 
            py: 0.5, 
            bgcolor: 'rgba(0,0,0,0.1)', 
            borderRadius: 1,
            fontSize: '0.7rem'
          }}>
            feature flag
          </Typography>
        )}
      </Box>
    </Alert>
  );
};