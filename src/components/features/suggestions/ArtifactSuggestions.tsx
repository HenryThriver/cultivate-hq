import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Collapse,
  Paper,
  Chip,
  IconButton,
  Divider,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  HourglassEmpty,
  ErrorOutline,
  ExpandMore,
  ExpandLess,
  Lightbulb,
  Person,
  Business,
  Event,
  Phone,
  Email,
  Refresh,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { format, parseISO } from 'date-fns';

interface ArtifactSuggestionsProps {
  artifactId: string;
  artifactType: string;
  aiParsingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  contactId?: string;
  compact?: boolean; // For smaller contexts like cards vs modals
}

interface Suggestion {
  id: string;
  artifact_id: string;
  contact_id: string;
  user_id: string;
  suggested_updates: {
    suggestions: Array<{
      action: string;
      reasoning: string;
      confidence: number;
      field_path: string;
      suggested_value: any;
    }>;
  };
  field_paths: string[];
  confidence_scores: any; // JSONB
  status: 'pending' | 'approved' | 'rejected' | 'partial' | 'skipped';
  user_selections: any; // JSONB
  created_at: string;
  reviewed_at: string | null;
  applied_at: string | null;
  viewed_at: string | null;
  priority: 'high' | 'medium' | 'low';
  dismissed_at: string | null;
}

const getSuggestionIcon = (fieldPath: string) => {
  const path = fieldPath.toLowerCase();
  if (path.includes('personal') || path.includes('name')) {
    return Person;
  } else if (path.includes('business') || path.includes('company') || path.includes('job')) {
    return Business;
  } else if (path.includes('event') || path.includes('meeting')) {
    return Event;
  } else if (path.includes('phone')) {
    return Phone;
  } else if (path.includes('email')) {
    return Email;
  }
  return Lightbulb;
};

const getSuggestionTypeLabel = (fieldPath: string) => {
  // Convert field path to readable label
  const parts = fieldPath.split('.');
  const lastPart = parts[parts.length - 1];
  return lastPart.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatSuggestionValue = (value: any, fieldPath: string): string => {
  // Handle simple string values
  if (typeof value === 'string') {
    return value;
  }
  
  // Handle object values based on field path
  if (typeof value === 'object' && value !== null) {
    const path = fieldPath.toLowerCase();
    
    // Handle projects
    if (path.includes('project')) {
      if (value.name && value.status) {
        let formatted = `${value.name}`;
        if (value.status) {
          formatted += ` (${value.status})`;
        }
        if (value.details) {
          formatted += ` - ${value.details}`;
        }
        return formatted;
      }
    }
    
    // Handle family/relationships
    if (path.includes('family') || path.includes('partner') || path.includes('children')) {
      if (value.name && value.relationship) {
        return `${value.name} (${value.relationship})`;
      } else if (value.relationship && value.details) {
        return `${value.details} (${value.relationship})`;
      }
    }
    
    // Handle education
    if (path.includes('education')) {
      if (value.institution && value.degree) {
        return `${value.degree} from ${value.institution}`;
      } else if (value.institution) {
        return `Attended ${value.institution}`;
      }
    }
    
    // Handle contact info
    if (path.includes('contact') || path.includes('email') || path.includes('phone')) {
      if (value.type && value.value) {
        return `${value.value} (${value.type})`;
      }
    }
    
    // For any other object, try to extract meaningful information
    if (value.name) {
      return value.name;
    } else if (value.value) {
      return value.value;
    } else if (value.details) {
      return value.details;
    }
    
    // Last resort: create a readable summary
    const keys = Object.keys(value);
    if (keys.length === 1) {
      return String(value[keys[0]]);
    } else if (keys.length <= 3) {
      return keys.map(key => `${key}: ${value[key]}`).join(', ');
    }
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => formatSuggestionValue(item, fieldPath)).join(', ');
  }
  
  // Fallback to string conversion
  return String(value);
};

export const ArtifactSuggestions: React.FC<ArtifactSuggestionsProps> = ({
  artifactId,
  artifactType,
  aiParsingStatus,
  contactId,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch suggestions for this artifact
  const { 
    data: suggestions, 
    isLoading: suggestionsLoading 
  } = useQuery({
    queryKey: ['artifact-suggestions', artifactId],
    queryFn: async () => {
      if (!artifactId) return [];
      
      console.log('🔍 Querying suggestions for artifact:', artifactId);
      
      const { data, error } = await supabase
        .from('contact_update_suggestions')
        .select('*')
        .eq('artifact_id', artifactId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching artifact suggestions:', error);
        return [];
      }
      
      console.log('📊 Found suggestions:', data);
      return data as Suggestion[] || [];
    },
    enabled: !!artifactId && aiParsingStatus === 'completed',
  });

  // Don't render anything if AI parsing hasn't started or if there's no parsing status
  if (!aiParsingStatus) return null;

  // Calculate total number of individual suggestions across all records
  const suggestionCount = suggestions?.reduce((total, record) => {
    return total + (record.suggested_updates?.suggestions?.length || 0);
  }, 0) || 0;
  const hasSuggestions = suggestionCount > 0;

  const statusConfig = {
    pending: { 
      icon: HourglassEmpty, 
      color: 'info', 
      text: `Queued for AI processing` 
    },
    processing: { 
      icon: HourglassEmpty, 
      color: 'warning', 
      text: `AI processing in progress...` 
    },
    failed: { 
      icon: ErrorOutline, 
      color: 'error', 
      text: `AI processing failed` 
    },
    completed: { 
      icon: CheckCircle, 
      color: 'success', 
      text: `AI processing completed` 
    },
  };

  const config = statusConfig[aiParsingStatus];
  const StatusIcon = config.icon;

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy \'at\' h:mm a');
    } catch {
      return dateString;
    }
  };

  const handleApplySuggestion = async (suggestionId: string) => {
    try {
      const response = await fetch('/api/suggestions/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suggestionId,
          contactId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to apply suggestion');
      }

      // Refetch suggestions to update the UI
      // The query will automatically update due to the query key
    } catch (error) {
      console.error('Error applying suggestion:', error);
    }
  };

  const handleReprocess = async () => {
    if (!artifactId) return;
    
    setIsReprocessing(true);
    try {
      const response = await fetch(`/api/artifacts/${artifactId}/reprocess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reprocess artifact');
      }

      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['artifact-suggestions', artifactId] });
      
      // Optionally show success message or trigger parent re-render
      console.log('🔄 Artifact reprocessing initiated');
      
    } catch (error) {
      console.error('Error reprocessing artifact:', error);
    } finally {
      setIsReprocessing(false);
    }
  };

  return (
    <Box>
      {/* Status Alert */}
      <Alert 
        severity={config.color as any} 
        icon={<StatusIcon />}
        sx={{ mb: expanded ? 1 : 0 }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant={compact ? "caption" : "body2"}>
              {config.text}
              {aiParsingStatus === 'completed' && (
                <span style={{ marginLeft: '8px', opacity: 0.8 }}>
                  • {suggestionsLoading ? 'Checking suggestions...' : 
                     suggestionCount === 0 ? 'No suggestions generated' : 
                     `${suggestionCount} suggestion${suggestionCount > 1 ? 's' : ''} generated`}
                </span>
              )}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            {/* Reprocess Button - Available for all statuses */}
            <Button
              size="small"
              variant="text"
              startIcon={isReprocessing ? <CircularProgress size={12} /> : <Refresh />}
              onClick={handleReprocess}
              disabled={isReprocessing}
              sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
            >
              {isReprocessing ? 'Reprocessing...' : 'Re-analyze'}
            </Button>
            
            {aiParsingStatus === 'completed' && (
              <Button 
                size="small" 
                variant="outlined" 
                disabled={!hasSuggestions || suggestionsLoading}
                endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                onClick={() => setExpanded(!expanded)}
              >
                {suggestionsLoading ? 'Loading...' : 
                 !hasSuggestions ? 'No Suggestions' : 
                 expanded ? 'Hide' : 
                 `View ${suggestionCount} Suggestion${suggestionCount > 1 ? 's' : ''}`}
              </Button>
            )}
          </Box>
        </Box>
      </Alert>

      {/* Expanded Suggestions */}
      <Collapse in={expanded && hasSuggestions}>
        <Paper sx={{ p: 2, mt: 1, backgroundColor: '#f8f9fa' }} elevation={0}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lightbulb sx={{ fontSize: '18px', color: 'warning.main' }} />
            AI-Generated Suggestions from this {artifactType}
          </Typography>
          
          <Stack spacing={2}>
            {suggestions?.map((suggestionRecord, recordIndex) => {
              // Each record can have multiple individual suggestions
              return suggestionRecord.suggested_updates.suggestions.map((individualSuggestion, index) => {
                const SuggestionIcon = getSuggestionIcon(individualSuggestion.field_path);
                const typeLabel = getSuggestionTypeLabel(individualSuggestion.field_path);
                
                return (
                  <Paper key={`${suggestionRecord.id}-${index}`} sx={{ p: 2, backgroundColor: 'white' }} elevation={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <SuggestionIcon sx={{ fontSize: '16px', color: 'primary.main' }} />
                          <Chip 
                            label={typeLabel} 
                            size="small" 
                            sx={{ 
                              fontSize: '11px', 
                              height: '20px',
                              backgroundColor: 'primary.50',
                              color: 'primary.main'
                            }} 
                          />
                          <Chip 
                            label={`${Math.round(individualSuggestion.confidence * 100)}% confidence`} 
                            size="small" 
                            sx={{ 
                              fontSize: '11px', 
                              height: '20px',
                              backgroundColor: individualSuggestion.confidence > 0.8 ? 'success.50' : 
                                             individualSuggestion.confidence > 0.6 ? 'warning.50' : 'error.50',
                              color: individualSuggestion.confidence > 0.8 ? 'success.main' : 
                                     individualSuggestion.confidence > 0.6 ? 'warning.main' : 'error.main'
                            }} 
                          />
                        </Box>
                        
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                          {formatSuggestionValue(individualSuggestion.suggested_value, individualSuggestion.field_path)}
                        </Typography>
                        
                        {individualSuggestion.reasoning && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mb: 1 }}>
                            AI Reasoning: {individualSuggestion.reasoning}
                          </Typography>
                        )}
                        
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Generated {formatDate(suggestionRecord.created_at)}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" gap={1} flexShrink={0}>
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => handleApplySuggestion(suggestionRecord.id)}
                          sx={{ minWidth: 'auto' }}
                        >
                          Apply
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          color="error"
                          sx={{ minWidth: 'auto' }}
                        >
                          Dismiss
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                );
              });
            }).flat()}
          </Stack>
        </Paper>
      </Collapse>
    </Box>
  );
}; 