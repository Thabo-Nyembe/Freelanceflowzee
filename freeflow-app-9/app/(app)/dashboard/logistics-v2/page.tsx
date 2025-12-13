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
  MapPin, Truck, Package, TrendingUp, Plus,
  Route, Eye, Download, RefreshCw, Settings,
  CheckCircle, XCircle, Clock, AlertTriangle
} from 'lucide-react'

type RouteStatus = 'planned' | 'in-progress' | 'completed' | 'delayed' | 'cancelled'
type VehicleType = 'van' | 'truck' | 'semi-truck' | 'cargo-plane' | 'container-ship'
type RouteType = 'local' | 'regional' | 'national' | 'international' | 'express'

interface LogisticsRoute {
  id: string
  routeName: string
  driverId: string
  driverName: string
  vehicleType: VehicleType
  vehiclePlate: string
  routeType: RouteType
  status: RouteStatus
  origin: string
  destination: string
  stops: number
  completedStops: number
  totalDistance: number
  completedDistance: number
  totalPackages: number
  deliveredPackages: number
  estimatedDuration: number
  actualDuration?: number
  departureTime: string
  estimatedArrival: string
  actualArrival?: string
  fuelCost: number
  tollCost: number
  efficiency: number
  tags: string[]
}

const routes: LogisticsRoute[] = [
  {
    id: 'LOG-2847',
    routeName: 'West Coast Express Route',
    driverId: 'DRV-847',
    driverName: 'Sarah Johnson',
    vehicleType: 'semi-truck',
    vehiclePlate: 'CA-TRK-2847',
    routeType: 'regional',
    status: 'in-progress',
    origin: 'Los Angeles, CA',
    destination: 'San Francisco, CA',
    stops: 8,
    completedStops: 5,
    totalDistance: 382,
    completedDistance: 245,
    totalPackages: 247,
    deliveredPackages: 156,
    estimatedDuration: 480,
    departureTime: '2024-01-12T06:00:00',
    estimatedArrival: '2024-01-12T14:00:00',
    fuelCost: 245.50,
    tollCost: 48.00,
    efficiency: 92,
    tags: ['Regional', 'On Schedule', 'High Priority']
  },
  {
    id: 'LOG-2846',
    routeName: 'City Center Distribution',
    driverId: 'DRV-846',
    driverName: 'Michael Chen',
    vehicleType: 'van',
    vehiclePlate: 'NY-VAN-1234',
    routeType: 'local',
    status: 'completed',
    origin: 'Brooklyn Distribution Center',
    destination: 'Manhattan Warehouse',
    stops: 15,
    completedStops: 15,
    totalDistance: 45,
    completedDistance: 45,
    totalPackages: 89,
    deliveredPackages: 89,
    estimatedDuration: 240,
    actualDuration: 225,
    departureTime: '2024-01-11T08:00:00',
    estimatedArrival: '2024-01-11T12:00:00',
    actualArrival: '2024-01-11T11:45:00',
    fuelCost: 35.00,
    tollCost: 12.50,
    efficiency: 96,
    tags: ['Local', 'Completed Early', 'Perfect Delivery']
  },
  {
    id: 'LOG-2845',
    routeName: 'Cross-Country Main Line',
    driverId: 'DRV-845',
    driverName: 'Emily Rodriguez',
    vehicleType: 'semi-truck',
    vehiclePlate: 'TX-TRK-5678',
    routeType: 'national',
    status: 'in-progress',
    origin: 'Dallas, TX',
    destination: 'New York, NY',
    stops: 12,
    completedStops: 7,
    totalDistance: 1545,
    completedDistance: 892,
    totalPackages: 456,
    deliveredPackages: 267,
    estimatedDuration: 1920,
    departureTime: '2024-01-10T04:00:00',
    estimatedArrival: '2024-01-12T12:00:00',
    fuelCost: 892.00,
    tollCost: 156.00,
    efficiency: 88,
    tags: ['National', 'Long Haul', 'Multi-State']
  },
  {
    id: 'LOG-2844',
    routeName: 'International Cargo Flight',
    driverId: 'PLT-844',
    driverName: 'David Kim',
    vehicleType: 'cargo-plane',
    vehiclePlate: 'N847CA',
    routeType: 'international',
    status: 'delayed',
    origin: 'Chicago O\'Hare Airport',
    destination: 'London Heathrow Airport',
    stops: 2,
    completedStops: 1,
    totalDistance: 3950,
    completedDistance: 1975,
    totalPackages: 1847,
    deliveredPackages: 0,
    estimatedDuration: 480,
    departureTime: '2024-01-11T22:00:00',
    estimatedArrival: '2024-01-12T10:00:00',
    fuelCost: 12500.00,
    tollCost: 2400.00,
    efficiency: 82,
    tags: ['International', 'Air Freight', 'Delayed', 'Weather']
  },
  {
    id: 'LOG-2843',
    routeName: 'Ocean Container Route',
    driverId: 'CPT-843',
    driverName: 'Lisa Anderson',
    vehicleType: 'container-ship',
    vehiclePlate: 'SHIP-MSC-2847',
    routeType: 'international',
    status: 'in-progress',
    origin: 'Shanghai, China',
    destination: 'Los Angeles, CA',
    stops: 3,
    completedStops: 1,
    totalDistance: 6500,
    completedDistance: 2600,
    totalPackages: 12847,
    deliveredPackages: 0,
    estimatedDuration: 14400,
    departureTime: '2024-01-01T08:00:00',
    estimatedArrival: '2024-01-11T20:00:00',
    fuelCost: 45000.00,
    tollCost: 8500.00,
    efficiency: 91,
    tags: ['Ocean Freight', 'International', 'High Volume']
  },
  {
    id: 'LOG-2842',
    routeName: 'Midwest Express Delivery',
    driverId: 'DRV-842',
    driverName: 'Robert Martinez',
    vehicleType: 'truck',
    vehiclePlate: 'IL-TRK-9012',
    routeType: 'express',
    status: 'completed',
    origin: 'Chicago, IL',
    destination: 'Detroit, MI',
    stops: 5,
    completedStops: 5,
    totalDistance: 283,
    completedDistance: 283,
    totalPackages: 134,
    deliveredPackages: 134,
    estimatedDuration: 300,
    actualDuration: 285,
    departureTime: '2024-01-11T14:00:00',
    estimatedArrival: '2024-01-11T19:00:00',
    actualArrival: '2024-01-11T18:45:00',
    fuelCost: 185.00,
    tollCost: 32.00,
    efficiency: 94,
    tags: ['Express', 'Same Day', 'Completed']
  },
  {
    id: 'LOG-2841',
    routeName: 'Southern Region Circuit',
    driverId: 'DRV-841',
    driverName: 'Jennifer Taylor',
    vehicleType: 'truck',
    vehiclePlate: 'FL-TRK-3456',
    routeType: 'regional',
    status: 'planned',
    origin: 'Miami, FL',
    destination: 'Atlanta, GA',
    stops: 10,
    completedStops: 0,
    totalDistance: 662,
    completedDistance: 0,
    totalPackages: 289,
    deliveredPackages: 0,
    estimatedDuration: 600,
    departureTime: '2024-01-13T05:00:00',
    estimatedArrival: '2024-01-13T15:00:00',
    fuelCost: 425.00,
    tollCost: 65.00,
    efficiency: 0,
    tags: ['Planned', 'Regional', 'Multi-Stop']
  },
  {
    id: 'LOG-2840',
    routeName: 'Last Mile Urban Delivery',
    driverId: 'DRV-840',
    driverName: 'Thomas Wright',
    vehicleType: 'van',
    vehiclePlate: 'WA-VAN-7890',
    routeType: 'local',
    status: 'cancelled',
    origin: 'Seattle Distribution Hub',
    destination: 'Seattle Downtown',
    stops: 25,
    completedStops: 0,
    totalDistance: 28,
    completedDistance: 0,
    totalPackages: 67,
    deliveredPackages: 0,
    estimatedDuration: 180,
    departureTime: '2024-01-12T09:00:00',
    estimatedArrival: '2024-01-12T12:00:00',
    fuelCost: 22.00,
    tollCost: 0,
    efficiency: 0,
    tags: ['Cancelled', 'Vehicle Issue', 'Rescheduled']
  }
]

const stats = [
  {
    label: 'Active Routes',
    value: '247',
    change: 12.5,
    trend: 'up' as const,
    icon: Route
  },
  {
    label: 'Packages in Transit',
    value: '42.5K',
    change: 18.7,
    trend: 'up' as const,
    icon: Package
  },
  {
    label: 'Fleet Efficiency',
    value: '91.3%',
    change: 4.2,
    trend: 'up' as const,
    icon: TrendingUp
  },
  {
    label: 'On-Time Rate',
    value: '94.8%',
    change: 2.8,
    trend: 'up' as const,
    icon: CheckCircle
  }
]

const quickActions = [
  { label: 'Plan Route', icon: Plus, gradient: 'from-blue-500 to-cyan-600' },
  { label: 'Track Vehicles', icon: MapPin, gradient: 'from-green-500 to-emerald-600' },
  { label: 'Optimize Routes', icon: Route, gradient: 'from-purple-500 to-indigo-600' },
  { label: 'Export Reports', icon: Download, gradient: 'from-orange-500 to-red-600' },
  { label: 'Fleet Settings', icon: Settings, gradient: 'from-cyan-500 to-blue-600' },
  { label: 'View Map', icon: MapPin, gradient: 'from-pink-500 to-rose-600' },
  { label: 'Dispatch Center', icon: Truck, gradient: 'from-indigo-500 to-purple-600' },
  { label: 'Refresh', icon: RefreshCw, gradient: 'from-red-500 to-pink-600' }
]

const recentActivity = [
  { action: 'Route completed', details: 'City Center Distribution finished 15 mins early', time: '1 hour ago' },
  { action: 'Route delayed', details: 'International cargo flight delayed due to weather', time: '2 hours ago' },
  { action: 'Route started', details: 'West Coast Express departed Los Angeles', time: '6 hours ago' },
  { action: 'Route cancelled', details: 'Last Mile Urban Delivery cancelled - vehicle issue', time: '3 hours ago' },
  { action: 'Milestone reached', details: 'Ocean container passed Hong Kong checkpoint', time: '1 day ago' }
]

const topRoutes = [
  { name: 'Cross-Country Main Line', metric: '1,545 miles' },
  { name: 'Ocean Container Route', metric: '6,500 miles' },
  { name: 'International Cargo Flight', metric: '3,950 miles' },
  { name: 'Southern Region Circuit', metric: '662 miles' },
  { name: 'West Coast Express', metric: '382 miles' }
]

export default function LogisticsV2Page() {
  const [viewMode, setViewMode] = useState<'all' | 'in-progress' | 'completed' | 'delayed'>('all')

  const filteredRoutes = routes.filter(route => {
    if (viewMode === 'all') return true
    if (viewMode === 'in-progress') return route.status === 'in-progress'
    if (viewMode === 'completed') return route.status === 'completed'
    if (viewMode === 'delayed') return route.status === 'delayed'
    return true
  })

  const getStatusColor = (status: RouteStatus) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'delayed': return 'bg-red-100 text-red-700 border-red-200'
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: RouteStatus) => {
    switch (status) {
      case 'planned': return <Clock className="w-3 h-3" />
      case 'in-progress': return <Truck className="w-3 h-3" />
      case 'completed': return <CheckCircle className="w-3 h-3" />
      case 'delayed': return <AlertTriangle className="w-3 h-3" />
      case 'cancelled': return <XCircle className="w-3 h-3" />
      default: return <Route className="w-3 h-3" />
    }
  }

  const getVehicleTypeColor = (type: VehicleType) => {
    switch (type) {
      case 'van': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'truck': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'semi-truck': return 'bg-indigo-50 text-indigo-600 border-indigo-100'
      case 'cargo-plane': return 'bg-orange-50 text-orange-600 border-orange-100'
      case 'container-ship': return 'bg-cyan-50 text-cyan-600 border-cyan-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getRouteTypeGradient = (type: RouteType) => {
    switch (type) {
      case 'local': return 'from-blue-500 to-cyan-600'
      case 'regional': return 'from-purple-500 to-pink-600'
      case 'national': return 'from-indigo-500 to-purple-600'
      case 'international': return 'from-orange-500 to-red-600'
      case 'express': return 'from-green-500 to-emerald-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const calculateProgress = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Logistics
            </h1>
            <p className="text-gray-600 mt-2">Manage routes, fleet, and distribution operations</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Plan Route
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
            label="All Routes"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="In Progress"
            isActive={viewMode === 'in-progress'}
            onClick={() => setViewMode('in-progress')}
          />
          <PillButton
            label="Completed"
            isActive={viewMode === 'completed'}
            onClick={() => setViewMode('completed')}
          />
          <PillButton
            label="Delayed"
            isActive={viewMode === 'delayed'}
            onClick={() => setViewMode('delayed')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Routes List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'all' && 'All Routes'}
              {viewMode === 'in-progress' && 'Routes In Progress'}
              {viewMode === 'completed' && 'Completed Routes'}
              {viewMode === 'delayed' && 'Delayed Routes'}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredRoutes.length} total)
              </span>
            </h2>

            {filteredRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(route.status)} flex items-center gap-1`}>
                        {getStatusIcon(route.status)}
                        {route.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getVehicleTypeColor(route.vehicleType)}`}>
                        {route.vehicleType}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-600 border-gray-100 capitalize">
                        {route.routeType}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {route.routeName}
                    </h3>
                    <p className="text-sm text-gray-700 mb-1">
                      {route.origin} → {route.destination}
                    </p>
                    <p className="text-xs text-gray-500">
                      {route.id} • Driver: {route.driverName} • Vehicle: {route.vehiclePlate}
                    </p>
                  </div>
                  <button className={`px-4 py-2 bg-gradient-to-r ${getRouteTypeGradient(route.routeType)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}>
                    <Eye className="w-4 h-4" />
                    Track
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Distance</p>
                    <p className="text-sm font-semibold text-gray-900">{route.completedDistance}/{route.totalDistance} mi</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Stops</p>
                    <p className="text-sm font-semibold text-gray-900">{route.completedStops}/{route.stops}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Packages</p>
                    <p className="text-sm font-semibold text-gray-900">{route.deliveredPackages}/{route.totalPackages}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Efficiency</p>
                    <p className="text-sm font-semibold text-gray-900">{route.efficiency}%</p>
                  </div>
                </div>

                {/* Progress Bars */}
                {route.status !== 'planned' && route.status !== 'cancelled' && (
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Route Progress</span>
                        <span>{calculateProgress(route.completedDistance, route.totalDistance)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getRouteTypeGradient(route.routeType)} rounded-full transition-all`}
                          style={{ width: `${calculateProgress(route.completedDistance, route.totalDistance)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Delivery Progress</span>
                        <span>{calculateProgress(route.deliveredPackages, route.totalPackages)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
                          style={{ width: `${calculateProgress(route.deliveredPackages, route.totalPackages)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Departure</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(route.departureTime)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        {route.actualArrival ? 'Actual Arrival' : 'Est. Arrival'}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {route.actualArrival ? formatDate(route.actualArrival) : formatDate(route.estimatedArrival)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>Fuel: {formatCurrency(route.fuelCost)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span>Tolls: {formatCurrency(route.tollCost)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{route.efficiency}% efficient</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {route.tags.map((tag, index) => (
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

            {/* Route Type Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Route Types</h3>
              <div className="space-y-3">
                {[
                  { type: 'local', count: 98, percentage: 40 },
                  { type: 'regional', count: 67, percentage: 27 },
                  { type: 'national', count: 45, percentage: 18 },
                  { type: 'international', count: 25, percentage: 10 },
                  { type: 'express', count: 12, percentage: 5 }
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{item.type}</span>
                      <span className="text-gray-900 font-semibold">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getRouteTypeGradient(item.type as RouteType)} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Routes */}
            <RankingList
              title="Longest Routes"
              items={topRoutes}
              gradient="from-indigo-500 to-purple-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Performance Metrics */}
            <MiniKPI
              label="Avg Fuel Cost"
              value="$245/route"
              change={-8.3}
              trend="down"
            />

            <ProgressCard
              title="Monthly Deliveries"
              current={42500}
              target={50000}
              label="packages"
              gradient="from-indigo-500 to-purple-600"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
