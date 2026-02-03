'use client'

/**
 * Extended Stocks Hooks
 * Tables: stocks, stock_movements, stock_adjustments, stock_reservations, stock_alerts, stock_locations
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStock(stockId?: string) {
  const [stock, setStock] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!stockId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('stocks').select('*, stock_locations(*), stock_reservations(*), stock_alerts(*)').eq('id', stockId).single(); setStock(data) } finally { setIsLoading(false) }
  }, [stockId])
  useEffect(() => { loadData() }, [loadData])
  return { stock, isLoading, refresh: loadData }
}

export function useStocks(options?: { product_id?: string; location_id?: string; low_stock?: boolean; search?: string; limit?: number }) {
  const [stocks, setStocks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('stocks').select('*, stock_locations(*), products(*)')
      if (options?.product_id) query = query.eq('product_id', options.product_id)
      if (options?.location_id) query = query.eq('location_id', options.location_id)
      if (options?.search) query = query.ilike('sku', `%${options.search}%`)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 100)
      let result = data || []
      if (options?.low_stock) {
        result = result.filter(s => (s.quantity - (s.reserved_quantity || 0)) <= (s.reorder_point || 0))
      }
      setStocks(result)
    } finally { setIsLoading(false) }
  }, [options?.product_id, options?.location_id, options?.low_stock, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { stocks, isLoading, refresh: loadData }
}

export function useStockMovements(stockId?: string, options?: { movement_type?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [movements, setMovements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!stockId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('stock_movements').select('*, users(*)').eq('stock_id', stockId)
      if (options?.movement_type) query = query.eq('movement_type', options.movement_type)
      if (options?.from_date) query = query.gte('moved_at', options.from_date)
      if (options?.to_date) query = query.lte('moved_at', options.to_date)
      const { data } = await query.order('moved_at', { ascending: false }).limit(options?.limit || 50)
      setMovements(data || [])
    } finally { setIsLoading(false) }
  }, [stockId, options?.movement_type, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { movements, isLoading, refresh: loadData }
}

export function useStockReservations(stockId?: string, options?: { status?: string }) {
  const [reservations, setReservations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!stockId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('stock_reservations').select('*').eq('stock_id', stockId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('reserved_at', { ascending: false })
      setReservations(data || [])
    } finally { setIsLoading(false) }
  }, [stockId, options?.status])
  useEffect(() => { loadData() }, [loadData])
  return { reservations, isLoading, refresh: loadData }
}

export function useStockLocations(options?: { is_active?: boolean; search?: string }) {
  const [locations, setLocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('stock_locations').select('*, stocks(count)')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true })
      setLocations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.search])
  useEffect(() => { loadData() }, [loadData])
  return { locations, isLoading, refresh: loadData }
}

export function useStockAlerts(options?: { alert_type?: string; status?: string; limit?: number }) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('stock_alerts').select('*, stocks(*, products(*))')
      if (options?.alert_type) query = query.eq('alert_type', options.alert_type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('triggered_at', { ascending: false }).limit(options?.limit || 50)
      setAlerts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.alert_type, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { alerts, isLoading, refresh: loadData }
}

export function useLowStockItems(options?: { location_id?: string; limit?: number }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('stocks').select('*, stock_locations(*), products(*)')
      if (options?.location_id) query = query.eq('location_id', options.location_id)
      const { data } = await query.limit(options?.limit || 100)
      const lowStock = (data || []).filter(s => {
        const available = s.quantity - (s.reserved_quantity || 0)
        return s.reorder_point && available <= s.reorder_point
      })
      setItems(lowStock)
    } finally { setIsLoading(false) }
  }, [options?.location_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { items, isLoading, refresh: loadData }
}

export function useStockAvailability(productId?: string, locationId?: string) {
  const [availability, setAvailability] = useState<{ total: number; reserved: number; available: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!productId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('stocks').select('quantity, reserved_quantity').eq('product_id', productId)
      if (locationId) query = query.eq('location_id', locationId)
      const { data } = await query
      const total = (data || []).reduce((sum, s) => sum + (s.quantity || 0), 0)
      const reserved = (data || []).reduce((sum, s) => sum + (s.reserved_quantity || 0), 0)
      setAvailability({ total, reserved, available: total - reserved })
    } finally { setIsLoading(false) }
  }, [productId, locationId])
  useEffect(() => { loadData() }, [loadData])
  return { availability, isLoading, refresh: loadData }
}

export function useStockStats(options?: { location_id?: string }) {
  const [stats, setStats] = useState<{ total_items: number; total_value: number; low_stock_count: number; out_of_stock_count: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('stocks').select('quantity, reserved_quantity, reorder_point')
      if (options?.location_id) query = query.eq('location_id', options.location_id)
      const { data } = await query
      const stocks = data || []
      setStats({
        total_items: stocks.length,
        total_value: stocks.reduce((sum, s) => sum + (s.quantity || 0), 0),
        low_stock_count: stocks.filter(s => {
          const available = (s.quantity || 0) - (s.reserved_quantity || 0)
          return s.reorder_point && available <= s.reorder_point && available > 0
        }).length,
        out_of_stock_count: stocks.filter(s => (s.quantity || 0) - (s.reserved_quantity || 0) <= 0).length
      })
    } finally { setIsLoading(false) }
  }, [options?.location_id])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

