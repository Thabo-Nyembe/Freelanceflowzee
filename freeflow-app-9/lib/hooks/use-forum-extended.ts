'use client'

/**
 * Extended Forum Hooks - Covers all Forum-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useForums(parentId?: string, isActive?: boolean) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('forums').select('*').order('sort_order', { ascending: true })
      if (parentId) query = query.eq('parent_id', parentId)
      else query = query.is('parent_id', null)
      if (isActive !== undefined) query = query.eq('is_active', isActive)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [parentId, isActive, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useForumTopics(forumId?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!forumId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('forum_topics').select('*').eq('forum_id', forumId).order('is_pinned', { ascending: false }).order('last_activity_at', { ascending: false })
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [forumId, status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useForumStats(forumId?: string) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!forumId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('forums').select('topic_count, post_count, member_count').eq('id', forumId).single()
      setStats(result)
    } finally { setIsLoading(false) }
  }, [forumId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
