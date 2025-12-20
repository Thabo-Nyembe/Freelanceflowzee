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
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!insightId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('insights').select('*').eq('id', insightId).single(); setInsight(data) } finally { setIsLoading(false) }
  }, [insightId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { insight, isLoading, refresh: fetch }
}

export function useInsights(options?: { type?: string; source?: string; created_by?: string; is_public?: boolean; limit?: number }) {
  const [insights, setInsights] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
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
  }, [options?.type, options?.source, options?.created_by, options?.is_public, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { insights, isLoading, refresh: fetch }
}

export function useInsightReports(options?: { created_by?: string; limit?: number }) {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('insight_reports').select('*')
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setReports(data || [])
    } finally { setIsLoading(false) }
  }, [options?.created_by, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { reports, isLoading, refresh: fetch }
}

export function useInsightDashboard(dashboardId?: string) {
  const [dashboard, setDashboard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!dashboardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('insight_dashboards').select('*, insight_widgets(*)').eq('id', dashboardId).single(); setDashboard(data) } finally { setIsLoading(false) }
  }, [dashboardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { dashboard, isLoading, refresh: fetch }
}

export function useInsightDashboards(options?: { created_by?: string; is_public?: boolean }) {
  const [dashboards, setDashboards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('insight_dashboards').select('*')
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      const { data } = await query.order('is_default', { ascending: false }).order('name', { ascending: true })
      setDashboards(data || [])
    } finally { setIsLoading(false) }
  }, [options?.created_by, options?.is_public, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { dashboards, isLoading, refresh: fetch }
}

export function useDashboardWidgets(dashboardId?: string) {
  const [widgets, setWidgets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!dashboardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('insight_widgets').select('*, insights(*)').eq('dashboard_id', dashboardId).order('position', { ascending: true }); setWidgets(data || []) } finally { setIsLoading(false) }
  }, [dashboardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { widgets, isLoading, refresh: fetch }
}

export function useInsightAlerts(options?: { insight_id?: string; created_by?: string; is_active?: boolean }) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('insight_alerts').select('*')
      if (options?.insight_id) query = query.eq('insight_id', options.insight_id)
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false })
      setAlerts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.insight_id, options?.created_by, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { alerts, isLoading, refresh: fetch }
}

export function useInsightSchedules(options?: { created_by?: string; is_active?: boolean }) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('insight_schedules').select('*, insights(*), insight_reports(*)')
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('next_run', { ascending: true })
      setSchedules(data || [])
    } finally { setIsLoading(false) }
  }, [options?.created_by, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { schedules, isLoading, refresh: fetch }
}

export function useDefaultDashboard(userId?: string) {
  const [dashboard, setDashboard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('insight_dashboards').select('*, insight_widgets(*)').eq('created_by', userId).eq('is_default', true).single(); setDashboard(data) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { dashboard, isLoading, refresh: fetch }
}

export function usePublicInsights(limit?: number) {
  const [insights, setInsights] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('insights').select('*').eq('is_public', true).order('view_count', { ascending: false }).limit(limit || 20); setInsights(data || []) } finally { setIsLoading(false) }
  }, [limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { insights, isLoading, refresh: fetch }
}
