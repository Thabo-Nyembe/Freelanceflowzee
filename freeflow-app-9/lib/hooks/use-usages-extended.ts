'use client'

/**
 * Extended Usages Hooks
 * Tables: usages, usage_metrics, usage_limits, usage_alerts, usage_reports, usage_billing
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUsage(usageId?: string) {
  const [usage, setUsage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!usageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('usages').select('*, usage_metrics(*), users(*)').eq('id', usageId).single(); setUsage(data) } finally { setIsLoading(false) }
  }, [usageId])
  useEffect(() => { fetch() }, [fetch])
  return { usage, isLoading, refresh: fetch }
}

export function useUsages(options?: { user_id?: string; resource_type?: string; metric_name?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [usages, setUsages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('usages').select('*, users(*)')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.resource_type) query = query.eq('resource_type', options.resource_type)
      if (options?.metric_name) query = query.eq('metric_name', options.metric_name)
      if (options?.from_date) query = query.gte('recorded_at', options.from_date)
      if (options?.to_date) query = query.lte('recorded_at', options.to_date)
      const { data } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 100)
      setUsages(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.resource_type, options?.metric_name, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { usages, isLoading, refresh: fetch }
}

function getPeriodStart(period: string): Date {
  const now = new Date()
  switch (period) {
    case 'hourly': return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0)
    case 'daily': return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    case 'weekly': { const day = now.getDay(); return new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 0, 0, 0) }
    case 'monthly': return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
    case 'yearly': return new Date(now.getFullYear(), 0, 1, 0, 0, 0)
    default: return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
  }
}

export function useUsageSummary(userId?: string, period: string = 'monthly') {
  const [summary, setSummary] = useState<Record<string, Record<string, number>>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const periodStart = getPeriodStart(period)
      const { data } = await supabase.from('usages').select('resource_type, metric_name, quantity').eq('user_id', userId).gte('recorded_at', periodStart.toISOString())
      const result: Record<string, Record<string, number>> = {}
      data?.forEach(u => {
        if (!result[u.resource_type]) result[u.resource_type] = {}
        result[u.resource_type][u.metric_name] = (result[u.resource_type][u.metric_name] || 0) + u.quantity
      })
      setSummary(result)
    } finally { setIsLoading(false) }
  }, [userId, period])
  useEffect(() => { fetch() }, [fetch])
  return { summary, isLoading, refresh: fetch }
}

export function useUsageMetrics(options?: { is_billable?: boolean }) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('usage_metrics').select('*')
      if (options?.is_billable !== undefined) query = query.eq('is_billable', options.is_billable)
      const { data } = await query.order('display_name', { ascending: true })
      setMetrics(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_billable])
  useEffect(() => { fetch() }, [fetch])
  return { metrics, isLoading, refresh: fetch }
}

export function useUsageLimits(userId?: string) {
  const [limits, setLimits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('usage_limits').select('*').eq('user_id', userId).eq('is_active', true); setLimits(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { limits, isLoading, refresh: fetch }
}

export function useLimitStatus(userId?: string, resourceType?: string, metricName?: string) {
  const [status, setStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !resourceType || !metricName) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: limit } = await supabase.from('usage_limits').select('*').eq('user_id', userId).eq('resource_type', resourceType).eq('metric_name', metricName).eq('is_active', true).single()
      if (!limit) { setStatus({ hasLimit: false }); return }
      const periodStart = getPeriodStart(limit.period)
      const { data: usages } = await supabase.from('usages').select('quantity').eq('user_id', userId).eq('resource_type', resourceType).eq('metric_name', metricName).gte('recorded_at', periodStart.toISOString())
      const currentUsage = usages?.reduce((sum, u) => sum + (u.quantity || 0), 0) || 0
      setStatus({
        hasLimit: true,
        limit: limit.max_value,
        used: currentUsage,
        remaining: Math.max(0, limit.max_value - currentUsage),
        percentage: Math.round((currentUsage / limit.max_value) * 100),
        period: limit.period,
        periodStart: periodStart.toISOString()
      })
    } finally { setIsLoading(false) }
  }, [userId, resourceType, metricName])
  useEffect(() => { fetch() }, [fetch])
  return { status, isLoading, refresh: fetch }
}

export function useUsageAlerts(userId?: string, options?: { alert_type?: string; is_read?: boolean; limit?: number }) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('usage_alerts').select('*, usage_limits(*)').eq('user_id', userId)
      if (options?.alert_type) query = query.eq('alert_type', options.alert_type)
      if (options?.is_read !== undefined) query = query.eq('is_read', options.is_read)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setAlerts(data || [])
      setUnreadCount(data?.filter(a => !a.is_read).length || 0)
    } finally { setIsLoading(false) }
  }, [userId, options?.alert_type, options?.is_read, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { alerts, unreadCount, isLoading, refresh: fetch }
}

export function useUsageReports(userId?: string, options?: { limit?: number }) {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('usage_reports').select('*').eq('user_id', userId).order('generated_at', { ascending: false }).limit(options?.limit || 20); setReports(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { reports, isLoading, refresh: fetch }
}

export function useUsageBilling(userId?: string, options?: { status?: string; limit?: number }) {
  const [billing, setBilling] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('usage_billing').select('*').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setBilling(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { billing, isLoading, refresh: fetch }
}

export function useResourceUsage(userId?: string, resourceType?: string, options?: { period?: string }) {
  const [usage, setUsage] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !resourceType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const periodStart = getPeriodStart(options?.period || 'monthly')
      const { data } = await supabase.from('usages').select('metric_name, quantity').eq('user_id', userId).eq('resource_type', resourceType).gte('recorded_at', periodStart.toISOString())
      const result: Record<string, number> = {}
      data?.forEach(u => {
        result[u.metric_name] = (result[u.metric_name] || 0) + u.quantity
      })
      setUsage(result)
    } finally { setIsLoading(false) }
  }, [userId, resourceType, options?.period])
  useEffect(() => { fetch() }, [fetch])
  return { usage, isLoading, refresh: fetch }
}

export function useAllLimitStatuses(userId?: string) {
  const [statuses, setStatuses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: limits } = await supabase.from('usage_limits').select('*').eq('user_id', userId).eq('is_active', true)
      if (!limits || limits.length === 0) { setStatuses([]); return }
      const results: any[] = []
      for (const limit of limits) {
        const periodStart = getPeriodStart(limit.period)
        const { data: usages } = await supabase.from('usages').select('quantity').eq('user_id', userId).eq('resource_type', limit.resource_type).eq('metric_name', limit.metric_name).gte('recorded_at', periodStart.toISOString())
        const currentUsage = usages?.reduce((sum, u) => sum + (u.quantity || 0), 0) || 0
        results.push({
          ...limit,
          used: currentUsage,
          remaining: Math.max(0, limit.max_value - currentUsage),
          percentage: Math.round((currentUsage / limit.max_value) * 100)
        })
      }
      setStatuses(results)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { statuses, isLoading, refresh: fetch }
}

export function useUsageTrend(userId?: string, metricName?: string, options?: { days?: number }) {
  const [trend, setTrend] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !metricName) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const days = options?.days || 30
      const sinceDate = new Date()
      sinceDate.setDate(sinceDate.getDate() - days)
      const { data } = await supabase.from('usages').select('quantity, recorded_at').eq('user_id', userId).eq('metric_name', metricName).gte('recorded_at', sinceDate.toISOString()).order('recorded_at', { ascending: true })
      const dailyTotals: Record<string, number> = {}
      data?.forEach(u => {
        const date = u.recorded_at.split('T')[0]
        dailyTotals[date] = (dailyTotals[date] || 0) + u.quantity
      })
      setTrend(Object.entries(dailyTotals).map(([date, total]) => ({ date, total })))
    } finally { setIsLoading(false) }
  }, [userId, metricName, options?.days])
  useEffect(() => { fetch() }, [fetch])
  return { trend, isLoading, refresh: fetch }
}
