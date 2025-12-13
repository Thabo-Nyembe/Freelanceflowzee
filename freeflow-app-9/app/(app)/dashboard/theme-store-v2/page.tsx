"use client"

import { useState } from 'react'
import StatGrid from '@/app/components/dashboard/StatGrid'
import BentoQuickAction from '@/app/components/dashboard/BentoQuickAction'
import PillButton from '@/app/components/dashboard/PillButton'
import MiniKPI from '@/app/components/dashboard/MiniKPI'
import ActivityFeed from '@/app/components/dashboard/ActivityFeed'
import RankingList from '@/app/components/dashboard/RankingList'
import ProgressCard from '@/app/components/dashboard/ProgressCard'

type ThemeStatus = 'active' | 'available' | 'installed' | 'preview' | 'deprecated'
type ThemeCategory = 'minimal' | 'professional' | 'creative' | 'dark' | 'light' | 'colorful' | 'modern' | 'classic'
type ThemePricing = 'free' | 'premium' | 'bundle' | 'enterprise'

interface Theme {
  id: string
  name: string
  description: string
  designer: string
  category: ThemeCategory
  pricing: ThemePricing
  status: ThemeStatus
  price: string
  downloads: number
  activeUsers: number
  rating: number
  reviews: number
  version: string
  lastUpdated: string
  releaseDate: string
  fileSize: string
  colors: number
  layouts: number
  components: number
  darkMode: boolean
  responsive: boolean
  customizable: boolean
  preview: string
  tags: string[]
}

export default function ThemeStorePage() {
  const [statusFilter, setStatusFilter] = useState<ThemeStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ThemeCategory | 'all'>('all')
  const [pricingFilter, setPricingFilter] = useState<ThemePricing | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock data
  const themes: Theme[] = [
    {
      id: 'theme-001',
      name: 'Nova Pro',
      description: 'Modern professional theme with clean lines, sophisticated color palette, and premium components.',
      designer: 'Design Studio X',
      category: 'professional',
      pricing: 'premium',
      status: 'active',
      price: '$79',
      downloads: 34800,
      activeUsers: 28900,
      rating: 4.9,
      reviews: 2340,
      version: '3.2.1',
      lastUpdated: '2024-01-15',
      releaseDate: '2023-04-12',
      fileSize: '2.4 MB',
      colors: 24,
      layouts: 18,
      components: 45,
      darkMode: true,
      responsive: true,
      customizable: true,
      preview: 'https://preview.nova-pro.com',
      tags: ['professional', 'modern', 'clean', 'premium']
    },
    {
      id: 'theme-002',
      name: 'Midnight Dark',
      description: 'Elegant dark theme optimized for low-light environments with beautiful gradients and smooth transitions.',
      designer: 'Dark Mode Themes',
      category: 'dark',
      pricing: 'free',
      status: 'active',
      price: 'Free',
      downloads: 89600,
      activeUsers: 72400,
      rating: 4.8,
      reviews: 4560,
      version: '2.8.5',
      lastUpdated: '2024-01-14',
      releaseDate: '2022-11-08',
      fileSize: '1.8 MB',
      colors: 18,
      layouts: 12,
      components: 32,
      darkMode: true,
      responsive: true,
      customizable: true,
      preview: 'https://preview.midnight-dark.com',
      tags: ['dark', 'elegant', 'gradient', 'free']
    },
    {
      id: 'theme-003',
      name: 'Pastel Dreams',
      description: 'Creative theme with soft pastel colors, playful elements, and artistic layouts perfect for portfolios.',
      designer: 'Creative Themes Co',
      category: 'creative',
      pricing: 'premium',
      status: 'installed',
      price: '$59',
      downloads: 45200,
      activeUsers: 38700,
      rating: 4.7,
      reviews: 2890,
      version: '4.1.2',
      lastUpdated: '2024-01-13',
      releaseDate: '2023-06-20',
      fileSize: '3.2 MB',
      colors: 32,
      layouts: 24,
      components: 52,
      darkMode: false,
      responsive: true,
      customizable: true,
      preview: 'https://preview.pastel-dreams.com',
      tags: ['creative', 'pastel', 'artistic', 'portfolio']
    },
    {
      id: 'theme-004',
      name: 'Minimalist White',
      description: 'Ultra-minimal light theme with maximum whitespace, subtle typography, and focus on content.',
      designer: 'Minimal Design Lab',
      category: 'minimal',
      pricing: 'free',
      status: 'available',
      price: 'Free',
      downloads: 67800,
      activeUsers: 54300,
      rating: 4.6,
      reviews: 3420,
      version: '1.9.4',
      lastUpdated: '2024-01-12',
      releaseDate: '2023-01-15',
      fileSize: '1.2 MB',
      colors: 8,
      layouts: 8,
      components: 24,
      darkMode: false,
      responsive: true,
      customizable: false,
      preview: 'https://preview.minimalist-white.com',
      tags: ['minimal', 'white', 'clean', 'content-focused']
    },
    {
      id: 'theme-005',
      name: 'Vibrant Colors',
      description: 'Bold and energetic theme with vibrant color schemes, dynamic animations, and eye-catching elements.',
      designer: 'Bold Themes Inc',
      category: 'colorful',
      pricing: 'premium',
      status: 'available',
      price: '$69',
      downloads: 38900,
      activeUsers: 31200,
      rating: 4.5,
      reviews: 2180,
      version: '3.5.7',
      lastUpdated: '2024-01-11',
      releaseDate: '2023-08-03',
      fileSize: '2.8 MB',
      colors: 48,
      layouts: 20,
      components: 42,
      darkMode: true,
      responsive: true,
      customizable: true,
      preview: 'https://preview.vibrant-colors.com',
      tags: ['colorful', 'vibrant', 'bold', 'energetic']
    },
    {
      id: 'theme-006',
      name: 'Executive Suite',
      description: 'Premium business theme with corporate aesthetics, data visualization focus, and professional polish.',
      designer: 'Business Themes',
      category: 'professional',
      pricing: 'enterprise',
      status: 'available',
      price: '$149',
      downloads: 18400,
      activeUsers: 15800,
      rating: 4.9,
      reviews: 1240,
      version: '5.2.0',
      lastUpdated: '2024-01-10',
      releaseDate: '2023-03-28',
      fileSize: '4.6 MB',
      colors: 16,
      layouts: 28,
      components: 68,
      darkMode: true,
      responsive: true,
      customizable: true,
      preview: 'https://preview.executive-suite.com',
      tags: ['business', 'corporate', 'professional', 'enterprise']
    },
    {
      id: 'theme-007',
      name: 'Retro Classic',
      description: 'Nostalgic theme inspired by classic design with vintage colors, timeless typography, and elegant details.',
      designer: 'Vintage Design Co',
      category: 'classic',
      pricing: 'premium',
      status: 'available',
      price: '$54',
      downloads: 28600,
      activeUsers: 23400,
      rating: 4.4,
      reviews: 1680,
      version: '2.4.3',
      lastUpdated: '2024-01-09',
      releaseDate: '2022-12-10',
      fileSize: '2.1 MB',
      colors: 20,
      layouts: 14,
      components: 36,
      darkMode: false,
      responsive: true,
      customizable: true,
      preview: 'https://preview.retro-classic.com',
      tags: ['classic', 'retro', 'vintage', 'timeless']
    },
    {
      id: 'theme-008',
      name: 'Neon Glow',
      description: 'Futuristic dark theme with neon accents, cyberpunk aesthetics, and glowing elements.',
      designer: 'Future Themes',
      category: 'dark',
      pricing: 'premium',
      status: 'available',
      price: '$64',
      downloads: 52100,
      activeUsers: 43800,
      rating: 4.8,
      reviews: 3560,
      version: '3.7.1',
      lastUpdated: '2024-01-08',
      releaseDate: '2023-05-16',
      fileSize: '3.4 MB',
      colors: 36,
      layouts: 16,
      components: 48,
      darkMode: true,
      responsive: true,
      customizable: true,
      preview: 'https://preview.neon-glow.com',
      tags: ['neon', 'futuristic', 'cyberpunk', 'glow']
    },
    {
      id: 'theme-009',
      name: 'Nature Inspired',
      description: 'Organic theme with earthy tones, natural textures, and environmentally conscious design elements.',
      designer: 'Eco Design Studio',
      category: 'colorful',
      pricing: 'free',
      status: 'available',
      price: 'Free',
      downloads: 74200,
      activeUsers: 61900,
      rating: 4.7,
      reviews: 4120,
      version: '2.6.8',
      lastUpdated: '2024-01-07',
      releaseDate: '2023-02-22',
      fileSize: '2.6 MB',
      colors: 28,
      layouts: 18,
      components: 40,
      darkMode: false,
      responsive: true,
      customizable: true,
      preview: 'https://preview.nature-inspired.com',
      tags: ['nature', 'organic', 'eco', 'earthy']
    },
    {
      id: 'theme-010',
      name: 'Tech Modern',
      description: 'Contemporary tech-focused theme with sharp edges, bold typography, and modern UI patterns.',
      designer: 'Tech Themes Lab',
      category: 'modern',
      pricing: 'premium',
      status: 'available',
      price: '$74',
      downloads: 42800,
      activeUsers: 36200,
      rating: 4.6,
      reviews: 2640,
      version: '4.3.5',
      lastUpdated: '2024-01-06',
      releaseDate: '2023-07-14',
      fileSize: '3.1 MB',
      colors: 22,
      layouts: 22,
      components: 54,
      darkMode: true,
      responsive: true,
      customizable: true,
      preview: 'https://preview.tech-modern.com',
      tags: ['tech', 'modern', 'contemporary', 'ui']
    },
    {
      id: 'theme-011',
      name: 'Soft Light',
      description: 'Gentle light theme with soft shadows, subtle animations, and calming color palette.',
      designer: 'Soft Design Co',
      category: 'light',
      pricing: 'free',
      status: 'available',
      price: 'Free',
      downloads: 56900,
      activeUsers: 47600,
      rating: 4.5,
      reviews: 3280,
      version: '1.8.2',
      lastUpdated: '2024-01-05',
      releaseDate: '2023-09-08',
      fileSize: '1.6 MB',
      colors: 14,
      layouts: 10,
      components: 28,
      darkMode: false,
      responsive: true,
      customizable: false,
      preview: 'https://preview.soft-light.com',
      tags: ['light', 'soft', 'gentle', 'calming']
    },
    {
      id: 'theme-012',
      name: 'Premium Bundle',
      description: 'Complete theme collection with 10 premium themes, lifetime updates, and priority support.',
      designer: 'Theme Masters',
      category: 'professional',
      pricing: 'bundle',
      status: 'preview',
      price: '$199',
      downloads: 12600,
      activeUsers: 10400,
      rating: 4.9,
      reviews: 840,
      version: '1.0.0',
      lastUpdated: '2024-01-04',
      releaseDate: '2024-01-01',
      fileSize: '24.8 MB',
      colors: 120,
      layouts: 140,
      components: 280,
      darkMode: true,
      responsive: true,
      customizable: true,
      preview: 'https://preview.premium-bundle.com',
      tags: ['bundle', 'premium', 'collection', 'value']
    }
  ]

  const filteredThemes = themes.filter(theme => {
    if (statusFilter !== 'all' && theme.status !== statusFilter) return false
    if (categoryFilter !== 'all' && theme.category !== categoryFilter) return false
    if (pricingFilter !== 'all' && theme.pricing !== pricingFilter) return false
    return true
  })

  const stats = [
    { label: 'Total Themes', value: '342', trend: '+28', trendLabel: 'this month' },
    { label: 'Total Downloads', value: '1.8M', trend: '+42%', trendLabel: 'vs last month' },
    { label: 'Avg Rating', value: '4.7/5', trend: '+0.3', trendLabel: 'improvement' },
    { label: 'Active Users', value: '567K', trend: '+38%', trendLabel: 'this week' }
  ]

  const quickActions = [
    { label: 'Browse Themes', icon: '🎨', onClick: () => console.log('Browse Themes') },
    { label: 'Active Theme', icon: '✨', onClick: () => console.log('Active Theme') },
    { label: 'My Themes', icon: '📦', onClick: () => console.log('My Themes') },
    { label: 'Theme Builder', icon: '🛠️', onClick: () => console.log('Theme Builder') },
    { label: 'Customizer', icon: '🎛️', onClick: () => console.log('Customizer') },
    { label: 'Preview Mode', icon: '👁️', onClick: () => console.log('Preview Mode') },
    { label: 'Documentation', icon: '📚', onClick: () => console.log('Documentation') },
    { label: 'Support', icon: '💬', onClick: () => console.log('Support') }
  ]

  const recentActivity = [
    { label: 'Nova Pro theme activated', time: '5 min ago', type: 'activate' },
    { label: 'Midnight Dark updated to v2.8.5', time: '12 min ago', type: 'update' },
    { label: 'Pastel Dreams customization saved', time: '28 min ago', type: 'customize' },
    { label: 'New theme: Premium Bundle available', time: '1 hour ago', type: 'new' },
    { label: 'Nature Inspired reached 70K downloads', time: '2 hours ago', type: 'milestone' },
    { label: '5 themes added to wishlist', time: '3 hours ago', type: 'wishlist' }
  ]

  const topThemes = filteredThemes
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5)
    .map((theme, index) => ({
      rank: index + 1,
      label: theme.name,
      value: theme.downloads.toLocaleString(),
      change: index === 0 ? '+62%' : index === 1 ? '+56%' : index === 2 ? '+50%' : index === 3 ? '+44%' : '+38%'
    }))

  const getStatusColor = (status: ThemeStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'available': return 'bg-blue-100 text-blue-700'
      case 'installed': return 'bg-purple-100 text-purple-700'
      case 'preview': return 'bg-yellow-100 text-yellow-700'
      case 'deprecated': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryColor = (category: ThemeCategory) => {
    switch (category) {
      case 'minimal': return 'bg-gray-100 text-gray-700'
      case 'professional': return 'bg-blue-100 text-blue-700'
      case 'creative': return 'bg-purple-100 text-purple-700'
      case 'dark': return 'bg-slate-700 text-white'
      case 'light': return 'bg-amber-100 text-amber-700'
      case 'colorful': return 'bg-pink-100 text-pink-700'
      case 'modern': return 'bg-teal-100 text-teal-700'
      case 'classic': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPricingColor = (pricing: ThemePricing) => {
    switch (pricing) {
      case 'free': return 'bg-green-100 text-green-700'
      case 'premium': return 'bg-purple-100 text-purple-700'
      case 'bundle': return 'bg-orange-100 text-orange-700'
      case 'enterprise': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
            Theme Store
          </h1>
          <p className="text-gray-600 mt-1">Customize your interface with beautiful themes</p>
        </div>
        <button className="px-6 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 text-white rounded-lg hover:shadow-lg transition-shadow">
          Browse Themes
        </button>
      </div>

      {/* Stats Grid */}
      <StatGrid stats={stats} />

      {/* Quick Actions */}
      <BentoQuickAction actions={quickActions} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <PillButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All Status</PillButton>
          <PillButton active={statusFilter === 'active'} onClick={() => setStatusFilter('active')}>Active</PillButton>
          <PillButton active={statusFilter === 'installed'} onClick={() => setStatusFilter('installed')}>Installed</PillButton>
          <PillButton active={statusFilter === 'available'} onClick={() => setStatusFilter('available')}>Available</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>All Categories</PillButton>
          <PillButton active={categoryFilter === 'professional'} onClick={() => setCategoryFilter('professional')}>Professional</PillButton>
          <PillButton active={categoryFilter === 'dark'} onClick={() => setCategoryFilter('dark')}>Dark</PillButton>
          <PillButton active={categoryFilter === 'creative'} onClick={() => setCategoryFilter('creative')}>Creative</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={pricingFilter === 'all'} onClick={() => setPricingFilter('all')}>All Pricing</PillButton>
          <PillButton active={pricingFilter === 'free'} onClick={() => setPricingFilter('free')}>Free</PillButton>
          <PillButton active={pricingFilter === 'premium'} onClick={() => setPricingFilter('premium')}>Premium</PillButton>
          <PillButton active={pricingFilter === 'bundle'} onClick={() => setPricingFilter('bundle')}>Bundle</PillButton>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Themes List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Available Themes ({filteredThemes.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100'}`}
                >
                  List
                </button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredThemes.map(theme => (
                <div key={theme.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{theme.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">v{theme.version} • {theme.fileSize} • {theme.designer}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{theme.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(theme.status)}`}>
                      {theme.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(theme.category)}`}>
                      {theme.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPricingColor(theme.pricing)}`}>
                      {theme.pricing}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-xs">
                      <div className="text-gray-500">Downloads</div>
                      <div className="font-semibold">{theme.downloads.toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Price</div>
                      <div className="font-semibold text-rose-600">{theme.price}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Components</div>
                      <div className="font-semibold">{theme.components}</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-500">Layouts</div>
                      <div className="font-semibold">{theme.layouts}</div>
                    </div>
                  </div>

                  <div className="mb-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Dark Mode</span>
                      <span className="font-medium">{theme.darkMode ? '✓ Yes' : '✗ No'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Responsive</span>
                      <span className="font-medium">{theme.responsive ? '✓ Yes' : '✗ No'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Customizable</span>
                      <span className="font-medium">{theme.customizable ? '✓ Yes' : '✗ No'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold">{theme.rating}</span>
                      <span className="text-gray-500">({theme.reviews.toLocaleString()})</span>
                    </div>
                    <span className="text-gray-500">{theme.colors} colors</span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    {theme.status === 'active' ? (
                      <>
                        <button className="flex-1 px-3 py-1.5 bg-rose-50 text-rose-700 rounded text-xs font-medium hover:bg-rose-100">
                          Customize
                        </button>
                        <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
                          Deactivate
                        </button>
                      </>
                    ) : theme.status === 'installed' ? (
                      <>
                        <button className="flex-1 px-3 py-1.5 bg-rose-50 text-rose-700 rounded text-xs font-medium hover:bg-rose-100">
                          Activate
                        </button>
                        <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
                          Uninstall
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="flex-1 px-3 py-1.5 bg-rose-50 text-rose-700 rounded text-xs font-medium hover:bg-rose-100">
                          Install
                        </button>
                        <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
                          Preview
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <MiniKPI label="Installed Themes" value="8" />
              <MiniKPI label="Active Theme" value="1" />
              <MiniKPI label="Favorites" value="12" />
              <MiniKPI label="Designers" value="124" />
            </div>
          </div>

          {/* Top Themes */}
          <RankingList title="Most Downloaded Themes" items={topThemes} />

          {/* Recent Activity */}
          <ActivityFeed title="Recent Activity" activities={recentActivity} />

          {/* Category Distribution */}
          <ProgressCard
            title="Theme Categories"
            items={[
              { label: 'Professional', value: 28, color: 'from-blue-400 to-blue-600' },
              { label: 'Dark', value: 24, color: 'from-slate-400 to-slate-600' },
              { label: 'Creative', value: 20, color: 'from-purple-400 to-purple-600' },
              { label: 'Minimal', value: 16, color: 'from-gray-400 to-gray-600' },
              { label: 'Colorful', value: 12, color: 'from-pink-400 to-pink-600' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
