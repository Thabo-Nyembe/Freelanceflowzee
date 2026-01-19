/**
 * Stripe Billing Utility Functions
 *
 * Consolidated billing utilities for FreeFlow's A+++ billing system.
 * Provides subscription management, usage-based billing, revenue splits,
 * and multi-currency support.
 */

import Stripe from 'stripe';

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// ============================================================================
// TYPES
// ============================================================================

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  billingCycleAnchor?: number;
  trialDays?: number;
  metadata?: Record<string, string>;
  currency?: string;
}

export interface CreateSubscriptionResult {
  subscriptionId: string;
  clientSecret: string | null;
  status: Stripe.Subscription.Status;
}

export interface RevenueSplit {
  accountId: string;
  amount: number;
  currency?: string;
}

export interface UsageRecord {
  subscriptionItemId: string;
  quantity: number;
  timestamp?: number;
  action?: 'increment' | 'set';
}

export interface CreateInvoiceParams {
  customerId: string;
  items: Array<{
    description: string;
    amount: number;
    quantity: number;
    currency?: string;
  }>;
  dueDate?: number;
  taxRateId?: string;
  metadata?: Record<string, string>;
}

export interface InstantPayoutParams {
  connectedAccountId: string;
  amount: number;
  currency?: string;
  description?: string;
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Create a new subscription for a customer
 */
export async function createSubscription({
  customerId,
  priceId,
  billingCycleAnchor,
  trialDays,
  metadata,
  currency,
}: CreateSubscriptionParams): Promise<CreateSubscriptionResult> {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
    ...(billingCycleAnchor && { billing_cycle_anchor: billingCycleAnchor }),
    ...(trialDays && { trial_period_days: trialDays }),
    ...(metadata && { metadata }),
    ...(currency && { currency }),
  });

  const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
  const paymentIntent = latestInvoice?.payment_intent as Stripe.PaymentIntent;

  return {
    subscriptionId: subscription.id,
    clientSecret: paymentIntent?.client_secret || null,
    status: subscription.status,
  };
}

/**
 * Update subscription plan (with proration preview)
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string,
  prorate: boolean = true
): Promise<{ subscription: Stripe.Subscription; prorationAmount: number }> {
  // Get current subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const currentItemId = subscription.items.data[0].id;

  // Preview proration
  const prorationDate = Math.floor(Date.now() / 1000);
  const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
    customer: subscription.customer as string,
    subscription: subscriptionId,
    subscription_items: [{ id: currentItemId, price: newPriceId }],
    subscription_proration_date: prorationDate,
  });

  // Update subscription
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [{ id: currentItemId, price: newPriceId }],
    proration_behavior: prorate ? 'create_prorations' : 'none',
  });

  return {
    subscription: updatedSubscription,
    prorationAmount: upcomingInvoice.total,
  };
}

/**
 * Cancel subscription (immediately or at period end)
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelImmediately: boolean = false
): Promise<Stripe.Subscription> {
  if (cancelImmediately) {
    return stripe.subscriptions.cancel(subscriptionId);
  }

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Pause subscription collection
 */
export async function pauseSubscription(
  subscriptionId: string,
  resumeAt?: number
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    pause_collection: {
      behavior: 'void',
      resumes_at: resumeAt,
    },
  });
}

/**
 * Resume paused subscription
 */
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    pause_collection: '',
  });
}

// ============================================================================
// USAGE-BASED BILLING
// ============================================================================

/**
 * Report usage for metered billing
 */
export async function reportUsageRecord({
  subscriptionItemId,
  quantity,
  timestamp,
  action = 'increment',
}: UsageRecord): Promise<Stripe.UsageRecord> {
  return stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
    quantity,
    timestamp: timestamp || Math.floor(Date.now() / 1000),
    action,
  });
}

/**
 * Get usage summary for a subscription item
 */
export async function getUsageSummary(
  subscriptionItemId: string,
  startDate?: number,
  endDate?: number
): Promise<Stripe.UsageRecordSummary[]> {
  const summaries = await stripe.subscriptionItems.listUsageRecordSummaries(
    subscriptionItemId,
    { limit: 100 }
  );

  return summaries.data.filter((summary) => {
    const periodStart = summary.period.start;
    const periodEnd = summary.period.end;

    if (startDate && periodEnd < startDate) return false;
    if (endDate && periodStart > endDate) return false;

    return true;
  });
}

/**
 * Track specific usage metrics
 */
export const trackUsage = {
  apiCalls: async (subscriptionItemId: string, count: number = 1) => {
    return reportUsageRecord({ subscriptionItemId, quantity: count });
  },

  storageGB: async (subscriptionItemId: string, bytesUsed: number) => {
    const gbUsed = bytesUsed / (1024 * 1024 * 1024);
    return reportUsageRecord({ subscriptionItemId, quantity: Math.ceil(gbUsed * 100) / 100 });
  },

  aiCredits: async (subscriptionItemId: string, credits: number) => {
    return reportUsageRecord({ subscriptionItemId, quantity: credits });
  },

  videoMinutes: async (subscriptionItemId: string, minutes: number) => {
    return reportUsageRecord({ subscriptionItemId, quantity: Math.ceil(minutes) });
  },

  collaborationMinutes: async (subscriptionItemId: string, minutes: number) => {
    return reportUsageRecord({ subscriptionItemId, quantity: Math.ceil(minutes) });
  },

  teamMembers: async (subscriptionItemId: string, count: number) => {
    return reportUsageRecord({ subscriptionItemId, quantity: count, action: 'set' });
  },
};

// ============================================================================
// REVENUE SPLITS & MARKETPLACE PAYMENTS
// ============================================================================

/**
 * Create payment with platform fee for marketplace transactions
 */
export async function createMarketplacePayment(
  amount: number,
  currency: string,
  connectedAccountId: string,
  applicationFeePercent: number,
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  const applicationFee = Math.round(amount * (applicationFeePercent / 100));

  return stripe.paymentIntents.create({
    amount,
    currency,
    application_fee_amount: applicationFee,
    transfer_data: {
      destination: connectedAccountId,
    },
    metadata,
  });
}

/**
 * Create transfers for revenue splits (multiple recipients)
 */
export async function createRevenueSplits(
  paymentIntentId: string,
  splits: RevenueSplit[]
): Promise<Stripe.Transfer[]> {
  const transfers = await Promise.all(
    splits.map((split) =>
      stripe.transfers.create({
        amount: split.amount,
        currency: split.currency || 'usd',
        destination: split.accountId,
        transfer_group: paymentIntentId,
      })
    )
  );

  return transfers;
}

/**
 * Create an instant payout for a connected account (Stripe Connect)
 */
export async function createInstantPayout({
  connectedAccountId,
  amount,
  currency = 'usd',
  description,
}: InstantPayoutParams): Promise<Stripe.Payout> {
  return stripe.payouts.create(
    {
      amount,
      currency,
      method: 'instant',
      description,
    },
    { stripeAccount: connectedAccountId }
  );
}

/**
 * Get connected account balance
 */
export async function getConnectedAccountBalance(
  connectedAccountId: string
): Promise<Stripe.Balance> {
  return stripe.balance.retrieve({ stripeAccount: connectedAccountId });
}

// ============================================================================
// INVOICE MANAGEMENT
// ============================================================================

/**
 * Create a custom invoice with line items
 */
export async function createCustomInvoice({
  customerId,
  items,
  dueDate,
  taxRateId,
  metadata,
}: CreateInvoiceParams): Promise<Stripe.Invoice> {
  // Create invoice
  const invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: 'send_invoice',
    due_date: dueDate || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    auto_advance: false,
    metadata,
  });

  // Add line items
  await Promise.all(
    items.map((item) =>
      stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        description: item.description,
        unit_amount: item.amount,
        quantity: item.quantity,
        currency: item.currency || 'usd',
        tax_rates: taxRateId ? [taxRateId] : undefined,
      })
    )
  );

  // Finalize and send
  await stripe.invoices.finalizeInvoice(invoice.id);
  const sentInvoice = await stripe.invoices.sendInvoice(invoice.id);

  return sentInvoice;
}

/**
 * Void an invoice
 */
export async function voidInvoice(invoiceId: string): Promise<Stripe.Invoice> {
  return stripe.invoices.voidInvoice(invoiceId);
}

/**
 * Mark invoice as uncollectible
 */
export async function markInvoiceUncollectible(
  invoiceId: string
): Promise<Stripe.Invoice> {
  return stripe.invoices.markUncollectible(invoiceId);
}

/**
 * Retry invoice payment
 */
export async function retryInvoicePayment(
  invoiceId: string
): Promise<Stripe.Invoice> {
  return stripe.invoices.pay(invoiceId);
}

// ============================================================================
// MULTI-CURRENCY SUPPORT
// ============================================================================

/**
 * Supported currencies (50+ as per competitive requirements)
 */
export const SUPPORTED_CURRENCIES = [
  'usd', 'eur', 'gbp', 'jpy', 'cad', 'aud', 'chf', 'cny', 'hkd', 'nzd',
  'sgd', 'sek', 'dkk', 'nok', 'mxn', 'brl', 'inr', 'krw', 'zar', 'thb',
  'myr', 'php', 'idr', 'try', 'pln', 'czk', 'huf', 'ils', 'aed', 'sar',
  'qar', 'bhd', 'kwd', 'omr', 'egp', 'ngn', 'kes', 'ghs', 'tzs', 'ugx',
  'rwf', 'clp', 'cop', 'pen', 'ars', 'vnd', 'pkr', 'bdt', 'lkr', 'npr',
  'mmk', 'gel', 'azn', 'kzt', 'uah', 'ron', 'bgn', 'hrk', 'rsd', 'mad',
] as const;

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

/**
 * Get currency formatting configuration
 */
export function getCurrencyConfig(currency: SupportedCurrency): {
  symbol: string;
  decimalPlaces: number;
  position: 'before' | 'after';
} {
  const configs: Record<string, { symbol: string; decimalPlaces: number; position: 'before' | 'after' }> = {
    usd: { symbol: '$', decimalPlaces: 2, position: 'before' },
    eur: { symbol: '€', decimalPlaces: 2, position: 'before' },
    gbp: { symbol: '£', decimalPlaces: 2, position: 'before' },
    jpy: { symbol: '¥', decimalPlaces: 0, position: 'before' },
    cny: { symbol: '¥', decimalPlaces: 2, position: 'before' },
    inr: { symbol: '₹', decimalPlaces: 2, position: 'before' },
    krw: { symbol: '₩', decimalPlaces: 0, position: 'before' },
    brl: { symbol: 'R$', decimalPlaces: 2, position: 'before' },
    zar: { symbol: 'R', decimalPlaces: 2, position: 'before' },
    // Default for others
  };

  return configs[currency] || { symbol: currency.toUpperCase(), decimalPlaces: 2, position: 'before' };
}

/**
 * Format amount in currency
 */
export function formatCurrency(amount: number, currency: SupportedCurrency): string {
  const config = getCurrencyConfig(currency);
  const formatted = (amount / 100).toFixed(config.decimalPlaces);

  if (config.position === 'before') {
    return `${config.symbol}${formatted}`;
  }
  return `${formatted} ${config.symbol}`;
}

// ============================================================================
// REFUNDS
// ============================================================================

/**
 * Create a refund
 */
export async function createRefund(
  chargeId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<Stripe.Refund> {
  return stripe.refunds.create({
    charge: chargeId,
    amount,
    reason,
  });
}

/**
 * Get refund details
 */
export async function getRefund(refundId: string): Promise<Stripe.Refund> {
  return stripe.refunds.retrieve(refundId);
}

// ============================================================================
// COUPONS & DISCOUNTS
// ============================================================================

/**
 * Create a coupon
 */
export async function createCoupon(params: {
  name: string;
  percentOff?: number;
  amountOff?: number;
  currency?: string;
  duration: 'once' | 'repeating' | 'forever';
  durationInMonths?: number;
  maxRedemptions?: number;
  redeemBy?: number;
}): Promise<Stripe.Coupon> {
  return stripe.coupons.create({
    name: params.name,
    percent_off: params.percentOff,
    amount_off: params.amountOff,
    currency: params.currency,
    duration: params.duration,
    duration_in_months: params.durationInMonths,
    max_redemptions: params.maxRedemptions,
    redeem_by: params.redeemBy,
  });
}

/**
 * Apply coupon to customer
 */
export async function applyCouponToCustomer(
  customerId: string,
  couponId: string
): Promise<Stripe.Customer> {
  return stripe.customers.update(customerId, { coupon: couponId });
}

// ============================================================================
// TAX RATES
// ============================================================================

/**
 * Create a tax rate
 */
export async function createTaxRate(params: {
  displayName: string;
  percentage: number;
  inclusive: boolean;
  jurisdiction?: string;
  country?: string;
  state?: string;
}): Promise<Stripe.TaxRate> {
  return stripe.taxRates.create({
    display_name: params.displayName,
    percentage: params.percentage,
    inclusive: params.inclusive,
    jurisdiction: params.jurisdiction,
    country: params.country,
    state: params.state,
  });
}

// ============================================================================
// WEBHOOKS
// ============================================================================

/**
 * Construct and verify Stripe webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// Export Stripe instance for advanced usage
export { stripe };
