'use client'

/**
 * Extended Queues Hooks
 * Tables: queues, queue_items, queue_workers, queue_jobs, queue_schedules, queue_logs, queue_metrics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useQueue(queueId?: string) {
  const [queue, setQueue] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!queueId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('queues').select('*, queue_items(count), queue_workers(*), queue_schedules(*)').eq('id', queueId).single(); setQueue(data) } finally { setIsLoading(false) }
  }, [queueId])
  useEffect(() => { fetch() }, [fetch])
  return { queue, isLoading, refresh: fetch }
}

export function useQueues(options?: { organization_id?: string; type?: string; status?: string; limit?: number }) {
  const [queues, setQueues] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('queues').select('*, queue_items(count), queue_workers(count)')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setQueues(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.type, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { queues, isLoading, refresh: fetch }
}

export function useQueueItems(queueId?: string, options?: { status?: string; limit?: number }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!queueId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('queue_items').select('*').eq('queue_id', queueId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setItems(data || [])
    } finally { setIsLoading(false) }
  }, [queueId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useQueueWorkers(queueId?: string) {
  const [workers, setWorkers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!queueId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('queue_workers').select('*').eq('queue_id', queueId).order('started_at', { ascending: false }); setWorkers(data || []) } finally { setIsLoading(false) }
  }, [queueId])
  useEffect(() => { fetch() }, [fetch])
  return { workers, isLoading, refresh: fetch }
}

export function useActiveWorkers(queueId?: string) {
  const [workers, setWorkers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      let query = supabase.from('queue_workers').select('*').eq('status', 'active').gte('last_heartbeat', fiveMinutesAgo)
      if (queueId) query = query.eq('queue_id', queueId)
      const { data } = await query.order('last_heartbeat', { ascending: false })
      setWorkers(data || [])
    } finally { setIsLoading(false) }
  }, [queueId])
  useEffect(() => { fetch() }, [fetch])
  return { workers, isLoading, refresh: fetch }
}

export function useQueueSchedules(queueId?: string) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!queueId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('queue_schedules').select('*').eq('queue_id', queueId).order('name', { ascending: true }); setSchedules(data || []) } finally { setIsLoading(false) }
  }, [queueId])
  useEffect(() => { fetch() }, [fetch])
  return { schedules, isLoading, refresh: fetch }
}

export function useQueueStats(queueId?: string) {
  const [stats, setStats] = useState<{ pending: number; processing: number; completed: number; failed: number; totalProcessed: number; avgProcessingTime: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!queueId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [queueRes, itemsRes] = await Promise.all([
        supabase.from('queues').select('processed_count, failed_count').eq('id', queueId).single(),
        supabase.from('queue_items').select('status, started_at, completed_at').eq('queue_id', queueId)
      ])
      const items = itemsRes.data || []
      const pending = items.filter(i => i.status === 'pending').length
      const processing = items.filter(i => i.status === 'processing').length
      const completed = items.filter(i => i.status === 'completed').length
      const failed = items.filter(i => i.status === 'failed').length
      const completedItems = items.filter(i => i.completed_at && i.started_at)
      const avgProcessingTime = completedItems.length > 0
        ? completedItems.reduce((sum, i) => sum + (new Date(i.completed_at).getTime() - new Date(i.started_at).getTime()), 0) / completedItems.length / 1000
        : 0
      setStats({ pending, processing, completed, failed, totalProcessed: queueRes.data?.processed_count || 0, avgProcessingTime })
    } finally { setIsLoading(false) }
  }, [queueId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useQueueLogs(queueId?: string, options?: { limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!queueId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('queue_logs').select('*').eq('queue_id', queueId).order('created_at', { ascending: false }).limit(options?.limit || 100); setLogs(data || []) } finally { setIsLoading(false) }
  }, [queueId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useFailedItems(queueId?: string, options?: { limit?: number }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('queue_items').select('*, queues(*)').eq('status', 'failed')
      if (queueId) query = query.eq('queue_id', queueId)
      const { data } = await query.order('failed_at', { ascending: false }).limit(options?.limit || 50)
      setItems(data || [])
    } finally { setIsLoading(false) }
  }, [queueId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useQueueMetrics(queueId?: string, options?: { from_date?: string; to_date?: string }) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!queueId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('queue_metrics').select('*').eq('queue_id', queueId)
      if (options?.from_date) query = query.gte('recorded_at', options.from_date)
      if (options?.to_date) query = query.lte('recorded_at', options.to_date)
      const { data } = await query.order('recorded_at', { ascending: true })
      setMetrics(data || [])
    } finally { setIsLoading(false) }
  }, [queueId, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { metrics, isLoading, refresh: fetch }
}

export function usePendingItems(options?: { queue_id?: string; limit?: number }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('queue_items').select('*, queues(*)').eq('status', 'pending')
      if (options?.queue_id) query = query.eq('queue_id', options.queue_id)
      const { data } = await query.order('priority', { ascending: false }).order('created_at', { ascending: true }).limit(options?.limit || 100)
      setItems(data || [])
    } finally { setIsLoading(false) }
  }, [options?.queue_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}
