import React, { useState, useRef } from 'react';
import { Fab, Box, Paper, MenuList, MenuItem, ListItemIcon, ListItemText, ClickAwayListener, Grow, Popper } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { 
  Favorite as HeartIcon,
  Help as HandIcon,
  Assignment as TaskIcon,
  MeetingRoom as MeetingIcon,
  Email as EmailIcon,
  Mic as VoiceMemoIcon,
} from '@mui/icons-material';
import { CreateArtifactModal } from '../artifacts/CreateArtifactModal';

// Contact interface for selection
interface Contact {
  id: string;
  name: string;
  email?: string;
  company?: string;
}

interface QuickAddProps {
  contacts?: Contact[];
  onArtifactCreated?: (artifactData: any) => void;
  onArtifactCreating?: (artifactData: any) => Promise<void>;
}

export const QuickAdd: React.FC<QuickAddProps> = ({
  contacts = [],
  onArtifactCreated,
  onArtifactCreating,
}) => {
  const [open, setOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedArtifactType, setSelectedArtifactType] = useState<'pog' | 'ask' | 'meeting' | 'email' | 'voice_memo' | 'task'>('pog');
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  const handleOpenCreateModal = (artifactType: typeof selectedArtifactType) => {
    setSelectedArtifactType(artifactType);
    setIsCreateModalOpen(true);
    setOpen(false);
  };

  const menuItems = [
    { 
      label: 'Add POG', 
      icon: <HeartIcon fontSize="small" />, 
      action: () => handleOpenCreateModal('pog'),
      color: '#10B981' // Emerald green for POGs
    },
    { 
      label: 'Add Ask', 
      icon: <HandIcon fontSize="small" />, 
      action: () => handleOpenCreateModal('ask'),
      color: '#F97316' // Orange for Asks
    },
    { 
      label: 'Add Task', 
      icon: <TaskIcon fontSize="small" />, 
      action: () => handleOpenCreateModal('task'),
      color: '#8B5CF6' // Violet for Tasks
    },
    { 
      label: 'Add Meeting', 
      icon: <MeetingIcon fontSize="small" />, 
      action: () => handleOpenCreateModal('meeting'),
      color: '#0EA5E9' // Sky blue for Meetings
    },
    { 
      label: 'Add Email', 
      icon: <EmailIcon fontSize="small" />, 
      action: () => handleOpenCreateModal('email'),
      color: '#64748B' // Slate for Emails
    },
    { 
      label: 'Add Voice Memo', 
      icon: <VoiceMemoIcon fontSize="small" />, 
      action: () => handleOpenCreateModal('voice_memo'),
      color: '#64748B' // Slate for Voice Memos
    },
  ];

  return (
    <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1300 }}> {/* Increased zIndex to be above most things */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleToggle}
        ref={anchorRef}
        sx={{
          backgroundColor: '#4f46e5', // indigo-600
          '&:hover': {
            backgroundColor: '#4338ca', // indigo-700
          },
          width: 56, 
          height: 56,
        }}
      >
        <MoreHorizIcon />
      </Fab>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="top-end"
        transition
        disablePortal // To ensure it uses the parent Box zIndex context correctly
        sx={{ zIndex: 1300 }} // Ensure Popper itself has high zIndex
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'top-end' ? 'right bottom' : 'left top',
            }}
          >
            <Paper 
                elevation={8} 
                sx={{
                    mb: 1, 
                    borderRadius: '0.5rem', /* rounded-lg */
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)', /* shadow-xl */
                    minWidth: '180px'
                }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="quick-add-menu"
                  onKeyDown={handleListKeyDown}
                  sx={{ p: 1, '& .MuiMenuItem-root': { borderRadius: '0.25rem', mb: '2px' } }} /* py-1 from HTML example for MenuList items */
                >
                  {menuItems.map((item) => (
                    <MenuItem 
                        key={item.label} 
                        onClick={(event) => { item.action(); handleClose(event); }} 
                        sx={{
                            fontSize: '0.875rem', /* text-sm */
                            color: '#374151', /* gray-700 */
                            padding: '0.375rem 0.75rem', /* py-1.5 px-3 to match HTML */
                            '&:hover': {
                                backgroundColor: '#f3f4f6', /* gray-100 */
                            }
                        }}
                    >
                      <ListItemIcon sx={{minWidth: '32px', color: item.color || 'inherit'}}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>

      {/* Create Artifact Modal */}
      <CreateArtifactModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        artifactType={selectedArtifactType}
        contacts={contacts}
        onArtifactCreated={onArtifactCreated}
        onArtifactCreating={onArtifactCreating}
      />
    </Box>
  );
}; 