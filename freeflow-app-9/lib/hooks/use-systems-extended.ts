'use client'

/**
 * Extended Systems Hooks
 * Tables: systems, system_configs, system_health, system_logs, system_metrics, system_alerts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSystem(systemId?: string) {
  const [system, setSystem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!systemId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('systems').select('*, system_configs(*), system_health(*), system_alerts(*)').eq('id', systemId).single(); setSystem(data) } finally { setIsLoading(false) }
  }, [systemId])
  useEffect(() => { fetch() }, [fetch])
  return { system, isLoading, refresh: fetch }
}

export function useSystems(options?: { system_type?: string; environment?: string; status?: string; is_active?: boolean; owner_id?: string; search?: string; limit?: number }) {
  const [systems, setSystems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('systems').select('*, system_health(*)')
      if (options?.system_type) query = query.eq('system_type', options.system_type)
      if (options?.environment) query = query.eq('environment', options.environment)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setSystems(data || [])
    } finally { setIsLoading(false) }
  }, [options?.system_type, options?.environment, options?.status, options?.is_active, options?.owner_id, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { systems, isLoading, refresh: fetch }
}

export function useSystemConfig(systemId?: string) {
  const [config, setConfig] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!systemId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('system_configs').select('*').eq('system_id', systemId)
      const configMap: Record<string, any> = {}
      data?.forEach(c => { configMap[c.config_key] = c.config_value })
      setConfig(configMap)
    } finally { setIsLoading(false) }
  }, [systemId])
  useEffect(() => { fetch() }, [fetch])
  return { config, isLoading, refresh: fetch }
}

export function useSystemHealth(systemId?: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  const [health, setHealth] = useState<any[]>([])
  const [latestHealth, setLatestHealth] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!systemId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('system_health').select('*').eq('system_id', systemId)
      if (options?.from_date) query = query.gte('checked_at', options.from_date)
      if (options?.to_date) query = query.lte('checked_at', options.to_date)
      const { data } = await query.order('checked_at', { ascending: false }).limit(options?.limit || 100)
      const healthList = data || []
      setHealth(healthList)
      setLatestHealth(healthList[0] || null)
    } finally { setIsLoading(false) }
  }, [systemId, options?.from_date, options?.to_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { health, latestHealth, isLoading, refresh: fetch }
}

export function useSystemLogs(systemId?: string, options?: { level?: string; category?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!systemId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('system_logs').select('*').eq('system_id', systemId)
      if (options?.level) query = query.eq('level', options.level)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.from_date) query = query.gte('logged_at', options.from_date)
      if (options?.to_date) query = query.lte('logged_at', options.to_date)
      if (options?.search) query = query.ilike('message', `%${options.search}%`)
      const { data } = await query.order('logged_at', { ascending: false }).limit(options?.limit || 100)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [systemId, options?.level, options?.category, options?.from_date, options?.to_date, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useSystemMetrics(systemId?: string, options?: { metric_name?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!systemId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('system_metrics').select('*').eq('system_id', systemId)
      if (options?.metric_name) query = query.eq('metric_name', options.metric_name)
      if (options?.from_date) query = query.gte('recorded_at', options.from_date)
      if (options?.to_date) query = query.lte('recorded_at', options.to_date)
      const { data } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 100)
      setMetrics(data || [])
    } finally { setIsLoading(false) }
  }, [systemId, options?.metric_name, options?.from_date, options?.to_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { metrics, isLoading, refresh: fetch }
}

export function useSystemAlerts(options?: { system_id?: string; status?: string; severity?: string; limit?: number }) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('system_alerts').select('*, systems(*)')
      if (options?.system_id) query = query.eq('system_id', options.system_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.severity) query = query.eq('severity', options.severity)
      const { data } = await query.order('triggered_at', { ascending: false }).limit(options?.limit || 50)
      setAlerts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.system_id, options?.status, options?.severity, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { alerts, isLoading, refresh: fetch }
}

export function useActiveAlerts(options?: { severity?: string; limit?: number }) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [counts, setCounts] = useState<{ critical: number; warning: number; info: number }>({ critical: 0, warning: 0, info: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('system_alerts').select('*, systems(*)').eq('status', 'active')
      if (options?.severity) query = query.eq('severity', options.severity)
      const { data } = await query.order('triggered_at', { ascending: false }).limit(options?.limit || 50)
      const alertList = data || []
      setAlerts(alertList)
      setCounts({
        critical: alertList.filter(a => a.severity === 'critical').length,
        warning: alertList.filter(a => a.severity === 'warning').length,
        info: alertList.filter(a => a.severity === 'info').length
      })
    } finally { setIsLoading(false) }
  }, [options?.severity, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { alerts, counts, isLoading, refresh: fetch }
}

export function useSystemStatus() {
  const [status, setStatus] = useState<{ total: number; healthy: number; degraded: number; unhealthy: number }>({ total: 0, healthy: 0, degraded: 0, unhealthy: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('systems').select('status').eq('is_active', true)
      const systems = data || []
      setStatus({
        total: systems.length,
        healthy: systems.filter(s => s.status === 'active').length,
        degraded: systems.filter(s => s.status === 'degraded').length,
        unhealthy: systems.filter(s => s.status === 'error').length
      })
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { status, isLoading, refresh: fetch }
}

