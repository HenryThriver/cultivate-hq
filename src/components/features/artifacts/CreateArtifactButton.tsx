import React, { useState } from 'react';
import { Button, useTheme, type Theme, type SxProps } from '@mui/material';
import type { DbArtifact } from '@/types/database';
import { 
  Favorite as HeartIcon,
  Help as HandIcon,
  Assignment as TaskIcon,
  MeetingRoom as MeetingIcon,
  Email as EmailIcon,
  Mic as VoiceMemoIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { CreateArtifactModal } from './CreateArtifactModal';

// Contact interface for selection
interface Contact {
  id: string;
  name: string;
  email?: string;
  company?: string;
}

interface CreateArtifactButtonProps {
  artifactType: 'pog' | 'ask' | 'meeting' | 'email' | 'voice_memo' | 'task';
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  preSelectedContactId?: string;
  preSelectedContactName?: string;
  contacts?: Contact[];
  onArtifactCreated?: (artifactData: DbArtifact) => void;
  onArtifactCreating?: (artifactData: DbArtifact) => Promise<void>;
  children?: React.ReactNode;
  startIcon?: React.ReactNode;
  sx?: SxProps<Theme>;
}

// Configuration for button appearance
const getButtonConfig = (artifactType: string, theme: Theme) => {
  const configs = {
    pog: {
      icon: HeartIcon,
      label: 'A-POG',
      fullLabel: 'Add POG',
      colorKey: 'pog' as const,
    },
    ask: {
      icon: HandIcon,
      label: 'A-ASK',
      fullLabel: 'Add Ask',
      colorKey: 'ask' as const,
    },
    task: {
      icon: TaskIcon,
      label: 'A-TASK',
      fullLabel: 'Add Task',
      colorKey: 'action' as const,
    },
    meeting: {
      icon: MeetingIcon,
      label: 'A-MEETING',
      fullLabel: 'Add Meeting',
      colorKey: 'communication' as const,
    },
    email: {
      icon: EmailIcon,
      label: 'A-EMAIL',
      fullLabel: 'Add Email',
      colorKey: 'communication' as const,
    },
    voice_memo: {
      icon: VoiceMemoIcon,
      label: 'A-MEMO',
      fullLabel: 'Add Voice Memo',
      colorKey: 'communication' as const,
    },
    default: {
      icon: AddIcon,
      label: 'ADD',
      fullLabel: 'Add Artifact',
      colorKey: 'communication' as const,
    },
  };
  
  return configs[artifactType as keyof typeof configs] || configs.default;
};

export const CreateArtifactButton: React.FC<CreateArtifactButtonProps> = ({
  artifactType,
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  preSelectedContactId,
  preSelectedContactName,
  contacts = [],
  onArtifactCreated,
  onArtifactCreating,
  children,
  startIcon,
  sx,
}) => {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const config = getButtonConfig(artifactType, theme);
  const Icon = config.icon;
  
  const buttonColor = theme.palette.artifacts[config.colorKey].main;
  const buttonColorHover = theme.palette.artifacts[config.colorKey].dark;
  const buttonColorLight = theme.palette.artifacts[config.colorKey].light;

  const getButtonStyles = () => {
    const baseStyles = {
      textTransform: 'none' as const,
      fontWeight: 600,
      minWidth: size === 'small' ? 'auto' : 120,
      ...sx,
    };

    if (variant === 'contained') {
      return {
        ...baseStyles,
        backgroundColor: buttonColor,
        color: 'white',
        '&:hover': {
          backgroundColor: buttonColorHover,
        },
      };
    }

    if (variant === 'outlined') {
      return {
        ...baseStyles,
        borderColor: buttonColor,
        color: buttonColor,
        '&:hover': {
          borderColor: buttonColorHover,
          backgroundColor: buttonColorLight,
          color: buttonColorHover,
        },
      };
    }

    // text variant
    return {
      ...baseStyles,
      color: buttonColor,
      '&:hover': {
        backgroundColor: buttonColorLight,
        color: buttonColorHover,
      },
    };
  };

  const displayIcon = startIcon || <Icon sx={{ fontSize: size === 'small' ? 16 : 20 }} />;
  const displayText = children || (size === 'small' ? config.label : config.fullLabel);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        startIcon={displayIcon}
        onClick={() => setIsModalOpen(true)}
        sx={getButtonStyles()}
      >
        {displayText}
      </Button>

      <CreateArtifactModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        artifactType={artifactType}
        preSelectedContactId={preSelectedContactId}
        preSelectedContactName={preSelectedContactName}
        contacts={contacts}
        onArtifactCreated={(data) => {
          onArtifactCreated?.(data);
          setIsModalOpen(false);
        }}
        onArtifactCreating={onArtifactCreating}
      />
    </>
  );
};