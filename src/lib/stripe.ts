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
  annual: {
    amount: 300 * 100, // $300 in cents
    interval: 'year' as const,
    priceId: 'price_annual_cultivate_hq', // This will be set in Stripe dashboard
  },
  supporter: {
    amount: 3000 * 100, // $3000 in cents (one-time payment for 5 years)
    // No interval or intervalCount - this is a one-time payment
    priceId: 'price_supporter_cultivate_hq', // This will be set in Stripe dashboard
  },
};

export const PRODUCT_CONFIG = {
  monthly: {
    name: 'Monthly',
    description: 'Essential relationship intelligence tools',
    features: [
      'AI-powered contact intelligence',
      'Smart follow-up automation',
      'Relationship maintenance system',
      'Generosity-first networking tools',
      'Voice memo processing',
      'Basic integrations',
      'Standard support'
    ]
  },
  annual: {
    name: 'Annual',
    description: 'Complete professional relationship system',
    features: [
      'Everything in Monthly',
      'Priority AI processing',
      'Premium support',
      'Increased processing limits',
      'Early access to new features & beta programs',
      'Smart introduction engine',
      'Dedicated success check-ins quarterly'
    ]
  },
  supporter: {
    name: 'Supporter',
    description: 'Direct creator access + gratitude for supporting the vision',
    features: [
      'Everything in Annual',
      'Direct access to creator',
      'Top priority feature requests',
      'Exclusive supporter community',
      'Monthly strategy calls',
      'Custom relationship workflows',
      'Personal onboarding session',
      'VIP concierge support',
      'Input on product roadmap',
      'Recognition as founding supporter',
      'Lifetime price guarantee'
    ]
  }
};