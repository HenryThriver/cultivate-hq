'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  alpha,
  useTheme,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  Psychology as PatternIcon,
  EmojiObjects as OpportunityIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowIcon,
  AutoAwesome as SparkleIcon
} from '@mui/icons-material';
import { dummyInsights } from '@/lib/data/dummyData';

interface Insight {
  id: string;
  type: 'pattern' | 'opportunity' | 'trend' | 'intelligence';
  title: string;
  description: string;
  source: string; // e.g., "LinkedIn Analysis", "Voice Memo", "Meeting Intelligence"
  confidence: number; // 0-100
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  actionable: boolean;
  contacts?: string[]; // Contact names related to this insight
}

interface IntelligenceInsightsProps {
  className?: string;
}

export const IntelligenceInsights: React.FC<IntelligenceInsightsProps> = ({ 
  className 
}) => {
  const theme = useTheme();

  // Use sophisticated dummy insights that demonstrate AI-powered relationship intelligence
  const insights = dummyInsights;

  const getInsightIcon = (type: Insight['type']) => {
    const iconMap = {
      pattern: <PatternIcon sx={{ fontSize: 20 }} />,
      opportunity: <OpportunityIcon sx={{ fontSize: 20 }} />,
      trend: <TrendingIcon sx={{ fontSize: 20 }} />,
      intelligence: <SparkleIcon sx={{ fontSize: 20 }} />
    };
    return iconMap[type];
  };

  const getInsightColor = (type: Insight['type']) => {
    const colorMap = {
      pattern: theme.palette.sage?.main || '#059669',
      opportunity: theme.palette.amber?.main || '#F59E0B',
      trend: theme.palette.primary.main,
      intelligence: theme.palette.plum?.main || '#7C3AED'
    };
    return colorMap[type];
  };

  const getPriorityColor = (priority: Insight['priority']) => {
    const colorMap = {
      high: theme.palette.error.main,
      medium: theme.palette.warning.main,
      low: theme.palette.success.main
    };
    return colorMap[priority];
  };

  const formatTimestamp = (timestamp: string) => {
    // Simple time formatting - in real app, use proper date library
    return timestamp;
  };

  return (
    <Box className={className} sx={{ mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              letterSpacing: '-0.01em'
            }}
          >
            Intelligence Insights
          </Typography>
          <Chip
            label="AI Powered"
            size="small"
            sx={{
              fontSize: '0.75rem',
              height: 24,
              backgroundColor: alpha(theme.palette.sage?.main || '#059669', 0.1),
              color: theme.palette.sage?.main || '#059669',
              fontWeight: 500
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontStyle: 'italic',
              opacity: 0.8
            }}
          >
            Fresh intelligence from your network
          </Typography>
          <Tooltip title="Refresh insights">
            <IconButton 
              size="small"
              sx={{ 
                color: 'text.secondary',
                '&:hover': { 
                  color: 'primary.main',
                  transform: 'rotate(180deg)'
                },
                transition: 'all 300ms ease'
              }}
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Card
        sx={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
          border: '1px solid',
          borderColor: alpha(theme.palette.sage?.main || '#059669', 0.1),
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
            background: `linear-gradient(90deg, ${theme.palette.sage?.main || '#059669'} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.plum?.main || '#7C3AED'} 100%)`
          }
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {insights.map((insight, index) => (
            <Box key={insight.id}>
              {index > 0 && <Divider />}
              <Box 
                sx={{ 
                  p: 3,
                  position: 'relative',
                  cursor: insight.actionable ? 'pointer' : 'default',
                  transition: 'all 200ms ease',
                  
                  '&:hover': insight.actionable ? {
                    backgroundColor: alpha(getInsightColor(insight.type), 0.02),
                    '& .insight-action-arrow': {
                      opacity: 1,
                      transform: 'translateX(4px)'
                    }
                  } : {}
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {/* Insight Icon */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${alpha(getInsightColor(insight.type), 0.1)} 0%, ${alpha(getInsightColor(insight.type), 0.05)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: getInsightColor(insight.type),
                      flexShrink: 0,
                      border: `1px solid ${alpha(getInsightColor(insight.type), 0.2)}`
                    }}
                  >
                    {getInsightIcon(insight.type)}
                  </Box>

                  {/* Insight Content */}
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 0.5,
                            fontSize: '1rem',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {insight.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              height: 20,
                              backgroundColor: alpha(getInsightColor(insight.type), 0.1),
                              color: getInsightColor(insight.type),
                              fontWeight: 500,
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                          
                          <Chip
                            label={`${insight.confidence}% confidence`}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              height: 20,
                              backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                              color: 'text.secondary',
                              fontWeight: 500,
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                          
                          <Chip
                            label={insight.priority}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              height: 20,
                              backgroundColor: alpha(getPriorityColor(insight.priority), 0.1),
                              color: getPriorityColor(insight.priority),
                              fontWeight: 500,
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </Box>
                      </Box>
                      
                      {insight.actionable && (
                        <ArrowIcon 
                          className="insight-action-arrow"
                          sx={{ 
                            fontSize: 20, 
                            color: 'text.secondary',
                            opacity: 0,
                            transition: 'all 200ms ease',
                            flexShrink: 0,
                            ml: 1
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
                      {insight.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}
                        >
                          {insight.source} • {formatTimestamp(insight.timestamp)}
                        </Typography>
                      </Box>
                      
                      {insight.contacts && insight.contacts.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {insight.contacts.slice(0, 3).map((contact, idx) => (
                            <Avatar
                              key={idx}
                              sx={{
                                width: 24,
                                height: 24,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: alpha(getInsightColor(insight.type), 0.1),
                                color: getInsightColor(insight.type),
                                border: `1px solid ${alpha(getInsightColor(insight.type), 0.2)}`
                              }}
                            >
                              {contact.charAt(0)}
                            </Avatar>
                          ))}
                          {insight.contacts.length > 3 && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.75rem',
                                ml: 0.5
                              }}
                            >
                              +{insight.contacts.length - 3}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};