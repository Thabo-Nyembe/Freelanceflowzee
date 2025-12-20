'use client'

/**
 * Extended Friend Hooks - Covers all Friend-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFriends(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result, count } = await supabase.from('friends').select('*', { count: 'exact' }).eq('status', 'accepted').or(`user_id.eq.${userId},friend_id.eq.${userId}`).order('created_at', { ascending: false })
      setData(result || [])
      setTotal(count || 0)
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, total, isLoading, refresh: fetch }
}

export function usePendingFriendRequests(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('friends').select('*').eq('friend_id', userId).eq('status', 'pending').order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useFriendStatus(userId?: string, otherUserId?: string) {
  const [status, setStatus] = useState<string>('none')
  const [isRequester, setIsRequester] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!userId || !otherUserId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('friends').select('status, user_id').or(`and(user_id.eq.${userId},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${userId})`).single()
      if (data) {
        setStatus(data.status)
        setIsRequester(data.user_id === userId)
      } else {
        setStatus('none')
      }
    } finally { setIsLoading(false) }
  }, [userId, otherUserId, supabase])
  useEffect(() => { check() }, [check])
  return { status, isRequester, isLoading, refresh: check }
}

export function useFriendCount(userId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { count: result } = await supabase.from('friends').select('*', { count: 'exact', head: true }).eq('status', 'accepted').or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}
