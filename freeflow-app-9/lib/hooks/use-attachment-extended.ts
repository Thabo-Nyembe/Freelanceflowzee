'use client'

/**
 * Extended Attachment Hooks - Covers all Attachment-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAttachments(parentId?: string, parentType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('attachments').select('*').order('created_at', { ascending: false })
      if (parentId) query = query.eq('parent_id', parentId)
      if (parentType) query = query.eq('parent_type', parentType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [parentId, parentType])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAttachmentsByUser(userId?: string, fileType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('attachments').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      if (fileType) query = query.eq('file_type', fileType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, fileType])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAttachmentStats(userId?: string) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('attachments').select('file_type, file_size').eq('user_id', userId)
      const stats = { total_count: data?.length || 0, total_size: data?.reduce((sum, a) => sum + (a.file_size || 0), 0) || 0, by_type: {} as Record<string, number> }
      data?.forEach(a => { stats.by_type[a.file_type] = (stats.by_type[a.file_type] || 0) + 1 })
      setStats(stats)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
