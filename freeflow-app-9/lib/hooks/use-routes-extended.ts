'use client'

/**
 * Extended Routes Hooks
 * Tables: routes, route_stops, route_schedules, route_vehicles, route_drivers, route_tracking
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRoute(routeId?: string) {
  const [route, setRoute] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!routeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('routes').select('*, route_stops(*), route_schedules(*), route_vehicles(*), route_drivers(*)').eq('id', routeId).single(); setRoute(data) } finally { setIsLoading(false) }
  }, [routeId])
  useEffect(() => { loadData() }, [loadData])
  return { route, isLoading, refresh: loadData }
}

export function useRoutes(options?: { type?: string; origin_id?: string; destination_id?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [routes, setRoutes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('routes').select('*, route_stops(count), route_schedules(count)')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.origin_id) query = query.eq('origin_id', options.origin_id)
      if (options?.destination_id) query = query.eq('destination_id', options.destination_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setRoutes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.origin_id, options?.destination_id, options?.is_active, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { routes, isLoading, refresh: loadData }
}

export function useRouteStops(routeId?: string) {
  const [stops, setStops] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!routeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('route_stops').select('*, locations(*)').eq('route_id', routeId).order('stop_order', { ascending: true }); setStops(data || []) } finally { setIsLoading(false) }
  }, [routeId])
  useEffect(() => { loadData() }, [loadData])
  return { stops, isLoading, refresh: loadData }
}

export function useRouteSchedules(routeId?: string, options?: { is_active?: boolean; from_date?: string }) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!routeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('route_schedules').select('*, route_vehicles(*), route_drivers(*), vehicles(*), users(*)').eq('route_id', routeId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.from_date) query = query.or(`effective_until.is.null,effective_until.gte.${options.from_date}`)
      const { data } = await query.order('departure_time', { ascending: true })
      setSchedules(data || [])
    } finally { setIsLoading(false) }
  }, [routeId, options?.is_active, options?.from_date])
  useEffect(() => { loadData() }, [loadData])
  return { schedules, isLoading, refresh: loadData }
}

export function useRouteVehicles(routeId?: string, options?: { is_active?: boolean }) {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!routeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('route_vehicles').select('*, vehicles(*)').eq('route_id', routeId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('assigned_at', { ascending: false })
      setVehicles(data || [])
    } finally { setIsLoading(false) }
  }, [routeId, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { vehicles, isLoading, refresh: loadData }
}

export function useRouteDrivers(routeId?: string, options?: { is_active?: boolean }) {
  const [drivers, setDrivers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!routeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('route_drivers').select('*, users(*)').eq('route_id', routeId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('assigned_at', { ascending: false })
      setDrivers(data || [])
    } finally { setIsLoading(false) }
  }, [routeId, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { drivers, isLoading, refresh: loadData }
}

export function useRouteTracking(routeId?: string, options?: { from_time?: string; to_time?: string; vehicle_id?: string; limit?: number }) {
  const [tracking, setTracking] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!routeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('route_tracking').select('*, route_stops(*), vehicles(*)').eq('route_id', routeId)
      if (options?.vehicle_id) query = query.eq('vehicle_id', options.vehicle_id)
      if (options?.from_time) query = query.gte('tracked_at', options.from_time)
      if (options?.to_time) query = query.lte('tracked_at', options.to_time)
      const { data } = await query.order('tracked_at', { ascending: false }).limit(options?.limit || 100)
      setTracking(data || [])
    } finally { setIsLoading(false) }
  }, [routeId, options?.vehicle_id, options?.from_time, options?.to_time, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { tracking, isLoading, refresh: loadData }
}

export function useLiveRouteTracking(routeId?: string) {
  const [position, setPosition] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!routeId) { setIsLoading(false); return }
    setIsLoading(true)

    const fetchLatest = async () => {
      const { data } = await supabase.from('route_tracking').select('*, route_stops(*), vehicles(*)').eq('route_id', routeId).order('tracked_at', { ascending: false }).limit(1).single()
      setPosition(data)
      setIsLoading(false)
    }

    fetchLatest()

    const channel = supabase.channel(`route-tracking-${routeId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'route_tracking', filter: `route_id=eq.${routeId}` }, (payload) => { setPosition(payload.new) }).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [routeId])

  return { position, isLoading }
}

export function useActiveRoutes(options?: { type?: string; limit?: number }) {
  const [routes, setRoutes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('routes').select('*, route_tracking(count)').eq('is_active', true)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setRoutes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { routes, isLoading, refresh: loadData }
}

export function useRouteStats() {
  const [stats, setStats] = useState<{ total: number; active: number; totalStops: number; totalSchedules: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const [total, active, stops, schedules] = await Promise.all([
        supabase.from('routes').select('*', { count: 'exact', head: true }),
        supabase.from('routes').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('route_stops').select('*', { count: 'exact', head: true }),
        supabase.from('route_schedules').select('*', { count: 'exact', head: true }).eq('is_active', true)
      ])
      setStats({ total: total.count || 0, active: active.count || 0, totalStops: stops.count || 0, totalSchedules: schedules.count || 0 })
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useDriverRoutes(driverId?: string, options?: { is_active?: boolean }) {
  const [routes, setRoutes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!driverId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('route_drivers').select('*, routes(*)').eq('driver_id', driverId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('assigned_at', { ascending: false })
      setRoutes(data || [])
    } finally { setIsLoading(false) }
  }, [driverId, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { routes, isLoading, refresh: loadData }
}

