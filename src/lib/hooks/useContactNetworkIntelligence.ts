import { useState, useEffect } from 'react';
import { ContactRelationship, GoalContactTarget } from '@/types/networkTypes';

interface ContactNetworkIntelligence {
  relationships: ContactRelationship[];
  goalTargets: GoalContactTarget[];
  networkConnectionsCount: number;
  recentIntroductions: number;
  introductionSuccessRate: number;
}

// Mock data for development/testing
const generateMockData = (contactId: string): ContactNetworkIntelligence => {
  const mockRelationships: ContactRelationship[] = [
    {
      id: 'rel-1',
      contact_a_id: contactId,
      contact_b_id: 'contact-2',
      relationship_type: 'known_connection',
      strength: 'strong',
      context: 'Former colleagues at Tech Corp',
      created_at: new Date().toISOString(),
    },
    {
      id: 'rel-2',
      contact_a_id: contactId,
      contact_b_id: 'contact-3',
      relationship_type: 'introduced_by_me',
      strength: 'medium',
      context: 'Introduced at networking event',
      introduction_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      introduction_successful: true,
      created_at: new Date().toISOString(),
    },
  ];

  const mockGoalTargets: GoalContactTarget[] = [
    {
      id: 'target-1',
      goal_id: 'goal-1',
      contact_id: contactId,
      target_description: 'Get introduction to their CTO',
      target_type: 'introduction',
      priority: 'high',
      status: 'active',
      notes: 'They mentioned knowing the CTO well',
      created_at: new Date().toISOString(),
    },
  ];

  return {
    relationships: mockRelationships,
    goalTargets: mockGoalTargets,
    networkConnectionsCount: mockRelationships.length,
    recentIntroductions: 1,
    introductionSuccessRate: 100,
  };
};

export const useContactNetworkIntelligence = (contactId: string) => {
  const [networkIntelligence, setNetworkIntelligence] = useState<ContactNetworkIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      try {
        setNetworkIntelligence(generateMockData(contactId));
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [contactId]);

  const refetch = () => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setNetworkIntelligence(generateMockData(contactId));
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  };

  // Mock mutations
  const createRelationship = async (relationship: Omit<ContactRelationship, 'id'>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newRelationship: ContactRelationship = {
      ...relationship,
      id: `rel-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setNetworkIntelligence(prev => prev ? {
      ...prev,
      relationships: [...prev.relationships, newRelationship],
      networkConnectionsCount: prev.networkConnectionsCount + 1,
    } : null);

    return newRelationship;
  };

  const updateRelationshipSuccess = async (
    relationshipId: string, 
    successful: boolean, 
    context?: string
  ) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    setNetworkIntelligence(prev => prev ? {
      ...prev,
      relationships: prev.relationships.map(rel => 
        rel.id === relationshipId 
          ? { ...rel, introduction_successful: successful, context: context || rel.context }
          : rel
      ),
    } : null);
  };

  const createGoalTarget = async (target: Omit<GoalContactTarget, 'id'>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newTarget: GoalContactTarget = {
      ...target,
      id: `target-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setNetworkIntelligence(prev => prev ? {
      ...prev,
      goalTargets: [...prev.goalTargets, newTarget],
    } : null);

    return newTarget;
  };

  const updateGoalTargetStatus = async (
    targetId: string, 
    status: GoalContactTarget['status'],
    achievementNotes?: string
  ) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    setNetworkIntelligence(prev => prev ? {
      ...prev,
      goalTargets: prev.goalTargets.map(target => 
        target.id === targetId 
          ? { 
              ...target, 
              status,
              ...(status === 'achieved' ? { 
                achieved_at: new Date().toISOString(),
                achievement_notes: achievementNotes 
              } : {})
            }
          : target
      ),
    } : null);
  };

  return {
    networkIntelligence,
    isLoading,
    error,
    refetch,
    // Mutations
    createRelationship,
    updateRelationshipSuccess,
    createGoalTarget,
    updateGoalTargetStatus,
  };
};