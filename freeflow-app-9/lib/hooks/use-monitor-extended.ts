'use client'

/**
 * Extended Monitor Hooks - Covers all Monitor/Monitoring tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMonitor(monitorId?: string) {
  const [monitor, setMonitor] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!monitorId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('monitors').select('*').eq('id', monitorId).single()
      setMonitor(data)
    } finally { setIsLoading(false) }
  }, [monitorId])
  useEffect(() => { fetch() }, [fetch])
  return { monitor, isLoading, refresh: fetch }
}

export function useMonitors(options?: { monitorType?: string; status?: string; isEnabled?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('monitors').select('*')
      if (options?.monitorType) query = query.eq('monitor_type', options.monitorType)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.isEnabled !== undefined) query = query.eq('is_enabled', options.isEnabled)
      const { data: result } = await query.order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.monitorType, options?.status, options?.isEnabled, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useMonitorChecks(monitorId?: string, limit = 100) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!monitorId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('monitor_checks').select('*').eq('monitor_id', monitorId).order('checked_at', { ascending: false }).limit(limit)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [monitorId, limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useMonitorAlerts(monitorId?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('monitor_alerts').select('*, monitors(name)')
      if (monitorId) query = query.eq('monitor_id', monitorId)
      if (status) query = query.eq('status', status)
      const { data: result } = await query.order('triggered_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [monitorId, status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useMonitorUptime(monitorId?: string, days = 30) {
  const [uptime, setUptime] = useState<{ percentage: number; totalChecks: number }>({ percentage: 100, totalChecks: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!monitorId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase.from('monitor_checks').select('status').eq('monitor_id', monitorId).gte('checked_at', since)
      const total = data?.length || 0
      const up = data?.filter(c => c.status === 'up').length || 0
      const percentage = total > 0 ? Math.round((up / total) * 10000) / 100 : 100
      setUptime({ percentage, totalChecks: total })
    } finally { setIsLoading(false) }
  }, [monitorId, days, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { uptime, isLoading, refresh: fetch }
}
