'use client';

import React, { useState } from 'react';
import { withFeatureFlagErrorBoundary } from './FeatureFlagErrorBoundary';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAllFeatureFlags, useIsAdmin, clearFeatureFlagCache } from '@/lib/hooks/useFeatureFlag';

interface CreateFlagDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateFlagDialog: React.FC<CreateFlagDialogProps> = ({ open, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          enabled_globally: false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      clearFeatureFlagCache();
      onCreated();
      onClose();
      setName('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create feature flag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Feature Flag</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Flag Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., new-dashboard"
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the feature"
            fullWidth
            multiline
            rows={2}
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleCreate} 
          variant="contained"
          disabled={!name.trim() || loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const FeatureFlagsManagerComponent: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { flags, loading: flagsLoading, error } = useAllFeatureFlags();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updatingFlags, setUpdatingFlags] = useState<Set<string>>(new Set());

  if (adminLoading) {
    return <CircularProgress />;
  }

  if (!isAdmin) {
    return (
      <Alert severity="error">
        Admin access required to manage feature flags.
      </Alert>
    );
  }

  const handleToggleGlobal = async (flagId: string, enabled: boolean) => {
    setUpdatingFlags(prev => new Set(prev).add(flagId));
    
    try {
      const response = await fetch(`/api/admin/feature-flags/${flagId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled_globally: enabled
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      clearFeatureFlagCache();
    } catch (err) {
      console.error('Failed to update feature flag:', err);
    } finally {
      setUpdatingFlags(prev => {
        const next = new Set(prev);
        next.delete(flagId);
        return next;
      });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Feature Flags Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Flag
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {flagsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {flags.length === 0 ? (
            <Card>
              <CardContent>
                <Typography color="text.secondary" align="center">
                  No feature flags created yet. Create your first flag to get started.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            flags.map((flag) => (
              <Card key={flag.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {flag.name}
                      </Typography>
                      {flag.description && (
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                          {flag.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={flag.enabled_globally ? 'Globally Enabled' : 'Globally Disabled'}
                          color={flag.enabled_globally ? 'success' : 'default'}
                          size="small"
                        />
                        {flag.has_override && (
                          <Chip
                            label={`Your Override: ${flag.user_enabled ? 'Enabled' : 'Disabled'}`}
                            color={flag.user_enabled ? 'primary' : 'secondary'}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">Global:</Typography>
                        <Switch
                          checked={flag.enabled_globally}
                          onChange={(e) => handleToggleGlobal(flag.id, e.target.checked)}
                          disabled={updatingFlags.has(flag.id)}
                        />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      <CreateFlagDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={() => {
          // The hook will automatically refetch
        }}
      />
    </Box>
  );
};

export const FeatureFlagsManager = withFeatureFlagErrorBoundary(FeatureFlagsManagerComponent);