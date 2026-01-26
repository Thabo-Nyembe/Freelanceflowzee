'use client'

/**
 * Extended Orders Hooks
 * Tables: orders, order_items, order_status_history, order_payments, order_shipments, order_notes, order_discounts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

// Base order type
export interface OrderBase {
  id: string
  customer_id?: string
  organization_id?: string
  status: string
  payment_status?: string
  total?: number
  created_at: string
  updated_at?: string
  [key: string]: JsonValue | undefined
}

// Extended order with relations
export interface OrderWithRelations extends OrderBase {
  order_items?: OrderItemWithProduct[]
  order_status_history?: OrderStatusHistory[]
  order_payments?: OrderPayment[]
  order_shipments?: OrderShipment[]
}

// Order item with product
export interface OrderItemWithProduct {
  id: string
  order_id: string
  product_id?: string
  quantity: number
  unit_price?: number
  total?: number
  created_at: string
  products?: ProductRecord
  [key: string]: JsonValue | ProductRecord | undefined
}

// Product record
export interface ProductRecord {
  id: string
  name?: string
  sku?: string
  price?: number
  [key: string]: JsonValue | undefined
}

// Order status history
export interface OrderStatusHistory {
  id: string
  order_id: string
  status: string
  changed_at: string
  changed_by?: string
  notes?: string
  [key: string]: JsonValue | undefined
}

// Order payment
export interface OrderPayment {
  id: string
  order_id: string
  amount?: number
  payment_method?: string
  status?: string
  created_at: string
  [key: string]: JsonValue | undefined
}

// Order shipment
export interface OrderShipment {
  id: string
  order_id: string
  carrier?: string
  tracking_number?: string
  status?: string
  shipped_at?: string
  delivered_at?: string
  created_at: string
  [key: string]: JsonValue | undefined
}

// Order note
export interface OrderNote {
  id: string
  order_id: string
  note: string
  is_internal?: boolean
  created_by?: string
  created_at: string
  [key: string]: JsonValue | undefined
}

// Order discount
export interface OrderDiscount {
  id: string
  order_id: string
  discount_code?: string
  discount_type?: string
  discount_value?: number
  [key: string]: JsonValue | undefined
}

// Order with item count (for list views)
export interface OrderWithItemCount extends OrderBase {
  order_items?: Array<{ count: number }>
}

export function useOrder(orderId?: string) {
  const [order, setOrder] = useState<OrderWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('orders').select('*, order_items(*, products(*)), order_status_history(*), order_payments(*), order_shipments(*)').eq('id', orderId).single(); setOrder(data as OrderWithRelations | null) } finally { setIsLoading(false) }
  }, [orderId])
  useEffect(() => { fetch() }, [fetch])
  return { order, isLoading, refresh: fetch }
}

export function useOrders(options?: { customer_id?: string; organization_id?: string; status?: string; payment_status?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [orders, setOrders] = useState<OrderWithItemCount[]>([])
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
      setOrders((data as OrderWithItemCount[]) || [])
    } finally { setIsLoading(false) }
  }, [options?.customer_id, options?.organization_id, options?.status, options?.payment_status, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { orders, isLoading, refresh: fetch }
}

export function useOrderItems(orderId?: string) {
  const [items, setItems] = useState<OrderItemWithProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('order_items').select('*, products(*)').eq('order_id', orderId).order('created_at', { ascending: true }); setItems((data as OrderItemWithProduct[]) || []) } finally { setIsLoading(false) }
  }, [orderId])
  useEffect(() => { fetch() }, [fetch])
  return { items, isLoading, refresh: fetch }
}

export function useOrderStatusHistory(orderId?: string) {
  const [history, setHistory] = useState<OrderStatusHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('order_status_history').select('*').eq('order_id', orderId).order('changed_at', { ascending: false }); setHistory((data as OrderStatusHistory[]) || []) } finally { setIsLoading(false) }
  }, [orderId])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useOrderPayments(orderId?: string) {
  const [payments, setPayments] = useState<OrderPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('order_payments').select('*').eq('order_id', orderId).order('created_at', { ascending: false }); setPayments((data as OrderPayment[]) || []) } finally { setIsLoading(false) }
  }, [orderId])
  useEffect(() => { fetch() }, [fetch])
  return { payments, isLoading, refresh: fetch }
}

export function useOrderShipments(orderId?: string) {
  const [shipments, setShipments] = useState<OrderShipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('order_shipments').select('*').eq('order_id', orderId).order('created_at', { ascending: false }); setShipments((data as OrderShipment[]) || []) } finally { setIsLoading(false) }
  }, [orderId])
  useEffect(() => { fetch() }, [fetch])
  return { shipments, isLoading, refresh: fetch }
}

export function useOrderNotes(orderId?: string, options?: { is_internal?: boolean }) {
  const [notes, setNotes] = useState<OrderNote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orderId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('order_notes').select('*').eq('order_id', orderId)
      if (options?.is_internal !== undefined) query = query.eq('is_internal', options.is_internal)
      const { data } = await query.order('created_at', { ascending: false })
      setNotes((data as OrderNote[]) || [])
    } finally { setIsLoading(false) }
  }, [orderId, options?.is_internal])
  useEffect(() => { fetch() }, [fetch])
  return { notes, isLoading, refresh: fetch }
}

export function useOrderDiscounts(orderId?: string) {
  const [discounts, setDiscounts] = useState<OrderDiscount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!orderId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('order_discounts').select('*').eq('order_id', orderId); setDiscounts((data as OrderDiscount[]) || []) } finally { setIsLoading(false) }
  }, [orderId])
  useEffect(() => { fetch() }, [fetch])
  return { discounts, isLoading, refresh: fetch }
}

export function useCustomerOrders(customerId?: string, options?: { limit?: number }) {
  const [orders, setOrders] = useState<OrderWithItemCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!customerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('orders').select('*, order_items(count)').eq('customer_id', customerId).order('created_at', { ascending: false }).limit(options?.limit || 20); setOrders((data as OrderWithItemCount[]) || []) } finally { setIsLoading(false) }
  }, [customerId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { orders, isLoading, refresh: fetch }
}

export function useRecentOrders(organizationId?: string, options?: { limit?: number }) {
  const [orders, setOrders] = useState<OrderWithItemCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('orders').select('*, order_items(count)')
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 10)
      setOrders((data as OrderWithItemCount[]) || [])
    } finally { setIsLoading(false) }
  }, [organizationId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { orders, isLoading, refresh: fetch }
}

// Order with full items for pending orders view
export interface OrderWithItems extends OrderBase {
  order_items?: OrderItemWithProduct[]
}

export function usePendingOrders(organizationId?: string) {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('orders').select('*, order_items(*)').in('status', ['pending', 'processing', 'confirmed'])
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('created_at', { ascending: true })
      setOrders((data as OrderWithItems[]) || [])
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
  }, [organizationId, options?.from_date, options?.to_date])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
