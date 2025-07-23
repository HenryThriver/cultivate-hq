'use client';

import { Box, Container, Typography } from '@mui/material';
import Link from 'next/link';

export const Footer = (): React.JSX.Element => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 3,
        px: 2,
        backgroundColor: 'grey.50',
        borderTop: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Cultivate HQ. All rights reserved.
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Link href="/terms" style={{ textDecoration: 'none' }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  '&:hover': {
                    textDecoration: 'underline',
                    color: 'primary.main',
                  },
                }}
              >
                Terms of Service
              </Typography>
            </Link>
            
            <Typography variant="body2" color="text.secondary">
              •
            </Typography>
            
            <Link href="/privacy" style={{ textDecoration: 'none' }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  '&:hover': {
                    textDecoration: 'underline',
                    color: 'primary.main',
                  },
                }}
              >
                Privacy Policy
              </Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};