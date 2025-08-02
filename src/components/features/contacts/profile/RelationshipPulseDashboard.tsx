import React from 'react';
import { Box, Typography, Paper, Chip, LinearProgress, Avatar, Stack } from '@mui/material';
import { TrendingUp, TrendingDown, Schedule, People, Loop, CheckCircle } from '@mui/icons-material';

interface RelationshipPulseDashboardProps {
  contactId: string;
  contactName: string;
  
  // Reciprocity data
  reciprocityBalance: number; // -1 to 1 (negative = more received, positive = more given)
  reciprocityItems: {
    given: number;
    received: number;
  };
  
  // Connection cadence
  cadenceDays: number;
  daysSinceLastInteraction: number;
  cadenceHealth: 'on-track' | 'due-soon' | 'overdue';
  
  // Actions & loops
  openActionsCount: number;
  highPriorityActionsCount: number;
  
  // Network
  networkConnectionsCount: number;
  recentIntroductions?: number;
  
  // Next interaction
  nextInteraction?: {
    type: 'scheduled' | 'suggested';
    date?: Date;
    description: string;
  };
}

const getCadenceHealthColor = (health: 'on-track' | 'due-soon' | 'overdue') => {
  switch (health) {
    case 'on-track': return { color: '#059669', bg: '#d1fae5', icon: CheckCircle };
    case 'due-soon': return { color: '#d97706', bg: '#fef3c7', icon: Schedule };
    case 'overdue': return { color: '#dc2626', bg: '#fecaca', icon: TrendingDown };
  }
};

const getReciprocityStatus = (balance: number) => {
  if (balance > 0.3) return { text: 'You give more', color: '#059669', icon: TrendingUp };
  if (balance < -0.3) return { text: 'You receive more', color: '#2563eb', icon: TrendingDown };
  return { text: 'Balanced exchange', color: '#6b7280', icon: CheckCircle };
};

export const RelationshipPulseDashboard: React.FC<RelationshipPulseDashboardProps> = ({
  contactId,
  contactName,
  reciprocityBalance,
  reciprocityItems,
  cadenceDays,
  daysSinceLastInteraction,
  cadenceHealth,
  openActionsCount,
  highPriorityActionsCount,
  networkConnectionsCount,
  recentIntroductions = 0,
  nextInteraction,
}) => {
  const cadenceStyle = getCadenceHealthColor(cadenceHealth);
  const reciprocityStatus = getReciprocityStatus(reciprocityBalance);
  
  // Calculate reciprocity percentage for progress bar (0-100)
  const reciprocityPercentage = Math.max(0, Math.min(100, (reciprocityBalance + 1) * 50));
  
  const CadenceIcon = cadenceStyle.icon;
  const ReciprocityIcon = reciprocityStatus.icon;

  return (
    <Paper 
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 2,
        backgroundColor: '#f8faff', // Very light indigo
        borderLeft: '4px solid #6366f1', // Indigo accent
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)',
      }}
    >
      <Typography 
        variant="h6" 
        component="h2" 
        sx={{ 
          mb: 2, 
          fontWeight: 600, 
          color: '#3730a3', // Indigo-700
          fontSize: { xs: '1.1rem', md: '1.25rem' }
        }}
      >
        Relationship Pulse
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        
        {/* Reciprocity Section */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <ReciprocityIcon sx={{ fontSize: 20, color: reciprocityStatus.color, mr: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4338ca' }}>
              Exchange Balance
            </Typography>
          </Box>
          
          <Box sx={{ mb: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={reciprocityPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e5e7eb',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: reciprocityStatus.color,
                }
              }}
            />
          </Box>
          
          <Typography variant="caption" sx={{ color: reciprocityStatus.color, fontWeight: 500 }}>
            {reciprocityStatus.text}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Given: {reciprocityItems.given}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Received: {reciprocityItems.received}
            </Typography>
          </Box>
        </Box>

        {/* Connection Cadence Section */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CadenceIcon sx={{ fontSize: 20, color: cadenceStyle.color, mr: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4338ca' }}>
              Connection Health
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 1, 
            backgroundColor: cadenceStyle.bg,
            border: `1px solid ${cadenceStyle.color}20`
          }}>
            <Typography variant="body2" sx={{ color: cadenceStyle.color, fontWeight: 500 }}>
              {cadenceHealth === 'on-track' && `Last contact: ${daysSinceLastInteraction} days ago`}
              {cadenceHealth === 'due-soon' && `Due for reconnect in ${cadenceDays - daysSinceLastInteraction} days`}
              {cadenceHealth === 'overdue' && `${daysSinceLastInteraction - cadenceDays} days overdue`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Target: Every {cadenceDays} days
            </Typography>
          </Box>
        </Box>

        {/* Actions Section */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Loop sx={{ fontSize: 20, color: '#7c3aed', mr: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4338ca' }}>
              Active Work
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip 
              label={`${openActionsCount} open`}
              size="small"
              sx={{ 
                backgroundColor: openActionsCount > 0 ? '#dbeafe' : '#f3f4f6',
                color: openActionsCount > 0 ? '#1d4ed8' : '#6b7280',
                fontWeight: 500
              }}
            />
            {highPriorityActionsCount > 0 && (
              <Chip 
                label={`${highPriorityActionsCount} urgent`}
                size="small"
                sx={{ 
                  backgroundColor: '#fecaca',
                  color: '#dc2626',
                  fontWeight: 500
                }}
              />
            )}
          </Stack>
          
          {nextInteraction && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Next: {nextInteraction.description}
            </Typography>
          )}
        </Box>

        {/* Network Section */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <People sx={{ fontSize: 20, color: '#059669', mr: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4338ca' }}>
              Network
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 1, 
            backgroundColor: '#ecfdf5',
            border: '1px solid #05966920'
          }}>
            <Typography variant="body2" sx={{ color: '#059669', fontWeight: 500 }}>
              {networkConnectionsCount} connections
            </Typography>
            {recentIntroductions > 0 && (
              <Typography variant="caption" color="text.secondary">
                {recentIntroductions} recent introductions
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};