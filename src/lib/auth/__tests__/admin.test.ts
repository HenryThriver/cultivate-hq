import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkIsAdmin, requireAdmin, logAdminAction } from '../admin';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Mock the supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      json: data,
      status: options?.status || 200,
    })),
  },
}));

const mockCreateClient = vi.mocked(createClient);
const mockNextResponse = vi.mocked(NextResponse);

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

const mockAdminUser = {
  id: 'admin-user-id',
  email: 'admin@example.com',
};

describe('checkIsAdmin', () => {
  let mockSupabase: ReturnType<typeof createClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
      rpc: vi.fn(),
    } as ReturnType<typeof createClient>;

    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  it('should return unauthorized when no user is authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await checkIsAdmin();

    expect(result.isAdmin).toBe(false);
    expect(result.user).toBe(null);
    expect(result.error).toBe('Unauthorized');
    expect(result.response).toBeTruthy();
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { error: 'Authentication required' },
      { status: 401 }
    );
  });

  it('should return unauthorized when auth error occurs', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Auth error'),
    });

    const result = await checkIsAdmin();

    expect(result.isAdmin).toBe(false);
    expect(result.user).toBe(null);
    expect(result.error).toBe('Unauthorized');
  });

  it('should return forbidden when user is not admin', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { is_admin: false },
            error: null,
          }),
        }),
      }),
    });

    const result = await checkIsAdmin();

    expect(result.isAdmin).toBe(false);
    expect(result.user).toEqual(mockUser);
    expect(result.error).toBe('Forbidden');
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { error: 'Admin access required' },
      { status: 403 }
    );
  });

  it('should return database error when user lookup fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error'),
          }),
        }),
      }),
    });

    const result = await checkIsAdmin();

    expect(result.isAdmin).toBe(false);
    expect(result.user).toEqual(mockUser);
    expect(result.error).toBe('Database error');
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { error: 'Internal server error' },
      { status: 500 }
    );
  });

  it('should return success when user is admin', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockAdminUser },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { is_admin: true },
            error: null,
          }),
        }),
      }),
    });

    const result = await checkIsAdmin();

    expect(result.isAdmin).toBe(true);
    expect(result.user).toEqual(mockAdminUser);
    expect(result.error).toBe(null);
    expect(result.response).toBe(null);
  });
});

describe('requireAdmin', () => {
  it('should return the same result as checkIsAdmin', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockAdminUser },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { is_admin: true },
              error: null,
            }),
          }),
        }),
      }),
    };

    mockCreateClient.mockResolvedValue(mockSupabase);

    const result = await requireAdmin();

    expect(result.isAdmin).toBe(true);
    expect(result.user).toEqual(mockAdminUser);
    expect(result.error).toBe(null);
  });
});

describe('logAdminAction', () => {
  let mockSupabase: ReturnType<typeof createClient>;
  let mockRequest: Request;

  beforeEach(() => {
    mockSupabase = {
      rpc: vi.fn(),
    } as ReturnType<typeof createClient>;

    mockCreateClient.mockResolvedValue(mockSupabase);

    // Mock Request object
    mockRequest = {
      headers: {
        get: vi.fn((header: string) => {
          switch (header) {
            case 'x-forwarded-for':
              return '192.168.1.1';
            case 'user-agent':
              return 'Mozilla/5.0 Test Browser';
            default:
              return null;
          }
        }),
      },
    } as Request;
  });

  it('should log admin action successfully', async () => {
    mockSupabase.rpc.mockResolvedValue({ error: null });

    await logAdminAction(
      'admin-user-id',
      'CREATE_FEATURE_FLAG',
      'feature_flags',
      'flag-id',
      { name: 'test-flag', enabled: true },
      mockRequest
    );

    expect(mockSupabase.rpc).toHaveBeenCalledWith('log_admin_action', {
      p_admin_user_id: 'admin-user-id',
      p_action: 'CREATE_FEATURE_FLAG',
      p_resource_type: 'feature_flags',
      p_resource_id: 'flag-id',
      p_details: JSON.stringify({ name: 'test-flag', enabled: true }),
      p_ip_address: '192.168.1.1',
      p_user_agent: 'Mozilla/5.0 Test Browser',
    });
  });

  it('should handle missing request gracefully', async () => {
    mockSupabase.rpc.mockResolvedValue({ error: null });

    await logAdminAction(
      'admin-user-id',
      'DELETE_FEATURE_FLAG',
      'feature_flags',
      'flag-id'
    );

    expect(mockSupabase.rpc).toHaveBeenCalledWith('log_admin_action', {
      p_admin_user_id: 'admin-user-id',
      p_action: 'DELETE_FEATURE_FLAG',
      p_resource_type: 'feature_flags',
      p_resource_id: 'flag-id',
      p_details: null,
      p_ip_address: null,
      p_user_agent: null,
    });
  });

  it('should handle RPC errors without throwing', async () => {
    mockSupabase.rpc.mockResolvedValue({
      error: new Error('RPC failed'),
    });

    // Should not throw
    await expect(
      logAdminAction(
        'admin-user-id',
        'UPDATE_FEATURE_FLAG',
        'feature_flags',
        'flag-id'
      )
    ).resolves.toBeUndefined();
  });

  it('should handle unexpected errors without throwing', async () => {
    mockSupabase.rpc.mockRejectedValue(new Error('Unexpected error'));

    // Should not throw
    await expect(
      logAdminAction(
        'admin-user-id',
        'TOGGLE_FEATURE_FLAG',
        'feature_flags',
        'flag-id'
      )
    ).resolves.toBeUndefined();
  });

  it('should extract IP from different headers', async () => {
    const mockRequestWithRealIP = {
      headers: {
        get: vi.fn((header: string) => {
          switch (header) {
            case 'x-real-ip':
              return '10.0.0.1';
            case 'user-agent':
              return 'Test Agent';
            default:
              return null;
          }
        }),
      },
    } as Request;

    mockSupabase.rpc.mockResolvedValue({ error: null });

    await logAdminAction(
      'admin-user-id',
      'VIEW_FEATURE_FLAG',
      'feature_flags',
      'flag-id',
      undefined,
      mockRequestWithRealIP
    );

    expect(mockSupabase.rpc).toHaveBeenCalledWith('log_admin_action', 
      expect.objectContaining({
        p_ip_address: '10.0.0.1',
        p_user_agent: 'Test Agent',
      })
    );
  });
});