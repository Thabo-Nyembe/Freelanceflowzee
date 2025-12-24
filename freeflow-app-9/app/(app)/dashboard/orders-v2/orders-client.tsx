'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
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
  Filter,
  Download,
  Eye,
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
  MessageSquare,
  Printer,
  RotateCcw,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  ChevronRight,
  Settings,
  BarChart3,
  PieChart,
  FileText,
  Box,
  Boxes,
  Receipt,
  Wallet,
  Globe,
  Building,
  Star,
  AlertTriangle,
  PackageCheck,
  PackageX,
  Timer,
  Banknote,
  ArrowLeftRight,
  History,
  Send
} from 'lucide-react'

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
// MOCK DATA GENERATION
// ============================================================================

const mockOrders: Order[] = [
  {
    id: 'ord-001',
    order_number: 'ORD-2024-1001',
    status: 'shipped',
    payment_status: 'paid',
    fulfillment_status: 'fulfilled',
    customer_id: 'cust-001',
    customer_name: 'Sarah Chen',
    customer_email: 'sarah.chen@email.com',
    customer_phone: '+1 (555) 123-4567',
    customer_avatar: '',
    customer_orders_count: 12,
    customer_total_spent: 4567.89,
    shipping_address: {
      first_name: 'Sarah',
      last_name: 'Chen',
      company: 'Tech Corp',
      address1: '123 Main Street',
      address2: 'Suite 456',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94102',
      country: 'United States',
      phone: '+1 (555) 123-4567'
    },
    billing_address: {
      first_name: 'Sarah',
      last_name: 'Chen',
      company: 'Tech Corp',
      address1: '123 Main Street',
      address2: 'Suite 456',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94102',
      country: 'United States',
      phone: '+1 (555) 123-4567'
    },
    items: [
      { id: 'item-001', product_id: 'prod-001', product_name: 'Premium Headphones', variant_name: 'Black / Large', sku: 'HP-BLK-L', quantity: 1, unit_price: 299.99, discount: 30, total: 269.99, weight: 0.5, image_url: '', fulfilled_quantity: 1 },
      { id: 'item-002', product_id: 'prod-002', product_name: 'Wireless Charger', variant_name: 'White', sku: 'WC-WHT', quantity: 2, unit_price: 49.99, discount: 0, total: 99.98, weight: 0.2, image_url: '', fulfilled_quantity: 2 }
    ],
    subtotal: 369.97,
    shipping_cost: 9.99,
    tax: 32.45,
    discount_total: 30.00,
    total: 382.41,
    currency: 'USD',
    payment_method: 'credit_card',
    shipping_method: 'express',
    tracking_number: '1Z999AA10123456784',
    carrier: 'UPS',
    estimated_delivery: '2024-01-18',
    notes: 'Please leave at front door',
    tags: ['VIP', 'repeat-customer'],
    source: 'web',
    ip_address: '192.168.1.100',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-16T14:00:00Z',
    shipped_at: '2024-01-16T09:00:00Z',
    delivered_at: null
  },
  {
    id: 'ord-002',
    order_number: 'ORD-2024-1002',
    status: 'processing',
    payment_status: 'paid',
    fulfillment_status: 'unfulfilled',
    customer_id: 'cust-002',
    customer_name: 'Mike Wilson',
    customer_email: 'mike.wilson@email.com',
    customer_phone: '+1 (555) 234-5678',
    customer_avatar: '',
    customer_orders_count: 5,
    customer_total_spent: 1234.56,
    shipping_address: {
      first_name: 'Mike',
      last_name: 'Wilson',
      company: null,
      address1: '456 Oak Avenue',
      address2: null,
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'United States',
      phone: '+1 (555) 234-5678'
    },
    billing_address: {
      first_name: 'Mike',
      last_name: 'Wilson',
      company: null,
      address1: '456 Oak Avenue',
      address2: null,
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'United States',
      phone: '+1 (555) 234-5678'
    },
    items: [
      { id: 'item-003', product_id: 'prod-003', product_name: 'Smart Watch Pro', variant_name: 'Silver / 44mm', sku: 'SW-SLV-44', quantity: 1, unit_price: 499.99, discount: 50, total: 449.99, weight: 0.3, image_url: '', fulfilled_quantity: 0 }
    ],
    subtotal: 449.99,
    shipping_cost: 0,
    tax: 39.37,
    discount_total: 50.00,
    total: 489.36,
    currency: 'USD',
    payment_method: 'paypal',
    shipping_method: 'free',
    tracking_number: null,
    carrier: null,
    estimated_delivery: '2024-01-22',
    notes: null,
    tags: [],
    source: 'mobile',
    ip_address: '192.168.1.105',
    created_at: '2024-01-15T14:45:00Z',
    updated_at: '2024-01-15T14:45:00Z',
    shipped_at: null,
    delivered_at: null
  },
  {
    id: 'ord-003',
    order_number: 'ORD-2024-1003',
    status: 'pending',
    payment_status: 'pending',
    fulfillment_status: 'unfulfilled',
    customer_id: 'cust-003',
    customer_name: 'Emma Davis',
    customer_email: 'emma.davis@email.com',
    customer_phone: '+1 (555) 345-6789',
    customer_avatar: '',
    customer_orders_count: 1,
    customer_total_spent: 156.78,
    shipping_address: {
      first_name: 'Emma',
      last_name: 'Davis',
      company: null,
      address1: '789 Pine Street',
      address2: 'Apt 12',
      city: 'Austin',
      state: 'TX',
      postal_code: '78701',
      country: 'United States',
      phone: '+1 (555) 345-6789'
    },
    billing_address: {
      first_name: 'Emma',
      last_name: 'Davis',
      company: null,
      address1: '789 Pine Street',
      address2: 'Apt 12',
      city: 'Austin',
      state: 'TX',
      postal_code: '78701',
      country: 'United States',
      phone: '+1 (555) 345-6789'
    },
    items: [
      { id: 'item-004', product_id: 'prod-004', product_name: 'USB-C Cable Pack', variant_name: '3-Pack', sku: 'USB-C-3PK', quantity: 2, unit_price: 29.99, discount: 0, total: 59.98, weight: 0.1, image_url: '', fulfilled_quantity: 0 },
      { id: 'item-005', product_id: 'prod-005', product_name: 'Phone Case', variant_name: 'Clear / iPhone 15', sku: 'PC-CLR-IP15', quantity: 1, unit_price: 34.99, discount: 5, total: 29.99, weight: 0.05, image_url: '', fulfilled_quantity: 0 }
    ],
    subtotal: 89.97,
    shipping_cost: 5.99,
    tax: 7.87,
    discount_total: 5.00,
    total: 98.83,
    currency: 'USD',
    payment_method: 'credit_card',
    shipping_method: 'standard',
    tracking_number: null,
    carrier: null,
    estimated_delivery: '2024-01-25',
    notes: null,
    tags: ['first-order'],
    source: 'web',
    ip_address: '192.168.1.110',
    created_at: '2024-01-15T16:20:00Z',
    updated_at: '2024-01-15T16:20:00Z',
    shipped_at: null,
    delivered_at: null
  },
  {
    id: 'ord-004',
    order_number: 'ORD-2024-1000',
    status: 'delivered',
    payment_status: 'paid',
    fulfillment_status: 'fulfilled',
    customer_id: 'cust-001',
    customer_name: 'Sarah Chen',
    customer_email: 'sarah.chen@email.com',
    customer_phone: '+1 (555) 123-4567',
    customer_avatar: '',
    customer_orders_count: 12,
    customer_total_spent: 4567.89,
    shipping_address: {
      first_name: 'Sarah',
      last_name: 'Chen',
      company: 'Tech Corp',
      address1: '123 Main Street',
      address2: 'Suite 456',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94102',
      country: 'United States',
      phone: '+1 (555) 123-4567'
    },
    billing_address: {
      first_name: 'Sarah',
      last_name: 'Chen',
      company: 'Tech Corp',
      address1: '123 Main Street',
      address2: 'Suite 456',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94102',
      country: 'United States',
      phone: '+1 (555) 123-4567'
    },
    items: [
      { id: 'item-006', product_id: 'prod-006', product_name: 'Laptop Stand', variant_name: 'Space Gray', sku: 'LS-SG', quantity: 1, unit_price: 89.99, discount: 10, total: 79.99, weight: 1.2, image_url: '', fulfilled_quantity: 1 }
    ],
    subtotal: 79.99,
    shipping_cost: 7.99,
    tax: 7.00,
    discount_total: 10.00,
    total: 84.98,
    currency: 'USD',
    payment_method: 'apple_pay',
    shipping_method: 'standard',
    tracking_number: '9400111899223033046782',
    carrier: 'USPS',
    estimated_delivery: '2024-01-12',
    notes: null,
    tags: ['VIP'],
    source: 'web',
    ip_address: '192.168.1.100',
    created_at: '2024-01-08T09:15:00Z',
    updated_at: '2024-01-12T16:30:00Z',
    shipped_at: '2024-01-09T10:00:00Z',
    delivered_at: '2024-01-12T14:23:00Z'
  },
  {
    id: 'ord-005',
    order_number: 'ORD-2024-0999',
    status: 'refunded',
    payment_status: 'refunded',
    fulfillment_status: 'restocked',
    customer_id: 'cust-004',
    customer_name: 'James Brown',
    customer_email: 'james.brown@email.com',
    customer_phone: '+1 (555) 456-7890',
    customer_avatar: '',
    customer_orders_count: 3,
    customer_total_spent: 567.89,
    shipping_address: {
      first_name: 'James',
      last_name: 'Brown',
      company: null,
      address1: '321 Elm Street',
      address2: null,
      city: 'Seattle',
      state: 'WA',
      postal_code: '98101',
      country: 'United States',
      phone: '+1 (555) 456-7890'
    },
    billing_address: {
      first_name: 'James',
      last_name: 'Brown',
      company: null,
      address1: '321 Elm Street',
      address2: null,
      city: 'Seattle',
      state: 'WA',
      postal_code: '98101',
      country: 'United States',
      phone: '+1 (555) 456-7890'
    },
    items: [
      { id: 'item-007', product_id: 'prod-007', product_name: 'Bluetooth Speaker', variant_name: 'Black', sku: 'BS-BLK', quantity: 1, unit_price: 149.99, discount: 0, total: 149.99, weight: 0.8, image_url: '', fulfilled_quantity: 0 }
    ],
    subtotal: 149.99,
    shipping_cost: 0,
    tax: 13.12,
    discount_total: 0,
    total: 163.11,
    currency: 'USD',
    payment_method: 'credit_card',
    shipping_method: 'free',
    tracking_number: null,
    carrier: null,
    estimated_delivery: null,
    notes: 'Customer requested refund - product not as expected',
    tags: ['refund'],
    source: 'web',
    ip_address: '192.168.1.120',
    created_at: '2024-01-05T11:30:00Z',
    updated_at: '2024-01-10T09:00:00Z',
    shipped_at: null,
    delivered_at: null
  }
]

const mockReturns: Return[] = [
  { id: 'ret-001', order_id: 'ord-005', order_number: 'ORD-2024-0999', customer_name: 'James Brown', status: 'refunded', reason: 'Product not as expected', items: [{ product_name: 'Bluetooth Speaker', quantity: 1, refund_amount: 149.99 }], total_refund: 163.11, shipping_label: 'https://example.com/label', tracking_number: '1Z999AA10123456799', created_at: '2024-01-08T14:00:00Z', updated_at: '2024-01-10T09:00:00Z' },
  { id: 'ret-002', order_id: 'ord-006', order_number: 'ORD-2024-0998', customer_name: 'Lisa Thompson', status: 'in_transit', reason: 'Wrong size', items: [{ product_name: 'T-Shirt', quantity: 2, refund_amount: 59.98 }], total_refund: 59.98, shipping_label: 'https://example.com/label2', tracking_number: '1Z999AA10123456800', created_at: '2024-01-12T10:00:00Z', updated_at: '2024-01-14T16:00:00Z' },
  { id: 'ret-003', order_id: 'ord-007', order_number: 'ORD-2024-0997', customer_name: 'Alex Johnson', status: 'requested', reason: 'Damaged in shipping', items: [{ product_name: 'Glass Vase', quantity: 1, refund_amount: 89.99 }], total_refund: 89.99, shipping_label: null, tracking_number: null, created_at: '2024-01-15T08:00:00Z', updated_at: '2024-01-15T08:00:00Z' }
]

const mockCustomers: Customer[] = [
  { id: 'cust-001', name: 'Sarah Chen', email: 'sarah.chen@email.com', phone: '+1 (555) 123-4567', avatar: '', orders_count: 12, total_spent: 4567.89, average_order: 380.66, last_order_at: '2024-01-15T10:30:00Z', created_at: '2023-03-15T00:00:00Z', tags: ['VIP', 'repeat-customer'], accepts_marketing: true, verified: true },
  { id: 'cust-002', name: 'Mike Wilson', email: 'mike.wilson@email.com', phone: '+1 (555) 234-5678', avatar: '', orders_count: 5, total_spent: 1234.56, average_order: 246.91, last_order_at: '2024-01-15T14:45:00Z', created_at: '2023-08-20T00:00:00Z', tags: [], accepts_marketing: true, verified: true },
  { id: 'cust-003', name: 'Emma Davis', email: 'emma.davis@email.com', phone: '+1 (555) 345-6789', avatar: '', orders_count: 1, total_spent: 98.83, average_order: 98.83, last_order_at: '2024-01-15T16:20:00Z', created_at: '2024-01-15T16:20:00Z', tags: ['first-order'], accepts_marketing: false, verified: false },
  { id: 'cust-004', name: 'James Brown', email: 'james.brown@email.com', phone: '+1 (555) 456-7890', avatar: '', orders_count: 3, total_spent: 567.89, average_order: 189.30, last_order_at: '2024-01-05T11:30:00Z', created_at: '2023-11-10T00:00:00Z', tags: [], accepts_marketing: true, verified: true }
]

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

export default function OrdersClient() {
  const [activeTab, setActiveTab] = useState('orders')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return mockOrders.filter(order => {
      const matchesSearch =
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  // Stats calculations
  const stats = useMemo(() => {
    const totalOrders = mockOrders.length
    const totalRevenue = mockOrders.filter(o => o.payment_status === 'paid').reduce((acc, o) => acc + o.total, 0)
    const pendingOrders = mockOrders.filter(o => o.status === 'pending').length
    const processingOrders = mockOrders.filter(o => o.status === 'processing').length
    const shippedOrders = mockOrders.filter(o => o.status === 'shipped').length
    const deliveredOrders = mockOrders.filter(o => o.status === 'delivered').length
    const avgOrderValue = totalRevenue / mockOrders.filter(o => o.payment_status === 'paid').length
    const pendingReturns = mockReturns.filter(r => r.status === 'requested').length

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      avgOrderValue,
      pendingReturns
    }
  }, [])

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
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
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
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredOrders.map(order => (
                    <div
                      key={order.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={order.customer_avatar} />
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fulfillment Tab */}
          <TabsContent value="fulfillment" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Unfulfilled Orders</CardTitle>
                    <CardDescription>Orders ready for fulfillment</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {mockOrders.filter(o => o.fulfillment_status === 'unfulfilled').map(order => (
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
                            <Button size="sm" className="bg-blue-600">
                              <Package className="w-3 h-3 mr-1" />
                              Fulfill
                            </Button>
                            <Button variant="outline" size="sm">
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
                          {mockOrders.filter(o => o.fulfillment_status === 'unfulfilled').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Partially Fulfilled</span>
                        <span className="font-bold text-blue-600">
                          {mockOrders.filter(o => o.fulfillment_status === 'partially_fulfilled').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Fulfilled Today</span>
                        <span className="font-bold text-green-600">
                          {mockOrders.filter(o => o.fulfillment_status === 'fulfilled').length}
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Return Requests</CardTitle>
                    <CardDescription>Manage customer returns and refunds</CardDescription>
                  </div>
                  <Button variant="outline">
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
                            <Button size="sm" className="bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {ret.shipping_label && (
                          <Button variant="outline" size="sm">
                            <Printer className="w-3 h-3 mr-1" />
                            Label
                          </Button>
                        )}
                        {ret.tracking_number && (
                          <Button variant="outline" size="sm">
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
                        <AvatarImage src={customer.avatar} />
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

                    <div className="grid grid-cols-3 gap-3 mb-4">
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
                      { status: 'Pending', amount: mockOrders.filter(o => o.payment_status === 'pending').reduce((acc, o) => acc + o.total, 0), color: 'bg-yellow-500' },
                      { status: 'Refunded', amount: mockOrders.filter(o => o.payment_status === 'refunded').reduce((acc, o) => acc + o.total, 0), color: 'bg-red-500' }
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
                      { source: 'Web', count: mockOrders.filter(o => o.source === 'web').length, pct: 60 },
                      { source: 'Mobile', count: mockOrders.filter(o => o.source === 'mobile').length, pct: 30 },
                      { source: 'POS', count: mockOrders.filter(o => o.source === 'pos').length, pct: 8 },
                      { source: 'API', count: mockOrders.filter(o => o.source === 'api').length, pct: 2 }
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Shipping Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Free Shipping Threshold</p>
                        <p className="text-sm text-gray-500">Minimum order for free shipping</p>
                      </div>
                      <Input type="text" defaultValue="$50.00" className="w-24 text-right" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Default Carrier</p>
                        <p className="text-sm text-gray-500">Preferred shipping carrier</p>
                      </div>
                      <Badge variant="outline">UPS</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-Print Labels</p>
                        <p className="text-sm text-gray-500">Print labels on fulfillment</p>
                      </div>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Payment Capture</p>
                        <p className="text-sm text-gray-500">When to capture payment</p>
                      </div>
                      <Badge variant="outline">On Order</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-Refund</p>
                        <p className="text-sm text-gray-500">Auto-refund cancelled orders</p>
                      </div>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Currency</p>
                        <p className="text-sm text-gray-500">Store currency</p>
                      </div>
                      <Badge variant="outline">USD</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'New Order', enabled: true },
                      { label: 'Order Shipped', enabled: true },
                      { label: 'Return Request', enabled: true },
                      { label: 'Low Stock', enabled: false }
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        <Button variant="outline" size="sm">
                          {item.enabled ? 'On' : 'Off'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Tax Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Tax Calculation</p>
                        <p className="text-sm text-gray-500">How tax is calculated</p>
                      </div>
                      <Badge variant="outline">Automatic</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Include Tax in Prices</p>
                        <p className="text-sm text-gray-500">Display prices with tax</p>
                      </div>
                      <Button variant="outline" size="sm">Disabled</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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

                  <div className="grid grid-cols-2 gap-6">
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

                  <div className="grid grid-cols-2 gap-6">
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

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Order
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
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
