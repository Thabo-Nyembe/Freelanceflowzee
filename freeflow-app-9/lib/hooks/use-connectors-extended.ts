'use client'

/**
 * Extended Connectors Hooks
 * Tables: connectors, connector_configs, connector_logs, connector_mappings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useConnector(connectorId?: string) {
  const [connector, setConnector] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!connectorId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('connectors').select('*, connector_configs(*)').eq('id', connectorId).single(); setConnector(data) } finally { setIsLoading(false) }
  }, [connectorId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { connector, isLoading, refresh: fetch }
}

export function useConnectors(options?: { user_id?: string; type?: string; provider?: string; status?: string }) {
  const [connectors, setConnectors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('connectors').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.provider) query = query.eq('provider', options.provider)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('name', { ascending: true })
      setConnectors(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.provider, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { connectors, isLoading, refresh: fetch }
}

export function useConnectorLogs(connectorId?: string, options?: { event_type?: string; status?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!connectorId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('connector_logs').select('*').eq('connector_id', connectorId)
      if (options?.event_type) query = query.eq('event_type', options.event_type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [connectorId, options?.event_type, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useConnectorMappings(connectorId?: string) {
  const [mappings, setMappings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!connectorId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('connector_mappings').select('*').eq('connector_id', connectorId).order('created_at', { ascending: false }); setMappings(data || []) } finally { setIsLoading(false) }
  }, [connectorId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { mappings, isLoading, refresh: fetch }
}

export function useActiveConnectors(userId?: string) {
  const [connectors, setConnectors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('connectors').select('*').eq('user_id', userId).eq('status', 'active').order('name', { ascending: true }); setConnectors(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { connectors, isLoading, refresh: fetch }
}

export function useConnectorStats(userId?: string) {
  const [stats, setStats] = useState<{ total: number; active: number; byType: Record<string, number>; byProvider: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('connectors').select('status, type, provider').eq('user_id', userId)
      if (!data) { setStats(null); return }
      const total = data.length
      const active = data.filter(c => c.status === 'active').length
      const byType = data.reduce((acc: Record<string, number>, c) => { acc[c.type || 'unknown'] = (acc[c.type || 'unknown'] || 0) + 1; return acc }, {})
      const byProvider = data.reduce((acc: Record<string, number>, c) => { acc[c.provider || 'unknown'] = (acc[c.provider || 'unknown'] || 0) + 1; return acc }, {})
      setStats({ total, active, byType, byProvider })
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useConnectorHealth(connectorId?: string) {
  const [health, setHealth] = useState<{ status: string; lastCheck: string | null; errorCount: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!connectorId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: connector } = await supabase.from('connectors').select('status, last_tested_at').eq('id', connectorId).single()
      const { count: errorCount } = await supabase.from('connector_logs').select('*', { count: 'exact', head: true }).eq('connector_id', connectorId).eq('status', 'error').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      setHealth({ status: connector?.status || 'unknown', lastCheck: connector?.last_tested_at || null, errorCount: errorCount || 0 })
    } finally { setIsLoading(false) }
  }, [connectorId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { health, isLoading, refresh: fetch }
}
