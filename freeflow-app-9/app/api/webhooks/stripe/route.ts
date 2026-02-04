/**
 * Stripe Webhooks Handler
 *
 * Handles all Stripe webhook events for:
 * - Payment confirmations
 * - Subscription lifecycle events
 * - Invoice events
 * - Dispute handling
 * - Connect account events
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { createFeatureLogger } from '@/lib/logger';

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('stripe-webhook');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logger.error('Webhook signature verification failed', { error: err });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Log webhook event
    logger.info('Received Stripe webhook event', { eventType: event.type });

    // Handle different event types
    switch (event.type) {
      // ====================================================================
      // PAYMENT EVENTS
      // ====================================================================
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      // ====================================================================
      // SUBSCRIPTION EVENTS
      // ====================================================================
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.paused':
        await handleSubscriptionPaused(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.resumed':
        await handleSubscriptionResumed(event.data.object as Stripe.Subscription);
        break;

      // ====================================================================
      // INVOICE EVENTS
      // ====================================================================
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.finalized':
        await handleInvoiceFinalized(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.marked_uncollectible':
        await handleInvoiceUncollectible(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.voided':
        await handleInvoiceVoided(event.data.object as Stripe.Invoice);
        break;

      // ====================================================================
      // DISPUTE EVENTS
      // ====================================================================
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      case 'charge.dispute.updated':
        await handleDisputeUpdated(event.data.object as Stripe.Dispute);
        break;

      case 'charge.dispute.closed':
        await handleDisputeClosed(event.data.object as Stripe.Dispute);
        break;

      // ====================================================================
      // CONNECT EVENTS (Marketplace)
      // ====================================================================
      case 'account.updated':
        await handleConnectAccountUpdated(event.data.object as Stripe.Account);
        break;

      case 'payout.paid':
        await handlePayoutPaid(event.data.object as Stripe.Payout, event.account);
        break;

      case 'payout.failed':
        await handlePayoutFailed(event.data.object as Stripe.Payout, event.account);
        break;

      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;

      // ====================================================================
      // CUSTOMER EVENTS
      // ====================================================================
      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer);
        break;

      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer);
        break;

      default:
        logger.info('Unhandled Stripe webhook event type', { eventType: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Webhook handler error', { error });
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PAYMENT HANDLERS
// ============================================================================

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata?.freeflow_user_id;

  // Record successful payment
  await supabase.from('billing').insert({
    user_id: userId,
    transaction_type: 'payment',
    status: 'succeeded',
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    payment_provider: 'stripe',
    transaction_id: paymentIntent.id,
    description: paymentIntent.description || 'Payment received',
    metadata: {
      stripe_payment_intent_id: paymentIntent.id,
      payment_method: paymentIntent.payment_method,
    },
  });

  // Create notification
  if (userId) {
    await createNotification(userId, {
      type: 'payment_received',
      title: 'Payment Received',
      message: `Your payment of ${formatCurrency(paymentIntent.amount, paymentIntent.currency)} was successful.`,
      data: { paymentIntentId: paymentIntent.id },
    });
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata?.freeflow_user_id;

  await supabase.from('billing').insert({
    user_id: userId,
    transaction_type: 'payment',
    status: 'failed',
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    payment_provider: 'stripe',
    transaction_id: paymentIntent.id,
    error_message: paymentIntent.last_payment_error?.message,
    metadata: {
      stripe_payment_intent_id: paymentIntent.id,
      error_code: paymentIntent.last_payment_error?.code,
    },
  });

  if (userId) {
    await createNotification(userId, {
      type: 'payment_failed',
      title: 'Payment Failed',
      message: `Your payment of ${formatCurrency(paymentIntent.amount, paymentIntent.currency)} failed. Please update your payment method.`,
      data: { paymentIntentId: paymentIntent.id },
    });
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const userId = charge.metadata?.freeflow_user_id;

  await supabase.from('billing').insert({
    user_id: userId,
    transaction_type: 'refund',
    status: 'succeeded',
    amount: (charge.amount_refunded || 0) / 100,
    currency: charge.currency,
    payment_provider: 'stripe',
    transaction_id: charge.id,
    refund_reason: charge.refunds?.data[0]?.reason || 'Customer request',
  });
}

// ============================================================================
// SUBSCRIPTION HANDLERS
// ============================================================================

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.freeflow_user_id;
  const planId = subscription.items.data[0]?.price.product;

  await supabase.from('subscriptions').insert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    plan_id: planId as string,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  });

  if (userId) {
    await createNotification(userId, {
      type: 'subscription_created',
      title: 'Subscription Started',
      message: 'Your subscription has been activated successfully.',
      data: { subscriptionId: subscription.id },
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.freeflow_user_id;

  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (userId) {
    await createNotification(userId, {
      type: 'subscription_canceled',
      title: 'Subscription Canceled',
      message: 'Your subscription has been canceled.',
      data: { subscriptionId: subscription.id },
    });
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.freeflow_user_id;

  if (userId) {
    await createNotification(userId, {
      type: 'trial_ending',
      title: 'Trial Ending Soon',
      message: 'Your trial period will end in 3 days. Please add a payment method to continue.',
      data: { subscriptionId: subscription.id },
    });
  }
}

async function handleSubscriptionPaused(subscription: Stripe.Subscription) {
  await supabase
    .from('subscriptions')
    .update({
      status: 'paused',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionResumed(subscription: Stripe.Subscription) {
  await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

// ============================================================================
// INVOICE HANDLERS
// ============================================================================

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const userId = invoice.metadata?.freeflow_user_id;

  await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('stripe_invoice_id', invoice.id);

  if (userId) {
    await createNotification(userId, {
      type: 'invoice_paid',
      title: 'Invoice Paid',
      message: `Invoice #${invoice.number} has been paid.`,
      data: { invoiceId: invoice.id },
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const userId = invoice.metadata?.freeflow_user_id;

  await supabase
    .from('invoices')
    .update({
      status: 'past_due',
    })
    .eq('stripe_invoice_id', invoice.id);

  if (userId) {
    await createNotification(userId, {
      type: 'invoice_payment_failed',
      title: 'Invoice Payment Failed',
      message: `Payment for invoice #${invoice.number} failed. Please update your payment method.`,
      data: { invoiceId: invoice.id },
    });
  }
}

async function handleInvoiceFinalized(invoice: Stripe.Invoice) {
  await supabase
    .from('invoices')
    .update({
      status: 'sent',
      hosted_invoice_url: invoice.hosted_invoice_url,
      pdf_url: invoice.invoice_pdf,
    })
    .eq('stripe_invoice_id', invoice.id);
}

async function handleInvoiceUncollectible(invoice: Stripe.Invoice) {
  await supabase
    .from('invoices')
    .update({
      status: 'uncollectible',
    })
    .eq('stripe_invoice_id', invoice.id);
}

async function handleInvoiceVoided(invoice: Stripe.Invoice) {
  await supabase
    .from('invoices')
    .update({
      status: 'void',
    })
    .eq('stripe_invoice_id', invoice.id);
}

// ============================================================================
// DISPUTE HANDLERS
// ============================================================================

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  // Log dispute
  await supabase.from('disputes').insert({
    stripe_dispute_id: dispute.id,
    stripe_charge_id: dispute.charge as string,
    amount: dispute.amount / 100,
    currency: dispute.currency,
    reason: dispute.reason,
    status: dispute.status,
    evidence_due_by: new Date(dispute.evidence_details?.due_by || Date.now()).toISOString(),
  });

  // Notify admin
  logger.warn('New dispute created', { disputeId: dispute.id });
}

async function handleDisputeUpdated(dispute: Stripe.Dispute) {
  await supabase
    .from('disputes')
    .update({
      status: dispute.status,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_dispute_id', dispute.id);
}

async function handleDisputeClosed(dispute: Stripe.Dispute) {
  await supabase
    .from('disputes')
    .update({
      status: dispute.status,
      closed_at: new Date().toISOString(),
    })
    .eq('stripe_dispute_id', dispute.id);
}

// ============================================================================
// CONNECT HANDLERS (Marketplace)
// ============================================================================

async function handleConnectAccountUpdated(account: Stripe.Account) {
  await supabase
    .from('connected_accounts')
    .upsert({
      stripe_account_id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      updated_at: new Date().toISOString(),
    });
}

async function handlePayoutPaid(payout: Stripe.Payout, connectedAccountId?: string) {
  await supabase.from('payouts').insert({
    stripe_payout_id: payout.id,
    connected_account_id: connectedAccountId,
    amount: payout.amount / 100,
    currency: payout.currency,
    status: 'paid',
    arrival_date: new Date(payout.arrival_date * 1000).toISOString(),
    method: payout.method,
  });
}

async function handlePayoutFailed(payout: Stripe.Payout, connectedAccountId?: string) {
  await supabase.from('payouts').insert({
    stripe_payout_id: payout.id,
    connected_account_id: connectedAccountId,
    amount: payout.amount / 100,
    currency: payout.currency,
    status: 'failed',
    failure_code: payout.failure_code,
    failure_message: payout.failure_message,
  });
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  await supabase.from('transfers').insert({
    stripe_transfer_id: transfer.id,
    destination_account_id: transfer.destination as string,
    amount: transfer.amount / 100,
    currency: transfer.currency,
    transfer_group: transfer.transfer_group,
  });
}

// ============================================================================
// CUSTOMER HANDLERS
// ============================================================================

async function handleCustomerCreated(customer: Stripe.Customer) {
  const userId = customer.metadata?.freeflow_user_id;

  if (userId) {
    await supabase
      .from('user_profiles')
      .update({
        stripe_customer_id: customer.id,
      })
      .eq('user_id', userId);
  }
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  await supabase
    .from('user_profiles')
    .update({
      billing_email: customer.email,
      billing_name: customer.name,
    })
    .eq('stripe_customer_id', customer.id);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function createNotification(
  userId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }
) {
  await supabase.from('notifications').insert({
    user_id: userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    read: false,
  });
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}
