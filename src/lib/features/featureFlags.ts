import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

/**
 * Server-side utility to check if a feature flag is enabled for a specific user
 * This function is cached per request to avoid multiple database calls
 * 
 * @param userId The user ID to check the feature flag for
 * @param flagName The name of the feature flag
 * @returns Promise<boolean> indicating if the feature is enabled
 */
export const isFeatureEnabled = cache(async (
  userId: string, 
  flagName: string
): Promise<boolean> => {
  try {
    const supabase = await createClient();

    // Get the feature flag
    const { data: flagData, error: flagError } = await supabase
      .from('feature_flags')
      .select('id, enabled_globally')
      .eq('name', flagName)
      .single();

    if (flagError) {
      if (flagError.code === 'PGRST116') {
        // Feature flag doesn't exist, return false
        return false;
      }
      console.error('Error fetching feature flag:', flagError);
      return false;
    }

    // Check for user-specific override
    const { data: overrideData, error: overrideError } = await supabase
      .from('user_feature_overrides')
      .select('enabled')
      .eq('user_id', userId)
      .eq('feature_flag_id', flagData.id)
      .maybeSingle();

    if (overrideError) {
      console.error('Error fetching user feature override:', overrideError);
      return flagData.enabled_globally;
    }

    // User override takes precedence over global setting
    return overrideData?.enabled ?? flagData.enabled_globally;
  } catch (error) {
    console.error('Error checking feature flag:', error);
    return false;
  }
});

/**
 * Server-side utility to check if the current authenticated user has a feature enabled
 * 
 * @param flagName The name of the feature flag
 * @returns Promise<boolean> indicating if the feature is enabled
 */
export async function isFeatureEnabledForCurrentUser(flagName: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return false;
    }

    return await isFeatureEnabled(user.id, flagName);
  } catch (error) {
    console.error('Error checking feature flag for current user:', error);
    return false;
  }
}

/**
 * Server-side utility to get all feature flags with their current status for a user
 * Useful for admin interfaces and debugging
 */
export async function getAllFeatureFlagsForUser(userId: string): Promise<Array<{
  id: string;
  name: string;
  description: string | null;
  enabled_globally: boolean;
  user_enabled: boolean;
  has_override: boolean;
}>> {
  try {
    const supabase = await createClient();

    // Get all feature flags
    const { data: flags, error: flagsError } = await supabase
      .from('feature_flags')
      .select('id, name, description, enabled_globally')
      .order('name');

    if (flagsError) {
      console.error('Error fetching feature flags:', flagsError);
      return [];
    }

    // Get user overrides
    const { data: overrides, error: overridesError } = await supabase
      .from('user_feature_overrides')
      .select('feature_flag_id, enabled')
      .eq('user_id', userId);

    if (overridesError) {
      console.error('Error fetching user feature overrides:', overridesError);
      return flags.map(flag => ({
        ...flag,
        user_enabled: flag.enabled_globally,
        has_override: false
      }));
    }

    // Create a map of overrides for quick lookup
    const overrideMap = new Map(
      overrides.map(override => [override.feature_flag_id, override.enabled])
    );

    // Combine flags with overrides
    return flags.map(flag => {
      const hasOverride = overrideMap.has(flag.id);
      const userEnabled = hasOverride 
        ? overrideMap.get(flag.id)! 
        : flag.enabled_globally;

      return {
        ...flag,
        user_enabled: userEnabled,
        has_override: hasOverride
      };
    });
  } catch (error) {
    console.error('Error getting all feature flags for user:', error);
    return [];
  }
}

/**
 * Server-side utility to create a new feature flag
 * Only should be called by admin users (validation should be done at API level)
 */
export async function createFeatureFlag(
  name: string,
  description: string | null = null,
  enabledGlobally: boolean = false
): Promise<{ success: boolean; error?: string; flagId?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('feature_flags')
      .insert({
        name,
        description,
        enabled_globally: enabledGlobally
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, flagId: data.id };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Server-side utility to update a feature flag
 */
export async function updateFeatureFlag(
  flagId: string,
  updates: {
    name?: string;
    description?: string | null;
    enabled_globally?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('feature_flags')
      .update(updates)
      .eq('id', flagId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Server-side utility to delete a feature flag
 */
export async function deleteFeatureFlag(flagId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('feature_flags')
      .delete()
      .eq('id', flagId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Server-side utility to set a user-specific feature flag override
 */
export async function setUserFeatureOverride(
  userId: string,
  flagName: string,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // First get the feature flag ID
    const { data: flagData, error: flagError } = await supabase
      .from('feature_flags')
      .select('id')
      .eq('name', flagName)
      .single();

    if (flagError) {
      return { success: false, error: `Feature flag '${flagName}' not found` };
    }

    // Upsert the user override
    const { error } = await supabase
      .from('user_feature_overrides')
      .upsert({
        user_id: userId,
        feature_flag_id: flagData.id,
        enabled
      }, {
        onConflict: 'user_id,feature_flag_id'
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Server-side utility to remove a user-specific feature flag override
 */
export async function removeUserFeatureOverride(
  userId: string,
  flagName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // First get the feature flag ID
    const { data: flagData, error: flagError } = await supabase
      .from('feature_flags')
      .select('id')
      .eq('name', flagName)
      .single();

    if (flagError) {
      return { success: false, error: `Feature flag '${flagName}' not found` };
    }

    // Delete the user override
    const { error } = await supabase
      .from('user_feature_overrides')
      .delete()
      .eq('user_id', userId)
      .eq('feature_flag_id', flagData.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Common feature flag names used throughout the application
 * This helps prevent typos and provides autocompletion
 */
export const FEATURE_FLAGS = {
  NEW_DASHBOARD_UI: 'new_dashboard_ui',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  BETA_FEATURES: 'beta_features',
  DEBUG_MODE: 'debug_mode'
} as const;

/**
 * Type for feature flag names
 */
export type FeatureFlagName = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];