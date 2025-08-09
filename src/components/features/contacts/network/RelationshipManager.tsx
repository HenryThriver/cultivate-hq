import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Chip,
  Alert,
  Stack,
  IconButton,
  Divider
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Close,
  CheckCircle,
  Cancel,
  Group,
  TrendingUp
} from '@mui/icons-material';

interface Contact {
  id: string;
  name: string;
  title?: string;
  company?: string;
}

interface Relationship {
  id: string;
  contact_a_id: string;
  contact_b_id: string;
  contact_a_name: string;
  contact_b_name: string;
  relationship_type: 'introduced_by_me' | 'known_connection' | 'target_connection';
  strength: 'weak' | 'medium' | 'strong';
  context?: string;
  introduction_date?: Date;
  introduction_successful?: boolean;
  created_at: Date;
}

interface RelationshipManagerProps {
  contactId: string;
  contactName: string;
  
  // Data
  relationships: Relationship[];
  availableContacts: Contact[];
  
  // Actions
  onCreateRelationship: (relationship: Omit<Relationship, 'id' | 'created_at'>) => Promise<void>;
  onUpdateRelationship: (id: string, updates: Partial<Relationship>) => Promise<void>;
  onDeleteRelationship: (id: string) => Promise<void>;
  
  // Loading states
  isLoading?: boolean;
}

interface CreateRelationshipFormData {
  contactId: string;
  relationshipType: 'introduced_by_me' | 'known_connection' | 'target_connection';
  strength: 'weak' | 'medium' | 'strong';
  context: string;
  introductionDate?: Date;
  introductionSuccessful?: boolean;
}

const initialFormData: CreateRelationshipFormData = {
  contactId: '',
  relationshipType: 'known_connection',
  strength: 'medium',
  context: '',
};

export const RelationshipManager: React.FC<RelationshipManagerProps> = ({
  contactId,
  contactName,
  relationships,
  availableContacts,
  onCreateRelationship,
  onUpdateRelationship,
  onDeleteRelationship,
  isLoading = false,
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null);
  const [formData, setFormData] = useState<CreateRelationshipFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const relationshipTypeLabels = {
    'introduced_by_me': 'I introduced them',
    'known_connection': 'They know each other',
    'target_connection': 'Potential connection',
  };

  const strengthLabels = {
    'weak': 'Weak connection',
    'medium': 'Medium connection', 
    'strong': 'Strong connection',
  };

  const handleCreateRelationship = async () => {
    if (!formData.contactId) {
      setError('Please select a contact');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedContact = availableContacts.find(c => c.id === formData.contactId);
      if (!selectedContact) {
        throw new Error('Selected contact not found');
      }

      await onCreateRelationship({
        contact_a_id: contactId,
        contact_b_id: formData.contactId,
        contact_a_name: contactName,
        contact_b_name: selectedContact.name,
        relationship_type: formData.relationshipType,
        strength: formData.strength,
        context: formData.context || undefined,
        introduction_date: formData.introductionDate,
        introduction_successful: formData.introductionSuccessful,
      });

      setShowCreateDialog(false);
      setFormData(initialFormData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create relationship');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRelationship = async () => {
    if (!editingRelationship) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onUpdateRelationship(editingRelationship.id, {
        relationship_type: formData.relationshipType,
        strength: formData.strength,
        context: formData.context || undefined,
        introduction_date: formData.introductionDate,
        introduction_successful: formData.introductionSuccessful,
      });

      setShowEditDialog(false);
      setEditingRelationship(null);
      setFormData(initialFormData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update relationship');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (relationship: Relationship) => {
    setEditingRelationship(relationship);
    setFormData({
      contactId: relationship.contact_a_id === contactId ? relationship.contact_b_id : relationship.contact_a_id,
      relationshipType: relationship.relationship_type,
      strength: relationship.strength,
      context: relationship.context || '',
      introductionDate: relationship.introduction_date,
      introductionSuccessful: relationship.introduction_successful,
    });
    setShowEditDialog(true);
  };

  const handleDelete = async (relationshipId: string) => {
    if (window.confirm('Are you sure you want to delete this relationship?')) {
      try {
        await onDeleteRelationship(relationshipId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete relationship');
      }
    }
  };

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'introduced_by_me': return '🤝';
      case 'known_connection': return '👥';
      case 'target_connection': return '🎯';
      default: return '📎';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'strong': return '#059669';
      default: return '#6b7280';
    }
  };

  const CreateEditForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <DialogContent>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {!isEdit && (
          <Autocomplete
            options={availableContacts}
            getOptionLabel={(option) => `${option.name}${option.title ? ` - ${option.title}` : ''}${option.company ? ` at ${option.company}` : ''}`}
            value={availableContacts.find(c => c.id === formData.contactId) || null}
            onChange={(_, newValue) => {
              setFormData(prev => ({ ...prev, contactId: newValue?.id || '' }));
              setError(null);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Contact"
                required
                error={!!error && !formData.contactId}
                helperText={error && !formData.contactId ? 'Please select a contact' : ''}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {option.name}
                  </Typography>
                  {(option.title || option.company) && (
                    <Typography variant="caption" color="text.secondary">
                      {option.title} {option.company && `at ${option.company}`}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          />
        )}

        <FormControl required>
          <InputLabel>Relationship Type</InputLabel>
          <Select
            value={formData.relationshipType}
            label="Relationship Type"
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              relationshipType: e.target.value as typeof prev.relationshipType 
            }))}
          >
            {Object.entries(relationshipTypeLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ mr: 1 }}>{getRelationshipIcon(value)}</Typography>
                  {label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl required>
          <InputLabel>Connection Strength</InputLabel>
          <Select
            value={formData.strength}
            label="Connection Strength"
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              strength: e.target.value as typeof prev.strength 
            }))}
          >
            {Object.entries(strengthLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: getStrengthColor(value),
                      mr: 1,
                    }}
                  />
                  {label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Context (Optional)"
          multiline
          rows={3}
          value={formData.context}
          onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
          placeholder="How do they know each other? Any relevant details..."
        />

        {formData.relationshipType === 'introduced_by_me' && (
          <>
            <TextField
              label="Introduction Date"
              type="date"
              value={formData.introductionDate ? formData.introductionDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                introductionDate: e.target.value ? new Date(e.target.value) : undefined 
              }))}
              InputLabelProps={{ shrink: true }}
            />

            <FormControl>
              <InputLabel>Introduction Outcome</InputLabel>
              <Select
                value={formData.introductionSuccessful ?? ''}
                label="Introduction Outcome"
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ 
                    ...prev, 
                    introductionSuccessful: value === '' ? undefined : value === 'true'
                  }));
                }}
              >
                <MenuItem value="">Unknown</MenuItem>
                <MenuItem value="true">Successful</MenuItem>
                <MenuItem value="false">Unsuccessful</MenuItem>
              </Select>
            </FormControl>
          </>
        )}
      </Stack>
    </DialogContent>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 2,
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Group sx={{ color: '#3b82f6', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Relationship Management
          </Typography>
          <Chip 
            label={`${relationships.length} relationships`}
            size="small"
            sx={{ ml: 1, backgroundColor: '#dbeafe', color: '#1d4ed8' }}
          />
        </Box>
        
        <Button
          startIcon={<Add />}
          onClick={() => setShowCreateDialog(true)}
          disabled={isLoading}
          sx={{ textTransform: 'none' }}
        >
          Add Relationship
        </Button>
      </Box>

      {/* Relationships list */}
      {relationships.length === 0 ? (
        <Alert severity="info">
          No relationships tracked yet. Add connections to build your network intelligence.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {relationships.map((relationship) => {
            const otherContactName = relationship.contact_a_id === contactId 
              ? relationship.contact_b_name 
              : relationship.contact_a_name;

            return (
              <Paper key={relationship.id} sx={{ p: 2, backgroundColor: '#f9fafb' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontSize: '1.2rem', mr: 1 }}>
                        {getRelationshipIcon(relationship.relationship_type)}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {otherContactName}
                      </Typography>
                      <Chip
                        label={relationship.strength}
                        size="small"
                        sx={{
                          ml: 1,
                          backgroundColor: `${getStrengthColor(relationship.strength)}20`,
                          color: getStrengthColor(relationship.strength),
                          textTransform: 'capitalize',
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {relationshipTypeLabels[relationship.relationship_type]}
                    </Typography>
                    
                    {relationship.context && (
                      <Typography variant="body2" sx={{ 
                        fontStyle: 'italic',
                        backgroundColor: 'white',
                        p: 1,
                        borderRadius: 1,
                        border: '1px solid #e5e7eb'
                      }}>
                        {relationship.context}
                      </Typography>
                    )}
                    
                    {relationship.introduction_date && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Introduced: {relationship.introduction_date.toLocaleDateString()}
                        </Typography>
                        {relationship.introduction_successful !== null && (
                          <Chip
                            icon={relationship.introduction_successful ? <CheckCircle /> : <Cancel />}
                            label={relationship.introduction_successful ? 'Successful' : 'Unsuccessful'}
                            size="small"
                            sx={{
                              ml: 1,
                              backgroundColor: relationship.introduction_successful ? '#dcfce7' : '#fecaca',
                              color: relationship.introduction_successful ? '#15803d' : '#dc2626',
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(relationship)}
                      sx={{ color: '#6b7280' }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(relationship.id)}
                      sx={{ color: '#ef4444' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* Create Dialog */}
      <Dialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Add New Relationship</Typography>
          <IconButton onClick={() => setShowCreateDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <CreateEditForm />
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setShowCreateDialog(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateRelationship}
            variant="contained"
            disabled={isSubmitting || !formData.contactId}
          >
            {isSubmitting ? 'Creating...' : 'Create Relationship'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={showEditDialog} 
        onClose={() => setShowEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Edit Relationship</Typography>
          <IconButton onClick={() => setShowEditDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <CreateEditForm isEdit />
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setShowEditDialog(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditRelationship}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Relationship'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};