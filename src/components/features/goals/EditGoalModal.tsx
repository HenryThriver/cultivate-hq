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
  Edit as EditIcon,
  Flag as GoalIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Star as StarIcon,
  TrendingUp as ProgressIcon,
  Business as CategoryIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';

interface Goal {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  timeline?: string | null;
  success_criteria?: string | null;
  target_contact_count?: number | null;
  progress_percentage?: number | null;
  target_date?: string | null;
  status: 'active' | 'completed' | 'paused' | 'archived';
  priority?: number | null;
  is_primary?: boolean | null;
  tags?: string[] | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  voice_memo_id?: string | null;
  created_from?: string | null;
  completed_at?: string | null;
}

interface EditGoalModalProps {
  open: boolean;
  onClose: () => void;
  goal: Goal;
  onSuccess?: () => void;
}

const GOAL_CATEGORIES = [
  { value: 'career_transition', label: 'Career Transition', description: 'Land a specific role or make a career transition' },
  { value: 'startup', label: 'Startup Growth', description: 'Grow or launch my startup' },
  { value: 'client_relationships', label: 'Client Relationships', description: 'Nurture previous and prospective clients/customers' },
  { value: 'investors_partners', label: 'Investors & Partners', description: 'Find investors or strategic partners' },
  { value: 'industry_expansion', label: 'Industry Expansion', description: 'Break into a new industry or market' },
  { value: 'learning_mentorship', label: 'Learning & Mentorship', description: 'Learn a new skill or find a new mentor' },
  { value: 'community_deepening', label: 'Community Building', description: 'Maintain or deepen relationships within an existing community' },
  { value: 'other', label: 'Other', description: 'Something else' },
];

const GOAL_STATUS = [
  { value: 'active', label: 'Active', description: 'Currently working on this goal' },
  { value: 'paused', label: 'Paused', description: 'Temporarily on hold' },
  { value: 'completed', label: 'Completed', description: 'Goal has been achieved' },
  { value: 'cancelled', label: 'Cancelled', description: 'Goal is no longer relevant' },
];

const TIMELINE_OPTIONS = [
  { value: '3_months', label: '3 Months', days: 90 },
  { value: '6_months', label: '6 Months', days: 180 },
  { value: '1_year', label: '1 Year', days: 365 },
  { value: 'custom', label: 'Custom Date', days: null },
];

export default function EditGoalModal({
  open,
  onClose,
  goal,
  onSuccess,
}: EditGoalModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    status: 'active',
    priority: 5,
    timeline_option: '6_months',
    target_date: null as Date | null,
    target_contact_count: 10,
    success_criteria: '',
    is_primary: false,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with existing goal data
  useEffect(() => {
    if (open && goal) {
      // Determine timeline option based on target_date
      let timelineOption = '6_months';
      let targetDate = null;
      
      if (goal.target_date) {
        const target = new Date(goal.target_date);
        const now = new Date();
        const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        if (Math.abs(diffDays - 90) < 7) timelineOption = '3_months';
        else if (Math.abs(diffDays - 180) < 14) timelineOption = '6_months';
        else if (Math.abs(diffDays - 365) < 30) timelineOption = '1_year';
        else {
          timelineOption = 'custom';
          targetDate = target;
        }
      }

      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || 'other',
        status: goal.status || 'active',
        priority: goal.priority || 5,
        timeline_option: timelineOption,
        target_date: targetDate,
        target_contact_count: goal.target_contact_count || 10,
        success_criteria: goal.success_criteria || '',
        is_primary: goal.is_primary || false,
        notes: goal.notes || '',
      });
      setErrors({});
    }
  }, [open, goal]);

  // Mutation for updating goal
  const goalMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !goal?.id) {
        throw new Error('Missing required data');
      }

      // Calculate target_date based on timeline option
      let calculatedTargetDate = null;
      if (formData.timeline_option === 'custom') {
        calculatedTargetDate = formData.target_date ? formData.target_date.toISOString().split('T')[0] : null;
      } else {
        const timelineConfig = TIMELINE_OPTIONS.find(t => t.value === formData.timeline_option);
        if (timelineConfig && timelineConfig.days) {
          const targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + timelineConfig.days);
          calculatedTargetDate = targetDate.toISOString().split('T')[0];
        }
      }

      const payload = {
        title: formData.title,
        description: formData.description.trim() || null,
        category: formData.category,
        status: formData.status,
        priority: formData.priority,
        target_date: calculatedTargetDate,
        target_contact_count: formData.target_contact_count,
        success_criteria: formData.success_criteria.trim() || null,
        is_primary: formData.is_primary,
        notes: formData.notes.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('goals')
        .update(payload)
        .eq('id', goal.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal', goal.id] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      onSuccess?.();
      handleClose();
    },
    onError: (error) => {
      console.error('Error updating goal:', error);
      setErrors({ submit: 'Failed to update goal. Please try again.' });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required';
    }

    if (formData.title.trim().length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (formData.success_criteria.length > 1000) {
      newErrors.success_criteria = 'Success criteria must be less than 1000 characters';
    }

    if (formData.notes.length > 1000) {
      newErrors.notes = 'Notes must be less than 1000 characters';
    }

    if (formData.priority < 1 || formData.priority > 10) {
      newErrors.priority = 'Priority must be between 1 and 10';
    }

    if (formData.target_contact_count < 1 || formData.target_contact_count > 100) {
      newErrors.target_contact_count = 'Target contact count must be between 1 and 100';
    }

    if (formData.timeline_option === 'custom' && !formData.target_date) {
      newErrors.target_date = 'Target date is required when using custom timeline';
    }

    if (formData.timeline_option === 'custom' && formData.target_date && formData.target_date <= new Date()) {
      newErrors.target_date = 'Target date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    goalMutation.mutate();
  };

  const handleClose = () => {
    if (!goalMutation.isPending) {
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
      active: '#10B981',
      paused: '#F59E0B',
      completed: '#2196F3',
      cancelled: '#9E9E9E',
    };
    return colors[status] || '#6B7280';
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return '#DC2626';
    if (priority >= 6) return '#F59E0B';
    if (priority >= 4) return '#2196F3';
    return '#10B981';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      career_transition: '💼',
      startup: '🚀',
      client_relationships: '🤝',
      investors_partners: '💰',
      industry_expansion: '🌐',
      learning_mentorship: '📚',
      community_deepening: '👥',
      other: '🎯',
    };
    return icons[category] || '🎯';
  };

  if (!goal) return null;

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
            minHeight: '700px',
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
          <EditIcon sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Edit Goal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update your goal details and settings
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
                  <GoalIcon />
                  Goal Information
                </Typography>

                <Stack spacing={3}>
                  {/* Title */}
                  <TextField
                    fullWidth
                    label="Goal Title *"
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    error={!!errors.title}
                    helperText={errors.title}
                    placeholder="e.g., Land a VP of Marketing role at a Series B SaaS company"
                    InputProps={{
                      startAdornment: <GoalIcon sx={{ color: 'text.secondary', mr: 1 }} />,
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
                    placeholder="Describe your goal in more detail..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  {/* Category and Status */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={formData.category}
                        label="Category"
                        onChange={(e) => handleFieldChange('category', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        {GOAL_CATEGORIES.map((category) => (
                          <MenuItem key={category.value} value={category.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                              <Typography>{getCategoryIcon(category.value)}</Typography>
                              <Box>
                                <Typography sx={{ fontWeight: 500 }}>
                                  {category.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {category.description}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        label="Status"
                        onChange={(e) => handleFieldChange('status', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        {GOAL_STATUS.map((status) => (
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
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              {/* Goal Settings */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon />
                  Goal Settings
                </Typography>

                <Stack spacing={3}>
                  {/* Priority */}
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                      Priority Level: {formData.priority}/10
                    </Typography>
                    <Slider
                      value={formData.priority}
                      onChange={(e, newValue) => handleFieldChange('priority', newValue)}
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
                        color: getPriorityColor(formData.priority),
                        '& .MuiSlider-markLabel': {
                          fontSize: '0.75rem'
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Chip 
                        label={`Priority: ${formData.priority}/10`}
                        size="small"
                        sx={{ 
                          bgcolor: `${getPriorityColor(formData.priority)}20`,
                          color: getPriorityColor(formData.priority),
                          fontWeight: 600
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        How important is this goal compared to your other goals?
                      </Typography>
                    </Box>
                  </Box>

                  {/* Timeline */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel>Timeline</InputLabel>
                      <Select
                        value={formData.timeline_option}
                        label="Timeline"
                        onChange={(e) => handleFieldChange('timeline_option', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        {TIMELINE_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Typography sx={{ fontWeight: 500 }}>
                              {option.label}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {formData.timeline_option === 'custom' && (
                      <DatePicker
                        label="Target Date"
                        value={formData.target_date}
                        onChange={(date) => handleFieldChange('target_date', date)}
                        minDate={new Date()}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.target_date,
                            helperText: errors.target_date,
                            sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                          },
                        }}
                      />
                    )}
                  </Stack>

                  {/* Target Contact Count */}
                  <TextField
                    label="Target Contact Count"
                    type="number"
                    value={formData.target_contact_count}
                    onChange={(e) => handleFieldChange('target_contact_count', Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    error={!!errors.target_contact_count}
                    helperText={errors.target_contact_count || 'How many contacts do you aim to connect with?'}
                    inputProps={{ min: 1, max: 100, step: 1 }}
                    sx={{ 
                      width: { sm: 200 },
                      '& .MuiOutlinedInput-root': { borderRadius: 2 }
                    }}
                  />

                  {/* Primary Goal Flag */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_primary}
                        onChange={(e) => handleFieldChange('is_primary', e.target.checked)}
                        color="secondary"
                      />
                    }
                    label={
                      <Box>
                        <Typography>This is my primary goal</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Your main focus goal that gets priority in your networking activities
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Success Criteria & Notes */}
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
                    helperText={errors.success_criteria || `${formData.success_criteria.length}/1000 characters`}
                    placeholder="How will you know when you've achieved this goal? What specific outcomes indicate success?"
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
                    helperText={errors.notes || `${formData.notes.length}/1000 characters`}
                    placeholder="Any additional context, motivation, or reminders about this goal..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Stack>
              </Box>

              {/* Preview Section */}
              {formData.title && (
                <Card sx={{ border: '1px solid #E5E7EB', bgcolor: '#F0F9FF' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: '#1976D2' }}>
                      Goal Preview
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Typography sx={{ fontSize: '1.5rem' }}>{getCategoryIcon(formData.category)}</Typography>
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
                            label={GOAL_CATEGORIES.find(c => c.value === formData.category)?.label}
                            size="small"
                            sx={{ fontSize: '0.75rem' }}
                          />
                          <Chip 
                            label={GOAL_STATUS.find(s => s.value === formData.status)?.label}
                            size="small"
                            sx={{ 
                              bgcolor: `${getStatusColor(formData.status)}20`,
                              color: getStatusColor(formData.status),
                              fontSize: '0.75rem'
                            }}
                          />
                          <Chip 
                            label={`Priority: ${formData.priority}/10`}
                            size="small"
                            sx={{ 
                              bgcolor: `${getPriorityColor(formData.priority)}20`,
                              color: getPriorityColor(formData.priority),
                              fontSize: '0.75rem'
                            }}
                          />
                          <Chip 
                            label={`Target: ${formData.target_contact_count} contacts`}
                            size="small"
                            sx={{ fontSize: '0.75rem' }}
                          />
                          {formData.is_primary && (
                            <Chip 
                              label="Primary Goal"
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
              disabled={goalMutation.isPending}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={goalMutation.isPending || !formData.title.trim()}
              startIcon={
                goalMutation.isPending ? (
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
              }}
            >
              {goalMutation.isPending ? 'Updating Goal...' : 'Update Goal'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
}