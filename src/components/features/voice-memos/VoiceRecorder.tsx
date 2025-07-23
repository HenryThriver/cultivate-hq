'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  IconButton,
  CircularProgress,
  Alert,
  LinearProgress
} from '@mui/material';
import { Mic, Stop, CheckCircle } from '@mui/icons-material';
// import { useSupabaseClient } from '@supabase/auth-helpers-react'; // No longer using this hook
import { supabase } from '@/lib/supabase/client'; // Import the shared client directly
import { useAuth } from '@/lib/contexts/AuthContext'; 
import type { Json } from '@/lib/supabase/database.types';
import { useQueryClient } from '@tanstack/react-query'; // Added import
import { useVoiceMemos } from '@/lib/hooks/useVoiceMemos'; // Added for real-time monitoring

interface VoiceRecorderProps {
  contactId: string;
  onRecordingComplete?: (artifact: Record<string, unknown>) => void; // Consider using a specific Artifact type
  onError?: (error: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  contactId,
  onRecordingComplete,
  onError
}) => {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [currentProcessingArtifactId, setCurrentProcessingArtifactId] = useState<string | null>(null);
  
  // Refs for MediaRecorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // const supabase = useSupabaseClient<Database>(); // Removed useSupabaseClient
  // supabase is now imported directly and available in the module scope
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient(); // Added queryClient
  
  // OPTIMIZATION: Use real-time voice memos hook for processing monitoring
  const { voiceMemos, getProcessingStatus } = useVoiceMemos({ contact_id: contactId });

  // OPTIMIZATION: Monitor processing status via real-time subscriptions instead of polling
  useEffect(() => {
    if (!currentProcessingArtifactId) return;
    
    const currentMemo = voiceMemos.find(memo => memo.id === currentProcessingArtifactId);
    if (!currentMemo) return;
    
    const status = getProcessingStatus(currentProcessingArtifactId);
    
    // Update progress based on processing phase
    if (currentMemo.transcription_status === 'pending' || currentMemo.transcription_status === 'processing') {
      setUploadStatus('Transcribing audio...');
    } else if (currentMemo.transcription_status === 'completed' && 
               (currentMemo.ai_parsing_status === 'pending' || currentMemo.ai_parsing_status === 'processing')) {
      setUploadStatus('Processing with AI...');
    }
    
    // Handle completion
    if (status.status === 'completed') {
      setUploadStatus('');
      setIsUploading(false);
      setSuccess(true);
      setDuration(0);
      setCurrentProcessingArtifactId(null);
      
      // Invalidate related queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['contactUpdateSuggestions', contactId] });
      queryClient.invalidateQueries({ queryKey: ['artifacts', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId] });
      
      setTimeout(() => setSuccess(false), 5000);
    }
    
    // Handle failures
    else if (status.status === 'failed') {
      setCurrentProcessingArtifactId(null);
      if (currentMemo.transcription_status === 'failed') {
        setError('We had trouble understanding your audio. Please try recording again with clear speech.');
      } else if (currentMemo.ai_parsing_status === 'failed') {
        setError('We had trouble processing your message. Your recording was saved, but the analysis may be incomplete. Please try again if needed.');
      }
      setUploadStatus('');
      setIsUploading(false);
    }
  }, [currentProcessingArtifactId, voiceMemos, getProcessingStatus, contactId, queryClient]);

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
    if (!user) { // Check for user before starting recording
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
          sampleRate: 16000 // Optimized for speech recognition
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
        // Reset chunks and stream for next recording BEFORE async operation
        chunksRef.current = [];
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        await handleRecordingComplete(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0); // Reset duration for new recording

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) { // Changed error variable name to avoid conflict
      console.error('Error starting recording:', err);
      const errorMessage = 'Failed to start recording. Please check microphone permissions.';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onError, user]); // handleRecordingComplete creates circular dependency, disabled exhaustive-deps

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // streamRef.current?.getTracks().forEach(track => track.stop()); // Moved to onstop
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  const handleRecordingComplete = async (blob: Blob) => {
    setIsUploading(true);
    setUploadStatus('Uploading voice memo...');
    
    if (!user) { // Add user check here as well, as a safeguard
      const errMessage = 'User not authenticated';
      setError(errMessage);
      onError?.(errMessage);
      setIsUploading(false);
      setUploadStatus('');
      return;
    }
    
    try {
      // const { data: { user } } = await supabase.auth.getUser(); // No longer needed
      // if (!user) throw new Error('User not authenticated'); // Handled by useUser and the check above

      // Generate unique filename
      const timestamp = Date.now();
      // Use contactId in the path for better organization if desired, or just user.id
      const filename = `${user.id}/${contactId}-${timestamp}.webm`; 
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-memos')
        .upload(filename, blob, {
          contentType: 'audio/webm',
          cacheControl: '3600'
        });
      
      if (uploadError) throw uploadError;
      if (!uploadData) throw new Error('Upload failed, no data returned.'); // Check for null uploadData
      
      setUploadStatus('Creating voice memo record...');
      
      // Create artifact record - this will trigger the Edge Function
      const { data: artifact, error: insertError } = await supabase
        .from('artifacts')
        .insert({
          contact_id: contactId,
          user_id: user.id,
          type: 'voice_memo',
          content: `Voice memo recorded (${formatDuration(duration)})`, // Using current duration
          audio_file_path: uploadData.path,
          duration_seconds: duration, // Using current duration
          transcription_status: 'pending',
          // Ensure metadata structure matches DB if it's a JSONB column with specific schema
          metadata: { 
            file_size: blob.size,
            mime_type: blob.type,
            recorded_at: new Date().toISOString()
          } as unknown as Json // Cast to Json type for Supabase compatibility
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      if (!artifact) throw new Error('Failed to create artifact record.'); // Check for null artifact
      
      setUploadStatus('Processing transcription...');
      onRecordingComplete?.(artifact);
      
      // OPTIMIZATION: Start real-time monitoring instead of polling
      monitorProcessingStatus(artifact.id);
      
    } catch (err) { 
      console.error('Error uploading voice memo (raw):', err);
      console.error('Error uploading voice memo (stringified):', JSON.stringify(err, null, 2));
      const errorMessage = err instanceof Error && err.message ? err.message : 
                         (typeof err === 'object' && err !== null && 'message' in err) ? (err as { message: string }).message :
                         'Upload failed. Please check console for details.';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsUploading(false); 
    }
  };

  // OPTIMIZATION: Replace polling with real-time subscription monitoring
  // Instead of making 90+ API calls every 2 seconds, we monitor the artifact via useVoiceMemos hook
  const monitorProcessingStatus = (artifactId: string) => {
    const maxWaitTime = 180000; // 3 minutes max wait
    let timeoutId: NodeJS.Timeout | null = null;
    
    // Set up timeout as fallback
    timeoutId = setTimeout(() => {
      setError('Processing is taking longer than expected. Your recording was saved and will be processed shortly. Please check back in a few minutes.');
      setUploadStatus('');
      setIsUploading(false);
    }, maxWaitTime);
    
    // The actual monitoring is handled by the real-time subscription in useVoiceMemos hook
    // We just need to track the artifact ID for the useEffect monitoring below
    setCurrentProcessingArtifactId(artifactId);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Disable recording button if user is not available yet, or show loading state
  if (authLoading) { // Use authLoading from your useAuth hook
    return (
      <Card sx={{mb: 2}}>
        <CardContent sx={{textAlign: 'center'}}>
          <CircularProgress />
          <Typography sx={{mt:1}}>Loading recorder...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{mb: 2}}> {/* Changed from className to sx for MUI Card */}
      <CardContent>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}> {/* sx instead of className */}
          <Typography variant="h6" sx={{display: 'flex', alignItems: 'center', gap: 1}}> {/* sx & gap */}
            <Mic color="primary" />
            Record Voice Memo
          </Typography>
          {isUploading && !success && <CircularProgress size={24} />}
          {success && <CheckCircle color="success" sx={{fontSize: 28}} />}
        </Box>
        
        <Box sx={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            p: {xs: 2, sm: 4}, // Responsive padding
            border: '2px dashed', 
            borderColor: 'grey.300', 
            borderRadius: 2, // MUI borderRadius
            bgcolor: 'grey.50', 
            '&:hover': { bgcolor: 'grey.100' },
            transition: 'background-color 0.3s'
        }}>
          <Box sx={{textAlign: 'center'}}>
            <IconButton
              onClick={isRecording ? stopRecording : startRecording}
              color={isRecording ? "error" : "primary"}
              size="large"
              disabled={isUploading || !user} // Disable if no user or uploading
              sx={{
                width: { xs: 60, sm: 80 }, // Responsive size
                height: { xs: 60, sm: 80 },
                border: 2,
                borderColor: isRecording ? 'error.main' : 'primary.main',
                // Use theme colors for consistency
                backgroundColor: isRecording ? (theme) => theme.palette.error.light : (theme) => theme.palette.primary.light,
                color: isRecording ? (theme) => theme.palette.error.contrastText : (theme) => theme.palette.primary.contrastText,
                animation: isRecording ? 'pulse 1.5s infinite' : 'none',
                transition: 'transform 0.2s, background-color 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  backgroundColor: isRecording ? (theme) => theme.palette.error.dark : (theme) => theme.palette.primary.dark,
                },
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(0,0,0, 0.2)' },
                  '70%': { boxShadow: '0 0 0 10px rgba(0,0,0, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(0,0,0, 0)' },
                }
              }}
            >
              {isRecording ? <Stop sx={{ fontSize: {xs: 30, sm: 40} }} /> : <Mic sx={{ fontSize: {xs: 30, sm: 40} }} />}
            </IconButton>
            
            <Typography variant="h6" sx={{mt: 2, fontWeight: 500}}>
              {isRecording ? `${formatDuration(duration)}` : (user ? 'Tap to Record' : 'Login to Record')}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{minHeight: '1.5em'}}>
              {isRecording 
                ? 'Recording in progress...' 
                : (isUploading && uploadStatus) ? uploadStatus 
                : !user ? 'You must be logged in to record voice memos.'
                : 'Max 2 minutes. Click the icon to start.'
              }
            </Typography>

            {isRecording && (
              <Box sx={{mt: 2, width: '80%', maxWidth: 150, mx: 'auto'}}>
                <LinearProgress 
                  variant="indeterminate" 
                  color={isRecording ? "error" : "primary"}
                  sx={{ height: 5, borderRadius: '2.5px' }}
                />
              </Box>
            )}
          </Box>
        </Box>
        
        {error && !isUploading && ( // Only show general error if not in an upload state
          <Alert severity="error" sx={{mt: 2}}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{mt: 2}}>
            ✨ Thank you for sharing! Your message has been processed and will help personalize your experience.
          </Alert>
        )}
        
        {!isRecording && !isUploading && !error && !success && user && (
           <Typography variant="caption" color="text.secondary" sx={{display:'block', mt: 2, textAlign: 'center'}}>
            Memos are transcribed and saved as artifacts for this contact.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Helper to ensure Supabase types are used, if you have them generated
// import { Database } from '@/lib/supabase/types_db';
// const supabase = useSupabaseClient<Database>();
