import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  Chip, 
  Button,
  Divider,
  Alert,
  useTheme
} from '@mui/material';
import { 
  Star, 
  Schedule, 
  CheckCircle,
  RadioButtonUnchecked
} from '@mui/icons-material';
import { ActionDetailModal } from './ActionDetailModal';
import { NextBestActionModal } from './NextBestActionModal';

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

const getActionTypeColor = (type: ActionItem['type'], theme: any) => {
  switch (type) {
    case 'pog': return { bg: theme.palette.artifacts.pog.light, color: theme.palette.artifacts.pog.main, label: 'POG' };
    case 'ask': return { bg: theme.palette.artifacts.ask.light, color: theme.palette.artifacts.ask.main, label: 'Ask' };
    case 'follow_up': return { bg: theme.palette.artifacts.communication.light, color: theme.palette.artifacts.communication.main, label: 'Follow-up' };
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
  const theme = useTheme();
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [nextBestActionModalOpen, setNextBestActionModalOpen] = useState(false);

  // Filter active actions (not completed)
  const activeActions = actions.filter(action => action.status !== 'completed');
  const highPriorityActions = activeActions.filter(action => action.priority === 'high');

  // Group actions by type
  const actionsByType = activeActions.reduce((acc, action) => {
    if (!acc[action.type]) acc[action.type] = [];
    acc[action.type].push(action);
    return acc;
  }, {} as Record<string, ActionItem[]>);

  const ActionChip: React.FC<{ action: ActionItem }> = ({ action }) => {
    const typeStyle = getActionTypeColor(action.type, theme);
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

  const ActionListItem: React.FC<{ action: ActionItem; theme: any; ActionChip: React.FC<{ action: ActionItem }> }> = ({ action, theme, ActionChip }) => (
    <ListItem 
      disableGutters
      sx={{ 
        py: 0.5,
        px: 1,
        mb: 1,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.05)',
        cursor: 'pointer',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': { 
          backgroundColor: 'rgba(0,0,0,0.02)',
          borderColor: 'rgba(0,0,0,0.1)',
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }
      }}
      onClick={() => {
        setSelectedAction(action);
        setActionModalOpen(true);
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        width: '100%',
        gap: 1 
      }}>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', fontSize: '0.8rem' }}>
            {action.title}
          </Typography>
          {action.source && (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.7rem' }}>
              From: {action.source}
            </Typography>
          )}
        </Box>
        
        <ActionChip action={action} />
      </Box>
    </ListItem>
  );

  return (
    <Paper 
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 2,
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
        border: '1px solid',
        borderColor: 'rgba(99, 102, 241, 0.1)',
        borderRadius: 3,
        boxShadow: 'var(--shadow-card)',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: 'var(--shadow-card-hover)',
          transform: 'translateY(-1px)',
        }
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
        Open Actions ({activeActions.length})
      </Typography>

      {/* Next Best Action Highlight */}
      {nextBestAction && (
        <Alert 
          severity="info" 
          icon={<Star />}
          sx={{ 
            mb: 2,
            backgroundColor: theme.palette.amber.light,
            border: `1px solid ${theme.palette.amber.main}`,
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            '& .MuiAlert-icon': { color: theme.palette.amber.dark },
            '& .MuiAlert-message': { color: theme.palette.amber.dark },
            '&:hover': {
              backgroundColor: theme.palette.amber.main,
              '& .MuiAlert-icon': { color: theme.palette.amber.contrastText },
              '& .MuiAlert-message': { color: theme.palette.amber.contrastText },
              transform: 'scale(1.02)',
              boxShadow: 'var(--shadow-card-hover)',
            }
          }}
          onClick={() => {
            setNextBestActionModalOpen(true);
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            ⭐ Next Best Action: {nextBestAction.title}
          </Typography>
          {nextBestAction.description && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {nextBestAction.description}
            </Typography>
          )}
          <Typography variant="caption" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
            Click for details and context
          </Typography>
        </Alert>
      )}

      {/* Actions Section */}
      <Box sx={{ mb: 3 }}>
        {highPriorityActions.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={`${highPriorityActions.length} urgent action${highPriorityActions.length !== 1 ? 's' : ''}`}
              size="small"
              sx={{ 
                backgroundColor: '#fecaca',
                color: '#dc2626',
                fontWeight: 500
              }}
            />
          </Box>
        )}
        
        {activeActions.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
            No open actions. Ready to create new opportunities!
          </Typography>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
            {/* POGs Column */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.artifacts.pog.main, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: theme.palette.artifacts.pog.main }} />
                POGs ({actionsByType.pog?.length || 0})
              </Typography>
              {actionsByType.pog?.length ? (
                <List dense disablePadding>
                  {actionsByType.pog.map((action) => (
                    <ActionListItem key={action.id} action={action} theme={theme} ActionChip={ActionChip} />
                  ))}
                </List>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No active POGs
                </Typography>
              )}
            </Box>
            
            {/* Asks Column */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.artifacts.ask.main, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: theme.palette.artifacts.ask.main }} />
                Asks ({actionsByType.ask?.length || 0})
              </Typography>
              {actionsByType.ask?.length ? (
                <List dense disablePadding>
                  {actionsByType.ask.map((action) => (
                    <ActionListItem key={action.id} action={action} theme={theme} ActionChip={ActionChip} />
                  ))}
                </List>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No active Asks
                </Typography>
              )}
            </Box>
            
            {/* Other Actions Column */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.artifacts.communication.main, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: theme.palette.artifacts.communication.main }} />
                Other Actions ({(actionsByType.general?.length || 0) + (actionsByType.follow_up?.length || 0)})
              </Typography>
              {(actionsByType.general?.length || actionsByType.follow_up?.length) ? (
                <List dense disablePadding>
                  {[...(actionsByType.general || []), ...(actionsByType.follow_up || [])].map((action) => (
                    <ActionListItem key={action.id} action={action} theme={theme} ActionChip={ActionChip} />
                  ))}
                </List>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No other actions
                </Typography>
              )}
            </Box>
          </Box>
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
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Timing Opportunities Section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Schedule sx={{ fontSize: 20, color: theme.palette.sage.main, mr: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#4338ca' }}>
            Timing Opportunities ({timingOpportunities.length})
          </Typography>
        </Box>
        
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
      </Box>

      {/* Action Detail Modal */}
      <ActionDetailModal
        open={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        action={selectedAction}
        contactName={contactName}
        onUpdateStatus={onUpdateActionStatus}
        onViewArtifact={(artifactId) => {
          // TODO: Implement artifact viewing
          console.log('View artifact:', artifactId);
        }}
      />

      {/* Next Best Action Modal */}
      {nextBestAction && (
        <NextBestActionModal
          open={nextBestActionModalOpen}
          onClose={() => setNextBestActionModalOpen(false)}
          action={{
            id: nextBestAction.id,
            title: nextBestAction.title,
            description: nextBestAction.description || 'AI-recommended action based on relationship analysis',
            type: nextBestAction.type as any,
            confidence: 85,
            urgency: nextBestAction.priority === 'high' ? 'high' : 'medium',
            estimatedImpact: 'high',
            reasoning: [
              {
                factor: 'Relationship Balance',
                explanation: 'Current reciprocity suggests this action would strengthen the relationship',
                weight: 0.8
              },
              {
                factor: 'Timing Opportunity',
                explanation: 'Recent interactions create favorable context for this action',
                weight: 0.7
              }
            ],
            suggestedApproaches: [
              {
                id: '1',
                title: 'Direct Approach',
                description: 'Reach out directly with a clear, specific offer or request',
                pros: ['Clear communication', 'Shows confidence', 'Gets quick response'],
                cons: ['Might seem too direct', 'Less personal']
              },
              {
                id: '2',
                title: 'Contextual Approach',
                description: 'Reference recent interactions and build on existing momentum',
                pros: ['More personal', 'Builds on relationship', 'Shows attention'],
                cons: ['Takes more time', 'Might be less clear']
              }
            ],
            context: {
              recentInteractions: [
                {
                  type: 'Meeting',
                  title: 'Coffee chat about industry trends',
                  date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                  relevance: 'Established good rapport and mutual interest'
                }
              ],
              relationshipState: {
                reciprocityBalance: 0.2,
                lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                engagementLevel: 'high' as const
              },
              timingFactors: [
                {
                  factor: 'Recent engagement',
                  description: 'High interaction frequency in past week',
                  impact: 'positive' as const
                },
                {
                  factor: 'Professional timing',
                  description: 'End of quarter - good time for new initiatives',
                  impact: 'positive' as const
                }
              ]
            }
          }}
          contactName={contactName}
          onTakeAction={(actionId, approach) => {
            console.log('Take action:', actionId, approach);
            setNextBestActionModalOpen(false);
          }}
        />
      )}
    </Paper>
  );
};