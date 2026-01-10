'use client'

/**
 * Extended Invoices Hooks
 * Tables: invoices, invoice_items, invoice_payments, invoice_reminders
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useInvoice(invoiceId?: string) {
  const [invoice, setInvoice] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!invoiceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('invoices').select('*, invoice_items(*)').eq('id', invoiceId).single(); setInvoice(data) } finally { setIsLoading(false) }
  }, [invoiceId])
  useEffect(() => { fetch() }, [fetch])
  return { invoice, isLoading, refresh: fetch }
}

export function useInvoices(options?: { user_id?: string; client_id?: string; status?: string; limit?: number }) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('invoices').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.client_id) query = query.eq('client_id', options.client_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setInvoices(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.client_id, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { invoices, isLoading, refresh: fetch }
}

export function useInvoiceItems(invoiceId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!invoiceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId).order('created_at', { ascending: true }); setItems(data || []) } finally { setIsLoading(false) }
  }, [invoiceId])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useInvoicePayments(invoiceId?: string) {
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!invoiceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('invoice_payments').select('*').eq('invoice_id', invoiceId).order('paid_at', { ascending: false }); setPayments(data || []) } finally { setIsLoading(false) }
  }, [invoiceId])
  useEffect(() => { fetch() }, [fetch])
  return { payments, isLoading, refresh: fetch }
}

export function useOverdueInvoices(userId?: string) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('invoices').select('*').eq('user_id', userId).eq('status', 'sent').lt('due_date', new Date().toISOString()).order('due_date', { ascending: true }); setInvoices(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { invoices, isLoading, refresh: fetch }
}

export function usePendingInvoices(userId?: string) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('invoices').select('*').eq('user_id', userId).in('status', ['draft', 'sent']).order('due_date', { ascending: true }); setInvoices(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { invoices, isLoading, refresh: fetch }
}

export function useInvoiceStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; paid: number; pending: number; overdue: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('invoices').select('status, total').eq('user_id', userId); if (!data) { setStats(null); return }; const total = data.reduce((sum, inv) => sum + (inv.total || 0), 0); const paid = data.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0); const pending = data.filter(inv => ['draft', 'sent'].includes(inv.status)).reduce((sum, inv) => sum + (inv.total || 0), 0); const overdue = 0; setStats({ total, paid, pending, overdue }); } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
