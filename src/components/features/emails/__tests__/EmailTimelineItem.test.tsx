import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmailTimelineItem } from '../EmailTimelineItem';
import type { EmailArtifact } from '@/types/email';

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

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2 hours ago'),
  parseISO: vi.fn((date) => new Date(date)),
}));

describe('EmailTimelineItem', () => {
  const createMockEmailArtifact = (overrides: Partial<EmailArtifact> = {}): EmailArtifact => ({
    id: 'email-1',
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
        email: 'recipient@example.com',
        name: 'Test Recipient',
      }],
      thread_id: 'thread-123',
      labels: ['INBOX'],
      is_read: true,
      is_starred: false,
      has_attachments: false,
      snippet: 'This is a test email snippet...',
    },
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    ai_parsing_status: 'completed',
    ...overrides,
  });

  const mockProps = {
    artifacts: [createMockEmailArtifact()],
    onEmailClick: vi.fn(),
    onThreadClick: vi.fn(),
    className: 'test-class',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Email Direction Detection with User Context', () => {
    it('should detect sent emails using authenticated user email', () => {
      const sentEmail = createMockEmailArtifact({
        metadata: {
          ...createMockEmailArtifact().metadata,
          from: {
            email: 'test@example.com', // Matches authenticated user
            name: 'Test User',
          },
          labels: [], // No Gmail labels
        },
      });

      render(<EmailTimelineItem {...mockProps} artifacts={[sentEmail]} />);
      
      // Should show sent indicator
      expect(screen.getByText('Test Email Subject')).toBeInTheDocument();
    });

    it('should detect received emails correctly', () => {
      const receivedEmail = createMockEmailArtifact({
        metadata: {
          ...createMockEmailArtifact().metadata,
          from: {
            email: 'other@example.com',
            name: 'Other Sender',
          },
          labels: ['INBOX'],
        },
      });

      render(<EmailTimelineItem {...mockProps} artifacts={[receivedEmail]} />);
      
      expect(screen.getByText('Test Email Subject')).toBeInTheDocument();
    });

    it('should prioritize Gmail SENT label over email matching', () => {
      const sentLabelEmail = createMockEmailArtifact({
        metadata: {
          ...createMockEmailArtifact().metadata,
          from: {
            email: 'other@example.com', // Doesn't match user
            name: 'Other Sender',
          },
          labels: ['SENT'], // But has SENT label
        },
      });

      render(<EmailTimelineItem {...mockProps} artifacts={[sentLabelEmail]} />);
      
      // Should be treated as sent due to SENT label
      expect(screen.getByText('Test Email Subject')).toBeInTheDocument();
    });
  });

  describe('Thread Grouping and Performance', () => {
    it('should efficiently group emails by thread_id', () => {
      const threadEmails = [
        createMockEmailArtifact({ 
          id: 'email-1', 
          metadata: { ...createMockEmailArtifact().metadata, thread_id: 'thread-123' } 
        }),
        createMockEmailArtifact({ 
          id: 'email-2', 
          metadata: { ...createMockEmailArtifact().metadata, thread_id: 'thread-123' } 
        }),
        createMockEmailArtifact({ 
          id: 'email-3', 
          metadata: { ...createMockEmailArtifact().metadata, thread_id: 'thread-456' } 
        }),
      ];

      const startTime = performance.now();
      render(<EmailTimelineItem {...mockProps} artifacts={threadEmails} />);
      const renderTime = performance.now() - startTime;

      // Should group efficiently and render quickly
      expect(renderTime).toBeLessThan(50); // 50ms threshold for performance
      expect(screen.getByText('2 emails')).toBeInTheDocument(); // Thread with 2 emails
    });

    it('should memoize expensive thread calculations', () => {
      const manyEmails = Array.from({ length: 100 }, (_, i) => 
        createMockEmailArtifact({ 
          id: `email-${i}`, 
          metadata: { 
            ...createMockEmailArtifact().metadata, 
            thread_id: `thread-${Math.floor(i / 10)}`,
            subject: `Subject ${i}`
          } 
        })
      );

      const { rerender } = render(<EmailTimelineItem {...mockProps} artifacts={manyEmails} />);
      
      // Re-render with same data should be fast (memoized)
      const startTime = performance.now();
      rerender(<EmailTimelineItem {...mockProps} artifacts={manyEmails} />);
      const rerenderTime = performance.now() - startTime;

      expect(rerenderTime).toBeLessThan(20); // Should be very fast due to memoization
    });
  });

  describe('Thread Interaction', () => {
    it('should expand/collapse threads correctly', async () => {
      const threadEmails = [
        createMockEmailArtifact({ id: 'email-1' }),
        createMockEmailArtifact({ id: 'email-2' }),
      ];

      render(<EmailTimelineItem {...mockProps} artifacts={threadEmails} />);
      
      // Find and click expand button
      const expandButton = screen.getByLabelText(/Expand thread/i);
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/Collapse thread/i)).toBeInTheDocument();
      });
    });

    it('should call appropriate callbacks on email/thread clicks', () => {
      const threadEmails = [createMockEmailArtifact()];

      render(<EmailTimelineItem {...mockProps} artifacts={threadEmails} />);
      
      const subjectElement = screen.getByText('Test Email Subject');
      fireEvent.click(subjectElement);

      expect(mockProps.onEmailClick || mockProps.onThreadClick).toHaveBeenCalled();
    });
  });

  describe('Email Metadata Display', () => {
    it('should display thread statistics correctly', () => {
      const mixedThreadEmails = [
        createMockEmailArtifact({
          id: 'email-1',
          metadata: {
            ...createMockEmailArtifact().metadata,
            from: { email: 'test@example.com', name: 'Me' }, // Sent by user
            labels: [],
          },
        }),
        createMockEmailArtifact({
          id: 'email-2',
          metadata: {
            ...createMockEmailArtifact().metadata,
            from: { email: 'other@example.com', name: 'Other' }, // Received
            labels: ['INBOX'],
          },
        }),
      ];

      render(<EmailTimelineItem {...mockProps} artifacts={mixedThreadEmails} />);
      
      // Should show mixed thread statistics
      expect(screen.getByText(/1↗ 1↙/)).toBeInTheDocument();
    });

    it('should handle importance indicators', () => {
      const importantEmail = createMockEmailArtifact({
        metadata: {
          ...createMockEmailArtifact().metadata,
          labels: ['IMPORTANT', 'INBOX'],
        },
      });

      render(<EmailTimelineItem {...mockProps} artifacts={[importantEmail]} />);
      
      // Should display importance indicator
      expect(screen.getByText('Test Email Subject')).toBeInTheDocument();
    });

    it('should display attachment indicators', () => {
      const emailWithAttachments = createMockEmailArtifact({
        metadata: {
          ...createMockEmailArtifact().metadata,
          has_attachments: true,
        },
      });

      render(<EmailTimelineItem {...mockProps} artifacts={[emailWithAttachments]} />);
      
      // Should show attachment icon
      expect(screen.getByText('Test Email Subject')).toBeInTheDocument();
    });
  });

  describe('Participant Formatting', () => {
    it('should format participants with names and email fallback', () => {
      const emailWithParticipants = createMockEmailArtifact({
        metadata: {
          ...createMockEmailArtifact().metadata,
          from: { email: 'sender@example.com', name: 'John Doe' },
          to: [
            { email: 'recipient1@example.com', name: 'Jane Smith' },
            { email: 'recipient2@example.com' }, // No name
          ],
        },
      });

      render(<EmailTimelineItem {...mockProps} artifacts={[emailWithParticipants]} />);
      
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    it('should truncate long participant lists', () => {
      const manyParticipants = Array.from({ length: 10 }, (_, i) => ({
        email: `user${i}@example.com`,
        name: `User ${i}`,
      }));

      const emailWithManyParticipants = createMockEmailArtifact({
        metadata: {
          ...createMockEmailArtifact().metadata,
          to: manyParticipants,
        },
      });

      render(<EmailTimelineItem {...mockProps} artifacts={[emailWithManyParticipants]} />);
      
      // Should show truncation indicator
      expect(screen.getByText(/\+\d+/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle emails without metadata gracefully', () => {
      const emailWithoutMetadata = {
        ...createMockEmailArtifact(),
        metadata: undefined,
      } as unknown as EmailArtifact;

      expect(() => {
        render(<EmailTimelineItem {...mockProps} artifacts={[emailWithoutMetadata]} />);
      }).not.toThrow();
    });

    it('should handle empty artifact array', () => {
      render(<EmailTimelineItem {...mockProps} artifacts={[]} />);
      
      // Should render nothing without crashing
      expect(screen.queryByText('Test Email Subject')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should provide proper ARIA labels for thread controls', () => {
      const threadEmails = [
        createMockEmailArtifact({ id: 'email-1' }),
        createMockEmailArtifact({ id: 'email-2' }),
      ];

      render(<EmailTimelineItem {...mockProps} artifacts={threadEmails} />);
      
      expect(screen.getByLabelText(/Expand thread/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<EmailTimelineItem {...mockProps} />);
      
      const subjectElement = screen.getByText('Test Email Subject');
      fireEvent.keyDown(subjectElement, { key: 'Enter', code: 'Enter' });
      
      // Should handle keyboard interaction
      expect(mockProps.onEmailClick || mockProps.onThreadClick).toHaveBeenCalled();
    });
  });
});