'use client'

/**
 * Extended Dashboard Hooks - Covers all 11 Dashboard-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

// Type definitions for dashboard entities
export interface DashboardActivity {
  id: string
  user_id: string
  activity_type: string
  title: string
  description: string | null
  metadata: Record<string, JsonValue> | null
  created_at: string
}

export interface DashboardGoalMilestone {
  id: string
  goal_id: string
  title: string
  target_date: string
  is_completed: boolean
  completed_at: string | null
  created_at: string
}

export interface DashboardGoal {
  id: string
  user_id: string
  title: string
  description: string | null
  target_value: number | null
  current_value: number | null
  goal_type: string
  status: string
  start_date: string | null
  end_date: string | null
  created_at: string
}

export interface DashboardInsight {
  id: string
  user_id: string
  insight_type: string
  title: string
  description: string
  priority: number
  is_active: boolean
  metadata: Record<string, JsonValue> | null
  created_at: string
}

export interface DashboardMetric {
  id: string
  dashboard_id: string
  metric_name: string
  metric_value: number | string
  metric_type: string
  order_index: number
  config: Record<string, JsonValue> | null
  created_at: string
}

export interface DashboardNotification {
  id: string
  user_id: string
  title: string
  message: string
  notification_type: string
  is_read: boolean
  link: string | null
  created_at: string
}

export interface DashboardProject {
  id: string
  user_id: string
  name: string
  status: string
  progress: number
  priority: string | null
  deadline: string | null
  updated_at: string
  created_at: string
}

export interface DashboardQuickAction {
  id: string
  user_id: string
  action_type: string
  label: string
  icon: string | null
  path: string | null
  order_index: number
  is_enabled: boolean
  created_at: string
}

export interface DashboardStat {
  id: string
  user_id: string
  total_projects: number
  active_projects: number
  completed_projects: number
  total_revenue: number
  pending_revenue: number
  total_clients: number
  active_clients: number
  updated_at: string
}

export interface DashboardTimelineEvent {
  id: string
  user_id: string
  event_type: string
  title: string
  description: string | null
  event_date: string
  metadata: Record<string, JsonValue> | null
  created_at: string
}

export interface Dashboard {
  id: string
  user_id: string
  name: string
  description: string | null
  type: string | null
  is_default: boolean
  is_public: boolean
  layout: Record<string, JsonValue> | null
  created_at: string
  updated_at: string
}

export function useDashboardActivities(userId?: string) {
  const [data, setData] = useState<DashboardActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('dashboard_activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useDashboardGoalMilestones(goalId?: string) {
  const [data, setData] = useState<DashboardGoalMilestone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!goalId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('dashboard_goal_milestones').select('*').eq('goal_id', goalId).order('target_date', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [goalId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useDashboardGoals(userId?: string) {
  const [data, setData] = useState<DashboardGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('dashboard_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useDashboardInsights(userId?: string) {
  const [data, setData] = useState<DashboardInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('dashboard_insights').select('*').eq('user_id', userId).eq('is_active', true).order('priority', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useDashboardMetrics(dashboardId?: string) {
  const [data, setData] = useState<DashboardMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!dashboardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('dashboard_metrics').select('*').eq('dashboard_id', dashboardId).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [dashboardId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useDashboardNotifications(userId?: string) {
  const [data, setData] = useState<DashboardNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('dashboard_notifications').select('*').eq('user_id', userId).eq('is_read', false).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useDashboardProjects(userId?: string) {
  const [data, setData] = useState<DashboardProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('dashboard_projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useDashboardQuickActions(userId?: string) {
  const [data, setData] = useState<DashboardQuickAction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('dashboard_quick_actions').select('*').eq('user_id', userId).eq('is_enabled', true).order('order_index', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useDashboardStats(userId?: string) {
  const [data, setData] = useState<DashboardStat | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('dashboard_stats').select('*').eq('user_id', userId).single(); setData(result) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useDashboardTimelineEvents(userId?: string) {
  const [data, setData] = useState<DashboardTimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('dashboard_timeline_events').select('*').eq('user_id', userId).order('event_date', { ascending: false }).limit(20); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useDashboards(userId?: string) {
  const [data, setData] = useState<Dashboard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('dashboards').select('*').eq('user_id', userId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
