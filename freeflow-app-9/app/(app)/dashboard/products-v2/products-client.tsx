"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  RankingList,
  ComparisonCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  BarChart3,
  Settings,
  Plus,
  Eye,
  ShoppingCart,
  Award,
  Zap
} from 'lucide-react'
import { useProducts, useProductStats, type Product } from '@/lib/hooks/use-products'
import { updateProductStatus } from '@/app/actions/products'

interface ProductsClientProps {
  initialProducts: Product[]
}

export default function ProductsClient({ initialProducts }: ProductsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'active' | 'draft' | 'archived'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Use hooks for real-time data
  const { data: products } = useProducts({
    status: selectedCategory === 'all' ? undefined : selectedCategory,
    searchQuery: searchQuery || undefined
  })
  const { stats } = useProductStats()

  const displayProducts = products || initialProducts

  const filteredProducts = selectedCategory === 'all'
    ? displayProducts
    : displayProducts.filter(product => product.status === selectedCategory)

  const statItems = [
    { label: 'Total Products', value: stats?.totalProducts?.toString() || displayProducts.length.toString(), change: 28.4, icon: <Package className="w-5 h-5" /> },
    { label: 'Total Revenue', value: stats?.totalRevenue ? `$${(stats.totalRevenue / 1000000).toFixed(1)}M` : '$0', change: 42.1, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Active Users', value: stats?.totalUsers ? `${(stats.totalUsers / 1000).toFixed(0)}K` : '0', change: 35.3, icon: <Users className="w-5 h-5" /> },
    { label: 'Avg Rating', value: stats?.averageRating?.toFixed(1) || '0', change: 12.5, icon: <Star className="w-5 h-5" /> }
  ]

  const topProducts = displayProducts
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 5)
    .map((product, index) => ({
      rank: index + 1,
      name: product.product_name,
      avatar: product.category === 'subscription' ? '📦' : product.category === 'bundle' ? '🎁' : '💎',
      value: `$${(product.total_revenue / 1000).toFixed(0)}K`,
      change: product.growth_rate
    }))

  const maxRevenue = Math.max(...displayProducts.map(p => p.total_revenue), 1)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'draft': return 'bg-yellow-100 text-yellow-700'
      case 'archived': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'subscription': return 'bg-blue-100 text-blue-700'
      case 'one_time': return 'bg-green-100 text-green-700'
      case 'add_on': return 'bg-purple-100 text-purple-700'
      case 'bundle': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getGradientColor = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-gray-500 to-slate-500'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Package className="w-10 h-10 text-violet-600" />
              Product Management
            </h1>
            <p className="text-muted-foreground">Manage catalog, pricing, and product performance</p>
          </div>
          <GradientButton from="violet" to="purple" onClick={() => console.log('New product')}>
            <Plus className="w-5 h-5 mr-2" />
            New Product
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={statItems} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Package />} title="Catalog" description="All products" onClick={() => console.log('Catalog')} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Performance" onClick={() => console.log('Analytics')} />
          <BentoQuickAction icon={<DollarSign />} title="Pricing" description="Strategies" onClick={() => console.log('Pricing')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedCategory === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('all')}>
            All Products
          </PillButton>
          <PillButton variant={selectedCategory === 'active' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('active')}>
            <Zap className="w-4 h-4 mr-2" />
            Active
          </PillButton>
          <PillButton variant={selectedCategory === 'draft' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('draft')}>
            Draft
          </PillButton>
          <PillButton variant={selectedCategory === 'archived' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('archived')}>
            Archived
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Product Performance</h3>
              <div className="space-y-4">
                {filteredProducts.map((product, index) => {
                  const revenuePercent = (product.total_revenue / maxRevenue) * 100

                  return (
                    <div key={product.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getGradientColor(index)} flex items-center justify-center text-white`}>
                                <Package className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{product.product_name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-md ${getCategoryBadgeColor(product.category)}`}>
                                    {product.category.replace('_', ' ')}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(product.status)}`}>
                                    {product.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-violet-600">${product.price}</p>
                            <div className="flex items-center gap-1 text-xs">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{product.average_rating}</span>
                              <span className="text-muted-foreground">({product.total_reviews})</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Active Users</p>
                            <p className="font-semibold">{product.active_users.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Revenue</p>
                            <p className="font-semibold">${(product.total_revenue / 1000).toFixed(0)}K</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Growth</p>
                            <p className={`font-semibold ${product.growth_rate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {product.growth_rate > 0 ? '+' : ''}{product.growth_rate}%
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Revenue Share</span>
                            <span className="font-semibold">{revenuePercent.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${getGradientColor(index)}`}
                              style={{ width: `${revenuePercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('View', product.id)}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', product.id)}>
                            Edit
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Analytics', product.id)}>
                            <BarChart3 className="w-3 h-3 mr-1" />
                            Analytics
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Product Categories</h3>
              <div className="space-y-4">
                {stats?.byCategory && Object.entries(stats.byCategory).map(([category, count]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold capitalize">{category.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground">{count} products</p>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${(count / (stats.totalProducts || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="Top Products" items={topProducts} />

            <ComparisonCard
              title="Revenue Comparison"
              current={{ label: 'This Month', value: stats?.totalRevenue || 0 }}
              previous={{ label: 'Last Month', value: (stats?.totalRevenue || 0) * 0.8 }}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Product Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Active Products" value={stats?.activeProducts?.toString() || '0'} change={22.7} />
                <MiniKPI label="Avg Rating" value={stats?.averageRating?.toFixed(1) || '0'} change={12.5} />
                <MiniKPI label="Total Users" value={`${((stats?.totalUsers || 0) / 1000).toFixed(0)}K`} change={35.3} />
                <MiniKPI label="Total Revenue" value={`$${((stats?.totalRevenue || 0) / 1000000).toFixed(1)}M`} change={42.1} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Pricing')}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Update Pricing
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Features')}>
                  <Award className="w-4 h-4 mr-2" />
                  Manage Features
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Inventory')}>
                  <Package className="w-4 h-4 mr-2" />
                  Check Inventory
                </ModernButton>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
