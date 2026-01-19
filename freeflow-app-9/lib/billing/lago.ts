/**
 * Lago Billing Service
 *
 * Enterprise-grade usage-based billing with:
 * - Customer management
 * - Subscription management
 * - Usage metering and events
 * - Invoice generation
 * - Payment integration
 * - Multi-currency support
 * - Webhook handling
 */

import { createClient } from '@/lib/supabase/server'

// Configuration
const LAGO_API_URL = process.env.LAGO_API_URL || 'https://api.getlago.com/api/v1'
const LAGO_API_KEY = process.env.LAGO_API_KEY || ''

// Types
export type BillingInterval = 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type ChargeModel = 'standard' | 'graduated' | 'package' | 'percentage' | 'volume'
export type SubscriptionStatus = 'active' | 'pending' | 'canceled' | 'terminated'
export type InvoiceStatus = 'draft' | 'finalized' | 'voided' | 'payment_dispute_lost'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'ZAR'

export interface LagoCustomer {
  external_id: string
  name: string
  email: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zipcode?: string
  country?: string
  currency?: Currency
  timezone?: string
  legal_name?: string
  legal_number?: string
  tax_identification_number?: string
  phone?: string
  metadata?: Array<{ key: string; value: string; display_in_invoice?: boolean }>
  billing_configuration?: {
    invoice_grace_period?: number
    payment_provider?: 'stripe' | 'gocardless' | 'adyen'
    provider_customer_id?: string
    sync?: boolean
    sync_with_provider?: boolean
    document_locale?: string
  }
}

export interface LagoPlan {
  code: string
  name: string
  description?: string
  interval: BillingInterval
  pay_in_advance?: boolean
  amount_cents: number
  amount_currency: Currency
  trial_period?: number
  charges?: LagoCharge[]
  minimum_commitment?: {
    amount_cents: number
    invoice_display_name?: string
  }
  tax_codes?: string[]
}

export interface LagoCharge {
  billable_metric_code: string
  charge_model: ChargeModel
  pay_in_advance?: boolean
  invoiceable?: boolean
  min_amount_cents?: number
  properties?: {
    // Standard/Package/Volume
    amount?: string
    free_units?: number
    package_size?: number
    // Graduated
    graduated_ranges?: Array<{
      from_value: number
      to_value: number | null
      per_unit_amount: string
      flat_amount: string
    }>
    // Percentage
    rate?: string
    fixed_amount?: string
    free_units_per_events?: number
    free_units_per_total_aggregation?: string
    per_transaction_min_amount?: string
    per_transaction_max_amount?: string
    // Volume
    volume_ranges?: Array<{
      from_value: number
      to_value: number | null
      per_unit_amount: string
      flat_amount: string
    }>
  }
  group_properties?: Array<{
    group_id: string
    values: Record<string, unknown>
  }>
  tax_codes?: string[]
}

export interface LagoBillableMetric {
  code: string
  name: string
  description?: string
  aggregation_type: 'count_agg' | 'sum_agg' | 'max_agg' | 'unique_count_agg' | 'recurring_count_agg' | 'weighted_sum_agg' | 'custom_agg'
  field_name?: string
  recurring?: boolean
  group?: {
    key: string
    values?: string[]
  }
  filters?: Array<{
    key: string
    values: string[]
  }>
}

export interface LagoSubscription {
  external_id: string
  external_customer_id: string
  plan_code: string
  name?: string
  subscription_at?: string
  ending_at?: string
  billing_time?: 'calendar' | 'anniversary'
  status?: SubscriptionStatus
}

export interface LagoEvent {
  transaction_id: string
  external_customer_id: string
  external_subscription_id?: string
  code: string
  timestamp?: number
  properties?: Record<string, string | number | boolean>
}

export interface LagoInvoice {
  lago_id: string
  sequential_id: number
  number: string
  issuing_date: string
  payment_due_date: string
  payment_status: PaymentStatus
  status: InvoiceStatus
  amount_cents: number
  amount_currency: Currency
  vat_amount_cents: number
  credit_amount_cents: number
  total_amount_cents: number
  file_url?: string
  customer: {
    lago_id: string
    external_id: string
    name: string
    email: string
  }
  subscriptions?: Array<{
    lago_id: string
    external_id: string
    plan_code: string
  }>
  fees?: Array<{
    lago_id: string
    item: {
      type: string
      code: string
      name: string
    }
    units: string
    amount_cents: number
    events_count: number
  }>
}

export interface LagoWallet {
  lago_id: string
  external_id: string
  external_customer_id: string
  name: string
  balance_cents: number
  consumed_credits: string
  credits_balance: string
  rate_amount: string
  currency: Currency
  status: 'active' | 'terminated'
  expiration_at?: string
}

export interface LagoCoupon {
  code: string
  name: string
  description?: string
  coupon_type: 'fixed_amount' | 'percentage'
  amount_cents?: number
  amount_currency?: Currency
  percentage_rate?: string
  frequency: 'once' | 'recurring' | 'forever'
  frequency_duration?: number
  reusable?: boolean
  limited_plans?: boolean
  plan_codes?: string[]
  expiration?: 'time_limit' | 'no_expiration'
  expiration_at?: string
}

export interface UsageSummary {
  metric_code: string
  metric_name: string
  units: number
  amount_cents: number
  from_datetime: string
  to_datetime: string
}

/**
 * Lago Billing Service
 */
export class LagoBillingService {
  private baseUrl: string
  private apiKey: string

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || LAGO_API_KEY
    this.baseUrl = baseUrl || LAGO_API_URL
  }

  /**
   * Make API request to Lago
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    }

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || `Lago API error: ${response.status}`)
    }

    return result
  }

  // ============================================
  // Customer Management
  // ============================================

  /**
   * Create a new customer
   */
  async createCustomer(customer: LagoCustomer): Promise<{ customer: LagoCustomer }> {
    return this.request<{ customer: LagoCustomer }>('POST', '/customers', { customer })
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(externalId: string, customer: Partial<LagoCustomer>): Promise<{ customer: LagoCustomer }> {
    return this.request<{ customer: LagoCustomer }>('PUT', `/customers/${externalId}`, { customer })
  }

  /**
   * Get customer by external ID
   */
  async getCustomer(externalId: string): Promise<{ customer: LagoCustomer }> {
    return this.request<{ customer: LagoCustomer }>('GET', `/customers/${externalId}`)
  }

  /**
   * List all customers
   */
  async listCustomers(page?: number, perPage?: number): Promise<{ customers: LagoCustomer[]; meta: { current_page: number; total_pages: number; total_count: number } }> {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (perPage) params.append('per_page', perPage.toString())
    return this.request('GET', `/customers?${params}`)
  }

  /**
   * Delete a customer
   */
  async deleteCustomer(externalId: string): Promise<{ customer: LagoCustomer }> {
    return this.request<{ customer: LagoCustomer }>('DELETE', `/customers/${externalId}`)
  }

  /**
   * Get customer portal URL
   */
  async getCustomerPortalUrl(externalId: string): Promise<{ portal_url: string }> {
    return this.request<{ portal_url: string }>('GET', `/customers/${externalId}/portal_url`)
  }

  // ============================================
  // Billable Metrics
  // ============================================

  /**
   * Create a billable metric
   */
  async createBillableMetric(metric: LagoBillableMetric): Promise<{ billable_metric: LagoBillableMetric }> {
    return this.request<{ billable_metric: LagoBillableMetric }>('POST', '/billable_metrics', { billable_metric: metric })
  }

  /**
   * Update a billable metric
   */
  async updateBillableMetric(code: string, metric: Partial<LagoBillableMetric>): Promise<{ billable_metric: LagoBillableMetric }> {
    return this.request<{ billable_metric: LagoBillableMetric }>('PUT', `/billable_metrics/${code}`, { billable_metric: metric })
  }

  /**
   * Get a billable metric
   */
  async getBillableMetric(code: string): Promise<{ billable_metric: LagoBillableMetric }> {
    return this.request<{ billable_metric: LagoBillableMetric }>('GET', `/billable_metrics/${code}`)
  }

  /**
   * List all billable metrics
   */
  async listBillableMetrics(page?: number, perPage?: number): Promise<{ billable_metrics: LagoBillableMetric[]; meta: { current_page: number; total_pages: number; total_count: number } }> {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (perPage) params.append('per_page', perPage.toString())
    return this.request('GET', `/billable_metrics?${params}`)
  }

  /**
   * Delete a billable metric
   */
  async deleteBillableMetric(code: string): Promise<{ billable_metric: LagoBillableMetric }> {
    return this.request<{ billable_metric: LagoBillableMetric }>('DELETE', `/billable_metrics/${code}`)
  }

  // ============================================
  // Plans
  // ============================================

  /**
   * Create a plan
   */
  async createPlan(plan: LagoPlan): Promise<{ plan: LagoPlan }> {
    return this.request<{ plan: LagoPlan }>('POST', '/plans', { plan })
  }

  /**
   * Update a plan
   */
  async updatePlan(code: string, plan: Partial<LagoPlan>): Promise<{ plan: LagoPlan }> {
    return this.request<{ plan: LagoPlan }>('PUT', `/plans/${code}`, { plan })
  }

  /**
   * Get a plan
   */
  async getPlan(code: string): Promise<{ plan: LagoPlan }> {
    return this.request<{ plan: LagoPlan }>('GET', `/plans/${code}`)
  }

  /**
   * List all plans
   */
  async listPlans(page?: number, perPage?: number): Promise<{ plans: LagoPlan[]; meta: { current_page: number; total_pages: number; total_count: number } }> {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (perPage) params.append('per_page', perPage.toString())
    return this.request('GET', `/plans?${params}`)
  }

  /**
   * Delete a plan
   */
  async deletePlan(code: string): Promise<{ plan: LagoPlan }> {
    return this.request<{ plan: LagoPlan }>('DELETE', `/plans/${code}`)
  }

  // ============================================
  // Subscriptions
  // ============================================

  /**
   * Create a subscription
   */
  async createSubscription(subscription: LagoSubscription): Promise<{ subscription: LagoSubscription }> {
    return this.request<{ subscription: LagoSubscription }>('POST', '/subscriptions', { subscription })
  }

  /**
   * Update a subscription
   */
  async updateSubscription(externalId: string, subscription: Partial<LagoSubscription>): Promise<{ subscription: LagoSubscription }> {
    return this.request<{ subscription: LagoSubscription }>('PUT', `/subscriptions/${externalId}`, { subscription })
  }

  /**
   * Get a subscription
   */
  async getSubscription(externalId: string): Promise<{ subscription: LagoSubscription }> {
    return this.request<{ subscription: LagoSubscription }>('GET', `/subscriptions/${externalId}`)
  }

  /**
   * List subscriptions
   */
  async listSubscriptions(externalCustomerId?: string, page?: number, perPage?: number): Promise<{ subscriptions: LagoSubscription[]; meta: { current_page: number; total_pages: number; total_count: number } }> {
    const params = new URLSearchParams()
    if (externalCustomerId) params.append('external_customer_id', externalCustomerId)
    if (page) params.append('page', page.toString())
    if (perPage) params.append('per_page', perPage.toString())
    return this.request('GET', `/subscriptions?${params}`)
  }

  /**
   * Terminate a subscription
   */
  async terminateSubscription(externalId: string): Promise<{ subscription: LagoSubscription }> {
    return this.request<{ subscription: LagoSubscription }>('DELETE', `/subscriptions/${externalId}`)
  }

  // ============================================
  // Usage Events
  // ============================================

  /**
   * Send a usage event
   */
  async sendEvent(event: LagoEvent): Promise<{ event: LagoEvent }> {
    return this.request<{ event: LagoEvent }>('POST', '/events', { event })
  }

  /**
   * Send batch events
   */
  async sendBatchEvents(events: LagoEvent[]): Promise<{ events: LagoEvent[] }> {
    return this.request<{ events: LagoEvent[] }>('POST', '/events/batch', { events })
  }

  /**
   * Get event by transaction ID
   */
  async getEvent(transactionId: string): Promise<{ event: LagoEvent }> {
    return this.request<{ event: LagoEvent }>('GET', `/events/${transactionId}`)
  }

  /**
   * Estimate fees for an event
   */
  async estimateEventFees(event: LagoEvent): Promise<{ fees: Array<{ lago_id: string; amount_cents: number; units: string }> }> {
    return this.request('POST', '/events/estimate_fees', { event })
  }

  // ============================================
  // Invoices
  // ============================================

  /**
   * Get an invoice
   */
  async getInvoice(lagoId: string): Promise<{ invoice: LagoInvoice }> {
    return this.request<{ invoice: LagoInvoice }>('GET', `/invoices/${lagoId}`)
  }

  /**
   * List invoices
   */
  async listInvoices(
    externalCustomerId?: string,
    status?: InvoiceStatus,
    paymentStatus?: PaymentStatus,
    page?: number,
    perPage?: number
  ): Promise<{ invoices: LagoInvoice[]; meta: { current_page: number; total_pages: number; total_count: number } }> {
    const params = new URLSearchParams()
    if (externalCustomerId) params.append('external_customer_id', externalCustomerId)
    if (status) params.append('status', status)
    if (paymentStatus) params.append('payment_status', paymentStatus)
    if (page) params.append('page', page.toString())
    if (perPage) params.append('per_page', perPage.toString())
    return this.request('GET', `/invoices?${params}`)
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoice(lagoId: string): Promise<{ invoice: LagoInvoice }> {
    return this.request<{ invoice: LagoInvoice }>('POST', `/invoices/${lagoId}/download`)
  }

  /**
   * Finalize a draft invoice
   */
  async finalizeInvoice(lagoId: string): Promise<{ invoice: LagoInvoice }> {
    return this.request<{ invoice: LagoInvoice }>('PUT', `/invoices/${lagoId}/finalize`)
  }

  /**
   * Refresh a draft invoice
   */
  async refreshInvoice(lagoId: string): Promise<{ invoice: LagoInvoice }> {
    return this.request<{ invoice: LagoInvoice }>('PUT', `/invoices/${lagoId}/refresh`)
  }

  /**
   * Void an invoice
   */
  async voidInvoice(lagoId: string): Promise<{ invoice: LagoInvoice }> {
    return this.request<{ invoice: LagoInvoice }>('POST', `/invoices/${lagoId}/void`)
  }

  /**
   * Retry payment for an invoice
   */
  async retryInvoicePayment(lagoId: string): Promise<{ invoice: LagoInvoice }> {
    return this.request<{ invoice: LagoInvoice }>('POST', `/invoices/${lagoId}/retry_payment`)
  }

  /**
   * Create one-off invoice
   */
  async createOneOffInvoice(
    externalCustomerId: string,
    fees: Array<{
      add_on_code: string
      units?: number
      unit_amount_cents?: number
      description?: string
    }>
  ): Promise<{ invoice: LagoInvoice }> {
    return this.request<{ invoice: LagoInvoice }>('POST', '/invoices', {
      invoice: {
        external_customer_id: externalCustomerId,
        currency: 'USD',
        fees,
      },
    })
  }

  // ============================================
  // Wallets & Credits
  // ============================================

  /**
   * Create a wallet
   */
  async createWallet(
    externalCustomerId: string,
    name: string,
    currency: Currency,
    paidCredits: string,
    grantedCredits: string,
    rateAmount?: string,
    expirationAt?: string
  ): Promise<{ wallet: LagoWallet }> {
    return this.request<{ wallet: LagoWallet }>('POST', '/wallets', {
      wallet: {
        external_customer_id: externalCustomerId,
        name,
        currency,
        paid_credits: paidCredits,
        granted_credits: grantedCredits,
        rate_amount: rateAmount || '1.0',
        expiration_at: expirationAt,
      },
    })
  }

  /**
   * Get a wallet
   */
  async getWallet(lagoId: string): Promise<{ wallet: LagoWallet }> {
    return this.request<{ wallet: LagoWallet }>('GET', `/wallets/${lagoId}`)
  }

  /**
   * List wallets
   */
  async listWallets(externalCustomerId: string, page?: number, perPage?: number): Promise<{ wallets: LagoWallet[]; meta: { current_page: number; total_pages: number; total_count: number } }> {
    const params = new URLSearchParams()
    params.append('external_customer_id', externalCustomerId)
    if (page) params.append('page', page.toString())
    if (perPage) params.append('per_page', perPage.toString())
    return this.request('GET', `/wallets?${params}`)
  }

  /**
   * Top up a wallet
   */
  async topUpWallet(
    walletId: string,
    paidCredits: string,
    grantedCredits?: string
  ): Promise<{ wallet_transaction: { lago_id: string; amount: string; credit_amount: string } }> {
    return this.request('POST', `/wallets/${walletId}/wallet_transactions`, {
      wallet_transaction: {
        paid_credits: paidCredits,
        granted_credits: grantedCredits || '0.0',
      },
    })
  }

  /**
   * Terminate a wallet
   */
  async terminateWallet(lagoId: string): Promise<{ wallet: LagoWallet }> {
    return this.request<{ wallet: LagoWallet }>('DELETE', `/wallets/${lagoId}`)
  }

  // ============================================
  // Coupons
  // ============================================

  /**
   * Create a coupon
   */
  async createCoupon(coupon: LagoCoupon): Promise<{ coupon: LagoCoupon }> {
    return this.request<{ coupon: LagoCoupon }>('POST', '/coupons', { coupon })
  }

  /**
   * Apply coupon to customer
   */
  async applyCoupon(
    externalCustomerId: string,
    couponCode: string,
    amountCents?: number,
    amountCurrency?: Currency,
    percentageRate?: string
  ): Promise<{ applied_coupon: { lago_id: string; external_customer_id: string; coupon_code: string } }> {
    return this.request('POST', '/applied_coupons', {
      applied_coupon: {
        external_customer_id: externalCustomerId,
        coupon_code: couponCode,
        amount_cents: amountCents,
        amount_currency: amountCurrency,
        percentage_rate: percentageRate,
      },
    })
  }

  /**
   * List coupons
   */
  async listCoupons(page?: number, perPage?: number): Promise<{ coupons: LagoCoupon[]; meta: { current_page: number; total_pages: number; total_count: number } }> {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (perPage) params.append('per_page', perPage.toString())
    return this.request('GET', `/coupons?${params}`)
  }

  /**
   * Delete a coupon
   */
  async deleteCoupon(code: string): Promise<{ coupon: LagoCoupon }> {
    return this.request<{ coupon: LagoCoupon }>('DELETE', `/coupons/${code}`)
  }

  // ============================================
  // Add-ons
  // ============================================

  /**
   * Create an add-on
   */
  async createAddOn(
    code: string,
    name: string,
    amountCents: number,
    amountCurrency: Currency,
    description?: string
  ): Promise<{ add_on: { lago_id: string; code: string; name: string; amount_cents: number } }> {
    return this.request('POST', '/add_ons', {
      add_on: {
        code,
        name,
        amount_cents: amountCents,
        amount_currency: amountCurrency,
        description,
      },
    })
  }

  /**
   * List add-ons
   */
  async listAddOns(page?: number, perPage?: number): Promise<{ add_ons: Array<{ lago_id: string; code: string; name: string; amount_cents: number }>; meta: { current_page: number; total_pages: number; total_count: number } }> {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (perPage) params.append('per_page', perPage.toString())
    return this.request('GET', `/add_ons?${params}`)
  }

  // ============================================
  // Usage Summary
  // ============================================

  /**
   * Get current usage for a customer
   */
  async getCurrentUsage(externalCustomerId: string, externalSubscriptionId?: string): Promise<{ customer_usage: { from_datetime: string; to_datetime: string; charges_usage: UsageSummary[] } }> {
    const params = new URLSearchParams()
    params.append('external_customer_id', externalCustomerId)
    if (externalSubscriptionId) params.append('external_subscription_id', externalSubscriptionId)
    return this.request('GET', `/customers/${externalCustomerId}/current_usage?${params}`)
  }

  /**
   * Get past usage for a customer
   */
  async getPastUsage(
    externalCustomerId: string,
    externalSubscriptionId?: string,
    page?: number,
    perPage?: number
  ): Promise<{ usage_periods: Array<{ from_datetime: string; to_datetime: string; charges_usage: UsageSummary[] }>; meta: { current_page: number; total_pages: number; total_count: number } }> {
    const params = new URLSearchParams()
    if (externalSubscriptionId) params.append('external_subscription_id', externalSubscriptionId)
    if (page) params.append('page', page.toString())
    if (perPage) params.append('per_page', perPage.toString())
    return this.request('GET', `/customers/${externalCustomerId}/past_usage?${params}`)
  }

  // ============================================
  // Webhooks
  // ============================================

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    return signature === expectedSignature
  }

  /**
   * Parse webhook payload
   */
  parseWebhookPayload(payload: string): {
    webhook_type: string
    object_type: string
    [key: string]: unknown
  } {
    return JSON.parse(payload)
  }
}

// Singleton instance
export const lagoBilling = new LagoBillingService()

// Helper functions for FreeFlow integration

/**
 * Sync FreeFlow user to Lago customer
 */
export async function syncUserToLago(userId: string): Promise<void> {
  const supabase = await createClient()

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, organization_id')
    .eq('id', userId)
    .single()

  if (error || !user) {
    throw new Error('User not found')
  }

  // Get organization details if applicable
  let orgData = null
  if (user.organization_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', user.organization_id)
      .single()
    orgData = org
  }

  await lagoBilling.createCustomer({
    external_id: userId,
    name: user.name || user.email,
    email: user.email,
    currency: 'USD',
    metadata: [
      { key: 'user_id', value: userId },
      ...(orgData ? [{ key: 'organization_id', value: user.organization_id }] : []),
    ],
  })
}

/**
 * Track a usage event
 */
export async function trackUsageEvent(
  userId: string,
  metricCode: string,
  properties?: Record<string, string | number | boolean>
): Promise<void> {
  const transactionId = `${userId}_${metricCode}_${Date.now()}`

  await lagoBilling.sendEvent({
    transaction_id: transactionId,
    external_customer_id: userId,
    code: metricCode,
    timestamp: Math.floor(Date.now() / 1000),
    properties,
  })
}

/**
 * Get FreeFlow billable metrics
 */
export function getFreeFlowBillableMetrics(): LagoBillableMetric[] {
  return [
    {
      code: 'api_calls',
      name: 'API Calls',
      description: 'Number of API calls made',
      aggregation_type: 'count_agg',
    },
    {
      code: 'storage_gb',
      name: 'Storage (GB)',
      description: 'Storage used in gigabytes',
      aggregation_type: 'max_agg',
      field_name: 'gb_used',
    },
    {
      code: 'video_minutes',
      name: 'Video Processing Minutes',
      description: 'Minutes of video processed',
      aggregation_type: 'sum_agg',
      field_name: 'minutes',
    },
    {
      code: 'ai_tokens',
      name: 'AI Tokens Used',
      description: 'AI tokens consumed',
      aggregation_type: 'sum_agg',
      field_name: 'tokens',
    },
    {
      code: 'team_members',
      name: 'Team Members',
      description: 'Number of team members',
      aggregation_type: 'unique_count_agg',
      field_name: 'user_id',
    },
    {
      code: 'projects',
      name: 'Active Projects',
      description: 'Number of active projects',
      aggregation_type: 'unique_count_agg',
      field_name: 'project_id',
    },
    {
      code: 'invoices_sent',
      name: 'Invoices Sent',
      description: 'Number of invoices sent',
      aggregation_type: 'count_agg',
    },
    {
      code: 'contracts_created',
      name: 'Contracts Created',
      description: 'Number of contracts created',
      aggregation_type: 'count_agg',
    },
    {
      code: 'bandwidth_gb',
      name: 'Bandwidth (GB)',
      description: 'Bandwidth used in gigabytes',
      aggregation_type: 'sum_agg',
      field_name: 'gb_transferred',
    },
    {
      code: 'messages_sent',
      name: 'Messages Sent',
      description: 'Number of messages sent',
      aggregation_type: 'count_agg',
    },
  ]
}

/**
 * Get FreeFlow pricing plans
 */
export function getFreeFlowPlans(): LagoPlan[] {
  return [
    {
      code: 'free',
      name: 'Free',
      description: 'Perfect for getting started',
      interval: 'monthly',
      amount_cents: 0,
      amount_currency: 'USD',
      charges: [
        {
          billable_metric_code: 'api_calls',
          charge_model: 'package',
          properties: {
            amount: '0',
            free_units: 1000,
            package_size: 1000,
          },
        },
        {
          billable_metric_code: 'storage_gb',
          charge_model: 'standard',
          properties: {
            amount: '0',
            free_units: 5,
          },
        },
      ],
    },
    {
      code: 'starter',
      name: 'Starter',
      description: 'For freelancers and small teams',
      interval: 'monthly',
      amount_cents: 2900,
      amount_currency: 'USD',
      trial_period: 14,
      charges: [
        {
          billable_metric_code: 'api_calls',
          charge_model: 'graduated',
          properties: {
            graduated_ranges: [
              { from_value: 0, to_value: 10000, per_unit_amount: '0', flat_amount: '0' },
              { from_value: 10001, to_value: 50000, per_unit_amount: '0.001', flat_amount: '0' },
              { from_value: 50001, to_value: null, per_unit_amount: '0.0005', flat_amount: '0' },
            ],
          },
        },
        {
          billable_metric_code: 'storage_gb',
          charge_model: 'volume',
          properties: {
            volume_ranges: [
              { from_value: 0, to_value: 50, per_unit_amount: '0', flat_amount: '0' },
              { from_value: 51, to_value: 100, per_unit_amount: '0.10', flat_amount: '0' },
              { from_value: 101, to_value: null, per_unit_amount: '0.05', flat_amount: '0' },
            ],
          },
        },
        {
          billable_metric_code: 'video_minutes',
          charge_model: 'standard',
          properties: {
            amount: '0.05',
            free_units: 60,
          },
        },
        {
          billable_metric_code: 'ai_tokens',
          charge_model: 'package',
          properties: {
            amount: '1',
            free_units: 10000,
            package_size: 10000,
          },
        },
      ],
    },
    {
      code: 'professional',
      name: 'Professional',
      description: 'For growing businesses',
      interval: 'monthly',
      amount_cents: 7900,
      amount_currency: 'USD',
      trial_period: 14,
      charges: [
        {
          billable_metric_code: 'api_calls',
          charge_model: 'graduated',
          properties: {
            graduated_ranges: [
              { from_value: 0, to_value: 100000, per_unit_amount: '0', flat_amount: '0' },
              { from_value: 100001, to_value: 500000, per_unit_amount: '0.0005', flat_amount: '0' },
              { from_value: 500001, to_value: null, per_unit_amount: '0.0002', flat_amount: '0' },
            ],
          },
        },
        {
          billable_metric_code: 'storage_gb',
          charge_model: 'volume',
          properties: {
            volume_ranges: [
              { from_value: 0, to_value: 250, per_unit_amount: '0', flat_amount: '0' },
              { from_value: 251, to_value: 500, per_unit_amount: '0.08', flat_amount: '0' },
              { from_value: 501, to_value: null, per_unit_amount: '0.04', flat_amount: '0' },
            ],
          },
        },
        {
          billable_metric_code: 'video_minutes',
          charge_model: 'standard',
          properties: {
            amount: '0.03',
            free_units: 300,
          },
        },
        {
          billable_metric_code: 'ai_tokens',
          charge_model: 'package',
          properties: {
            amount: '0.80',
            free_units: 100000,
            package_size: 10000,
          },
        },
        {
          billable_metric_code: 'team_members',
          charge_model: 'standard',
          properties: {
            amount: '10',
            free_units: 5,
          },
        },
      ],
    },
    {
      code: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      interval: 'monthly',
      amount_cents: 29900,
      amount_currency: 'USD',
      minimum_commitment: {
        amount_cents: 29900,
        invoice_display_name: 'Platform minimum',
      },
      charges: [
        {
          billable_metric_code: 'api_calls',
          charge_model: 'percentage',
          properties: {
            rate: '0.01',
            fixed_amount: '0',
            free_units_per_events: 1000000,
          },
        },
        {
          billable_metric_code: 'storage_gb',
          charge_model: 'volume',
          properties: {
            volume_ranges: [
              { from_value: 0, to_value: 1000, per_unit_amount: '0', flat_amount: '0' },
              { from_value: 1001, to_value: null, per_unit_amount: '0.02', flat_amount: '0' },
            ],
          },
        },
        {
          billable_metric_code: 'video_minutes',
          charge_model: 'standard',
          properties: {
            amount: '0.02',
            free_units: 1000,
          },
        },
        {
          billable_metric_code: 'ai_tokens',
          charge_model: 'package',
          properties: {
            amount: '0.50',
            free_units: 500000,
            package_size: 10000,
          },
        },
        {
          billable_metric_code: 'team_members',
          charge_model: 'standard',
          properties: {
            amount: '8',
            free_units: 20,
          },
        },
      ],
    },
  ]
}

export default LagoBillingService
