import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip, Divider } from '@mui/material';
import { History, TrendingUp, RocketLaunch, Chat } from '@mui/icons-material';
import type { ProfessionalContext as ProfessionalContextType, PersonalContext as PersonalContextType } from '@/types';
import { SourcedField } from '@/components/ui/SourceAttribution';

interface ProfessionalContextProps {
  professionalContext: ProfessionalContextType | undefined;
  personalContext: PersonalContextType | undefined; // For conversation starters
  contactId: string;
}

export const ProfessionalContextThreeHorizons: React.FC<ProfessionalContextProps> = ({ professionalContext, personalContext, contactId }) => {
  if (!professionalContext) {
    return null;
  }

  const conversationStarters = personalContext?.conversation_starters?.professional;

  const { 
    // Past
    background, 
    achievements, 
    career_transitions,
    
    // Present
    current_role,
    current_company,
    current_role_description,
    key_responsibilities,
    team_details,
    current_ventures,
    projects_involved,
    work_challenges,
    skills,
    industry_knowledge,
    speaking_topics,
    
    // Future
    goals, 
    upcoming_projects,
    skill_development,
    networking_objectives,
    collaboration_opportunities,
    
    // Other
    mentions,
    opportunities_to_help,
    introduction_needs,
    resource_needs,
    pending_requests,
    collaborations,
  } = professionalContext;

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

  // Helper to check if any content exists in a section
  const hasCurrentContent = current_role || current_company || (key_responsibilities && key_responsibilities.length > 0) || 
                           (projects_involved && projects_involved.length > 0) || current_ventures || 
                           (skills && skills.length > 0) || (work_challenges && work_challenges.length > 0);

  const hasBackgroundContent = background?.focus_areas || (background?.previous_companies && background.previous_companies.length > 0) ||
                               (career_transitions && career_transitions.length > 0) || (achievements && achievements.length > 0) ||
                               (background?.expertise_areas && background.expertise_areas.length > 0);

  const hasFutureContent = (goals && goals.length > 0) || (upcoming_projects && upcoming_projects.length > 0) ||
                          (skill_development && skill_development.length > 0) || (networking_objectives && networking_objectives.length > 0);

  const hasOpportunityContent = (opportunities_to_help && opportunities_to_help.length > 0) ||
                               (introduction_needs && introduction_needs.length > 0) ||
                               (resource_needs && resource_needs.length > 0);

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
      {/* CURRENT FOCUS - Most prominent section */}
      {hasCurrentContent && (
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
            <TrendingUp sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
            Current Focus
          </Typography>
          
          {/* Current Role */}
          {(current_role || current_company) && (
            <Box mb={2}>
              <SourcedField fieldPath="professional_context.current_role" contactId={contactId} showIndicator={true}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {current_role} {current_company && `at ${current_company}`}
                </Typography>
              </SourcedField>
              {current_role_description && (
                <SourcedField fieldPath="professional_context.current_role_description" contactId={contactId} showIndicator={false}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {current_role_description}
                  </Typography>
                </SourcedField>
              )}
            </Box>
          )}

          {/* Current Content in compact layout */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {/* Key Responsibilities */}
            {key_responsibilities && key_responsibilities.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>
                  Key Responsibilities
                </Typography>
                {renderListItems(key_responsibilities, 'professional_context.key_responsibilities')}
              </Box>
            )}

            {/* Current Projects */}
            {projects_involved && projects_involved.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>
                  Current Projects
                </Typography>
                {renderListItems(projects_involved, 'professional_context.projects_involved')}
              </Box>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>
                  Core Skills
                </Typography>
                {renderChips(skills, 'professional_context.skills')}
              </Box>
            )}

            {/* Current Challenges */}
            {work_challenges && work_challenges.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>
                  Current Challenges
                </Typography>
                {renderListItems(work_challenges, 'professional_context.work_challenges')}
              </Box>
            )}
          </Box>

          {/* Current Ventures (full width if exists) */}
          {current_ventures && (
            <Box mt={2}>
              <SourcedField fieldPath="professional_context.current_ventures" contactId={contactId} showIndicator={true}>
                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>Ventures</Typography>
                <Typography variant="body2">{current_ventures}</Typography>
              </SourcedField>
            </Box>
          )}
        </Box>
      )}

      {/* BACKGROUND - Condensed section */}
      {hasBackgroundContent && (
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
              <History sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
              Experience & Background
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {/* Background Focus */}
              {background?.focus_areas && (
                <Box>
                  <SourcedField fieldPath="professional_context.background.focus_areas" contactId={contactId} showIndicator={true}>
                    <Typography variant="body2">{background.focus_areas}</Typography>
                  </SourcedField>
                </Box>
              )}

              {/* Previous Companies */}
              {background?.previous_companies && background.previous_companies.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Previous Companies
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {background.previous_companies.map((company, index) => (
                      <SourcedField key={`prev-comp-${index}`} fieldPath={`professional_context.background.previous_companies.${index}`} contactId={contactId} showIndicator={false} compact={true}>
                        <Chip label={company} size="small" variant="outlined" />
                      </SourcedField>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Expertise Areas */}
              {background?.expertise_areas && background.expertise_areas.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Areas of Expertise
                  </Typography>
                  {renderChips(background.expertise_areas, 'professional_context.background.expertise_areas')}
                </Box>
              )}

              {/* Key Achievements (condensed) */}
              {achievements && achievements.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Key Achievements
                  </Typography>
                  <List dense disablePadding>
                    {achievements.slice(0, 3).map((ach, index) => (
                      <ListItem key={index} sx={{ pl: 1, py: 0.25 }}>
                        <SourcedField fieldPath={`professional_context.achievements.${index}.event`} contactId={contactId} showIndicator={false} compact={true}>
                          <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                            {ach.event}
                            {ach.date && (
                              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                ({ach.date})
                              </Typography>
                            )}
                          </Typography>
                        </SourcedField>
                      </ListItem>
                    ))}
                    {achievements.length > 3 && (
                      <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
                        +{achievements.length - 3} more achievements
                      </Typography>
                    )}
                  </List>
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}

      {/* FUTURE VISION - Condensed section */}
      {hasFutureContent && (
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
              <RocketLaunch sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
              Future Vision
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {/* Goals */}
              {goals && goals.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Professional Goals
                  </Typography>
                  {renderListItems(goals, 'professional_context.goals')}
                </Box>
              )}

              {/* Networking Objectives */}
              {networking_objectives && networking_objectives.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Networking Goals
                  </Typography>
                  {renderListItems(networking_objectives, 'professional_context.networking_objectives')}
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}

      {/* CONVERSATION STARTERS - Integrated at bottom */}
      {conversationStarters && conversationStarters.length > 0 && (
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