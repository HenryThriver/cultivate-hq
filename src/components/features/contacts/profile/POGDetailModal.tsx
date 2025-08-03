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
  Alert,
  LinearProgress
} from '@mui/material';
import { 
  Close as CloseIcon,
  Favorite as HeartIcon,
  TrendingUp as OfferIcon,
  TrendingDown as ReceiveIcon,
  Source as SourceIcon,
  Schedule as TimeIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Autorenew as ProcessIcon,
  Add as AddIcon,
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as PendingIcon,
  Schedule as InProgressIcon,
  Assignment as ActionIcon,
  List as ListIcon
} from '@mui/icons-material';

interface POGArtifact {
  id: string;
  type: 'pog';
  content: any;
  metadata?: {
    description?: string;
    status?: string;
    type_of_pog?: string;
    active_exchange?: boolean;
  };
  timestamp: string;
  ai_parsing_status?: 'pending' | 'processing' | 'completed' | 'failed';
  initiator_contact_id?: string;
  recipient_contact_id?: string;
  initiator_user_id?: string;
  recipient_user_id?: string;
}

interface SourceArtifact {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  excerpt?: string;
}

interface RelatedAction {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  createdAt: Date;
}

// Transform database action to modal format
const transformDbActionToModalAction = (dbAction: any): RelatedAction => ({
  id: dbAction.id,
  title: dbAction.title,
  description: dbAction.description,
  status: dbAction.status === 'cancelled' || dbAction.status === 'skipped' ? 'completed' : dbAction.status,
  priority: dbAction.priority === 'urgent' ? 'high' : dbAction.priority,
  dueDate: dbAction.due_date ? new Date(dbAction.due_date) : undefined,
  createdAt: new Date(dbAction.created_at),
});

interface POGDetailModalProps {
  open: boolean;
  onClose: () => void;
  pog: POGArtifact | null;
  contactName: string;
  contactId: string;
  currentUserId: string;
  sourceArtifact?: SourceArtifact;
  relatedActions?: RelatedAction[];
  onDelete?: (pogId: string) => void;
  onReprocess?: (pogId: string) => void;
  onViewSource?: (artifactId: string) => void;
  onAddAction?: (pogId: string) => void;
  onViewAction?: (actionId: string) => void;
  isDeleting?: boolean;
  isReprocessing?: boolean;
}

export const POGDetailModal: React.FC<POGDetailModalProps> = ({
  open,
  onClose,
  pog,
  contactName,
  contactId,
  currentUserId,
  sourceArtifact,
  relatedActions = [],
  onDelete,
  onReprocess,
  onViewSource,
  onAddAction,
  onViewAction,
  isDeleting = false,
  isReprocessing = false,
}) => {
  const theme = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!pog) return null;

  // Determine direction
  const isUserOffering = pog.initiator_user_id === currentUserId || pog.recipient_contact_id === contactId;
  const directionText = isUserOffering 
    ? `You offered to ${contactName}`
    : `${contactName} offered to you`;
  const DirectionIcon = isUserOffering ? OfferIcon : ReceiveIcon;
  const directionColor = isUserOffering ? theme.palette.artifacts.pog.main : theme.palette.artifacts.ask.main;

  // Status display
  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'offered': return { text: 'Offer Extended', color: theme.palette.artifacts.pog.main, bgColor: theme.palette.artifacts.pog.light };
      case 'delivered': return { text: 'Successfully Delivered', color: theme.palette.success.main, bgColor: theme.palette.success.light };
      case 'in_progress': return { text: 'In Progress', color: theme.palette.warning.main, bgColor: theme.palette.warning.light };
      case 'closed': return { text: 'Completed', color: theme.palette.success.main, bgColor: theme.palette.success.light };
      default: return { text: 'Queued', color: theme.palette.grey[600], bgColor: theme.palette.grey[100] };
    }
  };

  const statusInfo = getStatusInfo(pog.metadata?.status);

  // Format date
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  // AI Processing status
  const getProcessingStatus = () => {
    switch (pog.ai_parsing_status) {
      case 'pending':
        return { text: 'Queued for AI analysis', color: theme.palette.grey[600], showProgress: false };
      case 'processing':
        return { text: 'AI is analyzing this generosity...', color: theme.palette.primary.main, showProgress: true };
      case 'completed':
        return null; // Don't show when completed
      case 'failed':
        return { text: 'AI analysis failed', color: theme.palette.error.main, showProgress: false };
      default:
        return null;
    }
  };

  const processingStatus = getProcessingStatus();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
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
        pb: 1,
        background: `linear-gradient(135deg, ${theme.palette.artifacts.pog.light} 0%, #ffffff 100%)`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexGrow: 1 }}>
          <Box sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            backgroundColor: theme.palette.artifacts.pog.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <HeartIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
              Packet of Generosity
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <DirectionIcon sx={{ fontSize: 18, color: directionColor }} />
              <Typography variant="body1" sx={{ color: directionColor, fontWeight: 600 }}>
                {directionText}
              </Typography>
            </Box>
            <Chip 
              label={statusInfo.text}
              size="small"
              sx={{
                backgroundColor: statusInfo.bgColor,
                color: statusInfo.color,
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {/* AI Processing Status */}
        {processingStatus && (
          <Alert 
            severity="info" 
            icon={<ProcessIcon />}
            sx={{ mb: 3, backgroundColor: 'rgba(0,0,0,0.02)' }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {processingStatus.text}
            </Typography>
            {processingStatus.showProgress && (
              <LinearProgress 
                sx={{ mt: 1, borderRadius: 1 }} 
                color="primary"
              />
            )}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          {/* Main Content */}
          <Box>
            {/* Description */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                  What was offered
                </Typography>
                <Typography variant="body1" sx={{ 
                  lineHeight: 1.6, 
                  fontSize: '1rem',
                  color: 'text.primary',
                  fontWeight: 400
                }}>
                  {pog.metadata?.description || pog.content || 'No description provided'}
                </Typography>
                
                {pog.metadata?.type_of_pog && (
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label={`Type: ${pog.metadata.type_of_pog}`}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Source Context */}
            {sourceArtifact && (
              <Card 
                sx={{ 
                  cursor: onViewSource ? 'pointer' : 'default',
                  transition: 'all 200ms ease',
                  '&:hover': onViewSource ? {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  } : {}
                }}
                onClick={() => onViewSource?.(sourceArtifact.id)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SourceIcon sx={{ color: theme.palette.artifacts.communication.main }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Source Context
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: theme.palette.artifacts.communication.light,
                    border: `1px solid ${theme.palette.artifacts.communication.main}30`
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, textTransform: 'capitalize' }}>
                      {sourceArtifact.type.replace('_', ' ')}: {sourceArtifact.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {formatDate(sourceArtifact.timestamp)}
                    </Typography>
                    {sourceArtifact.excerpt && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        "{sourceArtifact.excerpt}"
                      </Typography>
                    )}
                  </Box>
                  {onViewSource && (
                    <Typography variant="caption" color="primary.main" sx={{ mt: 1, display: 'block' }}>
                      Click to view source →
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Related Actions */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ActionIcon sx={{ color: theme.palette.artifacts.loop.main }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Related Actions ({relatedActions.length})
                    </Typography>
                  </Box>
                  {onAddAction && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => onAddAction(pog.id)}
                      sx={{ 
                        textTransform: 'none',
                        borderColor: theme.palette.artifacts.pog.main,
                        color: theme.palette.artifacts.pog.main,
                        '&:hover': {
                          borderColor: theme.palette.artifacts.pog.dark,
                          backgroundColor: theme.palette.artifacts.pog.light
                        }
                      }}
                    >
                      Add Action
                    </Button>
                  )}
                </Box>

                {relatedActions.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 3, 
                    backgroundColor: 'rgba(0,0,0,0.02)', 
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'rgba(0,0,0,0.1)'
                  }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      No actions created yet
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Add an action to track next steps for this generosity
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {relatedActions.map((action) => {
                      const getStatusIcon = (status: string) => {
                        switch (status) {
                          case 'completed': return <CompletedIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />;
                          case 'in_progress': return <InProgressIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />;
                          default: return <PendingIcon sx={{ fontSize: 16, color: theme.palette.grey[500] }} />;
                        }
                      };

                      const getPriorityColor = (priority: string) => {
                        switch (priority) {
                          case 'high': return theme.palette.error.main;
                          case 'medium': return theme.palette.warning.main;
                          case 'low': return theme.palette.success.main;
                          default: return theme.palette.grey[500];
                        }
                      };

                      return (
                        <Box
                          key={action.id}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'rgba(0,0,0,0.1)',
                            cursor: onViewAction ? 'pointer' : 'default',
                            transition: 'all 200ms ease',
                            '&:hover': onViewAction ? {
                              borderColor: theme.palette.primary.main,
                              backgroundColor: 'rgba(0,0,0,0.02)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            } : {}
                          }}
                          onClick={() => onViewAction?.(action.id)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            {getStatusIcon(action.status)}
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                  {action.title}
                                </Typography>
                                <Chip 
                                  label={action.priority}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: '0.6rem',
                                    backgroundColor: `${getPriorityColor(action.priority)}20`,
                                    color: getPriorityColor(action.priority),
                                    textTransform: 'capitalize'
                                  }}
                                />
                              </Box>
                              {action.description && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  {action.description}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                Created {formatDate(action.createdAt.toString())}
                                {action.dueDate && ` • Due ${formatDate(action.dueDate.toString())}`}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                    
                    {relatedActions.length > 3 && (
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<ListIcon />}
                        sx={{ 
                          textTransform: 'none',
                          alignSelf: 'flex-start',
                          color: 'text.secondary'
                        }}
                      >
                        View all {relatedActions.length} actions
                      </Button>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Sidebar */}
          <Box>
            {/* Exchange Details */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Exchange Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Created
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatDate(pog.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Exchange with
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {contactName}
                      </Typography>
                    </Box>
                  </Box>

                  {pog.metadata?.active_exchange && (
                    <Chip 
                      label="Active Exchange"
                      size="small"
                      sx={{
                        backgroundColor: theme.palette.artifacts.loop.light,
                        color: theme.palette.artifacts.loop.main,
                        fontWeight: 600
                      }}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Primary action based on POG status */}
                  {pog.metadata?.status === 'offered' && onAddAction && (
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => onAddAction(pog.id)}
                      sx={{ 
                        textTransform: 'none',
                        backgroundColor: theme.palette.artifacts.pog.main,
                        '&:hover': { backgroundColor: theme.palette.artifacts.pog.dark }
                      }}
                    >
                      Plan Delivery
                    </Button>
                  )}

                  {pog.metadata?.status === 'delivered' && onAddAction && (
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => onAddAction(pog.id)}
                      sx={{ 
                        textTransform: 'none',
                        backgroundColor: theme.palette.artifacts.communication.main,
                        '&:hover': { backgroundColor: theme.palette.artifacts.communication.dark }
                      }}
                    >
                      Follow Up
                    </Button>
                  )}

                  {(!pog.metadata?.status || pog.metadata?.status === 'queued') && onAddAction && (
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => onAddAction(pog.id)}
                      sx={{ 
                        textTransform: 'none',
                        backgroundColor: theme.palette.artifacts.pog.main,
                        '&:hover': { backgroundColor: theme.palette.artifacts.pog.dark }
                      }}
                    >
                      Create Action
                    </Button>
                  )}

                  {/* Secondary actions */}
                  {relatedActions.length > 0 && (
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<ListIcon />}
                      sx={{ textTransform: 'none' }}
                    >
                      View All Actions ({relatedActions.length})
                    </Button>
                  )}

                  {/* AI reprocess - only show if failed */}
                  {onReprocess && pog.ai_parsing_status === 'failed' && (
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<ProcessIcon />}
                      onClick={() => onReprocess(pog.id)}
                      disabled={isReprocessing}
                      sx={{ 
                        textTransform: 'none',
                        color: 'warning.main',
                        borderColor: 'warning.main'
                      }}
                    >
                      {isReprocessing ? 'Reprocessing...' : 'Retry AI Analysis'}
                    </Button>
                  )}
                  
                  {/* Delete action - moved to bottom and more subtle */}
                  {onDelete && (
                    <>
                      {!showDeleteConfirm ? (
                        <Button
                          fullWidth
                          variant="text"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => setShowDeleteConfirm(true)}
                          disabled={isDeleting}
                          sx={{ 
                            textTransform: 'none',
                            color: 'text.secondary',
                            mt: 1,
                            '&:hover': {
                              backgroundColor: 'rgba(0,0,0,0.04)',
                              color: 'error.main'
                            }
                          }}
                        >
                          Delete POG
                        </Button>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                          <Typography variant="caption" color="error.main" sx={{ textAlign: 'center' }}>
                            This will permanently delete this POG
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setShowDeleteConfirm(false)}
                              sx={{ textTransform: 'none', flex: 1 }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => {
                                onDelete(pog.id);
                                setShowDeleteConfirm(false);
                              }}
                              disabled={isDeleting}
                              sx={{ textTransform: 'none', flex: 1 }}
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};