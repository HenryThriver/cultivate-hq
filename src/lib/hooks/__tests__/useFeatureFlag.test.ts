import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFeatureFlag, clearFeatureFlagCache, getFeatureFlagCacheStats } from '../useFeatureFlag';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';

// Mock the auth context
vi.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockUseAuth = vi.mocked(useAuth);
const mockSupabase = vi.mocked(supabase);

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

const mockFlagData = {
  id: 'flag-id',
  enabled_globally: true,
};

const mockOverrideData = {
  enabled: false,
};

describe('useFeatureFlag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearFeatureFlagCache();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return disabled state when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => useFeatureFlag('test-flag'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.enabled).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should return disabled state when flag name is empty', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser } as ReturnType<typeof useAuth>);

    const { result } = renderHook(() => useFeatureFlag(''));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.enabled).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should return global flag setting when no user override exists', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser } as ReturnType<typeof useAuth>);

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockFlagData,
            error: null,
          }),
        }),
      }),
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'feature_flags') {
        return mockFrom();
      }
      if (table === 'user_feature_overrides') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      return mockFrom();
    });

    const { result } = renderHook(() => useFeatureFlag('test-flag'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.enabled).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should return user override when it exists', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser } as ReturnType<typeof useAuth>);

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockFlagData,
            error: null,
          }),
        }),
      }),
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'feature_flags') {
        return mockFrom();
      }
      if (table === 'user_feature_overrides') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: mockOverrideData,
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      return mockFrom();
    });

    const { result } = renderHook(() => useFeatureFlag('test-flag'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.enabled).toBe(false); // Override value
    expect(result.current.error).toBe(null);
  });

  it('should return false when feature flag does not exist', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser } as ReturnType<typeof useAuth>);

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }, // Not found error
          }),
        }),
      }),
    });

    mockSupabase.from.mockReturnValue(mockFrom());

    const { result } = renderHook(() => useFeatureFlag('nonexistent-flag'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.enabled).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle database errors gracefully', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser } as ReturnType<typeof useAuth>);

    const error = new Error('Database connection failed');
    error.code = 'CONNECTION_ERROR';
    
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error,
          }),
        }),
      }),
    });

    mockSupabase.from.mockReturnValue(mockFrom());

    const { result } = renderHook(() => useFeatureFlag('test-flag'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.enabled).toBe(false);
    expect(result.current.error).toBe('Database connection failed');
  });

  it('should use cache on subsequent calls', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser } as ReturnType<typeof useAuth>);

    const mockSingle = vi.fn().mockResolvedValue({
      data: mockFlagData,
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'feature_flags') {
        return mockFrom();
      }
      if (table === 'user_feature_overrides') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      return mockFrom();
    });

    // First call
    const { result: result1 } = renderHook(() => useFeatureFlag('test-flag'));
    await waitFor(() => expect(result1.current.loading).toBe(false));

    // Second call should use cache
    const { result: result2 } = renderHook(() => useFeatureFlag('test-flag'));
    await waitFor(() => expect(result2.current.loading).toBe(false));

    expect(result1.current.enabled).toBe(true);
    expect(result2.current.enabled).toBe(true);

    // Database should only be called once (for the first request)
    expect(mockSingle).toHaveBeenCalledTimes(1);
  });
});

describe('Feature Flag Cache', () => {
  beforeEach(() => {
    clearFeatureFlagCache();
  });

  it('should track cache statistics', () => {
    const stats = getFeatureFlagCacheStats();
    expect(stats).toEqual({
      size: 0,
      maxSize: 1000,
      ttl: 300000, // 5 minutes in milliseconds
    });
  });

  it('should clear cache properly', () => {
    clearFeatureFlagCache();
    const stats = getFeatureFlagCacheStats();
    expect(stats.size).toBe(0);
  });
});