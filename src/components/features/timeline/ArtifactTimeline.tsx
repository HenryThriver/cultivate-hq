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
  hideInternalControls?: boolean;
  filterTypes?: ArtifactType[];
  viewMode?: string;
  searchQuery?: string;
  showDashboard?: boolean;
  timelineData?: any;
  isLoading?: boolean;
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
  onArtifactClick,
  hideInternalControls = false,
  filterTypes: externalFilterTypes,
  viewMode: externalViewMode,
  searchQuery: externalSearchQuery,
  showDashboard = false,
  timelineData: externalTimelineData,
  isLoading: externalIsLoading
}) => {
  const [internalFilterTypes, setInternalFilterTypes] = useState<ArtifactType[]>([]);
  const [internalViewMode, setInternalViewMode] = useState<string>('chronological');
  const [internalSearchQuery, setInternalSearchQuery] = useState<string>('');
  
  // Use external props if provided, otherwise use internal state
  const filterTypes = externalFilterTypes ?? internalFilterTypes;
  const viewMode = externalViewMode ?? internalViewMode;
  const searchQuery = externalSearchQuery ?? internalSearchQuery;
  const setFilterTypes = hideInternalControls ? () => {} : setInternalFilterTypes;
  const setViewMode = hideInternalControls ? () => {} : setInternalViewMode;
  const setSearchQuery = hideInternalControls ? () => {} : setInternalSearchQuery;

  // Only fetch data if external data is not provided
  const shouldFetch = !externalTimelineData;
  
  const {
    data: internalTimelineData,
    isLoading: internalIsLoading,
    isError,
  } = useArtifactTimeline(
    shouldFetch ? contactId : '', // Empty string prevents fetching
    shouldFetch ? { 
      filterTypes,
      groupingMode: viewMode as 'chronological' | 'intensity' | 'reciprocity' | 'themes',
      searchQuery
    } : {}
  );
  
  // Use external data if provided, otherwise use internal query
  const timelineData = externalTimelineData ?? internalTimelineData;
  const isLoading = externalIsLoading ?? internalIsLoading;

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
        {stats && <EnhancedTimelineStats stats={stats} artifacts={timelineData?.filteredArtifacts || []} />}
        <EnhancedTimelineFilters 
          filterTypes={filterTypes}
          onFilterChange={setFilterTypes}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
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
      background: hideInternalControls ? 'transparent' : 'var(--color-background-premium)', // Premium gradient only when standalone
      minHeight: hideInternalControls ? 'auto' : '100vh', 
      p: hideInternalControls ? 0 : { xs: 3, md: 5 }, // No padding when controlled externally
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
        {/* Only show internal controls if not hidden */}
        {!hideInternalControls && (
          <>
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
            
            {stats && <EnhancedTimelineStats stats={stats} artifacts={timelineData?.filteredArtifacts || []} />}
            
            <EnhancedTimelineFilters 
              filterTypes={filterTypes}
              onFilterChange={setFilterTypes}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </>
        )}
        
        {/* Show dashboard when external controls are used */}
        {hideInternalControls && showDashboard && stats && (
          <Box sx={{ mb: 3 }}>
            <EnhancedTimelineStats 
              stats={stats} 
              artifacts={timelineData?.filteredArtifacts || []} 
            />
          </Box>
        )}

        {/* Relationship Pulse Indicators - Only show if not externally controlled */}
        {!hideInternalControls && viewMode === 'chronological' && groupedArtifacts.length > 0 && (
          <Box sx={{
            mb: 4,
            p: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.95) 100%)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600, 
              mb: 2, 
              color: 'text.primary',
              fontSize: '14px',
              letterSpacing: '0.5px'
            }}>
              Relationship Pulse
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {(() => {
                const momentum = stats.averageTimeBetweenDays < 7 ? 'accelerating' : 
                               stats.averageTimeBetweenDays < 14 ? 'steady' : 'cooling';
                const recentActivity = groupedArtifacts[0]?.artifacts.length > 2 ? 'high' : 
                                     groupedArtifacts[0]?.artifacts.length > 1 ? 'active' : 'quiet';
                
                const pulseConfig = {
                  accelerating: { color: 'success.main', icon: '🚀', label: 'Accelerating', description: 'Relationship gaining momentum' },
                  steady: { color: 'info.main', icon: '🔄', label: 'Steady Pace', description: 'Consistent engagement pattern' },
                  cooling: { color: 'warning.main', icon: '❄️', label: 'Cooling Off', description: 'May benefit from renewed engagement' }
                };

                const activityConfig = {
                  high: { color: 'success.main', icon: '🔥', label: 'High Activity', description: 'Very engaged recently' },
                  active: { color: 'info.main', icon: '📈', label: 'Active', description: 'Regular interaction level' },
                  quiet: { color: 'grey.600', icon: '💭', label: 'Quiet Phase', description: 'Lower recent activity' }
                };

                const momentumInfo = pulseConfig[momentum];
                const activityInfo = activityConfig[recentActivity];

                return (
                  <>
                    {/* Momentum Indicator */}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 1,
                      borderRadius: 'var(--radius-medium)',
                      backgroundColor: `${momentumInfo.color}15`,
                      border: '1px solid',
                      borderColor: `${momentumInfo.color}30`,
                      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: `${momentumInfo.color}20`,
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${momentumInfo.color}20`
                      }
                    }}>
                      <Typography sx={{ fontSize: '16px' }}>{momentumInfo.icon}</Typography>
                      <Box>
                        <Typography variant="caption" sx={{ 
                          fontWeight: 600, 
                          color: momentumInfo.color,
                          fontSize: '12px'
                        }}>
                          {momentumInfo.label}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          display: 'block',
                          color: 'text.secondary',
                          fontSize: '11px'
                        }}>
                          {momentumInfo.description}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Activity Level Indicator */}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 1,
                      borderRadius: 'var(--radius-medium)',
                      backgroundColor: `${activityInfo.color}15`,
                      border: '1px solid',
                      borderColor: `${activityInfo.color}30`,
                      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: `${activityInfo.color}20`,
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${activityInfo.color}20`
                      }
                    }}>
                      <Typography sx={{ fontSize: '16px' }}>{activityInfo.icon}</Typography>
                      <Box>
                        <Typography variant="caption" sx={{ 
                          fontWeight: 600, 
                          color: activityInfo.color,
                          fontSize: '12px'
                        }}>
                          {activityInfo.label}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          display: 'block',
                          color: 'text.secondary',
                          fontSize: '11px'
                        }}>
                          {activityInfo.description}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Next Touch Suggestion */}
                    {momentum === 'cooling' && (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        borderRadius: 'var(--radius-medium)',
                        backgroundColor: 'primary.50',
                        border: '1px solid',
                        borderColor: 'primary.200',
                        animation: 'sophisticatedEntrance 800ms cubic-bezier(0.0, 0, 0.2, 1) both'
                      }}>
                        <Typography sx={{ fontSize: '16px' }}>⏰</Typography>
                        <Box>
                          <Typography variant="caption" sx={{ 
                            fontWeight: 600, 
                            color: 'primary.main',
                            fontSize: '12px'
                          }}>
                            Strategic Moment
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            display: 'block',
                            color: 'text.secondary',
                            fontSize: '11px'
                          }}>
                            Consider reaching out soon
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </>
                );
              })()}
            </Box>
          </Box>
        )}

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