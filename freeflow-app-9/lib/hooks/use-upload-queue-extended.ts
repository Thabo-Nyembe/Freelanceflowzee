'use client'

/**
 * Extended Upload Queue Hooks - Covers all Upload Queue-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUploadQueue(userId?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('upload_queue').select('*').order('created_at', { ascending: false })
      if (userId) query = query.eq('user_id', userId)
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, status])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUploadProgress(uploadId?: string) {
  const [progress, setProgress] = useState<number>(0)
  const [status, setStatus] = useState<string>('pending')
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!uploadId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('upload_queue').select('progress, status').eq('id', uploadId).single()
      setProgress(data?.progress || 0)
      setStatus(data?.status || 'pending')
    } finally { setIsLoading(false) }
  }, [uploadId])
  useEffect(() => { fetch() }, [fetch])
  useEffect(() => {
    if (!uploadId) return
    const channel = supabase.channel(`upload-${uploadId}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'upload_queue', filter: `id=eq.${uploadId}` }, (payload) => { setProgress(payload.new.progress || 0); setStatus(payload.new.status || 'pending') }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [uploadId])
  return { progress, status, isLoading, refresh: fetch }
}

export function useChunkedUploads(uploadId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!uploadId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('upload_chunks').select('*').eq('upload_id', uploadId).order('chunk_index', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [uploadId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
