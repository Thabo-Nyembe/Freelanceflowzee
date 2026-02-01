'use client'

/**
 * Extended Achievements Hooks - Covers all Achievement-related tables
 * Tables: achievements
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAchievement(achievementId?: string) {
  const [achievement, setAchievement] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!achievementId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('achievements').select('*').eq('id', achievementId).single()
      setAchievement(data)
    } finally { setIsLoading(false) }
  }, [achievementId])
  useEffect(() => { fetch() }, [fetch])
  return { achievement, isLoading, refresh: fetch }
}

export function useAchievements(options?: { category?: string; isActive?: boolean; limit?: number }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('achievements').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      const { data: result } = await query.order('points', { ascending: false }).limit(options?.limit || 100)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.isActive, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useUserAchievements(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('user_achievements').select('*, achievements(*)').eq('user_id', userId).order('earned_at', { ascending: false })
      setData(result || [])
      const points = result?.reduce((sum, ua) => sum + (ua.achievements?.points || 0), 0) || 0
      setTotalPoints(points)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, totalPoints, isLoading, refresh: fetch }
}

export function useAchievementProgress(userId?: string, achievementId?: string) {
  const [progress, setProgress] = useState<{ isEarned: boolean; requirements: any } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !achievementId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [achievementRes, earnedRes] = await Promise.all([
        supabase.from('achievements').select('requirements').eq('id', achievementId).single(),
        supabase.from('user_achievements').select('id').eq('user_id', userId).eq('achievement_id', achievementId).single()
      ])
      setProgress({ isEarned: !!earnedRes.data, requirements: achievementRes.data?.requirements })
    } finally { setIsLoading(false) }
  }, [userId, achievementId])
  useEffect(() => { fetch() }, [fetch])
  return { progress, isLoading, refresh: fetch }
}

export function useAchievementsByCategory() {
  const [categories, setCategories] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('achievements').select('*').eq('is_active', true).order('category')
      const grouped: Record<string, any[]> = {}
      data?.forEach(a => {
        const cat = a.category || 'general'
        if (!grouped[cat]) grouped[cat] = []
        grouped[cat].push(a)
      })
      setCategories(grouped)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useRecentAchievements(userId?: string, limit?: number) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('user_achievements').select('*, achievements(*)').eq('user_id', userId).order('earned_at', { ascending: false }).limit(limit || 5)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, limit])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAchievementsRealtime(userId?: string) {
  const [achievements, setAchievements] = useState<any[]>([])
  const [newAchievement, setNewAchievement] = useState<any>(null)
  const supabase = createClient()
  useEffect(() => {
    if (!userId) return
    supabase.from('user_achievements').select('*, achievements(*)').eq('user_id', userId).order('earned_at', { ascending: false }).then(({ data }) => setAchievements(data || []))
    const channel = supabase.channel(`achievements_${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_achievements', filter: `user_id=eq.${userId}` }, async (payload) => {
        const { data: full } = await supabase.from('user_achievements').select('*, achievements(*)').eq('id', (payload.new as Record<string, unknown>).id).single()
        if (full) {
          setAchievements(prev => [full, ...prev])
          setNewAchievement(full)
          setTimeout(() => setNewAchievement(null), 5000)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])
  return { achievements, newAchievement }
}
