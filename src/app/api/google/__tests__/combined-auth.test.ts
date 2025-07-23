import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../combined-auth/route';

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}));

vi.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: vi.fn().mockImplementation(() => ({
        generateAuthUrl: vi.fn(() => 'https://accounts.google.com/oauth/authorize?test=123'),
      })),
    },
  },
}));

// Mock environment variables
const mockEnv = {
  GOOGLE_CLIENT_ID: 'test-client-id',
  GOOGLE_CLIENT_SECRET: 'test-client-secret',
  SITE_URL: 'http://localhost:3000',
};

describe('/api/google/combined-auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(process.env, mockEnv);
  });

  it('should return 401 when user is not authenticated and no user_id provided', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated'),
        }),
      },
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const request = new NextRequest('http://localhost:3000/api/google/combined-auth');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('User not authenticated. Please try again.');
  });

  it('should return 500 when OAuth credentials are not configured', async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;

    const { createClient } = await import('@/lib/supabase/server');
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const request = new NextRequest('http://localhost:3000/api/google/combined-auth');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Google OAuth credentials not configured');
    expect(data.details).toBeUndefined(); // Security: details should not be exposed
  });

  it('should generate auth URL successfully for authenticated user', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const request = new NextRequest('http://localhost:3000/api/google/combined-auth');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.authUrl).toBe('https://accounts.google.com/oauth/authorize?test=123');
  });

  it('should use user_id from query params when provided', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const mockSupabase = {
      auth: {
        getUser: vi.fn(), // Should not be called when user_id is provided
      },
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const request = new NextRequest('http://localhost:3000/api/google/combined-auth?user_id=custom-user-id');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.authUrl).toBe('https://accounts.google.com/oauth/authorize?test=123');
    expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
  });

  it('should handle OAuth client creation errors gracefully', async () => {
    const { google } = await import('googleapis');
    vi.mocked(google.auth.OAuth2).mockImplementation(() => {
      throw new Error('OAuth client creation failed');
    });

    const { createClient } = await import('@/lib/supabase/server');
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const request = new NextRequest('http://localhost:3000/api/google/combined-auth');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to generate auth URL');
  });
});