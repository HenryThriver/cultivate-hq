'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  alpha,
  useTheme,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Schedule as ScheduleIcon,
  Star as PriorityIcon,
  ConnectWithoutContact as IntroIcon,
  Campaign as FollowUpIcon,
  Psychology as AskIcon,
  Favorite as POGIcon,
  Check as CompleteIcon,
  AccessTime as TimeIcon,
  TrendingUp as UrgentIcon
} from '@mui/icons-material';
import { dummyActions } from '@/lib/data/dummyData';

interface ActionItem {
  id: string;
  type: 'pog' | 'ask' | 'follow_up' | 'introduction' | 'session' | 'connection';
  title: string;
  description: string;
  contact?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedTime: number; // minutes
  dueDate?: string;
  tags?: string[];
  actionable: boolean;
  context?: string; // Additional context about why this action is suggested
}

interface ActionPriorityHubProps {
  className?: string;
}

export const ActionPriorityHub: React.FC<ActionPriorityHubProps> = ({ 
  className 
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  // Use sophisticated dummy actions that demonstrate strategic relationship opportunities
  const actions = dummyActions;

  const getActionIcon = (type: ActionItem['type']) => {
    const iconMap = {
      pog: <POGIcon sx={{ fontSize: 18 }} />,
      ask: <AskIcon sx={{ fontSize: 18 }} />,
      follow_up: <FollowUpIcon sx={{ fontSize: 18 }} />,
      introduction: <IntroIcon sx={{ fontSize: 18 }} />,
      session: <StartIcon sx={{ fontSize: 18 }} />,
      connection: <IntroIcon sx={{ fontSize: 18 }} />
    };
    return iconMap[type];
  };

  const getActionColor = (type: ActionItem['type']) => {
    const colorMap = {
      pog: theme.palette.sage?.main || '#059669',
      ask: theme.palette.plum?.main || '#7C3AED',
      follow_up: theme.palette.amber?.main || '#F59E0B',
      introduction: theme.palette.primary.main,
      session: theme.palette.primary.main,
      connection: theme.palette.primary.main
    };
    return colorMap[type];
  };

  const getPriorityColor = (priority: ActionItem['priority']) => {
    const colorMap = {
      urgent: theme.palette.error.main,
      high: theme.palette.warning.main,
      medium: theme.palette.info.main,
      low: theme.palette.success.main
    };
    return colorMap[priority];
  };

  const getPriorityIcon = (priority: ActionItem['priority']) => {
    if (priority === 'urgent') {
      return <UrgentIcon sx={{ fontSize: 16 }} />;
    }
    return <PriorityIcon sx={{ fontSize: 16 }} />;
  };

  const tabData = [
    { label: 'Quick Wins', count: actions.filter(a => a.estimatedTime <= 10).length },
    { label: 'High Impact', count: actions.filter(a => ['urgent', 'high'].includes(a.priority)).length },
    { label: 'All Actions', count: actions.length }
  ];

  const getFilteredActions = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return actions.filter(a => a.estimatedTime <= 10);
      case 1:
        return actions.filter(a => ['urgent', 'high'].includes(a.priority));
      case 2:
      default:
        return actions;
    }
  };

  const filteredActions = getFilteredActions(activeTab);

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
          Priority Actions
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            fontStyle: 'italic',
            opacity: 0.8
          }}
        >
          Strategic opportunities, ranked by impact
        </Typography>
      </Box>

      <Card
        sx={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fafffe 100%)',
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.1),
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              px: 3,
              '& .MuiTab-root': {
                minHeight: 56,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem'
              }
            }}
          >
            {tabData.map((tab, index) => (
              <Tab
                key={index}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.label}
                    <Badge
                      badgeContent={tab.count}
                      color="primary"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.75rem',
                          minWidth: 18,
                          height: 18
                        }
                      }}
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {filteredActions.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CompleteIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
                All caught up!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No priority actions at the moment. Your relationship momentum is strong.
              </Typography>
            </Box>
          ) : (
            filteredActions.map((action, index) => (
              <Box 
                key={action.id}
                sx={{ 
                  p: 3,
                  borderBottom: index < filteredActions.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  
                  '&:hover': {
                    backgroundColor: alpha(getActionColor(action.type), 0.02),
                    '& .action-button': {
                      opacity: 1,
                      transform: 'translateX(0)'
                    }
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {/* Action Icon */}
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${alpha(getActionColor(action.type), 0.1)} 0%, ${alpha(getActionColor(action.type), 0.05)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: getActionColor(action.type),
                      flexShrink: 0,
                      border: `1px solid ${alpha(getActionColor(action.type), 0.2)}`
                    }}
                  >
                    {getActionIcon(action.type)}
                  </Box>

                  {/* Action Content */}
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
                          {action.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                          <Chip
                            icon={getPriorityIcon(action.priority)}
                            label={action.priority}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              height: 22,
                              backgroundColor: alpha(getPriorityColor(action.priority), 0.1),
                              color: getPriorityColor(action.priority),
                              fontWeight: 500,
                              '& .MuiChip-icon': { fontSize: 14 }
                            }}
                          />
                          
                          <Chip
                            icon={<TimeIcon sx={{ fontSize: 14 }} />}
                            label={`${action.estimatedTime} min`}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              height: 22,
                              backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                              color: 'text.secondary',
                              fontWeight: 500,
                              '& .MuiChip-icon': { fontSize: 14 }
                            }}
                          />
                          
                          {action.dueDate && (
                            <Chip
                              icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
                              label={action.dueDate}
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                height: 22,
                                backgroundColor: alpha(theme.palette.info.main, 0.1),
                                color: 'info.main',
                                fontWeight: 500,
                                '& .MuiChip-icon': { fontSize: 14 }
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                      
                      <Button
                        className="action-button"
                        variant="contained"
                        size="small"
                        startIcon={<StartIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          minWidth: 100,
                          px: 2,
                          py: 1,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          borderRadius: 2,
                          opacity: 0,
                          transform: 'translateX(8px)',
                          transition: 'all 200ms ease',
                          flexShrink: 0,
                          ml: 2,
                          background: `linear-gradient(135deg, ${getActionColor(action.type)} 0%, ${alpha(getActionColor(action.type), 0.8)} 100%)`,
                          
                          '&:hover': {
                            background: `linear-gradient(135deg, ${alpha(getActionColor(action.type), 0.9)} 0%, ${alpha(getActionColor(action.type), 0.7)} 100%)`,
                            transform: 'translateX(0) scale(1.02)'
                          }
                        }}
                      >
                        Start
                      </Button>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.5,
                        mb: 2,
                        fontSize: '0.875rem'
                      }}
                    >
                      {action.description}
                    </Typography>

                    {/* Contact Info */}
                    {action.contact && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            backgroundColor: alpha(getActionColor(action.type), 0.1),
                            color: getActionColor(action.type),
                            border: `1px solid ${alpha(getActionColor(action.type), 0.2)}`
                          }}
                        >
                          {action.contact.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              color: 'text.primary',
                              fontSize: '0.875rem',
                              lineHeight: 1.2
                            }}
                          >
                            {action.contact.name}
                          </Typography>
                          {action.contact.role && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.75rem'
                              }}
                            >
                              {action.contact.role}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Tags and Context */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      {action.tags && action.tags.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                          {action.tags.map((tag, idx) => (
                            <Chip
                              key={idx}
                              label={tag}
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                height: 20,
                                backgroundColor: alpha(getActionColor(action.type), 0.08),
                                color: getActionColor(action.type),
                                fontWeight: 500,
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          ))}
                        </Box>
                      )}
                      
                      {action.context && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            fontStyle: 'italic'
                          }}
                        >
                          {action.context}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
};