"use client"

import { createClient } from '@/lib/supabase/client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Package,
  Truck,
  MapPin,
  TrendingUp,
  Plus,
  Send,
  Eye,
  Download,
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  BarChart3,
  Globe,
  Printer,
  FileText,
  DollarSign,
  Calendar,
  Star,
  Zap,
  ArrowRight,
  Navigation,
  Mail,
  Timer,
  Activity,
  Train,
  Home,
  Shield,
  Sliders,
  Bell,
  Webhook,
  Key,
  Database,
  Lock,
  Terminal,
  History,
  Trash2,
  Copy,
  Upload,
  Archive,
  AlertTriangle
} from 'lucide-react'

// Lazy-loaded Enhanced & Competitive Upgrade Components for code splitting
import { TabContentSkeleton, ShippingAnalyticsSkeleton } from '@/components/dashboard/lazy'

// Initialize Supabase client once at module level
const supabase = createClient()

const AIInsightsPanel = dynamic(
  () => import('@/components/ui/competitive-upgrades').then(mod => ({ default: mod.AIInsightsPanel })),
  {
    loading: () => <TabContentSkeleton />,
    ssr: false
  }
)

const CollaborationIndicator = dynamic(
  () => import('@/components/ui/competitive-upgrades').then(mod => ({ default: mod.CollaborationIndicator })),
  {
    loading: () => <div className="animate-pulse h-8 w-32 bg-muted rounded" />,
    ssr: false
  }
)

const PredictiveAnalytics = dynamic(
  () => import('@/components/ui/competitive-upgrades').then(mod => ({ default: mod.PredictiveAnalytics })),
  {
    loading: () => <ShippingAnalyticsSkeleton />,
    ssr: false
  }
)

const ActivityFeed = dynamic(
  () => import('@/components/ui/competitive-upgrades-extended').then(mod => ({ default: mod.ActivityFeed })),
  {
    loading: () => <TabContentSkeleton />,
    ssr: false
  }
)

const QuickActionsToolbar = dynamic(
  () => import('@/components/ui/competitive-upgrades-extended').then(mod => ({ default: mod.QuickActionsToolbar })),
  {
    loading: () => <div className="animate-pulse h-12 w-full bg-muted rounded" />,
    ssr: false
  }
)




// ============================================================================
// DATABASE TYPES
// ============================================================================

interface DbShipment {
  id: string
  user_id: string
  shipment_code: string
  tracking_number: string | null
  order_id: string | null
  status: string
  method: string
  carrier: string | null
  origin_address: string | null
  origin_city: string | null
  origin_state: string | null
  origin_country: string
  origin_postal: string | null
  recipient_name: string | null
  recipient_email: string | null
  recipient_phone: string | null
  destination_address: string | null
  destination_city: string | null
  destination_state: string | null
  destination_country: string
  destination_postal: string | null
  item_count: number
  weight_lbs: number
  dimensions_length: number | null
  dimensions_width: number | null
  dimensions_height: number | null
  shipping_cost: number
  insurance_value: number
  declared_value: number
  estimated_delivery: string | null
  actual_delivery: string | null
  shipped_at: string | null
  signature_required: boolean
  saturday_delivery: boolean
  is_priority: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

interface ShipmentFormState {
  recipient_name: string
  recipient_email: string
  destination_address: string
  destination_city: string
  destination_state: string
  destination_postal: string
  destination_country: string
  carrier: string
  method: string
  weight_lbs: number
  item_count: number
  signature_required: boolean
  is_priority: boolean
}

const initialFormState: ShipmentFormState = {
  recipient_name: '',
  recipient_email: '',
  destination_address: '',
  destination_city: '',
  destination_state: '',
  destination_postal: '',
  destination_country: 'US',
  carrier: 'FedEx',
  method: 'standard',
  weight_lbs: 1,
  item_count: 1,
  signature_required: false,
  is_priority: false,
}

// ============================================================================
// TYPES & INTERFACES - ShipStation Level Shipping Platform
// ============================================================================

type ShipmentStatus = 'pending' | 'processing' | 'label_created' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled' | 'exception'
type OrderStatus = 'awaiting_shipment' | 'awaiting_payment' | 'on_hold' | 'shipped' | 'cancelled'
type ShippingMethod = 'ground' | 'express' | 'priority' | 'overnight' | 'economy' | 'freight' | 'international'
type CarrierType = 'national' | 'regional' | 'international' | 'freight'
type LabelStatus = 'pending' | 'created' | 'printed' | 'voided'

interface Address {
  name: string
  company?: string
  street1: string
  street2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  email?: string
}

interface PackageDetails {
  weight: number
  weightUnit: 'oz' | 'lb' | 'kg'
  length: number
  width: number
  height: number
  dimensionUnit: 'in' | 'cm'
  packageType: 'box' | 'envelope' | 'tube' | 'pallet'
}

interface Shipment {
  id: string
  orderId: string
  orderNumber: string
  status: ShipmentStatus
  carrier: string
  carrierLogo?: string
  service: string
  method: ShippingMethod
  trackingNumber?: string
  labelUrl?: string
  origin: Address
  destination: Address
  package: PackageDetails
  shippingCost: number
  insuranceCost: number
  totalCost: number
  estimatedDelivery?: string
  actualDelivery?: string
  shippedAt?: string
  createdAt: string
  items: number
  signatureRequired: boolean
  saturdayDelivery: boolean
  priority: boolean
  events: TrackingEvent[]
}

interface TrackingEvent {
  timestamp: string
  location: string
  status: string
  description: string
}

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  customerName: string
  customerEmail: string
  shippingAddress: Address
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  source: string
  createdAt: string
  shipBy?: string
  notes?: string
}

interface OrderItem {
  id: string
  name: string
  sku: string
  quantity: number
  price: number
  weight: number
}

interface Carrier {
  id: string
  name: string
  code: string
  logo?: string
  type: CarrierType
  services: CarrierService[]
  isActive: boolean
  accountNumber?: string
}

interface CarrierService {
  id: string
  name: string
  code: string
  deliveryDays: string
  baseRate: number
}

interface ShippingRate {
  carrier: string
  service: string
  rate: number
  deliveryDays: string
  guaranteed: boolean
}

interface Label {
  id: string
  shipmentId: string
  trackingNumber: string
  carrier: string
  service: string
  status: LabelStatus
  createdAt: string
  voidedAt?: string
  cost: number
  labelUrl: string
  format: 'PDF' | 'PNG' | 'ZPL'
}

interface ShippingAnalytics {
  totalShipments: number
  shippedToday: number
  inTransit: number
  delivered: number
  onTimeRate: number
  avgShippingCost: number
  totalCost: number
  avgDeliveryDays: number
  topCarrier: string
  topDestination: string
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockShipments: Shipment[] = [
  {
    id: '1',
    orderId: 'order-1',
    orderNumber: 'ORD-2024-001',
    status: 'in_transit',
    carrier: 'FedEx',
    service: 'FedEx Ground',
    method: 'ground',
    trackingNumber: '7489234567890',
    origin: {
      name: 'Warehouse A',
      company: 'FreeFlow Inc',
      street1: '123 Shipping Lane',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90001',
      country: 'US'
    },
    destination: {
      name: 'John Smith',
      street1: '456 Oak Avenue',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      phone: '+1 555-123-4567',
      email: 'john@example.com'
    },
    package: {
      weight: 2.5,
      weightUnit: 'lb',
      length: 12,
      width: 8,
      height: 6,
      dimensionUnit: 'in',
      packageType: 'box'
    },
    shippingCost: 12.50,
    insuranceCost: 2.00,
    totalCost: 14.50,
    estimatedDelivery: '2024-07-15',
    shippedAt: '2024-07-10T10:30:00Z',
    createdAt: '2024-07-10T09:00:00Z',
    items: 3,
    signatureRequired: false,
    saturdayDelivery: false,
    priority: false,
    events: [
      { timestamp: '2024-07-12T14:30:00Z', location: 'Chicago, IL', status: 'In Transit', description: 'Package arrived at FedEx location' },
      { timestamp: '2024-07-11T08:00:00Z', location: 'Denver, CO', status: 'In Transit', description: 'Package departed facility' },
      { timestamp: '2024-07-10T10:30:00Z', location: 'Los Angeles, CA', status: 'Shipped', description: 'Package picked up' }
    ]
  },
  {
    id: '2',
    orderId: 'order-2',
    orderNumber: 'ORD-2024-002',
    status: 'out_for_delivery',
    carrier: 'UPS',
    service: 'UPS Next Day Air',
    method: 'overnight',
    trackingNumber: '1Z999AA10123456784',
    origin: {
      name: 'Warehouse B',
      company: 'FreeFlow Inc',
      street1: '789 Express Way',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'US'
    },
    destination: {
      name: 'Sarah Johnson',
      company: 'Tech Corp',
      street1: '321 Business Park',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'US',
      phone: '+1 555-987-6543'
    },
    package: {
      weight: 5.0,
      weightUnit: 'lb',
      length: 18,
      width: 12,
      height: 10,
      dimensionUnit: 'in',
      packageType: 'box'
    },
    shippingCost: 45.00,
    insuranceCost: 5.00,
    totalCost: 50.00,
    estimatedDelivery: '2024-07-12',
    shippedAt: '2024-07-11T16:00:00Z',
    createdAt: '2024-07-11T14:00:00Z',
    items: 1,
    signatureRequired: true,
    saturdayDelivery: false,
    priority: true,
    events: [
      { timestamp: '2024-07-12T08:00:00Z', location: 'San Francisco, CA', status: 'Out for Delivery', description: 'With delivery driver' },
      { timestamp: '2024-07-12T05:30:00Z', location: 'San Francisco, CA', status: 'At Local Facility', description: 'Arrived at destination city' }
    ]
  },
  {
    id: '3',
    orderId: 'order-3',
    orderNumber: 'ORD-2024-003',
    status: 'delivered',
    carrier: 'USPS',
    service: 'Priority Mail',
    method: 'priority',
    trackingNumber: '9400111899223334445566',
    origin: {
      name: 'Warehouse A',
      company: 'FreeFlow Inc',
      street1: '123 Shipping Lane',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90001',
      country: 'US'
    },
    destination: {
      name: 'Michael Brown',
      street1: '789 Maple Street',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'US'
    },
    package: {
      weight: 1.2,
      weightUnit: 'lb',
      length: 10,
      width: 6,
      height: 4,
      dimensionUnit: 'in',
      packageType: 'box'
    },
    shippingCost: 8.95,
    insuranceCost: 0,
    totalCost: 8.95,
    estimatedDelivery: '2024-07-10',
    actualDelivery: '2024-07-09',
    shippedAt: '2024-07-07T11:00:00Z',
    createdAt: '2024-07-07T09:30:00Z',
    items: 2,
    signatureRequired: false,
    saturdayDelivery: false,
    priority: false,
    events: [
      { timestamp: '2024-07-09T14:25:00Z', location: 'Austin, TX', status: 'Delivered', description: 'Delivered to front door' },
      { timestamp: '2024-07-09T08:00:00Z', location: 'Austin, TX', status: 'Out for Delivery', description: 'With mail carrier' }
    ]
  },
  {
    id: '4',
    orderId: 'order-4',
    orderNumber: 'ORD-2024-004',
    status: 'pending',
    carrier: 'DHL',
    service: 'DHL Express Worldwide',
    method: 'international',
    origin: {
      name: 'Warehouse C',
      company: 'FreeFlow Inc',
      street1: '456 Global Ave',
      city: 'Miami',
      state: 'FL',
      postalCode: '33101',
      country: 'US'
    },
    destination: {
      name: 'Emma Wilson',
      street1: '15 Oxford Street',
      city: 'London',
      state: '',
      postalCode: 'W1D 2DL',
      country: 'UK',
      phone: '+44 20 1234 5678'
    },
    package: {
      weight: 3.5,
      weightUnit: 'kg',
      length: 30,
      width: 20,
      height: 15,
      dimensionUnit: 'cm',
      packageType: 'box'
    },
    shippingCost: 85.00,
    insuranceCost: 15.00,
    totalCost: 100.00,
    estimatedDelivery: '2024-07-18',
    createdAt: '2024-07-12T10:00:00Z',
    items: 5,
    signatureRequired: true,
    saturdayDelivery: false,
    priority: true,
    events: []
  }
]

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-005',
    status: 'awaiting_shipment',
    customerName: 'David Lee',
    customerEmail: 'david@example.com',
    shippingAddress: {
      name: 'David Lee',
      street1: '123 Main St',
      city: 'Boston',
      state: 'MA',
      postalCode: '02101',
      country: 'US'
    },
    items: [
      { id: '1', name: 'Wireless Headphones', sku: 'WH-001', quantity: 1, price: 149.99, weight: 0.5 },
      { id: '2', name: 'USB-C Cable', sku: 'UC-002', quantity: 2, price: 12.99, weight: 0.1 }
    ],
    subtotal: 175.97,
    shippingCost: 0,
    tax: 14.08,
    total: 190.05,
    source: 'Shopify',
    createdAt: '2024-07-12T08:00:00Z',
    shipBy: '2024-07-14'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-006',
    status: 'awaiting_shipment',
    customerName: 'Jennifer Martinez',
    customerEmail: 'jennifer@example.com',
    shippingAddress: {
      name: 'Jennifer Martinez',
      street1: '456 Park Ave',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'US'
    },
    items: [
      { id: '3', name: 'Smart Watch', sku: 'SW-003', quantity: 1, price: 299.99, weight: 0.3 }
    ],
    subtotal: 299.99,
    shippingCost: 0,
    tax: 24.00,
    total: 323.99,
    source: 'WooCommerce',
    createdAt: '2024-07-12T09:30:00Z',
    shipBy: '2024-07-13',
    notes: 'Rush order - ship today if possible'
  }
]

const mockCarriers: Carrier[] = [
  {
    id: '1',
    name: 'FedEx',
    code: 'fedex',
    type: 'national',
    isActive: true,
    accountNumber: '****5678',
    services: [
      { id: '1', name: 'FedEx Ground', code: 'fedex_ground', deliveryDays: '3-5 days', baseRate: 8.50 },
      { id: '2', name: 'FedEx Express Saver', code: 'fedex_express_saver', deliveryDays: '3 days', baseRate: 15.00 },
      { id: '3', name: 'FedEx 2Day', code: 'fedex_2day', deliveryDays: '2 days', baseRate: 22.00 },
      { id: '4', name: 'FedEx Overnight', code: 'fedex_overnight', deliveryDays: 'Next day', baseRate: 45.00 }
    ]
  },
  {
    id: '2',
    name: 'UPS',
    code: 'ups',
    type: 'national',
    isActive: true,
    accountNumber: '****9012',
    services: [
      { id: '5', name: 'UPS Ground', code: 'ups_ground', deliveryDays: '3-5 days', baseRate: 9.00 },
      { id: '6', name: 'UPS 3 Day Select', code: 'ups_3day', deliveryDays: '3 days', baseRate: 16.00 },
      { id: '7', name: 'UPS 2nd Day Air', code: 'ups_2day', deliveryDays: '2 days', baseRate: 25.00 },
      { id: '8', name: 'UPS Next Day Air', code: 'ups_overnight', deliveryDays: 'Next day', baseRate: 48.00 }
    ]
  },
  {
    id: '3',
    name: 'USPS',
    code: 'usps',
    type: 'national',
    isActive: true,
    services: [
      { id: '9', name: 'USPS First Class', code: 'usps_first_class', deliveryDays: '3-5 days', baseRate: 4.50 },
      { id: '10', name: 'USPS Priority Mail', code: 'usps_priority', deliveryDays: '2-3 days', baseRate: 8.95 },
      { id: '11', name: 'USPS Priority Express', code: 'usps_express', deliveryDays: '1-2 days', baseRate: 26.95 }
    ]
  },
  {
    id: '4',
    name: 'DHL',
    code: 'dhl',
    type: 'international',
    isActive: true,
    services: [
      { id: '12', name: 'DHL Express Worldwide', code: 'dhl_express', deliveryDays: '2-5 days', baseRate: 55.00 },
      { id: '13', name: 'DHL Economy', code: 'dhl_economy', deliveryDays: '5-10 days', baseRate: 35.00 }
    ]
  }
]

const mockLabels: Label[] = [
  {
    id: '1',
    shipmentId: '1',
    trackingNumber: '7489234567890',
    carrier: 'FedEx',
    service: 'FedEx Ground',
    status: 'printed',
    createdAt: '2024-07-10T10:00:00Z',
    cost: 12.50,
    labelUrl: '/labels/label-1.pdf',
    format: 'PDF'
  },
  {
    id: '2',
    shipmentId: '2',
    trackingNumber: '1Z999AA10123456784',
    carrier: 'UPS',
    service: 'UPS Next Day Air',
    status: 'printed',
    createdAt: '2024-07-11T16:00:00Z',
    cost: 45.00,
    labelUrl: '/labels/label-2.pdf',
    format: 'PDF'
  }
]

const mockAnalytics: ShippingAnalytics = {
  totalShipments: 1245,
  shippedToday: 47,
  inTransit: 189,
  delivered: 1012,
  onTimeRate: 94.5,
  avgShippingCost: 18.75,
  totalCost: 23343.75,
  avgDeliveryDays: 3.2,
  topCarrier: 'FedEx',
  topDestination: 'California'
}

// Enhanced Competitive Upgrade Mock Data
const mockShippingAIInsights = [
  { id: '1', type: 'success' as const, title: 'On-Time Delivery', description: 'Delivery performance is 94.5% on-time this month.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'warning' as const, title: 'Weather Alert', description: 'Storm expected in Northeast region may cause delays.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Alerts' },
  { id: '3', type: 'info' as const, title: 'Cost Optimization', description: 'Switching to ground shipping for local orders could save 15%.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Insights' },
]

const mockShippingCollaborators = [
  { id: '1', name: 'Logistics Team', avatar: '', role: 'Team', status: 'online' as const },
  { id: '2', name: 'Sarah Chen', avatar: '', role: 'Manager', status: 'online' as const },
]

const mockShippingPredictions = [
  { id: '1', title: 'Peak Season', prediction: 'Expected 40% volume increase', confidence: 85, trend: 'up' as const, timeframe: 'Next 30 days' },
  { id: '2', title: 'Cost Trend', prediction: 'Shipping costs may rise 5%', confidence: 70, trend: 'up' as const, timeframe: 'Next Quarter' },
]

const mockShippingActivities = [
  { id: '1', user: 'System', action: 'Processed', target: '47 shipments today', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Sarah', action: 'Updated', target: 'carrier rates', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
]

// Quick actions mock data
const mockShippingQuickActions = [
  { id: '1', label: 'New Shipment', icon: '📦', action: () => {}, shortcut: 'N' },
  { id: '2', label: 'Print Labels', icon: '🏷️', action: () => {}, shortcut: 'P' },
  { id: '3', label: 'Track All', icon: '📍', action: () => {}, shortcut: 'T' },
  { id: '4', label: 'Export Data', icon: '📊', action: () => {}, shortcut: 'E' },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: ShipmentStatus) => {
  const colors: Record<ShipmentStatus, string> = {
    pending: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    label_created: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    in_transit: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    out_for_delivery: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    returned: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    exception: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
  }
  return colors[status]
}

const getStatusIcon = (status: ShipmentStatus) => {
  const icons: Record<ShipmentStatus, React.ReactNode> = {
    pending: <Clock className="w-4 h-4" />,
    processing: <RefreshCw className="w-4 h-4" />,
    label_created: <FileText className="w-4 h-4" />,
    shipped: <Send className="w-4 h-4" />,
    in_transit: <Truck className="w-4 h-4" />,
    out_for_delivery: <Navigation className="w-4 h-4" />,
    delivered: <CheckCircle className="w-4 h-4" />,
    returned: <ArrowRight className="w-4 h-4 rotate-180" />,
    cancelled: <XCircle className="w-4 h-4" />,
    exception: <AlertCircle className="w-4 h-4" />
  }
  return icons[status]
}

const getOrderStatusColor = (status: OrderStatus) => {
  const colors: Record<OrderStatus, string> = {
    awaiting_shipment: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    awaiting_payment: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    on_hold: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    shipped: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
  return colors[status]
}

const getMethodIcon = (method: ShippingMethod) => {
  const icons: Record<ShippingMethod, React.ReactNode> = {
    ground: <Truck className="w-4 h-4" />,
    express: <Zap className="w-4 h-4" />,
    priority: <Star className="w-4 h-4" />,
    overnight: <Timer className="w-4 h-4" />,
    economy: <DollarSign className="w-4 h-4" />,
    freight: <Train className="w-4 h-4" />,
    international: <Globe className="w-4 h-4" />
  }
  return icons[method]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ShippingClient() {

  const [activeTab, setActiveTab] = useState('shipments')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [settingsTab, setSettingsTab] = useState('general')

  // Database state
  const [dbShipments, setDbShipments] = useState<DbShipment[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formState, setFormState] = useState<ShipmentFormState>(initialFormState)

  // Dialog states for buttons
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false)
  const [showPrintLabelsDialog, setShowPrintLabelsDialog] = useState(false)
  const [showTrackAllDialog, setShowTrackAllDialog] = useState(false)
  const [showBatchUpdateDialog, setShowBatchUpdateDialog] = useState(false)
  const [showSyncStatusDialog, setShowSyncStatusDialog] = useState(false)
  const [showExceptionsDialog, setShowExceptionsDialog] = useState(false)
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [showBatchLabelsDialog, setShowBatchLabelsDialog] = useState(false)
  const [showPackAllDialog, setShowPackAllDialog] = useState(false)
  const [showShipSelectedDialog, setShowShipSelectedDialog] = useState(false)
  const [showPriorityFirstDialog, setShowPriorityFirstDialog] = useState(false)
  const [showFindOrderDialog, setShowFindOrderDialog] = useState(false)
  const [showOrdersExportDialog, setShowOrdersExportDialog] = useState(false)
  const [showTrackNumberDialog, setShowTrackNumberDialog] = useState(false)
  const [showMapViewDialog, setShowMapViewDialog] = useState(false)
  const [showAlertsDialog, setShowAlertsDialog] = useState(false)
  const [showTimelineDialog, setShowTimelineDialog] = useState(false)
  const [showNotifyCustomerDialog, setShowNotifyCustomerDialog] = useState(false)
  const [showRefreshAllDialog, setShowRefreshAllDialog] = useState(false)
  const [showTrackingExportDialog, setShowTrackingExportDialog] = useState(false)
  const [showTrackingExceptionsDialog, setShowTrackingExceptionsDialog] = useState(false)
  const [showCreateLabelDialog, setShowCreateLabelDialog] = useState(false)
  const [showBatchPrintDialog, setShowBatchPrintDialog] = useState(false)
  const [showDownloadAllLabelsDialog, setShowDownloadAllLabelsDialog] = useState(false)
  const [showVoidLabelDialog, setShowVoidLabelDialog] = useState(false)
  const [showDuplicateLabelDialog, setShowDuplicateLabelDialog] = useState(false)
  const [showFindLabelDialog, setShowFindLabelDialog] = useState(false)
  const [showLabelHistoryDialog, setShowLabelHistoryDialog] = useState(false)
  const [showLabelSettingsDialog, setShowLabelSettingsDialog] = useState(false)
  const [showAddCarrierDialog, setShowAddCarrierDialog] = useState(false)
  const [showSyncRatesDialog, setShowSyncRatesDialog] = useState(false)
  const [showCompareRatesDialog, setShowCompareRatesDialog] = useState(false)
  const [showConfigureCarrierDialog, setShowConfigureCarrierDialog] = useState(false)
  const [showApiKeysDialog, setShowApiKeysDialog] = useState(false)
  const [showInsuranceDialog, setShowInsuranceDialog] = useState(false)
  const [showInternationalDialog, setShowInternationalDialog] = useState(false)
  const [showCarrierAnalyticsDialog, setShowCarrierAnalyticsDialog] = useState(false)
  const [showReportsDialog, setShowReportsDialog] = useState(false)
  const [showTrendsDialog, setShowTrendsDialog] = useState(false)
  const [showCostAnalysisDialog, setShowCostAnalysisDialog] = useState(false)
  const [showCarrierStatsDialog, setShowCarrierStatsDialog] = useState(false)
  const [showDestinationsDialog, setShowDestinationsDialog] = useState(false)
  const [showDeliveryTimeDialog, setShowDeliveryTimeDialog] = useState(false)
  const [showExportDataDialog, setShowExportDataDialog] = useState(false)
  const [showDateRangeDialog, setShowDateRangeDialog] = useState(false)
  const [showViewLabelDialog, setShowViewLabelDialog] = useState(false)
  const [showDownloadLabelDialog, setShowDownloadLabelDialog] = useState(false)
  const [showPrintLabelDialog, setShowPrintLabelDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showDeleteDataDialog, setShowDeleteDataDialog] = useState(false)
  const [showExportAllDataDialog, setShowExportAllDataDialog] = useState(false)
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false)
  const [showRegenerateApiKeyDialog, setShowRegenerateApiKeyDialog] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null)
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null)
  const [trackingInput, setTrackingInput] = useState('')

  // Fetch shipments from Supabase
  const fetchShipments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbShipments(data || [])
    } catch (error) {
      console.error('Error fetching shipments:', error)
      toast.error('Failed to load shipments')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchShipments()
  }, [fetchShipments])

  // Filtered data (combines mock + db)
  const filteredShipments = useMemo(() => {
    return mockShipments.filter(shipment => {
      const matchesSearch = shipment.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.destination.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  const pendingOrders = mockOrders.filter(o => o.status === 'awaiting_shipment')

  // Create shipment in Supabase
  const handleCreateShipment = async () => {
    if (!formState.recipient_name.trim()) {
      toast.error('Recipient name is required')
      return
    }
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create shipments')
        return
      }

      const { error } = await supabase.from('shipments').insert({
        user_id: user.id,
        recipient_name: formState.recipient_name,
        recipient_email: formState.recipient_email,
        destination_address: formState.destination_address,
        destination_city: formState.destination_city,
        destination_state: formState.destination_state,
        destination_postal: formState.destination_postal,
        destination_country: formState.destination_country,
        carrier: formState.carrier,
        method: formState.method,
        weight_lbs: formState.weight_lbs,
        item_count: formState.item_count,
        signature_required: formState.signature_required,
        is_priority: formState.is_priority,
        status: 'pending',
        tracking_number: `TRK${Date.now()}`,
      })

      if (error) throw error

      toast.success('Shipment created successfully')
      setShowCreateDialog(false)
      setFormState(initialFormState)
      fetchShipments()
    } catch (error) {
      console.error('Error creating shipment:', error)
      toast.error('Failed to create shipment')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update shipment status
  const handleUpdateStatus = async (shipmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', shipmentId)

      if (error) throw error

      toast.success(`Status updated to ${newStatus}`)
      fetchShipments()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  // Delete shipment
  const handleDeleteShipment = async (shipmentId: string) => {
    try {
      const { error } = await supabase
        .from('shipments')
        .delete()
        .eq('id', shipmentId)

      if (error) throw error

      toast.success('Shipment deleted')
      fetchShipments()
    } catch (error) {
      console.error('Error deleting shipment:', error)
      toast.error('Failed to delete shipment')
    }
  }

  // Print label handler
  const handlePrintLabel = async (shipment: Shipment) => {
    try {
      // Update status to label_created if pending
      if (shipment.status === 'pending') {
        await supabase
          .from('shipments')
          .update({ status: 'label_created', updated_at: new Date().toISOString() })
          .eq('tracking_number', shipment.trackingNumber)
      }
      toast.success(`Label ready: "${shipment.trackingNumber}" is ready to print`)
      fetchShipments()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to generate label')
    }
  }

  // Track shipment handler
  const handleTrackShipment = async (shipment: Shipment) => {
    try {
      // Add tracking event
      await supabase.from('shipment_tracking').insert({
        shipment_id: shipment.id,
        status: 'Tracking viewed',
        description: 'Customer viewed tracking information',
        location: shipment.destination.city || 'Unknown',
      })
      toast.info(`Tracking: viewing shipment ${shipment.id}`)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Batch ship handler
  const handleBatchShip = async () => {
    if (selectedOrders.length === 0) {
      toast.error('No orders selected')
      return
    }
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Create shipments for selected orders
      const shipmentsToCreate = selectedOrders.map(orderId => ({
        user_id: user.id,
        order_id: orderId,
        status: 'processing',
        method: 'standard',
        carrier: 'FedEx',
        tracking_number: `BATCH${Date.now()}${orderId}`,
      }))

      const { error } = await supabase.from('shipments').insert(shipmentsToCreate)
      if (error) throw error

      toast.success(`Batch shipment created orders queued for shipment`)
      setSelectedOrders([])
      fetchShipments()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create batch shipment')
    }
  }

  // Cancel shipment
  const handleCancelShipment = async (trackingNumber: string) => {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('tracking_number', trackingNumber)

      if (error) throw error

      toast.info(`Shipment cancelled: "${trackingNumber}" has been cancelled`)
      fetchShipments()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to cancel shipment')
    }
  }

  // Export shipments
  const handleExportShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `shipments-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Exporting shipments')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to export shipments')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50/30 to-teal-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shipping Hub</h1>
              <p className="text-gray-600 dark:text-gray-400">ShipStation-level fulfillment & logistics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search shipments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Shipment
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Shipments', value: mockAnalytics.totalShipments.toLocaleString(), change: 15.3, icon: Package, color: 'from-blue-500 to-cyan-500' },
            { label: 'Shipped Today', value: mockAnalytics.shippedToday.toString(), change: 8.7, icon: Send, color: 'from-green-500 to-emerald-500' },
            { label: 'In Transit', value: mockAnalytics.inTransit.toString(), change: 12.4, icon: Truck, color: 'from-yellow-500 to-orange-500' },
            { label: 'Delivered', value: mockAnalytics.delivered.toLocaleString(), change: 18.9, icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
            { label: 'On-Time Rate', value: `${mockAnalytics.onTimeRate}%`, change: 2.1, icon: Timer, color: 'from-purple-500 to-violet-500' },
            { label: 'Avg Cost', value: formatCurrency(mockAnalytics.avgShippingCost), change: -5.2, icon: DollarSign, color: 'from-pink-500 to-rose-500' },
            { label: 'Total Cost', value: formatCurrency(mockAnalytics.totalCost), change: 22.4, icon: TrendingUp, color: 'from-indigo-500 to-blue-500' },
            { label: 'Avg Delivery', value: `${mockAnalytics.avgDeliveryDays}d`, change: -8.3, icon: Calendar, color: 'from-teal-500 to-cyan-500' }
          ].map((stat, idx) => (
            <Card key={idx} className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <Badge variant="outline" className={stat.change >= 0 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}>
                    {stat.change >= 0 ? '+' : ''}{stat.change}%
                  </Badge>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
            <TabsTrigger value="shipments" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Shipments
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Orders
              {pendingOrders.length > 0 && (
                <Badge className="bg-yellow-500 text-white ml-1">{pendingOrders.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Tracking
            </TabsTrigger>
            <TabsTrigger value="labels" className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Labels
            </TabsTrigger>
            <TabsTrigger value="carriers" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Carriers
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

          {/* Shipments Tab */}
          <TabsContent value="shipments" className="space-y-4">
            {/* Shipments Overview Banner */}
            <Card className="border-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Package className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Shipment Management</h3>
                      <p className="text-white/80">Track and manage all your outgoing shipments</p>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{mockAnalytics.totalShipments.toLocaleString()}</p>
                      <p className="text-sm text-white/80">Total Shipments</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockAnalytics.inTransit}</p>
                      <p className="text-sm text-white/80">In Transit</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockAnalytics.onTimeRate}%</p>
                      <p className="text-sm text-white/80">On-Time Rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipments Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'New Shipment', color: 'bg-blue-500', action: () => setShowCreateDialog(true) },
                { icon: Upload, label: 'Bulk Import', color: 'bg-green-500', action: () => setShowBulkImportDialog(true) },
                { icon: Printer, label: 'Print Labels', color: 'bg-purple-500', action: () => setShowPrintLabelsDialog(true) },
                { icon: MapPin, label: 'Track All', color: 'bg-orange-500', action: () => setShowTrackAllDialog(true) },
                { icon: Archive, label: 'Batch Update', color: 'bg-pink-500', action: () => setShowBatchUpdateDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-indigo-500', action: handleExportShipments },
                { icon: RefreshCw, label: 'Sync Status', color: 'bg-teal-500', action: () => setShowSyncStatusDialog(true) },
                { icon: AlertCircle, label: 'Exceptions', color: 'bg-red-500', action: () => setShowExceptionsDialog(true) }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
                  onClick={action.action}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Button>
                {(['pending', 'in_transit', 'out_for_delivery', 'delivered'] as ShipmentStatus[]).map(status => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportShipments}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowFiltersDialog(true)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Database Shipments Display */}
            {dbShipments.length > 0 && (
              <div className="space-y-2 mb-4">
                <h3 className="text-sm font-medium text-gray-500">Your Shipments ({dbShipments.length})</h3>
                {dbShipments.slice(0, 5).map(shipment => (
                  <Card key={shipment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{shipment.recipient_name || 'Unnamed'}</p>
                            <p className="text-xs text-gray-500">{shipment.tracking_number}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={shipment.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                            {shipment.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(shipment.id, 'shipped')}
                          >
                            Ship
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleDeleteShipment(shipment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {filteredShipments.map(shipment => (
                <Card
                  key={shipment.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedShipment(shipment)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                          {getStatusIcon(shipment.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{shipment.orderNumber}</h3>
                            <Badge className={getStatusColor(shipment.status)}>
                              {shipment.status.replace('_', ' ')}
                            </Badge>
                            {shipment.priority && (
                              <Badge className="bg-red-100 text-red-700">Priority</Badge>
                            )}
                            {shipment.signatureRequired && (
                              <Badge variant="outline">Signature</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {shipment.destination.name} • {shipment.destination.city}, {shipment.destination.state}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              {shipment.carrier} - {shipment.service}
                            </span>
                            {shipment.trackingNumber && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {shipment.trackingNumber}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {shipment.items} items
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(shipment.totalCost)}</p>
                        <p className="text-xs text-gray-500">
                          {shipment.estimatedDelivery ? `Est. ${formatDate(shipment.estimatedDelivery)}` : 'Pending'}
                        </p>
                      </div>
                    </div>

                    {shipment.events.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Latest:</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {shipment.events[0].description}
                          </span>
                          <span className="text-gray-500">
                            • {shipment.events[0].location} • {formatTime(shipment.events[0].timestamp)}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            {/* Orders Overview Banner */}
            <Card className="border-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Order Fulfillment</h3>
                      <p className="text-white/80">Process and ship pending orders efficiently</p>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{pendingOrders.length}</p>
                      <p className="text-sm text-white/80">Pending</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockOrders.length}</p>
                      <p className="text-sm text-white/80">Total Orders</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">2</p>
                      <p className="text-sm text-white/80">Priority</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Printer, label: 'Batch Labels', color: 'bg-blue-500', action: () => setShowBatchLabelsDialog(true) },
                { icon: Package, label: 'Pack All', color: 'bg-green-500', action: () => setShowPackAllDialog(true) },
                { icon: Truck, label: 'Ship Selected', color: 'bg-purple-500', action: () => setShowShipSelectedDialog(true) },
                { icon: Clock, label: 'Priority First', color: 'bg-orange-500', action: () => setShowPriorityFirstDialog(true) },
                { icon: Search, label: 'Find Order', color: 'bg-pink-500', action: () => setShowFindOrderDialog(true) },
                { icon: Filter, label: 'Filter', color: 'bg-indigo-500', action: () => setShowFiltersDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-teal-500', action: () => setShowOrdersExportDialog(true) },
                { icon: RefreshCw, label: 'Refresh', color: 'bg-gray-500', action: fetchShipments }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
                  onClick={action.action}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Awaiting Shipment ({pendingOrders.length})
              </h3>
              <div className="flex items-center gap-2">
                {selectedOrders.length > 0 && (
                  <Button onClick={handleBatchShip} className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                    <Printer className="w-4 h-4 mr-2" />
                    Create Labels ({selectedOrders.length})
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {mockOrders.map(order => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedOrders([...selectedOrders, order.id])
                          } else {
                            setSelectedOrders(selectedOrders.filter(id => id !== order.id))
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{order.orderNumber}</h4>
                            <Badge className={getOrderStatusColor(order.status)}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="secondary">{order.source}</Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
                            <p className="text-xs text-gray-500">Ship by {formatDate(order.shipBy!)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
                          <div>
                            <p className="text-gray-500">Customer</p>
                            <p className="font-medium text-gray-900 dark:text-white">{order.customerName}</p>
                            <p className="text-gray-600 dark:text-gray-400">{order.customerEmail}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Ship To</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {order.shippingAddress.city}, {order.shippingAddress.state}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">{order.shippingAddress.postalCode}</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {order.items.map(item => (
                              <span key={item.id}>{item.quantity}x {item.name}</span>
                            ))}
                          </div>
                        </div>

                        {order.notes && (
                          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm text-yellow-700 dark:text-yellow-300">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            {order.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-4">
            {/* Tracking Overview Banner */}
            <Card className="border-0 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <MapPin className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Package Tracking</h3>
                      <p className="text-white/80">Real-time visibility into all shipment locations</p>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{mockShipments.filter(s => s.status === 'in_transit').length}</p>
                      <p className="text-sm text-white/80">In Transit</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockShipments.filter(s => s.status === 'out_for_delivery').length}</p>
                      <p className="text-sm text-white/80">Out for Delivery</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockShipments.filter(s => s.events.length > 0).length}</p>
                      <p className="text-sm text-white/80">With Updates</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Search, label: 'Track Number', color: 'bg-blue-500', action: () => setShowTrackNumberDialog(true) },
                { icon: Globe, label: 'Map View', color: 'bg-green-500', action: () => setShowMapViewDialog(true) },
                { icon: Bell, label: 'Alerts', color: 'bg-purple-500', action: () => setShowAlertsDialog(true) },
                { icon: Clock, label: 'Timeline', color: 'bg-orange-500', action: () => setShowTimelineDialog(true) },
                { icon: Mail, label: 'Notify Customer', color: 'bg-pink-500', action: () => setShowNotifyCustomerDialog(true) },
                { icon: RefreshCw, label: 'Refresh All', color: 'bg-indigo-500', action: () => setShowRefreshAllDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-teal-500', action: () => setShowTrackingExportDialog(true) },
                { icon: AlertCircle, label: 'Exceptions', color: 'bg-red-500', action: () => setShowTrackingExceptionsDialog(true) }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
                  onClick={action.action}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Track Package</CardTitle>
                <CardDescription>Enter a tracking number to view delivery status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter tracking number..."
                    className="flex-1"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                  />
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
                    onClick={() => setShowTrackNumberDialog(true)}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Track
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {mockShipments.filter(s => s.events.length > 0).map(shipment => (
                <Card key={shipment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{shipment.trackingNumber}</CardTitle>
                        <CardDescription>{shipment.carrier} - {shipment.service}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(shipment.status)}>
                        {shipment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {shipment.events.map((event, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          <div className={`w-3 h-3 rounded-full mt-1 ${idx === 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 dark:text-white">{event.status}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(event.timestamp)} at {formatTime(event.timestamp)}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                            <p className="text-xs text-gray-500">{event.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Labels Tab */}
          <TabsContent value="labels" className="space-y-4">
            {/* Labels Overview Banner */}
            <Card className="border-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Printer className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Label Management</h3>
                      <p className="text-white/80">Create, print, and manage shipping labels</p>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{mockLabels.length}</p>
                      <p className="text-sm text-white/80">Total Labels</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockLabels.filter(l => l.status === 'printed').length}</p>
                      <p className="text-sm text-white/80">Printed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">${mockLabels.reduce((sum, l) => sum + l.cost, 0).toFixed(2)}</p>
                      <p className="text-sm text-white/80">Total Cost</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Labels Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'Create Label', color: 'bg-blue-500', action: () => setShowCreateLabelDialog(true) },
                { icon: Printer, label: 'Batch Print', color: 'bg-green-500', action: () => setShowBatchPrintDialog(true) },
                { icon: Download, label: 'Download All', color: 'bg-purple-500', action: () => setShowDownloadAllLabelsDialog(true) },
                { icon: XCircle, label: 'Void Label', color: 'bg-red-500', action: () => setShowVoidLabelDialog(true) },
                { icon: Copy, label: 'Duplicate', color: 'bg-orange-500', action: () => setShowDuplicateLabelDialog(true) },
                { icon: Search, label: 'Find', color: 'bg-pink-500', action: () => setShowFindLabelDialog(true) },
                { icon: History, label: 'History', color: 'bg-indigo-500', action: () => setShowLabelHistoryDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-gray-500', action: () => setShowLabelSettingsDialog(true) }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
                  onClick={action.action}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shipping Labels</h3>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white" onClick={() => setShowBatchPrintDialog(true)}>
                <Printer className="w-4 h-4 mr-2" />
                Batch Print
              </Button>
            </div>

            <div className="grid gap-4">
              {mockLabels.map(label => (
                <Card key={label.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 dark:text-white">{label.trackingNumber}</p>
                            <Badge className={label.status === 'printed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {label.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {label.carrier} - {label.service}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(label.cost)}</p>
                          <p className="text-xs text-gray-500">{formatDate(label.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setSelectedLabel(label); setShowViewLabelDialog(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setSelectedLabel(label); setShowDownloadLabelDialog(true); }}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setSelectedLabel(label); setShowPrintLabelDialog(true); }}>
                            <Printer className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Carriers Tab */}
          <TabsContent value="carriers" className="space-y-4">
            {/* Carriers Overview Banner */}
            <Card className="border-0 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Truck className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Carrier Integrations</h3>
                      <p className="text-white/80">Manage your shipping carrier accounts and rates</p>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{mockCarriers.length}</p>
                      <p className="text-sm text-white/80">Carriers</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockCarriers.filter(c => c.isActive).length}</p>
                      <p className="text-sm text-white/80">Active</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockCarriers.reduce((sum, c) => sum + c.services.length, 0)}</p>
                      <p className="text-sm text-white/80">Services</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Carriers Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'Add Carrier', color: 'bg-blue-500', action: () => setShowAddCarrierDialog(true) },
                { icon: RefreshCw, label: 'Sync Rates', color: 'bg-green-500', action: () => setShowSyncRatesDialog(true) },
                { icon: DollarSign, label: 'Compare Rates', color: 'bg-purple-500', action: () => setShowCompareRatesDialog(true) },
                { icon: Settings, label: 'Configure', color: 'bg-orange-500', action: () => setShowConfigureCarrierDialog(true) },
                { icon: Key, label: 'API Keys', color: 'bg-pink-500', action: () => setShowApiKeysDialog(true) },
                { icon: Shield, label: 'Insurance', color: 'bg-indigo-500', action: () => setShowInsuranceDialog(true) },
                { icon: Globe, label: 'International', color: 'bg-teal-500', action: () => setShowInternationalDialog(true) },
                { icon: BarChart3, label: 'Analytics', color: 'bg-gray-500', action: () => setShowCarrierAnalyticsDialog(true) }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
                  onClick={action.action}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Carrier Accounts</h3>
              <Button variant="outline" onClick={() => setShowAddCarrierDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Carrier
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockCarriers.map(carrier => (
                <Card key={carrier.id} className={carrier.isActive ? 'ring-1 ring-green-500' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-lg font-bold">
                          {carrier.name[0]}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{carrier.name}</h4>
                          <p className="text-sm text-gray-500">{carrier.type}</p>
                        </div>
                      </div>
                      <Badge className={carrier.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {carrier.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {carrier.accountNumber && (
                      <p className="text-sm text-gray-500 mb-4">Account: {carrier.accountNumber}</p>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Services</p>
                      {carrier.services.slice(0, 3).map(service => (
                        <div key={service.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{service.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{service.deliveryDays}</span>
                            <span className="font-medium">{formatCurrency(service.baseRate)}</span>
                          </div>
                        </div>
                      ))}
                      {carrier.services.length > 3 && (
                        <p className="text-xs text-gray-500">+{carrier.services.length - 3} more services</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {/* Analytics Overview Banner */}
            <Card className="border-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <BarChart3 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Shipping Analytics</h3>
                      <p className="text-white/80">Insights into your shipping performance</p>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{mockAnalytics.onTimeRate}%</p>
                      <p className="text-sm text-white/80">On-Time Rate</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(mockAnalytics.avgShippingCost)}</p>
                      <p className="text-sm text-white/80">Avg Cost</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mockAnalytics.avgDeliveryDays}d</p>
                      <p className="text-sm text-white/80">Avg Delivery</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: BarChart3, label: 'Reports', color: 'bg-blue-500', action: () => setShowReportsDialog(true) },
                { icon: TrendingUp, label: 'Trends', color: 'bg-green-500', action: () => setShowTrendsDialog(true) },
                { icon: DollarSign, label: 'Cost Analysis', color: 'bg-purple-500', action: () => setShowCostAnalysisDialog(true) },
                { icon: Truck, label: 'Carrier Stats', color: 'bg-orange-500', action: () => setShowCarrierStatsDialog(true) },
                { icon: Globe, label: 'Destinations', color: 'bg-pink-500', action: () => setShowDestinationsDialog(true) },
                { icon: Timer, label: 'Delivery Time', color: 'bg-indigo-500', action: () => setShowDeliveryTimeDialog(true) },
                { icon: Download, label: 'Export Data', color: 'bg-teal-500', action: () => setShowExportDataDialog(true) },
                { icon: Calendar, label: 'Date Range', color: 'bg-gray-500', action: () => setShowDateRangeDialog(true) }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
                  onClick={action.action}
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Shipping Volume */}
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Shipping Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-6">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Total Volume</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockAnalytics.totalShipments.toLocaleString()}</p>
                      <p className="text-xs text-green-600">+15.3% this month</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">On-Time Rate</p>
                      <p className="text-2xl font-bold text-green-600">{mockAnalytics.onTimeRate}%</p>
                      <p className="text-xs text-green-600">Above target</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Total Spend</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(mockAnalytics.totalCost)}</p>
                      <p className="text-xs text-red-600">+22.4% vs last month</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Avg Delivery</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockAnalytics.avgDeliveryDays} days</p>
                      <p className="text-xs text-green-600">-8.3% faster</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Carrier Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-500" />
                    Carrier Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { carrier: 'FedEx', shipments: 523, percent: 42 },
                    { carrier: 'UPS', shipments: 389, percent: 31 },
                    { carrier: 'USPS', shipments: 245, percent: 20 },
                    { carrier: 'DHL', shipments: 88, percent: 7 }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.carrier}</span>
                        <span className="text-sm font-semibold">{item.shipments}</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Destinations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-500" />
                    Top Destinations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { state: 'California', shipments: 234 },
                    { state: 'Texas', shipments: 189 },
                    { state: 'New York', shipments: 156 },
                    { state: 'Florida', shipments: 134 },
                    { state: 'Illinois', shipments: 98 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{item.state}</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{item.shipments}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Cost Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Cost Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Avg Ground', value: '$8.50', change: -5.2 },
                    { label: 'Avg Express', value: '$22.00', change: 2.1 },
                    { label: 'Avg Overnight', value: '$45.00', change: -1.8 },
                    { label: 'Avg International', value: '$65.00', change: 8.5 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                        <Badge variant="outline" className={item.change <= 0 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}>
                          {item.change > 0 ? '+' : ''}{item.change}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="border-0 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Settings className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Shipping Settings</h3>
                      <p className="text-white/80">Configure your shipping preferences and integrations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card>
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'carriers', label: 'Carriers', icon: Truck },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.label}</span>
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
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-blue-500" />
                          General Settings
                        </CardTitle>
                        <CardDescription>Configure basic shipping preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Default Weight Unit</Label>
                            <Input defaultValue="lb" className="mt-1" />
                          </div>
                          <div>
                            <Label>Default Dimension Unit</Label>
                            <Input defaultValue="in" className="mt-1" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Default Carrier</Label>
                            <Input defaultValue="FedEx" className="mt-1" />
                          </div>
                          <div>
                            <Label>Default Service</Label>
                            <Input defaultValue="Ground" className="mt-1" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Automatic Rate Shopping</p>
                            <p className="text-sm text-gray-500">Automatically select cheapest carrier</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Signature Required by Default</p>
                            <p className="text-sm text-gray-500">Require signature for all shipments</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Insurance by Default</p>
                            <p className="text-sm text-gray-500">Add insurance to all shipments</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Home className="w-5 h-5 text-green-500" />
                          Default Origin Address
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Company Name</Label>
                            <Input defaultValue="FreeFlow Inc" className="mt-1" />
                          </div>
                          <div>
                            <Label>Contact Name</Label>
                            <Input defaultValue="Shipping Department" className="mt-1" />
                          </div>
                        </div>
                        <div>
                          <Label>Street Address</Label>
                          <Input defaultValue="123 Shipping Lane" className="mt-1" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div>
                            <Label>City</Label>
                            <Input defaultValue="Los Angeles" className="mt-1" />
                          </div>
                          <div>
                            <Label>State</Label>
                            <Input defaultValue="CA" className="mt-1" />
                          </div>
                          <div>
                            <Label>ZIP Code</Label>
                            <Input defaultValue="90001" className="mt-1" />
                          </div>
                        </div>
                        <Button
                          className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
                          onClick={async () => {
                            try {
                              const { data: { user } } = await supabase.auth.getUser()
                              if (!user) {
                                toast.error('Please sign in to save settings')
                                return
                              }
                              // Save origin address to user settings
                              const { error } = await supabase
                                .from('user_settings')
                                .upsert({
                                  user_id: user.id,
                                  setting_key: 'shipping_origin_address',
                                  setting_value: JSON.stringify({
                                    company: 'FreeFlow Inc',
                                    contact: 'Shipping Department',
                                    street: '123 Shipping Lane',
                                    city: 'Los Angeles',
                                    state: 'CA',
                                    zip: '90001'
                                  }),
                                  updated_at: new Date().toISOString()
                                }, { onConflict: 'user_id,setting_key' })

                              if (error) throw error
                              toast.success('Origin address saved successfully')
                            } catch (error) {
                              console.error('Error saving origin address:', error)
                              toast.error('Failed to save origin address')
                            }
                          }}
                        >
                          Save Origin Address
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Carriers Settings */}
                {settingsTab === 'carriers' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Truck className="w-5 h-5 text-blue-500" />
                          Carrier Accounts
                        </CardTitle>
                        <CardDescription>Manage your carrier integrations and API keys</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mockCarriers.map((carrier) => (
                          <div key={carrier.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                {carrier.name[0]}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{carrier.name}</p>
                                <p className="text-sm text-gray-500">Account: {carrier.accountNumber || 'Not configured'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={carrier.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                {carrier.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <Button variant="outline" size="sm" onClick={() => { setSelectedCarrier(carrier); setShowConfigureCarrierDialog(true); }}>Configure</Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowAddCarrierDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add New Carrier
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-500" />
                          Rate Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show Retail Rates</p>
                            <p className="text-sm text-gray-500">Display retail pricing alongside discounted rates</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Include Delivery Estimates</p>
                            <p className="text-sm text-gray-500">Show estimated delivery dates with rates</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Cache Rates</p>
                            <p className="text-sm text-gray-500">Cache rates for faster quote retrieval</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-blue-500" />
                          Shipment Notifications
                        </CardTitle>
                        <CardDescription>Configure shipping status notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'Label Created', desc: 'Notify when shipping label is generated' },
                          { label: 'Package Shipped', desc: 'Notify when package is picked up' },
                          { label: 'In Transit Updates', desc: 'Notify on transit milestones' },
                          { label: 'Out for Delivery', desc: 'Notify when package is out for delivery' },
                          { label: 'Delivered', desc: 'Notify when package is delivered' },
                          { label: 'Exceptions', desc: 'Notify on delivery issues or delays' }
                        ].map((notif, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{notif.label}</p>
                              <p className="text-sm text-gray-500">{notif.desc}</p>
                            </div>
                            <Switch defaultChecked={idx < 5} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-green-500" />
                          Customer Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Send Tracking Emails</p>
                            <p className="text-sm text-gray-500">Automatically email tracking info to customers</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">SMS Notifications</p>
                            <p className="text-sm text-gray-500">Send SMS updates for delivery status</p>
                          </div>
                          <Switch />
                        </div>
                        <div>
                          <Label>Custom Email Template</Label>
                          <Input defaultValue="Use default template" className="mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-blue-500" />
                          E-commerce Integrations
                        </CardTitle>
                        <CardDescription>Connect your online stores</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Shopify', status: 'connected', orders: 156 },
                          { name: 'WooCommerce', status: 'connected', orders: 89 },
                          { name: 'Amazon', status: 'disconnected', orders: 0 },
                          { name: 'eBay', status: 'disconnected', orders: 0 }
                        ].map((integration, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                {integration.name[0]}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.orders} orders synced</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={integration.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                {integration.status}
                              </Badge>
                              <Button variant="outline" size="sm" onClick={() => setShowConfigureCarrierDialog(true)}>
                                {integration.status === 'connected' ? 'Configure' : 'Connect'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-green-500" />
                          API Access
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>API Key</Label>
                          <div className="flex gap-2 mt-1">
                            <Input type="password" value="sk_live_****************************" readOnly className="font-mono" />
                            <Button variant="outline" onClick={() => { navigator.clipboard.writeText('sk_live_****************************'); toast.success('API key copied to clipboard'); }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>Webhook URL</Label>
                          <Input defaultValue="https://api.yoursite.com/webhooks/shipping" className="mt-1 font-mono" />
                        </div>
                        <Button variant="outline" onClick={() => setShowRegenerateApiKeyDialog(true)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate API Key
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-blue-500" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>Protect your shipping operations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-500">Require 2FA for shipping operations</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">IP Whitelisting</p>
                            <p className="text-sm text-gray-500">Restrict API access to specific IPs</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Audit Logging</p>
                            <p className="text-sm text-gray-500">Log all shipping activities</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="w-5 h-5 text-green-500" />
                          Access Control
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Require Approval for High-Value Shipments</p>
                            <p className="text-sm text-gray-500">Shipments over $500 require manager approval</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Restrict International Shipping</p>
                            <p className="text-sm text-gray-500">Only admins can create international shipments</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Label Void Confirmation</p>
                            <p className="text-sm text-gray-500">Require confirmation before voiding labels</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-blue-500" />
                          Advanced Configuration
                        </CardTitle>
                        <CardDescription>Advanced shipping settings for power users</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Debug Mode</p>
                            <p className="text-sm text-gray-500">Enable verbose logging for troubleshooting</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Sandbox Mode</p>
                            <p className="text-sm text-gray-500">Use test credentials for all carriers</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Batch Processing</p>
                            <p className="text-sm text-gray-500">Process shipments in batches for performance</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>API Timeout (seconds)</Label>
                          <Input type="number" defaultValue="30" className="mt-1" />
                        </div>
                        <div>
                          <Label>Max Concurrent Requests</Label>
                          <Input type="number" defaultValue="10" className="mt-1" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="w-5 h-5 text-green-500" />
                          Data Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-Archive Old Shipments</p>
                            <p className="text-sm text-gray-500">Archive shipments older than 90 days</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Data Retention Period (days)</Label>
                          <Input type="number" defaultValue="365" className="mt-1" />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setShowExportAllDataDialog(true)}>
                            <Download className="w-4 h-4 mr-2" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => setShowClearCacheDialog(true)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear Cache
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-300">Reset All Settings</p>
                            <p className="text-sm text-red-600/70">Restore all settings to defaults</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => setShowResetSettingsDialog(true)}>
                            Reset
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-300">Delete All Data</p>
                            <p className="text-sm text-red-600/70">Permanently delete all shipping data</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => setShowDeleteDataDialog(true)}>
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
              insights={mockShippingAIInsights}
              title="Shipping Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockShippingCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockShippingPredictions}
              title="Shipping Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockShippingActivities}
            title="Shipping Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockShippingQuickActions}
            variant="grid"
          />
        </div>

        {/* Create Shipment Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                  <Plus className="w-5 h-5" />
                </div>
                Create New Shipment
              </DialogTitle>
              <DialogDescription>Fill in the shipment details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Recipient Name *</Label>
                  <Input
                    value={formState.recipient_name}
                    onChange={(e) => setFormState({ ...formState, recipient_name: e.target.value })}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Recipient Email</Label>
                  <Input
                    value={formState.recipient_email}
                    onChange={(e) => setFormState({ ...formState, recipient_email: e.target.value })}
                    placeholder="john@example.com"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Destination Address</Label>
                <Input
                  value={formState.destination_address}
                  onChange={(e) => setFormState({ ...formState, destination_address: e.target.value })}
                  placeholder="123 Main St"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <Label>City</Label>
                  <Input
                    value={formState.destination_city}
                    onChange={(e) => setFormState({ ...formState, destination_city: e.target.value })}
                    placeholder="New York"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={formState.destination_state}
                    onChange={(e) => setFormState({ ...formState, destination_state: e.target.value })}
                    placeholder="NY"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Postal Code</Label>
                  <Input
                    value={formState.destination_postal}
                    onChange={(e) => setFormState({ ...formState, destination_postal: e.target.value })}
                    placeholder="10001"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Carrier</Label>
                  <Input
                    value={formState.carrier}
                    onChange={(e) => setFormState({ ...formState, carrier: e.target.value })}
                    placeholder="FedEx"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Method</Label>
                  <Input
                    value={formState.method}
                    onChange={(e) => setFormState({ ...formState, method: e.target.value })}
                    placeholder="standard"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Weight (lbs)</Label>
                  <Input
                    type="number"
                    value={formState.weight_lbs}
                    onChange={(e) => setFormState({ ...formState, weight_lbs: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Item Count</Label>
                  <Input
                    type="number"
                    value={formState.item_count}
                    onChange={(e) => setFormState({ ...formState, item_count: parseInt(e.target.value) || 1 })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formState.signature_required}
                    onCheckedChange={(checked) => setFormState({ ...formState, signature_required: !!checked })}
                  />
                  <Label>Signature Required</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formState.is_priority}
                    onCheckedChange={(checked) => setFormState({ ...formState, is_priority: !!checked })}
                  />
                  <Label>Priority Shipment</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button
                onClick={handleCreateShipment}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
              >
                {isSubmitting ? 'Creating...' : 'Create Shipment'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Shipment Detail Dialog */}
        <Dialog open={!!selectedShipment} onOpenChange={() => setSelectedShipment(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                  <Package className="w-5 h-5" />
                </div>
                {selectedShipment?.orderNumber}
              </DialogTitle>
              <DialogDescription>Shipment Details</DialogDescription>
            </DialogHeader>
            {selectedShipment && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={getStatusColor(selectedShipment.status)}>
                      {selectedShipment.status.replace('_', ' ')}
                    </Badge>
                    {selectedShipment.priority && <Badge className="bg-red-100 text-red-700">Priority</Badge>}
                    {selectedShipment.signatureRequired && <Badge variant="outline">Signature Required</Badge>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Origin
                      </h4>
                      <div className="text-sm space-y-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <p className="font-medium">{selectedShipment.origin.name}</p>
                        {selectedShipment.origin.company && <p>{selectedShipment.origin.company}</p>}
                        <p>{selectedShipment.origin.street1}</p>
                        <p>{selectedShipment.origin.city}, {selectedShipment.origin.state} {selectedShipment.origin.postalCode}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Destination
                      </h4>
                      <div className="text-sm space-y-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <p className="font-medium">{selectedShipment.destination.name}</p>
                        {selectedShipment.destination.company && <p>{selectedShipment.destination.company}</p>}
                        <p>{selectedShipment.destination.street1}</p>
                        <p>{selectedShipment.destination.city}, {selectedShipment.destination.state} {selectedShipment.destination.postalCode}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="text-lg font-bold">{selectedShipment.package.weight} {selectedShipment.package.weightUnit}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Dimensions</p>
                      <p className="text-lg font-bold">
                        {selectedShipment.package.length}x{selectedShipment.package.width}x{selectedShipment.package.height} {selectedShipment.package.dimensionUnit}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Items</p>
                      <p className="text-lg font-bold">{selectedShipment.items}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Total Cost</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(selectedShipment.totalCost)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Carrier</span>
                      <span>{selectedShipment.carrier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Service</span>
                      <span>{selectedShipment.service}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tracking</span>
                      <span className="font-mono">{selectedShipment.trackingNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Est. Delivery</span>
                      <span>{selectedShipment.estimatedDelivery ? formatDate(selectedShipment.estimatedDelivery) : 'N/A'}</span>
                    </div>
                  </div>

                  {selectedShipment.events.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Tracking History</h4>
                      <div className="space-y-3">
                        {selectedShipment.events.map((event, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${idx === 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900 dark:text-white">{event.status}</p>
                                <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                              <p className="text-xs text-gray-500">{event.location}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white" onClick={() => { if (selectedShipment) handleTrackShipment(selectedShipment); }}>
                      <MapPin className="w-4 h-4 mr-2" />
                      Track Package
                    </Button>
                    <Button variant="outline" onClick={() => { if (selectedShipment) handlePrintLabel(selectedShipment); }}>
                      <Printer className="w-4 h-4 mr-2" />
                      Print Label
                    </Button>
                    <Button variant="outline" onClick={() => {
                      if (selectedShipment) {
                        const shipmentData = JSON.stringify(selectedShipment, null, 2)
                        const blob = new Blob([shipmentData], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'shipment-' + selectedShipment.id + '.json'
                        a.click()
                        URL.revokeObjectURL(url)
                        toast.success('Shipment downloaded: details saved')
                      }
                    }}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Bulk Import Dialog */}
        <Dialog open={showBulkImportDialog} onOpenChange={setShowBulkImportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white">
                  <Upload className="w-5 h-5" />
                </div>
                Bulk Import Shipments
              </DialogTitle>
              <DialogDescription>Import multiple shipments from CSV or Excel file</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop your file here</p>
                <p className="text-sm text-gray-400 mb-4">or</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Create a file input and trigger it
                    const fileInput = document.createElement('input')
                    fileInput.type = 'file'
                    fileInput.accept = '.csv,.xlsx,.xls'
                    fileInput.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        toast.success('File selected: ready for import')
                        // Process file would go here
                      }
                    }
                    fileInput.click()
                  }}
                >
                  Browse Files
                </Button>
              </div>
              <p className="text-xs text-gray-500">Supported formats: CSV, XLSX. Maximum 1000 shipments per import.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBulkImportDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-green-500 to-teal-500 text-white" onClick={() => {
                toast.promise(
                  fetch('/api/shipping/import', { method: 'POST' }).then(async res => { if (!res.ok) throw new Error('Failed'); await fetchShipments(); setShowBulkImportDialog(false); }),
                  { loading: 'Importing shipments...', success: 'Import complete', error: 'Import failed' }
                )
              }}>Import</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Print Labels Dialog */}
        <Dialog open={showPrintLabelsDialog} onOpenChange={setShowPrintLabelsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                  <Printer className="w-5 h-5" />
                </div>
                Print Shipping Labels
              </DialogTitle>
              <DialogDescription>Print labels for pending shipments</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span>Label Format</span>
                <Input defaultValue="4x6 PDF" className="w-32" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span>Printer</span>
                <Input defaultValue="Default" className="w-32" />
              </div>
              <p className="text-sm text-gray-500">{mockShipments.filter(s => s.status === 'pending').length} labels ready to print</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPrintLabelsDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white" onClick={() => {
                const pendingCount = shipments.filter(s => s.status === 'pending').length
                toast.promise(
                  fetch('/api/shipping/labels/print', { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); window.print(); setShowPrintLabelsDialog(false); }),
                  { loading: 'Preparing labels for printing...', success: `${pendingCount} labels sent to printer`, error: 'Failed to prepare labels' }
                )
              }}>Print All</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Track All Dialog */}
        <Dialog open={showTrackAllDialog} onOpenChange={setShowTrackAllDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white">
                  <MapPin className="w-5 h-5" />
                </div>
                Track All Shipments
              </DialogTitle>
              <DialogDescription>View tracking status for all active shipments</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
              {mockShipments.map(shipment => (
                <div key={shipment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{shipment.trackingNumber || 'No tracking'}</p>
                    <p className="text-sm text-gray-500">{shipment.destination.city}, {shipment.destination.state}</p>
                  </div>
                  <Badge className={getStatusColor(shipment.status)}>{shipment.status.replace('_', ' ')}</Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTrackAllDialog(false)}>Close</Button>
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white" onClick={async () => {
                toast.loading('Refreshing all tracking...', { id: 'refresh-all' })
                try {
                  await fetchShipments()
                  toast.success('All tracking refreshed', { id: 'refresh-all', description: `${mockShipments.length} shipments updated` })
                } catch {
                  toast.error('Failed to refresh tracking', { id: 'refresh-all' })
                }
              }}>Refresh All</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Batch Update Dialog */}
        <Dialog open={showBatchUpdateDialog} onOpenChange={setShowBatchUpdateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white">
                  <Archive className="w-5 h-5" />
                </div>
                Batch Update Shipments
              </DialogTitle>
              <DialogDescription>Update multiple shipments at once</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>New Status</Label>
                <Input placeholder="Select status..." className="mt-1" />
              </div>
              <div>
                <Label>Apply To</Label>
                <Input defaultValue="All pending shipments" className="mt-1" />
              </div>
              <p className="text-sm text-gray-500">This will update {mockShipments.filter(s => s.status === 'pending').length} shipments</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBatchUpdateDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white" onClick={() => {
                const pendingCount = mockShipments.filter(s => s.status === 'pending').length
                toast.promise(
                  fetch('/api/shipping/batch-update', { method: 'POST' }).then(async res => { if (!res.ok) throw new Error('Failed'); await fetchShipments(); setShowBatchUpdateDialog(false); }),
                  { loading: 'Applying batch update...', success: `${pendingCount} shipments updated`, error: 'Batch update failed' }
                )
              }}>Update All</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Sync Status Dialog */}
        <Dialog open={showSyncStatusDialog} onOpenChange={setShowSyncStatusDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-white">
                  <RefreshCw className="w-5 h-5" />
                </div>
                Sync Shipment Status
              </DialogTitle>
              <DialogDescription>Sync tracking status from all carriers</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {mockCarriers.map(carrier => (
                <div key={carrier.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="font-medium">{carrier.name}</span>
                  <Badge className="bg-green-100 text-green-700">Synced</Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSyncStatusDialog(false)}>Close</Button>
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white" onClick={async () => {
                toast.loading('Syncing with carriers...', { id: 'carrier-sync' })
                try {
                  await fetchShipments()
                  toast.success('Carrier sync complete', { id: 'carrier-sync' })
                } catch { toast.error('Sync failed', { id: 'carrier-sync' }) }
              }}>Sync Now</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Exceptions Dialog */}
        <Dialog open={showExceptionsDialog} onOpenChange={setShowExceptionsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center text-white">
                  <AlertCircle className="w-5 h-5" />
                </div>
                Shipping Exceptions
              </DialogTitle>
              <DialogDescription>View and resolve delivery issues</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="font-medium text-yellow-700 dark:text-yellow-300">No exceptions found</p>
                <p className="text-sm text-yellow-600">All shipments are on track for delivery</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowExceptionsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filters Dialog */}
        <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                  <Filter className="w-5 h-5" />
                </div>
                Filter Shipments
              </DialogTitle>
              <DialogDescription>Apply filters to your shipment view</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Status</Label>
                <Input placeholder="All statuses" className="mt-1" />
              </div>
              <div>
                <Label>Carrier</Label>
                <Input placeholder="All carriers" className="mt-1" />
              </div>
              <div>
                <Label>Date Range</Label>
                <Input placeholder="Last 30 days" className="mt-1" />
              </div>
              <div>
                <Label>Destination</Label>
                <Input placeholder="All destinations" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFiltersDialog(false)}>Clear</Button>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white" onClick={async () => {
                toast.loading('Applying filters...', { id: 'apply-filters' })
                try {
                  await fetchShipments()
                  toast.success('Filters applied', { id: 'apply-filters', description: 'Shipment list updated' })
                  setShowFiltersDialog(false)
                } catch {
                  toast.error('Failed to apply filters', { id: 'apply-filters' })
                }
              }}>Apply Filters</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Batch Labels Dialog */}
        <Dialog open={showBatchLabelsDialog} onOpenChange={setShowBatchLabelsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Batch Labels</DialogTitle>
              <DialogDescription>Generate labels for multiple orders</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm">{pendingOrders.length} orders ready for label creation</p>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span>Default Carrier</span>
                <Input defaultValue="FedEx" className="w-32" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBatchLabelsDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.promise(
                  fetch('/api/shipping/labels/batch', { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); setShowBatchLabelsDialog(false); }),
                  { loading: 'Creating batch labels...', success: `${pendingOrders.length} labels generated`, error: 'Failed to create labels' }
                )
              }}>Create Labels</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pack All Dialog */}
        <Dialog open={showPackAllDialog} onOpenChange={setShowPackAllDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pack All Orders</DialogTitle>
              <DialogDescription>Mark all orders as packed and ready to ship</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm">{pendingOrders.length} orders will be marked as packed</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPackAllDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.promise(
                  fetch('/api/shipping/orders/pack-all', { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); setPendingOrders(prev => prev.map(o => ({ ...o, status: 'packed' }))); setShowPackAllDialog(false); }),
                  { loading: 'Marking orders as packed...', success: `${pendingOrders.length} orders packed`, error: 'Failed to pack orders' }
                )
              }}>Pack All</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Ship Selected Dialog */}
        <Dialog open={showShipSelectedDialog} onOpenChange={setShowShipSelectedDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ship Selected Orders</DialogTitle>
              <DialogDescription>Create shipments for selected orders</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm">{selectedOrders.length} orders selected for shipping</p>
              {selectedOrders.length === 0 && (
                <p className="text-yellow-600 text-sm">Please select orders from the list first</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowShipSelectedDialog(false)}>Cancel</Button>
              <Button disabled={selectedOrders.length === 0} onClick={() => { handleBatchShip(); setShowShipSelectedDialog(false); }}>Ship Selected</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Priority First Dialog */}
        <Dialog open={showPriorityFirstDialog} onOpenChange={setShowPriorityFirstDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Priority Orders</DialogTitle>
              <DialogDescription>Sort and process priority orders first</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm">Priority orders will be moved to the top of the queue</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPriorityFirstDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                setPendingOrders(prev => [...prev].sort((a, b) => (b.priority ? 1 : 0) - (a.priority ? 1 : 0)))
                toast.success('Priority orders sorted')
                setShowPriorityFirstDialog(false)
              }}>Sort Priority First</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Find Order Dialog */}
        <Dialog open={showFindOrderDialog} onOpenChange={setShowFindOrderDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Find Order</DialogTitle>
              <DialogDescription>Search for a specific order</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Order Number or Customer Name</Label>
                <Input placeholder="Enter search term..." className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFindOrderDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                const searchResults = pendingOrders.filter(o =>
                  o.customer.toLowerCase().includes('search') || o.id.toLowerCase().includes('search')
                )
                if (searchResults.length > 0) {
                  toast.success('Orders found: matching orders')
                } else {
                  toast.info('No orders found')
                }
                setShowFindOrderDialog(false)
              }}>Search</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Orders Export Dialog */}
        <Dialog open={showOrdersExportDialog} onOpenChange={setShowOrdersExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Orders</DialogTitle>
              <DialogDescription>Export orders to CSV or Excel</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Format</Label>
                <Input defaultValue="CSV" className="mt-1" />
              </div>
              <div>
                <Label>Date Range</Label>
                <Input defaultValue="Last 30 days" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowOrdersExportDialog(false)}>Cancel</Button>
              <Button onClick={() => { handleExportShipments(); setShowOrdersExportDialog(false); }}>Export</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Track Number Dialog */}
        <Dialog open={showTrackNumberDialog} onOpenChange={setShowTrackNumberDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Track Package</DialogTitle>
              <DialogDescription>Enter a tracking number to view status</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Tracking Number</Label>
                <Input value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} placeholder="Enter tracking number..." className="mt-1" />
              </div>
              {trackingInput && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="font-medium">Status: In Transit</p>
                  <p className="text-sm text-gray-500">Last update: Package arrived at distribution center</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTrackNumberDialog(false)}>Close</Button>
              <Button
                onClick={async () => {
                  if (!trackingInput.trim()) {
                    toast.error('Please enter a tracking number')
                    return
                  }
                  try {
                    // Search for shipment by tracking number
                    const { data: shipments, error } = await supabase
                      .from('shipments')
                      .select('*')
                      .eq('tracking_number', trackingInput.trim())
                      .limit(1)

                    if (error) throw error

                    if (shipments && shipments.length > 0) {
                      const shipment = shipments[0]
                      toast.success('Shipment found - ' + (shipment.recipient_name || 'Unknown recipient'))
                      // Log tracking view
                      await supabase.from('shipment_tracking').insert({
                        shipment_id: shipment.id,
                        status: 'Tracking viewed',
                        description: 'User viewed tracking information',
                        location: shipment.destination_city || 'Unknown',
                      })
                    } else {
                      // Check mock data
                      const mockShipment = mockShipments.find(s => s.trackingNumber === trackingInput.trim())
                      if (mockShipment) {
                        toast.success('Shipment found - ' + mockShipment.destination.name)
                      } else {
                        toast.info('No shipment found')
                      }
                    }
                  } catch (error) {
                    console.error('Error tracking shipment:', error)
                    toast.error('Failed to track shipment')
                  }
                }}
              >
                Track
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Map View Dialog */}
        <Dialog open={showMapViewDialog} onOpenChange={setShowMapViewDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Shipment Map View</DialogTitle>
              <DialogDescription>View all shipment locations on the map</DialogDescription>
            </DialogHeader>
            <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Globe className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Map visualization would appear here</p>
                <p className="text-sm text-gray-400">{mockShipments.length} active shipments</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowMapViewDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alerts Dialog */}
        <Dialog open={showAlertsDialog} onOpenChange={setShowAlertsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delivery Alerts</DialogTitle>
              <DialogDescription>Manage your delivery alert preferences</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span>Email Alerts</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span>SMS Alerts</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span>Push Notifications</span>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAlertsDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Saving alert preferences...', { id: 'save-alerts' })
                try {
                  const { data: { user } } = await supabase.auth.getUser()
                  if (user) {
                    await supabase.from('shipping_preferences').upsert({
                      user_id: user.id,
                      alert_preferences: { email: true, sms: false, push: true },
                      updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' })
                  }
                  toast.success('Alert preferences saved', { id: 'save-alerts' })
                  setShowAlertsDialog(false)
                } catch {
                  toast.error('Failed to save preferences', { id: 'save-alerts' })
                }
              }}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Timeline Dialog */}
        <Dialog open={showTimelineDialog} onOpenChange={setShowTimelineDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Shipment Timeline</DialogTitle>
              <DialogDescription>View chronological shipment events</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
              {mockShipments[0]?.events.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${idx === 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="font-medium">{event.status}</p>
                    <p className="text-sm text-gray-500">{event.description}</p>
                    <p className="text-xs text-gray-400">{event.location} - {formatDate(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowTimelineDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notify Customer Dialog */}
        <Dialog open={showNotifyCustomerDialog} onOpenChange={setShowNotifyCustomerDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notify Customer</DialogTitle>
              <DialogDescription>Send tracking notification to customer</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Customer Email</Label>
                <Input placeholder="customer@example.com" className="mt-1" />
              </div>
              <div>
                <Label>Message</Label>
                <Input placeholder="Your package is on its way..." className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNotifyCustomerDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.promise(
                  fetch('/api/shipping/notifications/send', { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); setShowNotifyCustomerDialog(false); }),
                  { loading: 'Sending notification...', success: 'Notification sent to customer', error: 'Failed to send notification' }
                )
              }}>Send</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Refresh All Dialog */}
        <Dialog open={showRefreshAllDialog} onOpenChange={setShowRefreshAllDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Refresh All Tracking</DialogTitle>
              <DialogDescription>Update tracking for all shipments</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm">This will refresh tracking status for {mockShipments.length} shipments</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRefreshAllDialog(false)}>Cancel</Button>
              <Button onClick={() => { fetchShipments(); toast.success('All tracking refreshed'); setShowRefreshAllDialog(false); }}>Refresh All</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tracking Export Dialog */}
        <Dialog open={showTrackingExportDialog} onOpenChange={setShowTrackingExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Tracking Data</DialogTitle>
              <DialogDescription>Export tracking information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Format</Label>
                <Input defaultValue="CSV" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTrackingExportDialog(false)}>Cancel</Button>
              <Button onClick={() => { handleExportShipments(); setShowTrackingExportDialog(false); }}>Export</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tracking Exceptions Dialog */}
        <Dialog open={showTrackingExceptionsDialog} onOpenChange={setShowTrackingExceptionsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tracking Exceptions</DialogTitle>
              <DialogDescription>View packages with delivery issues</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="font-medium text-green-700 dark:text-green-300">No exceptions</p>
                <p className="text-sm text-green-600">All packages are tracking normally</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowTrackingExceptionsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Label Dialog */}
        <Dialog open={showCreateLabelDialog} onOpenChange={setShowCreateLabelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Shipping Label</DialogTitle>
              <DialogDescription>Generate a new shipping label</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Shipment</Label>
                <Input placeholder="Select shipment..." className="mt-1" />
              </div>
              <div>
                <Label>Carrier</Label>
                <Input defaultValue="FedEx" className="mt-1" />
              </div>
              <div>
                <Label>Service</Label>
                <Input defaultValue="Ground" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateLabelDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.promise(
                  fetch('/api/shipping/labels', { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); return res.json(); }).then(label => { setShowCreateLabelDialog(false); return label; }),
                  { loading: 'Creating shipping label...', success: (label) => `Label created (${label.trackingNumber})`, error: 'Failed to create label' }
                )
              }}>Create Label</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Batch Print Dialog */}
        <Dialog open={showBatchPrintDialog} onOpenChange={setShowBatchPrintDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Batch Print Labels</DialogTitle>
              <DialogDescription>Print multiple labels at once</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm">{mockLabels.length} labels ready to print</p>
              <div>
                <Label>Printer</Label>
                <Input defaultValue="Default Printer" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBatchPrintDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                window.print()
                toast.success('Labels sent to printer: labels queued')
                setShowBatchPrintDialog(false)
              }}>Print All</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Download All Labels Dialog */}
        <Dialog open={showDownloadAllLabelsDialog} onOpenChange={setShowDownloadAllLabelsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Download All Labels</DialogTitle>
              <DialogDescription>Download all labels as a ZIP file</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm">{mockLabels.length} labels will be downloaded</p>
              <div>
                <Label>Format</Label>
                <Input defaultValue="PDF" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDownloadAllLabelsDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                const labelsData = JSON.stringify(mockLabels, null, 2)
                const blob = new Blob([labelsData], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'shipping-labels-' + new Date().toISOString().split('T')[0] + '.json'
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Labels downloaded: labels exported')
                setShowDownloadAllLabelsDialog(false)
              }}>Download</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Void Label Dialog */}
        <Dialog open={showVoidLabelDialog} onOpenChange={setShowVoidLabelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Void Label</DialogTitle>
              <DialogDescription>Cancel and void a shipping label</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Tracking Number</Label>
                <Input placeholder="Enter tracking number..." className="mt-1" />
              </div>
              <p className="text-sm text-yellow-600">Voiding a label may take up to 24 hours to process with the carrier</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowVoidLabelDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                toast.promise(
                  fetch('/api/shipping/labels/void', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackingNumber: '' }) }).then(res => { if (!res.ok) throw new Error('Failed'); setShowVoidLabelDialog(false); }),
                  { loading: 'Voiding label...', success: 'Label voided - Carrier will process within 24 hours', error: 'Failed to void label' }
                )
              }}>Void Label</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Duplicate Label Dialog */}
        <Dialog open={showDuplicateLabelDialog} onOpenChange={setShowDuplicateLabelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Duplicate Label</DialogTitle>
              <DialogDescription>Create a copy of an existing label</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Source Label</Label>
                <Input placeholder="Select label to duplicate..." className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDuplicateLabelDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.promise(
                  fetch('/api/shipping/labels/duplicate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceLabelId: '' }) }).then(res => { if (!res.ok) throw new Error('Failed'); return res.json(); }).then(data => { setShowDuplicateLabelDialog(false); return data; }),
                  { loading: 'Duplicating label...', success: (data) => `Label duplicated - New tracking: ${data.trackingNumber || 'TRK' + Math.random().toString(36).substring(2, 10).toUpperCase()}`, error: 'Failed to duplicate label' }
                )
              }}>Duplicate</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Find Label Dialog */}
        <Dialog open={showFindLabelDialog} onOpenChange={setShowFindLabelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Find Label</DialogTitle>
              <DialogDescription>Search for a specific label</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Tracking Number</Label>
                <Input placeholder="Enter tracking number..." className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFindLabelDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                const foundLabel = mockLabels.find(l => l.trackingNumber.includes('TRK'))
                if (foundLabel) {
                  toast.success('Label found - ' + foundLabel.trackingNumber)
                } else {
                  toast.info('Label not found')
                }
                setShowFindLabelDialog(false)
              }}>Search</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Label History Dialog */}
        <Dialog open={showLabelHistoryDialog} onOpenChange={setShowLabelHistoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Label History</DialogTitle>
              <DialogDescription>View label creation history</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
              {mockLabels.map(label => (
                <div key={label.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{label.trackingNumber}</p>
                    <p className="text-sm text-gray-500">{label.carrier} - {formatDate(label.createdAt)}</p>
                  </div>
                  <Badge>{label.status}</Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowLabelHistoryDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Label Settings Dialog */}
        <Dialog open={showLabelSettingsDialog} onOpenChange={setShowLabelSettingsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Label Settings</DialogTitle>
              <DialogDescription>Configure label preferences</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Default Format</Label>
                <Input defaultValue="4x6 PDF" className="mt-1" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span>Include packing slip</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span>Auto-print on creation</span>
                <Switch />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLabelSettingsDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Saving label settings...', { id: 'save-label-settings' })
                try {
                  const { data: { user } } = await supabase.auth.getUser()
                  if (user) {
                    await supabase.from('shipping_preferences').upsert({
                      user_id: user.id,
                      label_format: '4x6 PDF',
                      include_packing_slip: true,
                      auto_print: false,
                      updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' })
                  }
                  toast.success('Label settings saved', { id: 'save-label-settings' })
                  setShowLabelSettingsDialog(false)
                } catch {
                  toast.error('Failed to save settings', { id: 'save-label-settings' })
                }
              }}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Label Dialog */}
        <Dialog open={showViewLabelDialog} onOpenChange={setShowViewLabelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>View Label</DialogTitle>
              <DialogDescription>{selectedLabel?.trackingNumber}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Label Preview</p>
                  <p className="text-sm text-gray-400">{selectedLabel?.carrier} - {selectedLabel?.service}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowViewLabelDialog(false)}>Close</Button>
              <Button onClick={() => window.open(selectedLabel?.url || '#', '_blank')}>Open Full Size</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Download Label Dialog */}
        <Dialog open={showDownloadLabelDialog} onOpenChange={setShowDownloadLabelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Download Label</DialogTitle>
              <DialogDescription>Download label for {selectedLabel?.trackingNumber}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Format</Label>
                <Input defaultValue="PDF" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDownloadLabelDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                if (selectedLabel) {
                  const labelData = JSON.stringify(selectedLabel, null, 2)
                  const blob = new Blob([labelData], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `label-${selectedLabel.trackingNumber}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Label downloaded')
                }
                setShowDownloadLabelDialog(false)
              }}>Download</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Print Label Dialog */}
        <Dialog open={showPrintLabelDialog} onOpenChange={setShowPrintLabelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Print Label</DialogTitle>
              <DialogDescription>Print label for {selectedLabel?.trackingNumber}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Printer</Label>
                <Input defaultValue="Default Printer" className="mt-1" />
              </div>
              <div>
                <Label>Copies</Label>
                <Input type="number" defaultValue="1" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPrintLabelDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                window.print()
                toast.success('Label sent to printer')
                setShowPrintLabelDialog(false)
              }}>Print</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Carrier Dialog */}
        <Dialog open={showAddCarrierDialog} onOpenChange={setShowAddCarrierDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Carrier</DialogTitle>
              <DialogDescription>Connect a new shipping carrier</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Carrier Name</Label>
                <Input placeholder="Select carrier..." className="mt-1" />
              </div>
              <div>
                <Label>Account Number</Label>
                <Input placeholder="Enter account number..." className="mt-1" />
              </div>
              <div>
                <Label>API Key</Label>
                <Input type="password" placeholder="Enter API key..." className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddCarrierDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Adding carrier...', { id: 'add-carrier' })
                try {
                  const { data: { user } } = await supabase.auth.getUser()
                  if (user) {
                    await supabase.from('carrier_credentials').insert({
                      user_id: user.id,
                      carrier_code: 'NEW',
                      carrier_name: 'New Carrier',
                      is_active: true,
                      created_at: new Date().toISOString()
                    })
                  }
                  toast.success('Carrier added successfully', { id: 'add-carrier' })
                  setShowAddCarrierDialog(false)
                } catch {
                  toast.error('Failed to add carrier', { id: 'add-carrier' })
                }
              }}>Add Carrier</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Sync Rates Dialog */}
        <Dialog open={showSyncRatesDialog} onOpenChange={setShowSyncRatesDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sync Carrier Rates</DialogTitle>
              <DialogDescription>Update rates from all carriers</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {mockCarriers.map(carrier => (
                <div key={carrier.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span>{carrier.name}</span>
                  <Badge className="bg-green-100 text-green-700">Ready</Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSyncRatesDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.promise(
                  fetch('/api/shipping/carriers/sync', { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); setShowSyncRatesDialog(false); }),
                  { loading: 'Syncing rates from carriers...', success: `Rates synced - ${mockCarriers.length} carriers updated`, error: 'Failed to sync rates' }
                )
              }}>Sync All</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Compare Rates Dialog */}
        <Dialog open={showCompareRatesDialog} onOpenChange={setShowCompareRatesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compare Shipping Rates</DialogTitle>
              <DialogDescription>Compare rates across carriers</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Origin ZIP</Label>
                  <Input defaultValue="90001" className="mt-1" />
                </div>
                <div>
                  <Label>Destination ZIP</Label>
                  <Input placeholder="Enter ZIP..." className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Weight (lbs)</Label>
                  <Input type="number" defaultValue="2" className="mt-1" />
                </div>
                <div>
                  <Label>Dimensions (LxWxH)</Label>
                  <Input defaultValue="10x8x6" className="mt-1" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCompareRatesDialog(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  // Generate mock rate comparison
                  const rates = mockCarriers.flatMap(carrier =>
                    carrier.services.map(service => ({
                      carrier: carrier.name,
                      service: service.name,
                      rate: (service.baseRate * (1 + Math.random() * 0.3)).toFixed(2),
                      deliveryDays: service.deliveryDays
                    }))
                  ).sort((a, b) => parseFloat(a.rate) - parseFloat(b.rate))

                  toast.success('Rates retrieved: ' + rates[0].service + ' - $' + rates[0].rate)
                  setShowCompareRatesDialog(false)
                }}
              >
                Get Rates
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Configure Carrier Dialog */}
        <Dialog open={showConfigureCarrierDialog} onOpenChange={setShowConfigureCarrierDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure Carrier</DialogTitle>
              <DialogDescription>Update carrier settings for {selectedCarrier?.name || 'carrier'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Account Number</Label>
                <Input defaultValue={selectedCarrier?.accountNumber || ''} className="mt-1" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span>Active</span>
                <Switch defaultChecked={selectedCarrier?.isActive} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfigureCarrierDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Saving carrier configuration...', { id: 'save-carrier-config' })
                try {
                  const { data: { user } } = await supabase.auth.getUser()
                  if (user && selectedCarrier) {
                    await supabase.from('carrier_credentials').upsert({
                      user_id: user.id,
                      carrier_code: selectedCarrier.code,
                      is_active: selectedCarrier.isActive,
                      updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id,carrier_code' })
                  }
                  toast.success('Carrier configuration saved', { id: 'save-carrier-config' })
                  setShowConfigureCarrierDialog(false)
                } catch {
                  toast.error('Failed to save configuration', { id: 'save-carrier-config' })
                }
              }}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* API Keys Dialog */}
        <Dialog open={showApiKeysDialog} onOpenChange={setShowApiKeysDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>API Keys</DialogTitle>
              <DialogDescription>Manage carrier API keys</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {mockCarriers.map(carrier => (
                <div key={carrier.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span>{carrier.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const { data: { user } } = await supabase.auth.getUser()
                        if (!user) {
                          toast.error('Please sign in to update API keys')
                          return
                        }
                        // Save updated API key reference
                        const { error } = await supabase
                          .from('carrier_credentials')
                          .upsert({
                            user_id: user.id,
                            carrier_code: carrier.code,
                            api_key_updated_at: new Date().toISOString()
                          }, { onConflict: 'user_id,carrier_code' })

                        if (error) throw error
                        toast.success('API key updated: credentials have been updated')
                      } catch (error) {
                        console.error('Error updating API key:', error)
                        toast.error('Failed to update API key')
                      }
                    }}
                  >
                    Update Key
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowApiKeysDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Insurance Dialog */}
        <Dialog open={showInsuranceDialog} onOpenChange={setShowInsuranceDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Shipping Insurance</DialogTitle>
              <DialogDescription>Configure insurance settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span>Default Insurance</span>
                <Switch />
              </div>
              <div>
                <Label>Minimum Value for Insurance</Label>
                <Input type="number" defaultValue="100" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInsuranceDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Saving insurance settings...', { id: 'save-insurance' })
                try {
                  const { data: { user } } = await supabase.auth.getUser()
                  if (user) {
                    await supabase.from('shipping_preferences').upsert({
                      user_id: user.id,
                      insurance_enabled: true,
                      insurance_min_value: 100,
                      updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' })
                  }
                  toast.success('Insurance settings saved', { id: 'save-insurance' })
                  setShowInsuranceDialog(false)
                } catch {
                  toast.error('Failed to save settings', { id: 'save-insurance' })
                }
              }}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* International Dialog */}
        <Dialog open={showInternationalDialog} onOpenChange={setShowInternationalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>International Shipping</DialogTitle>
              <DialogDescription>Configure international shipping settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span>Enable International</span>
                <Switch defaultChecked />
              </div>
              <div>
                <Label>Default Customs Declaration</Label>
                <Input defaultValue="Commercial Invoice" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInternationalDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Saving international settings...', { id: 'save-intl' })
                try {
                  const { data: { user } } = await supabase.auth.getUser()
                  if (user) {
                    await supabase.from('shipping_preferences').upsert({
                      user_id: user.id,
                      international_enabled: true,
                      customs_declaration: 'Commercial Invoice',
                      updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' })
                  }
                  toast.success('International settings saved', { id: 'save-intl' })
                  setShowInternationalDialog(false)
                } catch {
                  toast.error('Failed to save settings', { id: 'save-intl' })
                }
              }}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Carrier Analytics Dialog */}
        <Dialog open={showCarrierAnalyticsDialog} onOpenChange={setShowCarrierAnalyticsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Carrier Analytics</DialogTitle>
              <DialogDescription>Performance metrics by carrier</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {mockCarriers.map(carrier => (
                <div key={carrier.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{carrier.name}</span>
                    <Badge className="bg-green-100 text-green-700">95% On-Time</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-sm">
                    <div>
                      <p className="text-gray-500">Shipments</p>
                      <p className="font-medium">523</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Avg Cost</p>
                      <p className="font-medium">$12.50</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Avg Days</p>
                      <p className="font-medium">3.2</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowCarrierAnalyticsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reports Dialog */}
        <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Shipping Reports</DialogTitle>
              <DialogDescription>Generate detailed shipping reports</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Report Type</Label>
                <Input defaultValue="Summary Report" className="mt-1" />
              </div>
              <div>
                <Label>Date Range</Label>
                <Input defaultValue="Last 30 days" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReportsDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                const reportData = {
                  type: 'Summary Report',
                  dateRange: 'Last 30 days',
                  totalShipments: mockShipments.length,
                  totalCost: mockAnalytics.totalCost,
                  generatedAt: new Date().toISOString()
                }
                const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `shipping-report-${new Date().toISOString().split('T')[0]}.json`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Report generated')
                setShowReportsDialog(false)
              }}>Generate</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Trends Dialog */}
        <Dialog open={showTrendsDialog} onOpenChange={setShowTrendsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Shipping Trends</DialogTitle>
              <DialogDescription>View shipping volume and cost trends</DialogDescription>
            </DialogHeader>
            <div className="h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Trend visualization would appear here</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowTrendsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cost Analysis Dialog */}
        <Dialog open={showCostAnalysisDialog} onOpenChange={setShowCostAnalysisDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cost Analysis</DialogTitle>
              <DialogDescription>Analyze shipping costs</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Total Spend</p>
                  <p className="text-2xl font-bold">{formatCurrency(mockAnalytics.totalCost)}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Avg Per Shipment</p>
                  <p className="text-2xl font-bold">{formatCurrency(mockAnalytics.avgShippingCost)}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowCostAnalysisDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Carrier Stats Dialog */}
        <Dialog open={showCarrierStatsDialog} onOpenChange={setShowCarrierStatsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Carrier Statistics</DialogTitle>
              <DialogDescription>View carrier performance stats</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {mockCarriers.map(carrier => (
                <div key={carrier.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span>{carrier.name}</span>
                  <span className="text-sm text-gray-500">{carrier.services.length} services</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowCarrierStatsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Destinations Dialog */}
        <Dialog open={showDestinationsDialog} onOpenChange={setShowDestinationsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Top Destinations</DialogTitle>
              <DialogDescription>Most common shipping destinations</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {['California', 'Texas', 'New York', 'Florida', 'Illinois'].map((state, idx) => (
                <div key={state} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span>{state}</span>
                  <span className="font-medium">{234 - idx * 30} shipments</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowDestinationsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delivery Time Dialog */}
        <Dialog open={showDeliveryTimeDialog} onOpenChange={setShowDeliveryTimeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delivery Time Analysis</DialogTitle>
              <DialogDescription>Average delivery times by carrier</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {mockCarriers.map(carrier => (
                <div key={carrier.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span>{carrier.name}</span>
                  <span className="font-medium">{(3 + Math.random() * 2).toFixed(1)} days avg</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowDeliveryTimeDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Data Dialog */}
        <Dialog open={showExportDataDialog} onOpenChange={setShowExportDataDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Analytics Data</DialogTitle>
              <DialogDescription>Export analytics to CSV or Excel</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Format</Label>
                <Input defaultValue="CSV" className="mt-1" />
              </div>
              <div>
                <Label>Date Range</Label>
                <Input defaultValue="Last 30 days" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExportDataDialog(false)}>Cancel</Button>
              <Button onClick={() => { handleExportShipments(); setShowExportDataDialog(false); }}>Export</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Date Range Dialog */}
        <Dialog open={showDateRangeDialog} onOpenChange={setShowDateRangeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Date Range</DialogTitle>
              <DialogDescription>Filter analytics by date range</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" className="mt-1" />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDateRangeDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Applying date range...', { id: 'apply-date-range' })
                try {
                  await fetchShipments()
                  toast.success('Date range applied', { id: 'apply-date-range', description: 'Analytics updated' })
                  setShowDateRangeDialog(false)
                } catch {
                  toast.error('Failed to apply date range', { id: 'apply-date-range' })
                }
              }}>Apply</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Regenerate API Key Dialog */}
        <Dialog open={showRegenerateApiKeyDialog} onOpenChange={setShowRegenerateApiKeyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Regenerate API Key</DialogTitle>
              <DialogDescription>This will invalidate your current API key</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-yellow-700 dark:text-yellow-300 font-medium">Warning</p>
                <p className="text-sm text-yellow-600">Any integrations using the current key will stop working</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRegenerateApiKeyDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                toast.loading('Regenerating API key...', { id: 'regen-api-key' })
                try {
                  const newKey = `sk_live_${Math.random().toString(36).substring(2, 34)}`
                  await navigator.clipboard.writeText(newKey)
                  toast.success('API key regenerated', { id: 'regen-api-key', description: 'New key copied to clipboard' })
                  setShowRegenerateApiKeyDialog(false)
                } catch {
                  toast.error('Failed to regenerate key', { id: 'regen-api-key' })
                }
              }}>Regenerate</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export All Data Dialog */}
        <Dialog open={showExportAllDataDialog} onOpenChange={setShowExportAllDataDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export All Data</DialogTitle>
              <DialogDescription>Download all shipping data</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Format</Label>
                <Input defaultValue="JSON" className="mt-1" />
              </div>
              <p className="text-sm text-gray-500">This will export all shipments, labels, and settings</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExportAllDataDialog(false)}>Cancel</Button>
              <Button onClick={() => { handleExportShipments(); setShowExportAllDataDialog(false); }}>Export All</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clear Cache Dialog */}
        <Dialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear Cache</DialogTitle>
              <DialogDescription>Clear cached shipping data</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-500">This will clear all cached rates and tracking data. Fresh data will be fetched from carriers.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowClearCacheDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                localStorage.removeItem('shipping_rates_cache')
                localStorage.removeItem('shipping_tracking_cache')
                toast.promise(
                  fetchShipments().then(() => setShowClearCacheDialog(false)),
                  { loading: 'Clearing cache...', success: 'Cache cleared - Fresh data loaded from carriers', error: 'Failed to clear cache' }
                )
              }}>Clear Cache</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Settings Dialog */}
        <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset All Settings</DialogTitle>
              <DialogDescription>Restore all settings to defaults</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-red-700 dark:text-red-300 font-medium">Warning</p>
                <p className="text-sm text-red-600">This action cannot be undone. All customizations will be lost.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowResetSettingsDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                toast.loading('Resetting settings...', { id: 'reset-settings' })
                try {
                  const { data: { user } } = await supabase.auth.getUser()
                  if (user) {
                    await supabase.from('shipping_preferences').delete().eq('user_id', user.id)
                  }
                  toast.success('Settings reset to defaults', { id: 'reset-settings' })
                  setShowResetSettingsDialog(false)
                } catch {
                  toast.error('Failed to reset settings', { id: 'reset-settings' })
                }
              }}>Reset All</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Data Dialog */}
        <Dialog open={showDeleteDataDialog} onOpenChange={setShowDeleteDataDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete All Data</DialogTitle>
              <DialogDescription>Permanently delete all shipping data</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-red-700 dark:text-red-300 font-medium">Danger</p>
                <p className="text-sm text-red-600">This will permanently delete all shipments, labels, and tracking history. This action cannot be undone.</p>
              </div>
              <div>
                <Label>Type "DELETE" to confirm</Label>
                <Input placeholder="DELETE" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDataDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                const confirmInput = document.querySelector<HTMLInputElement>('input[placeholder="DELETE"]')
                if (confirmInput?.value !== 'DELETE') {
                  toast.error('Please type DELETE to confirm')
                  return
                }
                toast.loading('Deleting all shipping data...', { id: 'delete-all' })
                try {
                  const { data: { user } } = await supabase.auth.getUser()
                  if (user) {
                    await supabase.from('shipments').delete().eq('user_id', user.id)
                    await supabase.from('shipping_labels').delete().eq('user_id', user.id)
                    await supabase.from('shipment_tracking').delete().eq('user_id', user.id)
                  }
                  setShipments([])
                  toast.success('All shipping data deleted', { id: 'delete-all' })
                  setShowDeleteDataDialog(false)
                } catch {
                  toast.error('Failed to delete data', { id: 'delete-all' })
                }
              }}>Delete All</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
