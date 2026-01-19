/**
 * FreeFlow Billing Module
 *
 * Comprehensive billing infrastructure for A+++ platform.
 * Exports all billing utilities, types, and constants.
 */

export * from './stripe-billing';

// Re-export commonly used types
export type {
  CreateSubscriptionParams,
  CreateSubscriptionResult,
  RevenueSplit,
  UsageRecord,
  CreateInvoiceParams,
  InstantPayoutParams,
  SupportedCurrency,
} from './stripe-billing';

// Re-export utilities
export {
  // Subscriptions
  createSubscription,
  updateSubscriptionPlan,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,

  // Usage-based billing
  reportUsageRecord,
  getUsageSummary,
  trackUsage,

  // Revenue splits
  createMarketplacePayment,
  createRevenueSplits,
  createInstantPayout,
  getConnectedAccountBalance,

  // Invoices
  createCustomInvoice,
  voidInvoice,
  markInvoiceUncollectible,
  retryInvoicePayment,

  // Multi-currency
  SUPPORTED_CURRENCIES,
  getCurrencyConfig,
  formatCurrency,

  // Refunds
  createRefund,
  getRefund,

  // Coupons & Discounts
  createCoupon,
  applyCouponToCustomer,

  // Tax rates
  createTaxRate,

  // Webhooks
  constructWebhookEvent,

  // Stripe instance
  stripe,
} from './stripe-billing';
