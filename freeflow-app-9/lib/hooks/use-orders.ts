'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'

// Types
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'on_hold'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial'
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto' | 'cash' | 'other'

export interface Order {
  id: string
  user_id: string
  order_number: string
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  shipping_address: Record<string, any>
  billing_address: Record<string, any>
  subtotal: number
  tax_amount: number
  shipping_cost: number
  discount_amount: number
  total_amount: number
  currency: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod | null
  tracking_number: string | null
  carrier: string | null
  estimated_delivery: string | null
  actual_delivery: string | null
  notes: string | null
  internal_notes: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface OrderItem {
  id: string
  order_id: string
  user_id: string
  product_name: string
  product_sku: string | null
  quantity: number
  unit_price: number
  total_price: number
  discount: number
  tax: number
  product_metadata: Record<string, any>
  created_at: string
}

// Hook Options
interface UseOrdersOptions {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  dateFrom?: string
  dateTo?: string
  searchQuery?: string
}

interface UseOrderItemsOptions {
  orderId: string
}

// Orders Hook
export function useOrders(options: UseOrdersOptions = {}) {
  const { status, paymentStatus, dateFrom, dateTo, searchQuery } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('orders')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    if (searchQuery) {
      query = query.or(`order_number.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,customer_email.ilike.%${searchQuery}%`)
    }

    return query
  }

  return useSupabaseQuery<Order>('orders', buildQuery, [status, paymentStatus, dateFrom, dateTo, searchQuery])
}

// Order Items Hook
export function useOrderItems(options: UseOrderItemsOptions) {
  const { orderId } = options

  const buildQuery = (supabase: any) => {
    return supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
  }

  return useSupabaseQuery<OrderItem>('order_items', buildQuery, [orderId], { enabled: !!orderId })
}

// Single Order Hook
export function useOrder(orderId: string | null) {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()
  }

  return useSupabaseQuery<Order>(
    'orders',
    buildQuery,
    [orderId],
    { enabled: !!orderId }
  )
}

// Order Statistics Hook
export function useOrderStats() {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('orders')
      .select('status, payment_status, total_amount, created_at')
      .is('deleted_at', null)
  }

  const { data, ...rest } = useSupabaseQuery<any>('orders', buildQuery, [])

  const stats = data ? {
    totalOrders: data.length,
    totalRevenue: data.filter((o: any) => o.payment_status === 'paid').reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0),
    pendingOrders: data.filter((o: any) => o.status === 'pending').length,
    processingOrders: data.filter((o: any) => o.status === 'processing').length,
    shippedOrders: data.filter((o: any) => o.status === 'shipped').length,
    deliveredOrders: data.filter((o: any) => o.status === 'delivered').length,
    cancelledOrders: data.filter((o: any) => o.status === 'cancelled').length,
    averageOrderValue: data.length > 0 ? data.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) / data.length : 0,
    paidOrders: data.filter((o: any) => o.payment_status === 'paid').length,
    pendingPayments: data.filter((o: any) => o.payment_status === 'pending').length
  } : null

  return { stats, ...rest }
}

// Recent Orders Hook
export function useRecentOrders(limit: number = 10) {
  const buildQuery = (supabase: any) => {
    return supabase
      .from('orders')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)
  }

  return useSupabaseQuery<Order>('orders', buildQuery, [limit])
}

// Mutations
export function useOrderMutations() {
  return useSupabaseMutation()
}
