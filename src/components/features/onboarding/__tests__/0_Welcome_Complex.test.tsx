import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockHooks } from './test-utils';
import { EnhancedWelcomeScreen } from '../0_Welcome';
import { useOnboardingState } from '@/lib/hooks/useOnboardingState';
import { useRouter } from 'next/navigation';
// Unused animation test utilities removed

// Mock the hooks
vi.mock('@/lib/hooks/useOnboardingState', () => ({
  useOnboardingState: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Keep original implementation but with much faster timing for tests

// Mock Canvas-based components that don't work in jsdom
vi.mock('../0_Welcome_Components/NetworkFormationBackground', () => ({
  NetworkFormationBackground: () => 'div',
}));

vi.mock('../0_Welcome_Components/TypewriterText', () => ({
  TypewriterText: ({ text }: { text: string }) => text,
}));

vi.mock('../0_Welcome_Components/PreviewCardsContainer', () => ({
  PreviewCardsContainer: () => 'div',
}));

describe.skip('EnhancedWelcomeScreen', () => {
  const mockNextScreen = vi.fn();
  const mockCompleteScreen = vi.fn();
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
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

  afterEach(() => {
    vi.useRealTimers();
  });
  

  describe('Brand Voice Compliance', () => {
    it('renders the welcome screen container', async () => {
      render(<EnhancedWelcomeScreen />);
      
      // Check that basic structure is present
      const container = document.querySelector('.MuiBox-root');
      expect(container).toBeInTheDocument();
    });

    it('shows the strategic tagline', async () => {
      render(<EnhancedWelcomeScreen />);
      
      // Wait for the animation sequence to complete
      await act(async () => {
        // Advance past initial delay + typewriter + transition delays
        vi.advanceTimersByTime(8000); // Total time for full sequence
        await vi.runAllTimersAsync();
      });
      
      // Look for the tagline
      await waitFor(() => {
        expect(screen.getByText('Where strategic minds cultivate extraordinary outcomes')).toBeInTheDocument();
      });
    });

    it('displays executive-appropriate CTA button text', async () => {
      render(<EnhancedWelcomeScreen />);
      
      // Wait for the full animation sequence including button appearance
      await act(async () => {
        vi.advanceTimersByTime(8000);
        await vi.runAllTimersAsync();
      });
      
      await waitFor(() => {
        expect(screen.getByText('Begin your transformation')).toBeInTheDocument();
      });
    });
  });

  describe('Animation Sequence', () => {
    it('follows the proper animation timing sequence', async () => {
      render(<EnhancedWelcomeScreen />);
      
      // All content should be present since animations are mocked
      expect(screen.getByText('Cultivate HQ')).toBeInTheDocument();
      expect(screen.getByText('Where strategic minds cultivate extraordinary outcomes')).toBeInTheDocument();
      
      // Button appears after animation sequence
      await waitFor(() => {
        expect(screen.getByText('Begin your transformation')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('shows network background animation', async () => {
      render(<EnhancedWelcomeScreen />);
      
      // The network background should be rendered (mocked as div)
      await waitFor(() => {
        // Since NetworkFormationBackground is mocked to return a div, look for it
        const networkElement = document.querySelector('div');
        expect(networkElement).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('User Interactions', () => {
    it('handles begin button click correctly', async () => {
      const user = userEvent.setup();
      render(<EnhancedWelcomeScreen />);
      
      // Wait for button to appear
      const beginButton = await screen.findByText('Begin your transformation', {}, { timeout: 2000 });
      expect(beginButton).toBeInTheDocument();
      
      // Click the button
      await user.click(beginButton);
      
      // Verify navigation functions are called
      expect(mockCompleteScreen).toHaveBeenCalledWith('welcome');
      expect(mockNextScreen).toHaveBeenCalled();
    });

    it('handles errors gracefully during navigation', async () => {
      const user = userEvent.setup();
      
      // Mock an error in completeScreen
      mockCompleteScreen.mockRejectedValueOnce(new Error('Test error'));
      
      render(<EnhancedWelcomeScreen />);
      
      const beginButton = await screen.findByText('Begin your transformation', {}, { timeout: 2000 });
      await user.click(beginButton);
      
      // Should fall back to direct navigation
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/onboarding');
      });
    });
  });

  describe('Design System Compliance', () => {
    it('uses proper typography scale', async () => {
      render(<EnhancedWelcomeScreen />);
      
      const brandName = screen.getByText('Cultivate HQ');
      const tagline = screen.getByText('Where strategic minds cultivate extraordinary outcomes');
      
      // Check that elements have proper styling
      expect(brandName).toHaveStyle({ fontWeight: '700' });
      expect(tagline).toHaveStyle({ fontWeight: '600' });
    });

    it('implements confident button interactions', async () => {
      render(<EnhancedWelcomeScreen />);
      
      const button = await screen.findByText('Begin your transformation', {}, { timeout: 2000 });
      
      // Should have proper styling for confident interactions
      expect(button).toHaveStyle({
        borderRadius: '50px',
        textTransform: 'none',
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper semantic structure', async () => {
      render(<EnhancedWelcomeScreen />);
      
      const brandName = screen.getByText('Cultivate HQ');
      expect(brandName.tagName).toBe('H2'); // Based on variant="h2"
      
      const tagline = screen.getByText('Where strategic minds cultivate extraordinary outcomes');
      expect(tagline.tagName).toBe('H3'); // Based on variant="h3"
    });

    it('supports reduced motion preferences', () => {
      // Test that animations respect prefers-reduced-motion
      render(<EnhancedWelcomeScreen />);
      
      // Check that the jsx style tag includes reduced motion support
      const styleElements = document.querySelectorAll('style');
      const hasReducedMotion = Array.from(styleElements).some(el => 
        el.textContent?.includes('@media (prefers-reduced-motion: reduce)')
      );
      expect(hasReducedMotion).toBe(true);
    });

    it('has proper button accessibility', async () => {
      render(<EnhancedWelcomeScreen />);
      
      const button = await screen.findByRole('button', { name: 'Begin your transformation' }, { timeout: 2000 });
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveAttribute('aria-disabled');
    });
  });

  describe('Performance Considerations', () => {
    it('handles component unmounting gracefully', () => {
      const { unmount } = render(<EnhancedWelcomeScreen />);
      
      // Should not throw errors when unmounted
      expect(() => unmount()).not.toThrow();
    });

    it('cleans up timeouts on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const { unmount } = render(<EnhancedWelcomeScreen />);
      
      unmount();
      
      // Should clean up any pending timeouts
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});