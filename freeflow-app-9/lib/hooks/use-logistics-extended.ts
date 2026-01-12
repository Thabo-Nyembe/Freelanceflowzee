'use client'

/**
 * Extended Logistics Hooks
 * Tables: logistics_shipments, logistics_carriers, logistics_routes, logistics_tracking, logistics_warehouses, logistics_inventory
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useShipment(shipmentId?: string) {
  const [shipment, setShipment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!shipmentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('logistics_shipments').select('*, logistics_carriers(*), logistics_tracking(*)').eq('id', shipmentId).single(); setShipment(data) } finally { setIsLoading(false) }
  }, [shipmentId])
  useEffect(() => { fetch() }, [fetch])
  return { shipment, isLoading, refresh: fetch }
}

export function useShipments(options?: { status?: string; carrier_id?: string; limit?: number }) {
  const [shipments, setShipments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('logistics_shipments').select('*, logistics_carriers(*)')
      if (options?.status) query = query.eq('status', options.status)
      if (options?.carrier_id) query = query.eq('carrier_id', options.carrier_id)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setShipments(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.carrier_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { shipments, isLoading, refresh: fetch }
}

export function useTrackingHistory(shipmentId?: string) {
  const [tracking, setTracking] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!shipmentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('logistics_tracking').select('*').eq('shipment_id', shipmentId).order('timestamp', { ascending: false }); setTracking(data || []) } finally { setIsLoading(false) }
  }, [shipmentId])
  useEffect(() => { fetch() }, [fetch])
  return { tracking, isLoading, refresh: fetch }
}

export function useTrackByNumber(trackingNumber?: string) {
  const [shipment, setShipment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const track = useCallback(async () => {
    if (!trackingNumber) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('logistics_shipments').select('*, logistics_carriers(*), logistics_tracking(*)').eq('tracking_number', trackingNumber).single(); setShipment(data) } finally { setIsLoading(false) }
  }, [trackingNumber])
  useEffect(() => { track() }, [track])
  return { shipment, isLoading, track }
}

export function useCarriers(options?: { is_active?: boolean }) {
  const [carriers, setCarriers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('logistics_carriers').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setCarriers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { carriers, isLoading, refresh: fetch }
}

export function useWarehouses(options?: { is_active?: boolean; region?: string }) {
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('logistics_warehouses').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.region) query = query.eq('region', options.region)
      const { data } = await query.order('name', { ascending: true })
      setWarehouses(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.region])
  useEffect(() => { fetch() }, [fetch])
  return { warehouses, isLoading, refresh: fetch }
}

export function useWarehouse(warehouseId?: string) {
  const [warehouse, setWarehouse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!warehouseId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('logistics_warehouses').select('*').eq('id', warehouseId).single(); setWarehouse(data) } finally { setIsLoading(false) }
  }, [warehouseId])
  useEffect(() => { fetch() }, [fetch])
  return { warehouse, isLoading, refresh: fetch }
}

export function useWarehouseInventory(warehouseId?: string, options?: { low_stock?: boolean }) {
  const [inventory, setInventory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!warehouseId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const query = supabase.from('logistics_inventory').select('*').eq('warehouse_id', warehouseId)
      const { data } = await query.order('product_id', { ascending: true })
      let filtered = data || []
      if (options?.low_stock) {
        filtered = filtered.filter(item => item.quantity < (item.reorder_point || 0))
      }
      setInventory(filtered)
    } finally { setIsLoading(false) }
  }, [warehouseId, options?.low_stock])
  useEffect(() => { fetch() }, [fetch])
  return { inventory, isLoading, refresh: fetch }
}

export function useRoutes(options?: { origin_id?: string; destination_id?: string }) {
  const [routes, setRoutes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('logistics_routes').select('*').eq('is_active', true)
      if (options?.origin_id) query = query.eq('origin_warehouse_id', options.origin_id)
      if (options?.destination_id) query = query.eq('destination_warehouse_id', options.destination_id)
      const { data } = await query.order('name', { ascending: true })
      setRoutes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.origin_id, options?.destination_id])
  useEffect(() => { fetch() }, [fetch])
  return { routes, isLoading, refresh: fetch }
}

export function usePendingShipments(options?: { limit?: number }) {
  const [shipments, setShipments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('logistics_shipments').select('*, logistics_carriers(*)').in('status', ['pending', 'processing']).order('created_at', { ascending: true }).limit(options?.limit || 20); setShipments(data || []) } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { shipments, isLoading, refresh: fetch }
}

export function useShipmentStats(options?: { from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('logistics_shipments').select('status')
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query
      const statusCounts: Record<string, number> = {}
      data?.forEach(s => { statusCounts[s.status] = (statusCounts[s.status] || 0) + 1 })
      setStats({ total: data?.length || 0, byStatus: statusCounts })
    } finally { setIsLoading(false) }
  }, [options?.from_date, options?.to_date])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
