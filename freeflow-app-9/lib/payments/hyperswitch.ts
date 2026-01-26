/**
 * Hyperswitch Payment Orchestration Service
 *
 * Enterprise-grade payment routing with:
 * - Multi-processor support (Stripe, Adyen, PayPal, etc.)
 * - Smart routing based on success rates
 * - Automatic failover and retries
 * - Multi-currency support
 * - Unified payment API
 */

import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Configuration
const HYPERSWITCH_API_URL = process.env.HYPERSWITCH_API_URL || 'https://sandbox.hyperswitch.io'
const HYPERSWITCH_API_KEY = process.env.HYPERSWITCH_API_KEY || ''
const HYPERSWITCH_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_HYPERSWITCH_PUBLISHABLE_KEY || ''

// Types
export type PaymentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_customer_action'
  | 'processing'
  | 'requires_capture'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'partially_captured'
  | 'pending'

export type RefundStatus = 'succeeded' | 'failed' | 'pending' | 'review'

export type PaymentMethodType =
  | 'card'
  | 'bank_transfer'
  | 'wallet'
  | 'pay_later'
  | 'bank_redirect'
  | 'bank_debit'
  | 'crypto'
  | 'reward'
  | 'upi'
  | 'voucher'
  | 'gift_card'

export type ConnectorType =
  | 'stripe'
  | 'adyen'
  | 'paypal'
  | 'braintree'
  | 'checkout'
  | 'mollie'
  | 'klarna'
  | 'affirm'
  | 'square'
  | 'worldpay'
  | 'cybersource'
  | 'nmi'
  | 'authorizedotnet'
  | 'bluesnap'
  | 'gocardless'
  | 'rapyd'
  | 'wise'

export interface Address {
  line1?: string
  line2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  first_name?: string
  last_name?: string
}

export interface Customer {
  id?: string
  email?: string
  name?: string
  phone?: string
  address?: Address
  metadata?: Record<string, string>
}

export interface PaymentMethod {
  payment_method_type: PaymentMethodType
  payment_method_data?: {
    card?: {
      card_number: string
      card_exp_month: string
      card_exp_year: string
      card_holder_name?: string
      card_cvc: string
    }
    bank_transfer?: {
      bank_name?: string
      bank_account_number?: string
      bank_routing_number?: string
    }
    wallet?: {
      wallet_type: 'apple_pay' | 'google_pay' | 'paypal' | 'samsung_pay'
      payment_method_id?: string
    }
  }
}

export interface PaymentIntent {
  payment_id: string
  client_secret: string
  status: PaymentStatus
  amount: number
  currency: string
  amount_capturable?: number
  amount_received?: number
  connector?: ConnectorType
  payment_method_type?: PaymentMethodType
  customer_id?: string
  description?: string
  return_url?: string
  setup_future_usage?: 'off_session' | 'on_session'
  capture_method?: 'automatic' | 'manual'
  authentication_type?: 'three_ds' | 'no_three_ds'
  metadata?: Record<string, string>
  error_code?: string
  error_message?: string
  created_at: string
  modified_at?: string
}

export interface Refund {
  refund_id: string
  payment_id: string
  amount: number
  currency: string
  status: RefundStatus
  reason?: string
  metadata?: Record<string, string>
  created_at: string
}

export interface PaymentMethodToken {
  payment_token: string
  payment_method_type: PaymentMethodType
  card_info?: {
    last4_digits: string
    card_brand: string
    card_exp_month: string
    card_exp_year: string
    card_holder_name?: string
  }
  is_default: boolean
  created_at: string
}

export interface RoutingRule {
  id: string
  name: string
  description?: string
  algorithm: 'priority' | 'volume_split' | 'dynamic'
  connectors: Array<{
    connector: ConnectorType
    merchant_connector_id: string
    priority?: number
    percentage?: number
  }>
  conditions?: Array<{
    field: string
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
    value: string | number
  }>
  is_active: boolean
}

export interface PaymentAnalytics {
  total_payments: number
  successful_payments: number
  failed_payments: number
  total_volume: number
  average_transaction: number
  success_rate: number
  by_connector: Array<{
    connector: ConnectorType
    count: number
    volume: number
    success_rate: number
  }>
  by_payment_method: Array<{
    payment_method: PaymentMethodType
    count: number
    volume: number
    success_rate: number
  }>
  by_currency: Array<{
    currency: string
    count: number
    volume: number
  }>
}

interface CreatePaymentIntentOptions {
  amount: number
  currency: string
  customer_id?: string
  description?: string
  metadata?: Record<string, string>
  return_url?: string
  setup_future_usage?: 'off_session' | 'on_session'
  capture_method?: 'automatic' | 'manual'
  authentication_type?: 'three_ds' | 'no_three_ds'
  billing_address?: Address
  shipping_address?: Address
  statement_descriptor?: string
  routing?: {
    type: 'single' | 'priority' | 'volume_split'
    connectors?: Array<{
      connector: ConnectorType
      merchant_connector_id: string
    }>
    routing_config_id?: string
  }
}

interface ConfirmPaymentOptions {
  payment_method?: PaymentMethod
  payment_token?: string
  browser_info?: {
    user_agent: string
    accept_header: string
    language: string
    color_depth: number
    screen_height: number
    screen_width: number
    time_zone: number
    java_enabled: boolean
    javascript_enabled: boolean
  }
}

/**
 * Hyperswitch Payment Service
 */
export class HyperswitchPaymentService {
  private baseUrl: string
  private apiKey: string

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || HYPERSWITCH_API_KEY
    this.baseUrl = baseUrl || HYPERSWITCH_API_URL
  }

  /**
   * Make API request to Hyperswitch
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
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    }

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error?.message || result.message || `Hyperswitch API error: ${response.status}`)
    }

    return result
  }

  // ============================================
  // Customer Management
  // ============================================

  /**
   * Create a customer
   */
  async createCustomer(customer: Customer): Promise<{ customer_id: string }> {
    return this.request<{ customer_id: string }>('POST', '/customers', customer)
  }

  /**
   * Get customer
   */
  async getCustomer(customerId: string): Promise<Customer & { customer_id: string }> {
    return this.request('GET', `/customers/${customerId}`)
  }

  /**
   * Update customer
   */
  async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer & { customer_id: string }> {
    return this.request('POST', `/customers/${customerId}`, updates)
  }

  /**
   * Delete customer
   */
  async deleteCustomer(customerId: string): Promise<{ customer_deleted: boolean }> {
    return this.request('DELETE', `/customers/${customerId}`)
  }

  // ============================================
  // Payment Intents
  // ============================================

  /**
   * Create a payment intent
   */
  async createPaymentIntent(options: CreatePaymentIntentOptions): Promise<PaymentIntent> {
    return this.request<PaymentIntent>('POST', '/payments', {
      amount: options.amount,
      currency: options.currency,
      customer_id: options.customer_id,
      description: options.description,
      metadata: options.metadata,
      return_url: options.return_url,
      setup_future_usage: options.setup_future_usage,
      capture_method: options.capture_method,
      authentication_type: options.authentication_type,
      billing: options.billing_address ? { address: options.billing_address } : undefined,
      shipping: options.shipping_address ? { address: options.shipping_address } : undefined,
      statement_descriptor_name: options.statement_descriptor,
      routing: options.routing,
    })
  }

  /**
   * Get payment intent
   */
  async getPaymentIntent(paymentId: string): Promise<PaymentIntent> {
    return this.request<PaymentIntent>('GET', `/payments/${paymentId}`)
  }

  /**
   * Update payment intent
   */
  async updatePaymentIntent(
    paymentId: string,
    updates: Partial<CreatePaymentIntentOptions>
  ): Promise<PaymentIntent> {
    return this.request<PaymentIntent>('POST', `/payments/${paymentId}`, updates)
  }

  /**
   * Confirm payment intent
   */
  async confirmPaymentIntent(
    paymentId: string,
    options: ConfirmPaymentOptions
  ): Promise<PaymentIntent> {
    const body: Record<string, unknown> = {}

    if (options.payment_method) {
      body.payment_method = options.payment_method.payment_method_type
      body.payment_method_data = options.payment_method.payment_method_data
    }

    if (options.payment_token) {
      body.payment_token = options.payment_token
    }

    if (options.browser_info) {
      body.browser_info = options.browser_info
    }

    return this.request<PaymentIntent>('POST', `/payments/${paymentId}/confirm`, body)
  }

  /**
   * Capture payment (for manual capture)
   */
  async capturePayment(
    paymentId: string,
    amount?: number
  ): Promise<PaymentIntent> {
    return this.request<PaymentIntent>('POST', `/payments/${paymentId}/capture`, {
      amount_to_capture: amount,
    })
  }

  /**
   * Cancel payment
   */
  async cancelPayment(
    paymentId: string,
    reason?: string
  ): Promise<PaymentIntent> {
    return this.request<PaymentIntent>('POST', `/payments/${paymentId}/cancel`, {
      cancellation_reason: reason,
    })
  }

  /**
   * List payments
   */
  async listPayments(options?: {
    customer_id?: string
    status?: PaymentStatus
    connector?: ConnectorType
    created_gte?: string
    created_lte?: string
    limit?: number
    offset?: number
  }): Promise<{ data: PaymentIntent[]; count: number }> {
    const params = new URLSearchParams()
    if (options?.customer_id) params.append('customer_id', options.customer_id)
    if (options?.status) params.append('status', options.status)
    if (options?.connector) params.append('connector', options.connector)
    if (options?.created_gte) params.append('created[gte]', options.created_gte)
    if (options?.created_lte) params.append('created[lte]', options.created_lte)
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.offset) params.append('offset', options.offset.toString())

    return this.request('GET', `/payments/list?${params}`)
  }

  // ============================================
  // Refunds
  // ============================================

  /**
   * Create a refund
   */
  async createRefund(
    paymentId: string,
    amount?: number,
    reason?: string,
    metadata?: Record<string, string>
  ): Promise<Refund> {
    return this.request<Refund>('POST', '/refunds', {
      payment_id: paymentId,
      amount,
      reason,
      metadata,
    })
  }

  /**
   * Get refund
   */
  async getRefund(refundId: string): Promise<Refund> {
    return this.request<Refund>('GET', `/refunds/${refundId}`)
  }

  /**
   * List refunds
   */
  async listRefunds(
    paymentId?: string,
    limit?: number,
    offset?: number
  ): Promise<{ data: Refund[]; count: number }> {
    const params = new URLSearchParams()
    if (paymentId) params.append('payment_id', paymentId)
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())

    return this.request('GET', `/refunds/list?${params}`)
  }

  // ============================================
  // Payment Methods (Saved)
  // ============================================

  /**
   * List saved payment methods for customer
   */
  async listPaymentMethods(customerId: string): Promise<{ customer_payment_methods: PaymentMethodToken[] }> {
    return this.request('GET', `/customers/${customerId}/payment_methods`)
  }

  /**
   * Delete saved payment method
   */
  async deletePaymentMethod(
    customerId: string,
    paymentToken: string
  ): Promise<{ payment_method_deleted: boolean }> {
    return this.request('DELETE', `/customers/${customerId}/payment_methods/${paymentToken}`)
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(
    customerId: string,
    paymentToken: string
  ): Promise<PaymentMethodToken> {
    return this.request<PaymentMethodToken>('POST', `/customers/${customerId}/payment_methods/${paymentToken}/default`, {})
  }

  // ============================================
  // Routing Configuration
  // ============================================

  /**
   * Create routing rule
   */
  async createRoutingRule(rule: Omit<RoutingRule, 'id'>): Promise<RoutingRule> {
    return this.request<RoutingRule>('POST', '/routing', rule)
  }

  /**
   * Get routing rule
   */
  async getRoutingRule(ruleId: string): Promise<RoutingRule> {
    return this.request<RoutingRule>('GET', `/routing/${ruleId}`)
  }

  /**
   * List routing rules
   */
  async listRoutingRules(): Promise<{ routing_configs: RoutingRule[] }> {
    return this.request('GET', '/routing')
  }

  /**
   * Update routing rule
   */
  async updateRoutingRule(
    ruleId: string,
    updates: Partial<Omit<RoutingRule, 'id'>>
  ): Promise<RoutingRule> {
    return this.request<RoutingRule>('POST', `/routing/${ruleId}`, updates)
  }

  /**
   * Delete routing rule
   */
  async deleteRoutingRule(ruleId: string): Promise<{ deleted: boolean }> {
    return this.request('DELETE', `/routing/${ruleId}`)
  }

  /**
   * Activate routing rule
   */
  async activateRoutingRule(ruleId: string): Promise<RoutingRule> {
    return this.request<RoutingRule>('POST', `/routing/${ruleId}/activate`, {})
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
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    return signature === expectedSignature
  }

  /**
   * Parse webhook event
   */
  parseWebhookEvent(payload: string): {
    event_type: string
    content: PaymentIntent | Refund
    business_profile_id: string
    timestamp: string
  } {
    return JSON.parse(payload)
  }

  // ============================================
  // Analytics
  // ============================================

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(options?: {
    start_time?: string
    end_time?: string
    granularity?: 'day' | 'week' | 'month'
  }): Promise<PaymentAnalytics> {
    const params = new URLSearchParams()
    if (options?.start_time) params.append('start_time', options.start_time)
    if (options?.end_time) params.append('end_time', options.end_time)
    if (options?.granularity) params.append('granularity', options.granularity)

    return this.request('GET', `/analytics/payments?${params}`)
  }

  // ============================================
  // Utilities
  // ============================================

  /**
   * Get supported payment methods for amount/currency
   */
  async getPaymentMethodList(
    amount: number,
    currency: string,
    country?: string
  ): Promise<{ payment_methods: Array<{ payment_method: PaymentMethodType; eligible_connectors: ConnectorType[] }> }> {
    const params = new URLSearchParams({
      amount: amount.toString(),
      currency,
    })
    if (country) params.append('country', country)

    return this.request('GET', `/account/payment_methods?${params}`)
  }

  /**
   * Get client secret for frontend SDK
   */
  getPublishableKey(): string {
    return HYPERSWITCH_PUBLISHABLE_KEY
  }
}

// Singleton instance
export const hyperswitchPayments = new HyperswitchPaymentService()

// Helper functions for FreeFlow integration

/**
 * Create a FreeFlow payment
 */
export async function createFreeFlowPayment(
  userId: string,
  amount: number,
  currency: string,
  description: string,
  metadata?: Record<string, string>
): Promise<PaymentIntent> {
  const supabase = await createClient()

  // Get user details
  const { data: user } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('id', userId)
    .single()

  if (!user) {
    throw new Error('User not found')
  }

  // Check if customer exists in Hyperswitch
  let customerId: string
  const { data: existingCustomer } = await supabase
    .from('payment_customers')
    .select('hyperswitch_customer_id')
    .eq('user_id', userId)
    .single()

  if (existingCustomer?.hyperswitch_customer_id) {
    customerId = existingCustomer.hyperswitch_customer_id
  } else {
    // Create customer
    const { customer_id } = await hyperswitchPayments.createCustomer({
      email: user.email,
      name: user.name,
      metadata: { freeflow_user_id: userId },
    })
    customerId = customer_id

    // Store customer ID
    await supabase.from('payment_customers').upsert({
      user_id: userId,
      hyperswitch_customer_id: customerId,
      email: user.email,
      name: user.name,
      created_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }

  // Create payment intent
  const paymentIntent = await hyperswitchPayments.createPaymentIntent({
    amount,
    currency,
    customer_id: customerId,
    description,
    metadata: {
      ...metadata,
      freeflow_user_id: userId,
    },
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments/complete`,
    capture_method: 'automatic',
    authentication_type: 'three_ds',
  })

  // Store payment intent
  await supabase.from('payment_intents').insert({
    id: paymentIntent.payment_id,
    user_id: userId,
    amount,
    currency,
    status: paymentIntent.status,
    description,
    metadata: { ...metadata, ...paymentIntent.metadata },
    hyperswitch_payment_id: paymentIntent.payment_id,
    client_secret: paymentIntent.client_secret,
    created_at: new Date().toISOString(),
  })

  return paymentIntent
}

/**
 * Process a refund
 */
export async function processRefund(
  paymentId: string,
  amount?: number,
  reason?: string
): Promise<Refund> {
  const supabase = await createClient()

  // Get payment
  const { data: payment } = await supabase
    .from('payment_intents')
    .select('*')
    .eq('hyperswitch_payment_id', paymentId)
    .single()

  if (!payment) {
    throw new Error('Payment not found')
  }

  // Create refund
  const refund = await hyperswitchPayments.createRefund(
    paymentId,
    amount,
    reason,
    { freeflow_payment_id: payment.id }
  )

  // Store refund
  await supabase.from('payment_refunds').insert({
    id: refund.refund_id,
    payment_id: payment.id,
    hyperswitch_refund_id: refund.refund_id,
    amount: refund.amount,
    currency: refund.currency,
    status: refund.status,
    reason,
    created_at: new Date().toISOString(),
  })

  return refund
}

/**
 * Get FreeFlow-specific routing configuration
 */
export function getFreeFlowRoutingConfig(): Omit<RoutingRule, 'id'> {
  return {
    name: 'FreeFlow Smart Routing',
    description: 'Optimized routing for FreeFlow payments',
    algorithm: 'priority',
    connectors: [
      {
        connector: 'stripe',
        merchant_connector_id: process.env.HYPERSWITCH_STRIPE_CONNECTOR_ID || '',
        priority: 1,
      },
      {
        connector: 'adyen',
        merchant_connector_id: process.env.HYPERSWITCH_ADYEN_CONNECTOR_ID || '',
        priority: 2,
      },
      {
        connector: 'paypal',
        merchant_connector_id: process.env.HYPERSWITCH_PAYPAL_CONNECTOR_ID || '',
        priority: 3,
      },
    ],
    is_active: true,
  }
}

/**
 * Get supported currencies for FreeFlow
 */
export function getSupportedCurrencies(): string[] {
  return [
    'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'ZAR', 'INR', 'BRL',
    'MXN', 'JPY', 'CNY', 'SGD', 'HKD', 'NZD', 'CHF', 'SEK',
    'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'TRY',
  ]
}

/**
 * Get supported payment methods for a region
 */
export function getSupportedPaymentMethods(country: string): PaymentMethodType[] {
  const regionMethods: Record<string, PaymentMethodType[]> = {
    // North America
    US: ['card', 'wallet', 'bank_transfer', 'pay_later'],
    CA: ['card', 'wallet', 'bank_transfer'],

    // Europe
    GB: ['card', 'wallet', 'bank_redirect', 'pay_later'],
    DE: ['card', 'wallet', 'bank_redirect', 'pay_later'],
    FR: ['card', 'wallet', 'bank_redirect'],
    NL: ['card', 'wallet', 'bank_redirect'],

    // Asia-Pacific
    AU: ['card', 'wallet', 'bank_transfer'],
    SG: ['card', 'wallet', 'bank_transfer'],
    IN: ['card', 'wallet', 'upi', 'bank_transfer'],

    // Africa
    ZA: ['card', 'wallet', 'bank_transfer'],

    // Default
    DEFAULT: ['card', 'wallet'],
  }

  return regionMethods[country] || regionMethods.DEFAULT
}

export default HyperswitchPaymentService
