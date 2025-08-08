import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Paper, Avatar, Chip, Slider, ClickAwayListener, TextField, IconButton, CircularProgress, Alert, LinearProgress, Button, Tooltip } from '@mui/material';
import { Mic, Stop, CheckCircle } from '@mui/icons-material';
import { SuggestionBellBadge } from '../suggestions/UnifiedSuggestionManager';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import type { PersonalContext as PersonalContextType } from '@/types';
import type { Json } from '@/lib/supabase/database.types';


interface RelationshipScoreEditorProps {
  score: number;
  onUpdate: (newScore: number) => Promise<void>;
}

const RelationshipScoreEditor: React.FC<RelationshipScoreEditorProps> = ({
  score,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempScore, setTempScore] = useState(score);

  useEffect(() => {
    setTempScore(score);
  }, [score]);

  const handleEdit = () => {
    setIsEditing(true);
    setTempScore(score);
  };

  const handleSave = async () => {
    if (tempScore >= 0 && tempScore <= 6) {
      try {
        await onUpdate(tempScore);
      } catch (error) {
        console.error('Failed to update score:', error);
        setTempScore(score); // Revert on error
      }
    }
    setIsEditing(false);
  };

  const handleClickAway = () => {
    if (isEditing) {
      handleSave();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      setTempScore(score);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <Typography sx={{ color: '#4b5563', fontSize: '0.875rem' }}>
            Relationship Quality Score:{' '}
          </Typography>
          <Box sx={{ mx: 0.5, minWidth: '40px', display: 'inline-block' }}>
            <TextField
              value={tempScore}
              onChange={(e) => setTempScore(parseInt(e.target.value) || 0)}
              onKeyDown={handleKeyDown}
              type="number"
              size="small"
              autoFocus
              inputProps={{ min: 0, max: 6 }}
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                  color: '#4b5563',
                  backgroundColor: 'white',
                  border: '1px solid #9ca3af',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  width: '50px',
                },
                '& .MuiInputBase-input': {
                  padding: '2px 0',
                  textAlign: 'center',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              }}
            />
          </Box>
        </Box>
      </ClickAwayListener>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
      <Typography sx={{ color: '#4b5563', fontSize: '0.875rem' }}>
        Relationship Quality Score:{' '}
        <Box
          component="span"
          onClick={handleEdit}
          sx={{
            cursor: 'pointer',
            fontWeight: 'medium',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            '&:hover': {
              backgroundColor: '#f3f4f6',
              padding: '1px 3px',
              borderRadius: '3px',
            },
          }}
        >
          {score}
        </Box>
      </Typography>
    </Box>
  );
};

interface ConnectionCadenceEditorProps {
  cadenceText: string;
  lastContactDate?: Date;
  onUpdate: (newCadence: string) => Promise<void>;
}

interface EmbeddedVoiceRecorderProps {
  contactId: string;
  contactName?: string;
  onRecordingComplete?: () => void;
  onError?: (error: string) => void;
}

const EmbeddedVoiceRecorder: React.FC<EmbeddedVoiceRecorderProps> = ({
  contactId,
  contactName,
  onRecordingComplete,
  onError
}) => {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isActive, setIsActive] = useState(false); // Whether recorder is active/expanded
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  
  // Refs for MediaRecorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (!user) {
      const errorMessage = 'User not authenticated. Please log in to record.';
      setError(errorMessage);
      onError?.(errorMessage);
      return;
    }
    
    try {
      setError('');
      setSuccess(false);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      // Handle data chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording completion
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        await handleRecordingComplete(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
      const errorMessage = 'Failed to start recording. Please check microphone permissions.';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onError, user, contactId]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  const handleRecordingComplete = async (blob: Blob) => {
    setIsUploading(true);
    setUploadStatus('Uploading voice memo...');
    
    if (!user) {
      const errMessage = 'User not authenticated';
      setError(errMessage);
      onError?.(errMessage);
      setIsUploading(false);
      setUploadStatus('');
      return;
    }
    
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${user.id}/${contactId}-${timestamp}.webm`; 
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-memos')
        .upload(filename, blob, {
          contentType: 'audio/webm',
          cacheControl: '3600'
        });
      
      if (uploadError) throw uploadError;
      if (!uploadData) throw new Error('Upload failed, no data returned.');
      
      setUploadStatus('Creating voice memo record...');
      
      // Create artifact record
      const { data: artifact, error: insertError } = await supabase
        .from('artifacts')
        .insert({
          contact_id: contactId,
          user_id: user.id,
          type: 'voice_memo',
          content: `Voice memo recorded (${formatDuration(duration)})`,
          audio_file_path: uploadData.path,
          duration_seconds: duration,
          transcription_status: 'pending',
          metadata: { 
            file_size: blob.size,
            mime_type: blob.type,
            recorded_at: new Date().toISOString()
          } as unknown as Json
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      if (!artifact) throw new Error('Failed to create artifact record.');
      
      setUploadStatus('');
      setIsUploading(false);
      setSuccess(true);
      setDuration(0);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['voiceMemos', contactId] });
      queryClient.invalidateQueries({ queryKey: ['artifacts', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId] });
      
      onRecordingComplete?.();
      
      // Auto close after success
      setTimeout(() => {
        setSuccess(false);
        setIsActive(false);
      }, 3000);
      
    } catch (err) { 
      console.error('Error uploading voice memo:', err);
      const errorMessage = err instanceof Error && err.message ? err.message : 'Upload failed. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsUploading(false); 
      setUploadStatus('');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleActivate = () => {
    if (!isActive) {
      setIsActive(true);
      // Auto-start recording when activated
      setTimeout(() => startRecording(), 100);
    }
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    setIsActive(false);
    setError('');
    setSuccess(false);
    setUploadStatus('');
  };

  // If not active, show the simple button
  if (!isActive) {
    return (
      <Box 
        sx={{
          width: '300px',
          height: 'auto',
          borderRadius: '12px',
          border: '2px dashed',
          borderColor: '#e5e7eb',
          backgroundColor: '#f9fafb',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: '#f3f4f6',
            borderColor: '#3b82f6',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        }} 
        onClick={handleActivate}
        aria-label="Record Voice Memo"
      >
        <IconButton 
          sx={{
            width: 64,
            height: 64,
            backgroundColor: '#3b82f6',
            color: 'white',
            border: '3px solid #3b82f6',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#2563eb',
              borderColor: '#2563eb',
              transform: 'scale(1.05)',
            },
          }}
          disableRipple
        >
          <Mic sx={{ fontSize: 28 }} />
        </IconButton>
        
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', textAlign: 'center' }}>
          Record Voice Memo
        </Typography>
      </Box>
    );
  }

  // Active recording interface
  return (
    <Box sx={{
      width: '300px',
      borderRadius: '12px',
      border: '2px solid #3b82f6',
      backgroundColor: 'white',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)',
    }}>
      
      {/* Header with close button */}
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
          Voice Memo
        </Typography>
        <Button 
          size="small" 
          onClick={handleClose}
          sx={{ minWidth: 'auto', padding: '4px 8px', fontSize: '0.75rem' }}
        >
          Cancel
        </Button>
      </Box>

      {/* Recording interface */}
      <Box sx={{ textAlign: 'center', width: '100%' }}>
        <IconButton
          onClick={isRecording ? stopRecording : startRecording}
          color={isRecording ? "error" : "primary"}
          size="large"
          disabled={isUploading || !user}
          sx={{
            width: 80,
            height: 80,
            border: 2,
            borderColor: isRecording ? 'error.main' : 'primary.main',
            backgroundColor: isRecording ? 'error.light' : 'primary.light',
            color: isRecording ? 'error.contrastText' : 'primary.contrastText',
            animation: isRecording ? 'pulse 1.5s infinite' : 'none',
            transition: 'transform 0.2s, background-color 0.2s',
            '&:hover': {
              transform: 'scale(1.05)',
              backgroundColor: isRecording ? 'error.dark' : 'primary.dark',
            },
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 0 0 rgba(0,0,0, 0.2)' },
              '70%': { boxShadow: '0 0 0 10px rgba(0,0,0, 0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(0,0,0, 0)' },
            }
          }}
        >
          {isRecording ? <Stop sx={{ fontSize: 40 }} /> : <Mic sx={{ fontSize: 40 }} />}
        </IconButton>
        
        <Typography variant="h6" sx={{ mt: 2, fontWeight: 500 }}>
          {isRecording ? formatDuration(duration) : (user ? 'Tap to Record' : 'Login to Record')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ minHeight: '1.5em' }}>
          {isRecording 
            ? 'Recording in progress...' 
            : (isUploading && uploadStatus) ? uploadStatus 
            : !user ? 'You must be logged in to record voice memos.'
            : 'Max 2 minutes. Click the icon to start.'
          }
        </Typography>

        {isRecording && (
          <Box sx={{ mt: 2, width: '80%', maxWidth: 150, mx: 'auto' }}>
            <LinearProgress 
              variant="indeterminate" 
              color={isRecording ? "error" : "primary"}
              sx={{ height: 5, borderRadius: '2.5px' }}
            />
          </Box>
        )}

        {isUploading && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2">Processing...</Typography>
          </Box>
        )}
      </Box>
      
      {error && !isUploading && (
        <Alert severity="error" sx={{ width: '100%', fontSize: '0.875rem' }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ width: '100%', fontSize: '0.875rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle sx={{ fontSize: 20, mr: 1 }} />
            Recording saved successfully!
          </Box>
        </Alert>
      )}
    </Box>
  );
};


const ConnectionCadenceEditor: React.FC<ConnectionCadenceEditorProps> = ({
  cadenceText,
  lastContactDate,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempDays, setTempDays] = useState<number>(0);

  // Extract days from cadence text
  const extractDays = (text: string): number => {
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Set initial days when component mounts or cadenceText changes
  useEffect(() => {
    setTempDays(extractDays(cadenceText));
  }, [cadenceText]);

  const handleEdit = () => {
    setIsEditing(true);
    setTempDays(extractDays(cadenceText));
  };

  const handleSave = async () => {
    if (tempDays > 0) {
      try {
        const newCadenceText = `Connect every ${tempDays} days`;
        await onUpdate(newCadenceText);
      } catch (error) {
        console.error('Failed to update cadence:', error);
        setTempDays(extractDays(cadenceText)); // Revert on error
      }
    }
    setIsEditing(false);
  };

  const handleClickAway = () => {
    if (isEditing) {
      handleSave();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      setTempDays(extractDays(cadenceText));
      setIsEditing(false);
    }
  };

  const currentDays = extractDays(cadenceText);

  if (isEditing) {
    return (
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <Box component="span" className="emoji" sx={{ mr: 0.75 }}>🟢</Box>
          <Typography sx={{ color: '#059669', fontSize: '0.75rem', fontWeight: 'medium' }}>
            Connect every{' '}
          </Typography>
          <Box
            sx={{
              mx: 0.5,
              minWidth: '40px',
              display: 'inline-block',
            }}
          >
            <TextField
              value={tempDays}
              onChange={(e) => setTempDays(parseInt(e.target.value) || 0)}
              onKeyDown={handleKeyDown}
              type="number"
              size="small"
              autoFocus
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: '0.75rem',
                  fontWeight: 'medium',
                  color: '#059669',
                  backgroundColor: 'white',
                  border: '1px solid #059669',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  width: '50px',
                },
                '& .MuiInputBase-input': {
                  padding: '2px 0',
                  textAlign: 'center',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              }}
            />
          </Box>
          <Typography sx={{ color: '#059669', fontSize: '0.75rem', fontWeight: 'medium' }}>
            {' '}days
          </Typography>
        </Box>
      </ClickAwayListener>
    );
  }

  // Calculate days since last contact
  const daysSinceLastContact = lastContactDate 
    ? Math.floor((new Date().getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box component="span" className="emoji" sx={{ mr: 0.75 }}>🟢</Box>
        <Typography sx={{ color: '#059669', fontSize: '0.75rem', fontWeight: 'medium' }}>
          Connect every{' '}
          <Box
            component="span"
            onClick={handleEdit}
            sx={{
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
              '&:hover': {
                backgroundColor: '#f0fdf4',
                padding: '1px 3px',
                borderRadius: '3px',
              },
            }}
          >
            {currentDays}
          </Box>
          {' '}days
        </Typography>
      </Box>
      {daysSinceLastContact !== null && (
        <Typography sx={{ color: '#6b7280', fontSize: '0.7rem', ml: 3.5 }}>
          Last contact: {daysSinceLastContact === 0 ? 'today' : `${daysSinceLastContact} days ago`}
        </Typography>
      )}
    </Box>
  );
};

interface Goal {
  id: string;
  title: string;
  isActive: boolean;
  relationship_type?: string;
  relevance_score?: number;
  how_they_help?: string;
}

// Enhanced props for redesigned contact header
interface ContactHeaderProps {
  name?: string | null;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  email?: string | null;
  profilePhotoUrl?: string | null;
  relationshipScore?: number | null;
  personalContext?: PersonalContextType | null;
  connectDate?: Date;
  connectCadence?: string | null;
  
  // Goal integration
  goals?: Goal[];
  onGoalClick?: (goalId: string) => void;
  
  // Suggestion notification props
  contactId?: string;
  suggestionPriority?: 'high' | 'medium' | 'low';
  
  // Enhanced action handlers
  onRecordVoiceMemo?: () => void; // Primary CTA
  
  // Inline editing
  onUpdateRelationshipScore?: (newScore: number) => Promise<void>;
  onUpdateCadence?: (newCadence: string) => Promise<void>;
}

export const ContactHeader: React.FC<ContactHeaderProps> = ({
  name,
  title,
  company,
  location,
  email,
  profilePhotoUrl,
  relationshipScore,
  personalContext,
  connectDate,
  connectCadence,
  goals = [],
  onGoalClick,
  contactId,
  suggestionPriority = 'medium',
  onRecordVoiceMemo,
  onUpdateRelationshipScore,
  onUpdateCadence,
}) => {
  const userGoal = personalContext?.relationship_goal;

  return (
    <Paper 
      elevation={0} // Reference uses shadow from a class, we can fine-tune elevation or use sx shadow
      sx={{
        p: { xs: 2, md: 3 }, 
        mb: 2, 
        borderRadius: '0.75rem', // rounded-xl 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)', // Softer shadow-md
        backgroundColor: 'white', // Ensure card background is white against gray page
      }}
    >
      <Box sx={{
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        alignItems: {xs: 'flex-start', md: 'center'}, 
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 }, flexGrow: 1 }}>
          <Avatar 
            src={profilePhotoUrl || undefined} 
            alt={name || 'C'} 
            sx={{
              width: { xs: 80, md: 96 }, 
              height: { xs: 80, md: 96 }, 
              mr: 2,
              border: '2px solid',
              borderColor: '#e5e7eb' // Subtle gray border
            }}
          >
            {name ? name.charAt(0).toUpperCase() : 'C'}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontSize: {xs: '1.75rem', md: '2rem'}, color: '#111827' /* gray-900 */ }}>
                {name || 'Unnamed Contact'}
              </Typography>
              
              {contactId && (
                <SuggestionBellBadge
                  contactId={contactId}
                  priority={suggestionPriority}
                />
              )}
            </Box>
            
            {/* Relationship Quality Score */}
            {relationshipScore !== undefined && onUpdateRelationshipScore && (
              <RelationshipScoreEditor
                score={relationshipScore}
                onUpdate={onUpdateRelationshipScore}
              />
            )}
            
            {/* Goal badges */}
            {goals.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1, mt: 1 }}>
                {goals.map((goal) => {
                  const formatRelationshipType = (type: string) => {
                    return type.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ');
                  };

                  const relevancePercentage = goal.relevance_score 
                    ? Math.round(goal.relevance_score * 100) 
                    : null;

                  const tooltipContent = (
                    <Box>
                      {goal.relationship_type && (
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                          {formatRelationshipType(goal.relationship_type)}
                        </Typography>
                      )}
                      {goal.how_they_help && (
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {goal.how_they_help}
                        </Typography>
                      )}
                      {relevancePercentage && (
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Relevance: {relevancePercentage}%
                        </Typography>
                      )}
                    </Box>
                  );

                  return (
                    <Tooltip 
                      key={goal.id}
                      title={tooltipContent}
                      placement="top"
                      arrow
                      enterDelay={500}
                    >
                      <Chip
                        label={goal.title}
                        size="small"
                        clickable={!!onGoalClick}
                        onClick={() => onGoalClick?.(goal.id)}
                        sx={{
                          backgroundColor: goal.isActive ? '#d1fae5' : '#f3f4f6',
                          color: goal.isActive ? '#059669' : '#6b7280',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          '&:hover': onGoalClick ? {
                            backgroundColor: goal.isActive ? '#bbf7d0' : '#e5e7eb',
                          } : {},
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            )}
            {(title || company) && (
              <Typography sx={{ color: '#4b5563' /* gray-600 */, fontSize: {xs: '0.875rem', md: '1rem'}, display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Box component="span" className="emoji" sx={{ mr: 0.75, color: 'text.secondary'}}>💼</Box> 
                {title}{company ? ` at ${company}` : ''}
              </Typography>
            )}
            {location && (
              <Typography sx={{ color: '#6b7280' /* gray-500 */, fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}>
                <Box component="span" className="emoji" sx={{ mr: 0.75, color: 'text.secondary'}}>📍</Box>
                {location}
              </Typography>
            )}
            {connectCadence && onUpdateCadence && (
              <ConnectionCadenceEditor
                cadenceText={connectCadence}
                lastContactDate={connectDate}
                onUpdate={onUpdateCadence}
              />
            )}
            
            {connectCadence && !onUpdateCadence && (
              <Typography sx={{color: '#059669' /* green-600 */, fontSize: '0.75rem', fontWeight: 'medium', mt: 0.5, display: 'flex', alignItems: 'center'}}>
                <Box component="span" className="emoji" sx={{ mr: 0.75 }}>🟢</Box> {connectCadence}
              </Typography>
            )}

          </Box>
        </Box>

        {/* Embedded Voice Recorder */}
        <EmbeddedVoiceRecorder 
          contactId={contactId || ''}
          contactName={name || undefined}
          onRecordingComplete={() => {
            console.log('Voice memo recording completed');
            // The component handles its own success state and auto-closes
          }}
          onError={(error) => {
            console.error('Voice memo recording error:', error);
          }}
        />
      </Box>
    </Paper>
  );
}; 