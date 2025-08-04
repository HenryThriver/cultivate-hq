import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  Chip,
  IconButton,
  Divider,
  useTheme
} from '@mui/material';
import { Close as CloseIcon, Loop as LoopIcon } from '@mui/icons-material';
import { CreateArtifactModal } from '../../artifacts/CreateArtifactModal';

interface ActiveExchange {
  id: string;
  title: string;
  description?: string;
  type: 'pog' | 'ask';
  status: 'queued' | 'active' | 'pending' | 'delivered';
  createdAt: Date;
  contactName: string;
  sourceArtifact?: {
    type: string;
    title: string;
    date: Date;
  };
}

interface Contact {
  id: string;
  name: string;
  email?: string;
  company?: string;
}

interface ActiveExchangesModalProps {
  open: boolean;
  onClose: () => void;
  exchanges: ActiveExchange[];
  type: 'pog' | 'ask' | 'all';
  contactName: string;
  contactId: string;
  contacts?: Contact[];
  onExchangeClick?: (exchangeId: string) => void;
  onArtifactCreated?: (artifactData: any) => void;
  onArtifactCreating?: (artifactData: any) => Promise<void>;
}

export const ActiveExchangesModal: React.FC<ActiveExchangesModalProps> = ({
  open,
  onClose,
  exchanges,
  type,
  contactName,
  contactId,
  contacts = [],
  onExchangeClick,
  onArtifactCreated,
  onArtifactCreating,
}) => {
  const theme = useTheme();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredExchanges = type === 'all' 
    ? exchanges 
    : exchanges.filter(exchange => exchange.type === type);

  const getExchangeColor = (exchangeType: 'pog' | 'ask') => {
    return exchangeType === 'pog' 
      ? theme.palette.artifacts.pog 
      : theme.palette.artifacts.ask;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.palette.artifacts.loop.main;
      case 'pending': return theme.palette.warning.main;
      case 'delivered': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const getTitle = () => {
    if (type === 'all') return `Active Exchanges with ${contactName}`;
    return type === 'pog' 
      ? `Active POGs with ${contactName}` 
      : `Active Asks with ${contactName}`;
  };

  return (
    <>
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 'var(--shadow-card-focus)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LoopIcon sx={{ color: theme.palette.artifacts.loop.main }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {getTitle()}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {filteredExchanges.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              No {type === 'all' ? '' : type.toUpperCase() + ' '}exchanges found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {type === 'pog' ? 'No active POGs with this contact' : 
               type === 'ask' ? 'No active Asks with this contact' : 
               'No active exchanges with this contact'}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filteredExchanges.map((exchange, index) => (
              <React.Fragment key={exchange.id}>
                {index > 0 && <Divider sx={{ my: 1 }} />}
                <ListItem 
                  disablePadding
                  sx={{ 
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    py: 2,
                    px: 1,
                    borderRadius: 2,
                    cursor: onExchangeClick ? 'pointer' : 'default',
                    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: onExchangeClick ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.02)',
                      transform: onExchangeClick ? 'translateY(-1px)' : 'none',
                      boxShadow: onExchangeClick ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                    }
                  }}
                  onClick={() => onExchangeClick?.(exchange.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                    {/* Type Indicator */}
                    <Box sx={{ 
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      backgroundColor: getExchangeColor(exchange.type).light,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.5
                    }}>
                      <Typography variant="caption" sx={{ 
                        fontWeight: 700,
                        color: getExchangeColor(exchange.type).main,
                        fontSize: '0.75rem'
                      }}>
                        {exchange.type.toUpperCase()}
                      </Typography>
                    </Box>

                    {/* Content */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: 600,
                          color: 'text.primary',
                          lineHeight: 1.3
                        }}>
                          {exchange.title}
                        </Typography>
                        <Chip 
                          label={exchange.status}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(exchange.status)}20`,
                            color: getStatusColor(exchange.status),
                            fontWeight: 500,
                            ml: 1,
                            flexShrink: 0
                          }}
                        />
                      </Box>

                      {exchange.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.4 }}>
                          {exchange.description}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Created: {formatDate(exchange.createdAt)}
                        </Typography>
                        
                        {exchange.sourceArtifact && (
                          <>
                            <Typography variant="caption" color="text.secondary">•</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              From {exchange.sourceArtifact.type}: {exchange.sourceArtifact.title}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {(type === 'pog' || type === 'ask') && (
          <Button 
            variant="contained" 
            onClick={() => {
              setIsCreateModalOpen(true);
              // Temporarily hide parent modal to avoid focus conflicts
              onClose();
            }}
            sx={{ 
              textTransform: 'none',
              backgroundColor: type === 'pog' 
                ? theme.palette.artifacts.pog.main 
                : theme.palette.artifacts.ask.main,
              '&:hover': {
                backgroundColor: type === 'pog' 
                  ? theme.palette.artifacts.pog.dark 
                  : theme.palette.artifacts.ask.dark,
              }
            }}
          >
            + Add New {type === 'pog' ? 'POG' : 'Ask'}
          </Button>
        )}
      </DialogActions>

    </Dialog>
    
    {/* Create Artifact Modal - Rendered outside the Dialog to avoid nesting */}
    {(type === 'pog' || type === 'ask') && (
      <CreateArtifactModal
        open={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          // Don't reopen parent modal on cancel to avoid confusion
        }}
        artifactType={type}
        preSelectedContactId={contactId}
        preSelectedContactName={contactName}
        contacts={contacts}
        onArtifactCreated={(data) => {
          onArtifactCreated?.(data);
          setIsCreateModalOpen(false);
          // Don't reopen parent modal after creation - user likely wants to continue elsewhere
        }}
        onArtifactCreating={onArtifactCreating}
      />
    )}
    </>
  );
};