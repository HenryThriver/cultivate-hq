'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert, Container } from '@mui/material';
import { supabase } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

/**
 * Store Gmail and Calendar tokens from Google OAuth session
 */
async function storeGoogleIntegrationTokens(session: Session): Promise<void> {
  if (!session.provider_token || !session.provider_refresh_token) {
    console.log('No Google tokens in session to store');
    return;
  }

  try {
    const { error } = await supabase
      .from('user_integrations')
      .upsert({
        user_id: session.user.id,
        integration_type: 'gmail',
        access_token: session.provider_token,
        refresh_token: session.provider_refresh_token,
        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour from now
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,integration_type'
      });

    if (error) {
      console.error('Error storing Gmail integration tokens:', error);
    } else {
      console.log('Successfully stored Gmail integration tokens');
    }

    // Also store for calendar (same tokens work for both)
    const { error: calendarError } = await supabase
      .from('user_integrations')
      .upsert({
        user_id: session.user.id,
        integration_type: 'google_calendar',
        access_token: session.provider_token,
        refresh_token: session.provider_refresh_token,
        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,integration_type'
      });

    if (calendarError) {
      console.error('Error storing Calendar integration tokens:', calendarError);
    } else {
      console.log('Successfully stored Calendar integration tokens');
    }
  } catch (error) {
    console.error('Error in storeGoogleIntegrationTokens:', error);
  }
}

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
    
    try {
      // Use upsert to safely create/update the auth user record first
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || authUser.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        
      if (upsertError) {
        console.error('Error creating auth user record:', upsertError);
        throw new Error('Failed to create auth user record');
      }
      
      // Transfer subscription from existing user record to auth user
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .update({ user_id: authUser.id })
        .eq('user_id', existingUser.id);
        
      if (subscriptionError) {
        console.error('Error transferring subscription:', subscriptionError);
        throw new Error('Failed to transfer subscription');
      }
      
      // Transfer other user data if needed (contacts, artifacts, etc.)
      const { error: contactsError } = await supabase
        .from('contacts')
        .update({ user_id: authUser.id })
        .eq('user_id', existingUser.id);
        
      if (contactsError) {
        console.error('Error transferring contacts:', contactsError);
        // Don't throw here - contacts transfer is less critical
      }
      
      // Remove the old user record only after successful transfers
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', existingUser.id);
        
      if (deleteError) {
        console.error('Error removing old user record:', deleteError);
        // Don't throw here - old record cleanup is less critical
      }
      
      console.log('Successfully linked user records and transferred subscription');
    } catch (error) {
      console.error('Critical error in user record linking:', error);
      // Re-throw to be handled by caller
      throw error;
    }
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

          // Store Gmail and Calendar tokens if present
          try {
            await storeGoogleIntegrationTokens(data.session);
          } catch (tokenError) {
            console.error('Error storing Google integration tokens:', tokenError);
            // Continue with auth flow even if token storage fails
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