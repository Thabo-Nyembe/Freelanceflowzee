'use client'

/**
 * Extended Status Hooks - Covers all Status-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStatus(entityId?: string, entityType?: string) {
  const [status, setStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('statuses').select('*').eq('entity_id', entityId).eq('entity_type', entityType).single()
      setStatus(data)
    } finally { setIsLoading(false) }
  }, [entityId, entityType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { status, isLoading, refresh: fetch }
}

export function useStatusHistory(entityId?: string, entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('status_history').select('*').eq('entity_id', entityId).eq('entity_type', entityType).order('changed_at', { ascending: false }).limit(20)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityId, entityType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useStatusCounts(entityType?: string) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('statuses').select('status').eq('entity_type', entityType)
      const result: Record<string, number> = {}
      data?.forEach(s => { result[s.status] = (result[s.status] || 0) + 1 })
      setCounts(result)
    } finally { setIsLoading(false) }
  }, [entityType])
  useEffect(() => { fetch() }, [fetch])
  return { counts, isLoading, refresh: fetch }
}
