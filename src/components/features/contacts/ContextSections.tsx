import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper, Typography } from '@mui/material';
import { Person, Work, Group, Timeline, Analytics } from '@mui/icons-material';

// Import the new comprehensive display components
import { PersonalContextDisplay } from './PersonalContext';
import { ProfessionalContextDisplay } from './ProfessionalContext';

// Import network components
import { NetworkVisualization } from './network/NetworkVisualization';
import { RelationshipManager } from './network/RelationshipManager';
import { GoalTargetManager } from './goals/GoalTargetManager';

// Import hooks
import { useContactNetworkIntelligence } from '@/lib/hooks/useContactNetworkIntelligence';
import { useReciprocityIntelligence } from '@/lib/hooks/useReciprocityIntelligence';

// Import the new comprehensive Contact type
import type { Contact, ProfessionalContext as ProfessionalContextTypeAlias, PersonalContext as PersonalContextTypeAlias } from '@/types';

interface ContextSectionsProps {
  contactData: Contact | null; // Use the new Contact type, allow null for loading states
  contactId: string; // Added contactId
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`contact-tabpanel-${index}`}
      aria-labelledby={`contact-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const ContextSections: React.FC<ContextSectionsProps> = ({ contactData, contactId }) => {
  const [tabValue, setTabValue] = useState(0);

  // Fetch network intelligence data
  const {
    networkIntelligence,
    isLoading: isLoadingNetwork,
    createRelationship,
    updateRelationshipSuccess,
    createGoalTarget,
    updateGoalTargetStatus,
  } = useContactNetworkIntelligence(contactId);

  if (!contactData) {
    return null; 
  }

  // contactData.professional_context is Json | null | undefined
  const professionalContextProp = contactData.professional_context 
    ? contactData.professional_context as ProfessionalContextTypeAlias 
    : undefined;
  
  // contactData.personal_context is Json | null | undefined  
  const personalContextProp = contactData.personal_context 
    ? contactData.personal_context as PersonalContextTypeAlias 
    : undefined;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Mock data for network visualization (TODO: Replace with real data)
  const mockNetworkNodes = networkIntelligence?.relationships.map(rel => ({
    id: rel.contact_a_id === contactId ? rel.contact_b_id : rel.contact_a_id,
    name: rel.contact_a_id === contactId ? 'Connected Contact' : 'Connected Contact', // TODO: Get actual names
    relationshipStrength: rel.strength,
    connectionType: rel.relationship_type,
  })) || [];

  const mockGoalTargets = networkIntelligence?.goalTargets.map(target => ({
    ...target,
    goal_title: 'Sample Goal', // TODO: Fetch actual goal title
    created_at: new Date(target.created_at),
    achieved_at: target.achieved_at ? new Date(target.achieved_at) : undefined,
    last_progress_update: target.last_progress_update ? new Date(target.last_progress_update) : undefined,
  })) || [];

  return (
    <Paper 
      elevation={0}
      sx={{ 
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)',
        overflow: 'hidden'
      }}
    >
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        aria-label="contact context tabs"
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          px: 2,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
          }
        }}
      >
        <Tab 
          icon={<Work />} 
          label="Professional" 
          iconPosition="start"
          sx={{ gap: 1 }}
        />
        <Tab 
          icon={<Person />} 
          label="Personal" 
          iconPosition="start"
          sx={{ gap: 1 }}
        />
        <Tab 
          icon={<Group />} 
          label="Network" 
          iconPosition="start"
          sx={{ gap: 1 }}
        />
        <Tab 
          icon={<Timeline />} 
          label="Timeline" 
          iconPosition="start"
          sx={{ gap: 1 }}
        />
        <Tab 
          icon={<Analytics />} 
          label="Analytics" 
          iconPosition="start"
          sx={{ gap: 1 }}
        />
      </Tabs>

      <Box sx={{ px: 3 }}>
        <TabPanel value={tabValue} index={0}>
          <ProfessionalContextDisplay 
            professionalContext={professionalContextProp} 
            contactId={contactId} 
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <PersonalContextDisplay 
            personalContext={personalContextProp} 
            contactId={contactId} 
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <NetworkVisualization
              contactId={contactId}
              contactName={contactData.name || 'Contact'}
              networkNodes={mockNetworkNodes}
              connections={networkIntelligence?.relationships || []}
              pathsToTargets={[]} // TODO: Calculate paths
              onCreateRelationship={(contactAId, contactBId, type) => {
                createRelationship({
                  contact_a_id: contactAId,
                  contact_b_id: contactBId,
                  relationship_type: type,
                  strength: 'medium',
                  created_at: new Date().toISOString(),
                });
              }}
              onUpdateRelationship={(connectionId, updates) => {
                console.log('Update relationship:', connectionId, updates);
              }}
              onSetGoalTarget={(contactId, goalId, description) => {
                console.log('Set goal target:', contactId, goalId, description);
              }}
              onRequestIntroduction={(fromContactId, toContactId) => {
                console.log('Request introduction:', fromContactId, toContactId);
              }}
            />

            <RelationshipManager
              contactId={contactId}
              contactName={contactData.name || 'Contact'}
              relationships={networkIntelligence?.relationships.map(rel => ({
                ...rel,
                contact_a_name: contactData.name || 'Contact',
                contact_b_name: 'Connected Contact', // TODO: Get actual name
                created_at: new Date(rel.created_at),
                introduction_date: rel.introduction_date ? new Date(rel.introduction_date) : undefined,
              })) || []}
              availableContacts={[]} // TODO: Fetch available contacts
              onCreateRelationship={async (relationship) => {
                await createRelationship({
                  ...relationship,
                  created_at: new Date().toISOString(),
                });
              }}
              onUpdateRelationship={async (id, updates) => {
                console.log('Update relationship:', id, updates);
              }}
              onDeleteRelationship={async (id) => {
                console.log('Delete relationship:', id);
              }}
              isLoading={isLoadingNetwork}
            />

            <GoalTargetManager
              contactId={contactId}
              contactName={contactData.name || 'Contact'}
              goalTargets={mockGoalTargets}
              availableGoals={[]} // TODO: Fetch available goals
              onCreateTarget={async (target) => {
                await createGoalTarget({
                  ...target,
                  created_at: new Date().toISOString(),
                });
              }}
              onUpdateTarget={async (id, updates) => {
                console.log('Update target:', id, updates);
              }}
              onDeleteTarget={async (id) => {
                console.log('Delete target:', id);
              }}
              onAchieveTarget={async (id, notes) => {
                await updateGoalTargetStatus(id, 'achieved', notes);
              }}
              isLoading={isLoadingNetwork}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Interaction Timeline
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Timeline view coming soon - will show all artifacts, interactions, and relationship events.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Relationship Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analytics view coming soon - will show relationship trends, reciprocity analysis, and network insights.
          </Typography>
        </TabPanel>
      </Box>
    </Paper>
  );
}; 