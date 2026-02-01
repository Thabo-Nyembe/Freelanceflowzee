'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
export type FulfillmentStatus = 'unfulfilled' | 'partial' | 'fulfilled'

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  items: OrderItem[]
  subtotal: number
  discount: number
  discountCode?: string
  tax: number
  taxRate: number
  shippingCost: number
  total: number
  currency: string
  shippingAddress: OrderAddress
  billingAddress: OrderAddress
  shippingMethod?: string
  trackingNumber?: string
  paymentMethod: string
  paymentId?: string
  notes?: string
  internalNotes?: string
  tags: string[]
  timeline: OrderEvent[]
  refunds: Refund[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  sku: string
  variant?: string
  quantity: number
  unitPrice: number
  total: number
  imageUrl?: string
  weight?: number
  fulfillmentStatus: 'unfulfilled' | 'fulfilled' | 'cancelled'
  fulfilledQuantity: number
}

export interface OrderAddress {
  firstName: string
  lastName: string
  company?: string
  street1: string
  street2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

export interface OrderEvent {
  id: string
  type: 'created' | 'confirmed' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'note' | 'edited'
  description: string
  userId?: string
  userName?: string
  metadata?: Record<string, any>
  timestamp: string
}

export interface Refund {
  id: string
  amount: number
  reason: string
  items: { itemId: string; quantity: number }[]
  status: 'pending' | 'processed' | 'failed'
  processedAt?: string
  createdAt: string
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  completedOrders: number
  cancelledOrders: number
  totalRevenue: number
  avgOrderValue: number
  itemsSold: number
  refundRate: number
  ordersByStatus: { status: OrderStatus; count: number }[]
  revenueByDay: { date: string; revenue: number; orders: number }[]
  topProducts: { productId: string; name: string; quantity: number; revenue: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockOrders: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2024-001',
    customerId: 'cust-1',
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    status: 'processing',
    paymentStatus: 'paid',
    fulfillmentStatus: 'unfulfilled',
    items: [
      { id: 'item-1', productId: 'prod-1', productName: 'Premium Widget', sku: 'WDG-001', quantity: 2, unitPrice: 49.99, total: 99.98, imageUrl: '/products/widget.jpg', fulfillmentStatus: 'unfulfilled', fulfilledQuantity: 0 },
      { id: 'item-2', productId: 'prod-2', productName: 'Standard Gadget', sku: 'GDG-002', variant: 'Blue', quantity: 1, unitPrice: 29.99, total: 29.99, fulfillmentStatus: 'unfulfilled', fulfilledQuantity: 0 }
    ],
    subtotal: 129.97,
    discount: 10.00,
    discountCode: 'SAVE10',
    tax: 10.40,
    taxRate: 8.25,
    shippingCost: 12.50,
    total: 142.87,
    currency: 'USD',
    shippingAddress: { firstName: 'John', lastName: 'Smith', street1: '456 Main St', street2: 'Apt 2B', city: 'New York', state: 'NY', postalCode: '10001', country: 'US', phone: '555-1234' },
    billingAddress: { firstName: 'John', lastName: 'Smith', street1: '456 Main St', street2: 'Apt 2B', city: 'New York', state: 'NY', postalCode: '10001', country: 'US' },
    shippingMethod: 'Standard Shipping',
    paymentMethod: 'Credit Card',
    paymentId: 'pi_xxx',
    tags: ['new_customer'],
    timeline: [
      { id: 'evt-1', type: 'paid', description: 'Payment received via Credit Card', timestamp: '2024-03-20T10:05:00Z' },
      { id: 'evt-2', type: 'confirmed', description: 'Order confirmed', timestamp: '2024-03-20T10:02:00Z' },
      { id: 'evt-3', type: 'created', description: 'Order placed', timestamp: '2024-03-20T10:00:00Z' }
    ],
    refunds: [],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:05:00Z'
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-2024-002',
    customerId: 'cust-2',
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.com',
    status: 'delivered',
    paymentStatus: 'paid',
    fulfillmentStatus: 'fulfilled',
    items: [
      { id: 'item-3', productId: 'prod-3', productName: 'Deluxe Package', sku: 'DLX-001', quantity: 1, unitPrice: 199.99, total: 199.99, fulfillmentStatus: 'fulfilled', fulfilledQuantity: 1 }
    ],
    subtotal: 199.99,
    discount: 0,
    tax: 16.50,
    taxRate: 8.25,
    shippingCost: 0,
    total: 216.49,
    currency: 'USD',
    shippingAddress: { firstName: 'Jane', lastName: 'Doe', street1: '789 Oak Ave', city: 'Chicago', state: 'IL', postalCode: '60601', country: 'US' },
    billingAddress: { firstName: 'Jane', lastName: 'Doe', street1: '789 Oak Ave', city: 'Chicago', state: 'IL', postalCode: '60601', country: 'US' },
    shippingMethod: 'Free Shipping',
    trackingNumber: '1Z999AA10123456784',
    paymentMethod: 'PayPal',
    tags: ['vip', 'repeat_customer'],
    timeline: [
      { id: 'evt-4', type: 'delivered', description: 'Order delivered', timestamp: '2024-03-18T14:00:00Z' },
      { id: 'evt-5', type: 'shipped', description: 'Order shipped via UPS', timestamp: '2024-03-15T09:00:00Z' },
      { id: 'evt-6', type: 'created', description: 'Order placed', timestamp: '2024-03-14T16:00:00Z' }
    ],
    refunds: [],
    createdAt: '2024-03-14T16:00:00Z',
    updatedAt: '2024-03-18T14:00:00Z'
  },
  {
    id: 'order-3',
    orderNumber: 'ORD-2024-003',
    customerId: 'cust-3',
    customerName: 'Bob Wilson',
    customerEmail: 'bob@example.com',
    status: 'refunded',
    paymentStatus: 'refunded',
    fulfillmentStatus: 'unfulfilled',
    items: [
      { id: 'item-4', productId: 'prod-1', productName: 'Premium Widget', sku: 'WDG-001', quantity: 1, unitPrice: 49.99, total: 49.99, fulfillmentStatus: 'cancelled', fulfilledQuantity: 0 }
    ],
    subtotal: 49.99,
    discount: 0,
    tax: 4.12,
    taxRate: 8.25,
    shippingCost: 5.99,
    total: 60.10,
    currency: 'USD',
    shippingAddress: { firstName: 'Bob', lastName: 'Wilson', street1: '321 Pine St', city: 'Seattle', state: 'WA', postalCode: '98101', country: 'US' },
    billingAddress: { firstName: 'Bob', lastName: 'Wilson', street1: '321 Pine St', city: 'Seattle', state: 'WA', postalCode: '98101', country: 'US' },
    paymentMethod: 'Credit Card',
    tags: [],
    timeline: [
      { id: 'evt-7', type: 'refunded', description: 'Full refund processed', userId: 'user-1', userName: 'Admin', timestamp: '2024-03-19T11:00:00Z' },
      { id: 'evt-8', type: 'cancelled', description: 'Order cancelled by customer', timestamp: '2024-03-19T10:30:00Z' },
      { id: 'evt-9', type: 'created', description: 'Order placed', timestamp: '2024-03-19T10:00:00Z' }
    ],
    refunds: [
      { id: 'ref-1', amount: 60.10, reason: 'Customer requested cancellation', items: [{ itemId: 'item-4', quantity: 1 }], status: 'processed', processedAt: '2024-03-19T11:00:00Z', createdAt: '2024-03-19T10:45:00Z' }
    ],
    createdAt: '2024-03-19T10:00:00Z',
    updatedAt: '2024-03-19T11:00:00Z'
  }
]

const mockStats: OrderStats = {
  totalOrders: 1250,
  pendingOrders: 35,
  processingOrders: 120,
  completedOrders: 1050,
  cancelledOrders: 45,
  totalRevenue: 156420.50,
  avgOrderValue: 125.14,
  itemsSold: 3250,
  refundRate: 3.6,
  ordersByStatus: [
    { status: 'pending', count: 35 },
    { status: 'processing', count: 120 },
    { status: 'shipped', count: 85 },
    { status: 'delivered', count: 965 },
    { status: 'cancelled', count: 30 },
    { status: 'refunded', count: 15 }
  ],
  revenueByDay: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    revenue: 2000 + Math.floor(Math.random() * 1000),
    orders: 15 + Math.floor(Math.random() * 10)
  })),
  topProducts: [
    { productId: 'prod-1', name: 'Premium Widget', quantity: 450, revenue: 22495.50 },
    { productId: 'prod-3', name: 'Deluxe Package', quantity: 180, revenue: 35998.20 },
    { productId: 'prod-2', name: 'Standard Gadget', quantity: 320, revenue: 9596.80 }
  ]
}

// ============================================================================
// HOOK
// ============================================================================

interface UseOrdersOptions {
  
}

export function useOrders(options: UseOrdersOptions = {}) {
  const {  } = options

  const [orders, setOrders] = useState<Order[]>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Return mock data for unauthenticated users
        setOrders([])
        setIsLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Map database response to Order type
      const mappedOrders: Order[] = (data || []).map((order: any) => ({
        id: order.id,
        orderNumber: order.order_number || `ORD-${order.id.slice(0, 8).toUpperCase()}`,
        customerId: order.customer_id || '',
        customerName: order.customer_name || 'Unknown Customer',
        customerEmail: order.customer_email || '',
        status: order.status || 'pending',
        paymentStatus: order.payment_status || 'pending',
        fulfillmentStatus: order.fulfillment_status || 'unfulfilled',
        items: (order.order_items || []).map((item: any) => ({
          id: item.id,
          productId: item.product_id || '',
          productName: item.product_name || 'Unknown Product',
          sku: item.sku || '',
          variant: item.variant,
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || 0,
          total: item.total || 0,
          imageUrl: item.image_url,
          weight: item.weight,
          fulfillmentStatus: item.fulfillment_status || 'unfulfilled',
          fulfilledQuantity: item.fulfilled_quantity || 0
        })),
        subtotal: order.subtotal || 0,
        discount: order.discount || 0,
        discountCode: order.discount_code,
        tax: order.tax || 0,
        taxRate: order.tax_rate || 0,
        shippingCost: order.shipping_cost || 0,
        total: order.total || 0,
        currency: order.currency || 'USD',
        shippingAddress: order.shipping_address || { firstName: '', lastName: '', street1: '', city: '', state: '', postalCode: '', country: '' },
        billingAddress: order.billing_address || order.shipping_address || { firstName: '', lastName: '', street1: '', city: '', state: '', postalCode: '', country: '' },
        shippingMethod: order.shipping_method,
        trackingNumber: order.tracking_number,
        paymentMethod: order.payment_method || 'card',
        paymentId: order.payment_id,
        notes: order.notes,
        internalNotes: order.internal_notes,
        tags: order.tags || [],
        timeline: order.timeline || [],
        refunds: order.refunds || [],
        createdAt: order.created_at,
        updatedAt: order.updated_at || order.created_at
      }))

      setOrders(mappedOrders)

      // Calculate stats
      const totalOrders = mappedOrders.length
      const totalRevenue = mappedOrders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0)
      const pendingCount = mappedOrders.filter(o => o.status === 'pending').length

      setStats({
        totalOrders,
        totalRevenue,
        pendingOrders: pendingCount,
        processingOrders: mappedOrders.filter(o => o.status === 'processing').length,
        shippedOrders: mappedOrders.filter(o => o.status === 'shipped').length,
        deliveredOrders: mappedOrders.filter(o => o.status === 'delivered').length,
        cancelledOrders: mappedOrders.filter(o => o.status === 'cancelled').length,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'))
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createOrder = useCallback(async (orderData: Partial<Order>) => {
    setIsProcessing(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Generate order number
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`

      // Insert order
      const { data: newOrder, error: insertError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          customer_id: orderData.customerId,
          customer_name: orderData.customerName,
          customer_email: orderData.customerEmail,
          status: orderData.status || 'pending',
          payment_status: orderData.paymentStatus || 'pending',
          fulfillment_status: orderData.fulfillmentStatus || 'unfulfilled',
          subtotal: orderData.subtotal || 0,
          discount: orderData.discount || 0,
          discount_code: orderData.discountCode,
          tax: orderData.tax || 0,
          tax_rate: orderData.taxRate || 0,
          shipping_cost: orderData.shippingCost || 0,
          total: orderData.total || 0,
          currency: orderData.currency || 'USD',
          shipping_address: orderData.shippingAddress,
          billing_address: orderData.billingAddress,
          shipping_method: orderData.shippingMethod,
          payment_method: orderData.paymentMethod || 'card',
          notes: orderData.notes,
          tags: orderData.tags || [],
          timeline: [{
            id: `evt-${Date.now()}`,
            type: 'created',
            description: 'Order created',
            timestamp: new Date().toISOString()
          }]
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Insert order items if provided
      if (orderData.items && orderData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderData.items.map(item => ({
            order_id: newOrder.id,
            product_id: item.productId,
            product_name: item.productName,
            sku: item.sku,
            variant: item.variant,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total: item.total,
            image_url: item.imageUrl,
            fulfillment_status: 'unfulfilled',
            fulfilled_quantity: 0
          })))

        if (itemsError) console.warn('Failed to insert order items:', itemsError)
      }

      // Refresh orders list
      await fetchOrders()

      return { success: true, order: newOrder }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create order'))
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create order' }
    } finally {
      setIsProcessing(false)
    }
  }, [fetchOrders])

  const updateOrder = useCallback(async (orderId: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      ...updates,
      timeline: updates.status ? [{
        id: `evt-${Date.now()}`,
        type: updates.status as OrderEvent['type'],
        description: `Order ${updates.status}`,
        timestamp: new Date().toISOString()
      }, ...o.timeline] : o.timeline,
      updatedAt: new Date().toISOString()
    } : o))
    return { success: true }
  }, [])

  const confirmOrder = useCallback(async (orderId: string) => {
    return updateOrder(orderId, { status: 'confirmed' })
  }, [updateOrder])

  const processOrder = useCallback(async (orderId: string) => {
    return updateOrder(orderId, { status: 'processing' })
  }, [updateOrder])

  const shipOrder = useCallback(async (orderId: string, trackingNumber?: string, shippingMethod?: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      status: 'shipped' as const,
      trackingNumber,
      shippingMethod: shippingMethod || o.shippingMethod,
      timeline: [{
        id: `evt-${Date.now()}`,
        type: 'shipped' as const,
        description: `Order shipped${trackingNumber ? ` - Tracking: ${trackingNumber}` : ''}`,
        timestamp: new Date().toISOString()
      }, ...o.timeline],
      updatedAt: new Date().toISOString()
    } : o))
    return { success: true }
  }, [])

  const deliverOrder = useCallback(async (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      status: 'delivered' as const,
      fulfillmentStatus: 'fulfilled' as const,
      items: o.items.map(item => ({ ...item, fulfillmentStatus: 'fulfilled' as const, fulfilledQuantity: item.quantity })),
      timeline: [{
        id: `evt-${Date.now()}`,
        type: 'delivered' as const,
        description: 'Order delivered',
        timestamp: new Date().toISOString()
      }, ...o.timeline],
      updatedAt: new Date().toISOString()
    } : o))
    return { success: true }
  }, [])

  const cancelOrder = useCallback(async (orderId: string, reason?: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      status: 'cancelled' as const,
      items: o.items.map(item => ({ ...item, fulfillmentStatus: 'cancelled' as const })),
      timeline: [{
        id: `evt-${Date.now()}`,
        type: 'cancelled' as const,
        description: reason ? `Order cancelled: ${reason}` : 'Order cancelled',
        timestamp: new Date().toISOString()
      }, ...o.timeline],
      updatedAt: new Date().toISOString()
    } : o))
    return { success: true }
  }, [])

  const refundOrder = useCallback(async (orderId: string, amount: number, reason: string, items?: { itemId: string; quantity: number }[]) => {
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const refund: Refund = {
        id: `ref-${Date.now()}`,
        amount,
        reason,
        items: items || [],
        status: 'processed',
        processedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        status: 'refunded' as const,
        paymentStatus: amount >= o.total ? 'refunded' as const : 'partially_refunded' as const,
        refunds: [...o.refunds, refund],
        timeline: [{
          id: `evt-${Date.now()}`,
          type: 'refunded' as const,
          description: `Refund of ${amount.toFixed(2)} ${o.currency} processed`,
          timestamp: new Date().toISOString()
        }, ...o.timeline],
        updatedAt: new Date().toISOString()
      } : o))

      return { success: true, refund }
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const addNote = useCallback(async (orderId: string, note: string, isInternal: boolean = false) => {
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      notes: isInternal ? o.notes : note,
      internalNotes: isInternal ? note : o.internalNotes,
      timeline: [{
        id: `evt-${Date.now()}`,
        type: 'note' as const,
        description: `${isInternal ? 'Internal note' : 'Note'}: ${note}`,
        timestamp: new Date().toISOString()
      }, ...o.timeline],
      updatedAt: new Date().toISOString()
    } : o))
    return { success: true }
  }, [])

  const addTag = useCallback(async (orderId: string, tag: string) => {
    setOrders(prev => prev.map(o => o.id === orderId && !o.tags.includes(tag) ? {
      ...o,
      tags: [...o.tags, tag],
      updatedAt: new Date().toISOString()
    } : o))
    return { success: true }
  }, [])

  const removeTag = useCallback(async (orderId: string, tag: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      tags: o.tags.filter(t => t !== tag),
      updatedAt: new Date().toISOString()
    } : o))
    return { success: true }
  }, [])

  const searchOrders = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase()
    return orders.filter(o =>
      o.orderNumber.toLowerCase().includes(lowerQuery) ||
      o.customerName.toLowerCase().includes(lowerQuery) ||
      o.customerEmail.toLowerCase().includes(lowerQuery)
    )
  }, [orders])

  const filterOrders = useCallback((filters: { status?: OrderStatus; paymentStatus?: PaymentStatus; dateFrom?: string; dateTo?: string }) => {
    return orders.filter(o => {
      if (filters.status && o.status !== filters.status) return false
      if (filters.paymentStatus && o.paymentStatus !== filters.paymentStatus) return false
      if (filters.dateFrom && new Date(o.createdAt) < new Date(filters.dateFrom)) return false
      if (filters.dateTo && new Date(o.createdAt) > new Date(filters.dateTo)) return false
      return true
    })
  }, [orders])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchOrders()
  }, [fetchOrders])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const pendingOrders = useMemo(() => orders.filter(o => o.status === 'pending'), [orders])
  const processingOrders = useMemo(() => orders.filter(o => o.status === 'processing'), [orders])
  const shippedOrders = useMemo(() => orders.filter(o => o.status === 'shipped'), [orders])
  const deliveredOrders = useMemo(() => orders.filter(o => o.status === 'delivered'), [orders])
  const cancelledOrders = useMemo(() => orders.filter(o => o.status === 'cancelled'), [orders])
  const refundedOrders = useMemo(() => orders.filter(o => o.status === 'refunded'), [orders])
  const unfulfilledOrders = useMemo(() => orders.filter(o => o.fulfillmentStatus === 'unfulfilled' && o.status !== 'cancelled' && o.status !== 'refunded'), [orders])
  const totalRevenue = useMemo(() => orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0), [orders])

  return {
    orders, currentOrder, stats,
    pendingOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrders, refundedOrders,
    unfulfilledOrders, totalRevenue,
    isLoading, isProcessing, error,
    refresh, createOrder, updateOrder, confirmOrder, processOrder, shipOrder, deliverOrder,
    cancelOrder, refundOrder, addNote, addTag, removeTag, searchOrders, filterOrders,
    setCurrentOrder
  }
}

export default useOrders
