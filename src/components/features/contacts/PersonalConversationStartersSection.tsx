import React from 'react';
import { Box, Typography, List, ListItem } from '@mui/material';
import { Chat } from '@mui/icons-material';
import type { PersonalContext as PersonalContextType } from '@/types';
import { SourcedField } from '@/components/ui/SourceAttribution';

interface PersonalConversationStartersProps {
  personalContext: PersonalContextType | undefined;
  contactId: string;
}

export const PersonalConversationStartersSection: React.FC<PersonalConversationStartersProps> = ({ 
  personalContext, 
  contactId 
}) => {
  const conversationStarters = personalContext?.conversation_starters?.personal;
  
  if (!conversationStarters || conversationStarters.length === 0) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        background: '#FFFFFF',
        borderRadius: 3,
        border: '1px solid #E0E0E0',
        boxShadow: 'var(--shadow-card)',
        p: 3,
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: 'var(--shadow-card-hover)',
          transform: 'translateY(-1px)'
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
        Personal Topics
      </Typography>
      <List dense disablePadding>
        {conversationStarters.map((starter, index) => (
          <ListItem key={`personal-starter-${index}`} sx={{ pl: 0, py: 0.5 }}>
            <SourcedField 
              fieldPath={`personal_context.conversation_starters.personal.${index}`} 
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
                    color: '#059669', // Sage Green Main
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