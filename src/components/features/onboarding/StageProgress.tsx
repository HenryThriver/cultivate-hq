'use client';

import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

interface StageProgressProps {
  currentScreen: number;
  completedScreens: number[];
  onNavigateToStage?: (stageScreenNumber: number) => void;
  onNavigateToScreen?: (screenNumber: number) => void;
  isNavigating?: boolean;
}

// Stage configuration mapping screens to stages
const STAGE_CONFIG = [
  {
    id: 'challenges',
    label: 'Challenges',
    screens: [2, 3, 4], // challenges, recognition, bridge (excluding welcome)
    number: 1
  },
  {
    id: 'goals', 
    label: 'Goals',
    screens: [5], // goals
    number: 2
  },
  {
    id: 'contacts',
    label: 'Contacts', 
    screens: [6, 7, 8], // contacts, contact_confirmation, context_discovery
    number: 3
  },
  {
    id: 'profile',
    label: 'Profile',
    screens: [9, 10, 11, 12], // linkedin, processing, profile, complete
    number: 4
  }
];

const getStageStatus = (stage: typeof STAGE_CONFIG[0], currentScreen: number, completedScreens: number[]) => {
  const isAnyScreenInStageCompleted = stage.screens.some(screen => completedScreens.includes(screen));
  const isCurrentStage = stage.screens.includes(currentScreen) || 
    (stage.id === 'challenges' && currentScreen === 1); // Welcome screen belongs to challenges
  const isAllScreensCompleted = stage.screens.every(screen => completedScreens.includes(screen));
  
  if (isAllScreensCompleted) return 'completed';
  if (isCurrentStage || isAnyScreenInStageCompleted) return 'active';
  return 'upcoming';
};

const isStageClickable = (stage: typeof STAGE_CONFIG[0], currentScreen: number, completedScreens: number[]) => {
  const status = getStageStatus(stage, currentScreen, completedScreens);
  // Stage is clickable if it's completed or partially completed (has some screens completed)
  return status === 'completed' || (status === 'active' && stage.screens.some(screen => completedScreens.includes(screen)));
};

export const StageProgress: React.FC<StageProgressProps> = ({ 
  currentScreen, 
  completedScreens,
  onNavigateToStage,
  onNavigateToScreen,
  isNavigating = false
}) => {
  const handleStageClick = (stage: typeof STAGE_CONFIG[0]) => {
    if (!onNavigateToStage || isNavigating) return;
    
    const clickable = isStageClickable(stage, currentScreen, completedScreens);
    if (!clickable) return;
    
    // Navigate to the first screen of the stage
    const firstScreen = stage.screens[0];
    onNavigateToStage(firstScreen);
  };

  const handlePipClick = (screenNumber: number) => {
    if (!onNavigateToScreen || isNavigating) return;
    
    // Only allow navigation to completed screens or screens that are accessible
    const isCompleted = completedScreens.includes(screenNumber);
    const isCurrent = screenNumber === currentScreen;
    const isAccessible = isCompleted || isCurrent || 
      (screenNumber <= Math.max(...completedScreens) + 1); // Can navigate to next screen after completed ones
    
    if (isAccessible) {
      onNavigateToScreen(screenNumber);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      justifyContent: 'center',
      px: 3,
      py: 1,
      width: '100%',
      maxWidth: '900px',
      mx: 'auto',
      overflow: 'visible'
    }}>
      {STAGE_CONFIG.map((stage, index) => {
        const status = getStageStatus(stage, currentScreen, completedScreens);
        const clickable = isStageClickable(stage, currentScreen, completedScreens);
        const isLast = index === STAGE_CONFIG.length - 1;
        
        const stageElement = (
          <Box 
            key={stage.id}
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: 1,
              cursor: clickable ? 'pointer' : 'default',
              opacity: isNavigating ? 0.6 : 1,
              transition: 'all 0.2s ease-in-out',
              '&:hover': clickable ? {
                transform: 'translateY(-2px)',
                '& .stage-label': {
                  color: status === 'active' ? '#1565C0' : status === 'completed' ? '#2E7D32' : '#616161'
                }
              } : {}
            }}
            onClick={() => handleStageClick(stage)}
          >
            {/* Stage Circle */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              minWidth: { xs: 60, sm: 70, md: 80 },
              position: 'relative'
            }}>
              {/* Main Circle */}
              <Box sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2
              }}>
                {status === 'completed' ? (
                  <Box sx={{
                    width: { xs: 30, sm: 33, md: 36 },
                    height: { xs: 30, sm: 33, md: 36 },
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      right: -2,
                      bottom: -2,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                      opacity: 0.2,
                      zIndex: -1
                    }
                  }}>
                    <CheckCircle 
                      sx={{ 
                        fontSize: { xs: 18, sm: 20, md: 21 },
                        color: 'white'
                      }} 
                    />
                  </Box>
                ) : (
                  <Box sx={{
                    width: { xs: 30, sm: 33, md: 36 },
                    height: { xs: 30, sm: 33, md: 36 },
                    borderRadius: '50%',
                    background: status === 'active' 
                      ? 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)' 
                      : '#FAFAFA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: status === 'active' ? 'white' : '#BDBDBD',
                    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                    fontWeight: 700,
                    boxShadow: status === 'active' 
                      ? '0 4px 20px rgba(33, 150, 243, 0.3)' 
                      : 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
                    border: status === 'upcoming' ? '2px solid #E8E8E8' : 'none',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&::before': status === 'active' ? {
                      content: '""',
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      right: -2,
                      bottom: -2,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                      opacity: 0.2,
                      zIndex: -1
                    } : {}
                  }}>
                    {stage.number}
                  </Box>
                )}
              </Box>
              
              {/* Stage Label */}
              <Typography 
                className="stage-label"
                variant="caption" 
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                  fontWeight: status === 'active' ? 700 : 600,
                  color: status === 'active' ? '#1976D2' : status === 'completed' ? '#2E7D32' : '#9E9E9E',
                  textAlign: 'center',
                  mt: 0.75,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  transition: 'color 0.2s ease',
                  lineHeight: 1
                }}
              >
                {stage.label}
              </Typography>
              
              {/* Sub-page Pips - Only show for current or completed stages */}
              {(status === 'active' || status === 'completed') && (
                <Box sx={{ 
                  display: 'flex', 
                  gap: 0.5,
                  mt: 0.5,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {stage.screens.map((screenNum) => {
                    const isCompleted = completedScreens.includes(screenNum);
                    const isCurrent = screenNum === currentScreen;
                    const isAccessible = isCompleted || isCurrent || 
                      (screenNum <= Math.max(...completedScreens) + 1);
                    
                    return (
                      <Tooltip 
                        key={screenNum} 
                        title={isAccessible ? `Go to screen ${screenNum}` : 'Not accessible yet'}
                        placement="bottom"
                      >
                        <Box
                          onClick={() => handlePipClick(screenNum)}
                          sx={{
                            width: isCurrent ? 8 : 6,
                            height: isCurrent ? 8 : 6,
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? '#4CAF50' : isCurrent ? '#2196F3' : '#D0D0D0',
                            transition: 'all 0.3s ease',
                            boxShadow: isCompleted 
                              ? '0 0 4px rgba(76, 175, 80, 0.4)' 
                              : isCurrent 
                              ? '0 0 4px rgba(33, 150, 243, 0.4)'
                              : 'none',
                            cursor: isAccessible ? 'pointer' : 'default',
                            opacity: isAccessible ? 1 : 0.5,
                            '&:hover': isAccessible ? {
                              transform: 'scale(1.2)',
                              boxShadow: isCompleted 
                                ? '0 0 6px rgba(76, 175, 80, 0.6)' 
                                : isCurrent
                                ? '0 0 6px rgba(33, 150, 243, 0.6)'
                                : '0 0 4px rgba(208, 208, 208, 0.6)'
                            } : {}
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        );
        
        return (
          <Box key={stage.id} sx={{ position: 'relative', display: 'flex', alignItems: 'flex-start' }}>
            {/* Stage Element */}
            {clickable ? (
              <Tooltip title={`Go to ${stage.label} section`} placement="top">
                {stageElement}
              </Tooltip>
            ) : (
              stageElement
            )}
            
            {/* Connection Line with Fade */}
            {!isLast && (
              <Box sx={{
                width: { xs: 35, sm: 55, md: 85 },
                height: 3,
                background: status === 'completed' 
                  ? 'linear-gradient(90deg, #4CAF50 0%, rgba(76, 175, 80, 0.6) 70%, rgba(76, 175, 80, 0.2) 100%)'
                  : 'linear-gradient(90deg, #D0D0D0 0%, rgba(224, 224, 224, 0.6) 50%, rgba(224, 224, 224, 0.2) 100%)',
                borderRadius: 1.5,
                zIndex: 0,
                transition: 'background 0.3s ease',
                ml: 4, // Left margin to separate from circle
                mr: 4, // Right margin before next circle
                mt: 2.25 // Offset to align with circle centers (approximately half of circle height + some spacing)
              }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}; 