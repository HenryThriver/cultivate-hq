import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Alert, Chip, Divider } from '@mui/material';
import { useNextConnection } from '@/lib/hooks/useNextConnection';
import { useUpcomingMeeting } from '@/lib/hooks/useUpcomingMeeting';
import { Event as EventIcon, LocationOn as LocationIcon, Notes as NotesIcon } from '@mui/icons-material';
import type { ConnectionAgendaItem } from '@/types'; // Assuming ConnectionAgendaItem is the type for items in ConnectionAgenda

interface NextConnectionProps {
  contactId: string;
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Date TBD';
  try {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'Invalid Date';
  }
};

const agendaItemStyles = {
  celebrate: { icon: '🎉', color: '#34d399', textColor: '#047857' },
  open_thread: { icon: '🔗', color: '#fbbf24', textColor: '#b45309' },
  new_thread: { icon: '💡', color: '#60a5fa', textColor: '#1d4ed8' },
};

export const NextConnection: React.FC<NextConnectionProps> = ({ contactId }) => {
  const { 
    nextConnection,
    isLoading: isLoadingLegacy,
    error: errorLegacy,
    // scheduleConnection, // Available for future actions
    // updateAgenda,       // Available for future actions
    // markCompleted       // Available for future actions
  } = useNextConnection(contactId);
  
  // Use the new hook for upcoming meetings from artifacts
  const { 
    upcomingMeeting, 
    isLoading: isLoadingMeeting, 
    error: errorMeeting 
  } = useUpcomingMeeting(contactId);
  
  // Prefer upcoming meeting data over legacy next connection data
  const isLoading = isLoadingMeeting || isLoadingLegacy;
  const error = errorMeeting || errorLegacy;

  if (isLoading) {
    return (
      <Paper elevation={0} sx={{ p: 2, mb: 2, textAlign: 'center', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)', backgroundColor: '#fafafa' }}>
        <CircularProgress size={24} />
        <Typography variant="subtitle1" color="text.secondary" sx={{ml: 1, display: 'inline-block'}}>Loading next connection...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)', backgroundColor: '#fff2f2' }}>
        <Alert severity="warning">Could not load next connection: {error.message}</Alert>
      </Paper>
    );
  }

  if (!upcomingMeeting && (!nextConnection || nextConnection.status === 'completed' || nextConnection.status === 'cancelled')) {
    // No upcoming meetings or connections
    return (
      <Paper 
        elevation={0}
        sx={{
          p: 2, 
          mb: 2, 
          textAlign: 'center',
          borderRadius: '0.75rem', 
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)',
          backgroundColor: '#fafafa', 
        }}
      >
        <Typography variant="subtitle1" color="text.secondary">No upcoming connection scheduled.</Typography>
        {/* TODO: Add a button to schedule one */}
      </Paper>
    );
  }
  
  // Use upcoming meeting data if available, otherwise fall back to legacy connection data
  if (upcomingMeeting) {
    const { meeting, agenda } = upcomingMeeting;
    const meetingDate = new Date(meeting.timestamp);
    
    return (
      <Paper 
        elevation={0}
        sx={{
          p: {xs: 2, md: 3},
          mb: 2, 
          background: 'linear-gradient(135deg, #f8faff 0%, #ffffff 100%)',
          border: '1px solid',
          borderColor: 'rgba(99, 102, 241, 0.1)',
          borderRadius: 3,
          boxShadow: 'var(--shadow-card)',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: 'var(--shadow-card-hover)',
            transform: 'translateY(-1px)',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <EventIcon sx={{ color: '#6366f1' }} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: '#3730a3', fontSize: '1.1rem' }}>
            {(meeting.metadata as any)?.title || 'Meeting'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon sx={{ fontSize: 18, color: '#4338ca' }} />
            <Typography variant="body1" sx={{ color: '#4338ca', fontWeight: 500 }}>
              {formatDate(meetingDate.toISOString())}
            </Typography>
          </Box>
          {(meeting.metadata as any)?.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon sx={{ fontSize: 18, color: '#4338ca' }} />
              <Typography variant="body1" sx={{ color: '#4338ca' }}>
                {(meeting.metadata as any).location}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Active POGs and Asks */}
        {(agenda.pogs.length > 0 || agenda.asks.length > 0) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#3730a3', mb: 2, fontSize: '1.1rem' }}>
              Active Exchanges to Discuss:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {agenda.pogs.map((pog) => (
                <Box key={pog.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label="POG" 
                    size="small" 
                    sx={{ 
                      backgroundColor: '#d1fae5', 
                      color: '#047857', 
                      fontWeight: 600,
                      fontSize: '0.7rem'
                    }} 
                  />
                  <Typography variant="body2" sx={{ color: '#374151' }}>
                    {pog.metadata?.description || pog.content}
                  </Typography>
                </Box>
              ))}
              {agenda.asks.map((ask) => (
                <Box key={ask.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label="ASK" 
                    size="small" 
                    sx={{ 
                      backgroundColor: '#fee2e2', 
                      color: '#b91c1c', 
                      fontWeight: 600,
                      fontSize: '0.7rem'
                    }} 
                  />
                  <Typography variant="body2" sx={{ color: '#374151' }}>
                    {ask.metadata?.request_description || ask.content}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Conversation Starters */}
        {agenda.conversationStarters.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#3730a3', mb: 2, fontSize: '1.1rem' }}>
              Suggested Conversation Topics:
            </Typography>
            <List dense disablePadding>
              {agenda.conversationStarters.map((starter, index) => (
                <ListItem key={index} disableGutters sx={{ pl: 0, display: 'list-item', listStyleType: 'disc', ml: 3 }}>
                  <ListItemText 
                    primary={starter} 
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: '#4338ca'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Recent Topics */}
        {agenda.recentTopics.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#3730a3', mb: 1, fontSize: '1.1rem' }}>
              Recent Discussion Topics:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {agenda.recentTopics.map((topic, index) => (
                <Chip 
                  key={index}
                  label={topic}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: '#6366f1',
                    color: '#4338ca'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    );
  }

  // Assuming nextConnection.agenda is of type ConnectionAgenda which has an items array
  const agendaItems = nextConnection.agenda?.items;

  return (
    <Paper 
      elevation={0}
      sx={{
        p: {xs: 2, md: 3},
        mb: 2, 
        background: 'linear-gradient(135deg, #f8faff 0%, #ffffff 100%)',
        border: '1px solid',
        borderColor: 'rgba(99, 102, 241, 0.1)',
        borderRadius: 3,
        boxShadow: 'var(--shadow-card)',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: 'var(--shadow-card-hover)',
          transform: 'translateY(-1px)',
        }
      }}
    >
      <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: '#3730a3', mb: 1.5, fontSize: '1.1rem' }}>
        {nextConnection.connection_type || 'Catch-up'} {/* Use connection_type or a default */}
      </Typography>
      <Typography variant="body1" sx={{ color: '#4338ca', fontWeight: 500, mb: 0.5 }}>
        <strong>When:</strong> {formatDate(nextConnection.scheduled_date)}
      </Typography>
      <Typography variant="body1" sx={{ color: '#4338ca', mb: {xs: 2, md: 3} }}>
        <strong>Where:</strong> {nextConnection.location || 'Location TBD'} {/* Add platform if available and needed */}
      </Typography>

      {agendaItems && agendaItems.length > 0 && (
        <Box mt={{xs: 2, md: 3}}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: '#3730a3', mb: 2, fontSize: {xs: '1.1rem', md: '1.25rem'} }}>
            Quick Agenda & Talking Points:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 3 } }}>
            {[ 
              { title: 'Things to Celebrate', type: 'celebrate' as const, icon: agendaItemStyles.celebrate.icon, iconColor: agendaItemStyles.celebrate.color, textColor: agendaItemStyles.celebrate.textColor },
              { title: 'Open Threads', type: 'open_thread' as const, icon: agendaItemStyles.open_thread.icon, iconColor: agendaItemStyles.open_thread.color, textColor: agendaItemStyles.open_thread.textColor },
              { title: 'New Threads to Open', type: 'new_thread' as const, icon: agendaItemStyles.new_thread.icon, iconColor: agendaItemStyles.new_thread.color, textColor: agendaItemStyles.new_thread.textColor },
            ].map(category => {
              const itemsForCategory = agendaItems?.filter((item: ConnectionAgendaItem) => item.type === category.type);
              if (!itemsForCategory || itemsForCategory.length === 0) return null;

              return (
                <Box key={category.type} sx={{ flex: 1, minWidth: {xs: '100%', md: '0'} }}>
                  <Typography variant="subtitle1" component="h4" sx={{ fontWeight: 500, color: category.textColor, mb: 0.5, display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ fontSize: '1.3em', mr: 0.75, color: category.iconColor }}>{category.icon}</Box>
                    {category.title}:
                  </Typography>
                  <List dense disablePadding>
                    {itemsForCategory.map((item: ConnectionAgendaItem) => (
                      <ListItem key={item.id} disableGutters sx={{ pl: 0, alignItems: 'flex-start', display: 'list-item', listStyleType: 'disc', ml: 3}}>
                        <ListItemText 
                          primary={item.text} 
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: category.textColor, 
                            sx: { display: 'block', textDecoration: item.completed ? 'line-through' : 'none'} // Strikethrough if completed
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
      {/* TODO: Add buttons to update agenda or mark as completed using mutations */}
    </Paper>
  );
}; 