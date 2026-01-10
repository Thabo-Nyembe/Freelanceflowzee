'use client'

/**
 * Extended Recurring Hooks
 * Tables: recurring_payments, recurring_invoices, recurring_tasks, recurring_schedules
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRecurringPayment(paymentId?: string) {
  const [payment, setPayment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!paymentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('recurring_payments').select('*').eq('id', paymentId).single(); setPayment(data) } finally { setIsLoading(false) }
  }, [paymentId])
  useEffect(() => { fetch() }, [fetch])
  return { payment, isLoading, refresh: fetch }
}

export function useRecurringPayments(options?: { user_id?: string; status?: string; frequency?: string; limit?: number }) {
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('recurring_payments').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.frequency) query = query.eq('frequency', options.frequency)
      const { data } = await query.order('next_date', { ascending: true }).limit(options?.limit || 50)
      setPayments(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.frequency, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { payments, isLoading, refresh: fetch }
}

export function useRecurringInvoices(options?: { user_id?: string; client_id?: string; status?: string; limit?: number }) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('recurring_invoices').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.client_id) query = query.eq('client_id', options.client_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('next_invoice_date', { ascending: true }).limit(options?.limit || 50)
      setInvoices(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.client_id, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { invoices, isLoading, refresh: fetch }
}

export function useRecurringTasks(options?: { user_id?: string; project_id?: string; is_active?: boolean; limit?: number }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('recurring_tasks').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('next_run', { ascending: true }).limit(options?.limit || 50)
      setTasks(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.project_id, options?.is_active, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tasks, isLoading, refresh: fetch }
}

export function useRecurringSchedules(options?: { type?: string; is_active?: boolean }) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('recurring_schedules').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setSchedules(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { schedules, isLoading, refresh: fetch }
}
