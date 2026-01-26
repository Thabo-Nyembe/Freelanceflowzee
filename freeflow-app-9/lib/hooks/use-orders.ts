'use client'

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'
import { useCallback, useState } from 'react'
import type { JsonValue } from '@/lib/types/database'

// Types
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'on_hold'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial'
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto' | 'cash' | 'other'

// Address type for shipping and billing
export interface Address {
  street?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  [key: string]: JsonValue | undefined
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  shipping_address: Address
  billing_address: Address
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
  metadata: Record<string, JsonValue>
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
  product_metadata: Record<string, JsonValue>
  created_at: string
}

export interface CreateOrderInput {
  order_number?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  shipping_address?: Address
  billing_address?: Address
  subtotal?: number
  tax_amount?: number
  shipping_cost?: number
  discount_amount?: number
  total_amount?: number
  currency?: string
  status?: OrderStatus
  payment_status?: PaymentStatus
  payment_method?: PaymentMethod
  notes?: string
}

export interface UpdateOrderInput {
  id: string
  order_number?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  shipping_address?: Address
  billing_address?: Address
  subtotal?: number
  tax_amount?: number
  shipping_cost?: number
  discount_amount?: number
  total_amount?: number
  currency?: string
  status?: OrderStatus
  payment_status?: PaymentStatus
  payment_method?: PaymentMethod
  tracking_number?: string
  carrier?: string
  estimated_delivery?: string
  actual_delivery?: string
  notes?: string
  internal_notes?: string
}

// Hook Options
export interface UseOrdersOptions {
  status?: OrderStatus | 'all'
  paymentStatus?: PaymentStatus | 'all'
  limit?: number
}

// Query options type for useSupabaseQuery
interface OrderQueryOptions {
  table: string
  filters: Record<string, string | undefined>
  orderBy: { column: string; ascending: boolean }
  limit: number
  realtime: boolean
  softDelete: boolean
}

// Orders Hook
export function useOrders(options: UseOrdersOptions = {}) {
  const { status, paymentStatus, limit } = options
  const [mutationLoading, setMutationLoading] = useState(false)
  const [mutationError, setMutationError] = useState<Error | null>(null)

  const filters: Record<string, string | undefined> = {}
  if (status && status !== 'all') filters.status = status
  if (paymentStatus && paymentStatus !== 'all') filters.payment_status = paymentStatus

  const queryOptions: OrderQueryOptions = {
    table: 'orders',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 100,
    realtime: true,
    softDelete: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Order>(queryOptions)

  const { create, update, remove, loading: mutationLoadingInternal } = useSupabaseMutation({
    table: 'orders',
    onSuccess: refetch
  })

  // Create order
  const createOrder = useCallback(async (input: CreateOrderInput) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      const orderNumber = input.order_number || `ORD-${Date.now().toString().slice(-8)}`
      const result = await create({
        ...input,
        order_number: orderNumber,
        status: input.status || 'pending',
        payment_status: input.payment_status || 'pending',
        currency: input.currency || 'USD',
        subtotal: input.subtotal || 0,
        tax_amount: input.tax_amount || 0,
        shipping_cost: input.shipping_cost || 0,
        discount_amount: input.discount_amount || 0,
        total_amount: input.total_amount || 0,
        shipping_address: input.shipping_address || {},
        billing_address: input.billing_address || {},
        metadata: {}
      })
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create order')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [create])

  // Update order
  const updateOrder = useCallback(async (input: UpdateOrderInput) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      const { id, ...updateData } = input
      const result = await update(id, updateData)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update order')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [update])

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    return updateOrder({ id: orderId, status: newStatus })
  }, [updateOrder])

  // Update payment status
  const updatePaymentStatus = useCallback(async (orderId: string, newStatus: PaymentStatus) => {
    return updateOrder({ id: orderId, payment_status: newStatus })
  }, [updateOrder])

  // Cancel order
  const cancelOrder = useCallback(async (orderId: string) => {
    return updateOrder({ id: orderId, status: 'cancelled' })
  }, [updateOrder])

  // Fulfill order (mark as shipped)
  const fulfillOrder = useCallback(async (orderId: string, trackingNumber?: string, carrier?: string) => {
    return updateOrder({
      id: orderId,
      status: 'shipped',
      tracking_number: trackingNumber,
      carrier
    })
  }, [updateOrder])

  // Delete order (soft delete)
  const deleteOrder = useCallback(async (orderId: string) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      await remove(orderId)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete order')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [remove])

  // Calculate stats from data
  const stats = data ? {
    totalOrders: data.length,
    totalRevenue: data.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + (o.total_amount || 0), 0),
    pendingOrders: data.filter(o => o.status === 'pending').length,
    processingOrders: data.filter(o => o.status === 'processing').length,
    shippedOrders: data.filter(o => o.status === 'shipped').length,
    deliveredOrders: data.filter(o => o.status === 'delivered').length,
    cancelledOrders: data.filter(o => o.status === 'cancelled').length,
    averageOrderValue: data.length > 0 ? data.reduce((sum, o) => sum + (o.total_amount || 0), 0) / data.length : 0,
    paidOrders: data.filter(o => o.payment_status === 'paid').length,
    pendingPayments: data.filter(o => o.payment_status === 'pending').length
  } : {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0,
    paidOrders: 0,
    pendingPayments: 0
  }

  return {
    orders: data,
    loading,
    error,
    refetch,
    stats,
    mutationLoading: mutationLoading || mutationLoadingInternal,
    mutationError,
    createOrder,
    updateOrder,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    fulfillOrder,
    deleteOrder
  }
}
