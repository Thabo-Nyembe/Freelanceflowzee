'use client'

/**
 * Extended Platforms Hooks
 * Tables: platforms, platform_connections, platform_credentials, platform_sync_logs, platform_mappings, platform_settings
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePlatform(platformId?: string) {
  const [platform, setPlatform] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!platformId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('platforms').select('*').eq('id', platformId).single(); setPlatform(data) } finally { setIsLoading(false) }
  }, [platformId])
  useEffect(() => { loadData() }, [loadData])
  return { platform, isLoading, refresh: loadData }
}

export function usePlatforms(options?: { type?: string; is_active?: boolean }) {
  const [platforms, setPlatforms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('platforms').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setPlatforms(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { platforms, isLoading, refresh: loadData }
}

export function usePlatformConnection(connectionId?: string) {
  const [connection, setConnection] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!connectionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('platform_connections').select('*, platforms(*), platform_settings(*)').eq('id', connectionId).single(); setConnection(data) } finally { setIsLoading(false) }
  }, [connectionId])
  useEffect(() => { loadData() }, [loadData])
  return { connection, isLoading, refresh: loadData }
}

export function usePlatformConnections(options?: { platform_id?: string; user_id?: string; organization_id?: string; status?: string }) {
  const [connections, setConnections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('platform_connections').select('*, platforms(*)')
      if (options?.platform_id) query = query.eq('platform_id', options.platform_id)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setConnections(data || [])
    } finally { setIsLoading(false) }
  }, [options?.platform_id, options?.user_id, options?.organization_id, options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { connections, isLoading, refresh: loadData }
}

export function useUserConnections(userId?: string) {
  const [connections, setConnections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('platform_connections').select('*, platforms(*)').eq('user_id', userId).order('created_at', { ascending: false }); setConnections(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { connections, isLoading, refresh: loadData }
}

export function usePlatformSyncLogs(connectionId?: string, options?: { status?: string; sync_type?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!connectionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('platform_sync_logs').select('*').eq('connection_id', connectionId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.sync_type) query = query.eq('sync_type', options.sync_type)
      const { data } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [connectionId, options?.status, options?.sync_type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { logs, isLoading, refresh: loadData }
}

export function usePlatformMappings(connectionId?: string) {
  const [mappings, setMappings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!connectionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('platform_mappings').select('*').eq('connection_id', connectionId).eq('is_active', true).order('local_entity', { ascending: true }); setMappings(data || []) } finally { setIsLoading(false) }
  }, [connectionId])
  useEffect(() => { loadData() }, [loadData])
  return { mappings, isLoading, refresh: loadData }
}

export function usePlatformSettings(connectionId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!connectionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('platform_settings').select('*').eq('connection_id', connectionId).single(); setSettings(data?.settings || {}) } finally { setIsLoading(false) }
  }, [connectionId])
  useEffect(() => { loadData() }, [loadData])
  return { settings, isLoading, refresh: loadData }
}

export function useActiveConnections(organizationId?: string) {
  const [connections, setConnections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('platform_connections').select('*, platforms(*)').eq('status', 'active')
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('last_sync_at', { ascending: false })
      setConnections(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { loadData() }, [loadData])
  return { connections, isLoading, refresh: loadData }
}

export function useSyncStatus(connectionId?: string) {
  const [status, setStatus] = useState<{ lastSync: string | null; lastStatus: string | null; recentLogs: any[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!connectionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [connectionRes, logsRes] = await Promise.all([
        supabase.from('platform_connections').select('last_sync_at, last_sync_status').eq('id', connectionId).single(),
        supabase.from('platform_sync_logs').select('*').eq('connection_id', connectionId).order('started_at', { ascending: false }).limit(5)
      ])
      setStatus({
        lastSync: connectionRes.data?.last_sync_at,
        lastStatus: connectionRes.data?.last_sync_status,
        recentLogs: logsRes.data || []
      })
    } finally { setIsLoading(false) }
  }, [connectionId])
  useEffect(() => { loadData() }, [loadData])
  return { status, isLoading, refresh: loadData }
}
