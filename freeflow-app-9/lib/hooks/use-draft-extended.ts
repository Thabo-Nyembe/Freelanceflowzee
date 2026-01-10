'use client'

/**
 * Extended Draft Hooks - Covers all Draft-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDrafts(userId?: string, entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('drafts').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
      if (entityType) query = query.eq('entity_type', entityType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, entityType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useDraft(draftId?: string, userId?: string) {
  const [draft, setDraft] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!draftId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('drafts').select('*').eq('id', draftId).eq('user_id', userId).single()
      setDraft(data)
    } finally { setIsLoading(false) }
  }, [draftId, userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { draft, isLoading, refresh: fetch }
}

export function useDraftCount(userId?: string, entityType?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('drafts').select('*', { count: 'exact', head: true }).eq('user_id', userId)
      if (entityType) query = query.eq('entity_type', entityType)
      const { count: result } = await query
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [userId, entityType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}
