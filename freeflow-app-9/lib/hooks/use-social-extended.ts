'use client'

/**
 * Extended Social Hooks - Covers all Social-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSocialConnections(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('social_connections').select('*').eq('user_id', userId).order('connected_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useSocialPosts(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('social_posts').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useSocialAnalytics(postId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!postId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('social_analytics').select('*').eq('post_id', postId).single(); setData(result) } finally { setIsLoading(false) }
  }, [postId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
