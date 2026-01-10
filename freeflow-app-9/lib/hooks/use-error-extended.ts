'use client'

/**
 * Extended Error Hooks
 * Tables: error_logs, error_reports, error_alerts, error_resolutions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useErrorLog(errorId?: string) {
  const [error, setError] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!errorId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('error_logs').select('*, error_resolutions(*)').eq('id', errorId).single(); setError(data) } finally { setIsLoading(false) }
  }, [errorId])
  useEffect(() => { fetch() }, [fetch])
  return { error, isLoading, refresh: fetch }
}

export function useErrorLogs(options?: { type?: string; severity?: string; status?: string; source?: string; limit?: number }) {
  const [errors, setErrors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('error_logs').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.severity) query = query.eq('severity', options.severity)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.source) query = query.eq('source', options.source)
      const { data } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 100)
      setErrors(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.severity, options?.status, options?.source, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { errors, isLoading, refresh: fetch }
}

export function useRecentErrors(options?: { limit?: number; severity?: string }) {
  const [errors, setErrors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('error_logs').select('*')
      if (options?.severity) query = query.eq('severity', options.severity)
      const { data } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 20)
      setErrors(data || [])
    } finally { setIsLoading(false) }
  }, [options?.limit, options?.severity])
  useEffect(() => { fetch() }, [fetch])
  return { errors, isLoading, refresh: fetch }
}

export function useUnresolvedErrors(options?: { severity?: string }) {
  const [errors, setErrors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('error_logs').select('*').in('status', ['new', 'investigating'])
      if (options?.severity) query = query.eq('severity', options.severity)
      const { data } = await query.order('occurred_at', { ascending: false })
      setErrors(data || [])
    } finally { setIsLoading(false) }
  }, [options?.severity])
  useEffect(() => { fetch() }, [fetch])
  return { errors, isLoading, refresh: fetch }
}

export function useErrorReports(options?: { status?: string; priority?: string; limit?: number }) {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('error_reports').select('*')
      if (options?.status) query = query.eq('status', options.status)
      if (options?.priority) query = query.eq('priority', options.priority)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setReports(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.priority, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { reports, isLoading, refresh: fetch }
}

export function useErrorAlerts(options?: { is_active?: boolean }) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('error_alerts').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false })
      setAlerts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { alerts, isLoading, refresh: fetch }
}

export function useErrorResolutions(errorId?: string) {
  const [resolutions, setResolutions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!errorId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('error_resolutions').select('*').eq('error_id', errorId).order('resolved_at', { ascending: false }); setResolutions(data || []) } finally { setIsLoading(false) }
  }, [errorId])
  useEffect(() => { fetch() }, [fetch])
  return { resolutions, isLoading, refresh: fetch }
}

export function useErrorStats(options?: { days?: number }) {
  const [stats, setStats] = useState<{ total: number; bySeverity: Record<string, number>; byType: Record<string, number>; byStatus: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const daysAgo = options?.days || 7
      const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase.from('error_logs').select('severity, type, status').gte('occurred_at', startDate)
      if (!data) { setStats(null); return }
      const total = data.length
      const bySeverity = data.reduce((acc: Record<string, number>, e) => { acc[e.severity || 'unknown'] = (acc[e.severity || 'unknown'] || 0) + 1; return acc }, {})
      const byType = data.reduce((acc: Record<string, number>, e) => { acc[e.type || 'unknown'] = (acc[e.type || 'unknown'] || 0) + 1; return acc }, {})
      const byStatus = data.reduce((acc: Record<string, number>, e) => { acc[e.status] = (acc[e.status] || 0) + 1; return acc }, {})
      setStats({ total, bySeverity, byType, byStatus })
    } finally { setIsLoading(false) }
  }, [options?.days])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useErrorTrends(options?: { days?: number }) {
  const [trends, setTrends] = useState<{ date: string; count: number; critical: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const daysAgo = options?.days || 14
      const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase.from('error_logs').select('occurred_at, severity').gte('occurred_at', startDate)
      const byDate: Record<string, { count: number; critical: number }> = {}
      data?.forEach(e => {
        const date = e.occurred_at.split('T')[0]
        if (!byDate[date]) byDate[date] = { count: 0, critical: 0 }
        byDate[date].count++
        if (e.severity === 'critical') byDate[date].critical++
      })
      setTrends(Object.entries(byDate).map(([date, stats]) => ({ date, ...stats })).sort((a, b) => a.date.localeCompare(b.date)))
    } finally { setIsLoading(false) }
  }, [options?.days])
  useEffect(() => { fetch() }, [fetch])
  return { trends, isLoading, refresh: fetch }
}
