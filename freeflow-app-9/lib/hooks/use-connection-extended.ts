'use client'

/**
 * Extended Connection Hooks - Covers all Connection-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useConnections(userId?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('connections').select('*').or(`user_id.eq.${userId},connected_user_id.eq.${userId}`).order('created_at', { ascending: false })
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function usePendingConnections(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('connections').select('*').eq('connected_user_id', userId).eq('status', 'pending').order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useConnectionStatus(userId?: string, otherUserId?: string) {
  const [status, setStatus] = useState<string>('none')
  const [isRequester, setIsRequester] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!userId || !otherUserId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('connections').select('status, user_id').or(`and(user_id.eq.${userId},connected_user_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},connected_user_id.eq.${userId})`).single()
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

export function useConnectionCount(userId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { count: result } = await supabase.from('connections').select('*', { count: 'exact', head: true }).eq('status', 'accepted').or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}
