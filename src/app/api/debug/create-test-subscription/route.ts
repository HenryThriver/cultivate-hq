import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
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

    // Create a test subscription record
    const { data: subscription, error: insertError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: user.id,
          stripe_subscription_id: 'sub_test_' + Date.now(),
          stripe_customer_id: 'cus_test_' + Date.now(),
          status: 'active',
          plan_type: 'monthly'
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating test subscription:', insertError);
      return NextResponse.json(
        { error: 'Failed to create test subscription', details: insertError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Test subscription created successfully',
      subscription: subscription
    });

  } catch (error) {
    console.error('Error in test subscription creation:', error);
    return NextResponse.json(
      { error: 'Failed to create test subscription' },
      { status: 500 }
    );
  }
}