import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockHooks } from './test-utils';
import { EnhancedWelcomeScreen } from '../0_Welcome';
import { useOnboardingState } from '@/lib/hooks/useOnboardingState';
import { useRouter } from 'next/navigation';

// Mock the hooks
vi.mock('@/lib/hooks/useOnboardingState', () => ({
  useOnboardingState: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('EnhancedWelcomeScreen (Simple)', () => {
  const mockNextScreen = vi.fn();
  const mockCompleteScreen = vi.fn();
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock implementations
    vi.mocked(useOnboardingState).mockReturnValue({
      ...mockHooks.useOnboardingState(),
      nextScreen: mockNextScreen,
      completeScreen: mockCompleteScreen,
      currentScreen: 1,
      currentScreenName: 'welcome',
    });

    vi.mocked(useRouter).mockReturnValue({
      ...mockHooks.useRouter(),
      push: mockPush,
    });
  });

  describe('Content Rendering', () => {
    it('renders all content immediately with skipAnimations', () => {
      render(<EnhancedWelcomeScreen skipAnimations={true} />);
      
      // All content should be present in the DOM immediately
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Cultivate HQ')).toBeInTheDocument();
      expect(screen.getByText('Where strategic minds cultivate extraordinary outcomes')).toBeInTheDocument();
      expect(screen.getByText('Begin your transformation')).toBeInTheDocument();
    });

    it('renders network background with skipAnimations', () => {
      render(<EnhancedWelcomeScreen skipAnimations={true} />);
      
      // Network should be present immediately
      expect(screen.getByTestId('network-background')).toBeInTheDocument();
    });
  });

  describe('Brand Voice Compliance', () => {
    it('shows the strategic tagline', () => {
      render(<EnhancedWelcomeScreen skipAnimations={true} />);
      
      expect(screen.getByText('Where strategic minds cultivate extraordinary outcomes')).toBeInTheDocument();
    });

    it('displays executive-appropriate CTA button text', () => {
      render(<EnhancedWelcomeScreen skipAnimations={true} />);
      
      expect(screen.getByText('Begin your transformation')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles begin button click correctly', async () => {
      const user = userEvent.setup();
      render(<EnhancedWelcomeScreen skipAnimations={true} />);
      
      const beginButton = screen.getByText('Begin your transformation');
      expect(beginButton).toBeInTheDocument();
      
      await user.click(beginButton);
      
      // Verify navigation functions are called
      expect(mockCompleteScreen).toHaveBeenCalledWith(1);
      expect(mockNextScreen).toHaveBeenCalled();
    });

    it('handles errors gracefully during navigation', async () => {
      const user = userEvent.setup();
      
      // Mock an error in completeScreen
      mockCompleteScreen.mockRejectedValueOnce(new Error('Test error'));
      
      render(<EnhancedWelcomeScreen skipAnimations={true} />);
      
      const beginButton = screen.getByText('Begin your transformation');
      await user.click(beginButton);
      
      // Should fall back to direct navigation
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/onboarding');
      });
    });
  });

  describe('Design System Compliance', () => {
    it('uses proper typography scale', () => {
      render(<EnhancedWelcomeScreen skipAnimations={true} />);
      
      const brandName = screen.getByText('Cultivate HQ');
      const tagline = screen.getByText('Where strategic minds cultivate extraordinary outcomes');
      
      // Check that elements have proper styling
      expect(brandName).toHaveStyle({ fontWeight: '700' });
      expect(tagline).toHaveStyle({ fontWeight: '600' });
    });

    it('implements confident button interactions', () => {
      render(<EnhancedWelcomeScreen skipAnimations={true} />);
      
      const button = screen.getByText('Begin your transformation');
      
      // Should have proper styling for confident interactions
      expect(button).toHaveStyle({
        borderRadius: '50px',
        textTransform: 'none',
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper semantic structure', () => {
      render(<EnhancedWelcomeScreen skipAnimations={true} />);
      
      const brandName = screen.getByText('Cultivate HQ');
      expect(brandName.tagName).toBe('H2'); // Based on variant="h2"
      
      const tagline = screen.getByText('Where strategic minds cultivate extraordinary outcomes');
      expect(tagline.tagName).toBe('H3'); // Based on variant="h3"
    });

    it('supports reduced motion preferences', () => {
      render(<EnhancedWelcomeScreen skipAnimations={true} />);
      
      // Check that the jsx style tag includes reduced motion support
      const styleElements = document.querySelectorAll('style');
      const hasReducedMotion = Array.from(styleElements).some(el => 
        el.textContent?.includes('@media (prefers-reduced-motion: reduce)')
      );
      expect(hasReducedMotion).toBe(true);
    });

    it('has proper button accessibility', () => {
      render(<EnhancedWelcomeScreen skipAnimations={true} />);
      
      const button = screen.getByRole('button', { name: 'Begin your transformation' });
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveAttribute('aria-disabled');
    });
  });

  describe('Performance Considerations', () => {
    it('handles component unmounting gracefully', () => {
      const { unmount } = render(<EnhancedWelcomeScreen skipAnimations={true} />);
      
      // Should not throw errors when unmounted
      expect(() => unmount()).not.toThrow();
    });
  });
});