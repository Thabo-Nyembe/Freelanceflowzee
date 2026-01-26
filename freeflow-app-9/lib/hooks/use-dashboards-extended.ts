'use client'

/**
 * Extended Dashboards Hooks
 * Tables: dashboards, dashboard_widgets, dashboard_layouts, dashboard_shares, dashboard_filters
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

// Type definitions for dashboard entities
export interface DashboardWidget {
  id: string
  dashboard_id: string
  widget_type: string
  title: string
  config: Record<string, JsonValue> | null
  position: Record<string, JsonValue> | null
  created_at: string
  updated_at: string
}

export interface DashboardFilter {
  id: string
  dashboard_id: string
  name: string
  filter_type: string
  config: Record<string, JsonValue> | null
  is_active: boolean
  created_at: string
}

export interface DashboardLayout {
  id: string
  name: string
  description: string | null
  layout_config: Record<string, JsonValue> | null
  is_default: boolean
  created_at: string
}

export interface DashboardShare {
  id: string
  dashboard_id: string
  user_id: string
  permission: string
  created_at: string
  dashboards?: Dashboard
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
  dashboard_widgets?: DashboardWidget[]
  dashboard_filters?: DashboardFilter[]
}

export function useDashboard(dashboardId?: string) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!dashboardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('dashboards').select('*, dashboard_widgets(*), dashboard_filters(*)').eq('id', dashboardId).single(); setDashboard(data) } finally { setIsLoading(false) }
  }, [dashboardId])
  useEffect(() => { fetch() }, [fetch])
  return { dashboard, isLoading, refresh: fetch }
}

export function useUserDashboards(userId?: string, options?: { type?: string; is_default?: boolean }) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('dashboards').select('*').eq('user_id', userId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_default !== undefined) query = query.eq('is_default', options.is_default)
      const { data } = await query.order('name', { ascending: true })
      setDashboards(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.type, options?.is_default])
  useEffect(() => { fetch() }, [fetch])
  return { dashboards, isLoading, refresh: fetch }
}

export function useDashboardWidgetsExtended(dashboardId?: string) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!dashboardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('dashboard_widgets').select('*').eq('dashboard_id', dashboardId).order('created_at', { ascending: true }); setWidgets(data || []) } finally { setIsLoading(false) }
  }, [dashboardId])
  useEffect(() => { fetch() }, [fetch])
  return { widgets, isLoading, refresh: fetch }
}

export function useSharedDashboards(userId?: string) {
  const [dashboards, setDashboards] = useState<DashboardShare[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('dashboard_shares').select('*, dashboards(*)').eq('user_id', userId); setDashboards(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { dashboards, isLoading, refresh: fetch }
}

export function useDashboardFilters(dashboardId?: string) {
  const [filters, setFilters] = useState<DashboardFilter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!dashboardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('dashboard_filters').select('*').eq('dashboard_id', dashboardId).order('name', { ascending: true }); setFilters(data || []) } finally { setIsLoading(false) }
  }, [dashboardId])
  useEffect(() => { fetch() }, [fetch])
  return { filters, isLoading, refresh: fetch }
}

export function useDefaultDashboard(userId?: string, type?: string) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('dashboards').select('*, dashboard_widgets(*)').eq('user_id', userId).eq('is_default', true)
      if (type) query = query.eq('type', type)
      const { data } = await query.single()
      setDashboard(data)
    } finally { setIsLoading(false) }
  }, [userId, type])
  useEffect(() => { fetch() }, [fetch])
  return { dashboard, isLoading, refresh: fetch }
}

export function usePublicDashboards(options?: { type?: string; limit?: number }) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('dashboards').select('*').eq('is_public', true)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setDashboards(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { dashboards, isLoading, refresh: fetch }
}

export function useDashboardLayouts() {
  const [layouts, setLayouts] = useState<DashboardLayout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('dashboard_layouts').select('*').order('name', { ascending: true }); setLayouts(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { layouts, isLoading, refresh: fetch }
}

export function useDashboardShares(dashboardId?: string) {
  const [shares, setShares] = useState<DashboardShare[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!dashboardId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('dashboard_shares').select('*, users:user_id(*)').eq('dashboard_id', dashboardId); setShares(data || []) } finally { setIsLoading(false) }
  }, [dashboardId])
  useEffect(() => { fetch() }, [fetch])
  return { shares, isLoading, refresh: fetch }
}

export function useWidgetTypes() {
  const [types, setTypes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('dashboard_widgets').select('widget_type')
      const uniqueTypes = [...new Set(data?.map(w => w.widget_type).filter(Boolean))]
      setTypes(uniqueTypes as string[])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { types, isLoading, refresh: fetch }
}
