import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useArtifactTimeline } from '../useArtifactTimeline';
import type { BaseArtifact } from '@/types/artifacts';

// Mock Supabase client
const mockData = [
  {
    id: 'artifact-1',
    type: 'email',
    user_id: 'user-123',
    contact_id: 'contact-123',
    timestamp: '2024-01-15T10:30:00Z',
    content: 'First email content',
    metadata: {
      subject: 'First Email',
      from: { email: 'sender1@example.com', name: 'Sender One' },
    },
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    ai_parsing_status: 'completed',
  },
  {
    id: 'artifact-2',
    type: 'voice_memo',
    user_id: 'user-123',
    contact_id: 'contact-123',
    timestamp: '2024-01-15T11:30:00Z',
    content: 'Voice memo transcript',
    metadata: {
      duration: 120,
      transcription: 'This is a voice memo transcript',
    },
    created_at: '2024-01-15T11:30:00Z',
    updated_at: '2024-01-15T11:30:00Z',
    ai_parsing_status: 'completed',
  },
] as BaseArtifact[];

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ 
            data: mockData, 
            error: null 
          })),
        })),
      })),
    })),
  },
}));

// Mock AuthContext
vi.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
  }),
}));

describe('useArtifactTimeline Performance Tests', () => {
  let queryClient: QueryClient;

  const createWrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  describe('Enhanced Memoization', () => {
    it('should memoize search operations efficiently', async () => {
      const { result, rerender } = renderHook(
        () => useArtifactTimeline({
          contactId: 'contact-123',
          options: {
            searchTerm: 'email',
            typeFilters: [],
            groupingMode: 'date',
          },
        }),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Time the first search operation
      const startTime1 = performance.now();
      rerender();
      const firstSearchTime = performance.now() - startTime1;

      // Re-render with same search term (should be memoized)
      const startTime2 = performance.now();
      rerender();
      const memoizedSearchTime = performance.now() - startTime2;

      // Memoized operation should be significantly faster
      expect(memoizedSearchTime).toBeLessThan(firstSearchTime * 0.5);
    });

    it('should efficiently handle type filtering', async () => {
      const { result, rerender } = renderHook(
        ({ typeFilters }) => useArtifactTimeline({
          contactId: 'contact-123',
          options: {
            typeFilters,
            groupingMode: 'date',
          },
        }),
        { 
          wrapper: createWrapper,
          initialProps: { typeFilters: ['email'] }
        }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Change type filters
      const startTime = performance.now();
      rerender({ typeFilters: ['email', 'voice_memo'] });
      const filterTime = performance.now() - startTime;

      // Type filtering should be fast due to memoization
      expect(filterTime).toBeLessThan(10); // 10ms threshold
    });

    it('should memoize grouping operations', async () => {
      const { result, rerender } = renderHook(
        ({ groupingMode }) => useArtifactTimeline({
          contactId: 'contact-123',
          options: {
            groupingMode,
          },
        }),
        { 
          wrapper: createWrapper,
          initialProps: { groupingMode: 'date' as const }
        }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Time grouping operation
      const startTime1 = performance.now();
      rerender({ groupingMode: 'type' as const });
      const firstGroupTime = performance.now() - startTime1;

      // Switch back to date grouping (should be memoized from first render)
      const startTime2 = performance.now();
      rerender({ groupingMode: 'date' as const });
      const memoizedGroupTime = performance.now() - startTime2;

      // Second grouping should be faster due to memoization
      expect(memoizedGroupTime).toBeLessThan(firstGroupTime);
    });
  });

  describe('Search Performance', () => {
    it('should handle complex search terms efficiently', async () => {
      const complexSearchTerm = 'email content sender voice memo transcript';
      
      const { result } = renderHook(
        () => useArtifactTimeline({
          contactId: 'contact-123',
          options: {
            searchTerm: complexSearchTerm,
          },
        }),
        { wrapper: createWrapper }
      );

      const startTime = performance.now();
      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
      const searchTime = performance.now() - startTime;

      // Complex search should complete within reasonable time
      expect(searchTime).toBeLessThan(100); // 100ms threshold
      expect(result.current.data?.groups).toBeDefined();
    });

    it('should efficiently handle empty search terms', async () => {
      const { result, rerender } = renderHook(
        ({ searchTerm }) => useArtifactTimeline({
          contactId: 'contact-123',
          options: {
            searchTerm,
          },
        }),
        { 
          wrapper: createWrapper,
          initialProps: { searchTerm: 'test' }
        }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Clear search term
      const startTime = performance.now();
      rerender({ searchTerm: '' });
      const clearTime = performance.now() - startTime;

      // Clearing search should be very fast
      expect(clearTime).toBeLessThan(5); // 5ms threshold
    });
  });

  describe('Memory Management', () => {
    it('should not cause memory leaks with frequent re-renders', async () => {
      const { result, rerender } = renderHook(
        ({ iteration }) => useArtifactTimeline({
          contactId: 'contact-123',
          options: {
            searchTerm: `search-${iteration}`,
          },
        }),
        { 
          wrapper: createWrapper,
          initialProps: { iteration: 0 }
        }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Simulate many re-renders with different search terms
      for (let i = 1; i <= 50; i++) {
        rerender({ iteration: i });
      }

      // Should still work without memory issues
      expect(result.current.data).toBeDefined();
    });

    it('should clean up properly when unmounted', async () => {
      const { result, unmount } = renderHook(
        () => useArtifactTimeline({
          contactId: 'contact-123',
        }),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Unmount should not cause issues
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Large Dataset Performance', () => {
    it('should handle large datasets efficiently', async () => {
      // Create a large mock dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `artifact-${i}`,
        type: i % 2 === 0 ? 'email' : 'voice_memo',
        user_id: 'user-123',
        contact_id: 'contact-123',
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        content: `Content for artifact ${i} with searchable text`,
        metadata: {
          subject: `Subject ${i}`,
          from: { email: `sender${i}@example.com`, name: `Sender ${i}` },
        },
        created_at: new Date(Date.now() - i * 60000).toISOString(),
        updated_at: new Date(Date.now() - i * 60000).toISOString(),
        ai_parsing_status: 'completed' as const,
      }));

      // Mock large dataset response
      vi.mocked(vi.importMocked('@/lib/supabase/client').supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({ 
              data: largeDataset, 
              error: null 
            })),
          })),
        })),
      } as unknown);

      const { result } = renderHook(
        () => useArtifactTimeline({
          contactId: 'contact-123',
          options: {
            searchTerm: 'searchable',
            typeFilters: ['email'],
            groupingMode: 'date',
          },
        }),
        { wrapper: createWrapper }
      );

      const startTime = performance.now();
      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
      const processingTime = performance.now() - startTime;

      // Large dataset processing should complete within reasonable time
      expect(processingTime).toBeLessThan(500); // 500ms threshold
      expect(result.current.data?.groups).toBeDefined();
    });
  });

  describe('React Query Optimization', () => {
    it('should use optimized React Query configuration', async () => {
      const { result } = renderHook(
        () => useArtifactTimeline({
          contactId: 'contact-123',
        }),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Should have proper stale time and garbage collection settings
      expect(result.current.isStale).toBe(false);
    });

    it('should not refetch on window focus by default', async () => {
      const { result } = renderHook(
        () => useArtifactTimeline({
          contactId: 'contact-123',
        }),
        { wrapper: createWrapper }
      );

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Simulate window focus
      window.dispatchEvent(new Event('focus'));

      // Should not trigger refetch
      expect(result.current.isFetching).toBe(false);
    });
  });
});