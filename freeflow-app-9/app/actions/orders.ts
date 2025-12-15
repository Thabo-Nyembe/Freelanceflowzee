'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Order Types
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'on_hold'
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial'
type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto' | 'cash' | 'other'

// Generate Order Number
function generateOrderNumber(): string {
  const prefix = 'ORD'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// Create Order
export async function createOrder(data: {
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  shipping_address?: Record<string, any>
  billing_address?: Record<string, any>
  currency?: string
  payment_method?: PaymentMethod
  notes?: string
  items: Array<{
    product_name: string
    product_sku?: string
    quantity: number
    unit_price: number
    discount?: number
    tax?: number
    product_metadata?: Record<string, any>
  }>
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Calculate totals
  const subtotal = data.items.reduce((sum, item) => {
    return sum + (item.unit_price * item.quantity)
  }, 0)

  const totalDiscount = data.items.reduce((sum, item) => {
    return sum + (item.discount || 0)
  }, 0)

  const totalTax = data.items.reduce((sum, item) => {
    return sum + (item.tax || 0)
  }, 0)

  const totalAmount = subtotal - totalDiscount + totalTax

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      order_number: generateOrderNumber(),
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      shipping_address: data.shipping_address || {},
      billing_address: data.billing_address || {},
      subtotal,
      tax_amount: totalTax,
      discount_amount: totalDiscount,
      total_amount: totalAmount,
      currency: data.currency || 'USD',
      payment_method: data.payment_method,
      notes: data.notes,
      status: 'pending',
      payment_status: 'pending'
    })
    .select()
    .single()

  if (orderError) throw orderError

  // Create order items
  const orderItems = data.items.map(item => ({
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

  if (itemsError) throw itemsError

  revalidatePath('/dashboard/orders-v2')
  return order
}

// Update Order
export async function updateOrder(orderId: string, data: Partial<{
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: Record<string, any>
  billing_address: Record<string, any>
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod
  tracking_number: string
  carrier: string
  estimated_delivery: string
  actual_delivery: string
  notes: string
  internal_notes: string
  metadata: Record<string, any>
}>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: order, error } = await supabase
    .from('orders')
    .update(data)
    .eq('id', orderId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/orders-v2')
  return order
}

// Update Order Status
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return updateOrder(orderId, { status })
}

// Update Payment Status
export async function updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
  return updateOrder(orderId, { payment_status: paymentStatus })
}

// Add Tracking Info
export async function addTrackingInfo(orderId: string, data: {
  tracking_number: string
  carrier: string
  estimated_delivery?: string
}) {
  return updateOrder(orderId, {
    tracking_number: data.tracking_number,
    carrier: data.carrier,
    estimated_delivery: data.estimated_delivery,
    status: 'shipped'
  })
}

// Mark as Delivered
export async function markOrderDelivered(orderId: string) {
  return updateOrder(orderId, {
    status: 'delivered',
    actual_delivery: new Date().toISOString()
  })
}

// Cancel Order
export async function cancelOrder(orderId: string, reason?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/orders-v2')
  return order
}

// Refund Order
export async function refundOrder(orderId: string, refundAmount?: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/orders-v2')
  return order
}

// Delete Order (soft delete)
export async function deleteOrder(orderId: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('orders')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/orders-v2')
  return { success: true }
}

// Add Order Item
export async function addOrderItem(orderId: string, item: {
  product_name: string
  product_sku?: string
  quantity: number
  unit_price: number
  discount?: number
  tax?: number
  product_metadata?: Record<string, any>
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: orderItem, error } = await supabase
    .from('order_items')
    .insert({
      order_id: orderId,
      user_id: user.id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
      discount: item.discount || 0,
      tax: item.tax || 0,
      product_metadata: item.product_metadata || {}
    })
    .select()
    .single()

  if (error) throw error

  // Recalculate order totals
  await recalculateOrderTotals(orderId)

  revalidatePath('/dashboard/orders-v2')
  return orderItem
}

// Remove Order Item
export async function removeOrderItem(itemId: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get item to find order
  const { data: item } = await supabase
    .from('order_items')
    .select('order_id')
    .eq('id', itemId)
    .single()

  const { error } = await supabase
    .from('order_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.id)

  if (error) throw error

  // Recalculate order totals
  if (item?.order_id) {
    await recalculateOrderTotals(item.order_id)
  }

  revalidatePath('/dashboard/orders-v2')
  return { success: true }
}

// Helper: Recalculate Order Totals
async function recalculateOrderTotals(orderId: string) {
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

// Get Order Stats
export async function getOrderStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: orders } = await supabase
    .from('orders')
    .select('status, payment_status, total_amount, created_at')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  const stats = {
    totalOrders: orders?.length || 0,
    totalRevenue: orders?.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total_amount, 0) || 0,
    pendingOrders: orders?.filter(o => o.status === 'pending').length || 0,
    processingOrders: orders?.filter(o => o.status === 'processing').length || 0,
    shippedOrders: orders?.filter(o => o.status === 'shipped').length || 0,
    deliveredOrders: orders?.filter(o => o.status === 'delivered').length || 0,
    cancelledOrders: orders?.filter(o => o.status === 'cancelled').length || 0
  }

  return stats
}

// Search Orders
export async function searchOrders(query: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .or(`order_number.ilike.%${query}%,customer_name.ilike.%${query}%,customer_email.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error

  return orders
}
