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
  Target,
  Zap
} from 'lucide-react'

/**
 * Products V2 - Groundbreaking Product Management
 * Showcases product catalog, performance metrics, and optimization
 */
export default function ProductsV2() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'active' | 'draft' | 'archived'>('all')

  const stats = [
    { label: 'Total Products', value: '847', change: 28.4, icon: <Package className="w-5 h-5" /> },
    { label: 'Total Revenue', value: '$2.4M', change: 42.1, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Active Users', value: '124K', change: 35.3, icon: <Users className="w-5 h-5" /> },
    { label: 'Avg Rating', value: '4.8', change: 12.5, icon: <Star className="w-5 h-5" /> }
  ]

  const products = [
    {
      id: '1',
      name: 'Premium Workspace Pro',
      category: 'Subscription',
      status: 'active',
      price: 49.99,
      users: 34700,
      revenue: 1735053,
      rating: 4.9,
      reviews: 2847,
      growth: 42.3,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2',
      name: 'Enterprise Suite',
      category: 'Subscription',
      status: 'active',
      price: 199.99,
      users: 8900,
      revenue: 1779911,
      rating: 4.8,
      reviews: 1247,
      growth: 35.1,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '3',
      name: 'Starter Pack',
      category: 'One-time',
      status: 'active',
      price: 29.99,
      users: 67200,
      revenue: 2015328,
      rating: 4.7,
      reviews: 4562,
      growth: 28.5,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '4',
      name: 'Analytics Add-on',
      category: 'Add-on',
      status: 'active',
      price: 19.99,
      users: 12400,
      revenue: 247876,
      rating: 4.6,
      reviews: 847,
      growth: 22.7,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '5',
      name: 'Legacy Plan',
      category: 'Subscription',
      status: 'archived',
      price: 39.99,
      users: 847,
      revenue: 33864,
      rating: 4.2,
      reviews: 124,
      growth: -15.3,
      color: 'from-gray-500 to-slate-500'
    }
  ]

  const categories = [
    {
      name: 'Subscriptions',
      products: 247,
      revenue: 3514964,
      users: 43600,
      color: 'from-blue-500 to-cyan-500',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      name: 'One-time Purchases',
      products: 124,
      revenue: 2015328,
      users: 67200,
      color: 'from-green-500 to-emerald-500',
      icon: <ShoppingCart className="w-5 h-5" />
    },
    {
      name: 'Add-ons',
      products: 89,
      revenue: 247876,
      users: 12400,
      color: 'from-purple-500 to-pink-500',
      icon: <Plus className="w-5 h-5" />
    },
    {
      name: 'Bundles',
      products: 34,
      revenue: 847234,
      users: 8900,
      color: 'from-orange-500 to-red-500',
      icon: <Package className="w-5 h-5" />
    }
  ]

  const topProducts = [
    { rank: 1, name: 'Starter Pack', avatar: '📦', value: '$2.0M', change: 28.5 },
    { rank: 2, name: 'Enterprise Suite', avatar: '🏢', value: '$1.8M', change: 35.1 },
    { rank: 3, name: 'Premium Workspace', avatar: '💎', value: '$1.7M', change: 42.3 },
    { rank: 4, name: 'Team Bundle', avatar: '👥', value: '$847K', change: 22.7 },
    { rank: 5, name: 'Analytics Add-on', avatar: '📊', value: '$248K', change: 22.7 }
  ]

  const performanceMetrics = [
    {
      metric: 'Conversion Rate',
      value: '12.4%',
      target: 15.0,
      current: 12.4,
      trend: 'up',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      metric: 'Customer LTV',
      value: '$1,247',
      target: 1500,
      current: 1247,
      trend: 'up',
      color: 'from-green-500 to-emerald-500'
    },
    {
      metric: 'Churn Rate',
      value: '4.2%',
      target: 3.0,
      current: 4.2,
      trend: 'down',
      color: 'from-red-500 to-orange-500'
    },
    {
      metric: 'Product Adoption',
      value: '87%',
      target: 90,
      current: 87,
      trend: 'up',
      color: 'from-purple-500 to-pink-500'
    }
  ]

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
      case 'Subscription': return 'bg-blue-100 text-blue-700'
      case 'One-time': return 'bg-green-100 text-green-700'
      case 'Add-on': return 'bg-purple-100 text-purple-700'
      case 'Bundle': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const maxRevenue = Math.max(...products.map(p => p.revenue))
  const maxCategoryRevenue = Math.max(...categories.map(c => c.revenue))

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 p-6">
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

        <StatGrid columns={4} stats={stats} />

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
                {products.map((product) => {
                  const revenuePercent = (product.revenue / maxRevenue) * 100

                  return (
                    <div key={product.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${product.color} flex items-center justify-center text-white`}>
                                <Package className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{product.name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-md ${getCategoryBadgeColor(product.category)}`}>
                                    {product.category}
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
                              <span className="font-semibold">{product.rating}</span>
                              <span className="text-muted-foreground">({product.reviews})</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Active Users</p>
                            <p className="font-semibold">{product.users.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Revenue</p>
                            <p className="font-semibold">${(product.revenue / 1000).toFixed(0)}K</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Growth</p>
                            <p className={`font-semibold ${product.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {product.growth > 0 ? '+' : ''}{product.growth}%
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
                              className={`h-full bg-gradient-to-r ${product.color}`}
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

            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Product Categories</h3>
              <div className="space-y-4">
                {categories.map((category) => {
                  const revenuePercent = (category.revenue / maxCategoryRevenue) * 100

                  return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-white`}>
                            {category.icon}
                          </div>
                          <div>
                            <p className="font-semibold">{category.name}</p>
                            <p className="text-xs text-muted-foreground">{category.products} products</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${(category.revenue / 1000000).toFixed(1)}M</p>
                          <p className="text-xs text-muted-foreground">{category.users.toLocaleString()} users</p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${category.color} transition-all duration-300`}
                          style={{ width: `${revenuePercent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {performanceMetrics.map((metric) => {
                  const progress = (metric.current / metric.target) * 100

                  return (
                    <div key={metric.metric} className="p-4 rounded-lg border border-border bg-background">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{metric.metric}</span>
                          <span className="text-2xl font-bold">{metric.value}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Target: {metric.target}{metric.metric.includes('Rate') ? '%' : metric.metric.includes('LTV') ? '' : ''}</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${metric.color}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Top Products" items={topProducts} />

            <ComparisonCard
              title="Revenue Comparison"
              current={{ label: 'This Month', value: 5625168 }}
              previous={{ label: 'Last Month', value: 4247382 }}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Product Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Order Value" value="$127" change={22.7} />
                <MiniKPI label="Cart Abandonment" value="34%" change={-15.3} />
                <MiniKPI label="Return Rate" value="2.4%" change={-8.5} />
                <MiniKPI label="NPS Score" value="67" change={12.1} />
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
