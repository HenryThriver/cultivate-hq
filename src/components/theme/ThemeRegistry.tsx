'use client';

import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Inter } from 'next/font/google';

// Load Inter font with all necessary weights
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

// Extend MUI theme with custom properties
declare module '@mui/material/styles' {
  interface Palette {
    sage: Palette['primary'];
    plum: Palette['primary'];
    amber: Palette['primary'];
    // Artifact-specific colors (distinct from personality colors)
    artifacts: {
      pog: Palette['primary'];
      ask: Palette['primary'];
      loop: Palette['primary'];
      meeting: Palette['primary'];
      communication: Palette['primary'];
      insight: Palette['primary'];
      action: Palette['primary'];
    };
  }
  
  interface PaletteOptions {
    sage?: PaletteOptions['primary'];
    plum?: PaletteOptions['primary'];
    amber?: PaletteOptions['primary'];
    // Artifact-specific colors (distinct from personality colors)
    artifacts?: {
      pog?: PaletteOptions['primary'];
      ask?: PaletteOptions['primary'];
      loop?: PaletteOptions['primary'];
      meeting?: PaletteOptions['primary'];
      communication?: PaletteOptions['primary'];
      insight?: PaletteOptions['primary'];
      action?: PaletteOptions['primary'];
    };
  }
  
  interface TypographyVariants {
    display: React.CSSProperties;
    pullQuote: React.CSSProperties;
    caption2: React.CSSProperties;
  }
  
  interface TypographyVariantsOptions {
    display?: React.CSSProperties;
    pullQuote?: React.CSSProperties;
    caption2?: React.CSSProperties;
  }
}

// Create sophisticated theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: '#90CAF9',
      main: '#2196F3',
      dark: '#1976D2',
      contrastText: '#fff',
    },
    secondary: {
      light: '#F3E8FF',
      main: '#7C3AED',
      dark: '#5B21B6',
      contrastText: '#fff',
    },
    sage: {
      light: '#ECFDF5',
      main: '#059669',
      dark: '#047857',
      contrastText: '#fff',
    },
    plum: {
      light: '#F3E8FF',
      main: '#7C3AED',
      dark: '#5B21B6',
      contrastText: '#fff',
    },
    amber: {
      light: '#FEF3C7',
      main: '#F59E0B',
      dark: '#D97706',
      contrastText: '#fff',
    },
    // Artifact-specific color palette (distinct from personality colors)
    artifacts: {
      pog: {
        light: '#D1FAE5',
        main: '#10B981', // Emerald - distinct from sage, clearly "giving"
        dark: '#059669',
        contrastText: '#fff',
      },
      ask: {
        light: '#FED7AA',
        main: '#F97316', // Coral - distinct from amber, clearly "requesting"
        dark: '#EA580C',
        contrastText: '#fff',
      },
      loop: {
        light: '#E0E7FF',
        main: '#6366F1', // Indigo - for active exchanges
        dark: '#4F46E5',
        contrastText: '#fff',
      },
      meeting: {
        light: '#E0F2FE',
        main: '#0EA5E9', // Sky Blue - for live interactions
        dark: '#0284C7',
        contrastText: '#fff',
      },
      communication: {
        light: '#F1F5F9',
        main: '#64748B', // Slate - for emails, messages
        dark: '#475569',
        contrastText: '#fff',
      },
      insight: {
        light: '#FDF4FF',
        main: '#A855F7', // Purple - for AI insights and intelligence
        dark: '#9333EA',
        contrastText: '#fff',
      },
      action: {
        light: '#EDE9FE',
        main: '#8B5CF6', // Violet - for actionable items
        dark: '#7C3AED',
        contrastText: '#fff',
      },
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#616161',
    },
  },
  typography: {
    fontFamily: `${inter.style.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
    // Mobile first sizes
    display: {
      fontSize: '3rem',
      lineHeight: 1.167,
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h1: {
      fontSize: '2rem',
      lineHeight: 1.25,
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.75rem',
      lineHeight: 1.286,
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      lineHeight: 1.333,
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.25rem',
      lineHeight: 1.4,
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.125rem',
      lineHeight: 1.333,
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      lineHeight: 1.5,
      fontWeight: 500,
    },
    body1: {
      fontSize: '1.0625rem', // 17px
      lineHeight: 1.47,
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '0.01em',
    },
    pullQuote: {
      fontSize: '2rem',
      lineHeight: 1.25,
      fontWeight: 500,
      fontStyle: 'italic',
      letterSpacing: '-0.01em',
      color: '#616161',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.333,
      letterSpacing: '0.02em',
    },
    caption2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      fontStyle: 'italic',
      color: '#9E9E9E',
    },
    button: {
      fontSize: '1.0625rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
      textTransform: 'none',
    },
  },
  spacing: 8, // 8px base unit
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 48,
          padding: '12px 24px',
          fontSize: '1.0625rem',
          fontWeight: 500,
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.02)',
          },
          '@media (min-width:768px)': {
            minHeight: 52,
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: 'rgba(33, 150, 243, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #E0E0E0',
          boxShadow: 'var(--shadow-card)',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: 'var(--shadow-card-hover)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            minHeight: 48,
            borderRadius: 8,
            fontSize: '1.0625rem',
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#2196F3',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
                boxShadow: '0 0 0 3px rgba(33, 150, 243, 0.1)',
              },
            },
            '@media (min-width:768px)': {
              minHeight: 52,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
          
          /* Premium spacing using golden ratio */
          --spacing-golden: 39px;
          --spacing-golden-mobile: 32px;
          
          /* Animation timing functions */
          --ease-confident: cubic-bezier(0.4, 0, 0.2, 1);
          --ease-entrance: cubic-bezier(0.0, 0, 0.2, 1);
          --ease-exit: cubic-bezier(0.4, 0, 0.6, 1);
          --ease-bounce: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          
          /* Artifact color system */
          --color-pog-light: #D1FAE5;
          --color-pog-main: #10B981;
          --color-pog-dark: #059669;
          --color-ask-light: #FED7AA;
          --color-ask-main: #F97316;
          --color-ask-dark: #EA580C;
          --color-loop-light: #E0E7FF;
          --color-loop-main: #6366F1;
          --color-loop-dark: #4F46E5;
          --color-meeting-light: #E0F2FE;
          --color-meeting-main: #0EA5E9;
          --color-meeting-dark: #0284C7;
          --color-communication-light: #F1F5F9;
          --color-communication-main: #64748B;
          --color-communication-dark: #475569;
          --color-insight-light: #FDF4FF;
          --color-insight-main: #A855F7;
          --color-insight-dark: #9333EA;
          
          /* Modern card shadows */
          --shadow-card: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07);
          --shadow-card-hover: 0 8px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
          --shadow-card-focus: 0 10px 40px -10px rgba(0,0,0,0.15), 0 4px 8px -4px rgba(0,0,0,0.1);
          
          /* Z-index scale */
          --z-dropdown: 1000;
          --z-sticky: 1100;
          --z-fixed: 1200;
          --z-modal-backdrop: 1300;
          --z-modal: 1400;
          --z-popover: 1500;
          --z-tooltip: 1600;
          --z-toast: 1700;
        }
        
        /* Premium text selection */
        ::selection {
          background-color: rgba(33, 150, 243, 0.2);
          color: #1976D2;
        }
        
        /* Sophisticated scrollbar */
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        
        ::-webkit-scrollbar-track {
          background: #F5F5F5;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #E0E0E0;
          border-radius: 6px;
          transition: background 200ms ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #BDBDBD;
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
      {children}
    </MuiThemeProvider>
  );
} 