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
  LinearProgress,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Close,
  GpsFixed as Target,
  Flag,
  CheckCircle,
  Schedule,
  TrendingUp,
  Archive,
  Notes
} from '@mui/icons-material';

interface Goal {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
}

interface GoalTarget {
  id: string;
  goal_id: string;
  goal_title: string;
  contact_id: string;
  target_description: string;
  target_type: 'introduction' | 'information' | 'opportunity' | 'exploration';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'achieved' | 'archived';
  achieved_at?: Date;
  achievement_notes?: string;
  notes?: string;
  created_at: Date;
  last_progress_update?: Date;
}

interface GoalTargetManagerProps {
  contactId: string;
  contactName: string;
  
  // Data
  goalTargets: GoalTarget[];
  availableGoals: Goal[];
  
  // Actions
  onCreateTarget: (target: Omit<GoalTarget, 'id' | 'created_at' | 'goal_title'>) => Promise<void>;
  onUpdateTarget: (id: string, updates: Partial<GoalTarget>) => Promise<void>;
  onDeleteTarget: (id: string) => Promise<void>;
  onAchieveTarget: (id: string, notes: string) => Promise<void>;
  
  // Loading states
  isLoading?: boolean;
}

interface CreateTargetFormData {
  goalId: string;
  targetDescription: string;
  targetType: 'introduction' | 'information' | 'opportunity' | 'exploration';
  priority: 'high' | 'medium' | 'low';
  notes: string;
}

const initialFormData: CreateTargetFormData = {
  goalId: '',
  targetDescription: '',
  targetType: 'information',
  priority: 'medium',
  notes: '',
};

const targetTypeLabels = {
  'introduction': 'Introduction to someone',
  'information': 'Information or insights',
  'opportunity': 'Business opportunity',
  'exploration': 'General relationship building',
};

const targetTypeIcons = {
  'introduction': '🤝',
  'information': '💡',
  'opportunity': '🚀',
  'exploration': '🔍',
};

const priorityColors = {
  'high': '#dc2626',
  'medium': '#d97706',
  'low': '#059669',
};

const statusColors = {
  'active': '#3b82f6',
  'achieved': '#059669',
  'archived': '#6b7280',
};

export const GoalTargetManager: React.FC<GoalTargetManagerProps> = ({
  contactId,
  contactName,
  goalTargets,
  availableGoals,
  onCreateTarget,
  onUpdateTarget,
  onDeleteTarget,
  onAchieveTarget,
  isLoading = false,
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAchieveDialog, setShowAchieveDialog] = useState(false);
  const [editingTarget, setEditingTarget] = useState<GoalTarget | null>(null);
  const [achievingTarget, setAchievingTarget] = useState<GoalTarget | null>(null);
  const [formData, setFormData] = useState<CreateTargetFormData>(initialFormData);
  const [achievementNotes, setAchievementNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'achieved' | 'archived'>('all');

  // Filter targets based on status
  const filteredTargets = goalTargets.filter(target => {
    if (filterStatus === 'all') return true;
    return target.status === filterStatus;
  });

  // Group targets by goal
  const targetsByGoal = filteredTargets.reduce((acc, target) => {
    if (!acc[target.goal_id]) {
      acc[target.goal_id] = [];
    }
    acc[target.goal_id].push(target);
    return acc;
  }, {} as Record<string, GoalTarget[]>);

  const handleCreateTarget = async () => {
    if (!formData.goalId || !formData.targetDescription.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onCreateTarget({
        goal_id: formData.goalId,
        contact_id: contactId,
        target_description: formData.targetDescription,
        target_type: formData.targetType,
        priority: formData.priority,
        status: 'active',
        notes: formData.notes || undefined,
      });

      setShowCreateDialog(false);
      setFormData(initialFormData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create target');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTarget = async () => {
    if (!editingTarget) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onUpdateTarget(editingTarget.id, {
        target_description: formData.targetDescription,
        target_type: formData.targetType,
        priority: formData.priority,
        notes: formData.notes || undefined,
        last_progress_update: new Date(),
      });

      setShowEditDialog(false);
      setEditingTarget(null);
      setFormData(initialFormData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update target');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAchieveTarget = async () => {
    if (!achievingTarget) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onAchieveTarget(achievingTarget.id, achievementNotes);
      setShowAchieveDialog(false);
      setAchievingTarget(null);
      setAchievementNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark target as achieved');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (target: GoalTarget) => {
    setEditingTarget(target);
    setFormData({
      goalId: target.goal_id,
      targetDescription: target.target_description,
      targetType: target.target_type,
      priority: target.priority,
      notes: target.notes || '',
    });
    setShowEditDialog(true);
  };

  const openAchieveDialog = (target: GoalTarget) => {
    setAchievingTarget(target);
    setAchievementNotes('');
    setShowAchieveDialog(true);
  };

  const handleArchiveTarget = async (targetId: string) => {
    if (window.confirm('Are you sure you want to archive this target?')) {
      try {
        await onUpdateTarget(targetId, { status: 'archived' });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to archive target');
      }
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
          <FormControl required>
            <InputLabel>Goal</InputLabel>
            <Select
              value={formData.goalId}
              label="Goal"
              onChange={(e) => {
                setFormData(prev => ({ ...prev, goalId: e.target.value }));
                setError(null);
              }}
            >
              {availableGoals.filter(goal => goal.isActive).map((goal) => (
                <MenuItem key={goal.id} value={goal.id}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {goal.title}
                    </Typography>
                    {goal.description && (
                      <Typography variant="caption" color="text.secondary">
                        {goal.description}
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <TextField
          label="Target Description"
          required
          multiline
          rows={3}
          value={formData.targetDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, targetDescription: e.target.value }))}
          placeholder="What do you want to achieve with this contact for this goal?"
          error={!!error && !formData.targetDescription.trim()}
        />

        <FormControl required>
          <InputLabel>Target Type</InputLabel>
          <Select
            value={formData.targetType}
            label="Target Type"
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              targetType: e.target.value as typeof prev.targetType 
            }))}
          >
            {Object.entries(targetTypeLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ mr: 1 }}>
                    {targetTypeIcons[value as keyof typeof targetTypeIcons]}
                  </Typography>
                  {label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl required>
          <InputLabel>Priority</InputLabel>
          <Select
            value={formData.priority}
            label="Priority"
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              priority: e.target.value as typeof prev.priority 
            }))}
          >
            {Object.entries(priorityColors).map(([value, color]) => (
              <MenuItem key={value} value={value}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: color,
                      mr: 1,
                    }}
                  />
                  <Typography sx={{ textTransform: 'capitalize' }}>{value}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Notes (Optional)"
          multiline
          rows={2}
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional context or strategy notes..."
        />
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
          <Target sx={{ color: '#d97706', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Goal Targets
          </Typography>
          <Chip 
            label={`${goalTargets.length} targets`}
            size="small"
            sx={{ ml: 1, backgroundColor: '#fef3c7', color: '#92400e' }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              displayEmpty
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="achieved">Achieved</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            startIcon={<Add />}
            onClick={() => setShowCreateDialog(true)}
            disabled={isLoading || availableGoals.filter(g => g.isActive).length === 0}
            sx={{ textTransform: 'none' }}
          >
            Add Target
          </Button>
        </Box>
      </Box>

      {/* Targets by goal */}
      {availableGoals.filter(g => g.isActive).length === 0 ? (
        <Alert severity="info">
          No active goals found. Create a goal first to set targets for this contact.
        </Alert>
      ) : filteredTargets.length === 0 ? (
        <Alert severity="info">
          No targets set for this contact yet. Set specific objectives to track progress toward your goals.
        </Alert>
      ) : (
        <Stack spacing={3}>
          {Object.entries(targetsByGoal).map(([goalId, targets]) => {
            const goal = availableGoals.find(g => g.id === goalId);
            if (!goal) return null;

            const activeTargets = targets.filter(t => t.status === 'active');
            const achievedTargets = targets.filter(t => t.status === 'achieved');

            return (
              <Card key={goalId} sx={{ backgroundColor: '#f8faff' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {goal.title}
                      </Typography>
                      {goal.description && (
                        <Typography variant="body2" color="text.secondary">
                          {goal.description}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={`${activeTargets.length} active`}
                        size="small"
                        sx={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}
                      />
                      {achievedTargets.length > 0 && (
                        <Chip
                          label={`${achievedTargets.length} achieved`}
                          size="small"
                          sx={{ backgroundColor: '#dcfce7', color: '#15803d' }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Stack spacing={2}>
                    {targets.map((target) => (
                      <Paper 
                        key={target.id} 
                        sx={{ 
                          p: 2, 
                          backgroundColor: 'white',
                          border: `2px solid ${statusColors[target.status]}20`
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography sx={{ fontSize: '1.1rem', mr: 1 }}>
                                {targetTypeIcons[target.target_type]}
                              </Typography>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {target.target_description}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                              <Chip
                                label={targetTypeLabels[target.target_type]}
                                size="small"
                                sx={{ fontSize: '0.7rem' }}
                              />
                              <Chip
                                label={target.priority}
                                size="small"
                                sx={{
                                  backgroundColor: `${priorityColors[target.priority]}20`,
                                  color: priorityColors[target.priority],
                                  textTransform: 'capitalize',
                                  fontSize: '0.7rem'
                                }}
                              />
                              <Chip
                                label={target.status}
                                size="small"
                                sx={{
                                  backgroundColor: `${statusColors[target.status]}20`,
                                  color: statusColors[target.status],
                                  textTransform: 'capitalize',
                                  fontSize: '0.7rem'
                                }}
                              />
                            </Box>

                            {target.notes && (
                              <Typography variant="body2" sx={{ 
                                fontStyle: 'italic',
                                backgroundColor: '#f9fafb',
                                p: 1,
                                borderRadius: 1,
                                border: '1px solid #e5e7eb',
                                mb: 1
                              }}>
                                {target.notes}
                              </Typography>
                            )}

                            {target.achieved_at && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <CheckCircle sx={{ color: '#059669', fontSize: 16, mr: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">
                                  Achieved on {target.achieved_at.toLocaleDateString()}
                                </Typography>
                                {target.achievement_notes && (
                                  <Typography variant="caption" sx={{ ml: 1, fontStyle: 'italic' }}>
                                    - {target.achievement_notes}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                            {target.status === 'active' && (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => openAchieveDialog(target)}
                                  sx={{ color: '#059669' }}
                                  title="Mark as achieved"
                                >
                                  <CheckCircle fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => openEditDialog(target)}
                                  sx={{ color: '#6b7280' }}
                                  title="Edit target"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleArchiveTarget(target.id)}
                                  sx={{ color: '#d97706' }}
                                  title="Archive target"
                                >
                                  <Archive fontSize="small" />
                                </IconButton>
                              </>
                            )}
                            <IconButton
                              size="small"
                              onClick={() => onDeleteTarget(target.id)}
                              sx={{ color: '#ef4444' }}
                              title="Delete target"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
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
          <Typography variant="h6">Set New Goal Target</Typography>
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
            onClick={handleCreateTarget}
            variant="contained"
            disabled={isSubmitting || !formData.goalId || !formData.targetDescription.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create Target'}
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
          <Typography variant="h6">Edit Goal Target</Typography>
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
            onClick={handleEditTarget}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Target'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Achieve Dialog */}
      <Dialog 
        open={showAchieveDialog} 
        onClose={() => setShowAchieveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle sx={{ color: '#059669', mr: 1 }} />
            <Typography variant="h6">Mark Target as Achieved</Typography>
          </Box>
          <IconButton onClick={() => setShowAchieveDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {achievingTarget && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                {achievingTarget.target_description}
              </Typography>
              
              <TextField
                label="Achievement Notes (Optional)"
                multiline
                rows={3}
                fullWidth
                value={achievementNotes}
                onChange={(e) => setAchievementNotes(e.target.value)}
                placeholder="How was this target achieved? Any insights or lessons learned..."
              />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setShowAchieveDialog(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAchieveTarget}
            variant="contained"
            disabled={isSubmitting}
            sx={{ backgroundColor: '#059669', '&:hover': { backgroundColor: '#047857' } }}
          >
            {isSubmitting ? 'Marking Achieved...' : 'Mark as Achieved'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};