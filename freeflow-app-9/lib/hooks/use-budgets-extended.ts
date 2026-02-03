'use client'

/**
 * Extended Budgets Hooks
 * Tables: budgets, budget_categories, budget_items, budget_allocations
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBudget(budgetId?: string) {
  const [budget, setBudget] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!budgetId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('budgets').select('*, budget_items(*), budget_allocations(*)').eq('id', budgetId).single(); setBudget(data) } finally { setIsLoading(false) }
  }, [budgetId])
  useEffect(() => { loadData() }, [loadData])
  return { budget, isLoading, refresh: loadData }
}

export function useBudgets(options?: { user_id?: string; status?: string; period?: string; limit?: number }) {
  const [budgets, setBudgets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('budgets').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.period) query = query.eq('period', options.period)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setBudgets(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.period, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { budgets, isLoading, refresh: loadData }
}

export function useBudgetItems(budgetId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!budgetId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('budget_items').select('*').eq('budget_id', budgetId).order('created_at', { ascending: false }); setItems(data || []) } finally { setIsLoading(false) }
  }, [budgetId])
  useEffect(() => { loadData() }, [loadData])
  return { items, isLoading, refresh: loadData }
}

export function useBudgetCategories(userId?: string) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('budget_categories').select('*')
      if (userId) query = query.eq('user_id', userId)
      const { data } = await query.order('name', { ascending: true })
      setCategories(data || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { categories, isLoading, refresh: loadData }
}

export function useBudgetSummary(userId?: string) {
  const [summary, setSummary] = useState<{ totalBudget: number; totalSpent: number; totalRemaining: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('budgets').select('total_amount, spent_amount, remaining_amount').eq('user_id', userId).eq('status', 'active')
      if (!data) { setSummary(null); return }
      const totalBudget = data.reduce((sum, b) => sum + (b.total_amount || 0), 0)
      const totalSpent = data.reduce((sum, b) => sum + (b.spent_amount || 0), 0)
      const totalRemaining = data.reduce((sum, b) => sum + (b.remaining_amount || 0), 0)
      setSummary({ totalBudget, totalSpent, totalRemaining })
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { summary, isLoading, refresh: loadData }
}

export function useActiveBudgets(userId?: string) {
  const [budgets, setBudgets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('budgets').select('*').eq('user_id', userId).eq('status', 'active').order('end_date', { ascending: true }); setBudgets(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { budgets, isLoading, refresh: loadData }
}
