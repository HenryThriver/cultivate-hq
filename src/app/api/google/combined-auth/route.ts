import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source') || 'success';

    // Get user ID from query params or session
    const userIdParam = searchParams.get('user_id');
    let userId = userIdParam;
    
    // If no user ID provided, try to get from session
    if (!userId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json({ error: 'User not authenticated. Please try again.' }, { status: 401 });
      }
      userId = user.id;
    }


    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json({ 
        error: 'Google OAuth credentials not configured'
      }, { status: 500 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL}/api/google/combined-callback`
    );

    // Combined scopes for Gmail and Calendar
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      // Remove prompt: 'consent' to allow returning users to sign in without re-authorization
      // access_type: 'offline' is sufficient to get refresh tokens
      state: `${userId}|${source}`,
    });

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating combined auth URL:', error);
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 });
  }
}