'use client'

/**
 * Extended Creator Hooks
 * Tables: creators, creator_profiles, creator_content, creator_earnings, creator_followers
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCreator(creatorId?: string) {
  const [creator, setCreator] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!creatorId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('creators').select('*, creator_profiles(*)').eq('id', creatorId).single(); setCreator(data) } finally { setIsLoading(false) }
  }, [creatorId])
  useEffect(() => { fetch() }, [fetch])
  return { creator, isLoading, refresh: fetch }
}

export function useCreators(options?: { category?: string; is_verified?: boolean; search?: string; limit?: number }) {
  const [creators, setCreators] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('creators').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_verified !== undefined) query = query.eq('is_verified', options.is_verified)
      if (options?.search) query = query.ilike('display_name', `%${options.search}%`)
      const { data } = await query.order('follower_count', { ascending: false }).limit(options?.limit || 50)
      setCreators(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_verified, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { creators, isLoading, refresh: fetch }
}

export function useCreatorContent(creatorId?: string, options?: { type?: string; status?: string; limit?: number }) {
  const [content, setContent] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!creatorId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('creator_content').select('*').eq('creator_id', creatorId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setContent(data || [])
    } finally { setIsLoading(false) }
  }, [creatorId, options?.type, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { content, isLoading, refresh: fetch }
}

export function useCreatorFollowers(creatorId?: string) {
  const [followers, setFollowers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!creatorId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('creator_followers').select('*, users:user_id(*)').eq('creator_id', creatorId).order('followed_at', { ascending: false }); setFollowers(data || []) } finally { setIsLoading(false) }
  }, [creatorId])
  useEffect(() => { fetch() }, [fetch])
  return { followers, isLoading, refresh: fetch }
}

export function useIsFollowing(creatorId?: string, userId?: string) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!creatorId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('creator_followers').select('id').eq('creator_id', creatorId).eq('user_id', userId).single(); setIsFollowing(!!data) } finally { setIsLoading(false) }
  }, [creatorId, userId])
  useEffect(() => { check() }, [check])
  return { isFollowing, isLoading, recheck: check }
}

export function useCreatorEarnings(creatorId?: string, options?: { date_from?: string; date_to?: string }) {
  const [earnings, setEarnings] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!creatorId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('creator_earnings').select('*').eq('creator_id', creatorId)
      if (options?.date_from) query = query.gte('earned_at', options.date_from)
      if (options?.date_to) query = query.lte('earned_at', options.date_to)
      const { data } = await query.order('earned_at', { ascending: false })
      setEarnings(data || [])
      setTotal(data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0)
    } finally { setIsLoading(false) }
  }, [creatorId, options?.date_from, options?.date_to])
  useEffect(() => { fetch() }, [fetch])
  return { earnings, total, isLoading, refresh: fetch }
}

export function useTopCreators(limit?: number) {
  const [creators, setCreators] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('creators').select('*').eq('is_verified', true).order('follower_count', { ascending: false }).limit(limit || 10); setCreators(data || []) } finally { setIsLoading(false) }
  }, [limit])
  useEffect(() => { fetch() }, [fetch])
  return { creators, isLoading, refresh: fetch }
}

export function useCreatorStats(creatorId?: string) {
  const [stats, setStats] = useState<{ totalContent: number; totalViews: number; totalLikes: number; totalEarnings: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!creatorId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: content } = await supabase.from('creator_content').select('view_count, like_count').eq('creator_id', creatorId)
      const { data: earnings } = await supabase.from('creator_earnings').select('amount').eq('creator_id', creatorId)
      const totalContent = content?.length || 0
      const totalViews = content?.reduce((sum, c) => sum + (c.view_count || 0), 0) || 0
      const totalLikes = content?.reduce((sum, c) => sum + (c.like_count || 0), 0) || 0
      const totalEarnings = earnings?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0
      setStats({ totalContent, totalViews, totalLikes, totalEarnings })
    } finally { setIsLoading(false) }
  }, [creatorId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
