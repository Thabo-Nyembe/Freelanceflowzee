'use client'

/**
 * Extended Habits Hooks
 * Tables: habits, habit_logs, habit_streaks, habit_reminders, habit_categories, habit_templates
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useHabit(habitId?: string) {
  const [habit, setHabit] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!habitId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('habits').select('*, habit_logs(*), habit_streaks(*), habit_reminders(*)').eq('id', habitId).single(); setHabit(data) } finally { setIsLoading(false) }
  }, [habitId])
  useEffect(() => { loadData() }, [loadData])
  return { habit, isLoading, refresh: loadData }
}

export function useHabits(options?: { user_id?: string; category_id?: string; frequency?: string; is_active?: boolean; limit?: number }) {
  const [habits, setHabits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('habits').select('*, habit_categories(*)')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.frequency) query = query.eq('frequency', options.frequency)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setHabits(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.category_id, options?.frequency, options?.is_active, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { habits, isLoading, refresh: loadData }
}

export function useUserHabits(userId?: string, options?: { is_active?: boolean }) {
  const [habits, setHabits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('habits').select('*, habit_categories(*)').eq('user_id', userId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false })
      setHabits(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { habits, isLoading, refresh: loadData }
}

export function useHabitLogs(habitId?: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!habitId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('habit_logs').select('*').eq('habit_id', habitId)
      if (options?.from_date) query = query.gte('completed_at', options.from_date)
      if (options?.to_date) query = query.lte('completed_at', options.to_date)
      const { data } = await query.order('completed_at', { ascending: false }).limit(options?.limit || 100)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [habitId, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { logs, isLoading, refresh: loadData }
}

export function useHabitStreak(habitId?: string) {
  const [streak, setStreak] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!habitId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('habit_streaks').select('*').eq('habit_id', habitId).single(); setStreak(data) } finally { setIsLoading(false) }
  }, [habitId])
  useEffect(() => { loadData() }, [loadData])
  return { streak, isLoading, refresh: loadData }
}

export function useHabitReminders(habitId?: string) {
  const [reminders, setReminders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!habitId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('habit_reminders').select('*').eq('habit_id', habitId).eq('is_active', true); setReminders(data || []) } finally { setIsLoading(false) }
  }, [habitId])
  useEffect(() => { loadData() }, [loadData])
  return { reminders, isLoading, refresh: loadData }
}

export function useHabitCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('habit_categories').select('*').order('name', { ascending: true }); setCategories(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { categories, isLoading, refresh: loadData }
}

export function useHabitTemplates(options?: { category_id?: string }) {
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('habit_templates').select('*')
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      const { data } = await query.order('name', { ascending: true })
      setTemplates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category_id])
  useEffect(() => { loadData() }, [loadData])
  return { templates, isLoading, refresh: loadData }
}

export function useTodaysHabits(userId?: string) {
  const [habits, setHabits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data: habitsData } = await supabase.from('habits').select('*').eq('user_id', userId).eq('is_active', true)
      const { data: logs } = await supabase.from('habit_logs').select('habit_id').eq('user_id', userId).gte('completed_at', `${today}T00:00:00`).lte('completed_at', `${today}T23:59:59`)
      const completedIds = new Set(logs?.map(l => l.habit_id))
      const habitsWithStatus = habitsData?.map(h => ({ ...h, completedToday: completedIds.has(h.id) }))
      setHabits(habitsWithStatus || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { habits, isLoading, refresh: loadData }
}

export function useWeeklyHabitStats(userId?: string) {
  const [stats, setStats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { data } = await supabase.from('habit_logs').select('*, habits(name)').eq('user_id', userId).gte('completed_at', weekAgo.toISOString()).order('completed_at', { ascending: true })
      setStats(data || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}
