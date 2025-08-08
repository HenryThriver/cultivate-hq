import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Avatar, 
  Chip, 
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Alert,
  Stack
} from '@mui/material';
import { 
  AccountCircle, 
  TrendingUp, 
  Share, 
  Add, 
  MoreVert,
  Close,
  GpsFixed as Target,
  Group,
  Timeline
} from '@mui/icons-material';
import { ConnectionPath } from './ConnectionPath';
import { calculateConnectionPaths } from '@/lib/utils/networkPathfinding';

interface NetworkNode {
  id: string;
  name: string;
  title?: string;
  company?: string;
  profilePicture?: string;
  relationshipStrength: 'weak' | 'medium' | 'strong';
  connectionType: 'introduced_by_me' | 'known_connection' | 'target_connection';
  isTargetForGoal?: {
    goalId: string;
    goalTitle: string;
    targetDescription: string;
  };
}

interface NetworkConnection {
  id: string;
  contact_a_id: string;
  contact_b_id: string;
  relationship_type: 'introduced_by_me' | 'known_connection' | 'target_connection';
  strength: 'weak' | 'medium' | 'strong';
  context?: string;
  introduction_date?: string;
  introduction_successful?: boolean;
  created_at?: string;
}

interface NetworkVisualizationProps {
  contactId: string;
  contactName: string;
  
  // Network data
  networkNodes: NetworkNode[];
  connections: NetworkConnection[];
  
  // Path to target data
  pathsToTargets: Array<{
    targetId: string;
    targetName: string;
    goalTitle: string;
    path: string[]; // Array of contact IDs representing the path
    pathLength: number;
  }>;
  
  // Event handlers
  onCreateRelationship: (contactAId: string, contactBId: string, type: NetworkConnection['relationship_type']) => void;
  onUpdateRelationship: (connectionId: string, updates: Partial<NetworkConnection>) => void;
  onSetGoalTarget: (contactId: string, goalId: string, description: string) => void;
  onRequestIntroduction: (fromContactId: string, toContactId: string) => void;
  
  // UI controls
  showPaths?: boolean;
  highlightedGoalId?: string;
  maxDisplayNodes?: number;
}

const getStrengthColor = (strength: 'weak' | 'medium' | 'strong') => {
  switch (strength) {
    case 'weak': return '#94a3b8';
    case 'medium': return '#3b82f6';
    case 'strong': return '#059669';
  }
};

const getConnectionTypeIcon = (type: 'introduced_by_me' | 'known_connection' | 'target_connection') => {
  switch (type) {
    case 'introduced_by_me': return '🤝';
    case 'known_connection': return '👥';
    case 'target_connection': return '🎯';
  }
};

export const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  contactId,
  contactName,
  networkNodes,
  connections,
  pathsToTargets,
  onCreateRelationship,
  onUpdateRelationship,
  onSetGoalTarget,
  onRequestIntroduction,
  showPaths = false,
  highlightedGoalId,
  maxDisplayNodes = 20,
}) => {
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [showAddRelationshipDialog, setShowAddRelationshipDialog] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; nodeId: string } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'paths' | 'targets'>('grid');
  const [activePathIndex, setActivePathIndex] = useState(0);

  // Calculate connection paths to target contacts
  const calculatedPaths = useMemo(() => {
    // Get target contact IDs from nodes that have goal targets
    const targetContactIds = networkNodes
      .filter(node => node.isTargetForGoal)
      .map(node => node.id);

    if (targetContactIds.length === 0) return [];

    // Convert network data to format expected by pathfinding utility
    const pathfindingNodes = networkNodes.map(node => ({
      id: node.id,
      name: node.name,
      relationshipStrength: node.relationshipStrength,
      connectionType: node.connectionType,
    }));

    const pathfindingConnections = connections.map(conn => ({
      id: conn.id,
      contact_a_id: conn.contact_a_id,
      contact_b_id: conn.contact_b_id,
      relationship_type: conn.relationship_type,
      strength: conn.strength,
      introduction_successful: conn.introduction_successful,
      context: conn.context,
    }));

    // Create contact details map
    const contactDetails = new Map(
      networkNodes.map(node => [
        node.id,
        {
          title: node.title,
          company: node.company,
          profilePicture: node.profilePicture,
        },
      ])
    );

    return calculateConnectionPaths(
      contactId,
      targetContactIds,
      pathfindingNodes,
      pathfindingConnections,
      contactDetails
    );
  }, [contactId, networkNodes, connections]);

  // Filter nodes based on current view and limits
  const displayedNodes = networkNodes
    .slice(0, maxDisplayNodes)
    .filter(node => {
      if (highlightedGoalId && viewMode === 'targets') {
        return node.isTargetForGoal?.goalId === highlightedGoalId;
      }
      return true;
    });

  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNode(node);
  };

  const handleNodeMenu = (event: React.MouseEvent<HTMLElement>, nodeId: string) => {
    event.stopPropagation();
    setMenuAnchor({ element: event.currentTarget, nodeId });
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const NetworkNodeCard: React.FC<{ node: NetworkNode; isCenter?: boolean }> = ({ 
    node, 
    isCenter = false 
  }) => {
    const strengthColor = getStrengthColor(node.relationshipStrength);
    const connectionIcon = getConnectionTypeIcon(node.connectionType);

    return (
      <Paper
        onClick={() => handleNodeClick(node)}
        sx={{
          p: 2,
          cursor: 'pointer',
          border: isCenter ? '3px solid #3b82f6' : `2px solid ${strengthColor}`,
          borderRadius: 2,
          backgroundColor: isCenter ? '#eff6ff' : 'white',
          position: 'relative',
          minWidth: 200,
          maxWidth: 220,
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {/* Connection type indicator */}
        <Box sx={{ position: 'absolute', top: 8, right: 8, fontSize: '1.2rem' }}>
          {connectionIcon}
        </Box>

        {/* More menu */}
        {!isCenter && (
          <IconButton
            size="small"
            onClick={(e) => handleNodeMenu(e, node.id)}
            sx={{ position: 'absolute', top: 4, right: 4 }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar
            src={node.profilePicture}
            sx={{ 
              width: 48, 
              height: 48, 
              mr: 1.5,
              border: `2px solid ${strengthColor}`,
            }}
          >
            {node.name.charAt(0).toUpperCase()}
          </Avatar>
          
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {isCenter ? contactName : node.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {node.title} {node.company && `at ${node.company}`}
            </Typography>
          </Box>
        </Box>

        {/* Goal target indicator */}
        {node.isTargetForGoal && (
          <Chip
            icon={<Target />}
            label={node.isTargetForGoal.goalTitle}
            size="small"
            sx={{
              backgroundColor: '#fef3c7',
              color: '#92400e',
              fontSize: '0.7rem',
              height: 24,
              mb: 1,
            }}
          />
        )}

        {/* Relationship strength indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Chip
            label={node.relationshipStrength}
            size="small"
            sx={{
              backgroundColor: `${strengthColor}20`,
              color: strengthColor,
              fontSize: '0.7rem',
              height: 20,
              textTransform: 'capitalize',
            }}
          />
          
          {node.connectionType === 'target_connection' && (
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRequestIntroduction(contactId, node.id);
              }}
              sx={{ fontSize: '0.7rem', textTransform: 'none' }}
            >
              Request Intro
            </Button>
          )}
        </Box>
      </Paper>
    );
  };

  const PathToTargetView: React.FC = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Paths to Target Contacts
      </Typography>
      
      {calculatedPaths.length === 0 ? (
        <Alert severity="info">
          No target paths identified yet. Set goal targets to see connection paths.
        </Alert>
      ) : (
        <Stack spacing={3}>
          {calculatedPaths.map((connectionPath, index) => {
            const targetNode = networkNodes.find(n => n.id === connectionPath.targetContactId);
            const goalTitle = targetNode?.isTargetForGoal?.goalTitle || 'Goal';
            const targetDescription = targetNode?.isTargetForGoal?.targetDescription || 'Target description';

            return (
              <ConnectionPath
                key={connectionPath.targetContactId}
                targetContactId={connectionPath.targetContactId}
                targetContactName={connectionPath.targetContactName}
                goalTitle={goalTitle}
                targetDescription={targetDescription}
                pathSteps={connectionPath.pathSteps}
                pathLength={connectionPath.pathLength}
                confidence={connectionPath.confidence}
                isActive={index === activePathIndex}
                currentStepIndex={0} // TODO: Track actual progress
                onMakeIntroduction={(fromContactId, toContactId) => {
                  onRequestIntroduction(fromContactId, toContactId);
                }}
                onUpdateStepStatus={(stepIndex, status) => {
                  console.log('Update step status:', stepIndex, status);
                  // TODO: Implement step status tracking
                }}
                onAddNote={(stepIndex, note) => {
                  console.log('Add note:', stepIndex, note);
                  // TODO: Implement note adding
                }}
                compact={false}
              />
            );
          })}
          
          {calculatedPaths.length > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              {calculatedPaths.map((_, index) => (
                <Button
                  key={index}
                  size="small"
                  variant={index === activePathIndex ? 'contained' : 'outlined'}
                  onClick={() => setActivePathIndex(index)}
                  sx={{ textTransform: 'none', minWidth: 'auto' }}
                >
                  Path {index + 1}
                </Button>
              ))}
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 2,
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Group sx={{ color: '#059669', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Network Intelligence
          </Typography>
          <Chip 
            label={`${networkNodes.length} connections`}
            size="small"
            sx={{ ml: 1, backgroundColor: '#ecfdf5', color: '#059669' }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('grid')}
            sx={{ textTransform: 'none' }}
          >
            Grid
          </Button>
          <Button
            size="small"
            variant={viewMode === 'paths' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('paths')}
            sx={{ textTransform: 'none' }}
          >
            Paths
          </Button>
          <Button
            size="small"
            variant={viewMode === 'targets' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('targets')}
            sx={{ textTransform: 'none' }}
          >
            Targets
          </Button>
        </Box>
      </Box>

      {/* Content based on view mode */}
      {viewMode === 'paths' ? (
        <PathToTargetView />
      ) : (
        <>
          {/* Network grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 2,
            mb: 3 
          }}>
            {/* Center contact */}
            <NetworkNodeCard 
              node={{
                id: contactId,
                name: contactName,
                relationshipStrength: 'strong',
                connectionType: 'known_connection',
              }} 
              isCenter 
            />
            
            {/* Connected contacts */}
            {displayedNodes.map((node) => (
              <NetworkNodeCard key={node.id} node={node} />
            ))}
          </Box>

          {networkNodes.length > maxDisplayNodes && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Showing {maxDisplayNodes} of {networkNodes.length} connections. 
              Use filters to refine the view.
            </Alert>
          )}
        </>
      )}

      {/* Add relationship button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          startIcon={<Add />}
          onClick={() => setShowAddRelationshipDialog(true)}
          sx={{ textTransform: 'none' }}
        >
          Add Connection
        </Button>
      </Box>

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={!!menuAnchor}
        onClose={closeMenu}
      >
        <MenuItem onClick={() => {
          // TODO: Navigate to contact
          console.log('View contact:', menuAnchor?.nodeId);
          closeMenu();
        }}>
          View Contact
        </MenuItem>
        <MenuItem onClick={() => {
          // TODO: Set as goal target
          console.log('Set as target:', menuAnchor?.nodeId);
          closeMenu();
        }}>
          Set as Goal Target
        </MenuItem>
        <MenuItem onClick={() => {
          // TODO: Request introduction
          if (menuAnchor?.nodeId) {
            onRequestIntroduction(contactId, menuAnchor.nodeId);
          }
          closeMenu();
        }}>
          Request Introduction
        </MenuItem>
      </Menu>

      {/* Node detail dialog */}
      <Dialog 
        open={!!selectedNode} 
        onClose={() => setSelectedNode(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Network Connection Details</Typography>
          <IconButton onClick={() => setSelectedNode(null)}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        {selectedNode && (
          <DialogContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                src={selectedNode.profilePicture}
                sx={{ width: 64, height: 64, mr: 2 }}
              >
                {selectedNode.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedNode.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedNode.title} {selectedNode.company && `at ${selectedNode.company}`}
                </Typography>
              </Box>
            </Box>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Relationship Strength</Typography>
                <Chip 
                  label={selectedNode.relationshipStrength}
                  sx={{ 
                    backgroundColor: `${getStrengthColor(selectedNode.relationshipStrength)}20`,
                    color: getStrengthColor(selectedNode.relationshipStrength),
                    textTransform: 'capitalize'
                  }}
                />
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>Connection Type</Typography>
                <Typography variant="body2">
                  {getConnectionTypeIcon(selectedNode.connectionType)} {' '}
                  {selectedNode.connectionType.replace(/_/g, ' ')}
                </Typography>
              </Box>
              
              {selectedNode.isTargetForGoal && (
                <Alert severity="info">
                  <Typography variant="subtitle2">Goal Target</Typography>
                  <Typography variant="body2">
                    {selectedNode.isTargetForGoal.targetDescription}
                  </Typography>
                </Alert>
              )}
            </Stack>
          </DialogContent>
        )}
      </Dialog>
    </Paper>
  );
};