import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

interface ContactRelationship {
  id: string;
  contact_a_id: string;
  contact_b_id: string;
  relationship_type: 'introduced_by_me' | 'known_connection' | 'target_connection';
  strength: 'weak' | 'medium' | 'strong';
  context?: string;
  introduction_date?: string;
  introduction_successful?: boolean;
}

interface GoalContactTarget {
  id: string;
  goal_id: string;
  contact_id: string;
  target_description: string;
  target_type: 'introduction' | 'information' | 'opportunity' | 'exploration';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'achieved' | 'archived';
  achieved_at?: string;
  notes?: string;
}

interface ContactNetworkIntelligence {
  relationships: ContactRelationship[];
  goalTargets: GoalContactTarget[];
  networkConnectionsCount: number;
  recentIntroductions: number;
  introductionSuccessRate: number;
}

export const useContactNetworkIntelligence = (contactId: string) => {
  const {
    data: networkIntelligence,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['contactNetworkIntelligence', contactId],
    queryFn: async (): Promise<ContactNetworkIntelligence> => {
      // Fetch contact relationships
      const { data: relationships, error: relationshipsError } = await supabase
        .from('contact_relationships')
        .select('*')
        .or(`contact_a_id.eq.${contactId},contact_b_id.eq.${contactId}`);

      if (relationshipsError) {
        throw new Error(`Failed to fetch relationships: ${relationshipsError.message}`);
      }

      // Fetch goal targets for this contact
      const { data: goalTargets, error: goalTargetsError } = await supabase
        .from('goal_contact_targets')
        .select('*')
        .eq('contact_id', contactId)
        .eq('status', 'active');

      if (goalTargetsError) {
        throw new Error(`Failed to fetch goal targets: ${goalTargetsError.message}`);
      }

      // Calculate metrics
      const networkConnectionsCount = relationships?.length || 0;
      
      // Count recent introductions (last 90 days)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const recentIntroductions = relationships?.filter(rel => 
        rel.relationship_type === 'introduced_by_me' &&
        rel.introduction_date &&
        new Date(rel.introduction_date) > threeMonthsAgo
      ).length || 0;

      // Calculate introduction success rate
      const introductions = relationships?.filter(rel => 
        rel.relationship_type === 'introduced_by_me' &&
        rel.introduction_successful !== null
      ) || [];
      
      const successfulIntroductions = introductions.filter(rel => 
        rel.introduction_successful === true
      ).length;
      
      const introductionSuccessRate = introductions.length > 0 
        ? (successfulIntroductions / introductions.length) * 100 
        : 0;

      return {
        relationships: relationships || [],
        goalTargets: goalTargets || [],
        networkConnectionsCount,
        recentIntroductions,
        introductionSuccessRate,
      };
    },
    enabled: !!contactId,
  });

  // Mutations for managing relationships and targets
  const createRelationship = async (relationship: Omit<ContactRelationship, 'id'>) => {
    const { data, error } = await supabase
      .from('contact_relationships')
      .insert([relationship])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create relationship: ${error.message}`);
    }

    // Invalidate cache
    refetch();
    return data;
  };

  const updateRelationshipSuccess = async (
    relationshipId: string, 
    successful: boolean, 
    context?: string
  ) => {
    const { error } = await supabase
      .from('contact_relationships')
      .update({ 
        introduction_successful: successful,
        context: context || undefined,
      })
      .eq('id', relationshipId);

    if (error) {
      throw new Error(`Failed to update relationship: ${error.message}`);
    }

    refetch();
  };

  const createGoalTarget = async (target: Omit<GoalContactTarget, 'id' | 'contact_id'>) => {
    const { data, error } = await supabase
      .from('goal_contact_targets')
      .insert([{ ...target, contact_id: contactId }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create goal target: ${error.message}`);
    }

    refetch();
    return data;
  };

  const updateGoalTargetStatus = async (
    targetId: string, 
    status: GoalContactTarget['status'],
    achievementNotes?: string
  ) => {
    const updateData: Partial<GoalContactTarget> = { 
      status,
      ...(status === 'achieved' ? { 
        achieved_at: new Date().toISOString(),
        achievement_notes: achievementNotes 
      } : {})
    };

    const { error } = await supabase
      .from('goal_contact_targets')
      .update(updateData)
      .eq('id', targetId);

    if (error) {
      throw new Error(`Failed to update goal target: ${error.message}`);
    }

    refetch();
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