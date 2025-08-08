import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Person, Work } from '@mui/icons-material';

// Import the new comprehensive display components
import { PersonalContextGrouped } from './PersonalContextGrouped';
import { ProfessionalContextThreeHorizons } from './ProfessionalContextThreeHorizons';


// Import the new comprehensive Contact type
import type { Contact, ProfessionalContext as ProfessionalContextTypeAlias, PersonalContext as PersonalContextTypeAlias } from '@/types';

interface ContextSectionsProps {
  contactData: Contact | null; // Use the new Contact type, allow null for loading states
  contactId: string; // Added contactId
}

export const ContextSections: React.FC<ContextSectionsProps> = ({ contactData, contactId }) => {
  if (!contactData) {
    return null; 
  }

  // contactData.professional_context is Json | null | undefined
  const professionalContextProp = contactData.professional_context 
    ? contactData.professional_context as ProfessionalContextTypeAlias 
    : undefined;
  
  // contactData.personal_context is Json | null | undefined  
  const personalContextProp = contactData.personal_context 
    ? contactData.personal_context as PersonalContextTypeAlias 
    : undefined;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, mt: 4 }}>
      {/* Contact Intelligence Header - Following Design System */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography 
          variant="h2"
          component="div" 
          sx={{ 
            fontWeight: 600, // Semibold per design system
            color: '#212121', // Neutral 900 for headings
            mb: 2,
            letterSpacing: '-0.025em',
            fontSize: { xs: '1.75rem', md: '2rem' } // Responsive scale
          }}
        >
          Relationship Intelligence
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#616161', // Neutral 700 for primary text
            fontSize: '1.0625rem', // 17px body text per design system
            lineHeight: '1.5625rem', // 25px line height
            maxWidth: '640px',
            mx: 'auto'
          }}
        >
          Strategic insights that transform connections into meaningful relationships
        </Typography>
      </Box>

      {/* Two-column Professional/Personal Context Layout */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Professional Context - Left Column */}
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h5"
            sx={{ 
              fontWeight: 600,
              color: 'primary.main',
              mb: 2, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5
            }}
          >
            <Work sx={{ fontSize: '1.2rem' }} />
            Professional Journey
          </Typography>
          <ProfessionalContextThreeHorizons 
            professionalContext={professionalContextProp} 
            personalContext={personalContextProp}
            contactId={contactId} 
          />
        </Box>
        
        {/* Personal Context - Right Column */}
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h5"
            sx={{ 
              fontWeight: 600,
              color: 'primary.main',
              mb: 2, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5
            }}
          >
            <Person sx={{ fontSize: '1.2rem' }} />
            Personal Insights
          </Typography>
          <PersonalContextGrouped 
            personalContext={personalContextProp} 
            contactId={contactId} 
          />
        </Box>
      </Box>
    </Box>
  );
}; 