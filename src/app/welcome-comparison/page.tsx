'use client';

import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { EnhancedWelcomeScreen } from '@/components/features/onboarding/0_Welcome';

// Import the complex version
import { EnhancedWelcomeScreen as ComplexWelcomeScreen } from '@/components/features/onboarding/0_Welcome_Complex';

export default function WelcomeComparisonPage() {
  const [currentVersion, setCurrentVersion] = useState<'new' | 'complex'>('new');

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Version Toggle Controls */}
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          borderRadius: 2,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontSize: '1rem' }}>
          Version Comparison
        </Typography>
        
        <Button
          variant={currentVersion === 'new' ? 'contained' : 'outlined'}
          onClick={() => setCurrentVersion('new')}
          size="small"
          sx={{ textTransform: 'none' }}
        >
          New Modular Version
        </Button>
        
        <Button
          variant={currentVersion === 'complex' ? 'contained' : 'outlined'}
          onClick={() => setCurrentVersion('complex')}
          size="small"
          sx={{ textTransform: 'none' }}
        >
          Original Complex Version
        </Button>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Current: {currentVersion === 'new' ? 'New Modular' : 'Original Complex'}
        </Typography>
      </Paper>

      {/* Render the selected version */}
      {currentVersion === 'new' ? (
        <EnhancedWelcomeScreen />
      ) : (
        <ComplexWelcomeScreen />
      )}
    </Box>
  );
}