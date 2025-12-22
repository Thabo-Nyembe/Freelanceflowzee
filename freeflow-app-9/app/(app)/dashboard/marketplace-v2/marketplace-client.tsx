'use client'

import { useState } from 'react'
import { useMarketplaceApps, useFeaturedApps, useMarketplaceReviews, useAppCategories, type MarketplaceApp, type MarketplaceReview, type AppCategory } from '@/lib/hooks/use-marketplace'
import { BentoCard, BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { StatGrid, MiniKPI, RankingList } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
import {
  Store,
  Star,
  Download,
  TrendingUp,
  DollarSign,
  Users,
  Search,
  Package,
  Award,
  Zap,
  Shield,
  ExternalLink
} from 'lucide-react'

interface MarketplaceClientProps {
  initialApps: MarketplaceApp[]
  initialFeaturedApps: MarketplaceApp[]
}

export default function MarketplaceClient({ initialApps, initialFeaturedApps }: MarketplaceClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { apps, loading } = useMarketplaceApps({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    status: 'published',
    searchQuery
  })
  const { featuredApps } = useFeaturedApps()
  const { categories } = useAppCategories()

  const displayApps = apps.length > 0 ? apps : initialApps
  const displayFeatured = featuredApps.length > 0 ? featuredApps : initialFeaturedApps

  const totalDownloads = displayApps.reduce((sum, a) => sum + (a.total_downloads || 0), 0)
  const avgRating = displayApps.length > 0
    ? displayApps.reduce((sum, a) => sum + (a.average_rating || 0), 0) / displayApps.length
    : 0
  const totalRevenue = displayApps.reduce((sum, a) => sum + ((a.price || 0) * (a.total_installs || 0)), 0)

  const stats = [
    { label: 'Total Apps', value: displayApps.length.toLocaleString(), change: 42.3, icon: <Package className="w-5 h-5" /> },
    { label: 'Downloads', value: totalDownloads > 1000 ? `${(totalDownloads / 1000).toFixed(0)}K` : totalDownloads.toString(), change: 68.7, icon: <Download className="w-5 h-5" /> },
    { label: 'Avg Rating', value: avgRating.toFixed(1), change: 8.3, icon: <Star className="w-5 h-5" /> },
    { label: 'Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}K`, change: 35.2, icon: <DollarSign className="w-5 h-5" /> }
  ]

  const topApps = [...displayApps]
    .sort((a, b) => (b.total_downloads || 0) - (a.total_downloads || 0))
    .slice(0, 5)
    .map((app, index) => ({
      rank: index + 1,
      name: app.app_name,
      avatar: app.icon_url || '📦',
      value: `${((app.total_downloads || 0) / 1000).toFixed(0)}K`,
      change: 15 + Math.random() * 50
    }))

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'productivity': return <Zap className="w-5 h-5" />
      case 'analytics': return <TrendingUp className="w-5 h-5" />
      case 'marketing': return <Award className="w-5 h-5" />
      case 'security': return <Shield className="w-5 h-5" />
      case 'collaboration': return <Users className="w-5 h-5" />
      default: return <Package className="w-5 h-5" />
    }
  }

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'productivity': return 'from-blue-500 to-cyan-500'
      case 'analytics': return 'from-purple-500 to-pink-500'
      case 'marketing': return 'from-orange-500 to-red-500'
      case 'security': return 'from-red-500 to-orange-500'
      case 'collaboration': return 'from-green-500 to-emerald-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const maxDownloads = Math.max(...displayApps.map(a => a.total_downloads || 0), 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Store className="w-10 h-10 text-violet-600" />
              App Marketplace
            </h1>
            <p className="text-muted-foreground">Discover and install powerful apps and extensions</p>
          </div>
          <GradientButton from="violet" to="purple" onClick={() => console.log('Submit app')}>
            <Package className="w-5 h-5 mr-2" />
            Submit Your App
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Store />} title="Browse" description="All apps" onClick={() => setSelectedCategory('all')} />
          <BentoQuickAction icon={<Download />} title="Installed" description="Your apps" onClick={() => console.log('Installed')} />
          <BentoQuickAction icon={<Award />} title="Featured" description="Top picks" onClick={() => console.log('Featured')} />
          <BentoQuickAction icon={<TrendingUp />} title="Trending" description="Popular" onClick={() => console.log('Trending')} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <PillButton variant={selectedCategory === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('all')}>
              All Apps
            </PillButton>
            <PillButton variant={selectedCategory === 'productivity' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('productivity')}>
              <Zap className="w-4 h-4 mr-2" />
              Productivity
            </PillButton>
            <PillButton variant={selectedCategory === 'analytics' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('analytics')}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </PillButton>
            <PillButton variant={selectedCategory === 'marketing' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('marketing')}>
              Marketing
            </PillButton>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search marketplace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Apps</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayApps.slice(0, 8).map((app) => {
                  const downloadPercent = maxDownloads > 0 ? ((app.total_downloads || 0) / maxDownloads) * 100 : 0

                  return (
                    <div key={app.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getCategoryColor(app.category)} flex items-center justify-center text-2xl text-white`}>
                              {app.icon_url ? '📦' : getCategoryIcon(app.category)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{app.app_name}</h4>
                                {app.is_verified && (
                                  <Shield className="w-4 h-4 text-blue-600" title="Verified" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{app.developer_name || 'Unknown'}</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">{app.short_description || app.description}</p>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold">{(app.average_rating || 0).toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({app.total_reviews || 0})</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Download className="w-3 h-3" />
                            <span>{((app.total_downloads || 0) / 1000).toFixed(0)}K</span>
                          </div>
                        </div>

                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getCategoryColor(app.category)}`}
                            style={{ width: `${downloadPercent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div>
                            <p className="text-lg font-bold text-violet-600">
                              {app.pricing_model === 'free' ? 'Free' : `$${(app.price || 0).toFixed(2)}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <ModernButton variant="outline" size="sm" onClick={() => console.log('View', app.id)}>
                              View
                            </ModernButton>
                            <ModernButton variant="primary" size="sm" onClick={() => console.log('Install', app.id)}>
                              <Download className="w-3 h-3 mr-1" />
                              Install
                            </ModernButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {displayApps.length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Apps Found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name as AppCategory)}
                    className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getCategoryColor(category.name)} flex items-center justify-center text-white mb-3`}>
                      {getCategoryIcon(category.name)}
                    </div>
                    <h4 className="font-semibold mb-1">{category.label}</h4>
                    <p className="text-xs text-muted-foreground">{category.count} apps</p>
                  </button>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Most Downloaded" items={topApps} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Marketplace Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Downloads" value={`${(totalDownloads / 1000).toFixed(0)}K`} change={68.7} />
                <MiniKPI label="Active Developers" value={[...new Set(displayApps.map(a => a.developer_email))].length.toString()} change={42.3} />
                <MiniKPI label="Avg App Rating" value={`${avgRating.toFixed(1)}/5`} change={8.3} />
                <MiniKPI label="Revenue Share" value={`$${(totalRevenue / 1000).toFixed(1)}K`} change={35.2} />
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Submit')}>
                  <Package className="w-4 h-4 mr-2" />
                  Submit Your App
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Developer')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Developer Portal
                </ModernButton>
                <ModernButton variant="outline" className="w-full justify-start" onClick={() => console.log('Guidelines')}>
                  <Shield className="w-4 h-4 mr-2" />
                  App Guidelines
                </ModernButton>
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Featured Collections</h3>
              <div className="space-y-3">
                <button className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-left hover:opacity-90 transition-opacity">
                  <p className="font-semibold mb-1">Staff Picks</p>
                  <p className="text-xs opacity-90">{displayFeatured.length} hand-selected apps</p>
                </button>
                <button className="w-full p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-left hover:opacity-90 transition-opacity">
                  <p className="font-semibold mb-1">New This Week</p>
                  <p className="text-xs opacity-90">Recently added</p>
                </button>
                <button className="w-full p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-left hover:opacity-90 transition-opacity">
                  <p className="font-semibold mb-1">Essential Tools</p>
                  <p className="text-xs opacity-90">Must-have apps</p>
                </button>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
