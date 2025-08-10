'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Collapse,
  Typography,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Handshake as HandshakeIcon,
  Category as CategoryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Analytics as AnalyticsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import type { ArtifactType } from '@/types';

interface TimelineControlsBarProps {
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  
  // View Mode
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  
  // Filters
  filterTypes: ArtifactType[];
  onFilterChange: (types: ArtifactType[]) => void;
  availableTypes?: ArtifactType[];
  
  // Intelligence Dashboard Toggle
  showDashboard: boolean;
  onDashboardToggle: () => void;
  
  // Expanded state for filters
  expandedFilters?: boolean;
  onExpandFilters?: () => void;
}

const VIEW_MODES = [
  { value: 'chronological', label: 'Time', icon: TimelineIcon, tooltip: 'Chronological view' },
  { value: 'intensity', label: 'Intensity', icon: TrendingUpIcon, tooltip: 'Group by activity intensity' },
  { value: 'reciprocity', label: 'Exchange', icon: HandshakeIcon, tooltip: 'Group by value exchange' },
  { value: 'themes', label: 'Themes', icon: CategoryIcon, tooltip: 'Group by content themes' }
];

const FILTER_TYPE_LABELS: Record<string, string> = {
  'voice_memo': 'Voice',
  'email': 'Email',
  'meeting': 'Meeting',
  'note': 'Note',
  'linkedin_profile': 'LinkedIn',
  'pog': 'POG',
  'ask': 'Ask'
};

export const TimelineControlsBar: React.FC<TimelineControlsBarProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  filterTypes,
  onFilterChange,
  availableTypes = [],
  showDashboard,
  onDashboardToggle,
  expandedFilters = false,
  onExpandFilters
}) => {
  const theme = useTheme();
  const [localExpandedFilters, setLocalExpandedFilters] = useState(false);
  const isFiltersExpanded = onExpandFilters ? expandedFilters : localExpandedFilters;
  
  const handleExpandFilters = () => {
    if (onExpandFilters) {
      onExpandFilters();
    } else {
      setLocalExpandedFilters(!localExpandedFilters);
    }
  };
  
  const removeFilter = (typeToRemove: ArtifactType) => {
    onFilterChange(filterTypes.filter(t => t !== typeToRemove));
  };
  
  const clearAllFilters = () => {
    onFilterChange([]);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderRadius: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
        background: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(10px)',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Main Controls Row */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        flexWrap: { xs: 'wrap', md: 'nowrap' }
      }}>
        {/* Search Field - Primary Focus */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search all relationship intelligence..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          sx={{
            flex: { xs: '1 1 100%', md: '1 1 auto' },
            maxWidth: { md: '400px' },
            '& .MuiOutlinedInput-root': {
              borderRadius: 'var(--radius-medium)',
              backgroundColor: 'background.paper',
              transition: 'all 200ms ease',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.02)
              },
              '&.Mui-focused': {
                backgroundColor: 'background.paper',
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`
              }
            },
            '& .MuiOutlinedInput-input': {
              fontSize: '14px'
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
                  sx={{ p: 0.5 }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />

        {/* View Mode Toggle - Compact */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && onViewModeChange(newMode)}
          size="small"
          sx={{
            backgroundColor: alpha(theme.palette.action.hover, 0.04),
            borderRadius: 'var(--radius-medium)',
            '& .MuiToggleButton-root': {
              border: 'none',
              px: { xs: 1, md: 2 },
              py: 0.75,
              fontSize: '13px',
              textTransform: 'none',
              color: 'text.secondary',
              '&.Mui-selected': {
                backgroundColor: 'background.paper',
                color: 'primary.main',
                boxShadow: theme.shadows[1],
                '&:hover': {
                  backgroundColor: 'background.paper'
                }
              }
            }
          }}
        >
          {VIEW_MODES.map(mode => {
            const Icon = mode.icon;
            return (
              <Tooltip key={mode.value} title={mode.tooltip} arrow placement="bottom">
                <ToggleButton value={mode.value}>
                  <Icon sx={{ fontSize: '16px', mr: { xs: 0, sm: 0.5 } }} />
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                    {mode.label}
                  </Box>
                </ToggleButton>
              </Tooltip>
            );
          })}
        </ToggleButtonGroup>

        {/* Filter Chips / Expand Button */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          flex: { xs: '1 1 auto', md: '0 0 auto' }
        }}>
          {filterTypes.length > 0 && !isFiltersExpanded && (
            <>
              {filterTypes.slice(0, 2).map(type => (
                <Chip
                  key={type}
                  label={FILTER_TYPE_LABELS[type] || type}
                  size="small"
                  onDelete={() => removeFilter(type)}
                  sx={{
                    height: '28px',
                    fontSize: '12px',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    '& .MuiChip-deleteIcon': {
                      fontSize: '16px',
                      color: 'primary.main',
                      '&:hover': {
                        color: 'primary.dark'
                      }
                    }
                  }}
                />
              ))}
              {filterTypes.length > 2 && (
                <Chip
                  label={`+${filterTypes.length - 2}`}
                  size="small"
                  sx={{
                    height: '28px',
                    fontSize: '12px',
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    color: 'primary.main'
                  }}
                />
              )}
            </>
          )}
          
          <Button
            variant="text"
            size="small"
            startIcon={<FilterListIcon />}
            endIcon={isFiltersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={handleExpandFilters}
            sx={{
              textTransform: 'none',
              fontSize: '13px',
              color: filterTypes.length > 0 ? 'primary.main' : 'text.secondary',
              backgroundColor: filterTypes.length > 0 
                ? alpha(theme.palette.primary.main, 0.08)
                : 'transparent',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.12)
              }
            }}
          >
            Filters {filterTypes.length > 0 && `(${filterTypes.length})`}
          </Button>
        </Box>

        {/* Intelligence Dashboard Toggle */}
        <Button
          variant={showDashboard ? 'contained' : 'outlined'}
          size="small"
          startIcon={<AnalyticsIcon />}
          onClick={onDashboardToggle}
          sx={{
            ml: 'auto',
            textTransform: 'none',
            fontSize: '13px',
            px: 2,
            borderRadius: 'var(--radius-medium)',
            ...(showDashboard ? {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            } : {
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: alpha(theme.palette.primary.main, 0.04)
              }
            })
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            Intelligence
          </Box>
        </Button>
      </Box>

      {/* Expanded Filters Panel */}
      <Collapse in={isFiltersExpanded}>
        <Box sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          p: 2,
          backgroundColor: alpha(theme.palette.action.hover, 0.02)
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2
          }}>
            <Typography variant="subtitle2" sx={{ 
              fontWeight: 600,
              fontSize: '13px',
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Filter by Type
            </Typography>
            {filterTypes.length > 0 && (
              <Button
                size="small"
                onClick={clearAllFilters}
                sx={{
                  textTransform: 'none',
                  fontSize: '12px',
                  color: 'text.secondary'
                }}
              >
                Clear all
              </Button>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Object.entries(FILTER_TYPE_LABELS).map(([type, label]) => {
              const isActive = filterTypes.includes(type as ArtifactType);
              return (
                <Chip
                  key={type}
                  label={label}
                  onClick={() => {
                    if (isActive) {
                      removeFilter(type as ArtifactType);
                    } else {
                      onFilterChange([...filterTypes, type as ArtifactType]);
                    }
                  }}
                  variant={isActive ? 'filled' : 'outlined'}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    ...(isActive ? {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.dark'
                      }
                    } : {
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.04)
                      }
                    })
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};