import { NextResponse } from 'next/server';
import { getServerStripe } from '@/lib/stripe-server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const stripe = getServerStripe();
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the user's subscription to find their Stripe customer ID
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to fetch subscription information' },
        { status: 500 }
      );
    }

    if (!subscription || !subscription.stripe_customer_id) {
      console.log('Debug - User ID:', user.id);
      console.log('Debug - Subscription data:', subscription);
      return NextResponse.json(
        { 
          error: 'No active subscription found',
          debug: {
            userId: user.id,
            hasSubscription: !!subscription,
            hasCustomerId: !!(subscription?.stripe_customer_id)
          }
        },
        { status: 404 }
      );
    }

    // Create the customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    });

    return NextResponse.json({ 
      url: portalSession.url 
    });

  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}