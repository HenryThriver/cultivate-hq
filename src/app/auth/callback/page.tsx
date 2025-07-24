'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert, Container } from '@mui/material';
import { supabase } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

/**
 * Store Gmail and Calendar tokens from Google OAuth session
 * OPTIMIZED: Parallel upsert operations for improved performance
 */
async function storeGoogleIntegrationTokens(session: Session): Promise<void> {
  if (!session.provider_token || !session.provider_refresh_token) {
    console.log('No Google tokens in session to store');
    return;
  }

  // Prepare shared token data to avoid duplication
  const tokenData = {
    user_id: session.user.id,
    access_token: session.provider_token,
    refresh_token: session.provider_refresh_token,
    token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour from now
    updated_at: new Date().toISOString()
  };

  try {
    // OPTIMIZATION: Run both upserts in parallel instead of sequential
    const [gmailResult, calendarResult] = await Promise.all([
      supabase
        .from('user_integrations')
        .upsert({
          ...tokenData,
          integration_type: 'gmail'
        }, {
          onConflict: 'user_id,integration_type'
        }),
      
      supabase
        .from('user_integrations')
        .upsert({
          ...tokenData,
          integration_type: 'google_calendar'
        }, {
          onConflict: 'user_id,integration_type'
        })
    ]);

    // Handle results
    if (gmailResult.error) {
      console.error('Error storing Gmail integration tokens:', gmailResult.error);
    } else {
      console.log('Successfully stored Gmail integration tokens');
    }

    if (calendarResult.error) {
      console.error('Error storing Calendar integration tokens:', calendarResult.error);
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
 * 
 * WORKFLOW CONTEXT: Payment-Before-Auth Design
 * 1. Stripe webhook creates user record with randomUUID() + customer email
 * 2. Payment completes, user redirected to success page  
 * 3. User authenticates with Google OAuth (creates Supabase auth user)
 * 4. This function links the payment user record to the authenticated user
 * 
 * SECURITY: This is intentional - subscription data is preserved and properly
 * transferred to the authenticated user account for data integrity
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
      
      // OPTIMIZATION: Parallelize data transfer operations for better performance
      // Critical: subscription transfer must succeed
      // Non-critical: contacts transfer and cleanup can fail without breaking auth
      const [subscriptionResult, contactsResult, artifactsResult] = await Promise.allSettled([
        supabase
          .from('subscriptions')
          .update({ user_id: authUser.id })
          .eq('user_id', existingUser.id),
          
        supabase
          .from('contacts')
          .update({ user_id: authUser.id })
          .eq('user_id', existingUser.id),
          
        supabase
          .from('artifacts')
          .update({ user_id: authUser.id })
          .eq('user_id', existingUser.id)
      ]);
      
      // Handle critical subscription transfer
      if (subscriptionResult.status === 'rejected' || 
          (subscriptionResult.status === 'fulfilled' && subscriptionResult.value.error)) {
        const error = subscriptionResult.status === 'rejected' 
          ? subscriptionResult.reason 
          : subscriptionResult.value.error;
        console.error('Error transferring subscription:', error);
        throw new Error('Failed to transfer subscription');
      }
      
      // Log non-critical transfer errors
      if (contactsResult.status === 'rejected' || 
          (contactsResult.status === 'fulfilled' && contactsResult.value.error)) {
        const error = contactsResult.status === 'rejected' 
          ? contactsResult.reason 
          : contactsResult.value.error;
        console.error('Error transferring contacts:', error);
      }
      
      if (artifactsResult.status === 'rejected' || 
          (artifactsResult.status === 'fulfilled' && artifactsResult.value.error)) {
        const error = artifactsResult.status === 'rejected' 
          ? artifactsResult.reason 
          : artifactsResult.value.error;
        console.error('Error transferring artifacts:', error);
      }
      
      // OPTIMIZATION: Clean up old user record asynchronously (non-blocking)
      // This operation can fail without affecting the auth flow
      supabase
        .from('users')
        .delete()
        .eq('id', existingUser.id)
        .then(({ error: deleteError }) => {
          if (deleteError) {
            console.error('Error removing old user record:', deleteError);
          } else {
            console.log('Successfully cleaned up old user record');
          }
        });
      
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
          // OPTIMIZATION: Run user linking and token storage in parallel
          // These are independent operations that can be performed simultaneously
          const [linkingResult, tokenResult] = await Promise.allSettled([
            handleUserRecordLinking(data.session.user),
            storeGoogleIntegrationTokens(data.session)
          ]);
          
          // Handle user linking result
          if (linkingResult.status === 'rejected') {
            console.error('Error linking user records:', linkingResult.reason);
            // Continue with auth flow even if linking fails, but store error for user notification
            localStorage.setItem('userLinkingError', 'There was an issue linking your subscription. Please contact support if you experience any issues.');
          }
          
          // Handle token storage result
          if (tokenResult.status === 'rejected') {
            console.error('Error storing Google integration tokens:', tokenResult.reason);
            // Continue with auth flow even if token storage fails, but store error for user notification
            localStorage.setItem('integrationTokenError', 'Gmail and Calendar connections may not be fully set up. You can reconnect in settings.');
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
          
          // Check if user needs onboarding
          try {
            // Fetch user profile to check onboarding status
            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('onboarding_completed_at')
              .eq('id', data.session.user.id)
              .single();
            
            if (profileError) {
              console.error('Error checking user profile:', profileError);
              // If we can't check, default to dashboard
              router.push('/dashboard');
              return;
            }
            
            // Check if onboarding is completed
            if (!userProfile?.onboarding_completed_at) {
              // User needs onboarding - check if they have existing progress
              await supabase
                .from('onboarding_state')
                .select('current_screen')
                .eq('user_id', data.session.user.id)
                .single();
              
              // Redirect to onboarding (will handle screen progression internally)
              router.push('/onboarding');
            } else {
              // Onboarding complete, redirect to dashboard
              router.push('/dashboard');
            }
          } catch (error) {
            console.error('Error checking onboarding status:', error);
            // Default to dashboard on error
            router.push('/dashboard');
          }
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