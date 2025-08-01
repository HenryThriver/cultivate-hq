'use client';

import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { usePendingActions, useRecentSessions } from '@/lib/hooks/useRelationshipSessions';
import { useRouter } from 'next/navigation';
import {
  RelationshipPortfolioStats,
  IntelligenceInsights,
  ActionPriorityHub,
  MomentumCelebration,
  RelationshipSessionCard
} from '@/components/features/dashboard';

export default function DashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const router = useRouter();
  
  // Goals will be used in future iterations
  const loadingGoals = false; // Temporary until goals are implemented
  const { data: pendingActions, isLoading: loadingActions } = usePendingActions();
  const { data: recentSessions, isLoading: loadingSessions } = useRecentSessions();

  const getFirstName = () => {
    // First check profile name from database
    if (profile?.name) {
      return profile.name.split(' ')[0];
    }
    // Then check Google OAuth metadata for full name
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    // Finally fall back to email parsing
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return '';
  };

  const firstName = getFirstName();

  const handleSessionCreated = (sessionId: string) => {
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

        {/* Enhanced Relationship Sessions Card */}
        <RelationshipSessionCard
          pendingActions={pendingActions}
          recentSessions={recentSessions}
          loadingActions={loadingActions}
          loadingSessions={loadingSessions}
          loadingGoals={loadingGoals}
          onSessionCreated={handleSessionCreated}
        />
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
    </Box>
  );
} 