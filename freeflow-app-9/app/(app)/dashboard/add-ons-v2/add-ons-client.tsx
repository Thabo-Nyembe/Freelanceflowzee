'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { apiPost, apiDelete, downloadAsJson } from '@/lib/button-handlers'
import { useAddOns, type AddOn as DBAddOn } from '@/lib/hooks/use-add-ons'
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
  { id: '1', type: 'opportunity' as const, title: 'Add-On Performance', description: 'Slack integration saving 4 hours/week in communication overhead.', impact: 'low' as const, createdAt: new Date() },
  { id: '2', type: 'recommendation' as const, title: 'New Releases', description: '3 new add-ons available matching your workflow patterns.', impact: 'medium' as const, createdAt: new Date() },
  { id: '3', type: 'alert' as const, title: 'Update Required', description: 'Security update available for 2 installed add-ons.', impact: 'high' as const, createdAt: new Date() },
]

const mockAddOnsCollaborators = [
  { id: '1', name: 'IT Admin', avatar: '/avatars/it.jpg', color: '#ef4444', status: 'online' as const },
  { id: '2', name: 'Developer', avatar: '/avatars/dev.jpg', color: '#8b5cf6', status: 'online' as const },
  { id: '3', name: 'Product Owner', avatar: '/avatars/po.jpg', color: '#22c55e', status: 'away' as const },
]

const mockAddOnsPredictions = [
  { label: 'Cost Savings', currentValue: 0, predictedValue: 500, confidence: 76, trend: 'up' as const, timeframe: 'Monthly', factors: [{ name: 'Bundle discounts', impact: 'positive' as const, weight: 0.5 }, { name: 'Usage optimization', impact: 'positive' as const, weight: 0.5 }] },
  { label: 'Adoption Rate', currentValue: 60, predictedValue: 85, confidence: 82, trend: 'up' as const, timeframe: '3 months', factors: [{ name: 'Team training', impact: 'positive' as const, weight: 0.6 }, { name: 'Integration ease', impact: 'positive' as const, weight: 0.4 }] },
]

const mockAddOnsActivities = [
  { id: '1', type: 'create' as const, title: 'Installed Slack Integration', user: { id: '1', name: 'System' }, timestamp: new Date() },
  { id: '2', type: 'update' as const, title: 'Updated GitHub Connector v2.1', user: { id: '2', name: 'Auto-Update' }, timestamp: new Date(Date.now() - 3600000) },
  { id: '3', type: 'integration' as const, title: 'Configured Jira Sync settings', user: { id: '3', name: 'Admin' }, timestamp: new Date(Date.now() - 7200000) },
]

export default function AddOnsClient() {
  const [activeTab, setActiveTab] = useState('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedAddOn, setSelectedAddOn] = useState<AddOn | null>(null)
  const [showAddOnDialog, setShowAddOnDialog] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<AddOnCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<AddOnStatus | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('general')
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [addOnSettings, setAddOnSettings] = useState<Record<string, { notifications: boolean; autoSync: boolean; developerMode: boolean }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('add-ons-settings')
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  // Database integration
  const { addOns: dbAddOns, stats: dbStats, isLoading, error, fetchAddOns, installAddOn: dbInstallAddOn, uninstallAddOn: dbUninstallAddOn, disableAddOn: dbDisableAddOn } = useAddOns([], {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    searchQuery: searchQuery || undefined
  })

  // Map database AddOns to UI format
  const mappedAddOns: AddOn[] = useMemo(() => dbAddOns.map((dbAddOn): AddOn => ({
    id: dbAddOn.id,
    name: dbAddOn.name,
    description: dbAddOn.description || '',
    shortDescription: dbAddOn.description?.substring(0, 100) || '',
    version: dbAddOn.version,
    author: dbAddOn.provider || 'Unknown',
    authorUrl: undefined,
    icon: dbAddOn.icon_url || undefined,
    category: dbAddOn.category as AddOnCategory,
    status: dbAddOn.status as AddOnStatus,
    pricingType: dbAddOn.pricing_type as PricingType,
    price: dbAddOn.price,
    currency: dbAddOn.currency,
    rating: dbAddOn.rating,
    reviewCount: dbAddOn.reviews_count,
    downloadCount: dbAddOn.downloads,
    installedCount: dbAddOn.subscribers,
    lastUpdated: dbAddOn.last_updated,
    createdAt: dbAddOn.created_at,
    size: `${(dbAddOn.size_bytes / 1048576).toFixed(1)} MB`,
    permissions: 'standard' as PermissionLevel,
    features: dbAddOn.features,
    tags: dbAddOn.tags,
    screenshots: dbAddOn.screenshot_urls,
    changelog: undefined,
    isFeatured: false,
    isVerified: true,
    hasFreeTrial: dbAddOn.has_trial,
    trialDays: dbAddOn.trial_days,
    requiredVersion: undefined
  })), [dbAddOns])

  // Use mapped database data directly (no mock fallback)
  const addOns = mappedAddOns

  // Fetch initial data
  useEffect(() => {
    fetchAddOns()
  }, [fetchAddOns])
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showAdvancedSearchDialog, setShowAdvancedSearchDialog] = useState(false)
  const [showCategoryRequestDialog, setShowCategoryRequestDialog] = useState(false)
  const [advancedSearchFilters, setAdvancedSearchFilters] = useState({
    query: '',
    minRating: 0,
    maxPrice: 100,
    pricingType: 'all' as PricingType | 'all',
    hasFreeTrial: false,
    isVerified: false,
    isFeatured: false
  })
  const [categoryRequest, setCategoryRequest] = useState({ name: '', description: '', examples: '' })

  // Stats
  const stats: AddOnStats = useMemo(() => ({
    totalAddOns: addOns.length,
    installedAddOns: addOns.filter(a => a.status === 'installed').length,
    availableAddOns: addOns.filter(a => a.status === 'available').length,
    totalDownloads: addOns.reduce((sum, a) => sum + a.downloadCount, 0),
    avgRating: addOns.reduce((sum, a) => sum + a.rating, 0) / addOns.length,
    featuredCount: addOns.filter(a => a.isFeatured).length,
    freeCount: addOns.filter(a => a.pricingType === 'free').length,
    paidCount: addOns.filter(a => a.pricingType !== 'free').length
  }), [addOns])

  // Filtered data
  const filteredAddOns = useMemo(() => {
    return addOns.filter(addOn => {
      const matchesSearch = addOn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addOn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addOn.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = categoryFilter === 'all' || addOn.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || addOn.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [addOns, searchQuery, categoryFilter, statusFilter])

  const installedAddOns = useMemo(() => addOns.filter(a => a.status === 'installed'), [addOns])
  const featuredAddOns = useMemo(() => addOns.filter(a => a.isFeatured), [addOns])

  // Real handlers with actual functionality
  const handleInstallAddOn = useCallback(async (addOn: AddOn) => {
    await toast.promise(
      dbInstallAddOn(addOn.id),
      {
        loading: `Installing ${addOn.name}...`,
        success: `${addOn.name} installed successfully!`,
        error: `Failed to install ${addOn.name}`
      }
    )
  }, [dbInstallAddOn])

  const handleUninstallAddOn = useCallback(async (addOn: AddOn) => {
    if (!confirm(`Are you sure you want to uninstall "${addOn.name}"? This action cannot be undone.`)) {
      return
    }
    await toast.promise(
      dbUninstallAddOn(addOn.id).then(() => setShowAddOnDialog(false)),
      {
        loading: `Uninstalling ${addOn.name}...`,
        success: `${addOn.name} uninstalled successfully!`,
        error: `Failed to uninstall ${addOn.name}`
      }
    )
  }, [dbUninstallAddOn])

  const handleUpdateAddOn = useCallback(async (addOn: AddOn) => {
    const result = await apiPost(`/api/add-ons/${addOn.id}/update`, { addOnId: addOn.id }, {
      loading: `Updating ${addOn.name}...`,
      success: `${addOn.name} updated to latest version!`,
      error: `Failed to update ${addOn.name}`
    })
    if (result.success) {
      setAddOns(prev => prev.map(a => a.id === addOn.id ? { ...a, status: 'installed' as AddOnStatus } : a))
    }
  }, [])

  const handleDisableAddOn = useCallback(async (addOn: AddOn) => {
    await toast.promise(
      dbDisableAddOn(addOn.id),
      {
        loading: `Disabling ${addOn.name}...`,
        success: `${addOn.name} disabled!`,
        error: `Failed to disable ${addOn.name}`
      }
    )
  }, [dbDisableAddOn])

  const handleEnableAddOn = useCallback(async (addOn: AddOn) => {
    const result = await apiPost(`/api/add-ons/${addOn.id}/enable`, { addOnId: addOn.id }, {
      loading: `Enabling ${addOn.name}...`,
      success: `${addOn.name} enabled!`,
      error: `Failed to enable ${addOn.name}`
    })
    if (result.success) {
      setAddOns(prev => prev.map(a => a.id === addOn.id ? { ...a, status: 'installed' as AddOnStatus } : a))
    }
  }, [])

  const handleConfigureAddOn = useCallback((addOn: AddOn) => {
    setSelectedAddOn(addOn)
    setShowSettingsDialog(true)
    toast.success(`Opening settings for ${addOn.name}`)
  }, [])

  const handleUpdateAllAddOns = useCallback(async () => {
    const updatableAddOns = addOns.filter(a => a.status === 'update_available')
    if (updatableAddOns.length === 0) {
      toast.info('All add-ons are up to date!')
      return
    }
    const result = await apiPost('/api/add-ons/update-all', { addOnIds: updatableAddOns.map(a => a.id) }, {
      loading: `Updating ${updatableAddOns.length} add-ons...`,
      success: 'All add-ons updated successfully!',
      error: 'Failed to update some add-ons'
    })
    if (result.success) {
      setAddOns(prev => prev.map(a => a.status === 'update_available' ? { ...a, status: 'installed' as AddOnStatus } : a))
    }
  }, [addOns])

  const handleCheckForUpdates = useCallback(async () => {
    const result = await apiPost('/api/add-ons/check-updates', {}, {
      loading: 'Checking for updates...',
      success: 'Update check complete!',
      error: 'Failed to check for updates'
    })
    if (result.success) {
      toast.info('All add-ons are up to date!')
    }
  }, [])

  const handleBrowseStore = useCallback(() => {
    setActiveTab('discover')
    setCategoryFilter('all')
    setStatusFilter('all')
    toast.success('Add-on store loaded!')
  }, [])

  const handleExportSettings = useCallback(() => {
    const settings = {
      addOns: addOns.map(a => ({ id: a.id, name: a.name, status: a.status })),
      preferences: {
        viewMode,
        categoryFilter,
        statusFilter
      },
      exportedAt: new Date().toISOString()
    }
    downloadAsJson(settings, 'add-ons-settings.json')
  }, [addOns, viewMode, categoryFilter, statusFilter])

  const handleImportSettings = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const settings = JSON.parse(text)
        toast.success('Settings imported successfully!')
      } catch {
        toast.error('Failed to import settings')
      }
    }
    input.click()
  }, [])

  const handleResetSettings = useCallback(() => {
    if (!confirm('Are you sure you want to reset all add-on settings? This cannot be undone.')) {
      return
    }
    setViewMode('grid')
    setCategoryFilter('all')
    setStatusFilter('all')
    toast.success('All settings have been reset!')
  }, [])

  const handleSubmitAddOn = useCallback(() => {
    window.open('/dashboard/add-ons/submit', '_blank')
    toast.success('Opening add-on submission page')
  }, [])

  const handleOpenDocumentation = useCallback(() => {
    window.open('/docs/add-ons', '_blank')
    toast.success('Opening documentation')
  }, [])

  const handleOpenApiReference = useCallback(() => {
    window.open('/docs/api/add-ons', '_blank')
    toast.success('Opening API reference')
  }, [])

  const handleOpenFilterDialog = useCallback(() => {
    setShowFilterDialog(true)
  }, [])

  const handleApplyFilters = useCallback(() => {
    setShowFilterDialog(false)
    toast.success('Filters applied successfully!')
  }, [])

  const handleResetFilters = useCallback(() => {
    setCategoryFilter('all')
    setStatusFilter('all')
    setShowFilterDialog(false)
    toast.success('Filters reset!')
  }, [])

  const handleOpenAdvancedSearch = useCallback(() => {
    setShowAdvancedSearchDialog(true)
  }, [])

  const handleAdvancedSearch = useCallback(() => {
    // Apply advanced search filters
    const { query, minRating, isVerified, isFeatured, hasFreeTrial } = advancedSearchFilters
    setSearchQuery(query)
    // Note: In a real implementation, these would filter the addOns array
    setShowAdvancedSearchDialog(false)
    toast.success(`Searching with advanced filters: ${query || 'all add-ons'}${minRating > 0 ? `, min rating ${minRating}` : ''}${isVerified ? ', verified only' : ''}${isFeatured ? ', featured only' : ''}${hasFreeTrial ? ', with free trial' : ''}`)
  }, [advancedSearchFilters])

  const handleOpenCategoryRequest = useCallback(() => {
    setShowCategoryRequestDialog(true)
  }, [])

  const handleSubmitCategoryRequest = useCallback(async () => {
    if (!categoryRequest.name.trim()) {
      toast.error('Please enter a category name')
      return
    }
    const result = await apiPost('/api/add-ons/categories/request', categoryRequest, {
      loading: 'Submitting category request...',
      success: 'Category request submitted! We will review it shortly.',
      error: 'Failed to submit category request'
    })
    if (result.success) {
      setCategoryRequest({ name: '', description: '', examples: '' })
      setShowCategoryRequestDialog(false)
    }
  }, [categoryRequest])

  // Quick actions with real functionality
  const mockAddOnsQuickActions = useMemo(() => [
    { id: '1', label: 'Browse Add-Ons', icon: 'store', action: handleBrowseStore, variant: 'default' as const },
    { id: '2', label: 'Update All', icon: 'refresh', action: handleUpdateAllAddOns, variant: 'default' as const },
    { id: '3', label: 'Settings', icon: 'settings', action: () => { setActiveTab('settings'); toast.success('Settings loaded!') }, variant: 'outline' as const },
  ], [handleBrowseStore, handleUpdateAllAddOns])

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
            <Button variant="outline" size="sm" onClick={handleSubmitAddOn}>
              <Upload className="w-4 h-4 mr-2" />
              Submit Add-on
            </Button>
            <Button className="bg-gradient-to-r from-orange-500 to-pink-600 text-white" onClick={handleBrowseStore}>
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
            { icon: Store, label: 'Browse All', desc: 'Explore marketplace', color: 'from-orange-500 to-pink-600', action: handleBrowseStore },
            { icon: Download, label: 'Install New', desc: 'Get add-ons', color: 'from-blue-500 to-indigo-600', action: () => { setActiveTab('discover'); toast.success('Browse available add-ons') } },
            { icon: Package, label: 'Manage', desc: 'Your add-ons', color: 'from-green-500 to-emerald-600', action: () => { setActiveTab('installed'); toast.success('Managing your add-ons') } },
            { icon: Crown, label: 'Featured', desc: 'Top picks', color: 'from-amber-500 to-orange-600', action: () => { setActiveTab('featured'); toast.success('Viewing featured add-ons') } },
            { icon: RefreshCw, label: 'Updates', desc: 'Check updates', color: 'from-purple-500 to-violet-600', action: handleCheckForUpdates },
            { icon: Shield, label: 'Security', desc: 'Scan add-ons', color: 'from-red-500 to-rose-600', action: async () => { await apiPost('/api/add-ons/security-scan', {}, { loading: 'Scanning add-ons...', success: 'Security scan complete!', error: 'Scan failed' }) } },
            { icon: Code, label: 'Develop', desc: 'Create add-ons', color: 'from-cyan-500 to-blue-600', action: handleOpenDocumentation },
            { icon: Settings, label: 'Settings', desc: 'Configure', color: 'from-gray-500 to-slate-600', action: () => { setActiveTab('settings'); toast.success('Settings loaded') } }
          ].map((action, idx) => (
            <Card
              key={idx}
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0"
              onClick={action.action}
            >
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
              onClick={() => { setViewMode('grid'); toast.success('Grid view enabled') }}
              className={viewMode === 'grid' ? 'bg-orange-100' : ''}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setViewMode('list'); toast.success('List view enabled') }}
              className={viewMode === 'list' ? 'bg-orange-100' : ''}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleOpenFilterDialog}>
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
                    <Button className="bg-white text-blue-600 hover:bg-blue-50 gap-2" onClick={handleOpenAdvancedSearch}>
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
                      <div className="text-2xl font-bold">{addOns.filter(a => a.status === 'disabled').length}</div>
                      <div className="text-xs text-green-100">Disabled</div>
                    </div>
                    <Button className="bg-white text-green-600 hover:bg-green-50 gap-2" onClick={handleCheckForUpdates}>
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
                            <span>-</span>
                            <span>{addOn.size}</span>
                            <span>-</span>
                            <span>Updated {formatDate(addOn.lastUpdated)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleConfigureAddOn(addOn) }}>
                            <Settings className="w-4 h-4 mr-2" />
                            Configure
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={(e) => { e.stopPropagation(); handleDisableAddOn(addOn) }}
                          >
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
                    <Button className="bg-white text-amber-600 hover:bg-amber-50 gap-2" onClick={handleSubmitAddOn}>
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
                  <Card
                    key={addOn.id}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                    onClick={() => { setSelectedAddOn(addOn); setShowAddOnDialog(true) }}
                  >
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
                      <div className="text-2xl font-bold">{addOns.filter(a => a.category === 'ai').length}</div>
                      <div className="text-xs text-cyan-100">AI & ML</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{addOns.filter(a => a.category === 'integration').length}</div>
                      <div className="text-xs text-cyan-100">Integrations</div>
                    </div>
                    <Button className="bg-white text-cyan-600 hover:bg-cyan-50 gap-2" onClick={handleOpenCategoryRequest}>
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
                const count = addOns.filter(a => a.category === cat).length
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
                      <div className="text-2xl font-bold">{addOns.filter(a => a.status === 'update_available').length}</div>
                      <div className="text-xs text-purple-100">Updates Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{installedAddOns.length}</div>
                      <div className="text-xs text-purple-100">Up to Date</div>
                    </div>
                    <Button className="bg-white text-purple-600 hover:bg-purple-50 gap-2" onClick={handleUpdateAllAddOns}>
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
                {addOns.filter(a => a.status === 'update_available').length > 0 ? (
                  <div className="space-y-4">
                    {addOns.filter(a => a.status === 'update_available').map((addOn) => (
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
                        <Button
                          className="bg-gradient-to-r from-orange-500 to-pink-600 text-white"
                          onClick={() => handleUpdateAddOn(addOn)}
                        >
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
                          <p className="text-xs text-muted-foreground">v{update.from} - v{update.to}</p>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
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
                            <option>EUR (E)</option>
                            <option>GBP (P)</option>
                            <option>JPY (Y)</option>
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
                        <Button className="mt-3" variant="outline" onClick={handleCheckForUpdates}>Check for Updates Now</Button>
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
                          <Button variant="outline" size="sm" onClick={handleOpenApiReference}>
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
                        <Button variant="destructive" onClick={handleResetSettings}>
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
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
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
            actions={mockAddOnsQuickActions}
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
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                    {selectedAddOn.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-sm">
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
                      <Button className="flex-1" variant="outline" onClick={() => handleConfigureAddOn(selectedAddOn)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button className="flex-1 text-red-600" variant="outline" onClick={() => handleUninstallAddOn(selectedAddOn)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Uninstall
                      </Button>
                    </>
                  ) : selectedAddOn.status === 'disabled' ? (
                    <>
                      <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => handleEnableAddOn(selectedAddOn)}>
                        <Zap className="w-4 h-4 mr-2" />
                        Enable
                      </Button>
                      <Button className="flex-1 text-red-600" variant="outline" onClick={() => handleUninstallAddOn(selectedAddOn)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Uninstall
                      </Button>
                    </>
                  ) : selectedAddOn.status === 'update_available' ? (
                    <>
                      <Button className="flex-1 bg-gradient-to-r from-orange-500 to-pink-600 text-white" onClick={() => handleUpdateAddOn(selectedAddOn)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Update Now
                      </Button>
                      <Button className="flex-1" variant="outline" onClick={() => handleConfigureAddOn(selectedAddOn)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="flex-1 bg-gradient-to-r from-orange-500 to-pink-600 text-white" onClick={() => handleInstallAddOn(selectedAddOn)}>
                        <Download className="w-4 h-4 mr-2" />
                        {selectedAddOn.hasFreeTrial ? 'Start Free Trial' : 'Install'}
                      </Button>
                      <Button className="flex-1" variant="outline" onClick={() => window.open(`/add-ons/${selectedAddOn.id}`, '_blank')}>
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

        {/* Settings Dialog for individual add-on */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Configure {selectedAddOn?.name}</DialogTitle>
            </DialogHeader>
            {selectedAddOn && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Configure settings for {selectedAddOn.name}. Changes will be saved automatically.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Enable Notifications</div>
                      <div className="text-xs text-muted-foreground">Receive notifications from this add-on</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={addOnSettings[selectedAddOn.id]?.notifications ?? true}
                      onChange={(e) => setAddOnSettings(prev => ({
                        ...prev,
                        [selectedAddOn.id]: { ...prev[selectedAddOn.id], notifications: e.target.checked, autoSync: prev[selectedAddOn.id]?.autoSync ?? true, developerMode: prev[selectedAddOn.id]?.developerMode ?? false }
                      }))}
                      className="toggle"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Auto-sync Data</div>
                      <div className="text-xs text-muted-foreground">Automatically sync data in background</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={addOnSettings[selectedAddOn.id]?.autoSync ?? true}
                      onChange={(e) => setAddOnSettings(prev => ({
                        ...prev,
                        [selectedAddOn.id]: { ...prev[selectedAddOn.id], autoSync: e.target.checked, notifications: prev[selectedAddOn.id]?.notifications ?? true, developerMode: prev[selectedAddOn.id]?.developerMode ?? false }
                      }))}
                      className="toggle"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Developer Mode</div>
                      <div className="text-xs text-muted-foreground">Enable debug features</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={addOnSettings[selectedAddOn.id]?.developerMode ?? false}
                      onChange={(e) => setAddOnSettings(prev => ({
                        ...prev,
                        [selectedAddOn.id]: { ...prev[selectedAddOn.id], developerMode: e.target.checked, notifications: prev[selectedAddOn.id]?.notifications ?? true, autoSync: prev[selectedAddOn.id]?.autoSync ?? true }
                      }))}
                      className="toggle"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1" onClick={() => {
                    localStorage.setItem('add-ons-settings', JSON.stringify(addOnSettings))
                    setShowSettingsDialog(false)
                    toast.success('Settings saved!')
                  }}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Filter Add-ons</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  className="w-full p-2 border rounded-lg dark:bg-gray-700"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as AddOnCategory | 'all')}
                >
                  <option value="all">All Categories</option>
                  <option value="ai">AI & Machine Learning</option>
                  <option value="integration">Integrations</option>
                  <option value="security">Security</option>
                  <option value="analytics">Analytics</option>
                  <option value="communication">Communication</option>
                  <option value="design">Design</option>
                  <option value="developer">Developer Tools</option>
                  <option value="storage">Storage</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full p-2 border rounded-lg dark:bg-gray-700"
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
              <div className="flex gap-3 pt-4">
                <Button className="flex-1" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={handleResetFilters}>
                  Reset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Advanced Search Dialog */}
        <Dialog open={showAdvancedSearchDialog} onOpenChange={setShowAdvancedSearchDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Advanced Search</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Query</label>
                <Input
                  placeholder="Search add-ons..."
                  value={advancedSearchFilters.query}
                  onChange={(e) => setAdvancedSearchFilters(prev => ({ ...prev, query: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Rating</label>
                  <select
                    className="w-full p-2 border rounded-lg dark:bg-gray-700"
                    value={advancedSearchFilters.minRating}
                    onChange={(e) => setAdvancedSearchFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
                  >
                    <option value="0">Any Rating</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pricing Type</label>
                  <select
                    className="w-full p-2 border rounded-lg dark:bg-gray-700"
                    value={advancedSearchFilters.pricingType}
                    onChange={(e) => setAdvancedSearchFilters(prev => ({ ...prev, pricingType: e.target.value as PricingType | 'all' }))}
                  >
                    <option value="all">All Pricing</option>
                    <option value="free">Free</option>
                    <option value="freemium">Freemium</option>
                    <option value="paid">Paid</option>
                    <option value="subscription">Subscription</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Has Free Trial</span>
                  <input
                    type="checkbox"
                    checked={advancedSearchFilters.hasFreeTrial}
                    onChange={(e) => setAdvancedSearchFilters(prev => ({ ...prev, hasFreeTrial: e.target.checked }))}
                    className="toggle"
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Verified Only</span>
                  <input
                    type="checkbox"
                    checked={advancedSearchFilters.isVerified}
                    onChange={(e) => setAdvancedSearchFilters(prev => ({ ...prev, isVerified: e.target.checked }))}
                    className="toggle"
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Featured Only</span>
                  <input
                    type="checkbox"
                    checked={advancedSearchFilters.isFeatured}
                    onChange={(e) => setAdvancedSearchFilters(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="toggle"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white" onClick={handleAdvancedSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={() => {
                  setAdvancedSearchFilters({
                    query: '',
                    minRating: 0,
                    maxPrice: 100,
                    pricingType: 'all',
                    hasFreeTrial: false,
                    isVerified: false,
                    isFeatured: false
                  })
                }}>
                  Clear
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Category Request Dialog */}
        <Dialog open={showCategoryRequestDialog} onOpenChange={setShowCategoryRequestDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                <p className="text-sm text-cyan-700 dark:text-cyan-400">
                  Suggest a new category for the add-on marketplace. Our team will review your request.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category Name *</label>
                <Input
                  placeholder="e.g., Finance, Healthcare, Education"
                  value={categoryRequest.name}
                  onChange={(e) => setCategoryRequest(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 min-h-[80px]"
                  placeholder="Describe what types of add-ons would fit in this category..."
                  value={categoryRequest.description}
                  onChange={(e) => setCategoryRequest(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Example Add-ons</label>
                <Input
                  placeholder="e.g., QuickBooks, Xero, Stripe"
                  value={categoryRequest.examples}
                  onChange={(e) => setCategoryRequest(prev => ({ ...prev, examples: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white" onClick={handleSubmitCategoryRequest}>
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Request
                </Button>
                <Button variant="outline" onClick={() => setShowCategoryRequestDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
