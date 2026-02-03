'use client'

/**
 * Extended Goals Hooks
 * Tables: goals, goal_milestones, goal_progress, goal_categories, goal_reminders, goal_collaborators
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useGoal(goalId?: string) {
  const [goal, setGoal] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!goalId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('goals').select('*, goal_milestones(*), goal_progress(*), goal_collaborators(*)').eq('id', goalId).single(); setGoal(data) } finally { setIsLoading(false) }
  }, [goalId])
  useEffect(() => { loadData() }, [loadData])
  return { goal, isLoading, refresh: loadData }
}

export function useGoals(options?: { user_id?: string; status?: string; category_id?: string; priority?: string; limit?: number }) {
  const [goals, setGoals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('goals').select('*, goal_categories(*)')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.priority) query = query.eq('priority', options.priority)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setGoals(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.category_id, options?.priority, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { goals, isLoading, refresh: loadData }
}

export function useUserGoals(userId?: string, options?: { status?: string }) {
  const [goals, setGoals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('goals').select('*, goal_categories(*)').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setGoals(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { goals, isLoading, refresh: loadData }
}

export function useGoalMilestones(goalId?: string) {
  const [milestones, setMilestones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!goalId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('goal_milestones').select('*').eq('goal_id', goalId).order('order', { ascending: true }); setMilestones(data || []) } finally { setIsLoading(false) }
  }, [goalId])
  useEffect(() => { loadData() }, [loadData])
  return { milestones, isLoading, refresh: loadData }
}

export function useGoalProgress(goalId?: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  const [progress, setProgress] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!goalId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('goal_progress').select('*').eq('goal_id', goalId)
      if (options?.from_date) query = query.gte('recorded_at', options.from_date)
      if (options?.to_date) query = query.lte('recorded_at', options.to_date)
      const { data } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 50)
      setProgress(data || [])
    } finally { setIsLoading(false) }
  }, [goalId, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { progress, isLoading, refresh: loadData }
}

export function useGoalCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('goal_categories').select('*').order('name', { ascending: true }); setCategories(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { categories, isLoading, refresh: loadData }
}

export function useGoalReminders(goalId?: string) {
  const [reminders, setReminders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!goalId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('goal_reminders').select('*').eq('goal_id', goalId).eq('is_active', true).order('reminder_time', { ascending: true }); setReminders(data || []) } finally { setIsLoading(false) }
  }, [goalId])
  useEffect(() => { loadData() }, [loadData])
  return { reminders, isLoading, refresh: loadData }
}

export function useGoalCollaborators(goalId?: string) {
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!goalId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('goal_collaborators').select('*').eq('goal_id', goalId); setCollaborators(data || []) } finally { setIsLoading(false) }
  }, [goalId])
  useEffect(() => { loadData() }, [loadData])
  return { collaborators, isLoading, refresh: loadData }
}

export function useActiveGoals(userId?: string) {
  const [goals, setGoals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('goals').select('*, goal_categories(*)').eq('user_id', userId).eq('status', 'active').order('target_date', { ascending: true }); setGoals(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { goals, isLoading, refresh: loadData }
}

export function useUpcomingGoals(userId?: string, daysAhead?: number) {
  const [goals, setGoals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + (daysAhead || 30))
      const { data } = await supabase.from('goals').select('*').eq('user_id', userId).eq('status', 'active').lte('target_date', futureDate.toISOString()).order('target_date', { ascending: true })
      setGoals(data || [])
    } finally { setIsLoading(false) }
  }, [userId, daysAhead])
  useEffect(() => { loadData() }, [loadData])
  return { goals, isLoading, refresh: loadData }
}

export function useGoalsByStatus(userId?: string) {
  const [byStatus, setByStatus] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('goals').select('*').eq('user_id', userId)
      const grouped: Record<string, any[]> = {}
      data?.forEach(g => { if (!grouped[g.status]) grouped[g.status] = []; grouped[g.status].push(g) })
      setByStatus(grouped)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { byStatus, isLoading, refresh: loadData }
}
