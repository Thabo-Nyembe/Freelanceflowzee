'use client'

import { useState } from 'react'
import { useWarehouses, useWarehouseMutations, Warehouse } from '@/lib/hooks/use-warehouse'
import {
  Warehouse as WarehouseIcon,
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
  Box
} from 'lucide-react'

interface WarehouseClientProps {
  initialWarehouses: Warehouse[]
}

type WarehouseStatus = 'all' | 'active' | 'maintenance' | 'inactive'
type WarehouseType = 'all' | 'distribution' | 'fulfillment' | 'storage' | 'cold-storage'

export default function WarehouseClient({ initialWarehouses }: WarehouseClientProps) {
  const [status, setStatus] = useState<WarehouseStatus>('all')
  const [warehouseType, setWarehouseType] = useState<WarehouseType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { warehouses, stats, isLoading } = useWarehouses(initialWarehouses, {
    status: status === 'all' ? undefined : status,
    warehouseType: warehouseType === 'all' ? undefined : warehouseType
  })
  const { createWarehouse, isCreating } = useWarehouseMutations()

  const filteredWarehouses = warehouses.filter(wh =>
    wh.warehouse_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wh.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wh.warehouse_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'active':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, label: 'Active' }
      case 'maintenance':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle, label: 'Maintenance' }
      case 'inactive':
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertTriangle, label: 'Inactive' }
      default:
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: WarehouseIcon, label: s }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'distribution': return Truck
      case 'fulfillment': return Package
      case 'storage': return Box
      case 'cold-storage': return WarehouseIcon
      default: return WarehouseIcon
    }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'from-red-500 to-pink-500'
    if (utilization >= 75) return 'from-green-500 to-emerald-500'
    if (utilization >= 50) return 'from-yellow-500 to-orange-500'
    return 'from-gray-500 to-slate-500'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <WarehouseIcon className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-green-600">+12.4%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Warehouses</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Box className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-green-600">+18.2%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{(stats.totalCapacity / 1000).toFixed(1)}K m³</p>
            <p className="text-sm text-gray-500">Total Capacity</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-green-600">+8.7%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.avgUtilization}%</p>
            <p className="text-sm text-gray-500">Utilization Rate</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-orange-600" />
              <span className="text-sm font-medium text-green-600">+5.2%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
            <p className="text-sm text-gray-500">Active Staff</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'active', 'maintenance', 'inactive'] as WarehouseStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      status === s
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {s === 'all' ? 'All Warehouses' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'distribution', 'fulfillment', 'storage', 'cold-storage'] as WarehouseType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setWarehouseType(t)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      warehouseType === t
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t === 'all' ? 'All Types' : t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Warehouse Facilities</h2>
              <div className="text-sm text-gray-600">{filteredWarehouses.length} locations</div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading warehouses...</div>
            ) : filteredWarehouses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No warehouses found</div>
            ) : (
              <div className="space-y-3">
                {filteredWarehouses.map((warehouse) => {
                  const statusBadge = getStatusBadge(warehouse.status)
                  const StatusIcon = statusBadge.icon
                  const TypeIcon = getTypeIcon(warehouse.warehouse_type)
                  const utilizationColor = getUtilizationColor(Number(warehouse.utilization_percent))

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
                            <h3 className="font-semibold text-gray-900">{warehouse.warehouse_name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-gray-500">{warehouse.warehouse_code}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500 capitalize">{warehouse.warehouse_type.replace('-', ' ')}</span>
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
                            {warehouse.location || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">{warehouse.address || ''}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Manager</div>
                          <div className="font-medium text-gray-900">{warehouse.manager_name || 'Unassigned'}</div>
                          <div className="text-xs text-gray-500">{warehouse.operating_hours || ''}</div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Capacity Utilization</span>
                          <span className="font-semibold text-gray-900">{Number(warehouse.utilization_percent).toFixed(1)}%</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${utilizationColor} transition-all duration-500 rounded-full`}
                            style={{ width: `${warehouse.utilization_percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Capacity</div>
                          <div className="font-medium text-gray-900 text-sm">{(Number(warehouse.capacity_sqm) / 1000).toFixed(0)}K m³</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Staff</div>
                          <div className="font-medium text-gray-900 text-sm">{warehouse.staff_count}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Products</div>
                          <div className="font-medium text-gray-900 text-sm">{warehouse.product_count.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Zones</div>
                          <div className="font-medium text-cyan-600 text-sm">{warehouse.zone_count}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                        <div className="text-gray-600">
                          Last Inspection: <span className="font-medium text-gray-900">{warehouse.last_inspection_date || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Overall Utilization</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900">{stats.avgUtilization}%</span>
                  <span className="text-sm text-gray-500">of 85% target</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-500"
                    style={{ width: `${Math.min(stats.avgUtilization, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Warehouse Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className="font-semibold text-green-600">{stats.active}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Maintenance</span>
                  <span className="font-semibold text-yellow-600">{stats.maintenance}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Inactive</span>
                  <span className="font-semibold text-gray-600">{stats.inactive}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Staff</span>
                  <span className="font-semibold">{stats.totalStaff}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Products</span>
                  <span className="font-semibold">{stats.totalProducts.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
