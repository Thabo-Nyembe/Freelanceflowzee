/**
 * Lago Billing Hook
 *
 * React hook for managing usage-based billing with Lago
 */

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

export type BillingInterval = 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type SubscriptionStatus = 'active' | 'pending' | 'canceled' | 'terminated'
export type InvoiceStatus = 'draft' | 'finalized' | 'voided' | 'payment_dispute_lost'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'

export interface BillingPlan {
  code: string
  name: string
  description: string
  interval: BillingInterval
  amount_cents: number
  amount_currency: string
  trial_period: number
  charges: Array<{
    metric: string
    free_units: number
  }>
  is_active: boolean
}

export interface BillingSubscription {
  id: string
  plan_code: string
  plan_name?: string
  status: SubscriptionStatus
  billing_time: string
  started_at: string
  ending_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  trial_ends_at: string | null
  usage_total_cents?: number
}

export interface UsageSummary {
  metric_code: string
  metric_name?: string
  total_units: number
  total_amount_cents: number
  event_count: number
  limit?: number
  percentage?: number
}

export interface BillingInvoice {
  id: string
  lago_id: string
  number: string
  issuing_date: string
  payment_due_date: string | null
  status: InvoiceStatus
  payment_status: PaymentStatus
  amount_cents: number
  total_amount_cents: number
  currency: string
  file_url: string | null
}

export interface BillingWallet {
  id: string
  name: string
  balance_cents: number
  credits_balance: number
  currency: string
  status: string
  expiration_at: string | null
}

export interface BillingCustomer {
  id: string
  lago_customer_id: string
  email: string
  name: string
  currency: string
  synced_at: string
}

interface UseLagoBillingReturn {
  // Data
  customer: BillingCustomer | null
  plans: BillingPlan[]
  subscription: BillingSubscription | null
  subscriptions: BillingSubscription[]
  usage: UsageSummary[]
  invoices: BillingInvoice[]
  wallets: BillingWallet[]

  // State
  isLoading: boolean
  error: string | null

  // Customer methods
  syncCustomer: () => Promise<boolean>
  getCustomerPortalUrl: () => Promise<string | null>

  // Subscription methods
  fetchSubscriptions: () => Promise<void>
  createSubscription: (planCode: string) => Promise<boolean>
  changePlan: (subscriptionId: string, newPlanCode: string) => Promise<boolean>
  cancelSubscription: (subscriptionId: string) => Promise<boolean>

  // Usage methods
  fetchUsage: (period?: 'current' | 'past') => Promise<void>
  trackUsage: (metricCode: string, units?: number, properties?: Record<string, unknown>) => Promise<boolean>

  // Invoice methods
  fetchInvoices: () => Promise<void>
  downloadInvoice: (invoiceId: string) => Promise<string | null>
  retryPayment: (invoiceId: string) => Promise<boolean>

  // Wallet methods
  fetchWallets: () => Promise<void>
  topUpWallet: (walletId: string, amount: number) => Promise<boolean>

  // Plan methods
  fetchPlans: () => Promise<void>

  // Utilities
  formatAmount: (cents: number, currency?: string) => string
  getUsagePercentage: (current: number, limit: number) => number
  clearError: () => void
}

export function useLagoBilling(): UseLagoBillingReturn {
  const [customer, setCustomer] = useState<BillingCustomer | null>(null)
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [subscription, setSubscription] = useState<BillingSubscription | null>(null)
  const [subscriptions, setSubscriptions] = useState<BillingSubscription[]>([])
  const [usage, setUsage] = useState<UsageSummary[]>([])
  const [invoices, setInvoices] = useState<BillingInvoice[]>([])
  const [wallets, setWallets] = useState<BillingWallet[]>([])
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

  // Calculate usage percentage
  const getUsagePercentage = useCallback((current: number, limit: number): number => {
    if (limit <= 0) return 0
    return Math.min(Math.round((current / limit) * 100), 100)
  }, [])

  // Sync customer to Lago
  const syncCustomer = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sync_only: false }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync customer')
      }

      setCustomer(data.customer)
      toast.success('Billing account synced')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync customer'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get customer portal URL
  const getCustomerPortalUrl = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/billing/customers?action=portal')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get portal URL')
      }

      return data.portal_url
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get portal URL'
      toast.error(message)
      return null
    }
  }, [])

  // Fetch subscriptions
  const fetchSubscriptions = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/subscriptions')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subscriptions')
      }

      setSubscriptions(data.subscriptions || [])
      // Set active subscription
      const active = data.subscriptions?.find((s: BillingSubscription) => s.status === 'active')
      setSubscription(active || null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch subscriptions'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create subscription
  const createSubscription = useCallback(async (planCode: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_code: planCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription')
      }

      toast.success('Subscription created successfully')
      await fetchSubscriptions()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create subscription'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [fetchSubscriptions])

  // Change subscription plan
  const changePlan = useCallback(async (subscriptionId: string, newPlanCode: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_id: subscriptionId, new_plan_code: newPlanCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change plan')
      }

      toast.success('Plan changed successfully')
      await fetchSubscriptions()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change plan'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [fetchSubscriptions])

  // Cancel subscription
  const cancelSubscription = useCallback(async (subscriptionId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/billing/subscriptions?subscriptionId=${subscriptionId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      toast.success('Subscription canceled')
      await fetchSubscriptions()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel subscription'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [fetchSubscriptions])

  // Fetch usage
  const fetchUsage = useCallback(async (period: 'current' | 'past' = 'current'): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/billing/usage?period=${period}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch usage')
      }

      if (period === 'current' && data.usage?.charges_usage) {
        setUsage(data.usage.charges_usage.map((u: { metric_code: string; metric_name?: string; units: number; amount_cents: number }) => ({
          metric_code: u.metric_code,
          metric_name: u.metric_name,
          total_units: u.units,
          total_amount_cents: u.amount_cents,
          event_count: 0,
        })))
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch usage'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Track usage event
  const trackUsage = useCallback(async (
    metricCode: string,
    units = 1,
    properties?: Record<string, unknown>
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/billing/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric_code: metricCode,
          properties: { ...properties, units },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to track usage')
      }

      return true
    } catch (err) {
      console.error('Track usage error:', err)
      return false
    }
  }, [])

  // Fetch invoices
  const fetchInvoices = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/invoices')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invoices')
      }

      setInvoices(data.invoices || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch invoices'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Download invoice
  const downloadInvoice = useCallback(async (invoiceId: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/billing/invoices/${invoiceId}/download`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to download invoice')
      }

      return data.file_url
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download invoice'
      toast.error(message)
      return null
    }
  }, [])

  // Retry payment
  const retryPayment = useCallback(async (invoiceId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/billing/invoices/${invoiceId}/retry`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to retry payment')
      }

      toast.success('Payment retry initiated')
      await fetchInvoices()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to retry payment'
      toast.error(message)
      return false
    }
  }, [fetchInvoices])

  // Fetch wallets
  const fetchWallets = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/wallets')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch wallets')
      }

      setWallets(data.wallets || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch wallets'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Top up wallet
  const topUpWallet = useCallback(async (walletId: string, amount: number): Promise<boolean> => {
    try {
      const response = await fetch('/api/billing/wallets/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_id: walletId, amount }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to top up wallet')
      }

      toast.success('Wallet topped up successfully')
      await fetchWallets()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to top up wallet'
      toast.error(message)
      return false
    }
  }, [fetchWallets])

  // Fetch plans
  const fetchPlans = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/plans')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch plans')
      }

      setPlans(data.plans || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch plans'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Load initial data
  useEffect(() => {
    fetchPlans()
    fetchSubscriptions()
  }, [fetchPlans, fetchSubscriptions])

  return {
    customer,
    plans,
    subscription,
    subscriptions,
    usage,
    invoices,
    wallets,
    isLoading,
    error,
    syncCustomer,
    getCustomerPortalUrl,
    fetchSubscriptions,
    createSubscription,
    changePlan,
    cancelSubscription,
    fetchUsage,
    trackUsage,
    fetchInvoices,
    downloadInvoice,
    retryPayment,
    fetchWallets,
    topUpWallet,
    fetchPlans,
    formatAmount,
    getUsagePercentage,
    clearError,
  }
}

export default useLagoBilling
