'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '@/lib/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!loading) {
        if (!user) {
          // Not authenticated, redirect to login
          router.push('/auth/login');
          return;
        }
        
        // User is authenticated, check onboarding status
        // Only check if we're not already on the onboarding page
        if (!pathname.startsWith('/onboarding')) {
          try {
            const { data: userProfile, error } = await supabase
              .from('users')
              .select('onboarding_completed_at')
              .eq('id', user.id)
              .single();
            
            if (!error && !userProfile?.onboarding_completed_at) {
              // User hasn't completed onboarding, redirect to onboarding
              router.push('/onboarding');
              return;
            }
          } catch (error) {
            console.error('Error checking onboarding status:', error);
          }
        }
        
        setCheckingOnboarding(false);
      }
    };
    
    checkAccess();
  }, [user, loading, router, pathname]);

  if (loading || checkingOnboarding) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          {loading ? 'Loading...' : 'Checking access...'}
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Redirecting to login...
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}; 