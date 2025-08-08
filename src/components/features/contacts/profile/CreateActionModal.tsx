import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Chip,
  useTheme,
  FormHelperText,
  Stack,
  Autocomplete,
} from '@mui/material';
import {
  Close as CloseIcon,
  Assignment as ActionIcon,
  Schedule as ScheduleIcon,
  Flag as PriorityIcon,
  Notes as NotesIcon,
  Timer as TimerIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useCreateAction, useUpdateAction } from '@/lib/hooks/useActions';
import type { ActionItem } from '@/lib/hooks/useActions';
import type { Artifact } from '@/types/artifact';

interface CreateActionModalProps {
  open: boolean;
  onClose: () => void;
  contactId?: string;
  contactName?: string;
  artifactId?: string;
  artifactType?: 'pog' | 'ask' | 'meeting' | 'other';
  artifactContext?: {
    title?: string;
    description?: string;
    status?: string;
  };
  existingAction?: ActionItem | null;
  mode?: 'create' | 'edit';
  onActionCreated?: (action: ActionItem) => void;
  onActionUpdated?: (action: ActionItem) => void;
  artifacts?: Artifact[]; // Add artifacts prop to avoid useArtifacts hook dependency
}

const actionTypes = [
  { value: 'deliver_pog', label: 'Deliver POG' },
  { value: 'follow_up_ask', label: 'Follow Up on Ask' },
  { value: 'add_meeting_notes', label: 'Add Meeting Notes' },
  { value: 'schedule_meeting', label: 'Schedule Meeting' },
  { value: 'send_follow_up', label: 'Send Follow-up' },
  { value: 'make_introduction', label: 'Make Introduction' },
  { value: 'share_content', label: 'Share Content' },
  { value: 'reconnect_with_contact', label: 'Reconnect' },
  { value: 'review_goal', label: 'Review Goal' },
  { value: 'other', label: 'Other' },
];

const priorityOptions = [
  { value: 'urgent', label: 'Urgent', color: '#EF4444' },
  { value: 'high', label: 'High', color: '#F97316' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'low', label: 'Low', color: '#10B981' },
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'skipped', label: 'Skipped' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const CreateActionModal: React.FC<CreateActionModalProps> = ({
  open,
  onClose,
  contactId,
  contactName,
  artifactId,
  artifactType,
  artifactContext,
  existingAction,
  mode = 'create',
  onActionCreated,
  onActionUpdated,
  artifacts = [],
}) => {
  const theme = useTheme();
  const createActionMutation = useCreateAction();
  const updateActionMutation = useUpdateAction();
  
  // Use passed artifacts instead of hook (which doesn't have query functionality)
  const pogAndAskArtifacts = artifacts.filter(
    (artifact: any) => artifact.type === 'pog' || artifact.type === 'ask'
  );

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [actionType, setActionType] = useState('other');
  const [priority, setPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed' | 'skipped' | 'cancelled'>('pending');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);

  // Helper function to validate action type against available options
  const getValidActionType = (actionType: string): string => {
    const validTypes = actionTypes.map(t => t.value);
    return validTypes.includes(actionType) ? actionType : 'other';
  };

  // Helper function to validate priority against available options
  const getValidPriority = (priority: string): 'urgent' | 'high' | 'medium' | 'low' => {
    const validPriorities = priorityOptions.map(p => p.value) as ('urgent' | 'high' | 'medium' | 'low')[];
    return validPriorities.includes(priority as any) ? priority as any : 'medium';
  };

  // Helper function to validate status against available options
  const getValidStatus = (status: string): 'pending' | 'in_progress' | 'completed' | 'skipped' | 'cancelled' => {
    const validStatuses = statusOptions.map(s => s.value) as ('pending' | 'in_progress' | 'completed' | 'skipped' | 'cancelled')[];
    return validStatuses.includes(status as any) ? status as any : 'pending';
  };

  // Initialize form with existing action or context
  useEffect(() => {
    if (mode === 'edit' && existingAction) {
      setTitle(existingAction.title);
      setDescription(existingAction.description || '');
      setActionType(getValidActionType(existingAction.action_type));
      setPriority(getValidPriority(existingAction.priority));
      setStatus(getValidStatus(existingAction.status));
      setDueDate(existingAction.due_date ? new Date(existingAction.due_date) : null);
      setEstimatedDuration(existingAction.estimated_duration_minutes || 5);
      setNotes(existingAction.notes || '');
      // If existing action has artifact_id, find and set the artifact
      if (existingAction.artifact_id) {
        const linkedArtifact = pogAndAskArtifacts.find((a: any) => a.id === existingAction.artifact_id);
        setSelectedArtifact(linkedArtifact || null);
      }
    } else if (mode === 'create' && artifactContext) {
      // Pre-fill based on artifact context
      if (artifactType === 'pog') {
        setActionType('deliver_pog');
        setTitle(artifactContext.status === 'offered' ? 'Deliver POG' : 'Follow up on POG');
        setDescription(`${artifactContext.description || artifactContext.title || 'POG action'}`);
      } else if (artifactType === 'ask') {
        setActionType('follow_up_ask');
        setTitle(artifactContext.status === 'requested' ? 'Respond to Ask' : 'Follow up on Ask');
        setDescription(`${artifactContext.description || artifactContext.title || 'Ask action'}`);
      }
      // If artifactId is provided, find and set the artifact
      if (artifactId) {
        const linkedArtifact = pogAndAskArtifacts.find((a: any) => a.id === artifactId);
        setSelectedArtifact(linkedArtifact || null);
      }
    }
  }, [mode, existingAction, artifactContext, artifactType, artifactId, pogAndAskArtifacts]);

  const handleSubmit = async () => {
    try {
      const actionData = {
        title,
        description: description || undefined,
        action_type: actionType,
        priority,
        status,
        contact_id: contactId,
        artifact_id: selectedArtifact?.id || artifactId,
        due_date: dueDate?.toISOString(),
        estimated_duration_minutes: estimatedDuration,
        notes: notes || undefined,
      };

      if (mode === 'edit' && existingAction) {
        const result = await updateActionMutation.mutateAsync({
          id: existingAction.id,
          updates: actionData,
        });
        onActionUpdated?.(result);
      } else {
        const result = await createActionMutation.mutateAsync(actionData);
        onActionCreated?.(result);
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to save action:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setActionType('other');
    setPriority('medium');
    setStatus('pending');
    setDueDate(null);
    setEstimatedDuration(15);
    setNotes('');
    setSelectedArtifact(null);
  };

  const isFormValid = title.trim().length > 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 'var(--shadow-card-focus)',
          },
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: theme.palette.artifacts.action.light,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ActionIcon sx={{ color: theme.palette.artifacts.action.main }} />
            </Box>
            <Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {mode === 'edit' ? 'Edit Action' : 'Create Action'}
              </Typography>
              {contactName && (
                <Typography variant="body2" color="text.secondary">
                  for {contactName}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 6, pb: 3, px: 3 }}>
          <Stack spacing={3}>
            {/* Title */}
            <TextField
              fullWidth
              label="Action Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Send follow-up email"
              required
              autoFocus
              error={!title.trim() && title !== ''}
              helperText={!title.trim() && title !== '' ? 'Title is required' : ''}
            />

            {/* Action Type and Priority */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  label="Type"
                >
                  {actionTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  label="Priority"
                  renderValue={(value) => {
                    const option = priorityOptions.find(p => p.value === value);
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PriorityIcon sx={{ fontSize: 16, color: option?.color }} />
                        {option?.label}
                      </Box>
                    );
                  }}
                >
                  {priorityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PriorityIcon sx={{ fontSize: 16, color: option.color }} />
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Description */}
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              placeholder="Add more details about this action..."
            />

            {/* POG/Ask Selector */}
            {contactId && (
              <Autocomplete
                fullWidth
                options={pogAndAskArtifacts}
                value={selectedArtifact}
                onChange={(_, newValue) => {
                  setSelectedArtifact(newValue);
                  // Auto-update action type based on artifact type
                  if (newValue?.type === 'pog') {
                    setActionType('deliver_pog');
                  } else if (newValue?.type === 'ask') {
                    setActionType('follow_up_ask');
                  }
                }}
                getOptionLabel={(option) => {
                  const artifactType = option.type.toUpperCase();
                  const content = typeof option.content === 'string' ? option.content : 'No description';
                  const status = (option.metadata as any)?.status || '';
                  return `[${artifactType}] ${content} ${status ? `(${status})` : ''}`;
                }}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={option.type.toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: (theme.palette.artifacts as any)[option.type]?.light || '#f3f4f6',
                        color: (theme.palette.artifacts as any)[option.type]?.main || '#6b7280',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {typeof option.content === 'string' ? option.content : 'No description'}
                      </Typography>
                      {(option.metadata as any)?.status && (
                        <Typography variant="caption" color="text.secondary">
                          Status: {(option.metadata as any).status}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Link to POG/Ask (Optional)"
                    placeholder={pogAndAskArtifacts.length > 0 ? "Select a POG or Ask to associate with this action" : "No POGs or Asks available - create some first to link them"}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            )}

            {/* Status and Due Date */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  label="Status"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <DatePicker
                label="Due Date"
                value={dueDate}
                onChange={(newValue: Date | null) => setDueDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputProps: {
                      startAdornment: <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    },
                  },
                }}
              />
            </Box>

            {/* Estimated Duration */}
            <TextField
              fullWidth
              label="Estimated Duration (minutes)"
              type="number"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(parseInt(e.target.value) || 5)}
              InputProps={{
                startAdornment: <TimerIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              helperText="How long do you expect this action to take?"
            />

            {/* Notes */}
            <TextField
              fullWidth
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={2}
              placeholder="Any additional notes or context..."
              InputProps={{
                startAdornment: <NotesIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />,
              }}
            />

            {/* Context Chips */}
            {(artifactType || contactName) && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {artifactType && artifactType !== 'other' && theme.palette.artifacts[artifactType] && (
                  <Chip
                    label={`From ${artifactType.toUpperCase()}`}
                    size="small"
                    sx={{
                      backgroundColor: theme.palette.artifacts[artifactType].light,
                      color: theme.palette.artifacts[artifactType].main,
                      fontWeight: 500,
                    }}
                  />
                )}
                {contactName && (
                  <Chip
                    label={contactName}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!isFormValid || createActionMutation.isPending || updateActionMutation.isPending}
            sx={{
              textTransform: 'none',
              backgroundColor: theme.palette.artifacts.action.main,
              '&:hover': { backgroundColor: theme.palette.artifacts.action.dark },
            }}
          >
            {createActionMutation.isPending || updateActionMutation.isPending
              ? 'Saving...'
              : mode === 'edit'
              ? 'Update Action'
              : 'Create Action'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};