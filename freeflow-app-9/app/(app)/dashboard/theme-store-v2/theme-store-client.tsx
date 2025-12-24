'use client'

import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Palette, Download, Star, Heart, Eye, Search, Filter, Grid, List,
  Check, X, Sparkles, Layout, Moon, Sun, Monitor, Smartphone,
  Tablet, Zap, Shield, Clock, Users, TrendingUp, Package,
  Settings, Code, Paintbrush, Type, Layers, ChevronRight
} from 'lucide-react'

// Types
type ThemeStatus = 'active' | 'available' | 'installed' | 'preview' | 'deprecated'
type ThemeCategory = 'minimal' | 'professional' | 'creative' | 'dark' | 'light' | 'colorful' | 'modern' | 'classic' | 'e-commerce' | 'portfolio' | 'blog' | 'dashboard'
type ThemePricing = 'free' | 'premium' | 'bundle' | 'enterprise'
type Framework = 'react' | 'vue' | 'angular' | 'nextjs' | 'nuxt' | 'universal'

interface Designer {
  id: string
  name: string
  avatar: string
  verified: boolean
  themesCount: number
  totalDownloads: number
  rating: number
  bio: string
  social: { twitter?: string; dribbble?: string; github?: string }
}

interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
}

interface Typography {
  headingFont: string
  bodyFont: string
  codeFont: string
}

interface ThemeVersion {
  version: string
  releaseDate: string
  changelog: string[]
  breaking: boolean
}

interface Review {
  id: string
  user: { name: string; avatar: string }
  rating: number
  title: string
  content: string
  date: string
  helpful: number
  verified: boolean
}

interface ThemeExtended {
  id: string
  name: string
  slug: string
  description: string
  longDescription: string
  thumbnail: string
  screenshots: string[]
  demoUrl: string
  status: ThemeStatus
  category: ThemeCategory
  pricing: ThemePricing
  price: number
  discountPrice?: number
  designer: Designer
  framework: Framework
  version: string
  versionHistory: ThemeVersion[]
  rating: number
  reviewsCount: number
  reviews: Review[]
  downloads: number
  favorites: number
  features: string[]
  colors: ColorPalette
  typography: Typography
  responsive: boolean
  darkMode: boolean
  rtlSupport: boolean
  wcagCompliant: boolean
  components: number
  layouts: number
  pages: number
  fileSize: string
  lastUpdated: string
  compatibility: string[]
  tags: string[]
  license: 'standard' | 'extended' | 'unlimited'
}

interface Collection {
  id: string
  name: string
  description: string
  themes: string[]
  featured: boolean
  curator: string
}

interface ThemeStoreClientProps {
  initialThemes: any[]
  initialStats: any
}

// Mock Data
const mockDesigners: Designer[] = [
  { id: 'd1', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', verified: true, themesCount: 24, totalDownloads: 156000, rating: 4.9, bio: 'UI/UX designer specializing in clean, modern interfaces', social: { twitter: '@sarahchen', dribbble: 'sarahchen' } },
  { id: 'd2', name: 'Alex Rivera', avatar: '/avatars/alex.jpg', verified: true, themesCount: 18, totalDownloads: 89000, rating: 4.8, bio: 'Full-stack developer creating powerful dashboard themes', social: { github: 'alexrivera' } },
  { id: 'd3', name: 'Maya Patel', avatar: '/avatars/maya.jpg', verified: true, themesCount: 31, totalDownloads: 234000, rating: 4.9, bio: 'Award-winning designer with focus on accessibility', social: { twitter: '@mayapatel', dribbble: 'mayapatel' } },
]

const mockThemes: ThemeExtended[] = [
  {
    id: 't1', name: 'Aurora Dashboard', slug: 'aurora-dashboard', description: 'A stunning gradient-based dashboard theme with glass morphism effects',
    longDescription: 'Aurora Dashboard brings the beauty of the northern lights to your application. Featuring carefully crafted gradient backgrounds, glass morphism cards, and smooth animations that create an immersive user experience. Perfect for SaaS applications, admin panels, and data-heavy interfaces.',
    thumbnail: '/themes/aurora-thumb.jpg', screenshots: ['/themes/aurora-1.jpg', '/themes/aurora-2.jpg', '/themes/aurora-3.jpg'], demoUrl: 'https://demo.aurora.theme',
    status: 'available', category: 'dashboard', pricing: 'premium', price: 79, discountPrice: 59, designer: mockDesigners[0], framework: 'nextjs',
    version: '2.4.0', versionHistory: [
      { version: '2.4.0', releaseDate: '2024-01-15', changelog: ['Added 5 new chart components', 'Improved dark mode colors', 'Fixed sidebar collapse animation'], breaking: false },
      { version: '2.3.0', releaseDate: '2024-01-01', changelog: ['New notification center', 'RTL support added'], breaking: false },
    ],
    rating: 4.9, reviewsCount: 247, reviews: [
      { id: 'r1', user: { name: 'John D.', avatar: '/avatars/john.jpg' }, rating: 5, title: 'Best dashboard theme ever!', content: 'The attention to detail is incredible. Every component is perfectly designed and the documentation is excellent.', date: '2024-01-10', helpful: 42, verified: true },
      { id: 'r2', user: { name: 'Emma S.', avatar: '/avatars/emma.jpg' }, rating: 5, title: 'Worth every penny', content: 'We switched from another theme and the difference is night and day. Support is amazing too.', date: '2024-01-08', helpful: 28, verified: true },
    ],
    downloads: 12400, favorites: 2840, features: ['100+ Components', 'Dark/Light Mode', 'RTL Support', 'TypeScript', 'Figma Files', '6 Months Support'],
    colors: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#ec4899', background: '#0f172a', foreground: '#f8fafc', muted: '#475569' },
    typography: { headingFont: 'Inter', bodyFont: 'Inter', codeFont: 'JetBrains Mono' },
    responsive: true, darkMode: true, rtlSupport: true, wcagCompliant: true, components: 156, layouts: 12, pages: 45, fileSize: '24.5 MB',
    lastUpdated: '2024-01-15', compatibility: ['Next.js 14', 'React 18', 'Tailwind 3.4'], tags: ['dashboard', 'admin', 'saas', 'analytics'], license: 'extended'
  },
  {
    id: 't2', name: 'Minimal Portfolio', slug: 'minimal-portfolio', description: 'Clean and elegant portfolio theme for creative professionals',
    longDescription: 'Showcase your work with style using Minimal Portfolio. This theme emphasizes your content with generous whitespace, subtle animations, and typography-focused design. Ideal for designers, photographers, and artists who want their work to speak for itself.',
    thumbnail: '/themes/minimal-thumb.jpg', screenshots: ['/themes/minimal-1.jpg', '/themes/minimal-2.jpg'], demoUrl: 'https://demo.minimal.theme',
    status: 'installed', category: 'portfolio', pricing: 'free', price: 0, designer: mockDesigners[1], framework: 'react',
    version: '1.8.2', versionHistory: [
      { version: '1.8.2', releaseDate: '2024-01-12', changelog: ['Bug fixes', 'Performance improvements'], breaking: false },
    ],
    rating: 4.7, reviewsCount: 892, reviews: [
      { id: 'r3', user: { name: 'Lisa M.', avatar: '/avatars/lisa.jpg' }, rating: 5, title: 'Perfect for my portfolio', content: 'Simple, elegant, and exactly what I needed. The setup was incredibly easy.', date: '2024-01-05', helpful: 67, verified: true },
    ],
    downloads: 45600, favorites: 5230, features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Easy Customization', 'Blog Support'],
    colors: { primary: '#18181b', secondary: '#27272a', accent: '#f59e0b', background: '#ffffff', foreground: '#18181b', muted: '#a1a1aa' },
    typography: { headingFont: 'Playfair Display', bodyFont: 'Source Sans Pro', codeFont: 'Fira Code' },
    responsive: true, darkMode: true, rtlSupport: false, wcagCompliant: true, components: 42, layouts: 8, pages: 12, fileSize: '8.2 MB',
    lastUpdated: '2024-01-12', compatibility: ['React 18', 'Gatsby 5', 'Tailwind 3.4'], tags: ['portfolio', 'minimal', 'creative', 'photography'], license: 'standard'
  },
  {
    id: 't3', name: 'Commerce Pro', slug: 'commerce-pro', description: 'Full-featured e-commerce theme with conversion-optimized design',
    longDescription: 'Commerce Pro is built for serious online businesses. Every element is designed with conversion optimization in mind - from the product cards to the checkout flow. Includes advanced filtering, wishlist functionality, and seamless payment integrations.',
    thumbnail: '/themes/commerce-thumb.jpg', screenshots: ['/themes/commerce-1.jpg', '/themes/commerce-2.jpg', '/themes/commerce-3.jpg', '/themes/commerce-4.jpg'], demoUrl: 'https://demo.commerce.theme',
    status: 'active', category: 'e-commerce', pricing: 'premium', price: 149, designer: mockDesigners[2], framework: 'nextjs',
    version: '3.1.0', versionHistory: [
      { version: '3.1.0', releaseDate: '2024-01-18', changelog: ['New checkout flow', 'Apple Pay support', 'Improved mobile experience'], breaking: false },
      { version: '3.0.0', releaseDate: '2024-01-01', changelog: ['Complete redesign', 'New product gallery', 'Breaking: Updated API'], breaking: true },
    ],
    rating: 4.8, reviewsCount: 456, reviews: [
      { id: 'r4', user: { name: 'Mike T.', avatar: '/avatars/mike.jpg' }, rating: 5, title: 'Our conversion rate went up 40%', content: 'After implementing Commerce Pro, our sales increased significantly. The checkout flow is seamless.', date: '2024-01-16', helpful: 89, verified: true },
    ],
    downloads: 8900, favorites: 1890, features: ['Product Quick View', 'Advanced Filters', 'Wishlist', 'Multi-Currency', 'Payment Gateways', 'Inventory Management', '12 Months Support'],
    colors: { primary: '#059669', secondary: '#10b981', accent: '#f97316', background: '#fafafa', foreground: '#171717', muted: '#737373' },
    typography: { headingFont: 'DM Sans', bodyFont: 'DM Sans', codeFont: 'IBM Plex Mono' },
    responsive: true, darkMode: true, rtlSupport: true, wcagCompliant: true, components: 234, layouts: 18, pages: 67, fileSize: '38.6 MB',
    lastUpdated: '2024-01-18', compatibility: ['Next.js 14', 'Shopify', 'Stripe', 'PayPal'], tags: ['e-commerce', 'shop', 'store', 'retail'], license: 'unlimited'
  },
]

const mockCollections: Collection[] = [
  { id: 'c1', name: 'Staff Picks', description: 'Hand-picked themes by our design team', themes: ['t1', 't3'], featured: true, curator: 'FreeFlow Team' },
  { id: 'c2', name: 'Best for Startups', description: 'Launch your MVP with these proven themes', themes: ['t1', 't2'], featured: true, curator: 'Sarah Chen' },
  { id: 'c3', name: 'Dark Mode Excellence', description: 'Themes with exceptional dark mode implementation', themes: ['t1'], featured: false, curator: 'Alex Rivera' },
]

export default function ThemeStoreClient({ initialThemes, initialStats }: ThemeStoreClientProps) {
  const [activeTab, setActiveTab] = useState('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<ThemeCategory | 'all'>('all')
  const [pricingFilter, setPricingFilter] = useState<ThemePricing | 'all'>('all')
  const [frameworkFilter, setFrameworkFilter] = useState<Framework | 'all'>('all')
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating' | 'price'>('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTheme, setSelectedTheme] = useState<ThemeExtended | null>(null)
  const [showThemeDialog, setShowThemeDialog] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light')
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const [customColors, setCustomColors] = useState<Partial<ColorPalette>>({})

  const themes = mockThemes
  const collections = mockCollections

  const filteredThemes = useMemo(() => {
    return themes.filter(theme => {
      if (searchQuery && !theme.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !theme.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (categoryFilter !== 'all' && theme.category !== categoryFilter) return false
      if (pricingFilter !== 'all' && theme.pricing !== pricingFilter) return false
      if (frameworkFilter !== 'all' && theme.framework !== frameworkFilter) return false
      return true
    }).sort((a, b) => {
      switch (sortBy) {
        case 'popular': return b.downloads - a.downloads
        case 'newest': return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        case 'rating': return b.rating - a.rating
        case 'price': return a.price - b.price
        default: return 0
      }
    })
  }, [themes, searchQuery, categoryFilter, pricingFilter, frameworkFilter, sortBy])

  const installedThemes = themes.filter(t => t.status === 'installed' || t.status === 'active')
  const activeTheme = themes.find(t => t.status === 'active')

  const stats = {
    totalThemes: themes.length,
    installed: installedThemes.length,
    totalDownloads: themes.reduce((sum, t) => sum + t.downloads, 0),
    avgRating: themes.reduce((sum, t) => sum + t.rating, 0) / themes.length
  }

  const openThemeDetails = (theme: ThemeExtended) => {
    setSelectedTheme(theme)
    setShowThemeDialog(true)
  }

  const categories: ThemeCategory[] = ['minimal', 'professional', 'creative', 'dark', 'light', 'modern', 'e-commerce', 'portfolio', 'blog', 'dashboard']
  const frameworks: Framework[] = ['react', 'vue', 'angular', 'nextjs', 'nuxt', 'universal']

  const getCategoryIcon = (cat: ThemeCategory) => {
    const icons: Record<string, any> = {
      minimal: Layout, professional: Shield, creative: Sparkles, dark: Moon, light: Sun,
      modern: Zap, 'e-commerce': Package, portfolio: Users, blog: Type, dashboard: Grid
    }
    const Icon = icons[cat] || Layout
    return <Icon className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Palette className="h-8 w-8" />
                Theme Store
              </h1>
              <p className="text-rose-100 mt-1">Discover beautiful themes for your application</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Heart className="h-4 w-4 mr-2" />
                Wishlist
              </Button>
              <Button className="bg-white text-rose-600 hover:bg-rose-50">
                <Package className="h-4 w-4 mr-2" />
                My Themes
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Themes', value: stats.totalThemes, icon: Palette, trend: '+28 this month' },
              { label: 'Installed', value: stats.installed, icon: Download, trend: '2 updates available' },
              { label: 'Downloads', value: `${(stats.totalDownloads / 1000).toFixed(0)}K`, icon: TrendingUp, trend: '+38% this month' },
              { label: 'Avg Rating', value: stats.avgRating.toFixed(1), icon: Star, trend: 'Top rated' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-5 w-5 text-rose-200" />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-rose-100">{stat.label}</p>
                <p className="text-xs text-rose-200 mt-1">{stat.trend}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="installed">Installed</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="customizer">Customizer</TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse">
            <div className="flex gap-6">
              {/* Sidebar Filters */}
              <div className="w-64 shrink-0 space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <div className="space-y-1">
                        <button
                          onClick={() => setCategoryFilter('all')}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm ${categoryFilter === 'all' ? 'bg-rose-100 text-rose-700' : 'hover:bg-gray-100'}`}
                        >
                          All Categories
                        </button>
                        {categories.slice(0, 6).map(cat => (
                          <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${categoryFilter === cat ? 'bg-rose-100 text-rose-700' : 'hover:bg-gray-100'}`}
                          >
                            {getCategoryIcon(cat)}
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Pricing</label>
                      <div className="space-y-1">
                        {(['all', 'free', 'premium', 'bundle'] as const).map(p => (
                          <button
                            key={p}
                            onClick={() => setPricingFilter(p)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${pricingFilter === p ? 'bg-rose-100 text-rose-700' : 'hover:bg-gray-100'}`}
                          >
                            {p === 'all' ? 'All Prices' : p.charAt(0).toUpperCase() + p.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Framework</label>
                      <div className="space-y-1">
                        <button
                          onClick={() => setFrameworkFilter('all')}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm ${frameworkFilter === 'all' ? 'bg-rose-100 text-rose-700' : 'hover:bg-gray-100'}`}
                        >
                          All Frameworks
                        </button>
                        {frameworks.slice(0, 4).map(fw => (
                          <button
                            key={fw}
                            onClick={() => setFrameworkFilter(fw)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${frameworkFilter === fw ? 'bg-rose-100 text-rose-700' : 'hover:bg-gray-100'}`}
                          >
                            {fw === 'nextjs' ? 'Next.js' : fw === 'nuxt' ? 'Nuxt' : fw.charAt(0).toUpperCase() + fw.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Featured Designer */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Featured Designer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar>
                        <AvatarImage src={mockDesigners[2].avatar} />
                        <AvatarFallback>MP</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium flex items-center gap-1">
                          {mockDesigners[2].name}
                          {mockDesigners[2].verified && <Check className="h-4 w-4 text-blue-500" />}
                        </p>
                        <p className="text-xs text-gray-500">{mockDesigners[2].themesCount} themes</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{mockDesigners[2].bio}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Download className="h-4 w-4 text-gray-400" />
                        {(mockDesigners[2].totalDownloads / 1000).toFixed(0)}K
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {mockDesigners[2].rating}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                {/* Search & Sort */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search themes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 border rounded-lg text-sm"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price">Price: Low to High</option>
                  </select>
                  <div className="flex border rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-rose-100 text-rose-700' : ''}`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-rose-100 text-rose-700' : ''}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Theme Grid */}
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-6' : 'space-y-4'}>
                  {filteredThemes.map(theme => (
                    <Card key={theme.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openThemeDetails(theme)}>
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Palette className="h-12 w-12 text-gray-300" />
                        </div>
                        {theme.status === 'active' && (
                          <Badge className="absolute top-3 left-3 bg-green-500">Active</Badge>
                        )}
                        {theme.discountPrice && (
                          <Badge className="absolute top-3 right-3 bg-red-500">Sale</Badge>
                        )}
                        <div className="absolute bottom-3 right-3 flex gap-2">
                          <Button size="sm" variant="secondary" className="h-8" onClick={(e) => { e.stopPropagation() }}>
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{theme.name}</h3>
                            <p className="text-sm text-gray-500">by {theme.designer.name}</p>
                          </div>
                          <div className="text-right">
                            {theme.price === 0 ? (
                              <span className="font-bold text-green-600">Free</span>
                            ) : (
                              <div>
                                {theme.discountPrice ? (
                                  <>
                                    <span className="font-bold text-rose-600">${theme.discountPrice}</span>
                                    <span className="text-sm text-gray-400 line-through ml-1">${theme.price}</span>
                                  </>
                                ) : (
                                  <span className="font-bold">${theme.price}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{theme.description}</p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          <Badge variant="outline" className="text-xs">{theme.category}</Badge>
                          <Badge variant="outline" className="text-xs">{theme.framework}</Badge>
                          {theme.darkMode && <Badge variant="outline" className="text-xs">Dark Mode</Badge>}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              {theme.rating}
                            </span>
                            <span className="flex items-center gap-1 text-gray-500">
                              <Download className="h-4 w-4" />
                              {(theme.downloads / 1000).toFixed(1)}K
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-gray-500">
                            <Heart className="h-4 w-4" />
                            {theme.favorites}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Installed Tab */}
          <TabsContent value="installed">
            <div className="space-y-6">
              {/* Active Theme */}
              {activeTheme && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      Active Theme
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-6">
                      <div className="w-64 aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <Palette className="h-12 w-12 text-gray-300" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{activeTheme.name}</h3>
                        <p className="text-gray-600 mb-4">{activeTheme.description}</p>
                        <div className="flex items-center gap-4 mb-4">
                          <Badge>v{activeTheme.version}</Badge>
                          <span className="text-sm text-gray-500">Last updated: {activeTheme.lastUpdated}</span>
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={() => setCustomizerOpen(true)}>
                            <Paintbrush className="h-4 w-4 mr-2" />
                            Customize
                          </Button>
                          <Button variant="outline">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </Button>
                          <Button variant="outline" className="text-red-600 hover:bg-red-50">
                            Deactivate
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Installed Themes */}
              <Card>
                <CardHeader>
                  <CardTitle>Installed Themes ({installedThemes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {installedThemes.map(theme => (
                      <div key={theme.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-24 aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                          <Palette className="h-6 w-6 text-gray-300" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{theme.name}</h4>
                            {theme.status === 'active' && <Badge className="bg-green-500">Active</Badge>}
                          </div>
                          <p className="text-sm text-gray-500">v{theme.version} • by {theme.designer.name}</p>
                        </div>
                        <div className="flex gap-2">
                          {theme.status !== 'active' && (
                            <Button size="sm">Activate</Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections">
            <div className="space-y-6">
              {collections.map(collection => (
                <Card key={collection.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {collection.name}
                          {collection.featured && <Badge className="bg-yellow-500">Featured</Badge>}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{collection.description}</p>
                      </div>
                      <p className="text-sm text-gray-500">Curated by {collection.curator}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {collection.themes.map(themeId => {
                        const theme = themes.find(t => t.id === themeId)
                        if (!theme) return null
                        return (
                          <div key={theme.id} className="border rounded-lg p-3 cursor-pointer hover:shadow-md" onClick={() => openThemeDetails(theme)}>
                            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-2 flex items-center justify-center">
                              <Palette className="h-8 w-8 text-gray-300" />
                            </div>
                            <h4 className="font-medium">{theme.name}</h4>
                            <p className="text-sm text-gray-500">{theme.price === 0 ? 'Free' : `$${theme.discountPrice || theme.price}`}</p>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Customizer Tab */}
          <TabsContent value="customizer">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Theme Preview</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="flex border rounded-lg">
                          {(['desktop', 'tablet', 'mobile'] as const).map(device => (
                            <button
                              key={device}
                              onClick={() => setPreviewDevice(device)}
                              className={`p-2 ${previewDevice === device ? 'bg-rose-100 text-rose-700' : ''}`}
                            >
                              {device === 'desktop' ? <Monitor className="h-4 w-4" /> :
                               device === 'tablet' ? <Tablet className="h-4 w-4" /> :
                               <Smartphone className="h-4 w-4" />}
                            </button>
                          ))}
                        </div>
                        <div className="flex border rounded-lg">
                          <button
                            onClick={() => setPreviewMode('light')}
                            className={`p-2 ${previewMode === 'light' ? 'bg-rose-100 text-rose-700' : ''}`}
                          >
                            <Sun className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setPreviewMode('dark')}
                            className={`p-2 ${previewMode === 'dark' ? 'bg-rose-100 text-rose-700' : ''}`}
                          >
                            <Moon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`aspect-video bg-gradient-to-br ${previewMode === 'dark' ? 'from-gray-800 to-gray-900' : 'from-gray-100 to-gray-200'} rounded-lg flex items-center justify-center mx-auto ${previewDevice === 'tablet' ? 'max-w-lg' : previewDevice === 'mobile' ? 'max-w-xs' : ''}`}>
                      <div className="text-center">
                        <Palette className={`h-16 w-16 mx-auto mb-4 ${previewMode === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={previewMode === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Live Preview</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Paintbrush className="h-4 w-4" />
                      Colors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activeTheme && Object.entries(activeTheme.colors).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <label className="text-sm capitalize">{key}</label>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded border" style={{ backgroundColor: customColors[key as keyof ColorPalette] || value }} />
                          <Input
                            type="color"
                            value={customColors[key as keyof ColorPalette] || value}
                            onChange={(e) => setCustomColors({ ...customColors, [key]: e.target.value })}
                            className="w-12 h-8 p-0 border-0"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Typography
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activeTheme && Object.entries(activeTheme.typography).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-sm capitalize block mb-1">{key.replace(/([A-Z])/g, ' $1')}</label>
                        <select className="w-full px-3 py-2 border rounded-lg text-sm">
                          <option>{value}</option>
                          <option>Inter</option>
                          <option>Roboto</option>
                          <option>Open Sans</option>
                        </select>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-rose-600 hover:bg-rose-700">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setCustomColors({})}>
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Theme Detail Dialog */}
      <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedTheme && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedTheme.name}</span>
                  <div className="flex items-center gap-2">
                    {selectedTheme.price === 0 ? (
                      <span className="text-xl font-bold text-green-600">Free</span>
                    ) : (
                      <span className="text-xl font-bold">
                        ${selectedTheme.discountPrice || selectedTheme.price}
                        {selectedTheme.discountPrice && (
                          <span className="text-sm text-gray-400 line-through ml-2">${selectedTheme.price}</span>
                        )}
                      </span>
                    )}
                  </div>
                </DialogTitle>
              </DialogHeader>

              <ScrollArea className="h-[70vh]">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews ({selectedTheme.reviewsCount})</TabsTrigger>
                    <TabsTrigger value="changelog">Changelog</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <Palette className="h-16 w-16 text-gray-300" />
                    </div>

                    <p className="text-gray-600">{selectedTheme.longDescription}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-4">
                          <h4 className="font-medium mb-3">Theme Info</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Version</span><span>{selectedTheme.version}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Framework</span><span>{selectedTheme.framework}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">File Size</span><span>{selectedTheme.fileSize}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Last Updated</span><span>{selectedTheme.lastUpdated}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">License</span><span className="capitalize">{selectedTheme.license}</span></div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-4">
                          <h4 className="font-medium mb-3">Includes</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Components</span><span>{selectedTheme.components}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Layouts</span><span>{selectedTheme.layouts}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Pages</span><span>{selectedTheme.pages}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Dark Mode</span><span>{selectedTheme.darkMode ? 'Yes' : 'No'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">RTL Support</span><span>{selectedTheme.rtlSupport ? 'Yes' : 'No'}</span></div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardContent className="pt-4">
                        <h4 className="font-medium mb-3">Designer</h4>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={selectedTheme.designer.avatar} />
                            <AvatarFallback>{selectedTheme.designer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium flex items-center gap-1">
                              {selectedTheme.designer.name}
                              {selectedTheme.designer.verified && <Check className="h-4 w-4 text-blue-500" />}
                            </p>
                            <p className="text-sm text-gray-500">{selectedTheme.designer.themesCount} themes • {(selectedTheme.designer.totalDownloads / 1000).toFixed(0)}K downloads</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="features">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedTheme.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 p-3 border rounded-lg">
                          <Check className="h-5 w-5 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4">
                    <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-4xl font-bold">{selectedTheme.rating}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`h-4 w-4 ${star <= selectedTheme.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{selectedTheme.reviewsCount} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1">
                        {[5, 4, 3, 2, 1].map(star => (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-sm w-3">{star}</span>
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <Progress value={star === 5 ? 78 : star === 4 ? 15 : star === 3 ? 5 : 2} className="h-2 flex-1" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedTheme.reviews.map(review => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.user.avatar} />
                            <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {review.user.name}
                              {review.verified && <Badge variant="outline" className="text-xs">Verified Purchase</Badge>}
                            </p>
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                              ))}
                              <span className="text-xs text-gray-500">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <h4 className="font-medium mb-1">{review.title}</h4>
                        <p className="text-sm text-gray-600">{review.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <button className="hover:text-gray-700">Helpful ({review.helpful})</button>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="changelog" className="space-y-4">
                    {selectedTheme.versionHistory.map((version, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={version.breaking ? 'destructive' : 'outline'}>v{version.version}</Badge>
                          <span className="text-sm text-gray-500">{version.releaseDate}</span>
                          {version.breaking && <Badge variant="destructive">Breaking Changes</Badge>}
                        </div>
                        <ul className="space-y-1">
                          {version.changelog.map((change, j) => (
                            <li key={j} className="text-sm text-gray-600 flex items-center gap-2">
                              <ChevronRight className="h-3 w-3" />
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>

                <div className="flex gap-3 mt-6 sticky bottom-0 bg-white pt-4 border-t">
                  <Button className="flex-1 bg-rose-600 hover:bg-rose-700">
                    {selectedTheme.status === 'installed' || selectedTheme.status === 'active'
                      ? 'Activate Theme'
                      : selectedTheme.price === 0
                        ? 'Install Free'
                        : `Purchase for $${selectedTheme.discountPrice || selectedTheme.price}`}
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Live Preview
                  </Button>
                  <Button variant="outline">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
