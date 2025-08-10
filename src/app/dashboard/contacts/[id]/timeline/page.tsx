'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Chip,
  Avatar,
} from '@mui/material';
import NextLink from 'next/link';
import { 
  Home as HomeIcon, 
  NavigateNext as NavigateNextIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon 
} from '@mui/icons-material';
import { ArtifactTimeline } from '@/components/features/timeline/ArtifactTimeline';
import { TimelineControlsBar } from '@/components/features/timeline/TimelineControlsBar';
import { ArtifactDetailModal as StandardizedArtifactModal } from '@/components/features/contacts/profile/ArtifactDetailModal';
// import { EnhancedTimelineStats } from '@/components/features/timeline/EnhancedTimelineStats';
import { useContactProfile } from '@/lib/hooks/useContactProfile';
// Removed deprecated useLoops hook
import { useGmailIntegration } from '@/lib/hooks/useGmailIntegration';
// useArtifactTimeline is now handled within ArtifactTimeline component
import { useArtifactModalData } from '@/lib/hooks/useArtifactModalData';
import { BaseArtifact, LinkedInArtifactContent, ArtifactType } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function ContactTimelinePage() {
  const params = useParams();
  const contactId = params.id as string;
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [selectedArtifact, setSelectedArtifact] = useState<BaseArtifact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Timeline controls state
  const [filterTypes, setFilterTypes] = useState<ArtifactType[]>([]);
  const [viewMode, setViewMode] = useState<string>('chronological');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [expandedFilters, setExpandedFilters] = useState<boolean>(false);
  
  const { contact, isLoading, error } = useContactProfile(contactId);
  // Removed deprecated useLoops hook
  
  // Timeline data is now handled by the ArtifactTimeline component itself
  
  // Enhanced artifact modal data
  const {
    artifactDetails,
    // relatedSuggestions,
    // displayedContactProfileUpdates,
    contactName: artifactModalContactName,
    // isLoading: isLoadingArtifactModalData,
    // error: artifactModalDataError,
    fetchArtifactData,
    reprocessVoiceMemo,
    isReprocessing: isReprocessingArtifactModal,
    deleteArtifact: deleteArtifactModalFromHook,
    isDeleting,
    // playAudio,
  } = useArtifactModalData();
  
  // Gmail integration for automatic email sync
  const {
    isConnected: gmailConnected,
    isSyncing: emailSyncing,
  } = useGmailIntegration();

  // Automatic email sync when contact loads
  useEffect(() => {
    if (!contact || !gmailConnected || emailSyncing || !contactId) return;

    const emailAddresses = [];
    
    if (contact.email) {
      emailAddresses.push(contact.email);
    }
    
    if (contact.contact_emails && Array.isArray(contact.contact_emails)) {
      const additionalEmails = contact.contact_emails.map((ce: { email: string }) => ce.email);
      emailAddresses.push(...additionalEmails);
    }

    if (emailAddresses.length === 0) {
      console.log(`📧 No email addresses found for contact ${contact.name || contactId}`);
      return;
    }

    const lastSyncKey = `gmail_sync_${contactId}`;
    const lastSyncTime = localStorage.getItem(lastSyncKey);
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);

    if (lastSyncTime && parseInt(lastSyncTime) > fiveMinutesAgo) {
      console.log(`📧 Skipping sync for ${contact.name || contactId} - synced recently`);
      return;
    }

    console.log(`📧 Auto-syncing emails for contact ${contact.name || contactId}`);
    localStorage.setItem(lastSyncKey, now.toString());

    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    fetch('/api/gmail/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact_id: contactId,
        email_addresses: [...new Set(emailAddresses)],
        date_range: {
          start: sevenDaysAgo.toISOString(),
          end: today.toISOString(),
        },
        max_results: 100,
      }),
    })
    .then(async (response) => {
      const data = await response.json();
      if (response.ok) {
        console.log('📧 Email sync completed:', data);
        queryClient.invalidateQueries({ queryKey: ['artifactTimeline', contactId] });
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    })
    .catch((error) => {
      console.error('📧 Auto email sync failed:', error);
      localStorage.removeItem(lastSyncKey);
    });
  }, [contact, gmailConnected, contactId, emailSyncing, queryClient]);

  const handleArtifactClick = (artifact: BaseArtifact) => {
    // Fetch enhanced data for the modal
    fetchArtifactData(artifact.id, contactId);
    setSelectedArtifact(artifact);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArtifact(null);
  };

  // Loop handlers (currently unused but may be needed for loop artifacts)
  // const handleLoopStatusUpdate = async (loopId: string, newStatus: LoopStatus) => {
  //   try {
  //     if (!updateLoopStatus) { 
  //       console.warn('updateLoopStatus not available'); 
  //       return; 
  //     }
  //     await updateLoopStatus({ loopId, newStatus });
  //     await queryClient.invalidateQueries({ queryKey: ['artifactTimeline', contactId] });
  //     handleCloseModal();
  //   } catch (error) {
  //     console.error('Failed to update loop status:', error);
  //   }
  // };

  const handleMeetingContentSave = async (meetingId: string, contentType: 'notes' | 'transcript' | 'recording' | 'voice_memo', content: string | File) => {
    try {
      const formData = new FormData();
      formData.append('artifact_id', meetingId);
      formData.append('contact_id', contactId);
      formData.append('content_type', contentType);
      
      if (typeof content === 'string') {
        formData.append('content', content);
      } else {
        formData.append('file', content);
      }

      const response = await fetch('/api/meetings/content', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save meeting content');
      }

      // Refresh timeline data
      await queryClient.invalidateQueries({ queryKey: ['artifactTimeline', contactId] });
      
    } catch (error) {
      console.error('Failed to save meeting content:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !contact) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error?.message || 'Failed to load contact timeline. Please try again.'}
        </Alert>
      </Container>
    );
  }

  const profilePhotoUrl = (contact.linkedin_data as unknown as LinkedInArtifactContent)?.profilePicture;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Compact Header Bar */}
      <Box sx={{ 
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        px: 3,
        py: 2
      }}>
        <Container maxWidth="lg" disableGutters>
          {/* Breadcrumbs with integrated contact info */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Breadcrumbs 
                separator={<NavigateNextIcon fontSize="small" />} 
                aria-label="breadcrumb"
                sx={{ 
                  '& .MuiBreadcrumbs-separator': { mx: 0.5 },
                  '& .MuiLink-root': { fontSize: '14px' }
                }}
              >
                <MuiLink component={NextLink} underline="hover" color="inherit" href="/dashboard">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HomeIcon sx={{ mr: 0.5, fontSize: '18px' }} />
                    Dashboard
                  </Box>
                </MuiLink>
                <MuiLink 
                  component={NextLink} 
                  underline="hover" 
                  color="inherit" 
                  href={`/dashboard/contacts/${contactId}`}
                >
                  Contacts
                </MuiLink>
                <Typography color="text.primary" fontSize="14px">Timeline</Typography>
              </Breadcrumbs>
            </Box>
            
            {/* Contact Quick Info */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              ml: { xs: 0, md: 'auto' }
            }}>
              <Avatar 
                src={profilePhotoUrl || undefined} 
                alt={contact.name || undefined}
                sx={{ width: 32, height: 32 }}
              >
                {contact.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600, 
                  lineHeight: 1.2,
                  fontSize: '15px'
                }}>
                  {contact.name || 'Unnamed Contact'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {contact.company && (
                    <Chip 
                      icon={<BusinessIcon sx={{ fontSize: '14px' }} />}
                      label={contact.company} 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        height: '20px', 
                        fontSize: '11px',
                        '& .MuiChip-icon': { ml: 0.5 }
                      }}
                    />
                  )}
                  {contact.location && (
                    <Chip 
                      icon={<LocationIcon sx={{ fontSize: '14px' }} />}
                      label={contact.location} 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        height: '20px', 
                        fontSize: '11px',
                        '& .MuiChip-icon': { ml: 0.5 }
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Sticky Controls Bar */}
      <TimelineControlsBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterTypes={filterTypes}
        onFilterChange={setFilterTypes}
        showDashboard={showDashboard}
        onDashboardToggle={() => setShowDashboard(!showDashboard)}
        expandedFilters={expandedFilters}
        onExpandFilters={() => setExpandedFilters(!expandedFilters)}
      />

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Intelligence Dashboard is now handled within ArtifactTimeline component */}

        {/* Timeline Content - Now Immediately Visible */}
        <ArtifactTimeline
          contactId={contactId}
          onArtifactClick={handleArtifactClick}
          hideInternalControls // New prop to hide internal controls
          filterTypes={filterTypes}
          viewMode={viewMode}
          searchQuery={searchQuery}
          showDashboard={showDashboard} // Pass dashboard state
          // Don't pass timelineData/isLoading - let component handle its own data fetching
        />
      </Container>

      {/* Standardized Artifact Modal - Rich Contact Profile Style */}
      <StandardizedArtifactModal
        open={isModalOpen}
        onClose={handleCloseModal}
        artifact={artifactDetails || selectedArtifact}
        contactName={artifactModalContactName || contact.name || 'Contact'}
        contactId={contactId}
        currentUserId={user?.id || ''}
        onDelete={async (artifactId: string) => {
          await deleteArtifactModalFromHook(artifactId, contactId);
          setIsModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['artifactTimeline', contactId] });
        }}
        onReprocess={async (artifactId: string) => {
          await reprocessVoiceMemo(artifactId);
          queryClient.invalidateQueries({ queryKey: ['artifactTimeline', contactId] });
        }}
        isDeleting={isDeleting}
        isReprocessing={isReprocessingArtifactModal}
        onMeetingContentSave={handleMeetingContentSave}
      />
    </Box>
  );
}