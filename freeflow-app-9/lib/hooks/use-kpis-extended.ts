'use client'

/**
 * Extended KPIs Hooks
 * Tables: kpis, kpi_targets, kpi_values, kpi_categories, kpi_dashboards, kpi_alerts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useKpi(kpiId?: string) {
  const [kpi, setKpi] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!kpiId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('kpis').select('*, kpi_targets(*), kpi_values(*)').eq('id', kpiId).single(); setKpi(data) } finally { setIsLoading(false) }
  }, [kpiId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { kpi, isLoading, refresh: fetch }
}

export function useKpis(options?: { organization_id?: string; category_id?: string; status?: string }) {
  const [kpis, setKpis] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('kpis').select('*, kpi_categories(*)')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('name', { ascending: true })
      setKpis(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.category_id, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { kpis, isLoading, refresh: fetch }
}

export function useKpiValues(kpiId?: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  const [values, setValues] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!kpiId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('kpi_values').select('*').eq('kpi_id', kpiId)
      if (options?.from_date) query = query.gte('period_start', options.from_date)
      if (options?.to_date) query = query.lte('period_end', options.to_date)
      const { data } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 100)
      setValues(data || [])
    } finally { setIsLoading(false) }
  }, [kpiId, options?.from_date, options?.to_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { values, isLoading, refresh: fetch }
}

export function useKpiTargets(kpiId?: string) {
  const [targets, setTargets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!kpiId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('kpi_targets').select('*').eq('kpi_id', kpiId).order('start_date', { ascending: false }); setTargets(data || []) } finally { setIsLoading(false) }
  }, [kpiId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { targets, isLoading, refresh: fetch }
}

export function useKpiCategories(organizationId?: string) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('kpi_categories').select('*')
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('name', { ascending: true })
      setCategories(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useKpiDashboard(dashboardId?: string) {
  const [dashboard, setDashboard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!dashboardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('kpi_dashboards').select('*, kpis(*)').eq('id', dashboardId).single(); setDashboard(data) } finally { setIsLoading(false) }
  }, [dashboardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { dashboard, isLoading, refresh: fetch }
}

export function useKpiDashboards(organizationId?: string) {
  const [dashboards, setDashboards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('kpi_dashboards').select('*')
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('name', { ascending: true })
      setDashboards(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { dashboards, isLoading, refresh: fetch }
}

export function useKpiAlerts(kpiId?: string) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!kpiId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('kpi_alerts').select('*').eq('kpi_id', kpiId).order('created_at', { ascending: false }); setAlerts(data || []) } finally { setIsLoading(false) }
  }, [kpiId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { alerts, isLoading, refresh: fetch }
}

export function useKpiProgress(kpiId?: string) {
  const [progress, setProgress] = useState<{ current: number; target: number; percentage: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!kpiId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: kpi } = await supabase.from('kpis').select('current_value, target_value').eq('id', kpiId).single()
      if (kpi) {
        const current = kpi.current_value || 0
        const target = kpi.target_value || 1
        const percentage = Math.min(100, Math.round((current / target) * 100))
        setProgress({ current, target, percentage })
      }
    } finally { setIsLoading(false) }
  }, [kpiId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { progress, isLoading, refresh: fetch }
}

export function useKpiTrend(kpiId?: string, options?: { periods?: number }) {
  const [trend, setTrend] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!kpiId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('kpi_values').select('value, recorded_at').eq('kpi_id', kpiId).order('recorded_at', { ascending: true }).limit(options?.periods || 12); setTrend(data || []) } finally { setIsLoading(false) }
  }, [kpiId, options?.periods, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { trend, isLoading, refresh: fetch }
}
