import React from 'react';
import { Box, Typography, List, ListItem } from '@mui/material';
import { Chat } from '@mui/icons-material';
import type { PersonalContext as PersonalContextType } from '@/types';
import { SourcedField } from '@/components/ui/SourceAttribution';

interface ProfessionalConversationStartersProps {
  personalContext: PersonalContextType | undefined; // Note: professional starters are currently in personal_context
  contactId: string;
}

export const ProfessionalConversationStartersSection: React.FC<ProfessionalConversationStartersProps> = ({ 
  personalContext, 
  contactId 
}) => {
  const conversationStarters = personalContext?.conversation_starters?.professional;
  
  if (!conversationStarters || conversationStarters.length === 0) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        mb: 3,
        p: 3,
        background: '#E3F2FD', // Primary Blue 50 - subtle background
        borderRadius: '12px', // Standard card border radius
        border: '1px solid #BBDEFB', // Primary Blue 100 - soft border
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '3px',
          background: '#2196F3', // Primary Blue 500
          borderRadius: '12px 0 0 12px',
        }
      }}
    >
      <Typography 
        variant="h6"
        component="h3"
        gutterBottom 
        sx={{ 
          fontWeight: 600,
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          color: 'text.primary',
          mb: 2,
          fontSize: '1.1rem'
        }}
      >
        <Chat sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
        Professional Topics
      </Typography>
      <List dense disablePadding>
        {conversationStarters.map((starter, index) => (
          <ListItem key={`professional-starter-${index}`} sx={{ pl: 0, py: 0.5 }}>
            <SourcedField 
              fieldPath={`personal_context.conversation_starters.professional.${index}`} 
              contactId={contactId} 
              showIndicator={false} 
              compact={true}
            >
              <Typography
                variant="body1"
                sx={{ 
                  fontSize: '1.0625rem', // 17px body text per design system
                  lineHeight: '1.5625rem', // 25px line height
                  color: '#616161', // Neutral 700 for primary text
                  pl: 2,
                  position: 'relative',
                  '&::before': {
                    content: '"•"',
                    position: 'absolute',
                    left: 0,
                    color: '#2196F3', // Primary Blue 500
                    fontWeight: 600
                  }
                }}
              >
                {starter}
              </Typography>
            </SourcedField>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};