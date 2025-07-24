'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';

/**
 * Feature flag state interface
 */
interface FeatureFlagState {
  enabled: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Cache for feature flag results to avoid repeated database calls
 */
const featureFlagCache = new Map<string, { enabled: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to check if a feature flag is enabled for the current user
 * Considers both global settings and user-specific overrides
 * 
 * @param flagName The name of the feature flag to check
 * @returns Object with enabled status, loading state, and error
 */
export function useFeatureFlag(flagName: string): FeatureFlagState {
  const { user } = useAuth();
  const [state, setState] = useState<FeatureFlagState>({
    enabled: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!user || !flagName) {
      setState({ enabled: false, loading: false, error: null });
      return;
    }

    const checkFeatureFlag = async () => {
      try {
        // Check cache first
        const cacheKey = `${user.id}:${flagName}`;
        const cached = featureFlagCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setState({ enabled: cached.enabled, loading: false, error: null });
          return;
        }

        // Use the imported supabase client

        // Get the feature flag global setting
        const { data: flagData, error: flagError } = await supabase
          .from('feature_flags')
          .select('id, enabled_globally')
          .eq('name', flagName)
          .single();

        if (flagError) {
          if (flagError.code === 'PGRST116') {
            // Feature flag doesn't exist
            setState({ enabled: false, loading: false, error: null });
            return;
          }
          throw flagError;
        }

        let isEnabled = flagData.enabled_globally;

        // Check for user-specific override
        const { data: overrideData, error: overrideError } = await supabase
          .from('user_feature_overrides')
          .select('enabled')
          .eq('user_id', user.id)
          .eq('feature_flag_id', flagData.id)
          .maybeSingle();

        if (overrideError) {
          throw overrideError;
        }

        // User override takes precedence over global setting
        if (overrideData !== null) {
          isEnabled = overrideData.enabled;
        }

        // Cache the result
        featureFlagCache.set(cacheKey, {
          enabled: isEnabled,
          timestamp: Date.now()
        });

        setState({ enabled: isEnabled, loading: false, error: null });
      } catch (error) {
        console.error('Error checking feature flag:', error);
        setState({ 
          enabled: false, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    checkFeatureFlag();
  }, [user, flagName]);

  return state;
}

/**
 * Hook to check if the current user is an admin
 * This is for UI display purposes only - never rely on this for security
 */
export function useIsAdmin(): { isAdmin: boolean; loading: boolean; error: string | null } {
  const { user } = useAuth();
  const [state, setState] = useState({
    isAdmin: false,
    loading: true,
    error: null as string | null
  });

  useEffect(() => {
    if (!user) {
      setState({ isAdmin: false, loading: false, error: null });
      return;
    }

    const checkAdminStatus = async () => {
      try {
        // Use the imported supabase client
        
        const { data, error } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        setState({ 
          isAdmin: data?.is_admin || false, 
          loading: false, 
          error: null 
        });
      } catch (error) {
        console.error('Error checking admin status:', error);
        setState({ 
          isAdmin: false, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    checkAdminStatus();
  }, [user]);

  return state;
}

/**
 * Hook to get all feature flags and their status for the current user
 * Useful for admin interfaces
 */
export function useAllFeatureFlags(): {
  flags: Array<{
    id: string;
    name: string;
    description: string | null;
    enabled_globally: boolean;
    user_enabled?: boolean;
    has_override: boolean;
  }>;
  loading: boolean;
  error: string | null;
} {
  const { user } = useAuth();
  const [state, setState] = useState({
    flags: [] as Array<{
      id: string;
      name: string;
      description: string | null;
      enabled_globally: boolean;
      user_enabled?: boolean;
      has_override: boolean;
    }>,
    loading: true,
    error: null as string | null
  });

  useEffect(() => {
    if (!user) {
      setState({ flags: [], loading: false, error: null });
      return;
    }

    const fetchAllFlags = async () => {
      try {
        // Use the imported supabase client

        // Get all feature flags with user overrides
        const { data, error } = await supabase
          .from('feature_flags')
          .select(`
            id,
            name,
            description,
            enabled_globally,
            user_feature_overrides!inner(enabled)
          `)
          .eq('user_feature_overrides.user_id', user.id);

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        // Also get flags without overrides
        const { data: allFlags, error: allFlagsError } = await supabase
          .from('feature_flags')
          .select('id, name, description, enabled_globally');

        if (allFlagsError) {
          throw allFlagsError;
        }

        // Merge the data
        const flagsWithOverrides = new Map();
        if (data) {
          data.forEach((flag: Record<string, unknown>) => {
            flagsWithOverrides.set(flag.id, {
              ...flag,
              user_enabled: (flag.user_feature_overrides as Array<{ enabled: boolean }>)[0]?.enabled,
              has_override: true
            });
          });
        }

        const result = allFlags.map((flag: Record<string, unknown>) => {
          const override = flagsWithOverrides.get(flag.id);
          return {
            ...flag,
            user_enabled: override?.user_enabled,
            has_override: !!override
          };
        });

        setState({ flags: result, loading: false, error: null });
      } catch (error) {
        console.error('Error fetching feature flags:', error);
        setState({ 
          flags: [], 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    fetchAllFlags();
  }, [user]);

  return state;
}

/**
 * Clear the feature flag cache (useful after updates)
 */
export function clearFeatureFlagCache(): void {
  featureFlagCache.clear();
}