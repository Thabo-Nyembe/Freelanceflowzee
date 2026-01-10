'use client'

/**
 * Extended Batch Hooks - Covers all Batch operation tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBatch(batchId?: string) {
  const [batch, setBatch] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!batchId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('batches').select('*').eq('id', batchId).single()
      setBatch(data)
    } finally { setIsLoading(false) }
  }, [batchId])
  useEffect(() => { fetch() }, [fetch])
  return { batch, isLoading, refresh: fetch }
}

export function useBatches(options?: { batchType?: string; status?: string; userId?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('batches').select('*')
      if (options?.batchType) query = query.eq('batch_type', options.batchType)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.userId) query = query.eq('user_id', options.userId)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.batchType, options?.status, options?.userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBatchItems(batchId?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!batchId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('batch_items').select('*').eq('batch_id', batchId)
      if (status) query = query.eq('status', status)
      const { data: result } = await query.order('item_index', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [batchId, status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useBatchProgress(batchId?: string) {
  const [progress, setProgress] = useState<{ total: number; processed: number; failed: number; percentage: number }>({ total: 0, processed: 0, failed: 0, percentage: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!batchId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('batches').select('total_items, processed_items, failed_items').eq('id', batchId).single()
      if (data) {
        const percentage = data.total_items > 0 ? Math.round((data.processed_items / data.total_items) * 100) : 0
        setProgress({ total: data.total_items, processed: data.processed_items, failed: data.failed_items, percentage })
      }
    } finally { setIsLoading(false) }
  }, [batchId])
  useEffect(() => { fetch() }, [fetch])
  useEffect(() => {
    if (!batchId) return
    const channel = supabase.channel(`batch-${batchId}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'batches', filter: `id=eq.${batchId}` }, () => fetch()).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [batchId, supabase, fetch])
  return { progress, isLoading, refresh: fetch }
}
