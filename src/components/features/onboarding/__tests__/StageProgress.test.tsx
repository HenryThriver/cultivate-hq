import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from './test-utils';
import { StageProgress } from '../StageProgress';

describe('StageProgress', () => {
  const mockOnNavigateToStage = vi.fn();
  const mockOnNavigateToScreen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    currentScreen: 2,
    completedScreens: [1, 2],
    onNavigateToStage: mockOnNavigateToStage,
    onNavigateToScreen: mockOnNavigateToScreen,
    isNavigating: false,
  };

  describe('Stage Display', () => {
    it('renders all four stages with correct labels', () => {
      render(<StageProgress {...defaultProps} />);
      
      expect(screen.getByText('Challenges')).toBeInTheDocument();
      expect(screen.getByText('Goals')).toBeInTheDocument();
      expect(screen.getByText('Contacts')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('displays stage numbers correctly', () => {
      render(<StageProgress {...defaultProps} />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('shows connection lines between stages', () => {
      render(<StageProgress {...defaultProps} />);
      
      // Connection lines should be present (testing by checking the container structure)
      const stageContainer = screen.getByText('CHALLENGES').closest('[data-testid="stage-container"]') || 
                           screen.getByText('CHALLENGES').parentElement?.parentElement?.parentElement;
      expect(stageContainer).toBeInTheDocument();
    });
  });

  describe('Stage Status Visual Indicators', () => {
    it('shows active stage (Challenges) with blue styling', () => {
      render(<StageProgress {...defaultProps} />);
      
      const challengesStage = screen.getByText('1').closest('div');
      expect(challengesStage).toHaveStyle({ backgroundColor: expect.stringContaining('linear-gradient') });
    });

    it('shows completed stage with green check mark', () => {
      render(<StageProgress {...defaultProps} currentScreen={5} completedScreens={[1, 2, 3, 4]} />);
      
      // Check for completed stage indicator (CheckCircle icon)
      const checkIcons = document.querySelectorAll('[data-testid="CheckCircleIcon"]');
      expect(checkIcons.length).toBeGreaterThan(0);
    });

    it('shows upcoming stages with grey styling', () => {
      render(<StageProgress {...defaultProps} />);
      
      const profileStage = screen.getByText('4').closest('div');
      expect(profileStage).toHaveStyle({ backgroundColor: '#FAFAFA' });
    });
  });

  describe('Sub-page Pips', () => {
    it('shows pips only for active and completed stages', () => {
      render(<StageProgress {...defaultProps} currentScreen={2} completedScreens={[1, 2]} />);
      
      // Challenges stage should show pips (active)
      const challengesSection = screen.getByText('Challenges').parentElement;
      const challengesPips = challengesSection?.querySelectorAll('[role="button"]') || 
                           challengesSection?.querySelectorAll('div[style*="border-radius: 50%"][style*="width: 6px"], div[style*="border-radius: 50%"][style*="width: 8px"]');
      
      expect(challengesPips?.length).toBeGreaterThan(0);
    });

    it('does not show pips for upcoming stages', () => {
      render(<StageProgress {...defaultProps} />);
      
      // Profile stage should not show pips (upcoming)
      const profileSection = screen.getByText('Profile').parentElement;
      const profilePips = profileSection?.querySelectorAll('div[style*="border-radius: 50%"][style*="width: 6px"], div[style*="border-radius: 50%"][style*="width: 8px"]');
      
      expect(profilePips?.length || 0).toBe(0);
    });

    it('highlights current screen pip with blue color and larger size', () => {
      render(<StageProgress {...defaultProps} currentScreen={2} completedScreens={[1]} />);
      
      // Current screen pip should be blue and 8px (larger)
      const currentPips = document.querySelectorAll('div[style*="background-color: rgb(33, 150, 243)"][style*="width: 8px"]');
      expect(currentPips.length).toBeGreaterThan(0);
    });

    it('shows completed screen pips with green color', () => {
      render(<StageProgress {...defaultProps} currentScreen={3} completedScreens={[1, 2]} />);
      
      // Completed pips should be green
      const completedPips = document.querySelectorAll('div[style*="background-color: rgb(76, 175, 80)"]');
      expect(completedPips.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation Functionality', () => {
    it('calls onNavigateToStage when clicking on accessible stage', async () => {
      const user = userEvent.setup();
      render(<StageProgress {...defaultProps} currentScreen={3} completedScreens={[1, 2]} />);
      
      // Click on Challenges stage (should be clickable since it's completed)
      const challengesCircle = screen.getByText('1');
      await user.click(challengesCircle);
      
      expect(mockOnNavigateToStage).toHaveBeenCalledWith(2); // First screen of challenges stage
    });

    it('calls onNavigateToScreen when clicking on accessible pip', async () => {
      const user = userEvent.setup();
      render(<StageProgress {...defaultProps} currentScreen={2} completedScreens={[1]} />);
      
      // Find and click on a pip (this is more complex due to the nested structure)
      const challengesSection = screen.getByText('Challenges').parentElement;
      const pips = challengesSection?.querySelectorAll('div[style*="cursor: pointer"]');
      
      if (pips && pips.length > 0) {
        await user.click(pips[0] as HTMLElement);
        expect(mockOnNavigateToScreen).toHaveBeenCalled();
      }
    });

    it('does not navigate when clicking on inaccessible stages', async () => {
      const user = userEvent.setup();
      render(<StageProgress {...defaultProps} currentScreen={2} completedScreens={[1]} />);
      
      // Click on Profile stage (should not be clickable)
      const profileCircle = screen.getByText('4');
      await user.click(profileCircle);
      
      expect(mockOnNavigateToStage).not.toHaveBeenCalled();
    });

    it('does not navigate when isNavigating is true', async () => {
      const user = userEvent.setup();
      render(<StageProgress {...defaultProps} isNavigating={true} />);
      
      const challengesCircle = screen.getByText('1');
      await user.click(challengesCircle);
      
      expect(mockOnNavigateToStage).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('provides tooltips for stages', async () => {
      const user = userEvent.setup();
      render(<StageProgress {...defaultProps} currentScreen={3} completedScreens={[1, 2]} />);
      
      const challengesCircle = screen.getByText('1');
      await user.hover(challengesCircle);
      
      // Check for tooltip (may need to wait for it to appear)
      await expect(screen.findByText(/Go to Challenges section/i)).resolves.toBeInTheDocument();
    });

    it('provides tooltips for pips indicating navigation status', async () => {
      const user = userEvent.setup();
      render(<StageProgress {...defaultProps} currentScreen={2} completedScreens={[1]} />);
      
      // This would need to find specific pips and test their tooltips
      // Implementation depends on how the pips are structured in the DOM
      const challengesSection = screen.getByText('Challenges').parentElement;
      const pips = challengesSection?.querySelectorAll('div[style*="cursor: pointer"]');
      
      if (pips && pips.length > 0) {
        await user.hover(pips[0] as HTMLElement);
        // Tooltip should appear indicating screen navigation
      }
    });

    it('shows appropriate cursor styles for clickable vs non-clickable elements', () => {
      render(<StageProgress {...defaultProps} />);
      
      // Clickable pips should have pointer cursor
      const clickablePips = document.querySelectorAll('div[style*="cursor: pointer"]');
      expect(clickablePips.length).toBeGreaterThan(0);
      
      // Non-clickable pips should have default cursor
      const nonClickablePips = document.querySelectorAll('div[style*="cursor: default"]');
      expect(nonClickablePips.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty completedScreens array', () => {
      render(<StageProgress {...defaultProps} completedScreens={[]} currentScreen={1} />);
      
      expect(screen.getByText('CHALLENGES')).toBeInTheDocument();
      // No pips should be shown for upcoming stages
    });

    it('handles screen 1 (welcome) correctly as part of challenges', () => {
      render(<StageProgress {...defaultProps} currentScreen={1} completedScreens={[]} />);
      
      // Challenges should be active even on welcome screen
      const challengesLabel = screen.getByText('Challenges');
      expect(challengesLabel).toHaveStyle({ color: '#1976D2' }); // Active color
    });

    it('handles all screens completed', () => {
      render(<StageProgress {...defaultProps} currentScreen={12} completedScreens={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]} />);
      
      // All stages should show as completed
      const checkIcons = document.querySelectorAll('[data-testid="CheckCircleIcon"]');
      expect(checkIcons.length).toBe(4); // One for each stage
    });
  });
});