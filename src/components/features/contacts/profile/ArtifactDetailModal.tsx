import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
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
import { ActionTile } from './ActionTile';
import { CreateActionModal } from './CreateActionModal';
import { MeetingContentUpload } from '../../meetings/MeetingContentUpload';
import type { ActionItem as DbActionItem } from '@/lib/hooks/useActions';
import { 
  Close as CloseIcon,
  Help as HandIcon,
  Favorite as HeartIcon,
  TrendingUp as OfferIcon,
  TrendingDown as ReceiveIcon,
  Source as SourceIcon,
  Schedule as TimeIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Autorenew as ProcessIcon,
  Add as AddIcon,
  Assignment as ActionIcon,
  List as ListIcon,
  MeetingRoom as MeetingIcon,
  Email as EmailIcon,
  Mic as VoiceMemoIcon,
  Article as DefaultIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import type { BaseArtifact as ImportedBaseArtifact } from '@/types/artifact';

// Base artifact interface
interface BaseArtifact {
  id: string;
  type: string;
  content: string | Record<string, unknown>;
  timestamp: string;
  ai_parsing_status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
  initiator_contact_id?: string;
  recipient_contact_id?: string;
  initiator_user_id?: string;
  recipient_user_id?: string;
}

interface POGArtifact extends BaseArtifact {
  type: 'pog';
  ai_parsing_status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
  metadata?: {
    description?: string;
    status?: string;
    type_of_pog?: string;
    active_exchange?: boolean;
  };
}

interface AskArtifact extends BaseArtifact {
  type: 'ask';
  ai_parsing_status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
  metadata?: {
    request_description?: string;
    status?: string;
    urgency?: string;
    active_exchange?: boolean;
  };
}

interface MeetingArtifact extends BaseArtifact {
  type: 'meeting';
  ai_parsing_status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
  metadata?: {
    title?: string;
    summary?: string;
    status?: string;
    meeting_type?: string;
    duration_minutes?: number;
  };
}

interface EmailArtifact extends BaseArtifact {
  type: 'email';
  ai_parsing_status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
  metadata?: {
    subject?: string;
    summary?: string;
    sentiment?: string;
    email_type?: string;
  };
}

interface VoiceMemoArtifact extends BaseArtifact {
  type: 'voice_memo';
  ai_parsing_status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
  metadata?: {
    title?: string;
    summary?: string;
    duration_seconds?: number;
    transcription_status?: string;
  };
}

type ArtifactUnion = POGArtifact | AskArtifact | MeetingArtifact | EmailArtifact | VoiceMemoArtifact;

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

interface ArtifactDetailModalProps {
  open: boolean;
  onClose: () => void;
  artifact: ArtifactUnion | ImportedBaseArtifact | null;
  contactName: string;
  contactId: string;
  currentUserId: string;
  sourceArtifact?: SourceArtifact;
  relatedActions?: RelatedAction[];
  onDelete?: (artifactId: string) => void;
  onReprocess?: (artifactId: string) => void;
  onViewSource?: (artifactId: string) => void;
  onAddAction?: (artifactId: string) => void;
  onViewAction?: (actionId: string) => void;
  isDeleting?: boolean;
  isReprocessing?: boolean;
  onActionRefresh?: () => void;
  artifacts?: Record<string, unknown>[]; // Add artifacts prop to pass to CreateActionModal
  onMeetingContentSave?: (meetingId: string, contentType: 'notes' | 'transcript' | 'recording' | 'voice_memo', content: string | File) => Promise<void>;
}

// Configuration for different artifact types
const getArtifactConfig = (artifactType: string, theme: Theme) => {
  const configs = {
    pog: {
      icon: HeartIcon,
      title: 'Packet of Generosity',
      colorKey: 'pog' as const,
      contentTitle: 'What was offered',
      getDirectionText: (isUserInitiating: boolean, contactName: string) => 
        isUserInitiating ? `You offered to ${contactName}` : `${contactName} offered to you`,
      getDirectionIcon: (isUserInitiating: boolean) => isUserInitiating ? OfferIcon : ReceiveIcon,
      getStatusInfo: (status?: string, theme?: any) => {
        switch (status) {
          case 'offered': return { text: 'Offer Extended', color: theme.palette.artifacts.pog.main, bgColor: theme.palette.artifacts.pog.light };
          case 'delivered': return { text: 'Successfully Delivered', color: theme.palette.success.main, bgColor: theme.palette.success.light };
          case 'in_progress': return { text: 'In Progress', color: theme.palette.warning.main, bgColor: theme.palette.warning.light };
          case 'closed': return { text: 'Completed', color: theme.palette.success.main, bgColor: theme.palette.success.light };
          default: return { text: 'Queued', color: theme.palette.grey[600], bgColor: theme.palette.grey[100] };
        }
      },
      getProcessingText: () => 'AI is analyzing this generosity...',
      actionType: 'deliver_pog' as const,
      deleteButtonText: 'Delete POG',
      deleteConfirmText: 'This will permanently delete this POG',
      activeChipText: 'Active Exchange',
      sidebarTitle: 'Exchange Details',
      getDescription: (artifact: any) => artifact.metadata?.description || artifact.content || 'No description provided'
    },
    ask: {
      icon: HandIcon,
      title: 'Ask',
      colorKey: 'ask' as const,
      contentTitle: 'What was requested',
      getDirectionText: (isUserInitiating: boolean, contactName: string) => 
        isUserInitiating ? `You asked ${contactName}` : `${contactName} asked you`,
      getDirectionIcon: (isUserInitiating: boolean) => isUserInitiating ? OfferIcon : ReceiveIcon,
      getStatusInfo: (status?: string, theme?: any) => {
        switch (status) {
          case 'requested': return { text: 'Request Sent', color: theme.palette.artifacts.ask.main, bgColor: theme.palette.artifacts.ask.light };
          case 'received': return { text: 'Request Fulfilled', color: theme.palette.success.main, bgColor: theme.palette.success.light };
          case 'in_progress': return { text: 'In Progress', color: theme.palette.warning.main, bgColor: theme.palette.warning.light };
          case 'closed': return { text: 'Completed', color: theme.palette.success.main, bgColor: theme.palette.success.light };
          default: return { text: 'Queued', color: theme.palette.grey[600], bgColor: theme.palette.grey[100] };
        }
      },
      getProcessingText: () => 'AI is analyzing this request...',
      actionType: 'follow_up_ask' as const,
      deleteButtonText: 'Delete Ask',
      deleteConfirmText: 'This will permanently delete this Ask',
      activeChipText: 'Active Request',
      sidebarTitle: 'Request Details',
      getDescription: (artifact: any) => artifact.metadata?.request_description || artifact.content || 'No description provided'
    },
    meeting: {
      icon: MeetingIcon,
      title: 'Meeting',
      colorKey: 'communication' as const,
      contentTitle: 'Meeting Summary',
      getDirectionText: (isUserInitiating: boolean, contactName: string) => `Meeting with ${contactName}`,
      getDirectionIcon: () => MeetingIcon,
      getStatusInfo: (status?: string, theme?: any) => {
        switch (status) {
          case 'scheduled': return { text: 'Scheduled', color: theme.palette.info.main, bgColor: theme.palette.info.light };
          case 'completed': return { text: 'Completed', color: theme.palette.success.main, bgColor: theme.palette.success.light };
          case 'cancelled': return { text: 'Cancelled', color: theme.palette.error.main, bgColor: theme.palette.error.light };
          default: return { text: 'Draft', color: theme.palette.grey[600], bgColor: theme.palette.grey[100] };
        }
      },
      getProcessingText: () => 'AI is analyzing this meeting...',
      actionType: 'add_meeting_notes' as const,
      deleteButtonText: 'Delete Meeting',
      deleteConfirmText: 'This will permanently delete this Meeting',
      activeChipText: 'Active Meeting',
      sidebarTitle: 'Meeting Details',
      getDescription: (artifact: any) => {
        // For meetings, extract just the summary text from the processed content
        try {
          let content = artifact.content;
          // Parse JSON string if needed
          if (typeof content === 'string') {
            content = JSON.parse(content);
          }
          if (content && typeof content === 'object') {
            if (content.summary) {
              return content.summary;
            }
            if (content.meeting_notes) {
              return content.meeting_notes;
            }
          }
        } catch (e) {
          // If parsing fails, fall through to metadata
        }
        return artifact.metadata?.summary || artifact.metadata?.title || 'No summary available';
      }
    },
    email: {
      icon: EmailIcon,
      title: 'Email',
      colorKey: 'communication' as const,
      contentTitle: 'Email Content',
      getDirectionText: (isUserInitiating: boolean, contactName: string) => `Email with ${contactName}`,
      getDirectionIcon: () => EmailIcon,
      getStatusInfo: (status?: string, theme?: any) => {
        switch (status) {
          case 'sent': return { text: 'Sent', color: theme.palette.success.main, bgColor: theme.palette.success.light };
          case 'received': return { text: 'Received', color: theme.palette.info.main, bgColor: theme.palette.info.light };
          case 'draft': return { text: 'Draft', color: theme.palette.warning.main, bgColor: theme.palette.warning.light };
          default: return { text: 'Unknown', color: theme.palette.grey[600], bgColor: theme.palette.grey[100] };
        }
      },
      getProcessingText: () => 'AI is analyzing this email...',
      actionType: 'send_follow_up' as const,
      deleteButtonText: 'Delete Email',
      deleteConfirmText: 'This will permanently delete this Email',
      activeChipText: 'Active Thread',
      sidebarTitle: 'Email Details',
      getDescription: (artifact: any) => artifact.metadata?.summary || artifact.content || 'No content provided'
    },
    voice_memo: {
      icon: VoiceMemoIcon,
      title: 'Voice Memo',
      colorKey: 'communication' as const,
      contentTitle: 'Voice Memo Transcript',
      getDirectionText: (isUserInitiating: boolean, contactName: string) => `Voice memo about ${contactName}`,
      getDirectionIcon: () => VoiceMemoIcon,
      getStatusInfo: (status?: string, theme?: any) => {
        switch (status) {
          case 'transcribed': return { text: 'Transcribed', color: theme.palette.success.main, bgColor: theme.palette.success.light };
          case 'processing': return { text: 'Processing', color: theme.palette.warning.main, bgColor: theme.palette.warning.light };
          case 'failed': return { text: 'Failed', color: theme.palette.error.main, bgColor: theme.palette.error.light };
          default: return { text: 'Recorded', color: theme.palette.info.main, bgColor: theme.palette.info.light };
        }
      },
      getProcessingText: () => 'AI is analyzing this voice memo...',
      actionType: 'add_meeting_notes' as const,
      deleteButtonText: 'Delete Voice Memo',
      deleteConfirmText: 'This will permanently delete this Voice Memo',
      activeChipText: 'Active Recording',
      sidebarTitle: 'Voice Memo Details',
      getDescription: (artifact: any) => artifact.metadata?.summary || artifact.metadata?.title || artifact.content || 'No transcript available'
    },
    default: {
      icon: DefaultIcon,
      title: 'Artifact',
      colorKey: 'communication' as const,
      contentTitle: 'Content',
      getDirectionText: (isUserInitiating: boolean, contactName: string) => `Artifact with ${contactName}`,
      getDirectionIcon: () => DefaultIcon,
      getStatusInfo: (status?: string, theme?: any) => {
        return { text: status || 'Unknown', color: theme.palette.grey[600], bgColor: theme.palette.grey[100] };
      },
      getProcessingText: () => 'AI is analyzing this artifact...',
      actionType: 'other' as const,
      deleteButtonText: 'Delete Artifact',
      deleteConfirmText: 'This will permanently delete this Artifact',
      activeChipText: 'Active',
      sidebarTitle: 'Artifact Details',
      getDescription: (artifact: any) => artifact.content || 'No content provided'
    }
  };
  
  return configs[artifactType as keyof typeof configs] || configs.default;
};

export const ArtifactDetailModal: React.FC<ArtifactDetailModalProps> = ({
  open,
  onClose,
  artifact,
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
  onActionRefresh,
  artifacts = [], // Extract artifacts prop
  onMeetingContentSave,
}) => {
  const theme = useTheme();
  
  // Parse meeting content if it's a string
  const parsedContent = useMemo(() => {
    if (artifact && artifact.type === 'meeting') {
      try {
        let content = artifact.content;
        if (typeof content === 'string') {
          content = JSON.parse(content);
        }
        return content && typeof content === 'object' ? content : null;
      } catch (e) {
        return null;
      }
    }
    return artifact?.content;
  }, [artifact]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);
  const [selectedActionForEdit, setSelectedActionForEdit] = useState<DbActionItem | null>(null);
  const [isMeetingContentModalOpen, setIsMeetingContentModalOpen] = useState(false);
  const [savingMeetingContent, setSavingMeetingContent] = useState(false);

  if (!artifact) return null;

  const config = getArtifactConfig(artifact.type, theme);
  const Icon = config.icon;
  
  // Determine if user is the initiator
  const isUserInitiating = artifact.initiator_user_id === currentUserId || 
    (artifact.type === 'pog' && artifact.recipient_contact_id === contactId) ||
    (artifact.type === 'ask' && artifact.recipient_contact_id === contactId);
  
  const directionText = config.getDirectionText(isUserInitiating, contactName);
  const DirectionIcon = config.getDirectionIcon(isUserInitiating);
  const directionColor = isUserInitiating 
    ? theme.palette.artifacts[config.colorKey].main 
    : theme.palette.artifacts.ask.main;

  // Get status info - safely access status from metadata
  const getArtifactStatus = () => {
    if (!artifact.metadata) return undefined;
    
    // Type-safe access to status based on artifact type
    if (artifact.type === 'pog' || artifact.type === 'ask') {
      return (artifact.metadata as any)?.status;
    }
    if (artifact.type === 'meeting') {
      return (artifact.metadata as any)?.status;
    }
    if (artifact.type === 'email') {
      return (artifact.metadata as any)?.status;
    }
    if (artifact.type === 'voice_memo') {
      return (artifact.metadata as any)?.transcription_status;
    }
    
    return undefined;
  };
  
  const artifactStatus = getArtifactStatus();
  const statusInfo = config.getStatusInfo(artifactStatus, theme);

  // Get urgency info (for asks)
  const getUrgencyInfo = (urgency?: string) => {
    if (artifact.type !== 'ask') return null;
    switch (urgency) {
      case 'high': return { text: 'High Priority', color: theme.palette.error.main, bgColor: theme.palette.error.light };
      case 'medium': return { text: 'Medium Priority', color: theme.palette.warning.main, bgColor: theme.palette.warning.light };
      case 'low': return { text: 'Low Priority', color: theme.palette.success.main, bgColor: theme.palette.success.light };
      default: return null;
    }
  };

  const urgencyInfo = getUrgencyInfo((artifact.metadata as any)?.urgency);

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
    switch (artifact.ai_parsing_status) {
      case 'pending':
        return { text: 'Queued for AI analysis', color: theme.palette.grey[600], showProgress: false };
      case 'processing':
        return { text: config.getProcessingText(), color: theme.palette.primary.main, showProgress: true };
      case 'completed':
        return null; // Don't show when completed
      case 'failed':
        return { text: 'AI analysis failed', color: theme.palette.error.main, showProgress: false };
      default:
        return null;
    }
  };

  const processingStatus = getProcessingStatus();

  const handleMeetingContentSave = async (contentType: 'notes' | 'transcript' | 'recording', content: string | File) => {
    if (!artifact || artifact.type !== 'meeting' || !onMeetingContentSave) return;
    
    try {
      setSavingMeetingContent(true);
      await onMeetingContentSave(artifact.id, contentType, content);
      setIsMeetingContentModalOpen(false);
      // Refresh data if available
      onActionRefresh?.();
    } catch (error) {
      console.error('Failed to save meeting content:', error);
      // Error is handled by parent component
    } finally {
      setSavingMeetingContent(false);
    }
  };

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
        background: `linear-gradient(135deg, ${theme.palette.artifacts[config.colorKey].light} 0%, #ffffff 100%)`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexGrow: 1 }}>
          <Box sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            backgroundColor: theme.palette.artifacts[config.colorKey].main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Icon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
              {config.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <DirectionIcon sx={{ fontSize: 18, color: directionColor }} />
              <Typography variant="body1" sx={{ color: directionColor, fontWeight: 600 }}>
                {directionText}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
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
              {urgencyInfo && (
                <Chip 
                  label={urgencyInfo.text}
                  size="small"
                  sx={{
                    backgroundColor: urgencyInfo.bgColor,
                    color: urgencyInfo.color,
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
              )}
              {artifact.type === 'meeting' && onMeetingContentSave && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => setIsMeetingContentModalOpen(true)}
                  sx={{ 
                    ml: 1,
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    height: '24px',
                    borderColor: theme.palette.artifacts.communication.main,
                    color: theme.palette.artifacts.communication.main,
                    '&:hover': {
                      borderColor: theme.palette.artifacts.communication.dark,
                      backgroundColor: theme.palette.artifacts.communication.light
                    }
                  }}
                >
                  Add Content
                </Button>
              )}
            </Box>
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
                  {config.contentTitle}
                </Typography>
                <Typography variant="body1" sx={{ 
                  lineHeight: 1.6, 
                  fontSize: '1rem',
                  color: 'text.primary',
                  fontWeight: 400
                }}>
                  {config.getDescription(artifact)}
                </Typography>
                
                {/* Type-specific metadata */}
                {artifact.type === 'pog' && (artifact as POGArtifact).metadata?.type_of_pog && (
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label={`Type: ${(artifact as POGArtifact).metadata?.type_of_pog}`}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                )}

                {/* Meeting-specific rich content */}
                {artifact.type === 'meeting' && parsedContent && (
                  <Box sx={{ mt: 3 }}>
                    {/* Key Topics */}
                    {parsedContent.key_topics && Array.isArray(parsedContent.key_topics) && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Key Topics
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {parsedContent.key_topics.map((topic: string, index: number) => (
                            <Chip 
                              key={index}
                              label={topic}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Action Items */}
                    {parsedContent.action_items && Array.isArray(parsedContent.action_items) && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Action Items
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                          {parsedContent.action_items.map((item: any, index: number) => (
                            <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, minWidth: 'fit-content' }}>
                                •
                              </Typography>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {item.task}
                                </Typography>
                                {item.owner && (
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Owner: {item.owner} {item.due_date && `• Due: ${new Date(item.due_date).toLocaleDateString()}`}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Insights */}
                    {parsedContent.insights && typeof parsedContent.insights === 'object' && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Key Insights
                        </Typography>
                        {parsedContent.insights.relationship_notes && (
                          <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
                            {parsedContent.insights.relationship_notes}
                          </Typography>
                        )}
                        {parsedContent.insights.opportunities && Array.isArray(parsedContent.insights.opportunities) && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                              Opportunities:
                            </Typography>
                            {parsedContent.insights.opportunities.map((opp: string, index: number) => (
                              <Typography key={index} variant="body2" sx={{ pl: 2, color: 'success.main' }}>
                                • {opp}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Meeting Notes */}
                    {parsedContent.meeting_notes && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Notes
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          backgroundColor: 'grey.50', 
                          p: 2, 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'grey.200',
                          lineHeight: 1.6
                        }}>
                          {parsedContent.meeting_notes}
                        </Typography>
                      </Box>
                    )}
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
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setIsCreateActionModalOpen(true)}
                    sx={{ 
                      textTransform: 'none',
                      borderColor: theme.palette.artifacts[config.colorKey].main,
                      color: theme.palette.artifacts[config.colorKey].main,
                      '&:hover': {
                        borderColor: theme.palette.artifacts[config.colorKey].dark,
                        backgroundColor: theme.palette.artifacts[config.colorKey].light
                      }
                    }}
                  >
                    Add Action
                  </Button>
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
                      Add an action to track next steps for this {config.title.toLowerCase()}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {relatedActions.slice(0, 3).map((action) => {
                      // Transform RelatedAction to DbActionItem format
                      const dbAction: DbActionItem = {
                        id: action.id,
                        title: action.title,
                        description: action.description,
                        action_type: config.actionType,
                        status: action.status,
                        priority: action.priority === 'high' ? 'urgent' : action.priority,
                        due_date: action.dueDate?.toISOString(),
                        created_at: action.createdAt.toISOString(),
                        updated_at: action.createdAt.toISOString(),
                        user_id: currentUserId,
                        contact_id: contactId,
                        artifact_id: artifact.id,
                      };

                      return (
                        <ActionTile
                          key={action.id}
                          action={dbAction}
                          onEdit={(action) => {
                            setSelectedActionForEdit(action);
                            setIsCreateActionModalOpen(true);
                          }}
                          onView={onViewAction ? (action) => onViewAction(action.id) : undefined}
                          compact
                        />
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
            {/* Details */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  {config.sidebarTitle}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Created
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatDate(artifact.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {artifact.type === 'ask' ? (isUserInitiating ? 'Requested from' : 'Requested by') :
                         artifact.type === 'pog' ? 'Exchange with' : 'Related to'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {contactName}
                      </Typography>
                    </Box>
                  </Box>

                  {(artifact.metadata as any)?.active_exchange && (
                    <Chip 
                      label={config.activeChipText}
                      size="small"
                      sx={{
                        backgroundColor: theme.palette.artifacts.loop.light,
                        color: theme.palette.artifacts.loop.main,
                        fontWeight: 600
                      }}
                    />
                  )}
                </Box>
                
                {/* Delete Button */}
                {onDelete && (
                  <Box sx={{ mt: 2 }}>
                    {!showDeleteConfirm ? (
                      <Button
                        fullWidth
                        size="small"
                        variant="text"
                        onClick={() => setShowDeleteConfirm(true)}
                        sx={{ 
                          textTransform: 'none',
                          color: '#6b7280',
                          fontSize: '0.875rem',
                          fontWeight: 400,
                          '&:hover': {
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                          }
                        }}
                      >
                        {config.deleteButtonText}
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="caption" color="error.main" sx={{ textAlign: 'center' }}>
                          {config.deleteConfirmText}
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
                              onDelete(artifact.id);
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
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </DialogContent>

      {/* Create/Edit Action Modal */}
      {isCreateActionModalOpen && (
        <CreateActionModal
          open={isCreateActionModalOpen}
          onClose={() => {
            setIsCreateActionModalOpen(false);
            setSelectedActionForEdit(null);
          }}
          contactId={contactId}
          contactName={contactName}
          artifactId={artifact.id}
          artifactType={artifact.type as 'pog' | 'ask' | 'meeting' | 'other'}
          artifactContext={{
            title: config.getDescription(artifact),
            description: config.getDescription(artifact),
            status: artifactStatus,
          }}
          existingAction={selectedActionForEdit}
          mode={selectedActionForEdit ? 'edit' : 'create'}
          artifacts={artifacts} // Pass artifacts to CreateActionModal
          onActionCreated={() => {
            setIsCreateActionModalOpen(false);
            onActionRefresh?.();
          }}
          onActionUpdated={() => {
            setIsCreateActionModalOpen(false);
            setSelectedActionForEdit(null);
            onActionRefresh?.();
          }}
        />
      )}

      {/* Meeting Content Upload Modal */}
      {artifact?.type === 'meeting' && (
        <MeetingContentUpload
          open={isMeetingContentModalOpen}
          onClose={() => setIsMeetingContentModalOpen(false)}
          meeting={artifact as unknown as any} // Type conversion for meeting artifact
          onSave={handleMeetingContentSave}
          processing={savingMeetingContent}
          processingStatus={artifact.ai_parsing_status as 'pending' | 'processing' | 'completed' | 'failed' | undefined}
        />
      )}
    </Dialog>
  );
};