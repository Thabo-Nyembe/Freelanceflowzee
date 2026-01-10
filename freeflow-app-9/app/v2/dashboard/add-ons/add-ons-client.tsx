'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
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
  RefreshCw,
  Trash2,
  Plus,
  PowerOff,
  ExternalLink,
  Globe,
  Code,
  Palette,
  BarChart3,
  MessageSquare,
  CreditCard,
  Bell,
  Upload,
  Layers,
  Bot,
  Database,
  Mail,
  FileText,
  Gift,
  Crown,
  Store
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

// Enhanced Competitive Upgrade Mock Data
const mockAddOnsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Add-On Performance', description: 'Slack integration saving 4 hours/week in communication overhead.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Productivity' },
  { id: '2', type: 'info' as const, title: 'New Releases', description: '3 new add-ons available matching your workflow patterns.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Discovery' },
  { id: '3', type: 'warning' as const, title: 'Update Required', description: 'Security update available for 2 installed add-ons.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Security' },
]

const mockAddOnsCollaborators = [
  { id: '1', name: 'IT Admin', avatar: '/avatars/it.jpg', status: 'online' as const, role: 'Admin' },
  { id: '2', name: 'Developer', avatar: '/avatars/dev.jpg', status: 'online' as const, role: 'Dev' },
  { id: '3', name: 'Product Owner', avatar: '/avatars/po.jpg', status: 'away' as const, role: 'Product' },
]

const mockAddOnsPredictions = [
  { id: '1', title: 'Cost Savings', prediction: '$500/mo savings with recommended add-ons', confidence: 76, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Adoption Rate', prediction: '85% team adoption expected', confidence: 82, trend: 'up' as const, impact: 'medium' as const },
]

const mockAddOnsActivities = [
  { id: '1', user: 'System', action: 'Installed', target: 'Slack Integration', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Auto-Update', action: 'Updated', target: 'GitHub Connector v2.1', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Admin', action: 'Configured', target: 'Jira Sync settings', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

// Quick actions removed - using dialog-based handlers instead

export default function AddOnsClient() {
  const [activeTab, setActiveTab] = useState('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedAddOn, setSelectedAddOn] = useState<AddOn | null>(null)
  const [showAddOnDialog, setShowAddOnDialog] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<AddOnCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<AddOnStatus | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states for quick actions
  const [showBrowseDialog, setShowBrowseDialog] = useState(false)
  const [showUpdateAllDialog, setShowUpdateAllDialog] = useState(false)
  const [showQuickSettingsDialog, setShowQuickSettingsDialog] = useState(false)

  // Dialog states for Quick Actions grid
  const [showInstallNewDialog, setShowInstallNewDialog] = useState(false)
  const [showManageDialog, setShowManageDialog] = useState(false)
  const [showFeaturedDialog, setShowFeaturedDialog] = useState(false)
  const [showSecurityScanDialog, setShowSecurityScanDialog] = useState(false)
  const [showDevelopDialog, setShowDevelopDialog] = useState(false)

  // State for dialogs with forms
  const [installSearch, setInstallSearch] = useState('')
  const [securityScanRunning, setSecurityScanRunning] = useState(false)
  const [securityScanProgress, setSecurityScanProgress] = useState(0)

  // Additional dialog states
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [showAdvancedSearchDialog, setShowAdvancedSearchDialog] = useState(false)
  const [showRequestCategoryDialog, setShowRequestCategoryDialog] = useState(false)
  const [showImportSettingsDialog, setShowImportSettingsDialog] = useState(false)
  const [showExportSettingsDialog, setShowExportSettingsDialog] = useState(false)
  const [showResetAllDialog, setShowResetAllDialog] = useState(false)

  // Quick actions with proper dialog handlers
  const quickActionsWithDialogs = [
    { id: '1', label: 'Browse Add-Ons', icon: 'store', action: () => setShowBrowseDialog(true), variant: 'default' as const },
    { id: '2', label: 'Update All', icon: 'refresh', action: () => setShowUpdateAllDialog(true), variant: 'default' as const },
    { id: '3', label: 'Settings', icon: 'settings', action: () => setShowQuickSettingsDialog(true), variant: 'outline' as const },
  ]

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

  // Handlers
  const handleInstallAddOn = (addOnName: string) => {
    toast.success('Installing add-on', {
      description: `"${addOnName}" is being installed...`
    })
  }

  const handleUninstallAddOn = (addOnName: string) => {
    toast.info('Uninstalling add-on', {
      description: `Removing "${addOnName}"...`
    })
  }

  const handleUpdateAddOn = (addOnName: string) => {
    toast.info('Updating add-on', {
      description: `Updating "${addOnName}" to latest version...`
    })
  }

  const handleViewAddOnDetails = (addOnName: string) => {
    toast.info('Loading details', {
      description: `Opening "${addOnName}" details...`
    })
  }

  const handlePurchaseAddOn = (addOnName: string) => {
    toast.info('Purchase', {
      description: `Opening checkout for "${addOnName}"...`
    })
  }

  const handleConfigureAddOn = (addOnName: string) => {
    toast.info('Opening settings', {
      description: `Configuring "${addOnName}"...`
    })
  }

  const handleDisableAddOn = (addOnName: string) => {
    toast.warning('Add-on disabled', {
      description: `"${addOnName}" has been disabled.`
    })
  }

  const handleEnableAddOn = (addOnName: string) => {
    toast.success('Add-on enabled', {
      description: `"${addOnName}" is now active.`
    })
  }

  const handleLearnMore = (addOnName: string) => {
    toast.info('Opening documentation', {
      description: `Loading "${addOnName}" documentation...`
    })
  }

  const handleCheckUpdates = () => {
    toast.info('Checking for updates', {
      description: 'Scanning installed add-ons for updates...'
    })
    setTimeout(() => {
      toast.success('Update check complete', {
        description: 'All add-ons are up to date!'
      })
    }, 1500)
  }

  const handleOpenDocumentation = () => {
    toast.info('Opening documentation', {
      description: 'Loading developer documentation...'
    })
  }

  const handleOpenAPIReference = () => {
    toast.info('Opening API Reference', {
      description: 'Loading API documentation...'
    })
  }

  const handleImportSettings = () => {
    setShowImportSettingsDialog(true)
  }

  const handleExportSettings = () => {
    setShowExportSettingsDialog(true)
  }

  const handleResetAllSettings = () => {
    setShowResetAllDialog(true)
  }

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
            <Button variant="outline" size="sm" onClick={() => setShowSubmitDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Submit Add-on
            </Button>
            <Button className="bg-gradient-to-r from-orange-500 to-pink-600 text-white" onClick={() => setShowBrowseDialog(true)}>
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

        {/* Add-ons Overview Banner */}
        <Card className="bg-gradient-to-r from-orange-600 via-pink-600 to-rose-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Puzzle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Chrome Extension-Level Marketplace</h2>
                  <p className="text-orange-100 mt-1">Discover, install, and manage {stats.totalAddOns} powerful add-ons for your platform</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.installedAddOns}</div>
                  <div className="text-sm text-orange-100">Installed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.availableAddOns}</div>
                  <div className="text-sm text-orange-100">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.featuredCount}</div>
                  <div className="text-sm text-orange-100">Featured</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{formatNumber(stats.totalDownloads)}</div>
                  <div className="text-sm text-orange-100">Downloads</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { icon: Store, label: 'Browse All', desc: 'Explore marketplace', color: 'from-orange-500 to-pink-600', onClick: () => setShowBrowseDialog(true) },
            { icon: Download, label: 'Install New', desc: 'Get add-ons', color: 'from-blue-500 to-indigo-600', onClick: () => setShowInstallNewDialog(true) },
            { icon: Package, label: 'Manage', desc: 'Your add-ons', color: 'from-green-500 to-emerald-600', onClick: () => setShowManageDialog(true) },
            { icon: Crown, label: 'Featured', desc: 'Top picks', color: 'from-amber-500 to-orange-600', onClick: () => setShowFeaturedDialog(true) },
            { icon: RefreshCw, label: 'Updates', desc: 'Check updates', color: 'from-purple-500 to-violet-600', onClick: () => setShowUpdateAllDialog(true) },
            { icon: Shield, label: 'Security', desc: 'Scan add-ons', color: 'from-red-500 to-rose-600', onClick: () => setShowSecurityScanDialog(true) },
            { icon: Code, label: 'Develop', desc: 'Create add-ons', color: 'from-cyan-500 to-blue-600', onClick: () => setShowDevelopDialog(true) },
            { icon: Settings, label: 'Settings', desc: 'Configure', color: 'from-gray-500 to-slate-600', onClick: () => setShowQuickSettingsDialog(true) }
          ].map((action, idx) => (
            <Card key={idx} className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0" onClick={action.onClick}>
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-medium text-sm">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.desc}</div>
              </CardContent>
            </Card>
          ))}
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
            <Button variant="outline" size="sm" onClick={() => setShowFiltersDialog(true)}>
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
            {/* Discover Banner */}
            <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Discover Amazing Add-ons</h3>
                      <p className="text-blue-100 text-sm">Browse {filteredAddOns.length} add-ons across {10} categories</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{filteredAddOns.filter(a => a.pricingType === 'free').length}</div>
                      <div className="text-xs text-blue-100">Free Add-ons</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{filteredAddOns.filter(a => a.isFeatured).length}</div>
                      <div className="text-xs text-blue-100">Featured</div>
                    </div>
                    <Button className="bg-white text-blue-600 hover:bg-blue-50 gap-2" onClick={() => setShowAdvancedSearchDialog(true)}>
                      <Search className="w-4 h-4" />
                      Advanced Search
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

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

            {/* Marketplace Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Trending This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'AI Assistant Pro', category: 'ai', downloads: 12500, trend: '+45%' },
                      { name: 'Slack Integration', category: 'integration', downloads: 8900, trend: '+32%' },
                      { name: 'Security Shield', category: 'security', downloads: 7600, trend: '+28%' },
                      { name: 'Analytics Dashboard', category: 'analytics', downloads: 6200, trend: '+22%' },
                      { name: 'Email Composer', category: 'communication', downloads: 5100, trend: '+18%' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatNumber(item.downloads)}</p>
                          <p className="text-xs text-green-500">{item.trend}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Top Rated Add-ons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Cloud Backup Plus', category: 'storage', rating: 4.9, reviews: 2340 },
                      { name: 'Design System Kit', category: 'design', rating: 4.8, reviews: 1890 },
                      { name: 'API Gateway', category: 'developer', rating: 4.8, reviews: 1560 },
                      { name: 'Marketing Automation', category: 'marketing', rating: 4.7, reviews: 1230 },
                      { name: 'Workflow Builder', category: 'productivity', rating: 4.7, reviews: 980 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-yellow-500" />
                            <span className="font-bold">{item.rating}</span>
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{formatNumber(item.reviews)} reviews</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Recent Marketplace Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'New Release', addon: 'AI Image Generator v2.0', time: '2 hours ago', icon: Zap },
                    { action: 'Major Update', addon: 'Security Scanner Pro', time: '5 hours ago', icon: Shield },
                    { action: 'Featured', addon: 'Team Collaboration Suite', time: '8 hours ago', icon: Crown },
                    { action: 'Price Drop', addon: 'Premium Analytics', time: '1 day ago', icon: TrendingDown },
                    { action: 'New Release', addon: 'Email Marketing Hub', time: '2 days ago', icon: Mail }
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <activity.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{activity.action}</Badge>
                          <span className="font-medium">{activity.addon}</span>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Installed Tab */}
          <TabsContent value="installed" className="space-y-4">
            {/* Installed Banner */}
            <Card className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Installed Add-ons</h3>
                      <p className="text-green-100 text-sm">Manage your {installedAddOns.length} installed add-ons</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{installedAddOns.filter(a => a.status === 'installed').length}</div>
                      <div className="text-xs text-green-100">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{installedAddOns.filter(a => a.status === 'disabled').length}</div>
                      <div className="text-xs text-green-100">Disabled</div>
                    </div>
                    <Button className="bg-white text-green-600 hover:bg-green-50 gap-2" onClick={handleCheckUpdates}>
                      <RefreshCw className="w-4 h-4" />
                      Check Updates
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                          <Button variant="outline" size="sm" onClick={() => handleConfigureAddOn(addOn.name)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Configure
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDisableAddOn(addOn.name)}>
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

            {/* Storage Usage */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-500" />
                  Storage Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Storage Used</span>
                    <span className="font-bold">245 MB / 1 GB</span>
                  </div>
                  <Progress value={24.5} className="h-2" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    {installedAddOns.slice(0, 4).map((addOn, idx) => (
                      <div key={idx} className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm font-medium truncate">{addOn.name}</p>
                        <p className="text-xs text-muted-foreground">{addOn.size}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Featured Tab */}
          <TabsContent value="featured" className="space-y-4">
            {/* Featured Banner */}
            <Card className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Featured Add-ons</h3>
                      <p className="text-amber-100 text-sm">Hand-picked premium add-ons by our team</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{featuredAddOns.length}</div>
                      <div className="text-xs text-amber-100">Featured</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{featuredAddOns.filter(a => a.isVerified).length}</div>
                      <div className="text-xs text-amber-100">Verified</div>
                    </div>
                    <Button className="bg-white text-amber-600 hover:bg-amber-50 gap-2" onClick={() => setShowSubmitDialog(true)}>
                      <Star className="w-4 h-4" />
                      Submit Add-on
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

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
            {/* Categories Banner */}
            <Card className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Browse by Category</h3>
                      <p className="text-cyan-100 text-sm">Explore {10} categories with {stats.totalAddOns} total add-ons</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockAddOns.filter(a => a.category === 'ai').length}</div>
                      <div className="text-xs text-cyan-100">AI & ML</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockAddOns.filter(a => a.category === 'integration').length}</div>
                      <div className="text-xs text-cyan-100">Integrations</div>
                    </div>
                    <Button className="bg-white text-cyan-600 hover:bg-cyan-50 gap-2" onClick={() => setShowRequestCategoryDialog(true)}>
                      <Plus className="w-4 h-4" />
                      Request Category
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

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
            {/* Updates Banner */}
            <Card className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Add-on Updates</h3>
                      <p className="text-purple-100 text-sm">Keep your add-ons up to date for best performance</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockAddOns.filter(a => a.status === 'update_available').length}</div>
                      <div className="text-xs text-purple-100">Updates Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{installedAddOns.length}</div>
                      <div className="text-xs text-purple-100">Up to Date</div>
                    </div>
                    <Button className="bg-white text-purple-600 hover:bg-purple-50 gap-2" onClick={() => setShowUpdateAllDialog(true)}>
                      <RefreshCw className="w-4 h-4" />
                      Update All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                        <Button className="bg-gradient-to-r from-orange-500 to-pink-600 text-white" onClick={() => handleUpdateAddOn(addOn.name)}>
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

            {/* Update History */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Update History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { addon: 'AI Assistant Pro', from: '2.4.0', to: '2.5.0', date: 'Dec 26, 2024', status: 'success' },
                    { addon: 'Security Scanner', from: '1.8.2', to: '1.9.0', date: 'Dec 25, 2024', status: 'success' },
                    { addon: 'Slack Integration', from: '3.1.0', to: '3.2.0', date: 'Dec 24, 2024', status: 'success' },
                    { addon: 'Analytics Dashboard', from: '4.0.0', to: '4.1.0', date: 'Dec 23, 2024', status: 'success' },
                    { addon: 'Email Composer', from: '2.2.0', to: '2.3.0', date: 'Dec 22, 2024', status: 'success' }
                  ].map((update, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{update.addon}</p>
                          <p className="text-xs text-muted-foreground">v{update.from} → v{update.to}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-700">Updated</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{update.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <Card className="col-span-3 h-fit bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General' },
                      { id: 'updates', icon: RefreshCw, label: 'Updates' },
                      { id: 'security', icon: Shield, label: 'Security' },
                      { id: 'developer', icon: Code, label: 'Developer' },
                      { id: 'notifications', icon: Bell, label: 'Notifications' },
                      { id: 'advanced', icon: Zap, label: 'Advanced' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          settingsTab === item.id
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>General Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Marketplace Region</label>
                          <select className="w-full p-2 border rounded-lg dark:bg-gray-700">
                            <option>United States</option>
                            <option>Europe</option>
                            <option>Asia Pacific</option>
                            <option>Global</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Default Currency</label>
                          <select className="w-full p-2 border rounded-lg dark:bg-gray-700">
                            <option>USD ($)</option>
                            <option>EUR (€)</option>
                            <option>GBP (£)</option>
                            <option>JPY (¥)</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Show Installed Add-ons First</div>
                            <div className="text-sm text-muted-foreground">Prioritize installed add-ons in search results</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Enable Marketplace Recommendations</div>
                            <div className="text-sm text-muted-foreground">Get personalized add-on suggestions</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Auto-Install Compatible Add-ons</div>
                            <div className="text-sm text-muted-foreground">Automatically install recommended add-ons</div>
                          </div>
                          <input type="checkbox" className="toggle" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'updates' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Update Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Automatic Updates</div>
                            <div className="text-sm text-muted-foreground">Update add-ons automatically when available</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Update Notifications</div>
                            <div className="text-sm text-muted-foreground">Get notified about available updates</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Beta Updates</div>
                            <div className="text-sm text-muted-foreground">Receive beta versions for testing</div>
                          </div>
                          <input type="checkbox" className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Update Schedule</div>
                            <div className="text-sm text-muted-foreground">When to check for updates</div>
                          </div>
                          <select className="p-2 border rounded-lg dark:bg-gray-700">
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                          </select>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                          <RefreshCw className="w-5 h-5" />
                          <span className="font-medium">Last checked: 2 hours ago</span>
                        </div>
                        <Button className="mt-3" variant="outline" onClick={handleCheckUpdates}>Check for Updates Now</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'security' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Verified Add-ons Only</div>
                            <div className="text-sm text-muted-foreground">Only show and install verified add-ons</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Permission Warnings</div>
                            <div className="text-sm text-muted-foreground">Warn about elevated permission requests</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Sandbox Mode</div>
                            <div className="text-sm text-muted-foreground">Run add-ons in isolated environment</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Security Scan on Install</div>
                            <div className="text-sm text-muted-foreground">Automatically scan add-ons before installation</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <Shield className="w-5 h-5" />
                          <span className="font-medium">All installed add-ons are verified and secure</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'developer' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Developer Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Developer Mode</div>
                            <div className="text-sm text-muted-foreground">Enable developer features and debugging</div>
                          </div>
                          <input type="checkbox" className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Load Unpacked Extensions</div>
                            <div className="text-sm text-muted-foreground">Allow loading local add-ons for testing</div>
                          </div>
                          <input type="checkbox" className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Debug Console</div>
                            <div className="text-sm text-muted-foreground">Show developer console for add-ons</div>
                          </div>
                          <input type="checkbox" className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">API Access</div>
                            <div className="text-sm text-muted-foreground">Enable API endpoints for development</div>
                          </div>
                          <input type="checkbox" className="toggle" />
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="font-medium text-purple-700 dark:text-purple-400 mb-2">Developer Resources</div>
                        <div className="flex gap-3">
                          <Button variant="outline" size="sm" onClick={handleOpenDocumentation}>
                            <FileText className="w-4 h-4 mr-2" />
                            Documentation
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleOpenAPIReference}>
                            <Code className="w-4 h-4 mr-2" />
                            API Reference
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'notifications' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">New Add-ons</div>
                            <div className="text-sm text-muted-foreground">Notify about new add-on releases</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Recommendations</div>
                            <div className="text-sm text-muted-foreground">Personalized add-on suggestions</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Update Available</div>
                            <div className="text-sm text-muted-foreground">Notify when updates are available</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Security Alerts</div>
                            <div className="text-sm text-muted-foreground">Critical security notifications</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Weekly Digest</div>
                            <div className="text-sm text-muted-foreground">Weekly summary of marketplace activity</div>
                          </div>
                          <input type="checkbox" className="toggle" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'advanced' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Advanced Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Lazy Loading</div>
                            <div className="text-sm text-muted-foreground">Load add-ons on demand to improve performance</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Cache Add-on Data</div>
                            <div className="text-sm text-muted-foreground">Cache marketplace data for faster loading</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Parallel Downloads</div>
                            <div className="text-sm text-muted-foreground">Download multiple add-ons simultaneously</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Backup Settings</div>
                            <div className="text-sm text-muted-foreground">Auto-backup add-on configurations</div>
                          </div>
                          <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={handleImportSettings}>
                          <Upload className="w-4 h-4 mr-2" />
                          Import Settings
                        </Button>
                        <Button variant="outline" onClick={handleExportSettings}>
                          <Download className="w-4 h-4 mr-2" />
                          Export Settings
                        </Button>
                        <Button variant="destructive" onClick={handleResetAllSettings}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Reset All
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockAddOnsAIInsights}
              title="Add-On Intelligence"
              onInsightAction={(_insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockAddOnsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockAddOnsPredictions}
              title="Add-On Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockAddOnsActivities}
            title="Add-On Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={quickActionsWithDialogs}
            variant="grid"
          />
        </div>

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
                      <Button className="flex-1" variant="outline" onClick={() => handleConfigureAddOn(selectedAddOn.name)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button className="flex-1 text-red-600" variant="outline" onClick={() => {
                        handleUninstallAddOn(selectedAddOn.name)
                        setShowAddOnDialog(false)
                      }}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Uninstall
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="flex-1 bg-gradient-to-r from-orange-500 to-pink-600 text-white" onClick={() => {
                        handleInstallAddOn(selectedAddOn.name)
                        setShowAddOnDialog(false)
                      }}>
                        <Download className="w-4 h-4 mr-2" />
                        {selectedAddOn.hasFreeTrial ? 'Start Free Trial' : 'Install'}
                      </Button>
                      <Button className="flex-1" variant="outline" onClick={() => handleLearnMore(selectedAddOn.name)}>
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

        {/* Browse Add-Ons Dialog */}
        <Dialog open={showBrowseDialog} onOpenChange={setShowBrowseDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-orange-500" />
                Browse Add-Ons Marketplace
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Explore our marketplace with {stats.totalAddOns} add-ons across multiple categories.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <div className="text-2xl font-bold text-orange-600">{stats.freeCount}</div>
                  <div className="text-sm text-gray-500">Free Add-Ons</div>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <div className="text-2xl font-bold text-purple-600">{stats.paidCount}</div>
                  <div className="text-sm text-gray-500">Premium Add-Ons</div>
                </div>
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <div className="text-2xl font-bold text-amber-600">{stats.featuredCount}</div>
                  <div className="text-sm text-gray-500">Featured</div>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="text-2xl font-bold text-green-600">{stats.installedAddOns}</div>
                  <div className="text-sm text-gray-500">Installed</div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowBrowseDialog(false)}>
                  Close
                </Button>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-pink-600 text-white"
                  onClick={() => {
                    setShowBrowseDialog(false)
                    setActiveTab('discover')
                  }}
                >
                  <Store className="w-4 h-4 mr-2" />
                  Go to Marketplace
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Update All Dialog */}
        <Dialog open={showUpdateAllDialog} onOpenChange={setShowUpdateAllDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-500" />
                Update All Add-Ons
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Check and update all your installed add-ons to the latest versions.
              </p>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Installed Add-Ons</span>
                  <span className="font-bold text-blue-600">{stats.installedAddOns}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Updates Available</span>
                  <span className="font-bold text-yellow-600">{mockAddOns.filter(a => a.status === 'update_available').length}</span>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowUpdateAllDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-500 to-violet-600 text-white"
                  onClick={() => {
                    setShowUpdateAllDialog(false)
                    toast.success('Update check complete', {
                      description: 'All add-ons are up to date!'
                    })
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check for Updates
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Settings Dialog */}
        <Dialog open={showQuickSettingsDialog} onOpenChange={setShowQuickSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" />
                Add-Ons Quick Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Quick access to common add-on settings.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">Auto-Updates</div>
                    <div className="text-xs text-gray-500">Update add-ons automatically</div>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">Notifications</div>
                    <div className="text-xs text-gray-500">Get notified about new add-ons</div>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">Security Scans</div>
                    <div className="text-xs text-gray-500">Scan add-ons before install</div>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowQuickSettingsDialog(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowQuickSettingsDialog(false)
                    setActiveTab('settings')
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  All Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Install New Add-On Dialog */}
        <Dialog open={showInstallNewDialog} onOpenChange={setShowInstallNewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-500" />
                Install New Add-On
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Search and install add-ons from our marketplace.
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search for add-ons..."
                  value={installSearch}
                  onChange={(e) => setInstallSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {mockAddOns
                  .filter(a => a.status === 'available')
                  .filter(a => installSearch === '' || a.name.toLowerCase().includes(installSearch.toLowerCase()))
                  .map((addOn) => {
                    const CategoryIcon = getCategoryIcon(addOn.category)
                    return (
                      <div key={addOn.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                            <CategoryIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{addOn.name}</h4>
                            <p className="text-xs text-gray-500">{addOn.shortDescription}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            handleInstallAddOn(addOn.name)
                            setShowInstallNewDialog(false)
                          }}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Install
                        </Button>
                      </div>
                    )
                  })}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowInstallNewDialog(false)}>
                  Close
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                  onClick={() => {
                    setShowInstallNewDialog(false)
                    setActiveTab('discover')
                  }}
                >
                  <Store className="w-4 h-4 mr-2" />
                  Browse All
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Manage Add-Ons Dialog */}
        <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-green-500" />
                Manage Your Add-Ons
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                View and manage your {installedAddOns.length} installed add-ons.
              </p>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {installedAddOns.map((addOn) => {
                  const CategoryIcon = getCategoryIcon(addOn.category)
                  return (
                    <div key={addOn.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                          <CategoryIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{addOn.name}</h4>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <p className="text-xs text-gray-500">v{addOn.version} - {addOn.size}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedAddOn(addOn)
                          setShowManageDialog(false)
                          setShowAddOnDialog(true)
                        }}>
                          <Settings className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600" onClick={() => {
                          handleUninstallAddOn(addOn.name)
                        }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowManageDialog(false)}>
                  Close
                </Button>
                <Button
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  onClick={() => {
                    setShowManageDialog(false)
                    setActiveTab('installed')
                  }}
                >
                  <Package className="w-4 h-4 mr-2" />
                  View All Installed
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Featured Add-Ons Dialog */}
        <Dialog open={showFeaturedDialog} onOpenChange={setShowFeaturedDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Featured Add-Ons
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Hand-picked premium add-ons recommended by our team.
              </p>
              <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                {featuredAddOns.map((addOn) => {
                  const CategoryIcon = getCategoryIcon(addOn.category)
                  return (
                    <div
                      key={addOn.id}
                      className="p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedAddOn(addOn)
                        setShowFeaturedDialog(false)
                        setShowAddOnDialog(true)
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                          <CategoryIcon className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{addOn.name}</h4>
                          <div className="flex items-center gap-1 text-xs text-yellow-600">
                            <Star className="w-3 h-3 fill-yellow-500" />
                            {addOn.rating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{addOn.shortDescription}</p>
                      <div className="mt-2">
                        <Badge className={getPricingColor(addOn.pricingType)} variant="outline">
                          {addOn.pricingType === 'free' ? 'Free' : formatPrice(addOn.price, addOn.currency)}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowFeaturedDialog(false)}>
                  Close
                </Button>
                <Button
                  className="bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                  onClick={() => {
                    setShowFeaturedDialog(false)
                    setActiveTab('featured')
                  }}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  View All Featured
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Security Scan Dialog */}
        <Dialog open={showSecurityScanDialog} onOpenChange={setShowSecurityScanDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Security Scan
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Scan all installed add-ons for security vulnerabilities.
              </p>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Add-ons to scan</span>
                  <span className="font-bold text-red-600">{installedAddOns.length}</span>
                </div>
                {securityScanRunning && (
                  <div className="space-y-2">
                    <Progress value={securityScanProgress} className="h-2" />
                    <p className="text-xs text-gray-500 text-center">Scanning... {securityScanProgress}%</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {installedAddOns.map((addOn) => (
                  <div key={addOn.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <span className="text-sm">{addOn.name}</span>
                    {securityScanProgress === 100 ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Secure
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => {
                  setShowSecurityScanDialog(false)
                  setSecurityScanRunning(false)
                  setSecurityScanProgress(0)
                }}>
                  Close
                </Button>
                <Button
                  className="bg-gradient-to-r from-red-500 to-rose-600 text-white"
                  disabled={securityScanRunning}
                  onClick={() => {
                    setSecurityScanRunning(true)
                    setSecurityScanProgress(0)
                    const interval = setInterval(() => {
                      setSecurityScanProgress(prev => {
                        if (prev >= 100) {
                          clearInterval(interval)
                          setSecurityScanRunning(false)
                          toast.success('Security scan complete', {
                            description: 'All add-ons passed security checks!'
                          })
                          return 100
                        }
                        return prev + 10
                      })
                    }, 300)
                  }}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {securityScanRunning ? 'Scanning...' : 'Start Scan'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Develop Add-On Dialog */}
        <Dialog open={showDevelopDialog} onOpenChange={setShowDevelopDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-500" />
                Develop Add-Ons
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Create and publish your own add-ons to the marketplace.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-center">
                  <FileText className="w-8 h-8 mx-auto text-cyan-600 mb-2" />
                  <h4 className="font-medium text-sm">Documentation</h4>
                  <p className="text-xs text-gray-500 mt-1">Learn how to build add-ons</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                  <Code className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <h4 className="font-medium text-sm">API Reference</h4>
                  <p className="text-xs text-gray-500 mt-1">Explore available APIs</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center">
                  <Package className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                  <h4 className="font-medium text-sm">Starter Kit</h4>
                  <p className="text-xs text-gray-500 mt-1">Download template project</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                  <Upload className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <h4 className="font-medium text-sm">Submit Add-On</h4>
                  <p className="text-xs text-gray-500 mt-1">Publish to marketplace</p>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800">
                <h4 className="font-medium mb-2">Quick Start</h4>
                <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                  <p>$ npx create-addon my-addon</p>
                  <p>$ cd my-addon</p>
                  <p>$ npm run dev</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowDevelopDialog(false)}>
                  Close
                </Button>
                <Button
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  onClick={() => {
                    setShowDevelopDialog(false)
                    setActiveTab('settings')
                    setSettingsTab('developer')
                  }}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Developer Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Submit Add-On Dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-orange-500" />
                Submit Your Add-On
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Share your add-on with the community and reach thousands of users.
              </p>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <h4 className="font-medium mb-2">Submission Requirements</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Complete documentation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Pass security review
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Include screenshots and description
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Support email or website
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg border">
                  <label className="text-sm font-medium">Add-On Package (.zip)</label>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-pink-600 text-white"
                  onClick={() => {
                    setShowSubmitDialog(false)
                    toast.success('Submission started', {
                      description: 'Your add-on is being reviewed. This may take 2-3 business days.'
                    })
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Submit for Review
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filters Dialog */}
        <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-500" />
                Filter Add-Ons
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as AddOnCategory | 'all')}
                  >
                    <option value="all">All Categories</option>
                    <option value="ai">AI & ML</option>
                    <option value="integration">Integration</option>
                    <option value="security">Security</option>
                    <option value="analytics">Analytics</option>
                    <option value="communication">Communication</option>
                    <option value="design">Design</option>
                    <option value="developer">Developer</option>
                    <option value="storage">Storage</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as AddOnStatus | 'all')}
                  >
                    <option value="all">All Status</option>
                    <option value="installed">Installed</option>
                    <option value="available">Available</option>
                    <option value="update_available">Update Available</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">Verified Only</div>
                    <div className="text-xs text-gray-500">Show only verified add-ons</div>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">Free Add-Ons</div>
                    <div className="text-xs text-gray-500">Show only free add-ons</div>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => {
                  setCategoryFilter('all')
                  setStatusFilter('all')
                }}>
                  Clear Filters
                </Button>
                <Button onClick={() => {
                  setShowFiltersDialog(false)
                  toast.success('Filters applied', {
                    description: `Showing ${filteredAddOns.length} add-ons`
                  })
                }}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Advanced Search Dialog */}
        <Dialog open={showAdvancedSearchDialog} onOpenChange={setShowAdvancedSearchDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-500" />
                Advanced Search
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Search Query</label>
                  <Input
                    placeholder="Search for add-ons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select
                      className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value as AddOnCategory | 'all')}
                    >
                      <option value="all">All Categories</option>
                      <option value="ai">AI & ML</option>
                      <option value="integration">Integration</option>
                      <option value="security">Security</option>
                      <option value="analytics">Analytics</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Sort By</label>
                    <select className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700">
                      <option value="relevance">Relevance</option>
                      <option value="rating">Rating</option>
                      <option value="downloads">Downloads</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">Has Free Trial</div>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowAdvancedSearchDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setShowAdvancedSearchDialog(false)
                  toast.success('Search applied', {
                    description: `Found ${filteredAddOns.length} add-ons`
                  })
                }}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Request Category Dialog */}
        <Dialog open={showRequestCategoryDialog} onOpenChange={setShowRequestCategoryDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-500" />
                Request New Category
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Suggest a new category for the add-ons marketplace.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Category Name</label>
                  <Input placeholder="e.g., E-commerce, Healthcare" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 min-h-[80px]"
                    placeholder="Describe what types of add-ons would belong in this category..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Example Add-Ons</label>
                  <Input placeholder="e.g., Shopify sync, Payment processor" className="mt-1" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowRequestCategoryDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  onClick={() => {
                    setShowRequestCategoryDialog(false)
                    toast.success('Request submitted', {
                      description: 'Your category request has been submitted for review.'
                    })
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Settings Dialog */}
        <Dialog open={showImportSettingsDialog} onOpenChange={setShowImportSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />
                Import Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Import add-on settings from a backup file.
              </p>
              <div className="p-4 rounded-lg border">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Drag and drop settings file (.json)</p>
                  <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Warning: Importing settings will overwrite your current configuration.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowImportSettingsDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setShowImportSettingsDialog(false)
                  toast.success('Settings imported', {
                    description: 'Your add-on settings have been imported successfully.'
                  })
                }}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Settings Dialog */}
        <Dialog open={showExportSettingsDialog} onOpenChange={setShowExportSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-500" />
                Export Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Export your add-on settings for backup or transfer.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">Include Add-On List</div>
                    <div className="text-xs text-gray-500">Export list of installed add-ons</div>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">Include Configurations</div>
                    <div className="text-xs text-gray-500">Export add-on configurations</div>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium text-sm">Include Preferences</div>
                    <div className="text-xs text-gray-500">Export marketplace preferences</div>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowExportSettingsDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setShowExportSettingsDialog(false)
                  toast.success('Settings exported', {
                    description: 'Your settings file is ready for download.'
                  })
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset All Settings Dialog */}
        <Dialog open={showResetAllDialog} onOpenChange={setShowResetAllDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Reset All Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to reset all add-on settings to their defaults? This action cannot be undone.
              </p>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-2">This will:</p>
                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                  <li>- Reset all marketplace preferences</li>
                  <li>- Clear cached data</li>
                  <li>- Reset notification settings</li>
                  <li>- Clear update schedules</li>
                </ul>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowResetAllDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => {
                  setShowResetAllDialog(false)
                  toast.success('Settings reset', {
                    description: 'All add-on settings have been reset to defaults.'
                  })
                }}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset All
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
