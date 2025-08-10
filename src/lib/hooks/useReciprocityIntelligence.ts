import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

interface ReciprocityItem {
  id: string;
  type: 'given' | 'received';
  description: string;
  value_estimate?: number; // 1-10 scale
  timestamp: string;
  artifact_id?: string;
}

interface ReciprocityIntelligence {
  items: ReciprocityItem[];
  balance: number; // -1 to 1 (negative = more received, positive = more given)
  givenCount: number;
  receivedCount: number;
  healthScore: number; // 0-10
  trend: 'improving' | 'stable' | 'declining';
}

export const useReciprocityIntelligence = (contactId: string) => {
  const {
    data: reciprocityData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['reciprocityIntelligence', contactId],
    queryFn: async (): Promise<ReciprocityIntelligence> => {
      // For now, we'll derive reciprocity from POG and Ask artifacts
      // In the future, this could be its own table or more sophisticated tracking
      
      const { data: artifacts, error: artifactsError } = await supabase
        .from('artifacts')
        .select('*')
        .eq('contact_id', contactId)
        .in('type', ['pog', 'ask'])
        .order('created_at', { ascending: false })
        .limit(50); // Last 50 interactions

      if (artifactsError) {
        throw new Error(`Failed to fetch artifacts: ${artifactsError.message}`);
      }

      // Convert artifacts to reciprocity items based on directionality
      const items: ReciprocityItem[] = (artifacts || []).map(artifact => {
        const metadata = artifact.metadata as Record<string, unknown>;
        
        // Determine if this represents value given or received based on contact direction
        // For POGs: user giving = recipient_contact_id is the contact (user → contact)
        //           user receiving = initiator_contact_id is the contact (contact → user)
        // For Asks: user asking = recipient_contact_id is the contact (user asked contact for help = user received)
        //           user being asked = initiator_contact_id is the contact (contact asked user = user gave help)
        let type: 'given' | 'received' = 'given';
        
        if (artifact.type === 'pog') {
          // POG: Check who is giving to whom
          if (artifact.recipient_contact_id === contactId) {
            type = 'given'; // User gave POG to contact
          } else if (artifact.initiator_contact_id === contactId) {
            type = 'received'; // User received POG from contact
          }
        } else if (artifact.type === 'ask') {
          // Ask: Check who is asking whom
          if (artifact.recipient_contact_id === contactId) {
            type = 'received'; // User asked contact for help (user received help)
          } else if (artifact.initiator_contact_id === contactId) {
            type = 'given'; // Contact asked user for help (user gave help)
          }
        }
        
        return {
          id: artifact.id,
          type,
          description: metadata?.description || artifact.content || 'Untitled action',
          value_estimate: metadata?.value_estimate || 5,
          timestamp: artifact.created_at,
          artifact_id: artifact.id,
        };
      });

      // Calculate metrics
      const givenItems = items.filter(item => item.type === 'given');
      const receivedItems = items.filter(item => item.type === 'received');
      
      const givenCount = givenItems.length;
      const receivedCount = receivedItems.length;
      
      // Calculate weighted balance based on value estimates
      const givenValue = givenItems.reduce((sum, item) => sum + (item.value_estimate || 5), 0);
      const receivedValue = receivedItems.reduce((sum, item) => sum + (item.value_estimate || 5), 0);
      
      // Normalize to -1 to 1 scale
      const totalValue = givenValue + receivedValue;
      const balance = totalValue > 0 ? (givenValue - receivedValue) / totalValue : 0;
      
      // Calculate health score (0-10)
      // Healthy relationships have regular exchange and reasonable balance
      const exchangeFrequency = items.length > 0 ? Math.min(10, items.length / 5) : 0;
      const balanceHealth = 10 - Math.abs(balance * 10); // Penalty for extreme imbalance
      const healthScore = (exchangeFrequency + balanceHealth) / 2;
      
      // Calculate trend (last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const recentItems = items.filter(item => new Date(item.timestamp) > thirtyDaysAgo);
      const previousItems = items.filter(item => {
        const date = new Date(item.timestamp);
        return date > sixtyDaysAgo && date <= thirtyDaysAgo;
      });
      
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (recentItems.length > previousItems.length * 1.2) {
        trend = 'improving';
      } else if (recentItems.length < previousItems.length * 0.8) {
        trend = 'declining';
      }

      return {
        items,
        balance,
        givenCount,
        receivedCount,
        healthScore,
        trend,
      };
    },
    enabled: !!contactId,
  });

  // Mutation to log a reciprocity item
  const logReciprocityItem = async (
    type: 'given' | 'received',
    description: string,
    valueEstimate: number = 5
  ) => {
    // This would typically create an artifact or reciprocity log entry
    // For now, we'll just log to console and refetch
    console.log('Log reciprocity item:', { type, description, valueEstimate, contactId });
    
    // In a real implementation, this might create a specific reciprocity artifact
    // or update existing POG/Ask artifacts with reciprocity metadata
    
    refetch();
  };

  return {
    reciprocityData,
    isLoading,
    error,
    refetch,
    logReciprocityItem,
  };
};