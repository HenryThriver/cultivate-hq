'use client';

export const dynamic = 'force-dynamic'; // Ensures the page is always dynamically rendered

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Box, Typography, CircularProgress, Alert, Button, Card, Stack } from '@mui/material';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Dashboard } from '@mui/icons-material';
import { supabase } from '@/lib/supabase/client';
import { default as nextDynamic } from 'next/dynamic';
import { useQueryClient, useQuery } from '@tanstack/react-query';

// Import actual components
import { ContactHeader } from '@/components/features/contacts/ContactHeader';
import { NextConnection } from '@/components/features/contacts/NextConnection';
import { ActionItemStatus as ActionQueuesActionItemStatus } from '@/components/features/contacts/ActionQueues';
import { ContextSections } from '@/components/features/contacts/ContextSections';
import { StandardizedArtifactModal } from '@/components/features/artifacts/StandardizedArtifactModal';

// Import LoopDashboard
// import { LoopDashboard } from '@/components/features/loops/LoopDashboard'; // Deprecated - functionality moved to artifacts and actions
// Import LoopSuggestions
// import { LoopSuggestions } from '@/components/features/loops/LoopSuggestions'; // Deprecated - functionality moved to artifacts and actions

// Import EnhancedLoopModal NEW
// import { EnhancedLoopModal } from '@/components/features/loops/EnhancedLoopModal'; // Deprecated - functionality moved to artifacts and actions

// Dynamically import VoiceRecorder for modal
const VoiceRecorder = nextDynamic(() => 
  import('@/components/features/voice-memos/VoiceRecorder').then(mod => mod.VoiceRecorder),
  { 
    ssr: false, 
    loading: () => <CircularProgress size={20} sx={{display: 'block', margin: 'auto'}} /> 
  }
);

// Suggestion components are now integrated into ContactHeader
// Placeholder for the new VoiceMemoDetailModal
import { VoiceMemoDetailModal } from '@/components/features/voice/VoiceMemoDetailModal'; // Uncommented

// Import MeetingManager for Phase V integration
import { MeetingManager } from '@/components/features/meetings/MeetingManager';

// Import ContactEmailManagement for email management
import { ContactEmailManagement } from '@/components/features/contacts/ContactEmailManagement';

// Import LinkedIn components
import { LinkedInPostsSyncStatus } from '@/components/features/linkedin';

// Import OnboardingTour for walkthrough
import { OnboardingTour } from '@/components/features/onboarding/OnboardingTour';

// Import new redesigned components
import { RelationshipPulseDashboard } from '@/components/features/contacts/profile/RelationshipPulseDashboard';
import { ActionIntelligenceCenter } from '@/components/features/contacts/profile/ActionIntelligenceCenter';
import { ArtifactDetailModal } from '@/components/features/contacts/profile/ArtifactDetailModal';
import { CreateArtifactModal } from '@/components/features/artifacts/CreateArtifactModal';
import { CreateActionModal } from '@/components/features/contacts/profile/CreateActionModal';

// Import hooks and types
import { useContactProfile } from '@/lib/hooks/useContactProfile';
import { useVoiceMemos } from '@/lib/hooks/useVoiceMemos';
import { useActionsByArtifact, useActionsByContact, useCreateAction, useUpdateAction, type ActionItem } from '@/lib/hooks/useActions';
// Import useUpdateSuggestions hook for priority calculation only
import { useUpdateSuggestions } from '@/lib/hooks/useUpdateSuggestions';
import { useArtifacts, type NewArtifact } from '@/lib/hooks/useArtifacts';
import { useArtifactModalData } from '@/lib/hooks/useArtifactModalData';
import type { 
    BaseArtifact,
    POGArtifactContentStatus,
    AskArtifactContentStatus,
    PersonalContext as PersonalContextType,
    VoiceMemoArtifact,
    POGArtifact,
    AskArtifact,
    LinkedInArtifactContent,
    // LoopArtifact, // Removed - loops deprecated
    // LoopStatus, // Removed - loops deprecated
    // LoopArtifactContent, // Removed - loops deprecated
    Contact
} from '@/types';
import { useToast } from '@/lib/contexts/ToastContext';
import { ProcessingStatusBar } from '@/components/features/voice/ProcessingStatusBar'; // Revert to alias import
import { useAuth } from '@/lib/contexts/AuthContext';

interface ContactProfilePageProps {
  // Props interface for Next.js 14 App Router
  params?: Promise<Record<string, string>>;
}

const mapPOGStatusToActionQueueStatus = (pogStatus?: POGArtifactContentStatus): ActionQueuesActionItemStatus => {
  if (!pogStatus) return 'queued';
  switch (pogStatus) {
    case 'brainstorm': return 'brainstorm';
    case 'delivered': return 'closed';
    case 'closed': return 'closed';
    case 'offered': return 'active';
    case 'queued': return 'queued';
    default: return 'queued';
  }
};

const mapAskStatusToActionQueueStatus = (askStatus?: AskArtifactContentStatus): ActionQueuesActionItemStatus => {
  if (!askStatus) return 'queued';
  switch (askStatus) {
    case 'received': return 'closed';
    case 'closed': return 'closed';
    case 'in_progress': return 'active';
    case 'requested': return 'active';
    case 'queued': return 'queued';
    default: return 'queued';
  }
};

const ContactProfilePage: React.FC<ContactProfilePageProps> = () => {
  const params = useParams();
  const contactId = params.id as string;
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const [audioPlaybackError, setAudioPlaybackError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // State for the new Voice Memo Detail Modal
  const [selectedVoiceMemoForDetail, setSelectedVoiceMemoForDetail] = useState<VoiceMemoArtifact | null>(null);
  const [isVoiceMemoDetailModalOpen, setIsVoiceMemoDetailModalOpen] = useState(false);

  // State for the general ArtifactModal
  const [isArtifactModalOpen, setIsArtifactModalOpen] = useState(false);

  // Add loading states for modal actions
  const [isReprocessingMemo, setIsReprocessingMemo] = useState(false);

  // EnhancedLoopModal state removed - loops deprecated

  // NEW state for unified ArtifactDetailModal
  const [selectedArtifactForDetailModal, setSelectedArtifactForDetailModal] = useState<BaseArtifact | null>(null);
  const [isArtifactDetailModalOpen, setIsArtifactDetailModalOpen] = useState(false);

  // Action creation modals for ActionIntelligenceCenter
  const [isCreateArtifactModalOpen, setIsCreateArtifactModalOpen] = useState(false);
  const [createArtifactType, setCreateArtifactType] = useState<'pog' | 'ask'>('pog');
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);
  const [selectedActionForEdit, setSelectedActionForEdit] = useState<ActionItem | null>(null);

  // Action hooks
  const createActionMutation = useCreateAction();
  const updateActionMutation = useUpdateAction();
  const { data: contactActions = [] } = useActionsByContact(contactId);

  // Action type mapping functions
  const mapActionTypeToDisplay = (actionType: string): 'pog' | 'ask' | 'general' | 'follow_up' => {
    if (actionType === 'deliver_pog') return 'pog';
    if (actionType === 'follow_up_ask') return 'ask';
    if (actionType === 'send_follow_up' || actionType === 'follow_up') return 'follow_up';
    return 'general';
  };

  const mapActionStatusToDisplay = (status: string): 'queued' | 'active' | 'pending' | 'completed' => {
    if (status === 'in_progress') return 'active';
    if (status === 'pending') return 'pending';
    if (status === 'completed') return 'completed';
    return 'queued';
  };

  const mapActionPriorityToDisplay = (priority: string): 'high' | 'medium' | 'low' => {
    if (priority === 'urgent' || priority === 'high') return 'high';
    if (priority === 'low') return 'low';
    return 'medium';
  };

  const mapDisplayStatusToDatabase = (status: 'queued' | 'active' | 'pending' | 'completed'): 'pending' | 'in_progress' | 'completed' | 'skipped' | 'cancelled' => {
    if (status === 'active') return 'in_progress';
    if (status === 'pending') return 'pending';
    if (status === 'completed') return 'completed';
    return 'pending';
  };

  // Get actions for selected artifact
  const { data: artifactActions = [] } = useActionsByArtifact(selectedArtifactForDetailModal?.id);

  // Transform database actions to modal format
  const transformDbActionToModalAction = useCallback((dbAction: any) => ({
    id: dbAction.id,
    title: dbAction.title,
    description: dbAction.description,
    status: dbAction.status === 'cancelled' || dbAction.status === 'skipped' ? 'completed' : dbAction.status,
    priority: dbAction.priority === 'urgent' ? 'high' : dbAction.priority,
    dueDate: dbAction.due_date ? new Date(dbAction.due_date) : undefined,
    createdAt: new Date(dbAction.created_at),
  }), []);


  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if walkthrough should be shown
  useEffect(() => {
    const shouldShowWalkthrough = searchParams.get('walkthrough') === 'true';
    if (shouldShowWalkthrough) {
      // Small delay to ensure page is fully rendered
      setTimeout(() => setShowWalkthrough(true), 1000);
    }
  }, [searchParams]);

  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
    
    // Show completion message and redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  const { 
    contact, 
    isLoading: isLoadingContact,
    error: contactError,
  } = useContactProfile(contactId);

  // Explicitly type contactProfileError to help TypeScript
  const contactProfileError: Error | null = contactError as (Error | null);

  const { 
    voiceMemos, 
    isLoading: isLoadingVoiceMemos,
    processingCount,
    getProcessingStatus
  } = useVoiceMemos({ contact_id: contactId });

  // Fetch goals for this contact
  const { data: contactGoals = [] } = useQuery({
    queryKey: ['contact-goals', contactId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Step 1: Fetch goal contacts without joins
      const { data: goalContactsRaw, error: goalContactsError } = await supabase
        .from('goal_contacts')
        .select('goal_id, relationship_type, relevance_score, how_they_help')
        .eq('contact_id', contactId)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (goalContactsError) {
        console.error('Error fetching contact goals:', goalContactsError);
        return [];
      }

      if (!goalContactsRaw || goalContactsRaw.length === 0) return [];

      // Step 2: Fetch goals details separately
      const goalIds = goalContactsRaw.map(gc => gc.goal_id);
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('id, title, status, target_contact_count, progress_percentage')
        .in('id', goalIds);

      if (goalsError) {
        console.error('Error fetching goals details:', goalsError);
        return [];
      }

      // Step 3: Client-side join and transform
      return (goalContactsRaw || []).map((gc: any) => {
        const goal = (goalsData || []).find(g => g.id === gc.goal_id);
        return {
          id: goal?.id || gc.goal_id,
          title: goal?.title || 'Unknown Goal',
          isActive: goal?.status === 'active',
          relationship_type: gc.relationship_type,
          relevance_score: gc.relevance_score,
          how_they_help: gc.how_they_help
        };
      });
    },
    enabled: !!contactId && !!user?.id,
  });

  // Instantiate useArtifactModalData hook
  const {
    artifactDetails,
    relatedSuggestions,
    displayedContactProfileUpdates,
    contactName: artifactModalContactName,
    isLoading: isLoadingArtifactModalData,
    error: artifactModalDataError,
    fetchArtifactData,
    reprocessVoiceMemo,
    isReprocessing: isReprocessingArtifactModal,
    deleteArtifact: deleteArtifactModalFromHook,
    isDeleting,
    playAudio,
  } = useArtifactModalData();

  // Effect to handle opening VoiceMemoDetailModal based on URL query params
  useEffect(() => {
    const artifactIdFromQuery = searchParams.get('artifactView');
    const artifactTypeFromQuery = searchParams.get('artifactType');

    if (artifactTypeFromQuery === 'voice_memo' && artifactIdFromQuery && voiceMemos.length > 0) {
      const memoToOpen = voiceMemos.find(memo => memo.id === artifactIdFromQuery);
      if (memoToOpen && !isVoiceMemoDetailModalOpen) {
        setSelectedVoiceMemoForDetail(memoToOpen);
        setIsVoiceMemoDetailModalOpen(true);
        
        // Clean up URL params after opening modal
        const currentPathname = window.location.pathname;
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete('artifactView');
        newSearchParams.delete('artifactType');
        router.replace(`${currentPathname}?${newSearchParams.toString()}`, { scroll: false });
      }
    }
  }, [searchParams, voiceMemos, router, isVoiceMemoDetailModalOpen]);

  // Calculate suggestion priority for UI components
  const { highConfidenceCount } = useUpdateSuggestions({ contactId });

  const {
    createArtifact,
    deleteArtifact,
  } = useArtifacts();

  // Memoize computed values to prevent re-renders
  const suggestionPriority = useMemo(() => {
    return highConfidenceCount > 0 ? 'high' : 'medium';
  }, [highConfidenceCount]);

  // Show toast notifications for new high confidence suggestions
  useEffect(() => {
    if (highConfidenceCount > 0 && contact?.name) {
      const toastKey = `suggestions-${contactId}-${highConfidenceCount}`;
      const hasShownToast = sessionStorage.getItem(toastKey);
      
      if (!hasShownToast) {
        showToast(
          `✨ ${highConfidenceCount} high-confidence suggestion${highConfidenceCount > 1 ? 's' : ''} available for ${contact.name}!`,
          'info',
          { 
            icon: "💡", 
            duration: 8000,
            action: {
              label: 'View',
              onClick: () => {
                // Scroll to ContactHeader where suggestions are displayed
                const headerElement = document.querySelector('[data-testid="contact-header"]');
                if (headerElement) {
                  headerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }
            }
          }
        );
        // Mark this toast as shown for this session
        sessionStorage.setItem(toastKey, 'true');
      }
    }
  }, [highConfidenceCount, contact?.name, contactId, showToast]);

  const personalContextForHeader = useMemo(() => {
    return contact?.personal_context 
      ? contact.personal_context as PersonalContextType 
      : undefined;
  }, [contact?.personal_context]);

  const connectCadenceText = useMemo(() => {
    return contact?.connection_cadence_days 
      ? `Connect every ${contact.connection_cadence_days} days` 
      : undefined;
  }, [contact?.connection_cadence_days]);

  // Use useCallback for event handlers to prevent re-renders

  const handleUpdateStatus = useCallback((itemId: string, newStatus: ActionQueuesActionItemStatus, type: 'pog' | 'ask') => {
  }, []);

  const handleBrainstormPogs = useCallback(() => {
  }, []);





  interface ActionItemLike {
    id: string;
    content: string;
    status: ActionQueuesActionItemStatus;
    type: 'pog' | 'ask';
  }
  
  const pogs: ActionItemLike[] = useMemo(() => {
    if (!contact?.artifacts) return [];
    return contact.artifacts
      .filter((art): art is POGArtifact => art.type === 'pog')
      .map((art: POGArtifact): ActionItemLike => {
        return {
          id: art.id,
          content: art.metadata?.description || art.content || 'No description',
          status: mapPOGStatusToActionQueueStatus(art.metadata?.status),
          type: 'pog' as const,
        };
      });
  }, [contact?.artifacts]);
  
  const asks: ActionItemLike[] = useMemo(() => {
    if (!contact?.artifacts) return [];
    return contact.artifacts
      .filter((art): art is AskArtifact => art.type === 'ask')
      .map((art: AskArtifact): ActionItemLike => {
        return {
          id: art.id,
          content: art.metadata?.request_description || art.content || 'No description',
          status: mapAskStatusToActionQueueStatus(art.metadata?.status),
          type: 'ask' as const,
        };
      });
  }, [contact?.artifacts]);

  // Calculate reciprocity data based on artifact directionality
  const reciprocityData = useMemo(() => {
    if (!contact?.artifacts || !user) return { balance: 0, given: 0, received: 0 };
    
    let given = 0;
    let received = 0;
    
    contact.artifacts.forEach((artifact: any) => {
      // Check for POGs and Asks with proper directionality fields
      if (artifact.type === 'pog' || artifact.type === 'ask') {
        // Determine if the exchange is in an active/completed state
        let isActive = false;
        
        if (artifact.type === 'pog' && artifact.metadata?.status) {
          isActive = ['offered', 'in_progress', 'delivered', 'closed'].includes(artifact.metadata.status);
        } else if (artifact.type === 'ask' && artifact.metadata?.status) {
          isActive = ['requested', 'in_progress', 'received', 'closed'].includes(artifact.metadata.status);
        }
        
        if (isActive) {
          // Use contact-based directionality to determine given/received
          if (artifact.type === 'pog') {
            // POG: Check who is giving to whom
            if (artifact.recipient_contact_id === contactId) {
              given++; // User gave POG to contact
            } else if (artifact.initiator_contact_id === contactId) {
              received++; // User received POG from contact
            }
          } else if (artifact.type === 'ask') {
            // Ask: Check who is asking whom
            if (artifact.recipient_contact_id === contactId) {
              received++; // User asked contact for help (user received help)
            } else if (artifact.initiator_contact_id === contactId) {
              given++; // Contact asked user for help (user gave help)
            }
          }
        }
      }
    });
    
    // Calculate balance: -1 (all received) to 1 (all given)
    const total = given + received;
    const balance = total > 0 ? (given - received) / total : 0;
    
    return { balance, given, received };
  }, [contact?.artifacts, user, contactId]);

  // Calculate active exchanges
  const activeExchanges = useMemo(() => {
    if (!contact?.artifacts) return { pogs: { active: 0, total: 0 }, asks: { active: 0, total: 0 } };
    
    let pogsActive = 0;
    let pogsTotal = 0;
    let asksActive = 0;
    let asksTotal = 0;
    
    contact.artifacts.forEach((artifact: any) => {
      if (artifact.type === 'pog') {
        pogsTotal++;
        if (artifact.metadata?.active_exchange || 
            ['offered', 'in_progress'].includes(artifact.metadata?.status)) {
          pogsActive++;
        }
      } else if (artifact.type === 'ask') {
        asksTotal++;
        if (artifact.metadata?.active_exchange || 
            ['requested', 'in_progress'].includes(artifact.metadata?.status)) {
          asksActive++;
        }
      }
    });
    
    return {
      pogs: { active: pogsActive, total: pogsTotal },
      asks: { active: asksActive, total: asksTotal }
    };
  }, [contact?.artifacts]);

  // Calculate real last contact date from all artifacts
  const lastContactDate = useMemo(() => {
    if (!contact?.artifacts) return undefined;
    
    const now = new Date();
    const allArtifacts = contact.artifacts
      .filter((art: any) => new Date(art.timestamp) < now)
      .map((art: any) => new Date(art.timestamp))
      .sort((a, b) => b.getTime() - a.getTime()); // Sort descending (most recent first)
    
    return allArtifacts.length > 0 ? allArtifacts[0] : undefined;
  }, [contact?.artifacts]);

  // Find last and next live connections (meetings/calls)
  const liveConnections = useMemo(() => {
    if (!contact?.artifacts) return { last: undefined, next: undefined };
    
    const now = new Date();
    const liveArtifacts = contact.artifacts
      .filter((art: any) => art.type === 'meeting' || art.type === 'call')
      .map((art: any) => ({
        type: art.type as 'meeting' | 'call',
        date: new Date(art.timestamp),
        title: (art.metadata?.title || art.content || '') as string
      }));
    
    // Sort by date
    liveArtifacts.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Find last (most recent past) and next (soonest future)
    const past = liveArtifacts.filter(a => a.date < now);
    const future = liveArtifacts.filter(a => a.date >= now);
    
    return {
      last: past.length > 0 ? past[past.length - 1] : undefined,
      next: future.length > 0 ? future[0] : undefined
    };
  }, [contact?.artifacts]);


  const handleCloseVoiceMemoDetailModal = useCallback(() => {
    setSelectedVoiceMemoForDetail(null);
    setIsVoiceMemoDetailModalOpen(false);
    setPlayingAudioUrl(null); 
    setAudioPlaybackError(null);

    // Also ensure URL params are cleared if modal is closed manually
    const artifactIdFromQuery = searchParams.get('artifactView');
    if (artifactIdFromQuery) {
      const currentPathname = window.location.pathname;
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('artifactView');
      newSearchParams.delete('artifactType');
      router.replace(`${currentPathname}?${newSearchParams.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);

  const handleDeleteVoiceMemoFromDetailModal = useCallback(async (memoId: string) => {
    if (window.confirm('Are you sure you want to delete this voice memo?')) {
      try {
        // Correctly call deleteArtifact from useArtifacts hook
        await deleteArtifact({ id: memoId, contactId: contactId }); 
        showToast('Voice memo deleted successfully', 'success');
        setIsVoiceMemoDetailModalOpen(false); // Close modal after delete
        setSelectedVoiceMemoForDetail(null);
        // Invalidate queries for voice memos or general artifacts for this contact
        queryClient.invalidateQueries({ queryKey: ['voiceMemos', contactId] });
        queryClient.invalidateQueries({ queryKey: ['artifacts', { contact_id: contactId }] }); // From useArtifacts key
        queryClient.invalidateQueries({ queryKey: ['artifactTimeline', contactId] });
      } catch (error: unknown) {
         // Check for specific error code if deleteArtifact from useArtifacts provides it
        if (error instanceof Error && (error as Error & { code?: string }).code === 'ARTIFACT_IS_SOURCE') {
          showToast('Cannot delete: This voice memo is a source for contact profile data.', 'error');
        } else if (error instanceof Error) {
          showToast(`Error deleting: ${error.message}`, 'error');
        } else {
          showToast('An unknown error occurred during deletion.', 'error');
        }
      }
    }
  }, [deleteArtifact, contactId, showToast, queryClient]);

  const handleReprocessVoiceMemoInDetailModal = useCallback(async (memoId: string) => {
    setIsReprocessingMemo(true);
    try {
      await reprocessVoiceMemo(memoId); 
      showToast('Reprocessing started', 'success');
      queryClient.invalidateQueries({ queryKey: ['voiceMemos', contactId] });
      queryClient.invalidateQueries({ queryKey: ['artifactDetail', memoId] });
      queryClient.invalidateQueries({ queryKey: ['relatedSuggestions', memoId] });
      if (selectedVoiceMemoForDetail?.id === memoId) {
        const { data: updatedMemo } = await supabase.from('artifacts').select('*').eq('id', memoId).single();
        if (updatedMemo) setSelectedVoiceMemoForDetail(updatedMemo as VoiceMemoArtifact);
      }
    } catch (error: unknown) { 
      if (error instanceof Error) {
        showToast(`Error reprocessing: ${error.message}`, 'error');
      } else {
        showToast('An unknown error occurred during reprocessing.', 'error');
      }
    }
    finally { setIsReprocessingMemo(false); }
  }, [reprocessVoiceMemo, showToast, queryClient, contactId, selectedVoiceMemoForDetail?.id]);

  const handleOpenArtifactModal = useCallback((artifact: BaseArtifact) => {
    if (artifact.type === 'loop') {
      // Loops deprecated - show info message
      showToast('Loop functionality has been moved to POGs and Asks', 'info');
      return;
    } else if (artifact.type === 'voice_memo') {
        setSelectedVoiceMemoForDetail(artifact as VoiceMemoArtifact);
        setIsVoiceMemoDetailModalOpen(true);
        setIsArtifactModalOpen(false);
        setIsArtifactDetailModalOpen(false);
    } else if (artifact.type === 'pog' || artifact.type === 'ask') {
        setSelectedArtifactForDetailModal(artifact as POGArtifact | AskArtifact);
        setIsArtifactDetailModalOpen(true);
        setIsArtifactModalOpen(false);
        setIsVoiceMemoDetailModalOpen(false);
    } else {
      fetchArtifactData(artifact.id, contactId);
      setIsArtifactModalOpen(true);
      setIsArtifactDetailModalOpen(false);
    }
  }, [fetchArtifactData, contactId]);

  // ... (useEffect for artifactView query param needs to be aware of handleOpenArtifactModal)
  useEffect(() => {
    const artifactIdFromQuery = searchParams.get('artifactView');
    const artifactTypeFromQuery = searchParams.get('artifactType') as BaseArtifact['type'] | null;

    if (artifactIdFromQuery && artifactTypeFromQuery && contactId) {
      const placeholderArtifact: BaseArtifact = {
          id: artifactIdFromQuery,
          type: artifactTypeFromQuery,
          contact_id: contactId,
          user_id: 'placeholder_user_id', // Ensure this is present
          created_at: new Date().toISOString(),
          timestamp: new Date().toISOString(), // Ensure this is present
          updated_at: new Date().toISOString(), // Ensure this is present
          content: {}, 
      };
      handleOpenArtifactModal(placeholderArtifact);
        
      const currentPathname = window.location.pathname;
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('artifactView');
      newSearchParams.delete('artifactType');
      router.replace(`${currentPathname}?${newSearchParams.toString()}`, { scroll: false });
    }
  }, [searchParams, contactId, handleOpenArtifactModal, router]);

  // Loop handlers removed - functionality deprecated

  // Unified artifact modal handlers
  const handleDeleteArtifact = useCallback(async (artifactId: string) => {
    const artifactType = selectedArtifactForDetailModal?.type;
    const artifactName = artifactType === 'pog' ? 'POG' : artifactType === 'ask' ? 'Ask' : 'Artifact';
    
    try {
      await deleteArtifact({ id: artifactId, contactId: contactId }); 
      showToast(`${artifactName} deleted successfully`, 'success');
      setIsArtifactDetailModalOpen(false);
      setSelectedArtifactForDetailModal(null);
      queryClient.invalidateQueries({ queryKey: ['artifacts', { contact_id: contactId }] });
      queryClient.invalidateQueries({ queryKey: ['artifactTimeline', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contact-profile', contactId] });
    } catch (error: unknown) {
      if (error instanceof Error && (error as Error & { code?: string }).code === 'ARTIFACT_IS_SOURCE') {
        showToast(`Cannot delete: This ${artifactName} is referenced by other data.`, 'error');
      } else if (error instanceof Error) {
        showToast(`Error deleting: ${error.message}`, 'error');
      } else {
        showToast('An unknown error occurred during deletion.', 'error');
      }
    }
  }, [deleteArtifact, contactId, showToast, queryClient, selectedArtifactForDetailModal?.type]);

  const handleReprocessArtifact = useCallback(async (artifactId: string) => {
    const artifactType = selectedArtifactForDetailModal?.type;
    const artifactName = artifactType === 'pog' ? 'POG' : artifactType === 'ask' ? 'Ask' : 'Artifact';
    
    try {
      await reprocessVoiceMemo(artifactId); // Note: reprocessVoiceMemo works for all artifacts
      showToast(`${artifactName} reprocessing started`, 'success');
      queryClient.invalidateQueries({ queryKey: ['artifacts', { contact_id: contactId }] });
      queryClient.invalidateQueries({ queryKey: ['artifactDetail', artifactId] });
      queryClient.invalidateQueries({ queryKey: ['contact-profile', contactId] });
      if (selectedArtifactForDetailModal?.id === artifactId) {
        const { data: updatedArtifact } = await supabase.from('artifacts').select('*').eq('id', artifactId).single();
        if (updatedArtifact) setSelectedArtifactForDetailModal(updatedArtifact as BaseArtifact);
      }
    } catch (error: unknown) { 
      if (error instanceof Error) {
        showToast(`Error reprocessing: ${error.message}`, 'error');
      } else {
        showToast('An unknown error occurred during reprocessing.', 'error');
      }
    }
  }, [reprocessVoiceMemo, showToast, queryClient, contactId, selectedArtifactForDetailModal]);

  // Action creation handlers
  // This will be handled by the CreateActionModal in ArtifactDetailModal
  const handleCreateActionForArtifact = useCallback(() => {
    // This function is now a placeholder as action creation is handled in the modal
  }, []);

  // Real-time completion/failure notifications
  useEffect(() => {
    if (!contactId) return;

    const channel = supabase
      .channel(`db_artifacts_contact_${contactId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'artifacts',
          filter: `contact_id=eq.${contactId}`,
        },
        (payload: Record<string, unknown>) => {
          const oldData = payload.old as VoiceMemoArtifact | undefined;
          const newData = payload.new as VoiceMemoArtifact;

          if (newData.type === 'voice_memo') {
            const oldStatus = oldData?.ai_parsing_status;
            const newStatus = newData.ai_parsing_status;

            // Check if AI parsing just completed
            if (oldStatus !== 'completed' && newStatus === 'completed') {
              showToast(
                `Voice memo analysis complete for ${contact?.name || 'contact'}! New suggestions may be available.`,
                'success',
                { icon: "✨", duration: 6000 }
              );
            }
            // Check if AI parsing just failed
            else if (oldStatus !== 'failed' && newStatus === 'failed') {
              showToast(
                `Voice memo analysis failed for ${contact?.name || 'contact'}. Try reprocessing.`,
                'error',
                { icon: "⚠️", duration: 8000 }
              );
            }
            // Query invalidation is handled by useVoiceMemos hook itself
          }
        }
      )
      .subscribe((status: string, err: unknown) => {
        if (status === 'SUBSCRIBED') {
        }
        if (err) {
          console.error(`Error subscribing to artifact updates for ${contactId}:`, err);
        }
      });

    return () => {
      if (channel) {
        supabase.removeChannel(channel).catch((err: unknown) => console.error('Error removing channel:', err));
      }
    };
  }, [contactId, contact?.name, showToast]);

  // All hooks have been called. Now we can have conditional returns.
  const isLoading = isLoadingContact || isLoadingVoiceMemos || isLoadingArtifactModalData;

  if (isLoading) {
    return <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Container>;
  }

  if (contactProfileError) {
    return <Alert severity="error">Error loading contact: {contactProfileError.message || 'An unexpected error occurred.'}</Alert>;
  }

  if (!contact) {
    // If in walkthrough mode and contact not found, show demo contact
    if (searchParams.get('walkthrough') === 'true') {
      const demoContact = {
        id: 'demo-contact-1',
        name: 'Alex Chen',
        title: 'Senior Product Manager',
        company: 'TechCorp',
        email: 'alex.chen@techcorp.com',
        location: 'San Francisco, CA',
        relationship_score: 85,
        last_interaction_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
        updated_at: new Date().toISOString(),
        linkedin_url: 'https://linkedin.com/in/alexchen',
        linkedin_data: {
          profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        personal_context: {
          family_situation: 'Married with two young children',
          interests: ['Product strategy', 'Team leadership', 'Startup growth'],
          background: 'Former startup founder, now focused on scaling B2B products'
        }
      };
      
      // Use demo contact for walkthrough
      return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box>
            <ContactHeader 
              name={demoContact.name}
              title={demoContact.title}
              company={demoContact.company}
              email={demoContact.email}
              connectCadence="Every 6-8 weeks"
              connectDate={new Date(demoContact.last_interaction_date)}
              personalContext={demoContact.personal_context}
              profilePhotoUrl={demoContact.linkedin_data.profilePicture}
              location={demoContact.location}
              relationshipScore={demoContact.relationship_score}
              contactId={demoContact.id}
              suggestionPriority="high"
              onUpdateRelationshipScore={async (newScore) => {
                // For demo, just log - no actual save needed
              }}
              onUpdateCadence={async (newCadence) => {
                // For demo, just log - no actual save needed
              }}
            />

            {/* Demo content for walkthrough */}
            <Stack spacing={3} sx={{ mt: 3, mb: 3 }}>
              {/* Professional Context Section */}
              <Box id="professional-context">
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Professional Context
                </Typography>
                <Card sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="body1">
                    Senior Product Manager at TechCorp with 8 years of experience in B2B SaaS platforms. 
                    Expertise in product strategy, user research, and cross-functional team leadership.
                  </Typography>
                </Card>
              </Box>

              {/* Communication History Section */}
              <Box id="communication-history">
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Communication History
                </Typography>
                <Card sx={{ p: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    📧 Last email: 3 weeks ago about Q4 product roadmap
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    12 total interactions over 8 months • Strong response rate
                  </Typography>
                </Card>
              </Box>

              {/* Suggested POGs Section */}
              <Box id="suggested-pogs">
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Suggested Generosity
                </Typography>
                <Stack spacing={2}>
                  <Card sx={{ p: 3, border: '1px solid', borderColor: 'success.light' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      🎯 Share your Product-Market Fit framework
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      They mentioned struggling with PMF validation in their recent post
                    </Typography>
                  </Card>
                </Stack>
              </Box>

              {/* Goal Alignment Section */}
              <Box id="goal-alignment">
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Goal Alignment
                </Typography>
                <Card sx={{ p: 3, backgroundColor: '#e8f5e8' }}>
                  <Typography variant="body1">
                    🎯 <strong>Matches your goal:</strong> &quot;Find a senior product role at a growth-stage startup&quot;
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Their company is hiring senior PMs and they influence hiring decisions
                  </Typography>
                </Card>
              </Box>

              {/* Timing Indicator Section */}
              <Box id="timing-indicator">
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Timing Intelligence
                </Typography>
                <Card sx={{ p: 3, border: '2px solid', borderColor: 'warning.main', backgroundColor: 'warning.50' }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    ⏰ <strong>Perfect timing to reach out NOW</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    They posted yesterday about product strategy challenges - exactly your expertise area
                  </Typography>
                </Card>
              </Box>
            </Stack>

            {/* Onboarding Tour */}
            <OnboardingTour 
              isActive={true}
              onComplete={handleWalkthroughComplete}
            />
          </Box>
        </Container>
      );
    }
    
    return <Container sx={{ py: 4 }}><Alert severity="warning">Contact not found.</Alert></Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Walkthrough completion banner */}
      {!showWalkthrough && searchParams.get('walkthrough') === 'true' && (
        <Alert 
          severity="success" 
          action={
            <Button 
              onClick={() => router.push('/dashboard')}
              startIcon={<Dashboard />}
              sx={{ textTransform: 'none' }}
            >
              Go to Dashboard
            </Button>
          }
          sx={{ mb: 3 }}
        >
          <strong>Tour Complete!</strong> You&apos;re now ready to use Connection OS to build meaningful relationships.
        </Alert>
      )}

      <Box>
        <ContactHeader 
          name={contact.name || 'Unnamed Contact'}
          title={contact.title}
          company={contact.company}
          email={contact.email}
          connectCadence={connectCadenceText}
          connectDate={lastContactDate}
          personalContext={personalContextForHeader}
          profilePhotoUrl={(contact.linkedin_data as unknown as LinkedInArtifactContent)?.profilePicture || undefined}
          location={contact.location}
          relationshipScore={contact.relationship_score}
          contactId={contactId}
          suggestionPriority={suggestionPriority}
          // New enhanced props
          goals={contactGoals} 
          onGoalClick={(goalId) => {
            // Navigate to goals page with specific goal
            router.push(`/dashboard/goals?goal=${goalId}`);
          }}
          onRecordVoiceMemo={() => {
            // This will be handled by the embedded recorder
          }}
          onUpdateRelationshipScore={async (newScore) => {
            
            // Optimistic update - immediately update the UI
            queryClient.setQueryData(['contact-profile', contactId], (oldData: Contact | null) => {
              if (!oldData) return oldData;
              return { ...oldData, relationship_score: newScore };
            });
            
            try {
              // Update the database
              const { error } = await supabase
                .from('contacts')
                .update({ relationship_score: newScore })
                .eq('id', contactId);

              if (error) {
                console.error('Failed to update relationship score:', error);
                // Revert optimistic update on error
                queryClient.invalidateQueries({ queryKey: ['contact-profile', contactId] });
                throw error;
              }

            } catch (error) {
              console.error('Error updating relationship score:', error);
              throw error; // Re-throw so the component can handle the error
            }
          }}
          onUpdateCadence={async (newCadence) => {
            
            // Extract number of days from cadence text (e.g., "Connect every 42 days" -> 42)
            const daysMatch = newCadence.match(/(\d+)/);
            const days = daysMatch ? parseInt(daysMatch[1]) : null;
            
            // Optimistic update
            queryClient.setQueryData(['contact-profile', contactId], (oldData: Contact | null) => {
              if (!oldData) return oldData;
              return { ...oldData, connection_cadence_days: days };
            });
            
            try {
              // Update the database
              const { error } = await supabase
                .from('contacts')
                .update({ connection_cadence_days: days })
                .eq('id', contactId);

              if (error) {
                console.error('Failed to update cadence:', error);
                // Revert optimistic update on error
                queryClient.invalidateQueries({ queryKey: ['contact-profile', contactId] });
                throw error;
              }

            } catch (error) {
              console.error('Error updating cadence:', error);
              throw error;
            }
          }}
        />

        {/* Demo content for walkthrough */}
        {showWalkthrough && (
          <Stack spacing={3} sx={{ mt: 3, mb: 3 }}>
            {/* Professional Context Section */}
            <Box id="professional-context">
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Professional Context
              </Typography>
              <Card sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                <Typography variant="body1">
                  Senior Product Manager at TechCorp with 8 years of experience in B2B SaaS platforms. 
                  Expertise in product strategy, user research, and cross-functional team leadership.
                </Typography>
              </Card>
            </Box>

            {/* Communication History Section */}
            <Box id="communication-history">
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Communication History
              </Typography>
              <Card sx={{ p: 3 }}>
                <Typography variant="body1" gutterBottom>
                  📧 Last email: 3 weeks ago about Q4 product roadmap
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  12 total interactions over 8 months • Strong response rate
                </Typography>
              </Card>
            </Box>

            {/* Suggested POGs Section */}
            <Box id="suggested-pogs">
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Suggested Generosity
              </Typography>
              <Stack spacing={2}>
                <Card sx={{ p: 3, border: '1px solid', borderColor: 'success.light' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    🎯 Share your Product-Market Fit framework
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    They mentioned struggling with PMF validation in their recent post
                  </Typography>
                </Card>
              </Stack>
            </Box>

            {/* Goal Alignment Section */}
            <Box id="goal-alignment">
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Goal Alignment
              </Typography>
              <Card sx={{ p: 3, backgroundColor: '#e8f5e8' }}>
                <Typography variant="body1">
                  🎯 <strong>Matches your goal:</strong> &quot;Find a senior product role at a growth-stage startup&quot;
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Their company is hiring senior PMs and they influence hiring decisions
                </Typography>
              </Card>
            </Box>

            {/* Timing Indicator Section */}
            <Box id="timing-indicator">
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Timing Intelligence
              </Typography>
              <Card sx={{ p: 3, border: '2px solid', borderColor: 'warning.main', backgroundColor: 'warning.50' }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  ⏰ <strong>Perfect timing to reach out NOW</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  They posted yesterday about product strategy challenges - exactly your expertise area
                </Typography>
              </Card>
            </Box>
          </Stack>
        )}

        <ProcessingStatusBar 
          activeProcessingCount={processingCount} 
          contactName={contact.name || undefined} 
        />

        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            {/* New Relationship Pulse Dashboard */}
            <RelationshipPulseDashboard
              reciprocityBalance={reciprocityData.balance}
              reciprocityItems={{ given: reciprocityData.given, received: reciprocityData.received }}
              activeExchanges={activeExchanges}
              lastLiveConnection={liveConnections.last}
              nextLiveConnection={liveConnections.next}
              contactName={contact.name || 'Contact'}
              contactId={contactId}
              onArtifactCreated={(data) => {
                // Refresh relevant queries
                queryClient.invalidateQueries({ queryKey: ['contact-profile', contactId] });
                queryClient.invalidateQueries({ queryKey: ['artifacts', { contact_id: contactId }] });
              }}
              onArtifactCreating={async (data) => {
                
                if (!user) {
                  throw new Error('User not authenticated');
                }
                
                // Convert CreateArtifactModal data to database format
                const newArtifact: NewArtifact = {
                  type: data.type,
                  content: data.content,
                  contact_id: data.contactId,
                  user_id: user.id,
                  metadata: data.metadata,
                  timestamp: new Date().toISOString(),
                  ai_parsing_status: 'pending' as const,
                  // Set directionality fields for POGs and Asks
                  ...(data.type === 'pog' && {
                    initiator_user_id: user.id,
                    recipient_contact_id: data.contactId,
                  }),
                  ...(data.type === 'ask' && {
                    initiator_user_id: user.id,
                    recipient_contact_id: data.contactId,
                  }),
                };
                
                // Create the artifact in the database
                await createArtifact(newArtifact);
              }}
              onExchangeClick={(exchangeId) => {
                // Find the artifact and open its modal
                const artifact = contact.artifacts?.find((art: any) => art.id === exchangeId);
                if (artifact) {
                  handleOpenArtifactModal(artifact);
                }
              }}
              mockExchanges={[
                // Create POG exchanges based on the same logic as activeExchanges calculation
                ...contact.artifacts
                  ?.filter((artifact: any) => artifact.type === 'pog')
                  ?.filter((artifact: any) => 
                    artifact.metadata?.active_exchange || 
                    ['offered', 'in_progress'].includes(artifact.metadata?.status)
                  )
                  ?.map((artifact: any) => ({
                    id: artifact.id,
                    title: artifact.metadata?.description || artifact.content || 'No description',
                    type: 'pog' as const,
                    status: 'active' as const,
                    createdAt: new Date(artifact.timestamp || Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                    contactName: contact.name || 'Contact',
                    sourceArtifact: {
                      type: 'voice_memo',
                      title: 'Recent conversation',
                      date: new Date(artifact.timestamp || Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
                    }
                  })) || [],
                // Create Ask exchanges based on the same logic as activeExchanges calculation
                ...contact.artifacts
                  ?.filter((artifact: any) => artifact.type === 'ask')
                  ?.filter((artifact: any) => 
                    artifact.metadata?.active_exchange || 
                    ['requested', 'in_progress'].includes(artifact.metadata?.status)
                  )
                  ?.map((artifact: any) => ({
                    id: artifact.id,
                    title: artifact.metadata?.request_description || artifact.content || 'No description',
                    type: 'ask' as const,
                    status: 'active' as const,
                    createdAt: new Date(artifact.timestamp || Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                    contactName: contact.name || 'Contact',
                    sourceArtifact: {
                      type: 'meeting',
                      title: 'Follow-up discussion',
                      date: new Date(artifact.timestamp || Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
                    }
                  })) || []
              ]}
            />

            {/* New Action Intelligence Center */}
            <ActionIntelligenceCenter
              contactId={contactId}
              contactName={contact.name || 'Contact'}
              actions={contactActions.map(action => {
                // Find the linked artifact if it exists
                const linkedArtifact = action.artifact_id 
                  ? contact?.artifacts?.find((art: any) => art.id === action.artifact_id)
                  : null;
                
                // Determine type based on linked artifact, not database action_type
                const getActionTypeFromArtifact = (): 'pog' | 'ask' | 'general' | 'follow_up' => {
                  if (linkedArtifact) {
                    if (linkedArtifact.type === 'pog') return 'pog';
                    if (linkedArtifact.type === 'ask') return 'ask';
                  }
                  // Fall back to original mapping for unlinked actions
                  return mapActionTypeToDisplay(action.action_type);
                };
                
                return {
                  id: action.id,
                  title: action.title,
                  description: action.description,
                  type: getActionTypeFromArtifact(),
                  status: mapActionStatusToDisplay(action.status),
                  priority: mapActionPriorityToDisplay(action.priority),
                  dueDate: action.due_date ? new Date(action.due_date) : undefined,
                  source: action.artifact_id ? 'Related to artifact' : undefined,
                  sourceArtifact: linkedArtifact ? {
                    id: linkedArtifact.id,
                    type: linkedArtifact.type,
                    title: linkedArtifact.content || linkedArtifact.metadata?.title || linkedArtifact.metadata?.description || 'No description',
                    date: new Date(linkedArtifact.timestamp || linkedArtifact.created_at),
                    excerpt: linkedArtifact.metadata?.excerpt || (typeof linkedArtifact.content === 'string' ? linkedArtifact.content.substring(0, 100) : String(linkedArtifact.content || '').substring(0, 100))
                  } : undefined,
                };
              })}
              onUpdateActionStatus={async (actionId, newStatus) => {
                try {
                  await updateActionMutation.mutateAsync({
                    id: actionId,
                    updates: {
                      status: mapDisplayStatusToDatabase(newStatus),
                      ...(newStatus === 'completed' && { completed_at: new Date().toISOString() }),
                    },
                  });
                } catch (error) {
                  console.error('Failed to update action status:', error);
                }
              }}
              onEditAction={(actionId) => {
                // Find the original database action instead of transforming
                const actionToEdit = contactActions.find(action => action.id === actionId);
                if (actionToEdit) {
                  setSelectedActionForEdit(actionToEdit);
                  setIsCreateActionModalOpen(true);
                }
              }}
              onCreateAction={(type) => {
                if (type === 'pog' || type === 'ask') {
                  // Open CreateArtifactModal for POGs and Asks
                  setCreateArtifactType(type);
                  setIsCreateArtifactModalOpen(true);
                } else {
                  // Open CreateActionModal for general actions
                  setIsCreateActionModalOpen(true);
                }
              }}
              timingOpportunities={[]} // TODO: Generate from contact data
              onActOnOpportunity={(opportunityId) => {
              }}
              nextBestAction={
                pogs.length > 0 || asks.length > 0 
                  ? {
                      id: 'next-best',
                      title: 'Follow up on recent conversation',
                      type: 'follow_up',
                      status: 'queued',
                      priority: 'high',
                    }
                  : undefined
              }
            />

            {/* Meeting Intelligence - Unified Section */}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Meeting Intelligence
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    // Navigate to timeline filtered by meetings
                    router.push(`/dashboard/timeline?contact=${contactId}&type=meeting`);
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  Show All Meetings
                </Button>
              </Box>
              
              {/* Upcoming Meeting */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 1.5, fontSize: '1.1rem' }}>
                  Upcoming Connection
                </Typography>
                <NextConnection 
                  contactId={contactId} 
                />
              </Box>

              {/* Past Meetings Needing Processing */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 1.5, fontSize: '1.1rem' }}>
                  Recent Meetings
                </Typography>
                <MeetingManager 
                  contactId={contactId}
                />
              </Box>
            </Box>

            <ContextSections 
              contactData={contact}
              contactId={contactId}
            />

            {/* Email Management Integration Point */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h5" gutterBottom component="div" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                Email Management
              </Typography>
              <ContactEmailManagement 
                contactId={contactId}
                contactName={contact.name || undefined}
              />
            </Box>

            {/* LinkedIn Posts Integration Point - Removed from contact profile, will be moved elsewhere */}
            {/* 
            {contact.linkedin_url && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h5" gutterBottom component="div" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                  LinkedIn Posts
                </Typography>
                <LinkedInPostsSyncStatus 
                  contactId={contactId}

                />
              </Box>
            )}
            */}
        </Box>
      </Box>



      <Box sx={{ textAlign: 'center', py: 3, mt: 4, borderTop: 1, borderColor: 'divider'}}>
        <Typography variant="caption" color="text.secondary">
          Data for {contact.name || 'this contact'}. Last updated: {contact.updated_at ? new Date(contact.updated_at).toLocaleDateString() : 'N/A'}
        </Typography>
      </Box>

      {isClient && artifactDetails && (
        <StandardizedArtifactModal
          artifact={artifactDetails}
          open={isArtifactModalOpen}
          onClose={() => {
            setIsArtifactModalOpen(false);
          }}
          contactId={contactId}
          contactName={artifactModalContactName}
          variant="profile"
          showActions={false} // Profile page uses separate ArtifactDetailModal for POGs/Asks with actions
          showSuggestions={true}
          showFieldSources={true}
          relatedSuggestions={relatedSuggestions}
          contactFieldSources={displayedContactProfileUpdates}
          onDelete={async (artifactId: string) => {
            await deleteArtifactModalFromHook(artifactId, contactId);
            showToast('Artifact deleted successfully.', 'success');
            setIsArtifactModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['artifactTimeline', contactId] });
          }}
          onReprocess={async (artifactId: string) => {
            await reprocessVoiceMemo(artifactId);
            showToast('Artifact reprocessing started.', 'success');
          }}
          onPlayAudio={(audioPath: string): Promise<string> => {
            setAudioPlaybackError(null);
            return playAudio(audioPath);
          }}
          isLoading={isLoadingArtifactModalData}
          isDeleting={isDeleting}
          isReprocessing={isReprocessingArtifactModal}
          error={artifactModalDataError?.message || null}
        />
      )}

      {selectedVoiceMemoForDetail && (
        <VoiceMemoDetailModal
          open={isVoiceMemoDetailModalOpen}
          onClose={handleCloseVoiceMemoDetailModal}
          voiceMemo={selectedVoiceMemoForDetail}
          onDelete={handleDeleteVoiceMemoFromDetailModal} 
          onReprocess={handleReprocessVoiceMemoInDetailModal}
          isReprocessing={isReprocessingMemo} 
          contactName={contact.name || undefined}
          contactId={contactId}
          playAudio={playAudio}
          currentPlayingUrl={playingAudioUrl || undefined} 
          audioPlaybackError={audioPlaybackError || undefined}
          processingStatus={getProcessingStatus(selectedVoiceMemoForDetail.id)?.status}
          processingStartTime={getProcessingStatus(selectedVoiceMemoForDetail.id)?.startedAt}
        />
      )}

      {/* EnhancedLoopModal removed - loops deprecated */}

      {/* Unified Artifact Detail Modal */}
      {selectedArtifactForDetailModal && user && (
        <ArtifactDetailModal
          open={isArtifactDetailModalOpen}
          onClose={() => {
            setIsArtifactDetailModalOpen(false);
            setSelectedArtifactForDetailModal(null);
          }}
          artifact={selectedArtifactForDetailModal}
          contactName={contact?.name || 'Contact'}
          contactId={contactId}
          currentUserId={user.id}
          sourceArtifact={
            // Find the source artifact if available
            selectedArtifactForDetailModal?.metadata?.source_artifact_id 
              ? contact?.artifacts?.find((art: any) => art.id === selectedArtifactForDetailModal?.metadata?.source_artifact_id)
              : undefined
          }
          relatedActions={artifactActions.map(transformDbActionToModalAction)}
          onDelete={handleDeleteArtifact}
          onReprocess={handleReprocessArtifact}
          onAddAction={handleCreateActionForArtifact}
          artifacts={contact?.artifacts || []} // Pass artifacts for POG/Ask dropdown
          onActionRefresh={() => {
            // Invalidate and refetch actions
            queryClient.invalidateQueries({ queryKey: ['actions', 'by-artifact', selectedArtifactForDetailModal?.id] });
            queryClient.invalidateQueries({ queryKey: ['actions', 'by-contact', contactId] });
          }}
          onViewAction={(actionId) => {
            // TODO: Open action detail modal
            showToast('Action details coming soon!', 'info');
          }}
          onViewSource={(artifactId) => {
            // Find and open the source artifact
            const sourceArtifact = contact?.artifacts?.find((art: any) => art.id === artifactId);
            if (sourceArtifact) {
              handleOpenArtifactModal(sourceArtifact);
            }
          }}
          isDeleting={isDeleting}
          isReprocessing={isReprocessingArtifactModal}
        />
      )}

      {/* CreateArtifactModal for POGs and Asks */}
      <CreateArtifactModal
        open={isCreateArtifactModalOpen}
        onClose={() => setIsCreateArtifactModalOpen(false)}
        artifactType={createArtifactType}
        preSelectedContactId={contactId}
        preSelectedContactName={contact?.name ?? undefined}
        contacts={[]} // TODO: Add contacts list if needed
        onArtifactCreated={(data) => {
          // Refresh relevant queries
          queryClient.invalidateQueries({ queryKey: ['contact-profile', contactId] });
          queryClient.invalidateQueries({ queryKey: ['artifacts', { contact_id: contactId }] });
          setIsCreateArtifactModalOpen(false);
        }}
        onArtifactCreating={async (data) => {
          
          if (!user) {
            throw new Error('User not authenticated');
          }
          
          // Convert CreateArtifactModal data to database format  
          const newArtifact: NewArtifact = {
            type: data.type === 'task' ? 'other' : data.type, // Map 'task' to 'other' for database
            content: data.content,
            contact_id: data.contactId || contactId, // Ensure contact_id is always set
            user_id: user.id,
            metadata: data.metadata,
            timestamp: new Date().toISOString(),
            ai_parsing_status: 'pending' as const,
            // Set directionality fields for POGs and Asks
            ...(data.type === 'pog' && {
              initiator_user_id: user.id,
              recipient_contact_id: data.contactId,
            }),
            ...(data.type === 'ask' && {
              initiator_user_id: user.id,
              recipient_contact_id: data.contactId,
            }),
          };
          
          // Create the artifact in the database
          await createArtifact(newArtifact);
        }}
      />

      {/* CreateActionModal for general actions */}
      <CreateActionModal
        open={isCreateActionModalOpen}
        onClose={() => {
          setIsCreateActionModalOpen(false);
          setSelectedActionForEdit(null);
        }}
        contactId={contactId}
        contactName={contact?.name ?? undefined}
        existingAction={selectedActionForEdit}
        mode={selectedActionForEdit ? 'edit' : 'create'}
        artifacts={contact?.artifacts || []}
        onActionCreated={(action) => {
          // Refresh actions queries
          queryClient.invalidateQueries({ queryKey: ['actions', 'by-contact', contactId] });
          setIsCreateActionModalOpen(false);
          setSelectedActionForEdit(null);
        }}
        onActionUpdated={(action) => {
          // Refresh actions queries
          queryClient.invalidateQueries({ queryKey: ['actions', 'by-contact', contactId] });
          setIsCreateActionModalOpen(false);
          setSelectedActionForEdit(null);
        }}
      />

      {/* Onboarding Tour */}
      <OnboardingTour 
        isActive={showWalkthrough}
        onComplete={handleWalkthroughComplete}
      />
    </Container>
  );
};

export default ContactProfilePage;