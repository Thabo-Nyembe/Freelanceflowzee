'use client'

import { useState } from 'react'
import { useShipments, useShippingCarriers, Shipment, ShippingStats } from '@/lib/hooks/use-shipments'
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
  CheckCircle, XCircle, Clock, AlertCircle, Loader2
} from 'lucide-react'

type ShipmentStatus = 'pending' | 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled'
type ViewMode = 'all' | 'in-transit' | 'delivered' | 'priority'

interface ShippingClientProps {
  initialShipments: Shipment[]
  initialStats: ShippingStats
}

export default function ShippingClient({ initialShipments, initialStats }: ShippingClientProps) {
  const {
    shipments,
    loading,
    createShipment,
    updateShipment,
    deleteShipment,
    markAsShipped,
    markAsDelivered,
    cancelShipment,
    markAsReturned,
    getStats
  } = useShipments()

  const { carriers } = useShippingCarriers()

  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Use real-time data if available, otherwise initial data
  const displayShipments = shipments.length > 0 ? shipments : initialShipments
  const stats = shipments.length > 0 ? getStats() : initialStats

  const filteredShipments = displayShipments.filter(shipment => {
    if (viewMode === 'all') return true
    if (viewMode === 'in-transit') return shipment.status === 'in_transit' || shipment.status === 'out_for_delivery'
    if (viewMode === 'delivered') return shipment.status === 'delivered'
    if (viewMode === 'priority') return shipment.signature_required
    return true
  })

  const statItems = [
    {
      label: 'Total Shipments',
      value: stats.total.toLocaleString(),
      change: 15.3,
      trend: 'up' as const,
      icon: Package
    },
    {
      label: 'In Transit',
      value: stats.inTransit.toLocaleString(),
      change: 8.7,
      trend: 'up' as const,
      icon: Truck
    },
    {
      label: 'On-Time Rate',
      value: `${stats.onTimeRate}%`,
      change: 3.5,
      trend: 'up' as const,
      icon: CheckCircle
    },
    {
      label: 'Avg Shipping Cost',
      value: `$${(stats.totalCost / Math.max(stats.total, 1)).toFixed(2)}`,
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
    { action: 'Package delivered', details: 'Shipment delivered successfully', time: '1 hour ago' },
    { action: 'Shipment created', details: 'New overnight shipment created', time: '2 hours ago' },
    { action: 'Delivery failed', details: 'Address issue detected', time: '3 hours ago' },
    { action: 'In transit', details: 'International shipment moving', time: '1 day ago' },
    { action: 'Label printed', details: 'Shipping labels generated', time: '1 day ago' }
  ]

  const topCarriers = carriers.length > 0
    ? carriers.slice(0, 5).map(c => ({ name: c.name, metric: `${c.is_active ? 'Active' : 'Inactive'}` }))
    : [
        { name: 'FedEx', metric: '3,247 shipments' },
        { name: 'UPS', metric: '2,856 shipments' },
        { name: 'USPS', metric: '1,678 shipments' },
        { name: 'DHL', metric: '892 shipments' },
        { name: 'Amazon Logistics', metric: '274 shipments' }
      ]

  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'in_transit': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'out_for_delivery': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200'
      case 'returned': return 'bg-red-100 text-red-700 border-red-200'
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: ShipmentStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />
      case 'processing': return <RefreshCw className="w-3 h-3" />
      case 'shipped': return <Send className="w-3 h-3" />
      case 'in_transit': return <Truck className="w-3 h-3" />
      case 'out_for_delivery': return <Truck className="w-3 h-3" />
      case 'delivered': return <CheckCircle className="w-3 h-3" />
      case 'returned': return <AlertCircle className="w-3 h-3" />
      case 'cancelled': return <XCircle className="w-3 h-3" />
      default: return <Package className="w-3 h-3" />
    }
  }

  const getMethodGradient = (method: string | null) => {
    switch (method) {
      case 'standard': return 'from-blue-500 to-cyan-600'
      case 'express': return 'from-purple-500 to-pink-600'
      case 'overnight': return 'from-red-500 to-orange-600'
      case 'international': return 'from-indigo-500 to-purple-600'
      case 'freight': return 'from-orange-500 to-red-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const handleCreateShipment = async () => {
    try {
      await createShipment({
        status: 'pending',
        shipping_method: 'standard',
        origin_address: {
          name: 'Warehouse',
          street1: '123 Main St',
          city: 'Los Angeles',
          state: 'CA',
          postal_code: '90001',
          country: 'US'
        },
        destination_address: {
          name: 'Customer',
          street1: '456 Oak Ave',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'US'
        },
        package_details: { type: 'box', items_count: 1 },
        weight_unit: 'lb',
        shipping_cost: 0,
        insurance_cost: 0,
        total_cost: 0,
        currency: 'USD',
        signature_required: false,
        labels: [],
        metadata: {}
      })
    } catch (error) {
      console.error('Failed to create shipment:', error)
    }
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
          <button
            onClick={handleCreateShipment}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Create Shipment
          </button>
        </div>

        {/* Stats */}
        <StatGrid stats={statItems} />

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

            {loading && filteredShipments.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredShipments.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No shipments found</p>
              </div>
            ) : (
              filteredShipments.map((shipment) => (
                <div
                  key={shipment.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(shipment.status as ShipmentStatus)} flex items-center gap-1`}>
                          {getStatusIcon(shipment.status as ShipmentStatus)}
                          {shipment.status.replace('_', ' ')}
                        </span>
                        {shipment.shipping_method && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-600 border-blue-100">
                            {shipment.shipping_method}
                          </span>
                        )}
                        {shipment.carrier_name && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-600 border-gray-100">
                            {shipment.carrier_name}
                          </span>
                        )}
                        {shipment.signature_required && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-50 text-red-600 border-red-100">
                            Signature Required
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {shipment.destination_address?.name || 'Unknown Recipient'}
                      </h3>
                      <p className="text-sm text-gray-700 mb-1">
                        {shipment.destination_address?.street1}, {shipment.destination_address?.city}, {shipment.destination_address?.state}
                      </p>
                      <p className="text-xs text-gray-500">
                        {shipment.shipment_code || shipment.id.slice(0, 8)} • {shipment.tracking_number ? `Tracking: ${shipment.tracking_number}` : 'No tracking'}
                      </p>
                    </div>
                    <button className={`px-4 py-2 bg-gradient-to-r ${getMethodGradient(shipment.shipping_method)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}>
                      <Eye className="w-4 h-4" />
                      Track
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Origin</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {shipment.origin_address?.city || 'N/A'}, {shipment.origin_address?.state || ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Destination</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {shipment.destination_address?.city || 'N/A'}, {shipment.destination_address?.state || ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Weight</p>
                      <p className="text-sm font-semibold text-gray-900">{shipment.weight || 0} {shipment.weight_unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Items</p>
                      <p className="text-sm font-semibold text-gray-900">{shipment.package_details?.items_count || 1}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Estimated Delivery</p>
                        <p className="text-sm font-semibold text-gray-900">{formatDate(shipment.estimated_delivery)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">
                          {shipment.actual_delivery ? 'Actual Delivery' : 'Shipped Date'}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {shipment.actual_delivery ? formatDate(shipment.actual_delivery) :
                           shipment.shipped_at ? formatDate(shipment.shipped_at) : 'Not yet shipped'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span>Cost: {formatCurrency(shipment.total_cost || 0)}</span>
                    </div>
                    {shipment.insurance_value && (
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4 text-purple-600" />
                        <span>Insured: {formatCurrency(shipment.insurance_value)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    {shipment.status === 'pending' && (
                      <button
                        onClick={() => markAsShipped(shipment.id)}
                        className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors"
                      >
                        Mark Shipped
                      </button>
                    )}
                    {(shipment.status === 'shipped' || shipment.status === 'in_transit') && (
                      <button
                        onClick={() => markAsDelivered(shipment.id)}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {shipment.status !== 'delivered' && shipment.status !== 'cancelled' && (
                      <button
                        onClick={() => cancelShipment(shipment.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Shipping Method Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Shipping Methods</h3>
              <div className="space-y-3">
                {[
                  { method: 'standard', count: stats.pending + stats.shipped, percentage: 47 },
                  { method: 'express', count: stats.inTransit, percentage: 32 },
                  { method: 'overnight', count: stats.delivered, percentage: 14 },
                  { method: 'international', count: stats.returned, percentage: 5 },
                  { method: 'freight', count: stats.cancelled, percentage: 2 }
                ].map((item) => (
                  <div key={item.method}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{item.method}</span>
                      <span className="text-gray-900 font-semibold">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getMethodGradient(item.method)} rounded-full`}
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
              value={`${((stats.cancelled / Math.max(stats.total, 1)) * 100).toFixed(1)}%`}
              change={-0.8}
              trend="down"
            />

            <ProgressCard
              title="Monthly Target"
              current={stats.total}
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
