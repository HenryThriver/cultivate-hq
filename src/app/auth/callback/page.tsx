'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert, Container } from '@mui/material';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

/**
 * Handle linking of user records when Google OAuth creates new auth user
 * but subscription exists for the same email
 */
async function handleUserRecordLinking(authUser: User): Promise<void> {
  if (!authUser.email) return;
  
  // Check if there's an existing user record with this email but different ID
  // (created by Stripe webhook before Google OAuth)
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', authUser.email)
    .neq('id', authUser.id)
    .single();
    
  if (existingUser) {
    console.log('Found existing user record for email, linking subscription...');
    
    // Transfer subscription from existing user record to auth user
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .update({ user_id: authUser.id })
      .eq('user_id', existingUser.id);
      
    if (subscriptionError) {
      console.error('Error transferring subscription:', subscriptionError);
    }
    
    // Transfer other user data if needed (contacts, artifacts, etc.)
    const { error: contactsError } = await supabase
      .from('contacts')
      .update({ user_id: authUser.id })
      .eq('user_id', existingUser.id);
      
    if (contactsError) {
      console.error('Error transferring contacts:', contactsError);
    }
    
    // Remove the old user record (now that everything is transferred)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', existingUser.id);
      
    if (deleteError) {
      console.error('Error removing old user record:', deleteError);
    }
    
    console.log('Successfully linked user records and transferred subscription');
  }
}

export default function AuthCallbackPage(): React.JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async (): Promise<void> => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          return;
        }

        if (data.session) {
          // Handle user record linking for subscription association
          try {
            await handleUserRecordLinking(data.session.user);
          } catch (linkError) {
            console.error('Error linking user records:', linkError);
            // Continue with auth flow even if linking fails
          }
          
          // Check for post-auth redirect
          try {
            const redirectUrl = localStorage.getItem('postAuthRedirect');
            if (redirectUrl) {
              localStorage.removeItem('postAuthRedirect');
              router.push(redirectUrl);
              return;
            }
          } catch (error) {
            console.error('Error checking post-auth redirect:', error);
          }
          
          // Successfully authenticated, redirect to dashboard
          router.push('/dashboard');
        } else {
          // No session found, redirect to login
          router.push('/auth/login');
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setError('An unexpected error occurred during authentication.');
      }
    };

    handleAuthCallback();
  }, [router]);

  if (error) {
    return (
      <Container maxWidth="sm">
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
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Please try signing in again.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
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
          Completing authentication...
        </Typography>
      </Box>
    </Container>
  );
} 