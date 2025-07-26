import React from 'react';
import { Box, Container, BoxProps, alpha } from '@mui/material';

interface HeroSectionProps extends Omit<BoxProps, 'borderBottom'> {
  children: React.ReactNode;
  variant?: 'primary' | 'subtle' | 'gradient';
  borderBottom?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  children,
  variant = 'primary',
  borderBottom = true,
  sx,
  ...props
}) => {
  const backgrounds = {
    primary: `
      linear-gradient(135deg, 
        ${alpha('#2196F3', 0.04)} 0%, 
        ${alpha('#7C3AED', 0.03)} 50%, 
        ${alpha('#059669', 0.02)} 100%
      ),
      radial-gradient(circle at 20% 50%, ${alpha('#2196F3', 0.06)} 0%, transparent 50%)
    `,
    subtle: `
      linear-gradient(135deg, 
        ${alpha('#F5F5F5', 0.8)} 0%, 
        ${alpha('#FAFAFA', 0.9)} 100%
      ),
      radial-gradient(circle at 70% 30%, ${alpha('#2196F3', 0.03)} 0%, transparent 50%)
    `,
    gradient: `
      linear-gradient(135deg, 
        ${alpha('#2196F3', 0.06)} 0%, 
        ${alpha('#7C3AED', 0.04)} 100%
      ),
      radial-gradient(circle at 50% 50%, ${alpha('#2196F3', 0.08)} 0%, transparent 70%)
    `
  };

  return (
    <Box
      {...props}
      sx={{
        py: { xs: 10, md: 16 },
        background: backgrounds[variant],
        ...(borderBottom && {
          borderBottom: '1px solid',
          borderColor: 'grey.200',
        }),
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.8) 100%)',
          pointerEvents: 'none'
        },
        ...sx
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Container>
    </Box>
  );
};