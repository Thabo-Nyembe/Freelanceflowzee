"use client"

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
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

const mockShippingQuickActions = [
  { id: '1', label: 'Create Shipment', icon: 'plus', action: () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 900)),
      {
        loading: 'Creating new shipment...',
        success: 'Shipment created - Ready for label generation',
        error: 'Failed to create shipment'
      }
    )
  }, variant: 'default' as const },
  { id: '2', label: 'Print Labels', icon: 'printer', action: () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: 'Generating shipping labels...',
        success: 'Shipping labels ready to print',
        error: 'Failed to generate labels'
      }
    )
  }, variant: 'outline' as const },
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
  const supabase = createClient()
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

  // Dialog states for button functionality
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [showLabelPreviewDialog, setShowLabelPreviewDialog] = useState(false)
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [showAddCarrierDialog, setShowAddCarrierDialog] = useState(false)
  const [showConfigureCarrierDialog, setShowConfigureCarrierDialog] = useState(false)
  const [showSaveOriginDialog, setShowSaveOriginDialog] = useState(false)
  const [showConfigureIntegrationDialog, setShowConfigureIntegrationDialog] = useState(false)
  const [showCopyApiKeyDialog, setShowCopyApiKeyDialog] = useState(false)
  const [showRegenerateKeyDialog, setShowRegenerateKeyDialog] = useState(false)
  const [showExportDataDialog, setShowExportDataDialog] = useState(false)
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showDeleteDataDialog, setShowDeleteDataDialog] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null)
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<{ name: string; status: string } | null>(null)

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
  }, [supabase])

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
      toast.success('Label ready', {
        description: `Shipping label for ${shipment.trackingNumber} is ready to print`
      })
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
      toast.info('Tracking', {
        description: `Opening tracking for ${shipment.trackingNumber}`
      })
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

      toast.success('Batch shipment created', {
        description: `${selectedOrders.length} orders queued for shipment`
      })
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

      toast.info('Shipment cancelled', {
        description: `Shipment ${trackingNumber} has been cancelled`
      })
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

      toast.success('Exporting shipments', {
        description: 'Shipping report downloaded'
      })
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
                  <div className="hidden md:grid grid-cols-3 gap-6 text-center">
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
                { icon: Plus, label: 'New Shipment', color: 'bg-blue-500' },
                { icon: Upload, label: 'Bulk Import', color: 'bg-green-500' },
                { icon: Printer, label: 'Print Labels', color: 'bg-purple-500' },
                { icon: MapPin, label: 'Track All', color: 'bg-orange-500' },
                { icon: Archive, label: 'Batch Update', color: 'bg-pink-500' },
                { icon: Download, label: 'Export', color: 'bg-indigo-500' },
                { icon: RefreshCw, label: 'Sync Status', color: 'bg-teal-500' },
                { icon: AlertCircle, label: 'Exceptions', color: 'bg-red-500' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
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
                  <div className="hidden md:grid grid-cols-3 gap-6 text-center">
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
                { icon: Printer, label: 'Batch Labels', color: 'bg-blue-500' },
                { icon: Package, label: 'Pack All', color: 'bg-green-500' },
                { icon: Truck, label: 'Ship Selected', color: 'bg-purple-500' },
                { icon: Clock, label: 'Priority First', color: 'bg-orange-500' },
                { icon: Search, label: 'Find Order', color: 'bg-pink-500' },
                { icon: Filter, label: 'Filter', color: 'bg-indigo-500' },
                { icon: Download, label: 'Export', color: 'bg-teal-500' },
                { icon: RefreshCw, label: 'Refresh', color: 'bg-gray-500' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
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

                        <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <div className="hidden md:grid grid-cols-3 gap-6 text-center">
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
                { icon: Search, label: 'Track Number', color: 'bg-blue-500' },
                { icon: Globe, label: 'Map View', color: 'bg-green-500' },
                { icon: Bell, label: 'Alerts', color: 'bg-purple-500' },
                { icon: Clock, label: 'Timeline', color: 'bg-orange-500' },
                { icon: Mail, label: 'Notify Customer', color: 'bg-pink-500' },
                { icon: RefreshCw, label: 'Refresh All', color: 'bg-indigo-500' },
                { icon: Download, label: 'Export', color: 'bg-teal-500' },
                { icon: AlertCircle, label: 'Exceptions', color: 'bg-red-500' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
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
                  <Input placeholder="Enter tracking number..." className="flex-1" />
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
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
                  <div className="hidden md:grid grid-cols-3 gap-6 text-center">
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
                { icon: Plus, label: 'Create Label', color: 'bg-blue-500' },
                { icon: Printer, label: 'Batch Print', color: 'bg-green-500' },
                { icon: Download, label: 'Download All', color: 'bg-purple-500' },
                { icon: XCircle, label: 'Void Label', color: 'bg-red-500' },
                { icon: Copy, label: 'Duplicate', color: 'bg-orange-500' },
                { icon: Search, label: 'Find', color: 'bg-pink-500' },
                { icon: History, label: 'History', color: 'bg-indigo-500' },
                { icon: Settings, label: 'Settings', color: 'bg-gray-500' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
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
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
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
                          <Button variant="outline" size="sm" onClick={() => { setSelectedLabel(label); setShowLabelPreviewDialog(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { window.open(label.labelUrl, '_blank'); toast.success('Downloading label...'); }}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setSelectedLabel(label); setShowPrintDialog(true); }}>
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
                  <div className="hidden md:grid grid-cols-3 gap-6 text-center">
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
                { icon: Plus, label: 'Add Carrier', color: 'bg-blue-500' },
                { icon: RefreshCw, label: 'Sync Rates', color: 'bg-green-500' },
                { icon: DollarSign, label: 'Compare Rates', color: 'bg-purple-500' },
                { icon: Settings, label: 'Configure', color: 'bg-orange-500' },
                { icon: Key, label: 'API Keys', color: 'bg-pink-500' },
                { icon: Shield, label: 'Insurance', color: 'bg-indigo-500' },
                { icon: Globe, label: 'International', color: 'bg-teal-500' },
                { icon: BarChart3, label: 'Analytics', color: 'bg-gray-500' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
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
                  <div className="hidden md:grid grid-cols-3 gap-6 text-center">
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
                { icon: BarChart3, label: 'Reports', color: 'bg-blue-500' },
                { icon: TrendingUp, label: 'Trends', color: 'bg-green-500' },
                { icon: DollarSign, label: 'Cost Analysis', color: 'bg-purple-500' },
                { icon: Truck, label: 'Carrier Stats', color: 'bg-orange-500' },
                { icon: Globe, label: 'Destinations', color: 'bg-pink-500' },
                { icon: Timer, label: 'Delivery Time', color: 'bg-indigo-500' },
                { icon: Download, label: 'Export Data', color: 'bg-teal-500' },
                { icon: Calendar, label: 'Date Range', color: 'bg-gray-500' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200"
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
                  <div className="grid grid-cols-4 gap-6">
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
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Default Weight Unit</Label>
                            <Input defaultValue="lb" className="mt-1" />
                          </div>
                          <div>
                            <Label>Default Dimension Unit</Label>
                            <Input defaultValue="in" className="mt-1" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-3 gap-4">
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
                        <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white" onClick={() => { toast.success('Origin address saved'); }}>
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
                              <Button variant="outline" size="sm" onClick={() => { setSelectedIntegration(integration); setShowConfigureIntegrationDialog(true); }}>
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
                        <Button variant="outline" onClick={() => setShowRegenerateKeyDialog(true)}>
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
                          <Button variant="outline" onClick={() => setShowExportDataDialog(true)}>
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
              onInsightAction={(_insight) => console.log('Insight action:', insight)}
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-3 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-2 gap-6">
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

                  <div className="grid grid-cols-4 gap-4">
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

                  <div className="grid grid-cols-2 gap-4 text-sm">
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
                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white" onClick={() => { if (selectedShipment?.trackingNumber) { window.open(`https://track.example.com/${selectedShipment.trackingNumber}`, '_blank'); } else { toast.info('No tracking number available'); } }}>
                      <MapPin className="w-4 h-4 mr-2" />
                      Track Package
                    </Button>
                    <Button variant="outline" onClick={() => { if (selectedShipment?.labelUrl) { setShowPrintDialog(true); } else { toast.info('No label available'); } }}>
                      <Printer className="w-4 h-4 mr-2" />
                      Print Label
                    </Button>
                    <Button variant="outline" onClick={() => { if (selectedShipment?.labelUrl) { window.open(selectedShipment.labelUrl, '_blank'); toast.success('Downloading label...'); } else { toast.info('No label available'); } }}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Filters Dialog */}
        <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Shipments</DialogTitle>
              <DialogDescription>Apply filters to narrow down your shipments</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <select className="w-full mt-1 p-2 border rounded-lg">
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div>
                <Label>Carrier</Label>
                <select className="w-full mt-1 p-2 border rounded-lg">
                  <option value="all">All Carriers</option>
                  <option value="fedex">FedEx</option>
                  <option value="ups">UPS</option>
                  <option value="usps">USPS</option>
                </select>
              </div>
              <div>
                <Label>Date Range</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="date" className="flex-1" />
                  <Input type="date" className="flex-1" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowFiltersDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowFiltersDialog(false); toast.success('Filters applied'); }}>Apply Filters</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Label Preview Dialog */}
        <Dialog open={showLabelPreviewDialog} onOpenChange={setShowLabelPreviewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Label Preview</DialogTitle>
              <DialogDescription>Preview and print your shipping label</DialogDescription>
            </DialogHeader>
            {selectedLabel && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 text-center">
                  <p className="text-sm text-gray-500 mb-2">Tracking Number</p>
                  <p className="font-mono text-lg">{selectedLabel.trackingNumber}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Carrier:</span> {selectedLabel.carrier}</div>
                  <div><span className="text-gray-500">Service:</span> {selectedLabel.service}</div>
                  <div><span className="text-gray-500">Cost:</span> {formatCurrency(selectedLabel.cost)}</div>
                  <div><span className="text-gray-500">Format:</span> {selectedLabel.format}</div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowLabelPreviewDialog(false)}>Close</Button>
              <Button onClick={() => { window.print(); toast.success('Printing label...'); }}>Print</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Print Dialog */}
        <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Print Label</DialogTitle>
              <DialogDescription>Configure print settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Printer</Label>
                <select className="w-full mt-1 p-2 border rounded-lg">
                  <option>Default Printer</option>
                  <option>Thermal Label Printer</option>
                  <option>Office Printer</option>
                </select>
              </div>
              <div>
                <Label>Copies</Label>
                <Input type="number" defaultValue={1} min={1} className="mt-1" />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="include-packing" />
                <Label htmlFor="include-packing">Include packing slip</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowPrintDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowPrintDialog(false); window.print(); toast.success('Printing...'); }}>Print</Button>
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
            <div className="space-y-4">
              <div>
                <Label>Carrier</Label>
                <select className="w-full mt-1 p-2 border rounded-lg">
                  <option>FedEx</option>
                  <option>UPS</option>
                  <option>USPS</option>
                  <option>DHL</option>
                  <option>Canada Post</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <Label>Account Number</Label>
                <Input placeholder="Enter account number" className="mt-1" />
              </div>
              <div>
                <Label>API Key</Label>
                <Input type="password" placeholder="Enter API key" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddCarrierDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowAddCarrierDialog(false); toast.success('Carrier added successfully'); }}>Add Carrier</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Configure Carrier Dialog */}
        <Dialog open={showConfigureCarrierDialog} onOpenChange={setShowConfigureCarrierDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure {selectedCarrier?.name}</DialogTitle>
              <DialogDescription>Update carrier settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Account Number</Label>
                <Input defaultValue={selectedCarrier?.accountNumber || ''} className="mt-1" />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch defaultChecked={selectedCarrier?.isActive} />
              </div>
              <div>
                <Label>Default Service</Label>
                <select className="w-full mt-1 p-2 border rounded-lg">
                  {selectedCarrier?.services.map(service => (
                    <option key={service.id} value={service.code}>{service.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowConfigureCarrierDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowConfigureCarrierDialog(false); toast.success('Carrier updated'); }}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Configure Integration Dialog */}
        <Dialog open={showConfigureIntegrationDialog} onOpenChange={setShowConfigureIntegrationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedIntegration?.status === 'connected' ? 'Configure' : 'Connect'} {selectedIntegration?.name}</DialogTitle>
              <DialogDescription>Manage integration settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedIntegration?.status !== 'connected' && (
                <>
                  <div>
                    <Label>API Key</Label>
                    <Input type="password" placeholder="Enter API key" className="mt-1" />
                  </div>
                  <div>
                    <Label>Store URL</Label>
                    <Input placeholder="https://your-store.com" className="mt-1" />
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <Label>Auto-sync orders</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Import tracking to store</Label>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowConfigureIntegrationDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowConfigureIntegrationDialog(false); toast.success('Integration saved'); }}>
                {selectedIntegration?.status === 'connected' ? 'Save Changes' : 'Connect'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Regenerate API Key Dialog */}
        <Dialog open={showRegenerateKeyDialog} onOpenChange={setShowRegenerateKeyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Regenerate API Key</DialogTitle>
              <DialogDescription>This will invalidate your current API key</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Warning: Regenerating your API key will immediately invalidate the current key. Any applications using the old key will stop working.
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowRegenerateKeyDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { setShowRegenerateKeyDialog(false); toast.success('New API key generated'); }}>Regenerate Key</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Data Dialog */}
        <Dialog open={showExportDataDialog} onOpenChange={setShowExportDataDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Data</DialogTitle>
              <DialogDescription>Download your shipping data</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <select className="w-full mt-1 p-2 border rounded-lg">
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div>
                <Label>Date Range</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="date" className="flex-1" />
                  <Input type="date" className="flex-1" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="include-tracking" defaultChecked />
                <Label htmlFor="include-tracking">Include tracking history</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowExportDataDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowExportDataDialog(false); toast.success('Export started. You will receive an email when complete.'); }}>Export Data</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clear Cache Dialog */}
        <Dialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear Cache</DialogTitle>
              <DialogDescription>Remove cached shipping rates and data</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                This will clear all cached rate quotes and temporary data. Rate lookups may be slower until the cache is rebuilt.
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowClearCacheDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { setShowClearCacheDialog(false); toast.success('Cache cleared successfully'); }}>Clear Cache</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Settings Dialog */}
        <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset All Settings</DialogTitle>
              <DialogDescription>This will restore all settings to their default values</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                Warning: This action cannot be undone. All your custom settings, preferences, and configurations will be reset to defaults.
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowResetSettingsDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { setShowResetSettingsDialog(false); toast.success('Settings reset to defaults'); }}>Reset Settings</Button>
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
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg space-y-2">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                ⚠️ This action is permanent and cannot be undone!
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                All shipments, labels, tracking history, and related data will be permanently deleted.
              </p>
            </div>
            <div className="space-y-2 mt-4">
              <Label>Type DELETE to confirm</Label>
              <Input placeholder="DELETE" className="mt-1" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteDataDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { setShowDeleteDataDialog(false); toast.success('All data deleted'); }}>Delete All Data</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
