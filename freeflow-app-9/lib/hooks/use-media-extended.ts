'use client'

/**
 * Extended Media Hooks - Covers all Media-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMedia(userId?: string, mediaType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('media').select('*').order('created_at', { ascending: false })
      if (userId) query = query.eq('user_id', userId)
      if (mediaType) query = query.eq('media_type', mediaType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, mediaType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useMediaMetadata(mediaId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!mediaId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('media_metadata').select('*').eq('media_id', mediaId).single(); setData(result) } finally { setIsLoading(false) }
  }, [mediaId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
