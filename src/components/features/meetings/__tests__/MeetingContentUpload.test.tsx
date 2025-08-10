import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MeetingContentUpload } from '../MeetingContentUpload';
import type { MeetingArtifact, MeetingArtifactContent } from '@/types/artifact';

// Mock dependencies
vi.mock('@/components/features/voice-memos/VoiceRecorder', () => ({
  VoiceRecorder: ({ onRecordingComplete, onRecordingStart }: { 
    onRecordingComplete: (data: any) => void;
    onRecordingStart: () => void;
  }) => (
    <div data-testid="voice-recorder">
      <button onClick={() => onRecordingStart()}>Start Recording</button>
      <button onClick={() => onRecordingComplete({ transcription: 'Test recording', duration: 30 })}>
        Complete Recording
      </button>
    </div>
  ),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn(() => 'Jan 15, 2024 10:30 AM'),
}));

// Mock file upload functionality
global.FormData = vi.fn(() => ({
  append: vi.fn(),
})) as any;

global.fetch = vi.fn();

describe('MeetingContentUpload', () => {
  const mockMeeting: MeetingArtifact = {
    id: 'meeting-1',
    type: 'meeting',
    user_id: 'user-123',
    contact_id: 'contact-123',
    timestamp: '2024-01-15T10:30:00Z',
    content: {
      title: 'Test Meeting',
      attendees: ['John Doe', 'Jane Smith'],
      duration: 3600,
    },
    metadata: {
      title: 'Test Meeting',
      attendees: ['John Doe', 'Jane Smith'],
      duration: 3600,
    },
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    ai_parsing_status: 'pending',
  };

  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    meeting: mockMeeting,
    onContentAdded: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  describe('Modal Rendering', () => {
    it('should render modal when open', () => {
      render(<MeetingContentUpload {...defaultProps} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Add Meeting Content')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<MeetingContentUpload {...defaultProps} open={false} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render all four tabs', () => {
      render(<MeetingContentUpload {...defaultProps} />);
      
      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.getByText('Transcript')).toBeInTheDocument();
      expect(screen.getByText('Recording')).toBeInTheDocument();
      expect(screen.getByText('Voice Memo')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs correctly', () => {
      render(<MeetingContentUpload {...defaultProps} />);
      
      // Notes tab should be active by default
      expect(screen.getByRole('tabpanel', { name: /meeting-content-tabpanel-0/i })).not.toHaveStyle('display: none');
      
      // Switch to transcript tab
      fireEvent.click(screen.getByText('Transcript'));
      expect(screen.getByRole('tabpanel', { name: /meeting-content-tabpanel-1/i })).not.toHaveStyle('display: none');
      
      // Switch to recording tab
      fireEvent.click(screen.getByText('Recording'));
      expect(screen.getByRole('tabpanel', { name: /meeting-content-tabpanel-2/i })).not.toHaveStyle('display: none');
      
      // Switch to voice memo tab
      fireEvent.click(screen.getByText('Voice Memo'));
      expect(screen.getByRole('tabpanel', { name: /meeting-content-tabpanel-3/i })).not.toHaveStyle('display: none');
    });

    it('should maintain tab state when switching', () => {
      render(<MeetingContentUpload {...defaultProps} />);
      
      // Enter text in notes tab
      const notesInput = screen.getByLabelText(/meeting notes/i);
      fireEvent.change(notesInput, { target: { value: 'Test notes content' } });
      
      // Switch to transcript tab and back
      fireEvent.click(screen.getByText('Transcript'));
      fireEvent.click(screen.getByText('Notes'));
      
      // Text should be preserved
      expect(screen.getByDisplayValue('Test notes content')).toBeInTheDocument();
    });
  });

  describe('Notes Tab Functionality', () => {
    beforeEach(() => {
      render(<MeetingContentUpload {...defaultProps} />);
    });

    it('should allow text input in notes field', () => {
      const notesInput = screen.getByLabelText(/meeting notes/i);
      fireEvent.change(notesInput, { target: { value: 'Detailed meeting notes' } });
      
      expect(screen.getByDisplayValue('Detailed meeting notes')).toBeInTheDocument();
    });

    it('should show character count', () => {
      const notesInput = screen.getByLabelText(/meeting notes/i);
      fireEvent.change(notesInput, { target: { value: 'Test' } });
      
      expect(screen.getByText(/4 characters/i)).toBeInTheDocument();
    });

    it('should handle empty notes submission', async () => {
      const uploadButton = screen.getByText(/upload notes/i);
      fireEvent.click(uploadButton);
      
      // Should not call onContentAdded with empty notes
      expect(defaultProps.onContentAdded).not.toHaveBeenCalled();
    });
  });

  describe('Transcript Tab Functionality', () => {
    beforeEach(() => {
      render(<MeetingContentUpload {...defaultProps} />);
      fireEvent.click(screen.getByText('Transcript'));
    });

    it('should allow transcript input', () => {
      const transcriptInput = screen.getByLabelText(/meeting transcript/i);
      fireEvent.change(transcriptInput, { target: { value: 'Meeting transcript content' } });
      
      expect(screen.getByDisplayValue('Meeting transcript content')).toBeInTheDocument();
    });

    it('should show transcript formatting tips', () => {
      expect(screen.getByText(/paste the full transcript/i)).toBeInTheDocument();
    });
  });

  describe('Recording Tab Functionality', () => {
    beforeEach(() => {
      render(<MeetingContentUpload {...defaultProps} />);
      fireEvent.click(screen.getByText('Recording'));
    });

    it('should show file upload interface', () => {
      expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
      expect(screen.getByText(/click to browse/i)).toBeInTheDocument();
    });

    it('should handle file selection', async () => {
      const file = new File(['test audio content'], 'meeting.mp3', { type: 'audio/mp3' });
      const fileInput = screen.getByLabelText(/upload recording/i);
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(screen.getByText('meeting.mp3')).toBeInTheDocument();
      });
    });

    it('should validate file types', async () => {
      const invalidFile = new File(['test content'], 'document.txt', { type: 'text/plain' });
      const fileInput = screen.getByLabelText(/upload recording/i);
      
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
      });
    });

    it('should validate file size limits', async () => {
      const largeFile = new File(['x'.repeat(100 * 1024 * 1024 + 1)], 'large.mp3', { type: 'audio/mp3' });
      const fileInput = screen.getByLabelText(/upload recording/i);
      
      Object.defineProperty(fileInput, 'files', {
        value: [largeFile],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        expect(screen.getByText(/file too large/i)).toBeInTheDocument();
      });
    });
  });

  describe('Voice Memo Tab Functionality', () => {
    beforeEach(() => {
      render(<MeetingContentUpload {...defaultProps} />);
      fireEvent.click(screen.getByText('Voice Memo'));
    });

    it('should render voice recorder component', () => {
      expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();
    });

    it('should handle recording start', () => {
      const startButton = screen.getByText('Start Recording');
      fireEvent.click(startButton);
      
      // Should show recording state
      expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();
    });

    it('should handle recording completion', async () => {
      const completeButton = screen.getByText('Complete Recording');
      fireEvent.click(completeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/recording completed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Upload Progress and States', () => {
    beforeEach(() => {
      (global.fetch as any).mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      );
    });

    it('should show upload progress', async () => {
      render(<MeetingContentUpload {...defaultProps} />);
      
      const notesInput = screen.getByLabelText(/meeting notes/i);
      fireEvent.change(notesInput, { target: { value: 'Test notes' } });
      
      const uploadButton = screen.getByText(/upload notes/i);
      fireEvent.click(uploadButton);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should handle upload success', async () => {
      render(<MeetingContentUpload {...defaultProps} />);
      
      const notesInput = screen.getByLabelText(/meeting notes/i);
      fireEvent.change(notesInput, { target: { value: 'Test notes' } });
      
      const uploadButton = screen.getByText(/upload notes/i);
      fireEvent.click(uploadButton);
      
      await waitFor(() => {
        expect(screen.getByText(/upload successful/i)).toBeInTheDocument();
      });
      
      expect(defaultProps.onContentAdded).toHaveBeenCalled();
    });

    it('should handle upload errors', async () => {
      (global.fetch as any).mockImplementation(() =>
        Promise.reject(new Error('Upload failed'))
      );
      
      render(<MeetingContentUpload {...defaultProps} />);
      
      const notesInput = screen.getByLabelText(/meeting notes/i);
      fireEvent.change(notesInput, { target: { value: 'Test notes' } });
      
      const uploadButton = screen.getByText(/upload notes/i);
      fireEvent.click(uploadButton);
      
      await waitFor(() => {
        expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      render(<MeetingContentUpload {...defaultProps} />);
      
      const closeButton = screen.getByLabelText(/close/i);
      fireEvent.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when cancel button is clicked', () => {
      render(<MeetingContentUpload {...defaultProps} />);
      
      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard shortcuts', () => {
      render(<MeetingContentUpload {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
      
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<MeetingContentUpload {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      
      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab, index) => {
        expect(tab).toHaveAttribute('aria-controls', `meeting-content-tabpanel-${index}`);
      });
    });

    it('should support keyboard navigation in tabs', () => {
      render(<MeetingContentUpload {...defaultProps} />);
      
      const firstTab = screen.getByRole('tab', { name: /notes/i });
      const secondTab = screen.getByRole('tab', { name: /transcript/i });
      
      // Tab navigation
      firstTab.focus();
      fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
      expect(secondTab).toHaveFocus();
    });

    it('should have proper form labels', () => {
      render(<MeetingContentUpload {...defaultProps} />);
      
      expect(screen.getByLabelText(/meeting notes/i)).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Transcript'));
      expect(screen.getByLabelText(/meeting transcript/i)).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('should handle large text input efficiently', () => {
      render(<MeetingContentUpload {...defaultProps} />);
      
      const largeText = 'Large text content '.repeat(1000);
      const notesInput = screen.getByLabelText(/meeting notes/i);
      
      const startTime = performance.now();
      fireEvent.change(notesInput, { target: { value: largeText } });
      const endTime = performance.now();
      
      // Should handle large input within reasonable time
      expect(endTime - startTime).toBeLessThan(100);
      expect(screen.getByDisplayValue(largeText)).toBeInTheDocument();
    });

    it('should handle rapid tab switching', () => {
      render(<MeetingContentUpload {...defaultProps} />);
      
      const tabs = ['Notes', 'Transcript', 'Recording', 'Voice Memo'];
      
      // Rapidly switch between tabs
      for (let i = 0; i < 20; i++) {
        const tabName = tabs[i % tabs.length];
        fireEvent.click(screen.getByText(tabName));
      }
      
      // Should handle rapid switching without issues
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing meeting prop gracefully', () => {
      expect(() => {
        render(<MeetingContentUpload {...defaultProps} meeting={null as any} />);
      }).not.toThrow();
    });

    it('should handle network errors during upload', async () => {
      (global.fetch as any).mockImplementation(() =>
        Promise.reject(new Error('Network error'))
      );
      
      render(<MeetingContentUpload {...defaultProps} />);
      
      const notesInput = screen.getByLabelText(/meeting notes/i);
      fireEvent.change(notesInput, { target: { value: 'Test notes' } });
      
      const uploadButton = screen.getByText(/upload notes/i);
      fireEvent.click(uploadButton);
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should validate required fields before upload', () => {
      render(<MeetingContentUpload {...defaultProps} />);
      
      const uploadButton = screen.getByText(/upload notes/i);
      fireEvent.click(uploadButton);
      
      expect(screen.getByText(/notes cannot be empty/i)).toBeInTheDocument();
      expect(defaultProps.onContentAdded).not.toHaveBeenCalled();
    });
  });
});