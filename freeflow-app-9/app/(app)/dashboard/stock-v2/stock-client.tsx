'use client'

import { useState } from 'react'
import { useStockMovements, useStockMovementMutations, StockMovement } from '@/lib/hooks/use-stock'
import {
  TrendingUp,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Activity,
  Download,
  Plus,
  RefreshCw,
  Calendar,
  DollarSign,
  ShoppingCart
} from 'lucide-react'

interface StockClientProps {
  initialMovements: StockMovement[]
}

type MovementType = 'all' | 'inbound' | 'outbound' | 'transfer' | 'adjustment'

export default function StockClient({ initialMovements }: StockClientProps) {
  const [movementType, setMovementType] = useState<MovementType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { movements, stats, isLoading } = useStockMovements(initialMovements, {
    movementType: movementType === 'all' ? undefined : movementType
  })
  const { createMovement, completeMovement, isCreating } = useStockMovementMutations()

  const filteredMovements = movements.filter(movement =>
    movement.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movement.movement_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movement.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'inbound':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: ArrowDownRight, label: 'Inbound' }
      case 'outbound':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: ArrowUpRight, label: 'Outbound' }
      case 'transfer':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: RefreshCw, label: 'Transfer' }
      case 'adjustment':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Activity, label: 'Adjustment' }
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Package, label: type }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in-transit': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getMovementGradient = (type: string) => {
    switch (type) {
      case 'inbound': return 'from-green-500 to-emerald-500'
      case 'outbound': return 'from-orange-500 to-amber-500'
      case 'transfer': return 'from-blue-500 to-cyan-500'
      case 'adjustment': return 'from-purple-500 to-violet-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Stock Movements
            </h1>
            <p className="text-gray-600 mt-2">Track inventory transactions and transfers</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Today
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Record Movement
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-green-600">+18.2%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Stock Movements</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <ArrowDownRight className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-green-600">+24.7%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.inbound}</p>
            <p className="text-sm text-gray-500">Inbound Today</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <ArrowUpRight className="w-8 h-8 text-orange-600" />
              <span className="text-sm font-medium text-green-600">+12.4%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.outbound}</p>
            <p className="text-sm text-gray-500">Outbound Today</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-green-600">+15.8%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">${(stats.totalInboundValue / 1000).toFixed(1)}K</p>
            <p className="text-sm text-gray-500">Stock Value</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Movement Type</label>
            <div className="flex flex-wrap gap-2">
              {(['all', 'inbound', 'outbound', 'transfer', 'adjustment'] as MovementType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setMovementType(t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    movementType === t
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t === 'all' ? 'All Movements' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Transaction History</h2>
              <div className="text-sm text-gray-600">{filteredMovements.length} movements</div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading movements...</div>
            ) : filteredMovements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No movements found</div>
            ) : (
              <div className="space-y-3">
                {filteredMovements.map((movement) => {
                  const typeBadge = getMovementBadge(movement.movement_type)
                  const TypeIcon = typeBadge.icon
                  const gradient = getMovementGradient(movement.movement_type)

                  return (
                    <div
                      key={movement.id}
                      className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-purple-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
                            <TypeIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{movement.product_name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-gray-500">{movement.movement_number}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{new Date(movement.movement_date).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${typeBadge.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeBadge.label}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">From</div>
                          <div className="font-medium text-gray-900 text-sm">{movement.from_location || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">To</div>
                          <div className="font-medium text-gray-900 text-sm">{movement.to_location || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Quantity</div>
                          <div className={`font-semibold text-lg ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Value</div>
                          <div className={`font-medium text-sm ${
                            Number(movement.total_value) > 0 ? 'text-green-600' : Number(movement.total_value) < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {Number(movement.total_value) > 0 ? '+' : ''}${Math.abs(Number(movement.total_value)).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">
                            Ref: <span className="font-medium text-gray-900">{movement.reference_number || 'N/A'}</span>
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">
                            By: <span className="font-medium text-gray-900">{movement.operator_name || 'System'}</span>
                          </span>
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${getStatusBadge(movement.status)}`}>
                          {movement.status.replace('-', ' ')}
                        </div>
                      </div>

                      {movement.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Notes</div>
                          <div className="text-sm text-gray-700">{movement.notes}</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Net Stock Change</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-3xl font-bold ${stats.netValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.netValue >= 0 ? '+' : ''}${(stats.netValue / 1000).toFixed(1)}K
                  </span>
                  <span className="text-sm text-gray-500">today</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                    style={{ width: `${Math.min(Math.abs(stats.netValue) / 10000 * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Movement Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600">Inbound</span>
                  </div>
                  <span className="font-semibold">{stats.inbound}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm text-gray-600">Outbound</span>
                  </div>
                  <span className="font-semibold">{stats.outbound}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-600">Transfers</span>
                  </div>
                  <span className="font-semibold">{stats.transfer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm text-gray-600">Adjustments</span>
                  </div>
                  <span className="font-semibold">{stats.adjustment}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                  <span className="font-semibold">{stats.pending}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Value Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Inbound Value</span>
                  <span className="font-semibold text-green-600">+${stats.totalInboundValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Outbound Value</span>
                  <span className="font-semibold text-red-600">-${stats.totalOutboundValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-medium text-gray-700">Net Change</span>
                  <span className={`font-bold ${stats.netValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.netValue >= 0 ? '+' : ''}${stats.netValue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
