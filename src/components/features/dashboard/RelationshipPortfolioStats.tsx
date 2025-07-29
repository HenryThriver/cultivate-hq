'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  alpha,
  useTheme,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Balance as BalanceIcon,
  PersonAdd as PersonAddIcon,
  EmojiEvents as AchievementIcon,
  Speed as MomentumIcon
} from '@mui/icons-material';
import { useContacts } from '@/lib/hooks/useContacts';
import { dummyPortfolioMetrics } from '@/lib/data/dummyData';

interface PortfolioMetric {
  title: string;
  value: string | number;
  subtitle?: string;
  progress?: number; // 0-100 for progress bars
  icon: React.ReactNode;
  color: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    period: string;
  };
  insight?: string; // Tooltip insight
}

interface RelationshipPortfolioStatsProps {
  className?: string;
}

export const RelationshipPortfolioStats: React.FC<RelationshipPortfolioStatsProps> = ({ 
  className 
}) => {
  const theme = useTheme();
  const { contacts, isLoadingContacts } = useContacts();

  // Calculate metrics using sophisticated dummy data that demonstrates relationship intelligence
  const calculateMetrics = (): PortfolioMetric[] => {
    const contactCount = contacts?.length || 0;
    
    // Use rich dummy data to showcase executive-level insights
    const portfolioData = dummyPortfolioMetrics;
    
    return [
      {
        title: 'Active Relationships',
        value: contactCount > 0 ? contactCount : portfolioData.activeRelationships.value,
        subtitle: portfolioData.activeRelationships.subtitle,
        progress: portfolioData.activeRelationships.progress,
        icon: <PersonAddIcon sx={{ fontSize: 28 }} />,
        color: theme.palette.primary.main,
        trend: portfolioData.activeRelationships.trend,
        insight: portfolioData.activeRelationships.insight
      },
      {
        title: 'Reciprocity Balance',
        value: portfolioData.reciprocityBalance.value,
        subtitle: portfolioData.reciprocityBalance.subtitle,
        progress: portfolioData.reciprocityBalance.progress,
        icon: <BalanceIcon sx={{ fontSize: 28 }} />,
        color: theme.palette.sage?.main || '#059669',
        trend: portfolioData.reciprocityBalance.trend,
        insight: portfolioData.reciprocityBalance.insight
      },
      {
        title: 'Connection Momentum',
        value: portfolioData.connectionMomentum.value,
        subtitle: portfolioData.connectionMomentum.subtitle,
        progress: portfolioData.connectionMomentum.progress,
        icon: <MomentumIcon sx={{ fontSize: 28 }} />,
        color: theme.palette.amber?.main || '#F59E0B',
        trend: portfolioData.connectionMomentum.trend,
        insight: portfolioData.connectionMomentum.insight
      },
      {
        title: 'Strategic Wins',
        value: portfolioData.strategicWins.value,
        subtitle: portfolioData.strategicWins.subtitle,
        progress: portfolioData.strategicWins.progress,
        icon: <AchievementIcon sx={{ fontSize: 28 }} />,
        color: theme.palette.plum?.main || '#7C3AED',
        trend: portfolioData.strategicWins.trend,
        insight: portfolioData.strategicWins.insight
      }
    ];
  };

  const metrics = calculateMetrics();

  if (isLoadingContacts) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
          Relationship Portfolio
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={item}>
              <Card sx={{ height: 180, position: 'relative', overflow: 'hidden' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ animation: 'pulse 2s ease-in-out infinite' }}>
                    <Box sx={{ width: 64, height: 64, bgcolor: 'grey.200', borderRadius: 2, mb: 2 }} />
                    <Box sx={{ width: '60%', height: 20, bgcolor: 'grey.200', borderRadius: 1, mb: 1 }} />
                    <Box sx={{ width: '40%', height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box className={className} sx={{ mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            color: 'text.primary',
            letterSpacing: '-0.01em'
          }}
        >
          Relationship Portfolio
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            fontStyle: 'italic',
            opacity: 0.8
          }}
        >
          Strategic intelligence at a glance
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={metric.title}>
            <Tooltip 
              title={metric.insight} 
              arrow 
              placement="top"
              sx={{
                '& .MuiTooltip-tooltip': {
                  fontSize: '0.875rem',
                  fontStyle: 'italic',
                  maxWidth: 240
                }
              }}
            >
              <Card
                sx={{
                  height: 180,
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafffe 100%)',
                  border: '1px solid',
                  borderColor: alpha(metric.color, 0.1),
                  borderRadius: 3,
                  transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${metric.color} 0%, ${alpha(metric.color, 0.6)} 100%)`,
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                  },
                  
                  '&:hover': {
                    borderColor: alpha(metric.color, 0.3),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 32px ${alpha(metric.color, 0.15)}`,
                    
                    '&::before': {
                      transform: 'scaleX(1)'
                    }
                  }
                }}
              >
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Icon and Trend */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(metric.color, 0.1)} 0%, ${alpha(metric.color, 0.05)} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: metric.color,
                        flexShrink: 0,
                        border: `2px solid ${alpha(metric.color, 0.15)}`,
                        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {metric.icon}
                    </Box>
                    
                    {metric.trend && (
                      <Box sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TrendingUpIcon 
                            sx={{ 
                              fontSize: 16, 
                              color: metric.trend.direction === 'up' ? 'success.main' : 'error.main',
                              transform: metric.trend.direction === 'down' ? 'rotate(180deg)' : 'none'
                            }} 
                          />
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontWeight: 600,
                              color: metric.trend.direction === 'up' ? 'success.main' : 'error.main'
                            }}
                          >
                            {metric.trend.value}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.75rem'
                          }}
                        >
                          {metric.trend.period}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Value and Title */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        lineHeight: 1.2,
                        mb: 0.5,
                        letterSpacing: '-0.02em'
                      }}
                    >
                      {metric.value}
                    </Typography>
                    
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 0.5,
                        fontSize: '0.875rem',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {metric.title}
                    </Typography>
                    
                    {metric.subtitle && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          fontStyle: 'italic'
                        }}
                      >
                        {metric.subtitle}
                      </Typography>
                    )}
                  </Box>

                  {/* Progress Bar */}
                  {metric.progress !== undefined && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={metric.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: alpha(metric.color, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: `linear-gradient(90deg, ${metric.color} 0%, ${alpha(metric.color, 0.8)} 100%)`
                          }
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          mt: 0.5,
                          display: 'block'
                        }}
                      >
                        {metric.progress}% of strategic potential
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};