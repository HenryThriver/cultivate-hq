import { describe, it, expect } from 'vitest';

// Import the business logic functions we need to test
// These are currently inline functions in the components, but we'll extract them for testing

interface Goal {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  timeline?: string | null;
  success_criteria?: string | null;
  target_contact_count?: number | null;
  progress_percentage?: number | null;
  target_date?: string | null;
  status: 'active' | 'completed' | 'paused' | 'archived';
  priority?: number | null;
  is_primary?: boolean | null;
  created_at: string;
  updated_at: string;
}

interface GoalStats {
  contactsCount: number;
  actionsOpen: number;
  actionsCompleted: number;
  asksOpen: number;
  asksCompleted: number;
  pogsDelivered: number;
  milestonesTotal: number;
  milestonesCompleted: number;
}

// Extract business logic functions for testing
export const getProgressPercentage = (goal: Goal, stats: GoalStats): number => {
  // Calculate multi-factor progress
  const contactProgress = goal.target_contact_count ? 
    (stats.contactsCount / goal.target_contact_count) : 0;
  const actionProgress = (stats.actionsCompleted + stats.actionsOpen) > 0 ?
    stats.actionsCompleted / (stats.actionsCompleted + stats.actionsOpen) : 0;
  const milestoneProgress = stats.milestonesTotal > 0 ?
    stats.milestonesCompleted / stats.milestonesTotal : 0;
  
  // Weighted average with milestone progress having most weight
  const calculatedProgress = 
    (contactProgress * 0.3) + 
    (actionProgress * 0.3) + 
    (milestoneProgress * 0.4);
  
  // Use goal's stored progress if higher (allows manual override)
  return Math.max(goal.progress_percentage || 0, Math.round(calculatedProgress * 100));
};

export const getStatusColor = (status: Goal['status']): 'primary' | 'success' | 'warning' | 'default' => {
  switch (status) {
    case 'active': return 'primary';
    case 'completed': return 'success';
    case 'paused': return 'warning';
    case 'archived': return 'default';
    default: return 'default';
  }
};

export const getPriorityColor = (priority?: number | null): string => {
  if (!priority) return 'transparent';
  if (priority === 1) return '#F59E0B'; // Amber for top priority
  if (priority === 2) return '#2196F3'; // Primary blue
  return 'transparent';
};

export const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (!error) return 'An unexpected error occurred. Please try again.';
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Database connection errors
  if (errorMessage.includes('connection') || errorMessage.includes('network')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  
  // Authentication errors
  if (errorMessage.includes('JWT') || errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
    return 'Your session has expired. Please refresh the page and sign in again.';
  }
  
  // Permission errors
  if (errorMessage.includes('permission') || errorMessage.includes('access denied')) {
    return 'You don\'t have permission to access this information. Please contact support if this seems incorrect.';
  }
  
  // Database constraint errors
  if (errorMessage.includes('constraint') || errorMessage.includes('duplicate')) {
    return 'This action conflicts with existing data. Please check your input and try again.';
  }
  
  // Column/table errors (during migration periods)
  if (errorMessage.includes('column') || errorMessage.includes('table') || errorMessage.includes('relation')) {
    return 'We\'re updating the system. Please refresh the page in a moment and try again.';
  }
  
  // Rate limiting
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  // Generic fallback for unknown errors
  return 'Something went wrong while loading your goals. Please refresh the page and try again.';
};

describe('Goal Business Logic', () => {
  describe('getProgressPercentage', () => {
    const baseGoal: Goal = {
      id: 'test-goal',
      title: 'Test Goal',
      status: 'active',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    };

    it('should calculate progress based on milestones when available', () => {
      const goal: Goal = {
        ...baseGoal,
        target_contact_count: 10,
        progress_percentage: 0
      };

      const stats: GoalStats = {
        contactsCount: 5,
        actionsOpen: 2,
        actionsCompleted: 3,
        asksOpen: 1,
        asksCompleted: 2,
        pogsDelivered: 3,
        milestonesTotal: 4,
        milestonesCompleted: 2
      };

      const result = getProgressPercentage(goal, stats);
      
      // Expected: (0.5 * 0.3) + (0.6 * 0.3) + (0.5 * 0.4) = 0.53 = 53%
      expect(result).toBe(53);
    });

    it('should use stored progress if higher than calculated', () => {
      const goal: Goal = {
        ...baseGoal,
        progress_percentage: 80
      };

      const stats: GoalStats = {
        contactsCount: 1,
        actionsOpen: 1,
        actionsCompleted: 1,
        asksOpen: 0,
        asksCompleted: 0,
        pogsDelivered: 0,
        milestonesTotal: 2,
        milestonesCompleted: 1
      };

      const result = getProgressPercentage(goal, stats);
      expect(result).toBe(80); // Should use stored progress
    });

    it('should handle zero values gracefully', () => {
      const goal: Goal = {
        ...baseGoal,
        progress_percentage: null,
        target_contact_count: null
      };

      const stats: GoalStats = {
        contactsCount: 0,
        actionsOpen: 0,
        actionsCompleted: 0,
        asksOpen: 0,
        asksCompleted: 0,
        pogsDelivered: 0,
        milestonesTotal: 0,
        milestonesCompleted: 0
      };

      const result = getProgressPercentage(goal, stats);
      expect(result).toBe(0);
    });

    it('should calculate 100% progress when all metrics are complete', () => {
      const goal: Goal = {
        ...baseGoal,
        target_contact_count: 5,
        progress_percentage: 0
      };

      const stats: GoalStats = {
        contactsCount: 5, // 100% of target
        actionsOpen: 0,
        actionsCompleted: 5, // 100% of actions
        asksOpen: 0,
        asksCompleted: 5,
        pogsDelivered: 5,
        milestonesTotal: 4,
        milestonesCompleted: 4 // 100% of milestones
      };

      const result = getProgressPercentage(goal, stats);
      expect(result).toBe(100);
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for each status', () => {
      expect(getStatusColor('active')).toBe('primary');
      expect(getStatusColor('completed')).toBe('success');
      expect(getStatusColor('paused')).toBe('warning');
      expect(getStatusColor('archived')).toBe('default');
    });

    it('should return default for invalid status', () => {
      expect(getStatusColor('invalid' as Goal['status'])).toBe('default');
    });
  });

  describe('getPriorityColor', () => {
    it('should return correct colors for priority levels', () => {
      expect(getPriorityColor(1)).toBe('#F59E0B'); // Amber for highest priority
      expect(getPriorityColor(2)).toBe('#2196F3'); // Blue for high priority
      expect(getPriorityColor(3)).toBe('transparent'); // No color for lower priorities
    });

    it('should handle null and undefined priority', () => {
      expect(getPriorityColor(null)).toBe('transparent');
      expect(getPriorityColor(undefined)).toBe('transparent');
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('should handle connection errors', () => {
      const error = new Error('network connection failed');
      const result = getUserFriendlyErrorMessage(error);
      expect(result).toBe('Unable to connect to the server. Please check your internet connection and try again.');
    });

    it('should handle authentication errors', () => {
      const error = new Error('JWT token expired');
      const result = getUserFriendlyErrorMessage(error);
      expect(result).toBe('Your session has expired. Please refresh the page and sign in again.');
    });

    it('should handle permission errors', () => {
      const error = new Error('access denied - insufficient permissions');
      const result = getUserFriendlyErrorMessage(error);
      expect(result).toBe('You don\'t have permission to access this information. Please contact support if this seems incorrect.');
    });

    it('should handle database constraint errors', () => {
      const error = new Error('duplicate key constraint violation');
      const result = getUserFriendlyErrorMessage(error);
      expect(result).toBe('This action conflicts with existing data. Please check your input and try again.');
    });

    it('should handle migration-related errors', () => {
      const error = new Error('column "goal_id" does not exist');
      const result = getUserFriendlyErrorMessage(error);
      expect(result).toBe('We\'re updating the system. Please refresh the page in a moment and try again.');
    });

    it('should handle rate limiting errors', () => {
      const error = new Error('rate limit exceeded - too many requests');
      const result = getUserFriendlyErrorMessage(error);
      expect(result).toBe('Too many requests. Please wait a moment and try again.');
    });

    it('should provide generic message for unknown errors', () => {
      const error = new Error('something completely unexpected');
      const result = getUserFriendlyErrorMessage(error);
      expect(result).toBe('Something went wrong while loading your goals. Please refresh the page and try again.');
    });

    it('should handle non-Error objects', () => {
      const result1 = getUserFriendlyErrorMessage('string error');
      const result2 = getUserFriendlyErrorMessage(null);
      const result3 = getUserFriendlyErrorMessage(undefined);
      
      expect(result1).toBe('Something went wrong while loading your goals. Please refresh the page and try again.');
      expect(result2).toBe('An unexpected error occurred. Please try again.');
      expect(result3).toBe('An unexpected error occurred. Please try again.');
    });
  });
});