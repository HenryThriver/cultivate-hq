'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  useTheme, 
  ButtonGroup, 
  Button,
  Divider,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  InputAdornment,
  IconButton,
  Autocomplete
} from '@mui/material';
import { 
  Mic as MicIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Event as EventIcon,
  Note as NoteIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
  Handshake as HandshakeIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterListIcon,
  ViewModule as ViewModuleIcon,
  Timeline as TimelineIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Flag as GoalIcon,
  Star as PrimaryIcon
} from '@mui/icons-material';
import type { ArtifactType } from '@/types';

// Executive intelligence categories with strategic groupings
const INTELLIGENCE_CATEGORIES = [
  {
    category: 'Communication Intelligence',
    description: 'All forms of strategic dialogue and correspondence',
    filters: [
      { type: 'voice_memo' as ArtifactType, label: 'Voice Intelligence', icon: MicIcon, colorKey: 'insight' },
      { type: 'email' as ArtifactType, label: 'Correspondence', icon: EmailIcon, colorKey: 'communication' },
      { type: 'meeting' as ArtifactType, label: 'Live Connections', icon: EventIcon, colorKey: 'meeting' }
    ]
  },
  {
    category: 'Strategic Intelligence', 
    description: 'Insights, planning, and professional context',
    filters: [
      { type: 'note' as ArtifactType, label: 'Strategic Notes', icon: NoteIcon, colorKey: 'action' },
      { type: 'linkedin_profile' as ArtifactType, label: 'Professional Intel', icon: LinkedInIcon, colorKey: 'communication' }
    ]
  }
];

// Executive view modes for different analysis perspectives
const VIEW_MODES = [
  { value: 'chronological', label: 'Chronological', icon: TimelineIcon, description: 'Time-based relationship flow' },
  { value: 'intensity', label: 'Intensity', icon: TrendingUpIcon, description: 'Interaction frequency patterns' },
  { value: 'reciprocity', label: 'Reciprocity', icon: HandshakeIcon, description: 'Give and take balance' },
  { value: 'themes', label: 'Themes', icon: CategoryIcon, description: 'Content and context groupings' }
];

// Quick intelligence presets for executive decision-making
const INTELLIGENCE_PRESETS = [
  { 
    key: 'recent_activity', 
    label: 'Recent Activity', 
    icon: ScheduleIcon,
    description: 'Last 30 days of engagement',
    types: ['voice_memo', 'email', 'meeting'] as ArtifactType[]
  },
  { 
    key: 'strategic_insights', 
    label: 'Strategic Insights', 
    icon: PsychologyIcon,
    description: 'High-value intelligence and planning',
    types: ['voice_memo', 'note', 'meeting'] as ArtifactType[]
  },
  { 
    key: 'professional_context', 
    label: 'Professional Context', 
    icon: LinkedInIcon,
    description: 'Career developments and opportunities',
    types: ['linkedin_profile', 'meeting', 'note'] as ArtifactType[]
  }
];

interface Goal {
  id: string;
  title: string;
  status: string;
  category?: string;
  is_primary?: boolean;
}

interface EnhancedTimelineFiltersProps {
  filterTypes: ArtifactType[];
  onFilterChange: (types: ArtifactType[]) => void;
  viewMode?: string;
  onViewModeChange?: (mode: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  // Goal filtering props
  goals?: Goal[];
  selectedGoalIds?: string[];
  onGoalFilterChange?: (goalIds: string[]) => void;
}

export const EnhancedTimelineFilters: React.FC<EnhancedTimelineFiltersProps> = ({
  filterTypes,
  onFilterChange,
  viewMode = 'chronological',
  onViewModeChange,
  searchQuery = '',
  onSearchChange,
  goals = [],
  selectedGoalIds = [],
  onGoalFilterChange
}) => {
  const theme = useTheme();
  const [activePreset, setActivePreset] = useState<string | null>(null);
  
  const toggleFilter = (type: ArtifactType) => {
    if (filterTypes.includes(type)) {
      onFilterChange(filterTypes.filter(t => t !== type));
    } else {
      onFilterChange([...filterTypes, type]);
    }
    setActivePreset(null); // Clear preset when manually filtering
  };

  const applyPreset = (presetKey: string) => {
    const preset = INTELLIGENCE_PRESETS.find(p => p.key === presetKey);
    if (preset) {
      onFilterChange(preset.types);
      setActivePreset(presetKey);
    }
  };

  const clearAllFilters = () => {
    onFilterChange([]);
    onGoalFilterChange?.([]);
    setActivePreset(null);
  };

  return (
    <Box 
      sx={{
        mb: 6, // More spacing for executive presence
        backgroundColor: 'var(--color-background-premium)',
        borderRadius: 'var(--radius-large)', // 24px for executive presence
        border: '1px solid',
        borderColor: 'grey.200',
        boxShadow: 'var(--shadow-elevated)',
        overflow: 'hidden',
        position: 'relative',
        // Subtle texture overlay
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 30% 70%, rgba(33, 150, 243, 0.02) 0%, transparent 50%)`,
          opacity: 0.8,
          pointerEvents: 'none'
        }
      }}
      role="region"
      aria-labelledby="intelligence-controls-label"
    >
      {/* Executive Header */}
      <Box sx={{ 
        p: { xs: 3, md: 4 },
        borderBottom: '1px solid',
        borderColor: 'grey.100',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.95) 100%)',
        position: 'relative',
        zIndex: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <FilterListIcon sx={{ 
            color: 'primary.main', 
            fontSize: '24px',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
          }} />
          <Typography 
            id="intelligence-controls-label"
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}>
            Intelligence Controls
          </Typography>
        </Box>
        <Typography 
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontStyle: 'italic',
            maxWidth: '600px'
          }}>
          Curate your strategic view to surface the most relevant relationship intelligence
        </Typography>
      </Box>

      <Box sx={{ p: { xs: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
        {/* Executive Intelligence Presets */}
        <Box sx={{ mb: 5 }}>
          <Typography 
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              mb: 3,
              letterSpacing: '0.5px',
              fontSize: '1rem'
            }}>
            Executive Intelligence Presets
          </Typography>
          
          <Box sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            mb: 2
          }}>
            {INTELLIGENCE_PRESETS.map(preset => {
              const Icon = preset.icon;
              const isActive = activePreset === preset.key;
              
              return (
                <Tooltip 
                  key={preset.key}
                  title={preset.description}
                  placement="top"
                  arrow
                >
                  <Button
                    variant={isActive ? 'contained' : 'outlined'}
                    startIcon={<Icon />}
                    onClick={() => applyPreset(preset.key)}
                    sx={{
                      borderRadius: 'var(--radius-medium)',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '14px',
                      px: 3,
                      py: 1.5,
                      transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                      ...(isActive ? {
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        boxShadow: `0 4px 20px ${theme.palette.primary.main}40`,
                      } : {
                        borderColor: 'grey.300',
                        color: 'text.primary',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'primary.50',
                          transform: 'translateY(-1px)',
                          boxShadow: 'var(--shadow-card)'
                        }
                      })
                    }}
                  >
                    {preset.label}
                  </Button>
                </Tooltip>
              );
            })}
          </Box>
        </Box>

        {/* Strategic Search */}
        {onSearchChange && (
          <Box sx={{ mb: 5 }}>
            <Typography 
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 3,
                letterSpacing: '0.5px',
                fontSize: '1rem'
              }}>
              Strategic Discovery
            </Typography>
            
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search across all relationship intelligence..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 'var(--radius-medium)',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'grey.300',
                  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused': {
                    borderColor: 'primary.main',
                    boxShadow: `0 0 0 3px ${theme.palette.primary.main}15`,
                  }
                },
                '& .MuiOutlinedInput-input': {
                  padding: '14px 16px',
                  fontSize: '14px',
                  '&::placeholder': {
                    color: 'text.secondary',
                    fontStyle: 'italic'
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: '20px' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => onSearchChange('')}
                      sx={{ 
                        color: 'text.secondary',
                        transition: 'all 200ms ease',
                        '&:hover': {
                          color: 'text.primary',
                          backgroundColor: 'grey.100'
                        }
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined
              }}
            />
            
            {searchQuery && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ 
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  fontSize: '12px'
                }}>
                  🔍 Searching across artifact content, suggestions, and metadata for "{searchQuery}"
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Goal Filtering */}
        {goals.length > 0 && onGoalFilterChange && (
          <Box sx={{ mb: 5 }}>
            <Typography 
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 3,
                letterSpacing: '0.5px',
                fontSize: '1rem'
              }}>
              Goal Context Filter
            </Typography>
            
            <Autocomplete
              multiple
              options={goals}
              value={goals.filter(goal => selectedGoalIds.includes(goal.id))}
              onChange={(_, newValue) => {
                onGoalFilterChange(newValue.map(goal => goal.id));
              }}
              getOptionLabel={(option) => option.title}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  key={option.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 1
                  }}
                >
                  <GoalIcon 
                    sx={{ 
                      color: option.status === 'active' ? 'primary.main' : 'text.secondary',
                      fontSize: '18px' 
                    }} 
                  />
                  {option.is_primary && (
                    <PrimaryIcon 
                      sx={{ 
                        color: 'warning.main',
                        fontSize: '16px' 
                      }} 
                    />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {option.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.status} • {option.category?.replace('_', ' ') || 'other'}
                    </Typography>
                  </Box>
                </Box>
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id}
                    variant="outlined"
                    label={option.title}
                    icon={option.is_primary ? <PrimaryIcon fontSize="small" /> : <GoalIcon fontSize="small" />}
                    {...getTagProps({ index })}
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      backgroundColor: 'primary.50',
                      '& .MuiChip-icon': {
                        color: 'primary.main'
                      }
                    }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={selectedGoalIds.length === 0 ? "Filter by goals..." : ""}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 'var(--radius-medium)',
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'grey.300',
                      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused': {
                        borderColor: 'primary.main',
                        boxShadow: `0 0 0 3px ${theme.palette.primary.main}15`,
                      }
                    },
                    '& .MuiOutlinedInput-input': {
                      fontSize: '14px',
                      '&::placeholder': {
                        color: 'text.secondary',
                        fontStyle: 'italic'
                      }
                    }
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <GoalIcon sx={{ color: 'text.secondary', fontSize: '20px' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              sx={{
                '& .MuiAutocomplete-popupIndicator': {
                  color: 'text.secondary'
                },
                '& .MuiAutocomplete-clearIndicator': {
                  color: 'text.secondary'
                }
              }}
            />
            
            {selectedGoalIds.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ 
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  fontSize: '12px'
                }}>
                  🎯 Showing artifacts associated with {selectedGoalIds.length} selected goal{selectedGoalIds.length > 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* View Mode Selector */}
        {onViewModeChange && (
          <Box sx={{ mb: 5 }}>
            <Typography 
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 3,
                letterSpacing: '0.5px',
                fontSize: '1rem'
              }}>
              Analysis Perspective
            </Typography>
            
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && onViewModeChange(newMode)}
              sx={{ 
                backgroundColor: 'background.paper',
                borderRadius: 'var(--radius-medium)',
                border: '1px solid',
                borderColor: 'grey.200',
                boxShadow: 'var(--shadow-sm)',
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: 'var(--radius-medium) !important',
                  margin: '4px',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: 'text.secondary',
                  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    boxShadow: 'var(--shadow-card)',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'grey.50'
                  }
                }
              }}
            >
              {VIEW_MODES.map(mode => {
                const Icon = mode.icon;
                return (
                  <Tooltip key={mode.value} title={mode.description} arrow>
                    <ToggleButton value={mode.value}>
                      <Icon sx={{ fontSize: '16px', mr: 1 }} />
                      {mode.label}
                    </ToggleButton>
                  </Tooltip>
                );
              })}
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Intelligence Categories */}
        <Box>
          <Typography 
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              mb: 3,
              letterSpacing: '0.5px',
              fontSize: '1rem'
            }}>
            Intelligence Categories
          </Typography>
          
          {INTELLIGENCE_CATEGORIES.map((category, categoryIndex) => (
            <Box key={category.category} sx={{ mb: 4 }}>
              <Typography 
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 2,
                  fontSize: '13px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>
                {category.category}
              </Typography>
              <Typography 
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mb: 2,
                  fontStyle: 'italic',
                  fontSize: '13px'
                }}>
                {category.description}
              </Typography>
              
              <Box sx={{
                display: 'flex',
                gap: 1.5,
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                {category.filters.map(filter => {
                  const isActive = filterTypes.includes(filter.type);
                  const Icon = filter.icon;
                  const artifactColor = theme.palette.artifacts?.[filter.colorKey]?.main || theme.palette.primary.main;
                  
                  return (
                    <Chip
                      key={filter.type}
                      icon={<Icon sx={{ fontSize: '16px' }} />}
                      label={filter.label}
                      variant={isActive ? 'filled' : 'outlined'}
                      onClick={() => toggleFilter(filter.type)}
                      aria-pressed={isActive}
                      sx={{
                        backgroundColor: isActive ? artifactColor : 'background.paper',
                        color: isActive ? 'white' : artifactColor,
                        borderColor: artifactColor,
                        fontWeight: 600,
                        fontSize: '13px',
                        px: 2,
                        py: 0.5,
                        height: '36px',
                        borderRadius: 'var(--radius-medium)',
                        transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: isActive ? artifactColor : `${artifactColor}15`,
                          transform: 'translateY(-2px) scale(1.03)',
                          boxShadow: isActive 
                            ? `0 6px 20px ${artifactColor}40` 
                            : `0 4px 12px ${artifactColor}20`
                        }
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          ))}

          {/* Control Actions */}
          <Divider sx={{ my: 3, opacity: 0.6 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              {filterTypes.length === 0 && selectedGoalIds.length === 0
                ? 'All intelligence types visible' 
                : [
                    filterTypes.length > 0 ? `${filterTypes.length} intelligence ${filterTypes.length === 1 ? 'type' : 'types'}` : '',
                    selectedGoalIds.length > 0 ? `${selectedGoalIds.length} goal${selectedGoalIds.length === 1 ? '' : 's'}` : ''
                  ].filter(Boolean).join(' • ') + ' selected'
              }
            </Typography>
            
            {(filterTypes.length > 0 || selectedGoalIds.length > 0) && (
              <Button
                variant="text"
                onClick={clearAllFilters}
                sx={{
                  color: 'text.secondary',
                  fontSize: '13px',
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: 'var(--radius-medium)',
                  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                    color: 'text.primary'
                  }
                }}
              >
                Clear All Filters
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}; 