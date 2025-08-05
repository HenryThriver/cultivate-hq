import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
  Card,
  CardContent,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Assignment as ActionIcon,
  AutoAwesome as AIIcon,
  Source as SourceIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { CreateActionModal } from './CreateActionModal';
import { useUpdateAction } from '@/lib/hooks/useActions';
import type { ActionItem as ActionItemType } from '@/lib/hooks/useActions';

// Use ActionItem type from ActionDetailModal props
interface ActionItem extends Omit<ActionItemType, 'action_type' | 'status' | 'priority'> {
  type: 'pog' | 'ask' | 'general' | 'follow_up';
  status: 'queued' | 'active' | 'pending' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  source?: string;
  sourceArtifact?: {
    id: string;
    type: string;
    title: string;
    date: Date;
    excerpt?: string;
  };
  aiSuggestions?: Array<{
    id: string;
    type: 'approach' | 'timing' | 'context' | 'follow_up';
    title: string;
    description: string;
    confidence: number;
  }>;
  relatedContacts?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

interface ActionDetailModalProps {
  open: boolean;
  onClose: () => void;
  action: ActionItem | null;
  contactName: string;
  onUpdateStatus: (actionId: string, status: ActionItem['status']) => void;
  onViewArtifact?: (artifactId: string) => void;
}

export const ActionDetailModal: React.FC<ActionDetailModalProps> = ({
  open,
  onClose,
  action,
  contactName,
  onUpdateStatus,
  onViewArtifact,
}) => {
  const theme = useTheme();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const updateActionMutation = useUpdateAction();

  if (!action) return null;

  const getActionTypeColor = (type: ActionItem['type']) => {
    switch (type) {
      case 'pog': return theme.palette.artifacts.pog;
      case 'ask': return theme.palette.artifacts.ask;
      case 'follow_up': return theme.palette.artifacts.communication;
      default: return theme.palette.primary;
    }
  };

  const getPriorityColor = (priority: ActionItem['priority']) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
    }
  };

  const getStatusColor = (status: ActionItem['status']) => {
    switch (status) {
      case 'active': return theme.palette.artifacts.loop.main;
      case 'pending': return theme.palette.warning.main;
      case 'completed': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const handleStatusChange = async (newStatus: ActionItem['status']) => {
    // Map the status to the database format
    const dbStatus = newStatus === 'active' ? 'in_progress' : 
                     newStatus === 'queued' ? 'pending' : 
                     newStatus as any;
    
    try {
      await updateActionMutation.mutateAsync({
        id: action.id,
        updates: { status: dbStatus },
      });
      onUpdateStatus(action.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleActionUpdated = (updatedAction: ActionItemType) => {
    // Close the edit modal and refresh the parent
    setIsEditModalOpen(false);
    onClose();
  };

  const typeColors = getActionTypeColor(action.type);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 'var(--shadow-card-focus)',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexGrow: 1 }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            backgroundColor: typeColors.light,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ActionIcon sx={{ color: typeColors.main }} />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3 }}>
              {action.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={action.type.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: typeColors.light,
                  color: typeColors.main,
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              />
              <Chip 
                label={action.status}
                size="small"
                sx={{
                  backgroundColor: `${getStatusColor(action.status)}20`,
                  color: getStatusColor(action.status),
                  fontWeight: 500
                }}
              />
              <Chip 
                label={`${action.priority} priority`}
                size="small"
                sx={{
                  backgroundColor: `${getPriorityColor(action.priority)}20`,
                  color: getPriorityColor(action.priority),
                  fontWeight: 500
                }}
              />
            </Box>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          {/* Main Content */}
          <Box>
            {/* Description */}
            {action.description && (
              <Card sx={{ mb: 3, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Source Artifact - Enhanced to show POG/Ask context */}
            {action.sourceArtifact && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SourceIcon sx={{ color: theme.palette.artifacts.communication.main }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Linked {action.sourceArtifact.type.toUpperCase()} Context
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: (theme.palette.artifacts as any)[action.sourceArtifact.type]?.light || theme.palette.artifacts.communication.light,
                    border: `1px solid ${(theme.palette.artifacts as any)[action.sourceArtifact.type]?.main || theme.palette.artifacts.communication.main}30`,
                    cursor: onViewArtifact ? 'pointer' : 'default',
                    transition: 'all 200ms ease',
                    '&:hover': onViewArtifact ? {
                      backgroundColor: ((theme.palette.artifacts as any)[action.sourceArtifact.type]?.main || theme.palette.artifacts.communication.main) + '10',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    } : {}
                  }}
                  onClick={() => onViewArtifact?.(action.sourceArtifact!.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip 
                        label={action.sourceArtifact.type.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: (theme.palette.artifacts as any)[action.sourceArtifact.type]?.main || theme.palette.primary.main,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.65rem'
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {action.sourceArtifact.title}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {formatDate(action.sourceArtifact.date)}
                    </Typography>
                    {action.sourceArtifact.excerpt && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        "{action.sourceArtifact.excerpt}"
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ display: 'block', mt: 2, color: theme.palette.primary.main, fontWeight: 500 }}>
                      Click to view full {action.sourceArtifact.type} details →
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* AI Suggestions */}
            {action.aiSuggestions && action.aiSuggestions.length > 0 && (
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AIIcon sx={{ color: theme.palette.artifacts.insight.main }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      AI Suggestions
                    </Typography>
                    <Chip 
                      label="AI Powered"
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        height: 20,
                        backgroundColor: theme.palette.artifacts.insight.light,
                        color: theme.palette.artifacts.insight.main,
                        fontWeight: 500
                      }}
                    />
                  </Box>
                  <List dense disablePadding>
                    {action.aiSuggestions.map((suggestion) => (
                      <ListItem key={suggestion.id} disablePadding sx={{ mb: 1 }}>
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {suggestion.title}
                            </Typography>
                            <Chip 
                              label={`${suggestion.confidence}% confidence`}
                              size="small"
                              sx={{
                                fontSize: '0.6rem',
                                height: 18,
                                backgroundColor: 'rgba(0,0,0,0.05)',
                                color: 'text.secondary'
                              }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {suggestion.description}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Box>

          {/* Sidebar */}
          <Box>
            {/* Quick Actions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {action.status !== 'completed' && (
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<CheckIcon />}
                      onClick={() => handleStatusChange('completed')}
                      sx={{ 
                        textTransform: 'none',
                        backgroundColor: theme.palette.success.main,
                        '&:hover': { backgroundColor: theme.palette.success.dark }
                      }}
                    >
                      Mark Complete
                    </Button>
                  )}
                  {action.status === 'completed' && (
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => handleStatusChange('active')}
                      sx={{ textTransform: 'none' }}
                    >
                      Reopen Action
                    </Button>
                  )}
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: 'none' }}
                  >
                    Add Follow-up
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Details
                </Typography>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ScheduleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Contact"
                      secondary={contactName}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
                    />
                  </ListItem>
                  {action.dueDate && (
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <ScheduleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Due Date"
                        secondary={formatDate(action.dueDate)}
                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
                      />
                    </ListItem>
                  )}
                  {action.source && (
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <SourceIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Source"
                        secondary={action.source}
                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>

            {/* Related Contacts */}
            {action.relatedContacts && action.relatedContacts.length > 0 && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Related Contacts
                  </Typography>
                  <List dense disablePadding>
                    {action.relatedContacts.map((contact) => (
                      <ListItem key={contact.id} disablePadding>
                        <ListItemText 
                          primary={contact.name}
                          secondary={contact.role}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                          secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none' }}>
          Close
        </Button>
        <Button 
          variant="contained" 
          startIcon={<EditIcon />}
          onClick={handleEdit}
          sx={{ 
            textTransform: 'none',
            backgroundColor: typeColors.main,
            '&:hover': { backgroundColor: typeColors.dark }
          }}
        >
          Edit Action
        </Button>
      </DialogActions>

      {/* Edit Action Modal */}
      {isEditModalOpen && (
        <CreateActionModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          existingAction={{
            ...action,
            action_type: action.type === 'follow_up' ? 'send_follow_up' : 
                        action.type === 'pog' ? 'deliver_pog' : 
                        action.type === 'ask' ? 'follow_up_ask' : 'other',
            status: action.status === 'active' ? 'in_progress' : 
                   action.status === 'queued' ? 'pending' : 
                   action.status as any,
            priority: action.priority as any,
            due_date: action.dueDate?.toISOString(),
          } as ActionItemType}
          mode="edit"
          contactName={contactName}
          onActionUpdated={handleActionUpdated}
        />
      )}
    </Dialog>
  );
};