'use client'

/**
 * Extended Orders Hooks
 * Tables: orders, order_items, order_status_history, order_payments, order_shipments, order_notes, order_discounts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useOrder(orderId?: string) {
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('orders').select('*, order_items(*, products(*)), order_status_history(*), order_payments(*), order_shipments(*)').eq('id', orderId).single(); setOrder(data) } finally { setIsLoading(false) }
  }, [orderId])
  useEffect(() => { fetch() }, [fetch])
  return { order, isLoading, refresh: fetch }
}

export function useOrders(options?: { customer_id?: string; organization_id?: string; status?: string; payment_status?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('orders').select('*, order_items(count)')
      if (options?.customer_id) query = query.eq('customer_id', options.customer_id)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.payment_status) query = query.eq('payment_status', options.payment_status)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setOrders(data || [])
    } finally { setIsLoading(false) }
  }, [options?.customer_id, options?.organization_id, options?.status, options?.payment_status, options?.from_date, options?.to_date, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { orders, isLoading, refresh: fetch }
}

export function useOrderItems(orderId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('order_items').select('*, products(*)').eq('order_id', orderId).order('created_at', { ascending: true }); setItems(data || []) } finally { setIsLoading(false) }
  }, [orderId])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useOrderStatusHistory(orderId?: string) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('order_status_history').select('*').eq('order_id', orderId).order('changed_at', { ascending: false }); setHistory(data || []) } finally { setIsLoading(false) }
  }, [orderId])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useOrderPayments(orderId?: string) {
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('order_payments').select('*').eq('order_id', orderId).order('created_at', { ascending: false }); setPayments(data || []) } finally { setIsLoading(false) }
  }, [orderId])
  useEffect(() => { fetch() }, [fetch])
  return { payments, isLoading, refresh: fetch }
}

export function useOrderShipments(orderId?: string) {
  const [shipments, setShipments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('order_shipments').select('*').eq('order_id', orderId).order('created_at', { ascending: false }); setShipments(data || []) } finally { setIsLoading(false) }
  }, [orderId])
  useEffect(() => { fetch() }, [fetch])
  return { shipments, isLoading, refresh: fetch }
}

export function useOrderNotes(orderId?: string, options?: { is_internal?: boolean }) {
  const [notes, setNotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orderId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('order_notes').select('*').eq('order_id', orderId)
      if (options?.is_internal !== undefined) query = query.eq('is_internal', options.is_internal)
      const { data } = await query.order('created_at', { ascending: false })
      setNotes(data || [])
    } finally { setIsLoading(false) }
  }, [orderId, options?.is_internal, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { notes, isLoading, refresh: fetch }
}

export function useOrderDiscounts(orderId?: string) {
  const [discounts, setDiscounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('order_discounts').select('*').eq('order_id', orderId); setDiscounts(data || []) } finally { setIsLoading(false) }
  }, [orderId])
  useEffect(() => { fetch() }, [fetch])
  return { discounts, isLoading, refresh: fetch }
}

export function useCustomerOrders(customerId?: string, options?: { limit?: number }) {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!customerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('orders').select('*, order_items(count)').eq('customer_id', customerId).order('created_at', { ascending: false }).limit(options?.limit || 20); setOrders(data || []) } finally { setIsLoading(false) }
  }, [customerId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { orders, isLoading, refresh: fetch }
}

export function useRecentOrders(organizationId?: string, options?: { limit?: number }) {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('orders').select('*, order_items(count)')
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 10)
      setOrders(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { orders, isLoading, refresh: fetch }
}

export function usePendingOrders(organizationId?: string) {
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('orders').select('*, order_items(*)').in('status', ['pending', 'processing', 'confirmed'])
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('created_at', { ascending: true })
      setOrders(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { fetch() }, [fetch])
  return { orders, isLoading, refresh: fetch }
}

export function useOrderStats(organizationId?: string, options?: { from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<{ totalOrders: number; totalRevenue: number; averageOrderValue: number; pendingCount: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('orders').select('total, status')
      if (organizationId) query = query.eq('organization_id', organizationId)
      if (options?.from_date) query = query.gte('created_at', options.from_date)
      if (options?.to_date) query = query.lte('created_at', options.to_date)
      const { data } = await query
      const totalOrders = data?.length || 0
      const totalRevenue = data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
      const pendingCount = data?.filter(o => ['pending', 'processing'].includes(o.status)).length || 0
      setStats({ totalOrders, totalRevenue, averageOrderValue, pendingCount })
    } finally { setIsLoading(false) }
  }, [organizationId, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
