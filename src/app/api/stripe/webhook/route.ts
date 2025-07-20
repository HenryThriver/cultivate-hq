import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

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
        
        // Update user's subscription status in contacts table (self-contact)
        const { error: updateError } = await supabase
          .from('contacts')
          .update({
            subscription_status: 'active',
            subscription_plan: session.metadata?.priceType || 'monthly',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', session.metadata?.userId || '')
          .eq('is_self_contact', true);

        if (updateError) {
          console.error('Error updating user subscription:', updateError);
        }

        // Create subscription record
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: session.metadata?.userId || '',
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
            status: 'active',
            plan_type: session.metadata?.priceType || 'monthly',
          });

        if (subscriptionError) {
          console.error('Error creating subscription record:', subscriptionError);
        }

        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status
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

        // Update user profile (self-contact)
        const { error: profileUpdateError } = await supabase
          .from('contacts')
          .update({
            subscription_status: subscription.status,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
          .eq('is_self_contact', true);

        if (profileUpdateError) {
          console.error('Error updating profile subscription:', profileUpdateError);
        }

        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        
        // Mark subscription as canceled
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

        // Update user profile (self-contact)
        const { error: profileCancelError } = await supabase
          .from('contacts')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', deletedSubscription.id)
          .eq('is_self_contact', true);

        if (profileCancelError) {
          console.error('Error updating profile on cancel:', profileCancelError);
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
          
          // Handle failed payment
          const { error: failedPaymentError } = await supabase
            .from('contacts')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId)
            .eq('is_self_contact', true);

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