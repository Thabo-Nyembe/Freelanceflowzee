'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Palette, Download, Star, Heart, Eye, Search, Filter, Grid, List,
  Check, X, Sparkles, Layout, Moon, Sun, Monitor, Smartphone,
  Tablet, Zap, Shield, Clock, Users, TrendingUp, Package,
  Settings, Code, Paintbrush, Type, Layers, ChevronRight,
  Bell, Key, Globe, RefreshCw, Upload, Link2, AlertTriangle,
  CreditCard, FileText, Database, Server,
  Copy, Trash2, Share2, Grid3x3, Gift, Save, Archive
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

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

// Competitive Upgrade Mock Data - Envato/ThemeForest Level Theme Marketplace Intelligence
const mockThemeStoreAIInsights = [
  { id: '1', type: 'success' as const, title: 'Top Seller', description: 'Aurora Pro theme reached 10K downloads—trending in dashboard category!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Sales' },
  { id: '2', type: 'warning' as const, title: 'Compatibility Alert', description: 'React 19 released—3 themes need compatibility updates.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Updates' },
  { id: '3', type: 'info' as const, title: 'AI Suggestion', description: 'Dark mode themes have 40% higher conversion—consider theme variant.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Insights' },
]

const mockThemeStoreCollaborators = [
  { id: '1', name: 'Theme Author', avatar: '/avatars/designer.jpg', status: 'online' as const, role: 'Author' },
  { id: '2', name: 'UI Reviewer', avatar: '/avatars/reviewer.jpg', status: 'online' as const, role: 'Reviewer' },
  { id: '3', name: 'Support Lead', avatar: '/avatars/support.jpg', status: 'away' as const, role: 'Support' },
]

const mockThemeStorePredictions = [
  { id: '1', title: 'Monthly Revenue', prediction: 'Theme sales projected to exceed $12K this month (+18%)', confidence: 87, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Download Trend', prediction: 'SaaS templates expected to dominate Q1 2025 demand', confidence: 82, trend: 'up' as const, impact: 'medium' as const },
]

const mockThemeStoreActivities = [
  { id: '1', user: 'Theme Author', action: 'Published', target: 'Velocity Dashboard Pro v2.0', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Buyer', action: 'Purchased', target: 'Aurora Pro Extended License', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'UI Reviewer', action: 'Approved', target: 'Minimal Blog Theme submission', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

const mockThemeStoreQuickActions = [
  { id: '1', label: 'Upload', icon: 'upload', action: () => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Opening upload wizard...', success: 'Upload your theme package (.zip)', error: 'Upload cancelled' }), variant: 'default' as const },
  { id: '2', label: 'Preview', icon: 'eye', action: () => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Loading theme preview...', success: 'Theme Preview - Live preview mode active', error: 'Preview failed' }), variant: 'default' as const },
  { id: '3', label: 'Analytics', icon: 'barChart', action: () => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Loading store analytics...', success: 'Store Analytics - 1,234 downloads, $4,500 revenue, 4.8 avg rating', error: 'Failed to load analytics' }), variant: 'outline' as const },
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
  const [settingsTab, setSettingsTab] = useState('general')

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

  // Handlers
  const handleInstallTheme = (n: string) => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: `Installing "${n}"...`, success: `"${n}" installed successfully`, error: `Failed to install "${n}"` })
  const handlePreviewTheme = (n: string) => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: `Loading preview for "${n}"...`, success: `Previewing "${n}"`, error: 'Failed to load preview' })
  const handleActivateTheme = (n: string) => toast.promise(new Promise(r => setTimeout(r, 700)), { loading: `Activating "${n}"...`, success: `"${n}" is now active`, error: `Failed to activate "${n}"` })
  const handleCustomize = () => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening customizer...', success: 'Customizer ready', error: 'Failed to open customizer' })
  const handleWishlist = () => {
    toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening your wishlist...', success: 'Wishlist loaded', error: 'Failed to load wishlist' })
  }
  const handleMyThemes = () => {
    toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening your themes library...', success: 'Themes library loaded', error: 'Failed to load themes' })
  }
  const handleQuickAction = (label: string) => {
    toast.promise(new Promise(r => setTimeout(r, 600)), { loading: `Executing ${label.toLowerCase()} action...`, success: `${label} action completed`, error: `${label} action failed` })
  }
  const handleDeactivateTheme = () => {
    toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Deactivating current theme...', success: 'Theme deactivated', error: 'Failed to deactivate theme' })
  }
  const handleThemeSettings = () => {
    toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening theme settings...', success: 'Theme settings loaded', error: 'Failed to load settings' })
  }
  const handleRemoveTheme = (themeName: string) => {
    toast.promise(new Promise(r => setTimeout(r, 800)), { loading: `Removing "${themeName}"...`, success: `"${themeName}" removed`, error: `Failed to remove "${themeName}"` })
  }
  const handleSaveChanges = () => {
    toast.promise(new Promise(r => setTimeout(r, 700)), { loading: 'Saving theme changes...', success: 'Theme changes saved successfully', error: 'Failed to save changes' })
  }
  const handleClearCache = () => {
    toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Clearing theme cache...', success: 'Cache cleared successfully', error: 'Failed to clear cache' })
  }
  const handleOptimizeStorage = () => {
    toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Optimizing storage...', success: 'Storage optimized', error: 'Failed to optimize storage' })
  }
  const handleAddPaymentMethod = () => {
    toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening payment method form...', success: 'Payment form ready', error: 'Failed to open payment form' })
  }
  const handleConnect = (integration: string) => {
    toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: `Connecting to ${integration}...`, success: `Connected to ${integration}`, error: `Failed to connect to ${integration}` })
  }
  const handleRegenerateKey = () => {
    toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Regenerating API key...', success: 'API key regenerated', error: 'Failed to regenerate key' })
  }
  const handleViewDocs = () => {
    toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening API documentation...', success: 'Documentation loaded', error: 'Failed to load documentation' })
  }
  const handleDownloadSDK = () => {
    toast.promise(new Promise(r => setTimeout(r, 1200)), { loading: 'Downloading SDK...', success: 'SDK downloaded successfully', error: 'Failed to download SDK' })
  }
  const handleRemoveAll = () => {
    toast.promise(new Promise(r => setTimeout(r, 1500)), { loading: 'Removing all installed themes...', success: 'All themes removed', error: 'Failed to remove themes' })
  }
  const handleResetPreferences = () => {
    toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Resetting store preferences...', success: 'Preferences reset to defaults', error: 'Failed to reset preferences' })
  }
  const handleAddToWishlist = (themeName: string) => {
    toast.promise(new Promise(r => setTimeout(r, 500)), { loading: `Adding "${themeName}" to wishlist...`, success: `"${themeName}" added to wishlist`, error: 'Failed to add to wishlist' })
  }
  const handleVerifyLicense = () => {
    toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Verifying license...', success: 'License verified', error: 'License verification failed' })
  }
  const handleViewReceipt = (invoice: string) => {
    toast.promise(new Promise(r => setTimeout(r, 500)), { loading: `Opening receipt for ${invoice}...`, success: `Receipt for ${invoice} loaded`, error: 'Failed to load receipt' })
  }

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
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={handleWishlist}>
                <Heart className="h-4 w-4 mr-2" />
                Wishlist
              </Button>
              <Button className="bg-white text-rose-600 hover:bg-rose-50" onClick={handleMyThemes}>
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
            <TabsTrigger value="settings" className="flex items-center gap-1.5">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse">
            {/* Browse Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Theme Marketplace</h2>
                  <p className="text-violet-100">Envato Elements-level theme marketplace with instant preview</p>
                  <p className="text-violet-200 text-xs mt-1">Premium themes • Designer verified • Live customization</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockThemes.length}</p>
                    <p className="text-violet-200 text-sm">Themes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockThemes.filter(t => t.pricing === 'free').length}</p>
                    <p className="text-violet-200 text-sm">Free</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockDesigners.length}</p>
                    <p className="text-violet-200 text-sm">Designers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Browse Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Search, label: 'Search', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: Sparkles, label: 'Popular', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: TrendingUp, label: 'Trending', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
                { icon: Star, label: 'Top Rated', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: Download, label: 'Downloads', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Clock, label: 'New', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: Heart, label: 'Favorites', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: Filter, label: 'Filters', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={() => handleQuickAction(action.label)}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

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
                          <Button size="sm" variant="secondary" className="h-8" onClick={(e) => { e.stopPropagation(); handlePreviewTheme(theme.name) }}>
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
              {/* Installed Banner */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">My Themes Library</h2>
                    <p className="text-emerald-100">Shopify-level theme management with instant switching</p>
                    <p className="text-emerald-200 text-xs mt-1">Active theme • Custom presets • Auto-updates enabled</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{installedThemes.length}</p>
                      <p className="text-emerald-200 text-sm">Installed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{installedThemes.filter(t => t.status === 'active').length}</p>
                      <p className="text-emerald-200 text-sm">Active</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{installedThemes.filter(t => t.hasUpdate).length || 0}</p>
                      <p className="text-emerald-200 text-sm">Updates</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Installed Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
                {[
                  { icon: Check, label: 'Switch Theme', color: 'text-emerald-600 dark:text-emerald-400' },
                  { icon: Paintbrush, label: 'Customize', color: 'text-purple-600 dark:text-purple-400' },
                  { icon: Download, label: 'Export', color: 'text-blue-600 dark:text-blue-400' },
                  { icon: RefreshCw, label: 'Check Updates', color: 'text-orange-600 dark:text-orange-400' },
                  { icon: Copy, label: 'Duplicate', color: 'text-cyan-600 dark:text-cyan-400' },
                  { icon: Settings, label: 'Settings', color: 'text-gray-600 dark:text-gray-400' },
                  { icon: Trash2, label: 'Uninstall', color: 'text-red-600 dark:text-red-400' },
                  { icon: Upload, label: 'Import', color: 'text-indigo-600 dark:text-indigo-400' }
                ].map((action, i) => (
                  <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200" onClick={() => handleQuickAction(action.label)}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>

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
                          <Button onClick={() => { setCustomizerOpen(true); handleCustomize() }}>
                            <Paintbrush className="h-4 w-4 mr-2" />
                            Customize
                          </Button>
                          <Button variant="outline" onClick={handleThemeSettings}>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </Button>
                          <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={handleDeactivateTheme}>
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
                            <Button size="sm" onClick={() => handleActivateTheme(theme.name)}>Activate</Button>
                          )}
                          <Button size="sm" variant="outline" onClick={handleThemeSettings}>
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleRemoveTheme(theme.name)}>
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
              {/* Collections Banner */}
              <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Curated Collections</h2>
                    <p className="text-amber-100">Dribbble-level curated theme bundles by top designers</p>
                    <p className="text-amber-200 text-xs mt-1">Featured collections • Industry-specific • Seasonal picks</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{collections.length}</p>
                      <p className="text-amber-200 text-sm">Collections</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{collections.filter(c => c.featured).length}</p>
                      <p className="text-amber-200 text-sm">Featured</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{collections.reduce((sum, c) => sum + c.themes.length, 0)}</p>
                      <p className="text-amber-200 text-sm">Total Themes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collections Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
                {[
                  { icon: Star, label: 'Featured', color: 'text-yellow-600 dark:text-yellow-400' },
                  { icon: Grid3x3, label: 'Browse All', color: 'text-purple-600 dark:text-purple-400' },
                  { icon: Heart, label: 'Favorites', color: 'text-pink-600 dark:text-pink-400' },
                  { icon: Users, label: 'By Designer', color: 'text-blue-600 dark:text-blue-400' },
                  { icon: Palette, label: 'By Style', color: 'text-emerald-600 dark:text-emerald-400' },
                  { icon: Zap, label: 'New Arrivals', color: 'text-orange-600 dark:text-orange-400' },
                  { icon: TrendingUp, label: 'Trending', color: 'text-cyan-600 dark:text-cyan-400' },
                  { icon: Gift, label: 'Bundle Deals', color: 'text-red-600 dark:text-red-400' }
                ].map((action, i) => (
                  <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200" onClick={() => handleQuickAction(action.label)}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>

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
            {/* Customizer Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Visual Theme Editor</h2>
                  <p className="text-pink-100">Figma-level live customization with real-time preview</p>
                  <p className="text-pink-200 text-xs mt-1">CSS variables • Color palettes • Typography controls • Layout presets</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{Object.keys(customColors).length || 0}</p>
                    <p className="text-pink-200 text-sm">Custom Colors</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">5</p>
                    <p className="text-pink-200 text-sm">Fonts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold capitalize">{previewDevice}</p>
                    <p className="text-pink-200 text-sm">Preview</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customizer Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Paintbrush, label: 'Colors', color: 'text-pink-600 dark:text-pink-400' },
                { icon: Type, label: 'Typography', color: 'text-purple-600 dark:text-purple-400' },
                { icon: Layout, label: 'Layout', color: 'text-blue-600 dark:text-blue-400' },
                { icon: Layers, label: 'Components', color: 'text-cyan-600 dark:text-cyan-400' },
                { icon: Eye, label: 'Preview', color: 'text-emerald-600 dark:text-emerald-400' },
                { icon: Save, label: 'Save Preset', color: 'text-orange-600 dark:text-orange-400' },
                { icon: RefreshCw, label: 'Reset', color: 'text-gray-600 dark:text-gray-400' },
                { icon: Share2, label: 'Export', color: 'text-indigo-600 dark:text-indigo-400' }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200" onClick={() => handleQuickAction(action.label)}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

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
                  <Button className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={handleSaveChanges}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => { setCustomColors({}); toast.promise(new Promise(r => setTimeout(r, 400)), { loading: 'Resetting colors...', success: 'Colors reset to defaults', error: 'Failed to reset colors' }) }}>
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Theme Store Settings</h2>
                  <p className="text-slate-200">WordPress Customizer-level theme configuration hub</p>
                  <p className="text-slate-300 text-xs mt-1">License management • Auto-updates • CDN config • Backup settings</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{installedThemes.length}</p>
                    <p className="text-slate-300 text-sm">Licenses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">✓</p>
                    <p className="text-slate-300 text-sm">Auto-Update</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">CDN</p>
                    <p className="text-slate-300 text-sm">Enabled</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Settings, label: 'General', color: 'text-gray-600 dark:text-gray-400' },
                { icon: Key, label: 'Licenses', color: 'text-amber-600 dark:text-amber-400' },
                { icon: RefreshCw, label: 'Updates', color: 'text-blue-600 dark:text-blue-400' },
                { icon: Shield, label: 'Security', color: 'text-green-600 dark:text-green-400' },
                { icon: Globe, label: 'CDN', color: 'text-purple-600 dark:text-purple-400' },
                { icon: Archive, label: 'Backups', color: 'text-cyan-600 dark:text-cyan-400' },
                { icon: Bell, label: 'Notifications', color: 'text-orange-600 dark:text-orange-400' },
                { icon: Link2, label: 'Integrations', color: 'text-pink-600 dark:text-pink-400' }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200" onClick={() => handleQuickAction(action.label)}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Settings Sub-tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-1 p-2 overflow-x-auto">
                  {[
                    { id: 'general', label: 'General', icon: Settings },
                    { id: 'appearance', label: 'Appearance', icon: Palette },
                    { id: 'licensing', label: 'Licensing', icon: Key },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'integrations', label: 'Integrations', icon: Link2 },
                    { id: 'advanced', label: 'Advanced', icon: Zap }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        settingsTab === tab.id
                          ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Package className="w-5 h-5 text-rose-600" />
                          Theme Defaults
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Default Framework</Label>
                            <Select defaultValue="nextjs">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="react">React</SelectItem>
                                <SelectItem value="nextjs">Next.js</SelectItem>
                                <SelectItem value="vue">Vue</SelectItem>
                                <SelectItem value="nuxt">Nuxt</SelectItem>
                                <SelectItem value="angular">Angular</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Default License</Label>
                            <Select defaultValue="standard">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="extended">Extended</SelectItem>
                                <SelectItem value="unlimited">Unlimited</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Auto-update Themes</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically install theme updates</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Backup Before Update</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Create backup before applying updates</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Database className="w-5 h-5 text-blue-600" />
                          Storage & Cache
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Theme Cache</span>
                            <Badge variant="secondary">245 MB</Badge>
                          </div>
                          <Progress value={45} className="h-2" />
                          <p className="text-xs text-gray-500 mt-2">45% of 500 MB limit used</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Button variant="outline" className="flex items-center gap-2" onClick={handleClearCache}>
                            <RefreshCw className="w-4 h-4" />
                            Clear Cache
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2" onClick={handleOptimizeStorage}>
                            <Database className="w-4 h-4" />
                            Optimize Storage
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Globe className="w-5 h-5 text-green-600" />
                          Localization
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Store Language</Label>
                            <Select defaultValue="en">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="ja">Japanese</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Currency</Label>
                            <Select defaultValue="usd">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usd">USD ($)</SelectItem>
                                <SelectItem value="eur">EUR (€)</SelectItem>
                                <SelectItem value="gbp">GBP (£)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Appearance Settings */}
                {settingsTab === 'appearance' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance Settings</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Palette className="w-5 h-5 text-rose-600" />
                          Store Theme
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Color Scheme</Label>
                          <div className="flex gap-3 mt-2">
                            {['rose', 'blue', 'green', 'purple', 'orange', 'gray'].map(color => (
                              <button
                                key={color}
                                className={`w-10 h-10 rounded-full border-2 hover:scale-110 transition-transform bg-${color}-500`}
                                style={{ backgroundColor: color === 'rose' ? '#f43f5e' : color === 'blue' ? '#3b82f6' : color === 'green' ? '#22c55e' : color === 'purple' ? '#a855f7' : color === 'orange' ? '#f97316' : '#6b7280' }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Dark Mode</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Use dark theme for store</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Animated Backgrounds</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enable gradient animations</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Layout className="w-5 h-5 text-blue-600" />
                          Browse Layout
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Default View</Label>
                          <Select defaultValue="grid">
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="grid">Grid View</SelectItem>
                              <SelectItem value="list">List View</SelectItem>
                              <SelectItem value="masonry">Masonry View</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Themes Per Page</Label>
                          <Select defaultValue="12">
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12">12 themes</SelectItem>
                              <SelectItem value="24">24 themes</SelectItem>
                              <SelectItem value="48">48 themes</SelectItem>
                              <SelectItem value="100">100 themes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Show Sidebar Filters</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Display filters in sidebar</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Eye className="w-5 h-5 text-purple-600" />
                          Preview Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Default Preview Device</Label>
                          <Select defaultValue="desktop">
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="desktop">Desktop</SelectItem>
                              <SelectItem value="tablet">Tablet</SelectItem>
                              <SelectItem value="mobile">Mobile</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Auto-play Previews</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically load preview on hover</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Licensing Settings */}
                {settingsTab === 'licensing' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Licensing & Purchases</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Key className="w-5 h-5 text-amber-600" />
                          License Keys
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Label>Envato Purchase Code</Label>
                            <Button variant="ghost" size="sm" onClick={handleVerifyLicense}>Verify</Button>
                          </div>
                          <Input type="password" value="••••••••-••••-••••-••••-••••••••••••" readOnly className="font-mono" />
                        </div>
                        <div className="space-y-2">
                          {[
                            { theme: 'Aurora Dashboard', license: 'Extended', expires: '2025-01-15', status: 'active' },
                            { theme: 'Commerce Pro', license: 'Unlimited', expires: 'Lifetime', status: 'active' },
                            { theme: 'Minimal Portfolio', license: 'Free', expires: 'N/A', status: 'active' }
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div>
                                <span className="font-medium">{item.theme}</span>
                                <p className="text-xs text-gray-500">{item.license} • Expires: {item.expires}</p>
                              </div>
                              <Badge className="bg-green-100 text-green-700">{item.status}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          Payment Methods
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">VISA</span>
                            </div>
                            <div>
                              <span className="font-medium">•••• •••• •••• 4242</span>
                              <p className="text-xs text-gray-500">Expires 12/25</p>
                            </div>
                          </div>
                          <Badge>Default</Badge>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleAddPaymentMethod}>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Add Payment Method
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="w-5 h-5 text-purple-600" />
                          Purchase History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {[
                            { theme: 'Aurora Dashboard', date: '2024-01-15', amount: '$59', invoice: 'INV-001' },
                            { theme: 'Commerce Pro', date: '2024-01-10', amount: '$149', invoice: 'INV-002' }
                          ].map((purchase, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div>
                                <span className="font-medium">{purchase.theme}</span>
                                <p className="text-xs text-gray-500">{purchase.date} • {purchase.invoice}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{purchase.amount}</span>
                                <Button variant="ghost" size="sm" onClick={() => handleViewReceipt(purchase.invoice)}>Receipt</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Bell className="w-5 h-5 text-rose-600" />
                          Theme Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Update Alerts</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when theme updates are available</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>New Theme Releases</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about new themes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Sale & Discount Alerts</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify about special offers</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>License Expiration</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Remind before licenses expire</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Star className="w-5 h-5 text-amber-600" />
                          Wishlist & Favorites
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Price Drop Alerts</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when wishlist items go on sale</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Back in Stock</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when limited themes return</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Delivery Channels</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                              <Bell className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <Label>In-App Notifications</Label>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                              <Globe className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <Label>Email Notifications</Label>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Integrations</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: 'GitHub', description: 'Deploy themes directly', icon: Code, connected: true, color: 'gray' },
                        { name: 'Figma', description: 'Import design files', icon: Layers, connected: true, color: 'purple' },
                        { name: 'VS Code', description: 'Install themes in editor', icon: Code, connected: false, color: 'blue' },
                        { name: 'Vercel', description: 'Auto-deploy previews', icon: Server, connected: true, color: 'black' },
                        { name: 'Netlify', description: 'Deploy to Netlify', icon: Globe, connected: false, color: 'teal' },
                        { name: 'Slack', description: 'Update notifications', icon: Bell, connected: false, color: 'purple' }
                      ].map(integration => (
                        <Card key={integration.name}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}>
                                  <integration.icon className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">{integration.name}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{integration.description}</p>
                                </div>
                              </div>
                              {integration.connected ? (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">Connected</Badge>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => handleConnect(integration.name)}>Connect</Button>
                              )}
                            </div>
                            {integration.connected && (
                              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <RefreshCw className="w-3 h-3" />
                                Last synced 5 minutes ago
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">API Access</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Label>API Key</Label>
                            <Button variant="ghost" size="sm" onClick={handleRegenerateKey}>Regenerate</Button>
                          </div>
                          <Input type="password" value="ts_live_••••••••••••••••" readOnly className="font-mono" />
                        </div>
                        <div className="flex items-center gap-4">
                          <Button variant="outline" className="flex items-center gap-2" onClick={handleViewDocs}>
                            <FileText className="w-4 h-4" />
                            View Docs
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2" onClick={handleDownloadSDK}>
                            <Download className="w-4 h-4" />
                            Download SDK
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Advanced Settings</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Zap className="w-5 h-5 text-amber-600" />
                          Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Lazy Load Images</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Load thumbnails on scroll</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Prefetch Theme Data</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Load theme details in background</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Enable Analytics</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Help improve the store experience</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Security
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Verify Theme Signatures</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Check theme integrity before install</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Sandbox Preview</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Run previews in isolated environment</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-base text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <Label className="text-red-700 dark:text-red-400">Remove All Installed Themes</Label>
                            <p className="text-sm text-red-600 dark:text-red-500">Uninstall all themes from your account</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={handleRemoveAll}>Remove All</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <Label className="text-red-700 dark:text-red-400">Reset Store Preferences</Label>
                            <p className="text-sm text-red-600 dark:text-red-500">Reset all settings to defaults</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={handleResetPreferences}>Reset</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockThemeStoreAIInsights}
              title="Theme Store Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockThemeStoreCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockThemeStorePredictions}
              title="Marketplace Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockThemeStoreActivities}
            title="Marketplace Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockThemeStoreQuickActions}
            variant="grid"
          />
        </div>
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
                  <Button className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={() => {
                    if (selectedTheme.status === 'installed' || selectedTheme.status === 'active') {
                      handleActivateTheme(selectedTheme.name)
                    } else {
                      handleInstallTheme(selectedTheme.name)
                    }
                  }}>
                    {selectedTheme.status === 'installed' || selectedTheme.status === 'active'
                      ? 'Activate Theme'
                      : selectedTheme.price === 0
                        ? 'Install Free'
                        : `Purchase for $${selectedTheme.discountPrice || selectedTheme.price}`}
                  </Button>
                  <Button variant="outline" onClick={() => handlePreviewTheme(selectedTheme.name)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Live Preview
                  </Button>
                  <Button variant="outline" onClick={() => handleAddToWishlist(selectedTheme.name)}>
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
