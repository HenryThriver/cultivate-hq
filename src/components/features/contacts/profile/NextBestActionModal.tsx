import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
  Card,
  CardContent,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Star as StarIcon,
  AutoAwesome as AIIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as TimingIcon,
  Psychology as InsightIcon,
  ContactPhone as ContactIcon,
  Timeline as HistoryIcon
} from '@mui/icons-material';

interface NextBestAction {
  id: string;
  title: string;
  description: string;
  type: 'pog' | 'ask' | 'follow_up' | 'connection';
  confidence: number;
  urgency: 'high' | 'medium' | 'low';
  estimatedImpact: 'high' | 'medium' | 'low';
  reasoning: Array<{
    factor: string;
    explanation: string;
    weight: number;
  }>;
  suggestedApproaches: Array<{
    id: string;
    title: string;
    description: string;
    pros: string[];
    cons: string[];
  }>;
  context: {
    recentInteractions: Array<{
      type: string;
      title: string;
      date: Date;
      relevance: string;
    }>;
    relationshipState: {
      reciprocityBalance: number;
      lastContact: Date;
      engagementLevel: 'high' | 'medium' | 'low';
    };
    timingFactors: Array<{
      factor: string;
      description: string;
      impact: 'positive' | 'neutral' | 'negative';
    }>;
  };
}

interface NextBestActionModalProps {
  open: boolean;
  onClose: () => void;
  action: NextBestAction | null;
  contactName: string;
  onTakeAction: (actionId: string, approach?: string) => void;
}

export const NextBestActionModal: React.FC<NextBestActionModalProps> = ({
  open,
  onClose,
  action,
  contactName,
  onTakeAction,
}) => {
  const theme = useTheme();

  if (!action) return null;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return theme.palette.artifacts.pog.main;
      case 'medium': return theme.palette.artifacts.ask.main;
      case 'low': return theme.palette.artifacts.communication.main;
      default: return theme.palette.grey[500];
    }
  };

  const getTimingImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return theme.palette.success.main;
      case 'negative': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getReciprocityText = (balance: number) => {
    if (balance > 0.3) return 'You give more';
    if (balance < -0.3) return 'You receive more';
    return 'Balanced exchange';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 'var(--shadow-card-focus)',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        pb: 1,
        background: `linear-gradient(135deg, ${theme.palette.amber.light} 0%, #ffffff 100%)`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexGrow: 1 }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            backgroundColor: theme.palette.amber.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <StarIcon sx={{ color: 'white' }} />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3 }}>
              Next Best Action: {action.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`${action.confidence}% confidence`}
                size="small"
                sx={{
                  backgroundColor: theme.palette.artifacts.insight.light,
                  color: theme.palette.artifacts.insight.main,
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              />
              <Chip 
                label={`${action.urgency} urgency`}
                size="small"
                sx={{
                  backgroundColor: `${getUrgencyColor(action.urgency)}20`,
                  color: getUrgencyColor(action.urgency),
                  fontWeight: 500
                }}
              />
              <Chip 
                label={`${action.estimatedImpact} impact`}
                size="small"
                sx={{
                  backgroundColor: `${getImpactColor(action.estimatedImpact)}20`,
                  color: getImpactColor(action.estimatedImpact),
                  fontWeight: 500
                }}
              />
            </Box>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
          {/* Main Content */}
          <Box>
            {/* Description */}
            <Card sx={{ mb: 3, backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <CardContent>
                <Typography variant="body1" sx={{ lineHeight: 1.6, mb: 2 }}>
                  {action.description}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Recommended for: {contactName}
                </Typography>
              </CardContent>
            </Card>

            {/* AI Reasoning */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <InsightIcon sx={{ color: theme.palette.artifacts.insight.main }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    AI Reasoning
                  </Typography>
                  <Chip 
                    label="AI Analysis"
                    size="small"
                    sx={{
                      fontSize: '0.65rem',
                      height: 20,
                      backgroundColor: theme.palette.artifacts.insight.light,
                      color: theme.palette.artifacts.insight.main,
                      fontWeight: 500
                    }}
                  />
                </Box>
                <List dense disablePadding>
                  {action.reasoning.map((reason, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 1.5 }}>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {reason.factor}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Weight: {Math.round(reason.weight * 100)}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={reason.weight * 100}
                              sx={{ 
                                width: 40, 
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 2,
                                  backgroundColor: theme.palette.artifacts.insight.main
                                }
                              }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          {reason.explanation}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Suggested Approaches */}
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Suggested Approaches
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {action.suggestedApproaches.map((approach, index) => (
                    <Box 
                      key={approach.id}
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        border: '1px solid',
                        borderColor: 'rgba(0,0,0,0.1)',
                        transition: 'all 200ms ease',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          backgroundColor: 'rgba(0,0,0,0.02)'
                        }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Approach {index + 1}: {approach.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.875rem' }}>
                        {approach.description}
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                            Pros:
                          </Typography>
                          <List dense disablePadding>
                            {approach.pros.map((pro, idx) => (
                              <ListItem key={idx} disablePadding>
                                <Typography variant="caption" color="text.secondary">
                                  • {pro}
                                </Typography>
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                            Considerations:
                          </Typography>
                          <List dense disablePadding>
                            {approach.cons.map((con, idx) => (
                              <ListItem key={idx} disablePadding>
                                <Typography variant="caption" color="text.secondary">
                                  • {con}
                                </Typography>
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1.5, textTransform: 'none' }}
                        onClick={() => onTakeAction(action.id, approach.id)}
                      >
                        Use This Approach
                      </Button>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Context Sidebar */}
          <Box>
            {/* Relationship Context */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ContactIcon sx={{ color: theme.palette.artifacts.communication.main }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Relationship State
                  </Typography>
                </Box>
                <List dense disablePadding>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemText 
                      primary="Balance"
                      secondary={getReciprocityText(action.context.relationshipState.reciprocityBalance)}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemText 
                      primary="Last Contact"
                      secondary={formatDate(action.context.relationshipState.lastContact)}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText 
                      primary="Engagement"
                      secondary={`${action.context.relationshipState.engagementLevel} level`}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Recent Interactions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <HistoryIcon sx={{ color: theme.palette.artifacts.meeting.main }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Recent Context
                  </Typography>
                </Box>
                <List dense disablePadding>
                  {action.context.recentInteractions.map((interaction, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 1.5 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                          {interaction.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {formatDate(interaction.date)} • {interaction.type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {interaction.relevance}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Timing Factors */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TimingIcon sx={{ color: theme.palette.sage.main }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Timing Factors
                  </Typography>
                </Box>
                <List dense disablePadding>
                  {action.context.timingFactors.map((factor, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <Box sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: getTimingImpactColor(factor.impact)
                        }} />
                      </ListItemIcon>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                          {factor.factor}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {factor.description}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none' }}>
          Maybe Later
        </Button>
        <Button 
          variant="contained" 
          sx={{ 
            textTransform: 'none',
            backgroundColor: theme.palette.amber.main,
            '&:hover': { backgroundColor: theme.palette.amber.dark }
          }}
          onClick={() => onTakeAction(action.id)}
        >
          Take This Action
        </Button>
      </DialogActions>
    </Dialog>
  );
};