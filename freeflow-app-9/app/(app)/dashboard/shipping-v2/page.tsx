"use client"

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import {
  Package, Truck, MapPin, TrendingUp, Plus,
  Send, Eye, Download, RefreshCw, Settings,
  CheckCircle, XCircle, Clock, AlertCircle
} from 'lucide-react'

type ShipmentStatus = 'pending' | 'processing' | 'shipped' | 'in-transit' | 'delivered' | 'failed' | 'returned'
type ShippingMethod = 'standard' | 'express' | 'overnight' | 'international' | 'freight'
type ShippingCarrier = 'fedex' | 'ups' | 'usps' | 'dhl' | 'amazon' | 'local'

interface Shipment {
  id: string
  trackingNumber: string
  orderId: string
  status: ShipmentStatus
  method: ShippingMethod
  carrier: ShippingCarrier
  origin: string
  destination: string
  recipientName: string
  recipientAddress: string
  itemCount: number
  weight: number
  shippingCost: number
  insuranceValue: number
  estimatedDelivery: string
  actualDelivery?: string
  shippedDate?: string
  createdDate: string
  priority: boolean
  signature: boolean
  tags: string[]
}

const shipments: Shipment[] = [
  {
    id: 'SHP-2847',
    trackingNumber: '1Z999AA10123456784',
    orderId: 'ORD-28471',
    status: 'in-transit',
    method: 'express',
    carrier: 'ups',
    origin: 'San Francisco, CA',
    destination: 'New York, NY',
    recipientName: 'Sarah Johnson',
    recipientAddress: '123 Broadway, New York, NY 10012',
    itemCount: 3,
    weight: 12.5,
    shippingCost: 45.99,
    insuranceValue: 2500,
    estimatedDelivery: '2024-01-14T17:00:00',
    shippedDate: '2024-01-12T09:00:00',
    createdDate: '2024-01-11T14:30:00',
    priority: true,
    signature: true,
    tags: ['Priority', 'Insured', 'Signature Required']
  },
  {
    id: 'SHP-2846',
    trackingNumber: '9400111699000367891234',
    orderId: 'ORD-28462',
    status: 'delivered',
    method: 'standard',
    carrier: 'usps',
    origin: 'Chicago, IL',
    destination: 'Austin, TX',
    recipientName: 'Michael Chen',
    recipientAddress: '456 Congress Ave, Austin, TX 78701',
    itemCount: 1,
    weight: 2.8,
    shippingCost: 12.50,
    insuranceValue: 150,
    estimatedDelivery: '2024-01-10T17:00:00',
    actualDelivery: '2024-01-10T14:23:00',
    shippedDate: '2024-01-08T10:00:00',
    createdDate: '2024-01-08T09:15:00',
    priority: false,
    signature: false,
    tags: ['Standard', 'Delivered On Time']
  },
  {
    id: 'SHP-2845',
    trackingNumber: 'FDX892847561234',
    orderId: 'ORD-28453',
    status: 'processing',
    method: 'overnight',
    carrier: 'fedex',
    origin: 'Los Angeles, CA',
    destination: 'Seattle, WA',
    recipientName: 'Emily Rodriguez',
    recipientAddress: '789 Pike St, Seattle, WA 98101',
    itemCount: 5,
    weight: 18.3,
    shippingCost: 89.99,
    insuranceValue: 5000,
    estimatedDelivery: '2024-01-13T10:30:00',
    createdDate: '2024-01-12T15:00:00',
    priority: true,
    signature: true,
    tags: ['Overnight', 'High Value', 'Urgent']
  },
  {
    id: 'SHP-2844',
    trackingNumber: 'DHL123456789012',
    orderId: 'ORD-28444',
    status: 'in-transit',
    method: 'international',
    carrier: 'dhl',
    origin: 'New York, NY',
    destination: 'London, UK',
    recipientName: 'David Kim',
    recipientAddress: '10 Downing Street, London SW1A 2AA, UK',
    itemCount: 2,
    weight: 8.7,
    shippingCost: 125.00,
    insuranceValue: 3500,
    estimatedDelivery: '2024-01-18T17:00:00',
    shippedDate: '2024-01-10T08:00:00',
    createdDate: '2024-01-09T11:00:00',
    priority: false,
    signature: true,
    tags: ['International', 'Customs', 'Signature']
  },
  {
    id: 'SHP-2843',
    trackingNumber: 'TBA284756123456',
    orderId: 'ORD-28435',
    status: 'delivered',
    method: 'standard',
    carrier: 'amazon',
    origin: 'Phoenix, AZ',
    destination: 'Denver, CO',
    recipientName: 'Lisa Anderson',
    recipientAddress: '321 16th Street Mall, Denver, CO 80202',
    itemCount: 4,
    weight: 6.2,
    shippingCost: 0,
    insuranceValue: 450,
    estimatedDelivery: '2024-01-09T20:00:00',
    actualDelivery: '2024-01-09T18:45:00',
    shippedDate: '2024-01-07T09:00:00',
    createdDate: '2024-01-07T08:30:00',
    priority: false,
    signature: false,
    tags: ['Free Shipping', 'Amazon Prime', 'Delivered']
  },
  {
    id: 'SHP-2842',
    trackingNumber: 'UPS567890123456',
    orderId: 'ORD-28426',
    status: 'failed',
    method: 'express',
    carrier: 'ups',
    origin: 'Miami, FL',
    destination: 'Boston, MA',
    recipientName: 'Robert Martinez',
    recipientAddress: '555 Boylston St, Boston, MA 02116',
    itemCount: 1,
    weight: 15.6,
    shippingCost: 52.00,
    insuranceValue: 1200,
    estimatedDelivery: '2024-01-11T17:00:00',
    shippedDate: '2024-01-09T10:00:00',
    createdDate: '2024-01-08T16:45:00',
    priority: false,
    signature: false,
    tags: ['Delivery Failed', 'Address Issue', 'Reattempt']
  },
  {
    id: 'SHP-2841',
    trackingNumber: 'LOCAL789012345',
    orderId: 'ORD-28417',
    status: 'shipped',
    method: 'standard',
    carrier: 'local',
    origin: 'Portland, OR',
    destination: 'Portland, OR',
    recipientName: 'Jennifer Taylor',
    recipientAddress: '888 SW 5th Ave, Portland, OR 97204',
    itemCount: 2,
    weight: 3.4,
    shippingCost: 8.00,
    insuranceValue: 200,
    estimatedDelivery: '2024-01-13T12:00:00',
    shippedDate: '2024-01-12T11:00:00',
    createdDate: '2024-01-12T10:30:00',
    priority: false,
    signature: false,
    tags: ['Local Delivery', 'Same City']
  },
  {
    id: 'SHP-2840',
    trackingNumber: 'FREIGHT123456789',
    orderId: 'ORD-28408',
    status: 'pending',
    method: 'freight',
    carrier: 'fedex',
    origin: 'Dallas, TX',
    destination: 'Atlanta, GA',
    recipientName: 'Thomas Wright',
    recipientAddress: '200 Peachtree St, Atlanta, GA 30303',
    itemCount: 25,
    weight: 450.0,
    shippingCost: 850.00,
    insuranceValue: 25000,
    estimatedDelivery: '2024-01-20T17:00:00',
    createdDate: '2024-01-12T13:00:00',
    priority: true,
    signature: true,
    tags: ['Freight', 'Pallet', 'Commercial', 'High Value']
  }
]

const stats = [
  {
    label: 'Total Shipments',
    value: '8,947',
    change: 15.3,
    trend: 'up' as const,
    icon: Package
  },
  {
    label: 'In Transit',
    value: '2,847',
    change: 8.7,
    trend: 'up' as const,
    icon: Truck
  },
  {
    label: 'On-Time Rate',
    value: '94.2%',
    change: 3.5,
    trend: 'up' as const,
    icon: CheckCircle
  },
  {
    label: 'Avg Shipping Cost',
    value: '$28.45',
    change: -5.2,
    trend: 'down' as const,
    icon: TrendingUp
  }
]

const quickActions = [
  { label: 'Create Shipment', icon: Plus, gradient: 'from-blue-500 to-cyan-600' },
  { label: 'Track Package', icon: MapPin, gradient: 'from-green-500 to-emerald-600' },
  { label: 'Print Labels', icon: Send, gradient: 'from-purple-500 to-indigo-600' },
  { label: 'Export Data', icon: Download, gradient: 'from-orange-500 to-red-600' },
  { label: 'Carrier Settings', icon: Settings, gradient: 'from-cyan-500 to-blue-600' },
  { label: 'View Map', icon: MapPin, gradient: 'from-pink-500 to-rose-600' },
  { label: 'Schedule Pickup', icon: Clock, gradient: 'from-indigo-500 to-purple-600' },
  { label: 'Refresh', icon: RefreshCw, gradient: 'from-red-500 to-pink-600' }
]

const recentActivity = [
  { action: 'Package delivered', details: 'SHP-2846 delivered to Austin, TX', time: '1 hour ago' },
  { action: 'Shipment created', details: 'SHP-2847 overnight to New York, NY', time: '2 hours ago' },
  { action: 'Delivery failed', details: 'SHP-2842 address issue in Boston, MA', time: '3 hours ago' },
  { action: 'In transit', details: 'SHP-2844 international shipment to London', time: '1 day ago' },
  { action: 'Label printed', details: '47 shipping labels generated', time: '1 day ago' }
]

const topCarriers = [
  { name: 'FedEx', metric: '3,247 shipments' },
  { name: 'UPS', metric: '2,856 shipments' },
  { name: 'USPS', metric: '1,678 shipments' },
  { name: 'DHL', metric: '892 shipments' },
  { name: 'Amazon Logistics', metric: '274 shipments' }
]

export default function ShippingV2Page() {
  const [viewMode, setViewMode] = useState<'all' | 'in-transit' | 'delivered' | 'priority'>('all')

  const filteredShipments = shipments.filter(shipment => {
    if (viewMode === 'all') return true
    if (viewMode === 'in-transit') return shipment.status === 'in-transit'
    if (viewMode === 'delivered') return shipment.status === 'delivered'
    if (viewMode === 'priority') return shipment.priority
    return true
  })

  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'in-transit': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200'
      case 'failed': return 'bg-red-100 text-red-700 border-red-200'
      case 'returned': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: ShipmentStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />
      case 'processing': return <RefreshCw className="w-3 h-3" />
      case 'shipped': return <Send className="w-3 h-3" />
      case 'in-transit': return <Truck className="w-3 h-3" />
      case 'delivered': return <CheckCircle className="w-3 h-3" />
      case 'failed': return <XCircle className="w-3 h-3" />
      case 'returned': return <AlertCircle className="w-3 h-3" />
      default: return <Package className="w-3 h-3" />
    }
  }

  const getMethodColor = (method: ShippingMethod) => {
    switch (method) {
      case 'standard': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'express': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'overnight': return 'bg-red-50 text-red-600 border-red-100'
      case 'international': return 'bg-indigo-50 text-indigo-600 border-indigo-100'
      case 'freight': return 'bg-orange-50 text-orange-600 border-orange-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getMethodGradient = (method: ShippingMethod) => {
    switch (method) {
      case 'standard': return 'from-blue-500 to-cyan-600'
      case 'express': return 'from-purple-500 to-pink-600'
      case 'overnight': return 'from-red-500 to-orange-600'
      case 'international': return 'from-indigo-500 to-purple-600'
      case 'freight': return 'from-orange-500 to-red-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Shipping
            </h1>
            <p className="text-gray-600 mt-2">Manage shipments and track deliveries</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Shipment
          </button>
        </div>

        {/* Stats */}
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-3 flex-wrap">
          <PillButton
            label="All Shipments"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="In Transit"
            isActive={viewMode === 'in-transit'}
            onClick={() => setViewMode('in-transit')}
          />
          <PillButton
            label="Delivered"
            isActive={viewMode === 'delivered'}
            onClick={() => setViewMode('delivered')}
          />
          <PillButton
            label="Priority"
            isActive={viewMode === 'priority'}
            onClick={() => setViewMode('priority')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Shipments List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'all' && 'All Shipments'}
              {viewMode === 'in-transit' && 'In Transit Shipments'}
              {viewMode === 'delivered' && 'Delivered Shipments'}
              {viewMode === 'priority' && 'Priority Shipments'}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredShipments.length} total)
              </span>
            </h2>

            {filteredShipments.map((shipment) => (
              <div
                key={shipment.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(shipment.status)} flex items-center gap-1`}>
                        {getStatusIcon(shipment.status)}
                        {shipment.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getMethodColor(shipment.method)}`}>
                        {shipment.method}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-600 border-gray-100">
                        {shipment.carrier.toUpperCase()}
                      </span>
                      {shipment.priority && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-50 text-red-600 border-red-100">
                          Priority
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {shipment.recipientName}
                    </h3>
                    <p className="text-sm text-gray-700 mb-1">
                      {shipment.recipientAddress}
                    </p>
                    <p className="text-xs text-gray-500">
                      {shipment.id} • Tracking: {shipment.trackingNumber} • Order: {shipment.orderId}
                    </p>
                  </div>
                  <button className={`px-4 py-2 bg-gradient-to-r ${getMethodGradient(shipment.method)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}>
                    <Eye className="w-4 h-4" />
                    Track
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Origin</p>
                    <p className="text-sm font-semibold text-gray-900">{shipment.origin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Destination</p>
                    <p className="text-sm font-semibold text-gray-900">{shipment.destination}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Weight</p>
                    <p className="text-sm font-semibold text-gray-900">{shipment.weight} lbs</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Items</p>
                    <p className="text-sm font-semibold text-gray-900">{shipment.itemCount}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Estimated Delivery</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(shipment.estimatedDelivery)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        {shipment.actualDelivery ? 'Actual Delivery' : 'Shipped Date'}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {shipment.actualDelivery ? formatDate(shipment.actualDelivery) :
                         shipment.shippedDate ? formatDate(shipment.shippedDate) : 'Not yet shipped'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>Cost: {formatCurrency(shipment.shippingCost)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4 text-purple-600" />
                    <span>Insured: {formatCurrency(shipment.insuranceValue)}</span>
                  </div>
                  {shipment.signature && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Signature Required</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {shipment.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Shipping Method Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Shipping Methods</h3>
              <div className="space-y-3">
                {[
                  { method: 'standard', count: 4247, percentage: 47 },
                  { method: 'express', count: 2856, percentage: 32 },
                  { method: 'overnight', count: 1234, percentage: 14 },
                  { method: 'international', count: 456, percentage: 5 },
                  { method: 'freight', count: 154, percentage: 2 }
                ].map((item) => (
                  <div key={item.method}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{item.method}</span>
                      <span className="text-gray-900 font-semibold">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getMethodGradient(item.method as ShippingMethod)} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Carriers */}
            <RankingList
              title="Top Carriers"
              items={topCarriers}
              gradient="from-blue-500 to-cyan-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Performance Metrics */}
            <MiniKPI
              label="Failed Deliveries"
              value="1.2%"
              change={-0.8}
              trend="down"
            />

            <ProgressCard
              title="Monthly Target"
              current={8947}
              target={10000}
              label="shipments"
              gradient="from-blue-500 to-cyan-600"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
