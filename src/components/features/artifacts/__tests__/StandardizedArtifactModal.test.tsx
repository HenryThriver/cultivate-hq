import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StandardizedArtifactModal } from '../StandardizedArtifactModal';
import type { BaseArtifact, VoiceMemoArtifact } from '@/types';

// Mock dependencies
vi.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
}));

vi.mock('@/config/artifactConfig', () => ({
  getArtifactConfig: vi.fn((type) => ({
    label: type === 'voice_memo' ? 'Voice Memo' : 'Artifact',
    icon: 'MicIcon',
    color: '#1976d2',
  })),
}));

vi.mock('@/components/features/linkedin', () => ({
  LinkedInProfileModal: ({ open, onClose }: { open: boolean; onClose: () => void }) => 
    open ? <div data-testid="linkedin-profile-modal">LinkedIn Profile Modal</div> : null,
  LinkedInPostModal: ({ open, onClose }: { open: boolean; onClose: () => void }) => 
    open ? <div data-testid="linkedin-post-modal">LinkedIn Post Modal</div> : null,
}));

vi.mock('@/components/features/emails/EmailDetailModal', () => ({
  EmailDetailModal: ({ open, onClose }: { open: boolean; onClose: () => void }) => 
    open ? <div data-testid="email-detail-modal">Email Detail Modal</div> : null,
}));

vi.mock('@/components/features/suggestions/ArtifactSuggestions', () => ({
  ArtifactSuggestions: ({ artifactId }: { artifactId: string }) => 
    <div data-testid="artifact-suggestions">Suggestions for {artifactId}</div>,
}));

vi.mock('@/components/features/contacts/profile/ActionTile', () => ({
  ActionTile: ({ action }: { action: any }) => 
    <div data-testid="action-tile">{action.title}</div>,
}));

// Mock Material-UI components for easier testing
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    Tooltip: ({ children }: { children: React.ReactNode }) => children,
    useTheme: () => ({ palette: { primary: { main: '#1976d2' } } }),
  };
});

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn(() => 'Jan 15, 2024 10:30 AM'),
  parseISO: vi.fn((date) => new Date(date)),
}));

describe('StandardizedArtifactModal', () => {
  const mockArtifact: VoiceMemoArtifact = {
    id: 'test-artifact-1',
    type: 'voice_memo',
    user_id: 'user-123',
    contact_id: 'contact-123',
    timestamp: '2024-01-15T10:30:00Z',
    content: {
      transcription: 'This is a test voice memo transcription.',
      duration: 120,
      audio_file_path: '/audio/test-memo.mp3',
    },
    metadata: {
      duration: 120,
      transcription: 'This is a test voice memo transcription.',
      audio_file_path: '/audio/test-memo.mp3',
    },
    ai_suggestions: [],
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    ai_parsing_status: 'completed',
    title: 'Test Voice Memo',
    description: 'A test voice memo for unit testing',
  };

  const defaultProps = {
    artifact: mockArtifact,
    open: true,
    onClose: vi.fn(),
    contactId: 'contact-123',
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    onRefresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Rendering', () => {
    it('should render modal when open prop is true', () => {
      render(<StandardizedArtifactModal {...defaultProps} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Voice Memo')).toBeInTheDocument();
    });

    it('should not render modal when open prop is false', () => {
      render(<StandardizedArtifactModal {...defaultProps} open={false} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should not render modal when artifact is null', () => {
      render(<StandardizedArtifactModal {...defaultProps} artifact={null} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Artifact Information Display', () => {
    it('should display artifact title and metadata', () => {
      render(<StandardizedArtifactModal {...defaultProps} />);
      
      expect(screen.getByText('Test Voice Memo')).toBeInTheDocument();
      expect(screen.getByText('A test voice memo for unit testing')).toBeInTheDocument();
      expect(screen.getByText('Jan 15, 2024 10:30 AM')).toBeInTheDocument();
    });

    it('should display artifact type configuration', () => {
      render(<StandardizedArtifactModal {...defaultProps} />);
      
      expect(screen.getByText('Voice Memo')).toBeInTheDocument();
    });

    it('should handle missing title gracefully', () => {
      const artifactWithoutTitle = { ...mockArtifact, title: undefined };
      render(<StandardizedArtifactModal {...defaultProps} artifact={artifactWithoutTitle} />);
      
      // Should show artifact type as fallback
      expect(screen.getByText('Voice Memo')).toBeInTheDocument();
    });

    it('should display voice memo content correctly', () => {
      render(<StandardizedArtifactModal {...defaultProps} />);
      
      expect(screen.getByText('This is a test voice memo transcription.')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      render(<StandardizedArtifactModal {...defaultProps} />);
      
      const closeButton = screen.getByLabelText(/close/i);
      fireEvent.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete button is clicked', () => {
      render(<StandardizedArtifactModal {...defaultProps} />);
      
      const deleteButton = screen.getByLabelText(/delete/i);
      fireEvent.click(deleteButton);
      
      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockArtifact);
    });

    it('should call onRefresh when refresh button is clicked', () => {
      render(<StandardizedArtifactModal {...defaultProps} />);
      
      const refreshButton = screen.getByLabelText(/refresh/i);
      fireEvent.click(refreshButton);
      
      expect(defaultProps.onRefresh).toHaveBeenCalledWith(mockArtifact.id);
    });

    it('should handle keyboard events for closing modal', () => {
      render(<StandardizedArtifactModal {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Specialized Modal Routing', () => {
    it('should route email artifacts to EmailDetailModal', () => {
      const emailArtifact = {
        ...mockArtifact,
        type: 'email' as const,
        metadata: { subject: 'Test Email', from: { email: 'test@example.com' } }
      };

      render(<StandardizedArtifactModal {...defaultProps} artifact={emailArtifact} />);
      
      expect(screen.getByTestId('email-detail-modal')).toBeInTheDocument();
    });

    it('should route LinkedIn profile artifacts to LinkedInProfileModal', () => {
      const linkedinArtifact = {
        ...mockArtifact,
        type: 'linkedin_profile' as const,
      };

      render(<StandardizedArtifactModal {...defaultProps} artifact={linkedinArtifact} />);
      
      expect(screen.getByTestId('linkedin-profile-modal')).toBeInTheDocument();
    });

    it('should route LinkedIn post artifacts to LinkedInPostModal', () => {
      const linkedinPostArtifact = {
        ...mockArtifact,
        type: 'linkedin_post' as const,
      };

      render(<StandardizedArtifactModal {...defaultProps} artifact={linkedinPostArtifact} />);
      
      expect(screen.getByTestId('linkedin-post-modal')).toBeInTheDocument();
    });
  });

  describe('AI Suggestions Integration', () => {
    it('should render ArtifactSuggestions component', () => {
      render(<StandardizedArtifactModal {...defaultProps} />);
      
      expect(screen.getByTestId('artifact-suggestions')).toBeInTheDocument();
      expect(screen.getByText('Suggestions for test-artifact-1')).toBeInTheDocument();
    });
  });

  describe('Action Items Display', () => {
    it('should display related action items when provided', async () => {
      const mockActions = [
        {
          id: 'action-1',
          title: 'Follow up on meeting',
          description: 'Send follow-up email',
          status: 'pending' as const,
          priority: 'high' as const,
          due_date: '2024-01-20',
          contact_id: 'contact-123',
          user_id: 'user-123',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
        }
      ];

      render(
        <StandardizedArtifactModal 
          {...defaultProps} 
          relatedActions={mockActions}
        />
      );
      
      expect(screen.getByTestId('action-tile')).toBeInTheDocument();
      expect(screen.getByText('Follow up on meeting')).toBeInTheDocument();
    });

    it('should not display actions section when no actions provided', () => {
      render(<StandardizedArtifactModal {...defaultProps} />);
      
      expect(screen.queryByTestId('action-tile')).not.toBeInTheDocument();
    });
  });

  describe('Content Formatting', () => {
    it('should format different content types appropriately', () => {
      const complexArtifact = {
        ...mockArtifact,
        content: {
          transcription: 'Complex transcription text',
          duration: 300,
          confidence: 0.95,
          audio_file_path: '/audio/complex.mp3',
        }
      };

      render(<StandardizedArtifactModal {...defaultProps} artifact={complexArtifact} />);
      
      expect(screen.getByText('Complex transcription text')).toBeInTheDocument();
    });

    it('should handle missing or empty content gracefully', () => {
      const emptyArtifact = {
        ...mockArtifact,
        content: null,
      };

      expect(() => {
        render(<StandardizedArtifactModal {...defaultProps} artifact={emptyArtifact} />);
      }).not.toThrow();
    });
  });

  describe('Performance Considerations', () => {
    it('should handle large content without performance issues', () => {
      const largeContentArtifact = {
        ...mockArtifact,
        content: {
          transcription: 'Large content '.repeat(1000),
          duration: 3600,
          audio_file_path: '/audio/large.mp3',
        }
      };

      const startTime = performance.now();
      render(<StandardizedArtifactModal {...defaultProps} artifact={largeContentArtifact} />);
      const renderTime = performance.now() - startTime;

      // Should render within reasonable time even with large content
      expect(renderTime).toBeLessThan(100); // 100ms threshold
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle rapid modal open/close operations', async () => {
      const { rerender } = render(<StandardizedArtifactModal {...defaultProps} open={false} />);
      
      // Rapidly toggle modal state
      for (let i = 0; i < 10; i++) {
        rerender(<StandardizedArtifactModal {...defaultProps} open={i % 2 === 0} />);
      }

      // Should handle rapid state changes without issues
      expect(() => {
        rerender(<StandardizedArtifactModal {...defaultProps} open={true} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<StandardizedArtifactModal {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should support keyboard navigation', () => {
      render(<StandardizedArtifactModal {...defaultProps} />);
      
      const deleteButton = screen.getByLabelText(/delete/i);
      const refreshButton = screen.getByLabelText(/refresh/i);
      
      expect(deleteButton).toHaveAttribute('tabIndex', '0');
      expect(refreshButton).toHaveAttribute('tabIndex', '0');
    });

    it('should have proper focus management', async () => {
      render(<StandardizedArtifactModal {...defaultProps} />);
      
      // Focus should be trapped within modal
      const dialog = screen.getByRole('dialog');
      expect(document.activeElement).toBeInstanceOf(HTMLElement);
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted artifact data gracefully', () => {
      const corruptedArtifact = {
        ...mockArtifact,
        content: 'invalid content format' as any,
      };

      expect(() => {
        render(<StandardizedArtifactModal {...defaultProps} artifact={corruptedArtifact} />);
      }).not.toThrow();
    });

    it('should handle missing required props gracefully', () => {
      expect(() => {
        render(
          <StandardizedArtifactModal 
            artifact={mockArtifact}
            open={true}
            onClose={vi.fn()}
            contactId=""
          />
        );
      }).not.toThrow();
    });
  });
});