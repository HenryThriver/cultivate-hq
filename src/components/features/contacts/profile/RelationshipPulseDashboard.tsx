import React, { useState } from 'react';
import { Box, Typography, Paper, Chip, LinearProgress, Stack, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown, Schedule, VideocamOutlined, Loop, CheckCircle, CalendarTodayOutlined } from '@mui/icons-material';
import { ActiveExchangesModal } from './ActiveExchangesModal';

interface Contact {
  id: string;
  name: string;
  email?: string;
  company?: string;
}

interface RelationshipPulseDashboardProps {
  // Reciprocity data
  reciprocityBalance: number; // -1 to 1 (negative = more received, positive = more given)
  reciprocityItems: {
    given: number;
    received: number;
  };
  
  // Active exchanges
  activeExchanges: {
    pogs: {
      active: number;
      total: number;
    };
    asks: {
      active: number;
      total: number;
    };
  };
  
  // Live connections
  lastLiveConnection?: {
    type: 'meeting' | 'call';
    date: Date;
    title?: string;
  };
  nextLiveConnection?: {
    type: 'meeting' | 'call';
    date: Date;
    title?: string;
  };
  
  // Contact info for modals
  contactName: string;
  contactId: string;
  contacts?: Contact[];
  
  // Artifact creation handlers
  onArtifactCreated?: (artifactData: any) => void;
  onArtifactCreating?: (artifactData: any) => Promise<void>;
  
  // Mock data for exchanges - in real app this would come from props
  mockExchanges?: Array<{
    id: string;
    title: string;
    description?: string;
    type: 'pog' | 'ask';
    status: 'queued' | 'active' | 'pending' | 'delivered';
    createdAt: Date;
    contactName: string;
    sourceArtifact?: {
      type: string;
      title: string;
      date: Date;
    };
  }>;
  
  // Callback for when exchange is clicked
  onExchangeClick?: (exchangeId: string) => void;
}

const formatConnectionDate = (date: Date) => {
  const now = new Date();
  const diffTime = Math.abs(date.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (date < now) {
    return `${diffDays} days ago`;
  } else {
    return `in ${diffDays} days`;
  }
};

const getReciprocityStatus = (balance: number) => {
  if (balance > 0.3) return { text: 'You give more', color: '#059669', icon: TrendingUp };
  if (balance < -0.3) return { text: 'You receive more', color: '#2563eb', icon: TrendingDown };
  return { text: 'Balanced exchange', color: '#6b7280', icon: CheckCircle };
};

export const RelationshipPulseDashboard: React.FC<RelationshipPulseDashboardProps> = ({
  reciprocityBalance,
  reciprocityItems,
  activeExchanges,
  lastLiveConnection,
  nextLiveConnection,
  contactName,
  contactId,
  contacts = [],
  onArtifactCreated,
  onArtifactCreating,
  mockExchanges = [],
  onExchangeClick,
}) => {
  const theme = useTheme();
  const reciprocityStatus = getReciprocityStatus(reciprocityBalance);
  const [exchangesModalOpen, setExchangesModalOpen] = useState(false);
  const [exchangesModalType, setExchangesModalType] = useState<'pog' | 'ask' | 'all'>('all');
  
  // Calculate reciprocity percentage for progress bar (0-100)
  const reciprocityPercentage = Math.max(0, Math.min(100, (reciprocityBalance + 1) * 50));
  
  const ReciprocityIcon = reciprocityStatus.icon;

  return (
    <Paper 
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 2,
        background: 'linear-gradient(135deg, #f8faff 0%, #ffffff 100%)',
        border: '1px solid',
        borderColor: 'rgba(99, 102, 241, 0.1)',
        borderRadius: 3,
        boxShadow: 'var(--shadow-card)',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: 'var(--shadow-card-hover)',
          transform: 'translateY(-1px)',
        }
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

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: { xs: 3, lg: 5 } }}>
        
        {/* Reciprocity Section */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <ReciprocityIcon sx={{ fontSize: 20, color: reciprocityStatus.color, mr: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4338ca' }}>
              Reciprocity Index
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

        {/* Active Exchanges Section */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Loop sx={{ fontSize: 20, color: '#7c3aed', mr: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4338ca' }}>
              Active Exchanges
            </Typography>
          </Box>
          
          <Stack spacing={0.5}>
            {activeExchanges.pogs.active > 0 && (
              <Chip 
                label={`${activeExchanges.pogs.active} active POG${activeExchanges.pogs.active !== 1 ? 's' : ''}`}
                size="small"
                clickable
                onClick={() => {
                  setExchangesModalType('pog');
                  setExchangesModalOpen(true);
                }}
                sx={{ 
                  backgroundColor: theme.palette.artifacts.pog.light,
                  color: theme.palette.artifacts.pog.main,
                  fontWeight: 500,
                  justifyContent: 'flex-start',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.artifacts.pog.main,
                    color: theme.palette.artifacts.pog.contrastText,
                  }
                }}
              />
            )}
            {activeExchanges.asks.active > 0 && (
              <Chip 
                label={`${activeExchanges.asks.active} active Ask${activeExchanges.asks.active !== 1 ? 's' : ''}`}
                size="small"
                clickable
                onClick={() => {
                  setExchangesModalType('ask');
                  setExchangesModalOpen(true);
                }}
                sx={{ 
                  backgroundColor: theme.palette.artifacts.ask.light,
                  color: theme.palette.artifacts.ask.main,
                  fontWeight: 500,
                  justifyContent: 'flex-start',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.artifacts.ask.main,
                    color: theme.palette.artifacts.ask.contrastText,
                  }
                }}
              />
            )}
            {activeExchanges.pogs.active === 0 && activeExchanges.asks.active === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                No active exchanges
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Live Connections Section */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <VideocamOutlined sx={{ fontSize: 20, color: '#059669', mr: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4338ca' }}>
              Live Connections
            </Typography>
          </Box>
          
          <Stack spacing={0.5}>
            {lastLiveConnection && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                  Last:
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatConnectionDate(lastLiveConnection.date)}
                </Typography>
                {lastLiveConnection.type === 'call' && (
                  <Schedule sx={{ fontSize: 14, color: '#9ca3af' }} />
                )}
              </Box>
            )}
            {nextLiveConnection && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 500 }}>
                  Next:
                </Typography>
                <Typography variant="caption" sx={{ color: '#059669' }}>
                  {formatConnectionDate(nextLiveConnection.date)}
                </Typography>
                <CalendarTodayOutlined sx={{ fontSize: 14, color: '#059669' }} />
              </Box>
            )}
            {!lastLiveConnection && !nextLiveConnection && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                No live connections tracked
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Active Exchanges Modal */}
      <ActiveExchangesModal
        open={exchangesModalOpen}
        onClose={() => setExchangesModalOpen(false)}
        exchanges={mockExchanges}
        type={exchangesModalType}
        contactName={contactName}
        contactId={contactId}
        contacts={contacts}
        onExchangeClick={onExchangeClick}
        onArtifactCreated={onArtifactCreated}
        onArtifactCreating={onArtifactCreating}
      />
    </Paper>
  );
};