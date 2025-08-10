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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Card,
  CardContent,
  Rating,
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';

interface AssociateContactModalProps {
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
  created_at: string;
}

interface GoalContact {
  id: string;
  contact_id: string;
  goal_id: string;
  relationship_type: string;
  relevance_score: number;
  notes?: string;
}

const RELATIONSHIP_TYPES = [
  { value: 'decision_maker', label: 'Decision Maker', description: 'Can directly approve or reject your ask' },
  { value: 'key_influencer', label: 'Key Influencer', description: 'Has significant influence on decision makers' },
  { value: 'gatekeeper', label: 'Gatekeeper', description: 'Controls access to decision makers' },
  { value: 'connector', label: 'Connector', description: 'Well-connected and can make introductions' },
  { value: 'expert', label: 'Expert', description: 'Has deep knowledge relevant to your goal' },
  { value: 'peer', label: 'Peer', description: 'In similar role or situation' },
  { value: 'mentor', label: 'Mentor', description: 'Can provide guidance and advice' },
  { value: 'supporter', label: 'Supporter', description: 'Generally supportive of your goals' },
  { value: 'other', label: 'Other', description: 'Other type of relationship' },
];

export default function AssociateContactModal({
  open,
  onClose,
  goalId,
  goalTitle,
  onSuccess,
}: AssociateContactModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form state
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [relationshipType, setRelationshipType] = useState('supporter');
  const [relevanceScore, setRelevanceScore] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedContact(null);
      setSearchTerm('');
      setRelationshipType('supporter');
      setRelevanceScore(5);
      setNotes('');
      setErrors({});
    }
  }, [open]);

  // Fetch available contacts (not already associated with this goal)
  const { data: availableContacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['available-contacts', goalId, searchTerm, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get contacts already associated with this goal
      const { data: existingAssociations } = await supabase
        .from('goal_contacts')
        .select('contact_id')
        .eq('goal_id', goalId)
        .eq('user_id', user.id);

      const excludeIds = existingAssociations?.map(a => a.contact_id) || [];

      // Build query for available contacts
      let query = supabase
        .from('contacts')
        .select('id, name, email, title, company, created_at')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      // Exclude already associated contacts
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(20);
      
      if (error) {
        console.error('Error fetching contacts:', error);
        return [];
      }

      return data || [];
    },
    enabled: open && !!user?.id,
  });

  // Mutation for associating contact with goal
  const associateMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !selectedContact) {
        throw new Error('Missing required data');
      }

      const payload = {
        contact_id: selectedContact.id,
        goal_id: goalId,
        user_id: user.id,
        relationship_type: relationshipType,
        relevance_score: relevanceScore,
        notes: notes.trim() || null,
      };

      const { data, error } = await supabase
        .from('goal_contacts')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
      queryClient.invalidateQueries({ queryKey: ['available-contacts'] });
      onSuccess?.();
      handleClose();
    },
    onError: (error) => {
      console.error('Error associating contact:', error);
      setErrors({ submit: 'Failed to associate contact. Please try again.' });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedContact) {
      newErrors.contact = 'Please select a contact';
    }

    if (relevanceScore < 1 || relevanceScore > 10) {
      newErrors.relevance = 'Relevance score must be between 1 and 10';
    }

    if (notes.length > 500) {
      newErrors.notes = 'Notes must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    associateMutation.mutate();
  };

  const handleClose = () => {
    if (!associateMutation.isPending) {
      onClose();
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 8) return '#10B981';
    if (score >= 6) return '#F59E0B';
    return '#6B7280';
  };

  const getRelationshipColor = (type: string) => {
    const colors: Record<string, string> = {
      decision_maker: '#DC2626',
      key_influencer: '#7C3AED',
      gatekeeper: '#2563EB',
      connector: '#059669',
      expert: '#D97706',
      peer: '#4F46E5',
      mentor: '#BE185D',
      supporter: '#16A34A',
      other: '#6B7280',
    };
    return colors[type] || '#6B7280';
  };

  return (
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
        <PersonAddIcon sx={{ color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Associate Contact with Goal
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

            {/* Contact Search Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SearchIcon />
                Search & Select Contact
              </Typography>
              
              <TextField
                fullWidth
                placeholder="Search contacts by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, mb: 2 }}
              />

              {/* Available Contacts List */}
              <Card sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #E0E0E0' }}>
                {contactsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : availableContacts.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <PeopleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm ? 'No contacts found matching your search' : 'No available contacts to associate'}
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {availableContacts.map((contact, index) => (
                      <ListItemButton
                        key={contact.id}
                        selected={selectedContact?.id === contact.id}
                        onClick={() => setSelectedContact(contact)}
                        sx={{
                          borderBottom: index < availableContacts.length - 1 ? '1px solid #F0F0F0' : 'none',
                          '&.Mui-selected': {
                            bgcolor: '#E3F2FD',
                            '&:hover': {
                              bgcolor: '#BBDEFB',
                            },
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {contact.name?.charAt(0) || contact.email.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              {contact.name || contact.email}
                            </Typography>
                          }
                          secondary={
                            <Stack spacing={0.5}>
                              {contact.name && (
                                <Typography variant="body2" color="text.secondary">
                                  {contact.email}
                                </Typography>
                              )}
                              {(contact.title || contact.company) && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <BusinessIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {[contact.title, contact.company].filter(Boolean).join(' at ')}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          }
                        />
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </Card>

              {errors.contact && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {errors.contact}
                </Typography>
              )}
            </Box>

            {selectedContact && (
              <>
                <Divider />

                {/* Selected Contact Preview */}
                <Card sx={{ border: '2px solid #E3F2FD', bgcolor: '#F8FCFF' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976D2' }}>
                        Selected Contact
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {selectedContact.name?.charAt(0) || selectedContact.email.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {selectedContact.name || selectedContact.email}
                        </Typography>
                        {selectedContact.name && (
                          <Typography variant="body2" color="text.secondary">
                            {selectedContact.email}
                          </Typography>
                        )}
                        {(selectedContact.title || selectedContact.company) && (
                          <Typography variant="body2" color="text.secondary">
                            {[selectedContact.title, selectedContact.company].filter(Boolean).join(' at ')}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Relationship Configuration */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Relationship Configuration
                  </Typography>

                  <Stack spacing={3}>
                    {/* Relationship Type */}
                    <FormControl fullWidth>
                      <InputLabel>Relationship Type</InputLabel>
                      <Select
                        value={relationshipType}
                        label="Relationship Type"
                        onChange={(e) => setRelationshipType(e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        {RELATIONSHIP_TYPES.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            <Box sx={{ py: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Box 
                                  sx={{ 
                                    width: 12, 
                                    height: 12, 
                                    borderRadius: '50%', 
                                    bgcolor: getRelationshipColor(type.value) 
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

                    {/* Relevance Score */}
                    <Box>
                      <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                        Relevance Score (1-10)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Rating
                          name="relevance-score"
                          value={relevanceScore / 2}
                          onChange={(event, newValue) => {
                            setRelevanceScore((newValue || 0) * 2);
                          }}
                          precision={0.5}
                          max={5}
                          icon={<StarIcon sx={{ color: getRelevanceColor(relevanceScore) }} />}
                          emptyIcon={<StarIcon sx={{ color: '#E0E0E0' }} />}
                        />
                        <Chip 
                          label={`${relevanceScore}/10`}
                          size="small"
                          sx={{ 
                            bgcolor: `${getRelevanceColor(relevanceScore)}20`,
                            color: getRelevanceColor(relevanceScore),
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        How relevant is this contact to achieving your goal?
                      </Typography>
                      {errors.relevance && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                          {errors.relevance}
                        </Typography>
                      )}
                    </Box>

                    {/* Notes */}
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Notes (Optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      error={!!errors.notes}
                      helperText={errors.notes || `${notes.length}/500 characters`}
                      placeholder="How can this contact help you achieve your goal? What's your relationship history?"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Stack>
                </Box>

                {/* Preview Section */}
                <Card sx={{ border: '1px solid #E5E7EB', bgcolor: '#F8F9FA' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: '#616161' }}>
                      Association Preview
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {selectedContact.name?.charAt(0) || selectedContact.email.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {selectedContact.name || selectedContact.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          will be associated as a <strong>{RELATIONSHIP_TYPES.find(t => t.value === relationshipType)?.label}</strong>
                        </Typography>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip 
                        label={RELATIONSHIP_TYPES.find(t => t.value === relationshipType)?.label}
                        size="small"
                        sx={{ 
                          bgcolor: `${getRelationshipColor(relationshipType)}20`,
                          color: getRelationshipColor(relationshipType),
                          fontWeight: 500
                        }}
                      />
                      <Chip 
                        label={`Relevance: ${relevanceScore}/10`}
                        size="small"
                        sx={{ 
                          bgcolor: `${getRelevanceColor(relevanceScore)}20`,
                          color: getRelevanceColor(relevanceScore),
                          fontWeight: 500
                        }}
                      />
                    </Stack>
                    {notes && (
                      <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                        "{notes}"
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={handleClose} 
            disabled={associateMutation.isPending}
            sx={{ textTransform: 'none', px: 3 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={associateMutation.isPending || !selectedContact}
            startIcon={
              associateMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PersonAddIcon />
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
            {associateMutation.isPending ? 'Associating...' : 'Associate Contact'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}