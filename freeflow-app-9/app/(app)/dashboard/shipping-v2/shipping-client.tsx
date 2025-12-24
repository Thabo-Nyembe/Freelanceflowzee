"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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
  MoreHorizontal,
  ChevronRight,
  Box,
  Scale,
  Ruler,
  Navigation,
  Phone,
  Mail,
  Building,
  User,
  Timer,
  Activity,
  TrendingDown,
  Plane,
  Ship,
  Train,
  Home
} from 'lucide-react'

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

  // Filtered data
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
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
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
          </TabsList>

          {/* Shipments Tab */}
          <TabsContent value="shipments" className="space-y-4">
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
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Awaiting Shipment ({pendingOrders.length})
              </h3>
              <div className="flex items-center gap-2">
                {selectedOrders.length > 0 && (
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
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
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Carrier Accounts</h3>
              <Button variant="outline">
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
        </Tabs>

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
                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                      <MapPin className="w-4 h-4 mr-2" />
                      Track Package
                    </Button>
                    <Button variant="outline">
                      <Printer className="w-4 h-4 mr-2" />
                      Print Label
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
