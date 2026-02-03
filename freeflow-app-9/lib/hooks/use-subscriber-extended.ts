'use client'

/**
 * Extended Subscriber Hooks - Covers all Subscriber-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSubscribers(listId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!listId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('subscribers').select('*').eq('list_id', listId).order('subscribed_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [listId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useSubscriberLists(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('subscriber_lists').select('*').eq('owner_id', userId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useSubscriberSegments(listId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!listId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('subscriber_segments').select('*').eq('list_id', listId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [listId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
