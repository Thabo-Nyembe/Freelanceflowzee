/**
 * Tax Automation Hook
 *
 * React hook for managing tax calculations, transactions, nexus, and exemptions
 *
 * Features:
 * - Real-time tax calculations using TaxJar/Avalara
 * - Economic nexus tracking and compliance
 * - Transaction recording for tax filing
 * - Address validation
 * - Tax exemption certificate management
 */

'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type {
  TaxResult,
  TaxLineItem,
  TaxAddress,
  TaxExemptionCertificate,
  NexusState
} from '@/lib/tax/tax-service'

// ============================================================================
// TYPES
// ============================================================================

interface TaxCalculationRequest {
  transactionId: string
  transactionType: 'invoice' | 'expense' | 'payment' | 'refund'
  transactionDate?: string
  subtotal: number // In cents
  shippingAmount?: number
  discountAmount?: number
  originCountry?: string
  originState?: string
  originCity?: string
  originPostalCode?: string
  destinationCountry: string
  destinationState?: string
  destinationCity?: string
  destinationPostalCode?: string
  lineItems?: TaxLineItem[]
  manualTaxRate?: number
  exemptionCertificateId?: string
  customerId?: string
}

interface TaxSummary {
  year: number
  totalIncome: number
  totalExpenses: number
  totalDeductions: number
  totalTaxCollected: number
  totalTaxPaid: number
  estimatedTaxOwed: number
  nexusStates: NexusState[]
  quarterlyBreakdown: Array<{
    quarter: number
    income: number
    expenses: number
    taxCollected: number
    taxPaid: number
  }>
}

interface TaxTransaction {
  id: string
  transactionId: string
  transactionType: string
  transactionDate: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  taxRate: number
  status: string
  provider?: string
  destinationCountry: string
  destinationState?: string
}

interface TaxRefund {
  id: string
  originalTransactionId: string
  refundTransactionId: string
  refundDate: string
  amount: number
  taxAmount: number
  status: string
  provider?: string
}

interface NexusThreshold {
  state: string
  country: string
  totalSales: number
  totalTransactions: number
  salesThreshold: number
  transactionThreshold: number
  exceededSales: boolean
  exceededTransactions: boolean
  hasNexus: boolean
}

interface TaxProviderStatus {
  taxjar: { configured: boolean; sandbox: boolean }
  avalara: { configured: boolean; sandbox: boolean }
  defaultProvider: string
}

interface UseTaxReturn {
  // State
  loading: boolean
  error: string | null
  calculation: TaxResult | null
  summary: TaxSummary | null
  transactions: TaxTransaction[]
  refunds: TaxRefund[]
  nexusStates: NexusState[]
  nexusThresholds: NexusThreshold[]
  exemptions: TaxExemptionCertificate[]
  providerStatus: TaxProviderStatus | null

  // Tax Calculation
  calculateTax: (params: TaxCalculationRequest) => Promise<TaxResult | null>
  getTaxRate: (params: {
    postalCode: string
    country: string
    state?: string
    city?: string
  }) => Promise<{
    combinedRate: number
    stateRate: number
    countyRate: number
    cityRate: number
    specialRate: number
    freightTaxable: boolean
  } | null>

  // Tax Summary
  getTaxSummary: (year?: number) => Promise<void>

  // Transactions
  recordTransaction: (params: {
    transactionId: string
    transactionDate?: Date
    amount: number
    taxAmount: number
    shippingAmount?: number
    originAddress: TaxAddress
    destinationAddress: TaxAddress
    lineItems?: TaxLineItem[]
    customerId?: string
    provider?: string
  }) => Promise<boolean>
  listTransactions: (params?: {
    year?: number
    type?: string
    status?: string
    limit?: number
    offset?: number
  }) => Promise<void>
  deleteTransaction: (transactionId: string) => Promise<boolean>

  // Refunds
  createRefund: (params: {
    originalTransactionId: string
    refundTransactionId: string
    refundDate?: Date
    amount: number
    taxAmount: number
    shippingAmount?: number
    provider?: string
  }) => Promise<boolean>
  listRefunds: (params?: {
    year?: number
    status?: string
    limit?: number
    offset?: number
  }) => Promise<void>

  // Nexus
  getNexusStates: () => Promise<void>
  checkNexusThresholds: () => Promise<void>
  updateNexusStatus: (params: {
    state: string
    country: string
    hasNexus: boolean
    nexusType: 'physical' | 'economic' | 'both'
    effectiveDate?: string
    salesThreshold?: number
    transactionThreshold?: number
  }) => Promise<boolean>
  removeNexus: (state: string, country: string) => Promise<boolean>

  // Address Validation
  validateAddress: (address: {
    line1?: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }) => Promise<{
    isValid: boolean
    normalizedAddress: TaxAddress
    suggestions?: TaxAddress[]
  } | null>

  // Exemptions
  getExemptions: (status?: string) => Promise<void>
  createExemption: (params: {
    certificateNumber: string
    exemptionType: string
    issuingState: string
    validFrom: string
    validUntil?: string
    documentUrl?: string
  }) => Promise<TaxExemptionCertificate | null>
  revokeExemption: (certificateId: string) => Promise<boolean>
  deleteExemption: (certificateId: string) => Promise<boolean>

  // Utils
  clearError: () => void
  clearCalculation: () => void
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useTax(): UseTaxReturn {
  // State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [calculation, setCalculation] = useState<TaxResult | null>(null)
  const [summary, setSummary] = useState<TaxSummary | null>(null)
  const [transactions, setTransactions] = useState<TaxTransaction[]>([])
  const [refunds, setRefunds] = useState<TaxRefund[]>([])
  const [nexusStates, setNexusStates] = useState<NexusState[]>([])
  const [nexusThresholds, setNexusThresholds] = useState<NexusThreshold[]>([])
  const [exemptions, setExemptions] = useState<TaxExemptionCertificate[]>([])
  const [providerStatus, setProviderStatus] = useState<TaxProviderStatus | null>(null)

  // ============================================================================
  // TAX CALCULATION
  // ============================================================================

  const calculateTax = useCallback(async (params: TaxCalculationRequest): Promise<TaxResult | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/tax/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate tax')
      }

      const result = data.calculation
      setCalculation(result)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tax calculation failed'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getTaxRate = useCallback(async (params: {
    postalCode: string
    country: string
    state?: string
    city?: string
  }) => {
    setLoading(true)

    try {
      const query = new URLSearchParams({
        postalCode: params.postalCode,
        country: params.country,
        ...(params.state && { state: params.state }),
        ...(params.city && { city: params.city })
      })

      const response = await fetch(`/api/tax/calculate?${query}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get tax rate')
      }

      return data.rate
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get tax rate'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================================================
  // TAX SUMMARY
  // ============================================================================

  const getTaxSummary = useCallback(async (year?: number) => {
    setLoading(true)

    try {
      const query = year ? `?year=${year}` : ''
      const response = await fetch(`/api/tax/summary${query}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get tax summary')
      }

      setSummary(data.summary)
      setProviderStatus(data.providers)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get tax summary'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================================================
  // TRANSACTIONS
  // ============================================================================

  const recordTransaction = useCallback(async (params: {
    transactionId: string
    transactionDate?: Date
    amount: number
    taxAmount: number
    shippingAmount?: number
    originAddress: TaxAddress
    destinationAddress: TaxAddress
    lineItems?: TaxLineItem[]
    customerId?: string
    provider?: string
  }): Promise<boolean> => {
    setLoading(true)

    try {
      const response = await fetch('/api/tax/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          transactionDate: params.transactionDate?.toISOString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record transaction')
      }

      toast.success('Transaction recorded for tax filing')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to record transaction'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const listTransactions = useCallback(async (params?: {
    year?: number
    type?: string
    status?: string
    limit?: number
    offset?: number
  }) => {
    setLoading(true)

    try {
      const query = new URLSearchParams()
      if (params?.year) query.set('year', String(params.year))
      if (params?.type) query.set('type', params.type)
      if (params?.status) query.set('status', params.status)
      if (params?.limit) query.set('limit', String(params.limit))
      if (params?.offset) query.set('offset', String(params.offset))

      const response = await fetch(`/api/tax/transactions?${query}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to list transactions')
      }

      setTransactions(data.transactions)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list transactions'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteTransaction = useCallback(async (transactionId: string): Promise<boolean> => {
    setLoading(true)

    try {
      const response = await fetch(`/api/tax/transactions?transactionId=${transactionId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete transaction')
      }

      setTransactions(prev => prev.filter(t => t.transactionId !== transactionId))
      toast.success('Transaction deleted')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete transaction'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================================================
  // REFUNDS
  // ============================================================================

  const createRefund = useCallback(async (params: {
    originalTransactionId: string
    refundTransactionId: string
    refundDate?: Date
    amount: number
    taxAmount: number
    shippingAmount?: number
    provider?: string
  }): Promise<boolean> => {
    setLoading(true)

    try {
      const response = await fetch('/api/tax/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          refundDate: params.refundDate?.toISOString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create refund')
      }

      toast.success('Tax refund recorded')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create refund'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const listRefunds = useCallback(async (params?: {
    year?: number
    status?: string
    limit?: number
    offset?: number
  }) => {
    setLoading(true)

    try {
      const query = new URLSearchParams()
      if (params?.year) query.set('year', String(params.year))
      if (params?.status) query.set('status', params.status)
      if (params?.limit) query.set('limit', String(params.limit))
      if (params?.offset) query.set('offset', String(params.offset))

      const response = await fetch(`/api/tax/refunds?${query}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to list refunds')
      }

      setRefunds(data.refunds)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list refunds'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================================================
  // NEXUS
  // ============================================================================

  const getNexusStates = useCallback(async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/tax/nexus')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get nexus states')
      }

      setNexusStates(data.nexusStates)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get nexus states'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const checkNexusThresholds = useCallback(async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/tax/nexus?checkThresholds=true')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check nexus thresholds')
      }

      setNexusThresholds(data.nexusThresholds)

      // Alert if any states exceed thresholds
      const exceeding = data.statesExceedingThresholds || []
      if (exceeding.length > 0) {
        toast.warning(`You may have economic nexus in ${exceeding.length} state(s)`, {
          description: `Check: ${exceeding.slice(0, 3).map((s: NexusThreshold) => s.state).join(', ')}${exceeding.length > 3 ? '...' : ''}`
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check nexus thresholds'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateNexusStatus = useCallback(async (params: {
    state: string
    country: string
    hasNexus: boolean
    nexusType: 'physical' | 'economic' | 'both'
    effectiveDate?: string
    salesThreshold?: number
    transactionThreshold?: number
  }): Promise<boolean> => {
    setLoading(true)

    try {
      const response = await fetch('/api/tax/nexus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update nexus status')
      }

      toast.success('Nexus status updated')
      await getNexusStates()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update nexus status'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [getNexusStates])

  const removeNexus = useCallback(async (state: string, country: string): Promise<boolean> => {
    setLoading(true)

    try {
      const response = await fetch(`/api/tax/nexus?state=${state}&country=${country}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove nexus')
      }

      setNexusStates(prev => prev.filter(n => !(n.state === state && n.country === country)))
      toast.success('Nexus status removed')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove nexus'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================================================
  // ADDRESS VALIDATION
  // ============================================================================

  const validateAddress = useCallback(async (address: {
    line1?: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }) => {
    setLoading(true)

    try {
      const response = await fetch('/api/tax/validate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate address')
      }

      return data.validation
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to validate address'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================================================
  // EXEMPTIONS
  // ============================================================================

  const getExemptions = useCallback(async (status?: string) => {
    setLoading(true)

    try {
      const query = status ? `?status=${status}` : ''
      const response = await fetch(`/api/tax/exemptions${query}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get exemptions')
      }

      setExemptions(data.certificates)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get exemptions'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const createExemption = useCallback(async (params: {
    certificateNumber: string
    exemptionType: string
    issuingState: string
    validFrom: string
    validUntil?: string
    documentUrl?: string
  }): Promise<TaxExemptionCertificate | null> => {
    setLoading(true)

    try {
      const response = await fetch('/api/tax/exemptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create exemption')
      }

      setExemptions(prev => [data.certificate, ...prev])
      toast.success('Exemption certificate created')
      return data.certificate
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create exemption'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const revokeExemption = useCallback(async (certificateId: string): Promise<boolean> => {
    setLoading(true)

    try {
      const response = await fetch(`/api/tax/exemptions?id=${certificateId}&action=revoke`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke exemption')
      }

      setExemptions(prev => prev.map(e =>
        e.id === certificateId ? { ...e, status: 'revoked' } : e
      ))
      toast.success('Exemption certificate revoked')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to revoke exemption'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteExemption = useCallback(async (certificateId: string): Promise<boolean> => {
    setLoading(true)

    try {
      const response = await fetch(`/api/tax/exemptions?id=${certificateId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete exemption')
      }

      setExemptions(prev => prev.filter(e => e.id !== certificateId))
      toast.success('Exemption certificate deleted')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete exemption'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================================================
  // UTILS
  // ============================================================================

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearCalculation = useCallback(() => {
    setCalculation(null)
  }, [])

  return {
    // State
    loading,
    error,
    calculation,
    summary,
    transactions,
    refunds,
    nexusStates,
    nexusThresholds,
    exemptions,
    providerStatus,

    // Tax Calculation
    calculateTax,
    getTaxRate,

    // Tax Summary
    getTaxSummary,

    // Transactions
    recordTransaction,
    listTransactions,
    deleteTransaction,

    // Refunds
    createRefund,
    listRefunds,

    // Nexus
    getNexusStates,
    checkNexusThresholds,
    updateNexusStatus,
    removeNexus,

    // Address Validation
    validateAddress,

    // Exemptions
    getExemptions,
    createExemption,
    revokeExemption,
    deleteExemption,

    // Utils
    clearError,
    clearCalculation
  }
}
