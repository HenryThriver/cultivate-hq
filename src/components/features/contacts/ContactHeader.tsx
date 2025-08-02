import React from 'react';
import { Box, Typography, Paper, Avatar, Button, Stack, Chip, Tooltip } from '@mui/material';
import { Email, Mic, Edit } from '@mui/icons-material';
import { SuggestionBellBadge } from '../suggestions/UnifiedSuggestionManager';
import { InlineEditableField } from './profile/InlineEditableField';
import type { PersonalContext as PersonalContextType } from '@/types';

// RQ Bubble Colors (from your HTML example)
const rqBubbleColors: { [key: number]: { backgroundColor: string; color: string; } } = {
  0: { backgroundColor: '#9ca3af', color: 'white' },      // gray-400
  1: { backgroundColor: '#fecaca', color: '#7f1d1d' },      // red-200, red-800 text
  2: { backgroundColor: '#fca5a5', color: '#7f1d1d' },      // red-300, red-800 text
  3: { backgroundColor: '#f87171', color: 'white' },      // red-400
  4: { backgroundColor: '#fb923c', color: 'white' },      // orange-400
  5: { backgroundColor: '#f59e0b', color: 'white' },      // amber-500
  6: { backgroundColor: '#d97706', color: 'white' },      // amber-600
};

interface Goal {
  id: string;
  title: string;
  isActive: boolean;
}

// Enhanced props for redesigned contact header
interface ContactHeaderProps {
  name?: string | null;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  email?: string | null;
  profilePhotoUrl?: string | null;
  relationshipScore?: number | null;
  personalContext?: PersonalContextType | null;
  connectDate?: Date;
  connectCadence?: string | null;
  
  // Goal integration
  goals?: Goal[];
  onGoalClick?: (goalId: string) => void;
  
  // Suggestion notification props
  contactId?: string;
  suggestionPriority?: 'high' | 'medium' | 'low';
  
  // Enhanced action handlers
  onRecordVoiceMemo?: () => void; // Primary CTA
  onScheduleConnect?: () => void; // Context-based secondary
  
  // Inline editing
  onUpdateRelationshipScore?: (newScore: number) => Promise<void>;
  onUpdateCadence?: (newCadence: string) => Promise<void>;
}

export const ContactHeader: React.FC<ContactHeaderProps> = ({
  name,
  title,
  company,
  location,
  email,
  profilePhotoUrl,
  relationshipScore,
  personalContext,
  connectCadence,
  goals = [],
  onGoalClick,
  contactId,
  suggestionPriority = 'medium',
  onRecordVoiceMemo,
  onScheduleConnect,
  onUpdateRelationshipScore,
  onUpdateCadence,
}) => {

  const rqStyle = rqBubbleColors[relationshipScore ?? 0] || rqBubbleColors[0];

  const userGoal = personalContext?.relationship_goal;

  // Primary voice memo button styling
  const primaryButtonSx = {
    backgroundColor: '#3b82f6', // blue-500
    color: 'white',
    borderRadius: '0.5rem',
    padding: '0.75rem 1.5rem', // Larger for prominence
    fontSize: '0.875rem',
    fontWeight: 600, // Bolder
    textTransform: 'none',
    minWidth: '140px',
    '&:hover': {
      backgroundColor: '#2563eb', // blue-600
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
  };

  // Secondary action button styling
  const secondaryButtonSx = {
    backgroundColor: '#f3f4f6', // gray-100
    color: '#374151', // gray-700
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
    fontWeight: 500,
    textTransform: 'none',
    '&:hover': {
      backgroundColor: '#e5e7eb', // gray-200
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
  };

  return (
    <Paper 
      elevation={0} // Reference uses shadow from a class, we can fine-tune elevation or use sx shadow
      sx={{
        p: { xs: 2, md: 3 }, 
        mb: 2, 
        borderRadius: '0.75rem', // rounded-xl 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)', // Softer shadow-md
        backgroundColor: 'white', // Ensure card background is white against gray page
      }}
    >
      <Box sx={{
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        alignItems: {xs: 'flex-start', md: 'center'}, 
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 }, flexGrow: 1 }}>
          <Avatar 
            src={profilePhotoUrl || undefined} 
            alt={name || 'C'} 
            sx={{
              width: { xs: 80, md: 96 }, 
              height: { xs: 80, md: 96 }, 
              mr: 2,
              border: '2px solid',
              borderColor: rqStyle.backgroundColor // Use RQ color for border for effect
            }}
          >
            {name ? name.charAt(0).toUpperCase() : 'C'}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontSize: {xs: '1.75rem', md: '2rem'}, color: '#111827' /* gray-900 */ }}>
                {name || 'Unnamed Contact'}
              </Typography>
              
              {relationshipScore !== undefined && onUpdateRelationshipScore && (
                <InlineEditableField
                  value={relationshipScore}
                  fieldType="slider"
                  fieldKey="relationship_score"
                  min={0}
                  max={6}
                  step={1}
                  onSave={async (newValue) => await onUpdateRelationshipScore(newValue)}
                  displayVariant="body2"
                />
              )}
              
              {relationshipScore !== undefined && !onUpdateRelationshipScore && (
                <Chip 
                    label={`RQ${relationshipScore}`}
                    size="small"
                    sx={{
                        backgroundColor: rqStyle.backgroundColor,
                        color: rqStyle.color,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        minWidth: '50px',
                        borderRadius: '9999px',
                        height: 'auto',
                        padding: '0.3rem 0.75rem',
                    }}
                />
              )}
              
              {contactId && (
                <SuggestionBellBadge
                  contactId={contactId}
                  priority={suggestionPriority}
                />
              )}
            </Box>
            
            {/* Goal badges */}
            {goals.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {goals.map((goal) => (
                  <Chip
                    key={goal.id}
                    label={goal.title}
                    size="small"
                    clickable={!!onGoalClick}
                    onClick={() => onGoalClick?.(goal.id)}
                    sx={{
                      backgroundColor: goal.isActive ? '#d1fae5' : '#f3f4f6',
                      color: goal.isActive ? '#059669' : '#6b7280',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      '&:hover': onGoalClick ? {
                        backgroundColor: goal.isActive ? '#bbf7d0' : '#e5e7eb',
                      } : {},
                    }}
                  />
                ))}
              </Box>
            )}
            <Typography sx={{ color: '#4b5563' /* gray-600 */, fontSize: {xs: '0.875rem', md: '1rem'}, display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box component="span" className="emoji" sx={{ mr: 0.75, color: 'text.secondary'}}>💼</Box> 
              {title || 'No Title'} {company ? `at ${company}` : ''}
            </Typography>
            {location && (
              <Typography sx={{ color: '#6b7280' /* gray-500 */, fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                <Box component="span" className="emoji" sx={{ mr: 0.75, color: 'text.secondary'}}>📍</Box>
                {location}
              </Typography>
            )}
            {email && (
              <Typography sx={{ color: '#6b7280' /* gray-500 */, fontSize: '0.75rem', display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Email fontSize="small" sx={{ mr: 0.75, color: 'text.secondary'}} />
                {email}
              </Typography>
            )}
            {userGoal && (
                <Typography sx={{color: '#4f46e5' /* indigo-600 */, fontSize: '0.75rem', fontWeight: 'medium', mt: 0.75}}>
                    My Goal: {userGoal}
                </Typography>
            )}
            {connectCadence && onUpdateCadence && (
              <InlineEditableField
                value={connectCadence}
                fieldType="text"
                fieldKey="connection_cadence"
                label="Connection Cadence"
                placeholder="e.g., Every 6 weeks"
                onSave={async (newValue) => await onUpdateCadence(newValue)}
                displayVariant="caption"
                displayColor="#059669"
              />
            )}
            
            {connectCadence && !onUpdateCadence && (
              <Typography sx={{color: '#059669' /* green-600 */, fontSize: '0.75rem', fontWeight: 'medium', mt: 0.5, display: 'flex', alignItems: 'center'}}>
                <Box component="span" className="emoji" sx={{ mr: 0.75 }}>🟢</Box> {connectCadence}
              </Typography>
            )}
          </Box>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'column' }} spacing={1.5} sx={{ minWidth: {sm: '160px'}, width: {xs: '100%', sm: 'auto'} }}>
          {/* Primary CTA - Voice Memo */}
          <Button 
            sx={primaryButtonSx} 
            onClick={onRecordVoiceMemo} 
            aria-label="Record Voice Memo"
            startIcon={<Mic />}
          >
            Voice Memo
          </Button>
          
          {/* Secondary CTA - Context-based */}
          {onScheduleConnect && (
            <Button 
              sx={secondaryButtonSx} 
              onClick={onScheduleConnect} 
              aria-label="Schedule Connection"
            >
              📆 Schedule Connect
            </Button>
          )}
        </Stack>
      </Box>
    </Paper>
  );
}; 