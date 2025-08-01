'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper
} from '@mui/material';
import {
  Send as SendIcon,
  Inbox as InboxIcon,
  PriorityHigh as PriorityIcon,
} from '@mui/icons-material';
import { BaseArtifact, VoiceMemoArtifact, MeetingArtifact } from '@/types/artifact';
import { EmailArtifact } from '@/types/email';
import { getArtifactConfig } from '@/config/artifactConfig';

interface EnhancedTimelineItemProps {
  artifact: BaseArtifact<unknown>;
  position: 'left' | 'right';
  onClick: () => void;
}

export const EnhancedTimelineItem: React.FC<EnhancedTimelineItemProps> = ({
  artifact,
  position,
  onClick
}) => {
  // Email artifact handling - continue with standard timeline treatment

  const config = getArtifactConfig(artifact.type);
  const IconComponent = config.icon;

  // Email helper functions
  const getEmailDirection = (email: EmailArtifact): 'sent' | 'received' => {
    const labels = email.metadata?.labels || [];
    const fromEmail = email.metadata?.from?.email?.toLowerCase() || '';
    
    if (labels.includes('SENT')) return 'sent';
    if (labels.includes('INBOX')) return 'received';
    
    if (fromEmail.includes('hfinkelstein@gmail.com') || fromEmail.includes('henry@')) {
      return 'sent';
    }
    
    return 'received';
  };

  const getEmailImportance = (email: EmailArtifact): 'high' | 'normal' | 'low' => {
    const labels = email.metadata?.labels || [];
    
    if (labels.includes('IMPORTANT') || labels.includes('CATEGORY_PRIMARY')) {
      return 'high';
    }
    
    if (labels.includes('CATEGORY_PROMOTIONS') || labels.includes('CATEGORY_UPDATES')) {
      return 'low';
    }
    
    return 'normal';
  };

  // Get preview text - customized for different artifact types
  const previewText = (() => {
    if (artifact.type === 'email') {
      const emailArtifact = artifact as EmailArtifact;
      const subject = emailArtifact.metadata?.subject || 'No Subject';
      const fromName = emailArtifact.metadata?.from?.name || emailArtifact.metadata?.from?.email || 'Unknown Sender';
      const direction = getEmailDirection(emailArtifact);
      
      if (direction === 'sent') {
        return `To: ${emailArtifact.metadata?.to?.[0]?.name || emailArtifact.metadata?.to?.[0]?.email || 'Unknown'}\nSubject: ${subject}`;
      } else {
        return `From: ${fromName}\nSubject: ${subject}`;
      }
    }
    return config.getPreview(artifact.content);
  })();
  const timeString = new Date(artifact.created_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const getStatusChip = () => {
    if (artifact.type === 'email') {
      const emailArtifact = artifact as EmailArtifact;
      const direction = getEmailDirection(emailArtifact);
      const importance = getEmailImportance(emailArtifact);
      
      return (
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
          <Chip
            icon={direction === 'sent' ? <SendIcon style={{ fontSize: '12px' }} /> : <InboxIcon style={{ fontSize: '12px' }} />}
            label={direction === 'sent' ? 'Sent' : 'Received'}
            size="small"
            sx={{
              backgroundColor: direction === 'sent' ? '#e8f5e8' : '#e3f2fd',
              color: direction === 'sent' ? '#2e7d32' : '#1976d2',
              fontSize: '11px',
              height: '20px',
              fontWeight: 600
            }}
          />
          {importance === 'high' && (
            <Chip
              icon={<PriorityIcon style={{ fontSize: '12px' }} />}
              label="Important"
              size="small"
              sx={{
                backgroundColor: '#fff3e0',
                color: '#ef6c00',
                fontSize: '11px',
                height: '20px',
                fontWeight: 600
              }}
            />
          )}
        </Box>
      );
    }

    if (artifact.type === 'voice_memo') {
      const voiceMemoArtifact = artifact as VoiceMemoArtifact;
      const status = voiceMemoArtifact.transcription_status || 'processing';
      const statusConfig = {
        completed: { color: '#d4edda', textColor: '#155724', label: 'Transcribed' },
        processing: { color: '#fff3cd', textColor: '#856404', label: 'Processing' },
        pending: { color: '#f8d7da', textColor: '#721c24', label: 'Pending' },
        failed: { color: '#f8d7da', textColor: '#721c24', label: 'Failed' }
      };
      const statusStyle = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
      
      return (
        <Chip
          label={statusStyle.label}
          size="small"
          sx={{
            backgroundColor: statusStyle.color,
            color: statusStyle.textColor,
            fontSize: '11px',
            height: '20px',
            mb: 1,
            fontWeight: 600
          }}
        />
      );
    }

    if (artifact.type === 'meeting') {
      const meetingArtifact = artifact as MeetingArtifact;
      const status = meetingArtifact.ai_parsing_status || 'pending';
      const statusConfig = {
        completed: { color: '#d4edda', textColor: '#155724', label: 'AI Processed' },
        processing: { color: '#fff3cd', textColor: '#856404', label: 'AI Processing' },
        pending: { color: '#e2e3e5', textColor: '#495057', label: 'Pending AI' },
        failed: { color: '#f8d7da', textColor: '#721c24', label: 'AI Failed' }
      };
      const statusStyle = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
      
      return (
        <Chip
          label={statusStyle.label}
          size="small"
          sx={{
            backgroundColor: statusStyle.color,
            color: statusStyle.textColor,
            fontSize: '11px',
            height: '20px',
            mb: 1,
            fontWeight: 600
          }}
        />
      );
    }

    return null;
  };

  const getDurationInfo = () => {
    if (artifact.type === 'email') {
      const emailArtifact = artifact as EmailArtifact;
      if (emailArtifact.metadata?.has_attachments) {
        return 'Has Attachments';
      }
      return 'Email';
    }
    if (artifact.type === 'voice_memo') {
      const voiceMemoArtifact = artifact as VoiceMemoArtifact;
      if (voiceMemoArtifact.duration_seconds) {
        return `${voiceMemoArtifact.duration_seconds}s`;
      }
    }
    return 'Artifact';
  };

  // Convert config.color to hex if it's a theme color
  const getColorValue = (color: string): string => {
    const colorMap: Record<string, string> = {
      'primary.main': '#2196f3',
      'secondary.main': '#f50057',
      'success.main': '#4caf50',
      'info.main': '#2196f3',
      'warning.dark': '#f57c00',
      'error.main': '#f44336',
      'grey.700': '#616161',
      'info.light': '#81c784',
      'warning.light': '#ffb74d',
      'success.dark': '#388e3c',
      'grey.500': '#9e9e9e'
    };
    return colorMap[color] || color;
  };

  const colorValue = getColorValue(config.color);

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: { 
        xs: 'flex-start', // All items left-aligned on mobile
        md: position === 'left' ? 'flex-end' : 'flex-start' 
      },
      mb: 4,
      position: 'relative'
    }}>
      {/* Timeline Dot */}
      <Box sx={{
        position: 'absolute',
        left: { xs: '30px', md: '50%' },
        top: '20px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: colorValue,
        border: '4px solid white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        transform: { xs: 'translateX(-50%)', md: 'translateX(-50%)' },
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <IconComponent style={{ fontSize: '10px', color: 'white' }} />
      </Box>

      {/* Connector Line */}
      <Box sx={{
        position: 'absolute',
        left: { xs: '30px', md: '50%' },
        top: '30px',
        width: { xs: '22%', md: '22%' },
        height: '2px',
        backgroundColor: colorValue,
        transform: { 
          xs: 'translateX(10px)',
          md: position === 'left' 
            ? 'translateX(-100%) translateX(-10px)' 
            : 'translateX(10px)'
        },
        zIndex: 5
      }} />

      {/* Artifact Card */}
      <Paper
        elevation={2}
        onClick={onClick}
        sx={{
          width: { xs: 'calc(100% - 80px)', md: '44%' },
          ml: { xs: '80px', md: 0 },
          p: 2.5,
          cursor: 'pointer',
          border: `2px solid ${colorValue}20`,
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            borderColor: `${colorValue}40`
          }
        }}
      >
        {/* Card Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: 1.5 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              padding: '4px 8px',
              backgroundColor: `${colorValue}20`,
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <IconComponent style={{ fontSize: '16px', color: colorValue }} />
            </Box>
            <Typography sx={{
              fontWeight: 600,
              color: colorValue,
              fontSize: '14px'
            }}>
              {config.badgeLabel}
            </Typography>
          </Box>
          <Typography sx={{
            fontSize: '12px',
            color: '#666',
            fontWeight: 500
          }}>
            {timeString}
          </Typography>
        </Box>

        {/* Status Chip */}
        {getStatusChip()}

        {/* Content Preview */}
        <Typography sx={{
          fontSize: '14px',
          color: '#333',
          lineHeight: 1.4,
          mb: 1.5,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {previewText}
        </Typography>

        {/* Footer */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pt: 1,
          borderTop: '1px solid #f0f0f0'
        }}>
          <Typography sx={{
            fontSize: '11px',
            color: '#888'
          }}>
            {getDurationInfo()}
          </Typography>
          
          {/* Email-specific actions */}
          {artifact.type === 'email' ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography sx={{
                fontSize: '11px',
                color: colorValue,
                fontWeight: 500,
                mr: 1
              }}>
                Click to view →
              </Typography>
            </Box>
          ) : (
            <Typography sx={{
              fontSize: '11px',
              color: colorValue,
              fontWeight: 500
            }}>
              Click to view →
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}; 