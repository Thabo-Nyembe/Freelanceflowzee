'use client'

/**
 * Extended Reply Hooks - Covers all Reply-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useReplies(parentId?: string, parentType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('replies').select('*').order('created_at', { ascending: true })
      if (parentId) query = query.eq('parent_id', parentId)
      if (parentType) query = query.eq('parent_type', parentType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [parentId, parentType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useReplyCount(parentId?: string, parentType?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!parentId || !parentType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { count: result } = await supabase.from('replies').select('*', { count: 'exact', head: true }).eq('parent_id', parentId).eq('parent_type', parentType)
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [parentId, parentType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}

export function useNestedReplies(replyId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!replyId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('replies').select('*').eq('reply_to_id', replyId).order('created_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [replyId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
