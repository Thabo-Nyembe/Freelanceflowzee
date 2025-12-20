'use client'

/**
 * Extended Receipts Hooks
 * Tables: receipts, receipt_items, receipt_templates, receipt_settings, receipt_history
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useReceipt(receiptId?: string) {
  const [receipt, setReceipt] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!receiptId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('receipts').select('*, receipt_items(*), transactions(*), users(*)').eq('id', receiptId).single(); setReceipt(data) } finally { setIsLoading(false) }
  }, [receiptId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { receipt, isLoading, refresh: fetch }
}

export function useReceipts(options?: { customer_id?: string; organization_id?: string; status?: string; payment_method?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  const [receipts, setReceipts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('receipts').select('*, receipt_items(count), users(*)')
      if (options?.customer_id) query = query.eq('customer_id', options.customer_id)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.payment_method) query = query.eq('payment_method', options.payment_method)
      if (options?.from_date) query = query.gte('issued_at', options.from_date)
      if (options?.to_date) query = query.lte('issued_at', options.to_date)
      if (options?.search) query = query.ilike('receipt_number', `%${options.search}%`)
      const { data } = await query.order('issued_at', { ascending: false }).limit(options?.limit || 50)
      setReceipts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.customer_id, options?.organization_id, options?.status, options?.payment_method, options?.from_date, options?.to_date, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { receipts, isLoading, refresh: fetch }
}

export function useReceiptItems(receiptId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!receiptId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('receipt_items').select('*').eq('receipt_id', receiptId).order('order', { ascending: true }); setItems(data || []) } finally { setIsLoading(false) }
  }, [receiptId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useCustomerReceipts(customerId?: string, options?: { status?: string; limit?: number }) {
  const [receipts, setReceipts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!customerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('receipts').select('*, receipt_items(count)').eq('customer_id', customerId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('issued_at', { ascending: false }).limit(options?.limit || 50)
      setReceipts(data || [])
    } finally { setIsLoading(false) }
  }, [customerId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { receipts, isLoading, refresh: fetch }
}

export function useReceiptByNumber(receiptNumber?: string) {
  const [receipt, setReceipt] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!receiptNumber) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('receipts').select('*, receipt_items(*), users(*)').eq('receipt_number', receiptNumber).single(); setReceipt(data) } finally { setIsLoading(false) }
  }, [receiptNumber, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { receipt, isLoading, refresh: fetch }
}

export function useReceiptStats(options?: { organization_id?: string; from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ total: number; issued: number; voided: number; totalAmount: number; byPaymentMethod: { [key: string]: number } } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('receipts').select('status, total, payment_method')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.from_date) query = query.gte('issued_at', options.from_date)
      if (options?.to_date) query = query.lte('issued_at', options.to_date)
      const { data } = await query
      const receipts = data || []
      const total = receipts.length
      const issued = receipts.filter(r => r.status === 'issued').length
      const voided = receipts.filter(r => r.status === 'voided').length
      const totalAmount = receipts.filter(r => r.status === 'issued').reduce((sum, r) => sum + (r.total || 0), 0)
      const byPaymentMethod: { [key: string]: number } = {}
      receipts.filter(r => r.status === 'issued').forEach(r => {
        const method = r.payment_method || 'other'
        byPaymentMethod[method] = (byPaymentMethod[method] || 0) + 1
      })
      setStats({ total, issued, voided, totalAmount, byPaymentMethod })
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useRecentReceipts(options?: { organization_id?: string; limit?: number }) {
  const [receipts, setReceipts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('receipts').select('*, users(*)')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      const { data } = await query.order('issued_at', { ascending: false }).limit(options?.limit || 20)
      setReceipts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { receipts, isLoading, refresh: fetch }
}

export function useReceiptTemplates(options?: { organization_id?: string; category?: string }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('receipt_templates').select('*')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.category, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}

export function useReceiptHistory(receiptId?: string) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!receiptId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('receipt_history').select('*, users(*)').eq('receipt_id', receiptId).order('created_at', { ascending: false }); setHistory(data || []) } finally { setIsLoading(false) }
  }, [receiptId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}
