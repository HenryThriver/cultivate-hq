import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/success?error=oauth_denied`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/success?error=invalid_callback`);
    }

    const [userId, source] = state.split('|');
    if (!userId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/success?error=invalid_state`);
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/google/combined-callback`
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    const supabase = await createClient();

    // Calculate token expiry
    const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600000); // 1 hour default

    // Store Gmail integration
    const { error: gmailError } = await supabase
      .from('user_integrations')
      .upsert({
        user_id: userId,
        integration_type: 'gmail',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expires_at: expiresAt.toISOString(),
        scopes: [
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/gmail.modify',
          'https://www.googleapis.com/auth/userinfo.email'
        ],
        integration_data: {
          connected_at: new Date().toISOString(),
          source: source
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,integration_type'
      });

    if (gmailError) {
      console.error('Error storing Gmail tokens:', gmailError);
    }

    // Store Calendar integration  
    const { error: calendarError } = await supabase
      .from('user_integrations')
      .upsert({
        user_id: userId,
        integration_type: 'google_calendar',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expires_at: expiresAt.toISOString(),
        scopes: [
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile'
        ],
        integration_data: {
          connected_at: new Date().toISOString(),
          source: source
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,integration_type'
      });

    if (calendarError) {
      console.error('Error storing Calendar tokens:', calendarError);
    }

    // Redirect based on source
    const redirectUrl = source === 'success' 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/success?connected=gmail_calendar`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?connected=gmail_calendar`;

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Error in combined OAuth callback:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/success?error=callback_error`);
  }
}