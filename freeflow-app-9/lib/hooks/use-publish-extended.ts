'use client'

/**
 * Extended Publish Hooks - Covers all Publish-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePublications(userId?: string, entityType?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('publications').select('*').order('published_at', { ascending: false }).limit(50)
      if (userId) query = query.eq('user_id', userId)
      if (entityType) query = query.eq('entity_type', entityType)
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, entityType, status])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function usePublicationStatus(entityId?: string, entityType?: string) {
  const [status, setStatus] = useState<string | null>(null)
  const [isPublished, setIsPublished] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!entityId || !entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('publications').select('status').eq('entity_id', entityId).eq('entity_type', entityType).single()
      setStatus(data?.status || null)
      setIsPublished(data?.status === 'published')
    } finally { setIsLoading(false) }
  }, [entityId, entityType])
  useEffect(() => { fetch() }, [fetch])
  return { status, isPublished, isLoading, refresh: fetch }
}

export function useScheduledPublications() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('publications').select('*').eq('status', 'scheduled').order('scheduled_at', { ascending: true }).limit(50)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
