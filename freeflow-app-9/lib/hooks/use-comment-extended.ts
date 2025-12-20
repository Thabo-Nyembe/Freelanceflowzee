'use client'

/**
 * Extended Comment Hooks - Covers all Comment-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useComments(resourceType?: string, resourceId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!resourceType || !resourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('comments').select('*').eq('resource_type', resourceType).eq('resource_id', resourceId).order('created_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [resourceType, resourceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCommentReplies(parentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!parentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('comments').select('*').eq('parent_id', parentId).order('created_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [parentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
