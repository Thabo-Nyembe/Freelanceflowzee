'use client'

/**
 * Tax Intelligence Hooks
 * React hooks for tax calculations, summaries, and insights
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Types
interface TaxSummary {
  totalIncome: number
  totalExpenses: number
  totalDeductions: number
  totalTaxPaid: number
  estimatedTaxOwed: number
  quarterlyBreakdown: QuarterlyTax[]
}

interface QuarterlyTax {
  quarter: string
  income: number
  expenses: number
  taxPaid: number
  estimatedOwed: number
}

interface TaxInsight {
  id: string
  insightType: string
  category: string
  title: string
  description: string
  priority: string
  actionRequired: boolean
  actionLabel?: string
  actionUrl?: string
  estimatedSavings?: number
  isRead: boolean
  isDismissed: boolean
  createdAt: string
}

interface TaxDeduction {
  id: string
  category: string
  subcategory?: string
  description: string
  expenseAmount: number
  deductionPercentage: number
  deductibleAmount: number
  expenseDate: string
  taxYear: number
  status: string
  isApproved: boolean
  aiSuggested: boolean
  aiConfidence?: number
}

interface UserTaxProfile {
  id: string
  userId: string
  primaryCountry: string
  primaryState?: string
  businessStructure?: string
  taxIdNumber?: string
  fiscalYearEnd?: string
  taxFilingFrequency: string
  autoCalculateTax: boolean
  nexusStates?: string[]
}

/**
 * Hook to get tax summary for current year
 */
export function useTaxSummary(year?: number) {
  const [summary, setSummary] = useState<TaxSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const targetYear = year || new Date().getFullYear()

  const fetchSummary = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/tax/summary?year=${targetYear}`)

      if (!response.ok) {
        throw new Error('Failed to fetch tax summary')
      }

      const data = await response.json()
      setSummary(data.data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [targetYear])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return { summary, isLoading, error, refresh: fetchSummary }
}

/**
 * Hook to get tax insights
 */
export function useTaxInsights() {
  const [insights, setInsights] = useState<TaxInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetch = useCallback(async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('tax_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10)

      setInsights(data || [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const dismissInsight = useCallback(async (insightId: string) => {
    const supabase = createClient()

    await supabase
      .from('tax_insights')
      .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
      .eq('id', insightId)

    // Refresh insights
    fetch()
  }, [fetch])

  const markAsRead = useCallback(async (insightId: string) => {
    const supabase = createClient()

    await supabase
      .from('tax_insights')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', insightId)

    // Update local state
    setInsights(prev => prev.map(insight =>
      insight.id === insightId ? { ...insight, isRead: true } : insight
    ))
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { insights, isLoading, refresh: fetch, dismissInsight, markAsRead }
}

/**
 * Hook to get tax deductions
 */
export function useTaxDeductions(taxYear?: number) {
  const [deductions, setDeductions] = useState<TaxDeduction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalDeductions, setTotalDeductions] = useState(0)

  const year = taxYear || new Date().getFullYear()

  const fetch = useCallback(async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('tax_deductions')
        .select('*')
        .eq('user_id', user.id)
        .eq('tax_year', year)
        .order('expense_date', { ascending: false })

      setDeductions(data || [])

      // Calculate total deductions
      const total = data?.reduce((sum, d) => sum + d.deductible_amount, 0) || 0
      setTotalDeductions(total)
    } finally {
      setIsLoading(false)
    }
  }, [year])

  const approveDeduction = useCallback(async (deductionId: string) => {
    const supabase = createClient()

    await supabase
      .from('tax_deductions')
      .update({ is_approved: true, status: 'approved', approved_at: new Date().toISOString() })
      .eq('id', deductionId)

    // Refresh deductions
    fetch()
  }, [fetch])

  const rejectDeduction = useCallback(async (deductionId: string, reason?: string) => {
    const supabase = createClient()

    await supabase
      .from('tax_deductions')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', deductionId)

    // Refresh deductions
    fetch()
  }, [fetch])

  useEffect(() => {
    fetch()
  }, [fetch])

  return {
    deductions,
    totalDeductions,
    isLoading,
    refresh: fetch,
    approveDeduction,
    rejectDeduction
  }
}

/**
 * Hook to get user tax profile
 */
export function useTaxProfile() {
  const [profile, setProfile] = useState<UserTaxProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetch = useCallback(async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('user_tax_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setProfile(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (updates: Partial<UserTaxProfile>) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('user_tax_profiles')
      .upsert({
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString()
      })

    if (!error) {
      fetch()
    }

    return { error }
  }, [fetch])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { profile, isLoading, refresh: fetch, updateProfile }
}

/**
 * Hook to calculate tax for a transaction
 */
export function useTaxCalculation() {
  const [isCalculating, setIsCalculating] = useState(false)

  const calculateTax = useCallback(async (params: {
    transactionId: string
    transactionType: 'invoice' | 'expense' | 'payment'
    subtotal: number
    destinationCountry: string
    destinationState?: string
    destinationPostalCode?: string
    lineItems?: any[]
  }) => {
    setIsCalculating(true)

    try {
      const response = await fetch('/api/tax/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error('Tax calculation failed')
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Tax calculation error:', error)
      throw error
    } finally {
      setIsCalculating(false)
    }
  }, [])

  return { calculateTax, isCalculating }
}

/**
 * Hook to suggest deductions for an expense
 */
export function useDeductionSuggestion() {
  const [isSuggesting, setIsSuggesting] = useState(false)

  const suggestDeduction = useCallback(async (params: {
    description: string
    amount: number
    category?: string
    merchant?: string
    date?: string
  }) => {
    setIsSuggesting(true)

    try {
      const response = await fetch('/api/tax/deductions/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error('Deduction suggestion failed')
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Deduction suggestion error:', error)
      throw error
    } finally {
      setIsSuggesting(false)
    }
  }, [])

  return { suggestDeduction, isSuggesting }
}

/**
 * Hook to get deduction breakdown by category
 */
export function useDeductionBreakdown(taxYear?: number) {
  const { deductions, isLoading } = useTaxDeductions(taxYear)

  const breakdown = deductions.reduce((acc, deduction) => {
    const category = deduction.category
    if (!acc[category]) {
      acc[category] = {
        category,
        total: 0,
        count: 0,
        items: []
      }
    }
    acc[category].total += deduction.deductibleAmount
    acc[category].count += 1
    acc[category].items.push(deduction)
    return acc
  }, {} as Record<string, { category: string; total: number; count: number; items: TaxDeduction[] }>)

  const categories = Object.values(breakdown).sort((a, b) => b.total - a.total)

  return { categories, isLoading }
}

/**
 * Hook to get tax calculations for a period
 */
export function useTaxCalculations(startDate?: string, endDate?: string) {
  const [calculations, setCalculations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetch = useCallback(async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('tax_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })

      if (startDate) {
        query = query.gte('transaction_date', startDate)
      }
      if (endDate) {
        query = query.lte('transaction_date', endDate)
      }

      const { data } = await query

      setCalculations(data || [])
    } finally {
      setIsLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { calculations, isLoading, refresh: fetch }
}

/**
 * Hook to manage tax filings
 */
export function useTaxFilings(taxYear?: number, status?: string) {
  const [filings, setFilings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchFilings = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (taxYear) params.append('year', taxYear.toString())
      if (status) params.append('status', status)

      const response = await fetch(`/api/tax/filings?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch filings')

      const data = await response.json()
      setFilings(data.data || [])
    } catch (error) {
      console.error('Error fetching filings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [taxYear, status])

  const createFiling = useCallback(async (filingData: any) => {
    try {
      const response = await fetch('/api/tax/filings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filingData)
      })

      if (!response.ok) throw new Error('Failed to create filing')

      const data = await response.json()
      fetchFilings()
      return { data: data.data, error: null }
    } catch (error) {
      console.error('Error creating filing:', error)
      return { data: null, error }
    }
  }, [fetchFilings])

  const updateFiling = useCallback(async (filingId: string, updates: any) => {
    try {
      const response = await fetch(`/api/tax/filings/${filingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error('Failed to update filing')

      fetchFilings()
      return { error: null }
    } catch (error) {
      console.error('Error updating filing:', error)
      return { error }
    }
  }, [fetchFilings])

  const deleteFiling = useCallback(async (filingId: string) => {
    try {
      const response = await fetch(`/api/tax/filings/${filingId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete filing')

      fetchFilings()
      return { error: null }
    } catch (error) {
      console.error('Error deleting filing:', error)
      return { error }
    }
  }, [fetchFilings])

  const markAsComplete = useCallback(async (filingId: string) => {
    return updateFiling(filingId, {
      status: 'filed',
      filed_date: new Date().toISOString()
    })
  }, [updateFiling])

  useEffect(() => {
    fetchFilings()
  }, [fetchFilings])

  return {
    filings,
    isLoading,
    refresh: fetchFilings,
    createFiling,
    updateFiling,
    deleteFiling,
    markAsComplete
  }
}
