'use client'

/**
 * Extended Insights Hooks
 * Tables: insights, insight_reports, insight_dashboards, insight_widgets, insight_alerts, insight_schedules
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useInsight(insightId?: string) {
  const [insight, setInsight] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!insightId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('insights').select('*').eq('id', insightId).single(); setInsight(data) } finally { setIsLoading(false) }
  }, [insightId])
  useEffect(() => { loadData() }, [loadData])
  return { insight, isLoading, refresh: loadData }
}

export function useInsights(options?: { type?: string; source?: string; created_by?: string; is_public?: boolean; limit?: number }) {
  const [insights, setInsights] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('insights').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.source) query = query.eq('source', options.source)
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setInsights(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.source, options?.created_by, options?.is_public, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { insights, isLoading, refresh: loadData }
}

export function useInsightReports(options?: { created_by?: string; limit?: number }) {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('insight_reports').select('*')
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setReports(data || [])
    } finally { setIsLoading(false) }
  }, [options?.created_by, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { reports, isLoading, refresh: loadData }
}

export function useInsightDashboard(dashboardId?: string) {
  const [dashboard, setDashboard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!dashboardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('insight_dashboards').select('*, insight_widgets(*)').eq('id', dashboardId).single(); setDashboard(data) } finally { setIsLoading(false) }
  }, [dashboardId])
  useEffect(() => { loadData() }, [loadData])
  return { dashboard, isLoading, refresh: loadData }
}

export function useInsightDashboards(options?: { created_by?: string; is_public?: boolean }) {
  const [dashboards, setDashboards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('insight_dashboards').select('*')
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      const { data } = await query.order('is_default', { ascending: false }).order('name', { ascending: true })
      setDashboards(data || [])
    } finally { setIsLoading(false) }
  }, [options?.created_by, options?.is_public])
  useEffect(() => { loadData() }, [loadData])
  return { dashboards, isLoading, refresh: loadData }
}

export function useDashboardWidgets(dashboardId?: string) {
  const [widgets, setWidgets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!dashboardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('insight_widgets').select('*, insights(*)').eq('dashboard_id', dashboardId).order('position', { ascending: true }); setWidgets(data || []) } finally { setIsLoading(false) }
  }, [dashboardId])
  useEffect(() => { loadData() }, [loadData])
  return { widgets, isLoading, refresh: loadData }
}

export function useInsightAlerts(options?: { insight_id?: string; created_by?: string; is_active?: boolean }) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('insight_alerts').select('*')
      if (options?.insight_id) query = query.eq('insight_id', options.insight_id)
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false })
      setAlerts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.insight_id, options?.created_by, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { alerts, isLoading, refresh: loadData }
}

export function useInsightSchedules(options?: { created_by?: string; is_active?: boolean }) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('insight_schedules').select('*, insights(*), insight_reports(*)')
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('next_run', { ascending: true })
      setSchedules(data || [])
    } finally { setIsLoading(false) }
  }, [options?.created_by, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { schedules, isLoading, refresh: loadData }
}

export function useDefaultDashboard(userId?: string) {
  const [dashboard, setDashboard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('insight_dashboards').select('*, insight_widgets(*)').eq('created_by', userId).eq('is_default', true).single(); setDashboard(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { dashboard, isLoading, refresh: loadData }
}

export function usePublicInsights(limit?: number) {
  const [insights, setInsights] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('insights').select('*').eq('is_public', true).order('view_count', { ascending: false }).limit(limit || 20); setInsights(data || []) } finally { setIsLoading(false) }
  }, [limit])
  useEffect(() => { loadData() }, [loadData])
  return { insights, isLoading, refresh: loadData }
}
