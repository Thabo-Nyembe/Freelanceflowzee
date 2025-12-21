// Server Actions for Order Management
// Created: December 14, 2024
// Updated: December 15, 2024 - A+++ Standard with structured error handling

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'
import { z } from 'zod'

const logger = createFeatureLogger('order-actions')

// ============================================
// TYPES & ENUMS
// ============================================

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'on_hold'
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial'
type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto' | 'cash' | 'other'

interface OrderItem {
  product_name: string
  product_sku?: string
  quantity: number
  unit_price: number
  discount?: number
  tax?: number
  product_metadata?: Record<string, unknown>
}

interface Order {
  id: string
  user_id: string
  order_number: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  shipping_address?: Record<string, unknown>
  billing_address?: Record<string, unknown>
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  currency: string
  payment_method?: PaymentMethod
  payment_status: PaymentStatus
  status: OrderStatus
  tracking_number?: string
  carrier?: string
  estimated_delivery?: string
  actual_delivery?: string
  notes?: string
  internal_notes?: string
  metadata?: Record<string, unknown>
  deleted_at?: string
  created_at: string
  updated_at: string
}

interface OrderItemDB {
  id: string
  order_id: string
  user_id: string
  product_name: string
  product_sku?: string
  quantity: number
  unit_price: number
  total_price: number
  discount: number
  tax: number
  product_metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface OrderStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

const orderStatusSchema = z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'on_hold'])
const paymentStatusSchema = z.enum(['pending', 'paid', 'failed', 'refunded', 'partial'])
const paymentMethodSchema = z.enum(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto', 'cash', 'other'])

const orderItemSchema = z.object({
  product_name: z.string().min(1, 'Product name is required').max(255),
  product_sku: z.string().max(100).optional(),
  quantity: z.number().int().min(1),
  unit_price: z.number().min(0),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  product_metadata: z.record(z.unknown()).optional()
})

const createOrderSchema = z.object({
  customer_name: z.string().max(255).optional(),
  customer_email: z.string().email().max(255).optional(),
  customer_phone: z.string().max(50).optional(),
  shipping_address: z.record(z.unknown()).optional(),
  billing_address: z.record(z.unknown()).optional(),
  currency: z.string().length(3).default('USD'),
  payment_method: paymentMethodSchema.optional(),
  notes: z.string().max(2000).optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required')
})

const updateOrderSchema = z.object({
  customer_name: z.string().max(255).optional(),
  customer_email: z.string().email().max(255).optional(),
  customer_phone: z.string().max(50).optional(),
  shipping_address: z.record(z.unknown()).optional(),
  billing_address: z.record(z.unknown()).optional(),
  status: orderStatusSchema.optional(),
  payment_status: paymentStatusSchema.optional(),
  payment_method: paymentMethodSchema.optional(),
  tracking_number: z.string().max(100).optional(),
  carrier: z.string().max(100).optional(),
  estimated_delivery: z.string().optional(),
  actual_delivery: z.string().optional(),
  notes: z.string().max(2000).optional(),
  internal_notes: z.string().max(2000).optional(),
  metadata: z.record(z.unknown()).optional()
}).partial()

const trackingInfoSchema = z.object({
  tracking_number: z.string().min(1, 'Tracking number is required').max(100),
  carrier: z.string().min(1, 'Carrier is required').max(100),
  estimated_delivery: z.string().optional()
})

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate Order Number
 */
function generateOrderNumber(): string {
  const prefix = 'ORD'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Recalculate Order Totals
 */
async function recalculateOrderTotals(orderId: string): Promise<void> {
  const supabase = createServerActionClient({ cookies })

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  if (!items) return

  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
  const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0)
  const totalTax = items.reduce((sum, item) => sum + item.tax, 0)
  const totalAmount = subtotal - totalDiscount + totalTax

  await supabase
    .from('orders')
    .update({
      subtotal,
      discount_amount: totalDiscount,
      tax_amount: totalTax,
      total_amount: totalAmount
    })
    .eq('id', orderId)
}

// ============================================
// SERVER ACTIONS - ORDERS
// ============================================

/**
 * Create Order
 */
export async function createOrder(
  data: z.infer<typeof createOrderSchema>
): Promise<ActionResult<Order>> {
  try {
    // Validate input
    const validatedData = createOrderSchema.parse(data)

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized order creation attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Calculate totals
    const subtotal = validatedData.items.reduce((sum, item) => {
      return sum + (item.unit_price * item.quantity)
    }, 0)

    const totalDiscount = validatedData.items.reduce((sum, item) => {
      return sum + (item.discount || 0)
    }, 0)

    const totalTax = validatedData.items.reduce((sum, item) => {
      return sum + (item.tax || 0)
    }, 0)

    const totalAmount = subtotal - totalDiscount + totalTax

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: generateOrderNumber(),
        customer_name: validatedData.customer_name,
        customer_email: validatedData.customer_email,
        customer_phone: validatedData.customer_phone,
        shipping_address: validatedData.shipping_address || {},
        billing_address: validatedData.billing_address || {},
        subtotal,
        tax_amount: totalTax,
        discount_amount: totalDiscount,
        total_amount: totalAmount,
        currency: validatedData.currency,
        payment_method: validatedData.payment_method,
        notes: validatedData.notes,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      logger.error('Failed to create order', { error: orderError, userId: user.id })
      return actionError('Failed to create order', 'DATABASE_ERROR')
    }

    // Create order items
    const orderItems = validatedData.items.map(item => ({
      order_id: order.id,
      user_id: user.id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
      discount: item.discount || 0,
      tax: item.tax || 0,
      product_metadata: item.product_metadata || {}
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      logger.error('Failed to create order items', { error: itemsError, orderId: order.id })
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id)
      return actionError('Failed to create order items', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/orders-v2')
    logger.info('Order created successfully', { orderId: order.id, userId: user.id })
    return actionSuccess(order as Order, 'Order created successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Order validation failed', { error: error.errors })
      return actionError('Invalid order data', 'VALIDATION_ERROR', error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      })))
    }
    logger.error('Unexpected error creating order', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update Order
 */
export async function updateOrder(
  orderId: string,
  data: z.infer<typeof updateOrderSchema>
): Promise<ActionResult<Order>> {
  try {
    // Validate inputs
    uuidSchema.parse(orderId)
    const validatedData = updateOrderSchema.parse(data)

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized order update attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(validatedData)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update order', { error, orderId, userId: user.id })
      return actionError('Failed to update order', 'DATABASE_ERROR')
    }

    if (!order) {
      logger.warn('Order not found or unauthorized', { orderId, userId: user.id })
      return actionError('Order not found or unauthorized', 'NOT_FOUND')
    }

    revalidatePath('/dashboard/orders-v2')
    logger.info('Order updated successfully', { orderId, userId: user.id })
    return actionSuccess(order as Order, 'Order updated successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Order update validation failed', { error: error.errors })
      return actionError('Invalid order data', 'VALIDATION_ERROR', error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      })))
    }
    logger.error('Unexpected error updating order', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update Order Status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ActionResult<Order>> {
  try {
    // Validate inputs
    uuidSchema.parse(orderId)
    orderStatusSchema.parse(status)

    return updateOrder(orderId, { status })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Order status validation failed', { error: error.errors })
      return actionError('Invalid order status', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error updating order status', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update Payment Status
 */
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<ActionResult<Order>> {
  try {
    // Validate inputs
    uuidSchema.parse(orderId)
    paymentStatusSchema.parse(paymentStatus)

    return updateOrder(orderId, { payment_status: paymentStatus })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Payment status validation failed', { error: error.errors })
      return actionError('Invalid payment status', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error updating payment status', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Add Tracking Info
 */
export async function addTrackingInfo(
  orderId: string,
  data: z.infer<typeof trackingInfoSchema>
): Promise<ActionResult<Order>> {
  try {
    // Validate inputs
    uuidSchema.parse(orderId)
    const validatedData = trackingInfoSchema.parse(data)

    return updateOrder(orderId, {
      tracking_number: validatedData.tracking_number,
      carrier: validatedData.carrier,
      estimated_delivery: validatedData.estimated_delivery,
      status: 'shipped'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Tracking info validation failed', { error: error.errors })
      return actionError('Invalid tracking information', 'VALIDATION_ERROR', error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      })))
    }
    logger.error('Unexpected error adding tracking info', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Mark as Delivered
 */
export async function markOrderDelivered(orderId: string): Promise<ActionResult<Order>> {
  try {
    // Validate ID
    uuidSchema.parse(orderId)

    return updateOrder(orderId, {
      status: 'delivered',
      actual_delivery: new Date().toISOString()
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Order ID validation failed', { error: error.errors })
      return actionError('Invalid order ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error marking order as delivered', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Cancel Order
 */
export async function cancelOrder(
  orderId: string,
  reason?: string
): Promise<ActionResult<Order>> {
  try {
    // Validate ID
    uuidSchema.parse(orderId)

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized order cancellation attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        internal_notes: reason ? `Cancelled: ${reason}` : 'Order cancelled'
      })
      .eq('id', orderId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to cancel order', { error, orderId, userId: user.id })
      return actionError('Failed to cancel order', 'DATABASE_ERROR')
    }

    if (!order) {
      logger.warn('Order not found or unauthorized', { orderId, userId: user.id })
      return actionError('Order not found or unauthorized', 'NOT_FOUND')
    }

    revalidatePath('/dashboard/orders-v2')
    logger.info('Order cancelled successfully', { orderId, reason, userId: user.id })
    return actionSuccess(order as Order, 'Order cancelled successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Order ID validation failed', { error: error.errors })
      return actionError('Invalid order ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error cancelling order', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Refund Order
 */
export async function refundOrder(
  orderId: string,
  refundAmount?: number
): Promise<ActionResult<Order>> {
  try {
    // Validate ID
    uuidSchema.parse(orderId)
    if (refundAmount !== undefined) {
      z.number().min(0).parse(refundAmount)
    }

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized order refund attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status: 'refunded',
        payment_status: refundAmount ? 'partial' : 'refunded'
      })
      .eq('id', orderId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to refund order', { error, orderId, userId: user.id })
      return actionError('Failed to refund order', 'DATABASE_ERROR')
    }

    if (!order) {
      logger.warn('Order not found or unauthorized', { orderId, userId: user.id })
      return actionError('Order not found or unauthorized', 'NOT_FOUND')
    }

    revalidatePath('/dashboard/orders-v2')
    logger.info('Order refunded successfully', { orderId, refundAmount, userId: user.id })
    return actionSuccess(order as Order, 'Order refunded successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Refund validation failed', { error: error.errors })
      return actionError('Invalid refund data', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error refunding order', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete Order (soft delete)
 */
export async function deleteOrder(orderId: string): Promise<ActionResult<{ success: true }>> {
  try {
    // Validate ID
    uuidSchema.parse(orderId)

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized order deletion attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('orders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete order', { error, orderId, userId: user.id })
      return actionError('Failed to delete order', 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/orders-v2')
    logger.info('Order deleted successfully', { orderId, userId: user.id })
    return actionSuccess({ success: true }, 'Order deleted successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Order ID validation failed', { error: error.errors })
      return actionError('Invalid order ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error deleting order', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// SERVER ACTIONS - ORDER ITEMS
// ============================================

/**
 * Add Order Item
 */
export async function addOrderItem(
  orderId: string,
  item: OrderItem
): Promise<ActionResult<OrderItemDB>> {
  try {
    // Validate inputs
    uuidSchema.parse(orderId)
    const validatedItem = orderItemSchema.parse(item)

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized order item addition attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: orderItem, error } = await supabase
      .from('order_items')
      .insert({
        order_id: orderId,
        user_id: user.id,
        product_name: validatedItem.product_name,
        product_sku: validatedItem.product_sku,
        quantity: validatedItem.quantity,
        unit_price: validatedItem.unit_price,
        total_price: validatedItem.unit_price * validatedItem.quantity,
        discount: validatedItem.discount || 0,
        tax: validatedItem.tax || 0,
        product_metadata: validatedItem.product_metadata || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to add order item', { error, orderId, userId: user.id })
      return actionError('Failed to add order item', 'DATABASE_ERROR')
    }

    // Recalculate order totals
    await recalculateOrderTotals(orderId)

    revalidatePath('/dashboard/orders-v2')
    logger.info('Order item added successfully', { itemId: orderItem.id, orderId, userId: user.id })
    return actionSuccess(orderItem as OrderItemDB, 'Order item added successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Order item validation failed', { error: error.errors })
      return actionError('Invalid order item data', 'VALIDATION_ERROR', error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      })))
    }
    logger.error('Unexpected error adding order item', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Remove Order Item
 */
export async function removeOrderItem(itemId: string): Promise<ActionResult<{ success: true }>> {
  try {
    // Validate ID
    uuidSchema.parse(itemId)

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized order item removal attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Get item to find order
    const { data: item, error: fetchError } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('id', itemId)
      .single()

    if (fetchError || !item) {
      logger.error('Failed to fetch order item', { error: fetchError, itemId })
      return actionError('Order item not found', 'NOT_FOUND')
    }

    const { error } = await supabase
      .from('order_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to remove order item', { error, itemId, userId: user.id })
      return actionError('Failed to remove order item', 'DATABASE_ERROR')
    }

    // Recalculate order totals
    await recalculateOrderTotals(item.order_id)

    revalidatePath('/dashboard/orders-v2')
    logger.info('Order item removed successfully', { itemId, orderId: item.order_id, userId: user.id })
    return actionSuccess({ success: true }, 'Order item removed successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Item ID validation failed', { error: error.errors })
      return actionError('Invalid item ID', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error removing order item', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// SERVER ACTIONS - QUERIES
// ============================================

/**
 * Get Order Stats
 */
export async function getOrderStats(): Promise<ActionResult<OrderStats>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized order stats request')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, payment_status, total_amount, created_at')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to fetch order stats', { error, userId: user.id })
      return actionError('Failed to fetch order statistics', 'DATABASE_ERROR')
    }

    const stats: OrderStats = {
      totalOrders: orders?.length || 0,
      totalRevenue: orders?.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total_amount, 0) || 0,
      pendingOrders: orders?.filter(o => o.status === 'pending').length || 0,
      processingOrders: orders?.filter(o => o.status === 'processing').length || 0,
      shippedOrders: orders?.filter(o => o.status === 'shipped').length || 0,
      deliveredOrders: orders?.filter(o => o.status === 'delivered').length || 0,
      cancelledOrders: orders?.filter(o => o.status === 'cancelled').length || 0
    }

    logger.info('Order stats retrieved successfully', { userId: user.id, totalOrders: stats.totalOrders })
    return actionSuccess(stats, 'Statistics retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error fetching order stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Search Orders
 */
export async function searchOrders(query: string): Promise<ActionResult<Order[]>> {
  try {
    // Validate query
    z.string().min(1).max(500).parse(query)

    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized order search attempt')
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .or(`order_number.ilike.%${query}%,customer_name.ilike.%${query}%,customer_email.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      logger.error('Failed to search orders', { error, query, userId: user.id })
      return actionError('Failed to search orders', 'DATABASE_ERROR')
    }

    logger.info('Orders searched successfully', { query, resultCount: orders?.length || 0, userId: user.id })
    return actionSuccess(orders as Order[], 'Orders retrieved successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Search query validation failed', { error: error.errors })
      return actionError('Invalid search query', 'VALIDATION_ERROR')
    }
    logger.error('Unexpected error searching orders', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
