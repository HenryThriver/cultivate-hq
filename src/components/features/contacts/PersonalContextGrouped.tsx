import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip, Divider } from '@mui/material';
import { FamilyRestroom, EmojiEmotions, Home, Flight, School, EmojiEvents, Chat } from '@mui/icons-material';
import type { PersonalContext as PersonalContextType } from '@/types';
import { SourcedField } from '@/components/ui/SourceAttribution';

interface PersonalContextProps {
  personalContext: PersonalContextType | undefined;
  contactId: string;
}

export const PersonalContextGrouped: React.FC<PersonalContextProps> = ({ personalContext, contactId }) => {
  if (!personalContext) {
    return null;
  }

  const { 
    // Core Identity
    family, 
    values, 
    education,
    key_life_events,
    
    // Current Life
    living_situation,
    current_challenges,
    upcoming_changes,
    
    // Interests & Lifestyle
    interests, 
    hobbies,
    travel_plans,
    motivations,
    
    // Memories & Stories
    milestones, 
    anecdotes, 
    
    // Relationship
    communication_style, 
    relationship_goal,
    
    // Conversation starters
    conversation_starters,
  } = personalContext;

  // Helper function to render array fields as lists
  const renderListItems = (items: string[] | undefined, fieldPathPrefix: string) => {
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    return (
      <List dense disablePadding>
        {items.map((item: string, index: number) => (
          <ListItem key={index} sx={{ pl: 1, py: 0.25 }}>
            <SourcedField fieldPath={`${fieldPathPrefix}.${index}`} contactId={contactId} showIndicator={false} compact={true}>
              <ListItemText 
                primary={item} 
                primaryTypographyProps={{ 
                  variant: 'body2',
                  sx: { 
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  } 
                }} 
              />
            </SourcedField>
          </ListItem>
        ))}
      </List>
    );
  };

  // Helper function to render chips
  const renderChips = (items: string[] | undefined, fieldPathPrefix: string) => {
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
        {items.map((item: string, index: number) => (
          <SourcedField key={`chip-${index}`} fieldPath={`${fieldPathPrefix}.${index}`} contactId={contactId} showIndicator={false} compact={true}>
            <Chip label={item} size="small" />
          </SourcedField>
        ))}
      </Box>
    );
  };

  // Check if sections have content
  const hasFamilyContent = family && (family.partner || (family.children && family.children.length > 0) || family.parents || family.siblings);
  const hasLifestyleContent = (interests && interests.length > 0) || (hobbies && hobbies.length > 0) || 
                              (travel_plans && travel_plans.length > 0) || (motivations && motivations.length > 0);
  const hasLifeContent = living_situation || (current_challenges && current_challenges.length > 0) || 
                        (upcoming_changes && upcoming_changes.length > 0) || (key_life_events && key_life_events.length > 0);
  const hasPersonalStarters = conversation_starters?.personal && conversation_starters.personal.length > 0;

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
      {/* FAMILY - Most important personal info */}
      {hasFamilyContent && (
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h6"
            component="h3"
            sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 2,
              fontSize: '1.1rem'
            }}
          >
            <FamilyRestroom sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
            Family
          </Typography>
          
          {/* Partner */}
          {family.partner && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>Partner:</Typography>
              <SourcedField fieldPath="personal_context.family.partner.name" contactId={contactId} showIndicator={true}>
                <Typography variant="body2">
                  {family.partner.name}
                  {family.partner.details && ` (${family.partner.details})`}
                </Typography>
              </SourcedField>
            </Box>
          )}

          {/* Children */}
          {family.children && family.children.length > 0 && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>Children:</Typography>
              <List dense disablePadding>
                {family.children.map((child, index) => (
                  <ListItem key={index} sx={{ pl: 0, py: 0.25 }}>
                    <SourcedField fieldPath={`personal_context.family.children.${index}.name`} contactId={contactId} showIndicator={false} compact={true}>
                      <ListItemText 
                        primary={`${child.name || 'Child'}${child.relationship ? ` (${child.relationship})` : ''}${child.details ? ` - ${child.details}` : ''}`}
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          sx: { fontSize: '0.9rem' }
                        }}
                      />
                    </SourcedField>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      )}

      {/* INTERESTS & LIFESTYLE */}
      {hasLifestyleContent && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h6"
              component="h3"
              sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 2,
                fontSize: '1.1rem'
              }}
            >
              <EmojiEmotions sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
              Interests & Lifestyle
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {/* Interests */}
              {interests && interests.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>Interests</Typography>
                  {renderChips(interests, 'personal_context.interests')}
                </Box>
              )}

              {/* Hobbies */}
              {hobbies && hobbies.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>Hobbies</Typography>
                  {renderChips(hobbies, 'personal_context.hobbies')}
                </Box>
              )}

              {/* Travel Plans */}
              {travel_plans && travel_plans.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    <Flight sx={{ fontSize: '1rem', verticalAlign: 'middle', mr: 0.5 }} />
                    Travel Plans
                  </Typography>
                  {renderListItems(travel_plans, 'personal_context.travel_plans')}
                </Box>
              )}

              {/* Motivations */}
              {motivations && motivations.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>What Drives Them</Typography>
                  {renderListItems(motivations, 'personal_context.motivations')}
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}

      {/* LIFE SITUATION & KEY EVENTS */}
      {hasLifeContent && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h6"
              component="h3"
              sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 2,
                fontSize: '1.1rem'
              }}
            >
              <Home sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
              Life Situation
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {/* Living Situation */}
              {living_situation && (
                <Box>
                  <SourcedField fieldPath="personal_context.living_situation" contactId={contactId} showIndicator={true}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>Living Situation</Typography>
                    <Typography variant="body2">{living_situation}</Typography>
                  </SourcedField>
                </Box>
              )}

              {/* Key Life Events (condensed) */}
              {key_life_events && key_life_events.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    <EmojiEvents sx={{ fontSize: '1rem', verticalAlign: 'middle', mr: 0.5 }} />
                    Key Life Events
                  </Typography>
                  {renderListItems(key_life_events.slice(0, 3), 'personal_context.key_life_events')}
                  {key_life_events.length > 3 && (
                    <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
                      +{key_life_events.length - 3} more events
                    </Typography>
                  )}
                </Box>
              )}

              {/* Current Challenges */}
              {current_challenges && current_challenges.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>Current Challenges</Typography>
                  {renderListItems(current_challenges, 'personal_context.current_challenges')}
                </Box>
              )}

              {/* Upcoming Changes */}
              {upcoming_changes && upcoming_changes.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>Upcoming Changes</Typography>
                  {renderListItems(upcoming_changes, 'personal_context.upcoming_changes')}
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}

      {/* CORE VALUES & EDUCATION - Condensed section */}
      {((values && values.length > 0) || education) && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h6"
              component="h3"
              sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 2,
                fontSize: '1.1rem'
              }}
            >
              <School sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
              Background
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {/* Core Values */}
              {values && values.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>Core Values</Typography>
                  {renderChips(values, 'personal_context.values')}
                </Box>
              )}

              {/* Education */}
              {education && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>Education</Typography>
                  {typeof education === 'string' ? (
                    <SourcedField fieldPath="personal_context.education" contactId={contactId} showIndicator={true}>
                      <Typography variant="body2">{education}</Typography>
                    </SourcedField>
                  ) : Array.isArray(education) && education.length > 0 ? (
                    renderListItems(education, 'personal_context.education')
                  ) : null}
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}

      {/* PERSONAL CONVERSATION STARTERS - Integrated at bottom */}
      {hasPersonalStarters && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box>
            <Typography 
              variant="h6"
              component="h3"
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
              {conversation_starters.personal?.map((starter, index) => (
                <ListItem key={`personal-starter-${index}`} sx={{ pl: 0, py: 0.5 }}>
                  <SourcedField 
                    fieldPath={`personal_context.conversation_starters.personal.${index}`} 
                    contactId={contactId} 
                    showIndicator={false} 
                    compact={true}
                  >
                    <Typography
                      variant="body2"
                      sx={{ 
                        fontSize: '0.9rem',
                        lineHeight: '1.4',
                        color: '#616161',
                        pl: 2,
                        position: 'relative',
                        '&::before': {
                          content: '"•"',
                          position: 'absolute',
                          left: 0,
                          color: '#2196F3',
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
        </>
      )}
    </Box>
  );
};