import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get all subscription data for debugging
    const { data: allSubscriptions, error: allSubError } = await supabase
      .from('subscriptions')
      .select('*');

    // Get the user's subscription
    const { data: userSubscription, error: userSubError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    return NextResponse.json({
      debug: {
        currentUserId: user.id,
        userEmail: user.email,
        allSubscriptionsCount: allSubscriptions?.length || 0,
        allSubscriptions: allSubscriptions || [],
        userSubscription: userSubscription,
        userSubError: userSubError,
        allSubError: allSubError,
        hasUserSubscription: !!userSubscription,
        hasStripeCustomerId: !!(userSubscription?.stripe_customer_id)
      }
    });

  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug information' },
      { status: 500 }
    );
  }
}