'use client'

/**
 * Extended Expenses Hooks
 * Tables: expenses, expense_categories, expense_reports, expense_receipts, expense_policies
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useExpense(expenseId?: string) {
  const [expense, setExpense] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!expenseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('expenses').select('*, expense_categories(*), expense_receipts(*)').eq('id', expenseId).single(); setExpense(data) } finally { setIsLoading(false) }
  }, [expenseId])
  useEffect(() => { fetch() }, [fetch])
  return { expense, isLoading, refresh: fetch }
}

export function useExpenses(options?: { user_id?: string; category_id?: string; status?: string; date_from?: string; date_to?: string; is_billable?: boolean; limit?: number }) {
  const [expenses, setExpenses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('expenses').select('*, expense_categories(*)')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.date_from) query = query.gte('date', options.date_from)
      if (options?.date_to) query = query.lte('date', options.date_to)
      if (options?.is_billable !== undefined) query = query.eq('is_billable', options.is_billable)
      const { data } = await query.order('date', { ascending: false }).limit(options?.limit || 50)
      setExpenses(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.category_id, options?.status, options?.date_from, options?.date_to, options?.is_billable, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { expenses, isLoading, refresh: fetch }
}

export function useExpenseCategories(options?: { is_active?: boolean }) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('expense_categories').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setCategories(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useExpenseReceipts(expenseId?: string) {
  const [receipts, setReceipts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!expenseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('expense_receipts').select('*').eq('expense_id', expenseId).order('uploaded_at', { ascending: false }); setReceipts(data || []) } finally { setIsLoading(false) }
  }, [expenseId])
  useEffect(() => { fetch() }, [fetch])
  return { receipts, isLoading, refresh: fetch }
}

export function useExpenseReports(userId?: string, options?: { status?: string; limit?: number }) {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('expense_reports').select('*').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setReports(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { reports, isLoading, refresh: fetch }
}

export function usePendingExpenses(userId?: string) {
  const [expenses, setExpenses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('expenses').select('*, expense_categories(*)').eq('user_id', userId).eq('status', 'pending').order('date', { ascending: false }); setExpenses(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { expenses, isLoading, refresh: fetch }
}

export function useExpenseStats(userId?: string, options?: { date_from?: string; date_to?: string }) {
  const [stats, setStats] = useState<{ total: number; approved: number; pending: number; rejected: number; byCategory: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('expenses').select('amount, status, category_id').eq('user_id', userId)
      if (options?.date_from) query = query.gte('date', options.date_from)
      if (options?.date_to) query = query.lte('date', options.date_to)
      const { data } = await query
      if (!data) { setStats(null); return }
      const total = data.reduce((sum, e) => sum + (e.amount || 0), 0)
      const approved = data.filter(e => e.status === 'approved').reduce((sum, e) => sum + (e.amount || 0), 0)
      const pending = data.filter(e => e.status === 'pending').reduce((sum, e) => sum + (e.amount || 0), 0)
      const rejected = data.filter(e => e.status === 'rejected').reduce((sum, e) => sum + (e.amount || 0), 0)
      const byCategory = data.reduce((acc: Record<string, number>, e) => { const key = e.category_id || 'uncategorized'; acc[key] = (acc[key] || 0) + (e.amount || 0); return acc }, {})
      setStats({ total, approved, pending, rejected, byCategory })
    } finally { setIsLoading(false) }
  }, [userId, options?.date_from, options?.date_to])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useBillableExpenses(projectId?: string) {
  const [expenses, setExpenses] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('expenses').select('*').eq('project_id', projectId).eq('is_billable', true).eq('status', 'approved').order('date', { ascending: false })
      setExpenses(data || [])
      setTotal(data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0)
    } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { fetch() }, [fetch])
  return { expenses, total, isLoading, refresh: fetch }
}

export function useExpensePolicies(options?: { is_active?: boolean }) {
  const [policies, setPolicies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('expense_policies').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setPolicies(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { policies, isLoading, refresh: fetch }
}
