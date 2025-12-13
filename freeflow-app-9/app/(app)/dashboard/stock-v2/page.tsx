"use client"

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
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
  Filter,
  Zap,
  DollarSign,
  ShoppingCart
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type MovementType = 'all' | 'inbound' | 'outbound' | 'transfer' | 'adjustment'
type TimeRange = 'today' | 'week' | 'month' | 'quarter'

export default function StockV2Page() {
  const [movementType, setMovementType] = useState<MovementType>('all')
  const [timeRange, setTimeRange] = useState<TimeRange>('today')

  const stats = [
    {
      label: 'Stock Movements',
      value: '2,847',
      change: '+18.2%',
      trend: 'up' as const,
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      label: 'Inbound Today',
      value: '847',
      change: '+24.7%',
      trend: 'up' as const,
      icon: ArrowDownRight,
      color: 'text-green-600'
    },
    {
      label: 'Outbound Today',
      value: '1,284',
      change: '+12.4%',
      trend: 'up' as const,
      icon: ArrowUpRight,
      color: 'text-orange-600'
    },
    {
      label: 'Stock Value',
      value: '$1.2M',
      change: '+15.8%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-purple-600'
    }
  ]

  const quickActions = [
    {
      label: 'Record Movement',
      description: 'Add stock transaction',
      icon: Plus,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Stock Count',
      description: 'Initiate physical count',
      icon: Package,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Adjust Stock',
      description: 'Correct inventory levels',
      icon: RefreshCw,
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'Export Report',
      description: 'Download movement data',
      icon: Download,
      color: 'from-orange-500 to-amber-500'
    },
    {
      label: 'Movement Analytics',
      description: 'View stock trends',
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Reorder Alerts',
      description: 'Check stock alerts',
      icon: AlertTriangle,
      color: 'from-red-500 to-pink-500'
    },
    {
      label: 'Batch Transfer',
      description: 'Move multiple items',
      icon: Zap,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      label: 'Purchase Orders',
      description: 'View incoming stock',
      icon: ShoppingCart,
      color: 'from-pink-500 to-rose-500'
    }
  ]

  const stockMovements = [
    {
      id: 'MOV-2847',
      timestamp: '2024-02-15 14:30',
      type: 'inbound',
      product: 'MacBook Pro 16" M3',
      sku: 'ELEC-LPT-001',
      quantity: 50,
      unitPrice: 2499.00,
      totalValue: 124950,
      fromLocation: 'Supplier: Apple Inc.',
      toLocation: 'Warehouse A - Zone 3',
      reference: 'PO-2847',
      status: 'completed',
      operator: 'Sarah Johnson',
      notes: 'Quarterly restock'
    },
    {
      id: 'MOV-2846',
      timestamp: '2024-02-15 13:45',
      type: 'outbound',
      product: 'Premium Cotton T-Shirt',
      sku: 'CLTH-TSH-042',
      quantity: -120,
      unitPrice: 29.99,
      totalValue: -3598.80,
      fromLocation: 'Warehouse B - Zone 1',
      toLocation: 'Customer: Fashion Retail Co.',
      reference: 'SO-1284',
      status: 'completed',
      operator: 'Michael Chen',
      notes: 'Bulk order shipment'
    },
    {
      id: 'MOV-2845',
      timestamp: '2024-02-15 12:20',
      type: 'transfer',
      product: 'Organic Protein Bars',
      sku: 'FOOD-SNK-127',
      quantity: 200,
      unitPrice: 24.99,
      totalValue: 0,
      fromLocation: 'Warehouse C - Zone 2',
      toLocation: 'Warehouse A - Zone 5',
      reference: 'TRF-847',
      status: 'in-transit',
      operator: 'David Park',
      notes: 'Rebalancing stock levels'
    },
    {
      id: 'MOV-2844',
      timestamp: '2024-02-15 11:10',
      type: 'adjustment',
      product: 'Wireless Headphones Pro',
      sku: 'ELEC-PHN-782',
      quantity: -5,
      unitPrice: 299.99,
      totalValue: -1499.95,
      fromLocation: 'Warehouse A - Zone 3',
      toLocation: 'Adjustment: Damaged',
      reference: 'ADJ-284',
      status: 'completed',
      operator: 'Emma Wilson',
      notes: 'Damaged in handling'
    },
    {
      id: 'MOV-2843',
      timestamp: '2024-02-15 10:30',
      type: 'inbound',
      product: 'Premium Coffee Beans 1kg',
      sku: 'FOOD-BVG-334',
      quantity: 300,
      unitPrice: 34.99,
      totalValue: 10497,
      fromLocation: 'Supplier: Coffee Importers LLC',
      toLocation: 'Warehouse C - Zone 1',
      reference: 'PO-2846',
      status: 'completed',
      operator: 'Lisa Anderson',
      notes: 'Fresh roast delivery'
    },
    {
      id: 'MOV-2842',
      timestamp: '2024-02-15 09:15',
      type: 'outbound',
      product: 'Winter Jacket - Premium',
      sku: 'CLTH-JCK-901',
      quantity: -45,
      unitPrice: 149.99,
      totalValue: -6749.55,
      fromLocation: 'Warehouse B - Zone 2',
      toLocation: 'Customer: Online Retail Inc.',
      reference: 'SO-1285',
      status: 'completed',
      operator: 'Robert Taylor',
      notes: 'E-commerce order'
    },
    {
      id: 'MOV-2841',
      timestamp: '2024-02-15 08:45',
      type: 'transfer',
      product: 'Decorative Table Lamp',
      sku: 'HOME-DCR-456',
      quantity: 75,
      unitPrice: 49.99,
      totalValue: 0,
      fromLocation: 'Warehouse A - Zone 4',
      toLocation: 'Warehouse B - Zone 3',
      reference: 'TRF-848',
      status: 'completed',
      operator: 'James Martinez',
      notes: 'Stock redistribution'
    },
    {
      id: 'MOV-2840',
      timestamp: '2024-02-15 08:00',
      type: 'inbound',
      product: 'Stainless Steel Cookware Set',
      sku: 'HOME-KIT-892',
      quantity: 100,
      unitPrice: 199.99,
      totalValue: 19999,
      fromLocation: 'Supplier: Kitchenware Direct',
      toLocation: 'Warehouse B - Zone 1',
      reference: 'PO-2848',
      status: 'completed',
      operator: 'Sarah Johnson',
      notes: 'New product line'
    },
    {
      id: 'MOV-2839',
      timestamp: '2024-02-14 16:30',
      type: 'adjustment',
      product: 'Programming Guide 2024',
      sku: 'BOOK-EDU-567',
      quantity: 2,
      unitPrice: 59.99,
      totalValue: 119.98,
      fromLocation: 'Warehouse A - Zone 2',
      toLocation: 'Adjustment: Found',
      reference: 'ADJ-285',
      status: 'completed',
      operator: 'Michael Chen',
      notes: 'Stocktake correction'
    },
    {
      id: 'MOV-2838',
      timestamp: '2024-02-14 15:20',
      type: 'outbound',
      product: 'The Great Adventure - Hardcover',
      sku: 'BOOK-FIC-289',
      quantity: -150,
      unitPrice: 19.99,
      totalValue: -2998.50,
      fromLocation: 'Warehouse A - Zone 2',
      toLocation: 'Customer: Book Distributors Ltd.',
      reference: 'SO-1286',
      status: 'completed',
      operator: 'David Park',
      notes: 'Library order'
    }
  ]

  const filteredMovements = stockMovements.filter(movement => {
    const typeMatch = movementType === 'all' || movement.type === movementType
    return typeMatch
  })

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'inbound':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: ArrowDownRight,
          label: 'Inbound'
        }
      case 'outbound':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: ArrowUpRight,
          label: 'Outbound'
        }
      case 'transfer':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: RefreshCw,
          label: 'Transfer'
        }
      case 'adjustment':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Activity,
          label: 'Adjustment'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Package,
          label: type
        }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in-transit':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const recentActivity = [
    { label: 'Inbound shipment received', time: '30 minutes ago', color: 'text-green-600' },
    { label: 'Outbound order dispatched', time: '1 hour ago', color: 'text-orange-600' },
    { label: 'Stock transfer initiated', time: '2 hours ago', color: 'text-blue-600' },
    { label: 'Adjustment recorded', time: '3 hours ago', color: 'text-purple-600' },
    { label: 'Stock count completed', time: '5 hours ago', color: 'text-cyan-600' }
  ]

  const movementSummary = [
    { label: 'Inbound', value: '847 units', color: 'bg-green-500' },
    { label: 'Outbound', value: '1.3K units', color: 'bg-orange-500' },
    { label: 'Transfers', value: '275 units', color: 'bg-blue-500' },
    { label: 'Adjustments', value: '12 units', color: 'bg-purple-500' },
    { label: 'Pending', value: '58 units', color: 'bg-yellow-500' }
  ]

  const netStockChangeData = {
    label: 'Net Stock Change',
    current: 847,
    target: 1000,
    subtitle: 'Today vs target'
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
              {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Record Movement
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Movement Type</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setMovementType('all')}
                  isActive={movementType === 'all'}
                  variant="default"
                >
                  All Movements
                </PillButton>
                <PillButton
                  onClick={() => setMovementType('inbound')}
                  isActive={movementType === 'inbound'}
                  variant="default"
                >
                  Inbound
                </PillButton>
                <PillButton
                  onClick={() => setMovementType('outbound')}
                  isActive={movementType === 'outbound'}
                  variant="default"
                >
                  Outbound
                </PillButton>
                <PillButton
                  onClick={() => setMovementType('transfer')}
                  isActive={movementType === 'transfer'}
                  variant="default"
                >
                  Transfers
                </PillButton>
                <PillButton
                  onClick={() => setMovementType('adjustment')}
                  isActive={movementType === 'adjustment'}
                  variant="default"
                >
                  Adjustments
                </PillButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movements List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Transaction History</h2>
              <div className="text-sm text-gray-600">
                {filteredMovements.length} movements
              </div>
            </div>

            <div className="space-y-3">
              {filteredMovements.map((movement) => {
                const typeBadge = getMovementBadge(movement.type)
                const TypeIcon = typeBadge.icon

                return (
                  <div
                    key={movement.id}
                    className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-purple-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
                          movement.type === 'inbound' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                          movement.type === 'outbound' ? 'bg-gradient-to-br from-orange-500 to-amber-500' :
                          movement.type === 'transfer' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                          'bg-gradient-to-br from-purple-500 to-violet-500'
                        }`}>
                          <TypeIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{movement.product}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">{movement.id}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{movement.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${typeBadge.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeBadge.label}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">From</div>
                        <div className="font-medium text-gray-900 text-sm">{movement.fromLocation}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">To</div>
                        <div className="font-medium text-gray-900 text-sm">{movement.toLocation}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Quantity</div>
                        <div className={`font-semibold text-lg ${
                          movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Value</div>
                        <div className={`font-medium text-sm ${
                          movement.totalValue > 0 ? 'text-green-600' : movement.totalValue < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {movement.totalValue > 0 ? '+' : ''}${Math.abs(movement.totalValue).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Ref: <span className="font-medium text-gray-900">{movement.reference}</span>
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">
                          By: <span className="font-medium text-gray-900">{movement.operator}</span>
                        </span>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${getStatusBadge(movement.status)}`}>
                        {movement.status}
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgressCard
              label={netStockChangeData.label}
              current={netStockChangeData.current}
              target={netStockChangeData.target}
              subtitle={netStockChangeData.subtitle}
            />

            <MiniKPI
              title="Movement Velocity"
              value="2.8K/day"
              change="+18.2%"
              trend="up"
              subtitle="Average daily"
            />

            <RankingList
              title="Movement Summary"
              items={movementSummary}
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
