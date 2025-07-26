'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  Button,
  Stack,
} from '@mui/material';

interface MarketingNavigationProps {
  transparent?: boolean;
}

export const MarketingNavigation = ({ transparent = false }: MarketingNavigationProps) => {
  const pathname = usePathname();

  const navigationItems = [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
  ];

  const isActivePage = (href: string) => pathname === href;

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: transparent ? 'transparent' : 'white',
        borderBottom: '1px solid',
        borderColor: 'grey.200'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 1 }}>
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'text.primary',
              fontWeight: 600,
              letterSpacing: '-0.02em'
            }}
          >
            Cultivate HQ
          </Typography>

          <Stack direction="row" spacing={3} alignItems="center">
            {navigationItems.map((item) => (
              <Typography
                key={item.href}
                component={Link}
                href={item.href}
                variant="body1"
                sx={{
                  textDecoration: 'none',
                  color: isActivePage(item.href) ? 'primary.main' : 'text.secondary',
                  fontWeight: isActivePage(item.href) ? 600 : 500,
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
              >
                {item.label}
              </Typography>
            ))}

            <Button
              component={Link}
              href="/login"
              variant="outlined"
              size="medium"
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                borderWidth: 1.5,
                '&:hover': {
                  borderWidth: 1.5,
                }
              }}
            >
              Sign In
            </Button>

            <Button
              component={Link}
              href="/pricing"
              variant="contained"
              size="medium"
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                px: 3
              }}
            >
              Get Started
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};