'use client'

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
  CheckCircle, XCircle, Clock, AlertTriangle,
  Play, Pause
} from 'lucide-react'
import { useLogisticsRoutes, LogisticsRoute } from '@/lib/hooks/use-logistics'

type RouteStatus = 'planned' | 'in-progress' | 'completed' | 'delayed' | 'cancelled'

interface LogisticsClientProps {
  initialRoutes: LogisticsRoute[]
  initialStats: {
    total: number
    planned: number
    inProgress: number
    completed: number
    delayed: number
    cancelled: number
    totalDistance: number
    totalPackages: number
    avgEfficiency: number
  }
}

export default function LogisticsClient({ initialRoutes, initialStats }: LogisticsClientProps) {
  const [viewMode, setViewMode] = useState<'all' | 'in-progress' | 'completed' | 'delayed'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const {
    routes: realtimeRoutes,
    loading,
    createRoute,
    updateRoute,
    deleteRoute,
    startRoute,
    completeRoute,
    delayRoute,
    cancelRoute,
    updateProgress,
    getStats
  } = useLogisticsRoutes()

  // Use realtime data if available, otherwise use initial data
  const routes = realtimeRoutes.length > 0 ? realtimeRoutes : initialRoutes
  const stats = realtimeRoutes.length > 0 ? getStats() : initialStats

  const filteredRoutes = routes.filter(route => {
    if (viewMode === 'all') return true
    if (viewMode === 'in-progress') return route.status === 'in-progress'
    if (viewMode === 'completed') return route.status === 'completed'
    if (viewMode === 'delayed') return route.status === 'delayed'
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'delayed': return 'bg-red-100 text-red-700 border-red-200'
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return <Clock className="w-3 h-3" />
      case 'in-progress': return <Truck className="w-3 h-3" />
      case 'completed': return <CheckCircle className="w-3 h-3" />
      case 'delayed': return <AlertTriangle className="w-3 h-3" />
      case 'cancelled': return <XCircle className="w-3 h-3" />
      default: return <Route className="w-3 h-3" />
    }
  }

  const getRouteTypeGradient = (type: string) => {
    switch (type) {
      case 'local': return 'from-blue-500 to-cyan-600'
      case 'regional': return 'from-purple-500 to-pink-600'
      case 'national': return 'from-indigo-500 to-purple-600'
      case 'international': return 'from-orange-500 to-red-600'
      case 'express': return 'from-green-500 to-emerald-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const calculateProgress = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  const handleCreateRoute = async () => {
    try {
      await createRoute({
        name: 'New Route',
        description: 'Route description',
        route_type: 'local',
        origin_city: 'Origin City',
        destination_city: 'Destination City',
        priority: 'medium'
      })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create route:', error)
    }
  }

  const handleStartRoute = async (id: string) => {
    try {
      await startRoute(id)
    } catch (error) {
      console.error('Failed to start route:', error)
    }
  }

  const handleCompleteRoute = async (id: string) => {
    try {
      await completeRoute(id)
    } catch (error) {
      console.error('Failed to complete route:', error)
    }
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Plan Route
          </button>
        </div>

        {/* Stats */}
        <StatGrid
          stats={[
            {
              label: 'Active Routes',
              value: stats.inProgress.toString(),
              icon: Route,
              trend: { value: 12.5, isPositive: true },
              color: 'indigo'
            },
            {
              label: 'Total Packages',
              value: stats.totalPackages.toLocaleString(),
              icon: Package,
              trend: { value: 18.7, isPositive: true },
              color: 'purple'
            },
            {
              label: 'Fleet Efficiency',
              value: `${stats.avgEfficiency.toFixed(1)}%`,
              icon: TrendingUp,
              trend: { value: 4.2, isPositive: true },
              color: 'green'
            },
            {
              label: 'On-Time Rate',
              value: '94.8%',
              icon: CheckCircle,
              trend: { value: 2.8, isPositive: true },
              color: 'blue'
            }
          ]}
        />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <BentoQuickAction
            actions={[
              {
                title: 'Plan Route',
                description: 'Create new route',
                icon: Plus,
                gradient: 'from-blue-500 to-cyan-600',
                onClick: () => setShowCreateModal(true)
              },
              {
                title: 'Track Vehicles',
                description: 'Live tracking',
                icon: MapPin,
                gradient: 'from-green-500 to-emerald-600',
                onClick: () => console.log('Track')
              },
              {
                title: 'Optimize Routes',
                description: 'AI optimization',
                icon: Route,
                gradient: 'from-purple-500 to-indigo-600',
                onClick: () => console.log('Optimize')
              },
              {
                title: 'Export Reports',
                description: 'Download data',
                icon: Download,
                gradient: 'from-orange-500 to-red-600',
                onClick: () => console.log('Export')
              },
              {
                title: 'Fleet Settings',
                description: 'Configure fleet',
                icon: Settings,
                gradient: 'from-cyan-500 to-blue-600',
                onClick: () => console.log('Settings')
              },
              {
                title: 'View Map',
                description: 'Full map view',
                icon: MapPin,
                gradient: 'from-pink-500 to-rose-600',
                onClick: () => console.log('Map')
              },
              {
                title: 'Dispatch Center',
                description: 'Manage dispatch',
                icon: Truck,
                gradient: 'from-indigo-500 to-purple-600',
                onClick: () => console.log('Dispatch')
              },
              {
                title: 'Refresh',
                description: 'Update data',
                icon: RefreshCw,
                gradient: 'from-red-500 to-pink-600',
                onClick: () => window.location.reload()
              }
            ]}
          />
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

            {loading && routes.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading routes...</p>
              </div>
            ) : filteredRoutes.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                <Route className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No routes found</h3>
                <p className="text-gray-600 mb-4">Get started by planning your first route</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium"
                >
                  Plan Route
                </button>
              </div>
            ) : (
              filteredRoutes.map((route) => (
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
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-600 border-gray-100 capitalize">
                          {route.route_type}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {route.name}
                      </h3>
                      <p className="text-sm text-gray-700 mb-1">
                        {route.origin_city || route.origin_address} → {route.destination_city || route.destination_address}
                      </p>
                      <p className="text-xs text-gray-500">
                        {route.route_code} • Driver: {route.assigned_driver || 'Unassigned'}
                      </p>
                    </div>
                    {route.status === 'planned' ? (
                      <button
                        onClick={() => handleStartRoute(route.id)}
                        className={`px-4 py-2 bg-gradient-to-r ${getRouteTypeGradient(route.route_type)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}
                      >
                        <Play className="w-4 h-4" />
                        Start
                      </button>
                    ) : (
                      <button className={`px-4 py-2 bg-gradient-to-r ${getRouteTypeGradient(route.route_type)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}>
                        <Eye className="w-4 h-4" />
                        Track
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Distance</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {route.actual_distance_km || 0}/{route.estimated_distance_km || 0} km
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Stops</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {route.completed_stops}/{route.total_stops}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Packages</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {route.delivered_packages}/{route.total_packages}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Progress</p>
                      <p className="text-sm font-semibold text-gray-900">{route.progress_percent}%</p>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  {route.status !== 'planned' && route.status !== 'cancelled' && (
                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Route Progress</span>
                          <span>{route.progress_percent}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getRouteTypeGradient(route.route_type)} rounded-full transition-all`}
                            style={{ width: `${route.progress_percent}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Delivery Progress</span>
                          <span>{calculateProgress(route.delivered_packages, route.total_packages)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
                            style={{ width: `${calculateProgress(route.delivered_packages, route.total_packages)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Scheduled Start</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {route.scheduled_start ? new Date(route.scheduled_start).toLocaleString() : 'Not scheduled'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Scheduled End</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {route.scheduled_end ? new Date(route.scheduled_end).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span>Fuel: {formatCurrency(route.fuel_cost || 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      <span>Tolls: {formatCurrency(route.toll_cost || 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Total: {formatCurrency(route.total_cost || 0)}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {route.tags && route.tags.length > 0 && (
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
                  )}

                  {route.status === 'in-progress' && (
                    <div className="flex gap-2 pt-4 border-t border-gray-100 mt-4">
                      <button
                        onClick={() => handleCompleteRoute(route.id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => delayRoute(route.id, 'Traffic delay')}
                        className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium"
                      >
                        Report Delay
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Route Type Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Route Types</h3>
              <div className="space-y-3">
                {[
                  { type: 'local', count: routes.filter(r => r.route_type === 'local').length, percentage: 40 },
                  { type: 'regional', count: routes.filter(r => r.route_type === 'regional').length, percentage: 27 },
                  { type: 'national', count: routes.filter(r => r.route_type === 'national').length, percentage: 18 },
                  { type: 'international', count: routes.filter(r => r.route_type === 'international').length, percentage: 10 },
                  { type: 'express', count: routes.filter(r => r.route_type === 'express').length, percentage: 5 }
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{item.type}</span>
                      <span className="text-gray-900 font-semibold">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getRouteTypeGradient(item.type)} rounded-full`}
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
              items={routes
                .sort((a, b) => (b.estimated_distance_km || 0) - (a.estimated_distance_km || 0))
                .slice(0, 5)
                .map((route, idx) => ({
                  label: route.name,
                  value: `${route.estimated_distance_km || 0} km`,
                  rank: idx + 1
                }))}
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={routes.slice(0, 5).map((route) => ({
                id: route.id,
                title: route.name,
                description: `Status: ${route.status}`,
                timestamp: new Date(route.created_at).toLocaleDateString(),
                type: route.status === 'completed' ? 'success' :
                      route.status === 'delayed' ? 'error' :
                      route.status === 'in-progress' ? 'info' : 'warning'
              }))}
            />

            {/* Performance Metrics */}
            <MiniKPI
              label="Avg Route Cost"
              value={formatCurrency(stats.total > 0 ? routes.reduce((sum, r) => sum + (r.total_cost || 0), 0) / stats.total : 0)}
              icon={TrendingUp}
              trend={{ value: 8.3, isPositive: false }}
            />

            <ProgressCard
              title="Monthly Deliveries"
              progress={calculateProgress(stats.completed, stats.total)}
              subtitle={`${stats.completed} of ${stats.total} routes`}
              color="indigo"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
