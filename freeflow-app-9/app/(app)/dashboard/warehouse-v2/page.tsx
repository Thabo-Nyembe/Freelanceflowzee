"use client"

import { useState } from 'react'
import {
  Warehouse,
  MapPin,
  TrendingUp,
  Package,
  Truck,
  Users,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Activity,
  Download,
  Plus,
  Settings,
  Calendar,
  Filter,
  Zap,
  Box,
  ArrowUpRight
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type WarehouseStatus = 'all' | 'active' | 'maintenance' | 'inactive'
type WarehouseType = 'all' | 'distribution' | 'fulfillment' | 'storage' | 'cold-storage'

export default function WarehouseV2Page() {
  const [status, setStatus] = useState<WarehouseStatus>('all')
  const [warehouseType, setWarehouseType] = useState<WarehouseType>('all')

  const stats = [
    {
      label: 'Total Warehouses',
      value: '47',
      change: '+12.4%',
      trend: 'up' as const,
      icon: Warehouse,
      color: 'text-blue-600'
    },
    {
      label: 'Total Capacity',
      value: '284.7K m³',
      change: '+18.2%',
      trend: 'up' as const,
      icon: Box,
      color: 'text-green-600'
    },
    {
      label: 'Utilization Rate',
      value: '87.4%',
      change: '+8.7%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      label: 'Active Staff',
      value: '847',
      change: '+5.2%',
      trend: 'up' as const,
      icon: Users,
      color: 'text-orange-600'
    }
  ]

  const quickActions = [
    {
      label: 'New Warehouse',
      description: 'Add warehouse location',
      icon: Plus,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Capacity Planning',
      description: 'Optimize space usage',
      icon: BarChart3,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Staff Management',
      description: 'Manage warehouse teams',
      icon: Users,
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'Shipping Routes',
      description: 'Configure delivery zones',
      icon: Truck,
      color: 'from-orange-500 to-amber-500'
    },
    {
      label: 'Analytics',
      description: 'View performance data',
      icon: Activity,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Export Report',
      description: 'Download warehouse data',
      icon: Download,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      label: 'Quick Transfer',
      description: 'Move stock between sites',
      icon: Zap,
      color: 'from-pink-500 to-rose-500'
    },
    {
      label: 'Settings',
      description: 'Configure warehouse',
      icon: Settings,
      color: 'from-red-500 to-orange-500'
    }
  ]

  const warehouses = [
    {
      id: 'WH-001',
      name: 'Distribution Center North',
      type: 'distribution',
      status: 'active',
      location: 'Seattle, WA',
      address: '1234 Industrial Blvd',
      capacity: 50000,
      utilization: 92.4,
      staff: 124,
      products: 2847,
      manager: 'Sarah Johnson',
      openingHours: '24/7',
      lastInspection: '2024-02-10',
      zones: 12,
      shipments: 284
    },
    {
      id: 'WH-002',
      name: 'Fulfillment Hub Central',
      type: 'fulfillment',
      status: 'active',
      location: 'Chicago, IL',
      address: '5678 Commerce Ave',
      capacity: 75000,
      utilization: 87.2,
      staff: 187,
      products: 4290,
      manager: 'Michael Chen',
      openingHours: '24/7',
      lastInspection: '2024-02-12',
      zones: 18,
      shipments: 456
    },
    {
      id: 'WH-003',
      name: 'Storage Facility East',
      type: 'storage',
      status: 'active',
      location: 'Atlanta, GA',
      address: '9012 Warehouse Dr',
      capacity: 40000,
      utilization: 78.5,
      staff: 84,
      products: 1847,
      manager: 'David Park',
      openingHours: 'Mon-Fri 8am-6pm',
      lastInspection: '2024-02-08',
      zones: 8,
      shipments: 147
    },
    {
      id: 'WH-004',
      name: 'Cold Storage West',
      type: 'cold-storage',
      status: 'active',
      location: 'Los Angeles, CA',
      address: '3456 Logistics Ln',
      capacity: 30000,
      utilization: 94.8,
      staff: 92,
      products: 1284,
      manager: 'Emma Wilson',
      openingHours: '24/7',
      lastInspection: '2024-02-15',
      zones: 6,
      shipments: 328
    },
    {
      id: 'WH-005',
      name: 'Distribution Center South',
      type: 'distribution',
      status: 'maintenance',
      location: 'Dallas, TX',
      address: '7890 Supply Chain Rd',
      capacity: 55000,
      utilization: 45.2,
      staff: 42,
      products: 847,
      manager: 'Robert Taylor',
      openingHours: 'Temporarily Closed',
      lastInspection: '2024-02-01',
      zones: 14,
      shipments: 28
    },
    {
      id: 'WH-006',
      name: 'Fulfillment Center Northeast',
      type: 'fulfillment',
      status: 'active',
      location: 'Boston, MA',
      address: '2345 Distribution Way',
      capacity: 65000,
      utilization: 89.3,
      staff: 156,
      products: 3524,
      manager: 'Lisa Anderson',
      openingHours: '24/7',
      lastInspection: '2024-02-14',
      zones: 16,
      shipments: 392
    },
    {
      id: 'WH-007',
      name: 'Storage Hub Southwest',
      type: 'storage',
      status: 'active',
      location: 'Phoenix, AZ',
      address: '6789 Storage Blvd',
      capacity: 45000,
      utilization: 82.7,
      staff: 98,
      products: 2124,
      manager: 'James Martinez',
      openingHours: 'Mon-Sat 7am-7pm',
      lastInspection: '2024-02-11',
      zones: 10,
      shipments: 184
    },
    {
      id: 'WH-008',
      name: 'Cold Storage Central',
      type: 'cold-storage',
      status: 'active',
      location: 'Denver, CO',
      address: '8901 Cold Chain Dr',
      capacity: 35000,
      utilization: 91.2,
      staff: 87,
      products: 1456,
      manager: 'Sarah Johnson',
      openingHours: '24/7',
      lastInspection: '2024-02-13',
      zones: 7,
      shipments: 284
    },
    {
      id: 'WH-009',
      name: 'Distribution Hub Pacific',
      type: 'distribution',
      status: 'active',
      location: 'Portland, OR',
      address: '1122 Freight St',
      capacity: 48000,
      utilization: 85.6,
      staff: 112,
      products: 2628,
      manager: 'Michael Chen',
      openingHours: '24/7',
      lastInspection: '2024-02-09',
      zones: 11,
      shipments: 247
    },
    {
      id: 'WH-010',
      name: 'Fulfillment Center Southeast',
      type: 'fulfillment',
      status: 'inactive',
      location: 'Miami, FL',
      address: '3344 Shipping Ave',
      capacity: 60000,
      utilization: 12.4,
      staff: 18,
      products: 284,
      manager: 'David Park',
      openingHours: 'Closed',
      lastInspection: '2023-12-20',
      zones: 15,
      shipments: 8
    }
  ]

  const filteredWarehouses = warehouses.filter(wh => {
    const statusMatch = status === 'all' || wh.status === status
    const typeMatch = warehouseType === 'all' || wh.type === warehouseType
    return statusMatch && typeMatch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle2,
          label: 'Active'
        }
      case 'maintenance':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertTriangle,
          label: 'Maintenance'
        }
      case 'inactive':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertTriangle,
          label: 'Inactive'
        }
      default:
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Warehouse,
          label: status
        }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'distribution':
        return Truck
      case 'fulfillment':
        return Package
      case 'storage':
        return Box
      case 'cold-storage':
        return Warehouse
      default:
        return Warehouse
    }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'from-red-500 to-pink-500'
    if (utilization >= 75) return 'from-green-500 to-emerald-500'
    if (utilization >= 50) return 'from-yellow-500 to-orange-500'
    return 'from-gray-500 to-slate-500'
  }

  const recentActivity = [
    { label: 'Warehouse inspection completed', time: '2 hours ago', color: 'text-green-600' },
    { label: 'New warehouse added', time: '1 day ago', color: 'text-blue-600' },
    { label: 'Maintenance scheduled', time: '2 days ago', color: 'text-yellow-600' },
    { label: 'Staff increased', time: '3 days ago', color: 'text-purple-600' },
    { label: 'Capacity expanded', time: '5 days ago', color: 'text-orange-600' }
  ]

  const topWarehousesByCapacity = [
    { label: 'Fulfillment Hub Central', value: '75K m³', color: 'bg-blue-500' },
    { label: 'Fulfillment NE', value: '65K m³', color: 'bg-green-500' },
    { label: 'Fulfillment SE', value: '60K m³', color: 'bg-purple-500' },
    { label: 'Distribution South', value: '55K m³', color: 'bg-cyan-500' },
    { label: 'Distribution North', value: '50K m³', color: 'bg-orange-500' }
  ]

  const overallUtilizationData = {
    label: 'Overall Utilization',
    current: 87.4,
    target: 85,
    subtitle: 'Across all active warehouses'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Warehouse Management
            </h1>
            <p className="text-gray-600 mt-2">Monitor and manage warehouse facilities</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Map View
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Warehouse
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setStatus('all')}
                  isActive={status === 'all'}
                  variant="default"
                >
                  All Warehouses
                </PillButton>
                <PillButton
                  onClick={() => setStatus('active')}
                  isActive={status === 'active'}
                  variant="default"
                >
                  Active
                </PillButton>
                <PillButton
                  onClick={() => setStatus('maintenance')}
                  isActive={status === 'maintenance'}
                  variant="default"
                >
                  Maintenance
                </PillButton>
                <PillButton
                  onClick={() => setStatus('inactive')}
                  isActive={status === 'inactive'}
                  variant="default"
                >
                  Inactive
                </PillButton>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setWarehouseType('all')}
                  isActive={warehouseType === 'all'}
                  variant="default"
                >
                  All Types
                </PillButton>
                <PillButton
                  onClick={() => setWarehouseType('distribution')}
                  isActive={warehouseType === 'distribution'}
                  variant="default"
                >
                  Distribution
                </PillButton>
                <PillButton
                  onClick={() => setWarehouseType('fulfillment')}
                  isActive={warehouseType === 'fulfillment'}
                  variant="default"
                >
                  Fulfillment
                </PillButton>
                <PillButton
                  onClick={() => setWarehouseType('storage')}
                  isActive={warehouseType === 'storage'}
                  variant="default"
                >
                  Storage
                </PillButton>
                <PillButton
                  onClick={() => setWarehouseType('cold-storage')}
                  isActive={warehouseType === 'cold-storage'}
                  variant="default"
                >
                  Cold Storage
                </PillButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Warehouse List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Warehouse Facilities</h2>
              <div className="text-sm text-gray-600">
                {filteredWarehouses.length} locations
              </div>
            </div>

            <div className="space-y-3">
              {filteredWarehouses.map((warehouse) => {
                const statusBadge = getStatusBadge(warehouse.status)
                const StatusIcon = statusBadge.icon
                const TypeIcon = getTypeIcon(warehouse.type)
                const utilizationColor = getUtilizationColor(warehouse.utilization)

                return (
                  <div
                    key={warehouse.id}
                    className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-cyan-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white">
                          <TypeIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{warehouse.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">{warehouse.id}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500 capitalize">{warehouse.type.replace('-', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.label}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Location</div>
                        <div className="font-medium text-gray-900 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {warehouse.location}
                        </div>
                        <div className="text-xs text-gray-500">{warehouse.address}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Manager</div>
                        <div className="font-medium text-gray-900">{warehouse.manager}</div>
                        <div className="text-xs text-gray-500">{warehouse.openingHours}</div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Capacity Utilization</span>
                        <span className="font-semibold text-gray-900">{warehouse.utilization.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${utilizationColor} transition-all duration-500 rounded-full`}
                          style={{ width: `${warehouse.utilization}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Capacity</div>
                        <div className="font-medium text-gray-900 text-sm">{(warehouse.capacity / 1000).toFixed(0)}K m³</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Staff</div>
                        <div className="font-medium text-gray-900 text-sm">{warehouse.staff}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Products</div>
                        <div className="font-medium text-gray-900 text-sm">{warehouse.products.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Shipments</div>
                        <div className="font-medium text-cyan-600 text-sm">{warehouse.shipments}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                      <div className="text-gray-600">
                        Last Inspection: <span className="font-medium text-gray-900">{warehouse.lastInspection}</span>
                      </div>
                      <div className="text-gray-600">
                        Zones: <span className="font-medium text-gray-900">{warehouse.zones}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgressCard
              label={overallUtilizationData.label}
              current={overallUtilizationData.current}
              target={overallUtilizationData.target}
              subtitle={overallUtilizationData.subtitle}
            />

            <MiniKPI
              title="Active Staff"
              value="847"
              change="+5.2%"
              trend="up"
              subtitle="Across all facilities"
            />

            <RankingList
              title="Top by Capacity"
              items={topWarehousesByCapacity}
            />

            <ActivityFeed
              title="Recent Activity"
              items={recentActivity}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
