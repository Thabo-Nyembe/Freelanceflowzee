'use client'

/**
 * Extended Sources Hooks
 * Tables: sources, source_types, source_connections, source_sync, source_mappings, source_logs
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSource(sourceId?: string) {
  const [source, setSource] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!sourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('sources').select('*, source_types(*), source_connections(*), source_mappings(*)').eq('id', sourceId).single(); setSource(data) } finally { setIsLoading(false) }
  }, [sourceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { source, isLoading, refresh: fetch }
}

export function useSources(options?: { type_id?: string; status?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [sources, setSources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('sources').select('*, source_types(*), source_sync(count)')
      if (options?.type_id) query = query.eq('type_id', options.type_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setSources(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type_id, options?.status, options?.is_active, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { sources, isLoading, refresh: fetch }
}

export function useSourceTypes(options?: { is_active?: boolean }) {
  const [types, setTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('source_types').select('*, sources(count)')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTypes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { types, isLoading, refresh: fetch }
}

export function useSourceMappings(sourceId?: string) {
  const [mappings, setMappings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!sourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('source_mappings').select('*').eq('source_id', sourceId).order('target_field', { ascending: true }); setMappings(data || []) } finally { setIsLoading(false) }
  }, [sourceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { mappings, isLoading, refresh: fetch }
}

export function useSyncHistory(sourceId?: string, options?: { status?: string; limit?: number }) {
  const [syncs, setSyncs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!sourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('source_sync').select('*').eq('source_id', sourceId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('started_at', { ascending: false }).limit(options?.limit || 20)
      setSyncs(data || [])
    } finally { setIsLoading(false) }
  }, [sourceId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { syncs, isLoading, refresh: fetch }
}

export function useSourceLogs(sourceId?: string, options?: { level?: string; event_type?: string; from_date?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!sourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('source_logs').select('*').eq('source_id', sourceId)
      if (options?.level) query = query.eq('level', options.level)
      if (options?.event_type) query = query.eq('event_type', options.event_type)
      if (options?.from_date) query = query.gte('logged_at', options.from_date)
      const { data } = await query.order('logged_at', { ascending: false }).limit(options?.limit || 100)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [sourceId, options?.level, options?.event_type, options?.from_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useLatestSync(sourceId?: string) {
  const [sync, setSync] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!sourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('source_sync').select('*').eq('source_id', sourceId).order('started_at', { ascending: false }).limit(1).single(); setSync(data) } finally { setIsLoading(false) }
  }, [sourceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { sync, isLoading, refresh: fetch }
}

export function useRunningSyncs() {
  const [syncs, setSyncs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('source_sync').select('*, sources(*)').eq('status', 'running').order('started_at', { ascending: false })
      setSyncs(data || [])
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { syncs, isLoading, refresh: fetch }
}

export function useSourceStats() {
  const [stats, setStats] = useState<{ total: number; active: number; syncing: number; errors: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('sources').select('status, is_active')
      const sources = data || []
      setStats({
        total: sources.length,
        active: sources.filter(s => s.is_active).length,
        syncing: sources.filter(s => s.status === 'syncing').length,
        errors: sources.filter(s => s.status === 'error').length
      })
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useSourceConnection(sourceId?: string) {
  const [connection, setConnection] = useState<{ status: string; lastTest: string | null; latency: number | null } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!sourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('sources').select('connection_status, last_connection_test').eq('id', sourceId).single()
      if (data) {
        setConnection({
          status: data.connection_status || 'unknown',
          lastTest: data.last_connection_test,
          latency: null
        })
      }
    } finally { setIsLoading(false) }
  }, [sourceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { connection, isLoading, refresh: fetch }
}

