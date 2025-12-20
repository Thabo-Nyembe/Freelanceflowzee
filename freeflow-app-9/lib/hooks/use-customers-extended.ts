'use client'

/**
 * Extended Customers Hooks
 * Tables: customers, customer_segments, customer_notes, customer_interactions, customer_tags
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCustomer(customerId?: string) {
  const [customer, setCustomer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!customerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('customers').select('*, customer_notes(*), customer_tags(*)').eq('id', customerId).single(); setCustomer(data) } finally { setIsLoading(false) }
  }, [customerId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { customer, isLoading, refresh: fetch }
}

export function useCustomers(options?: { segment_id?: string; status?: string; source?: string; search?: string; limit?: number }) {
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('customers').select('*')
      if (options?.segment_id) query = query.eq('segment_id', options.segment_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.source) query = query.eq('source', options.source)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setCustomers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.segment_id, options?.status, options?.source, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { customers, isLoading, refresh: fetch }
}

export function useCustomerSegments(options?: { is_active?: boolean }) {
  const [segments, setSegments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('customer_segments').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setSegments(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { segments, isLoading, refresh: fetch }
}

export function useCustomerNotes(customerId?: string) {
  const [notes, setNotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!customerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('customer_notes').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }); setNotes(data || []) } finally { setIsLoading(false) }
  }, [customerId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { notes, isLoading, refresh: fetch }
}

export function useCustomerInteractions(customerId?: string, options?: { type?: string; limit?: number }) {
  const [interactions, setInteractions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!customerId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('customer_interactions').select('*').eq('customer_id', customerId)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 50)
      setInteractions(data || [])
    } finally { setIsLoading(false) }
  }, [customerId, options?.type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { interactions, isLoading, refresh: fetch }
}

export function useCustomerTags(customerId?: string) {
  const [tags, setTags] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!customerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('customer_tags').select('*').eq('customer_id', customerId); setTags(data || []) } finally { setIsLoading(false) }
  }, [customerId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tags, isLoading, refresh: fetch }
}

export function useCustomerStats() {
  const [stats, setStats] = useState<{ total: number; active: number; bySegment: Record<string, number>; bySource: Record<string, number>; avgLifetimeValue: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('customers').select('status, segment_id, source, lifetime_value')
      if (!data) { setStats(null); return }
      const total = data.length
      const active = data.filter(c => c.status === 'active').length
      const bySegment = data.reduce((acc: Record<string, number>, c) => { const key = c.segment_id || 'unsegmented'; acc[key] = (acc[key] || 0) + 1; return acc }, {})
      const bySource = data.reduce((acc: Record<string, number>, c) => { if (c.source) acc[c.source] = (acc[c.source] || 0) + 1; return acc }, {})
      const avgLifetimeValue = total > 0 ? data.reduce((sum, c) => sum + (c.lifetime_value || 0), 0) / total : 0
      setStats({ total, active, bySegment, bySource, avgLifetimeValue })
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useRecentCustomers(limit?: number) {
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false }).limit(limit || 10); setCustomers(data || []) } finally { setIsLoading(false) }
  }, [limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { customers, isLoading, refresh: fetch }
}

export function useTopCustomers(limit?: number) {
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('customers').select('*').order('lifetime_value', { ascending: false }).limit(limit || 10); setCustomers(data || []) } finally { setIsLoading(false) }
  }, [limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { customers, isLoading, refresh: fetch }
}
