import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as PendingIcon,
  Schedule as InProgressIcon,
  CheckCircleOutline as CheckIcon,
  Edit as EditIcon,
  AccessTime as ClockIcon,
  Flag as PriorityIcon,
} from '@mui/icons-material';
import { useUpdateAction } from '@/lib/hooks/useActions';
import type { ActionItem } from '@/lib/hooks/useActions';

interface ActionTileProps {
  action: ActionItem;
  onEdit?: (action: ActionItem) => void;
  onView?: (action: ActionItem) => void;
  compact?: boolean;
}

export const ActionTile: React.FC<ActionTileProps> = ({
  action,
  onEdit,
  onView,
  compact = false,
}) => {
  const theme = useTheme();
  const updateActionMutation = useUpdateAction();
  const [isCompleting, setIsCompleting] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon sx={{ fontSize: compact ? 16 : 20, color: theme.palette.success.main }} />;
      case 'in_progress':
        return <InProgressIcon sx={{ fontSize: compact ? 16 : 20, color: theme.palette.warning.main }} />;
      default:
        return <PendingIcon sx={{ fontSize: compact ? 16 : 20, color: theme.palette.grey[500] }} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return theme.palette.error.main;
      case 'high':
        return theme.palette.warning.main;
      case 'medium':
        return theme.palette.info.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
    }).format(date);
  };

  const handleQuickComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (action.status === 'completed' || isCompleting) return;

    setIsCompleting(true);
    try {
      await updateActionMutation.mutateAsync({
        id: action.id,
        updates: {
          status: 'completed',
          completed_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to complete action:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(action);
  };

  const handleClick = () => {
    // Always prefer edit over view when clicking the tile
    if (onEdit) {
      onEdit(action);
    } else if (onView) {
      onView(action);
    }
  };

  const isOverdue = action.due_date && new Date(action.due_date) < new Date() && action.status !== 'completed';
  const isDueSoon = action.due_date && 
    new Date(action.due_date) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) && 
    action.status !== 'completed';

  return (
    <Box
      onClick={handleClick}
      sx={{
        p: compact ? 1.5 : 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: isOverdue ? 'error.main' : 'divider',
        cursor: 'pointer',
        transition: 'all 200ms ease',
        backgroundColor: isOverdue ? 'error.50' : 'background.paper',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: theme.palette.artifacts.action.main,
          backgroundColor: theme.palette.artifacts.action.light,
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '& .action-buttons': {
            opacity: 1,
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        {/* Status Icon */}
        <Box sx={{ flexShrink: 0, mt: 0.5 }}>
          {getStatusIcon(action.status)}
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {/* Title and Priority */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography
              variant={compact ? 'body2' : 'body1'}
              sx={{
                fontWeight: 600,
                fontSize: compact ? '0.875rem' : '0.95rem',
                textDecoration: action.status === 'completed' ? 'line-through' : 'none',
                color: action.status === 'completed' ? 'text.secondary' : 'text.primary',
              }}
            >
              {action.title}
            </Typography>
            <Chip
              icon={<PriorityIcon sx={{ fontSize: 14 }} />}
              label={action.priority}
              size="small"
              sx={{
                height: compact ? 18 : 22,
                fontSize: compact ? '0.6rem' : '0.7rem',
                backgroundColor: `${getPriorityColor(action.priority)}20`,
                color: getPriorityColor(action.priority),
                textTransform: 'capitalize',
                '& .MuiChip-icon': {
                  color: getPriorityColor(action.priority),
                },
              }}
            />
          </Box>

          {/* Description */}
          {action.description && !compact && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {action.description}
            </Typography>
          )}

          {/* Metadata */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <ClockIcon sx={{ fontSize: 14 }} />
              Created {formatDate(action.created_at)}
            </Typography>
            {action.due_date && (
              <Typography
                variant="caption"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: isOverdue ? 'error.main' : isDueSoon ? 'warning.main' : 'text.secondary',
                  fontWeight: isOverdue || isDueSoon ? 600 : 400,
                }}
              >
                • Due {formatDate(action.due_date)}
              </Typography>
            )}
            {action.estimated_duration_minutes && (
              <Typography variant="caption" color="text.secondary">
                • ~{action.estimated_duration_minutes}min
              </Typography>
            )}
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box
          className="action-buttons"
          sx={{
            display: 'flex',
            gap: 0.5,
            opacity: 0,
            transition: 'opacity 200ms ease',
            flexShrink: 0,
          }}
        >
          {action.status !== 'completed' && (
            <Tooltip title="Mark as complete">
              <IconButton
                size="small"
                onClick={handleQuickComplete}
                disabled={isCompleting}
                sx={{
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: theme.palette.success.light,
                    borderColor: theme.palette.success.main,
                    '& .MuiSvgIcon-root': {
                      color: theme.palette.success.main,
                    },
                  },
                }}
              >
                {isCompleting ? (
                  <CircularProgress size={16} />
                ) : (
                  <CheckIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit action">
              <IconButton
                size="small"
                onClick={handleEdit}
                sx={{
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: theme.palette.artifacts.action.light,
                    borderColor: theme.palette.artifacts.action.main,
                    '& .MuiSvgIcon-root': {
                      color: theme.palette.artifacts.action.main,
                    },
                  },
                }}
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Completion Animation Overlay */}
      {action.status === 'completed' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.palette.success.main,
            opacity: 0,
            pointerEvents: 'none',
            animation: action.completed_at && 
              new Date(action.completed_at).getTime() > Date.now() - 2000
              ? 'completeFlash 0.5s ease-out'
              : 'none',
            '@keyframes completeFlash': {
              '0%': { opacity: 0 },
              '50%': { opacity: 0.2 },
              '100%': { opacity: 0 },
            },
          }}
        />
      )}
    </Box>
  );
};