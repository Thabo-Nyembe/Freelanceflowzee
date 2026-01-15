'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Shield
} from 'lucide-react'

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

// Mock data for AI-powered competitive upgrade components
const mockOrdersAIInsights = [
  { id: '1', type: 'success' as const, title: 'Revenue Milestone', description: 'Crossed $1M in orders this month - 25% above target!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Revenue' },
  { id: '2', type: 'warning' as const, title: 'Fulfillment Delay', description: '12 orders pending shipment over 24 hours.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Fulfillment' },
  { id: '3', type: 'info' as const, title: 'AOV Increasing', description: 'Average order value up 18% compared to last month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
]

const mockOrdersCollaborators = [
  { id: '1', name: 'Operations Manager', avatar: '/avatars/operations.jpg', status: 'online' as const, role: 'Operations' },
  { id: '2', name: 'Fulfillment Lead', avatar: '/avatars/fulfillment.jpg', status: 'online' as const, role: 'Fulfillment' },
  { id: '3', name: 'Customer Service', avatar: '/avatars/service.jpg', status: 'away' as const, role: 'Support' },
]

const mockOrdersPredictions = [
  { id: '1', title: 'Holiday Rush', prediction: 'Expect 3x order volume in next 2 weeks', confidence: 91, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Return Rate', prediction: 'Current return rate suggests $8K in returns expected', confidence: 77, trend: 'up' as const, impact: 'medium' as const },
]

const mockOrdersActivities = [
  { id: '1', user: 'Fulfillment Lead', action: 'Shipped', target: '45 orders today', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Customer Service', action: 'Processed', target: 'refund for order #9823', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Operations Manager', action: 'Approved', target: 'expedited shipping for VIP', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions will be defined inside the component with dialog handlers

export default function OrdersClient() {
  const [activeTab, setActiveTab] = useState('orders')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states for real functionality
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false)
  const [showBulkShipDialog, setShowBulkShipDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showFulfillDialog, setShowFulfillDialog] = useState(false)
  const [orderToFulfill, setOrderToFulfill] = useState<Order | null>(null)

  // New Order Form State
  const [newOrderForm, setNewOrderForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingPostal: '',
    productName: '',
    quantity: '1',
    unitPrice: '',
    shippingMethod: 'standard' as ShippingMethod,
    paymentMethod: 'credit_card' as PaymentMethod,
    notes: ''
  })

  // Bulk Ship Form State
  const [bulkShipForm, setBulkShipForm] = useState({
    carrier: 'UPS',
    shippingSpeed: 'standard',
    selectedOrderIds: [] as string[],
    notifyCustomers: true,
    generateLabels: true
  })

  // Export Form State
  const [exportForm, setExportForm] = useState({
    format: 'csv',
    dateRange: 'all',
    includeCustomerData: true,
    includePaymentData: true,
    includeShippingData: true,
    includeItemDetails: true
  })

  // Fulfill Order Form State
  const [fulfillForm, setFulfillForm] = useState({
    trackingNumber: '',
    carrier: 'UPS',
    notifyCustomer: true,
    notes: ''
  })

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

  // Handlers with real dialog workflows
  const handleCreateOrder = () => {
    setShowNewOrderDialog(true)
  }

  const handleSubmitNewOrder = () => {
    if (!newOrderForm.customerName || !newOrderForm.customerEmail || !newOrderForm.productName || !newOrderForm.unitPrice) {
      toast.error('Missing required fields', {
        description: 'Please fill in customer name, email, product name, and price'
      })
      return
    }

    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    toast.success('Order Created Successfully', {
      description: `Order ${orderNumber} has been created for ${newOrderForm.customerName}`
    })

    setNewOrderForm({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      shippingAddress: '',
      shippingCity: '',
      shippingState: '',
      shippingPostal: '',
      productName: '',
      quantity: '1',
      unitPrice: '',
      shippingMethod: 'standard',
      paymentMethod: 'credit_card',
      notes: ''
    })
    setShowNewOrderDialog(false)
  }

  const handleBulkShip = () => {
    setShowBulkShipDialog(true)
  }

  const handleSubmitBulkShip = () => {
    const unfulfilled = mockOrders.filter(o => o.fulfillment_status === 'unfulfilled')
    if (unfulfilled.length === 0) {
      toast.error('No orders to ship', {
        description: 'All orders have already been fulfilled'
      })
      return
    }

    toast.success('Bulk Shipment Processed', {
      description: `${unfulfilled.length} orders shipped via ${bulkShipForm.carrier} (${bulkShipForm.shippingSpeed})`
    })

    if (bulkShipForm.notifyCustomers) {
      toast.info('Customer Notifications', {
        description: `Shipping notifications sent to ${unfulfilled.length} customers`
      })
    }

    setBulkShipForm({
      carrier: 'UPS',
      shippingSpeed: 'standard',
      selectedOrderIds: [],
      notifyCustomers: true,
      generateLabels: true
    })
    setShowBulkShipDialog(false)
  }

  const handleRefreshOrders = () => {
    toast.promise(
      fetch('/api/orders').then(res => { if (!res.ok) throw new Error('Failed'); return res.json() }),
      {
        loading: 'Refreshing orders...',
        success: 'Orders refreshed successfully',
        error: 'Failed to refresh orders'
      }
    )
  }

  const handleOpenFulfillDialog = (order: Order) => {
    setOrderToFulfill(order)
    setFulfillForm({
      trackingNumber: '',
      carrier: 'UPS',
      notifyCustomer: true,
      notes: ''
    })
    setShowFulfillDialog(true)
  }

  const handleSubmitFulfill = () => {
    if (!orderToFulfill) return

    if (!fulfillForm.trackingNumber) {
      toast.error('Tracking number required', {
        description: 'Please enter a tracking number for this shipment'
      })
      return
    }

    toast.success('Order Fulfilled', {
      description: `Order ${orderToFulfill.order_number} fulfilled with tracking: ${fulfillForm.trackingNumber}`
    })

    if (fulfillForm.notifyCustomer) {
      toast.info('Customer Notified', {
        description: `Shipping confirmation sent to ${orderToFulfill.customer_email}`
      })
    }

    setFulfillForm({
      trackingNumber: '',
      carrier: 'UPS',
      notifyCustomer: true,
      notes: ''
    })
    setOrderToFulfill(null)
    setShowFulfillDialog(false)
  }

  const handleExportOrders = () => {
    setShowExportDialog(true)
  }

  const handleSubmitExport = () => {
    const dataPoints = []
    if (exportForm.includeCustomerData) dataPoints.push('customer data')
    if (exportForm.includePaymentData) dataPoints.push('payment data')
    if (exportForm.includeShippingData) dataPoints.push('shipping data')
    if (exportForm.includeItemDetails) dataPoints.push('item details')

    toast.promise(
      fetch(`/api/orders?action=export&format=${exportForm.format}`).then(async res => {
        if (!res.ok) throw new Error('Export failed')
        if (exportForm.format === 'csv') {
          const blob = await res.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `orders-export-${Date.now()}.csv`
          a.click()
          URL.revokeObjectURL(url)
        } else {
          const { data } = await res.json()
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `orders-export-${Date.now()}.json`
          a.click()
          URL.revokeObjectURL(url)
        }
      }),
      {
        loading: `Exporting ${mockOrders.length} orders to ${exportForm.format.toUpperCase()}...`,
        success: `Export complete! Downloaded orders.${exportForm.format} with ${dataPoints.join(', ')}`,
        error: 'Export failed'
      }
    )

    setExportForm({
      format: 'csv',
      dateRange: 'all',
      includeCustomerData: true,
      includePaymentData: true,
      includeShippingData: true,
      includeItemDetails: true
    })
    setShowExportDialog(false)
  }

  // Quick actions with dialog handlers
  const quickActionsWithHandlers = [
    { id: '1', label: 'New Order', icon: 'plus', action: () => setShowNewOrderDialog(true), variant: 'default' as const },
    { id: '2', label: 'Bulk Ship', icon: 'truck', action: () => setShowBulkShipDialog(true), variant: 'default' as const },
    { id: '3', label: 'Export', icon: 'download', action: () => setShowExportDialog(true), variant: 'outline' as const },
  ]

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
            <Button variant="outline" size="sm" onClick={handleRefreshOrders}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white" onClick={handleCreateOrder}>
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
                    <p className="text-3xl font-bold">{mockOrders.length}</p>
                    <p className="text-blue-200 text-sm">Total Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockOrders.filter(o => o.status === 'pending').length}</p>
                    <p className="text-blue-200 text-sm">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Order', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowNewOrderDialog(true) },
                { icon: Package, label: 'Fulfill', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setActiveTab('fulfillment') },
                { icon: Truck, label: 'Ship', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowBulkShipDialog(true) },
                { icon: RotateCcw, label: 'Returns', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setActiveTab('returns') },
                { icon: Receipt, label: 'Invoice', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => toast.info('Invoice', { description: 'Select an order to generate invoice' }) },
                { icon: Download, label: 'Export', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setShowExportDialog(true) },
                { icon: Printer, label: 'Print', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => toast.info('Print', { description: 'Select orders to print packing slips' }) },
                { icon: BarChart3, label: 'Analytics', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setActiveTab('analytics') },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
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
                    <p className="text-3xl font-bold">{mockOrders.filter(o => o.fulfillment_status === 'unfulfilled').length}</p>
                    <p className="text-green-200 text-sm">Unfulfilled</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockOrders.filter(o => o.status === 'shipped').length}</p>
                    <p className="text-green-200 text-sm">Shipped</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fulfillment Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: PackageCheck, label: 'Fulfill All', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowBulkShipDialog(true) },
                { icon: Printer, label: 'Print Slips', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => toast.info('Packing Slips', { description: 'Printing packing slips for unfulfilled orders...' }) },
                { icon: Truck, label: 'Schedule', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => toast.info('Schedule Pickup', { description: 'Contact your carrier to schedule a pickup' }) },
                { icon: Box, label: 'Scan Items', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => toast.info('Barcode Scanner', { description: 'Connect a barcode scanner to scan items' }) },
                { icon: Tag, label: 'Labels', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => toast.info('Print Labels', { description: 'Generating shipping labels for unfulfilled orders' }) },
                { icon: MapPin, label: 'Track', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => toast.info('Tracking', { description: 'View tracking for all shipped orders' }) },
                { icon: AlertCircle, label: 'Issues', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => toast.info('No Issues', { description: 'All orders are processing normally' }) },
                { icon: History, label: 'History', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => toast.info('Fulfillment History', { description: 'Viewing recent fulfillment activity' }) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
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
                            <Button size="sm" className="bg-blue-600" onClick={() => handleOpenFulfillDialog(order)}>
                              <Package className="w-3 h-3 mr-1" />
                              Fulfill
                            </Button>
                            <Button variant="outline" size="sm" onClick={async () => {
                              toast.loading('Generating shipping label...', { id: 'print-label' })
                              try {
                                const res = await fetch('/api/orders', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'generate_shipping_label', orderNumber: order.order_number })
                                })
                                if (!res.ok) throw new Error('Failed')
                                toast.success('Shipping label sent to printer!', { id: 'print-label' })
                              } catch { toast.error('Failed to generate label', { id: 'print-label' }) }
                            }}>
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
                  <Button variant="outline" onClick={() => setShowExportDialog(true)}>
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
                            <Button size="sm" className="bg-green-600" onClick={async () => {
                              toast.loading('Processing return approval...', { id: 'approve-return' })
                              try {
                                const res = await fetch('/api/orders', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'approve_return', returnId: ret.id, orderNumber: ret.order_number })
                                })
                                if (!res.ok) throw new Error('Failed')
                                toast.success('Return request approved successfully!', { id: 'approve-return' })
                              } catch { toast.error('Failed to approve return', { id: 'approve-return' }) }
                            }}>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600" onClick={async () => { if (confirm(`Are you sure you want to reject the return for ${ret.order_number}?`)) {
                              toast.loading('Processing return rejection...', { id: 'reject-return' })
                              try {
                                const res = await fetch('/api/orders', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'reject_return', returnId: ret.id, orderNumber: ret.order_number })
                                })
                                if (!res.ok) throw new Error('Failed')
                                toast.success('Return request rejected!', { id: 'reject-return' })
                              } catch { toast.error('Failed to reject return', { id: 'reject-return' }) }
                            } }}>
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {ret.shipping_label && (
                          <Button variant="outline" size="sm" onClick={async () => {
                            toast.loading('Generating return label...', { id: 'print-return-label' })
                            try {
                              const res = await fetch('/api/orders', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'generate_return_label', returnId: ret.id, orderNumber: ret.order_number })
                              })
                              if (!res.ok) throw new Error('Failed')
                              toast.success('Return shipping label sent to printer!', { id: 'print-return-label' })
                            } catch { toast.error('Failed to generate label', { id: 'print-return-label' }) }
                          }}>
                            <Printer className="w-3 h-3 mr-1" />
                            Label
                          </Button>
                        )}
                        {ret.tracking_number && (
                          <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(ret.tracking_number || ''); toast.success('Tracking number copied to clipboard'); }}>
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
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100" onClick={async () => { if (confirm('Are you sure you want to archive all orders older than 1 year? This action cannot be undone.')) {
                            toast.loading('Archiving old orders...', { id: 'archive-orders' })
                            try {
                              const res = await fetch('/api/orders', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'archive_old_orders' })
                              })
                              if (!res.ok) throw new Error('Failed')
                              const { archived } = await res.json()
                              toast.success(`${archived} old orders archived successfully!`, { id: 'archive-orders' })
                            } catch { toast.error('Failed to archive orders', { id: 'archive-orders' }) }
                          } }}>
                            <History className="w-4 h-4 mr-2" />
                            Archive
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete Test Orders</p>
                            <p className="text-sm text-red-600 dark:text-red-400/80">Remove all test/sandbox orders</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100" onClick={async () => { if (confirm('Are you sure you want to delete all test/sandbox orders? This action cannot be undone.')) {
                            toast.loading('Deleting test orders...', { id: 'delete-test-orders' })
                            try {
                              const res = await fetch('/api/orders', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'delete_test_orders' })
                              })
                              if (!res.ok) throw new Error('Failed')
                              toast.success('Test orders deleted successfully!', { id: 'delete-test-orders' })
                            } catch { toast.error('Failed to delete test orders', { id: 'delete-test-orders' }) }
                          } }}>
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
              onInsightAction={(insight) => toast.info(insight.title, { description: insight.description, action: insight.action ? { label: insight.action, onClick: () => toast.success(`Action: ${insight.action}`) } : undefined })}
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
            actions={quickActionsWithHandlers}
            variant="grid"
          />
        </div>

        {/* New Order Dialog */}
        <Dialog open={showNewOrderDialog} onOpenChange={setShowNewOrderDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                Create New Order
              </DialogTitle>
              <DialogDescription>
                Fill in the details to create a new order manually
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(85vh-180px)] pr-4">
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name *</Label>
                      <Input
                        id="customerName"
                        placeholder="John Doe"
                        value={newOrderForm.customerName}
                        onChange={(e) => setNewOrderForm(prev => ({ ...prev, customerName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Email *</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        placeholder="john@example.com"
                        value={newOrderForm.customerEmail}
                        onChange={(e) => setNewOrderForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input
                      id="customerPhone"
                      placeholder="+1 (555) 123-4567"
                      value={newOrderForm.customerPhone}
                      onChange={(e) => setNewOrderForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Shipping Address</h4>
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress">Street Address</Label>
                    <Input
                      id="shippingAddress"
                      placeholder="123 Main Street"
                      value={newOrderForm.shippingAddress}
                      onChange={(e) => setNewOrderForm(prev => ({ ...prev, shippingAddress: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="shippingCity">City</Label>
                      <Input
                        id="shippingCity"
                        placeholder="San Francisco"
                        value={newOrderForm.shippingCity}
                        onChange={(e) => setNewOrderForm(prev => ({ ...prev, shippingCity: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingState">State</Label>
                      <Input
                        id="shippingState"
                        placeholder="CA"
                        value={newOrderForm.shippingState}
                        onChange={(e) => setNewOrderForm(prev => ({ ...prev, shippingState: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingPostal">Postal Code</Label>
                      <Input
                        id="shippingPostal"
                        placeholder="94102"
                        value={newOrderForm.shippingPostal}
                        onChange={(e) => setNewOrderForm(prev => ({ ...prev, shippingPostal: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Product Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="productName">Product Name *</Label>
                      <Input
                        id="productName"
                        placeholder="Premium Headphones"
                        value={newOrderForm.productName}
                        onChange={(e) => setNewOrderForm(prev => ({ ...prev, productName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={newOrderForm.quantity}
                        onChange={(e) => setNewOrderForm(prev => ({ ...prev, quantity: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Unit Price *</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      placeholder="99.99"
                      value={newOrderForm.unitPrice}
                      onChange={(e) => setNewOrderForm(prev => ({ ...prev, unitPrice: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Order Options */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Order Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label>Shipping Method</Label>
                      <Select
                        value={newOrderForm.shippingMethod}
                        onValueChange={(value: ShippingMethod) => setNewOrderForm(prev => ({ ...prev, shippingMethod: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard Shipping</SelectItem>
                          <SelectItem value="express">Express Shipping</SelectItem>
                          <SelectItem value="overnight">Overnight</SelectItem>
                          <SelectItem value="pickup">Store Pickup</SelectItem>
                          <SelectItem value="free">Free Shipping</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select
                        value={newOrderForm.paymentMethod}
                        onValueChange={(value: PaymentMethod) => setNewOrderForm(prev => ({ ...prev, paymentMethod: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="debit_card">Debit Card</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="apple_pay">Apple Pay</SelectItem>
                          <SelectItem value="google_pay">Google Pay</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="cod">Cash on Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="orderNotes">Order Notes</Label>
                  <Textarea
                    id="orderNotes"
                    placeholder="Any special instructions..."
                    value={newOrderForm.notes}
                    onChange={(e) => setNewOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowNewOrderDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitNewOrder} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Ship Dialog */}
        <Dialog open={showBulkShipDialog} onOpenChange={setShowBulkShipDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-500" />
                Bulk Shipment
              </DialogTitle>
              <DialogDescription>
                Ship all unfulfilled orders at once
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      {mockOrders.filter(o => o.fulfillment_status === 'unfulfilled').length} Orders Ready
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Total value: {formatCurrency(mockOrders.filter(o => o.fulfillment_status === 'unfulfilled').reduce((acc, o) => acc + o.total, 0))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Shipping Carrier</Label>
                  <Select
                    value={bulkShipForm.carrier}
                    onValueChange={(value) => setBulkShipForm(prev => ({ ...prev, carrier: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPS">UPS</SelectItem>
                      <SelectItem value="USPS">USPS</SelectItem>
                      <SelectItem value="FedEx">FedEx</SelectItem>
                      <SelectItem value="DHL">DHL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Shipping Speed</Label>
                  <Select
                    value={bulkShipForm.shippingSpeed}
                    onValueChange={(value) => setBulkShipForm(prev => ({ ...prev, shippingSpeed: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (5-7 days)</SelectItem>
                      <SelectItem value="express">Express (2-3 days)</SelectItem>
                      <SelectItem value="overnight">Overnight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Label htmlFor="notifyCustomers" className="cursor-pointer">
                      <span className="font-medium">Notify Customers</span>
                      <p className="text-xs text-gray-500">Send shipping confirmation emails</p>
                    </Label>
                    <Switch
                      id="notifyCustomers"
                      checked={bulkShipForm.notifyCustomers}
                      onCheckedChange={(checked) => setBulkShipForm(prev => ({ ...prev, notifyCustomers: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Label htmlFor="generateLabels" className="cursor-pointer">
                      <span className="font-medium">Generate Labels</span>
                      <p className="text-xs text-gray-500">Auto-print shipping labels</p>
                    </Label>
                    <Switch
                      id="generateLabels"
                      checked={bulkShipForm.generateLabels}
                      onCheckedChange={(checked) => setBulkShipForm(prev => ({ ...prev, generateLabels: checked }))}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowBulkShipDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitBulkShip} className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">
                <Truck className="w-4 h-4 mr-2" />
                Ship All Orders
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-500" />
                Export Orders
              </DialogTitle>
              <DialogDescription>
                Configure your order data export
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select
                    value={exportForm.format}
                    onValueChange={(value) => setExportForm(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                      <SelectItem value="json">JSON (.json)</SelectItem>
                      <SelectItem value="pdf">PDF Report (.pdf)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select
                    value={exportForm.dateRange}
                    onValueChange={(value) => setExportForm(prev => ({ ...prev, dateRange: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Include Data</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Label htmlFor="includeCustomer" className="cursor-pointer text-sm">Customer Information</Label>
                    <Switch
                      id="includeCustomer"
                      checked={exportForm.includeCustomerData}
                      onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includeCustomerData: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Label htmlFor="includePayment" className="cursor-pointer text-sm">Payment Details</Label>
                    <Switch
                      id="includePayment"
                      checked={exportForm.includePaymentData}
                      onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includePaymentData: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Label htmlFor="includeShipping" className="cursor-pointer text-sm">Shipping Information</Label>
                    <Switch
                      id="includeShipping"
                      checked={exportForm.includeShippingData}
                      onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includeShippingData: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Label htmlFor="includeItems" className="cursor-pointer text-sm">Item Details</Label>
                    <Switch
                      id="includeItems"
                      checked={exportForm.includeItemDetails}
                      onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includeItemDetails: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>{mockOrders.length}</strong> orders will be exported
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitExport} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export Orders
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Fulfill Order Dialog */}
        <Dialog open={showFulfillDialog} onOpenChange={setShowFulfillDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-green-500" />
                Fulfill Order
              </DialogTitle>
              <DialogDescription>
                {orderToFulfill && `Complete fulfillment for ${orderToFulfill.order_number}`}
              </DialogDescription>
            </DialogHeader>
            {orderToFulfill && (
              <div className="space-y-6 py-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{orderToFulfill.order_number}</span>
                    <span className="font-bold text-green-600">{formatCurrency(orderToFulfill.total)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {orderToFulfill.customer_name} - {orderToFulfill.items.length} item(s)
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="trackingNumber">Tracking Number *</Label>
                    <Input
                      id="trackingNumber"
                      placeholder="1Z999AA10123456784"
                      value={fulfillForm.trackingNumber}
                      onChange={(e) => setFulfillForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Shipping Carrier</Label>
                    <Select
                      value={fulfillForm.carrier}
                      onValueChange={(value) => setFulfillForm(prev => ({ ...prev, carrier: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UPS">UPS</SelectItem>
                        <SelectItem value="USPS">USPS</SelectItem>
                        <SelectItem value="FedEx">FedEx</SelectItem>
                        <SelectItem value="DHL">DHL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Label htmlFor="notifyCustomer" className="cursor-pointer">
                      <span className="font-medium">Notify Customer</span>
                      <p className="text-xs text-gray-500">Send shipping confirmation email</p>
                    </Label>
                    <Switch
                      id="notifyCustomer"
                      checked={fulfillForm.notifyCustomer}
                      onCheckedChange={(checked) => setFulfillForm(prev => ({ ...prev, notifyCustomer: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fulfillNotes">Notes</Label>
                    <Textarea
                      id="fulfillNotes"
                      placeholder="Optional fulfillment notes..."
                      value={fulfillForm.notes}
                      onChange={(e) => setFulfillForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowFulfillDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitFulfill} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <PackageCheck className="w-4 h-4 mr-2" />
                Mark Fulfilled
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={() => {
                      toast.info('Opening order editor...')
                      setShowOrderDialog(false)
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Order
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={async () => {
                      toast.loading('Preparing order for print...', { id: 'print-order' })
                      try {
                        const res = await fetch('/api/orders', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'print_order', orderNumber: selectedOrder?.order_number })
                        })
                        if (!res.ok) throw new Error('Failed')
                        toast.success('Order sent to printer!', { id: 'print-order' })
                      } catch { toast.error('Failed to print order', { id: 'print-order' }) }
                    }}>
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white" onClick={async () => {
                      toast.loading('Sending status update...', { id: 'send-update' })
                      try {
                        const res = await fetch('/api/orders', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'send_status_update', orderNumber: selectedOrder?.order_number, customerEmail: selectedOrder?.customer_email })
                        })
                        if (!res.ok) throw new Error('Failed')
                        toast.success('Status update sent to customer!', { id: 'send-update' })
                        setShowOrderDialog(false)
                      } catch { toast.error('Failed to send update', { id: 'send-update' }) }
                    }}>
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
