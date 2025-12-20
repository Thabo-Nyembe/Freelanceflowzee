'use client'

/**
 * Extended Sync Hooks - Covers all Sync-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSync(syncId?: string) {
  const [sync, setSync] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!syncId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('syncs').select('*').eq('id', syncId).single()
      setSync(data)
    } finally { setIsLoading(false) }
  }, [syncId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { sync, isLoading, refresh: fetch }
}

export function useSyncStatus(syncId?: string) {
  const [status, setStatus] = useState<string>('idle')
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null)
  const [lastSyncRecords, setLastSyncRecords] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!syncId) { setIsLoading(false); return }
    setIsLoading(true)

    const fetchInitial = async () => {
      const { data } = await supabase.from('syncs').select('status, last_sync_at, last_sync_records, is_active').eq('id', syncId).single()
      if (data) {
        setStatus(data.status)
        setLastSyncAt(data.last_sync_at)
        setLastSyncRecords(data.last_sync_records || 0)
        setIsActive(data.is_active)
      }
      setIsLoading(false)
    }

    fetchInitial()

    const channel = supabase.channel(`sync-${syncId}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'syncs', filter: `id=eq.${syncId}` }, (payload) => {
      setStatus(payload.new.status)
      setLastSyncAt(payload.new.last_sync_at)
      setLastSyncRecords(payload.new.last_sync_records || 0)
      setIsActive(payload.new.is_active)
    }).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [syncId, supabase])

  return { status, lastSyncAt, lastSyncRecords, isActive, isRunning: status === 'running', isLoading }
}

export function useUserSyncs(userId?: string, options?: { isActive?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('syncs').select('*').eq('user_id', userId)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.isActive, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSyncLogs(syncId?: string, limit = 20) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!syncId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('sync_logs').select('*').eq('sync_id', syncId).order('completed_at', { ascending: false }).limit(limit)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [syncId, limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
