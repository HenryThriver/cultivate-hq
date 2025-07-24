'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  Search as SearchIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import NextLink from 'next/link';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  company: string | null;
  job_title: string | null;
  feature_override_count: number;
}

interface FeatureOverride {
  id: string;
  feature_flag_id: string;
  enabled: boolean;
  feature_flags: {
    id: string;
    name: string;
    description: string | null;
  };
}

export default function UsersPage(): React.JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userOverrides, setUserOverrides] = useState<FeatureOverride[]>([]);
  const [overridesDialogOpen, setOverridesDialogOpen] = useState(false);
  const [loadingOverrides, setLoadingOverrides] = useState(false);

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll use the existing contacts table as a placeholder
      // In a real implementation, you'd want to create a proper users API endpoint
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        if (response.status === 404) {
          // API endpoint doesn't exist yet, show placeholder data
          setUsers([]);
          return;
        }
        throw new Error('Failed to load users');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. User management API endpoints are not yet implemented.');
      // Show placeholder data for demonstration
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load user feature overrides
  const loadUserOverrides = async (userId: string) => {
    try {
      setLoadingOverrides(true);
      const response = await fetch(`/api/admin/user-feature-overrides?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load user overrides');
      }
      
      const data = await response.json();
      setUserOverrides(data.overrides || []);
    } catch (err) {
      console.error('Error loading user overrides:', err);
      setUserOverrides([]);
    } finally {
      setLoadingOverrides(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleViewOverrides = async (user: User) => {
    setSelectedUser(user);
    setOverridesDialogOpen(true);
    await loadUserOverrides(user.id);
  };

  const toggleUserAdmin = async (user: User) => {
    try {
      // This would be implemented with a proper API endpoint
      alert(`Toggle admin status for ${user.email} - API endpoint not yet implemented`);
    } catch {
      setError('Failed to update user admin status');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

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
        <Typography color="text.primary">Users</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage user accounts, roles, and feature flag overrides
        </Typography>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search users by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Feature Overrides</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      {searchTerm ? 'No users found' : 'User management API not yet implemented'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm 
                        ? 'Try adjusting your search terms' 
                        : 'This feature will be available after the database migrations are applied'
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <PersonIcon color="primary" />
                        <Typography variant="subtitle2">
                          {user.full_name || 'Unknown User'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={user.is_admin ? <AdminIcon /> : <PersonIcon />}
                        label={user.is_admin ? 'Admin' : 'User'}
                        color={user.is_admin ? 'secondary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.company || 'N/A'}
                      </Typography>
                      {user.job_title && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {user.job_title}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${user.feature_override_count} flags`}
                        variant="outlined"
                        size="small"
                        color={user.feature_override_count > 0 ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(user.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Feature Overrides">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewOverrides(user)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.is_admin ? "Remove Admin" : "Make Admin"}>
                          <IconButton 
                            size="small" 
                            color={user.is_admin ? "error" : "success"}
                            onClick={() => toggleUserAdmin(user)}
                          >
                            <AdminIcon />
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

      {/* User Feature Overrides Dialog */}
      <Dialog 
        open={overridesDialogOpen} 
        onClose={() => setOverridesDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Feature Flag Overrides for {selectedUser?.full_name || selectedUser?.email}
        </DialogTitle>
        <DialogContent>
          {loadingOverrides ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : userOverrides.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <FlagIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No feature flag overrides
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This user is using all global feature flag settings
              </Typography>
            </Box>
          ) : (
            <List>
              {userOverrides.map((override) => (
                <ListItem key={override.id} divider>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>
                        {override.feature_flags.name}
                      </Typography>
                    }
                    secondary={override.feature_flags.description || 'No description'}
                  />
                  <ListItemSecondaryAction>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={override.enabled}
                          onChange={() => {
                            // Would implement toggle functionality here
                            alert('Override toggle not yet implemented');
                          }}
                          size="small"
                        />
                      }
                      label={override.enabled ? 'Enabled' : 'Disabled'}
                      labelPlacement="start"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}