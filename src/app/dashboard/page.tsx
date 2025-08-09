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
    // First check profile name from database - but skip if it's an email
    if (profile?.name && !profile.name.includes('@')) {
      return profile.name.split(' ')[0];
    }
    
    // Check raw user metadata from profile (auth.users data)
    // Cast to any since raw_user_meta_data comes from database view but not in interface
    // Use a more specific type for the profile with raw_user_meta_data
    const profileWithMetadata = profile as typeof profile & { raw_user_meta_data?: { full_name?: string } };
    const rawMetadata = profileWithMetadata?.raw_user_meta_data;
    if (rawMetadata?.full_name) {
      return rawMetadata.full_name.split(' ')[0];
    }
    
    // Then check Google OAuth metadata for full name
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    
    // Finally fall back to email parsing
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      // Capitalize first letter
      return emailName.charAt(0).toUpperCase() + emailName.slice(1).toLowerCase();
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

      {/* Momentum & Celebration Section - Recent Wins */}
      <MomentumCelebration />

      {/* Intelligence Insights - AI Powered Future State */}
      <IntelligenceInsights />
    </Box>
  );
} 