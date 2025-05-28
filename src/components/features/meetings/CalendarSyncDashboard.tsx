'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CalendarToday,
  Sync,
  CheckCircle,
  Error,
  Warning,
  Info,
  Refresh,
  Settings,
  CloudSync,
  Schedule,
  People,
  Event,
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/AuthContext';
import type { CalendarSyncLog } from '@/types/calendar';

interface CalendarSyncDashboardProps {
  className?: string;
}

interface SyncStatus {
  integration: {
    connected: boolean;
    connectedAt?: string;
    lastUpdated?: string;
    metadata?: Record<string, any>;
  };
  recentSyncs: CalendarSyncLog[];
}

export const CalendarSyncDashboard: React.FC<CalendarSyncDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [syncOptions, setSyncOptions] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxResults: 250,
    includeDeclined: false,
  });

  // Fetch sync status
  const fetchSyncStatus = async (): Promise<void> => {
    try {
      setError(null);
      const response = await fetch('/api/calendar/sync');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sync status');
      }
      
      const data = await response.json();
      setSyncStatus(data);
    } catch (err) {
      console.error('Error fetching sync status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sync status');
    } finally {
      setLoading(false);
    }
  };

  // Connect to Google Calendar
  const handleConnect = async (): Promise<void> => {
    try {
      setError(null);
      const response = await fetch('/api/calendar/auth');
      
      if (!response.ok) {
        throw new Error('Failed to initiate calendar connection');
      }
      
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error connecting calendar:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect calendar');
    }
  };

  // Trigger calendar sync
  const handleSync = async (): Promise<void> => {
    try {
      setError(null);
      setSyncing(true);
      
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          options: {
            startDate: new Date(syncOptions.startDate),
            endDate: new Date(syncOptions.endDate),
            maxResults: syncOptions.maxResults,
            includeDeclined: syncOptions.includeDeclined,
          },
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sync failed');
      }
      
      const result = await response.json();
      
      // Show success message and refresh status
      await fetchSyncStatus();
      setShowSyncDialog(false);
      
      // You could show a success toast here
      console.log('Sync completed:', result);
    } catch (err) {
      console.error('Error syncing calendar:', err);
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSyncStatus();
    }
  }, [user]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'info' => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'in_progress': return 'warning';
      default: return 'info';
    }
  };

  const getStatusIcon = (status: string): React.ReactElement => {
    switch (status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'failed': return <Error color="error" />;
      case 'in_progress': return <CloudSync color="warning" />;
      default: return <Info color="info" />;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" py={4}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading calendar status...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box className={className}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Connection Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
            <Box display="flex" alignItems="center">
              <CalendarToday sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6">Google Calendar Integration</Typography>
            </Box>
            <Tooltip title="Refresh status">
              <IconButton onClick={fetchSyncStatus} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          {syncStatus?.integration.connected ? (
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Chip
                  icon={<CheckCircle />}
                  label="Connected"
                  color="success"
                  variant="outlined"
                />
                <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                  Connected {formatDate(syncStatus.integration.connectedAt!)}
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    variant="contained"
                    startIcon={<Sync />}
                    onClick={() => setShowSyncDialog(true)}
                    disabled={syncing}
                    fullWidth
                  >
                    {syncing ? 'Syncing...' : 'Sync Calendar'}
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    onClick={handleConnect}
                    fullWidth
                  >
                    Reconnect
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Connect your Google Calendar to automatically import meeting artifacts
              </Typography>
              <Button
                variant="contained"
                startIcon={<CalendarToday />}
                onClick={handleConnect}
                size="large"
              >
                Connect Google Calendar
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Sync History */}
      {syncStatus?.integration.connected && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Sync History
            </Typography>

            {syncStatus.recentSyncs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No sync history available. Run your first sync to see results here.
              </Typography>
            ) : (
              <List>
                {syncStatus.recentSyncs.map((sync, index) => (
                  <React.Fragment key={sync.id}>
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(sync.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1">
                              {formatDate(sync.sync_started_at)}
                            </Typography>
                            <Chip
                              label={sync.status}
                              color={getStatusColor(sync.status)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {sync.events_processed} events processed • {sync.artifacts_created} artifacts created
                            </Typography>
                            {sync.errors && sync.errors.length > 0 && (
                              <Typography variant="body2" color="error">
                                {sync.errors.length} error(s) occurred
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < syncStatus.recentSyncs.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sync Options Dialog */}
      <Dialog open={showSyncDialog} onClose={() => setShowSyncDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Sync Calendar Events</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose the date range and options for syncing your calendar events.
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Start Date</Typography>
              <input
                type="date"
                value={syncOptions.startDate}
                onChange={(e) => setSyncOptions(prev => ({ ...prev, startDate: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>End Date</Typography>
              <input
                type="date"
                value={syncOptions.endDate}
                onChange={(e) => setSyncOptions(prev => ({ ...prev, endDate: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Max Results</Typography>
              <input
                type="number"
                value={syncOptions.maxResults}
                onChange={(e) => setSyncOptions(prev => ({ ...prev, maxResults: parseInt(e.target.value) || 250 }))}
                min="1"
                max="2500"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSyncDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSync}
            variant="contained"
            disabled={syncing}
            startIcon={syncing ? <CircularProgress size={16} /> : <Sync />}
          >
            {syncing ? 'Syncing...' : 'Start Sync'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 