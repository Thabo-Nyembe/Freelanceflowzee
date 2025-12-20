'use client'

/**
 * Extended Discussion Hooks - Covers all Discussion-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDiscussions(categoryId?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('discussions').select('*').order('last_activity_at', { ascending: false })
      if (categoryId) query = query.eq('category_id', categoryId)
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [categoryId, status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useDiscussionPosts(discussionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!discussionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('discussion_posts').select('*').eq('discussion_id', discussionId).order('created_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [discussionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function usePinnedDiscussions(categoryId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('discussions').select('*').eq('is_pinned', true).order('pinned_at', { ascending: false })
      if (categoryId) query = query.eq('category_id', categoryId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [categoryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
