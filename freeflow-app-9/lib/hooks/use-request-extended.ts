'use client'

/**
 * Extended Request Hooks - Covers all Request-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRequests(userId?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('requests').select('*').order('created_at', { ascending: false }).limit(50)
      if (userId) query = query.or(`requester_id.eq.${userId},assignee_id.eq.${userId}`)
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useRequestById(requestId?: string) {
  const [request, setRequest] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!requestId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('requests').select('*').eq('id', requestId).single()
      setRequest(data)
    } finally { setIsLoading(false) }
  }, [requestId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { request, isLoading, refresh: fetch }
}

export function useRequestCount(userId?: string, status?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('requests').select('*', { count: 'exact', head: true }).or(`requester_id.eq.${userId},assignee_id.eq.${userId}`)
      if (status) query = query.eq('status', status)
      const { count: result } = await query
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [userId, status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}
