'use client'

/**
 * Extended Follow Hooks - Covers all Follow-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFollowers(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result, count } = await supabase.from('follows').select('*, follower:profiles!follower_id(*)', { count: 'exact' }).eq('following_id', userId).order('created_at', { ascending: false })
      setData(result || [])
      setTotal(count || 0)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, total, isLoading, refresh: fetch }
}

export function useFollowing(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result, count } = await supabase.from('follows').select('*, following:profiles!following_id(*)', { count: 'exact' }).eq('follower_id', userId).order('created_at', { ascending: false })
      setData(result || [])
      setTotal(count || 0)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, total, isLoading, refresh: fetch }
}

export function useIsFollowing(followerId?: string, followingId?: string) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!followerId || !followingId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('follows').select('id').eq('follower_id', followerId).eq('following_id', followingId).single()
      setIsFollowing(!!data)
    } finally { setIsLoading(false) }
  }, [followerId, followingId])
  useEffect(() => { check() }, [check])
  return { isFollowing, isLoading, refresh: check }
}

export function useFollowCounts(userId?: string) {
  const [followers, setFollowers] = useState(0)
  const [following, setFollowing] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [followersRes, followingRes] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId)
      ])
      setFollowers(followersRes.count || 0)
      setFollowing(followingRes.count || 0)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { followers, following, isLoading, refresh: fetch }
}
