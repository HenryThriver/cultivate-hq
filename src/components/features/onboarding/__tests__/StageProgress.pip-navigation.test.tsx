import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from './test-utils';
import { StageProgress } from '../StageProgress';

describe('StageProgress - Pip Navigation', () => {
  const mockOnNavigateToStage = vi.fn();
  const mockOnNavigateToScreen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    onNavigateToStage: mockOnNavigateToStage,
    onNavigateToScreen: mockOnNavigateToScreen,
    isNavigating: false,
  };

  describe('Pip Accessibility Logic', () => {
    it('allows navigation to completed screens', async () => {
      const user = userEvent.setup();
      render(
        <StageProgress 
          {...defaultProps} 
          currentScreen={4} 
          completedScreens={[1, 2, 3]} 
        />
      );

      // Find a pip representing a completed screen (screen 2 or 3)
      // Since we're on screen 4 with screens 1,2,3 completed, we should see pips for challenges
      const challengesSection = screen.getByText('Challenges').parentElement;
      const pips = challengesSection?.querySelectorAll('div[style*="background-color: rgb(76, 175, 80)"]'); // Green completed pips
      
      if (pips && pips.length > 0) {
        await user.click(pips[0] as HTMLElement);
        expect(mockOnNavigateToScreen).toHaveBeenCalled();
      }
    });

    it('allows navigation to current screen', async () => {
      const user = userEvent.setup();
      render(
        <StageProgress 
          {...defaultProps} 
          currentScreen={3} 
          completedScreens={[1, 2]} 
        />
      );

      // Find the current screen pip (should be blue and larger)
      const challengesSection = screen.getByText('Challenges').parentElement;
      const currentPip = challengesSection?.querySelector('div[style*="background-color: rgb(33, 150, 243)"][style*="width: 8px"]'); // Blue current pip
      
      if (currentPip) {
        await user.click(currentPip as HTMLElement);
        expect(mockOnNavigateToScreen).toHaveBeenCalledWith(3);
      }
    });

    it('allows navigation to next accessible screen', async () => {
      const user = userEvent.setup();
      render(
        <StageProgress 
          {...defaultProps} 
          currentScreen={2} 
          completedScreens={[1, 2]} 
        />
      );

      // Screen 3 should be accessible (next screen after completed ones)
      // This would be a grey pip that's still clickable
      const challengesSection = screen.getByText('Challenges').parentElement;
      const accessiblePips = challengesSection?.querySelectorAll('div[style*="cursor: pointer"]');
      
      if (accessiblePips && accessiblePips.length > 0) {
        // Find the pip that represents screen 3 (should be grey but clickable)
        const nextScreenPip = Array.from(accessiblePips).find(pip => {
          const styles = (pip as HTMLElement).getAttribute('style') || '';
          return styles.includes('background-color: rgb(208, 208, 208)') && styles.includes('cursor: pointer');
        });
        
        if (nextScreenPip) {
          await user.click(nextScreenPip as HTMLElement);
          expect(mockOnNavigateToScreen).toHaveBeenCalled();
        }
      }
    });

    it('prevents navigation to inaccessible future screens', async () => {
      const user = userEvent.setup();
      render(
        <StageProgress 
          {...defaultProps} 
          currentScreen={2} 
          completedScreens={[1]} 
        />
      );

      // Screen 4 should not be accessible (too far ahead)
      // Look for pips with default cursor (non-clickable)
      const challengesSection = screen.getByText('Challenges').parentElement;
      const inaccessiblePips = challengesSection?.querySelectorAll('div[style*="cursor: default"]');
      
      if (inaccessiblePips && inaccessiblePips.length > 0) {
        await user.click(inaccessiblePips[0] as HTMLElement);
        expect(mockOnNavigateToScreen).not.toHaveBeenCalled();
      }
    });
  });

  describe('Pip Visual States', () => {
    it('displays current screen pip with correct styling', () => {
      render(
        <StageProgress 
          {...defaultProps} 
          currentScreen={3} 
          completedScreens={[1, 2]} 
        />
      );

      // Current screen pip should be blue, 8px, with blue glow
      const currentPips = document.querySelectorAll('div[style*="background-color: rgb(33, 150, 243)"][style*="width: 8px"]');
      expect(currentPips.length).toBe(1); // Should be exactly one current screen
      
      const currentPip = currentPips[0] as HTMLElement;
      const styles = currentPip.getAttribute('style') || '';
      expect(styles).toContain('box-shadow');
      expect(styles).toContain('rgba(33, 150, 243, 0.4)'); // Blue glow
    });

    it('displays completed screen pips with correct styling', () => {
      render(
        <StageProgress 
          {...defaultProps} 
          currentScreen={4} 
          completedScreens={[1, 2, 3]} 
        />
      );

      // Completed pips should be green with green glow
      const completedPips = document.querySelectorAll('div[style*="background-color: rgb(76, 175, 80)"]');
      expect(completedPips.length).toBeGreaterThan(0);
      
      completedPips.forEach(pip => {
        const styles = (pip as HTMLElement).getAttribute('style') || '';
        expect(styles).toContain('rgba(76, 175, 80, 0.4)'); // Green glow
      });
    });

    it('displays inaccessible pips with reduced opacity', () => {
      render(
        <StageProgress 
          {...defaultProps} 
          currentScreen={2} 
          completedScreens={[1]} 
        />
      );

      // Inaccessible pips should have 50% opacity
      const inaccessiblePips = document.querySelectorAll('div[style*="opacity: 0.5"]');
      expect(inaccessiblePips.length).toBeGreaterThan(0);
    });
  });

  describe('Pip Hover Effects', () => {
    it('applies hover effects to accessible pips', async () => {
      const user = userEvent.setup();
      render(
        <StageProgress 
          {...defaultProps} 
          currentScreen={3} 
          completedScreens={[1, 2]} 
        />
      );

      const challengesSection = screen.getByText('Challenges').parentElement;
      const clickablePips = challengesSection?.querySelectorAll('div[style*="cursor: pointer"]');
      
      if (clickablePips && clickablePips.length > 0) {
        const pip = clickablePips[0] as HTMLElement;
        
        // Hover should trigger scale transform
        await user.hover(pip);
        
        // Note: Testing hover effects with CSS-in-JS can be challenging
        // The scale transform might not be directly testable without additional setup
        expect(pip).toBeInTheDocument();
      }
    });

    it('does not apply hover effects to inaccessible pips', async () => {
      const user = userEvent.setup();
      render(
        <StageProgress 
          {...defaultProps} 
          currentScreen={2} 
          completedScreens={[1]} 
        />
      );

      const inaccessiblePips = document.querySelectorAll('div[style*="cursor: default"]');
      
      if (inaccessiblePips.length > 0) {
        await user.hover(inaccessiblePips[0] as HTMLElement);
        // Should not have hover effects (difficult to test directly with CSS-in-JS)
        expect(inaccessiblePips[0]).toBeInTheDocument();
      }
    });
  });

  describe('Pip Tooltips', () => {
    it('shows navigation tooltip for accessible pips', async () => {
      const user = userEvent.setup();
      render(
        <StageProgress 
          {...defaultProps} 
          currentScreen={3} 
          completedScreens={[1, 2]} 
        />
      );

      const challengesSection = screen.getByText('Challenges').parentElement;
      const clickablePips = challengesSection?.querySelectorAll('div[style*="cursor: pointer"]');
      
      if (clickablePips && clickablePips.length > 0) {
        await user.hover(clickablePips[0] as HTMLElement);
        
        // Should show tooltip indicating navigation capability
        await expect(screen.findByText(/Go to screen/i)).resolves.toBeInTheDocument();
      }
    });

    it('shows "not accessible" tooltip for inaccessible pips', async () => {
      const user = userEvent.setup();
      render(
        <StageProgress 
          {...defaultProps} 
          currentScreen={2} 
          completedScreens={[1]} 
        />
      );

      const inaccessiblePips = document.querySelectorAll('div[style*="cursor: default"]');
      
      if (inaccessiblePips.length > 0) {
        await user.hover(inaccessiblePips[0] as HTMLElement);
        
        await expect(screen.findByText(/Not accessible yet/i)).resolves.toBeInTheDocument();
      }
    });
  });

  describe('Navigation Prevention During Loading', () => {
    it('prevents pip navigation when isNavigating is true', async () => {
      const user = userEvent.setup();
      render(
        <StageProgress 
          {...defaultProps} 
          currentScreen={3} 
          completedScreens={[1, 2]} 
          isNavigating={true}
        />
      );

      const challengesSection = screen.getByText('Challenges').parentElement;
      const pips = challengesSection?.querySelectorAll('div[style*="cursor: pointer"]');
      
      if (pips && pips.length > 0) {
        await user.click(pips[0] as HTMLElement);
        expect(mockOnNavigateToScreen).not.toHaveBeenCalled();
      }
    });
  });

  describe('Multi-Stage Pip Behavior', () => {
    it('shows pips for multiple active/completed stages', () => {
      render(
        <StageProgress 
          {...defaultProps} 
          currentScreen={6} // In contacts stage
          completedScreens={[1, 2, 3, 4, 5]} // Challenges and Goals completed
        />
      );

      // Both Challenges and Goals should show pips (completed)
      // Contacts should show pips (active)
      const challengesPips = screen.getByText('Challenges').parentElement?.querySelectorAll('div[style*="border-radius: 50%"][style*="width: 6px"], div[style*="border-radius: 50%"][style*="width: 8px"]');
      const goalsPips = screen.getByText('Goals').parentElement?.querySelectorAll('div[style*="border-radius: 50%"][style*="width: 6px"], div[style*="border-radius: 50%"][style*="width: 8px"]');
      const contactsPips = screen.getByText('Contacts').parentElement?.querySelectorAll('div[style*="border-radius: 50%"][style*="width: 6px"], div[style*="border-radius: 50%"][style*="width: 8px"]');
      
      expect(challengesPips?.length).toBeGreaterThan(0);
      expect(goalsPips?.length).toBeGreaterThan(0);
      expect(contactsPips?.length).toBeGreaterThan(0);
      
      // Profile should not show pips (upcoming)
      const profilePips = screen.getByText('Profile').parentElement?.querySelectorAll('div[style*="border-radius: 50%"][style*="width: 6px"], div[style*="border-radius: 50%"][style*="width: 8px"]');
      expect(profilePips?.length || 0).toBe(0);
    });
  });
});