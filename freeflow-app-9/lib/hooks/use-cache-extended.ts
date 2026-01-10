'use client'

/**
 * Extended Cache Hooks - Covers all Cache-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCacheEntry(key?: string, namespace?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!key) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('cache_entries').select('*').eq('cache_key', key)
      if (namespace) query = query.eq('namespace', namespace)
      const { data: result } = await query.single()
      if (result && result.expires_at && new Date(result.expires_at) < new Date()) {
        setData(null)
      } else {
        setData(result?.value || null)
      }
    } finally { setIsLoading(false) }
  }, [key, namespace, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCacheStats(namespace?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('cache_entries').select('*', { count: 'exact', head: true })
      if (namespace) query = query.eq('namespace', namespace)
      const { count: result } = await query
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [namespace])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useCacheKeys(namespace?: string) {
  const [keys, setKeys] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('cache_entries').select('cache_key, namespace, expires_at').limit(100)
      if (namespace) query = query.eq('namespace', namespace)
      const { data } = await query
      setKeys(data || [])
    } finally { setIsLoading(false) }
  }, [namespace])
  useEffect(() => { fetch() }, [fetch])
  return { keys, isLoading, refresh: fetch }
}
