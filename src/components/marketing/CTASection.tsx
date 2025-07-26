import React from 'react';
import { Box, Container, Stack, Typography, Button, alpha } from '@mui/material';
import Link from 'next/link';
import { GradientText, gradients } from './GradientText';

interface CTASectionProps {
  title: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonHref: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  footnote?: string;
  variant?: 'default' | 'boxed';
}

export const CTASection: React.FC<CTASectionProps> = ({
  title,
  subtitle,
  primaryButtonText,
  primaryButtonHref,
  secondaryButtonText,
  secondaryButtonHref,
  footnote,
  variant = 'boxed'
}) => {
  const content = (
    <Stack spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
      <GradientText
        variant="h2"
        gradient={gradients.dark}
        sx={{
          fontSize: { xs: '2rem', md: '2.75rem' },
          fontWeight: 700,
          letterSpacing: '-0.03em'
        }}
      >
        {title}
      </GradientText>
      
      <Typography
        variant="body1"
        sx={{
          fontSize: '1.25rem',
          color: 'text.secondary',
          maxWidth: '600px',
          lineHeight: 1.5,
          fontStyle: 'italic',
          opacity: 0.9,
          textAlign: 'center'
        }}
      >
        {subtitle}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        <Button
          component={Link}
          href={primaryButtonHref}
          variant="contained"
          size="large"
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.125rem',
            fontWeight: 500,
            textTransform: 'none',
            minWidth: 200
          }}
        >
          {primaryButtonText}
        </Button>
        
        {secondaryButtonText && secondaryButtonHref && (
          <Button
            component={Link}
            href={secondaryButtonHref}
            variant="outlined"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.125rem',
              fontWeight: 500,
              textTransform: 'none',
              borderWidth: 1.5,
              '&:hover': {
                borderWidth: 1.5,
              }
            }}
          >
            {secondaryButtonText}
          </Button>
        )}
      </Stack>

      {footnote && (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.875rem'
          }}
        >
          {footnote}
        </Typography>
      )}
    </Stack>
  );

  if (variant === 'default') {
    return (
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          {content}
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Box 
          sx={{
            textAlign: 'center',
            p: { xs: 6, md: 8 },
            background: `
              linear-gradient(135deg, 
                ${alpha('#2196F3', 0.06)} 0%, 
                ${alpha('#7C3AED', 0.04)} 100%
              ),
              radial-gradient(circle at 50% 50%, ${alpha('#2196F3', 0.08)} 0%, transparent 70%)
            `,
            borderRadius: 4,
            border: '1px solid',
            borderColor: alpha('#2196F3', 0.15),
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.7) 100%)',
              pointerEvents: 'none'
            }
          }}
        >
          {content}
        </Box>
      </Container>
    </Box>
  );
};