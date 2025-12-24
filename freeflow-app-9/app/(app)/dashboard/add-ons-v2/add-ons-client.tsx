'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Package,
  Puzzle,
  Download,
  Star,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Grid3x3,
  List,
  Settings,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
  Eye,
  Heart,
  Share2,
  Trash2,
  Plus,
  Power,
  PowerOff,
  ExternalLink,
  Globe,
  Lock,
  Code,
  Palette,
  BarChart3,
  MessageSquare,
  Users,
  CreditCard,
  Bell,
  HelpCircle,
  Play,
  Pause,
  Upload,
  FolderPlus,
  Tag,
  Layers,
  Workflow,
  Wand2,
  Bot,
  Database,
  Cloud,
  Mail,
  Calendar,
  FileText,
  Image,
  Video,
  Music,
  Gift,
  Crown,
  Award,
  Store,
  ShoppingCart
} from 'lucide-react'

// Types
type AddOnStatus = 'installed' | 'available' | 'disabled' | 'update_available' | 'deprecated'
type AddOnCategory = 'productivity' | 'integration' | 'security' | 'analytics' | 'communication' | 'design' | 'developer' | 'ai' | 'storage' | 'marketing'
type PricingType = 'free' | 'paid' | 'freemium' | 'subscription' | 'one_time'
type PermissionLevel = 'basic' | 'standard' | 'elevated' | 'full_access'

interface AddOn {
  id: string
  name: string
  description: string
  shortDescription: string
  version: string
  author: string
  authorUrl?: string
  icon?: string
  category: AddOnCategory
  status: AddOnStatus
  pricingType: PricingType
  price: number
  currency: string
  rating: number
  reviewCount: number
  downloadCount: number
  installedCount: number
  lastUpdated: string
  createdAt: string
  size: string
  permissions: PermissionLevel
  features: string[]
  tags: string[]
  screenshots?: string[]
  changelog?: string
  isFeatured: boolean
  isVerified: boolean
  hasFreeTrial: boolean
  trialDays?: number
  requiredVersion?: string
}

interface Review {
  id: string
  addOnId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  content: string
  createdAt: string
  helpful: number
  isVerifiedPurchase: boolean
}

interface AddOnStats {
  totalAddOns: number
  installedAddOns: number
  availableAddOns: number
  totalDownloads: number
  avgRating: number
  featuredCount: number
  freeCount: number
  paidCount: number
}

// Mock data
const mockAddOns: AddOn[] = [
  {
    id: '1',
    name: 'AI Assistant Pro',
    description: 'Advanced AI-powered assistant that helps with content generation, code completion, data analysis, and automated workflows. Integrates seamlessly with your existing tools.',
    shortDescription: 'AI-powered productivity assistant',
    version: '3.2.1',
    author: 'TechFlow Labs',
    category: 'ai',
    status: 'installed',
    pricingType: 'subscription',
    price: 19.99,
    currency: 'USD',
    rating: 4.8,
    reviewCount: 2847,
    downloadCount: 156000,
    installedCount: 89000,
    lastUpdated: '2024-12-20',
    createdAt: '2023-06-15',
    size: '24.5 MB',
    permissions: 'elevated',
    features: ['Content generation', 'Code completion', 'Data analysis', 'Workflow automation', 'Natural language processing'],
    tags: ['ai', 'productivity', 'automation'],
    isFeatured: true,
    isVerified: true,
    hasFreeTrial: true,
    trialDays: 14
  },
  {
    id: '2',
    name: 'Slack Integration',
    description: 'Connect your workspace with Slack for real-time notifications, channel syncing, and seamless collaboration across teams.',
    shortDescription: 'Real-time Slack notifications',
    version: '2.1.0',
    author: 'Integration Hub',
    category: 'integration',
    status: 'installed',
    pricingType: 'free',
    price: 0,
    currency: 'USD',
    rating: 4.6,
    reviewCount: 1523,
    downloadCount: 234000,
    installedCount: 178000,
    lastUpdated: '2024-12-18',
    createdAt: '2022-03-10',
    size: '8.2 MB',
    permissions: 'standard',
    features: ['Channel sync', 'Real-time notifications', 'Message threading', 'File sharing'],
    tags: ['slack', 'communication', 'team'],
    isFeatured: true,
    isVerified: true,
    hasFreeTrial: false
  },
  {
    id: '3',
    name: 'Advanced Security Suite',
    description: 'Enterprise-grade security with 2FA, SSO integration, audit logs, and threat detection. Protect your data with military-grade encryption.',
    shortDescription: 'Enterprise security solution',
    version: '4.0.0',
    author: 'SecureStack',
    category: 'security',
    status: 'available',
    pricingType: 'subscription',
    price: 29.99,
    currency: 'USD',
    rating: 4.9,
    reviewCount: 892,
    downloadCount: 67000,
    installedCount: 45000,
    lastUpdated: '2024-12-22',
    createdAt: '2023-01-20',
    size: '18.7 MB',
    permissions: 'full_access',
    features: ['Two-factor authentication', 'SSO integration', 'Audit logging', 'Threat detection', 'Data encryption'],
    tags: ['security', 'enterprise', 'compliance'],
    isFeatured: true,
    isVerified: true,
    hasFreeTrial: true,
    trialDays: 30
  },
  {
    id: '4',
    name: 'Analytics Dashboard Pro',
    description: 'Comprehensive analytics with custom dashboards, real-time metrics, and advanced reporting capabilities.',
    shortDescription: 'Advanced analytics & reporting',
    version: '2.8.5',
    author: 'DataViz Inc',
    category: 'analytics',
    status: 'update_available',
    pricingType: 'freemium',
    price: 14.99,
    currency: 'USD',
    rating: 4.5,
    reviewCount: 1234,
    downloadCount: 98000,
    installedCount: 62000,
    lastUpdated: '2024-12-15',
    createdAt: '2022-08-05',
    size: '15.3 MB',
    permissions: 'standard',
    features: ['Custom dashboards', 'Real-time metrics', 'Export reports', 'Team sharing', 'API access'],
    tags: ['analytics', 'dashboard', 'reporting'],
    isFeatured: false,
    isVerified: true,
    hasFreeTrial: true,
    trialDays: 7
  },
  {
    id: '5',
    name: 'Email Campaign Manager',
    description: 'Create, send, and track email campaigns with advanced automation and personalization features.',
    shortDescription: 'Email marketing automation',
    version: '1.9.2',
    author: 'MailFlow',
    category: 'marketing',
    status: 'available',
    pricingType: 'subscription',
    price: 24.99,
    currency: 'USD',
    rating: 4.4,
    reviewCount: 756,
    downloadCount: 54000,
    installedCount: 32000,
    lastUpdated: '2024-12-10',
    createdAt: '2023-04-18',
    size: '12.8 MB',
    permissions: 'standard',
    features: ['Email templates', 'A/B testing', 'Automation workflows', 'Analytics', 'Segmentation'],
    tags: ['email', 'marketing', 'automation'],
    isFeatured: false,
    isVerified: true,
    hasFreeTrial: true,
    trialDays: 14
  },
  {
    id: '6',
    name: 'Cloud Storage Connector',
    description: 'Connect to AWS S3, Google Cloud Storage, and Azure Blob for seamless file management and backup.',
    shortDescription: 'Multi-cloud storage integration',
    version: '3.1.0',
    author: 'CloudBridge',
    category: 'storage',
    status: 'installed',
    pricingType: 'paid',
    price: 9.99,
    currency: 'USD',
    rating: 4.7,
    reviewCount: 567,
    downloadCount: 78000,
    installedCount: 56000,
    lastUpdated: '2024-12-12',
    createdAt: '2022-11-30',
    size: '6.4 MB',
    permissions: 'elevated',
    features: ['Multi-cloud support', 'Auto-sync', 'Version control', 'Encryption', 'Backup scheduling'],
    tags: ['storage', 'cloud', 'backup'],
    isFeatured: true,
    isVerified: true,
    hasFreeTrial: false
  },
  {
    id: '7',
    name: 'Developer Toolkit',
    description: 'Essential tools for developers including code snippets, API testing, debugging tools, and documentation generator.',
    shortDescription: 'Developer productivity tools',
    version: '2.5.4',
    author: 'DevTools Pro',
    category: 'developer',
    status: 'disabled',
    pricingType: 'free',
    price: 0,
    currency: 'USD',
    rating: 4.3,
    reviewCount: 1892,
    downloadCount: 145000,
    installedCount: 98000,
    lastUpdated: '2024-11-28',
    createdAt: '2022-05-12',
    size: '22.1 MB',
    permissions: 'basic',
    features: ['Code snippets', 'API testing', 'Debugging', 'Documentation', 'Git integration'],
    tags: ['developer', 'tools', 'productivity'],
    isFeatured: false,
    isVerified: true,
    hasFreeTrial: false
  },
  {
    id: '8',
    name: 'Design System Kit',
    description: 'Complete design system with UI components, color palettes, typography, and Figma integration.',
    shortDescription: 'UI components & design assets',
    version: '1.4.0',
    author: 'DesignFlow',
    category: 'design',
    status: 'available',
    pricingType: 'one_time',
    price: 49.99,
    currency: 'USD',
    rating: 4.6,
    reviewCount: 423,
    downloadCount: 34000,
    installedCount: 28000,
    lastUpdated: '2024-12-05',
    createdAt: '2023-09-22',
    size: '45.2 MB',
    permissions: 'basic',
    features: ['UI components', 'Color palettes', 'Typography system', 'Figma plugin', 'Icon library'],
    tags: ['design', 'ui', 'components'],
    isFeatured: true,
    isVerified: true,
    hasFreeTrial: false
  }
]

const mockReviews: Review[] = [
  { id: '1', addOnId: '1', userId: '1', userName: 'Sarah Chen', rating: 5, title: 'Game changer for productivity', content: 'This AI assistant has completely transformed how I work. The content generation is incredibly accurate.', createdAt: '2024-12-20', helpful: 45, isVerifiedPurchase: true },
  { id: '2', addOnId: '1', userId: '2', userName: 'Mike Johnson', rating: 4, title: 'Great but room for improvement', content: 'Very useful tool overall. Would love to see better integration with external APIs.', createdAt: '2024-12-18', helpful: 23, isVerifiedPurchase: true },
  { id: '3', addOnId: '2', userId: '3', userName: 'Emily Davis', rating: 5, title: 'Perfect Slack integration', content: 'Exactly what we needed for our team. Real-time notifications work flawlessly.', createdAt: '2024-12-15', helpful: 67, isVerifiedPurchase: true },
  { id: '4', addOnId: '3', userId: '4', userName: 'Alex Thompson', rating: 5, title: 'Enterprise-grade security', content: 'Finally a security solution that meets our compliance requirements. Excellent support team.', createdAt: '2024-12-22', helpful: 34, isVerifiedPurchase: true }
]

// Helper functions
const getStatusColor = (status: AddOnStatus) => {
  const colors = {
    installed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    available: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    disabled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    update_available: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    deprecated: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
  return colors[status]
}

const getCategoryColor = (category: AddOnCategory) => {
  const colors = {
    productivity: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    integration: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    security: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    analytics: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    communication: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    design: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    developer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    ai: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    storage: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    marketing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  }
  return colors[category]
}

const getCategoryIcon = (category: AddOnCategory) => {
  const icons = {
    productivity: Zap,
    integration: Puzzle,
    security: Shield,
    analytics: BarChart3,
    communication: MessageSquare,
    design: Palette,
    developer: Code,
    ai: Bot,
    storage: Database,
    marketing: Mail
  }
  return icons[category]
}

const getPricingColor = (pricing: PricingType) => {
  const colors = {
    free: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    freemium: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    subscription: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    one_time: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
  return colors[pricing]
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function AddOnsClient() {
  const [activeTab, setActiveTab] = useState('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedAddOn, setSelectedAddOn] = useState<AddOn | null>(null)
  const [showAddOnDialog, setShowAddOnDialog] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<AddOnCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<AddOnStatus | 'all'>('all')

  // Stats
  const stats: AddOnStats = useMemo(() => ({
    totalAddOns: mockAddOns.length,
    installedAddOns: mockAddOns.filter(a => a.status === 'installed').length,
    availableAddOns: mockAddOns.filter(a => a.status === 'available').length,
    totalDownloads: mockAddOns.reduce((sum, a) => sum + a.downloadCount, 0),
    avgRating: mockAddOns.reduce((sum, a) => sum + a.rating, 0) / mockAddOns.length,
    featuredCount: mockAddOns.filter(a => a.isFeatured).length,
    freeCount: mockAddOns.filter(a => a.pricingType === 'free').length,
    paidCount: mockAddOns.filter(a => a.pricingType !== 'free').length
  }), [])

  // Filtered data
  const filteredAddOns = useMemo(() => {
    return mockAddOns.filter(addOn => {
      const matchesSearch = addOn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addOn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addOn.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = categoryFilter === 'all' || addOn.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || addOn.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [searchQuery, categoryFilter, statusFilter])

  const installedAddOns = useMemo(() => mockAddOns.filter(a => a.status === 'installed'), [])
  const featuredAddOns = useMemo(() => mockAddOns.filter(a => a.isFeatured), [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
              <Puzzle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Add-ons Store
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chrome Extensions-level marketplace
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Submit Add-on
            </Button>
            <Button className="bg-gradient-to-r from-orange-500 to-pink-600 text-white">
              <Store className="w-4 h-4 mr-2" />
              Browse Store
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.totalAddOns}
              </div>
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <span>Add-ons</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Installed</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.installedAddOns}
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>Active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Available</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.availableAddOns}
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <span>To install</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Downloads</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.totalDownloads)}
              </div>
              <div className="flex items-center gap-1 text-xs text-purple-600">
                <TrendingUp className="w-3 h-3" />
                <span>+15% month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Avg Rating</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.avgRating.toFixed(1)}
              </div>
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <span>Out of 5</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Featured</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.featuredCount}
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <span>Premium</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Free</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.freeCount}
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <span>No cost</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-indigo-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Premium</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.paidCount}
              </div>
              <div className="flex items-center gap-1 text-xs text-indigo-600">
                <span>Paid add-ons</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search add-ons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-orange-100' : ''}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-orange-100' : ''}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1">
            <TabsTrigger value="discover" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
              <Store className="w-4 h-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="installed" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
              <Package className="w-4 h-4 mr-2" />
              Installed
            </TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
              <Crown className="w-4 h-4 mr-2" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
              <Layers className="w-4 h-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="updates" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Updates
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar Filters */}
              <div className="space-y-4">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(['all', 'ai', 'integration', 'security', 'analytics', 'communication', 'design', 'developer', 'storage', 'marketing'] as (AddOnCategory | 'all')[]).map((cat) => {
                      const Icon = cat === 'all' ? Layers : getCategoryIcon(cat as AddOnCategory)
                      return (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                            categoryFilter === cat
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="capitalize">{cat === 'all' ? 'All Categories' : cat}</span>
                        </button>
                      )
                    })}
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(['all', 'installed', 'available', 'update_available', 'disabled'] as (AddOnStatus | 'all')[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                          statusFilter === status
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="capitalize">{status === 'all' ? 'All Status' : status.replace('_', ' ')}</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Add-ons Grid */}
              <div className="lg:col-span-3">
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                  {filteredAddOns.map((addOn) => {
                    const CategoryIcon = getCategoryIcon(addOn.category)
                    return (
                      <Card
                        key={addOn.id}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                        onClick={() => {
                          setSelectedAddOn(addOn)
                          setShowAddOnDialog(true)
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 flex items-center justify-center">
                              <CategoryIcon className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{addOn.name}</h3>
                                {addOn.isVerified && (
                                  <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                )}
                                {addOn.isFeatured && (
                                  <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{addOn.author}</p>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                            {addOn.shortDescription}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className={getStatusColor(addOn.status)}>
                              {addOn.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getCategoryColor(addOn.category)}>
                              {addOn.category}
                            </Badge>
                            <Badge className={getPricingColor(addOn.pricingType)}>
                              {addOn.pricingType === 'free' ? 'Free' : formatPrice(addOn.price, addOn.currency)}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-yellow-600">
                                <Star className="w-3 h-3 fill-yellow-500" />
                                {addOn.rating.toFixed(1)}
                              </span>
                              <span className="text-gray-500">({formatNumber(addOn.reviewCount)})</span>
                            </div>
                            <span className="text-gray-500">{formatNumber(addOn.downloadCount)} downloads</span>
                          </div>

                          {addOn.hasFreeTrial && addOn.trialDays && (
                            <div className="mt-3 pt-3 border-t dark:border-gray-700">
                              <span className="text-xs text-green-600 font-medium">
                                {addOn.trialDays}-day free trial available
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Installed Tab */}
          <TabsContent value="installed" className="space-y-4">
            <div className="grid gap-4">
              {installedAddOns.map((addOn) => {
                const CategoryIcon = getCategoryIcon(addOn.category)
                return (
                  <Card key={addOn.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 flex items-center justify-center">
                          <CategoryIcon className="w-7 h-7 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{addOn.name}</h3>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                            {addOn.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{addOn.shortDescription}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>v{addOn.version}</span>
                            <span>•</span>
                            <span>{addOn.size}</span>
                            <span>•</span>
                            <span>Updated {formatDate(addOn.lastUpdated)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Configure
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                            <PowerOff className="w-4 h-4 mr-2" />
                            Disable
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Featured Tab */}
          <TabsContent value="featured" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredAddOns.map((addOn) => {
                const CategoryIcon = getCategoryIcon(addOn.category)
                return (
                  <Card key={addOn.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-orange-200 to-pink-200 dark:from-orange-900/50 dark:to-pink-900/50 relative">
                      <Badge className="absolute top-2 right-2 bg-amber-100 text-amber-700">
                        <Crown className="w-3 h-3 mr-1" /> Featured
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center -mt-8 border-2 border-white dark:border-gray-800">
                          <CategoryIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{addOn.name}</h3>
                          <p className="text-xs text-gray-500">{addOn.author}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                        {addOn.shortDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Star className="w-4 h-4 fill-yellow-500" />
                          <span className="font-medium">{addOn.rating.toFixed(1)}</span>
                        </div>
                        <Badge className={getPricingColor(addOn.pricingType)}>
                          {addOn.pricingType === 'free' ? 'Free' : formatPrice(addOn.price, addOn.currency)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {(['ai', 'integration', 'security', 'analytics', 'communication', 'design', 'developer', 'storage', 'marketing', 'productivity'] as AddOnCategory[]).map((cat) => {
                const Icon = getCategoryIcon(cat)
                const count = mockAddOns.filter(a => a.category === cat).length
                return (
                  <Card
                    key={cat}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => {
                      setCategoryFilter(cat)
                      setActiveTab('discover')
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-7 h-7 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white capitalize mb-1">{cat}</h3>
                      <p className="text-sm text-gray-500">{count} add-ons</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-4">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-orange-500" />
                  Available Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mockAddOns.filter(a => a.status === 'update_available').length > 0 ? (
                  <div className="space-y-4">
                    {mockAddOns.filter(a => a.status === 'update_available').map((addOn) => (
                      <div key={addOn.id} className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{addOn.name}</h4>
                            <p className="text-sm text-gray-500">New version available</p>
                          </div>
                        </div>
                        <Button className="bg-gradient-to-r from-orange-500 to-pink-600 text-white">
                          Update Now
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-3" />
                    <p>All add-ons are up to date!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-orange-500" />
                    Auto-Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Automatic Updates</div>
                      <div className="text-sm text-gray-500">Update add-ons automatically</div>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Update Notifications</div>
                      <div className="text-sm text-gray-500">Get notified about new updates</div>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Verified Only</div>
                      <div className="text-sm text-gray-500">Only show verified add-ons</div>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Permission Warnings</div>
                      <div className="text-sm text-gray-500">Warn about elevated permissions</div>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-yellow-500" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">New Add-ons</div>
                      <div className="text-sm text-gray-500">Notify about new releases</div>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Recommendations</div>
                      <div className="text-sm text-gray-500">Personalized suggestions</div>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-emerald-500" />
                    Developer Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Developer Mode</div>
                      <div className="text-sm text-gray-500">Enable developer features</div>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Load Unpacked</div>
                      <div className="text-sm text-gray-500">Load local add-ons</div>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add-on Detail Dialog */}
        <Dialog open={showAddOnDialog} onOpenChange={setShowAddOnDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add-on Details</DialogTitle>
            </DialogHeader>
            {selectedAddOn && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                    {(() => {
                      const Icon = getCategoryIcon(selectedAddOn.category)
                      return <Icon className="w-8 h-8 text-orange-600" />
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedAddOn.name}</h2>
                      {selectedAddOn.isVerified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                      {selectedAddOn.isFeatured && <Crown className="w-5 h-5 text-amber-500" />}
                    </div>
                    <p className="text-gray-500">{selectedAddOn.author}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Star className="w-4 h-4 fill-yellow-500" />
                        {selectedAddOn.rating.toFixed(1)} ({formatNumber(selectedAddOn.reviewCount)} reviews)
                      </span>
                      <span className="text-gray-500">{formatNumber(selectedAddOn.downloadCount)} downloads</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedAddOn.pricingType === 'free' ? 'Free' : formatPrice(selectedAddOn.price, selectedAddOn.currency)}
                    </div>
                    {selectedAddOn.pricingType === 'subscription' && (
                      <div className="text-sm text-gray-500">/month</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(selectedAddOn.status)}>{selectedAddOn.status.replace('_', ' ')}</Badge>
                  <Badge className={getCategoryColor(selectedAddOn.category)}>{selectedAddOn.category}</Badge>
                  <Badge className={getPricingColor(selectedAddOn.pricingType)}>{selectedAddOn.pricingType}</Badge>
                </div>

                <p className="text-gray-700 dark:text-gray-300">{selectedAddOn.description}</p>

                <div>
                  <h3 className="font-semibold mb-2">Features</h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {selectedAddOn.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Version</span>
                    <p className="font-medium">{selectedAddOn.version}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Size</span>
                    <p className="font-medium">{selectedAddOn.size}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Updated</span>
                    <p className="font-medium">{formatDate(selectedAddOn.lastUpdated)}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {selectedAddOn.status === 'installed' ? (
                    <>
                      <Button className="flex-1" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button className="flex-1" variant="outline" className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Uninstall
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="flex-1 bg-gradient-to-r from-orange-500 to-pink-600 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        {selectedAddOn.hasFreeTrial ? 'Start Free Trial' : 'Install'}
                      </Button>
                      <Button className="flex-1" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Learn More
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
