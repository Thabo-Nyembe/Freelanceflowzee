'use client'

/**
 * Extended Widgets Hooks
 * Tables: widgets, widget_instances, widget_settings, widget_data
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useWidget(widgetId?: string) {
  const [widget, setWidget] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!widgetId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('widgets').select('*').eq('id', widgetId).single(); setWidget(data) } finally { setIsLoading(false) }
  }, [widgetId])
  useEffect(() => { fetch() }, [fetch])
  return { widget, isLoading, refresh: fetch }
}

export function useWidgets(options?: { type?: string; is_active?: boolean; limit?: number }) {
  const [widgets, setWidgets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('widgets').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setWidgets(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { widgets, isLoading, refresh: fetch }
}

export function useWidgetInstances(options?: { widget_id?: string; dashboard_id?: string; user_id?: string }) {
  const [instances, setInstances] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('widget_instances').select('*, widgets(*)')
      if (options?.widget_id) query = query.eq('widget_id', options.widget_id)
      if (options?.dashboard_id) query = query.eq('dashboard_id', options.dashboard_id)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      const { data } = await query.order('order', { ascending: true })
      setInstances(data || [])
    } finally { setIsLoading(false) }
  }, [options?.widget_id, options?.dashboard_id, options?.user_id])
  useEffect(() => { fetch() }, [fetch])
  return { instances, isLoading, refresh: fetch }
}

export function useWidgetSettings(instanceId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!instanceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('widget_settings').select('*').eq('instance_id', instanceId).single(); setSettings(data) } finally { setIsLoading(false) }
  }, [instanceId])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function useWidgetData(instanceId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!instanceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: widgetData } = await supabase.from('widget_data').select('*').eq('instance_id', instanceId).order('created_at', { ascending: false }).limit(1).single(); setData(widgetData) } finally { setIsLoading(false) }
  }, [instanceId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useActiveWidgets() {
  const [widgets, setWidgets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('widgets').select('*').eq('is_active', true).order('name', { ascending: true }); setWidgets(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { widgets, isLoading, refresh: fetch }
}
