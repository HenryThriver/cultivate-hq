import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Avatar, 
  Chip, 
  Button,
  Alert,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  StepConnector
} from '@mui/material';
import { 
  GpsFixed as Target, 
  TrendingUp, 
  Share, 
  CheckCircle,
  RadioButtonUnchecked,
  ArrowForward
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface PathStep {
  contactId: string;
  contactName: string;
  title?: string;
  company?: string;
  profilePicture?: string;
  relationshipStrength: 'weak' | 'medium' | 'strong';
  connectionType: 'introduced_by_me' | 'known_connection' | 'target_connection';
  introductionStatus?: 'not_made' | 'pending' | 'successful' | 'declined';
  lastInteraction?: Date;
  notes?: string;
}

interface ConnectionPathProps {
  targetContactId: string;
  targetContactName: string;
  goalTitle: string;
  targetDescription: string;
  
  // Path data
  pathSteps: PathStep[];
  pathLength: number;
  confidence: number; // 0-100% confidence this path will work
  
  // Status
  isActive: boolean;
  currentStepIndex?: number; // Which step we're currently on
  
  // Actions
  onMakeIntroduction: (fromContactId: string, toContactId: string) => void;
  onUpdateStepStatus: (stepIndex: number, status: 'successful' | 'declined') => void;
  onAddNote: (stepIndex: number, note: string) => void;
  
  // UI
  compact?: boolean;
}

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  '& .MuiStepConnector-line': {
    borderLeftWidth: 3,
    borderLeftColor: '#e5e7eb',
  },
  '&.Mui-active .MuiStepConnector-line': {
    borderLeftColor: '#3b82f6',
  },
  '&.Mui-completed .MuiStepConnector-line': {
    borderLeftColor: '#059669',
  },
}));

const getStepStatus = (step: PathStep, stepIndex: number, currentStepIndex?: number) => {
  if (stepIndex < (currentStepIndex || 0)) return 'completed';
  if (stepIndex === currentStepIndex) return 'active';
  return 'pending';
};

const getStrengthColor = (strength: 'weak' | 'medium' | 'strong') => {
  switch (strength) {
    case 'weak': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'strong': return '#059669';
  }
};

const getIntroductionStatusColor = (status?: 'not_made' | 'pending' | 'successful' | 'declined') => {
  switch (status) {
    case 'successful': return '#059669';
    case 'pending': return '#f59e0b';
    case 'declined': return '#ef4444';
    default: return '#6b7280';
  }
};

export const ConnectionPath: React.FC<ConnectionPathProps> = ({
  targetContactId,
  targetContactName,
  goalTitle,
  targetDescription,
  pathSteps,
  pathLength,
  confidence,
  isActive,
  currentStepIndex = 0,
  onMakeIntroduction,
  onUpdateStepStatus,
  onAddNote,
  compact = false,
}) => {
  if (compact) {
    // Compact horizontal view for dashboard
    return (
      <Paper sx={{ p: 2, backgroundColor: '#f8faff', border: '1px solid #e0e7ff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Target sx={{ color: '#d97706', mr: 1, fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {targetContactName}
            </Typography>
            <Chip 
              label={goalTitle}
              size="small" 
              sx={{ ml: 1, backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '0.7rem' }}
            />
          </Box>
          
          <Chip
            label={`${confidence}% confidence`}
            size="small"
            sx={{
              backgroundColor: confidence > 70 ? '#dcfce7' : confidence > 40 ? '#fef3c7' : '#fecaca',
              color: confidence > 70 ? '#15803d' : confidence > 40 ? '#a16207' : '#dc2626',
              fontSize: '0.7rem'
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            Path ({pathLength} steps):
          </Typography>
          
          {pathSteps.map((step, index) => (
            <React.Fragment key={step.contactId}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Avatar 
                  src={step.profilePicture}
                  sx={{ 
                    width: 24, 
                    height: 24,
                    border: `2px solid ${getStrengthColor(step.relationshipStrength)}`,
                  }}
                >
                  {step.contactName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                  {step.contactName}
                </Typography>
              </Box>
              {index < pathSteps.length - 1 && (
                <ArrowForward sx={{ fontSize: 16, color: '#9ca3af' }} />
              )}
            </React.Fragment>
          ))}
        </Box>
        
        {isActive && currentStepIndex < pathSteps.length && (
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              onClick={() => {
                const currentStep = pathSteps[currentStepIndex];
                const nextStep = pathSteps[currentStepIndex + 1];
                if (nextStep) {
                  onMakeIntroduction(currentStep.contactId, nextStep.contactId);
                }
              }}
              sx={{ fontSize: '0.7rem', textTransform: 'none' }}
            >
              Make Introduction
            </Button>
          </Box>
        )}
      </Paper>
    );
  }

  // Full detailed view
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)',
        border: isActive ? '2px solid #3b82f6' : '1px solid #e5e7eb',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Target sx={{ color: '#d97706', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Path to {targetContactName}
            </Typography>
            {isActive && (
              <Chip 
                label="Active"
                size="small"
                sx={{ ml: 1, backgroundColor: '#dcfce7', color: '#15803d' }}
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={goalTitle}
              size="small" 
              sx={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}
            />
            <Typography variant="body2" color="text.secondary">
              {targetDescription}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#3b82f6' }}>
            {confidence}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Success confidence
          </Typography>
        </Box>
      </Box>

      {/* Path visualization */}
      {pathLength === 0 ? (
        <Alert severity="info">
          No connection path found. Consider expanding your network or finding alternative routes.
        </Alert>
      ) : (
        <>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Connection Path ({pathLength} steps)
          </Typography>
          
          <Stepper 
            activeStep={currentStepIndex} 
            orientation="vertical"
            connector={<CustomConnector />}
          >
            {pathSteps.map((step, index) => {
              const stepStatus = getStepStatus(step, index, currentStepIndex);
              const isCurrentStep = index === currentStepIndex;
              
              return (
                <Step key={step.contactId}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Avatar 
                        src={step.profilePicture}
                        sx={{ 
                          width: 40, 
                          height: 40,
                          border: `3px solid ${
                            stepStatus === 'completed' ? '#059669' : 
                            stepStatus === 'active' ? '#3b82f6' : '#e5e7eb'
                          }`,
                        }}
                      >
                        {step.contactName.charAt(0).toUpperCase()}
                      </Avatar>
                    )}
                  >
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {step.contactName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {step.title} {step.company && `at ${step.company}`}
                      </Typography>
                    </Box>
                  </StepLabel>
                  
                  <StepContent>
                    <Box sx={{ ml: 2, pb: 2 }}>
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip
                          label={step.relationshipStrength}
                          size="small"
                          sx={{
                            backgroundColor: `${getStrengthColor(step.relationshipStrength)}20`,
                            color: getStrengthColor(step.relationshipStrength),
                            textTransform: 'capitalize',
                            fontSize: '0.7rem'
                          }}
                        />
                        
                        {step.introductionStatus && (
                          <Chip
                            label={step.introductionStatus.replace(/_/g, ' ')}
                            size="small"
                            sx={{
                              backgroundColor: `${getIntroductionStatusColor(step.introductionStatus)}20`,
                              color: getIntroductionStatusColor(step.introductionStatus),
                              textTransform: 'capitalize',
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                      </Stack>
                      
                      {step.lastInteraction && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Last interaction: {step.lastInteraction.toLocaleDateString()}
                        </Typography>
                      )}
                      
                      {step.notes && (
                        <Typography variant="body2" sx={{ 
                          backgroundColor: '#f9fafb', 
                          p: 1, 
                          borderRadius: 1, 
                          fontStyle: 'italic',
                          mb: 1 
                        }}>
                          "{step.notes}"
                        </Typography>
                      )}
                      
                      {isCurrentStep && index < pathSteps.length - 1 && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              const nextStep = pathSteps[index + 1];
                              if (nextStep) {
                                onMakeIntroduction(step.contactId, nextStep.contactId);
                              }
                            }}
                            sx={{ textTransform: 'none' }}
                          >
                            Make Introduction
                          </Button>
                          
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onUpdateStepStatus(index, 'successful')}
                            sx={{ textTransform: 'none' }}
                          >
                            Mark Complete
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </>
      )}

      {/* Progress summary */}
      <Box sx={{ 
        mt: 3, 
        p: 2, 
        backgroundColor: '#f8faff', 
        borderRadius: 1,
        border: '1px solid #e0e7ff'
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Progress Summary
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Step {Math.min(currentStepIndex + 1, pathLength)} of {pathLength}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {Math.round((currentStepIndex / Math.max(pathLength - 1, 1)) * 100)}% complete
            </Typography>
            
            {currentStepIndex >= pathLength - 1 ? (
              <CheckCircle sx={{ color: '#059669', fontSize: 20 }} />
            ) : (
              <RadioButtonUnchecked sx={{ color: '#9ca3af', fontSize: 20 }} />
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};