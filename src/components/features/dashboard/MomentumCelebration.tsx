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
  Divider
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Favorite as POGIcon,
  AutoAwesome as SparkleIcon,
  Schedule as TimeIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import { dummyAchievements } from '@/lib/data/dummyData';

interface Achievement {
  id: string;
  type: 'goal_completed' | 'loop_completed' | 'milestone_reached' | 'network_growth' | 'reciprocity_milestone';
  title: string;
  description: string;
  timestamp: string;
  value?: string | number;
  contact?: {
    name: string;
    avatar?: string;
  };
  celebrationLevel: 'subtle' | 'moderate' | 'significant'; // Controls celebration intensity
}


interface MomentumCelebrationProps {
  className?: string;
}

export const MomentumCelebration: React.FC<MomentumCelebrationProps> = ({ 
  className 
}) => {
  const theme = useTheme();

  // Use sophisticated dummy data that demonstrates relationship ROI and momentum
  const achievements = dummyAchievements;

  const getAchievementIcon = (type: Achievement['type']) => {
    const iconMap = {
      goal_completed: <TrophyIcon sx={{ fontSize: 24 }} />,
      loop_completed: <SparkleIcon sx={{ fontSize: 24 }} />,
      milestone_reached: <CelebrationIcon sx={{ fontSize: 24 }} />,
      network_growth: <TrophyIcon sx={{ fontSize: 24 }} />,
      reciprocity_milestone: <POGIcon sx={{ fontSize: 24 }} />
    };
    return iconMap[type];
  };

  const getAchievementColor = (type: Achievement['type']) => {
    const colorMap = {
      goal_completed: theme.palette.success.main,
      loop_completed: theme.palette.primary.main,
      milestone_reached: theme.palette.warning.main,
      network_growth: theme.palette.success.main,
      reciprocity_milestone: theme.palette.primary.main
    };
    return colorMap[type];
  };

  const getCelebrationIntensity = (level: Achievement['celebrationLevel']) => {
    const intensityMap = {
      subtle: {
        gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 255, 254, 0.9) 100%)',
        shadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        scale: 1
      },
      moderate: {
        gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 252, 232, 0.8) 100%)',
        shadow: '0 4px 16px rgba(245, 158, 11, 0.1)',
        scale: 1.02
      },
      significant: {
        gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(236, 253, 245, 0.9) 100%)',
        shadow: '0 8px 32px rgba(16, 185, 129, 0.15)',
        scale: 1.03
      }
    };
    return intensityMap[level];
  };

  const formatTimestamp = (timestamp: string) => {
    // Simple time formatting - in real app, use proper date library
    return timestamp;
  };

  return (
    <Box className={className}>
      {/* Achievements Section */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            color: 'text.primary',
            letterSpacing: '-0.01em'
          }}
        >
          Recent Wins
        </Typography>
        <Chip
          icon={<TrophyIcon sx={{ fontSize: 16 }} />}
          label={`${achievements.length} this week`}
          size="small"
          sx={{
            fontSize: '0.75rem',
            height: 24,
            backgroundColor: alpha(theme.palette.success.main, 0.1),
            color: 'success.main',
            fontWeight: 500
          }}
        />
      </Box>

      <Card
        sx={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
          border: '1px solid',
          borderColor: alpha(theme.palette.success.main, 0.1),
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {achievements.map((achievement, index) => {
            const color = getAchievementColor(achievement.type);
            const celebration = getCelebrationIntensity(achievement.celebrationLevel);
            
            return (
              <Box key={achievement.id}>
                {index > 0 && <Divider />}
                <Box 
                  sx={{ 
                    p: 3,
                    background: celebration.gradient,
                    boxShadow: celebration.shadow,
                    transform: `scale(${celebration.scale})`,
                    transformOrigin: 'center',
                    position: 'relative',
                    transition: 'all 300ms ease',
                    
                    '&:hover': {
                      transform: `scale(${celebration.scale + 0.01})`,
                      boxShadow: celebration.shadow.replace(/rgba\(([^)]+)\)/, 'rgba($1)')
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Achievement Icon */}
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.08)} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: color,
                        flexShrink: 0,
                        border: `2px solid ${alpha(color, 0.2)}`,
                        position: 'relative',
                        
                        ...(achievement.celebrationLevel === 'significant' && {
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: -2,
                            left: -2,
                            right: -2,
                            bottom: -2,
                            borderRadius: 3,
                            background: `linear-gradient(45deg, ${color}, transparent, ${color})`,
                            animation: 'sparkle 2s ease-in-out infinite',
                            zIndex: -1
                          }
                        })
                      }}
                    >
                      {getAchievementIcon(achievement.type)}
                    </Box>

                    {/* Achievement Content */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            fontSize: '1rem',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {achievement.title}
                        </Typography>
                        
                        {achievement.value && (
                          <Chip
                            label={achievement.value}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              height: 22,
                              backgroundColor: alpha(color, 0.1),
                              color: color,
                              fontWeight: 600,
                              ml: 1,
                              flexShrink: 0
                            }}
                          />
                        )}
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.6,
                          mb: 2,
                          fontSize: '0.875rem'
                        }}
                      >
                        {achievement.description}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}
                          >
                            {formatTimestamp(achievement.timestamp)}
                          </Typography>
                        </Box>
                        
                        {achievement.contact && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: alpha(color, 0.1),
                                color: color,
                                border: `1px solid ${alpha(color, 0.2)}`
                              }}
                            >
                              {achievement.contact.name.charAt(0)}
                            </Avatar>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.75rem'
                              }}
                            >
                              {achievement.contact.name}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </CardContent>
      </Card>

      {/* Add sparkle animation for significant celebrations */}
      <style jsx>{`
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.1);
          }
        }
      `}</style>
    </Box>
  );
};