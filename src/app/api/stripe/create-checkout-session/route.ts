import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '@/lib/stripe-server';
import { PRICE_CONFIG, PRODUCT_CONFIG } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const { priceType } = await request.json();

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
    
    // Get authenticated user from session instead of trusting request body
    const { data: { user } } = await supabase.auth.getUser();
    const authenticatedUserId = user?.id;
    
    let userData = null;
    
    // Get user data if user is authenticated
    if (authenticatedUserId) {
      const { data, error: userError } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', authenticatedUserId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        // Continue without user data for unauthenticated checkout
      } else {
        userData = { email: data.email, full_name: data.name };
      }
    }

    const priceConfig = PRICE_CONFIG[priceType as keyof typeof PRICE_CONFIG];
    const productConfig = PRODUCT_CONFIG[priceType as keyof typeof PRODUCT_CONFIG];
    const stripe = getServerStripe();
    
    // Handle supporter tier differently (one-time payment for 5 years)
    const isSupporter = priceType === 'supporter';
    
    // Create Stripe checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Cultivate HQ ${productConfig.name}`,
              description: productConfig.description,
              metadata: {
                features: productConfig.features.slice(0, 5).join(', ') + '...',
              },
            },
            unit_amount: priceConfig.amount,
            ...(isSupporter ? {
              // One-time payment for supporter tier
            } : {
              recurring: {
                interval: (priceConfig as typeof PRICE_CONFIG.monthly | typeof PRICE_CONFIG.annual).interval,
              },
            }),
          },
          quantity: 1,
        },
      ],
      mode: isSupporter ? 'payment' : 'subscription',
      success_url: `${process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      metadata: {
        priceType: priceType,
        planName: `Cultivate HQ ${productConfig.name}`,
      },
      ...(isSupporter ? {} : {
        subscription_data: {
          metadata: {
            priceType: priceType,
          },
        },
      }),
      allow_promotion_codes: true,
    };

    // Add customer info if user is authenticated
    if (userData?.email && authenticatedUserId) {
      sessionConfig.customer_email = userData.email;
      if (sessionConfig.metadata) {
        sessionConfig.metadata.userId = authenticatedUserId;
      }
      if (!isSupporter && sessionConfig.subscription_data?.metadata) {
        sessionConfig.subscription_data.metadata.userId = authenticatedUserId;
      }
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