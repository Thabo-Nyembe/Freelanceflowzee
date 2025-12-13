"use client"

import { useState } from 'react'
import {
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  BarChart3,
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  Calendar,
  Truck,
  ShoppingCart,
  Box,
  Zap
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type InventoryStatus = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued'
type ProductCategory = 'all' | 'electronics' | 'clothing' | 'food' | 'books' | 'home'

export default function InventoryV2Page() {
  const [status, setStatus] = useState<InventoryStatus>('all')
  const [category, setCategory] = useState<ProductCategory>('all')

  const stats = [
    {
      label: 'Total Products',
      value: '2,847',
      change: '+18.2%',
      trend: 'up' as const,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      label: 'Total Value',
      value: '$847.2K',
      change: '+24.7%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      label: 'Low Stock Items',
      value: '47',
      change: '-12.4%',
      trend: 'down' as const,
      icon: AlertTriangle,
      color: 'text-yellow-600'
    },
    {
      label: 'Turnover Rate',
      value: '8.4x',
      change: '+15.8%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ]

  const quickActions = [
    {
      label: 'Add Product',
      description: 'Create new inventory item',
      icon: Plus,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Bulk Import',
      description: 'Upload CSV/Excel file',
      icon: Upload,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Stock Take',
      description: 'Conduct inventory audit',
      icon: CheckCircle2,
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'Export Report',
      description: 'Download inventory data',
      icon: Download,
      color: 'from-orange-500 to-amber-500'
    },
    {
      label: 'Reorder Alert',
      description: 'Set stock thresholds',
      icon: AlertTriangle,
      color: 'from-red-500 to-pink-500'
    },
    {
      label: 'Analytics',
      description: 'View inventory insights',
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Quick Adjust',
      description: 'Adjust stock levels',
      icon: Zap,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      label: 'Suppliers',
      description: 'Manage supplier list',
      icon: Truck,
      color: 'from-pink-500 to-rose-500'
    }
  ]

  const inventoryItems = [
    {
      id: 'INV-2847',
      sku: 'ELEC-LPT-001',
      name: 'MacBook Pro 16" M3',
      category: 'electronics',
      quantity: 847,
      reorderPoint: 200,
      unitPrice: 2499.00,
      totalValue: 2116353,
      supplier: 'Apple Inc.',
      warehouse: 'Warehouse A',
      lastRestocked: '2024-02-10',
      status: 'in-stock',
      turnoverRate: 12.4,
      daysInStock: 45
    },
    {
      id: 'INV-2846',
      sku: 'CLTH-TSH-042',
      name: 'Premium Cotton T-Shirt',
      category: 'clothing',
      quantity: 38,
      reorderPoint: 50,
      unitPrice: 29.99,
      totalValue: 1139.62,
      supplier: 'Fashion Wholesale Co.',
      warehouse: 'Warehouse B',
      lastRestocked: '2024-01-28',
      status: 'low-stock',
      turnoverRate: 18.7,
      daysInStock: 72
    },
    {
      id: 'INV-2845',
      sku: 'FOOD-SNK-127',
      name: 'Organic Protein Bars (Box of 12)',
      category: 'food',
      quantity: 0,
      reorderPoint: 100,
      unitPrice: 24.99,
      totalValue: 0,
      supplier: 'Healthy Foods Ltd.',
      warehouse: 'Warehouse C',
      lastRestocked: '2024-01-15',
      status: 'out-of-stock',
      turnoverRate: 24.2,
      daysInStock: 98
    },
    {
      id: 'INV-2844',
      sku: 'BOOK-FIC-289',
      name: 'The Great Adventure - Hardcover',
      category: 'books',
      quantity: 284,
      reorderPoint: 50,
      unitPrice: 19.99,
      totalValue: 5677.16,
      supplier: 'Publishing House Inc.',
      warehouse: 'Warehouse A',
      lastRestocked: '2024-02-12',
      status: 'in-stock',
      turnoverRate: 6.8,
      daysInStock: 28
    },
    {
      id: 'INV-2843',
      sku: 'HOME-DCR-456',
      name: 'Decorative Table Lamp',
      category: 'home',
      quantity: 124,
      reorderPoint: 30,
      unitPrice: 49.99,
      totalValue: 6198.76,
      supplier: 'Home Decor Suppliers',
      warehouse: 'Warehouse B',
      lastRestocked: '2024-02-08',
      status: 'in-stock',
      turnoverRate: 9.2,
      daysInStock: 38
    },
    {
      id: 'INV-2842',
      sku: 'ELEC-PHN-782',
      name: 'Wireless Headphones Pro',
      category: 'electronics',
      quantity: 42,
      reorderPoint: 75,
      unitPrice: 299.99,
      totalValue: 12599.58,
      supplier: 'Audio Tech Co.',
      warehouse: 'Warehouse A',
      lastRestocked: '2024-01-30',
      status: 'low-stock',
      turnoverRate: 15.3,
      daysInStock: 64
    },
    {
      id: 'INV-2841',
      sku: 'CLTH-JCK-901',
      name: 'Winter Jacket - Premium',
      category: 'clothing',
      quantity: 187,
      reorderPoint: 40,
      unitPrice: 149.99,
      totalValue: 28048.13,
      supplier: 'Fashion Wholesale Co.',
      warehouse: 'Warehouse B',
      lastRestocked: '2024-02-14',
      status: 'in-stock',
      turnoverRate: 7.4,
      daysInStock: 22
    },
    {
      id: 'INV-2840',
      sku: 'FOOD-BVG-334',
      name: 'Premium Coffee Beans 1kg',
      category: 'food',
      quantity: 524,
      reorderPoint: 150,
      unitPrice: 34.99,
      totalValue: 18334.76,
      supplier: 'Coffee Importers LLC',
      warehouse: 'Warehouse C',
      lastRestocked: '2024-02-11',
      status: 'in-stock',
      turnoverRate: 20.1,
      daysInStock: 18
    },
    {
      id: 'INV-2839',
      sku: 'BOOK-EDU-567',
      name: 'Programming Guide 2024',
      category: 'books',
      quantity: 15,
      reorderPoint: 25,
      unitPrice: 59.99,
      totalValue: 899.85,
      supplier: 'Tech Publishers Inc.',
      warehouse: 'Warehouse A',
      lastRestocked: '2024-01-20',
      status: 'low-stock',
      turnoverRate: 11.8,
      daysInStock: 82
    },
    {
      id: 'INV-2838',
      sku: 'HOME-KIT-892',
      name: 'Stainless Steel Cookware Set',
      category: 'home',
      quantity: 847,
      reorderPoint: 60,
      unitPrice: 199.99,
      totalValue: 169391.53,
      supplier: 'Kitchenware Direct',
      warehouse: 'Warehouse B',
      lastRestocked: '2024-02-15',
      status: 'in-stock',
      turnoverRate: 5.6,
      daysInStock: 12
    }
  ]

  const filteredItems = inventoryItems.filter(item => {
    const statusMatch = status === 'all' || item.status === status
    const categoryMatch = category === 'all' || item.category === category
    return statusMatch && categoryMatch
  })

  const getStatusBadge = (status: string, quantity: number, reorderPoint: number) => {
    if (status === 'out-of-stock' || quantity === 0) {
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertTriangle,
        label: 'Out of Stock'
      }
    }
    if (status === 'low-stock' || quantity <= reorderPoint) {
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertTriangle,
        label: 'Low Stock'
      }
    }
    if (status === 'discontinued') {
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: AlertTriangle,
        label: 'Discontinued'
      }
    }
    return {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle2,
      label: 'In Stock'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'electronics':
        return Package
      case 'clothing':
        return ShoppingCart
      case 'food':
        return Box
      case 'books':
        return Box
      case 'home':
        return Box
      default:
        return Package
    }
  }

  const getStockHealth = (quantity: number, reorderPoint: number) => {
    if (quantity === 0) return 0
    const percentage = (quantity / (reorderPoint * 2)) * 100
    return Math.min(percentage, 100)
  }

  const recentActivity = [
    { label: 'Low stock alert triggered', time: '2 hours ago', color: 'text-yellow-600' },
    { label: 'New product added', time: '5 hours ago', color: 'text-green-600' },
    { label: 'Stock adjusted', time: '1 day ago', color: 'text-blue-600' },
    { label: 'Restock completed', time: '2 days ago', color: 'text-purple-600' },
    { label: 'Product discontinued', time: '3 days ago', color: 'text-gray-600' }
  ]

  const topProductsByValue = [
    { label: 'MacBook Pro 16"', value: '$2.1M', color: 'bg-blue-500' },
    { label: 'Cookware Set', value: '$169.4K', color: 'bg-green-500' },
    { label: 'Winter Jacket', value: '$28.0K', color: 'bg-purple-500' },
    { label: 'Coffee Beans', value: '$18.3K', color: 'bg-orange-500' },
    { label: 'Headphones Pro', value: '$12.6K', color: 'bg-cyan-500' }
  ]

  const stockHealthData = {
    label: 'Overall Stock Health',
    current: 87.4,
    target: 95,
    subtitle: 'Across all categories'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Inventory Management
            </h1>
            <p className="text-gray-600 mt-2">Track and manage product stock levels</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Product
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Stock Status</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setStatus('all')}
                  isActive={status === 'all'}
                  variant="default"
                >
                  All Products
                </PillButton>
                <PillButton
                  onClick={() => setStatus('in-stock')}
                  isActive={status === 'in-stock'}
                  variant="default"
                >
                  In Stock
                </PillButton>
                <PillButton
                  onClick={() => setStatus('low-stock')}
                  isActive={status === 'low-stock'}
                  variant="default"
                >
                  Low Stock
                </PillButton>
                <PillButton
                  onClick={() => setStatus('out-of-stock')}
                  isActive={status === 'out-of-stock'}
                  variant="default"
                >
                  Out of Stock
                </PillButton>
                <PillButton
                  onClick={() => setStatus('discontinued')}
                  isActive={status === 'discontinued'}
                  variant="default"
                >
                  Discontinued
                </PillButton>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setCategory('all')}
                  isActive={category === 'all'}
                  variant="default"
                >
                  All Categories
                </PillButton>
                <PillButton
                  onClick={() => setCategory('electronics')}
                  isActive={category === 'electronics'}
                  variant="default"
                >
                  Electronics
                </PillButton>
                <PillButton
                  onClick={() => setCategory('clothing')}
                  isActive={category === 'clothing'}
                  variant="default"
                >
                  Clothing
                </PillButton>
                <PillButton
                  onClick={() => setCategory('food')}
                  isActive={category === 'food'}
                  variant="default"
                >
                  Food & Beverage
                </PillButton>
                <PillButton
                  onClick={() => setCategory('books')}
                  isActive={category === 'books'}
                  variant="default"
                >
                  Books
                </PillButton>
                <PillButton
                  onClick={() => setCategory('home')}
                  isActive={category === 'home'}
                  variant="default"
                >
                  Home & Living
                </PillButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inventory List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Inventory Items</h2>
              <div className="text-sm text-gray-600">
                {filteredItems.length} products
              </div>
            </div>

            <div className="space-y-3">
              {filteredItems.map((item) => {
                const statusBadge = getStatusBadge(item.status, item.quantity, item.reorderPoint)
                const StatusIcon = statusBadge.icon
                const CategoryIcon = getCategoryIcon(item.category)
                const stockHealth = getStockHealth(item.quantity, item.reorderPoint)

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-blue-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                          <CategoryIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">{item.sku}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500 capitalize">{item.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.label}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Quantity</div>
                        <div className={`font-semibold text-lg ${
                          item.quantity === 0 ? 'text-red-600' : item.quantity <= item.reorderPoint ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {item.quantity.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Unit Price</div>
                        <div className="font-medium text-gray-900">${item.unitPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Total Value</div>
                        <div className="font-medium text-gray-900">${item.totalValue.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Turnover</div>
                        <div className="font-medium text-blue-600">{item.turnoverRate}x</div>
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

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                      <div className="grid grid-cols-3 gap-4 flex-1">
                        <div>
                          <span className="text-gray-600">Warehouse: </span>
                          <span className="font-medium text-gray-900">{item.warehouse}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Supplier: </span>
                          <span className="font-medium text-gray-900">{item.supplier}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Restocked: </span>
                          <span className="font-medium text-gray-900">{item.lastRestocked}</span>
                        </div>
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
              label={stockHealthData.label}
              current={stockHealthData.current}
              target={stockHealthData.target}
              subtitle={stockHealthData.subtitle}
            />

            <MiniKPI
              title="Turnover Rate"
              value="8.4x"
              change="+15.8%"
              trend="up"
              subtitle="Annual average"
            />

            <RankingList
              title="Top Products by Value"
              items={topProductsByValue}
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
