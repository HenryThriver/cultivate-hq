import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Checkbox,
  Alert,
  Stack,
  Chip,
  Card,
  CardContent,
  CardActions,
  FormControlLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Badge,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  AutoAwesome,
  CheckCircle,
  Groups,
  TrendingUp,
  Share,
  ExpandMore,
  Close,
  FilterList,
  SelectAll,
  Lightbulb,
} from '@mui/icons-material';
import { BulkSuggestion, createBulkActions } from '@/lib/utils/bulkSuggestions';

interface BulkSuggestionsPanelProps {
  suggestions: BulkSuggestion[];
  isLoading?: boolean;
  onApplySuggestions: (suggestions: BulkSuggestion[]) => Promise<void>;
  onRefreshSuggestions: () => void;
}

interface FilterState {
  types: Set<string>;
  priorities: Set<string>;
  minConfidence: number;
}

const suggestionTypeLabels = {
  'relationship': 'Relationship',
  'goal_target': 'Goal Target',
  'action': 'Action',
  'introduction': 'Introduction',
};

const suggestionTypeIcons = {
  'relationship': Groups,
  'goal_target': TrendingUp,
  'action': CheckCircle,
  'introduction': Share,
};

const priorityColors = {
  'high': '#dc2626',
  'medium': '#d97706',
  'low': '#059669',
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return '#059669';
  if (confidence >= 60) return '#d97706';
  return '#dc2626';
};

const getConfidenceLabel = (confidence: number) => {
  if (confidence >= 80) return 'High';
  if (confidence >= 60) return 'Medium';
  return 'Low';
};

export const BulkSuggestionsPanel: React.FC<BulkSuggestionsPanelProps> = ({
  suggestions,
  isLoading = false,
  onApplySuggestions,
  onRefreshSuggestions,
}) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    types: new Set(['relationship', 'goal_target', 'action', 'introduction']),
    priorities: new Set(['high', 'medium', 'low']),
    minConfidence: 0,
  });

  // Filter suggestions based on current filter state
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(suggestion => {
      return (
        filterState.types.has(suggestion.type) &&
        filterState.priorities.has(suggestion.priority) &&
        suggestion.confidence >= filterState.minConfidence
      );
    });
  }, [suggestions, filterState]);

  // Group suggestions by type
  const suggestionsByType = useMemo(() => {
    const grouped = filteredSuggestions.reduce((acc, suggestion) => {
      if (!acc[suggestion.type]) {
        acc[suggestion.type] = [];
      }
      acc[suggestion.type].push(suggestion);
      return acc;
    }, {} as Record<string, BulkSuggestion[]>);

    // Sort each group by confidence
    Object.keys(grouped).forEach(type => {
      grouped[type].sort((a, b) => b.confidence - a.confidence);
    });

    return grouped;
  }, [filteredSuggestions]);

  const handleToggleSuggestion = (suggestionId: string) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(suggestionId)) {
      newSelected.delete(suggestionId);
    } else {
      newSelected.add(suggestionId);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSuggestions.size === filteredSuggestions.length) {
      setSelectedSuggestions(new Set());
    } else {
      setSelectedSuggestions(new Set(filteredSuggestions.map(s => s.id)));
    }
  };

  const handleApplySuggestions = async () => {
    const selectedSuggestionObjects = suggestions.filter(s => 
      selectedSuggestions.has(s.id)
    );

    setIsApplying(true);
    try {
      await onApplySuggestions(selectedSuggestionObjects);
      setSelectedSuggestions(new Set());
      setShowApplyDialog(false);
    } catch (error) {
      console.error('Failed to apply suggestions:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const SuggestionCard: React.FC<{ suggestion: BulkSuggestion }> = ({ suggestion }) => {
    const isSelected = selectedSuggestions.has(suggestion.id);
    const TypeIcon = suggestionTypeIcons[suggestion.type as keyof typeof suggestionTypeIcons];

    return (
      <Card 
        sx={{ 
          mb: 1,
          border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
          backgroundColor: isSelected ? '#eff6ff' : 'white',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
        onClick={() => handleToggleSuggestion(suggestion.id)}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <Checkbox
              checked={isSelected}
              onChange={() => handleToggleSuggestion(suggestion.id)}
              sx={{ p: 0, mr: 1 }}
              onClick={(e) => e.stopPropagation()}
            />
            
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TypeIcon sx={{ color: '#6b7280', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, flexGrow: 1 }}>
                  {suggestion.title}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Chip
                    label={getConfidenceLabel(suggestion.confidence)}
                    size="small"
                    sx={{
                      backgroundColor: `${getConfidenceColor(suggestion.confidence)}20`,
                      color: getConfidenceColor(suggestion.confidence),
                      fontSize: '0.7rem',
                      height: 20,
                    }}
                  />
                  <Chip
                    label={suggestion.priority}
                    size="small"
                    sx={{
                      backgroundColor: `${priorityColors[suggestion.priority]}20`,
                      color: priorityColors[suggestion.priority],
                      fontSize: '0.7rem',
                      height: 20,
                      textTransform: 'capitalize',
                    }}
                  />
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {suggestion.description}
              </Typography>
              
              <Typography variant="caption" sx={{ 
                fontStyle: 'italic',
                backgroundColor: '#f9fafb',
                p: 0.5,
                borderRadius: 0.5,
                display: 'block',
              }}>
                💡 {suggestion.reasoning}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const FilterPanel: React.FC = () => (
    <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f8fafc' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
        Filter Suggestions
      </Typography>
      
      <Stack spacing={2}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 500, mb: 1, display: 'block' }}>
            Suggestion Types
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Object.entries(suggestionTypeLabels).map(([type, label]) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    size="small"
                    checked={filterState.types.has(type)}
                    onChange={(e) => {
                      const newTypes = new Set(filterState.types);
                      if (e.target.checked) {
                        newTypes.add(type);
                      } else {
                        newTypes.delete(type);
                      }
                      setFilterState(prev => ({ ...prev, types: newTypes }));
                    }}
                  />
                }
                label={label}
                sx={{ fontSize: '0.8rem' }}
              />
            ))}
          </Box>
        </Box>
        
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 500, mb: 1, display: 'block' }}>
            Priorities
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {Object.keys(priorityColors).map((priority) => (
              <FormControlLabel
                key={priority}
                control={
                  <Checkbox
                    size="small"
                    checked={filterState.priorities.has(priority)}
                    onChange={(e) => {
                      const newPriorities = new Set(filterState.priorities);
                      if (e.target.checked) {
                        newPriorities.add(priority);
                      } else {
                        newPriorities.delete(priority);
                      }
                      setFilterState(prev => ({ ...prev, priorities: newPriorities }));
                    }}
                  />
                }
                label={priority.charAt(0).toUpperCase() + priority.slice(1)}
                sx={{ fontSize: '0.8rem', textTransform: 'capitalize' }}
              />
            ))}
          </Box>
        </Box>
        
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 500, mb: 1, display: 'block' }}>
            Minimum Confidence: {filterState.minConfidence}%
          </Typography>
          <Box sx={{ px: 1 }}>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={filterState.minConfidence}
              onChange={(e) => setFilterState(prev => ({ 
                ...prev, 
                minConfidence: parseInt(e.target.value) 
              }))}
              style={{ width: '100%' }}
            />
          </Box>
        </Box>
      </Stack>
    </Paper>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AutoAwesome sx={{ color: '#8b5cf6', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            AI Suggestions
          </Typography>
          <Badge badgeContent={suggestions.length} color="primary" sx={{ ml: 1 }}>
            <Chip 
              size="small"
              sx={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}
            />
          </Badge>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Filter suggestions">
            <IconButton
              size="small"
              onClick={() => setShowFilters(!showFilters)}
              sx={{ color: showFilters ? '#3b82f6' : '#6b7280' }}
            >
              <FilterList />
            </IconButton>
          </Tooltip>
          
          <Button
            size="small"
            onClick={onRefreshSuggestions}
            disabled={isLoading}
            sx={{ textTransform: 'none' }}
          >
            Refresh
          </Button>
          
          <Button
            size="small"
            variant="outlined"
            onClick={handleSelectAll}
            startIcon={<SelectAll />}
            sx={{ textTransform: 'none' }}
          >
            {selectedSuggestions.size === filteredSuggestions.length ? 'Deselect All' : 'Select All'}
          </Button>
          
          <Button
            variant="contained"
            onClick={() => setShowApplyDialog(true)}
            disabled={selectedSuggestions.size === 0}
            sx={{ textTransform: 'none' }}
          >
            Apply Selected ({selectedSuggestions.size})
          </Button>
        </Box>
      </Box>

      {/* Loading indicator */}
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Filter panel */}
      {showFilters && <FilterPanel />}

      {/* Suggestions content */}
      {filteredSuggestions.length === 0 ? (
        <Alert severity="info" sx={{ display: 'flex', alignItems: 'center' }}>
          <Lightbulb sx={{ mr: 1 }} />
          {suggestions.length === 0 
            ? 'No suggestions available. Try refreshing or add more network data.' 
            : 'No suggestions match current filters. Try adjusting your filter criteria.'
          }
        </Alert>
      ) : (
        <Box>
          {Object.entries(suggestionsByType).map(([type, typeSuggestions]) => {
            const TypeIcon = suggestionTypeIcons[type as keyof typeof suggestionTypeIcons];
            const typeLabel = suggestionTypeLabels[type as keyof typeof suggestionTypeLabels];
            
            return (
              <Accordion key={type} defaultExpanded sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TypeIcon sx={{ color: '#6b7280', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {typeLabel}
                    </Typography>
                    <Chip 
                      label={typeSuggestions.length}
                      size="small"
                      sx={{ ml: 1, backgroundColor: '#f3f4f6', color: '#374151' }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1}>
                    {typeSuggestions.map((suggestion) => (
                      <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}

      {/* Apply confirmation dialog */}
      <Dialog
        open={showApplyDialog}
        onClose={() => setShowApplyDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Apply Selected Suggestions</Typography>
          <IconButton onClick={() => setShowApplyDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            You're about to apply {selectedSuggestions.size} suggestions. This will create new actions, relationships, or goal targets as appropriate.
          </Alert>
          
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Selected suggestions:
          </Typography>
          
          <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
            {Array.from(selectedSuggestions).map(id => {
              const suggestion = suggestions.find(s => s.id === id);
              return suggestion ? (
                <Typography key={id} variant="body2" sx={{ mb: 0.5 }}>
                  • {suggestion.title}
                </Typography>
              ) : null;
            })}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setShowApplyDialog(false)}
            disabled={isApplying}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApplySuggestions}
            variant="contained"
            disabled={isApplying}
            sx={{ minWidth: 120 }}
          >
            {isApplying ? 'Applying...' : 'Apply Suggestions'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};