import Stripe from 'stripe';

// Server-side Stripe initialization
export const getServerStripe = () => {
  if (typeof window !== 'undefined') {
    throw new Error('getServerStripe() can only be called server-side');
  }
  
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil',
  });
};