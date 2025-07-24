/**
 * Type definitions for Supabase RPC (Remote Procedure Call) functions
 * These types ensure type safety when calling database functions
 */

/**
 * Parameters for the log_admin_action RPC function
 */
export interface LogAdminActionParams {
  p_admin_user_id: string;
  p_action: string;
  p_resource_type: string;
  p_resource_id?: string | null;
  p_details?: string | null;
  p_ip_address?: string | null;
  p_user_agent?: string | null;
}

/**
 * Return type for the log_admin_action RPC function
 */
export type LogAdminActionReturn = void;

/**
 * Common admin actions tracked in the audit log
 */
export type AdminAction =
  | 'CREATE_FEATURE_FLAG'
  | 'UPDATE_FEATURE_FLAG'
  | 'DELETE_FEATURE_FLAG'
  | 'TOGGLE_FEATURE_FLAG'
  | 'LIST_FEATURE_FLAGS'
  | 'VIEW_FEATURE_FLAG'
  | 'CREATE_USER_OVERRIDE'
  | 'UPDATE_USER_OVERRIDE'
  | 'DELETE_USER_OVERRIDE'
  | 'LOGIN_AS_ADMIN'
  | 'VIEW_ADMIN_PANEL'
  | 'EXPORT_DATA'
  | 'IMPORT_DATA';

/**
 * Resource types that can be acted upon by admins
 */
export type AdminResourceType =
  | 'feature_flags'
  | 'user_feature_overrides'
  | 'users'
  | 'admin_audit_log'
  | 'system';

/**
 * Helper type for RPC function declarations
 */
export interface RPCFunctionMap {
  log_admin_action: {
    Args: LogAdminActionParams;
    Returns: LogAdminActionReturn;
  };
}

/**
 * Type-safe wrapper for calling RPC functions
 */
export type RPCFunction<T extends keyof RPCFunctionMap> = (
  args: RPCFunctionMap[T]['Args']
) => Promise<{ data: RPCFunctionMap[T]['Returns']; error: null } | { data: null; error: unknown }>;

/**
 * Audit log entry details for specific actions
 */
export interface FeatureFlagAuditDetails {
  name?: string;
  description?: string;
  enabled_globally?: boolean;
  from?: boolean;
  to?: boolean;
}

export interface UserOverrideAuditDetails {
  user_id?: string;
  flag_name?: string;
  enabled?: boolean;
  previous_enabled?: boolean;
}

/**
 * Union type for all possible audit details
 */
export type AuditDetails = 
  | FeatureFlagAuditDetails 
  | UserOverrideAuditDetails 
  | Record<string, unknown>;