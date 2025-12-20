'use client'

/**
 * Extended Block Hooks - Covers all Block-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useBlockedUsers(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('blocks').select('*, blocked:profiles!blocked_id(*)').eq('blocker_id', userId).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useIsBlocked(userId?: string, otherUserId?: string) {
  const [blocked, setBlocked] = useState(false)
  const [blockedBy, setBlockedBy] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!userId || !otherUserId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('blocks').select('id, blocker_id').or(`and(blocker_id.eq.${userId},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${userId})`).single()
      if (data) {
        setBlocked(true)
        setBlockedBy(data.blocker_id === userId ? 'me' : 'them')
      } else {
        setBlocked(false)
        setBlockedBy(null)
      }
    } finally { setIsLoading(false) }
  }, [userId, otherUserId, supabase])
  useEffect(() => { check() }, [check])
  return { blocked, blockedBy, isLoading, refresh: check }
}

export function useBlockedIds(userId?: string) {
  const [blockedIds, setBlockedIds] = useState<string[]>([])
  const [blockedByIds, setBlockedByIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [blocked, blockedBy] = await Promise.all([
        supabase.from('blocks').select('blocked_id').eq('blocker_id', userId),
        supabase.from('blocks').select('blocker_id').eq('blocked_id', userId)
      ])
      setBlockedIds(blocked.data?.map(b => b.blocked_id) || [])
      setBlockedByIds(blockedBy.data?.map(b => b.blocker_id) || [])
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { blockedIds, blockedByIds, isLoading, refresh: fetch }
}

export function useBlockCount(userId?: string) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { count: result } = await supabase.from('blocks').select('*', { count: 'exact', head: true }).eq('blocker_id', userId)
      setCount(result || 0)
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { count, isLoading, refresh: fetch }
}
