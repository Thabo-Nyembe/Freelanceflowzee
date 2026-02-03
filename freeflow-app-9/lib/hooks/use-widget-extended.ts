'use client'

/**
 * Extended Widget Hooks - Covers all Widget-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useWidgets(userId?: string, widgetType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('widgets').select('*').order('sort_order', { ascending: true })
      if (userId) query = query.eq('user_id', userId)
      if (widgetType) query = query.eq('widget_type', widgetType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, widgetType])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useWidgetConfigs(widgetId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('widget_configs').select('*').order('created_at', { ascending: false })
      if (widgetId) query = query.eq('widget_id', widgetId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [widgetId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useDashboardWidgets(dashboardId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('dashboard_widgets').select('*, widgets(*)').order('position', { ascending: true })
      if (dashboardId) query = query.eq('dashboard_id', dashboardId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [dashboardId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
