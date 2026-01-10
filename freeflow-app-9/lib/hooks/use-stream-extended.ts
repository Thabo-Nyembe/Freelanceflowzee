'use client'

/**
 * Extended Stream Hooks - Covers all Stream-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStreams(userId?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('streams').select('*').order('created_at', { ascending: false }).limit(50)
      if (userId) query = query.eq('user_id', userId)
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useLiveStreams() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('streams').select('*').eq('status', 'live').order('viewer_count', { ascending: false }).limit(20)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useStreamById(streamId?: string) {
  const [stream, setStream] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!streamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('streams').select('*').eq('id', streamId).single()
      setStream(data)
    } finally { setIsLoading(false) }
  }, [streamId])
  useEffect(() => { fetch() }, [fetch])
  return { stream, isLoading, refresh: fetch }
}

export function useStreamChats(streamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!streamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('stream_chats').select('*').eq('stream_id', streamId).order('created_at', { ascending: true }).limit(100)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [streamId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
