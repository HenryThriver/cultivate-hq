'use client';

import React, { useState, useEffect } from 'react';
import { FeatureFlagErrorBoundary } from '@/components/features/admin/FeatureFlagErrorBoundary';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import NextLink from 'next/link';

interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  enabled_globally: boolean;
  override_count: number;
  created_at: string;
  updated_at: string;
}

function FeatureFlagsPageContent(): React.JSX.Element {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled_globally: false
  });

  // Load feature flags
  const loadFlags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/feature-flags');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load feature flags');
      }
      
      setFlags(data.flags);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleCreateFlag = async () => {
    if (!formData.name.trim()) {
      setError('Flag name is required');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create feature flag');
      }

      setCreateDialogOpen(false);
      setFormData({ name: '', description: '', enabled_globally: false });
      loadFlags();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFlag = async () => {
    if (!selectedFlag) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/admin/feature-flags/${selectedFlag.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update feature flag');
      }

      setEditDialogOpen(false);
      setSelectedFlag(null);
      loadFlags();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFlag = async (flag: FeatureFlag) => {
    if (!confirm(`Are you sure you want to delete the feature flag "${flag.name}"? This will also remove all user overrides.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/feature-flags/${flag.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete feature flag');
      }

      loadFlags();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const openEditDialog = (flag: FeatureFlag) => {
    setSelectedFlag(flag);
    setFormData({
      name: flag.name,
      description: flag.description || '',
      enabled_globally: flag.enabled_globally
    });
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={NextLink} href="/dashboard" underline="hover">
          Dashboard
        </Link>
        <Link component={NextLink} href="/dashboard/admin" underline="hover">
          Admin
        </Link>
        <Typography color="text.primary">Feature Flags</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Feature Flag Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage system feature flags and user-specific overrides
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Flag
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Feature Flags Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Global Status</TableCell>
                <TableCell>User Overrides</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <FlagIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No feature flags yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create your first feature flag to get started
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                flags.map((flag) => (
                  <TableRow key={flag.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                        {flag.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {flag.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={flag.enabled_globally ? 'Enabled' : 'Disabled'}
                        color={flag.enabled_globally ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${flag.override_count} users`}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(flag.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => openEditDialog(flag)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteFlag(flag)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Feature Flag Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Feature Flag</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Flag Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="new_feature_name"
              helperText="Use lowercase letters, numbers, hyphens, and underscores only"
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of what this flag controls"
              multiline
              rows={3}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.enabled_globally}
                  onChange={(e) => setFormData({ ...formData, enabled_globally: e.target.checked })}
                />
              }
              label="Enable globally by default"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateFlag} 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Feature Flag Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Feature Flag</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Flag Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              helperText="Use lowercase letters, numbers, hyphens, and underscores only"
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.enabled_globally}
                  onChange={(e) => setFormData({ ...formData, enabled_globally: e.target.checked })}
                />
              }
              label="Enable globally"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateFlag} 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default function FeatureFlagsPage(): React.JSX.Element {
  const handleRetry = () => {
    // Force a page reload to retry loading
    window.location.reload();
  };

  return (
    <FeatureFlagErrorBoundary onRetry={handleRetry}>
      <FeatureFlagsPageContent />
    </FeatureFlagErrorBoundary>
  );
}