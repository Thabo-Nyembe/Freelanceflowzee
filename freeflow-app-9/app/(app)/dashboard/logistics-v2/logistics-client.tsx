'use client'

import { useState, useMemo } from 'react'
import {
  Truck, Package, MapPin, Route, Clock, CheckCircle, XCircle,
  AlertTriangle, Plus, Search, Filter, Download, RefreshCw,
  Settings, Eye, Play, Pause, Ship, Plane, ArrowRight, ArrowUpRight,
  Building2, Warehouse, Globe, DollarSign, TrendingUp, BarChart3,
  Users, Box, FileText, Calendar, Star, Navigation, Timer,
  Scale, Thermometer, ShieldCheck, Bell, Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'

// Types
type ShipmentStatus = 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception' | 'returned'
type ShipmentType = 'standard' | 'express' | 'overnight' | 'economy' | 'freight' | 'international'
type CarrierType = 'ground' | 'air' | 'sea' | 'rail' | 'courier'

interface Shipment {
  id: string
  trackingNumber: string
  orderId: string
  status: ShipmentStatus
  type: ShipmentType
  carrier: string
  carrierService: string
  origin: {
    name: string
    address: string
    city: string
    state: string
    zip: string
    country: string
  }
  destination: {
    name: string
    address: string
    city: string
    state: string
    zip: string
    country: string
  }
  weight: number
  dimensions: { length: number; width: number; height: number }
  value: number
  shippingCost: number
  insurance: number
  estimatedDelivery: string
  actualDelivery?: string
  createdAt: string
  lastUpdate: string
  events: ShipmentEvent[]
  signature?: string
  photo?: string
  notes: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  requiresSignature: boolean
  fragile: boolean
  temperature?: { min: number; max: number }
}

interface ShipmentEvent {
  id: string
  timestamp: string
  location: string
  description: string
  status: ShipmentStatus
}

interface Carrier {
  id: string
  name: string
  code: string
  type: CarrierType
  logo: string
  active: boolean
  accountNumber: string
  services: CarrierService[]
  rating: number
  onTimeRate: number
  avgTransitDays: number
  shipmentsThisMonth: number
  totalShipments: number
  avgCost: number
  regions: string[]
  features: string[]
}

interface CarrierService {
  id: string
  name: string
  code: string
  transitDays: { min: number; max: number }
  baseCost: number
  perPound: number
}

interface WarehouseLocation {
  id: string
  name: string
  code: string
  type: 'fulfillment' | 'distribution' | 'cross_dock' | 'cold_storage' | 'bonded'
  address: string
  city: string
  state: string
  country: string
  capacity: number
  usedCapacity: number
  manager: string
  phone: string
  email: string
  operatingHours: string
  zones: number
  staff: number
  ordersProcessed: number
  pickAccuracy: number
  avgFulfillmentTime: number
  active: boolean
}

interface Order {
  id: string
  orderNumber: string
  customer: string
  email: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: number
  total: number
  warehouse: string
  createdAt: string
  shipBy: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  shipment?: string
}

// Mock Data
const mockShipments: Shipment[] = [
  {
    id: '1',
    trackingNumber: 'SHP-2024-001234',
    orderId: 'ORD-5001',
    status: 'in_transit',
    type: 'express',
    carrier: 'FedEx',
    carrierService: 'Express Saver',
    origin: { name: 'Warehouse A', address: '123 Industrial Blvd', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'USA' },
    destination: { name: 'John Smith', address: '456 Oak Street', city: 'New York', state: 'NY', zip: '10001', country: 'USA' },
    weight: 5.2,
    dimensions: { length: 12, width: 8, height: 6 },
    value: 299.99,
    shippingCost: 24.99,
    insurance: 9.99,
    estimatedDelivery: '2024-12-27',
    createdAt: '2024-12-24T10:30:00Z',
    lastUpdate: '2024-12-25T14:20:00Z',
    events: [
      { id: '1', timestamp: '2024-12-25T14:20:00Z', location: 'Memphis, TN', description: 'In transit to destination', status: 'in_transit' },
      { id: '2', timestamp: '2024-12-24T18:00:00Z', location: 'Los Angeles, CA', description: 'Departed FedEx facility', status: 'in_transit' },
      { id: '3', timestamp: '2024-12-24T12:30:00Z', location: 'Los Angeles, CA', description: 'Picked up', status: 'picked_up' }
    ],
    notes: 'Handle with care',
    priority: 'high',
    requiresSignature: true,
    fragile: false
  },
  {
    id: '2',
    trackingNumber: 'SHP-2024-001235',
    orderId: 'ORD-5002',
    status: 'out_for_delivery',
    type: 'overnight',
    carrier: 'UPS',
    carrierService: 'Next Day Air',
    origin: { name: 'Warehouse B', address: '789 Commerce Dr', city: 'Chicago', state: 'IL', zip: '60601', country: 'USA' },
    destination: { name: 'Jane Doe', address: '321 Maple Ave', city: 'Boston', state: 'MA', zip: '02101', country: 'USA' },
    weight: 2.8,
    dimensions: { length: 10, width: 6, height: 4 },
    value: 189.00,
    shippingCost: 45.99,
    insurance: 5.99,
    estimatedDelivery: '2024-12-25',
    createdAt: '2024-12-24T08:00:00Z',
    lastUpdate: '2024-12-25T08:30:00Z',
    events: [
      { id: '1', timestamp: '2024-12-25T08:30:00Z', location: 'Boston, MA', description: 'Out for delivery', status: 'out_for_delivery' },
      { id: '2', timestamp: '2024-12-25T05:00:00Z', location: 'Boston, MA', description: 'Arrived at local facility', status: 'in_transit' }
    ],
    notes: '',
    priority: 'urgent',
    requiresSignature: false,
    fragile: true
  },
  {
    id: '3',
    trackingNumber: 'SHP-2024-001236',
    orderId: 'ORD-5003',
    status: 'delivered',
    type: 'standard',
    carrier: 'USPS',
    carrierService: 'Priority Mail',
    origin: { name: 'Warehouse A', address: '123 Industrial Blvd', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'USA' },
    destination: { name: 'Bob Johnson', address: '555 Pine Rd', city: 'Seattle', state: 'WA', zip: '98101', country: 'USA' },
    weight: 1.5,
    dimensions: { length: 8, width: 6, height: 3 },
    value: 59.99,
    shippingCost: 8.99,
    insurance: 0,
    estimatedDelivery: '2024-12-24',
    actualDelivery: '2024-12-24T15:45:00Z',
    createdAt: '2024-12-20T14:00:00Z',
    lastUpdate: '2024-12-24T15:45:00Z',
    events: [
      { id: '1', timestamp: '2024-12-24T15:45:00Z', location: 'Seattle, WA', description: 'Delivered', status: 'delivered' }
    ],
    notes: '',
    priority: 'normal',
    requiresSignature: false,
    fragile: false,
    signature: 'B. Johnson'
  },
  {
    id: '4',
    trackingNumber: 'SHP-2024-001237',
    orderId: 'ORD-5004',
    status: 'exception',
    type: 'express',
    carrier: 'DHL',
    carrierService: 'Express Worldwide',
    origin: { name: 'Warehouse C', address: '999 Export Way', city: 'Miami', state: 'FL', zip: '33101', country: 'USA' },
    destination: { name: 'Carlos Garcia', address: '123 Via Roma', city: 'Mexico City', state: 'CDMX', zip: '06600', country: 'Mexico' },
    weight: 8.5,
    dimensions: { length: 20, width: 15, height: 10 },
    value: 599.00,
    shippingCost: 89.99,
    insurance: 29.99,
    estimatedDelivery: '2024-12-26',
    createdAt: '2024-12-23T09:00:00Z',
    lastUpdate: '2024-12-25T10:00:00Z',
    events: [
      { id: '1', timestamp: '2024-12-25T10:00:00Z', location: 'Mexico City', description: 'Customs clearance delay', status: 'exception' }
    ],
    notes: 'International shipment - customs documents included',
    priority: 'high',
    requiresSignature: true,
    fragile: false
  },
  {
    id: '5',
    trackingNumber: 'SHP-2024-001238',
    orderId: 'ORD-5005',
    status: 'pending',
    type: 'freight',
    carrier: 'FreightCo',
    carrierService: 'LTL Ground',
    origin: { name: 'Warehouse D', address: '500 Factory Lane', city: 'Detroit', state: 'MI', zip: '48201', country: 'USA' },
    destination: { name: 'ABC Manufacturing', address: '1000 Industry Pkwy', city: 'Dallas', state: 'TX', zip: '75201', country: 'USA' },
    weight: 450.0,
    dimensions: { length: 48, width: 40, height: 48 },
    value: 15000.00,
    shippingCost: 350.00,
    insurance: 150.00,
    estimatedDelivery: '2024-12-30',
    createdAt: '2024-12-25T07:00:00Z',
    lastUpdate: '2024-12-25T07:00:00Z',
    events: [],
    notes: 'Pallet shipment - 2 pallets',
    priority: 'normal',
    requiresSignature: true,
    fragile: false
  }
]

const mockCarriers: Carrier[] = [
  {
    id: '1',
    name: 'FedEx',
    code: 'FEDEX',
    type: 'air',
    logo: '/carriers/fedex.png',
    active: true,
    accountNumber: 'FDX-123456789',
    services: [
      { id: '1', name: 'Ground', code: 'GROUND', transitDays: { min: 3, max: 7 }, baseCost: 8.99, perPound: 0.50 },
      { id: '2', name: 'Express Saver', code: 'EXPRESS', transitDays: { min: 2, max: 3 }, baseCost: 19.99, perPound: 1.25 },
      { id: '3', name: 'Priority Overnight', code: 'OVERNIGHT', transitDays: { min: 1, max: 1 }, baseCost: 39.99, perPound: 2.50 }
    ],
    rating: 4.8,
    onTimeRate: 96.5,
    avgTransitDays: 2.8,
    shipmentsThisMonth: 1250,
    totalShipments: 45000,
    avgCost: 28.50,
    regions: ['North America', 'Europe', 'Asia'],
    features: ['Real-time tracking', 'Signature confirmation', 'Insurance', 'Saturday delivery']
  },
  {
    id: '2',
    name: 'UPS',
    code: 'UPS',
    type: 'ground',
    logo: '/carriers/ups.png',
    active: true,
    accountNumber: 'UPS-987654321',
    services: [
      { id: '1', name: 'Ground', code: 'GROUND', transitDays: { min: 3, max: 5 }, baseCost: 7.99, perPound: 0.45 },
      { id: '2', name: '3 Day Select', code: '3DAY', transitDays: { min: 3, max: 3 }, baseCost: 15.99, perPound: 1.00 },
      { id: '3', name: 'Next Day Air', code: 'NDA', transitDays: { min: 1, max: 1 }, baseCost: 42.99, perPound: 2.75 }
    ],
    rating: 4.7,
    onTimeRate: 95.2,
    avgTransitDays: 3.1,
    shipmentsThisMonth: 980,
    totalShipments: 38000,
    avgCost: 24.80,
    regions: ['North America', 'Europe', 'South America'],
    features: ['UPS My Choice', 'Access Point delivery', 'Carbon neutral shipping']
  },
  {
    id: '3',
    name: 'USPS',
    code: 'USPS',
    type: 'ground',
    logo: '/carriers/usps.png',
    active: true,
    accountNumber: 'USPS-555666777',
    services: [
      { id: '1', name: 'First Class', code: 'FIRST', transitDays: { min: 2, max: 5 }, baseCost: 4.99, perPound: 0.30 },
      { id: '2', name: 'Priority Mail', code: 'PRIORITY', transitDays: { min: 1, max: 3 }, baseCost: 8.99, perPound: 0.60 },
      { id: '3', name: 'Priority Express', code: 'EXPRESS', transitDays: { min: 1, max: 2 }, baseCost: 26.99, perPound: 1.50 }
    ],
    rating: 4.3,
    onTimeRate: 91.8,
    avgTransitDays: 3.5,
    shipmentsThisMonth: 2100,
    totalShipments: 82000,
    avgCost: 12.40,
    regions: ['United States', 'APO/FPO'],
    features: ['PO Box delivery', 'Informed delivery', 'Free package pickup']
  },
  {
    id: '4',
    name: 'DHL',
    code: 'DHL',
    type: 'air',
    logo: '/carriers/dhl.png',
    active: true,
    accountNumber: 'DHL-112233445',
    services: [
      { id: '1', name: 'Express Worldwide', code: 'WORLDWIDE', transitDays: { min: 2, max: 5 }, baseCost: 49.99, perPound: 3.00 },
      { id: '2', name: 'Express 12:00', code: 'EXPRESS12', transitDays: { min: 1, max: 2 }, baseCost: 79.99, perPound: 5.00 }
    ],
    rating: 4.6,
    onTimeRate: 94.1,
    avgTransitDays: 3.2,
    shipmentsThisMonth: 450,
    totalShipments: 15000,
    avgCost: 65.20,
    regions: ['Global'],
    features: ['Customs clearance', 'Temperature controlled', 'Dangerous goods']
  }
]

const mockWarehouses: WarehouseLocation[] = [
  {
    id: '1',
    name: 'Los Angeles Fulfillment Center',
    code: 'LAX-FC1',
    type: 'fulfillment',
    address: '123 Industrial Blvd',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    capacity: 50000,
    usedCapacity: 38500,
    manager: 'Michael Chen',
    phone: '(310) 555-0100',
    email: 'lax-fc1@company.com',
    operatingHours: '24/7',
    zones: 12,
    staff: 85,
    ordersProcessed: 2450,
    pickAccuracy: 99.2,
    avgFulfillmentTime: 2.4,
    active: true
  },
  {
    id: '2',
    name: 'Chicago Distribution Hub',
    code: 'ORD-DH1',
    type: 'distribution',
    address: '789 Commerce Dr',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    capacity: 75000,
    usedCapacity: 52000,
    manager: 'Sarah Johnson',
    phone: '(312) 555-0200',
    email: 'ord-dh1@company.com',
    operatingHours: '6AM - 10PM',
    zones: 18,
    staff: 120,
    ordersProcessed: 3200,
    pickAccuracy: 98.8,
    avgFulfillmentTime: 3.1,
    active: true
  },
  {
    id: '3',
    name: 'Miami Cold Storage',
    code: 'MIA-CS1',
    type: 'cold_storage',
    address: '456 Refrigeration Way',
    city: 'Miami',
    state: 'FL',
    country: 'USA',
    capacity: 25000,
    usedCapacity: 18200,
    manager: 'Carlos Rodriguez',
    phone: '(305) 555-0300',
    email: 'mia-cs1@company.com',
    operatingHours: '24/7',
    zones: 6,
    staff: 45,
    ordersProcessed: 890,
    pickAccuracy: 99.5,
    avgFulfillmentTime: 4.2,
    active: true
  },
  {
    id: '4',
    name: 'Newark Cross-Dock',
    code: 'EWR-XD1',
    type: 'cross_dock',
    address: '321 Terminal Rd',
    city: 'Newark',
    state: 'NJ',
    country: 'USA',
    capacity: 40000,
    usedCapacity: 12000,
    manager: 'Amanda Williams',
    phone: '(973) 555-0400',
    email: 'ewr-xd1@company.com',
    operatingHours: '4AM - 12AM',
    zones: 8,
    staff: 55,
    ordersProcessed: 5600,
    pickAccuracy: 97.9,
    avgFulfillmentTime: 1.2,
    active: true
  }
]

const mockOrders: Order[] = [
  { id: '1', orderNumber: 'ORD-5001', customer: 'John Smith', email: 'john@email.com', status: 'shipped', items: 3, total: 299.99, warehouse: 'LAX-FC1', createdAt: '2024-12-24T10:00:00Z', shipBy: '2024-12-25', priority: 'high', shipment: 'SHP-2024-001234' },
  { id: '2', orderNumber: 'ORD-5002', customer: 'Jane Doe', email: 'jane@email.com', status: 'shipped', items: 2, total: 189.00, warehouse: 'ORD-DH1', createdAt: '2024-12-24T08:00:00Z', shipBy: '2024-12-24', priority: 'urgent', shipment: 'SHP-2024-001235' },
  { id: '3', orderNumber: 'ORD-5006', customer: 'Emily Brown', email: 'emily@email.com', status: 'processing', items: 5, total: 459.00, warehouse: 'LAX-FC1', createdAt: '2024-12-25T09:30:00Z', shipBy: '2024-12-26', priority: 'normal' },
  { id: '4', orderNumber: 'ORD-5007', customer: 'David Wilson', email: 'david@email.com', status: 'pending', items: 1, total: 79.99, warehouse: 'EWR-XD1', createdAt: '2024-12-25T11:00:00Z', shipBy: '2024-12-27', priority: 'low' },
  { id: '5', orderNumber: 'ORD-5008', customer: 'Lisa Anderson', email: 'lisa@email.com', status: 'processing', items: 4, total: 349.00, warehouse: 'ORD-DH1', createdAt: '2024-12-25T12:00:00Z', shipBy: '2024-12-26', priority: 'high' }
]

// Helper functions
const getStatusColor = (status: ShipmentStatus): string => {
  const colors: Record<ShipmentStatus, string> = {
    pending: 'bg-gray-100 text-gray-700 border-gray-200',
    picked_up: 'bg-blue-100 text-blue-700 border-blue-200',
    in_transit: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    out_for_delivery: 'bg-purple-100 text-purple-700 border-purple-200',
    delivered: 'bg-green-100 text-green-700 border-green-200',
    exception: 'bg-red-100 text-red-700 border-red-200',
    returned: 'bg-orange-100 text-orange-700 border-orange-200'
  }
  return colors[status]
}

const getStatusIcon = (status: ShipmentStatus) => {
  const icons: Record<ShipmentStatus, JSX.Element> = {
    pending: <Clock className="w-3 h-3" />,
    picked_up: <Package className="w-3 h-3" />,
    in_transit: <Truck className="w-3 h-3" />,
    out_for_delivery: <Navigation className="w-3 h-3" />,
    delivered: <CheckCircle className="w-3 h-3" />,
    exception: <AlertTriangle className="w-3 h-3" />,
    returned: <ArrowRight className="w-3 h-3 rotate-180" />
  }
  return icons[status]
}

const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    normal: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  }
  return colors[priority] || colors.normal
}

const getCarrierTypeIcon = (type: CarrierType) => {
  const icons: Record<CarrierType, JSX.Element> = {
    ground: <Truck className="w-4 h-4" />,
    air: <Plane className="w-4 h-4" />,
    sea: <Ship className="w-4 h-4" />,
    rail: <Route className="w-4 h-4" />,
    courier: <Zap className="w-4 h-4" />
  }
  return icons[type]
}

const getWarehouseTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    fulfillment: 'bg-blue-100 text-blue-700',
    distribution: 'bg-purple-100 text-purple-700',
    cross_dock: 'bg-green-100 text-green-700',
    cold_storage: 'bg-cyan-100 text-cyan-700',
    bonded: 'bg-orange-100 text-orange-700'
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function LogisticsClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all')

  // Computed stats
  const stats = useMemo(() => {
    const delivered = mockShipments.filter(s => s.status === 'delivered').length
    const inTransit = mockShipments.filter(s => ['in_transit', 'out_for_delivery', 'picked_up'].includes(s.status)).length
    const exceptions = mockShipments.filter(s => s.status === 'exception').length
    const pending = mockShipments.filter(s => s.status === 'pending').length
    const totalValue = mockShipments.reduce((sum, s) => sum + s.value, 0)
    const totalShipping = mockShipments.reduce((sum, s) => sum + s.shippingCost, 0)
    const avgOnTime = mockCarriers.reduce((sum, c) => sum + c.onTimeRate, 0) / mockCarriers.length
    const totalCapacity = mockWarehouses.reduce((sum, w) => sum + w.capacity, 0)
    const usedCapacity = mockWarehouses.reduce((sum, w) => sum + w.usedCapacity, 0)

    return {
      totalShipments: mockShipments.length,
      delivered,
      inTransit,
      exceptions,
      pending,
      totalValue,
      totalShipping,
      avgOnTime,
      warehouseUtilization: Math.round((usedCapacity / totalCapacity) * 100),
      activeCarriers: mockCarriers.filter(c => c.active).length,
      pendingOrders: mockOrders.filter(o => o.status === 'pending' || o.status === 'processing').length
    }
  }, [])

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return mockShipments.filter(shipment => {
      const matchesSearch = searchQuery === '' ||
        shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.orderId.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:bg-none dark:bg-gray-900">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Logistics & Shipping
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  ShipStation-level shipping and fulfillment management
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Shipment
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Total Shipments', value: stats.totalShipments.toString(), icon: Package, gradient: 'from-blue-500 to-cyan-600' },
              { label: 'In Transit', value: stats.inTransit.toString(), icon: Truck, gradient: 'from-yellow-500 to-orange-600' },
              { label: 'Delivered', value: stats.delivered.toString(), icon: CheckCircle, gradient: 'from-green-500 to-emerald-600' },
              { label: 'Exceptions', value: stats.exceptions.toString(), icon: AlertTriangle, gradient: 'from-red-500 to-pink-600' },
              { label: 'On-Time Rate', value: `${stats.avgOnTime.toFixed(1)}%`, icon: Timer, gradient: 'from-purple-500 to-indigo-600' },
              { label: 'Warehouse Usage', value: `${stats.warehouseUtilization}%`, icon: Warehouse, gradient: 'from-cyan-500 to-blue-600' },
              { label: 'Active Carriers', value: stats.activeCarriers.toString(), icon: Globe, gradient: 'from-pink-500 to-rose-600' },
              { label: 'Pending Orders', value: stats.pendingOrders.toString(), icon: FileText, gradient: 'from-orange-500 to-amber-600' }
            ].map((stat, index) => (
              <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.gradient} mb-3`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
              <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="shipments" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                <Package className="w-4 h-4 mr-2" />
                Shipments
              </TabsTrigger>
              <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                <FileText className="w-4 h-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="carriers" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                <Globe className="w-4 h-4 mr-2" />
                Carriers
              </TabsTrigger>
              <TabsTrigger value="warehouses" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                <Warehouse className="w-4 h-4 mr-2" />
                Warehouses
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Shipments */}
                <Card className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-indigo-600" />
                      Recent Shipments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {mockShipments.slice(0, 5).map((shipment) => (
                          <div key={shipment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                {getStatusIcon(shipment.status)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{shipment.trackingNumber}</p>
                                <p className="text-sm text-gray-500">{shipment.destination.name} • {shipment.destination.city}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(shipment.status)}>{shipment.status.replace('_', ' ')}</Badge>
                              <p className="text-xs text-gray-500 mt-1">{formatDateTime(shipment.lastUpdate)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Carrier Performance */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Carrier Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockCarriers.map((carrier) => (
                        <div key={carrier.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getCarrierTypeIcon(carrier.type)}
                              <span className="font-medium text-gray-900 dark:text-white">{carrier.name}</span>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{carrier.onTimeRate}%</span>
                          </div>
                          <Progress value={carrier.onTimeRate} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Warehouse Overview */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    Warehouse Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mockWarehouses.map((warehouse) => (
                      <div key={warehouse.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={getWarehouseTypeColor(warehouse.type)}>{warehouse.type.replace('_', ' ')}</Badge>
                          <div className={`w-2 h-2 rounded-full ${warehouse.active ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{warehouse.name}</h4>
                        <p className="text-xs text-gray-500 mb-3">{warehouse.city}, {warehouse.state}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Capacity</span>
                            <span className="font-medium">{Math.round((warehouse.usedCapacity / warehouse.capacity) * 100)}%</span>
                          </div>
                          <Progress value={(warehouse.usedCapacity / warehouse.capacity) * 100} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{warehouse.ordersProcessed} orders/day</span>
                            <span>{warehouse.pickAccuracy}% accuracy</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shipments Tab */}
            <TabsContent value="shipments" className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by tracking number, order ID, or recipient..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'pending', 'in_transit', 'out_for_delivery', 'delivered', 'exception'] as const).map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className={statusFilter === status ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : ''}
                    >
                      {status === 'all' ? 'All' : status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Shipments List */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredShipments.map((shipment) => (
                        <Dialog key={shipment.id}>
                          <DialogTrigger asChild>
                            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                  <div className={`p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600`}>
                                    <Package className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-gray-900 dark:text-white">{shipment.trackingNumber}</span>
                                      <Badge className={getStatusColor(shipment.status)}>{shipment.status.replace('_', ' ')}</Badge>
                                      <Badge className={getPriorityColor(shipment.priority)}>{shipment.priority}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {shipment.origin.city} → {shipment.destination.city} • {shipment.carrier} {shipment.carrierService}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Order: {shipment.orderId} • {shipment.destination.name}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(shipment.value)}</p>
                                  <p className="text-xs text-gray-500">ETA: {formatDate(shipment.estimatedDelivery)}</p>
                                  <div className="flex items-center gap-2 mt-2 justify-end">
                                    {shipment.requiresSignature && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                                    {shipment.fragile && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                                    {shipment.temperature && <Thermometer className="w-4 h-4 text-cyan-500" />}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Shipment Details</DialogTitle>
                              <DialogDescription>{shipment.trackingNumber}</DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[60vh]">
                              <div className="space-y-6 p-4">
                                {/* Status */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                  <div>
                                    <p className="text-sm text-gray-500">Current Status</p>
                                    <Badge className={`mt-1 ${getStatusColor(shipment.status)}`}>
                                      {getStatusIcon(shipment.status)}
                                      <span className="ml-1">{shipment.status.replace('_', ' ')}</span>
                                    </Badge>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{formatDate(shipment.estimatedDelivery)}</p>
                                  </div>
                                </div>

                                {/* Route */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <p className="text-sm text-gray-500 mb-2">Origin</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{shipment.origin.name}</p>
                                    <p className="text-sm text-gray-600">{shipment.origin.address}</p>
                                    <p className="text-sm text-gray-600">{shipment.origin.city}, {shipment.origin.state} {shipment.origin.zip}</p>
                                  </div>
                                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <p className="text-sm text-gray-500 mb-2">Destination</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{shipment.destination.name}</p>
                                    <p className="text-sm text-gray-600">{shipment.destination.address}</p>
                                    <p className="text-sm text-gray-600">{shipment.destination.city}, {shipment.destination.state} {shipment.destination.zip}</p>
                                  </div>
                                </div>

                                {/* Package Details */}
                                <div className="grid grid-cols-4 gap-4">
                                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                    <Scale className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                                    <p className="text-sm font-medium">{shipment.weight} lbs</p>
                                    <p className="text-xs text-gray-500">Weight</p>
                                  </div>
                                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                    <Box className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                                    <p className="text-sm font-medium">{shipment.dimensions.length}×{shipment.dimensions.width}×{shipment.dimensions.height}</p>
                                    <p className="text-xs text-gray-500">Dimensions</p>
                                  </div>
                                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                    <DollarSign className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                                    <p className="text-sm font-medium">{formatCurrency(shipment.value)}</p>
                                    <p className="text-xs text-gray-500">Value</p>
                                  </div>
                                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                    <Truck className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                                    <p className="text-sm font-medium">{formatCurrency(shipment.shippingCost)}</p>
                                    <p className="text-xs text-gray-500">Shipping</p>
                                  </div>
                                </div>

                                {/* Tracking History */}
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tracking History</h4>
                                  <div className="space-y-3">
                                    {shipment.events.map((event, idx) => (
                                      <div key={event.id} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                          <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                                          {idx < shipment.events.length - 1 && <div className="w-px h-full bg-gray-200" />}
                                        </div>
                                        <div className="flex-1 pb-4">
                                          <p className="font-medium text-gray-900 dark:text-white">{event.description}</p>
                                          <p className="text-sm text-gray-500">{event.location} • {formatDateTime(event.timestamp)}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Order Management
                  </CardTitle>
                  <CardDescription>Orders awaiting fulfillment and shipment</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {mockOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 dark:text-white">{order.orderNumber}</span>
                                <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                              </div>
                              <p className="text-sm text-gray-500">{order.customer} • {order.items} items</p>
                              <p className="text-xs text-gray-400">Warehouse: {order.warehouse} • Ship by: {formatDate(order.shipBy)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
                            <Badge variant="outline" className={
                              order.status === 'shipped' ? 'text-green-600 border-green-600' :
                              order.status === 'processing' ? 'text-yellow-600 border-yellow-600' :
                              order.status === 'pending' ? 'text-blue-600 border-blue-600' : ''
                            }>{order.status}</Badge>
                            {order.status === 'pending' && (
                              <Button size="sm" className="mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                Process Order
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Carriers Tab */}
            <TabsContent value="carriers" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockCarriers.map((carrier) => (
                  <Card key={carrier.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                            {getCarrierTypeIcon(carrier.type)}
                          </div>
                          <div>
                            <CardTitle>{carrier.name}</CardTitle>
                            <CardDescription>Account: {carrier.accountNumber}</CardDescription>
                          </div>
                        </div>
                        <Switch checked={carrier.active} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{carrier.onTimeRate}%</p>
                          <p className="text-xs text-gray-500">On-Time Rate</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{carrier.avgTransitDays}</p>
                          <p className="text-xs text-gray-500">Avg Days</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(carrier.avgCost)}</p>
                          <p className="text-xs text-gray-500">Avg Cost</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">This Month</span>
                          <span className="font-medium">{carrier.shipmentsThisMonth.toLocaleString()} shipments</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">All Time</span>
                          <span className="font-medium">{carrier.totalShipments.toLocaleString()} shipments</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Rating</span>
                          <span className="font-medium flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {carrier.rating}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">Services</p>
                        <div className="flex flex-wrap gap-2">
                          {carrier.services.map((service) => (
                            <Badge key={service.id} variant="outline">{service.name}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">Regions</p>
                        <div className="flex flex-wrap gap-2">
                          {carrier.regions.map((region, idx) => (
                            <Badge key={idx} className="bg-gray-100 text-gray-700">{region}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Warehouses Tab */}
            <TabsContent value="warehouses" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockWarehouses.map((warehouse) => (
                  <Card key={warehouse.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle>{warehouse.name}</CardTitle>
                            <CardDescription>{warehouse.code} • {warehouse.city}, {warehouse.state}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getWarehouseTypeColor(warehouse.type)}>{warehouse.type.replace('_', ' ')}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Capacity Utilization</span>
                            <span className="font-medium">{Math.round((warehouse.usedCapacity / warehouse.capacity) * 100)}%</span>
                          </div>
                          <Progress value={(warehouse.usedCapacity / warehouse.capacity) * 100} className="h-2" />
                          <p className="text-xs text-gray-400 mt-1">{warehouse.usedCapacity.toLocaleString()} / {warehouse.capacity.toLocaleString()} sq ft</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{warehouse.ordersProcessed}</p>
                            <p className="text-xs text-gray-500">Orders/Day</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{warehouse.pickAccuracy}%</p>
                            <p className="text-xs text-gray-500">Pick Accuracy</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{warehouse.avgFulfillmentTime}h</p>
                            <p className="text-xs text-gray-500">Avg Fulfillment</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{warehouse.staff}</p>
                            <p className="text-xs text-gray-500">Staff</p>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="w-4 h-4" />
                            <span>Manager: {warehouse.manager}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <Clock className="w-4 h-4" />
                            <span>{warehouse.operatingHours}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Shipping Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Auto-select cheapest carrier</p>
                        <p className="text-sm text-gray-500">Automatically choose the most cost-effective option</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Insurance by default</p>
                        <p className="text-sm text-gray-500">Add shipping insurance to all shipments</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Signature required</p>
                        <p className="text-sm text-gray-500">Require signature for all deliveries</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Send tracking emails</p>
                        <p className="text-sm text-gray-500">Automatically notify customers of shipment status</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notification Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Exception alerts</p>
                        <p className="text-sm text-gray-500">Get notified when shipments have issues</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Delivery confirmations</p>
                        <p className="text-sm text-gray-500">Receive alerts when packages are delivered</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Low inventory alerts</p>
                        <p className="text-sm text-gray-500">Alert when warehouse inventory is low</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Daily summary email</p>
                        <p className="text-sm text-gray-500">Receive daily shipping summary</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
