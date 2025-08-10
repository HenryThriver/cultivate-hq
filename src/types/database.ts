// Comprehensive database types for type safety across the application
// This file provides proper TypeScript interfaces for all database entities

import { Json } from '@/lib/supabase/database.types';

export interface DbAction {
  id: string;
  user_id: string;
  contact_id?: string | null;
  goal_id?: string | null;
  artifact_id?: string | null;
  session_id?: string | null;
  title: string;
  description?: string | null;
  action_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  due_date?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  notes?: string | null;
  estimated_duration_minutes?: number | null;
  action_data?: Json | null;
}

export interface DbArtifact {
  id: string;
  user_id: string;
  contact_id: string;
  goal_id?: string | null;
  type: string;
  content: string;
  metadata: Json | null;
  ai_insights: Json | null;
  ai_parsing_status: string | null;
  ai_processing_started_at: string | null;
  ai_processing_completed_at: string | null;
  created_at: string;
  updated_at: string;
  title?: string | null;
  loop_status?: string | null;
  priority?: string | null;
  due_date?: string | null;
  delivery_date?: string | null;
  follow_up_date?: string | null;
  audio_file_path?: string | null;
}

export interface DbContact {
  id: string;
  user_id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  title?: string | null;
  company?: string | null;
  linkedin_profile?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  relationship_stage?: string | null;
  professional_context?: Json | null;
  personal_context?: Json | null;
  is_self_contact?: boolean | null;
  last_contact_date?: string | null;
  contact_frequency?: string | null;
  timezone?: string | null;
  profile_picture_url?: string | null;
  created_at: string;
  updated_at: string;
  artifacts?: DbArtifact[];
}

export interface DbGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  timeline?: string | null;
  success_criteria?: string | null;
  target_contact_count?: number | null;
  progress_percentage?: number | null;
  target_date?: string | null;
  status: 'active' | 'completed' | 'paused' | 'archived';
  priority?: number | null;
  is_primary?: boolean | null;
  tags?: string[] | null;
  notes?: string | null;
  voice_memo_id?: string | null;
  created_from?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbGoalContact {
  id: string;
  goal_id: string;
  contact_id: string;
  user_id: string;
  relationship_type: string | null;
  relevance_score: number | null;
  how_they_help?: string | null;
  interaction_frequency?: string | null;
  last_interaction_date?: string | null;
  next_planned_interaction?: string | null;
  status?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  contacts?: DbContact;
}

export interface DbMilestone {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  description?: string | null;
  target_date?: string | null;
  completed_at?: string | null;
  status: string | null;
  order_index?: number | null;
  created_at: string | null;
  updated_at: string | null;
}

// Content types for specific artifact types
export interface POGArtifactContent {
  description: string;
  status: 'pending' | 'delivered' | 'acknowledged';
  delivery_method?: string;
  value_provided?: string;
}

export interface AskArtifactContent {
  request_description: string;
  status: 'pending' | 'fulfilled' | 'declined' | 'cancelled';
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: string;
}

export interface MeetingArtifactContent {
  title?: string;
  summary?: string;
  location?: string;
  duration_minutes?: number;
  attendees?: string[];
  action_items?: Array<{
    description: string;
    assignee?: string;
    due_date?: string;
    status?: 'pending' | 'completed';
  }>;
}

export interface ContactContext {
  role?: string;
  company?: string;
  industry?: string;
  skills?: string[];
  interests?: string[];
  location?: string;
  experience_years?: number;
  current_projects?: string[];
  goals?: string[];
  challenges?: string[];
  connections?: string[];
}

// Utility types for API responses
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  hasMore: boolean;
  nextCursor?: string;
}

// Field change handler types
export type FieldValue = string | number | boolean | Date | null | undefined;

export interface FormFieldChange {
  field: string;
  value: FieldValue;
}

// Generic database query types
export interface QueryFilters {
  user_id?: string;
  contact_id?: string;
  goal_id?: string;
  status?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateData {
  [key: string]: FieldValue | Json;
}

// Action callback types
export type ArtifactCallback = (artifactData: DbArtifact) => void;
export type ArtifactAsyncCallback = (artifactData: DbArtifact) => Promise<void>;
export type ActionCallback = (actionData: DbAction) => void;
export type ContactCallback = (contactData: DbContact) => void;

// Theme types for styled components
export interface ThemeConfig {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  text: string;
}

// Validation types
export type ValidationResult = string | null; // null means valid, string is error message
export type FieldValidator = (value: FieldValue) => ValidationResult;