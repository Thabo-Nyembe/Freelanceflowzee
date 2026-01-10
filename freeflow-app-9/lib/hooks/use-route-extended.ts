'use client'

/**
 * Extended Route Hooks
 * Tables: routes, route_permissions, route_middleware, route_analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRoute(routeId?: string) {
  const [route, setRoute] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!routeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('routes').select('*').eq('id', routeId).single(); setRoute(data) } finally { setIsLoading(false) }
  }, [routeId])
  useEffect(() => { fetch() }, [fetch])
  return { route, isLoading, refresh: fetch }
}

export function useRoutes(options?: { method?: string; is_active?: boolean; is_protected?: boolean; limit?: number }) {
  const [routes, setRoutes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('routes').select('*')
      if (options?.method) query = query.eq('method', options.method)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.is_protected !== undefined) query = query.eq('is_protected', options.is_protected)
      const { data } = await query.order('path', { ascending: true }).limit(options?.limit || 100)
      setRoutes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.method, options?.is_active, options?.is_protected, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { routes, isLoading, refresh: fetch }
}

export function useRoutePermissions(routeId?: string) {
  const [permissions, setPermissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!routeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('route_permissions').select('*').eq('route_id', routeId); setPermissions(data || []) } finally { setIsLoading(false) }
  }, [routeId])
  useEffect(() => { fetch() }, [fetch])
  return { permissions, isLoading, refresh: fetch }
}

export function useRouteMiddleware(routeId?: string) {
  const [middleware, setMiddleware] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!routeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('route_middleware').select('*').eq('route_id', routeId).order('order', { ascending: true }); setMiddleware(data || []) } finally { setIsLoading(false) }
  }, [routeId])
  useEffect(() => { fetch() }, [fetch])
  return { middleware, isLoading, refresh: fetch }
}

export function useRouteAnalytics(routeId?: string, options?: { days?: number }) {
  const [analytics, setAnalytics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!routeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const since = new Date(); since.setDate(since.getDate() - (options?.days || 30)); const { data } = await supabase.from('route_analytics').select('*').eq('route_id', routeId).gte('created_at', since.toISOString()).order('created_at', { ascending: false }); setAnalytics(data || []) } finally { setIsLoading(false) }
  }, [routeId, options?.days])
  useEffect(() => { fetch() }, [fetch])
  return { analytics, isLoading, refresh: fetch }
}
