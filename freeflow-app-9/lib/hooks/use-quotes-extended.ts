'use client'

/**
 * Extended Quotes Hooks
 * Tables: quotes, quote_items, quote_versions, quote_comments, quote_templates, quote_analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useQuote(quoteId?: string) {
  const [quote, setQuote] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!quoteId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('quotes').select('*, quote_items(*), quote_versions(*), quote_comments(*), clients(*), users(*)').eq('id', quoteId).single(); setQuote(data) } finally { setIsLoading(false) }
  }, [quoteId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { quote, isLoading, refresh: fetch }
}

export function useQuotes(options?: { author_id?: string; client_id?: string; organization_id?: string; status?: string; search?: string; limit?: number }) {
  const [quotes, setQuotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('quotes').select('*, clients(*), quote_items(count)')
      if (options?.author_id) query = query.eq('author_id', options.author_id)
      if (options?.client_id) query = query.eq('client_id', options.client_id)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.search) query = query.or(`quote_number.ilike.%${options.search}%,title.ilike.%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setQuotes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.author_id, options?.client_id, options?.organization_id, options?.status, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { quotes, isLoading, refresh: fetch }
}

export function useQuoteItems(quoteId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!quoteId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('quote_items').select('*').eq('quote_id', quoteId).order('order', { ascending: true }); setItems(data || []) } finally { setIsLoading(false) }
  }, [quoteId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useQuoteVersions(quoteId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!quoteId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('quote_versions').select('*, users(*)').eq('quote_id', quoteId).order('version', { ascending: false }); setVersions(data || []) } finally { setIsLoading(false) }
  }, [quoteId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { versions, isLoading, refresh: fetch }
}

export function useQuoteComments(quoteId?: string, options?: { is_internal?: boolean }) {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!quoteId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('quote_comments').select('*, users(*)').eq('quote_id', quoteId)
      if (options?.is_internal !== undefined) query = query.eq('is_internal', options.is_internal)
      const { data } = await query.order('created_at', { ascending: true })
      setComments(data || [])
    } finally { setIsLoading(false) }
  }, [quoteId, options?.is_internal, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { comments, isLoading, refresh: fetch }
}

export function useMyQuotes(userId?: string, options?: { status?: string; limit?: number }) {
  const [quotes, setQuotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('quotes').select('*, clients(*), quote_items(count)').eq('author_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setQuotes(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { quotes, isLoading, refresh: fetch }
}

export function useClientQuotes(clientId?: string, options?: { status?: string; limit?: number }) {
  const [quotes, setQuotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!clientId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('quotes').select('*, users(*), quote_items(count)').eq('client_id', clientId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setQuotes(data || [])
    } finally { setIsLoading(false) }
  }, [clientId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { quotes, isLoading, refresh: fetch }
}

export function usePendingQuotes(options?: { author_id?: string; organization_id?: string; limit?: number }) {
  const [quotes, setQuotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('quotes').select('*, clients(*), quote_items(count)').eq('status', 'sent')
      if (options?.author_id) query = query.eq('author_id', options.author_id)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      const { data } = await query.order('sent_at', { ascending: false }).limit(options?.limit || 50)
      setQuotes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.author_id, options?.organization_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { quotes, isLoading, refresh: fetch }
}

export function useExpiringQuotes(options?: { days?: number; author_id?: string; limit?: number }) {
  const [quotes, setQuotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const now = new Date()
      const futureDate = new Date(now.getTime() + (options?.days || 7) * 24 * 60 * 60 * 1000)
      let query = supabase.from('quotes').select('*, clients(*)').eq('status', 'sent').gte('valid_until', now.toISOString()).lte('valid_until', futureDate.toISOString())
      if (options?.author_id) query = query.eq('author_id', options.author_id)
      const { data } = await query.order('valid_until', { ascending: true }).limit(options?.limit || 20)
      setQuotes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.days, options?.author_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { quotes, isLoading, refresh: fetch }
}

export function useQuoteStats(options?: { author_id?: string; organization_id?: string; from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ total: number; draft: number; sent: number; accepted: number; declined: number; expired: number; totalValue: number; acceptedValue: number; conversionRate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('quotes').select('status, total, valid_until')
      if (options?.author_id) query = query.eq('author_id', options.author_id)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query
      const quotes = data || []
      const now = new Date()
      const total = quotes.length
      const draft = quotes.filter(q => q.status === 'draft').length
      const sent = quotes.filter(q => q.status === 'sent').length
      const accepted = quotes.filter(q => q.status === 'accepted').length
      const declined = quotes.filter(q => q.status === 'declined').length
      const expired = quotes.filter(q => q.status === 'sent' && q.valid_until && new Date(q.valid_until) < now).length
      const totalValue = quotes.reduce((sum, q) => sum + (q.total || 0), 0)
      const acceptedValue = quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + (q.total || 0), 0)
      const sentOrResponded = sent + accepted + declined
      const conversionRate = sentOrResponded > 0 ? Math.round((accepted / sentOrResponded) * 100) : 0
      setStats({ total, draft, sent, accepted, declined, expired, totalValue, acceptedValue, conversionRate })
    } finally { setIsLoading(false) }
  }, [options?.author_id, options?.organization_id, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useQuoteTemplates(options?: { category?: string; search?: string; limit?: number }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('quote_templates').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('usage_count', { ascending: false }).limit(options?.limit || 50)
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { templates, isLoading, refresh: fetch }
}
