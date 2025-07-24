'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useOnboardingState } from '@/lib/hooks/useOnboardingState';

// CSS-based typewriter component
const TypewriterText: React.FC<{ 
  text: string; 
  onComplete?: () => void;
}> = ({ text, onComplete }) => {
  const [currentText, setCurrentText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let index = 0;
    
    const typeChar = () => {
      if (index < text.length) {
        setCurrentText(text.slice(0, index + 1));
        index++;
        timeout = setTimeout(typeChar, 100);
      } else {
        // Typing complete, hide cursor after delay
        setTimeout(() => {
          setShowCursor(false);
          onComplete?.();
        }, 1000);
      }
    };

    timeout = setTimeout(typeChar, 500);
    return () => clearTimeout(timeout);
  }, [text, onComplete]);

  return (
    <Typography
      variant="h2"
      sx={{
        fontWeight: 700,
        letterSpacing: '-0.02em',
        background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 50%, #1976D2 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        fontSize: { xs: '2.5rem', sm: '3rem', md: '3.75rem' },
        lineHeight: 1.1,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        '&::after': {
          content: showCursor ? '"|"' : '""',
          color: '#2196F3',
          animation: showCursor ? 'blink 1s infinite' : 'none',
        },
        '@keyframes blink': {
          '0%, 50%': { opacity: 1 },
          '51%, 100%': { opacity: 0 }
        }
      }}
    >
      {currentText}
    </Typography>
  );
};

// CSS-based animated card
const AnimatedCard: React.FC<{ 
  title: string; 
  onExit?: () => void;
}> = ({ title, onExit }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Enter animation
    setIsVisible(true);
    
    // Exit after duration
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onExit?.(), 600); // Wait for exit animation
    }, 2000);

    return () => clearTimeout(exitTimer);
  }, [title, onExit]); // Add title as dependency to reset animation for new cards

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? 'translate(-50%, -50%) scale(1)' 
          : 'translate(-50%, -40%) scale(0.8)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Typography variant="h6" sx={{ 
        textAlign: 'center', 
        color: '#1976D2', 
        fontWeight: 600,
        whiteSpace: 'nowrap'
      }}>
        {title}
      </Typography>
    </Box>
  );
};

export const EnhancedWelcomeScreen: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { nextScreen, completeScreen, currentScreen } = useOnboardingState();
  
  // Animation state
  const [phase, setPhase] = useState<'initial' | 'typewriter' | 'cards' | 'tagline' | 'button'>('initial');
  const [showCards, setShowCards] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  const cards = [
    "🎯 Land that dream role",
    "🤝 Build strategic relationships", 
    "📈 Accelerate your career",
    "✨ Achieve extraordinary outcomes"
  ];

  useEffect(() => {
    // Start the sequence
    const timer = setTimeout(() => setPhase('typewriter'), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleTypewriterComplete = () => {
    setTimeout(() => {
      setPhase('cards');
      setShowCards(true);
      setCurrentCardIndex(0);
    }, 800);
  };

  const handleCardExit = () => {
    if (currentCardIndex < cards.length - 1) {
      // Move to next card
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1);
      }, 100);
    } else {
      // All cards shown, move to tagline
      setShowCards(false);
      setTimeout(() => setPhase('tagline'), 300);
    }
  };

  const handleTaglineComplete = () => {
    setTimeout(() => setPhase('button'), 800);
  };

  const handleBeginClick = async () => {
    try {
      await completeScreen(currentScreen);
      await nextScreen();
    } catch (error) {
      console.error('Error progressing to next screen:', error);
      router.push('/onboarding');
    }
  };

  return (
    <Box 
      sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Network */}
      <Box
        data-testid="network-background"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(33, 150, 243, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(33, 203, 243, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(25, 118, 210, 0.1) 0%, transparent 50%)
          `,
          animation: phase === 'cards' ? 'network-pulse 8s ease-in-out infinite' : 'none',
          animationDelay: '1s',
          animationFillMode: 'forwards',
          
          '@keyframes network-pulse': {
            '0%, 100%': { opacity: 0.1 },
            '50%': { opacity: 0.3 }
          }
        }}
      />

      {/* Main Content Container */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          zIndex: 2,
          maxWidth: { xs: '90vw', sm: '80vw', md: '60vw', lg: '900px' },
          width: 'auto',
          position: 'relative',
          // Float animation
          transform: phase === 'tagline' || phase === 'button' ? 'translateY(-100px)' : 'translateY(0)',
          transition: 'transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {/* Brand Name with Typewriter Effect */}
        {phase === 'typewriter' && (
          <Box sx={{ mb: 4 }}>
            <TypewriterText
              text="Cultivate HQ"
              delay={0}
              speed={100}
              onComplete={handleTypewriterComplete}
            />
          </Box>
        )}

        {/* Floating up brand name after typewriter */}
        {(phase === 'tagline' || phase === 'button') && (
          <Typography
            variant={isMobile ? "h3" : "h2"}
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 50%, #1976D2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              lineHeight: 1.1,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              mb: 4,
              opacity: 1,
              animation: 'brand-float-up 1s ease-out forwards'
            }}
          >
            Cultivate HQ
          </Typography>
        )}

        {/* Animated Cards */}
        {showCards && (
          <Box sx={{ position: 'relative', height: '200px', mb: 4 }}>
            <AnimatedCard
              key={currentCardIndex}
              title={cards[currentCardIndex]}
              onExit={handleCardExit}
            />
          </Box>
        )}

        {/* Tagline - Appears after cards */}
        {phase === 'tagline' && (
          <Typography
            variant="h3"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              lineHeight: 1.3,
              color: theme.palette.text.primary,
              mb: 6,
              opacity: 0,
              transform: 'translateY(20px)',
              animation: 'tagline-appear 1s ease-out 500ms forwards'
            }}
            onAnimationEnd={handleTaglineComplete}
          >
            Where strategic minds cultivate extraordinary outcomes
          </Typography>
        )}

        {/* Final tagline (visible with button) */}
        {phase === 'button' && (
          <Typography
            variant="h3"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              lineHeight: 1.3,
              color: theme.palette.text.primary,
              mb: 6,
            }}
          >
            Where strategic minds cultivate extraordinary outcomes
          </Typography>
        )}

        {/* CTA Button - Final element */}
        {phase === 'button' && (
          <Button
            variant="contained"
            size="large"
            onClick={handleBeginClick}
            sx={{
              fontSize: '1.1rem',
              fontWeight: 600,
              py: 2,
              px: 4,
              borderRadius: '50px',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1976D2 0%, #1976D2 100%)',
                transform: 'translateY(-2px)',
              },
              boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
              opacity: 0,
              transform: 'translateY(20px)',
              animation: 'button-appear 1s ease-out 300ms forwards'
            }}
          >
            Begin your transformation
          </Button>
        )}
      </Box>

      {/* Global CSS Animations */}
      <style jsx>{`
        @keyframes brand-float-up {
          from { 
            opacity: 1; 
            transform: translateY(0); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes tagline-appear {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes button-appear {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            transition-delay: 0ms !important;
          }
        }
      `}</style>
    </Box>
  );
};