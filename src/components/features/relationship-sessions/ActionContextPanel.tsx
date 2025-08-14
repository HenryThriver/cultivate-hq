'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LinkedIn as LinkedInIcon,
  CalendarToday as CalendarIcon,
  Note as NoteIcon,
  Mic as MicIcon,
  Groups as GroupsIcon,
  BusinessCenter as BusinessIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  EmojiEvents as AchievementIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

interface ContactInfo {
  id: string;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  location?: string;
  education?: string;
  profile_picture?: string;
  professional_context?: {
    expertise?: string[];
    achievements?: string[];
    current_projects?: string[];
  };
  personal_context?: {
    interests?: string[];
    family?: string;
    milestones?: string[];
  };
}

interface Interaction {
  id: string;
  type: 'meeting' | 'email' | 'voice_memo' | 'linkedin' | 'note';
  date: string;
  title: string;
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

interface ActionContextPanelProps {
  contact?: ContactInfo;
  recentInteractions?: Interaction[];
  goalContext?: {
    title: string;
    progress: number;
    totalContacts: number;
    targetContacts: number;
  };
  artifactContext?: {
    type: string;
    content: any;
    createdAt: string;
  };
}

export const ActionContextPanel: React.FC<ActionContextPanelProps> = ({
  contact,
  recentInteractions = [],
  goalContext,
  artifactContext,
}) => {
  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <CalendarIcon />;
      case 'email':
        return <EmailIcon />;
      case 'voice_memo':
        return <MicIcon />;
      case 'linkedin':
        return <LinkedInIcon />;
      case 'note':
        return <NoteIcon />;
      default:
        return <DotIcon />;
    }
  };

  const getInteractionColor = (type: string): 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    switch (type) {
      case 'meeting':
        return 'primary';
      case 'email':
        return 'secondary';
      case 'voice_memo':
        return 'info';
      case 'linkedin':
        return 'primary';
      case 'note':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      {/* Contact Information Section */}
      {contact && (
        <Box mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Contact Information
          </Typography>
          
          <Box display="flex" gap={3} mb={2}>
            <Avatar
              src={contact.profile_picture}
              sx={{ width: 80, height: 80 }}
            >
              {contact.name.charAt(0)}
            </Avatar>
            
            <Box flex={1}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {contact.name}
              </Typography>
              {contact.title && (
                <Typography variant="body1" color="text.secondary">
                  {contact.title}
                </Typography>
              )}
              {contact.company && (
                <Typography variant="body2" color="text.secondary">
                  <BusinessIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  {contact.company}
                </Typography>
              )}
              {contact.location && (
                <Typography variant="body2" color="text.secondary">
                  <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  {contact.location}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Quick Actions */}
          <Box display="flex" gap={1} mb={2}>
            {contact.email && (
              <Tooltip title={contact.email}>
                <IconButton
                  size="small"
                  onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                  sx={{ bgcolor: 'grey.100' }}
                >
                  <EmailIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {contact.phone && (
              <Tooltip title={contact.phone}>
                <IconButton
                  size="small"
                  onClick={() => window.open(`tel:${contact.phone}`, '_blank')}
                  sx={{ bgcolor: 'grey.100' }}
                >
                  <PhoneIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {contact.linkedin_url && (
              <Tooltip title="LinkedIn Profile">
                <IconButton
                  size="small"
                  onClick={() => window.open(contact.linkedin_url, '_blank')}
                  sx={{ bgcolor: 'grey.100' }}
                >
                  <LinkedInIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Professional Context */}
          {contact.professional_context && (
            <Box mb={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Professional Context
              </Typography>
              
              {contact.professional_context.expertise && contact.professional_context.expertise.length > 0 && (
                <Box mb={1}>
                  <Typography variant="caption" color="text.secondary">
                    Expertise:
                  </Typography>
                  <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                    {contact.professional_context.expertise.map((skill, index) => (
                      <Chip key={index} label={skill} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}

              {contact.professional_context.achievements && contact.professional_context.achievements.length > 0 && (
                <Box mb={1}>
                  <Typography variant="caption" color="text.secondary">
                    Recent Achievements:
                  </Typography>
                  <List dense>
                    {contact.professional_context.achievements.slice(0, 3).map((achievement, index) => (
                      <ListItem key={index} sx={{ pl: 0 }}>
                        <ListItemAvatar sx={{ minWidth: 30 }}>
                          <AchievementIcon fontSize="small" color="warning" />
                        </ListItemAvatar>
                        <ListItemText
                          primary={achievement}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}

          {/* Personal Context */}
          {contact.personal_context && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Personal Context
              </Typography>
              
              {contact.personal_context.interests && contact.personal_context.interests.length > 0 && (
                <Box mb={1}>
                  <Typography variant="caption" color="text.secondary">
                    Interests:
                  </Typography>
                  <Typography variant="body2">
                    {contact.personal_context.interests.join(', ')}
                  </Typography>
                </Box>
              )}

              {contact.personal_context.family && (
                <Box mb={1}>
                  <Typography variant="caption" color="text.secondary">
                    Family:
                  </Typography>
                  <Typography variant="body2">
                    {contact.personal_context.family}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Recent Interactions Timeline */}
      {recentInteractions.length > 0 && (
        <Box mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Recent Interactions
          </Typography>
          
          <Timeline position="right" sx={{ p: 0 }}>
            {recentInteractions.slice(0, 5).map((interaction, index) => (
              <TimelineItem key={interaction.id}>
                <TimelineOppositeContent
                  sx={{ m: 'auto 0', flex: 0.3 }}
                  align="right"
                  variant="body2"
                  color="text.secondary"
                >
                  {formatDistanceToNow(new Date(interaction.date), { addSuffix: true })}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineConnector sx={{ bgcolor: 'grey.300' }} />
                  <TimelineDot color={getInteractionColor(interaction.type)}>
                    {getInteractionIcon(interaction.type)}
                  </TimelineDot>
                  <TimelineConnector sx={{ bgcolor: 'grey.300' }} />
                </TimelineSeparator>
                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  <Typography variant="subtitle2" component="span">
                    {interaction.title}
                  </Typography>
                  {interaction.summary && (
                    <Typography variant="body2" color="text.secondary">
                      {interaction.summary}
                    </Typography>
                  )}
                  {interaction.sentiment && (
                    <Chip
                      label={interaction.sentiment}
                      size="small"
                      color={
                        interaction.sentiment === 'positive' ? 'success' :
                        interaction.sentiment === 'negative' ? 'error' :
                        'default'
                      }
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Box>
      )}

      {/* Goal Context */}
      {goalContext && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Goal Progress
          </Typography>
          
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'primary.200',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              {goalContext.title}
            </Typography>
            
            <Box display="flex" alignItems="center" gap={2}>
              <GroupsIcon color="primary" />
              <Box flex={1}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">
                    Contacts: {goalContext.totalContacts} / {goalContext.targetContacts}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    {Math.round(goalContext.progress)}%
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 8,
                    bgcolor: 'grey.200',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${goalContext.progress}%`,
                      bgcolor: 'primary.main',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
};