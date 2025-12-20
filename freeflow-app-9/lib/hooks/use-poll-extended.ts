'use client'

/**
 * Extended Poll Hooks - Covers all Poll-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePolls(userId?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('polls').select('*').order('created_at', { ascending: false })
      if (userId) query = query.eq('user_id', userId)
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function usePollOptions(pollId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!pollId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('poll_options').select('*').eq('poll_id', pollId).order('sort_order', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [pollId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function usePollVotes(pollId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!pollId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('poll_votes').select('*').eq('poll_id', pollId)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [pollId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUserPollVote(userId?: string, pollId?: string) {
  const [vote, setVote] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId || !pollId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('poll_votes').select('*').eq('user_id', userId).eq('poll_id', pollId).single()
      setVote(data)
    } finally { setIsLoading(false) }
  }, [userId, pollId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { vote, isLoading, refresh: fetch }
}
