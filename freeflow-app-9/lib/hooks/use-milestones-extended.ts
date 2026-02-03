'use client'

/**
 * Extended Milestones Hooks
 * Tables: milestones, milestone_tasks, milestone_dependencies, milestone_progress, milestone_updates
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

export function useMilestone(milestoneId?: string) {
  const [milestone, setMilestone] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    // In demo mode, return empty data to avoid unauthenticated Supabase queries
    // Demo data is fetched via API routes instead
    // Demo mode: fetch data with demo=true parameter
    if (!milestoneId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('milestones').select('*, milestone_tasks(*), milestone_dependencies(*), milestone_updates(*)').eq('id', milestoneId).single(); setMilestone(data) } finally { setIsLoading(false) }
  }, [milestoneId])
  useEffect(() => { loadData() }, [loadData])
  return { milestone, isLoading, refresh: loadData }
}

export function useMilestones(projectId?: string, options?: { status?: string; owner_id?: string; priority?: string; limit?: number }) {
  const [milestones, setMilestones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    // In demo mode, return empty data to avoid unauthenticated Supabase queries
    // Demo data is fetched via API routes instead
    // Demo mode: fetch data with demo=true parameter
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('milestones').select('*, milestone_tasks(*)').eq('project_id', projectId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.priority) query = query.eq('priority', options.priority)
      const { data } = await query.order('due_date', { ascending: true }).limit(options?.limit || 50)
      setMilestones(data || [])
    } finally { setIsLoading(false) }
  }, [projectId, options?.status, options?.owner_id, options?.priority, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { milestones, isLoading, refresh: loadData }
}

export function useMilestoneTasks(milestoneId?: string, options?: { status?: string; assignee_id?: string }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    // In demo mode, return empty data to avoid unauthenticated Supabase queries
    // Demo data is fetched via API routes instead
    // Demo mode: fetch data with demo=true parameter
    if (!milestoneId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('milestone_tasks').select('*').eq('milestone_id', milestoneId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.assignee_id) query = query.eq('assignee_id', options.assignee_id)
      const { data } = await query.order('due_date', { ascending: true })
      setTasks(data || [])
    } finally { setIsLoading(false) }
  }, [milestoneId, options?.status, options?.assignee_id])
  useEffect(() => { loadData() }, [loadData])
  return { tasks, isLoading, refresh: loadData }
}

export function useMilestoneDependencies(milestoneId?: string) {
  const [dependencies, setDependencies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    // In demo mode, return empty data to avoid unauthenticated Supabase queries
    // Demo data is fetched via API routes instead
    // Demo mode: fetch data with demo=true parameter
    if (!milestoneId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('milestone_dependencies').select('*, milestones!depends_on_id(*)').eq('milestone_id', milestoneId); setDependencies(data || []) } finally { setIsLoading(false) }
  }, [milestoneId])
  useEffect(() => { loadData() }, [loadData])
  return { dependencies, isLoading, refresh: loadData }
}

export function useMilestoneProgress(milestoneId?: string, options?: { limit?: number }) {
  const [progress, setProgress] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    // In demo mode, return empty data to avoid unauthenticated Supabase queries
    // Demo data is fetched via API routes instead
    // Demo mode: fetch data with demo=true parameter
    if (!milestoneId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('milestone_progress').select('*').eq('milestone_id', milestoneId).order('recorded_at', { ascending: false }).limit(options?.limit || 50); setProgress(data || []) } finally { setIsLoading(false) }
  }, [milestoneId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { progress, isLoading, refresh: loadData }
}

export function useMilestoneUpdates(milestoneId?: string, options?: { limit?: number }) {
  const [updates, setUpdates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    // In demo mode, return empty data to avoid unauthenticated Supabase queries
    // Demo data is fetched via API routes instead
    // Demo mode: fetch data with demo=true parameter
    if (!milestoneId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('milestone_updates').select('*').eq('milestone_id', milestoneId).order('created_at', { ascending: false }).limit(options?.limit || 20); setUpdates(data || []) } finally { setIsLoading(false) }
  }, [milestoneId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { updates, isLoading, refresh: loadData }
}

export function useUpcomingMilestones(projectId?: string, options?: { days?: number; limit?: number }) {
  const [milestones, setMilestones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    // In demo mode, return empty data to avoid unauthenticated Supabase queries
    // Demo data is fetched via API routes instead
    // Demo mode: fetch data with demo=true parameter
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const now = new Date()
      const futureDate = new Date()
      futureDate.setDate(now.getDate() + (options?.days || 30))
      const { data } = await supabase.from('milestones').select('*, milestone_tasks(*)').eq('project_id', projectId).in('status', ['pending', 'in_progress']).gte('due_date', now.toISOString()).lte('due_date', futureDate.toISOString()).order('due_date', { ascending: true }).limit(options?.limit || 10)
      setMilestones(data || [])
    } finally { setIsLoading(false) }
  }, [projectId, options?.days, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { milestones, isLoading, refresh: loadData }
}

export function useOverdueMilestones(projectId?: string) {
  const [milestones, setMilestones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    // In demo mode, return empty data to avoid unauthenticated Supabase queries
    // Demo data is fetched via API routes instead
    // Demo mode: fetch data with demo=true parameter
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('milestones').select('*, milestone_tasks(*)').eq('project_id', projectId).in('status', ['pending', 'in_progress']).lt('due_date', new Date().toISOString()).order('due_date', { ascending: true }); setMilestones(data || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { milestones, isLoading, refresh: loadData }
}

export function useProjectMilestoneStats(projectId?: string) {
  const [stats, setStats] = useState<{ total: number; completed: number; inProgress: number; pending: number; overdue: number; avgProgress: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    // In demo mode, return empty data to avoid unauthenticated Supabase queries
    // Demo data is fetched via API routes instead
    // Demo mode: fetch data with demo=true parameter
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('milestones').select('status, progress, due_date').eq('project_id', projectId)
      const now = new Date()
      const total = data?.length || 0
      const completed = data?.filter(m => m.status === 'completed').length || 0
      const inProgress = data?.filter(m => m.status === 'in_progress').length || 0
      const pending = data?.filter(m => m.status === 'pending').length || 0
      const overdue = data?.filter(m => m.status !== 'completed' && new Date(m.due_date) < now).length || 0
      const avgProgress = total ? (data?.reduce((sum, m) => sum + (m.progress || 0), 0) || 0) / total : 0
      setStats({ total, completed, inProgress, pending, overdue, avgProgress })
    } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}
