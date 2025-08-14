'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Collapse,
  IconButton,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Check as CheckIcon,
  SkipNext as SkipIcon,
  Timer as TimerIcon,
  Person as PersonIcon,
  Lightbulb as LightbulbIcon,
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  CalendarToday as CalendarIcon,
  Psychology as AIIcon,
  History as HistoryIcon,
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Groups as GroupsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

interface SystemActionCardProps {
  actionId: string;
  actionType: string;
  title: string;
  description: string;
  priority: string;
  duration: number;
  templateKey?: string;
  contextMetadata?: any;
  contactId?: string;
  goalId?: string;
  onComplete: (actionId: string) => void;
  onSkip: (actionId: string) => void;
}

interface ContactContext {
  id: string;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  linkedin_url?: string;
  last_interaction?: string;
  interaction_count?: number;
  relationship_strength?: string;
  reciprocity_balance?: number;
}

interface AISuggestions {
  talking_points?: string[];
  message_templates?: string[];
  next_steps?: string[];
  context_insights?: string[];
}

export const SystemActionCard: React.FC<SystemActionCardProps> = ({
  actionId,
  actionType,
  title,
  description,
  priority,
  duration,
  templateKey,
  contextMetadata,
  contactId,
  goalId,
  onComplete,
  onSkip,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestions | null>(null);

  // Fetch contact context if contact ID is provided
  const { data: contactContext } = useQuery({
    queryKey: ['contact-context', contactId],
    queryFn: async (): Promise<ContactContext | null> => {
      if (!contactId) return null;

      const { data: contact } = await supabase
        .from('contacts')
        .select(`
          id,
          first_name,
          last_name,
          title,
          company,
          email,
          linkedin_url,
          profile_data
        `)
        .eq('id', contactId)
        .single();

      if (!contact) return null;

      // Get relationship health metrics
      const { data: healthMetrics } = await supabase
        .from('relationship_health_metrics')
        .select('*')
        .eq('contact_id', contactId)
        .single();

      // Get recent interactions
      const { data: recentArtifacts } = await supabase
        .from('artifacts')
        .select('created_at, artifact_type')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false })
        .limit(1);

      return {
        id: contact.id,
        name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
        title: contact.title,
        company: contact.company,
        email: contact.email,
        linkedin_url: contact.linkedin_url,
        last_interaction: recentArtifacts?.[0]?.created_at,
        interaction_count: healthMetrics?.total_interactions || 0,
        relationship_strength: healthMetrics?.relationship_strength || 'unknown',
        reciprocity_balance: healthMetrics?.reciprocity_balance || 0,
      };
    },
    enabled: !!contactId,
  });

  // Load AI suggestions
  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      // Call edge function to get AI suggestions
      const response = await fetch('/api/actions/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId,
          actionType,
          title,
          description,
          contactContext,
          contextMetadata,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleExpand = () => {
    setExpanded(!expanded);
    if (!expanded && !suggestions && contactContext) {
      loadSuggestions();
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getActionIcon = () => {
    switch (templateKey) {
      case 'monthly_goal_review':
      case 'weekly_goal_check':
      case 'quarterly_relationship_audit':
        return <TrendingUpIcon />;
      case 'contact_discovery':
      case 'empty_goal_bootstrap':
        return <GroupsIcon />;
      case 'dormant_reconnection':
      case 'stale_goal_revival':
        return <RefreshIcon />;
      case 'reciprocity_balance_pog':
      case 'reciprocity_balance_ask':
        return <AutoAwesomeIcon />;
      default:
        return <LightbulbIcon />;
    }
  };

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '2px solid',
        borderColor: priority === 'urgent' ? 'error.main' : 'primary.200',
        borderRadius: 2,
        boxShadow: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        {/* Header Section */}
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: `${getPriorityColor()}.light`,
                color: `${getPriorityColor()}.main`,
              }}
            >
              {getActionIcon()}
            </Avatar>
            <Box>
              <Typography variant="overline" color="text.secondary">
                System Generated Action
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                {title}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
            <Chip
              label={priority}
              size="small"
              color={getPriorityColor()}
              sx={{ fontWeight: 'bold' }}
            />
            <Chip
              icon={<TimerIcon />}
              label={`${duration} min`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Description */}
        <Typography variant="body1" color="text.secondary" paragraph>
          {description}
        </Typography>

        {/* Contact Context Preview */}
        {contactContext && (
          <Alert
            severity="info"
            icon={<PersonIcon />}
            sx={{
              mb: 2,
              bgcolor: 'primary.50',
              border: '1px solid',
              borderColor: 'primary.200',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {contactContext.name}
            </Typography>
            {contactContext.title && contactContext.company && (
              <Typography variant="caption" display="block">
                {contactContext.title} at {contactContext.company}
              </Typography>
            )}
            <Box display="flex" gap={2} mt={1}>
              {contactContext.last_interaction && (
                <Chip
                  icon={<HistoryIcon />}
                  label={`Last: ${new Date(contactContext.last_interaction).toLocaleDateString()}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {contactContext.relationship_strength && (
                <Chip
                  label={contactContext.relationship_strength}
                  size="small"
                  color={
                    contactContext.relationship_strength === 'strong' ? 'success' :
                    contactContext.relationship_strength === 'moderate' ? 'primary' :
                    'default'
                  }
                />
              )}
            </Box>
          </Alert>
        )}

        {/* Quick Actions */}
        {contactContext && (
          <Box display="flex" gap={1} mb={2}>
            {contactContext.email && (
              <Tooltip title="Send Email">
                <IconButton
                  size="small"
                  onClick={() => window.open(`mailto:${contactContext.email}`, '_blank')}
                  sx={{ bgcolor: 'grey.100' }}
                >
                  <EmailIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {contactContext.linkedin_url && (
              <Tooltip title="View LinkedIn">
                <IconButton
                  size="small"
                  onClick={() => window.open(contactContext.linkedin_url, '_blank')}
                  sx={{ bgcolor: 'grey.100' }}
                >
                  <LinkedInIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Schedule Meeting">
              <IconButton
                size="small"
                sx={{ bgcolor: 'grey.100' }}
              >
                <CalendarIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Expandable Context Section */}
        <Box>
          <Button
            onClick={handleExpand}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            startIcon={<AIIcon />}
            sx={{ mb: 1 }}
          >
            {expanded ? 'Hide' : 'Show'} AI Suggestions & Context
          </Button>

          <Collapse in={expanded}>
            {loadingSuggestions && <LinearProgress sx={{ mb: 2 }} />}
            
            {suggestions && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                
                {/* Talking Points */}
                {suggestions.talking_points && suggestions.talking_points.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      <LightbulbIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Suggested Talking Points
                    </Typography>
                    <List dense>
                      {suggestions.talking_points.map((point, index) => (
                        <ListItem key={index}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <Typography color="primary">•</Typography>
                          </ListItemIcon>
                          <ListItemText primary={point} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Message Templates */}
                {suggestions.message_templates && suggestions.message_templates.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      <EmailIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Message Templates
                    </Typography>
                    {suggestions.message_templates.map((template, index) => (
                      <Alert
                        key={index}
                        severity="success"
                        sx={{
                          mb: 1,
                          bgcolor: 'success.50',
                          '& .MuiAlert-message': {
                            width: '100%',
                          },
                        }}
                      >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {template}
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<ContentCopyIcon />}
                          onClick={() => navigator.clipboard.writeText(template)}
                          sx={{ mt: 1 }}
                        >
                          Copy
                        </Button>
                      </Alert>
                    ))}
                  </Box>
                )}

                {/* Next Steps */}
                {suggestions.next_steps && suggestions.next_steps.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      <ArrowForwardIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Recommended Next Steps
                    </Typography>
                    <List dense>
                      {suggestions.next_steps.map((step, index) => (
                        <ListItem key={index}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <Typography color="secondary">{index + 1}.</Typography>
                          </ListItemIcon>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}
          </Collapse>
        </Box>
      </CardContent>

      <Divider />

      <CardActions sx={{ p: 2, gap: 2 }}>
        <Button
          variant="outlined"
          size="large"
          fullWidth
          onClick={() => onSkip(actionId)}
          startIcon={<SkipIcon />}
        >
          Skip for Now
        </Button>
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={() => onComplete(actionId)}
          startIcon={<CheckIcon />}
          sx={{
            background: 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)',
          }}
        >
          Mark Complete
        </Button>
      </CardActions>
    </Card>
  );
};

// Missing imports fix
import { ContentCopy as ContentCopyIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';