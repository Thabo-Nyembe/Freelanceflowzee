'use client'

/**
 * Extended Payroll Hooks
 * Tables: payroll, payroll_runs, payroll_items, payroll_deductions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePayrollRun(runId?: string) {
  const [run, setRun] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!runId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('payroll_runs').select('*, payroll_items(*)').eq('id', runId).single(); setRun(data) } finally { setIsLoading(false) }
  }, [runId])
  useEffect(() => { fetch() }, [fetch])
  return { run, isLoading, refresh: fetch }
}

export function usePayrollRuns(options?: { user_id?: string; status?: string; limit?: number }) {
  const [runs, setRuns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
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
  useEffect(() => { fetch() }, [fetch])
  return { runs, isLoading, refresh: fetch }
}

export function usePayrollItems(runId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!runId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('payroll_items').select('*').eq('run_id', runId).order('employee_name', { ascending: true }); setItems(data || []) } finally { setIsLoading(false) }
  }, [runId])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function usePayrollDeductions(itemId?: string) {
  const [deductions, setDeductions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!itemId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('payroll_deductions').select('*').eq('item_id', itemId).order('type', { ascending: true }); setDeductions(data || []) } finally { setIsLoading(false) }
  }, [itemId])
  useEffect(() => { fetch() }, [fetch])
  return { deductions, isLoading, refresh: fetch }
}

export function useEmployeePayrollHistory(employeeId?: string, options?: { limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!employeeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('payroll_items').select('*, payroll_runs(*)').eq('employee_id', employeeId).order('created_at', { ascending: false }).limit(options?.limit || 24); setHistory(data || []) } finally { setIsLoading(false) }
  }, [employeeId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function usePendingPayrollRuns(userId?: string) {
  const [runs, setRuns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('payroll_runs').select('*').eq('user_id', userId).in('status', ['draft', 'processing']).order('pay_date', { ascending: true }); setRuns(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { runs, isLoading, refresh: fetch }
}

export function usePayrollStats(userId?: string, year?: number) {
  const [stats, setStats] = useState<{ total_paid: number; total_runs: number; avg_per_run: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('payroll_runs').select('*').eq('user_id', userId).eq('status', 'completed'); if (!data) { setStats(null); return }; const items = await supabase.from('payroll_items').select('net_pay').in('run_id', data.map(r => r.id)); const total_paid = (items.data || []).reduce((sum, i) => sum + (i.net_pay || 0), 0); setStats({ total_paid, total_runs: data.length, avg_per_run: data.length > 0 ? total_paid / data.length : 0 }); } finally { setIsLoading(false) }
  }, [userId, year])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
