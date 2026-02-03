'use client'

/**
 * Extended Stores Hooks
 * Tables: stores, store_settings, store_hours, store_locations, store_staff, store_analytics
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStore(storeId?: string) {
  const [store, setStore] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!storeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('stores').select('*, store_settings(*), store_hours(*), store_locations(*)').eq('id', storeId).single(); setStore(data) } finally { setIsLoading(false) }
  }, [storeId])
  useEffect(() => { loadData() }, [loadData])
  return { store, isLoading, refresh: loadData }
}

export function useStores(options?: { type?: string; owner_id?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [stores, setStores] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('stores').select('*, store_locations(*)')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setStores(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.owner_id, options?.is_active, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { stores, isLoading, refresh: loadData }
}

export function useStoreSettings(storeId?: string) {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!storeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('store_settings').select('*').eq('store_id', storeId)
      const settingsMap: Record<string, any> = {}
      data?.forEach(s => { settingsMap[s.setting_key] = s.setting_value })
      setSettings(settingsMap)
    } finally { setIsLoading(false) }
  }, [storeId])
  useEffect(() => { loadData() }, [loadData])
  return { settings, isLoading, refresh: loadData }
}

export function useStoreHours(storeId?: string) {
  const [hours, setHours] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!storeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('store_hours').select('*').eq('store_id', storeId).order('day_of_week', { ascending: true }); setHours(data || []) } finally { setIsLoading(false) }
  }, [storeId])
  useEffect(() => { loadData() }, [loadData])
  return { hours, isLoading, refresh: loadData }
}

export function useStoreStaff(storeId?: string, options?: { role?: string; is_active?: boolean }) {
  const [staff, setStaff] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!storeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('store_staff').select('*, users(*)').eq('store_id', storeId)
      if (options?.role) query = query.eq('role', options.role)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('joined_at', { ascending: false })
      setStaff(data || [])
    } finally { setIsLoading(false) }
  }, [storeId, options?.role, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { staff, isLoading, refresh: loadData }
}

export function useIsStoreOpen(storeId?: string) {
  const [isOpen, setIsOpen] = useState<boolean | null>(null)
  const [hours, setHours] = useState<{ openTime?: string; closeTime?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!storeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const now = new Date()
      const dayOfWeek = now.getDay()
      const { data } = await supabase.from('store_hours').select('*').eq('store_id', storeId).eq('day_of_week', dayOfWeek).single()
      if (!data || data.is_closed) {
        setIsOpen(false)
        setHours(null)
      } else {
        const currentTime = now.toTimeString().slice(0, 5)
        setIsOpen(currentTime >= data.open_time && currentTime <= data.close_time)
        setHours({ openTime: data.open_time, closeTime: data.close_time })
      }
    } finally { setIsLoading(false) }
  }, [storeId])
  useEffect(() => { loadData() }, [loadData])
  return { isOpen, hours, isLoading, refresh: loadData }
}

export function useStoreAnalytics(storeId?: string, options?: { metric_type?: string; period?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [analytics, setAnalytics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!storeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('store_analytics').select('*').eq('store_id', storeId)
      if (options?.metric_type) query = query.eq('metric_type', options.metric_type)
      if (options?.period) query = query.eq('period', options.period)
      if (options?.from_date) query = query.gte('recorded_at', options.from_date)
      if (options?.to_date) query = query.lte('recorded_at', options.to_date)
      const { data } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 100)
      setAnalytics(data || [])
    } finally { setIsLoading(false) }
  }, [storeId, options?.metric_type, options?.period, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { analytics, isLoading, refresh: loadData }
}

export function useUserStores(userId?: string) {
  const [stores, setStores] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [ownedRes, staffRes] = await Promise.all([
        supabase.from('stores').select('*').eq('owner_id', userId).eq('is_active', true),
        supabase.from('store_staff').select('*, stores(*)').eq('user_id', userId).eq('is_active', true)
      ])
      const ownedStores = ownedRes.data || []
      const staffStores = (staffRes.data || []).map(s => ({ ...s.stores, role: s.role }))
      const allStores = [...ownedStores.map(s => ({ ...s, role: 'owner' })), ...staffStores]
      setStores(allStores)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { stores, isLoading, refresh: loadData }
}

export function useNearbyStores(lat?: number, lng?: number, radiusKm: number = 10) {
  const [stores, setStores] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!lat || !lng) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('stores').select('*, store_locations(*)').eq('is_active', true)
      // Simple distance calculation - for production, use PostGIS
      const withDistance = (data || []).map(store => {
        const loc = store.store_locations?.[0]
        if (!loc?.latitude || !loc?.longitude) return { ...store, distance: Infinity }
        const dLat = (loc.latitude - lat) * Math.PI / 180
        const dLng = (loc.longitude - lng) * Math.PI / 180
        const a = Math.sin(dLat/2) ** 2 + Math.cos(lat * Math.PI / 180) * Math.cos(loc.latitude * Math.PI / 180) * Math.sin(dLng/2) ** 2
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        return { ...store, distance: 6371 * c }
      }).filter(s => s.distance <= radiusKm).sort((a, b) => a.distance - b.distance)
      setStores(withDistance)
    } finally { setIsLoading(false) }
  }, [lat, lng, radiusKm])
  useEffect(() => { loadData() }, [loadData])
  return { stores, isLoading, refresh: loadData }
}

