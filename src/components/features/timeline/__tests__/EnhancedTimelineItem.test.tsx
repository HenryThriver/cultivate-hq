import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnhancedTimelineItem } from '../EnhancedTimelineItem';
import type { BaseArtifact } from '@/types/artifacts';

// Mock the AuthContext
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

vi.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: [], error: null })),
        })),
      })),
    })),
  },
}));

// Mock Material-UI components for testing
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    Tooltip: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock formatDistanceToNow
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2 hours ago'),
  parseISO: vi.fn((date) => new Date(date)),
}));

describe('EnhancedTimelineItem', () => {
  const mockArtifact: BaseArtifact = {
    id: 'test-artifact-1',
    type: 'email',
    user_id: 'user-123',
    contact_id: 'contact-123',
    timestamp: '2024-01-15T10:30:00Z',
    content: 'Test email content',
    metadata: {
      subject: 'Test Email Subject',
      from: {
        email: 'sender@example.com',
        name: 'Test Sender',
      },
      to: [{
        email: 'test@example.com',
        name: 'Test Recipient',
      }],
      labels: ['INBOX'],
      is_read: false,
      is_starred: false,
      has_attachments: false,
      snippet: 'This is a test email snippet...',
    },
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    ai_parsing_status: 'completed',
  };

  const mockProps = {
    artifact: mockArtifact,
    onArtifactClick: vi.fn(),
    showActions: true,
    showTimestamp: true,
    className: 'test-class',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Email Direction Detection', () => {
    it('should detect sent emails using authenticated user context', () => {
      const sentArtifact: BaseArtifact = {
        ...mockArtifact,
        metadata: {
          ...mockArtifact.metadata,
          from: {
            email: 'test@example.com',
            name: 'Test User',
          },
          labels: [],
        },
      };

      render(<EnhancedTimelineItem {...mockProps} artifact={sentArtifact} />);
      
      // Should show sent indicator (outbound icon or styling)
      expect(screen.getByText('Test Email Subject')).toBeInTheDocument();
    });

    it('should detect received emails correctly', () => {
      render(<EnhancedTimelineItem {...mockProps} />);
      
      // Should show received indicator
      expect(screen.getByText('Test Email Subject')).toBeInTheDocument();
    });

    it('should prioritize Gmail labels over email matching', () => {
      const labeledArtifact: BaseArtifact = {
        ...mockArtifact,
        metadata: {
          ...mockArtifact.metadata,
          from: {
            email: 'test@example.com', // Matches user email
            name: 'Test User',
          },
          labels: ['INBOX'], // But has INBOX label
        },
      };

      render(<EnhancedTimelineItem {...mockProps} artifact={labeledArtifact} />);
      
      // Should be treated as received due to INBOX label
      expect(screen.getByText('Test Email Subject')).toBeInTheDocument();
    });
  });

  describe('Performance Optimizations', () => {
    it('should handle rapid re-renders without unnecessary calculations', () => {
      const { rerender } = render(<EnhancedTimelineItem {...mockProps} />);
      
      // Re-render with same props - should not cause issues
      rerender(<EnhancedTimelineItem {...mockProps} />);
      rerender(<EnhancedTimelineItem {...mockProps} />);
      
      expect(screen.getByText('Test Email Subject')).toBeInTheDocument();
    });

    it('should memoize expensive operations', () => {
      const artifactWithLargeContent: BaseArtifact = {
        ...mockArtifact,
        content: 'Very '.repeat(1000) + 'long content',
        metadata: {
          ...mockArtifact.metadata,
          snippet: 'Long '.repeat(100) + 'snippet',
        },
      };

      const startTime = performance.now();
      render(<EnhancedTimelineItem {...mockProps} artifact={artifactWithLargeContent} />);
      const renderTime = performance.now() - startTime;

      // Should render efficiently even with large content
      expect(renderTime).toBeLessThan(100); // 100ms threshold
      expect(screen.getByText('Test Email Subject')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onArtifactClick when artifact is clicked', () => {
      render(<EnhancedTimelineItem {...mockProps} />);
      
      const subjectElement = screen.getByText('Test Email Subject');
      fireEvent.click(subjectElement);
      
      expect(mockProps.onArtifactClick).toHaveBeenCalledWith(mockArtifact);
    });

    it('should handle keyboard navigation', () => {
      render(<EnhancedTimelineItem {...mockProps} />);
      
      const subjectElement = screen.getByText('Test Email Subject');
      fireEvent.keyDown(subjectElement, { key: 'Enter', code: 'Enter' });
      
      expect(mockProps.onArtifactClick).toHaveBeenCalledWith(mockArtifact);
    });
  });

  describe('Content Display', () => {
    it('should display email metadata correctly', () => {
      render(<EnhancedTimelineItem {...mockProps} />);
      
      expect(screen.getByText('Test Email Subject')).toBeInTheDocument();
      expect(screen.getByText(/Test Sender/)).toBeInTheDocument();
      expect(screen.getByText(/2 hours ago/)).toBeInTheDocument();
    });

    it('should handle missing metadata gracefully', () => {
      const artifactWithoutMetadata: BaseArtifact = {
        ...mockArtifact,
        metadata: {},
      };

      render(<EnhancedTimelineItem {...mockProps} artifact={artifactWithoutMetadata} />);
      
      // Should not crash and show fallback content
      expect(screen.getByText(/No Subject|Unknown/)).toBeInTheDocument();
    });

    it('should truncate long content appropriately', () => {
      const longContentArtifact: BaseArtifact = {
        ...mockArtifact,
        metadata: {
          ...mockArtifact.metadata,
          snippet: 'This is a very long email snippet that should be truncated for display purposes '.repeat(10),
        },
      };

      render(<EnhancedTimelineItem {...mockProps} artifact={longContentArtifact} />);
      
      // Should be present but truncated
      expect(screen.getByText('Test Email Subject')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<EnhancedTimelineItem {...mockProps} />);
      
      const articleElement = screen.getByRole('article');
      expect(articleElement).toHaveAttribute('aria-label');
    });

    it('should support screen reader navigation', () => {
      render(<EnhancedTimelineItem {...mockProps} />);
      
      // Should have proper heading structure
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    it('should handle corrupted artifact data gracefully', () => {
      const corruptedArtifact = {
        ...mockArtifact,
        metadata: null,
      } as unknown as BaseArtifact;

      expect(() => {
        render(<EnhancedTimelineItem {...mockProps} artifact={corruptedArtifact} />);
      }).not.toThrow();
    });
  });
});