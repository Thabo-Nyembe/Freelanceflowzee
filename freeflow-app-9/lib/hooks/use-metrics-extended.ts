'use client'

/**
 * Extended Metrics Hooks
 * Tables: metrics, metric_values, metric_thresholds, metric_alerts, metric_dashboards, metric_widgets
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMetric(metricId?: string) {
  const [metric, setMetric] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!metricId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('metrics').select('*, metric_thresholds(*), metric_alerts(*)').eq('id', metricId).single(); setMetric(data) } finally { setIsLoading(false) }
  }, [metricId])
  useEffect(() => { fetch() }, [fetch])
  return { metric, isLoading, refresh: fetch }
}

export function useMetrics(options?: { category?: string; organization_id?: string; is_active?: boolean; limit?: number }) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('metrics').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setMetrics(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.organization_id, options?.is_active, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { metrics, isLoading, refresh: fetch }
}

export function useMetricValues(metricId?: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  const [values, setValues] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!metricId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('metric_values').select('*').eq('metric_id', metricId)
      if (options?.from_date) query = query.gte('recorded_at', options.from_date)
      if (options?.to_date) query = query.lte('recorded_at', options.to_date)
      const { data } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 1000)
      setValues(data || [])
    } finally { setIsLoading(false) }
  }, [metricId, options?.from_date, options?.to_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { values, isLoading, refresh: fetch }
}

export function useMetricThresholds(metricId?: string) {
  const [thresholds, setThresholds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!metricId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('metric_thresholds').select('*').eq('metric_id', metricId).eq('is_active', true); setThresholds(data || []) } finally { setIsLoading(false) }
  }, [metricId])
  useEffect(() => { fetch() }, [fetch])
  return { thresholds, isLoading, refresh: fetch }
}

export function useMetricAlerts(options?: { metric_id?: string; status?: string; severity?: string; limit?: number }) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('metric_alerts').select('*, metrics(*)')
      if (options?.metric_id) query = query.eq('metric_id', options.metric_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.severity) query = query.eq('severity', options.severity)
      const { data } = await query.order('triggered_at', { ascending: false }).limit(options?.limit || 50)
      setAlerts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.metric_id, options?.status, options?.severity, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { alerts, isLoading, refresh: fetch }
}

export function useActiveAlerts(organizationId?: string) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('metric_alerts').select('*, metrics(*)').eq('status', 'active')
      if (organizationId) query = query.eq('metrics.organization_id', organizationId)
      const { data } = await query.order('triggered_at', { ascending: false })
      setAlerts(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { fetch() }, [fetch])
  return { alerts, isLoading, refresh: fetch }
}

export function useMetricDashboards(userId?: string, options?: { organization_id?: string }) {
  const [dashboards, setDashboards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('metric_dashboards').select('*').or(`user_id.eq.${userId},is_public.eq.true`)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      const { data } = await query.order('name', { ascending: true })
      setDashboards(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.organization_id, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { dashboards, isLoading, refresh: fetch }
}

export function useDashboard(dashboardId?: string) {
  const [dashboard, setDashboard] = useState<any>(null)
  const [widgets, setWidgets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!dashboardId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [dashRes, widgetsRes] = await Promise.all([
        supabase.from('metric_dashboards').select('*').eq('id', dashboardId).single(),
        supabase.from('metric_widgets').select('*, metrics(*)').eq('dashboard_id', dashboardId)
      ])
      setDashboard(dashRes.data)
      setWidgets(widgetsRes.data || [])
    } finally { setIsLoading(false) }
  }, [dashboardId])
  useEffect(() => { fetch() }, [fetch])
  return { dashboard, widgets, isLoading, refresh: fetch }
}

export function useMetricSummary(metricId?: string, options?: { period?: 'day' | 'week' | 'month' }) {
  const [summary, setSummary] = useState<{ current: number; previous: number; change: number; min: number; max: number; avg: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!metricId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const now = new Date()
      const period = options?.period || 'day'
      let startDate = new Date()
      let prevStartDate = new Date()
      if (period === 'day') { startDate.setDate(now.getDate() - 1); prevStartDate.setDate(now.getDate() - 2) }
      else if (period === 'week') { startDate.setDate(now.getDate() - 7); prevStartDate.setDate(now.getDate() - 14) }
      else { startDate.setMonth(now.getMonth() - 1); prevStartDate.setMonth(now.getMonth() - 2) }
      const { data: current } = await supabase.from('metric_values').select('value').eq('metric_id', metricId).gte('recorded_at', startDate.toISOString())
      const { data: previous } = await supabase.from('metric_values').select('value').eq('metric_id', metricId).gte('recorded_at', prevStartDate.toISOString()).lt('recorded_at', startDate.toISOString())
      const currentSum = current?.reduce((sum, v) => sum + v.value, 0) || 0
      const previousSum = previous?.reduce((sum, v) => sum + v.value, 0) || 0
      const values = current?.map(v => v.value) || []
      const min = values.length ? Math.min(...values) : 0
      const max = values.length ? Math.max(...values) : 0
      const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
      const change = previousSum ? ((currentSum - previousSum) / previousSum) * 100 : 0
      setSummary({ current: currentSum, previous: previousSum, change, min, max, avg })
    } finally { setIsLoading(false) }
  }, [metricId, options?.period, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { summary, isLoading, refresh: fetch }
}
