import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const redirectUri = searchParams.get('redirect_uri') || `${request.nextUrl.origin}/api/gmail/callback`;
    const source = searchParams.get('source') || 'dashboard'; // 'onboarding' or 'dashboard'

    // Lazy load the service to avoid build-time issues
    const { gmailService } = await import('@/lib/services/gmailService');
    const authUrl = gmailService.getAuthUrl(redirectUri, source);

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Gmail auth error:', error);
    
    // Handle missing environment variables gracefully
    if (error instanceof Error && error.message.includes('environment variables')) {
      return NextResponse.json(
        { error: 'Gmail integration not configured' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate Gmail auth URL' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { redirect_uri } = body;

    if (!redirect_uri) {
      return NextResponse.json(
        { error: 'redirect_uri is required' },
        { status: 400 }
      );
    }

    // Lazy load the service to avoid build-time issues
    const { gmailService } = await import('@/lib/services/gmailService');
    const authUrl = gmailService.getAuthUrl(redirect_uri);

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Gmail auth error:', error);
    
    // Handle missing environment variables gracefully
    if (error instanceof Error && error.message.includes('environment variables')) {
      return NextResponse.json(
        { error: 'Gmail integration not configured' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate Gmail auth URL' },
      { status: 500 }
    );
  }
} 