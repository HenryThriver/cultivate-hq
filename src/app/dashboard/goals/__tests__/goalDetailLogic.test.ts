import { describe, it, expect } from 'vitest';

// Mock interfaces for goal detail page
interface Goal {
  id: string;
  title: string;
  description?: string | null;
  status: 'active' | 'completed' | 'paused' | 'archived';
  progress_percentage?: number | null;
  target_date?: string | null;
  created_at: string;
}

interface Action {
  id: string;
  goal_id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: number;
  due_date?: string;
  created_at: string;
}

interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  status: string | null;
  completed_at?: string | null;
  target_date?: string | null;
  order_index?: number | null;
}

// Extract business logic functions for testing
export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));
};

export const sortActionsByPriority = (actions: Action[]): Action[] => {
  return [...actions].sort((a, b) => {
    // First sort by priority (lower number = higher priority)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    
    // Then by status (pending/in_progress before completed)
    const statusOrder = { 'pending': 0, 'in_progress': 1, 'completed': 2 };
    const aStatusOrder = statusOrder[a.status] ?? 3;
    const bStatusOrder = statusOrder[b.status] ?? 3;
    
    if (aStatusOrder !== bStatusOrder) {
      return aStatusOrder - bStatusOrder;
    }
    
    // Finally by creation date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

export const sortMilestonesByOrder = (milestones: Milestone[]): Milestone[] => {
  return [...milestones].sort((a, b) => {
    // First by order_index (nulls last)
    if (a.order_index !== null && b.order_index !== null) {
      return a.order_index - b.order_index;
    }
    if (a.order_index !== null) return -1;
    if (b.order_index !== null) return 1;
    
    // Then by status (completed last)
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (b.status === 'completed' && a.status !== 'completed') return -1;
    
    // Finally by title alphabetically
    return a.title.localeCompare(b.title);
  });
};

export const getMilestoneStatusColor = (status: string | null): string => {
  switch (status) {
    case 'completed': return '#10B981'; // Green
    case 'in_progress': return '#F59E0B'; // Amber
    case 'pending': return '#6B7280'; // Gray
    case 'skipped': return '#EF4444'; // Red
    default: return '#6B7280'; // Default gray
  }
};

export const isActionOverdue = (action: Action): boolean => {
  if (!action.due_date) return false;
  return new Date(action.due_date) < new Date();
};

export const isActionHighPriority = (action: Action): boolean => {
  return action.priority === 1;
};

export const getGoalProgressColor = (percentage: number): string => {
  if (percentage >= 75) return '#10B981'; // Green for high progress
  if (percentage >= 50) return '#2196F3'; // Blue for medium progress
  if (percentage >= 25) return '#F59E0B'; // Amber for low progress
  return '#9E9E9E'; // Gray for very low progress
};

export const calculateGoalCompletion = (
  goal: Goal,
  actions: Action[],
  milestones: Milestone[]
): { isComplete: boolean; completionReasons: string[] } => {
  const reasons: string[] = [];
  
  // Check if goal is already marked complete
  if (goal.status === 'completed') {
    reasons.push('Goal status is completed');
    return { isComplete: true, completionReasons: reasons };
  }
  
  // Check if all milestones are completed
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  
  if (totalMilestones > 0 && completedMilestones === totalMilestones) {
    reasons.push(`All ${totalMilestones} milestones completed`);
  }
  
  // Check if all actions are completed
  const totalActions = actions.length;
  const completedActions = actions.filter(a => a.status === 'completed').length;
  
  if (totalActions > 0 && completedActions === totalActions) {
    reasons.push(`All ${totalActions} actions completed`);
  }
  
  // Check if progress is 100%
  if (goal.progress_percentage === 100) {
    reasons.push('Progress marked as 100%');
  }
  
  // Goal is considered complete if it has completion reasons and is not paused/archived
  const isComplete = reasons.length > 0 && goal.status === 'active';
  
  return { isComplete, completionReasons: reasons };
};

export const getUpcomingDeadlines = (actions: Action[], days: number = 7): Action[] => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);
  
  return actions
    .filter(action => {
      if (!action.due_date || action.status === 'completed') return false;
      const dueDate = new Date(action.due_date);
      return dueDate >= now && dueDate <= futureDate;
    })
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
};

describe('Goal Detail Business Logic', () => {
  describe('formatDate', () => {
    it('should format dates correctly', () => {
      // Use specific dates that work across timezones
      expect(formatDate('2024-01-15T12:00:00Z')).toMatch(/Jan 1[45], 2024/);
      expect(formatDate('2024-12-31T12:00:00Z')).toMatch(/Dec 3[01], 2024/);
    });

    it('should handle different date formats', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      expect(result).toMatch(/Jan 1[45], 2024/);
    });
  });

  describe('sortActionsByPriority', () => {
    const actions: Action[] = [
      {
        id: '1',
        goal_id: 'goal1',
        title: 'Low priority completed',
        status: 'completed',
        priority: 3,
        created_at: '2024-01-01T10:00:00Z'
      },
      {
        id: '2',
        goal_id: 'goal1',
        title: 'High priority pending',
        status: 'pending',
        priority: 1,
        created_at: '2024-01-02T10:00:00Z'
      },
      {
        id: '3',
        goal_id: 'goal1',
        title: 'Medium priority in progress',
        status: 'in_progress',
        priority: 2,
        created_at: '2024-01-03T10:00:00Z'
      },
      {
        id: '4',
        goal_id: 'goal1',
        title: 'High priority in progress',
        status: 'in_progress',
        priority: 1,
        created_at: '2024-01-04T10:00:00Z'
      }
    ];

    it('should sort by priority first', () => {
      const sorted = sortActionsByPriority(actions);
      expect(sorted[0].priority).toBe(1);
      expect(sorted[1].priority).toBe(1);
      expect(sorted[2].priority).toBe(2);
      expect(sorted[3].priority).toBe(3);
    });

    it('should sort by status within same priority', () => {
      const sorted = sortActionsByPriority(actions);
      const highPriorityActions = sorted.filter(a => a.priority === 1);
      
      // Within priority 1, pending should come before in_progress
      expect(highPriorityActions[0].status).toBe('pending');
      expect(highPriorityActions[1].status).toBe('in_progress');
    });

    it('should not mutate original array', () => {
      const originalOrder = actions.map(a => a.id);
      sortActionsByPriority(actions);
      expect(actions.map(a => a.id)).toEqual(originalOrder);
    });
  });

  describe('sortMilestonesByOrder', () => {
    const milestones: Milestone[] = [
      {
        id: '1',
        goal_id: 'goal1',
        title: 'Z Milestone',
        status: 'completed',
        order_index: null
      },
      {
        id: '2',
        goal_id: 'goal1',
        title: 'A Milestone',
        status: 'pending',
        order_index: 2
      },
      {
        id: '3',
        goal_id: 'goal1',
        title: 'B Milestone',
        status: 'pending',
        order_index: 1
      },
      {
        id: '4',
        goal_id: 'goal1',
        title: 'A Milestone',
        status: 'pending',
        order_index: null
      }
    ];

    it('should sort by order_index first', () => {
      const sorted = sortMilestonesByOrder(milestones);
      expect(sorted[0].order_index).toBe(1);
      expect(sorted[1].order_index).toBe(2);
    });

    it('should put completed milestones last when order_index is null', () => {
      const sorted = sortMilestonesByOrder(milestones);
      const nullOrderItems = sorted.filter(m => m.order_index === null);
      
      // Among null order_index items, non-completed should come before completed
      expect(nullOrderItems[0].status).toBe('pending');
      expect(nullOrderItems[1].status).toBe('completed');
    });

    it('should sort alphabetically within same status and null order', () => {
      const sorted = sortMilestonesByOrder(milestones);
      const nullOrderPending = sorted.filter(m => m.order_index === null && m.status === 'pending');
      expect(nullOrderPending[0].title).toBe('A Milestone');
    });
  });

  describe('getMilestoneStatusColor', () => {
    it('should return correct colors for each status', () => {
      expect(getMilestoneStatusColor('completed')).toBe('#10B981');
      expect(getMilestoneStatusColor('in_progress')).toBe('#F59E0B');
      expect(getMilestoneStatusColor('pending')).toBe('#6B7280');
      expect(getMilestoneStatusColor('skipped')).toBe('#EF4444');
      expect(getMilestoneStatusColor(null)).toBe('#6B7280');
      expect(getMilestoneStatusColor('unknown')).toBe('#6B7280');
    });
  });

  describe('isActionOverdue', () => {
    it('should identify overdue actions', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const overdueAction: Action = {
        id: '1',
        goal_id: 'goal1',
        title: 'Overdue',
        status: 'pending',
        priority: 1,
        due_date: yesterday.toISOString(),
        created_at: '2024-01-01T10:00:00Z'
      };

      expect(isActionOverdue(overdueAction)).toBe(true);
    });

    it('should not mark future actions as overdue', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const futureAction: Action = {
        id: '1',
        goal_id: 'goal1',
        title: 'Future',
        status: 'pending',
        priority: 1,
        due_date: tomorrow.toISOString(),
        created_at: '2024-01-01T10:00:00Z'
      };

      expect(isActionOverdue(futureAction)).toBe(false);
    });

    it('should handle actions without due dates', () => {
      const actionWithoutDue: Action = {
        id: '1',
        goal_id: 'goal1',
        title: 'No due date',
        status: 'pending',
        priority: 1,
        created_at: '2024-01-01T10:00:00Z'
      };

      expect(isActionOverdue(actionWithoutDue)).toBe(false);
    });
  });

  describe('calculateGoalCompletion', () => {
    const baseGoal: Goal = {
      id: 'goal1',
      title: 'Test Goal',
      status: 'active',
      created_at: '2024-01-01T10:00:00Z'
    };

    it('should identify completed goal by status', () => {
      const completedGoal = { ...baseGoal, status: 'completed' as const };
      const result = calculateGoalCompletion(completedGoal, [], []);
      
      expect(result.isComplete).toBe(true);
      expect(result.completionReasons).toContain('Goal status is completed');
    });

    it('should identify completion by milestones', () => {
      const milestones: Milestone[] = [
        { id: '1', goal_id: 'goal1', title: 'M1', status: 'completed' },
        { id: '2', goal_id: 'goal1', title: 'M2', status: 'completed' }
      ];
      
      const result = calculateGoalCompletion(baseGoal, [], milestones);
      
      expect(result.isComplete).toBe(true);
      expect(result.completionReasons).toContain('All 2 milestones completed');
    });

    it('should identify completion by actions', () => {
      const actions: Action[] = [
        {
          id: '1',
          goal_id: 'goal1',
          title: 'A1',
          status: 'completed',
          priority: 1,
          created_at: '2024-01-01T10:00:00Z'
        },
        {
          id: '2',
          goal_id: 'goal1',
          title: 'A2',
          status: 'completed',
          priority: 1,
          created_at: '2024-01-01T10:00:00Z'
        }
      ];
      
      const result = calculateGoalCompletion(baseGoal, actions, []);
      
      expect(result.isComplete).toBe(true);
      expect(result.completionReasons).toContain('All 2 actions completed');
    });

    it('should identify completion by progress percentage', () => {
      const goalAt100 = { ...baseGoal, progress_percentage: 100 };
      
      const result = calculateGoalCompletion(goalAt100, [], []);
      
      expect(result.isComplete).toBe(true);
      expect(result.completionReasons).toContain('Progress marked as 100%');
    });

    it('should not mark paused goals as complete', () => {
      const pausedGoal = { ...baseGoal, status: 'paused' as const, progress_percentage: 100 };
      
      const result = calculateGoalCompletion(pausedGoal, [], []);
      
      expect(result.isComplete).toBe(false);
      expect(result.completionReasons).toContain('Progress marked as 100%');
    });
  });

  describe('getUpcomingDeadlines', () => {
    it('should find actions due within specified days', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 8);
      
      const actions: Action[] = [
        {
          id: '1',
          goal_id: 'goal1',
          title: 'Due tomorrow',
          status: 'pending',
          priority: 1,
          due_date: tomorrow.toISOString(),
          created_at: '2024-01-01T10:00:00Z'
        },
        {
          id: '2',
          goal_id: 'goal1',
          title: 'Due next week',
          status: 'pending',
          priority: 1,
          due_date: nextWeek.toISOString(),
          created_at: '2024-01-01T10:00:00Z'
        }
      ];

      const upcoming = getUpcomingDeadlines(actions, 7);
      
      expect(upcoming).toHaveLength(1);
      expect(upcoming[0].title).toBe('Due tomorrow');
    });

    it('should exclude completed actions', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const actions: Action[] = [
        {
          id: '1',
          goal_id: 'goal1',
          title: 'Completed tomorrow',
          status: 'completed',
          priority: 1,
          due_date: tomorrow.toISOString(),
          created_at: '2024-01-01T10:00:00Z'
        }
      ];

      const upcoming = getUpcomingDeadlines(actions, 7);
      
      expect(upcoming).toHaveLength(0);
    });

    it('should sort by due date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      
      const actions: Action[] = [
        {
          id: '1',
          goal_id: 'goal1',
          title: 'Due day after',
          status: 'pending',
          priority: 1,
          due_date: dayAfter.toISOString(),
          created_at: '2024-01-01T10:00:00Z'
        },
        {
          id: '2',
          goal_id: 'goal1',
          title: 'Due tomorrow',
          status: 'pending',
          priority: 1,
          due_date: tomorrow.toISOString(),
          created_at: '2024-01-01T10:00:00Z'
        }
      ];

      const upcoming = getUpcomingDeadlines(actions, 7);
      
      expect(upcoming[0].title).toBe('Due tomorrow');
      expect(upcoming[1].title).toBe('Due day after');
    });
  });
});