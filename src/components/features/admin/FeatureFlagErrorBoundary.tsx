'use client';

import React, { Component, ReactNode } from 'react';
import { Alert, AlertTitle, Box, Button, Typography } from '@mui/material';
import { Refresh as RefreshIcon, AdminPanelSettings as AdminIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error boundary specifically for feature flag admin components
 * Provides graceful error handling with retry functionality
 */
export class FeatureFlagErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('FeatureFlagErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      errorInfo
    });
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isNetworkError = this.state.error?.message.includes('fetch') || 
                           this.state.error?.message.includes('network') ||
                           this.state.error?.message.includes('Failed to load');

      const isPermissionError = this.state.error?.message.includes('permission') ||
                              this.state.error?.message.includes('unauthorized') ||
                              this.state.error?.message.includes('forbidden');

      return (
        <Box sx={{ p: 3 }}>
          <Alert 
            severity="error" 
            variant="outlined"
            sx={{ mb: 2 }}
            icon={<AdminIcon />}
          >
            <AlertTitle>
              {isNetworkError ? 'Connection Error' : 
               isPermissionError ? 'Permission Error' : 
               'Feature Flag System Error'}
            </AlertTitle>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {isNetworkError && 
                'Unable to connect to the server. Please check your internet connection and try again.'
              }
              {isPermissionError && 
                'You do not have permission to access this feature. Please contact an administrator.'
              }
              {!isNetworkError && !isPermissionError && (
                <>
                  Something went wrong with the feature flag system. 
                  {this.state.error?.message && (
                    <>
                      <br />
                      <strong>Error:</strong> {this.state.error.message}
                    </>
                  )}
                </>
              )}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={this.handleRetry}
                startIcon={<RefreshIcon />}
              >
                Try Again
              </Button>
              
              <Button
                variant="contained"
                size="small"
                onClick={this.handleReload}
                color="primary"
              >
                Reload Page
              </Button>
            </Box>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
                  <strong>Component Stack:</strong>
                  <pre style={{ fontSize: '0.75rem', margin: '4px 0' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </Typography>
              </Box>
            )}
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary wrapper for functional components
 */
export const withFeatureFlagErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    onRetry?: () => void;
  }
) => {
  const WrappedComponent = (props: P) => (
    <FeatureFlagErrorBoundary 
      fallback={options?.fallback}
      onRetry={options?.onRetry}
    >
      <Component {...props} />
    </FeatureFlagErrorBoundary>
  );

  WrappedComponent.displayName = `withFeatureFlagErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};