'use client'

/**
 * Extended Cohort Hooks
 * Tables: cohorts, cohort_members, cohort_analysis, cohort_metrics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCohort(cohortId?: string) {
  const [cohort, setCohort] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!cohortId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('cohorts').select('*, cohort_members(*)').eq('id', cohortId).single(); setCohort(data) } finally { setIsLoading(false) }
  }, [cohortId])
  useEffect(() => { fetch() }, [fetch])
  return { cohort, isLoading, refresh: fetch }
}

export function useCohorts(options?: { type?: string; date_from?: string; date_to?: string; limit?: number }) {
  const [cohorts, setCohorts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('cohorts').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.date_from) query = query.gte('cohort_date', options.date_from)
      if (options?.date_to) query = query.lte('cohort_date', options.date_to)
      const { data } = await query.order('cohort_date', { ascending: false }).limit(options?.limit || 50)
      setCohorts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.date_from, options?.date_to, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { cohorts, isLoading, refresh: fetch }
}

export function useCohortMembers(cohortId?: string, options?: { limit?: number }) {
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!cohortId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('cohort_members').select('*').eq('cohort_id', cohortId).order('joined_at', { ascending: true }).limit(options?.limit || 100); setMembers(data || []) } finally { setIsLoading(false) }
  }, [cohortId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { members, isLoading, refresh: fetch }
}

export function useCohortMetrics(cohortId?: string, options?: { metric_name?: string; period_from?: string; period_to?: string }) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!cohortId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('cohort_metrics').select('*').eq('cohort_id', cohortId)
      if (options?.metric_name) query = query.eq('metric_name', options.metric_name)
      if (options?.period_from) query = query.gte('period', options.period_from)
      if (options?.period_to) query = query.lte('period', options.period_to)
      const { data } = await query.order('period', { ascending: true })
      setMetrics(data || [])
    } finally { setIsLoading(false) }
  }, [cohortId, options?.metric_name, options?.period_from, options?.period_to, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { metrics, isLoading, refresh: fetch }
}

export function useCohortAnalysis(cohortId?: string) {
  const [analysis, setAnalysis] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!cohortId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('cohort_analysis').select('*').eq('cohort_id', cohortId).order('analysis_date', { ascending: false }); setAnalysis(data || []) } finally { setIsLoading(false) }
  }, [cohortId])
  useEffect(() => { fetch() }, [fetch])
  return { analysis, isLoading, refresh: fetch }
}

export function useCohortRetention(cohortId?: string) {
  const [retention, setRetention] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!cohortId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('cohort_metrics').select('*').eq('cohort_id', cohortId).eq('metric_name', 'retention').order('period', { ascending: true }); setRetention(data || []) } finally { setIsLoading(false) }
  }, [cohortId])
  useEffect(() => { fetch() }, [fetch])
  return { retention, isLoading, refresh: fetch }
}

export function useCohortComparison(cohortIds: string[], metricName: string) {
  const [comparison, setComparison] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!cohortIds.length) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('cohort_metrics').select('*').in('cohort_id', cohortIds).eq('metric_name', metricName).order('period', { ascending: true })
      const grouped: Record<string, any[]> = {}
      data?.forEach(m => { if (!grouped[m.cohort_id]) grouped[m.cohort_id] = []; grouped[m.cohort_id].push(m) })
      setComparison(grouped)
    } finally { setIsLoading(false) }
  }, [cohortIds, metricName, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { comparison, isLoading, refresh: fetch }
}
