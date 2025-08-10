import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock interfaces matching our actual data structures
interface GoalContact {
  id: string;
  contact_id: string;
  goal_id: string;
  relationship_type: string | null;
  relevance_score: number | null;
  notes?: string;
  contacts: {
    id: string;
    name?: string;
    email?: string;
    title?: string;
    company?: string;
    profile_picture_url?: string;
  };
}

interface ArtifactStats {
  goal_id: string;
  type: 'pog' | 'ask';
  loop_status: string;
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

// Extract data processing functions for testing
export const processGoalContacts = (
  goalContactsRaw: any[],
  contactsData: any[]
): GoalContact[] => {
  return goalContactsRaw.map(gc => {
    const contactDetails = contactsData.find(c => c.id === gc.contact_id);
    
    return {
      ...gc,
      contacts: contactDetails || {
        id: gc.contact_id,
        name: 'Contact Not Found',
        email: '',
        title: '',
        company: ''
      }
    };
  });
};

export const groupGoalContactsByGoalId = (
  goalContacts: GoalContact[]
): Record<string, GoalContact[]> => {
  return goalContacts.reduce((acc, gc) => {
    // Only include goal contacts that have valid goal_ids
    if (gc.goal_id) {
      if (!acc[gc.goal_id]) acc[gc.goal_id] = [];
      acc[gc.goal_id].push(gc);
    }
    return acc;
  }, {} as Record<string, GoalContact[]>);
};

export const calculateGoalStats = (
  goalId: string,
  actionsData: any[],
  artifactsData: ArtifactStats[],
  milestonesData: any[],
  goalContacts: GoalContact[]
): GoalStats => {
  // Filter data for this specific goal
  const goalActions = actionsData.filter(a => a.goal_id === goalId);
  const goalArtifacts = artifactsData.filter(a => a.goal_id === goalId);
  const goalMilestones = milestonesData.filter(m => m.goal_id === goalId);
  const goalContactsForGoal = goalContacts.filter(gc => gc.goal_id === goalId);

  // Calculate action metrics
  const actionsOpen = goalActions.filter(a => 
    a.status === 'pending' || a.status === 'in_progress'
  ).length;
  const actionsCompleted = goalActions.filter(a => a.status === 'completed').length;

  // Calculate artifact metrics
  const asksOpen = goalArtifacts.filter(a => 
    a.type === 'ask' && a.loop_status !== 'closed'
  ).length;
  const asksCompleted = goalArtifacts.filter(a => 
    a.type === 'ask' && a.loop_status === 'closed'
  ).length;
  const pogsDelivered = goalArtifacts.filter(a => 
    a.type === 'pog' && (a.loop_status === 'delivered' || a.loop_status === 'closed')
  ).length;

  // Calculate milestone metrics
  const milestonesTotal = goalMilestones.length;
  const milestonesCompleted = goalMilestones.filter(m => 
    m.status === 'completed'
  ).length;

  return {
    contactsCount: goalContactsForGoal.length,
    actionsOpen,
    actionsCompleted,
    asksOpen,
    asksCompleted,
    pogsDelivered,
    milestonesTotal,
    milestonesCompleted,
  };
};

export const batchProcessGoalStats = (
  goalIds: string[],
  allActionsData: any[],
  allArtifactsData: ArtifactStats[],
  allMilestonesData: any[],
  goalContactsGrouped: Record<string, GoalContact[]>
): Record<string, GoalStats> => {
  const goalStats: Record<string, GoalStats> = {};
  
  for (const goalId of goalIds) {
    goalStats[goalId] = calculateGoalStats(
      goalId,
      allActionsData,
      allArtifactsData,
      allMilestonesData,
      goalContactsGrouped[goalId] || []
    );
  }
  
  return goalStats;
};

describe('Goal Data Processing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processGoalContacts', () => {
    it('should merge goal contacts with contact details', () => {
      const goalContactsRaw = [
        {
          id: 'gc1',
          goal_id: 'goal1',
          contact_id: 'contact1',
          relationship_type: 'mentor',
          relevance_score: 0.8
        },
        {
          id: 'gc2',
          goal_id: 'goal1',
          contact_id: 'contact2',
          relationship_type: 'peer',
          relevance_score: 0.6
        }
      ];

      const contactsData = [
        {
          id: 'contact1',
          name: 'John Doe',
          email: 'john@example.com',
          title: 'Senior Developer',
          company: 'Tech Corp'
        },
        {
          id: 'contact2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          title: 'Product Manager',
          company: 'Startup Inc'
        }
      ];

      const result = processGoalContacts(goalContactsRaw, contactsData);

      expect(result).toHaveLength(2);
      expect(result[0].contacts).toEqual({
        id: 'contact1',
        name: 'John Doe',
        email: 'john@example.com',
        title: 'Senior Developer',
        company: 'Tech Corp'
      });
      expect(result[1].contacts).toEqual({
        id: 'contact2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        title: 'Product Manager',
        company: 'Startup Inc'
      });
    });

    it('should handle missing contact details gracefully', () => {
      const goalContactsRaw = [
        {
          id: 'gc1',
          goal_id: 'goal1',
          contact_id: 'missing-contact',
          relationship_type: 'mentor',
          relevance_score: 0.8
        }
      ];

      const contactsData: any[] = [];

      const result = processGoalContacts(goalContactsRaw, contactsData);

      expect(result).toHaveLength(1);
      expect(result[0].contacts).toEqual({
        id: 'missing-contact',
        name: 'Contact Not Found',
        email: '',
        title: '',
        company: ''
      });
    });
  });

  describe('groupGoalContactsByGoalId', () => {
    it('should group contacts by goal ID', () => {
      const goalContacts: GoalContact[] = [
        {
          id: 'gc1',
          goal_id: 'goal1',
          contact_id: 'contact1',
          relationship_type: 'mentor',
          relevance_score: 0.8,
          contacts: { id: 'contact1', name: 'John Doe' }
        },
        {
          id: 'gc2',
          goal_id: 'goal1',
          contact_id: 'contact2',
          relationship_type: 'peer',
          relevance_score: 0.6,
          contacts: { id: 'contact2', name: 'Jane Smith' }
        },
        {
          id: 'gc3',
          goal_id: 'goal2',
          contact_id: 'contact3',
          relationship_type: 'advisor',
          relevance_score: 0.9,
          contacts: { id: 'contact3', name: 'Bob Wilson' }
        }
      ];

      const result = groupGoalContactsByGoalId(goalContacts);

      expect(Object.keys(result)).toHaveLength(2);
      expect(result['goal1']).toHaveLength(2);
      expect(result['goal2']).toHaveLength(1);
      expect(result['goal1'][0].id).toBe('gc1');
      expect(result['goal1'][1].id).toBe('gc2');
      expect(result['goal2'][0].id).toBe('gc3');
    });

    it('should filter out contacts without goal_id', () => {
      const goalContacts: GoalContact[] = [
        {
          id: 'gc1',
          goal_id: 'goal1',
          contact_id: 'contact1',
          relationship_type: 'mentor',
          relevance_score: 0.8,
          contacts: { id: 'contact1', name: 'John Doe' }
        },
        {
          id: 'gc2',
          goal_id: '', // Empty goal_id should be filtered out
          contact_id: 'contact2',
          relationship_type: 'peer',
          relevance_score: 0.6,
          contacts: { id: 'contact2', name: 'Jane Smith' }
        }
      ];

      const result = groupGoalContactsByGoalId(goalContacts);

      expect(Object.keys(result)).toHaveLength(1);
      expect(result['goal1']).toHaveLength(1);
      expect(result['']).toBeUndefined();
    });
  });

  describe('calculateGoalStats', () => {
    const mockActionsData = [
      { goal_id: 'goal1', status: 'pending' },
      { goal_id: 'goal1', status: 'completed' },
      { goal_id: 'goal1', status: 'in_progress' },
      { goal_id: 'goal2', status: 'completed' }
    ];

    const mockArtifactsData: ArtifactStats[] = [
      { goal_id: 'goal1', type: 'ask', loop_status: 'active' },
      { goal_id: 'goal1', type: 'ask', loop_status: 'closed' },
      { goal_id: 'goal1', type: 'pog', loop_status: 'delivered' },
      { goal_id: 'goal1', type: 'pog', loop_status: 'pending' },
      { goal_id: 'goal2', type: 'ask', loop_status: 'active' }
    ];

    const mockMilestonesData = [
      { goal_id: 'goal1', status: 'completed' },
      { goal_id: 'goal1', status: 'pending' },
      { goal_id: 'goal1', status: 'completed' },
      { goal_id: 'goal2', status: 'completed' }
    ];

    const mockGoalContacts: GoalContact[] = [
      {
        id: 'gc1',
        goal_id: 'goal1',
        contact_id: 'contact1',
        relationship_type: 'mentor',
        relevance_score: 0.8,
        contacts: { id: 'contact1', name: 'John Doe' }
      },
      {
        id: 'gc2',
        goal_id: 'goal1',
        contact_id: 'contact2',
        relationship_type: 'peer',
        relevance_score: 0.6,
        contacts: { id: 'contact2', name: 'Jane Smith' }
      }
    ];

    it('should calculate correct stats for a goal', () => {
      const result = calculateGoalStats(
        'goal1',
        mockActionsData,
        mockArtifactsData,
        mockMilestonesData,
        mockGoalContacts
      );

      expect(result).toEqual({
        contactsCount: 2,
        actionsOpen: 2, // pending + in_progress
        actionsCompleted: 1,
        asksOpen: 1, // active status
        asksCompleted: 1, // closed status
        pogsDelivered: 1, // delivered status
        milestonesTotal: 3,
        milestonesCompleted: 2
      });
    });

    it('should return zero stats for non-existent goal', () => {
      const result = calculateGoalStats(
        'nonexistent-goal',
        mockActionsData,
        mockArtifactsData,
        mockMilestonesData,
        mockGoalContacts
      );

      expect(result).toEqual({
        contactsCount: 0,
        actionsOpen: 0,
        actionsCompleted: 0,
        asksOpen: 0,
        asksCompleted: 0,
        pogsDelivered: 0,
        milestonesTotal: 0,
        milestonesCompleted: 0
      });
    });
  });

  describe('batchProcessGoalStats', () => {
    it('should process stats for multiple goals efficiently', () => {
      const goalIds = ['goal1', 'goal2'];
      const mockActionsData = [
        { goal_id: 'goal1', status: 'completed' },
        { goal_id: 'goal2', status: 'pending' }
      ];
      const mockArtifactsData: ArtifactStats[] = [
        { goal_id: 'goal1', type: 'pog', loop_status: 'delivered' }
      ];
      const mockMilestonesData = [
        { goal_id: 'goal1', status: 'completed' },
        { goal_id: 'goal2', status: 'pending' }
      ];
      const goalContactsGrouped = {
        'goal1': [
          {
            id: 'gc1',
            goal_id: 'goal1',
            contact_id: 'contact1',
            relationship_type: 'mentor',
            relevance_score: 0.8,
            contacts: { id: 'contact1', name: 'John Doe' }
          }
        ],
        'goal2': []
      };

      const result = batchProcessGoalStats(
        goalIds,
        mockActionsData,
        mockArtifactsData,
        mockMilestonesData,
        goalContactsGrouped
      );

      expect(Object.keys(result)).toHaveLength(2);
      expect(result['goal1'].contactsCount).toBe(1);
      expect(result['goal1'].actionsCompleted).toBe(1);
      expect(result['goal1'].pogsDelivered).toBe(1);
      expect(result['goal2'].contactsCount).toBe(0);
      expect(result['goal2'].actionsOpen).toBe(1);
    });

    it('should handle empty input arrays gracefully', () => {
      const result = batchProcessGoalStats([], [], [], [], {});
      expect(result).toEqual({});
    });
  });
});