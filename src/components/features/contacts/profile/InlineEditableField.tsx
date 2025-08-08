import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  IconButton, 
  Chip,
  Slider,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  Fade
} from '@mui/material';
import { 
  Edit, 
  Check, 
  Close, 
  Undo,
  AutoAwesome 
} from '@mui/icons-material';

type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'slider' | 'chip-array';

interface InlineEditableFieldProps {
  value: any;
  fieldType: FieldType;
  fieldKey: string;
  label?: string;
  placeholder?: string;
  
  // Type-specific props
  options?: Array<{ value: any; label: string }>; // for select
  min?: number; // for number/slider
  max?: number; // for number/slider
  step?: number; // for slider
  multiline?: boolean; // for textarea
  maxRows?: number; // for textarea
  
  // Change tracking
  isAiSuggested?: boolean;
  lastModified?: Date;
  modifiedBy?: 'ai' | 'user';
  
  // Callbacks
  onSave: (newValue: any, fieldKey: string) => Promise<void>;
  onCancel?: () => void;
  
  // Styling
  displayVariant?: 'body1' | 'body2' | 'subtitle1' | 'subtitle2' | 'h6';
  displayColor?: string;
  editIconColor?: string;
  
  // Validation
  validate?: (value: any) => string | null;
  
  // Permissions
  disabled?: boolean;
}

export const InlineEditableField: React.FC<InlineEditableFieldProps> = ({
  value,
  fieldType,
  fieldKey,
  label,
  placeholder,
  options = [],
  min = 0,
  max = 10,
  step = 1,
  multiline = false,
  maxRows = 4,
  isAiSuggested = false,
  lastModified,
  modifiedBy,
  onSave,
  onCancel,
  displayVariant = 'body2',
  displayColor,
  editIconColor = '#6b7280',
  validate,
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const originalValue = useRef(value);

  useEffect(() => {
    setEditValue(value);
    originalValue.current = value;
  }, [value]);

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setError(null);
    // Focus input after state update
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        if (fieldType === 'text' || fieldType === 'textarea') {
          inputRef.current.select();
        }
      }
    }, 0);
  };

  const handleSave = async () => {
    if (validate) {
      const validationError = validate(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(editValue, fieldKey);
      setIsEditing(false);
      setShowUndo(true);
      
      // Hide undo option after 5 seconds
      setTimeout(() => setShowUndo(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
    onCancel?.();
  };

  const handleUndo = async () => {
    setIsSaving(true);
    try {
      await onSave(originalValue.current, fieldKey);
      setShowUndo(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to undo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && fieldType !== 'textarea') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const renderDisplayValue = () => {
    if (fieldType === 'chip-array' && Array.isArray(value)) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {value.map((item, index) => (
            <Chip key={index} label={item} size="small" />
          ))}
          {value.length === 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {placeholder || 'No items'}
            </Typography>
          )}
        </Box>
      );
    }

    if (fieldType === 'select') {
      const selectedOption = options.find(opt => opt.value === value);
      return selectedOption?.label || value || placeholder;
    }

    if (fieldType === 'slider') {
      return `${value}${max <= 10 ? ` / ${max}` : ''}`;
    }

    return value || placeholder;
  };

  const renderEditComponent = () => {
    const commonProps = {
      value: editValue,
      onChange: (e: any) => setEditValue(e.target.value),
      onKeyDown: handleKeyDown,
      size: 'small' as const,
      error: !!error,
      helperText: error,
      inputRef,
      fullWidth: true,
    };

    switch (fieldType) {
      case 'textarea':
        return (
          <TextField
            {...commonProps}
            multiline
            maxRows={maxRows}
            placeholder={placeholder}
          />
        );

      case 'number':
        return (
          <TextField
            {...commonProps}
            type="number"
            inputProps={{ min, max, step }}
            placeholder={placeholder}
          />
        );

      case 'select':
        return (
          <FormControl size="small" fullWidth error={!!error}>
            <Select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'slider':
        return (
          <Box sx={{ px: 1, pb: 2 }}>
            <Slider
              value={editValue}
              onChange={(_, newValue) => setEditValue(newValue)}
              min={min}
              max={max}
              step={step}
              marks
              valueLabelDisplay="on"
              onChangeCommitted={() => handleSave()}
            />
          </Box>
        );

      case 'chip-array':
        return (
          <TextField
            {...commonProps}
            placeholder="Enter comma-separated values"
            onChange={(e) => {
              const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
              setEditValue(values);
            }}
            value={Array.isArray(editValue) ? editValue.join(', ') : ''}
          />
        );

      default:
        return (
          <TextField
            {...commonProps}
            placeholder={placeholder}
          />
        );
    }
  };

  if (isEditing) {
    return (
      <Box sx={{ position: 'relative' }}>
        {label && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {label}
          </Typography>
        )}
        
        {renderEditComponent()}
        
        <Box sx={{ display: 'flex', gap: 0.5, mt: 1, justifyContent: 'flex-end' }}>
          <IconButton 
            size="small" 
            onClick={handleSave}
            disabled={isSaving}
            color="primary"
          >
            <Check fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={handleCancel}
            disabled={isSaving}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        '&:hover .edit-icon': {
          opacity: disabled ? 0 : 1,
        }
      }}
    >
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        {label && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            {label}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant={displayVariant} 
            sx={{ 
              color: displayColor || 'inherit',
              cursor: disabled ? 'default' : 'pointer',
              '&:hover': disabled ? {} : { backgroundColor: '#f9fafb' },
              borderRadius: 1,
              px: 0.5,
              py: 0.25,
              minHeight: '1.5rem',
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={handleEdit}
          >
            {renderDisplayValue()}
          </Typography>
          
          {isAiSuggested && (
            <Tooltip title="AI suggested value">
              <AutoAwesome 
                fontSize="small" 
                sx={{ color: '#7c3aed', opacity: 0.7 }} 
              />
            </Tooltip>
          )}
        </Box>
        
        {lastModified && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {modifiedBy === 'ai' ? 'AI updated' : 'Manual edit'} • {lastModified.toLocaleDateString()}
          </Typography>
        )}
      </Box>

      {!disabled && (
        <Fade in={true}>
          <IconButton 
            className="edit-icon"
            size="small"
            onClick={handleEdit}
            sx={{ 
              opacity: 0,
              transition: 'opacity 0.2s',
              color: editIconColor,
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Fade>
      )}

      {showUndo && (
        <Tooltip title="Undo last change">
          <IconButton 
            size="small"
            onClick={handleUndo}
            disabled={isSaving}
            sx={{ 
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
          >
            <Undo fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};