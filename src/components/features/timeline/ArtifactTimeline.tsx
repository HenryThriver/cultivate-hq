'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Alert
} from '@mui/material';

import { EnhancedTimelineItem } from './EnhancedTimelineItem';
import { EnhancedTimelineFilters } from './EnhancedTimelineFilters';
import { EnhancedTimelineStats, TimelineStatsData } from './EnhancedTimelineStats';
import { TimelineSkeleton } from './TimelineSkeleton';
import type { BaseArtifact, ArtifactType, GroupedArtifact } from '@/types';
import { useArtifactTimeline } from '@/lib/hooks/useArtifactTimeline';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { ALL_ARTIFACT_TYPES } from '@/config/artifactConfig';

interface ArtifactTimelineProps {
  contactId: string;
  onArtifactClick?: (artifact: BaseArtifact) => void;
}

const defaultStats: TimelineStatsData = {
  totalArtifacts: 0,
  firstArtifactDate: null,
  lastArtifactDate: null,
  artifactTypeCounts: ALL_ARTIFACT_TYPES.reduce((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {} as Record<ArtifactType, number>),
  averageTimeBetweenDays: 0,
};

export const ArtifactTimeline: React.FC<ArtifactTimelineProps> = ({
  contactId,
  onArtifactClick
}) => {
  const [filterTypes, setFilterTypes] = useState<ArtifactType[]>([]);

  const {
    data: timelineData,
    isLoading,
    isError,
  } = useArtifactTimeline(contactId, { filterTypes });

  const groupedArtifacts = timelineData?.groupedArtifacts || [];
  const stats = timelineData?.stats || defaultStats;
  
  const formatDateGroupLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return format(date, 'EEEE');
    return format(date, 'MMMM d, yyyy');
  };

  if (isLoading) {
    return <TimelineSkeleton />;
  }

  if (isError) {
    return (
      <Alert severity="error">Failed to load timeline. Please try again.</Alert>
    );
  }

  if (!timelineData?.allArtifacts || timelineData.allArtifacts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary', maxWidth: '600px', mx: 'auto' }}>
        <Typography sx={{ fontSize: '3rem', mb: 2 }}>📭</Typography>
        <Typography variant="h6" gutterBottom>No artifacts recorded yet</Typography>
        <Typography>
          Record a voice memo or add a note to start building this contact&apos;s timeline.
        </Typography>
      </Box>
    );
  }
  
  if (timelineData.allArtifacts.length > 0 && groupedArtifacts.length === 0) {
    return (
      <Box sx={{ 
      maxWidth: '1200px', 
      mx: 'auto', 
      backgroundColor: 'var(--color-background-elevated)', 
      minHeight: 'auto', 
      p: { xs: 3, md: 5 }
    }}>
        {stats && <EnhancedTimelineStats stats={stats} />}
        <EnhancedTimelineFilters 
          filterTypes={filterTypes}
          onFilterChange={setFilterTypes}
        />
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary', mt:2 }}>
          <Typography sx={{ fontSize: '3rem', mb: 2 }}>🧐</Typography>
          <Typography variant="h6" gutterBottom>No artifacts match your filters</Typography>
          <Typography>
            Try adjusting your filter selection or clearing all filters.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: '1200px', // Wider for executive screens
      mx: 'auto', 
      backgroundColor: 'var(--color-background-elevated)', 
      minHeight: '100vh', 
      p: { xs: 3, md: 5 } // Using sophisticated spacing
    }}>
      <Typography variant="h4" sx={{ 
        mb: 4, // Following 8px grid 
        color: 'text.primary', 
        fontWeight: 600,
        fontSize: { xs: '1.75rem', md: '2rem' },
        letterSpacing: '-0.02em'
      }}>
        Relationship Timeline
      </Typography>
      
      {stats && <EnhancedTimelineStats stats={stats} />}
      
      <EnhancedTimelineFilters 
        filterTypes={filterTypes}
        onFilterChange={setFilterTypes}
      />

      {/* Enhanced Timeline Container with Central Line */}
      <Box sx={{ 
        position: 'relative',
        pt: 4,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: { xs: '30px', md: '50%' },
          top: 0,
          bottom: 0,
          width: '3px',
          background: (theme) => `linear-gradient(
            180deg,
            transparent 0%,
            ${theme.palette.primary.light} 20%,
            ${theme.palette.primary.main} 50%,
            ${theme.palette.primary.light} 80%,
            transparent 100%
          )`,
          transform: { xs: 'none', md: 'translateX(-50%)' },
          zIndex: 1
        }
      }}>
        {groupedArtifacts.map((group: GroupedArtifact, groupIndex: number) => (
          <Box key={`${group.date}-${groupIndex}`}>
            {/* Enhanced Date Label */}
            <Typography 
              variant="h6" 
              sx={{ 
                textAlign: 'center', 
                mb: 3, // Following 8px grid
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                py: 1.5, // 12px
                px: 3,   // 24px
                borderRadius: 'var(--radius-large)', // 24px for executive presence
                display: 'inline-block',
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                fontSize: { xs: '0.875rem', md: '1rem' },
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                boxShadow: 'var(--shadow-card)',
                transition: 'var(--ease-confident)'
              }}
            >
              {group.dateLabel || formatDateGroupLabel(group.date)}
            </Typography>
            
            {group.artifacts.map((artifact, index) => (
              <EnhancedTimelineItem
                key={artifact.id}
                artifact={artifact}
                position={index % 2 === 0 ? 'left' : 'right'}
                onClick={() => onArtifactClick?.(artifact)}
              />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}; 