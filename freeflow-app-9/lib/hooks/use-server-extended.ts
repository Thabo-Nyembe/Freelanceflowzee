'use client'

/**
 * Extended Server Hooks
 * Tables: servers, server_metrics, server_logs, server_configs
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useServer(serverId?: string) {
  const [server, setServer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!serverId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('servers').select('*').eq('id', serverId).single(); setServer(data) } finally { setIsLoading(false) }
  }, [serverId])
  useEffect(() => { fetch() }, [fetch])
  return { server, isLoading, refresh: fetch }
}

export function useServers(options?: { status?: string; type?: string; region?: string; limit?: number }) {
  const [servers, setServers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('servers').select('*')
      if (options?.status) query = query.eq('status', options.status)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.region) query = query.eq('region', options.region)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setServers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.type, options?.region, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { servers, isLoading, refresh: fetch }
}

export function useServerMetrics(serverId?: string, options?: { metric_type?: string; hours?: number }) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!serverId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const since = new Date(); since.setHours(since.getHours() - (options?.hours || 24)); let query = supabase.from('server_metrics').select('*').eq('server_id', serverId).gte('created_at', since.toISOString()); if (options?.metric_type) query = query.eq('metric_type', options.metric_type); const { data } = await query.order('created_at', { ascending: false }); setMetrics(data || []) } finally { setIsLoading(false) }
  }, [serverId, options?.metric_type, options?.hours])
  useEffect(() => { fetch() }, [fetch])
  return { metrics, isLoading, refresh: fetch }
}

export function useServerLogs(serverId?: string, options?: { level?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!serverId) { setIsLoading(false); return }
    setIsLoading(true)
    try { let query = supabase.from('server_logs').select('*').eq('server_id', serverId); if (options?.level) query = query.eq('level', options.level); const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); setLogs(data || []) } finally { setIsLoading(false) }
  }, [serverId, options?.level, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useServerConfig(serverId?: string) {
  const [config, setConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!serverId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('server_configs').select('*').eq('server_id', serverId).single(); setConfig(data) } finally { setIsLoading(false) }
  }, [serverId])
  useEffect(() => { fetch() }, [fetch])
  return { config, isLoading, refresh: fetch }
}
