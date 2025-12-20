'use client'

/**
 * Extended Thread Hooks - Covers all Thread-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useThreads(channelId?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('threads').select('*').order('last_activity_at', { ascending: false })
      if (channelId) query = query.eq('channel_id', channelId)
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [channelId, status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useThreadMessages(threadId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!threadId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('thread_messages').select('*').eq('thread_id', threadId).order('created_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [threadId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useThreadParticipants(threadId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!threadId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('thread_participants').select('*').eq('thread_id', threadId)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [threadId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
