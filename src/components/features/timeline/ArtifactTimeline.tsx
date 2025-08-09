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
      <Box sx={{ 
        textAlign: 'center', 
        py: 8, 
        color: 'text.secondary', 
        maxWidth: '600px', 
        mx: 'auto',
        background: 'var(--color-background-premium)',
        borderRadius: 'var(--radius-large)',
        p: { xs: 4, md: 6 },
        animation: 'sophisticatedEntrance 800ms cubic-bezier(0.0, 0, 0.2, 1) both'
      }}>
        <Typography sx={{ 
          fontSize: '4rem', 
          mb: 3,
          opacity: 0.7,
          animation: 'timeline-pulse 2s ease-in-out infinite'
        }}>
          ✨
        </Typography>
        <Typography variant="h5" sx={{ 
          fontWeight: 600, 
          mb: 2, 
          color: 'text.primary' 
        }}>
          Strategic Timeline Awaits
        </Typography>
        <Typography sx={{ 
          fontSize: '1.125rem',
          lineHeight: 1.6,
          fontStyle: 'italic',
          color: 'text.secondary'
        }}>
          Begin cultivating relationship intelligence by recording your first insight or interaction.
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
        <Box sx={{ 
          textAlign: 'center', 
          py: 6, 
          color: 'text.secondary', 
          mt: 3,
          animation: 'sophisticatedEntrance 600ms cubic-bezier(0.0, 0, 0.2, 1) both'
        }}>
          <Typography sx={{ 
            fontSize: '3rem', 
            mb: 3,
            opacity: 0.8,
            filter: 'grayscale(0.3)'
          }}>
            🎯
          </Typography>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            mb: 2, 
            color: 'text.primary' 
          }}>
            Refining Your Strategic View
          </Typography>
          <Typography sx={{ 
            fontSize: '1rem',
            lineHeight: 1.5,
            fontStyle: 'italic',
            maxWidth: '400px',
            mx: 'auto'
          }}>
            Your current filters are highly selective. Adjust your view to reveal more relationship intelligence.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: '1200px', // Wider for executive screens
      mx: 'auto', 
      background: 'var(--color-background-premium)', // Premium gradient
      minHeight: '100vh', 
      p: { xs: 3, md: 5 }, // Using sophisticated spacing
      position: 'relative',
      '&::before': {
        // Subtle texture overlay for premium feel
        content: '""',
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(33, 150, 243, 0.03) 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.03) 0%, transparent 50%),
                         radial-gradient(circle at 40% 80%, rgba(5, 150, 105, 0.02) 0%, transparent 50%)`,
        opacity: 0.6,
        pointerEvents: 'none',
        borderRadius: 'var(--radius-large)'
      }
    }}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="h4" sx={{ 
          mb: 4, // Following 8px grid 
          color: 'text.primary', 
          fontWeight: 600,
          fontSize: { xs: '1.75rem', md: '2rem' },
          letterSpacing: '-0.02em',
          textShadow: '0 1px 2px rgba(0,0,0,0.05)' // Subtle depth
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
          width: '4px', // Slightly thicker for premium feel
          background: (theme) => `linear-gradient(
            180deg,
            transparent 0%,
            ${theme.palette.primary.light} 15%,
            ${theme.palette.primary.main} 35%,
            ${theme.palette.sage.main} 50%,
            ${theme.palette.primary.main} 65%,
            ${theme.palette.primary.light} 85%,
            transparent 100%
          )`,
          transform: { xs: 'none', md: 'translateX(-50%)' },
          zIndex: 1,
          borderRadius: '2px',
          animation: 'timeline-pulse 3s ease-in-out infinite',
          // Add subtle glow effect
          boxShadow: (theme) => `0 0 8px ${theme.palette.primary.main}20`,
        }
      }}>
        {groupedArtifacts.map((group: GroupedArtifact, groupIndex: number) => (
          <Box key={`${group.date}-${groupIndex}`}>
            {/* Enhanced Date Label */}
            <Typography 
              variant="h6" 
              sx={{ 
                textAlign: 'center', 
                mb: 4, // Following 8px grid
                background: (theme) => `linear-gradient(135deg, 
                  ${theme.palette.primary.main} 0%, 
                  ${theme.palette.primary.dark} 50%,
                  ${theme.palette.sage.main} 100%)`,
                color: 'primary.contrastText',
                py: 2, // 16px - more generous
                px: 4, // 32px - executive presence
                borderRadius: 'var(--radius-large)', // 24px for executive presence
                display: 'inline-block',
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                fontSize: { xs: '0.875rem', md: '1rem' },
                fontWeight: 600,
                letterSpacing: '1px', // More sophisticated
                textTransform: 'uppercase',
                boxShadow: 'var(--shadow-elevated)', // Premium shadow
                transition: 'var(--ease-confident)',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)', // Text depth
                // Subtle animation on hover
                '&:hover': {
                  transform: 'translateX(-50%) translateY(-1px) scale(1.02)',
                  boxShadow: (theme) => `0 8px 32px ${theme.palette.primary.main}40`,
                }
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
                index={index} // Pass index for staggered animations
              />
            ))}
          </Box>
        ))}
        </Box>
      </Box>
    </Box>
  );
}; 