import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Button,
  Divider,
  IconButton,
  Collapse,
  Alert
} from '@mui/material';
import { 
  Star, 
  Assignment, 
  TrendingUp, 
  Schedule, 
  Celebration,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  RadioButtonUnchecked
} from '@mui/icons-material';

interface ActionItem {
  id: string;
  title: string;
  description?: string;
  type: 'pog' | 'ask' | 'general' | 'follow_up';
  status: 'queued' | 'active' | 'pending' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  source?: string; // e.g., "Voice memo from 2 days ago"
}

interface TimingOpportunity {
  id: string;
  type: 'birthday' | 'anniversary' | 'milestone' | 'linkedin_activity' | 'news';
  title: string;
  description: string;
  date?: Date;
  actionable: boolean;
}

interface ActionIntelligenceCenterProps {
  contactId: string;
  contactName: string;
  
  // Actions data
  actions: ActionItem[];
  onUpdateActionStatus: (actionId: string, newStatus: ActionItem['status']) => void;
  onCreateAction: (type: ActionItem['type']) => void;
  
  // Timing opportunities
  timingOpportunities: TimingOpportunity[];
  onActOnOpportunity: (opportunityId: string) => void;
  
  // Next best action
  nextBestAction?: ActionItem;
  
  // Loading states
  isLoading?: boolean;
}

const getActionTypeColor = (type: ActionItem['type']) => {
  switch (type) {
    case 'pog': return { bg: '#d1fae5', color: '#059669', label: 'POG' };
    case 'ask': return { bg: '#fed7aa', color: '#ea580c', label: 'Ask' };
    case 'follow_up': return { bg: '#dbeafe', color: '#2563eb', label: 'Follow-up' };
    default: return { bg: '#f3f4f6', color: '#6b7280', label: 'General' };
  }
};

const getOpportunityIcon = (type: TimingOpportunity['type']) => {
  switch (type) {
    case 'birthday': return '🎂';
    case 'anniversary': return '🎉';
    case 'milestone': return '🏆';
    case 'linkedin_activity': return '💼';
    case 'news': return '📰';
  }
};

const getPriorityColor = (priority: ActionItem['priority']) => {
  switch (priority) {
    case 'high': return '#dc2626';
    case 'medium': return '#d97706';
    case 'low': return '#059669';
  }
};

export const ActionIntelligenceCenter: React.FC<ActionIntelligenceCenterProps> = ({
  contactId,
  contactName,
  actions,
  onUpdateActionStatus,
  onCreateAction,
  timingOpportunities,
  onActOnOpportunity,
  nextBestAction,
  isLoading = false,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    actions: true,
    opportunities: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Group actions by type
  const actionsByType = actions.reduce((acc, action) => {
    if (!acc[action.type]) acc[action.type] = [];
    acc[action.type].push(action);
    return acc;
  }, {} as Record<string, ActionItem[]>);

  // Filter active actions (not completed)
  const activeActions = actions.filter(action => action.status !== 'completed');
  const highPriorityActions = activeActions.filter(action => action.priority === 'high');

  const ActionChip: React.FC<{ action: ActionItem }> = ({ action }) => {
    const typeStyle = getActionTypeColor(action.type);
    const isCompleted = action.status === 'completed';

    return (
      <Chip
        icon={isCompleted ? <CheckCircle /> : <RadioButtonUnchecked />}
        label={typeStyle.label}
        size="small"
        sx={{
          backgroundColor: isCompleted ? '#f3f4f6' : typeStyle.bg,
          color: isCompleted ? '#6b7280' : typeStyle.color,
          fontWeight: 500,
          '& .MuiChip-icon': {
            color: isCompleted ? '#6b7280' : typeStyle.color,
          }
        }}
        onClick={() => {
          const nextStatus = action.status === 'completed' ? 'active' : 'completed';
          onUpdateActionStatus(action.id, nextStatus);
        }}
      />
    );
  };

  return (
    <Paper 
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 2,
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)',
        backgroundColor: 'white',
      }}
    >
      <Typography 
        variant="h6" 
        component="h2" 
        sx={{ 
          mb: 2, 
          fontWeight: 600, 
          color: '#374151',
          fontSize: { xs: '1.1rem', md: '1.25rem' }
        }}
      >
        Action Intelligence
      </Typography>

      {/* Next Best Action Highlight */}
      {nextBestAction && (
        <Alert 
          severity="info" 
          icon={<Star />}
          sx={{ 
            mb: 2,
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            '& .MuiAlert-icon': { color: '#d97706' },
            '& .MuiAlert-message': { color: '#92400e' }
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Next Best Action: {nextBestAction.title}
          </Typography>
          {nextBestAction.description && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {nextBestAction.description}
            </Typography>
          )}
        </Alert>
      )}

      {/* Active Actions Section */}
      <Box sx={{ mb: 3 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            mb: 1
          }}
          onClick={() => toggleSection('actions')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Assignment sx={{ fontSize: 20, color: '#7c3aed', mr: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#4338ca' }}>
              Open Actions ({activeActions.length})
            </Typography>
            {highPriorityActions.length > 0 && (
              <Chip 
                label={`${highPriorityActions.length} urgent`}
                size="small"
                sx={{ 
                  ml: 1,
                  backgroundColor: '#fecaca',
                  color: '#dc2626',
                  fontWeight: 500
                }}
              />
            )}
          </Box>
          <IconButton size="small">
            {expandedSections.actions ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={expandedSections.actions}>
          {activeActions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
              No open actions. Ready to create new opportunities!
            </Typography>
          ) : (
            <List dense disablePadding>
              {activeActions.map((action) => (
                <ListItem 
                  key={action.id}
                  disableGutters
                  sx={{ 
                    py: 1,
                    borderRadius: 1,
                    '&:hover': { backgroundColor: '#f9fafb' }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    width: '100%',
                    gap: 1 
                  }}>
                    <Box sx={{ 
                      width: 4, 
                      height: 24, 
                      borderRadius: 2, 
                      backgroundColor: getPriorityColor(action.priority),
                      flexShrink: 0,
                      mt: 0.25
                    }} />
                    
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                        {action.title}
                      </Typography>
                      {action.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {action.description}
                        </Typography>
                      )}
                      {action.source && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          From: {action.source}
                        </Typography>
                      )}
                    </Box>
                    
                    <ActionChip action={action} />
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => onCreateAction('pog')}
              sx={{ textTransform: 'none' }}
            >
              + Add POG
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => onCreateAction('ask')}
              sx={{ textTransform: 'none' }}
            >
              + Add Ask
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => onCreateAction('general')}
              sx={{ textTransform: 'none' }}
            >
              + Add Action
            </Button>
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Timing Opportunities Section */}
      <Box>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            mb: 1
          }}
          onClick={() => toggleSection('opportunities')}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Schedule sx={{ fontSize: 20, color: '#059669', mr: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#4338ca' }}>
              Timing Opportunities ({timingOpportunities.length})
            </Typography>
          </Box>
          <IconButton size="small">
            {expandedSections.opportunities ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={expandedSections.opportunities}>
          {timingOpportunities.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
              No timing opportunities detected.
            </Typography>
          ) : (
            <List dense disablePadding>
              {timingOpportunities.map((opportunity) => (
                <ListItem 
                  key={opportunity.id}
                  disableGutters
                  sx={{ 
                    py: 1,
                    borderRadius: 1,
                    '&:hover': { backgroundColor: '#f9fafb' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                    <Typography sx={{ fontSize: '1.2rem' }}>
                      {getOpportunityIcon(opportunity.type)}
                    </Typography>
                    
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                        {opportunity.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {opportunity.description}
                      </Typography>
                    </Box>
                    
                    {opportunity.actionable && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => onActOnOpportunity(opportunity.id)}
                        sx={{ textTransform: 'none', flexShrink: 0 }}
                      >
                        Act
                      </Button>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Collapse>
      </Box>
    </Paper>
  );
};