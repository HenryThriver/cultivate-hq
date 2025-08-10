import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Server-side file validation configuration
const FILE_VALIDATION = {
  maxSize: 100 * 1024 * 1024, // 100MB
  allowedTypes: [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac',
    'video/mp4', 'video/mov', 'video/avi', 'video/webm'
  ],
  allowedExtensions: [
    'mp3', 'wav', 'm4a', 'aac', 'mp4', 'mov', 'avi', 'webm'
  ]
};

function sanitizePathComponent(input: string): string {
  // Remove any path traversal attempts and invalid characters
  return input
    .replace(/[\.\/\\]/g, '') // Remove dots, slashes, backslashes
    .replace(/[^a-zA-Z0-9\-_]/g, '') // Only allow alphanumeric, dash, underscore
    .substring(0, 100); // Limit length
}

function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > FILE_VALIDATION.maxSize) {
    return { valid: false, error: `File size must be less than ${FILE_VALIDATION.maxSize / (1024 * 1024)}MB` };
  }

  // Check MIME type
  if (!FILE_VALIDATION.allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only audio and video files are allowed.' };
  }

  // Check file extension as additional security layer
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !FILE_VALIDATION.allowedExtensions.includes(extension)) {
    return { valid: false, error: 'Invalid file extension.' };
  }

  return { valid: true };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const artifactId = formData.get('artifact_id') as string;
    const contactId = formData.get('contact_id') as string;
    const contentType = formData.get('content_type') as string;
    const content = formData.get('content') as string;
    const file = formData.get('file') as File | null;
    
    // Validate required fields
    if (!artifactId || !contactId || !contentType) {
      return NextResponse.json(
        { error: 'artifact_id, contact_id, and content_type are required' },
        { status: 400 }
      );
    }

    // Validate content type
    const validContentTypes = ['notes', 'transcript', 'recording', 'voice_memo'];
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content_type. Must be one of: notes, transcript, recording, voice_memo' },
        { status: 400 }
      );
    }

    // Sanitize IDs to prevent path traversal
    const sanitizedArtifactId = sanitizePathComponent(artifactId);
    const sanitizedContactId = sanitizePathComponent(contactId);
    
    if (!sanitizedArtifactId || !sanitizedContactId) {
      return NextResponse.json(
        { error: 'Invalid artifact_id or contact_id format' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Verify artifact exists and user has access
    const { data: artifact, error: fetchError } = await supabase
      .from('artifacts')
      .select('content, metadata, type')
      .eq('id', artifactId)
      .eq('contact_id', contactId) // Ensure user can only access their contacts
      .single();
    
    if (fetchError || !artifact) {
      return NextResponse.json(
        { error: 'Meeting artifact not found or access denied' },
        { status: 404 }
      );
    }

    // Verify it's a meeting artifact
    if (artifact.type !== 'meeting') {
      return NextResponse.json(
        { error: 'Artifact is not a meeting type' },
        { status: 400 }
      );
    }
    
    // Parse existing content
    let meetingContent: Record<string, unknown> = {};
    try {
      meetingContent = typeof artifact.content === 'string' 
        ? JSON.parse(artifact.content) 
        : artifact.content || {};
    } catch {
      meetingContent = {};
    }
    
    // Handle different content types with server-side validation
    if ((contentType === 'recording' || contentType === 'voice_memo') && file) {
      // Server-side file validation
      const validation = validateFile(file);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      // Create secure file path using sanitized IDs
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const fileName = `${sanitizedContactId}-${sanitizedArtifactId}-${contentType}-${timestamp}.${fileExt}`;
      const filePath = `meeting-content/${sanitizedContactId}/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('artifacts')
        .upload(filePath, file, { 
          upsert: true,
          metadata: {
            contentType: contentType,
            artifactId: artifactId,
            contactId: contactId
          }
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload file' },
          { status: 500 }
        );
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('artifacts')
        .getPublicUrl(filePath);
      
      // Update content with URL
      if (contentType === 'recording') {
        meetingContent.recording_url = publicUrl;
      } else {
        meetingContent.voice_memo_url = publicUrl;
      }
    } else if (content && (contentType === 'notes' || contentType === 'transcript')) {
      // Validate text content length (prevent extremely large content)
      if (content.length > 1000000) { // 1MB text limit
        return NextResponse.json(
          { error: 'Content too large. Maximum 1MB text allowed.' },
          { status: 400 }
        );
      }

      meetingContent[contentType] = content;
    } else {
      return NextResponse.json(
        { error: 'Invalid content type or missing content/file' },
        { status: 400 }
      );
    }
    
    // Update the artifact with new content
    const { error: updateError } = await supabase
      .from('artifacts')
      .update({
        content: JSON.stringify(meetingContent),
        ai_parsing_status: 'pending', // Trigger AI processing
        updated_at: new Date().toISOString(),
      })
      .eq('id', artifactId)
      .eq('contact_id', contactId); // Security: ensure user can only update their artifacts
    
    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update meeting artifact' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      artifact_id: artifactId,
      content_type: contentType,
      message: 'Content saved and queued for AI processing'
    });
  } catch (error) {
    console.error('Error in meetings content API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}