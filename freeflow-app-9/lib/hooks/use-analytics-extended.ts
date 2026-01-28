'use client'

/**
 * Extended Analytics Hooks - Covers all 21 Analytics-related tables
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

export function useAnalyticsAIUsage(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_ai_usage').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsAlerts(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_alerts').select('*').eq('user_id', userId).eq('is_active', true); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsCohorts(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_cohorts').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsConversionFunnels(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    // Note: analytics_conversion_funnels is aggregate data without user_id column
    try { const { data: result } = await supabase.from('analytics_conversion_funnels').select('*').order('date', { ascending: false }).limit(50); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsDailyMetrics(userId?: string, days = 30) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_daily_metrics').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(days); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, days])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsDashboardFilters(dashboardId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!dashboardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_dashboard_filters').select('*').eq('dashboard_id', dashboardId); setData(result || []) } finally { setIsLoading(false) }
  }, [dashboardId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsDashboardWidgets(dashboardId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!dashboardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_dashboard_widgets').select('*').eq('dashboard_id', dashboardId).order('position', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [dashboardId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsDashboards(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_dashboards').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsEvents(userId?: string, limit = 100) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, limit])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsFeatureUsage(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_feature_usage').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsFunnelStages(funnelId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!funnelId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_funnel_stages').select('*').eq('funnel_id', funnelId).order('stage_order', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [funnelId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsGoals(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_goals').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsInsights(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_insights').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsMetrics(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_metrics').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsMonthlyMetrics(userId?: string, months = 12) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_monthly_metrics').select('*').eq('user_id', userId).order('month', { ascending: false }).limit(months); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, months])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsPlatformMetrics() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_platform_metrics').select('*').order('created_at', { ascending: false }).limit(100); setData(result || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsRealtimeMetrics() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_realtime_metrics').select('*').order('timestamp', { ascending: false }).limit(100); setData(result || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsReports(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_reports').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsRevenue(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_revenue').select('*').eq('user_id', userId).order('date', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsSegments(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_segments').select('*').eq('user_id', userId); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useAnalyticsUserActivity(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
    if (isDemoModeEnabled()) { setIsLoading(false); return }
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('analytics_user_activity').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
