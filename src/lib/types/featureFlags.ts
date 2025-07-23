/**
 * Temporary type definitions for feature flag system
 * These will be replaced by generated Supabase types after migrations are applied
 */

// Extend the existing Database type temporarily
declare module '@/lib/supabase/database.types' {
  interface Database {
    public: {
      Tables: {
        feature_flags: {
          Row: {
            id: string;
            name: string;
            description: string | null;
            enabled_globally: boolean;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            name: string;
            description?: string | null;
            enabled_globally?: boolean;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            name?: string;
            description?: string | null;
            enabled_globally?: boolean;
            created_at?: string;
            updated_at?: string;
          };
        };
        user_feature_overrides: {
          Row: {
            id: string;
            user_id: string;
            feature_flag_id: string;
            enabled: boolean;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            user_id: string;
            feature_flag_id: string;
            enabled: boolean;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            user_id?: string;
            feature_flag_id?: string;
            enabled?: boolean;
            created_at?: string;
            updated_at?: string;
          };
        };
        admin_audit_log: {
          Row: {
            id: string;
            admin_user_id: string;
            action: string;
            resource_type: string;
            resource_id: string | null;
            details: any | null;
            ip_address: string | null;
            user_agent: string | null;
            created_at: string;
          };
          Insert: {
            id?: string;
            admin_user_id: string;
            action: string;
            resource_type: string;
            resource_id?: string | null;
            details?: any | null;
            ip_address?: string | null;
            user_agent?: string | null;
            created_at?: string;
          };
          Update: {
            id?: string;
            admin_user_id?: string;
            action?: string;
            resource_type?: string;
            resource_id?: string | null;
            details?: any | null;
            ip_address?: string | null;
            user_agent?: string | null;
            created_at?: string;
          };
        };
        users: {
          Row: {
            id: string;
            email: string;
            full_name: string | null;
            is_admin: boolean;
            created_at: string;
            updated_at: string;
            self_contact_id: string | null;
          };
          Insert: {
            id?: string;
            email: string;
            full_name?: string | null;
            is_admin?: boolean;
            created_at?: string;
            updated_at?: string;
            self_contact_id?: string | null;
          };
          Update: {
            id?: string;
            email?: string;
            full_name?: string | null;
            is_admin?: boolean;
            created_at?: string;
            updated_at?: string;
            self_contact_id?: string | null;
          };
        };
      } & Database['public']['Tables'];
    } & Database['public'];
  } & Database;
}