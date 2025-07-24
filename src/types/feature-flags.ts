/**
 * Type definitions for feature flag database tables and related types
 */

/**
 * Base feature flag table row
 */
export interface FeatureFlagRow {
  id: string;
  name: string;
  description: string | null;
  enabled_globally: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * User feature override table row
 */
export interface UserFeatureOverrideRow {
  id: string;
  user_id: string;
  feature_flag_id: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Feature flag with user override information (for admin views)
 */
export interface FeatureFlagWithOverride extends FeatureFlagRow {
  user_enabled?: boolean;
  has_override: boolean;
}

/**
 * Type for the join query result from feature_flags with user_feature_overrides
 */
export interface FeatureFlagWithUserOverride extends FeatureFlagRow {
  user_feature_overrides: Array<{
    enabled: boolean;
  }>;
}

/**
 * Admin audit log table row
 */
export interface AdminAuditLogRow {
  id: string;
  admin_user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
}

/**
 * Type guards for safe type checking
 */
export function isFeatureFlagRow(obj: unknown): obj is FeatureFlagRow {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as FeatureFlagRow).id === 'string' &&
    typeof (obj as FeatureFlagRow).name === 'string' &&
    typeof (obj as FeatureFlagRow).enabled_globally === 'boolean' &&
    typeof (obj as FeatureFlagRow).created_at === 'string' &&
    typeof (obj as FeatureFlagRow).updated_at === 'string'
  );
}

export function isFeatureFlagWithUserOverride(obj: unknown): obj is FeatureFlagWithUserOverride {
  return (
    isFeatureFlagRow(obj) &&
    Array.isArray((obj as FeatureFlagWithUserOverride).user_feature_overrides)
  );
}

/**
 * Utility function to safely extract override data
 */
export function extractUserOverride(
  overrides: unknown
): { enabled: boolean } | null {
  if (!Array.isArray(overrides) || overrides.length === 0) {
    return null;
  }
  
  const firstOverride = overrides[0];
  if (
    typeof firstOverride === 'object' &&
    firstOverride !== null &&
    typeof (firstOverride as { enabled: boolean }).enabled === 'boolean'
  ) {
    return { enabled: (firstOverride as { enabled: boolean }).enabled };
  }
  
  return null;
}