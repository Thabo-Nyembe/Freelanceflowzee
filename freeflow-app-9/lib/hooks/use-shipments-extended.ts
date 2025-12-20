'use client'

/**
 * Extended Shipments Hooks
 * Tables: shipments, shipment_items, shipment_tracking, shipment_labels, shipment_rates, shipment_carriers
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useShipment(shipmentId?: string) {
  const [shipment, setShipment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!shipmentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('shipments').select('*, shipment_items(*), shipment_tracking(*), shipment_labels(*), shipment_carriers(*), orders(*)').eq('id', shipmentId).single(); setShipment(data) } finally { setIsLoading(false) }
  }, [shipmentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { shipment, isLoading, refresh: fetch }
}

export function useShipments(options?: { order_id?: string; carrier_id?: string; status?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  const [shipments, setShipments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('shipments').select('*, shipment_items(count), shipment_carriers(*), orders(*)')
      if (options?.order_id) query = query.eq('order_id', options.order_id)
      if (options?.carrier_id) query = query.eq('carrier_id', options.carrier_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      if (options?.search) query = query.ilike('tracking_number', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setShipments(data || [])
    } finally { setIsLoading(false) }
  }, [options?.order_id, options?.carrier_id, options?.status, options?.from_date, options?.to_date, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { shipments, isLoading, refresh: fetch }
}

export function useShipmentTracking(shipmentId?: string) {
  const [tracking, setTracking] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!shipmentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('shipment_tracking').select('*').eq('shipment_id', shipmentId).order('tracked_at', { ascending: false }); setTracking(data || []) } finally { setIsLoading(false) }
  }, [shipmentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tracking, isLoading, refresh: fetch }
}

export function useTrackByNumber(trackingNumber?: string) {
  const [result, setResult] = useState<{ shipment: any; tracking: any[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!trackingNumber) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: shipment } = await supabase.from('shipments').select('*, shipment_carriers(*)').eq('tracking_number', trackingNumber).single()
      if (!shipment) { setResult(null); return }
      const { data: tracking } = await supabase.from('shipment_tracking').select('*').eq('shipment_id', shipment.id).order('tracked_at', { ascending: false })
      setResult({ shipment, tracking: tracking || [] })
    } finally { setIsLoading(false) }
  }, [trackingNumber, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { result, isLoading, refresh: fetch }
}

export function useShipmentItems(shipmentId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!shipmentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('shipment_items').select('*, order_items(*)').eq('shipment_id', shipmentId); setItems(data || []) } finally { setIsLoading(false) }
  }, [shipmentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useShipmentLabel(shipmentId?: string) {
  const [label, setLabel] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!shipmentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('shipment_labels').select('*, shipment_carriers(*)').eq('shipment_id', shipmentId).order('generated_at', { ascending: false }).limit(1).single(); setLabel(data) } finally { setIsLoading(false) }
  }, [shipmentId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { label, isLoading, refresh: fetch }
}

export function useCarriers(options?: { is_active?: boolean }) {
  const [carriers, setCarriers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('shipment_carriers').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setCarriers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { carriers, isLoading, refresh: fetch }
}

export function useShipmentStats(options?: { from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ total: number; pending: number; inTransit: number; delivered: number; failed: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('shipments').select('status')
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query
      const shipments = data || []
      setStats({
        total: shipments.length,
        pending: shipments.filter(s => s.status === 'pending').length,
        inTransit: shipments.filter(s => s.status === 'in_transit').length,
        delivered: shipments.filter(s => s.status === 'delivered').length,
        failed: shipments.filter(s => s.status === 'failed_delivery').length
      })
    } finally { setIsLoading(false) }
  }, [options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function usePendingShipments(options?: { limit?: number }) {
  const [shipments, setShipments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('shipments').select('*, shipment_carriers(*), orders(*)').in('status', ['pending', 'processing', 'label_created']).order('created_at', { ascending: true }).limit(options?.limit || 50)
      setShipments(data || [])
    } finally { setIsLoading(false) }
  }, [options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { shipments, isLoading, refresh: fetch }
}

export function useOrderShipments(orderId?: string) {
  const [shipments, setShipments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!orderId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('shipments').select('*, shipment_items(count), shipment_tracking(*), shipment_carriers(*)').eq('order_id', orderId).order('created_at', { ascending: false })
      setShipments(data || [])
    } finally { setIsLoading(false) }
  }, [orderId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { shipments, isLoading, refresh: fetch }
}

