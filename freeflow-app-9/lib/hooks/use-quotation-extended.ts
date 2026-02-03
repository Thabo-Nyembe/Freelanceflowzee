'use client'

/**
 * Extended Quotation Hooks
 * Tables: quotations, quotation_items, quotation_terms, quotation_revisions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useQuotation(quotationId?: string) {
  const [quotation, setQuotation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!quotationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('quotations').select('*, quotation_items(*)').eq('id', quotationId).single(); setQuotation(data) } finally { setIsLoading(false) }
  }, [quotationId])
  useEffect(() => { loadData() }, [loadData])
  return { quotation, isLoading, refresh: loadData }
}

export function useQuotations(options?: { user_id?: string; client_id?: string; status?: string; limit?: number }) {
  const [quotations, setQuotations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('quotations').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.client_id) query = query.eq('client_id', options.client_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setQuotations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.client_id, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { quotations, isLoading, refresh: loadData }
}

export function useQuotationItems(quotationId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!quotationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('quotation_items').select('*').eq('quotation_id', quotationId).order('created_at', { ascending: true }); setItems(data || []) } finally { setIsLoading(false) }
  }, [quotationId])
  useEffect(() => { loadData() }, [loadData])
  return { items, isLoading, refresh: loadData }
}

export function usePendingQuotations(userId?: string) {
  const [quotations, setQuotations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('quotations').select('*').eq('user_id', userId).in('status', ['draft', 'sent']).order('valid_until', { ascending: true }); setQuotations(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { quotations, isLoading, refresh: loadData }
}

export function useExpiringQuotations(userId?: string, daysUntilExpiry?: number) {
  const [quotations, setQuotations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const futureDate = new Date(); futureDate.setDate(futureDate.getDate() + (daysUntilExpiry || 7)); const { data } = await supabase.from('quotations').select('*').eq('user_id', userId).eq('status', 'sent').lte('valid_until', futureDate.toISOString()).gte('valid_until', new Date().toISOString()).order('valid_until', { ascending: true }); setQuotations(data || []) } finally { setIsLoading(false) }
  }, [userId, daysUntilExpiry])
  useEffect(() => { loadData() }, [loadData])
  return { quotations, isLoading, refresh: loadData }
}
