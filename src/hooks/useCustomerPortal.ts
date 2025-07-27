import { useState } from 'react';

interface UseCustomerPortalReturn {
  redirectToPortal: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useCustomerPortal = (): UseCustomerPortalReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectToPortal = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create portal session');
      }

      const { url } = await response.json();
      
      // Redirect to the Stripe Customer Portal
      window.location.href = url;
      
    } catch (err) {
      console.error('Portal redirect error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return {
    redirectToPortal,
    loading,
    error,
  };
};