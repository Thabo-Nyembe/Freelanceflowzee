'use client'

/**
 * Extended Queue Hooks - Covers all Queue-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useQueueItems(queueName?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!queueName) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('queue_items').select('*').eq('queue_name', queueName).order('priority', { ascending: false }).order('created_at', { ascending: true }).limit(50)
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [queueName, status])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useQueueStats(queueName?: string) {
  const [stats, setStats] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!queueName) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('queue_items').select('status').eq('queue_name', queueName)
      const counts: Record<string, number> = { pending: 0, processing: 0, completed: 0, failed: 0 }
      data?.forEach(item => { counts[item.status] = (counts[item.status] || 0) + 1 })
      setStats(counts)
    } finally { setIsLoading(false) }
  }, [queueName])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useQueueNames() {
  const [names, setNames] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('queue_items').select('queue_name')
      const unique = [...new Set(data?.map(q => q.queue_name) || [])]
      setNames(unique)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { names, isLoading, refresh: fetch }
}
