'use client';

import React from 'react';
import { Box, Paper, Typography, Chip, Alert } from '@mui/material';
import { useFeatureFlag } from '@/lib/hooks/useFeatureFlag';
import { FEATURE_FLAGS } from '@/lib/features/featureFlags';

/**
 * Example component demonstrating how to use feature flags
 * This component shows different UI based on feature flag status
 */
export function FeatureFlagExample(): React.JSX.Element {
  const { enabled: newDashboardUI, loading: loadingDashboard } = useFeatureFlag(FEATURE_FLAGS.NEW_DASHBOARD_UI);
  const { enabled: advancedAnalytics, loading: loadingAnalytics } = useFeatureFlag(FEATURE_FLAGS.ADVANCED_ANALYTICS);
  const { enabled: betaFeatures, loading: loadingBeta } = useFeatureFlag(FEATURE_FLAGS.BETA_FEATURES);
  const { enabled: debugMode, loading: loadingDebug } = useFeatureFlag(FEATURE_FLAGS.DEBUG_MODE);

  // Show loading state while any flags are loading
  if (loadingDashboard || loadingAnalytics || loadingBeta || loadingDebug) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading feature flags...</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" gutterBottom>
        Feature Flag Demonstration
      </Typography>
      
      {/* New Dashboard UI Feature */}
      {newDashboardUI ? (
        <Alert severity="info">
          🎨 New Dashboard UI is enabled! You&apos;re seeing the redesigned interface.
        </Alert>
      ) : (
        <Paper sx={{ p: 2, border: '1px dashed', borderColor: 'grey.300' }}>
          <Typography variant="body2" color="text.secondary">
            Classic dashboard UI (new_dashboard_ui flag is disabled)
          </Typography>
        </Paper>
      )}

      {/* Advanced Analytics Feature */}
      {advancedAnalytics && (
        <Paper sx={{ p: 2, backgroundColor: 'primary.50' }}>
          <Typography variant="subtitle2" color="primary">
            📊 Advanced Analytics Available
          </Typography>
          <Typography variant="body2">
            You have access to advanced analytics features including custom reports and deep insights.
          </Typography>
        </Paper>
      )}

      {/* Beta Features */}
      {betaFeatures && (
        <Alert severity="warning">
          🚀 Beta Features Enabled: You&apos;re part of our beta testing program!
        </Alert>
      )}

      {/* Debug Mode */}
      {debugMode && (
        <Alert severity="error">
          🐛 Debug Mode Active: Additional logging and debug information is enabled.
        </Alert>
      )}

      {/* Feature Flag Status Summary */}
      <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom>
          Current Feature Flag Status:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={`New Dashboard: ${newDashboardUI ? 'ON' : 'OFF'}`}
            color={newDashboardUI ? 'success' : 'default'}
            size="small"
          />
          <Chip 
            label={`Advanced Analytics: ${advancedAnalytics ? 'ON' : 'OFF'}`}
            color={advancedAnalytics ? 'success' : 'default'}
            size="small"
          />
          <Chip 
            label={`Beta Features: ${betaFeatures ? 'ON' : 'OFF'}`}
            color={betaFeatures ? 'warning' : 'default'}
            size="small"
          />
          <Chip 
            label={`Debug Mode: ${debugMode ? 'ON' : 'OFF'}`}
            color={debugMode ? 'error' : 'default'}
            size="small"
          />
        </Box>
      </Paper>
    </Box>
  );
}

/**
 * Server-side example showing how to use feature flags in server components
 * This would be used in a server component or API route
 */
export async function ServerSideFeatureFlagExample() {
  // This is commented out as it would only work in a server component
  /*
  import { isFeatureEnabledForCurrentUser } from '@/lib/features/featureFlags';
  
  const hasNewDashboard = await isFeatureEnabledForCurrentUser('new_dashboard_ui');
  const hasAdvancedAnalytics = await isFeatureEnabledForCurrentUser('advanced_analytics');
  
  return (
    <div>
      {hasNewDashboard && <NewDashboardComponent />}
      {hasAdvancedAnalytics && <AdvancedAnalyticsComponent />}
    </div>
  );
  */
  
  return null;
}