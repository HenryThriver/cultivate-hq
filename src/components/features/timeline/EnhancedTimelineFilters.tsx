'use client';

import React from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import { 
  Mic as MicIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Event as EventIcon,
  Note as NoteIcon
} from '@mui/icons-material';
import type { ArtifactType } from '@/types';

// Using strategic labels instead of generic ones
const FILTER_OPTIONS = [
  { type: 'voice_memo' as ArtifactType, label: 'Voice Intelligence', icon: MicIcon, colorKey: 'insight' },
  { type: 'note' as ArtifactType, label: 'Strategic Notes', icon: NoteIcon, colorKey: 'action' },
  { type: 'email' as ArtifactType, label: 'Correspondence', icon: EmailIcon, colorKey: 'communication' },
  { type: 'meeting' as ArtifactType, label: 'Live Connections', icon: EventIcon, colorKey: 'meeting' },
  { type: 'linkedin_profile' as ArtifactType, label: 'Professional Intel', icon: LinkedInIcon, colorKey: 'communication' }
];

interface EnhancedTimelineFiltersProps {
  filterTypes: ArtifactType[];
  onFilterChange: (types: ArtifactType[]) => void;
}

export const EnhancedTimelineFilters: React.FC<EnhancedTimelineFiltersProps> = ({
  filterTypes,
  onFilterChange
}) => {
  const theme = useTheme();
  
  const toggleFilter = (type: ArtifactType) => {
    if (filterTypes.includes(type)) {
      onFilterChange(filterTypes.filter(t => t !== type));
    } else {
      onFilterChange([...filterTypes, type]);
    }
  };

  return (
    <Box 
      sx={{
        mb: 4, // Following 8px grid
        p: { xs: 2.5, md: 3 }, // Sophisticated spacing
        backgroundColor: 'background.paper',
        borderRadius: 'var(--radius-medium)', // 12px
        border: 1,
        borderColor: 'grey.300',
        boxShadow: 'var(--shadow-card)',
        transition: 'all 300ms var(--ease-confident)',
        '&:hover': {
          boxShadow: 'var(--shadow-card-hover)',
        }
      }}
      role="group"
      aria-labelledby="filter-group-label"
    >
      <Typography 
        id="filter-group-label"
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: 2, // Following 8px grid
          letterSpacing: '0.5px'
        }}>
        Strategic View Options
      </Typography>
      
      <Box sx={{
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {FILTER_OPTIONS.map(option => {
          const isActive = filterTypes.includes(option.type);
          const Icon = option.icon;
          const artifactColor = theme.palette.artifacts?.[option.colorKey]?.main || theme.palette.primary.main;
          
          return (
            <Chip
              key={option.type}
              icon={<Icon sx={{ fontSize: '16px' }} />}
              label={option.label}
              variant={isActive ? 'filled' : 'outlined'}
              onClick={() => toggleFilter(option.type)}
              aria-pressed={isActive}
              sx={{
                backgroundColor: isActive ? artifactColor : 'background.paper',
                color: isActive ? 'white' : artifactColor,
                borderColor: artifactColor,
                fontWeight: 500,
                fontSize: '13px',
                transition: 'all 300ms var(--ease-confident)',
                '&:hover': {
                  backgroundColor: isActive ? artifactColor : `${artifactColor}10`,
                  transform: 'translateY(-1px) scale(1.02)',
                  boxShadow: 'var(--shadow-sm)'
                }
              }}
            />
          );
        })}
        
        {filterTypes.length > 0 && (
          <Chip
            label="Clear All"
            variant="outlined"
            onClick={() => onFilterChange([])}
            aria-label="Clear all active filters"
            sx={{
              borderColor: 'grey.500',
              color: 'text.secondary',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 300ms var(--ease-confident)',
              '&:hover': {
                backgroundColor: 'grey.100',
                transform: 'translateY(-1px)',
                boxShadow: 'var(--shadow-sm)'
              }
            }}
          />
        )}
      </Box>
    </Box>
  );
}; 