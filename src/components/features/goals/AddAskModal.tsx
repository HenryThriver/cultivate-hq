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
  Avatar,
  Card,
  CardContent,
  Autocomplete,
  FormControlLabel,
  Switch,
  Slider,
} from '@mui/material';
import {
  Help as AskIcon,
  Person as PersonIcon,
  RequestQuote as RequestIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';

interface AddAskModalProps {
  open: boolean;
  onClose: () => void;
  goalId: string;
  goalTitle: string;
  onSuccess?: () => void;
}

interface Contact {
  id: string;
  name?: string;
  email: string;
  title?: string;
  company?: string;
}

const ASK_TYPES = [
  { value: 'introduction', label: 'Introduction', description: 'Request an introduction to someone specific' },
  { value: 'advice', label: 'Advice/Guidance', description: 'Seek advice or guidance on a topic' },
  { value: 'feedback', label: 'Feedback', description: 'Request feedback on an idea, project, or approach' },
  { value: 'referral', label: 'Referral', description: 'Ask for a business referral or recommendation' },
  { value: 'opportunity', label: 'Opportunity', description: 'Request consideration for an opportunity' },
  { value: 'collaboration', label: 'Collaboration', description: 'Propose a collaboration or partnership' },
  { value: 'information', label: 'Information', description: 'Request specific information or insights' },
  { value: 'meeting', label: 'Meeting', description: 'Request a meeting or conversation' },
  { value: 'endorsement', label: 'Endorsement', description: 'Ask for an endorsement or recommendation' },
  { value: 'investment', label: 'Investment', description: 'Request investment or funding' },
  { value: 'other', label: 'Other', description: 'Other type of ask' },
];

const URGENCY_LEVELS = [
  { value: 1, label: 'Low Priority', description: 'No rush, when convenient', color: '#6B7280' },
  { value: 2, label: 'Normal Priority', description: 'Standard timeline', color: '#2196F3' },
  { value: 3, label: 'High Priority', description: 'Important, but flexible timing', color: '#F59E0B' },
  { value: 4, label: 'Urgent', description: 'Time-sensitive request', color: '#DC2626' },
];

const ASK_STAGES = [
  { value: 'planning', label: 'Planning', description: 'Still preparing the ask' },
  { value: 'ready', label: 'Ready to Send', description: 'Prepared and ready to make the ask' },
  { value: 'sent', label: 'Sent', description: 'Ask has been sent/made' },
  { value: 'follow_up', label: 'Follow-up Needed', description: 'Waiting for response, may need follow-up' },
  { value: 'closed', label: 'Closed', description: 'Ask completed (accepted/declined)' },
];

export default function AddAskModal({
  open,
  onClose,
  goalId,
  goalTitle,
  onSuccess,
}: AddAskModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    request_description: '',
    ask_type: 'advice',
    urgency_level: 2,
    stage: 'planning',
    expected_timeline_days: 14,
    has_deadline: false,
    deadline_date: null as Date | null,
    context_notes: '',
    success_criteria: '',
    is_milestone_ask: false,
  });

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        title: '',
        request_description: '',
        ask_type: 'advice',
        urgency_level: 2,
        stage: 'planning',
        expected_timeline_days: 14,
        has_deadline: false,
        deadline_date: null,
        context_notes: '',
        success_criteria: '',
        is_milestone_ask: false,
      });
      setSelectedContact(null);
      setErrors({});
    }
  }, [open]);

  // Fetch goal contacts for selection
  const { data: goalContacts = [] } = useQuery({
    queryKey: ['goal-contacts', goalId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get goal contacts with contact details
      const { data: goalContactsRaw } = await supabase
        .from('goal_contacts')
        .select('contact_id')
        .eq('goal_id', goalId)
        .eq('user_id', user.id);

      if (!goalContactsRaw || goalContactsRaw.length === 0) return [];

      const contactIds = goalContactsRaw.map(gc => gc.contact_id);

      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, name, email, title, company')
        .in('id', contactIds);

      return contacts || [];
    },
    enabled: open && !!user?.id,
  });

  // Mutation for creating Ask
  const askMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !selectedContact) {
        throw new Error('Missing required data');
      }

      // Create the artifact entry for the Ask
      const artifactPayload = {
        type: 'ask',
        contact_id: selectedContact.id,
        goal_id: goalId,
        user_id: user.id,
        loop_status: formData.stage,
        content: JSON.stringify({
          title: formData.title,
          request_description: formData.request_description,
          ask_type: formData.ask_type,
          urgency_level: formData.urgency_level,
          expected_timeline_days: formData.expected_timeline_days,
          deadline_date: formData.has_deadline && formData.deadline_date
            ? formData.deadline_date.toISOString().split('T')[0]
            : null,
          context_notes: formData.context_notes.trim() || null,
          success_criteria: formData.success_criteria.trim() || null,
          is_milestone_ask: formData.is_milestone_ask,
        }),
        metadata: JSON.stringify({
          goal_title: goalTitle,
          contact_name: selectedContact.name || selectedContact.email,
          created_via: 'goal_management',
          urgency_level: formData.urgency_level,
          ask_type: formData.ask_type,
        }),
      };

      const { data, error } = await supabase
        .from('artifacts')
        .insert([artifactPayload])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      onSuccess?.();
      handleClose();
    },
    onError: (error) => {
      console.error('Error creating Ask:', error);
      setErrors({ submit: 'Failed to create Ask. Please try again.' });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Ask title is required';
    }

    if (formData.title.trim().length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (!formData.request_description.trim()) {
      newErrors.request_description = 'Request description is required';
    }

    if (formData.request_description.length > 1000) {
      newErrors.request_description = 'Description must be less than 1000 characters';
    }

    if (!selectedContact) {
      newErrors.contact = 'Please select a contact to ask';
    }

    if (formData.context_notes.length > 500) {
      newErrors.context_notes = 'Context notes must be less than 500 characters';
    }

    if (formData.success_criteria.length > 300) {
      newErrors.success_criteria = 'Success criteria must be less than 300 characters';
    }

    if (formData.has_deadline && !formData.deadline_date) {
      newErrors.deadline_date = 'Deadline date is required when enabled';
    }

    if (formData.has_deadline && formData.deadline_date && formData.deadline_date <= new Date()) {
      newErrors.deadline_date = 'Deadline must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    askMutation.mutate();
  };

  const handleClose = () => {
    if (!askMutation.isPending) {
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

  const getUrgencyColor = (level: number) => {
    return URGENCY_LEVELS.find(u => u.value === level)?.color || '#6B7280';
  };

  const getAskTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      introduction: '#7C3AED',
      advice: '#2563EB',
      feedback: '#059669',
      referral: '#DC2626',
      opportunity: '#D97706',
      collaboration: '#4F46E5',
      information: '#0891B2',
      meeting: '#16A34A',
      endorsement: '#BE185D',
      investment: '#EA580C',
      other: '#6B7280',
    };
    return colors[type] || '#6B7280';
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      planning: '#6B7280',
      ready: '#2196F3',
      sent: '#F59E0B',
      follow_up: '#DC2626',
      closed: '#10B981',
    };
    return colors[stage] || '#6B7280';
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
            minHeight: '800px',
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
          <AskIcon sx={{ color: '#F59E0B' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Create Ask Request
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

              {/* Contact Selection */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon />
                  Who are you asking?
                </Typography>
                
                <Autocomplete
                  options={goalContacts}
                  getOptionLabel={(contact) => contact.name || contact.email}
                  value={selectedContact}
                  onChange={(event, newValue) => {
                    setSelectedContact(newValue);
                    if (errors.contact) {
                      setErrors(prev => ({ ...prev, contact: '' }));
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select a contact from your goal..."
                      error={!!errors.contact}
                      helperText={errors.contact}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  )}
                  renderOption={(props, contact) => (
                    <Box component="li" {...props}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                        {contact.name?.charAt(0) || contact.email.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {contact.name || contact.email}
                        </Typography>
                        {contact.name && (
                          <Typography variant="caption" color="text.secondary">
                            {contact.email}
                          </Typography>
                        )}
                        {(contact.title || contact.company) && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {[contact.title, contact.company].filter(Boolean).join(' at ')}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                />

                {goalContacts.length === 0 && (
                  <Alert severity="info" sx={{ mt: 1, borderRadius: 2 }}>
                    No contacts are associated with this goal yet. Associate some contacts first to create asks.
                  </Alert>
                )}
              </Box>

              <Divider />

              {/* Ask Details */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RequestIcon />
                  What are you asking for?
                </Typography>

                <Stack spacing={3}>
                  {/* Ask Title */}
                  <TextField
                    fullWidth
                    label="Ask Title *"
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    error={!!errors.title}
                    helperText={errors.title}
                    placeholder="e.g., Introduction to VP of Marketing at TechCorp"
                    InputProps={{
                      startAdornment: <AskIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  {/* Request Description */}
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Request Description *"
                    value={formData.request_description}
                    onChange={(e) => handleFieldChange('request_description', e.target.value)}
                    error={!!errors.request_description}
                    helperText={errors.request_description || `${formData.request_description.length}/1000 characters`}
                    placeholder="Clearly describe what you're asking for and why it would be valuable..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  {/* Ask Type and Stage */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel>Ask Type</InputLabel>
                      <Select
                        value={formData.ask_type}
                        label="Ask Type"
                        onChange={(e) => handleFieldChange('ask_type', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        {ASK_TYPES.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            <Box sx={{ py: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Box 
                                  sx={{ 
                                    width: 12, 
                                    height: 12, 
                                    borderRadius: '50%', 
                                    bgcolor: getAskTypeColor(type.value) 
                                  }} 
                                />
                                <Typography sx={{ fontWeight: 500 }}>
                                  {type.label}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {type.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel>Current Stage</InputLabel>
                      <Select
                        value={formData.stage}
                        label="Current Stage"
                        onChange={(e) => handleFieldChange('stage', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        {ASK_STAGES.map((stage) => (
                          <MenuItem key={stage.value} value={stage.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box 
                                sx={{ 
                                  width: 12, 
                                  height: 12, 
                                  borderRadius: '50%', 
                                  bgcolor: getStageColor(stage.value) 
                                }} 
                              />
                              <Box>
                                <Typography sx={{ fontWeight: 500 }}>
                                  {stage.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {stage.description}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>

                  {/* Urgency Level */}
                  <Box>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                      Urgency Level
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        value={formData.urgency_level}
                        onChange={(e) => handleFieldChange('urgency_level', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        {URGENCY_LEVELS.map((level) => (
                          <MenuItem key={level.value} value={level.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                              <PriorityIcon sx={{ color: level.color, fontSize: 18 }} />
                              <Box>
                                <Typography sx={{ fontWeight: 500 }}>
                                  {level.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {level.description}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* Timeline & Planning */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimelineIcon />
                  Timeline & Planning
                </Typography>

                <Stack spacing={3}>
                  {/* Expected Timeline */}
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                      Expected Response Time: {formData.expected_timeline_days} days
                    </Typography>
                    <Slider
                      value={formData.expected_timeline_days}
                      onChange={(e, newValue) => handleFieldChange('expected_timeline_days', newValue)}
                      min={1}
                      max={90}
                      step={1}
                      marks={[
                        { value: 1, label: '1d' },
                        { value: 7, label: '1w' },
                        { value: 30, label: '1m' },
                        { value: 90, label: '3m' },
                      ]}
                      sx={{ color: getUrgencyColor(formData.urgency_level) }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      How long do you expect it might take to get a response?
                    </Typography>
                  </Box>

                  {/* Hard Deadline */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.has_deadline}
                          onChange={(e) => handleFieldChange('has_deadline', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="This ask has a hard deadline"
                    />

                    {formData.has_deadline && (
                      <Box sx={{ mt: 2 }}>
                        <DatePicker
                          label="Deadline Date"
                          value={formData.deadline_date}
                          onChange={(date) => handleFieldChange('deadline_date', date)}
                          minDate={new Date()}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.deadline_date,
                              helperText: errors.deadline_date,
                              sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                            },
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Milestone Ask */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_milestone_ask}
                        onChange={(e) => handleFieldChange('is_milestone_ask', e.target.checked)}
                        color="secondary"
                      />
                    }
                    label={
                      <Box>
                        <Typography>This is a milestone ask for my goal</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Important asks that significantly impact your goal progress
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Additional Context */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Additional Context
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Context & Background (Optional)"
                    value={formData.context_notes}
                    onChange={(e) => handleFieldChange('context_notes', e.target.value)}
                    error={!!errors.context_notes}
                    helperText={errors.context_notes || `${formData.context_notes.length}/500 characters`}
                    placeholder="Provide context about your relationship, why you're asking them specifically, etc."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Success Criteria (Optional)"
                    value={formData.success_criteria}
                    onChange={(e) => handleFieldChange('success_criteria', e.target.value)}
                    error={!!errors.success_criteria}
                    helperText={errors.success_criteria || `${formData.success_criteria.length}/300 characters`}
                    placeholder="How will you know if this ask was successful?"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Stack>
              </Box>

              {/* Preview Section */}
              {selectedContact && formData.title && formData.request_description && (
                <Card sx={{ border: '1px solid #E5E7EB', bgcolor: '#FFFBEB' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: '#D97706' }}>
                      Ask Preview
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <AskIcon sx={{ color: '#D97706', mt: 0.5 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {formData.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {formData.request_description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {selectedContact.name?.charAt(0) || selectedContact.email.charAt(0)}
                          </Avatar>
                          <Typography variant="subtitle2">
                            Asking: {selectedContact.name || selectedContact.email}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip 
                            label={ASK_TYPES.find(t => t.value === formData.ask_type)?.label}
                            size="small"
                            sx={{ 
                              bgcolor: `${getAskTypeColor(formData.ask_type)}20`,
                              color: getAskTypeColor(formData.ask_type),
                              fontSize: '0.75rem'
                            }}
                          />
                          <Chip 
                            label={URGENCY_LEVELS.find(u => u.value === formData.urgency_level)?.label}
                            size="small"
                            sx={{ 
                              bgcolor: `${getUrgencyColor(formData.urgency_level)}20`,
                              color: getUrgencyColor(formData.urgency_level),
                              fontSize: '0.75rem'
                            }}
                          />
                          <Chip 
                            label={ASK_STAGES.find(s => s.value === formData.stage)?.label}
                            size="small"
                            sx={{ 
                              bgcolor: `${getStageColor(formData.stage)}20`,
                              color: getStageColor(formData.stage),
                              fontSize: '0.75rem'
                            }}
                          />
                          <Chip 
                            label={`Expected: ${formData.expected_timeline_days}d`}
                            size="small"
                            icon={<ScheduleIcon sx={{ fontSize: '0.875rem' }} />}
                            sx={{ fontSize: '0.75rem' }}
                          />
                          {formData.is_milestone_ask && (
                            <Chip 
                              label="Milestone Ask"
                              size="small"
                              sx={{ 
                                bgcolor: '#F3E8FF',
                                color: '#7C3AED',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}
                            />
                          )}
                          {formData.has_deadline && formData.deadline_date && (
                            <Chip 
                              label={`Deadline: ${formData.deadline_date.toLocaleDateString()}`}
                              size="small"
                              sx={{ 
                                bgcolor: '#FEE2E2',
                                color: '#DC2626',
                                fontSize: '0.75rem',
                                fontWeight: 500
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
              disabled={askMutation.isPending}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={askMutation.isPending || !formData.title.trim() || !formData.request_description.trim() || !selectedContact}
              startIcon={
                askMutation.isPending ? (
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
                bgcolor: '#F59E0B',
                '&:hover': { bgcolor: '#D97706' }
              }}
            >
              {askMutation.isPending ? 'Creating Ask...' : 'Create Ask'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
}