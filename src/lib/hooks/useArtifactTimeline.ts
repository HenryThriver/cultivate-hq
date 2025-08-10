'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { BaseArtifact, ArtifactType, GroupedArtifact, TimelineStatsData } from '@/types';
import { format, parseISO, differenceInDays, startOfDay } from 'date-fns';
import { ALL_ARTIFACT_TYPES } from '@/config/artifactConfig';

type GroupingMode = 'chronological' | 'intensity' | 'reciprocity' | 'themes';

interface UseArtifactTimelineOptions {
  filterTypes?: ArtifactType[];
  groupingMode?: GroupingMode;
  searchQuery?: string;
  // Add other options like date range, sort order etc. later
}

// Helper to group artifacts by date and format them
const groupAndFormatArtifacts = (artifacts: BaseArtifact[], groupingMode: GroupingMode = 'chronological'): GroupedArtifact[] => {
  if (!artifacts || artifacts.length === 0) return [];

  switch (groupingMode) {
    case 'chronological':
      return groupByDate(artifacts);
    case 'intensity':
      return groupByIntensity(artifacts);
    case 'reciprocity':
      return groupByReciprocity(artifacts);
    case 'themes':
      return groupByThemes(artifacts);
    default:
      return groupByDate(artifacts);
  }
};

// Original chronological grouping
const groupByDate = (artifacts: BaseArtifact[]): GroupedArtifact[] => {
  const grouped = artifacts.reduce((acc, artifact) => {
    const date = format(parseISO(artifact.timestamp), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(artifact);
    return acc;
  }, {} as Record<string, BaseArtifact[]>);

  return Object.entries(grouped)
    .map(([date, arts]) => ({
      date,
      dateLabel: format(parseISO(date), 'MMMM d, yyyy'), // More readable date label
      artifacts: arts.sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()), // Sort artifacts within a day by time (desc)
    }))
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()); // Sort groups by date (desc)
};

// PERFORMANCE: Optimized group by interaction intensity (single pass)
const groupByIntensity = (artifacts: BaseArtifact[]): GroupedArtifact[] => {
  if (!artifacts.length) return [];
  
  // PERFORMANCE: Single pass to calculate daily counts and store artifacts by date
  const dailyArtifacts: Record<string, BaseArtifact[]> = {};
  const dailyCounts: Record<string, number> = {};
  let maxCount = 0;
  
  for (const artifact of artifacts) {
    const date = format(parseISO(artifact.timestamp), 'yyyy-MM-dd');
    if (!dailyArtifacts[date]) {
      dailyArtifacts[date] = [];
      dailyCounts[date] = 0;
    }
    dailyArtifacts[date].push(artifact);
    dailyCounts[date]++;
    maxCount = Math.max(maxCount, dailyCounts[date]);
  }

  const intensityThresholds = {
    high: Math.ceil(maxCount * 0.7), // Top 30% of activity
    medium: Math.ceil(maxCount * 0.3), // Middle range
    low: 1 // Any activity
  };

  // PERFORMANCE: Group artifacts by intensity in single pass
  const grouped: Record<string, BaseArtifact[]> = { high: [], medium: [], low: [] };
  
  for (const [date, dayArtifacts] of Object.entries(dailyArtifacts)) {
    const count = dailyCounts[date];
    let intensity: string;
    if (count >= intensityThresholds.high) intensity = 'high';
    else if (count >= intensityThresholds.medium) intensity = 'medium';
    else intensity = 'low';
    
    grouped[intensity].push(...dayArtifacts);
  }

  const intensityLabels = {
    high: '🔥 Peak Engagement',
    medium: '📈 Active Period', 
    low: '💭 Quiet Connection'
  };

  return Object.entries(grouped)
    .map(([intensity, arts]) => ({
      date: intensity,
      dateLabel: intensityLabels[intensity as keyof typeof intensityLabels] || intensity,
      artifacts: arts.sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime())
    }))
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.date as keyof typeof order] - order[b.date as keyof typeof order];
    });
};

// Group by reciprocity (giving vs receiving value)
const groupByReciprocity = (artifacts: BaseArtifact[]): GroupedArtifact[] => {
  const grouped = artifacts.reduce((acc, artifact) => {
    let category: string;
    
    // Determine reciprocity category based on artifact type and content
    if (artifact.type === 'pog') {
      category = 'giving';
    } else if (artifact.type === 'ask') {
      category = 'receiving';
    } else if (artifact.type === 'email') {
      // For emails, we'd need to analyze direction - simplified for now
      category = 'mutual';
    } else if (artifact.type === 'voice_memo' || artifact.type === 'note') {
      category = 'strategic'; // Internal processing/insights
    } else {
      category = 'mutual';
    }
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(artifact);
    return acc;
  }, {} as Record<string, BaseArtifact[]>);

  const reciprocityLabels = {
    giving: '🎁 Value Creation',
    receiving: '🙏 Support Received',
    mutual: '🤝 Mutual Exchange',
    strategic: '🧠 Strategic Processing'
  };

  return Object.entries(grouped)
    .map(([category, arts]) => ({
      date: category,
      dateLabel: reciprocityLabels[category as keyof typeof reciprocityLabels] || category,
      artifacts: arts.sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime())
    }))
    .sort((a, b) => {
      const order = { giving: 0, mutual: 1, receiving: 2, strategic: 3 };
      return order[a.date as keyof typeof order] - order[b.date as keyof typeof order];
    });
};

// Group by themes/context (professional, personal, strategic)
const groupByThemes = (artifacts: BaseArtifact[]): GroupedArtifact[] => {
  const grouped = artifacts.reduce((acc, artifact) => {
    let theme: string;
    
    // Determine theme based on artifact type and potential AI suggestions
    if (artifact.type === 'linkedin_profile' || artifact.type === 'meeting') {
      theme = 'professional';
    } else if (artifact.type === 'voice_memo' || artifact.type === 'note') {
      theme = 'strategic';
    } else if (artifact.type === 'pog' || artifact.type === 'ask') {
      theme = 'relationship';
    } else {
      theme = 'communication';
    }
    
    if (!acc[theme]) {
      acc[theme] = [];
    }
    acc[theme].push(artifact);
    return acc;
  }, {} as Record<string, BaseArtifact[]>);

  const themeLabels = {
    professional: '💼 Professional Context',
    strategic: '🎯 Strategic Intelligence', 
    relationship: '🤝 Relationship Dynamics',
    communication: '💬 Communication Flow'
  };

  return Object.entries(grouped)
    .map(([theme, arts]) => ({
      date: theme,
      dateLabel: themeLabels[theme as keyof typeof themeLabels] || theme,
      artifacts: arts.sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime())
    }))
    .sort((a, b) => {
      const order = { strategic: 0, professional: 1, relationship: 2, communication: 3 };
      return order[a.date as keyof typeof order] - order[b.date as keyof typeof order];
    });
};

// Helper to calculate timeline stats
const calculateTimelineStats = (artifacts: BaseArtifact[]): TimelineStatsData => {
  if (!artifacts || artifacts.length === 0) {
    return {
      totalArtifacts: 0,
      firstArtifactDate: null,
      lastArtifactDate: null,
      artifactTypeCounts: ALL_ARTIFACT_TYPES.reduce((acc, type) => {
        acc[type] = 0;
        return acc;
      }, {} as Record<ArtifactType, number>),
      averageTimeBetweenDays: 0,
    };
  }

  const sortedArtifacts = [...artifacts].sort((a,b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime());
  const firstArtifactDate = format(parseISO(sortedArtifacts[0].timestamp), 'MMM d, yyyy');
  const lastArtifactDate = format(parseISO(sortedArtifacts[sortedArtifacts.length - 1].timestamp), 'MMM d, yyyy');
  
  // Initialize with all artifact types set to 0
  const artifactTypeCounts = ALL_ARTIFACT_TYPES.reduce((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {} as Record<ArtifactType, number>);

  // Count actual artifacts
  artifacts.forEach(artifact => {
    if (artifactTypeCounts.hasOwnProperty(artifact.type)) {
      artifactTypeCounts[artifact.type]++;
    }
  });

  let totalDaysDifference = 0;
  let interactionPairs = 0;
  if (sortedArtifacts.length > 1) {
    const uniqueDays = [...new Set(sortedArtifacts.map(a => startOfDay(parseISO(a.timestamp)).getTime()))]
      .sort((a,b) => a - b);
    
    if (uniqueDays.length > 1) {
        for (let i = 1; i < uniqueDays.length; i++) {
            totalDaysDifference += differenceInDays(uniqueDays[i], uniqueDays[i-1]);
            interactionPairs++;
        }
    }
  }
  const averageTimeBetweenDays = interactionPairs > 0 ? totalDaysDifference / interactionPairs : 0;

  return {
    totalArtifacts: artifacts.length,
    firstArtifactDate,
    lastArtifactDate,
    artifactTypeCounts,
    averageTimeBetweenDays,
  };
};


export const useArtifactTimeline = (contactId: string, options?: UseArtifactTimelineOptions) => {
  const queryKey: [string, string, string, string, string] = [
    'artifactTimeline', 
    contactId, 
    options?.filterTypes?.sort().join('-') || 'allTypes',
    options?.groupingMode || 'chronological',
    options?.searchQuery || ''
  ];

  // PERFORMANCE: Memoize expensive grouping operations
  const memoizedGrouping = useMemo(() => {
    return (filteredArtifacts: BaseArtifact[], groupingMode: GroupingMode) => {
      return groupAndFormatArtifacts(filteredArtifacts, groupingMode);
    };
  }, [options?.groupingMode]);

  const memoizedStatsCalculation = useMemo(() => {
    return (filteredArtifacts: BaseArtifact[]) => {
      return calculateTimelineStats(filteredArtifacts);
    };
  }, []);

  const queryFn = async (): Promise<BaseArtifact[]> => {
    const { data, error } = await supabase
      .from('artifacts')
      .select('*')
      .eq('contact_id', contactId)
      .order('timestamp', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(item => ({
      ...item,
      updated_at: (item as Record<string, unknown>).updated_at as string || item.created_at
    })) as BaseArtifact[];
  };

  return useQuery<
    BaseArtifact[], // TQueryFnData: Data type returned by queryFn
    Error,            // TError
    {                 // TData: Data type after transformation by select
      allArtifacts: BaseArtifact[];
      filteredArtifacts: BaseArtifact[];
      groupedArtifacts: GroupedArtifact[]; 
      stats: TimelineStatsData 
    },
    [string, string, string, string, string] // TQueryKey
  >({
    queryKey: queryKey,
    queryFn: queryFn,
    select: (data: BaseArtifact[]) => {
      const allArtifacts = data;
      let filteredArtifacts = allArtifacts;
      
      // Apply type filters
      if (options?.filterTypes && options.filterTypes.length > 0) {
        filteredArtifacts = filteredArtifacts.filter((artifact: BaseArtifact) => 
          options.filterTypes!.includes(artifact.type)
        );
      }

      // Apply search filter
      if (options?.searchQuery && options.searchQuery.trim() !== '') {
        const searchTerm = options.searchQuery.toLowerCase().trim();
        filteredArtifacts = filteredArtifacts.filter((artifact: BaseArtifact) => {
          // Search in artifact content (varies by type)
          const contentString = JSON.stringify(artifact.content || {}).toLowerCase();
          
          // Search in AI suggestions
          const suggestionsString = JSON.stringify(artifact.ai_suggestions || []).toLowerCase();
          
          // Search in metadata
          const metadataString = JSON.stringify(artifact.metadata || {}).toLowerCase();
          
          // Search in type and basic fields
          const basicFields = [
            artifact.type,
            artifact.title || '',
            artifact.description || ''
          ].join(' ').toLowerCase();

          return contentString.includes(searchTerm) ||
                 suggestionsString.includes(searchTerm) ||
                 metadataString.includes(searchTerm) ||
                 basicFields.includes(searchTerm);
        });
      }
      // PERFORMANCE: Use memoized functions for expensive operations
      const groupedArtifacts = memoizedGrouping(filteredArtifacts, options?.groupingMode || 'chronological');
      const stats = memoizedStatsCalculation(filteredArtifacts);
      return {
        allArtifacts,
        filteredArtifacts,
        groupedArtifacts,
        stats,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 