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
} from '@mui/material';
import {
  CardGiftcard as POGIcon,
  Person as PersonIcon,
  Lightbulb as IdeaIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';

interface AddPOGModalProps {
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

const POG_TYPES = [
  { value: 'introduction', label: 'Introduction', description: 'Introduce two valuable contacts' },
  { value: 'knowledge_share', label: 'Knowledge Share', description: 'Share insights, expertise, or advice' },
  { value: 'resource_share', label: 'Resource Share', description: 'Share useful tools, articles, or resources' },
  { value: 'referral', label: 'Referral', description: 'Refer business, opportunities, or talent' },
  { value: 'feedback', label: 'Feedback', description: 'Provide valuable feedback or review' },
  { value: 'collaboration', label: 'Collaboration', description: 'Offer to collaborate on a project' },
  { value: 'recommendation', label: 'Recommendation', description: 'Provide a recommendation or endorsement' },
  { value: 'invitation', label: 'Invitation', description: 'Invite to exclusive events or opportunities' },
  { value: 'mentorship', label: 'Mentorship', description: 'Offer mentoring or guidance' },
  { value: 'other', label: 'Other', description: 'Other type of value delivery' },
];

const DELIVERY_METHODS = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'linkedin', label: 'LinkedIn Message', icon: '💼' },
  { value: 'phone', label: 'Phone Call', icon: '📞' },
  { value: 'meeting', label: 'In-Person Meeting', icon: '🤝' },
  { value: 'video_call', label: 'Video Call', icon: '💻' },
  { value: 'text_message', label: 'Text Message', icon: '💬' },
  { value: 'other', label: 'Other', icon: '📝' },
];

export default function AddPOGModal({
  open,
  onClose,
  goalId,
  goalTitle,
  onSuccess,
}: AddPOGModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pog_type: 'knowledge_share',
    delivery_method: 'email',
    impact_score: 5,
    has_delivery_date: false,
    delivery_date: null as Date | null,
    notes: '',
  });

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        title: '',
        description: '',
        pog_type: 'knowledge_share',
        delivery_method: 'email',
        impact_score: 5,
        has_delivery_date: false,
        delivery_date: null,
        notes: '',
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

  // Mutation for creating POG
  const pogMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !selectedContact) {
        throw new Error('Missing required data');
      }

      // Create the artifact entry for the POG
      const artifactPayload = {
        type: 'pog',
        contact_id: selectedContact.id,
        goal_id: goalId,
        user_id: user.id,
        loop_status: 'queued',
        content: JSON.stringify({
          title: formData.title,
          description: formData.description,
          pog_type: formData.pog_type,
          delivery_method: formData.delivery_method,
          impact_score: formData.impact_score,
          planned_delivery_date: formData.has_delivery_date && formData.delivery_date
            ? formData.delivery_date.toISOString().split('T')[0]
            : null,
          notes: formData.notes.trim() || null,
        }),
        metadata: JSON.stringify({
          goal_title: goalTitle,
          contact_name: selectedContact.name || selectedContact.email,
          created_via: 'goal_management',
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
      console.error('Error creating POG:', error);
      setErrors({ submit: 'Failed to create POG. Please try again.' });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'POG title is required';
    }

    if (formData.title.trim().length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (!selectedContact) {
      newErrors.contact = 'Please select a contact to receive this POG';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (formData.notes.length > 500) {
      newErrors.notes = 'Notes must be less than 500 characters';
    }

    if (formData.has_delivery_date && !formData.delivery_date) {
      newErrors.delivery_date = 'Delivery date is required when enabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    pogMutation.mutate();
  };

  const handleClose = () => {
    if (!pogMutation.isPending) {
      onClose();
    }
  };

  const handleFieldChange = (field: string, value: string | number | boolean | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getImpactColor = (score: number) => {
    if (score >= 8) return '#10B981';
    if (score >= 6) return '#F59E0B';
    return '#6B7280';
  };

  const getPOGTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      introduction: '#7C3AED',
      knowledge_share: '#2563EB',
      resource_share: '#059669',
      referral: '#DC2626',
      feedback: '#D97706',
      collaboration: '#4F46E5',
      recommendation: '#BE185D',
      invitation: '#16A34A',
      mentorship: '#0891B2',
      other: '#6B7280',
    };
    return colors[type] || '#6B7280';
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
          <POGIcon sx={{ color: '#10B981' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Create POG (Packet of Generosity)
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
                  Who will receive this POG?
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
                    No contacts are associated with this goal yet. Associate some contacts first to create POGs for them.
                  </Alert>
                )}
              </Box>

              <Divider />

              {/* POG Details */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IdeaIcon />
                  What value will you provide?
                </Typography>

                <Stack spacing={3}>
                  {/* POG Title */}
                  <TextField
                    fullWidth
                    label="POG Title"
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    error={!!errors.title}
                    helperText={errors.title}
                    placeholder="e.g., Introduce Sarah to the VP of Sales at TechCorp"
                    InputProps={{
                      startAdornment: <POGIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  {/* POG Description */}
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    error={!!errors.description}
                    helperText={errors.description || `${formData.description.length}/1000 characters`}
                    placeholder="Describe the value you're providing and why it will be helpful..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  {/* POG Type and Delivery Method */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel>POG Type</InputLabel>
                      <Select
                        value={formData.pog_type}
                        label="POG Type"
                        onChange={(e) => handleFieldChange('pog_type', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        {POG_TYPES.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            <Box sx={{ py: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Box 
                                  sx={{ 
                                    width: 12, 
                                    height: 12, 
                                    borderRadius: '50%', 
                                    bgcolor: getPOGTypeColor(type.value) 
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
                      <InputLabel>Delivery Method</InputLabel>
                      <Select
                        value={formData.delivery_method}
                        label="Delivery Method"
                        onChange={(e) => handleFieldChange('delivery_method', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        {DELIVERY_METHODS.map((method) => (
                          <MenuItem key={method.value} value={method.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography>{method.icon}</Typography>
                              <Typography>{method.label}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>

                  {/* Impact Score */}
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                      Expected Impact Score (1-10)
                    </Typography>
                    <TextField
                      type="number"
                      value={formData.impact_score}
                      onChange={(e) => handleFieldChange('impact_score', Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                      inputProps={{ min: 1, max: 10, step: 1 }}
                      sx={{ 
                        width: 120,
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                      }}
                    />
                    <Chip 
                      label={`Impact: ${formData.impact_score}/10`}
                      size="small"
                      sx={{ 
                        ml: 2,
                        bgcolor: `${getImpactColor(formData.impact_score)}20`,
                        color: getImpactColor(formData.impact_score),
                        fontWeight: 600
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      How valuable will this POG be to the recipient?
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* Delivery Planning */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon />
                  Delivery Planning
                </Typography>

                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.has_delivery_date}
                        onChange={(e) => handleFieldChange('has_delivery_date', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Set planned delivery date"
                  />

                  {formData.has_delivery_date && (
                    <DatePicker
                      label="Planned Delivery Date"
                      value={formData.delivery_date}
                      onChange={(date) => handleFieldChange('delivery_date', date)}
                      minDate={new Date()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.delivery_date,
                          helperText: errors.delivery_date,
                          sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                        },
                      }}
                    />
                  )}

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes (Optional)"
                    value={formData.notes}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    error={!!errors.notes}
                    helperText={errors.notes || `${formData.notes.length}/500 characters`}
                    placeholder="Any additional notes about delivery or context..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Stack>
              </Box>

              {/* Preview Section */}
              {selectedContact && formData.title && (
                <Card sx={{ border: '1px solid #E5E7EB', bgcolor: '#F0FDF4' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: '#059669' }}>
                      POG Preview
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <POGIcon sx={{ color: '#059669', mt: 0.5 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {formData.title}
                        </Typography>
                        {formData.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {formData.description}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {selectedContact.name?.charAt(0) || selectedContact.email.charAt(0)}
                          </Avatar>
                          <Typography variant="subtitle2">
                            For: {selectedContact.name || selectedContact.email}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip 
                            label={POG_TYPES.find(t => t.value === formData.pog_type)?.label}
                            size="small"
                            sx={{ 
                              bgcolor: `${getPOGTypeColor(formData.pog_type)}20`,
                              color: getPOGTypeColor(formData.pog_type),
                              fontSize: '0.75rem'
                            }}
                          />
                          <Chip 
                            label={DELIVERY_METHODS.find(m => m.value === formData.delivery_method)?.label}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                          <Chip 
                            label={`Impact: ${formData.impact_score}/10`}
                            size="small"
                            sx={{ 
                              bgcolor: `${getImpactColor(formData.impact_score)}20`,
                              color: getImpactColor(formData.impact_score),
                              fontSize: '0.75rem'
                            }}
                          />
                          {formData.has_delivery_date && formData.delivery_date && (
                            <Chip 
                              label={`Plan: ${formData.delivery_date.toLocaleDateString()}`}
                              size="small"
                              icon={<ScheduleIcon sx={{ fontSize: '0.875rem' }} />}
                              sx={{ fontSize: '0.75rem' }}
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
              disabled={pogMutation.isPending}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={pogMutation.isPending || !formData.title.trim() || !selectedContact}
              startIcon={
                pogMutation.isPending ? (
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
                bgcolor: '#10B981',
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              {pogMutation.isPending ? 'Creating POG...' : 'Create POG'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
}