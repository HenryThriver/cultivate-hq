import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe client-side
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Note: Server-side Stripe has been moved to stripe-server.ts
// to avoid client-side bundle issues

// Price configurations
export const PRICE_CONFIG = {
  monthly: {
    amount: 30 * 100, // $30 in cents
    interval: 'month' as const,
    priceId: 'price_monthly_cultivate_hq', // This will be set in Stripe dashboard
  },
  yearly: {
    amount: 300 * 100, // $300 in cents
    interval: 'year' as const,
    priceId: 'price_yearly_cultivate_hq', // This will be set in Stripe dashboard
  },
};

export const PRODUCT_CONFIG = {
  name: 'Cultivate HQ Professional',
  description: 'Complete relationship intelligence system for strategic minds',
  features: [
    'AI-powered contact intelligence',
    'Smart follow-up automation',
    'Relationship maintenance system',
    'Generosity-first networking tools',
    'Conversation intelligence',
    'Strategic networking roadmap',
    'Relationship analytics & insights',
    'Smart introduction engine',
    'Context preservation system',
    'Voice memo processing',
    'LinkedIn integration',
    'Gmail integration',
    'Google Calendar sync',
    'Unlimited contacts',
    'Priority support'
  ]
};