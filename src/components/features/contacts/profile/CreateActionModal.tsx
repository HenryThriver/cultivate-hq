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
} from '@mui/material';
import {
  Close as CloseIcon,
  Assignment as ActionIcon,
  Schedule as ScheduleIcon,
  Flag as PriorityIcon,
  Notes as NotesIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useCreateAction, useUpdateAction } from '@/lib/hooks/useActions';
import type { ActionItem } from '@/lib/hooks/useActions';

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
}) => {
  const theme = useTheme();
  const createActionMutation = useCreateAction();
  const updateActionMutation = useUpdateAction();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [actionType, setActionType] = useState('other');
  const [priority, setPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed' | 'skipped' | 'cancelled'>('pending');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(5);
  const [notes, setNotes] = useState('');

  // Initialize form with existing action or context
  useEffect(() => {
    if (mode === 'edit' && existingAction) {
      setTitle(existingAction.title);
      setDescription(existingAction.description || '');
      setActionType(existingAction.action_type);
      setPriority(existingAction.priority);
      setStatus(existingAction.status);
      setDueDate(existingAction.due_date ? new Date(existingAction.due_date) : null);
      setEstimatedDuration(existingAction.estimated_duration_minutes || 5);
      setNotes(existingAction.notes || '');
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
    }
  }, [mode, existingAction, artifactContext, artifactType]);

  const handleSubmit = async () => {
    try {
      const actionData = {
        title,
        description: description || undefined,
        action_type: actionType,
        priority,
        status,
        contact_id: contactId,
        artifact_id: artifactId,
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

        <DialogContent sx={{ pt: 3 }}>
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