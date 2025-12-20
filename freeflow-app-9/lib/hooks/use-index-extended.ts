'use client'

/**
 * Extended Index Hooks - Covers all Index-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useIndexes(indexType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('indexes').select('*').order('created_at', { ascending: false })
      if (indexType) query = query.eq('index_type', indexType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [indexType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useIndexById(indexId?: string) {
  const [index, setIndex] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!indexId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('indexes').select('*').eq('id', indexId).single()
      setIndex(data)
    } finally { setIsLoading(false) }
  }, [indexId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { index, isLoading, refresh: fetch }
}

export function useIndexStats(indexId?: string) {
  const [entryCount, setEntryCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!indexId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { count } = await supabase.from('index_entries').select('*', { count: 'exact', head: true }).eq('index_id', indexId)
      setEntryCount(count || 0)
    } finally { setIsLoading(false) }
  }, [indexId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { entryCount, isLoading, refresh: fetch }
}
