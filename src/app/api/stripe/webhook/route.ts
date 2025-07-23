import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '@/lib/stripe-server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { randomUUID } from 'crypto';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  const stripe = getServerStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.subscription || !session.customer || !session.customer_email) {
          console.error('Missing required session data:', {
            subscription: !!session.subscription,
            customer: !!session.customer,
            customer_email: !!session.customer_email,
            session_id: session.id
          });
          return NextResponse.json({ error: 'Invalid session data' }, { status: 400 });
        }

        let userId = session.metadata?.userId;
        
        // If no userId in metadata (unauthenticated checkout), create user from customer email
        if (!userId) {
          // Check if user already exists with this email
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', session.customer_email)
            .single();
            
          if (existingUser) {
            userId = existingUser.id;
          } else {
            // INTENTIONAL DESIGN: Payment-Before-Auth Workflow
            // 1. Stripe checkout creates user record (this step)
            // 2. Payment completes, user redirected to success page
            // 3. User clicks "Login to begin" for Google OAuth
            // 4. Auth callback links this user record to authenticated user
            // This ensures subscription is preserved even if auth fails
            
            // Generate UUID for new user (will be linked to auth user later)
            const newUserId = randomUUID();
            
            // Create new user record with customer email
            const { data: newUser, error: userError } = await supabase
              .from('users')
              .insert({
                id: newUserId,
                email: session.customer_email,
                name: session.customer_details?.name || session.customer_email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select('id')
              .single();

            if (userError || !newUser) {
              console.error('Error creating user from Stripe checkout:', userError);
              return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
            }
            
            userId = newUser.id;
          }
        }
        
        // Create subscription record (main source of truth)
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
            status: 'active',
            plan_type: session.metadata?.priceType || 'monthly',
          });

        if (subscriptionError) {
          console.error('Error creating subscription record:', subscriptionError);
          return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
        }

        // Note: User subscription status is now tracked via the subscriptions table
        // No need to update users table directly as the subscription relationship handles this

        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status (main source of truth)
        const { error: subscriptionUpdateError } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (subscriptionUpdateError) {
          console.error('Error updating subscription:', subscriptionUpdateError);
        }

        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        
        // Mark subscription as canceled (main source of truth)
        const { error: cancelError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', deletedSubscription.id);

        if (cancelError) {
          console.error('Error canceling subscription:', cancelError);
        }

        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription };
        
        // Only process if invoice has a subscription
        if (invoice.subscription) {
          const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
          
          // Update payment status
          const { error: paymentError } = await supabase
            .from('subscriptions')
            .update({
              last_payment_date: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);

          if (paymentError) {
            console.error('Error updating payment status:', paymentError);
          }
        }

        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription };
        
        // Only process if invoice has a subscription
        if (failedInvoice.subscription) {
          const subscriptionId = typeof failedInvoice.subscription === 'string' ? failedInvoice.subscription : failedInvoice.subscription.id;
          
          // Handle failed payment (update subscription status)
          const { error: failedPaymentError } = await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);

          if (failedPaymentError) {
            console.error('Error updating failed payment status:', failedPaymentError);
          }
        }

        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}