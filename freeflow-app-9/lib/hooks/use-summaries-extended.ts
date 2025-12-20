'use client'

/**
 * Extended Summaries Hooks
 * Tables: summaries, summary_sections, summary_metrics, summary_schedules, summary_recipients, summary_history
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSummary(summaryId?: string) {
  const [summary, setSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!summaryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('summaries').select('*, summary_sections(*), summary_metrics(*), summary_recipients(*)').eq('id', summaryId).single(); setSummary(data) } finally { setIsLoading(false) }
  }, [summaryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { summary, isLoading, refresh: fetch }
}

export function useSummaries(options?: { summary_type?: string; entity_type?: string; entity_id?: string; period?: string; status?: string; created_by?: string; is_public?: boolean; search?: string; limit?: number }) {
  const [summaries, setSummaries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('summaries').select('*, summary_sections(count), users(*)')
      if (options?.summary_type) query = query.eq('summary_type', options.summary_type)
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.entity_id) query = query.eq('entity_id', options.entity_id)
      if (options?.period) query = query.eq('period', options.period)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setSummaries(data || [])
    } finally { setIsLoading(false) }
  }, [options?.summary_type, options?.entity_type, options?.entity_id, options?.period, options?.status, options?.created_by, options?.is_public, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { summaries, isLoading, refresh: fetch }
}

export function useSummarySections(summaryId?: string) {
  const [sections, setSections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!summaryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('summary_sections').select('*').eq('summary_id', summaryId).order('order_index', { ascending: true }); setSections(data || []) } finally { setIsLoading(false) }
  }, [summaryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { sections, isLoading, refresh: fetch }
}

export function useSummaryMetrics(summaryId?: string) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!summaryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('summary_metrics').select('*').eq('summary_id', summaryId).order('metric_name', { ascending: true }); setMetrics(data || []) } finally { setIsLoading(false) }
  }, [summaryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { metrics, isLoading, refresh: fetch }
}

export function useSummarySchedules(options?: { summary_type?: string; is_active?: boolean }) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('summary_schedules').select('*, summary_recipients(count)')
      if (options?.summary_type) query = query.eq('summary_type', options.summary_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('next_run_at', { ascending: true })
      setSchedules(data || [])
    } finally { setIsLoading(false) }
  }, [options?.summary_type, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { schedules, isLoading, refresh: fetch }
}

export function useSummaryHistory(summaryId?: string, options?: { limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!summaryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('summary_history').select('*').eq('summary_id', summaryId).order('occurred_at', { ascending: false }).limit(options?.limit || 50); setHistory(data || []) } finally { setIsLoading(false) }
  }, [summaryId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useLatestSummary(entityType?: string, entityId?: string, summaryType?: string) {
  const [summary, setSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityId || !summaryType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('summaries').select('*, summary_sections(*), summary_metrics(*)').eq('entity_type', entityType).eq('entity_id', entityId).eq('summary_type', summaryType).eq('status', 'published').order('published_at', { ascending: false }).limit(1).single()
      setSummary(data)
    } finally { setIsLoading(false) }
  }, [entityType, entityId, summaryType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { summary, isLoading, refresh: fetch }
}

export function useMySummaries(userId?: string, options?: { status?: string; limit?: number }) {
  const [summaries, setSummaries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('summaries').select('*, summary_sections(count)').eq('created_by', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setSummaries(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { summaries, isLoading, refresh: fetch }
}

export function usePublicSummaries(options?: { summary_type?: string; period?: string; limit?: number }) {
  const [summaries, setSummaries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('summaries').select('*, summary_sections(count), users(*)').eq('is_public', true).eq('status', 'published')
      if (options?.summary_type) query = query.eq('summary_type', options.summary_type)
      if (options?.period) query = query.eq('period', options.period)
      const { data } = await query.order('published_at', { ascending: false }).limit(options?.limit || 50)
      setSummaries(data || [])
    } finally { setIsLoading(false) }
  }, [options?.summary_type, options?.period, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { summaries, isLoading, refresh: fetch }
}

