"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  RankingList
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Store,
  Star,
  Download,
  TrendingUp,
  DollarSign,
  Users,
  Search,
  Filter,
  Package,
  Award,
  Zap,
  Shield,
  ExternalLink
} from 'lucide-react'

/**
 * Marketplace V2 - Groundbreaking App Marketplace
 * Showcases apps, extensions, and plugins with modern components
 */
export default function MarketplaceV2() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'featured' | 'popular' | 'new'>('all')

  const stats = [
    { label: 'Total Apps', value: '1,247', change: 42.3, icon: <Package className="w-5 h-5" /> },
    { label: 'Downloads', value: '847K', change: 68.7, icon: <Download className="w-5 h-5" /> },
    { label: 'Avg Rating', value: '4.7', change: 8.3, icon: <Star className="w-5 h-5" /> },
    { label: 'Revenue', value: '$2.4M', change: 35.2, icon: <DollarSign className="w-5 h-5" /> }
  ]

  const apps = [
    {
      id: '1',
      name: 'AI Content Generator Pro',
      description: 'Create high-quality content with advanced AI',
      category: 'featured',
      developer: 'InnovateLabs',
      price: 29.99,
      rating: 4.9,
      reviews: 2847,
      downloads: 124700,
      featured: true,
      verified: true,
      color: 'from-purple-500 to-pink-500',
      icon: '🤖'
    },
    {
      id: '2',
      name: 'Analytics Dashboard Plus',
      description: 'Advanced analytics and reporting tools',
      category: 'popular',
      developer: 'DataViz Inc',
      price: 49.99,
      rating: 4.8,
      reviews: 1892,
      downloads: 89200,
      featured: true,
      verified: true,
      color: 'from-blue-500 to-cyan-500',
      icon: '📊'
    },
    {
      id: '3',
      name: 'Team Collaboration Suite',
      description: 'Enhance team productivity and communication',
      category: 'popular',
      developer: 'TeamWorks',
      price: 19.99,
      rating: 4.7,
      reviews: 4562,
      downloads: 247000,
      featured: false,
      verified: true,
      color: 'from-green-500 to-emerald-500',
      icon: '👥'
    },
    {
      id: '4',
      name: 'Automated Workflows',
      description: 'Streamline processes with automation',
      category: 'new',
      developer: 'AutoFlow',
      price: 39.99,
      rating: 4.6,
      reviews: 892,
      downloads: 34700,
      featured: true,
      verified: true,
      color: 'from-orange-500 to-red-500',
      icon: '⚙️'
    },
    {
      id: '5',
      name: 'Security Scanner',
      description: 'Protect your data with advanced scanning',
      category: 'featured',
      developer: 'SecureApp',
      price: 59.99,
      rating: 4.9,
      reviews: 1247,
      downloads: 67800,
      featured: true,
      verified: true,
      color: 'from-red-500 to-orange-500',
      icon: '🔒'
    },
    {
      id: '6',
      name: 'Email Marketing Pro',
      description: 'Professional email campaigns made easy',
      category: 'popular',
      developer: 'MailMaster',
      price: 24.99,
      rating: 4.5,
      reviews: 3421,
      downloads: 156000,
      featured: false,
      verified: true,
      color: 'from-yellow-500 to-amber-500',
      icon: '📧'
    },
    {
      id: '7',
      name: 'Project Manager Ultimate',
      description: 'Complete project management solution',
      category: 'featured',
      developer: 'ProjectPro',
      price: 44.99,
      rating: 4.8,
      reviews: 2134,
      downloads: 98500,
      featured: true,
      verified: true,
      color: 'from-indigo-500 to-purple-500',
      icon: '📋'
    },
    {
      id: '8',
      name: 'Social Media Manager',
      description: 'Manage all your social platforms in one place',
      category: 'new',
      developer: 'SocialHub',
      price: 34.99,
      rating: 4.4,
      reviews: 567,
      downloads: 23400,
      featured: false,
      verified: false,
      color: 'from-pink-500 to-rose-500',
      icon: '📱'
    }
  ]

  const categories = [
    { name: 'Productivity', count: 247, icon: <Zap className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { name: 'Analytics', count: 124, icon: <TrendingUp className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
    { name: 'Marketing', count: 189, icon: <Award className="w-5 h-5" />, color: 'from-orange-500 to-red-500' },
    { name: 'Security', count: 67, icon: <Shield className="w-5 h-5" />, color: 'from-red-500 to-orange-500' },
    { name: 'Collaboration', count: 156, icon: <Users className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
    { name: 'Automation', count: 92, icon: <Package className="w-5 h-5" />, color: 'from-yellow-500 to-amber-500' }
  ]

  const topApps = [
    { rank: 1, name: 'Team Collaboration Suite', avatar: '👥', value: '247K', change: 68.7 },
    { rank: 2, name: 'Email Marketing Pro', avatar: '📧', value: '156K', change: 52.3 },
    { rank: 3, name: 'AI Content Generator', avatar: '🤖', value: '125K', change: 42.1 },
    { rank: 4, name: 'Project Manager Ultimate', avatar: '📋', value: '99K', change: 35.8 },
    { rank: 5, name: 'Analytics Dashboard', avatar: '📊', value: '89K', change: 28.5 }
  ]

  const maxDownloads = Math.max(...apps.map(a => a.downloads))

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 p-6">
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
          <BentoQuickAction icon={<Store />} title="Browse" description="All apps" onClick={() => console.log('Browse')} />
          <BentoQuickAction icon={<Download />} title="Installed" description="Your apps" onClick={() => console.log('Installed')} />
          <BentoQuickAction icon={<Award />} title="Featured" description="Top picks" onClick={() => console.log('Featured')} />
          <BentoQuickAction icon={<TrendingUp />} title="Trending" description="Popular" onClick={() => console.log('Trending')} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PillButton variant={selectedCategory === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('all')}>
              All Apps
            </PillButton>
            <PillButton variant={selectedCategory === 'featured' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('featured')}>
              <Award className="w-4 h-4 mr-2" />
              Featured
            </PillButton>
            <PillButton variant={selectedCategory === 'popular' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('popular')}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Popular
            </PillButton>
            <PillButton variant={selectedCategory === 'new' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('new')}>
              New
            </PillButton>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search marketplace..."
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
                {apps.map((app) => {
                  const downloadPercent = (app.downloads / maxDownloads) * 100

                  return (
                    <div key={app.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${app.color} flex items-center justify-center text-2xl`}>
                              {app.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{app.name}</h4>
                                {app.verified && (
                                  <Shield className="w-4 h-4 text-blue-600" title="Verified" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{app.developer}</p>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">{app.description}</p>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold">{app.rating}</span>
                            <span className="text-xs text-muted-foreground">({app.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Download className="w-3 h-3" />
                            <span>{(app.downloads / 1000).toFixed(0)}K</span>
                          </div>
                        </div>

                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${app.color}`}
                            style={{ width: `${downloadPercent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div>
                            <p className="text-lg font-bold text-violet-600">${app.price}</p>
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
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => console.log('Category', category.name)}
                    className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-white mb-3`}>
                      {category.icon}
                    </div>
                    <h4 className="font-semibold mb-1">{category.name}</h4>
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
                <MiniKPI label="Total Downloads" value="847K" change={68.7} />
                <MiniKPI label="Active Developers" value="247" change={42.3} />
                <MiniKPI label="Avg App Rating" value="4.7/5" change={8.3} />
                <MiniKPI label="Revenue Share" value="$2.4M" change={35.2} />
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
                  <p className="text-xs opacity-90">12 hand-selected apps</p>
                </button>
                <button className="w-full p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-left hover:opacity-90 transition-opacity">
                  <p className="font-semibold mb-1">New This Week</p>
                  <p className="text-xs opacity-90">8 recently added</p>
                </button>
                <button className="w-full p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-left hover:opacity-90 transition-opacity">
                  <p className="font-semibold mb-1">Essential Tools</p>
                  <p className="text-xs opacity-90">15 must-have apps</p>
                </button>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
