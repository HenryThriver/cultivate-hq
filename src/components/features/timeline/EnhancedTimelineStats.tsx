'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip,
  LinearProgress,
  useTheme,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
  Handshake as HandshakeIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { differenceInDays, format, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { ArtifactType } from '@/types';

// Export this interface - enhanced with executive insights
export interface TimelineStatsData {
  totalArtifacts: number;
  firstArtifactDate: string | null;
  lastArtifactDate: string | null;
  artifactTypeCounts: Record<ArtifactType, number>;
  averageTimeBetweenDays: number;
  // Consider adding more, e.g. most common type, specific loop stats, etc.
}

// Executive insights derived from timeline data
interface ExecutiveInsights {
  engagementTrend: 'increasing' | 'steady' | 'declining';
  communicationBalance: 'proactive' | 'balanced' | 'reactive';
  strategicDepth: 'high' | 'moderate' | 'developing';
  relationshipMomentum: 'accelerating' | 'maintaining' | 'cooling';
  recentActivityLevel: 'high' | 'normal' | 'low';
  dominantChannels: string[];
}

// Interface for the props expects TimelineStatsData from our types
interface EnhancedTimelineStatsProps {
  stats: TimelineStatsData | null; // Allow null if stats might not be ready
  artifacts?: any[]; // Raw artifacts for advanced analysis
}

export const EnhancedTimelineStats: React.FC<EnhancedTimelineStatsProps> = ({ stats, artifacts = [] }) => {
  const theme = useTheme();

  if (!stats || stats.totalArtifacts === 0) {
    return (
      <Card sx={{ 
        mb: 6, 
        background: 'var(--color-background-elevated)',
        borderRadius: 'var(--radius-large)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid',
        borderColor: 'grey.200'
      }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <AnalyticsIcon sx={{ 
            fontSize: '3rem', 
            color: 'text.secondary', 
            mb: 2, 
            opacity: 0.7 
          }} />
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: 'text.primary', 
            mb: 1 
          }}>
            Intelligence Dashboard Awaiting Data
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'text.secondary',
            fontStyle: 'italic' 
          }}>
            Strategic insights will appear as relationship intelligence accumulates.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { 
    totalArtifacts,
    firstArtifactDate,
    lastArtifactDate,
    artifactTypeCounts,
    averageTimeBetweenDays 
  } = stats;

  const engagementDuration = firstArtifactDate && lastArtifactDate 
    ? differenceInDays(new Date(lastArtifactDate), new Date(firstArtifactDate))
    : 0;

  // Calculate executive insights
  const calculateExecutiveInsights = (): ExecutiveInsights => {
    const now = new Date();
    const thisWeek = {
      start: startOfWeek(now),
      end: endOfWeek(now)
    };
    
    // Recent activity analysis
    const recentArtifacts = artifacts.filter(a => 
      isWithinInterval(parseISO(a.timestamp), thisWeek)
    );
    const recentActivityLevel = recentArtifacts.length > 5 ? 'high' : 
                               recentArtifacts.length > 2 ? 'normal' : 'low';

    // Communication balance - analyze proactive vs reactive patterns
    const proactiveTypes = ['voice_memo', 'note', 'pog'];
    const proactiveCount = Object.entries(artifactTypeCounts)
      .filter(([type]) => proactiveTypes.includes(type))
      .reduce((sum, [, count]) => sum + count, 0);
    const communicationBalance = proactiveCount > totalArtifacts * 0.6 ? 'proactive' :
                               proactiveCount > totalArtifacts * 0.3 ? 'balanced' : 'reactive';

    // Strategic depth based on high-value artifact types
    const strategicTypes = ['voice_memo', 'meeting', 'note'];
    const strategicCount = Object.entries(artifactTypeCounts)
      .filter(([type]) => strategicTypes.includes(type))
      .reduce((sum, [, count]) => sum + count, 0);
    const strategicDepth = strategicCount > totalArtifacts * 0.4 ? 'high' :
                         strategicCount > totalArtifacts * 0.2 ? 'moderate' : 'developing';

    // Engagement trend - simplified analysis based on frequency
    const engagementTrend = averageTimeBetweenDays < 7 ? 'increasing' :
                          averageTimeBetweenDays < 14 ? 'steady' : 'declining';

    // Relationship momentum based on recent activity and frequency
    const relationshipMomentum = (recentActivityLevel === 'high' && averageTimeBetweenDays < 10) ? 'accelerating' :
                               (recentActivityLevel !== 'low' && averageTimeBetweenDays < 21) ? 'maintaining' : 'cooling';

    // Dominant channels
    const dominantChannels = Object.entries(artifactTypeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([type]) => type);

    return {
      engagementTrend,
      communicationBalance,
      strategicDepth,
      relationshipMomentum,
      recentActivityLevel,
      dominantChannels
    };
  };

  const insights = calculateExecutiveInsights();

  const getInsightColor = (insight: string) => {
    const colorMap: Record<string, string> = {
      'increasing': theme.palette.success.main,
      'accelerating': theme.palette.success.main,
      'high': theme.palette.success.main,
      'proactive': theme.palette.success.main,
      'steady': theme.palette.info.main,
      'maintaining': theme.palette.info.main,
      'balanced': theme.palette.info.main,
      'moderate': theme.palette.warning.main,
      'normal': theme.palette.info.main,
      'declining': theme.palette.warning.main,
      'cooling': theme.palette.warning.main,
      'reactive': theme.palette.warning.main,
      'developing': theme.palette.warning.main,
      'low': theme.palette.error.main,
    };
    return colorMap[insight] || theme.palette.grey[600];
  };

  const getInsightIcon = (category: string) => {
    const iconMap = {
      'engagementTrend': TrendingUpIcon,
      'relationshipMomentum': SpeedIcon,
      'strategicDepth': PsychologyIcon,
      'communicationBalance': HandshakeIcon,
      'recentActivityLevel': ScheduleIcon
    };
    return iconMap[category as keyof typeof iconMap] || AnalyticsIcon;
  };

  return (
    <Card sx={{ 
      mb: 6,
      background: 'var(--color-background-premium)',
      borderRadius: 'var(--radius-large)',
      boxShadow: 'var(--shadow-elevated)',
      border: '1px solid',
      borderColor: 'grey.200',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Executive Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.95) 100%)',
        borderBottom: '1px solid',
        borderColor: 'grey.100',
        p: { xs: 3, md: 4 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <AnalyticsIcon sx={{ 
            color: 'primary.main', 
            fontSize: '28px',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
          }} />
          <Typography variant="h5" sx={{
            fontWeight: 700,
            color: 'text.primary',
            letterSpacing: '-0.02em'
          }}>
            Executive Intelligence Dashboard
          </Typography>
        </Box>
        <Typography variant="body2" sx={{
          color: 'text.secondary',
          fontStyle: 'italic',
          maxWidth: '600px'
        }}>
          Strategic insights derived from {totalArtifacts} intelligence artifacts across {engagementDuration} days of relationship cultivation
        </Typography>
      </Box>

      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        {/* Key Metrics Row */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{
              textAlign: 'center',
              p: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
              borderRadius: 'var(--radius-medium)',
              border: '1px solid',
              borderColor: theme.palette.primary.main + '20'
            }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: 'primary.main',
                mb: 1,
                textShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                {totalArtifacts}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'text.secondary',
                fontSize: '12px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontWeight: 600
              }}>
                Intelligence Assets
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{
              textAlign: 'center',
              p: 3,
              background: `linear-gradient(135deg, ${theme.palette.sage?.main || theme.palette.success.main}15 0%, ${theme.palette.sage?.main || theme.palette.success.main}05 100%)`,
              borderRadius: 'var(--radius-medium)',
              border: '1px solid',
              borderColor: (theme.palette.sage?.main || theme.palette.success.main) + '20'
            }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: 'sage.main',
                mb: 1,
                textShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                {engagementDuration}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'text.secondary',
                fontSize: '12px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontWeight: 600
              }}>
                Days Cultivated
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{
              textAlign: 'center',
              p: 3,
              background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.main}05 100%)`,
              borderRadius: 'var(--radius-medium)',
              border: '1px solid',
              borderColor: theme.palette.info.main + '20'
            }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: 'info.main',
                mb: 1,
                textShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                {averageTimeBetweenDays > 0 ? averageTimeBetweenDays.toFixed(1) : '—'}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'text.secondary',
                fontSize: '12px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontWeight: 600
              }}>
                Avg Touch Frequency
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{
              textAlign: 'center',
              p: 3,
              background: `linear-gradient(135deg, ${theme.palette.secondary.main}15 0%, ${theme.palette.secondary.main}05 100%)`,
              borderRadius: 'var(--radius-medium)',
              border: '1px solid',
              borderColor: theme.palette.secondary.main + '20'
            }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: 'secondary.main',
                mb: 1,
                textShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                {insights.dominantChannels.length}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'text.secondary',
                fontSize: '12px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontWeight: 600
              }}>
                Primary Channels
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, opacity: 0.6 }} />

        {/* Executive Insights */}
        <Typography variant="h6" sx={{ 
          fontWeight: 700, 
          mb: 4, 
          color: 'text.primary',
          letterSpacing: '-0.01em'
        }}>
          Strategic Relationship Intelligence
        </Typography>
        
        <Grid container spacing={3}>
          {Object.entries(insights).slice(0, 5).map(([key, value]) => {
            const Icon = getInsightIcon(key);
            const color = getInsightColor(value);
            const labels = {
              engagementTrend: 'Engagement Trajectory',
              relationshipMomentum: 'Relationship Momentum',
              strategicDepth: 'Strategic Intelligence',
              communicationBalance: 'Communication Style',
              recentActivityLevel: 'Current Activity'
            };
            
            return (
              <Grid key={key} size={{ xs: 12, md: 6 }}>
                <Box sx={{
                  p: 3,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 'var(--radius-medium)',
                  background: 'background.paper',
                  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: color + '40',
                    boxShadow: `0 4px 20px ${color}15`,
                    transform: 'translateY(-2px)'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon sx={{ color: color, fontSize: '20px' }} />
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 600, 
                      color: 'text.primary',
                      fontSize: '14px'
                    }}>
                      {labels[key as keyof typeof labels]}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={value.toString().replace(/^\w/, (c) => c.toUpperCase())}
                      sx={{
                        backgroundColor: color + '15',
                        color: color,
                        fontWeight: 600,
                        fontSize: '13px',
                        textTransform: 'capitalize'
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            );
          })}
          
          {/* Dominant Channels Insight */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 'var(--radius-medium)',
              background: 'background.paper'
            }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                mb: 2,
                fontSize: '14px'
              }}>
                Communication Intelligence Breakdown
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(artifactTypeCounts)
                  .filter(([, count]) => count > 0)
                  .sort(([,a], [,b]) => b - a)
                  .map(([type, count]) => {
                    const percentage = ((count / totalArtifacts) * 100).toFixed(1);
                    const typeLabels: Record<string, string> = {
                      'voice_memo': 'Voice Intelligence',
                      'email': 'Digital Correspondence', 
                      'meeting': 'Live Connections',
                      'note': 'Strategic Notes',
                      'pog': 'Value Creation',
                      'ask': 'Support Requests',
                      'linkedin_profile': 'Professional Intel'
                    };
                    
                    return (
                      <Chip
                        key={type}
                        label={`${typeLabels[type] || type}: ${count} (${percentage}%)`}
                        variant="outlined"
                        sx={{
                          fontWeight: 500,
                          fontSize: '12px'
                        }}
                      />
                    );
                  })}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}; 