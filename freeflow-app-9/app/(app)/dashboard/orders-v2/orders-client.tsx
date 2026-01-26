'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useOrders } from '@/lib/hooks/use-orders'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Search,
  Download,
  AlertCircle,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Tag,
  Printer,
  RotateCcw,
  Edit,
  Trash2,
  Settings,
  BarChart3,
  Box,
  Receipt,
  AlertTriangle,
  PackageCheck,
  History,
  Send,
  Bell,
  Sliders,
  Terminal,
  Shield,
  List,
  Table2,
  Warehouse,
  ExternalLink
} from 'lucide-react'

// World-class TanStack Table integration
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table'
import { createOrderColumns, type OrderTableRow } from '@/lib/table-columns'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'




// ============================================================================
// TYPE DEFINITIONS - Shopify Level Order Management
// ============================================================================

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'on_hold'
type PaymentStatus = 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'partially_refunded' | 'failed' | 'voided'
type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'restocked'
type ShippingMethod = 'standard' | 'express' | 'overnight' | 'pickup' | 'free'
type ReturnStatus = 'requested' | 'approved' | 'in_transit' | 'received' | 'refunded' | 'rejected'
type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer' | 'cod'

interface OrderItem {
  id: string
  product_id: string
  product_name: string
  variant_name: string
  sku: string
  quantity: number
  unit_price: number
  discount: number
  total: number
  weight: number
  image_url: string
  fulfilled_quantity: number
}

interface ShippingAddress {
  first_name: string
  last_name: string
  company: string | null
  address1: string
  address2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
}

interface Order {
  id: string
  order_number: string
  status: OrderStatus
  payment_status: PaymentStatus
  fulfillment_status: FulfillmentStatus
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_avatar: string
  customer_orders_count: number
  customer_total_spent: number
  shipping_address: ShippingAddress
  billing_address: ShippingAddress
  items: OrderItem[]
  subtotal: number
  shipping_cost: number
  tax: number
  discount_total: number
  total: number
  currency: string
  payment_method: PaymentMethod
  shipping_method: ShippingMethod
  tracking_number: string | null
  carrier: string | null
  estimated_delivery: string | null
  notes: string | null
  tags: string[]
  source: 'web' | 'mobile' | 'pos' | 'api'
  ip_address: string
  created_at: string
  updated_at: string
  shipped_at: string | null
  delivered_at: string | null
}

interface Return {
  id: string
  order_id: string
  order_number: string
  customer_name: string
  status: ReturnStatus
  reason: string
  items: { product_name: string; quantity: number; refund_amount: number }[]
  total_refund: number
  shipping_label: string | null
  tracking_number: string | null
  created_at: string
  updated_at: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  orders_count: number
  total_spent: number
  average_order: number
  last_order_at: string
  created_at: string
  tags: string[]
  accepts_marketing: boolean
  verified: boolean
}

interface OrderTimeline {
  id: string
  order_id: string
  event: string
  description: string
  user: string | null
  created_at: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getOrderStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'processing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'shipped': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'
    case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    case 'refunded': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'on_hold': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'partially_paid': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'refunded': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'partially_refunded': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'voided': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getFulfillmentStatusColor = (status: FulfillmentStatus): string => {
  switch (status) {
    case 'unfulfilled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'partially_fulfilled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'fulfilled': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'restocked': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getReturnStatusColor = (status: ReturnStatus): string => {
  switch (status) {
    case 'requested': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'in_transit': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'
    case 'received': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'refunded': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getOrderStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'pending': return <Clock className="w-3.5 h-3.5" />
    case 'confirmed': return <CheckCircle className="w-3.5 h-3.5" />
    case 'processing': return <Package className="w-3.5 h-3.5" />
    case 'shipped': return <Truck className="w-3.5 h-3.5" />
    case 'delivered': return <PackageCheck className="w-3.5 h-3.5" />
    case 'cancelled': return <XCircle className="w-3.5 h-3.5" />
    case 'refunded': return <RotateCcw className="w-3.5 h-3.5" />
    case 'on_hold': return <AlertTriangle className="w-3.5 h-3.5" />
    default: return <AlertCircle className="w-3.5 h-3.5" />
  }
}

const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// Helper function to generate CSV from orders
const generateOrdersCSV = (orders: Order[]): string => {
  const headers = ['Order Number', 'Customer', 'Email', 'Status', 'Payment Status', 'Total', 'Created At']
  const rows = orders.map(o => [
    o.order_number,
    o.customer_name,
    o.customer_email,
    o.status,
    o.payment_status,
    o.total.toFixed(2),
    new Date(o.created_at).toISOString()
  ])
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

// Helper function to download file
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// API helper functions
const createOrderAPI = async (): Promise<{ id: string; order_number: string }> => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [],
      customer_id: null,
      shipping_method: 'standard'
    })
  })
  if (!response.ok) throw new Error('Failed to create order')
  return response.json()
}

const updateOrderStatusAPI = async (orderId: string, status: OrderStatus): Promise<void> => {
  const response = await fetch(`/api/orders/${orderId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  if (!response.ok) throw new Error('Failed to update order status')
}

const cancelOrderAPI = async (orderId: string): Promise<void> => {
  const response = await fetch(`/api/orders/${orderId}/cancel`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) throw new Error('Failed to cancel order')
}

const fulfillOrderAPI = async (orderId: string): Promise<void> => {
  const response = await fetch(`/api/orders/${orderId}/fulfill`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) throw new Error('Failed to fulfill order')
}

const bulkShipOrdersAPI = async (orderIds: string[]): Promise<void> => {
  const response = await fetch('/api/orders/bulk-ship', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_ids: orderIds })
  })
  if (!response.ok) throw new Error('Failed to process bulk shipment')
}

const approveReturnAPI = async (returnId: string): Promise<void> => {
  const response = await fetch(`/api/returns/${returnId}/approve`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) throw new Error('Failed to approve return')
}

const rejectReturnAPI = async (returnId: string): Promise<void> => {
  const response = await fetch(`/api/returns/${returnId}/reject`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) throw new Error('Failed to reject return')
}

const syncOrdersAPI = async (): Promise<void> => {
  const response = await fetch('/api/orders/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) throw new Error('Failed to sync orders')
}

const archiveOldOrdersAPI = async (): Promise<void> => {
  const response = await fetch('/api/orders/archive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) throw new Error('Failed to archive orders')
}

const deleteTestOrdersAPI = async (): Promise<void> => {
  const response = await fetch('/api/orders/test', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) throw new Error('Failed to delete test orders')
}

const sendOrderUpdateAPI = async (orderId: string): Promise<void> => {
  const response = await fetch(`/api/orders/${orderId}/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) throw new Error('Failed to send update')
}

export default function OrdersClient() {
  const router = useRouter()

  // Supabase hook for orders data
  const {
    orders: dbOrders,
    loading: isLoading,
    error,
    refetch,
    stats: orderStats,
    mutationLoading,
    createOrder,
    updateOrder,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    fulfillOrder: fulfillOrderMutation,
    deleteOrder
  } = useOrders()

  const [activeTab, setActiveTab] = useState('orders')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  // Show error toast if there's an error loading orders
  useEffect(() => {
    if (error) {
      toast.error('Failed to load orders')
    }
  }, [error])

  // Map DB orders to UI Order type
  const orders: Order[] = useMemo(() => {
    if (!dbOrders) return []
    return dbOrders.map((dbOrder): Order => ({
      id: dbOrder.id,
      order_number: dbOrder.order_number,
      status: dbOrder.status as OrderStatus,
      payment_status: dbOrder.payment_status as PaymentStatus,
      fulfillment_status: dbOrder.status === 'shipped' || dbOrder.status === 'delivered' ? 'fulfilled' : 'unfulfilled',
      customer_id: dbOrder.user_id,
      customer_name: dbOrder.customer_name || 'Unknown Customer',
      customer_email: dbOrder.customer_email || '',
      customer_phone: dbOrder.customer_phone || '',
      customer_avatar: '',
      customer_orders_count: 1,
      customer_total_spent: dbOrder.total_amount,
      shipping_address: dbOrder.shipping_address as ShippingAddress || {
        first_name: '',
        last_name: '',
        company: null,
        address1: '',
        address2: null,
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone: ''
      },
      billing_address: dbOrder.billing_address as ShippingAddress || {
        first_name: '',
        last_name: '',
        company: null,
        address1: '',
        address2: null,
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone: ''
      },
      items: [],
      subtotal: dbOrder.subtotal,
      shipping_cost: dbOrder.shipping_cost,
      tax: dbOrder.tax_amount,
      discount_total: dbOrder.discount_amount,
      total: dbOrder.total_amount,
      currency: dbOrder.currency,
      payment_method: (dbOrder.payment_method as PaymentMethod) || 'credit_card',
      shipping_method: 'standard',
      tracking_number: dbOrder.tracking_number,
      carrier: dbOrder.carrier,
      estimated_delivery: dbOrder.estimated_delivery,
      notes: dbOrder.notes,
      tags: [],
      source: 'web',
      ip_address: '',
      created_at: dbOrder.created_at,
      updated_at: dbOrder.updated_at,
      shipped_at: dbOrder.status === 'shipped' ? dbOrder.updated_at : null,
      delivered_at: dbOrder.actual_delivery
    }))
  }, [dbOrders])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-500">Error loading data</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Stats calculations using hook stats
  const stats = {
    totalOrders: orderStats.totalOrders,
    totalRevenue: orderStats.totalRevenue,
    pendingOrders: orderStats.pendingOrders,
    processingOrders: orderStats.processingOrders,
    shippedOrders: orderStats.shippedOrders,
    deliveredOrders: orderStats.deliveredOrders,
    avgOrderValue: orderStats.averageOrderValue,
    pendingReturns: mockReturns.filter(r => r.status === 'requested').length
  }

  // Handlers
  const handleCreateOrder = async () => {
    try {
      const result = await createOrder({
        customer_name: 'New Customer',
        customer_email: 'customer@example.com',
        total_amount: 0
      })
      if (result) {
        toast.success('Order Created', {
          description: `Order ${result.order_number} created successfully`
        })
      }
    } catch {
      toast.error('Failed to create order')
    }
  }

  const handleRefreshOrders = async () => {
    await refetch()
    toast.success('Refreshed', { description: 'Orders list updated' })
  }

  const handleFulfillOrder = async (order: Order) => {
    try {
      await fulfillOrderMutation(order.id)
      toast.success('Order Fulfilled', { description: `Order ${order.order_number} marked as fulfilled` })
    } catch {
      toast.error('Failed to fulfill order')
    }
  }

  const handleExportOrders = () => {
    const csv = generateOrdersCSV(orders)
    downloadFile(csv, `orders-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
    toast.success('Export Complete', { description: 'Orders exported to CSV' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Management</h1>
              <p className="text-gray-500 dark:text-gray-400">Shopify level order processing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/products-v2')}
            >
              <Package className="w-4 h-4 mr-2" />
              Products
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/inventory-v2')}
            >
              <Warehouse className="w-4 h-4 mr-2" />
              Inventory
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/shipping-v2')}
            >
              <Truck className="w-4 h-4 mr-2" />
              Shipping
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/customers-v2')}
            >
              <Users className="w-4 h-4 mr-2" />
              Customers
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                toast.promise(syncOrdersAPI(), {
                  loading: 'Syncing orders...',
                  success: 'Orders synced successfully',
                  error: 'Failed to sync orders'
                })
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
              onClick={async () => {
                toast.promise(createOrderAPI(), {
                  loading: 'Creating order...',
                  success: (data) => `Order ${data.order_number} created successfully`,
                  error: 'Failed to create order'
                })
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Order
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingCart, color: 'from-blue-500 to-indigo-500', change: 12.5 },
            { label: 'Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'from-green-500 to-emerald-500', change: 18.3 },
            { label: 'Pending', value: stats.pendingOrders.toString(), icon: Clock, color: 'from-yellow-500 to-orange-500', change: -5.2 },
            { label: 'Processing', value: stats.processingOrders.toString(), icon: Package, color: 'from-purple-500 to-violet-500', change: 8.7 },
            { label: 'Shipped', value: stats.shippedOrders.toString(), icon: Truck, color: 'from-cyan-500 to-blue-500', change: 15.4 },
            { label: 'Delivered', value: stats.deliveredOrders.toString(), icon: CheckCircle, color: 'from-green-500 to-teal-500', change: 22.1 },
            { label: 'Avg Order', value: formatCurrency(stats.avgOrderValue), icon: TrendingUp, color: 'from-pink-500 to-rose-500', change: 3.8 },
            { label: 'Returns', value: stats.pendingReturns.toString(), icon: RotateCcw, color: 'from-red-500 to-rose-500', change: -12.3 }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  {stat.change !== 0 && (
                    <span className={`text-xs font-medium flex items-center ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(stat.change)}%
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border shadow-sm">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="fulfillment" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Fulfillment
            </TabsTrigger>
            <TabsTrigger value="returns" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Returns
              {stats.pendingReturns > 0 && (
                <Badge className="ml-1 bg-red-500 text-white">{stats.pendingReturns}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-6">
            {/* Orders Overview Banner */}
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Order Management</h2>
                  <p className="text-blue-100">Shopify-level order processing and fulfillment</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{orders.length}</p>
                    <p className="text-blue-200 text-sm">Total Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{orders.filter(o => o.status === 'pending').length}</p>
                    <p className="text-blue-200 text-sm">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Order', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: async () => {
                  toast.promise(createOrderAPI(), {
                    loading: 'Creating new order...',
                    success: (data) => `Order ${data.order_number} created`,
                    error: 'Failed to create order'
                  })
                }},
                { icon: Package, label: 'Fulfill', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: async () => {
                  const unfulfilledIds = orders.filter(o => o.fulfillment_status === 'unfulfilled').map(o => o.id)
                  if (unfulfilledIds.length === 0) {
                    toast.info('No orders to fulfill')
                    return
                  }
                  toast.promise(Promise.all(unfulfilledIds.map(id => fulfillOrderAPI(id))), {
                    loading: `Fulfilling ${unfulfilledIds.length} orders...`,
                    success: `${unfulfilledIds.length} orders fulfilled`,
                    error: 'Failed to fulfill orders'
                  })
                }},
                { icon: Truck, label: 'Ship', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: async () => {
                  const processingIds = orders.filter(o => o.status === 'processing').map(o => o.id)
                  if (processingIds.length === 0) {
                    toast.info('No orders ready for shipping')
                    return
                  }
                  toast.promise(bulkShipOrdersAPI(processingIds), {
                    loading: `Shipping ${processingIds.length} orders...`,
                    success: `${processingIds.length} orders shipped`,
                    error: 'Failed to ship orders'
                  })
                }},
                { icon: RotateCcw, label: 'Returns', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => {
                  setActiveTab('returns')
                  toast.info('Switched to Returns tab')
                }},
                { icon: Receipt, label: 'Invoice', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => {
                  // Generate invoice PDF content
                  const invoiceContent = orders.map(o =>
                    `Invoice: ${o.order_number}\nCustomer: ${o.customer_name}\nTotal: $${o.total.toFixed(2)}\n---`
                  ).join('\n')
                  downloadFile(invoiceContent, `invoices-${new Date().toISOString().split('T')[0]}.txt`, 'text/plain')
                  toast.success('Invoices generated')
                }},
                { icon: Download, label: 'Export', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', action: () => {
                  const csv = generateOrdersCSV(orders)
                  downloadFile(csv, `orders-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
                  toast.success('Orders exported to CSV')
                }},
                { icon: Printer, label: 'Print', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', action: () => {
                  window.print()
                }},
                { icon: BarChart3, label: 'Analytics', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => {
                  setActiveTab('analytics')
                  toast.info('Switched to Analytics tab')
                }},
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>All Orders</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {(['all', 'pending', 'processing', 'shipped', 'delivered'] as const).map(status => (
                        <Button
                          key={status}
                          variant={statusFilter === status ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setStatusFilter(status)}
                          className={statusFilter === status ? 'bg-blue-600' : ''}
                        >
                          {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                    <div className="flex border rounded-lg overflow-hidden ml-2">
                      <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        title="List View"
                        className="rounded-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                        title="Table View (TanStack)"
                        className="rounded-none"
                      >
                        <Table2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Table View */}
                {viewMode === 'table' && (
                  <div className="p-4">
                    <EnhancedDataTable
                      columns={createOrderColumns({
                        onView: (order) => {
                          const fullOrder = filteredOrders.find(o => o.id === order.id)
                          if (fullOrder) setSelectedOrder(fullOrder)
                        },
                        onEdit: (order) => {
                          toast.info('Edit Order', { description: `Editing order ${order.order_number}` })
                        },
                        onFulfill: async (order) => {
                          toast.promise(fulfillOrderAPI(order.id), {
                            loading: `Fulfilling order ${order.order_number}...`,
                            success: `Order ${order.order_number} fulfilled`,
                            error: 'Failed to fulfill order'
                          })
                        },
                        onShip: async (order) => {
                          toast.promise(bulkShipOrdersAPI([order.id]), {
                            loading: `Shipping order ${order.order_number}...`,
                            success: `Order ${order.order_number} shipped`,
                            error: 'Failed to ship order'
                          })
                        },
                        onCancel: async (order) => {
                          toast.promise(cancelOrderAPI(order.id), {
                            loading: `Cancelling order ${order.order_number}...`,
                            success: `Order ${order.order_number} cancelled`,
                            error: 'Failed to cancel order'
                          })
                        },
                        onRefund: async (order) => {
                          toast.info('Refund Order', { description: `Processing refund for order ${order.order_number}` })
                        },
                      })}
                      data={filteredOrders.map((order): OrderTableRow => ({
                        id: order.id,
                        order_number: order.order_number,
                        customer_name: order.customer_name,
                        customer_email: order.customer_email,
                        status: order.status,
                        payment_status: order.payment_status,
                        fulfillment_status: order.fulfillment_status,
                        total: order.total,
                        currency: order.currency,
                        items_count: order.items.length,
                        shipping_method: order.shipping_method,
                        tracking_number: order.tracking_number,
                        created_at: order.created_at,
                        shipped_at: order.shipped_at,
                        delivered_at: order.delivered_at,
                      }))}
                      title="All Orders"
                      description="Manage orders with sorting, filtering, and bulk actions"
                      searchKey="order_number"
                      onRowClick={(row) => {
                        const fullOrder = filteredOrders.find(o => o.id === row.id)
                        if (fullOrder) setSelectedOrder(fullOrder)
                      }}
                    />
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <div className="divide-y">
                    {filteredOrders.map(order => (
                      <div
                        key={order.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={order.customer_avatar} alt="User avatar" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-sm">
                              {order.customer_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {order.order_number}
                              </span>
                              <Badge className={getOrderStatusColor(order.status)}>
                                {getOrderStatusIcon(order.status)}
                                <span className="ml-1">{order.status}</span>
                              </Badge>
                              <Badge className={getPaymentStatusColor(order.payment_status)}>
                                {order.payment_status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {order.customer_name} • {order.items.length} item{order.items.length > 1 ? 's' : ''}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(order.created_at).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {order.shipping_address.city}, {order.shipping_address.state}
                              </span>
                              {order.tracking_number && (
                                <span className="flex items-center gap-1">
                                  <Truck className="w-3 h-3" />
                                  {order.carrier}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatCurrency(order.total)}
                            </p>
                            <p className="text-xs text-gray-500">{order.source}</p>
                            {order.tags.length > 0 && (
                              <div className="flex justify-end gap-1 mt-1">
                                {order.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fulfillment Tab */}
          <TabsContent value="fulfillment" className="mt-6">
            {/* Fulfillment Banner */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Order Fulfillment</h2>
                  <p className="text-green-100">Process, pack, and ship orders efficiently</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{orders.filter(o => o.fulfillment_status === 'unfulfilled').length}</p>
                    <p className="text-green-200 text-sm">Unfulfilled</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{orders.filter(o => o.status === 'shipped').length}</p>
                    <p className="text-green-200 text-sm">Shipped</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fulfillment Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: PackageCheck, label: 'Fulfill All', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: async () => {
                  const unfulfilledIds = orders.filter(o => o.fulfillment_status === 'unfulfilled').map(o => o.id)
                  if (unfulfilledIds.length === 0) {
                    toast.info('No orders to fulfill')
                    return
                  }
                  toast.promise(Promise.all(unfulfilledIds.map(id => fulfillOrderAPI(id))), {
                    loading: `Fulfilling ${unfulfilledIds.length} orders...`,
                    success: `${unfulfilledIds.length} orders fulfilled`,
                    error: 'Failed to fulfill orders'
                  })
                }},
                { icon: Printer, label: 'Print Slips', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => {
                  const slipsContent = orders.filter(o => o.fulfillment_status === 'unfulfilled').map(o =>
                    `PACKING SLIP\n${o.order_number}\nCustomer: ${o.customer_name}\nItems: ${o.items.map(i => `${i.product_name} x${i.quantity}`).join(', ')}\n---`
                  ).join('\n\n')
                  downloadFile(slipsContent, `packing-slips-${new Date().toISOString().split('T')[0]}.txt`, 'text/plain')
                  toast.success('Packing slips generated')
                }},
                { icon: Truck, label: 'Schedule', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: async () => {
                  const processingIds = orders.filter(o => o.status === 'processing').map(o => o.id)
                  if (processingIds.length === 0) {
                    toast.info('No orders ready for shipping')
                    return
                  }
                  toast.promise(bulkShipOrdersAPI(processingIds), {
                    loading: 'Scheduling pickups...',
                    success: `${processingIds.length} pickups scheduled`,
                    error: 'Failed to schedule pickups'
                  })
                }},
                { icon: Box, label: 'Scan Items', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => {
                  toast.info('Scanner mode: Ready to scan items')
                }},
                { icon: Tag, label: 'Labels', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => {
                  const labelsContent = orders.filter(o => o.fulfillment_status === 'unfulfilled').map(o =>
                    `SHIPPING LABEL\nTo: ${o.customer_name}\n${o.shipping_address.address1}\n${o.shipping_address.city}, ${o.shipping_address.state} ${o.shipping_address.postal_code}\n---`
                  ).join('\n\n')
                  downloadFile(labelsContent, `shipping-labels-${new Date().toISOString().split('T')[0]}.txt`, 'text/plain')
                  toast.success('Shipping labels generated')
                }},
                { icon: MapPin, label: 'Track', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', action: () => {
                  const shippedOrdersWithTracking = orders.filter(o => o.tracking_number)
                  if (shippedOrders.length === 0) {
                    toast.info('No orders with tracking numbers')
                    return
                  }
                  toast.success(`${shippedOrders.length} orders have tracking`)
                }},
                { icon: AlertCircle, label: 'Issues', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', action: () => {
                  const onHold = orders.filter(o => o.status === 'on_hold')
                  if (onHold.length === 0) {
                    toast.success('No fulfillment issues')
                  } else {
                    toast.warning(`${onHold.length} orders on hold`)
                  }
                }},
                { icon: History, label: 'History', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => {
                  const historyContent = orders.map(o =>
                    `${o.order_number}: ${o.status} - ${new Date(o.updated_at).toLocaleString()}`
                  ).join('\n')
                  downloadFile(historyContent, `fulfillment-history-${new Date().toISOString().split('T')[0]}.txt`, 'text/plain')
                  toast.success('History exported')
                }},
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Unfulfilled Orders</CardTitle>
                    <CardDescription>Orders ready for fulfillment</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {orders.filter(o => o.fulfillment_status === 'unfulfilled').map(order => (
                        <div key={order.id} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">{order.order_number}</span>
                              <Badge className={getFulfillmentStatusColor(order.fulfillment_status)}>
                                {order.fulfillment_status}
                              </Badge>
                            </div>
                            <span className="font-bold">{formatCurrency(order.total)}</span>
                          </div>
                          <div className="space-y-2 mb-3">
                            {order.items.map(item => (
                              <div key={item.id} className="flex items-center justify-between text-sm">
                                <span>{item.product_name} x{item.quantity}</span>
                                <span className="text-gray-500">{item.sku}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 pt-3 border-t">
                            <Button
                              size="sm"
                              className="bg-blue-600"
                              onClick={async () => {
                                toast.promise(fulfillOrderAPI(order.id), {
                                  loading: `Fulfilling order ${order.order_number}...`,
                                  success: `Order ${order.order_number} fulfilled successfully`,
                                  error: 'Failed to fulfill order'
                                })
                              }}
                            >
                              <Package className="w-3 h-3 mr-1" />
                              Fulfill
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const labelContent = `SHIPPING LABEL\n${order.order_number}\nTo: ${order.customer_name}\n${order.shipping_address.address1}\n${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}`
                                downloadFile(labelContent, `label-${order.order_number}.txt`, 'text/plain')
                                toast.success('Shipping label generated')
                              }}
                            >
                              <Printer className="w-3 h-3 mr-1" />
                              Print Label
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Fulfillment Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Unfulfilled</span>
                        <span className="font-bold text-yellow-600">
                          {orders.filter(o => o.fulfillment_status === 'unfulfilled').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Partially Fulfilled</span>
                        <span className="font-bold text-blue-600">
                          {orders.filter(o => o.fulfillment_status === 'partially_fulfilled').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Fulfilled Today</span>
                        <span className="font-bold text-green-600">
                          {orders.filter(o => o.fulfillment_status === 'fulfilled').length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Carriers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['UPS', 'USPS', 'FedEx', 'DHL'].map((carrier, i) => (
                        <div key={carrier} className="flex items-center justify-between p-2 border rounded-lg">
                          <span className="font-medium">{carrier}</span>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Returns Tab */}
          <TabsContent value="returns" className="mt-6">
            {/* Returns Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Returns & Refunds</h2>
                  <p className="text-amber-100">Process returns and issue refunds quickly</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockReturns.length}</p>
                    <p className="text-amber-200 text-sm">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">98%</p>
                    <p className="text-amber-200 text-sm">Resolved</p>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Return Requests</CardTitle>
                    <CardDescription>Manage customer returns and refunds</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      toast.promise(
                        (async () => {
                          const response = await fetch('/api/orders?type=returns&format=csv')
                          if (!response.ok) throw new Error('Export failed')
                          const blob = await response.blob()
                          const url = window.URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `returns-export-${new Date().toISOString().split('T')[0]}.csv`
                          document.body.appendChild(a)
                          a.click()
                          window.URL.revokeObjectURL(url)
                          a.remove()
                          return 'Export complete'
                        })(),
                        {
                          loading: 'Exporting returns data...',
                          success: 'Returns data exported successfully',
                          error: 'Failed to export returns data'
                        }
                      )
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {mockReturns.map(ret => (
                    <div key={ret.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{ret.order_number}</span>
                            <Badge className={getReturnStatusColor(ret.status)}>
                              {ret.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{ret.customer_name}</p>
                        </div>
                        <span className="font-bold text-red-600">
                          -{formatCurrency(ret.total_refund)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        <strong>Reason:</strong> {ret.reason}
                      </p>
                      <div className="space-y-1 mb-3">
                        {ret.items.map((item, i) => (
                          <p key={i} className="text-sm">
                            {item.product_name} x{item.quantity} - {formatCurrency(item.refund_amount)}
                          </p>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t">
                        {ret.status === 'requested' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600"
                              onClick={() => {
                                toast.promise(
                                  fetch('/api/orders', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      action: 'approve_return',
                                      returnId: ret.id,
                                      orderId: ret.order_id
                                    })
                                  }).then(res => {
                                    if (!res.ok) throw new Error('Approval failed')
                                    return res.json()
                                  }),
                                  {
                                    loading: `Approving return for ${ret.order_number}...`,
                                    success: `Return for ${ret.order_number} approved`,
                                    error: 'Failed to approve return'
                                  }
                                )
                              }}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              onClick={() => {
                                toast.promise(
                                  fetch('/api/orders', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      action: 'reject_return',
                                      returnId: ret.id,
                                      orderId: ret.order_id
                                    })
                                  }).then(res => {
                                    if (!res.ok) throw new Error('Rejection failed')
                                    return res.json()
                                  }),
                                  {
                                    loading: `Rejecting return for ${ret.order_number}...`,
                                    success: `Return for ${ret.order_number} rejected`,
                                    error: 'Failed to reject return'
                                  }
                                )
                              }}
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {ret.shipping_label && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast.promise(
                                fetch(`/api/orders?action=generate_label&returnId=${ret.id}`).then(async res => {
                                  if (!res.ok) throw new Error('Label generation failed')
                                  const blob = await res.blob()
                                  const url = window.URL.createObjectURL(blob)
                                  window.open(url, '_blank')
                                  return 'Label ready'
                                }),
                                {
                                  loading: 'Generating return label...',
                                  success: 'Return label generated',
                                  error: 'Failed to generate label'
                                }
                              )
                            }}
                          >
                            <Printer className="w-3 h-3 mr-1" />
                            Label
                          </Button>
                        )}
                        {ret.tracking_number && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast.promise(
                                fetch(`/api/orders?action=track&trackingNumber=${ret.tracking_number}`).then(async res => {
                                  if (!res.ok) throw new Error('Tracking lookup failed')
                                  const data = await res.json()
                                  // Copy tracking number to clipboard
                                  navigator.clipboard.writeText(ret.tracking_number)
                                  return `Tracking: ${ret.tracking_number} - ${data.status || 'In transit'}`
                                }),
                                {
                                  loading: 'Loading tracking info...',
                                  success: (msg) => msg,
                                  error: 'Failed to load tracking'
                                }
                              )
                            }}
                          >
                            <Truck className="w-3 h-3 mr-1" />
                            Track
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="mt-6">
            {/* Customers Banner */}
            <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Customer Directory</h2>
                  <p className="text-violet-100">View customer profiles and order history</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockCustomers.length}</p>
                    <p className="text-violet-200 text-sm">Customers</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockCustomers.map(customer => (
                <Card
                  key={customer.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={customer.avatar} alt="User avatar" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {customer.name}
                          {customer.verified && <CheckCircle className="w-4 h-4 text-blue-500 inline ml-1" />}
                        </h3>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{customer.orders_count}</p>
                        <p className="text-xs text-gray-500">Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{formatCurrency(customer.total_spent)}</p>
                        <p className="text-xs text-gray-500">Spent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(customer.average_order)}</p>
                        <p className="text-xs text-gray-500">Avg Order</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {customer.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                      <span>Last order: {new Date(customer.last_order_at).toLocaleDateString()}</span>
                      {customer.accepts_marketing && (
                        <Badge variant="secondary" className="text-xs">
                          <Mail className="w-3 h-3 mr-1" />
                          Marketing
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { status: 'Paid', amount: stats.totalRevenue, color: 'bg-green-500' },
                      { status: 'Pending', amount: orders.filter(o => o.payment_status === 'pending').reduce((acc, o) => acc + o.total, 0), color: 'bg-yellow-500' },
                      { status: 'Refunded', amount: orders.filter(o => o.payment_status === 'refunded').reduce((acc, o) => acc + o.total, 0), color: 'bg-red-500' }
                    ].map(item => (
                      <div key={item.status} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="flex-1">{item.status}</span>
                        <span className="font-semibold">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { source: 'Web', count: orders.filter(o => o.source === 'web').length, pct: 60 },
                      { source: 'Mobile', count: orders.filter(o => o.source === 'mobile').length, pct: 30 },
                      { source: 'POS', count: orders.filter(o => o.source === 'pos').length, pct: 8 },
                      { source: 'API', count: orders.filter(o => o.source === 'api').length, pct: 2 }
                    ].map(item => (
                      <div key={item.source} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.source}</span>
                          <span className="font-semibold">{item.count} orders ({item.pct}%)</span>
                        </div>
                        <Progress value={item.pct} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Premium Headphones', sold: 45, revenue: 13499.55 },
                      { name: 'Smart Watch Pro', sold: 32, revenue: 15999.68 },
                      { name: 'Wireless Charger', sold: 89, revenue: 4449.11 },
                      { name: 'USB-C Cable Pack', sold: 156, revenue: 4678.44 }
                    ].map((product, i) => (
                      <div key={product.name} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sold} sold</p>
                        </div>
                        <span className="font-semibold">{formatCurrency(product.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shipping Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { method: 'Standard', count: 3, pct: 40 },
                      { method: 'Express', count: 1, pct: 20 },
                      { method: 'Free Shipping', count: 2, pct: 30 },
                      { method: 'Pickup', count: 0, pct: 10 }
                    ].map(item => (
                      <div key={item.method} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.method}</span>
                          <span className="font-semibold">{item.pct}%</span>
                        </div>
                        <Progress value={item.pct} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-500" />
                      Settings
                    </CardTitle>
                    <CardDescription>Configure order management</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'shipping', label: 'Shipping', icon: Truck },
                        { id: 'payments', label: 'Payments', icon: CreditCard },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                            settingsTab === item.id
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-blue-500" />
                          General Settings
                        </CardTitle>
                        <CardDescription>Basic order preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="auto-confirm" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Auto-Confirm Orders</span>
                            <span className="text-sm text-slate-500">Confirm orders automatically</span>
                          </Label>
                          <Switch id="auto-confirm" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="low-stock" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Low Stock Alerts</span>
                            <span className="text-sm text-slate-500">Alert when stock is low</span>
                          </Label>
                          <Switch id="low-stock" defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Order Number Prefix</Label>
                            <Input defaultValue="ORD-" />
                          </div>
                          <div className="space-y-2">
                            <Label>Default Currency</Label>
                            <Input defaultValue="USD" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Tax Settings</CardTitle>
                        <CardDescription>Configure tax calculations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="auto-tax" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Automatic Tax</span>
                            <span className="text-sm text-slate-500">Calculate tax automatically</span>
                          </Label>
                          <Switch id="auto-tax" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="tax-inclusive" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Tax-Inclusive Prices</span>
                            <span className="text-sm text-slate-500">Include tax in displayed prices</span>
                          </Label>
                          <Switch id="tax-inclusive" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Shipping Settings */}
                {settingsTab === 'shipping' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Truck className="w-5 h-5 text-blue-500" />
                          Shipping Settings
                        </CardTitle>
                        <CardDescription>Configure shipping options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="auto-label" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Auto-Print Labels</span>
                            <span className="text-sm text-slate-500">Print labels on fulfillment</span>
                          </Label>
                          <Switch id="auto-label" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="tracking-email" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Send Tracking Email</span>
                            <span className="text-sm text-slate-500">Email customers tracking info</span>
                          </Label>
                          <Switch id="tracking-email" defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Free Shipping Threshold</Label>
                            <Input defaultValue="$50.00" />
                          </div>
                          <div className="space-y-2">
                            <Label>Default Carrier</Label>
                            <Input defaultValue="UPS" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Fulfillment Settings</CardTitle>
                        <CardDescription>Order fulfillment options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="auto-fulfill" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Auto-Fulfill Digital</span>
                            <span className="text-sm text-slate-500">Auto-fulfill digital products</span>
                          </Label>
                          <Switch id="auto-fulfill" defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Payment Settings */}
                {settingsTab === 'payments' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-blue-500" />
                          Payment Settings
                        </CardTitle>
                        <CardDescription>Configure payment processing</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="auto-capture" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Auto-Capture Payments</span>
                            <span className="text-sm text-slate-500">Capture on order placement</span>
                          </Label>
                          <Switch id="auto-capture" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="auto-refund" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Auto-Refund Cancellations</span>
                            <span className="text-sm text-slate-500">Refund cancelled orders</span>
                          </Label>
                          <Switch id="auto-refund" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="partial-pay" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Allow Partial Payments</span>
                            <span className="text-sm text-slate-500">Enable payment plans</span>
                          </Label>
                          <Switch id="partial-pay" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>Enable payment options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {['Credit Card', 'PayPal', 'Apple Pay', 'Google Pay'].map(method => (
                          <div key={method} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <span className="font-medium">{method}</span>
                            <Switch defaultChecked />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-blue-500" />
                          Email Notifications
                        </CardTitle>
                        <CardDescription>Configure email alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {[
                          { id: 'new-order', label: 'New Order', desc: 'Notify on new orders' },
                          { id: 'order-shipped', label: 'Order Shipped', desc: 'Notify when orders ship' },
                          { id: 'return-req', label: 'Return Request', desc: 'Notify on return requests' },
                          { id: 'low-stock-notif', label: 'Low Stock', desc: 'Alert on low inventory' },
                        ].map(item => (
                          <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <Label htmlFor={item.id} className="flex flex-col gap-1 cursor-pointer">
                              <span className="font-medium">{item.label}</span>
                              <span className="text-sm text-slate-500">{item.desc}</span>
                            </Label>
                            <Switch id={item.id} defaultChecked />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-blue-500" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>Order security options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="fraud-detect" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Fraud Detection</span>
                            <span className="text-sm text-slate-500">Enable fraud screening</span>
                          </Label>
                          <Switch id="fraud-detect" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="order-verify" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Order Verification</span>
                            <span className="text-sm text-slate-500">Require email verification</span>
                          </Label>
                          <Switch id="order-verify" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="pci-comply" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">PCI Compliance</span>
                            <span className="text-sm text-slate-500">PCI-DSS compliant processing</span>
                          </Label>
                          <Switch id="pci-comply" defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-blue-500" />
                          Advanced Options
                        </CardTitle>
                        <CardDescription>Expert configuration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="api-access" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">API Access</span>
                            <span className="text-sm text-slate-500">Enable order API</span>
                          </Label>
                          <Switch id="api-access" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="webhook" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Webhooks</span>
                            <span className="text-sm text-slate-500">Send order events</span>
                          </Label>
                          <Switch id="webhook" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Archive Old Orders</p>
                            <p className="text-sm text-red-600 dark:text-red-400/80">Archive orders older than 1 year</p>
                          </div>
                          <Button
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-100"
                            onClick={() => {
                              toast.promise(
                                fetch('/api/orders', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'archive_old', olderThanDays: 365 })
                                }).then(res => {
                                  if (!res.ok) throw new Error('Archive failed')
                                  return res.json()
                                }),
                                {
                                  loading: 'Archiving old orders...',
                                  success: 'Old orders archived successfully',
                                  error: 'Failed to archive orders'
                                }
                              )
                            }}
                          >
                            <History className="w-4 h-4 mr-2" />
                            Archive
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete Test Orders</p>
                            <p className="text-sm text-red-600 dark:text-red-400/80">Remove all test/sandbox orders</p>
                          </div>
                          <Button
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-100"
                            onClick={() => {
                              toast.promise(
                                fetch('/api/orders', {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'delete_test_orders' })
                                }).then(res => {
                                  if (!res.ok) throw new Error('Delete failed')
                                  return res.json()
                                }),
                                {
                                  loading: 'Deleting test orders...',
                                  success: 'Test orders deleted successfully',
                                  error: 'Failed to delete test orders'
                                }
                              )
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockOrdersAIInsights}
              title="Order Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockOrdersCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockOrdersPredictions}
              title="Order Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockOrdersActivities}
            title="Order Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockOrdersQuickActions}
            variant="grid"
          />
        </div>

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5" />
                {selectedOrder?.order_number}
              </DialogTitle>
              <DialogDescription>
                {selectedOrder && `Placed ${new Date(selectedOrder.created_at).toLocaleString()}`}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(85vh-120px)]">
              {selectedOrder && (
                <div className="space-y-6 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getOrderStatusColor(selectedOrder.status)}>
                      {getOrderStatusIcon(selectedOrder.status)}
                      <span className="ml-1">{selectedOrder.status}</span>
                    </Badge>
                    <Badge className={getPaymentStatusColor(selectedOrder.payment_status)}>
                      {selectedOrder.payment_status}
                    </Badge>
                    <Badge className={getFulfillmentStatusColor(selectedOrder.fulfillment_status)}>
                      {selectedOrder.fulfillment_status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Customer</h4>
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{selectedOrder.customer_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedOrder.customer_name}</p>
                          <p className="text-sm text-gray-500">{selectedOrder.customer_orders_count} orders • {formatCurrency(selectedOrder.customer_total_spent)} spent</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {selectedOrder.customer_email}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {selectedOrder.customer_phone}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          router.push(`/dashboard/customers-v2?highlight=${selectedOrder.customer_id}`)
                          setSelectedOrder(null)
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Customer
                      </Button>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Shipping Address</h4>
                      <div className="text-sm space-y-1">
                        <p>{selectedOrder.shipping_address.first_name} {selectedOrder.shipping_address.last_name}</p>
                        {selectedOrder.shipping_address.company && <p>{selectedOrder.shipping_address.company}</p>}
                        <p>{selectedOrder.shipping_address.address1}</p>
                        {selectedOrder.shipping_address.address2 && <p>{selectedOrder.shipping_address.address2}</p>}
                        <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</p>
                        <p>{selectedOrder.shipping_address.country}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Items</h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Box className="w-6 h-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-gray-500">{item.variant_name} • {item.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(item.total)}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Payment</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatCurrency(selectedOrder.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping ({selectedOrder.shipping_method})</span>
                          <span>{formatCurrency(selectedOrder.shipping_cost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span>{formatCurrency(selectedOrder.tax)}</span>
                        </div>
                        {selectedOrder.discount_total > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-{formatCurrency(selectedOrder.discount_total)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Total</span>
                          <span>{formatCurrency(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </div>

                    {selectedOrder.tracking_number && (
                      <div>
                        <h4 className="font-semibold mb-3">Tracking</h4>
                        <div className="p-3 border rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">{selectedOrder.carrier}</p>
                          <p className="font-mono text-sm">{selectedOrder.tracking_number}</p>
                          {selectedOrder.estimated_delivery && (
                            <p className="text-sm text-gray-500 mt-2">
                              Est. delivery: {new Date(selectedOrder.estimated_delivery).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedOrder.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes</h4>
                      <p className="text-sm text-gray-600 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  )}

                  {/* Quick Navigation Links */}
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
                    <span className="text-sm text-muted-foreground mr-2">Quick Navigation:</span>
                    {selectedOrder.customer_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/clients-v2?highlight=${selectedOrder.customer_id}`)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        View Client
                      </Button>
                    )}
                    {selectedOrder.items.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/products-v2?highlight=${selectedOrder.items[0]?.product_id}`)}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        View Products
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        // Open order edit mode
                        toast.info('Edit Order', {
                          description: `Editing order ${selectedOrder.order_number}`,
                          action: {
                            label: 'Save Changes',
                            onClick: () => {
                              toast.promise(
                                fetch('/api/orders', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ orderId: selectedOrder.id, action: 'update' })
                                }).then(res => res.json()),
                                {
                                  loading: 'Saving changes...',
                                  success: 'Order updated',
                                  error: 'Failed to update'
                                }
                              )
                            }
                          }
                        })
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Order
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        toast.promise(
                          fetch(`/api/orders?action=print&orderId=${selectedOrder.id}`).then(async res => {
                            if (!res.ok) throw new Error('Print failed')
                            const blob = await res.blob()
                            const url = window.URL.createObjectURL(blob)
                            const printWindow = window.open(url)
                            if (printWindow) {
                              printWindow.onload = () => printWindow.print()
                            }
                            return 'Ready'
                          }),
                          {
                            loading: 'Preparing print preview...',
                            success: 'Print preview ready',
                            error: 'Failed to generate print preview'
                          }
                        )
                      }}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                      onClick={() => {
                        toast.promise(
                          fetch('/api/orders', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              action: 'send_update',
                              orderId: selectedOrder.id,
                              customerEmail: selectedOrder.customer_email
                            })
                          }).then(res => {
                            if (!res.ok) throw new Error('Send failed')
                            return res.json()
                          }),
                          {
                            loading: 'Sending order update...',
                            success: 'Order update sent to customer',
                            error: 'Failed to send update'
                          }
                        )
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Update
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
