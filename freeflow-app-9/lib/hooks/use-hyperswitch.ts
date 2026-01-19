/**
 * Hyperswitch Payment Orchestration Hook
 *
 * React hook for managing multi-processor payments with smart routing
 */

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

// Types
export type PaymentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'succeeded'
  | 'captured'
  | 'partially_captured'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded'
  | 'disputed'

export type RefundStatus = 'pending' | 'succeeded' | 'failed'

export type PaymentMethodType =
  | 'card'
  | 'bank_transfer'
  | 'wallet'
  | 'pay_later'
  | 'crypto'

export interface PaymentIntent {
  payment_id: string
  status: PaymentStatus
  amount: number
  currency: string
  client_secret?: string
  payment_method_types?: PaymentMethodType[]
  next_action?: {
    type: string
    redirect_to_url?: string
    display_bank_transfer_information?: Record<string, unknown>
  }
  connector?: string
  description?: string
  metadata?: Record<string, unknown>
  created_at?: string
}

export interface PaymentMethod {
  id: string
  type: PaymentMethodType
  card_brand?: string
  card_last4?: string
  card_exp_month?: number
  card_exp_year?: number
  bank_name?: string
  wallet_type?: string
  is_default: boolean
}

export interface Refund {
  refund_id: string
  payment_id: string
  amount: number
  currency: string
  status: RefundStatus
  reason?: string
  connector?: string
  created_at?: string
}

export interface Customer {
  customer_id: string
  email?: string
  name?: string
  phone?: string
  metadata?: Record<string, unknown>
}

export interface RoutingRule {
  id: string
  name: string
  description?: string
  algorithm: 'volume_split' | 'priority' | 'round_robin' | 'cost_based' | 'success_rate'
  connectors: Array<{ connector: string; weight: number }>
  conditions?: Array<{
    field: string
    operator: string
    value: string | number
  }>
  priority: number
  is_active: boolean
}

export interface PaymentAnalytics {
  period: {
    start: string
    end: string
  }
  summary: {
    total_payments: number
    successful_payments: number
    failed_payments: number
    refunded_payments: number
    disputed_payments: number
    total_volume_cents: number
    avg_transaction_value_cents: number
    success_rate: number
  }
  connector_breakdown: Array<{
    connector: string
    count: number
    volume_cents: number
    success_rate: number
  }>
  currency_breakdown: Array<{
    currency: string
    count: number
    volume_cents: number
  }>
}

export interface ConnectorConfig {
  id: string
  name: string
  display_name: string
  supported_currencies: string[]
  supported_payment_methods: string[]
  supported_countries: string[]
  is_enabled: boolean
  priority: number
}

interface UseHyperswitchReturn {
  // State
  customer: Customer | null
  payments: PaymentIntent[]
  paymentMethods: PaymentMethod[]
  refunds: Refund[]
  routingRules: RoutingRule[]
  analytics: PaymentAnalytics | null
  connectors: ConnectorConfig[]
  isLoading: boolean
  error: string | null

  // Customer methods
  createCustomer: (data?: { email?: string; name?: string; phone?: string }) => Promise<Customer | null>
  getCustomer: () => Promise<Customer | null>
  updateCustomer: (data: { email?: string; name?: string; phone?: string }) => Promise<boolean>

  // Payment methods
  createPayment: (options: {
    amount: number
    currency?: string
    description?: string
    metadata?: Record<string, unknown>
    capture_method?: 'automatic' | 'manual'
    payment_method_types?: PaymentMethodType[]
  }) => Promise<PaymentIntent | null>
  getPayment: (paymentId: string) => Promise<PaymentIntent | null>
  confirmPayment: (paymentId: string, paymentMethod?: string, returnUrl?: string) => Promise<PaymentIntent | null>
  capturePayment: (paymentId: string, amount?: number) => Promise<PaymentIntent | null>
  cancelPayment: (paymentId: string) => Promise<boolean>
  listPayments: (options?: { status?: string; limit?: number; offset?: number }) => Promise<void>

  // Payment method management
  listPaymentMethods: () => Promise<void>
  setDefaultPaymentMethod: (methodId: string) => Promise<boolean>
  deletePaymentMethod: (methodId: string) => Promise<boolean>

  // Refund methods
  createRefund: (paymentId: string, amount?: number, reason?: string) => Promise<Refund | null>
  getRefund: (refundId: string) => Promise<Refund | null>
  listRefunds: (paymentId?: string) => Promise<void>

  // Routing methods (admin only)
  createRoutingRule: (rule: Omit<RoutingRule, 'id' | 'is_active'>) => Promise<RoutingRule | null>
  updateRoutingRule: (ruleId: string, updates: Partial<RoutingRule>) => Promise<boolean>
  activateRoutingRule: (ruleId: string) => Promise<boolean>
  deactivateRoutingRule: (ruleId: string) => Promise<boolean>
  deleteRoutingRule: (ruleId: string) => Promise<boolean>
  listRoutingRules: () => Promise<void>

  // Analytics methods
  getAnalytics: (options?: {
    type?: 'overview' | 'connector' | 'routing' | 'trends' | 'failures'
    startDate?: string
    endDate?: string
    connector?: string
    currency?: string
  }) => Promise<void>

  // Utility methods
  formatAmount: (cents: number, currency?: string) => string
  getSupportedConnectors: () => Promise<void>
  clearError: () => void
}

export function useHyperswitch(): UseHyperswitchReturn {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [payments, setPayments] = useState<PaymentIntent[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>([])
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null)
  const [connectors, setConnectors] = useState<ConnectorConfig[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Format currency amount
  const formatAmount = useCallback((cents: number, currency = 'USD'): string => {
    const amount = cents / 100
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Customer methods
  const createCustomer = useCallback(async (data?: { email?: string; name?: string; phone?: string }): Promise<Customer | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/hyperswitch/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {}),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create customer')
      }

      setCustomer(result.customer)
      toast.success('Payment profile created')
      return result.customer
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create customer'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getCustomer = useCallback(async (): Promise<Customer | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/hyperswitch/customers?payment_methods=true')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get customer')
      }

      setCustomer(result.customer)
      if (result.saved_methods) {
        setPaymentMethods(result.saved_methods)
      }
      return result.customer
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get customer'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateCustomer = useCallback(async (data: { email?: string; name?: string; phone?: string }): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/hyperswitch/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update customer')
      }

      setCustomer(result.customer)
      toast.success('Payment profile updated')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update customer'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Payment methods
  const createPayment = useCallback(async (options: {
    amount: number
    currency?: string
    description?: string
    metadata?: Record<string, unknown>
    capture_method?: 'automatic' | 'manual'
    payment_method_types?: PaymentMethodType[]
  }): Promise<PaymentIntent | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/hyperswitch/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment')
      }

      return result.payment
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create payment'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getPayment = useCallback(async (paymentId: string): Promise<PaymentIntent | null> => {
    try {
      const response = await fetch(`/api/hyperswitch/payments?id=${paymentId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get payment')
      }

      return result.payment
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get payment'
      setError(message)
      return null
    }
  }, [])

  const confirmPayment = useCallback(async (paymentId: string, paymentMethod?: string, returnUrl?: string): Promise<PaymentIntent | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/hyperswitch/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: paymentId,
          action: 'confirm',
          payment_method: paymentMethod,
          return_url: returnUrl,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to confirm payment')
      }

      return result.payment
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to confirm payment'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const capturePayment = useCallback(async (paymentId: string, amount?: number): Promise<PaymentIntent | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/hyperswitch/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: paymentId,
          action: 'capture',
          amount,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to capture payment')
      }

      toast.success('Payment captured')
      return result.payment
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to capture payment'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const cancelPayment = useCallback(async (paymentId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/hyperswitch/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: paymentId,
          action: 'cancel',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel payment')
      }

      toast.success('Payment cancelled')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel payment'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const listPayments = useCallback(async (options?: { status?: string; limit?: number; offset?: number }): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (options?.status) params.set('status', options.status)
      if (options?.limit) params.set('limit', options.limit.toString())
      if (options?.offset) params.set('offset', options.offset.toString())

      const response = await fetch(`/api/hyperswitch/payments?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to list payments')
      }

      setPayments(result.payments || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list payments'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Payment method management
  const listPaymentMethods = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/hyperswitch/customers?payment_methods=true')
      const result = await response.json()

      if (response.ok && result.saved_methods) {
        setPaymentMethods(result.saved_methods)
      }
    } catch (err) {
      console.error('Failed to list payment methods:', err)
    }
  }, [])

  const setDefaultPaymentMethod = useCallback(async (methodId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/hyperswitch/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ default_payment_method_id: methodId }),
      })

      if (!response.ok) {
        throw new Error('Failed to set default payment method')
      }

      await listPaymentMethods()
      toast.success('Default payment method updated')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update payment method'
      toast.error(message)
      return false
    }
  }, [listPaymentMethods])

  const deletePaymentMethod = useCallback(async (methodId: string): Promise<boolean> => {
    // This would need a separate endpoint for deleting payment methods
    toast.info('Payment method deletion not yet implemented')
    return false
  }, [])

  // Refund methods
  const createRefund = useCallback(async (paymentId: string, amount?: number, reason?: string): Promise<Refund | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/hyperswitch/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId, amount, reason }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create refund')
      }

      toast.success('Refund initiated')
      return result.refund
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create refund'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getRefund = useCallback(async (refundId: string): Promise<Refund | null> => {
    try {
      const response = await fetch(`/api/hyperswitch/refunds?id=${refundId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get refund')
      }

      return result.refund
    } catch {
      return null
    }
  }, [])

  const listRefunds = useCallback(async (paymentId?: string): Promise<void> => {
    setIsLoading(true)
    try {
      const params = paymentId ? `?payment_id=${paymentId}` : ''
      const response = await fetch(`/api/hyperswitch/refunds${params}`)
      const result = await response.json()

      if (response.ok) {
        setRefunds(result.refunds || [])
      }
    } catch (err) {
      console.error('Failed to list refunds:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Routing methods
  const createRoutingRule = useCallback(async (rule: Omit<RoutingRule, 'id' | 'is_active'>): Promise<RoutingRule | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/hyperswitch/routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create routing rule')
      }

      toast.success('Routing rule created')
      await listRoutingRules()
      return result.rule
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create routing rule'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateRoutingRule = useCallback(async (ruleId: string, updates: Partial<RoutingRule>): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/hyperswitch/routing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule_id: ruleId, ...updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to update routing rule')
      }

      toast.success('Routing rule updated')
      await listRoutingRules()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update routing rule'
      toast.error(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const activateRoutingRule = useCallback(async (ruleId: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/hyperswitch/routing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule_id: ruleId, action: 'activate' }),
      })

      if (!response.ok) {
        throw new Error('Failed to activate routing rule')
      }

      toast.success('Routing rule activated')
      await listRoutingRules()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to activate routing rule'
      toast.error(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deactivateRoutingRule = useCallback(async (ruleId: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/hyperswitch/routing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule_id: ruleId, action: 'deactivate' }),
      })

      if (!response.ok) {
        throw new Error('Failed to deactivate routing rule')
      }

      toast.success('Routing rule deactivated')
      await listRoutingRules()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deactivate routing rule'
      toast.error(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteRoutingRule = useCallback(async (ruleId: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/hyperswitch/routing?id=${ruleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete routing rule')
      }

      toast.success('Routing rule deleted')
      await listRoutingRules()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete routing rule'
      toast.error(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const listRoutingRules = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/hyperswitch/routing')
      const result = await response.json()

      if (response.ok) {
        setRoutingRules(result.rules || [])
      }
    } catch (err) {
      console.error('Failed to list routing rules:', err)
    }
  }, [])

  // Analytics methods
  const getAnalytics = useCallback(async (options?: {
    type?: 'overview' | 'connector' | 'routing' | 'trends' | 'failures'
    startDate?: string
    endDate?: string
    connector?: string
    currency?: string
  }): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (options?.type) params.set('type', options.type)
      if (options?.startDate) params.set('start_date', options.startDate)
      if (options?.endDate) params.set('end_date', options.endDate)
      if (options?.connector) params.set('connector', options.connector)
      if (options?.currency) params.set('currency', options.currency)

      const response = await fetch(`/api/hyperswitch/analytics?${params}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get analytics')
      }

      setAnalytics(result.analytics)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get analytics'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get supported connectors
  const getSupportedConnectors = useCallback(async (): Promise<void> => {
    try {
      // This would fetch from a connectors endpoint
      // For now, using default connectors
      setConnectors([
        { id: 'stripe', name: 'stripe', display_name: 'Stripe', supported_currencies: ['USD', 'EUR', 'GBP'], supported_payment_methods: ['card', 'bank_transfer'], supported_countries: ['US', 'EU', 'GB'], is_enabled: true, priority: 100 },
        { id: 'adyen', name: 'adyen', display_name: 'Adyen', supported_currencies: ['USD', 'EUR', 'GBP', 'JPY'], supported_payment_methods: ['card', 'ideal', 'sofort'], supported_countries: ['US', 'EU', 'GB', 'JP'], is_enabled: true, priority: 90 },
        { id: 'checkout', name: 'checkout', display_name: 'Checkout.com', supported_currencies: ['USD', 'EUR', 'GBP', 'AED'], supported_payment_methods: ['card', 'apple_pay', 'google_pay'], supported_countries: ['US', 'EU', 'GB', 'AE'], is_enabled: true, priority: 85 },
        { id: 'braintree', name: 'braintree', display_name: 'Braintree', supported_currencies: ['USD', 'EUR', 'GBP'], supported_payment_methods: ['card', 'paypal', 'venmo'], supported_countries: ['US', 'EU', 'GB', 'AU'], is_enabled: true, priority: 80 },
        { id: 'paypal', name: 'paypal', display_name: 'PayPal', supported_currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'], supported_payment_methods: ['paypal', 'card'], supported_countries: ['US', 'EU', 'GB', 'CA', 'AU'], is_enabled: true, priority: 75 },
      ])
    } catch (err) {
      console.error('Failed to get connectors:', err)
    }
  }, [])

  // Load initial data
  useEffect(() => {
    getCustomer()
    getSupportedConnectors()
  }, [getCustomer, getSupportedConnectors])

  return {
    // State
    customer,
    payments,
    paymentMethods,
    refunds,
    routingRules,
    analytics,
    connectors,
    isLoading,
    error,

    // Customer methods
    createCustomer,
    getCustomer,
    updateCustomer,

    // Payment methods
    createPayment,
    getPayment,
    confirmPayment,
    capturePayment,
    cancelPayment,
    listPayments,

    // Payment method management
    listPaymentMethods,
    setDefaultPaymentMethod,
    deletePaymentMethod,

    // Refund methods
    createRefund,
    getRefund,
    listRefunds,

    // Routing methods
    createRoutingRule,
    updateRoutingRule,
    activateRoutingRule,
    deactivateRoutingRule,
    deleteRoutingRule,
    listRoutingRules,

    // Analytics methods
    getAnalytics,

    // Utility methods
    formatAmount,
    getSupportedConnectors,
    clearError,
  }
}

export default useHyperswitch
