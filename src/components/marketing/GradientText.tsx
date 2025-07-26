import React from 'react';
import { Typography, TypographyProps } from '@mui/material';

interface GradientTextProps extends TypographyProps {
  gradient?: string;
  underline?: boolean;
  underlineOpacity?: number;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  gradient = 'linear-gradient(135deg, #2196F3 0%, #7C3AED 100%)',
  underline = false,
  underlineOpacity = 0.3,
  sx,
  ...props
}) => {
  return (
    <Typography
      {...props}
      sx={{
        background: gradient,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        position: 'relative',
        ...(underline && {
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-8px',
            left: 0,
            right: 0,
            height: '4px',
            background: gradient,
            borderRadius: '2px',
            opacity: underlineOpacity
          }
        }),
        ...sx
      }}
    >
      {children}
    </Typography>
  );
};

// Preset gradients for consistency
export const gradients = {
  primary: 'linear-gradient(135deg, #2196F3 0%, #7C3AED 100%)',
  dark: 'linear-gradient(135deg, #212121 0%, #616161 100%)',
  sage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  amber: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  plum: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'
};