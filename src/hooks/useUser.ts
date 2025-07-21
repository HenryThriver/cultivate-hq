'use client';

import { useEffect, useState } from 'react';
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

  const fetchUser = async () => {
    if (!authUser?.id) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user data with subscription
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

      // Transform the data to match our interface
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
  };

  useEffect(() => {
    if (!authLoading) {
      fetchUser();
    }
  }, [authUser?.id, authLoading]);

  // Set up real-time subscription for user data changes
  useEffect(() => {
    if (!authUser?.id) return;

    const userChannel = supabase
      .channel(`user-${authUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${authUser.id}`,
        },
        () => {
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
        () => {
          fetchUser();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
    };
  }, [authUser?.id]);

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