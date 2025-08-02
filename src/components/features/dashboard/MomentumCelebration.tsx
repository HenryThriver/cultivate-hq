'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  alpha,
  useTheme,
  Chip,
  Divider,
  Skeleton,
  Fade,
  Grow
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Favorite as POGIcon,
  AutoAwesome as SparkleIcon,
  Schedule as TimeIcon,
  Celebration as CelebrationIcon,
  Loop as LoopIcon,
  Rocket as RocketIcon,
} from '@mui/icons-material';
import { useRecentAchievements, type Achievement } from '@/lib/hooks/useRecentAchievements';
import Link from 'next/link';

interface MomentumCelebrationProps {
  className?: string;
}

export const MomentumCelebration: React.FC<MomentumCelebrationProps> = ({ 
  className 
}) => {
  const theme = useTheme();
  const { data: achievements, isLoading } = useRecentAchievements();

  const getAchievementIcon = (type: Achievement['type']) => {
    const iconMap = {
      goal_completed: <TrophyIcon sx={{ fontSize: 32 }} />,
      loop_completed: <LoopIcon sx={{ fontSize: 32 }} />,
      milestone_reached: <CelebrationIcon sx={{ fontSize: 32 }} />,
      network_growth: <RocketIcon sx={{ fontSize: 32 }} />,
      reciprocity_milestone: <POGIcon sx={{ fontSize: 32 }} />
    };
    return iconMap[type];
  };

  const getAchievementColor = (type: Achievement['type']) => {
    const colorMap = {
      goal_completed: theme.palette.success.main,
      loop_completed: theme.palette.primary.main,
      milestone_reached: theme.palette.amber?.main || '#F59E0B',
      network_growth: theme.palette.sage?.main || '#059669',
      reciprocity_milestone: theme.palette.plum?.main || '#7C3AED'
    };
    return colorMap[type];
  };

  const getCelebrationGradient = (level: Achievement['celebrationLevel'], color: string) => {
    const gradientMap = {
      subtle: `linear-gradient(135deg, ${alpha('#FFFFFF', 0.98)} 0%, ${alpha(color, 0.03)} 100%)`,
      moderate: `linear-gradient(135deg, ${alpha('#FFFFFF', 0.98)} 0%, ${alpha(color, 0.06)} 100%)`,
      significant: `linear-gradient(135deg, ${alpha('#FFFFFF', 0.98)} 0%, ${alpha(color, 0.1)} 100%)`
    };
    return gradientMap[level];
  };

  const getCelebrationShadow = (level: Achievement['celebrationLevel'], color: string) => {
    const shadowMap = {
      subtle: `0 2px 12px ${alpha(color, 0.08)}`,
      moderate: `0 4px 20px ${alpha(color, 0.12)}`,
      significant: `0 8px 32px ${alpha(color, 0.15)}`
    };
    return shadowMap[level];
  };

  // Loading state
  if (isLoading) {
    return (
      <Box className={className} sx={{ mb: 6 }}>
        <Skeleton variant="text" width={250} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={400} height={24} sx={{ mb: 4 }} />
        <Card sx={{ 
          borderRadius: 3,
          border: '1px solid',
          borderColor: alpha(theme.palette.success.main, 0.1)
        }}>
          <CardContent sx={{ p: 0 }}>
            {[1, 2, 3].map(i => (
              <Box key={i} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Skeleton variant="circular" width={56} height={56} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={28} />
                    <Skeleton variant="text" width="100%" height={20} sx={{ my: 1 }} />
                    <Skeleton variant="text" width="30%" height={16} />
                  </Box>
                </Box>
                {i < 3 && <Divider sx={{ mt: 3 }} />}
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Empty state
  if (!achievements || achievements.length === 0) {
    return (
      <Box className={className} sx={{ mb: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.75rem', md: '2rem' },
              mb: 1
            }}
          >
            Recent Wins
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontStyle: 'italic',
              opacity: 0.9
            }}
          >
            Your achievements will shine here
          </Typography>
        </Box>
        <Card sx={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
          border: '1px solid',
          borderColor: alpha(theme.palette.success.main, 0.1),
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          <CardContent sx={{ 
            textAlign: 'center', 
            py: 8,
            px: 4
          }}>
            <TrophyIcon sx={{ 
              fontSize: 64, 
              color: 'text.secondary', 
              opacity: 0.2, 
              mb: 3 
            }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 500,
                color: 'text.primary',
                mb: 1
              }}
            >
              Your first win awaits
            </Typography>
            <Typography 
              variant="body2" 
              sx={{
                color: 'text.secondary',
                maxWidth: 400,
                mx: 'auto'
              }}
            >
              Complete actions, achieve goals, and deliver value to see your impact celebrated here
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box className={className} sx={{ mb: 6 }}>
      {/* Enhanced Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.75rem', md: '2rem' }
            }}
          >
            Recent Wins
          </Typography>
          <Chip
            icon={<SparkleIcon sx={{ fontSize: 18 }} />}
            label={`${achievements.length} achievements`}
            size="small"
            sx={{
              fontSize: '0.875rem',
              height: 28,
              background: `linear-gradient(135deg, ${alpha(theme.palette.amber?.main || '#F59E0B', 0.1)} 0%, ${alpha(theme.palette.success.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(theme.palette.amber?.main || '#F59E0B', 0.2)}`,
              fontWeight: 500,
              '& .MuiChip-icon': {
                color: theme.palette.amber?.main || '#F59E0B'
              }
            }}
          />
        </Box>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary',
            fontStyle: 'italic',
            opacity: 0.9
          }}
        >
          Celebrating your relationship ROI and momentum
        </Typography>
      </Box>

      <Card
        sx={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
          border: '1px solid',
          borderColor: alpha(theme.palette.success.main, 0.1),
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, 
              ${theme.palette.success.main} 0%, 
              ${theme.palette.primary.main} 33%, 
              ${theme.palette.amber?.main || '#F59E0B'} 66%, 
              ${theme.palette.sage?.main || '#059669'} 100%
            )`
          }
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {achievements.map((achievement, index) => {
            const color = getAchievementColor(achievement.type);
            const gradient = getCelebrationGradient(achievement.celebrationLevel, color);
            const shadow = getCelebrationShadow(achievement.celebrationLevel, color);
            
            return (
              <Grow
                key={achievement.id}
                in={true}
                style={{ transformOrigin: '0 0 0' }}
                timeout={300 + (index * 100)}
              >
                <Box>
                  {index > 0 && <Divider />}
                  <Box 
                    sx={{ 
                      p: 4.875, // Golden ratio premium spacing (39px)
                      background: gradient,
                      position: 'relative',
                      cursor: 'default',
                      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                      
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: shadow
                      },

                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                      {/* Enhanced Achievement Icon */}
                      <Fade in={true} timeout={600 + (index * 100)}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.08)} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: color,
                            flexShrink: 0,
                            border: `2px solid ${alpha(color, 0.2)}`,
                            position: 'relative',
                            transition: 'all 300ms ease',
                            
                            '&:hover': {
                              transform: 'scale(1.05) rotate(5deg)'
                            }
                          }}
                        >
                          {getAchievementIcon(achievement.type)}
                        </Box>
                      </Fade>

                      {/* Achievement Content */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: 'text.primary',
                              fontSize: '1.25rem',
                              letterSpacing: '-0.01em',
                              lineHeight: 1.4
                            }}
                          >
                            {achievement.title}
                          </Typography>
                          
                          {achievement.value && (
                            <Chip
                              label={achievement.value}
                              size="small"
                              sx={{
                                fontSize: '0.875rem',
                                fontFamily: 'monospace',
                                fontWeight: 600,
                                height: 28,
                                backgroundColor: alpha(color, 0.1),
                                color: color,
                                border: `1px solid ${alpha(color, 0.2)}`,
                                ml: 2,
                                flexShrink: 0
                              }}
                            />
                          )}
                        </Box>

                        <Typography
                          variant="body1"
                          sx={{
                            color: 'text.secondary',
                            lineHeight: 1.6,
                            mb: 2,
                            fontSize: '1.0625rem'
                          }}
                        >
                          {achievement.description}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.7 }} />
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                letterSpacing: '0.02em'
                              }}
                            >
                              {achievement.timestamp}
                            </Typography>
                          </Box>
                          
                          {achievement.contact && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                sx={{
                                  width: 28,
                                  height: 28,
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  backgroundColor: alpha(color, 0.1),
                                  color: color,
                                  border: `2px solid ${alpha(color, 0.2)}`
                                }}
                              >
                                {achievement.contact.name.charAt(0)}
                              </Avatar>
                              <Link 
                                href={`/dashboard/contacts/${achievement.contact.id}`}
                                style={{ textDecoration: 'none' }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: 'text.primary',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    '&:hover': {
                                      textDecoration: 'underline',
                                      color: 'primary.main'
                                    }
                                  }}
                                >
                                  {achievement.contact.name}
                                </Typography>
                              </Link>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grow>
            );
          })}
        </CardContent>
      </Card>

    </Box>
  );
};