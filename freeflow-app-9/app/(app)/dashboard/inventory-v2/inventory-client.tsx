'use client'

import { useState } from 'react'
import { useInventory, type InventoryItem, type InventoryStatus } from '@/lib/hooks/use-inventory'
import { BentoCard, BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { StatGrid, MiniKPI, ActivityFeed, RankingList, ProgressCard } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
import {
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  BarChart3,
  Download,
  Upload,
  Plus,
  Search,
  Truck,
  ShoppingCart,
  Box,
  Zap
} from 'lucide-react'

export default function InventoryClient({ initialInventory }: { initialInventory: InventoryItem[] }) {
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all')
  const { inventory, loading, error } = useInventory({ status: statusFilter, category: categoryFilter })

  const displayInventory = inventory.length > 0 ? inventory : initialInventory

  const stats = [
    {
      label: 'Total Products',
      value: displayInventory.length.toString(),
      change: 18.2,
      icon: <Package className="w-5 h-5" />
    },
    {
      label: 'Total Value',
      value: `$${(displayInventory.reduce((sum, i) => sum + i.total_value, 0) / 1000).toFixed(1)}K`,
      change: 24.7,
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      label: 'Low Stock Items',
      value: displayInventory.filter(i => i.status === 'low-stock').length.toString(),
      change: -12.4,
      icon: <AlertTriangle className="w-5 h-5" />
    },
    {
      label: 'Turnover Rate',
      value: displayInventory.length > 0
        ? `${(displayInventory.reduce((sum, i) => sum + i.turnover_rate, 0) / displayInventory.length).toFixed(1)}x`
        : '0x',
      change: 15.8,
      icon: <TrendingUp className="w-5 h-5" />
    }
  ]

  const getStatusBadge = (status: InventoryStatus, quantity: number, reorderPoint: number) => {
    if (status === 'out-of-stock' || quantity === 0) {
      return {
        color: 'bg-red-100 text-red-800',
        icon: AlertTriangle,
        label: 'Out of Stock'
      }
    }
    if (status === 'low-stock' || quantity <= reorderPoint) {
      return {
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertTriangle,
        label: 'Low Stock'
      }
    }
    if (status === 'discontinued') {
      return {
        color: 'bg-gray-100 text-gray-800',
        icon: AlertTriangle,
        label: 'Discontinued'
      }
    }
    return {
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle2,
      label: 'In Stock'
    }
  }

  const getCategoryIcon = (category: string | null) => {
    if (!category) return Package
    if (category.includes('electronics')) return Package
    if (category.includes('clothing')) return ShoppingCart
    return Box
  }

  const getStockHealth = (quantity: number, reorderPoint: number) => {
    if (quantity === 0) return 0
    const percentage = (quantity / (reorderPoint * 2)) * 100
    return Math.min(percentage, 100)
  }

  const topProductsByValue = displayInventory
    .sort((a, b) => b.total_value - a.total_value)
    .slice(0, 5)
    .map((item) => ({
      label: item.product_name,
      value: `$${(item.total_value / 1000).toFixed(1)}K`,
      color: 'bg-blue-500'
    }))

  const recentActivity = displayInventory.slice(0, 4).map((i) => ({
    icon: <Package className="w-5 h-5" />,
    title: i.status === 'low-stock' ? 'Low stock alert' : 'Stock updated',
    description: i.product_name,
    time: new Date(i.updated_at).toLocaleDateString(),
    status: (i.status === 'in-stock' ? 'success' : i.status === 'out-of-stock' ? 'error' : 'warning') as const
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Package className="w-10 h-10 text-blue-600" />
              Inventory Management
            </h1>
            <p className="text-muted-foreground">Track and manage product stock levels</p>
          </div>
          <GradientButton from="blue" to="cyan" onClick={() => console.log('Add product')}>
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="Add Product" description="Create new item" onClick={() => console.log('Add')} />
          <BentoQuickAction icon={<Upload />} title="Bulk Import" description="Upload CSV" onClick={() => console.log('Import')} />
          <BentoQuickAction icon={<CheckCircle2 />} title="Stock Take" description="Inventory audit" onClick={() => console.log('Audit')} />
          <BentoQuickAction icon={<Download />} title="Export" description="Download data" onClick={() => console.log('Export')} />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <PillButton variant={statusFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('all')}>
            All Products
          </PillButton>
          <PillButton variant={statusFilter === 'in-stock' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('in-stock')}>
            In Stock
          </PillButton>
          <PillButton variant={statusFilter === 'low-stock' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('low-stock')}>
            Low Stock
          </PillButton>
          <PillButton variant={statusFilter === 'out-of-stock' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('out-of-stock')}>
            Out of Stock
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {displayInventory.map((item) => {
              const statusBadge = getStatusBadge(item.status, item.quantity, item.reorder_point)
              const StatusIcon = statusBadge.icon
              const CategoryIcon = getCategoryIcon(item.category)
              const stockHealth = getStockHealth(item.quantity, item.reorder_point)

              return (
                <BentoCard key={item.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                        <CategoryIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          {item.sku && <span className="text-sm text-gray-500">{item.sku}</span>}
                          {item.category && (
                            <>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500 capitalize">{item.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusBadge.label}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Quantity</div>
                      <div className={`font-semibold text-lg ${
                        item.quantity === 0 ? 'text-red-600' : item.quantity <= item.reorder_point ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {item.quantity.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Unit Price</div>
                      <div className="font-medium text-gray-900">${item.unit_price.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Total Value</div>
                      <div className="font-medium text-gray-900">${item.total_value.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Turnover</div>
                      <div className="font-medium text-blue-600">{item.turnover_rate}x</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Stock Health</span>
                      <span className="font-semibold text-gray-900">{stockHealth.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          stockHealth >= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          stockHealth >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          'bg-gradient-to-r from-red-500 to-pink-500'
                        }`}
                        style={{ width: `${stockHealth}%` }}
                      />
                    </div>
                  </div>

                  {item.warehouse && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-gray-600">Warehouse: </span>
                          <span className="font-medium text-gray-900">{item.warehouse}</span>
                        </div>
                        {item.supplier_name && (
                          <div>
                            <span className="text-gray-600">Supplier: </span>
                            <span className="font-medium text-gray-900">{item.supplier_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </BentoCard>
              )
            })}

            {displayInventory.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Inventory</h3>
                <p className="text-muted-foreground">Add your first product</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Stock Health"
              value={displayInventory.length}
              target={displayInventory.length + displayInventory.filter(i => i.status === 'out-of-stock').length}
              label="Products"
              color="from-blue-500 to-cyan-500"
            />

            <MiniKPI
              label="Turnover Rate"
              value={displayInventory.length > 0
                ? `${(displayInventory.reduce((sum, i) => sum + i.turnover_rate, 0) / displayInventory.length).toFixed(1)}x`
                : '0x'}
              change={15.8}
            />

            <RankingList title="Top Products by Value" items={topProductsByValue} />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />
          </div>
        </div>
      </div>
    </div>
  )
}
