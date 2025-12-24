'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Store,
  Search,
  Download,
  Star,
  TrendingUp,
  Package,
  Settings,
  Grid3X3,
  List,
  Filter,
  Heart,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Play,
  Trash2,
  ExternalLink,
  Shield,
  Globe,
  Smartphone,
  Monitor,
  Code,
  Palette,
  BarChart3,
  DollarSign,
  Users,
  Zap,
  Award,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Plus,
  Sparkles,
  Crown,
  Gift,
  Tag,
  Calendar,
  Building2,
  Image,
  MoreHorizontal,
  ArrowUpRight,
  Layers
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS - App Store Connect Level
// ============================================================================

type AppStatus = 'installed' | 'available' | 'updating' | 'trial' | 'suspended' | 'pending'
type AppCategory = 'business' | 'productivity' | 'creative' | 'finance' | 'education' | 'utilities' | 'developer' | 'social' | 'communication' | 'analytics'
type AppPricing = 'free' | 'freemium' | 'paid' | 'subscription' | 'enterprise'
type Platform = 'web' | 'desktop' | 'mobile' | 'api'

interface App {
  id: string
  name: string
  slug: string
  tagline: string
  description: string
  developer: Developer
  category: AppCategory
  subcategory?: string
  pricing: AppPricing
  price: number
  billingCycle?: 'monthly' | 'yearly' | 'one_time'
  status: AppStatus
  version: string
  releaseDate: string
  lastUpdated: string
  size: number
  platforms: Platform[]
  screenshots: string[]
  icon: string
  rating: number
  reviewCount: number
  downloadCount: number
  activeUsers: number
  features: string[]
  requirements: string[]
  permissions: string[]
  languages: string[]
  trialDays: number
  trialActive: boolean
  trialEndsAt?: string
  installedAt?: string
  featured: boolean
  editorChoice: boolean
  trending: boolean
  inAppPurchases: boolean
  tags: string[]
}

interface Developer {
  id: string
  name: string
  website: string
  email: string
  verified: boolean
  appCount: number
  totalDownloads: number
  avgRating: number
}

interface Review {
  id: string
  appId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  content: string
  helpful: number
  notHelpful: number
  version: string
  createdAt: string
  developerResponse?: {
    content: string
    respondedAt: string
  }
}

interface AppCollection {
  id: string
  name: string
  description: string
  icon: string
  apps: string[]
  featured: boolean
}

interface AppUpdate {
  id: string
  appId: string
  appName: string
  currentVersion: string
  newVersion: string
  releaseNotes: string
  size: number
  availableAt: string
  autoUpdate: boolean
}

interface Analytics {
  totalApps: number
  installedApps: number
  trialApps: number
  pendingUpdates: number
  totalSpend: number
  monthlySpend: number
  storageUsed: number
  apiCalls: number
  topCategories: { category: AppCategory; count: number }[]
  recentActivity: { action: string; appName: string; time: string }[]
  downloadsTrend: { date: string; downloads: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockDevelopers: Developer[] = [
  { id: 'dev-1', name: 'Productivity Labs', website: 'productivitylabs.io', email: 'support@productivitylabs.io', verified: true, appCount: 12, totalDownloads: 2500000, avgRating: 4.7 },
  { id: 'dev-2', name: 'Creative Suite Co', website: 'creativesuite.co', email: 'hello@creativesuite.co', verified: true, appCount: 8, totalDownloads: 1800000, avgRating: 4.5 },
  { id: 'dev-3', name: 'DataFlow Inc', website: 'dataflow.io', email: 'support@dataflow.io', verified: true, appCount: 5, totalDownloads: 950000, avgRating: 4.8 },
  { id: 'dev-4', name: 'CommTools', website: 'commtools.app', email: 'team@commtools.app', verified: false, appCount: 3, totalDownloads: 340000, avgRating: 4.3 }
]

const mockApps: App[] = [
  {
    id: 'app-1',
    name: 'TaskFlow Pro',
    slug: 'taskflow-pro',
    tagline: 'The ultimate project management solution',
    description: 'TaskFlow Pro helps teams organize, track, and manage their work in one place. Features include Kanban boards, Gantt charts, time tracking, and real-time collaboration.',
    developer: mockDevelopers[0],
    category: 'productivity',
    subcategory: 'Project Management',
    pricing: 'subscription',
    price: 12.99,
    billingCycle: 'monthly',
    status: 'installed',
    version: '5.2.1',
    releaseDate: '2023-01-15',
    lastUpdated: '2024-12-20',
    size: 45000000,
    platforms: ['web', 'desktop', 'mobile'],
    screenshots: ['/screenshots/taskflow-1.png', '/screenshots/taskflow-2.png'],
    icon: '/icons/taskflow.png',
    rating: 4.8,
    reviewCount: 12450,
    downloadCount: 890000,
    activeUsers: 245000,
    features: ['Kanban Boards', 'Gantt Charts', 'Time Tracking', 'Team Collaboration', 'Custom Workflows', 'API Access'],
    requirements: ['Modern browser', '2GB RAM minimum'],
    permissions: ['Calendar access', 'Notifications', 'File storage'],
    languages: ['English', 'Spanish', 'French', 'German', 'Japanese'],
    trialDays: 14,
    trialActive: false,
    installedAt: '2024-06-15T10:00:00Z',
    featured: true,
    editorChoice: true,
    trending: true,
    inAppPurchases: true,
    tags: ['productivity', 'project-management', 'team', 'collaboration']
  },
  {
    id: 'app-2',
    name: 'DesignStudio Max',
    slug: 'designstudio-max',
    tagline: 'Professional design tools for everyone',
    description: 'DesignStudio Max provides professional-grade design tools including vector graphics, photo editing, prototyping, and collaborative design features.',
    developer: mockDevelopers[1],
    category: 'creative',
    subcategory: 'Design Tools',
    pricing: 'subscription',
    price: 24.99,
    billingCycle: 'monthly',
    status: 'trial',
    version: '3.8.0',
    releaseDate: '2022-08-20',
    lastUpdated: '2024-12-18',
    size: 120000000,
    platforms: ['web', 'desktop'],
    screenshots: ['/screenshots/designstudio-1.png'],
    icon: '/icons/designstudio.png',
    rating: 4.6,
    reviewCount: 8920,
    downloadCount: 567000,
    activeUsers: 123000,
    features: ['Vector Graphics', 'Photo Editing', 'Prototyping', 'Collaborative Design', 'Asset Library', 'Export to Multiple Formats'],
    requirements: ['8GB RAM recommended', 'GPU acceleration supported'],
    permissions: ['File access', 'Cloud storage sync'],
    languages: ['English', 'Spanish', 'Portuguese', 'Chinese'],
    trialDays: 14,
    trialActive: true,
    trialEndsAt: '2025-01-05T00:00:00Z',
    featured: true,
    editorChoice: false,
    trending: true,
    inAppPurchases: true,
    tags: ['design', 'creative', 'graphics', 'prototyping']
  },
  {
    id: 'app-3',
    name: 'DataViz Analytics',
    slug: 'dataviz-analytics',
    tagline: 'Transform data into insights',
    description: 'DataViz Analytics provides powerful data visualization and business intelligence tools. Connect to any data source and create stunning dashboards in minutes.',
    developer: mockDevelopers[2],
    category: 'analytics',
    subcategory: 'Business Intelligence',
    pricing: 'enterprise',
    price: 99.99,
    billingCycle: 'monthly',
    status: 'available',
    version: '2.5.0',
    releaseDate: '2023-06-10',
    lastUpdated: '2024-12-15',
    size: 85000000,
    platforms: ['web', 'api'],
    screenshots: [],
    icon: '/icons/dataviz.png',
    rating: 4.9,
    reviewCount: 3240,
    downloadCount: 234000,
    activeUsers: 89000,
    features: ['50+ Data Connectors', 'Real-time Dashboards', 'AI-Powered Insights', 'Custom Visualizations', 'Scheduled Reports', 'Team Workspaces'],
    requirements: ['Enterprise SSO compatible', 'API rate limits apply'],
    permissions: ['Data source access', 'Export permissions'],
    languages: ['English', 'German', 'French'],
    trialDays: 30,
    trialActive: false,
    featured: true,
    editorChoice: true,
    trending: false,
    inAppPurchases: false,
    tags: ['analytics', 'data', 'business-intelligence', 'dashboards']
  },
  {
    id: 'app-4',
    name: 'TeamChat',
    slug: 'teamchat',
    tagline: 'Real-time team communication',
    description: 'TeamChat brings your team together with instant messaging, video calls, screen sharing, and integrations with your favorite tools.',
    developer: mockDevelopers[3],
    category: 'communication',
    pricing: 'freemium',
    price: 0,
    status: 'installed',
    version: '4.1.2',
    releaseDate: '2022-03-01',
    lastUpdated: '2024-12-22',
    size: 35000000,
    platforms: ['web', 'desktop', 'mobile'],
    screenshots: [],
    icon: '/icons/teamchat.png',
    rating: 4.4,
    reviewCount: 45670,
    downloadCount: 2340000,
    activeUsers: 890000,
    features: ['Instant Messaging', 'Video Calls', 'Screen Sharing', 'File Sharing', 'Channels', 'Integrations'],
    requirements: ['Stable internet connection'],
    permissions: ['Camera', 'Microphone', 'Notifications'],
    languages: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean', 'Chinese'],
    trialDays: 0,
    trialActive: false,
    installedAt: '2024-01-10T09:00:00Z',
    featured: false,
    editorChoice: false,
    trending: true,
    inAppPurchases: true,
    tags: ['communication', 'team', 'messaging', 'video']
  },
  {
    id: 'app-5',
    name: 'FinanceHub',
    slug: 'financehub',
    tagline: 'Complete financial management',
    description: 'FinanceHub provides comprehensive financial management including invoicing, expense tracking, budgeting, and financial reporting.',
    developer: mockDevelopers[2],
    category: 'finance',
    subcategory: 'Accounting',
    pricing: 'subscription',
    price: 19.99,
    billingCycle: 'monthly',
    status: 'installed',
    version: '6.0.3',
    releaseDate: '2021-11-15',
    lastUpdated: '2024-12-19',
    size: 55000000,
    platforms: ['web', 'mobile'],
    screenshots: [],
    icon: '/icons/financehub.png',
    rating: 4.7,
    reviewCount: 7890,
    downloadCount: 445000,
    activeUsers: 156000,
    features: ['Invoicing', 'Expense Tracking', 'Budgeting', 'Financial Reports', 'Tax Preparation', 'Multi-Currency'],
    requirements: ['Bank-level encryption'],
    permissions: ['Financial data access', 'Bank connections'],
    languages: ['English', 'Spanish', 'French', 'German'],
    trialDays: 14,
    trialActive: false,
    installedAt: '2024-03-20T14:00:00Z',
    featured: false,
    editorChoice: true,
    trending: false,
    inAppPurchases: false,
    tags: ['finance', 'accounting', 'invoicing', 'budgeting']
  },
  {
    id: 'app-6',
    name: 'CodeEditor Pro',
    slug: 'codeeditor-pro',
    tagline: 'The developers choice IDE',
    description: 'CodeEditor Pro is a powerful integrated development environment with syntax highlighting, debugging, Git integration, and AI-powered code completion.',
    developer: mockDevelopers[0],
    category: 'developer',
    subcategory: 'IDE',
    pricing: 'freemium',
    price: 0,
    status: 'available',
    version: '8.2.1',
    releaseDate: '2020-06-01',
    lastUpdated: '2024-12-21',
    size: 180000000,
    platforms: ['desktop'],
    screenshots: [],
    icon: '/icons/codeeditor.png',
    rating: 4.8,
    reviewCount: 23450,
    downloadCount: 1890000,
    activeUsers: 567000,
    features: ['Syntax Highlighting', 'Debugging', 'Git Integration', 'AI Code Completion', 'Extensions Marketplace', 'Remote Development'],
    requirements: ['4GB RAM minimum', '64-bit OS'],
    permissions: ['File system access', 'Terminal access'],
    languages: ['English'],
    trialDays: 0,
    trialActive: false,
    featured: true,
    editorChoice: true,
    trending: true,
    inAppPurchases: true,
    tags: ['developer', 'ide', 'coding', 'programming']
  }
]

const mockReviews: Review[] = [
  {
    id: 'rev-1',
    appId: 'app-1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    rating: 5,
    title: 'Best project management tool ever!',
    content: 'TaskFlow Pro has completely transformed how our team works. The Kanban boards and time tracking features are incredibly intuitive.',
    helpful: 234,
    notHelpful: 12,
    version: '5.2.0',
    createdAt: '2024-12-18T10:00:00Z',
    developerResponse: {
      content: 'Thank you for your wonderful review! We\'re thrilled to hear TaskFlow Pro is helping your team succeed.',
      respondedAt: '2024-12-19T09:00:00Z'
    }
  },
  {
    id: 'rev-2',
    appId: 'app-1',
    userId: 'user-2',
    userName: 'Mike Chen',
    rating: 4,
    title: 'Great app, minor improvements needed',
    content: 'Overall excellent experience. Would love to see better mobile app performance and more customization options for Gantt charts.',
    helpful: 89,
    notHelpful: 5,
    version: '5.1.8',
    createdAt: '2024-12-15T14:00:00Z'
  }
]

const mockCollections: AppCollection[] = [
  { id: 'col-1', name: 'Essential Productivity', description: 'Must-have apps for getting things done', icon: '⚡', apps: ['app-1', 'app-4'], featured: true },
  { id: 'col-2', name: 'Creative Suite', description: 'Tools for designers and creators', icon: '🎨', apps: ['app-2'], featured: true },
  { id: 'col-3', name: 'Developer Tools', description: 'Build amazing software', icon: '💻', apps: ['app-6'], featured: false },
  { id: 'col-4', name: 'Business Essentials', description: 'Run your business efficiently', icon: '📊', apps: ['app-3', 'app-5'], featured: true }
]

const mockUpdates: AppUpdate[] = [
  { id: 'upd-1', appId: 'app-1', appName: 'TaskFlow Pro', currentVersion: '5.2.0', newVersion: '5.2.1', releaseNotes: 'Bug fixes and performance improvements', size: 12000000, availableAt: '2024-12-20T08:00:00Z', autoUpdate: true },
  { id: 'upd-2', appId: 'app-4', appName: 'TeamChat', currentVersion: '4.1.1', newVersion: '4.1.2', releaseNotes: 'New emoji reactions, improved video quality', size: 8000000, availableAt: '2024-12-22T10:00:00Z', autoUpdate: false }
]

const mockAnalytics: Analytics = {
  totalApps: 156,
  installedApps: 12,
  trialApps: 2,
  pendingUpdates: 3,
  totalSpend: 2450.00,
  monthlySpend: 287.00,
  storageUsed: 2.4,
  apiCalls: 45670,
  topCategories: [
    { category: 'productivity', count: 5 },
    { category: 'communication', count: 3 },
    { category: 'developer', count: 2 },
    { category: 'creative', count: 1 },
    { category: 'finance', count: 1 }
  ],
  recentActivity: [
    { action: 'Updated', appName: 'TaskFlow Pro', time: '2 hours ago' },
    { action: 'Installed', appName: 'SmartNotes', time: '1 day ago' },
    { action: 'Started trial', appName: 'DesignStudio Max', time: '3 days ago' },
    { action: 'Renewed subscription', appName: 'FinanceHub', time: '1 week ago' }
  ],
  downloadsTrend: [
    { date: '2024-12-17', downloads: 12 },
    { date: '2024-12-18', downloads: 8 },
    { date: '2024-12-19', downloads: 15 },
    { date: '2024-12-20', downloads: 23 },
    { date: '2024-12-21', downloads: 11 },
    { date: '2024-12-22', downloads: 18 },
    { date: '2024-12-23', downloads: 14 }
  ]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusBadge = (status: AppStatus) => {
  switch (status) {
    case 'installed':
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="w-3 h-3 mr-1" />Installed</Badge>
    case 'available':
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"><Download className="w-3 h-3 mr-1" />Available</Badge>
    case 'updating':
      return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Updating</Badge>
    case 'trial':
      return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"><Clock className="w-3 h-3 mr-1" />Trial</Badge>
    case 'suspended':
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><AlertCircle className="w-3 h-3 mr-1" />Suspended</Badge>
    case 'pending':
      return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
  }
}

const getCategoryBadge = (category: AppCategory) => {
  const colors: Record<AppCategory, string> = {
    business: 'bg-blue-100 text-blue-700',
    productivity: 'bg-green-100 text-green-700',
    creative: 'bg-purple-100 text-purple-700',
    finance: 'bg-emerald-100 text-emerald-700',
    education: 'bg-yellow-100 text-yellow-700',
    utilities: 'bg-gray-100 text-gray-700',
    developer: 'bg-orange-100 text-orange-700',
    social: 'bg-pink-100 text-pink-700',
    communication: 'bg-cyan-100 text-cyan-700',
    analytics: 'bg-indigo-100 text-indigo-700'
  }
  return <Badge className={colors[category]}>{category}</Badge>
}

const getPricingBadge = (pricing: AppPricing, price: number) => {
  switch (pricing) {
    case 'free':
      return <Badge className="bg-green-100 text-green-700">Free</Badge>
    case 'freemium':
      return <Badge className="bg-blue-100 text-blue-700">Freemium</Badge>
    case 'paid':
      return <Badge className="bg-purple-100 text-purple-700">${price}</Badge>
    case 'subscription':
      return <Badge className="bg-indigo-100 text-indigo-700">${price}/mo</Badge>
    case 'enterprise':
      return <Badge className="bg-orange-100 text-orange-700">Enterprise</Badge>
  }
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const formatBytes = (bytes: number) => {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AppStoreClient() {
  const [activeTab, setActiveTab] = useState('discover')
  const [apps] = useState<App[]>(mockApps)
  const [reviews] = useState<Review[]>(mockReviews)
  const [collections] = useState<AppCollection[]>(mockCollections)
  const [updates] = useState<AppUpdate[]>(mockUpdates)
  const [analytics] = useState<Analytics>(mockAnalytics)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<AppCategory | 'all'>('all')
  const [pricingFilter, setPricingFilter] = useState<AppPricing | 'all'>('all')
  const [selectedApp, setSelectedApp] = useState<App | null>(null)
  const [showAppDialog, setShowAppDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filtered apps
  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesSearch = !searchQuery ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.developer.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || app.category === categoryFilter
      const matchesPricing = pricingFilter === 'all' || app.pricing === pricingFilter
      return matchesSearch && matchesStatus && matchesCategory && matchesPricing
    })
  }, [apps, searchQuery, statusFilter, categoryFilter, pricingFilter])

  // Stats
  const stats = useMemo(() => ({
    total: apps.length,
    installed: apps.filter(a => a.status === 'installed').length,
    trials: apps.filter(a => a.status === 'trial').length,
    updates: updates.length,
    totalDownloads: apps.reduce((sum, a) => sum + a.downloadCount, 0),
    avgRating: apps.reduce((sum, a) => sum + a.rating, 0) / apps.length,
    monthlySpend: analytics.monthlySpend,
    featured: apps.filter(a => a.featured).length
  }), [apps, updates, analytics])

  const handleViewApp = (app: App) => {
    setSelectedApp(app)
    setShowAppDialog(true)
  }

  const featuredApps = apps.filter(a => a.featured)
  const trendingApps = apps.filter(a => a.trending)
  const editorChoiceApps = apps.filter(a => a.editorChoice)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Store className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">App Store</h1>
                <p className="text-indigo-100">Discover and install powerful applications</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Heart className="w-4 h-4 mr-2" />
                Wishlist
              </Button>
              <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                <Package className="w-4 h-4 mr-2" />
                My Apps
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <Package className="w-4 h-4" />
                <span className="text-sm">Total Apps</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Installed</span>
              </div>
              <p className="text-2xl font-bold">{stats.installed}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Trials</span>
              </div>
              <p className="text-2xl font-bold">{stats.trials}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Updates</span>
              </div>
              <p className="text-2xl font-bold">{stats.updates}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <Download className="w-4 h-4" />
                <span className="text-sm">Downloads</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(stats.totalDownloads)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <Star className="w-4 h-4" />
                <span className="text-sm">Avg Rating</span>
              </div>
              <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Monthly</span>
              </div>
              <p className="text-2xl font-bold">${stats.monthlySpend}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">Featured</span>
              </div>
              <p className="text-2xl font-bold">{stats.featured}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="discover" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Discover
              </TabsTrigger>
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" />
                Browse
              </TabsTrigger>
              <TabsTrigger value="installed" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Installed
              </TabsTrigger>
              <TabsTrigger value="updates" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Updates
                {updates.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">{updates.length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="collections" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Collections
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center border rounded-lg p-1 bg-white dark:bg-gray-800">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-8">
            {/* Featured Banner */}
            <Card className="overflow-hidden dark:bg-gray-800/50">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5" />
                  <span className="text-sm font-medium">FEATURED</span>
                </div>
                <h2 className="text-3xl font-bold mb-2">{featuredApps[0]?.name}</h2>
                <p className="text-indigo-100 mb-4">{featuredApps[0]?.tagline}</p>
                <div className="flex items-center gap-4">
                  <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                    <Download className="w-4 h-4 mr-2" />
                    Get App
                  </Button>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    Learn More
                  </Button>
                </div>
              </div>
            </Card>

            {/* Editor's Choice */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Editor's Choice
                </h3>
                <Button variant="ghost" size="sm">
                  See All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {editorChoiceApps.slice(0, 3).map((app) => (
                  <Card
                    key={app.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800/50"
                    onClick={() => handleViewApp(app)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {app.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{app.name}</h4>
                            <Award className="w-4 h-4 text-yellow-500" />
                          </div>
                          <p className="text-sm text-muted-foreground">{app.developer.name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{app.tagline}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{app.rating.toFixed(1)}</span>
                        </div>
                        {getPricingBadge(app.pricing, app.price)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Trending Now */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Trending Now
                </h3>
                <Button variant="ghost" size="sm">
                  See All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {trendingApps.map((app) => (
                  <Card
                    key={app.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800/50"
                    onClick={() => handleViewApp(app)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                          {app.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{app.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{app.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span>{app.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-muted-foreground">{formatNumber(app.downloadCount)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Collections */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-500" />
                  Featured Collections
                </h3>
                <Button variant="ghost" size="sm">
                  See All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {collections.filter(c => c.featured).map((collection) => (
                  <Card key={collection.id} className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800/50">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{collection.icon}</div>
                      <h4 className="font-semibold mb-1">{collection.name}</h4>
                      <p className="text-sm text-muted-foreground">{collection.apps.length} apps</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Browse Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <Card className="dark:bg-gray-800/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as AppStatus | 'all')}
                    className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="installed">Installed</option>
                    <option value="available">Available</option>
                    <option value="trial">Trial</option>
                    <option value="updating">Updating</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as AppCategory | 'all')}
                    className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="productivity">Productivity</option>
                    <option value="creative">Creative</option>
                    <option value="developer">Developer</option>
                    <option value="communication">Communication</option>
                    <option value="finance">Finance</option>
                    <option value="analytics">Analytics</option>
                  </select>
                  <select
                    value={pricingFilter}
                    onChange={(e) => setPricingFilter(e.target.value as AppPricing | 'all')}
                    className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Pricing</option>
                    <option value="free">Free</option>
                    <option value="freemium">Freemium</option>
                    <option value="subscription">Subscription</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                  <div className="flex-1" />
                  <span className="text-sm text-muted-foreground">
                    {filteredApps.length} apps
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Apps Grid */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
              {filteredApps.map((app) => (
                <Card
                  key={app.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800/50"
                  onClick={() => handleViewApp(app)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {app.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold truncate">{app.name}</h4>
                          {app.editorChoice && <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{app.developer.name}</p>
                        {getStatusBadge(app.status)}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{app.tagline}</p>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {getCategoryBadge(app.category)}
                      {getPricingBadge(app.pricing, app.price)}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{app.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({formatNumber(app.reviewCount)})</span>
                      </div>
                      <span className="text-muted-foreground">{formatNumber(app.downloadCount)}</span>
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t">
                      {app.status === 'installed' ? (
                        <>
                          <Button size="sm" className="flex-1">
                            <Play className="w-4 h-4 mr-1" />
                            Open
                          </Button>
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </>
                      ) : app.status === 'trial' ? (
                        <>
                          <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                            Purchase
                          </Button>
                          <Button size="sm" variant="outline">
                            <Play className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" className="flex-1">
                            <Download className="w-4 h-4 mr-1" />
                            Get
                          </Button>
                          {app.trialDays > 0 && (
                            <Button size="sm" variant="outline">
                              Try Free
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Installed Tab */}
          <TabsContent value="installed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle>Installed Apps ({apps.filter(a => a.status === 'installed' || a.status === 'trial').length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {apps.filter(a => a.status === 'installed' || a.status === 'trial').map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center gap-4 p-4 rounded-lg border dark:border-gray-700 hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleViewApp(app)}
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {app.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{app.name}</h4>
                              {getStatusBadge(app.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">v{app.version} • {formatBytes(app.size)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm">
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle>Storage Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <p className="text-3xl font-bold">{analytics.storageUsed} GB</p>
                      <p className="text-sm text-muted-foreground">of 10 GB used</p>
                    </div>
                    <Progress value={(analytics.storageUsed / 10) * 100} className="h-2" />
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <CardTitle>Monthly Spending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold">${analytics.monthlySpend}</p>
                      <p className="text-sm text-muted-foreground">This month</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-6">
            <Card className="dark:bg-gray-800/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Available Updates ({updates.length})</CardTitle>
                <Button>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Update All
                </Button>
              </CardHeader>
              <CardContent>
                {updates.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p>All apps are up to date!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {updates.map((update) => (
                      <div key={update.id} className="flex items-center gap-4 p-4 rounded-lg border dark:border-gray-700">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {update.appName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{update.appName}</h4>
                          <p className="text-sm text-muted-foreground">
                            v{update.currentVersion} → v{update.newVersion} • {formatBytes(update.size)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{update.releaseNotes}</p>
                        </div>
                        <Button>
                          <Download className="w-4 h-4 mr-2" />
                          Update
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <Card key={collection.id} className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800/50">
                  <CardContent className="p-6">
                    <div className="text-5xl mb-4">{collection.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{collection.name}</h3>
                    <p className="text-muted-foreground mb-4">{collection.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{collection.apps.length} apps</Badge>
                      {collection.featured && (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Spend</span>
                    <DollarSign className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">${analytics.totalSpend}</p>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">API Calls</span>
                    <Zap className="w-4 h-4 text-yellow-500" />
                  </div>
                  <p className="text-3xl font-bold">{formatNumber(analytics.apiCalls)}</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Storage</span>
                    <Package className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold">{analytics.storageUsed} GB</p>
                  <p className="text-xs text-muted-foreground">of 10 GB</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Active Apps</span>
                    <Users className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-3xl font-bold">{analytics.installedApps}</p>
                  <p className="text-xs text-muted-foreground">Running now</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Download Trend */}
              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle>Activity Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-end justify-between gap-2">
                    {analytics.downloadsTrend.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg"
                          style={{ height: `${(day.downloads / 25) * 100}%` }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Categories */}
              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle>Apps by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topCategories.map((cat, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm capitalize">{cat.category}</span>
                          <span className="font-semibold">{cat.count} apps</span>
                        </div>
                        <Progress value={(cat.count / analytics.installedApps) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        {activity.action === 'Updated' && <RefreshCw className="w-5 h-5 text-indigo-600" />}
                        {activity.action === 'Installed' && <Download className="w-5 h-5 text-green-600" />}
                        {activity.action === 'Started trial' && <Clock className="w-5 h-5 text-purple-600" />}
                        {activity.action === 'Renewed subscription' && <DollarSign className="w-5 h-5 text-emerald-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}: {activity.appName}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* App Detail Dialog */}
      <Dialog open={showAppDialog} onOpenChange={setShowAppDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedApp.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <DialogTitle className="text-2xl">{selectedApp.name}</DialogTitle>
                      {selectedApp.editorChoice && <Award className="w-5 h-5 text-yellow-500" />}
                      {selectedApp.developer.verified && <Shield className="w-5 h-5 text-blue-500" />}
                    </div>
                    <p className="text-muted-foreground">{selectedApp.developer.name}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {getStatusBadge(selectedApp.status)}
                      {getCategoryBadge(selectedApp.category)}
                      {getPricingBadge(selectedApp.pricing, selectedApp.price)}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-2xl font-bold">{selectedApp.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatNumber(selectedApp.reviewCount)} reviews</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{formatNumber(selectedApp.downloadCount)}</p>
                    <p className="text-sm text-muted-foreground">Downloads</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{formatBytes(selectedApp.size)}</p>
                    <p className="text-sm text-muted-foreground">Size</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">v{selectedApp.version}</p>
                    <p className="text-sm text-muted-foreground">Version</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-muted-foreground">{selectedApp.description}</p>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.features.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Platforms */}
                <div>
                  <h4 className="font-semibold mb-2">Available On</h4>
                  <div className="flex gap-2">
                    {selectedApp.platforms.includes('web') && (
                      <Badge variant="outline"><Globe className="w-3 h-3 mr-1" />Web</Badge>
                    )}
                    {selectedApp.platforms.includes('desktop') && (
                      <Badge variant="outline"><Monitor className="w-3 h-3 mr-1" />Desktop</Badge>
                    )}
                    {selectedApp.platforms.includes('mobile') && (
                      <Badge variant="outline"><Smartphone className="w-3 h-3 mr-1" />Mobile</Badge>
                    )}
                    {selectedApp.platforms.includes('api') && (
                      <Badge variant="outline"><Code className="w-3 h-3 mr-1" />API</Badge>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h4 className="font-semibold mb-2">Languages</h4>
                  <p className="text-sm text-muted-foreground">{selectedApp.languages.join(', ')}</p>
                </div>

                {/* Developer Info */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Developer</h4>
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <Building2 className="w-10 h-10 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{selectedApp.developer.name}</p>
                        {selectedApp.developer.verified && (
                          <Badge className="bg-blue-100 text-blue-700">
                            <Shield className="w-3 h-3 mr-1" />Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedApp.developer.appCount} apps • {formatNumber(selectedApp.developer.totalDownloads)} total downloads</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Website
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  {selectedApp.status === 'installed' ? (
                    <>
                      <Button className="flex-1">
                        <Play className="w-4 h-4 mr-2" />
                        Open App
                      </Button>
                      <Button variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                      <Button variant="outline" className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Uninstall
                      </Button>
                    </>
                  ) : selectedApp.status === 'trial' ? (
                    <>
                      <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Purchase Now
                      </Button>
                      <Button variant="outline">
                        <Play className="w-4 h-4 mr-2" />
                        Continue Trial
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Install
                      </Button>
                      {selectedApp.trialDays > 0 && (
                        <Button variant="outline">
                          <Clock className="w-4 h-4 mr-2" />
                          Try {selectedApp.trialDays} Days Free
                        </Button>
                      )}
                      <Button variant="outline">
                        <Heart className="w-4 h-4 mr-2" />
                        Wishlist
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
