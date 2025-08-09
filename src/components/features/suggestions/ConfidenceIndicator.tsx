'use client';

import React from 'react';
import { Box, Tooltip, LinearProgress, Chip, Typography } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface ConfidenceIndicatorProps {
  confidence: number;
  reasoning?: string;
  conflicting?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  reasoning,
  conflicting = false,
  size = 'medium'
}) => {
  const getConfidenceColor = () => {
    // Use design system colors - more muted and sophisticated
    if (conflicting) return '#616161'; // Neutral gray instead of error red
    if (confidence >= 0.9) return '#059669'; // Sage green for high confidence (wisdom)
    if (confidence >= 0.7) return '#2196F3'; // Primary blue for good confidence  
    if (confidence >= 0.5) return '#9E9E9E'; // Secondary gray for medium confidence
    return '#616161'; // Neutral gray for low confidence
  };

  const getConfidenceLabel = () => {
    if (conflicting) return 'Conflicting';
    if (confidence >= 0.9) return 'Auto-apply';
    if (confidence >= 0.7) return 'Review recommended';
    if (confidence >= 0.5) return 'Manual review';
    return 'Low confidence';
  };

  const getProgressColor = () => {
    // Match the chip colors for consistency
    if (conflicting) return '#616161'; // Neutral gray
    if (confidence >= 0.9) return '#059669'; // Sage green
    if (confidence >= 0.7) return '#2196F3'; // Primary blue
    if (confidence >= 0.5) return '#9E9E9E'; // Secondary gray
    return '#616161'; // Neutral gray
  };

  const getSizeProps = () => {
    switch (size) {
      case 'small':
        return {
          chipSize: 'small' as const,
          progressHeight: 4,
          fontSize: '0.75rem'
        };
      case 'large':
        return {
          chipSize: 'medium' as const,
          progressHeight: 8,
          fontSize: '1rem'
        };
      default:
        return {
          chipSize: 'small' as const,
          progressHeight: 6,
          fontSize: '0.875rem'
        };
    }
  };

  const sizeProps = getSizeProps();
  const tooltipContent = (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
        Confidence: {Math.round(confidence * 100)}%
      </Typography>
      {reasoning && (
        <Typography variant="body2">
          {reasoning}
        </Typography>
      )}
      {conflicting && (
        <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>
          ⚠️ This suggestion conflicts with existing data
        </Typography>
      )}
    </Box>
  );

  return (
    <Tooltip title={tooltipContent} arrow placement="top">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LinearProgress
            variant="determinate"
            value={confidence * 100}
            sx={{
              flexGrow: 1,
              height: sizeProps.progressHeight,
              borderRadius: 1,
              backgroundColor: '#E0E0E0', // Design system neutral border color
              '& .MuiLinearProgress-bar': {
                backgroundColor: getProgressColor()
              }
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontSize: sizeProps.fontSize,
              fontWeight: 500,
              minWidth: '35px',
              textAlign: 'right'
            }}
          >
            {Math.round(confidence * 100)}%
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip
            label={getConfidenceLabel()}
            size={sizeProps.chipSize}
            variant="outlined"
            sx={{
              fontSize: sizeProps.fontSize,
              fontWeight: 500,
              color: getConfidenceColor(),
              borderColor: getConfidenceColor(),
              backgroundColor: 'transparent',
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
          {conflicting && (
            <WarningIcon 
              sx={{ color: '#616161' }} // Design system neutral instead of error red
              fontSize={size === 'large' ? 'medium' : 'small'} 
            />
          )}
        </Box>
      </Box>
    </Tooltip>
  );
}; 