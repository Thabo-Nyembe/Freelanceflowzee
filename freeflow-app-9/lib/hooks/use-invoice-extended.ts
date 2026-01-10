'use client'

/**
 * Extended Invoice Hooks - Covers all 12 Invoice-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useInvoiceActivityLog(invoiceId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!invoiceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('invoice_activity_log').select('*').eq('invoice_id', invoiceId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [invoiceId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useInvoiceAgingBuckets(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('invoice_aging_buckets').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useInvoiceAnalyticsDaily(userId?: string, days?: number) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('invoice_analytics_daily').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(days || 30); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, days])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useInvoiceClients(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('invoice_clients').select('*').eq('user_id', userId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useInvoiceEvents(invoiceId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!invoiceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('invoice_events').select('*').eq('invoice_id', invoiceId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [invoiceId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useInvoiceItems(invoiceId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!invoiceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId); setData(result || []) } finally { setIsLoading(false) }
  }, [invoiceId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useInvoiceLineItems(invoiceId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!invoiceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('invoice_line_items').select('*').eq('invoice_id', invoiceId).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [invoiceId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useInvoicePaymentLinks(invoiceId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!invoiceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('invoice_payment_links').select('*').eq('invoice_id', invoiceId).eq('is_active', true); setData(result || []) } finally { setIsLoading(false) }
  }, [invoiceId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useInvoicePayments(invoiceId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!invoiceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('invoice_payments').select('*').eq('invoice_id', invoiceId).order('paid_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [invoiceId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useInvoiceReminders(invoiceId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!invoiceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('invoice_reminders').select('*').eq('invoice_id', invoiceId).order('scheduled_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [invoiceId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useInvoiceTemplates(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('invoice_templates').select('*').eq('user_id', userId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useRecurringInvoices(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('recurring_invoices').select('*').eq('user_id', userId).eq('is_active', true).order('next_date', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
