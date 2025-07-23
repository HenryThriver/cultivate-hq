'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type User = Database['public']['Tables']['users']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];

interface UserWithSubscription extends User {
  subscription?: Subscription | null;
}

interface UseUserResult {
  user: UserWithSubscription | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUser = (): UseUserResult => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<UserWithSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!authUser?.id) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user data with optional subscription using left join (single query)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          subscription:subscriptions(*)
        `)
        .eq('id', authUser.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        setError('Failed to fetch user data');
        setUser(null);
        return;
      }

      // Transform the data to match our interface (subscription is array from left join)
      const userWithSubscription: UserWithSubscription = {
        ...userData,
        subscription: Array.isArray(userData.subscription) 
          ? userData.subscription[0] || null 
          : userData.subscription
      };

      setUser(userWithSubscription);
    } catch (err) {
      console.error('Error in fetchUser:', err);
      setError('An unexpected error occurred');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (!authLoading) {
      fetchUser();
    }
  }, [authUser?.id, authLoading, fetchUser]);

  // Set up optimized real-time subscription for user data changes
  useEffect(() => {
    if (!authUser?.id) return;

    // Single channel with multiple table listeners for better performance
    const userDataChannel = supabase
      .channel(`user-data-${authUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${authUser.id}`,
        },
        (payload) => {
          console.log('User data changed:', payload);
          fetchUser();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${authUser.id}`,
        },
        (payload) => {
          console.log('Subscription data changed:', payload);
          fetchUser();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userDataChannel);
    };
  }, [authUser?.id, fetchUser]);

  return {
    user,
    loading: loading || authLoading,
    error,
    refetch: fetchUser,
  };
};

// Helper hook for just subscription data
export const useSubscription = () => {
  const { user, loading, error } = useUser();
  
  return {
    subscription: user?.subscription || null,
    hasActiveSubscription: user?.subscription?.status === 'active',
    loading,
    error,
  };
};