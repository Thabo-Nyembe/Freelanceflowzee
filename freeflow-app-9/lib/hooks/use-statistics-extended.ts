'use client'

/**
 * Extended Statistics Hooks
 * Tables: statistics, statistic_snapshots, statistic_aggregations, statistic_reports, statistic_dashboards, statistic_alerts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStatistic(statisticId?: string) {
  const [statistic, setStatistic] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!statisticId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('statistics').select('*, statistic_snapshots(*), statistic_alerts(*)').eq('id', statisticId).single(); setStatistic(data) } finally { setIsLoading(false) }
  }, [statisticId])
  useEffect(() => { loadData() }, [loadData])
  return { statistic, isLoading, refresh: loadData }
}

export function useStatistics(options?: { category?: string; metric_type?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [statistics, setStatistics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('statistics').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.metric_type) query = query.eq('metric_type', options.metric_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setStatistics(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.metric_type, options?.is_active, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { statistics, isLoading, refresh: loadData }
}

export function useStatisticSnapshots(statisticId?: string, options?: { from_date?: string; to_date?: string; period?: string; limit?: number }) {
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!statisticId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('statistic_snapshots').select('*').eq('statistic_id', statisticId)
      if (options?.from_date) query = query.gte('recorded_at', options.from_date)
      if (options?.to_date) query = query.lte('recorded_at', options.to_date)
      if (options?.period) query = query.eq('period', options.period)
      const { data } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 100)
      setSnapshots(data || [])
    } finally { setIsLoading(false) }
  }, [statisticId, options?.from_date, options?.to_date, options?.period, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { snapshots, isLoading, refresh: loadData }
}

export function useLatestStatisticValue(statisticId?: string) {
  const [value, setValue] = useState<number | null>(null)
  const [snapshot, setSnapshot] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!statisticId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('statistic_snapshots').select('*').eq('statistic_id', statisticId).order('recorded_at', { ascending: false }).limit(1).single()
      setSnapshot(data)
      setValue(data?.value || null)
    } finally { setIsLoading(false) }
  }, [statisticId])
  useEffect(() => { loadData() }, [loadData])
  return { value, snapshot, isLoading, refresh: loadData }
}

export function useStatisticAggregations(statisticId?: string, options?: { aggregation_type?: string; period?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [aggregations, setAggregations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!statisticId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('statistic_aggregations').select('*').eq('statistic_id', statisticId)
      if (options?.aggregation_type) query = query.eq('aggregation_type', options.aggregation_type)
      if (options?.period) query = query.eq('period', options.period)
      if (options?.from_date) query = query.gte('period_start', options.from_date)
      if (options?.to_date) query = query.lte('period_end', options.to_date)
      const { data } = await query.order('period_start', { ascending: false }).limit(options?.limit || 50)
      setAggregations(data || [])
    } finally { setIsLoading(false) }
  }, [statisticId, options?.aggregation_type, options?.period, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { aggregations, isLoading, refresh: loadData }
}

export function useStatisticReports(options?: { report_type?: string; is_active?: boolean; created_by?: string; limit?: number }) {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('statistic_reports').select('*')
      if (options?.report_type) query = query.eq('report_type', options.report_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setReports(data || [])
    } finally { setIsLoading(false) }
  }, [options?.report_type, options?.is_active, options?.created_by, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { reports, isLoading, refresh: loadData }
}

export function useStatisticAlerts(statisticId?: string, options?: { is_active?: boolean }) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('statistic_alerts').select('*, statistics(*)')
      if (statisticId) query = query.eq('statistic_id', statisticId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setAlerts(data || [])
    } finally { setIsLoading(false) }
  }, [statisticId, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { alerts, isLoading, refresh: loadData }
}

export function useStatisticTrend(statisticId?: string, days: number = 30) {
  const [trend, setTrend] = useState<{ current: number; previous: number; change: number; changePercent: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!statisticId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const now = new Date()
      const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      const previousStart = new Date(periodStart.getTime() - days * 24 * 60 * 60 * 1000)
      const [currentRes, previousRes] = await Promise.all([
        supabase.from('statistic_snapshots').select('value').eq('statistic_id', statisticId).gte('recorded_at', periodStart.toISOString()).lte('recorded_at', now.toISOString()),
        supabase.from('statistic_snapshots').select('value').eq('statistic_id', statisticId).gte('recorded_at', previousStart.toISOString()).lt('recorded_at', periodStart.toISOString())
      ])
      const currentAvg = currentRes.data?.length ? currentRes.data.reduce((sum, s) => sum + s.value, 0) / currentRes.data.length : 0
      const previousAvg = previousRes.data?.length ? previousRes.data.reduce((sum, s) => sum + s.value, 0) / previousRes.data.length : 0
      const change = currentAvg - previousAvg
      const changePercent = previousAvg > 0 ? (change / previousAvg) * 100 : 0
      setTrend({ current: currentAvg, previous: previousAvg, change, changePercent })
    } finally { setIsLoading(false) }
  }, [statisticId, days])
  useEffect(() => { loadData() }, [loadData])
  return { trend, isLoading, refresh: loadData }
}

export function useStatisticCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('statistics').select('category').not('category', 'is', null)
      const unique = [...new Set(data?.map(s => s.category).filter(Boolean))]
      setCategories(unique)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { categories, isLoading, refresh: loadData }
}

