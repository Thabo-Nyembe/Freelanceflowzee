'use client'

/**
 * Extended Budget Hooks - Covers all Budget-related tables
 * Tables: budgets
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBudget(budgetId?: string) {
  const [budget, setBudget] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!budgetId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('budgets').select('*').eq('id', budgetId).single()
      setBudget(data)
    } finally { setIsLoading(false) }
  }, [budgetId])
  useEffect(() => { fetch() }, [fetch])
  return { budget, isLoading, refresh: fetch }
}

export function useBudgets(options?: { userId?: string; organizationId?: string; projectId?: string; isActive?: boolean; category?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('budgets').select('*')
      if (options?.userId) query = query.eq('user_id', options.userId)
      if (options?.organizationId) query = query.eq('organization_id', options.organizationId)
      if (options?.projectId) query = query.eq('project_id', options.projectId)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      if (options?.category) query = query.eq('category', options.category)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.userId, options?.organizationId, options?.projectId, options?.isActive, options?.category])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBudgetStatus(budgetId?: string) {
  const [status, setStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!budgetId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: budget } = await supabase.from('budgets').select('*').eq('id', budgetId).single()
      if (!budget) { setStatus(null); return }
      const percentUsed = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
      const remaining = budget.amount - budget.spent
      setStatus({
        ...budget,
        percentUsed: Math.round(percentUsed * 100) / 100,
        remaining,
        isOverBudget: budget.spent > budget.amount,
        status: percentUsed >= 100 ? 'exceeded' : percentUsed >= 80 ? 'warning' : 'healthy'
      })
    } finally { setIsLoading(false) }
  }, [budgetId])
  useEffect(() => { fetch() }, [fetch])
  return { status, isLoading, refresh: fetch }
}

export function useBudgetsByCategory(options?: { userId?: string; organizationId?: string }) {
  const [data, setData] = useState<Record<string, { total: number; spent: number; count: number }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('budgets').select('category, amount, spent')
      if (options?.userId) query = query.eq('user_id', options.userId)
      if (options?.organizationId) query = query.eq('organization_id', options.organizationId)
      const { data: budgets } = await query.eq('is_active', true)
      const byCategory: Record<string, { total: number; spent: number; count: number }> = {}
      budgets?.forEach(b => {
        const cat = b.category || 'Uncategorized'
        if (!byCategory[cat]) byCategory[cat] = { total: 0, spent: 0, count: 0 }
        byCategory[cat].total += b.amount
        byCategory[cat].spent += b.spent || 0
        byCategory[cat].count++
      })
      setData(byCategory)
    } finally { setIsLoading(false) }
  }, [options?.userId, options?.organizationId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBudgetSummary(options?: { userId?: string; organizationId?: string }) {
  const [summary, setSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('budgets').select('amount, spent, is_active')
      if (options?.userId) query = query.eq('user_id', options.userId)
      if (options?.organizationId) query = query.eq('organization_id', options.organizationId)
      const { data } = await query
      const active = data?.filter(b => b.is_active) || []
      const totalBudget = active.reduce((sum, b) => sum + b.amount, 0)
      const totalSpent = active.reduce((sum, b) => sum + (b.spent || 0), 0)
      const overBudget = active.filter(b => (b.spent || 0) > b.amount).length
      setSummary({
        totalBudgets: data?.length || 0,
        activeBudgets: active.length,
        totalBudget,
        totalSpent,
        remaining: totalBudget - totalSpent,
        percentUsed: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
        overBudgetCount: overBudget
      })
    } finally { setIsLoading(false) }
  }, [options?.userId, options?.organizationId])
  useEffect(() => { fetch() }, [fetch])
  return { summary, isLoading, refresh: fetch }
}

export function useActiveBudgets(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('budgets').select('*').eq('user_id', userId).eq('is_active', true).order('amount', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBudgetAlerts(userId?: string, threshold: number = 80) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: budgets } = await supabase.from('budgets').select('*').eq('user_id', userId).eq('is_active', true)
      const alertList = (budgets || []).filter(b => {
        const percentUsed = b.amount > 0 ? ((b.spent || 0) / b.amount) * 100 : 0
        return percentUsed >= threshold
      }).map(b => ({
        ...b,
        percentUsed: Math.round(((b.spent || 0) / b.amount) * 100),
        severity: ((b.spent || 0) / b.amount) >= 1 ? 'critical' : 'warning'
      }))
      setAlerts(alertList)
    } finally { setIsLoading(false) }
  }, [userId, threshold])
  useEffect(() => { fetch() }, [fetch])
  return { alerts, isLoading, refresh: fetch }
}

export function useBudgetRealtime(budgetId?: string) {
  const [budget, setBudget] = useState<any>(null)
  const supabase = createClient()
  useEffect(() => {
    if (!budgetId) return
    supabase.from('budgets').select('*').eq('id', budgetId).single().then(({ data }) => setBudget(data))
    const channel = supabase.channel(`budget_${budgetId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'budgets', filter: `id=eq.${budgetId}` }, (payload) => setBudget(payload.new))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [budgetId])
  return { budget }
}
