export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      actions: {
        Row: {
          action_data: Json | null
          action_type: string
          artifact_id: string | null
          completed_at: string | null
          completed_by_user_id: string | null
          contact_id: string | null
          created_at: string
          created_source: string | null
          description: string | null
          due_date: string | null
          estimated_duration_minutes: number | null
          goal_id: string | null
          id: string
          notes: string | null
          parent_action_id: string | null
          priority: string
          recurring_pattern: string | null
          scheduled_for: string | null
          session_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          artifact_id?: string | null
          completed_at?: string | null
          completed_by_user_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_source?: string | null
          description?: string | null
          due_date?: string | null
          estimated_duration_minutes?: number | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          parent_action_id?: string | null
          priority?: string
          recurring_pattern?: string | null
          scheduled_for?: string | null
          session_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          artifact_id?: string | null
          completed_at?: string | null
          completed_by_user_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_source?: string | null
          description?: string | null
          due_date?: string | null
          estimated_duration_minutes?: number | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          parent_action_id?: string | null
          priority?: string
          recurring_pattern?: string | null
          scheduled_for?: string | null
          session_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_completed_by_user_id_fkey"
            columns: ["completed_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_completed_by_user_id_fkey"
            columns: ["completed_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "actions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_parent_action_id_fkey"
            columns: ["parent_action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "relationship_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_audit_log_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_audit_log_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      artifact_processing_config: {
        Row: {
          artifact_type: string
          created_at: string | null
          enabled: boolean | null
          requires_content: boolean | null
          requires_metadata_fields: string[] | null
          requires_transcription: boolean | null
          updated_at: string | null
        }
        Insert: {
          artifact_type: string
          created_at?: string | null
          enabled?: boolean | null
          requires_content?: boolean | null
          requires_metadata_fields?: string[] | null
          requires_transcription?: boolean | null
          updated_at?: string | null
        }
        Update: {
          artifact_type?: string
          created_at?: string | null
          enabled?: boolean | null
          requires_content?: boolean | null
          requires_metadata_fields?: string[] | null
          requires_transcription?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      artifacts: {
        Row: {
          ai_parsing_status: string | null
          ai_processing_completed_at: string | null
          ai_processing_started_at: string | null
          audio_file_path: string | null
          contact_id: string
          content: string
          created_at: string
          duration_seconds: number | null
          id: string
          metadata: Json | null
          timestamp: string
          transcription: string | null
          transcription_status: string | null
          type: Database["public"]["Enums"]["artifact_type_enum"]
          user_id: string
        }
        Insert: {
          ai_parsing_status?: string | null
          ai_processing_completed_at?: string | null
          ai_processing_started_at?: string | null
          audio_file_path?: string | null
          contact_id: string
          content: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          timestamp?: string
          transcription?: string | null
          transcription_status?: string | null
          type: Database["public"]["Enums"]["artifact_type_enum"]
          user_id: string
        }
        Update: {
          ai_parsing_status?: string | null
          ai_processing_completed_at?: string | null
          ai_processing_started_at?: string | null
          audio_file_path?: string | null
          contact_id?: string
          content?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          timestamp?: string
          transcription?: string | null
          transcription_status?: string | null
          type?: Database["public"]["Enums"]["artifact_type_enum"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artifacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      calendar_sync_logs: {
        Row: {
          artifacts_created: number | null
          contacts_updated: string[] | null
          errors: Json | null
          events_processed: number | null
          id: string
          metadata: Json | null
          status: string | null
          sync_completed_at: string | null
          sync_started_at: string | null
          user_id: string
        }
        Insert: {
          artifacts_created?: number | null
          contacts_updated?: string[] | null
          errors?: Json | null
          events_processed?: number | null
          id?: string
          metadata?: Json | null
          status?: string | null
          sync_completed_at?: string | null
          sync_started_at?: string | null
          user_id: string
        }
        Update: {
          artifacts_created?: number | null
          contacts_updated?: string[] | null
          errors?: Json | null
          events_processed?: number | null
          id?: string
          metadata?: Json | null
          status?: string | null
          sync_completed_at?: string | null
          sync_started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_sync_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_sync_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      contact_emails: {
        Row: {
          contact_id: string
          created_at: string | null
          email: string
          email_type: string | null
          id: string
          is_primary: boolean | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          email: string
          email_type?: string | null
          id?: string
          is_primary?: boolean | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          email?: string
          email_type?: string | null
          id?: string
          is_primary?: boolean | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_emails_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_specific_sync_jobs: {
        Row: {
          contact_id: string
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          processed_at: string | null
          status: string | null
          sync_options: Json
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          status?: string | null
          sync_options?: Json
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          status?: string | null
          sync_options?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_specific_sync_jobs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_specific_sync_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_specific_sync_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      contact_update_suggestions: {
        Row: {
          applied_at: string | null
          artifact_id: string | null
          confidence_scores: Json | null
          contact_id: string | null
          created_at: string | null
          dismissed_at: string | null
          field_paths: string[]
          id: string
          priority: string | null
          reviewed_at: string | null
          status: string | null
          suggested_updates: Json
          user_id: string | null
          user_selections: Json | null
          viewed_at: string | null
        }
        Insert: {
          applied_at?: string | null
          artifact_id?: string | null
          confidence_scores?: Json | null
          contact_id?: string | null
          created_at?: string | null
          dismissed_at?: string | null
          field_paths: string[]
          id?: string
          priority?: string | null
          reviewed_at?: string | null
          status?: string | null
          suggested_updates: Json
          user_id?: string | null
          user_selections?: Json | null
          viewed_at?: string | null
        }
        Update: {
          applied_at?: string | null
          artifact_id?: string | null
          confidence_scores?: Json | null
          contact_id?: string | null
          created_at?: string | null
          dismissed_at?: string | null
          field_paths?: string[]
          id?: string
          priority?: string | null
          reviewed_at?: string | null
          status?: string | null
          suggested_updates?: Json
          user_id?: string | null
          user_selections?: Json | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_update_suggestions_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_update_suggestions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_update_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_update_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      contacts: {
        Row: {
          added_via_session_id: string | null
          company: string | null
          connection_cadence_days: number | null
          created_at: string
          email: string | null
          email_addresses: string[] | null
          field_sources: Json | null
          gmail_labels: string[] | null
          id: string
          last_interaction_date: string | null
          linkedin_analysis_completed_at: string | null
          linkedin_data: Json | null
          linkedin_posts_last_sync_at: string | null
          linkedin_posts_sync_status: string | null
          linkedin_url: string | null
          location: string | null
          name: string | null
          notes: string | null
          personal_context: Json | null
          professional_context: Json | null
          relationship_score: number | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          added_via_session_id?: string | null
          company?: string | null
          connection_cadence_days?: number | null
          created_at?: string
          email?: string | null
          email_addresses?: string[] | null
          field_sources?: Json | null
          gmail_labels?: string[] | null
          id?: string
          last_interaction_date?: string | null
          linkedin_analysis_completed_at?: string | null
          linkedin_data?: Json | null
          linkedin_posts_last_sync_at?: string | null
          linkedin_posts_sync_status?: string | null
          linkedin_url?: string | null
          location?: string | null
          name?: string | null
          notes?: string | null
          personal_context?: Json | null
          professional_context?: Json | null
          relationship_score?: number | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          added_via_session_id?: string | null
          company?: string | null
          connection_cadence_days?: number | null
          created_at?: string
          email?: string | null
          email_addresses?: string[] | null
          field_sources?: Json | null
          gmail_labels?: string[] | null
          id?: string
          last_interaction_date?: string | null
          linkedin_analysis_completed_at?: string | null
          linkedin_data?: Json | null
          linkedin_posts_last_sync_at?: string | null
          linkedin_posts_sync_status?: string | null
          linkedin_url?: string | null
          location?: string | null
          name?: string | null
          notes?: string | null
          personal_context?: Json | null
          professional_context?: Json | null
          relationship_score?: number | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_added_via_session_id_fkey"
            columns: ["added_via_session_id"]
            isOneToOne: false
            referencedRelation: "relationship_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      email_sync_jobs: {
        Row: {
          contact_id: string
          created_artifacts: number | null
          created_at: string
          date_range_end: string
          date_range_start: string
          email_addresses: string[]
          error_message: string | null
          id: string
          max_results: number | null
          metadata: Json | null
          processed_at: string | null
          processed_emails: number | null
          status: string | null
          sync_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_artifacts?: number | null
          created_at?: string
          date_range_end: string
          date_range_start: string
          email_addresses: string[]
          error_message?: string | null
          id?: string
          max_results?: number | null
          metadata?: Json | null
          processed_at?: string | null
          processed_emails?: number | null
          status?: string | null
          sync_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_artifacts?: number | null
          created_at?: string
          date_range_end?: string
          date_range_start?: string
          email_addresses?: string[]
          error_message?: string | null
          id?: string
          max_results?: number | null
          metadata?: Json | null
          processed_at?: string | null
          processed_emails?: number | null
          status?: string | null
          sync_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sync_jobs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sync_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sync_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          enabled_globally: boolean
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled_globally?: boolean
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled_globally?: boolean
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      gmail_sync_state: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          last_sync_timestamp: string | null
          last_sync_token: string | null
          sync_status: string | null
          total_emails_synced: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_timestamp?: string | null
          last_sync_token?: string | null
          sync_status?: string | null
          total_emails_synced?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_sync_timestamp?: string | null
          last_sync_token?: string | null
          sync_status?: string | null
          total_emails_synced?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gmail_sync_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gmail_sync_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      goal_contacts: {
        Row: {
          contact_id: string
          created_at: string | null
          goal_id: string
          how_they_help: string | null
          id: string
          interaction_frequency: string | null
          last_interaction_date: string | null
          next_planned_interaction: string | null
          notes: string | null
          relationship_type: string | null
          relevance_score: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          goal_id: string
          how_they_help?: string | null
          id?: string
          interaction_frequency?: string | null
          last_interaction_date?: string | null
          next_planned_interaction?: string | null
          notes?: string | null
          relationship_type?: string | null
          relevance_score?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          goal_id?: string
          how_they_help?: string | null
          id?: string
          interaction_frequency?: string | null
          last_interaction_date?: string | null
          next_planned_interaction?: string | null
          notes?: string | null
          relationship_type?: string | null
          relevance_score?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_contacts_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      goal_milestones: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          goal_id: string
          id: string
          order_index: number | null
          status: string | null
          target_date: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          goal_id: string
          id?: string
          order_index?: number | null
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          goal_id?: string
          id?: string
          order_index?: number | null
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      goals: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string | null
          created_from: string | null
          description: string | null
          id: string
          is_primary: boolean | null
          notes: string | null
          priority: number | null
          progress_percentage: number | null
          status: string | null
          success_criteria: string | null
          tags: string[] | null
          target_contact_count: number | null
          target_date: string | null
          timeline: string | null
          title: string
          updated_at: string | null
          user_id: string
          voice_memo_id: string | null
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_from?: string | null
          description?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          priority?: number | null
          progress_percentage?: number | null
          status?: string | null
          success_criteria?: string | null
          tags?: string[] | null
          target_contact_count?: number | null
          target_date?: string | null
          timeline?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          voice_memo_id?: string | null
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_from?: string | null
          description?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          priority?: number | null
          progress_percentage?: number | null
          status?: string | null
          success_criteria?: string | null
          tags?: string[] | null
          target_contact_count?: number | null
          target_date?: string | null
          timeline?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          voice_memo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "goals_voice_memo_id_fkey"
            columns: ["voice_memo_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      loop_analytics: {
        Row: {
          completion_time_days: number | null
          contact_id: string
          created_at: string | null
          id: string
          loop_artifact_id: string
          loop_type: string
          reciprocity_impact: number | null
          status_transitions: Json
          success_score: number | null
          user_id: string
        }
        Insert: {
          completion_time_days?: number | null
          contact_id: string
          created_at?: string | null
          id?: string
          loop_artifact_id: string
          loop_type: string
          reciprocity_impact?: number | null
          status_transitions?: Json
          success_score?: number | null
          user_id: string
        }
        Update: {
          completion_time_days?: number | null
          contact_id?: string
          created_at?: string | null
          id?: string
          loop_artifact_id?: string
          loop_type?: string
          reciprocity_impact?: number | null
          status_transitions?: Json
          success_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loop_analytics_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loop_analytics_loop_artifact_id_fkey"
            columns: ["loop_artifact_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loop_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loop_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      loop_suggestions: {
        Row: {
          contact_id: string
          created_at: string | null
          created_loop_id: string | null
          id: string
          source_artifact_id: string
          status: string
          suggestion_data: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          created_loop_id?: string | null
          id?: string
          source_artifact_id: string
          status?: string
          suggestion_data: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          created_loop_id?: string | null
          id?: string
          source_artifact_id?: string
          status?: string
          suggestion_data?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loop_suggestions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loop_suggestions_created_loop_id_fkey"
            columns: ["created_loop_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loop_suggestions_source_artifact_id_fkey"
            columns: ["source_artifact_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loop_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loop_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      loop_templates: {
        Row: {
          completion_criteria: string[] | null
          created_at: string | null
          default_actions: Json
          default_status: string
          default_title_template: string | null
          description: string | null
          follow_up_schedule: number[] | null
          id: string
          loop_type: string
          name: string
          reciprocity_direction: string
          typical_duration: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completion_criteria?: string[] | null
          created_at?: string | null
          default_actions?: Json
          default_status?: string
          default_title_template?: string | null
          description?: string | null
          follow_up_schedule?: number[] | null
          id?: string
          loop_type: string
          name: string
          reciprocity_direction?: string
          typical_duration?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completion_criteria?: string[] | null
          created_at?: string | null
          default_actions?: Json
          default_status?: string
          default_title_template?: string | null
          description?: string | null
          follow_up_schedule?: number[] | null
          id?: string
          loop_type?: string
          name?: string
          reciprocity_direction?: string
          typical_duration?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loop_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loop_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      next_connections: {
        Row: {
          agenda: Json | null
          connection_type: string
          contact_id: string | null
          created_at: string | null
          id: string
          location: string | null
          scheduled_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agenda?: Json | null
          connection_type: string
          contact_id?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          scheduled_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agenda?: Json | null
          connection_type?: string
          contact_id?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          scheduled_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "next_connections_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "next_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "next_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      onboarding_state: {
        Row: {
          calendar_connected: boolean | null
          challenge_voice_memo_id: string | null
          completed_screens: number[] | null
          created_at: string | null
          current_screen: number | null
          gmail_connected: boolean | null
          goal_contact_urls: string[] | null
          goal_id: string | null
          goal_voice_memo_id: string | null
          id: string
          imported_goal_contacts: Json | null
          last_activity_at: string | null
          linkedin_connected: boolean | null
          linkedin_contacts_added: number | null
          profile_enhancement_voice_memo_id: string | null
          started_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calendar_connected?: boolean | null
          challenge_voice_memo_id?: string | null
          completed_screens?: number[] | null
          created_at?: string | null
          current_screen?: number | null
          gmail_connected?: boolean | null
          goal_contact_urls?: string[] | null
          goal_id?: string | null
          goal_voice_memo_id?: string | null
          id?: string
          imported_goal_contacts?: Json | null
          last_activity_at?: string | null
          linkedin_connected?: boolean | null
          linkedin_contacts_added?: number | null
          profile_enhancement_voice_memo_id?: string | null
          started_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calendar_connected?: boolean | null
          challenge_voice_memo_id?: string | null
          completed_screens?: number[] | null
          created_at?: string | null
          current_screen?: number | null
          gmail_connected?: boolean | null
          goal_contact_urls?: string[] | null
          goal_id?: string | null
          goal_voice_memo_id?: string | null
          id?: string
          imported_goal_contacts?: Json | null
          last_activity_at?: string | null
          linkedin_connected?: boolean | null
          linkedin_contacts_added?: number | null
          profile_enhancement_voice_memo_id?: string | null
          started_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_state_challenge_voice_memo_id_fkey"
            columns: ["challenge_voice_memo_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_state_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_state_goal_voice_memo_id_fkey"
            columns: ["goal_voice_memo_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_state_profile_enhancement_voice_memo_id_fkey"
            columns: ["profile_enhancement_voice_memo_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      relationship_sessions: {
        Row: {
          actions_completed: number | null
          actions_skipped: number | null
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          goal_id: string | null
          id: string
          session_notes: string | null
          session_rating: number | null
          session_type: string
          started_at: string
          status: string
          timer_paused_at: string | null
          timer_started_at: string | null
          total_paused_duration: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actions_completed?: number | null
          actions_skipped?: number | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          goal_id?: string | null
          id?: string
          session_notes?: string | null
          session_rating?: number | null
          session_type?: string
          started_at?: string
          status?: string
          timer_paused_at?: string | null
          timer_started_at?: string | null
          total_paused_duration?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actions_completed?: number | null
          actions_skipped?: number | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          goal_id?: string | null
          id?: string
          session_notes?: string | null
          session_rating?: number | null
          session_type?: string
          started_at?: string
          status?: string
          timer_paused_at?: string | null
          timer_started_at?: string | null
          total_paused_duration?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_sessions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          last_payment_date: string | null
          plan_type: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_payment_date?: string | null
          plan_type: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_payment_date?: string | null
          plan_type?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      trigger_debug_log: {
        Row: {
          artifact_id: string | null
          artifact_type: string | null
          created_at: string | null
          id: number
          message: string | null
          new_status: string | null
          old_status: string | null
          trigger_name: string | null
          trigger_operation: string | null
        }
        Insert: {
          artifact_id?: string | null
          artifact_type?: string | null
          created_at?: string | null
          id?: number
          message?: string | null
          new_status?: string | null
          old_status?: string | null
          trigger_name?: string | null
          trigger_operation?: string | null
        }
        Update: {
          artifact_id?: string | null
          artifact_type?: string | null
          created_at?: string | null
          id?: number
          message?: string | null
          new_status?: string | null
          old_status?: string | null
          trigger_name?: string | null
          trigger_operation?: string | null
        }
        Relationships: []
      }
      user_feature_overrides: {
        Row: {
          created_at: string
          enabled: boolean
          feature_flag_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled: boolean
          feature_flag_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          feature_flag_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feature_overrides_feature_flag_id_fkey"
            columns: ["feature_flag_id"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feature_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feature_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feature_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_integrations: {
        Row: {
          access_token: string | null
          created_at: string | null
          id: string
          integration_type: string
          metadata: Json | null
          refresh_token: string | null
          scopes: string[] | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          integration_type: string
          metadata?: Json | null
          refresh_token?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          integration_type?: string
          metadata?: Json | null
          refresh_token?: string | null
          scopes?: string[] | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_tokens: {
        Row: {
          created_at: string
          gmail_access_token: string | null
          gmail_refresh_token: string | null
          gmail_token_expiry: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gmail_access_token?: string | null
          gmail_refresh_token?: string | null
          gmail_token_expiry?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gmail_access_token?: string | null
          gmail_refresh_token?: string | null
          gmail_token_expiry?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          challenge_feature_mappings: Json | null
          created_at: string
          email: string
          goal_description: string | null
          goal_success_criteria: string | null
          goal_timeline: string | null
          id: string
          introduction_opportunities: string[] | null
          is_admin: boolean
          knowledge_to_share: string[] | null
          name: string | null
          networking_challenges: string[] | null
          onboarding_completed_at: string | null
          onboarding_voice_memo_ids: string[] | null
          primary_goal: string | null
          profile_completion_score: number | null
          profile_picture: string | null
          updated_at: string
          ways_to_help_others: string[] | null
        }
        Insert: {
          challenge_feature_mappings?: Json | null
          created_at?: string
          email: string
          goal_description?: string | null
          goal_success_criteria?: string | null
          goal_timeline?: string | null
          id: string
          introduction_opportunities?: string[] | null
          is_admin?: boolean
          knowledge_to_share?: string[] | null
          name?: string | null
          networking_challenges?: string[] | null
          onboarding_completed_at?: string | null
          onboarding_voice_memo_ids?: string[] | null
          primary_goal?: string | null
          profile_completion_score?: number | null
          profile_picture?: string | null
          updated_at?: string
          ways_to_help_others?: string[] | null
        }
        Update: {
          challenge_feature_mappings?: Json | null
          created_at?: string
          email?: string
          goal_description?: string | null
          goal_success_criteria?: string | null
          goal_timeline?: string | null
          id?: string
          introduction_opportunities?: string[] | null
          is_admin?: boolean
          knowledge_to_share?: string[] | null
          name?: string | null
          networking_challenges?: string[] | null
          onboarding_completed_at?: string | null
          onboarding_voice_memo_ids?: string[] | null
          primary_goal?: string | null
          profile_completion_score?: number | null
          profile_picture?: string | null
          updated_at?: string
          ways_to_help_others?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      profiles: {
        Row: {
          email: string | null
          full_name: string | null
          id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_plan: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_management_view: {
        Row: {
          created_at: string | null
          email: string | null
          feature_override_count: number | null
          full_name: string | null
          id: string | null
          is_admin: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          feature_override_count?: never
          full_name?: string | null
          id?: string | null
          is_admin?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          feature_override_count?: never
          full_name?: string | null
          id?: string | null
          is_admin?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          linkedin_url: string | null
          name: string | null
          personal_context: Json | null
          professional_context: Json | null
          raw_user_meta_data: Json | null
          relationship_score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_goal_from_voice_memo: {
        Args: {
          p_user_id: string
          p_voice_memo_id: string
          p_title: string
          p_description?: string
          p_category?: string
          p_timeline?: string
          p_success_criteria?: string
          p_is_primary?: boolean
        }
        Returns: string
      }
      get_decrypted_secret: {
        Args: { secret_name: string }
        Returns: string
      }
      get_or_create_self_contact: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_primary_goal: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          title: string
          description: string
          category: string
          timeline: string
          success_criteria: string
          progress_percentage: number
          created_at: string
        }[]
      }
      get_self_contact_id: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_integration: {
        Args: { p_user_id: string; p_integration_type: string }
        Returns: {
          id: string
          access_token: string
          refresh_token: string
          token_expires_at: string
          scopes: string[]
          metadata: Json
        }[]
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_feature_enabled_for_current_user: {
        Args: { flag_name: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_admin_user_id: string
          p_action: string
          p_resource_type: string
          p_resource_id?: string
          p_details?: string
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      upsert_user_integration: {
        Args: {
          p_user_id: string
          p_integration_type: string
          p_access_token: string
          p_refresh_token?: string
          p_token_expires_at?: string
          p_scopes?: string[]
          p_metadata?: Json
        }
        Returns: string
      }
    }
    Enums: {
      artifact_type_enum:
        | "note"
        | "email"
        | "call"
        | "meeting"
        | "linkedin_message"
        | "linkedin_post"
        | "file"
        | "other"
        | "pog"
        | "ask"
        | "linkedin_profile"
        | "voice_memo"
        | "loop"
        | "milestone"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          format: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          format?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_namespaces_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_tables_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "iceberg_namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; name: string; owner: string; metadata: Json }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
        Returns: string[]
      }
      get_level: {
        Args: { name: string }
        Returns: number
      }
      get_prefix: {
        Args: { name: string }
        Returns: string
      }
      get_prefixes: {
        Args: { name: string }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_legacy_v1: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v1_optimised: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v2: {
        Args: {
          prefix: string
          bucket_name: string
          limits?: number
          levels?: number
          start_after?: string
        }
        Returns: {
          key: string
          name: string
          id: string
          updated_at: string
          created_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      artifact_type_enum: [
        "note",
        "email",
        "call",
        "meeting",
        "linkedin_message",
        "linkedin_post",
        "file",
        "other",
        "pog",
        "ask",
        "linkedin_profile",
        "voice_memo",
        "loop",
        "milestone",
      ],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS"],
    },
  },
} as const

