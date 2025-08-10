'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Assignment as ActionIcon,
  Schedule as ScheduleIcon,
  Flag as PriorityIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';

interface AddActionModalProps {
  open: boolean;
  onClose: () => void;
  goalId: string;
  goalTitle: string;
  existingAction?: Action | null;
  onSuccess?: () => void;
}

interface Action {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: number;
  due_date?: string;
  action_type: string;
  contact_id?: string;
  goal_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const ACTION_TYPES = [
  'outreach',
  'follow_up',
  'research',
  'meeting',
  'content_creation',
  'networking_event',
  'email',
  'phone_call',
  'linkedin_message',
  'coffee_chat',
  'introduction',
  'other'
];

const PRIORITY_LEVELS = [
  { value: 1, label: 'High Priority', color: '#DC2626' },
  { value: 2, label: 'Medium Priority', color: '#F59E0B' },
  { value: 3, label: 'Low Priority', color: '#6B7280' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: '#6B7280' },
  { value: 'in_progress', label: 'In Progress', color: '#2196F3' },
  { value: 'completed', label: 'Completed', color: '#10B981' },
];

export default function AddActionModal({
  open,
  onClose,
  goalId,
  goalTitle,
  existingAction,
  onSuccess,
}: AddActionModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!existingAction;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    action_type: 'outreach',
    priority: 2,
    status: 'pending' as const,
    due_date: null as Date | null,
    has_due_date: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or when existingAction changes
  useEffect(() => {
    if (open) {
      if (existingAction) {
        setFormData({
          title: existingAction.title,
          description: existingAction.description || '',
          action_type: existingAction.action_type,
          priority: existingAction.priority,
          status: existingAction.status,
          due_date: existingAction.due_date ? new Date(existingAction.due_date) : null,
          has_due_date: !!existingAction.due_date,
        });
      } else {
        setFormData({
          title: '',
          description: '',
          action_type: 'outreach',
          priority: 2,
          status: 'pending',
          due_date: null,
          has_due_date: false,
        });
      }
      setErrors({});
    }
  }, [open, existingAction]);

  // Mutation for creating/updating action
  const actionMutation = useMutation({
    mutationFn: async (actionData: any) => {
      if (!user?.id) throw new Error('User not authenticated');

      const payload = {
        ...actionData,
        goal_id: goalId,
        user_id: user.id,
        due_date: formData.has_due_date && formData.due_date 
          ? formData.due_date.toISOString().split('T')[0] 
          : null,
      };

      if (isEditing && existingAction) {
        const { data, error } = await supabase
          .from('actions')
          .update(payload)
          .eq('id', existingAction.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('actions')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      onSuccess?.();
      handleClose();
    },
    onError: (error) => {
      console.error('Error saving action:', error);
      setErrors({ submit: 'Failed to save action. Please try again.' });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Action title is required';
    }

    if (formData.title.trim().length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (formData.has_due_date && !formData.due_date) {
      newErrors.due_date = 'Due date is required when enabled';
    }

    if (formData.has_due_date && formData.due_date && formData.due_date < new Date()) {
      newErrors.due_date = 'Due date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    actionMutation.mutate({
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      action_type: formData.action_type,
      priority: formData.priority,
      status: formData.status,
    });
  };

  const handleClose = () => {
    if (!actionMutation.isPending) {
      onClose();
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPriorityColor = (priority: number) => {
    return PRIORITY_LEVELS.find(p => p.value === priority)?.color || '#6B7280';
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || '#6B7280';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: '600px',
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {isEditing ? <EditIcon sx={{ color: 'primary.main' }} /> : <AddIcon sx={{ color: 'primary.main' }} />}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {isEditing ? 'Edit Action' : 'Add New Action'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {goalTitle}
            </Typography>
          </Box>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              {errors.submit && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {errors.submit}
                </Alert>
              )}

              {/* Action Title */}
              <TextField
                fullWidth
                label="Action Title"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                placeholder="e.g., Send LinkedIn connection request to Sarah Chen"
                InputProps={{
                  startAdornment: <ActionIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              {/* Action Description */}
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description (Optional)"
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description || `${formData.description.length}/1000 characters`}
                placeholder="Add context, notes, or specific details about this action..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <Divider />

              {/* Action Type and Priority Row */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Action Type</InputLabel>
                  <Select
                    value={formData.action_type}
                    label="Action Type"
                    onChange={(e) => handleFieldChange('action_type', e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {ACTION_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ textTransform: 'capitalize' }}>
                            {type.replace('_', ' ')}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priority"
                    onChange={(e) => handleFieldChange('priority', e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {PRIORITY_LEVELS.map((level) => (
                      <MenuItem key={level.value} value={level.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PriorityIcon sx={{ color: level.color, fontSize: 18 }} />
                          <Typography>{level.label}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {/* Status (only for editing) */}
              {isEditing && (
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              bgcolor: status.color 
                            }} 
                          />
                          <Typography>{status.label}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Divider />

              {/* Due Date Section */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.has_due_date}
                      onChange={(e) => handleFieldChange('has_due_date', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                      <Typography>Set Due Date</Typography>
                    </Box>
                  }
                />

                {formData.has_due_date && (
                  <Box sx={{ mt: 2 }}>
                    <DatePicker
                      label="Due Date"
                      value={formData.due_date}
                      onChange={(date) => handleFieldChange('due_date', date)}
                      minDate={new Date()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.due_date,
                          helperText: errors.due_date,
                          sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>

              {/* Preview Section */}
              <Box sx={{ p: 3, bgcolor: '#F8F9FA', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: '#616161' }}>
                  Action Preview
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <ActionIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {formData.title || 'Enter action title...'}
                    </Typography>
                    {formData.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {formData.description}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip 
                        label={formData.action_type.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
                      />
                      <Chip 
                        label={PRIORITY_LEVELS.find(p => p.value === formData.priority)?.label}
                        size="small"
                        sx={{ 
                          bgcolor: `${getPriorityColor(formData.priority)}20`,
                          color: getPriorityColor(formData.priority),
                          fontSize: '0.75rem'
                        }}
                      />
                      {isEditing && (
                        <Chip 
                          label={STATUS_OPTIONS.find(s => s.value === formData.status)?.label}
                          size="small"
                          sx={{ 
                            bgcolor: `${getStatusColor(formData.status)}20`,
                            color: getStatusColor(formData.status),
                            fontSize: '0.75rem'
                          }}
                        />
                      )}
                      {formData.has_due_date && formData.due_date && (
                        <Chip 
                          label={`Due ${formData.due_date.toLocaleDateString()}`}
                          size="small"
                          icon={<ScheduleIcon sx={{ fontSize: '0.875rem' }} />}
                          sx={{ fontSize: '0.75rem' }}
                        />
                      )}
                    </Stack>
                  </Box>
                </Box>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button 
              onClick={handleClose} 
              disabled={actionMutation.isPending}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={actionMutation.isPending || !formData.title.trim()}
              startIcon={
                actionMutation.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : isEditing ? (
                  <EditIcon />
                ) : (
                  <AddIcon />
                )
              }
              sx={{
                textTransform: 'none',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 500,
              }}
            >
              {actionMutation.isPending 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Action' : 'Create Action')
              }
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
}