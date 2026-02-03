'use client'

/**
 * Extended Snapshots Hooks
 * Tables: snapshots, snapshot_items, snapshot_schedules, snapshot_comparisons, snapshot_exports, snapshot_tags
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSnapshot(snapshotId?: string) {
  const [snapshot, setSnapshot] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!snapshotId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('snapshots').select('*, snapshot_items(*), snapshot_tags(*), users(*)').eq('id', snapshotId).single(); setSnapshot(data) } finally { setIsLoading(false) }
  }, [snapshotId])
  useEffect(() => { loadData() }, [loadData])
  return { snapshot, isLoading, refresh: loadData }
}

export function useSnapshots(options?: { entity_type?: string; entity_id?: string; snapshot_type?: string; created_by?: string; status?: string; tag?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('snapshots').select('*, snapshot_items(count), snapshot_tags(*), users(*)')
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.entity_id) query = query.eq('entity_id', options.entity_id)
      if (options?.snapshot_type) query = query.eq('snapshot_type', options.snapshot_type)
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('snapshot_at', options.from_date)
      if (options?.to_date) query = query.lte('snapshot_at', options.to_date)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('snapshot_at', { ascending: false }).limit(options?.limit || 50)
      let result = data || []
      if (options?.tag) {
        result = result.filter(s => s.snapshot_tags?.some((t: any) => t.tag === options.tag))
      }
      setSnapshots(result)
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.entity_id, options?.snapshot_type, options?.created_by, options?.status, options?.tag, options?.from_date, options?.to_date, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { snapshots, isLoading, refresh: loadData }
}

export function useSnapshotItems(snapshotId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!snapshotId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('snapshot_items').select('*').eq('snapshot_id', snapshotId); setItems(data || []) } finally { setIsLoading(false) }
  }, [snapshotId])
  useEffect(() => { loadData() }, [loadData])
  return { items, isLoading, refresh: loadData }
}

export function useSnapshotSchedules(options?: { entity_type?: string; is_active?: boolean }) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('snapshot_schedules').select('*')
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setSchedules(data || [])
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { schedules, isLoading, refresh: loadData }
}

export function useSnapshotComparisons(snapshotId?: string) {
  const [comparisons, setComparisons] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!snapshotId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('snapshot_comparisons').select('*, snapshot1:snapshot1_id(*), snapshot2:snapshot2_id(*)').or(`snapshot1_id.eq.${snapshotId},snapshot2_id.eq.${snapshotId}`).order('compared_at', { ascending: false })
      setComparisons(data || [])
    } finally { setIsLoading(false) }
  }, [snapshotId])
  useEffect(() => { loadData() }, [loadData])
  return { comparisons, isLoading, refresh: loadData }
}

export function useSnapshotExports(snapshotId?: string) {
  const [exports, setExports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!snapshotId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('snapshot_exports').select('*').eq('snapshot_id', snapshotId).order('exported_at', { ascending: false }); setExports(data || []) } finally { setIsLoading(false) }
  }, [snapshotId])
  useEffect(() => { loadData() }, [loadData])
  return { exports, isLoading, refresh: loadData }
}

export function useEntitySnapshots(entityType?: string, entityId?: string, options?: { limit?: number }) {
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('snapshots').select('*, snapshot_tags(*)').eq('entity_type', entityType).eq('entity_id', entityId).order('snapshot_at', { ascending: false }).limit(options?.limit || 20)
      setSnapshots(data || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { snapshots, isLoading, refresh: loadData }
}

export function useLatestSnapshot(entityType?: string, entityId?: string) {
  const [snapshot, setSnapshot] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('snapshots').select('*, snapshot_items(*)').eq('entity_type', entityType).eq('entity_id', entityId).eq('status', 'active').order('snapshot_at', { ascending: false }).limit(1).single()
      setSnapshot(data)
    } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { loadData() }, [loadData])
  return { snapshot, isLoading, refresh: loadData }
}

export function useSnapshotStats(options?: { entity_type?: string; from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ total: number; scheduled: number; manual: number; restored: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('snapshots').select('snapshot_type, restored_at')
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.from_date) query = query.gte('snapshot_at', options.from_date)
      if (options?.to_date) query = query.lte('snapshot_at', options.to_date)
      const { data } = await query
      const snapshots = data || []
      setStats({
        total: snapshots.length,
        scheduled: snapshots.filter(s => s.snapshot_type === 'scheduled').length,
        manual: snapshots.filter(s => s.snapshot_type === 'manual').length,
        restored: snapshots.filter(s => s.restored_at).length
      })
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.from_date, options?.to_date])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

