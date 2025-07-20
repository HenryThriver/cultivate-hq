import { useState } from 'react';
import { getStripe } from '@/lib/stripe';
import { useAuth } from '@/lib/contexts/AuthContext';

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createCheckoutSession = async (priceType: 'monthly' | 'yearly') => {
    if (!user) {
      setError('You must be logged in to subscribe');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceType,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (!data.sessionId) {
        throw new Error('No session ID returned from server');
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const result = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (result?.error) {
        throw new Error(result.error.message);
      }
    } catch (err) {
      console.error('Stripe checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    loading,
    error,
  };
};