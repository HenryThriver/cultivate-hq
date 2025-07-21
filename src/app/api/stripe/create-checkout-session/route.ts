import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '@/lib/stripe-server';
import { PRICE_CONFIG, PRODUCT_CONFIG } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { priceType, userId } = await request.json();

    if (!priceType) {
      return NextResponse.json(
        { error: 'Missing priceType parameter' },
        { status: 400 }
      );
    }

    if (!PRICE_CONFIG[priceType as keyof typeof PRICE_CONFIG]) {
      return NextResponse.json(
        { error: 'Invalid price type' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    let userData = null;
    
    // Get user data if userId is provided (authenticated user)
    if (userId) {
      const { data, error: userError } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        // Continue without user data for unauthenticated checkout
      } else {
        userData = { email: data.email, full_name: data.name };
      }
    }

    const priceConfig = PRICE_CONFIG[priceType as keyof typeof PRICE_CONFIG];
    const stripe = getServerStripe();
    
    // Create Stripe checkout session
    const sessionConfig: Record<string, unknown> = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: PRODUCT_CONFIG.name,
              description: PRODUCT_CONFIG.description,
              metadata: {
                features: PRODUCT_CONFIG.features.slice(0, 5).join(', ') + '...',
              },
            },
            unit_amount: priceConfig.amount,
            recurring: {
              interval: priceConfig.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      metadata: {
        priceType: priceType,
        planName: `${PRODUCT_CONFIG.name} - ${priceType}`,
      },
      subscription_data: {
        metadata: {
          priceType: priceType,
        },
      },
      allow_promotion_codes: true,
    };

    // Add customer info if user is authenticated
    if (userData?.email) {
      sessionConfig.customer_email = userData.email;
      sessionConfig.metadata.userId = userId;
      sessionConfig.subscription_data.metadata.userId = userId;
    }
    // Note: For unauthenticated users, Stripe will automatically collect email
    // during subscription checkout - no need for customer_creation in subscription mode

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}