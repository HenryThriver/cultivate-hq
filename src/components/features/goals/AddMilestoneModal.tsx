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
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Slider,
} from '@mui/material';
import {
  Flag as MilestoneIcon,
  CheckCircleOutline as CheckIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Star as StarIcon,
  TrendingUp as ProgressIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';

interface AddMilestoneModalProps {
  open: boolean;
  onClose: () => void;
  goalId: string;
  goalTitle: string;
  existingMilestone?: any;
  onSuccess?: () => void;
}

const MILESTONE_STATUS = [
  { value: 'not_started', label: 'Not Started', description: 'Milestone has not been started yet' },
  { value: 'in_progress', label: 'In Progress', description: 'Currently working on this milestone' },
  { value: 'completed', label: 'Completed', description: 'Milestone has been achieved' },
  { value: 'blocked', label: 'Blocked', description: 'Cannot proceed due to dependencies' },
  { value: 'cancelled', label: 'Cancelled', description: 'Milestone is no longer relevant' },
];

export default function AddMilestoneModal({
  open,
  onClose,
  goalId,
  goalTitle,
  existingMilestone,
  onSuccess,
}: AddMilestoneModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEditMode = !!existingMilestone;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'not_started',
    target_date: null as Date | null,
    success_criteria: '',
    weight: 1,
    order_index: 1,
    is_major_milestone: false,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (existingMilestone) {
        setFormData({
          title: existingMilestone.title || '',
          description: existingMilestone.description || '',
          status: existingMilestone.status || 'not_started',
          target_date: existingMilestone.target_date ? new Date(existingMilestone.target_date) : null,
          success_criteria: existingMilestone.success_criteria || '',
          weight: existingMilestone.weight || 1,
          order_index: existingMilestone.order_index || 1,
          is_major_milestone: existingMilestone.is_major_milestone || false,
          notes: existingMilestone.notes || '',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          status: 'not_started',
          target_date: null,
          success_criteria: '',
          weight: 1,
          order_index: 1,
          is_major_milestone: false,
          notes: '',
        });
      }
      setErrors({});
    }
  }, [open, existingMilestone]);

  // Mutation for creating/updating milestone
  const milestoneMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const payload = {
        title: formData.title,
        description: formData.description.trim() || null,
        status: formData.status,
        target_date: formData.target_date ? formData.target_date.toISOString().split('T')[0] : null,
        success_criteria: formData.success_criteria.trim() || null,
        weight: formData.weight,
        order_index: formData.order_index,
        is_major_milestone: formData.is_major_milestone,
        notes: formData.notes.trim() || null,
        goal_id: goalId,
        user_id: user.id,
      };

      if (isEditMode) {
        const { data, error } = await supabase
          .from('goal_milestones')
          .update(payload)
          .eq('id', existingMilestone.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('goal_milestones')
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
      console.error('Error saving milestone:', error);
      setErrors({ submit: `Failed to ${isEditMode ? 'update' : 'create'} milestone. Please try again.` });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Milestone title is required';
    }

    if (formData.title.trim().length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (formData.success_criteria.length > 500) {
      newErrors.success_criteria = 'Success criteria must be less than 500 characters';
    }

    if (formData.notes.length > 500) {
      newErrors.notes = 'Notes must be less than 500 characters';
    }

    if (formData.weight < 1 || formData.weight > 10) {
      newErrors.weight = 'Weight must be between 1 and 10';
    }

    if (formData.order_index < 1) {
      newErrors.order_index = 'Order must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    milestoneMutation.mutate();
  };

  const handleClose = () => {
    if (!milestoneMutation.isPending) {
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      not_started: '#6B7280',
      in_progress: '#2196F3',
      completed: '#10B981',
      blocked: '#DC2626',
      cancelled: '#9E9E9E',
    };
    return colors[status] || '#6B7280';
  };

  const getWeightColor = (weight: number) => {
    if (weight >= 8) return '#DC2626';
    if (weight >= 6) return '#F59E0B';
    if (weight >= 4) return '#2196F3';
    return '#10B981';
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
          <MilestoneIcon sx={{ color: '#7C3AED' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {isEditMode ? 'Edit Milestone' : 'Create Milestone'}
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

              {/* Basic Information */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon />
                  Milestone Details
                </Typography>

                <Stack spacing={3}>
                  {/* Title */}
                  <TextField
                    fullWidth
                    label="Milestone Title *"
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    error={!!errors.title}
                    helperText={errors.title}
                    placeholder="e.g., Complete market research and competitive analysis"
                    InputProps={{
                      startAdornment: <MilestoneIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  {/* Description */}
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description (Optional)"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    error={!!errors.description}
                    helperText={errors.description || `${formData.description.length}/1000 characters`}
                    placeholder="Describe what needs to be achieved for this milestone..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  {/* Status and Order */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        label="Status"
                        onChange={(e) => handleFieldChange('status', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        {MILESTONE_STATUS.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                              <Box 
                                sx={{ 
                                  width: 12, 
                                  height: 12, 
                                  borderRadius: '50%', 
                                  bgcolor: getStatusColor(status.value) 
                                }} 
                              />
                              <Box>
                                <Typography sx={{ fontWeight: 500 }}>
                                  {status.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {status.description}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="Order Position"
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => handleFieldChange('order_index', Math.max(1, parseInt(e.target.value) || 1))}
                      error={!!errors.order_index}
                      helperText={errors.order_index || 'Position in milestone sequence'}
                      inputProps={{ min: 1, step: 1 }}
                      sx={{ 
                        width: { sm: 200 },
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                      }}
                    />
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              {/* Planning & Tracking */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon />
                  Planning & Tracking
                </Typography>

                <Stack spacing={3}>
                  {/* Target Date */}
                  <DatePicker
                    label="Target Date (Optional)"
                    value={formData.target_date}
                    onChange={(date) => handleFieldChange('target_date', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                        helperText: 'When do you plan to achieve this milestone?'
                      },
                    }}
                  />

                  {/* Weight/Priority */}
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                      Milestone Weight: {formData.weight}/10
                    </Typography>
                    <Slider
                      value={formData.weight}
                      onChange={(e, newValue) => handleFieldChange('weight', newValue)}
                      min={1}
                      max={10}
                      step={1}
                      marks={[
                        { value: 1, label: '1' },
                        { value: 3, label: '3' },
                        { value: 5, label: '5' },
                        { value: 7, label: '7' },
                        { value: 10, label: '10' },
                      ]}
                      sx={{ 
                        color: getWeightColor(formData.weight),
                        '& .MuiSlider-markLabel': {
                          fontSize: '0.75rem'
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Chip 
                        label={`Weight: ${formData.weight}/10`}
                        size="small"
                        sx={{ 
                          bgcolor: `${getWeightColor(formData.weight)}20`,
                          color: getWeightColor(formData.weight),
                          fontWeight: 600
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        How important is this milestone for your goal?
                      </Typography>
                    </Box>
                  </Box>

                  {/* Major Milestone Flag */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_major_milestone}
                        onChange={(e) => handleFieldChange('is_major_milestone', e.target.checked)}
                        color="secondary"
                      />
                    }
                    label={
                      <Box>
                        <Typography>This is a major milestone</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Key milestones that significantly impact your goal progress
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Success Criteria */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Success Criteria & Notes
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Success Criteria (Optional)"
                    value={formData.success_criteria}
                    onChange={(e) => handleFieldChange('success_criteria', e.target.value)}
                    error={!!errors.success_criteria}
                    helperText={errors.success_criteria || `${formData.success_criteria.length}/500 characters`}
                    placeholder="How will you know when this milestone is complete? What specific outcomes indicate success?"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Additional Notes (Optional)"
                    value={formData.notes}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    error={!!errors.notes}
                    helperText={errors.notes || `${formData.notes.length}/500 characters`}
                    placeholder="Any additional context, dependencies, or reminders..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Stack>
              </Box>

              {/* Preview Section */}
              {formData.title && (
                <Card sx={{ border: '1px solid #E5E7EB', bgcolor: '#F8F9FF' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: '#7C3AED' }}>
                      Milestone Preview
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <MilestoneIcon sx={{ color: '#7C3AED', mt: 0.5 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {formData.title}
                        </Typography>
                        {formData.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {formData.description}
                          </Typography>
                        )}
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip 
                            label={MILESTONE_STATUS.find(s => s.value === formData.status)?.label}
                            size="small"
                            sx={{ 
                              bgcolor: `${getStatusColor(formData.status)}20`,
                              color: getStatusColor(formData.status),
                              fontSize: '0.75rem'
                            }}
                          />
                          <Chip 
                            label={`Position: ${formData.order_index}`}
                            size="small"
                            sx={{ fontSize: '0.75rem' }}
                          />
                          <Chip 
                            label={`Weight: ${formData.weight}/10`}
                            size="small"
                            sx={{ 
                              bgcolor: `${getWeightColor(formData.weight)}20`,
                              color: getWeightColor(formData.weight),
                              fontSize: '0.75rem'
                            }}
                          />
                          {formData.target_date && (
                            <Chip 
                              label={`Target: ${formData.target_date.toLocaleDateString()}`}
                              size="small"
                              icon={<ScheduleIcon sx={{ fontSize: '0.875rem' }} />}
                              sx={{ fontSize: '0.75rem' }}
                            />
                          )}
                          {formData.is_major_milestone && (
                            <Chip 
                              label="Major Milestone"
                              size="small"
                              sx={{ 
                                bgcolor: '#F3E8FF',
                                color: '#7C3AED',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}
                            />
                          )}
                        </Stack>
                        {formData.success_criteria && (
                          <Box sx={{ 
                            mt: 2, 
                            p: 2, 
                            bgcolor: '#F0F9FF', 
                            borderRadius: 1,
                            borderLeft: '3px solid #2196F3'
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#1976D2' }}>
                              Success Criteria:
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, color: '#1976D2' }}>
                              {formData.success_criteria}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button 
              onClick={handleClose} 
              disabled={milestoneMutation.isPending}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={milestoneMutation.isPending || !formData.title.trim()}
              startIcon={
                milestoneMutation.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <SendIcon />
                )
              }
              sx={{
                textTransform: 'none',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 500,
                bgcolor: '#7C3AED',
                '&:hover': { bgcolor: '#6D28D9' }
              }}
            >
              {milestoneMutation.isPending ? 
                `${isEditMode ? 'Updating' : 'Creating'} Milestone...` : 
                `${isEditMode ? 'Update' : 'Create'} Milestone`
              }
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
}