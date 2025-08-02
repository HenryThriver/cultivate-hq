import { describe, it, expect } from 'vitest';
import { render, screen } from './test-utils';
import { RelationshipPortfolioStats } from '../RelationshipPortfolioStats';
import { MomentumCelebration } from '../MomentumCelebration';
import { ActionPriorityHub } from '../ActionPriorityHub';

describe('Dashboard Components Basic Tests', () => {
  describe('RelationshipPortfolioStats', () => {
    it('renders without crashing', () => {
      const { container } = render(<RelationshipPortfolioStats />);
      expect(container).toBeTruthy();
    });

    it('displays portfolio metrics', () => {
      render(<RelationshipPortfolioStats />);
      
      // Check for key metric categories
      expect(screen.getByText('Momentum')).toBeInTheDocument();
      expect(screen.getByText('Activation')).toBeInTheDocument();
      expect(screen.getByText('Depth')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    it('shows metric values', () => {
      render(<RelationshipPortfolioStats />);
      
      // Check that numeric values are displayed
      expect(screen.getByText('15')).toBeInTheDocument(); // actions
      expect(screen.getByText('75%')).toBeInTheDocument(); // response rate
      expect(screen.getByText('7.8')).toBeInTheDocument(); // quality index
    });
  });

  describe('MomentumCelebration', () => {
    it('renders without crashing', () => {
      const { container } = render(<MomentumCelebration />);
      expect(container).toBeTruthy();
    });

    it('displays recent wins section', () => {
      render(<MomentumCelebration />);
      expect(screen.getByText('Recent Wins')).toBeInTheDocument();
    });

    it('shows achievement count', () => {
      render(<MomentumCelebration />);
      expect(screen.getByText('3 achievements')).toBeInTheDocument();
    });
  });

  describe('ActionPriorityHub', () => {
    it('renders without crashing', () => {
      const { container } = render(<ActionPriorityHub />);
      expect(container).toBeTruthy();
    });

    it('displays priority actions title', () => {
      render(<ActionPriorityHub />);
      expect(screen.getByText('Priority Actions')).toBeInTheDocument();
    });

    it('shows action tabs', () => {
      render(<ActionPriorityHub />);
      
      // Check for tab labels
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);
      expect(screen.getByText('Quick Wins')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('all components can render together', () => {
      const { container } = render(
        <>
          <RelationshipPortfolioStats />
          <MomentumCelebration />
          <ActionPriorityHub />
        </>
      );
      
      expect(container).toBeTruthy();
      
      // Check that key elements from each component are present
      expect(screen.getByText('Momentum')).toBeInTheDocument();
      expect(screen.getByText('Recent Wins')).toBeInTheDocument();
      expect(screen.getByText('Priority Actions')).toBeInTheDocument();
    });
  });
});