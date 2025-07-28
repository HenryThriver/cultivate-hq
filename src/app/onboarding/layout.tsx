'use client';

import React from 'react';
import { Box, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useOnboardingState } from '@/lib/hooks/useOnboardingState';
import { StageProgress } from '@/components/features/onboarding/StageProgress';
// import { ScreenNavigator } from '@/components/features/onboarding/ScreenNavigator';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const { 
    currentScreen, 
    previousScreen, 
    navigateToScreen,
    isNavigating,
    state
  } = useOnboardingState();

  const handleBack = async () => {
    if (currentScreen > 1) {
      await previousScreen();
    }
  };

  const handleNavigateToStage = async (stageScreenNumber: number) => {
    try {
      await navigateToScreen(stageScreenNumber);
    } catch (error) {
      console.error('Failed to navigate to stage:', error);
    }
  };


  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Header/Status Bar Section - Fixed Height */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.95))',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: 'rgba(0, 0, 0, 0.08)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        py: 3,
        height: 110, // Extra height for pip breathing room
        flexShrink: 0 // Prevent shrinking
      }}>
        {/* Back button - users can navigate backwards through onboarding */}
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          transform: 'translateY(-50%)',
          left: 24, 
          zIndex: 1001 
        }}>
          <IconButton 
            onClick={handleBack}
            disabled={currentScreen <= 1 || isNavigating}
            size="medium"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              },
              '&:disabled': {
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                boxShadow: 'none',
              }
            }}
          >
            <ArrowBack sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
        
        {/* Close button removed - onboarding is mandatory and cannot be skipped */}

        {/* Navigation Controls - centered */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          pt: 1.5, // More top padding for breathing room
          pb: 1 // Bottom padding for pips
        }}>
          {/* Stage Progress */}
          <StageProgress 
            currentScreen={currentScreen}
            completedScreens={state?.completed_screens || []}
            onNavigateToStage={handleNavigateToStage}
            onNavigateToScreen={navigateToScreen}
            isNavigating={isNavigating}
          />
          
          {/* Screen Navigator - Hidden for now */}
          {/* <ScreenNavigator
            currentScreen={currentScreen}
            completedScreens={state?.completed_screens || []}
            onNavigateToScreen={handleNavigateToScreen}
            canNavigateToScreen={canNavigateToScreen}
            isNavigating={isNavigating}
          /> */}
        </Box>
      </Box>

      {/* Main Content Area - Consistent spacing below header */}
      <Box sx={{ 
        flex: 1, // Take remaining space
        pt: 6, // Consistent padding below header
        position: 'relative',
        minHeight: 0 // Allow flex shrinking
      }}>
        {children}
      </Box>
    </Box>
  );
} 