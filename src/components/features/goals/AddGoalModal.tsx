'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';

const GOAL_CATEGORIES = [
  { display: 'Land a specific role or make a career transition', value: 'career_transition' },
  { display: 'Grow or launch my startup', value: 'startup' },
  { display: 'Nurture previous and prospective clients/customers', value: 'client_relationships' },
  { display: 'Find investors or strategic partners', value: 'investors_partners' },
  { display: 'Break into a new industry or market', value: 'industry_expansion' },
  { display: 'Learn a new skill or find a new mentor', value: 'learning_mentorship' },
  { display: 'Maintain or deepen relationships within an existing community', value: 'community_deepening' },
  { display: 'Something else', value: 'other' }
];

const TIMELINES = [
  { label: '3 months', value: '3_months' },
  { label: '6 months', value: '6_months' },
  { label: '1 year', value: '1_year' },
  { label: 'Ongoing', value: 'ongoing' },
];

interface AddGoalModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddGoalModal({ open, onClose, onSuccess }: AddGoalModalProps) {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Form data
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [timeline, setTimeline] = useState('');
  const [successCriteria, setSuccessCriteria] = useState('');
  const [targetContactCount, setTargetContactCount] = useState<number | ''>('');
  const [priority, setPriority] = useState<number>(3);

  const steps = ['Choose Category', 'Define Goal', 'Set Targets'];

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleNext = () => {
    setError(null);
    
    // Validation for each step
    if (activeStep === 0 && !selectedCategory) {
      setError('Please select a goal category');
      return;
    }
    if (activeStep === 1 && !goalTitle) {
      setError('Please enter a goal title');
      return;
    }
    
    if (activeStep === steps.length - 1) {
      handleCreateGoal();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCreateGoal = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate target date based on timeline
      let targetDate = null;
      if (timeline) {
        const now = new Date();
        if (timeline === '3_months') {
          targetDate = new Date(now.setMonth(now.getMonth() + 3));
        } else if (timeline === '6_months') {
          targetDate = new Date(now.setMonth(now.getMonth() + 6));
        } else if (timeline === '1_year') {
          targetDate = new Date(now.setFullYear(now.getFullYear() + 1));
        }
      }

      const { data, error: insertError } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: goalTitle,
          description: goalDescription || null,
          category: selectedCategory,
          timeline: timeline || null,
          success_criteria: successCriteria || null,
          target_contact_count: targetContactCount || null,
          target_date: targetDate ? targetDate.toISOString() : null,
          priority: priority,
          status: 'active',
          is_primary: false, // Can be set later
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Reset form
      setSelectedCategory('');
      setGoalTitle('');
      setGoalDescription('');
      setTimeline('');
      setSuccessCriteria('');
      setTargetContactCount('');
      setPriority(3);
      setActiveStep(0);
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form after close animation
      timeoutRef.current = setTimeout(() => {
        setActiveStep(0);
        setError(null);
        timeoutRef.current = null;
      }, 300);
    }
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
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Create New Goal
        </Typography>
        <IconButton
          onClick={handleClose}
          disabled={loading}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.secondary',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step 1: Choose Category */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
              What type of goal do you want to achieve?
            </Typography>
            <Stack spacing={2}>
              {GOAL_CATEGORIES.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? 'contained' : 'outlined'}
                  onClick={() => setSelectedCategory(category.value)}
                  sx={{
                    p: 2.5,
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderRadius: 2,
                    borderWidth: selectedCategory === category.value ? 0 : 1.5,
                  }}
                >
                  {category.display}
                </Button>
              ))}
            </Stack>
          </Box>
        )}

        {/* Step 2: Define Goal */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
              Define your goal
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="Goal Title"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                fullWidth
                required
                placeholder="e.g., Land a Series A funding round"
                sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
              />
              <TextField
                label="Description"
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Describe what success looks like for this goal..."
                sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
              />
              <FormControl fullWidth>
                <InputLabel>Timeline</InputLabel>
                <Select
                  value={timeline}
                  onChange={(e: SelectChangeEvent) => setTimeline(e.target.value)}
                  label="Timeline"
                  sx={{ borderRadius: 2 }}
                >
                  {TIMELINES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>
        )}

        {/* Step 3: Set Targets */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
              Set your targets (optional)
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="Success Criteria"
                value={successCriteria}
                onChange={(e) => setSuccessCriteria(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="How will you know when you've achieved this goal?"
                sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
              />
              <TextField
                label="Target Contact Count"
                type="number"
                value={targetContactCount}
                onChange={(e) => setTargetContactCount(e.target.value ? parseInt(e.target.value) : '')}
                fullWidth
                placeholder="How many key contacts do you need?"
                sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
              />
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority.toString()}
                  onChange={(e: SelectChangeEvent) => setPriority(parseInt(e.target.value))}
                  label="Priority"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="1">🔥 Top Priority</MenuItem>
                  <MenuItem value="2">⭐ High Priority</MenuItem>
                  <MenuItem value="3">◻️ Normal Priority</MenuItem>
                  <MenuItem value="4">▪️ Low Priority</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{ textTransform: 'none' }}
        >
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button 
            onClick={handleBack} 
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={loading}
          sx={{ 
            textTransform: 'none',
            px: 3,
            fontWeight: 500
          }}
        >
          {activeStep === steps.length - 1 ? 
            (loading ? 'Creating...' : 'Create Goal') : 
            'Next'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}