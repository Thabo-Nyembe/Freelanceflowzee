'use client'

/**
 * Extended History Hooks - Covers all History-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useHistory(entityId?: string, entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('history').select('*').eq('entity_id', entityId).eq('entity_type', entityType).order('created_at', { ascending: false }).limit(50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityId, entityType])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useHistoryByUser(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useHistoryCount(entityId?: string, entityType?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { count: result } = await supabase.from('history').select('*', { count: 'exact', head: true }).eq('entity_id', entityId).eq('entity_type', entityType)
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [entityId, entityType])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}
