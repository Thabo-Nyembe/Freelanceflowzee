'use client'

/**
 * Extended Payroll Hooks
 * Tables: payroll, payroll_runs, payroll_items, payroll_deductions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

export function usePayrollRun(runId?: string) {
  const [run, setRun] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!runId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('payroll_runs').select('*, payroll_items(*)').eq('id', runId).single(); setRun(data) } finally { setIsLoading(false) }
  }, [runId])
  useEffect(() => { loadData() }, [loadData])
  return { run, isLoading, refresh: loadData }
}

export function usePayrollRuns(options?: { user_id?: string; status?: string; limit?: number }) {
  const [runs, setRuns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('payroll_runs').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('pay_date', { ascending: false }).limit(options?.limit || 50)
      setRuns(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { runs, isLoading, refresh: loadData }
}

export function usePayrollItems(runId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!runId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('payroll_items').select('*').eq('run_id', runId).order('employee_name', { ascending: true }); setItems(data || []) } finally { setIsLoading(false) }
  }, [runId])
  useEffect(() => { loadData() }, [loadData])
  return { items, isLoading, refresh: loadData }
}

export function usePayrollDeductions(itemId?: string) {
  const [deductions, setDeductions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!itemId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('payroll_deductions').select('*').eq('item_id', itemId).order('type', { ascending: true }); setDeductions(data || []) } finally { setIsLoading(false) }
  }, [itemId])
  useEffect(() => { loadData() }, [loadData])
  return { deductions, isLoading, refresh: loadData }
}

export function useEmployeePayrollHistory(employeeId?: string, options?: { limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!employeeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('payroll_items').select('*, payroll_runs(*)').eq('employee_id', employeeId).order('created_at', { ascending: false }).limit(options?.limit || 24); setHistory(data || []) } finally { setIsLoading(false) }
  }, [employeeId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { history, isLoading, refresh: loadData }
}

export function usePendingPayrollRuns(userId?: string) {
  const [runs, setRuns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('payroll_runs').select('*').eq('user_id', userId).in('status', ['draft', 'processing']).order('pay_date', { ascending: true }); setRuns(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { runs, isLoading, refresh: loadData }
}

export function usePayrollStats(userId?: string, year?: number) {
  const [stats, setStats] = useState<{ total_paid: number; total_runs: number; avg_per_run: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('payroll_runs').select('*').eq('user_id', userId).eq('status', 'completed'); if (!data) { setStats(null); return }; const items = await supabase.from('payroll_items').select('net_pay').in('run_id', data.map(r => r.id)); const total_paid = (items.data || []).reduce((sum, i) => sum + (i.net_pay || 0), 0); setStats({ total_paid, total_runs: data.length, avg_per_run: data.length > 0 ? total_paid / data.length : 0 }); } finally { setIsLoading(false) }
  }, [userId, year])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}
