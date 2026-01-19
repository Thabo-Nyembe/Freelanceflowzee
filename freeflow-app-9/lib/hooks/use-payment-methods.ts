'use client'

/**
 * usePaymentMethods - React hook for Stripe payment method management
 *
 * Features:
 * - List all payment methods
 * - Add new payment methods (via Stripe Elements)
 * - Set default payment method
 * - Delete payment methods
 * - Real-time updates
 */

import { useState, useEffect, useCallback } from 'react'
import { useCurrentUser } from './use-current-user'

// ============================================================================
// Types
// ============================================================================

export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account' | 'paypal' | 'apple_pay' | 'google_pay'
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
  isExpired?: boolean
  createdAt?: string
}

export interface PaymentMethodsState {
  paymentMethods: PaymentMethod[]
  defaultPaymentMethod: PaymentMethod | null
  isLoading: boolean
  error: string | null
  isDemo: boolean
}

export interface UsePaymentMethodsReturn extends PaymentMethodsState {
  // Operations
  refresh: () => Promise<void>
  setDefault: (paymentMethodId: string) => Promise<boolean>
  remove: (paymentMethodId: string) => Promise<boolean>

  // Stripe Checkout redirect (for adding new methods)
  openBillingPortal: () => Promise<string | null>

  // Helpers
  hasPaymentMethods: boolean
  isExpiringSoon: (paymentMethodId: string) => boolean
  getExpiryStatus: (paymentMethodId: string) => 'valid' | 'expiring' | 'expired'
}

// ============================================================================
// API Helper
// ============================================================================

async function callPaymentMethodsAPI(
  action: string,
  data?: Record<string, any>,
  method: 'POST' | 'DELETE' = 'POST'
): Promise<{ success: boolean; data?: any; error?: string; demo?: boolean }> {
  try {
    const response = await fetch('/api/stripe/payment-methods', {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ action, ...data }),
    })

    return await response.json()
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// ============================================================================
// React Hook
// ============================================================================

export function usePaymentMethods(): UsePaymentMethodsReturn {
  const { user } = useCurrentUser()

  const [state, setState] = useState<PaymentMethodsState>({
    paymentMethods: [],
    defaultPaymentMethod: null,
    isLoading: true,
    error: null,
    isDemo: false,
  })

  // Fetch payment methods
  const refresh = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await callPaymentMethodsAPI('list-payment-methods')

      if (result.success) {
        const methods = result.data?.paymentMethods || []
        const defaultMethod = methods.find((m: PaymentMethod) => m.isDefault) || null

        // Check for expired cards
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() + 1

        const methodsWithExpiry = methods.map((m: PaymentMethod) => ({
          ...m,
          isExpired: m.expYear < currentYear ||
            (m.expYear === currentYear && m.expMonth < currentMonth),
        }))

        setState({
          paymentMethods: methodsWithExpiry,
          defaultPaymentMethod: defaultMethod,
          isLoading: false,
          error: null,
          isDemo: result.demo || false,
        })
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Failed to load payment methods',
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }, [user])

  // Initial load
  useEffect(() => {
    refresh()
  }, [refresh])

  // Set default payment method
  const setDefault = useCallback(async (paymentMethodId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }))

    const result = await callPaymentMethodsAPI('set-default', { paymentMethodId })

    if (result.success) {
      // Update local state
      setState(prev => ({
        ...prev,
        isLoading: false,
        paymentMethods: prev.paymentMethods.map(m => ({
          ...m,
          isDefault: m.id === paymentMethodId,
        })),
        defaultPaymentMethod: prev.paymentMethods.find(m => m.id === paymentMethodId) || null,
      }))
      return true
    } else {
      setState(prev => ({ ...prev, isLoading: false, error: result.error || 'Failed to set default' }))
      return false
    }
  }, [])

  // Remove payment method
  const remove = useCallback(async (paymentMethodId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }))

    const result = await callPaymentMethodsAPI('', { paymentMethodId }, 'DELETE')

    if (result.success) {
      // Update local state
      setState(prev => {
        const filtered = prev.paymentMethods.filter(m => m.id !== paymentMethodId)
        return {
          ...prev,
          isLoading: false,
          paymentMethods: filtered,
          defaultPaymentMethod: prev.defaultPaymentMethod?.id === paymentMethodId ? null : prev.defaultPaymentMethod,
        }
      })
      return true
    } else {
      setState(prev => ({ ...prev, isLoading: false, error: result.error || 'Failed to remove' }))
      return false
    }
  }, [])

  // Open Stripe Billing Portal
  const openBillingPortal = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'create-portal-session' }),
      })

      const result = await response.json()

      if (result.success && result.data?.url) {
        window.location.href = result.data.url
        return result.data.url
      }

      return null
    } catch {
      return null
    }
  }, [])

  // Helper: Check if method is expiring soon (within 3 months)
  const isExpiringSoon = useCallback((paymentMethodId: string): boolean => {
    const method = state.paymentMethods.find(m => m.id === paymentMethodId)
    if (!method) return false

    const now = new Date()
    const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3, 1)
    const expiryDate = new Date(method.expYear, method.expMonth, 1)

    return expiryDate <= threeMonthsFromNow && !method.isExpired
  }, [state.paymentMethods])

  // Helper: Get expiry status
  const getExpiryStatus = useCallback((paymentMethodId: string): 'valid' | 'expiring' | 'expired' => {
    const method = state.paymentMethods.find(m => m.id === paymentMethodId)
    if (!method) return 'valid'

    if (method.isExpired) return 'expired'
    if (isExpiringSoon(paymentMethodId)) return 'expiring'
    return 'valid'
  }, [state.paymentMethods, isExpiringSoon])

  return {
    ...state,
    refresh,
    setDefault,
    remove,
    openBillingPortal,
    hasPaymentMethods: state.paymentMethods.length > 0,
    isExpiringSoon,
    getExpiryStatus,
  }
}

export default usePaymentMethods
