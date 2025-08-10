'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  useTheme
} from '@mui/material';
import {
  Send as SendIcon,
  Inbox as InboxIcon,
  PriorityHigh as PriorityIcon,
  Flag as GoalIcon,
} from '@mui/icons-material';
import { BaseArtifact, VoiceMemoArtifact, MeetingArtifact } from '@/types/artifact';
import { EmailArtifact } from '@/types/email';
import { getArtifactConfig } from '@/config/artifactConfig';
import { useAuth } from '@/lib/contexts/AuthContext';

interface GoalAssociation {
  id: string;
  title: string;
  status: string;
  category?: string;
  is_primary?: boolean;
}

interface EnhancedTimelineItemProps {
  artifact: BaseArtifact<unknown>;
  position: 'left' | 'right';
  onClick: () => void;
  index?: number; // For staggered animations
  goalAssociations?: GoalAssociation[]; // Goals this artifact is associated with
  onGoalClick?: (goalId: string) => void;
}

export const EnhancedTimelineItem: React.FC<EnhancedTimelineItemProps> = ({
  artifact,
  position,
  onClick,
  index = 0,
  goalAssociations = [],
  onGoalClick
}) => {
  const { user } = useAuth();
  
  // Email artifact handling - continue with standard timeline treatment

  const config = getArtifactConfig(artifact.type);
  const IconComponent = config.icon;

  // Email helper functions
  const getEmailDirection = (email: EmailArtifact): 'sent' | 'received' => {
    const labels = email.metadata?.labels || [];
    const fromEmail = email.metadata?.from?.email?.toLowerCase() || '';
    
    if (labels.includes('SENT')) return 'sent';
    if (labels.includes('INBOX')) return 'received';
    
    // Use authenticated user context instead of hardcoded emails
    if (user?.email && fromEmail.includes(user.email.toLowerCase())) {
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
              backgroundColor: direction === 'sent' 
                ? theme.palette.success.light 
                : theme.palette.info.light,
              color: direction === 'sent' 
                ? theme.palette.success.dark 
                : theme.palette.info.dark,
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
                backgroundColor: theme.palette.warning.light,
                color: theme.palette.warning.dark,
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
        completed: { 
          color: theme.palette.success.light, 
          textColor: theme.palette.success.dark, 
          label: 'Transcribed' 
        },
        processing: { 
          color: theme.palette.warning.light, 
          textColor: theme.palette.warning.dark, 
          label: 'Processing' 
        },
        pending: { 
          color: theme.palette.grey[200], 
          textColor: theme.palette.grey[700], 
          label: 'Pending' 
        },
        failed: { 
          color: theme.palette.error.light, 
          textColor: theme.palette.error.dark, 
          label: 'Failed' 
        }
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
        completed: { 
          color: theme.palette.success.light, 
          textColor: theme.palette.success.dark, 
          label: 'AI Processed' 
        },
        processing: { 
          color: theme.palette.warning.light, 
          textColor: theme.palette.warning.dark, 
          label: 'AI Processing' 
        },
        pending: { 
          color: theme.palette.grey[200], 
          textColor: theme.palette.grey[700], 
          label: 'Pending AI' 
        },
        failed: { 
          color: theme.palette.error.light, 
          textColor: theme.palette.error.dark, 
          label: 'AI Failed' 
        }
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

  // Use theme hook to get actual color values from MUI theme
  const theme = useTheme();
  
  // Determine if this artifact is high-value (gets premium treatment)
  const isHighValue = () => {
    // POGs, AI insights, and meetings are considered high-value
    const highValueTypes = ['pog', 'meeting', 'voice_memo'];
    if (highValueTypes.includes(artifact.type)) return true;
    
    // Emails with important priority
    if (artifact.type === 'email') {
      const emailArtifact = artifact as EmailArtifact;
      return getEmailImportance(emailArtifact) === 'high';
    }
    
    return false;
  };
  
  const getThemeColor = () => {
    // Map artifact types to our theme artifact colors
    const artifactColorMap: Record<string, string> = {
      voice_memo: theme.palette.artifacts?.insight?.main || theme.palette.primary.main,
      email: theme.palette.artifacts?.communication?.main || theme.palette.grey[600],
      meeting: theme.palette.artifacts?.meeting?.main || theme.palette.info.main,
      pog: theme.palette.artifacts?.pog?.main || theme.palette.success.main,
      ask: theme.palette.artifacts?.ask?.main || theme.palette.warning.main,
      loop: theme.palette.artifacts?.loop?.main || theme.palette.secondary.main,
      note: theme.palette.artifacts?.action?.main || theme.palette.grey[700],
      linkedin_profile: theme.palette.artifacts?.communication?.main || theme.palette.info.main,
    };
    
    return artifactColorMap[artifact.type] || theme.palette.primary.main;
  };

  const colorValue = getThemeColor();
  const isPremium = isHighValue();

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
        width: isPremium ? '24px' : '20px', // Larger for premium
        height: isPremium ? '24px' : '20px',
        borderRadius: '50%',
        background: isPremium 
          ? `radial-gradient(circle, ${colorValue} 0%, ${colorValue}AA 100%)`
          : colorValue,
        border: `${isPremium ? '3px' : '4px'} solid white`,
        boxShadow: isPremium 
          ? `0 0 20px ${colorValue}40, 0 4px 12px rgba(0,0,0,0.15)`
          : '0 2px 8px rgba(0,0,0,0.15)',
        transform: { xs: 'translateX(-50%)', md: 'translateX(-50%)' },
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        animation: isPremium ? 'timeline-pulse 2s ease-in-out infinite' : 'none',
        '&:hover': {
          transform: 'translateX(-50%) scale(1.4)',
          boxShadow: isPremium 
            ? `0 0 25px ${colorValue}50, 0 6px 20px rgba(0,0,0,0.2)`
            : `0 0 15px ${colorValue}40, 0 4px 12px rgba(0,0,0,0.15)`,
          filter: 'brightness(1.1)',
          animation: isPremium ? 'premiumGlow 1.5s ease-in-out infinite' : 'none',
        }
      }}>
        <IconComponent style={{ fontSize: '10px', color: 'white' }} />
      </Box>

      {/* Connector Line */}
      <Box sx={{
        position: 'absolute',
        left: { xs: '30px', md: '50%' },
        top: '30px',
        width: { xs: '22%', md: '22%' },
        height: isPremium ? '3px' : '2px',
        background: isPremium 
          ? `linear-gradient(90deg, ${colorValue} 0%, ${colorValue}AA 100%)`
          : colorValue,
        transform: { 
          xs: 'translateX(10px)',
          md: position === 'left' 
            ? 'translateX(-100%) translateX(-10px)' 
            : 'translateX(10px)'
        },
        zIndex: 5,
        borderRadius: '1px',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          height: isPremium ? '4px' : '3px',
          boxShadow: `0 0 8px ${colorValue}40`,
        }
      }} />

      {/* Artifact Card */}
      <Paper
        elevation={2}
        onClick={onClick}
        sx={{
          width: { xs: 'calc(100% - 80px)', md: '44%' },
          ml: { xs: '80px', md: 0 },
          p: isPremium 
            ? 4.875 // 39px golden ratio for premium (39/8 = 4.875)
            : { xs: 2.5, md: 3 },
          cursor: 'pointer',
          border: isPremium 
            ? `2px solid ${colorValue}40` 
            : `2px solid ${colorValue}20`,
          borderRadius: isPremium 
            ? 'var(--radius-large)' // 24px for premium cards
            : 'var(--radius-medium)', // 12px for standard
          background: isPremium
            ? `linear-gradient(135deg, #ffffff 0%, ${colorValue}05 100%)`
            : 'background.paper',
          transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          transformOrigin: 'center center',
          '&:hover': {
            transform: isPremium 
              ? 'translateY(-4px) scale(1.03)' 
              : 'translateY(-2px) scale(1.02)',
            boxShadow: isPremium 
              ? `var(--shadow-elevated), 0 0 40px ${colorValue}20`
              : `var(--shadow-card-hover), 0 0 20px ${colorValue}15`,
            borderColor: `${colorValue}80`,
            '&::before': isPremium ? {
              background: `linear-gradient(135deg, ${colorValue}15 0%, transparent 50%)`,
            } : {}
          },
          // Add staggered entrance animation
          animation: 'sophisticatedEntrance 600ms cubic-bezier(0.0, 0, 0.2, 1) both',
          animationDelay: `${index * 100}ms`, // Stagger by 100ms per item
          // Premium glow effect
          ...(isPremium && {
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, ${colorValue}10 0%, transparent 50%)`,
              borderRadius: 'inherit',
              pointerEvents: 'none'
            }
          })
        }}
      >
        {/* Card Content - Above premium overlay */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
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
              fontSize: isPremium ? '15px' : '14px',
              letterSpacing: '0.5px',
              textTransform: isPremium ? 'uppercase' : 'none'
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
          fontSize: isPremium ? '15px' : '14px',
          color: 'text.primary',
          lineHeight: isPremium ? 1.5 : 1.4,
          mb: goalAssociations.length > 0 ? 1.5 : 2, // Less spacing if goals below
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: isPremium ? 4 : 3, // More lines for premium
          WebkitBoxOrient: 'vertical',
          fontWeight: isPremium ? 500 : 400
        }}>
          {previewText}
        </Typography>

        {/* Goal Associations */}
        {goalAssociations.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <GoalIcon sx={{ fontSize: '14px', color: 'primary.main' }} />
              <Typography sx={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'primary.main',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Goal{goalAssociations.length > 1 ? 's' : ''}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {goalAssociations.slice(0, 2).map((goal) => (
                <Chip
                  key={goal.id}
                  label={goal.title}
                  onClick={(e) => {
                    e.stopPropagation();
                    onGoalClick?.(goal.id);
                  }}
                  size="small"
                  icon={<GoalIcon fontSize="small" />}
                  sx={{
                    fontSize: '11px',
                    height: '22px',
                    maxWidth: '140px',
                    backgroundColor: 'primary.50',
                    color: 'primary.main',
                    borderColor: 'primary.main',
                    cursor: onGoalClick ? 'pointer' : 'default',
                    transition: 'all 200ms ease',
                    '&:hover': onGoalClick ? {
                      backgroundColor: 'primary.100',
                      transform: 'scale(1.05)',
                    } : {},
                    '& .MuiChip-label': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                  }}
                />
              ))}
              {goalAssociations.length > 2 && (
                <Chip
                  label={`+${goalAssociations.length - 2} more`}
                  size="small"
                  sx={{
                    fontSize: '11px',
                    height: '22px',
                    backgroundColor: 'grey.100',
                    color: 'text.secondary',
                    cursor: 'default'
                  }}
                />
              )}
            </Box>
          </Box>
        )}

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
        </Box>
      </Paper>
    </Box>
  );
}; 