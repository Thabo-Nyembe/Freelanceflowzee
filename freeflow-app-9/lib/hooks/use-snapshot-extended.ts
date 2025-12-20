'use client'

/**
 * Extended Snapshot Hooks - Covers all Snapshot-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSnapshots(entityId?: string, entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('snapshots').select('*').eq('entity_id', entityId).eq('entity_type', entityType).order('created_at', { ascending: false }).limit(20)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityId, entityType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useSnapshotById(snapshotId?: string) {
  const [snapshot, setSnapshot] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!snapshotId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('snapshots').select('*').eq('id', snapshotId).single()
      setSnapshot(data)
    } finally { setIsLoading(false) }
  }, [snapshotId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { snapshot, isLoading, refresh: fetch }
}

export function useSnapshotCount(entityId?: string, entityType?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { count: result } = await supabase.from('snapshots').select('*', { count: 'exact', head: true }).eq('entity_id', entityId).eq('entity_type', entityType)
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [entityId, entityType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}
