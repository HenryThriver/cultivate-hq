'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { useGoalsForRelationshipBuilding } from '@/lib/hooks/useRelationshipSessions';
import { SessionStartModal } from '@/components/features/relationship-sessions';
import { useRouter } from 'next/navigation';
import {
  RelationshipPortfolioStats,
  IntelligenceInsights,
  ActionPriorityHub,
  MomentumCelebration
} from '@/components/features/dashboard';

export default function DashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const theme = useTheme();
  const [showStartModal, setShowStartModal] = useState(false);
  const router = useRouter();
  
  const { data: goals, isLoading: loadingGoals } = useGoalsForRelationshipBuilding();

  const getFirstName = () => {
    if (profile?.name) {
      return profile.name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return '';
  };

  const firstName = getFirstName();

  const handleStartSession = () => {
    setShowStartModal(true);
  };

  const handleSessionCreated = (sessionId: string) => {
    setShowStartModal(false);
    // Navigate to top-level session route (bypasses dashboard layout)
    router.push(`/session/${sessionId}`);
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 3 },
      maxWidth: '1400px',
      mx: 'auto'
    }}>
      {/* Welcome Header with Executive Sophistication */}
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{
            mb: 2,
            fontWeight: 700,
            color: 'text.primary',
            letterSpacing: '-0.02em',
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}
        >
          Welcome back{firstName ? `, ${firstName}` : ''}
        </Typography>
        
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'text.secondary',
            fontStyle: 'italic',
            fontWeight: 400,
            opacity: 0.9,
            mb: 4
          }}
        >
          Your relationship intelligence command center
        </Typography>

        {/* Enhanced Relationship Sessions CTA */}
        <Paper sx={{ 
          p: 4, 
          maxWidth: 600,
          borderRadius: 4,
          boxShadow: '0 12px 40px rgba(33, 150, 243, 0.12)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          background: 'linear-gradient(135deg, #ffffff 0%, #fafbff 100%)',
          position: 'relative',
          overflow: 'hidden',
          
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.sage?.main || '#059669'} 50%, ${theme.palette.amber?.main || '#F59E0B'} 100%)`,
          }
        }}>
          <Typography variant="h5" gutterBottom sx={{ 
            fontWeight: 600,
            color: 'primary.main',
            mb: 2,
            letterSpacing: '-0.01em'
          }}>
            Start Strategic Session
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ 
            mb: 3,
            lineHeight: 1.6,
            fontSize: '1.1rem'
          }}>
            Time-boxed focus sessions to advance your most important relationships
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleStartSession}
            disabled={loadingGoals}
            size="large"
            sx={{ 
              px: 4, 
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
              textTransform: 'none',
              letterSpacing: '0.3px',
              transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              
              '&:hover': {
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                transform: 'translateY(-2px)',
              },
              
              '&:disabled': {
                background: alpha(theme.palette.text.disabled, 0.12),
                boxShadow: 'none',
                transform: 'none'
              }
            }}
          >
            Begin Session
          </Button>
          
          {!loadingGoals && (!goals || goals.length === 0) && (
            <Box
              sx={{
                textAlign: 'center',
                py: 2,
                mt: 3,
                color: 'text.secondary',
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 28, mb: 1, opacity: 0.6 }} />
              <Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
                All strategic actions completed. Excellent momentum.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Strategic Overview - Portfolio Stats */}
      <RelationshipPortfolioStats />

      {/* Main Dashboard Grid */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 4,
        mb: 4
      }}>
        {/* Intelligence Column */}
        <Box>
          <IntelligenceInsights />
        </Box>

        {/* Actions Column */}
        <Box>
          <ActionPriorityHub />
        </Box>
      </Box>

      {/* Momentum & Celebration Section */}
      <MomentumCelebration />
      
      {/* Session Start Modal */}
      <SessionStartModal
        open={showStartModal}
        onClose={() => setShowStartModal(false)}
        onSessionCreated={handleSessionCreated}
      />
    </Box>
  );
} 