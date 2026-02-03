'use client'

/**
 * Extended Gamification Hooks
 * Tables: gamification_points, gamification_badges, gamification_achievements, gamification_leaderboards, gamification_rewards, gamification_challenges
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUserPoints(userId?: string) {
  const [points, setPoints] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('gamification_points').select('*').eq('user_id', userId).single(); setPoints(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { points, isLoading, refresh: loadData }
}

export function usePointsHistory(userId?: string, options?: { limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('gamification_points_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 50); setHistory(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { history, isLoading, refresh: loadData }
}

export function useBadges(options?: { category?: string; rarity?: string }) {
  const [badges, setBadges] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('gamification_badges').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.rarity) query = query.eq('rarity', options.rarity)
      const { data } = await query.order('name', { ascending: true })
      setBadges(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.rarity])
  useEffect(() => { loadData() }, [loadData])
  return { badges, isLoading, refresh: loadData }
}

export function useUserBadges(userId?: string) {
  const [badges, setBadges] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('user_badges').select('*, gamification_badges(*)').eq('user_id', userId).order('awarded_at', { ascending: false }); setBadges(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { badges, isLoading, refresh: loadData }
}

export function useAchievements(options?: { category?: string; is_active?: boolean }) {
  const [achievements, setAchievements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('gamification_achievements').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('points', { ascending: false })
      setAchievements(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { achievements, isLoading, refresh: loadData }
}

export function useUserAchievements(userId?: string) {
  const [achievements, setAchievements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('user_achievements').select('*, gamification_achievements(*)').eq('user_id', userId).order('unlocked_at', { ascending: false }); setAchievements(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { achievements, isLoading, refresh: loadData }
}

export function useLeaderboard(type: string, options?: { period?: string; limit?: number }) {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('gamification_leaderboards').select('*').eq('type', type)
      if (options?.period) query = query.eq('period', options.period)
      const { data } = await query.order('rank', { ascending: true }).limit(options?.limit || 100)
      setLeaderboard(data || [])
    } finally { setIsLoading(false) }
  }, [type, options?.period, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { leaderboard, isLoading, refresh: loadData }
}

export function useUserRank(userId?: string, type?: string) {
  const [rank, setRank] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !type) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('gamification_leaderboards').select('*').eq('user_id', userId).eq('type', type).single(); setRank(data) } finally { setIsLoading(false) }
  }, [userId, type])
  useEffect(() => { loadData() }, [loadData])
  return { rank, isLoading, refresh: loadData }
}

export function useActiveChallenges() {
  const [challenges, setChallenges] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const now = new Date().toISOString()
      const { data } = await supabase.from('gamification_challenges').select('*').eq('is_active', true).lte('start_date', now).gte('end_date', now).order('end_date', { ascending: true })
      setChallenges(data || [])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { challenges, isLoading, refresh: loadData }
}

export function useUserChallenges(userId?: string) {
  const [challenges, setChallenges] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('challenge_participants').select('*, gamification_challenges(*)').eq('user_id', userId).order('joined_at', { ascending: false }); setChallenges(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { challenges, isLoading, refresh: loadData }
}

export function useRewards(options?: { category?: string; is_available?: boolean }) {
  const [rewards, setRewards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('gamification_rewards').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_available !== undefined) query = query.eq('is_available', options.is_available)
      const { data } = await query.order('points_required', { ascending: true })
      setRewards(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_available])
  useEffect(() => { loadData() }, [loadData])
  return { rewards, isLoading, refresh: loadData }
}
