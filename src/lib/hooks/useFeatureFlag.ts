'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import type { 
  FeatureFlagRow, 
  FeatureFlagWithOverride
} from '@/types/feature-flags';
import { isFeatureFlagRow } from '@/types/feature-flags';

/**
 * Feature flag state interface
 */
interface FeatureFlagState {
  enabled: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Improved cache for feature flag results with collision-safe keys and size limits
 */
class FeatureFlagCache {
  private cache = new Map<string, { enabled: boolean; timestamp: number }>();
  private readonly maxSize = 1000;
  private readonly ttl = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate a collision-safe cache key
   */
  private generateKey(userId: string, flagName: string): string {
    // Use a separator that's unlikely to appear in UUIDs or flag names
    return `${userId}|${flagName}`;
  }

  /**
   * Get cached value if valid
   */
  get(userId: string, flagName: string): boolean | null {
    const key = this.generateKey(userId, flagName);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.enabled;
  }

  /**
   * Set cached value with automatic cleanup
   */
  set(userId: string, flagName: string, enabled: boolean): void {
    // Clean up if cache is getting too large
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }
    
    const key = this.generateKey(userId, flagName);
    this.cache.set(key, {
      enabled,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache for a specific user (useful when admin changes affect them)
   */
  clearUser(userId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${userId}|`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear cache for a specific flag (useful when global setting changes)
   */
  clearFlag(flagName: string): void {
    for (const key of this.cache.keys()) {
      if (key.endsWith(`|${flagName}`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear expired entries and limit cache size
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    // Find expired entries
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        expiredKeys.push(key);
      }
    }
    
    // Remove expired entries
    expiredKeys.forEach(key => this.cache.delete(key));
    
    // If still too large, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.2)); // Remove 20%
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  getStats(): { size: number; maxSize: number; ttl: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl
    };
  }
}

const featureFlagCache = new FeatureFlagCache();

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
        const cachedValue = featureFlagCache.get(user.id, flagName);
        
        if (cachedValue !== null) {
          setState({ enabled: cachedValue, loading: false, error: null });
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
        featureFlagCache.set(user.id, flagName, isEnabled);

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
  flags: FeatureFlagWithOverride[];
  loading: boolean;
  error: string | null;
} {
  const { user } = useAuth();
  const [state, setState] = useState({
    flags: [] as FeatureFlagWithOverride[],
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
        // Use a single optimized query with LEFT JOIN to get all flags and their overrides
        // This eliminates the N+1 query pattern by getting everything in one request
        const { data: flagsData, error } = await supabase
          .from('feature_flags')
          .select(`
            id,
            name,
            description,
            enabled_globally,
            created_at,
            updated_at,
            user_feature_overrides!left(
              enabled,
              user_id
            )
          `)
          .eq('user_feature_overrides.user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Process the joined data safely with type checking
        const result: FeatureFlagWithOverride[] = [];
        
        if (flagsData && Array.isArray(flagsData)) {
          flagsData.forEach((flag: unknown) => {
            if (isFeatureFlagRow(flag)) {
              // Check if there's a user override
              const flagWithOverrides = flag as FeatureFlagRow & {
                user_feature_overrides: Array<{ enabled: boolean; user_id: string }> | null;
              };
              
              const userOverrides = flagWithOverrides.user_feature_overrides;
              const hasOverride = userOverrides && userOverrides.length > 0;
              const userEnabled = hasOverride ? userOverrides[0].enabled : undefined;
              
              result.push({
                ...flag,
                user_enabled: userEnabled,
                has_override: !!hasOverride
              });
            }
          });
        }

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

/**
 * Clear cache for a specific user (useful when admin changes affect them)
 */
export function clearFeatureFlagCacheForUser(userId: string): void {
  featureFlagCache.clearUser(userId);
}

/**
 * Clear cache for a specific flag (useful when global setting changes)
 */
export function clearFeatureFlagCacheForFlag(flagName: string): void {
  featureFlagCache.clearFlag(flagName);
}

/**
 * Get cache statistics for debugging
 */
export function getFeatureFlagCacheStats(): { size: number; maxSize: number; ttl: number } {
  return featureFlagCache.getStats();
}