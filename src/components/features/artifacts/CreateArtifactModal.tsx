import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Chip,
  Autocomplete,
  type Theme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Favorite as HeartIcon,
  Help as HandIcon,
  Assignment as TaskIcon,
  MeetingRoom as MeetingIcon,
  Email as EmailIcon,
  Mic as VoiceMemoIcon,
  Article as DefaultIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

// Contact interface for selection
interface Contact {
  id: string;
  name: string;
  email?: string;
  company?: string;
}

// Artifact creation data
interface ArtifactCreationData {
  type: 'pog' | 'ask' | 'meeting' | 'email' | 'voice_memo' | 'task';
  content: string;
  contactId?: string;
  metadata?: Record<string, unknown>;
}

interface CreateArtifactModalProps {
  open: boolean;
  onClose: () => void;
  artifactType: 'pog' | 'ask' | 'meeting' | 'email' | 'voice_memo' | 'task';
  preSelectedContactId?: string;
  preSelectedContactName?: string;
  contacts?: Contact[];
  onArtifactCreated?: (artifact: ArtifactCreationData) => void;
  onArtifactCreating?: (data: ArtifactCreationData) => Promise<void>;
}

// Configuration interfaces
interface ConfigOption {
  value: string;
  label: string;
}

interface ArtifactConfig {
  icon: React.ComponentType;
  title: string;
  shortTitle: string;
  colorKey: string;
  contentLabel: string;
  contentPlaceholder: string;
  submitText: string;
  submittingText: string;
  typeOptions?: ConfigOption[];
  statusOptions?: ConfigOption[];
  urgencyOptions?: ConfigOption[];
  priorityOptions?: ConfigOption[];
  defaultStatus?: string;
  defaultUrgency?: string;
  defaultPriority?: string;
  fields: string[];
}

// Configuration for different artifact types
const getArtifactConfig = (artifactType: string, theme: Theme): ArtifactConfig | null => {
  const configs = {
    pog: {
      icon: HeartIcon,
      title: 'Create Packet of Generosity',
      shortTitle: 'POG',
      colorKey: 'pog' as const,
      contentLabel: 'What are you offering?',
      contentPlaceholder: 'Describe what you want to offer to help this contact...',
      submitText: 'Create POG',
      submittingText: 'Creating POG...',
      typeOptions: [
        { value: 'introduction', label: 'Introduction' },
        { value: 'resource_sharing', label: 'Resource Sharing' },
        { value: 'expertise', label: 'Expertise/Advice' },
        { value: 'opportunity', label: 'Opportunity' },
        { value: 'connection', label: 'Connection' },
        { value: 'other', label: 'Other' },
      ],
      statusOptions: [
        { value: 'queued', label: 'Queued' },
        { value: 'offered', label: 'Offered' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'delivered', label: 'Delivered' },
      ],
      defaultStatus: 'queued',
      fields: ['content', 'contact', 'type', 'status'],
    },
    ask: {
      icon: HandIcon,
      title: 'Create Ask',
      shortTitle: 'Ask',
      colorKey: 'ask' as const,
      contentLabel: 'What are you requesting?',
      contentPlaceholder: 'Describe what you need help with...',
      submitText: 'Create Ask',
      submittingText: 'Creating Ask...',
      typeOptions: [
        { value: 'advice', label: 'Advice' },
        { value: 'introduction', label: 'Introduction' },
        { value: 'resource', label: 'Resource' },
        { value: 'opportunity', label: 'Opportunity' },
        { value: 'feedback', label: 'Feedback' },
        { value: 'other', label: 'Other' },
      ],
      statusOptions: [
        { value: 'queued', label: 'Queued' },
        { value: 'requested', label: 'Requested' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'received', label: 'Received' },
      ],
      urgencyOptions: [
        { value: 'low', label: 'Low Priority' },
        { value: 'medium', label: 'Medium Priority' },
        { value: 'high', label: 'High Priority' },
      ],
      defaultStatus: 'queued',
      defaultUrgency: 'medium',
      fields: ['content', 'contact', 'type', 'urgency', 'status'],
    },
    task: {
      icon: TaskIcon,
      title: 'Create Task',
      shortTitle: 'Task',
      colorKey: 'action' as const,
      contentLabel: 'Task description',
      contentPlaceholder: 'Describe the task you need to complete...',
      submitText: 'Create Task',
      submittingText: 'Creating Task...',
      typeOptions: [
        { value: 'follow_up', label: 'Follow Up' },
        { value: 'research', label: 'Research' },
        { value: 'outreach', label: 'Outreach' },
        { value: 'meeting_prep', label: 'Meeting Prep' },
        { value: 'admin', label: 'Administrative' },
        { value: 'other', label: 'Other' },
      ],
      statusOptions: [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
      ],
      priorityOptions: [
        { value: 'low', label: 'Low Priority' },
        { value: 'medium', label: 'Medium Priority' },
        { value: 'high', label: 'High Priority' },
        { value: 'urgent', label: 'Urgent' },
      ],
      defaultStatus: 'pending',
      defaultPriority: 'medium',
      fields: ['content', 'contact', 'type', 'priority', 'status'],
    },
    meeting: {
      icon: MeetingIcon,
      title: 'Create Meeting',
      shortTitle: 'Meeting',
      colorKey: 'communication' as const,
      contentLabel: 'Meeting notes or agenda',
      contentPlaceholder: 'Add meeting notes, agenda, or summary...',
      submitText: 'Create Meeting',
      submittingText: 'Creating Meeting...',
      typeOptions: [
        { value: 'one_on_one', label: 'One-on-One' },
        { value: 'group', label: 'Group Meeting' },
        { value: 'presentation', label: 'Presentation' },
        { value: 'interview', label: 'Interview' },
        { value: 'casual', label: 'Casual Chat' },
        { value: 'other', label: 'Other' },
      ],
      statusOptions: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
      defaultStatus: 'scheduled',
      fields: ['content', 'contact', 'type', 'status'],
    },
    email: {
      icon: EmailIcon,
      title: 'Create Email',
      shortTitle: 'Email',
      colorKey: 'communication' as const,
      contentLabel: 'Email content or summary',
      contentPlaceholder: 'Add email content, summary, or notes...',
      submitText: 'Create Email',
      submittingText: 'Creating Email...',
      typeOptions: [
        { value: 'outreach', label: 'Outreach' },
        { value: 'follow_up', label: 'Follow Up' },
        { value: 'introduction', label: 'Introduction' },
        { value: 'thank_you', label: 'Thank You' },
        { value: 'update', label: 'Update' },
        { value: 'other', label: 'Other' },
      ],
      statusOptions: [
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'received', label: 'Received' },
      ],
      defaultStatus: 'draft',
      fields: ['content', 'contact', 'type', 'status'],
    },
    voice_memo: {
      icon: VoiceMemoIcon,
      title: 'Create Voice Memo',
      shortTitle: 'Voice Memo',
      colorKey: 'communication' as const,
      contentLabel: 'Voice memo transcript or notes',
      contentPlaceholder: 'Add transcript, notes, or summary...',
      submitText: 'Create Voice Memo',
      submittingText: 'Creating Voice Memo...',
      typeOptions: [
        { value: 'notes', label: 'Personal Notes' },
        { value: 'ideas', label: 'Ideas' },
        { value: 'reminders', label: 'Reminders' },
        { value: 'meeting_notes', label: 'Meeting Notes' },
        { value: 'other', label: 'Other' },
      ],
      statusOptions: [
        { value: 'recorded', label: 'Recorded' },
        { value: 'transcribed', label: 'Transcribed' },
        { value: 'processed', label: 'Processed' },
      ],
      defaultStatus: 'recorded',
      fields: ['content', 'contact', 'type', 'status'],
    },
    default: {
      icon: DefaultIcon,
      title: 'Create Artifact',
      shortTitle: 'Artifact',
      colorKey: 'communication' as const,
      contentLabel: 'Content',
      contentPlaceholder: 'Add content...',
      submitText: 'Create Artifact',
      submittingText: 'Creating Artifact...',
      typeOptions: [
        { value: 'other', label: 'Other' },
      ],
      statusOptions: [
        { value: 'draft', label: 'Draft' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
      ],
      defaultStatus: 'draft',
      fields: ['content', 'contact', 'type', 'status'],
    },
  };
  
  return configs[artifactType as keyof typeof configs] || configs.default;
};

export const CreateArtifactModal: React.FC<CreateArtifactModalProps> = ({
  open,
  onClose,
  artifactType,
  preSelectedContactId,
  preSelectedContactName,
  contacts = [],
  onArtifactCreated,
  onArtifactCreating,
}) => {
  const theme = useTheme();
  const config = getArtifactConfig(artifactType, theme);
  const Icon = config.icon;

  // Form state with defensive defaults
  const [content, setContent] = useState('');
  const [selectedContactId, setSelectedContactId] = useState(preSelectedContactId || '');
  const [selectedContactName, setSelectedContactName] = useState(preSelectedContactName || '');
  const [artifactSubType, setArtifactSubType] = useState('');
  const [status, setStatus] = useState('');
  const [urgency, setUrgency] = useState('');
  const [priority, setPriority] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or artifact type changes
  React.useEffect(() => {
    if (open && config) {
      setContent('');
      setSelectedContactId(preSelectedContactId || '');
      setSelectedContactName(preSelectedContactName || '');
      setArtifactSubType(config.typeOptions?.[0]?.value || '');
      setStatus(config.defaultStatus || '');
      setUrgency(config.defaultUrgency || '');
      setPriority(config.defaultPriority || '');
      setError('');
    }
  }, [open, artifactType, preSelectedContactId, preSelectedContactName]);

  const handleContactSelect = useCallback((contact: Contact | null) => {
    if (contact) {
      setSelectedContactId(contact.id);
      setSelectedContactName(contact.name);
    } else {
      setSelectedContactId('');
      setSelectedContactName('');
    }
  }, []);

  const handleSubmit = async () => {
    setError('');
    
    // Validation
    if (!content.trim()) {
      setError('Content is required');
      return;
    }
    
    if (config.fields.includes('contact') && !selectedContactId) {
      setError('Please select a contact');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build metadata based on artifact type
      const metadata: Record<string, any> = {};
      
      if (artifactType === 'pog') {
        metadata.description = content;
        metadata.type_of_pog = artifactSubType;
        metadata.status = status;
        metadata.active_exchange = status === 'in_progress';
      } else if (artifactType === 'ask') {
        metadata.request_description = content;
        metadata.type_of_ask = artifactSubType;
        metadata.status = status;
        metadata.urgency = urgency;
        metadata.active_exchange = status === 'in_progress';
      } else if (artifactType === 'task') {
        metadata.title = content.split('\n')[0] || content.substring(0, 50);
        metadata.description = content;
        metadata.task_type = artifactSubType;
        metadata.status = status;
        metadata.priority = priority;
      } else if (artifactType === 'meeting') {
        metadata.title = content.split('\n')[0] || `Meeting - ${selectedContactName}`;
        metadata.summary = content;
        metadata.meeting_type = artifactSubType;
        metadata.status = status;
      } else if (artifactType === 'email') {
        metadata.subject = content.split('\n')[0] || `Email - ${selectedContactName}`;
        metadata.summary = content;
        metadata.email_type = artifactSubType;
        metadata.status = status;
      } else if (artifactType === 'voice_memo') {
        metadata.title = content.split('\n')[0] || 'Voice Memo';
        metadata.summary = content;
        metadata.memo_type = artifactSubType;
        metadata.transcription_status = status;
      }

      const artifactData: ArtifactCreationData = {
        type: artifactType,
        content,
        contactId: selectedContactId || undefined,
        metadata,
      };

      if (onArtifactCreating) {
        await onArtifactCreating(artifactData);
      }
      
      onArtifactCreated?.(artifactData);
      onClose();
    } catch (err) {
      console.error('Failed to create artifact:', err);
      setError(err instanceof Error ? err.message : 'Failed to create artifact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  if (!config) {
    console.error('CreateArtifactModal: config is missing for artifactType:', artifactType);
    return null;
  }

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
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                {artifactType === 'pog' ? 'Offer value and help to strengthen relationships' :
                 artifactType === 'ask' ? 'Request help or support from your network' :
                 artifactType === 'task' ? 'Create actionable items to track progress' :
                 `Create a ${config.shortTitle.toLowerCase()} artifact`}
              </Typography>
              {preSelectedContactName && (
                <Chip 
                  label={`For: ${preSelectedContactName}`}
                  size="small"
                  sx={{
                    mt: 1,
                    backgroundColor: theme.palette.artifacts[config.colorKey].light,
                    color: theme.palette.artifacts[config.colorKey].main,
                    fontWeight: 600
                  }}
                />
              )}
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Content Field */}
            <TextField
              label={config.contentLabel}
              placeholder={config.contentPlaceholder}
              multiline
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              fullWidth
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem',
                  lineHeight: 1.5,
                }
              }}
            />

            {/* Contact Selection */}
            {config.fields.includes('contact') && (
              <>
                {preSelectedContactId ? (
                  <TextField
                    label="Contact"
                    value={preSelectedContactName || 'Selected Contact'}
                    disabled
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                          <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </Box>
                      ),
                    }}
                    sx={{
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: theme.palette.text.primary,
                        opacity: 0.8,
                      },
                    }}
                  />
                ) : (
                  <Autocomplete
                    options={contacts}
                    getOptionLabel={(option) => option.name}
                    value={selectedContact || null}
                    onChange={(_, newValue) => handleContactSelect(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Contact"
                        placeholder="Choose who this relates to..."
                        required
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                              <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            </Box>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {option.name}
                          </Typography>
                          {option.company && (
                            <Typography variant="caption" color="text.secondary">
                              {option.company}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                  />
                )}
              </>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {/* Type Selection */}
              {config.fields.includes('type') && (
                <FormControl>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={artifactSubType}
                    onChange={(e) => setArtifactSubType(e.target.value)}
                    label="Type"
                    MenuProps={{
                      disablePortal: true
                    }}
                  >
                    {config.typeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Status Selection */}
              {config.fields.includes('status') && (
                <FormControl>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    label="Status"
                    MenuProps={{
                      disablePortal: true
                    }}
                  >
                    {config.statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>

            {/* Additional Fields Row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {/* Urgency (for asks) */}
              {config.fields.includes('urgency') && artifactType === 'ask' && (
                <FormControl>
                  <InputLabel>Urgency</InputLabel>
                  <Select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    label="Urgency"
                    MenuProps={{
                      disablePortal: true
                    }}
                  >
                    {config.urgencyOptions?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Priority (for tasks) */}
              {config.fields.includes('priority') && artifactType === 'task' && (
                <FormControl>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    label="Priority"
                    MenuProps={{
                      disablePortal: true
                    }}
                  >
                    {config.priorityOptions?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

            </Box>
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ 
              textTransform: 'none',
              minWidth: 100
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting || !content.trim()}
            sx={{
              textTransform: 'none',
              minWidth: 120,
              backgroundColor: theme.palette.artifacts[config.colorKey].main,
              '&:hover': {
                backgroundColor: theme.palette.artifacts[config.colorKey].dark,
              }
            }}
          >
            {isSubmitting ? config.submittingText : config.submitText}
          </Button>
        </DialogActions>
      </Dialog>
  );
};