'use client'

/**
 * Extended Comment Hooks - Covers all Comment-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

/**
 * Comment record from the comments table
 */
export interface CommentRecord {
  id: string
  user_id: string
  resource_type: string
  resource_id: string
  parent_id?: string | null
  content: string
  created_at: string
  updated_at?: string
  metadata?: Record<string, JsonValue>
}

export function useComments(resourceType?: string, resourceId?: string) {
  const [data, setData] = useState<CommentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!resourceType || !resourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('comments').select('*').eq('resource_type', resourceType).eq('resource_id', resourceId).order('created_at', { ascending: true }); setData((result as CommentRecord[]) || []) } finally { setIsLoading(false) }
  }, [resourceType, resourceId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommentReplies(parentId?: string) {
  const [data, setData] = useState<CommentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!parentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('comments').select('*').eq('parent_id', parentId).order('created_at', { ascending: true }); setData((result as CommentRecord[]) || []) } finally { setIsLoading(false) }
  }, [parentId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
