'use client';

import React from 'react';
import { ArtifactModal } from '@/components/features/timeline/ArtifactModal';
import type { BaseArtifact, LoopStatus, LoopArtifactContent } from '@/types';
import type { UpdateSuggestionRecord } from '@/types/suggestions';

interface SimpleStandardizedModalProps {
  artifact: BaseArtifact | null;
  open: boolean;
  onClose: () => void;
  contactId?: string;
  contactName?: string;
  contactLinkedInUrl?: string;
  relatedSuggestions?: UpdateSuggestionRecord[];
  contactFieldSources?: Record<string, string>;
  onDelete?: (artifactId: string) => Promise<void>;
  onReprocess?: (artifactId: string) => Promise<void>;
  onPlayAudio?: (audioPath: string) => Promise<string>;
  onLoopStatusUpdate?: (loopId: string, newStatus: LoopStatus) => Promise<void>;
  onLoopEdit?: (loopId: string, updates: Partial<LoopArtifactContent>) => Promise<void>;
  onLoopDelete?: (loopId: string) => Promise<void>;
  onLoopShare?: (loopId: string) => Promise<void>;
  onLoopComplete?: (loopId: string, outcome: Record<string, unknown>) => Promise<void>;
  isLoading?: boolean;
  isDeleting?: boolean;
  isReprocessing?: boolean;
  error?: string | null;
  variant?: 'timeline' | 'profile' | 'standalone';
  showActions?: boolean;
  showSuggestions?: boolean;
  showFieldSources?: boolean;
  relatedActions?: any[];
  onActionCreate?: any;
  onActionUpdate?: any;
  onActionDelete?: any;
  onActionComplete?: any;
}

export const SimpleStandardizedModal: React.FC<SimpleStandardizedModalProps> = ({
  artifact,
  open,
  onClose,
  contactId,
  contactName,
  contactLinkedInUrl,
  relatedSuggestions,
  contactFieldSources,
  onDelete,
  onReprocess,
  onPlayAudio,
  onLoopStatusUpdate,
  onLoopEdit,
  onLoopDelete,
  onLoopShare,
  onLoopComplete,
  isLoading,
  isDeleting,
  isReprocessing,
  error,
}) => {
  // Debug logging to see what data we're getting
  React.useEffect(() => {
    if (open && artifact) {
      console.log('🔍 Modal Data Debug:', {
        artifactId: artifact.id,
        artifactType: artifact.type,
        hasRelatedSuggestions: relatedSuggestions?.length > 0,
        relatedSuggestionsCount: relatedSuggestions?.length || 0,
        hasContactFieldSources: contactFieldSources && Object.keys(contactFieldSources).length > 0,
        contactFieldSourcesKeys: contactFieldSources ? Object.keys(contactFieldSources) : [],
        isLoading,
        error
      });
    }
  }, [open, artifact, relatedSuggestions, contactFieldSources, isLoading, error]);

  // For now, just wrap the existing ArtifactModal with enhanced data
  return (
    <ArtifactModal
      artifact={artifact}
      open={open}
      onClose={onClose}
      contactId={contactId}
      contactName={contactName}
      contactLinkedInUrl={contactLinkedInUrl}
      relatedSuggestions={relatedSuggestions}
      contactFieldSources={contactFieldSources}
      onDelete={onDelete}
      onReprocess={onReprocess}
      onPlayAudio={onPlayAudio}
      onLoopStatusUpdate={onLoopStatusUpdate}
      onLoopEdit={onLoopEdit}
      onLoopDelete={onLoopDelete}
      onLoopShare={onLoopShare}
      onLoopComplete={onLoopComplete}
      isLoading={isLoading}
      isDeleting={isDeleting}
      isReprocessing={isReprocessing}
      error={error}
    />
  );
};