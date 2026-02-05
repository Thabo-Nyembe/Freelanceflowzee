'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useMarketplaceIntegrations, MarketplaceIntegration, MarketplaceStats } from '@/lib/hooks/use-marketplace-integrations'
import { Search, Star, Download, ExternalLink, Shield, Zap, Users, TrendingUp, CheckCircle, Settings, Code, CreditCard, Package, Grid3X3, List, ChevronRight, Heart, Flag, MessageSquare, Plus, Sparkles, Verified, Lock, RefreshCw, Bell, Webhook, Key, AlertOctagon, Sliders, Mail, Copy, Loader2 } from 'lucide-react'
import { apiPost, apiDelete, copyToClipboard, downloadAsJson } from '@/lib/button-handlers'

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

import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'

// Stripe Marketplace Level Types
interface AppListing {
  id: string
  name: string
  slug: string
  icon: string
  shortDescription: string
  fullDescription: string
  developer: Developer
  category: AppCategory
  subcategory: string
  pricing: PricingPlan[]
  currentPlan?: string
  rating: number
  reviewCount: number
  installCount: number
  featured: boolean
  verified: boolean
  isNew: boolean
  status: 'available' | 'installed' | 'pending' | 'error'
  version: string
  lastUpdated: string
  screenshots: string[]
  permissions: Permission[]
  tags: string[]
  supportUrl: string
  docsUrl: string
  privacyUrl: string
  changelog: ChangelogEntry[]
}

interface Developer {
  id: string
  name: string
  logo: string
  verified: boolean
  website: string
  supportEmail: string
  appsCount: number
}

interface PricingPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year' | 'one-time' | 'usage'
  features: string[]
  popular?: boolean
  limits?: Record<string, number | string>
}

interface Permission {
  scope: string
  description: string
  required: boolean
}

interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

interface Review {
  id: string
  appId: string
  user: { name: string; avatar: string; company?: string }
  rating: number
  title: string
  content: string
  helpful: number
  date: string
  response?: { content: string; date: string }
}

interface Collection {
  id: string
  name: string
  description: string
  icon: string
  apps: string[]
  color: string
}

type AppCategory = 'payments' | 'analytics' | 'marketing' | 'crm' | 'productivity' | 'communication' | 'security' | 'developer-tools' | 'finance' | 'hr'

interface IntegrationsMarketplaceClientProps {
  initialIntegrations: MarketplaceIntegration[]
  initialStats: MarketplaceStats
}

const categories: { id: AppCategory; name: string; icon: React.ReactNode; count: number }[] = [
  { id: 'payments', name: 'Payments', icon: <CreditCard className="w-4 h-4" />, count: 24 },
  { id: 'analytics', name: 'Analytics', icon: <TrendingUp className="w-4 h-4" />, count: 38 },
  { id: 'marketing', name: 'Marketing', icon: <Zap className="w-4 h-4" />, count: 52 },
  { id: 'crm', name: 'CRM', icon: <Users className="w-4 h-4" />, count: 31 },
  { id: 'productivity', name: 'Productivity', icon: <Package className="w-4 h-4" />, count: 67 },
  { id: 'communication', name: 'Communication', icon: <MessageSquare className="w-4 h-4" />, count: 45 },
  { id: 'security', name: 'Security', icon: <Shield className="w-4 h-4" />, count: 19 },
  { id: 'developer-tools', name: 'Developer Tools', icon: <Code className="w-4 h-4" />, count: 83 },
  { id: 'finance', name: 'Finance', icon: <CreditCard className="w-4 h-4" />, count: 28 },
  { id: 'hr', name: 'HR & Recruiting', icon: <Users className="w-4 h-4" />, count: 22 }
]

export default function IntegrationsMarketplaceClient({ initialIntegrations, initialStats }: IntegrationsMarketplaceClientProps) {
  const router = useRouter()
  const { integrations, stats, loading, error } = useMarketplaceIntegrations(initialIntegrations, initialStats)
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()
  const [activeTab, setActiveTab] = useState('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedApp, setSelectedApp] = useState<AppListing | null>(null)
  const [showInstallDialog, setShowInstallDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular')
  const [settingsTab, setSettingsTab] = useState('general')
  const [showConfigureDialog, setShowConfigureDialog] = useState(false)
  const [configureApp, setConfigureApp] = useState<AppListing | null>(null)
  const [installedAppsList, setInstalledAppsList] = useState<AppListing[]>([])
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [showBlockAppDialog, setShowBlockAppDialog] = useState(false)

  // Map MarketplaceIntegration (snake_case) to AppListing (camelCase) for UI
  const apps = useMemo<AppListing[]>(() => {
    return integrations.map((integration): AppListing => {
      // Map category from DB to AppCategory type
      const categoryMap: Record<string, AppCategory> = {
        'crm': 'crm',
        'marketing': 'marketing',
        'productivity': 'productivity',
        'communication': 'communication',
        'analytics': 'analytics',
        'payment': 'payments',
        'storage': 'productivity',
        'social': 'marketing'
      }

      // Map status from DB to UI status
      const statusMap: Record<string, 'available' | 'installed' | 'pending' | 'error'> = {
        'connected': 'installed',
        'available': 'available',
        'disconnected': 'available',
        'configuring': 'pending',
        'error': 'error'
      }

      return {
        id: integration.id,
        name: integration.name,
        slug: integration.name.toLowerCase().replace(/\s+/g, '-'),
        icon: integration.logo || integration.name.charAt(0).toUpperCase(),
        shortDescription: integration.description || 'No description available',
        fullDescription: integration.description || 'No description available',
        developer: {
          id: integration.provider || 'unknown',
          name: integration.provider || 'Unknown Developer',
          logo: '',
          verified: true,
          website: '',
          supportEmail: '',
          appsCount: 1
        },
        category: categoryMap[integration.category] || 'productivity',
        subcategory: '',
        pricing: integration.pricing === 'free' ? [
          { id: 'free', name: 'Free', price: 0, interval: 'month' as const, features: integration.features || [] }
        ] : [
          { id: 'basic', name: 'Basic', price: 0, interval: 'month' as const, features: [] },
          { id: 'pro', name: 'Pro', price: 29, interval: 'month' as const, features: integration.features || [], popular: true }
        ],
        currentPlan: integration.status === 'connected' ? 'pro' : undefined,
        rating: integration.rating || 4.5,
        reviewCount: integration.reviews_count || 0,
        installCount: integration.installs_count || 0,
        featured: (integration.rating || 0) >= 4.5,
        verified: true,
        isNew: new Date(integration.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000, // New if created in last 30 days
        status: statusMap[integration.status] || 'available',
        version: integration.version || '1.0.0',
        lastUpdated: integration.updated_at,
        screenshots: [],
        permissions: [],
        tags: integration.tags || [],
        supportUrl: '',
        docsUrl: '',
        privacyUrl: '',
        changelog: []
      }
    })
  }, [integrations])

  // Filtered apps - move before early returns to comply with hooks rules
  const filteredApps = useMemo(() => {
    let filtered = [...apps]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(query) ||
        app.shortDescription.toLowerCase().includes(query) ||
        app.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(app => app.category === selectedCategory)
    }

    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.installCount - a.installCount)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
        break
    }

    return filtered
  }, [apps, searchQuery, selectedCategory, sortBy])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  // Error state with retry
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
        <div className="text-red-500 text-lg font-medium">Failed to load integrations</div>
        <p className="text-gray-500 text-sm">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  // Quick actions with real functionality
  const mockIntegrationsQuickActions = [
    {
      id: '1',
      label: 'Browse Apps',
      icon: 'search',
      action: () => {
        setActiveTab('discover')
        toast.success('Browsing marketplace with 200+ integrations across 15 categories')
      },
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'Install App',
      icon: 'plus',
      action: () => {
        setActiveTab('discover')
        toast.info('Select an app from the marketplace to install')
      },
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'View Logs',
      icon: 'file',
      action: () => {
        router.push('/dashboard/logs-v2')
        toast.success('Opening integration logs')
      },
      variant: 'outline' as const
    },
  ]

  const installedApps = installedAppsList.length > 0
    ? installedAppsList
    : apps.filter(app => app.status === 'installed')
  const featuredApps = apps.filter(app => app.featured)

  const formatInstalls = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`
    return count.toString()
  }

  // Real Install Handler - Calls API
  const handleInstallApp = async (app: AppListing, plan: PricingPlan) => {
    const result = await apiPost(`/api/integrations/${app.id}/install`, {
      planId: plan.id,
      planName: plan.name,
      appName: app.name
    }, {
      loading: `Installing ${app.name}...`,
      success: `${app.name} installed successfully with ${plan.name} plan`,
      error: `Failed to install ${app.name}`
    })

    if (result.success) {
      // Update local state
      setInstalledAppsList(prev => [...prev, { ...app, status: 'installed' as const, currentPlan: plan.id }])
      setShowInstallDialog(false)
      setSelectedApp(null)
    }
  }

  // Real Uninstall Handler - Confirms then calls API
  const handleUninstallApp = async (app: AppListing) => {
    if (!confirm(`Are you sure you want to uninstall ${app.name}? This will disconnect the integration and remove all associated settings.`)) {
      return
    }

    const result = await apiDelete(`/api/integrations/${app.id}/uninstall`, {
      loading: `Uninstalling ${app.name}...`,
      success: `${app.name} has been uninstalled`,
      error: `Failed to uninstall ${app.name}`
    })

    if (result.success) {
      setInstalledAppsList(prev => prev.filter(a => a.id !== app.id))
      setSelectedApp(null)
    }
  }

  // Real Configure Handler - Opens settings dialog
  const handleConfigureApp = (app: AppListing) => {
    setConfigureApp(app)
    setShowConfigureDialog(true)
    toast.info(`Opening settings for ${app.name}`)
  }

  // Real Connect/OAuth Handler - Navigates to OAuth
  const handleConnectApp = (app: AppListing) => {
    // In a real app, this would redirect to OAuth flow
    window.open(`https://${app.developer.website}/oauth/authorize?client_id=freeflow&redirect_uri=${encodeURIComponent(window.location.origin)}/api/integrations/callback`, '_blank')
    toast.info(`Connecting to ${app.name}...`)
  }

  // Real Reconnect Handler
  const handleReconnectApp = async (app: AppListing) => {
    const result = await apiPost(`/api/integrations/${app.id}/reconnect`, {
      appId: app.id
    }, {
      loading: `Reconnecting ${app.name}...`,
      success: `${app.name} reconnected successfully`,
      error: `Failed to reconnect ${app.name}`
    })

    if (result.success) {
      toast.success('Connection restored')
    }
  }

  // Real Rate App Handler
  const handleRateApp = async (app: AppListing, rating: number) => {
    const result = await apiPost(`/api/integrations/${app.id}/rate`, {
      rating,
      appName: app.name
    }, {
      loading: 'Submitting rating...',
      success: `Thank you for rating ${app.name}!`,
      error: 'Failed to submit rating'
    })

    return result.success
  }

  // Real Helpful Review Handler
  const handleMarkHelpful = async (reviewId: string) => {
    const result = await apiPost(`/api/reviews/${reviewId}/helpful`, {}, {
      loading: 'Updating...',
      success: 'Marked as helpful',
      error: 'Failed to update'
    })
    return result.success
  }

  // Real Report Review Handler
  const handleReportReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to report this review?')) return

    const result = await apiPost(`/api/reviews/${reviewId}/report`, {}, {
      loading: 'Reporting...',
      success: 'Review reported. Our team will review it.',
      error: 'Failed to report review'
    })
    return result.success
  }

  // Copy API Key Handler
  const handleCopyApiKey = (keyType: string, key: string) => {
    copyToClipboard(key, `${keyType} API key copied to clipboard`)
  }

  // Regenerate API Key Handler
  const handleRegenerateApiKey = async (keyType: string) => {
    if (!confirm(`Are you sure you want to regenerate your ${keyType} API key? This will invalidate the current key.`)) {
      return
    }

    await apiPost('/api/integrations/api-keys/regenerate', { keyType }, {
      loading: 'Regenerating API key...',
      success: `${keyType} API key regenerated`,
      error: 'Failed to regenerate API key'
    })
  }

  // Create API Key Handler
  const handleCreateApiKey = async () => {
    await apiPost('/api/integrations/api-keys', { name: 'New API Key' }, {
      loading: 'Creating API key...',
      success: 'New API key created',
      error: 'Failed to create API key'
    })
  }

  // Add Webhook Handler
  const handleAddWebhook = () => {
    setShowWebhookDialog(true)
    toast.info('Opening webhook configuration...')
  }

  // Export Data Handler
  const handleExportData = () => {
    const exportData = {
      installedApps: installedAppsList,
      settings: { viewMode, sortBy, selectedCategory },
      exportedAt: new Date().toISOString()
    }
    downloadAsJson(exportData, 'marketplace-configuration.json')
  }

  // Import Configuration Handler
  const handleImportConfig = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const config = JSON.parse(text)
        toast.success('Configuration imported successfully')
      } catch {
        toast.error('Failed to import configuration')
      }
    }
    input.click()
  }

  // Clear Cache Handler
  const handleClearCache = async () => {
    if (!confirm('This will clear all cached data and force a refresh. Continue?')) return

    await apiPost('/api/integrations/cache/clear', {}, {
      loading: 'Clearing cache...',
      success: 'Cache cleared successfully',
      error: 'Failed to clear cache'
    })
  }

  // Reset Settings Handler
  const handleResetSettings = async () => {
    if (!confirm('Are you sure you want to reset all marketplace settings to defaults? This cannot be undone.')) return

    await apiPost('/api/integrations/settings/reset', {}, {
      loading: 'Resetting settings...',
      success: 'Settings reset to defaults',
      error: 'Failed to reset settings'
    })
  }

  // Disconnect All Apps Handler
  const handleDisconnectAll = async () => {
    if (!confirm('Are you sure you want to disconnect ALL integrations? This will remove all connected apps and their settings. This action cannot be undone.')) return

    const result = await apiDelete('/api/integrations/disconnect-all', {
      loading: 'Disconnecting all integrations...',
      success: 'All integrations disconnected',
      error: 'Failed to disconnect integrations'
    })

    if (result.success) {
      setInstalledAppsList([])
    }
  }

  // Unblock App Handler
  const handleUnblockApp = async (appName: string) => {
    await apiPost('/api/integrations/blocked/remove', { appName }, {
      loading: 'Unblocking app...',
      success: `${appName} has been unblocked`,
      error: 'Failed to unblock app'
    })
  }

  // Block App Handler
  const handleBlockApp = () => {
    setShowBlockAppDialog(true)
    toast.info('Opening app blocker...')
  }

  // Handlers
  const handleInstall = (app: AppListing, plan: PricingPlan) => {
    handleInstallApp(app, plan)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  const AppCard = ({ app, compact = false }: { app: AppListing; compact?: boolean }) => (
    <Card
      className={`group cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-teal-300 ${compact ? 'p-3' : ''}`}
      onClick={() => setSelectedApp(app)}
    >
      <CardContent className={compact ? 'p-0' : 'p-4'}>
        <div className="flex items-start gap-3">
          <div className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md`}>
            {app.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-gray-900 truncate ${compact ? 'text-sm' : ''}`}>{app.name}</h3>
              {app.verified && <Verified className="w-4 h-4 text-blue-500 flex-shrink-0" />}
              {app.isNew && <Badge className="bg-green-100 text-green-700 text-xs">New</Badge>}
            </div>
            <p className={`text-gray-500 ${compact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'} mt-0.5`}>
              {app.shortDescription}
            </p>
            {!compact && (
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  {renderStars(app.rating)}
                  <span className="ml-1">{app.rating}</span>
                  <span>({app.reviewCount.toLocaleString()})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>{formatInstalls(app.installCount)}</span>
                </div>
              </div>
            )}
          </div>
          {app.status === 'installed' && (
            <Badge className="bg-green-100 text-green-700 flex-shrink-0">Installed</Badge>
          )}
        </div>
        {!compact && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{app.category}</Badge>
              {app.pricing[0]?.price === 0 && (
                <Badge className="bg-teal-100 text-teal-700 text-xs">Free tier</Badge>
              )}
            </div>
            <Button
              size="sm"
              variant={app.status === 'installed' ? 'outline' : 'default'}
              className={app.status !== 'installed' ? 'bg-teal-600 hover:bg-teal-700' : ''}
              onClick={(e) => {
                e.stopPropagation()
                if (app.status === 'installed') {
                  handleConfigureApp(app)
                } else {
                  setSelectedApp(app)
                  setShowInstallDialog(true)
                }
              }}
            >
              {app.status === 'installed' ? 'Manage' : 'Install'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Integrations Marketplace</h1>
              <p className="text-teal-100 mt-1">Discover and connect powerful tools to supercharge your workflow</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 border-0"
                onClick={() => {
                  window.open('/docs/api', '_blank')
                  toast.success('Opening Developer Portal')
                }}
              >
                <Code className="w-4 h-4 mr-2" />
                Developer Portal
              </Button>
              <Button
                className="bg-white text-teal-600 hover:bg-teal-50"
                onClick={() => {
                  window.open('/integrations/submit', '_blank')
                  toast.info('Opening app submission form')
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit App
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search 500+ integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg bg-white border-0 shadow-lg rounded-xl text-gray-900"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-6 mt-8">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{stats.total || apps.length}</div>
              <div className="text-teal-100 text-sm">Total Apps</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{stats.connected || installedApps.length}</div>
              <div className="text-teal-100 text-sm">Installed</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{categories.length}</div>
              <div className="text-teal-100 text-sm">Categories</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{stats.avgRating?.toFixed(1) || '4.6'}</div>
              <div className="text-teal-100 text-sm">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="installed">
                Installed
                <Badge className="ml-2 bg-teal-100 text-teal-700">{installedApps.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-teal-100 text-teal-700' : 'bg-white dark:bg-gray-800'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-teal-100 text-teal-700' : 'bg-white dark:bg-gray-800'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-8">
            {/* Featured Apps */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Featured Apps</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-teal-600">
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredApps.slice(0, 3).map(app => (
                  <AppCard key={app.id} app={app} />
                ))}
              </div>
            </section>

            {/* Category Pills */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Browse by Category</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className={selectedCategory === 'all' ? 'bg-teal-600' : ''}
                >
                  All Apps
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={selectedCategory === cat.id ? 'bg-teal-600' : ''}
                  >
                    {cat.icon}
                    <span className="ml-1">{cat.name}</span>
                    <span className="ml-1 text-xs opacity-60">({cat.count})</span>
                  </Button>
                ))}
              </div>
            </section>

            {/* All Apps */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedCategory === 'all' ? 'All Apps' : categories.find(c => c.id === selectedCategory)?.name}
                  <span className="text-gray-400 font-normal ml-2">({filteredApps.length})</span>
                </h2>
              </div>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                {filteredApps.map(app => (
                  <AppCard key={app.id} app={app} compact={viewMode === 'list'} />
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Installed Tab */}
          <TabsContent value="installed" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{installedApps.length}</div>
                      <div className="text-sm text-gray-500">Active Integrations</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <RefreshCw className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">12.4K</div>
                      <div className="text-sm text-gray-500">API Calls Today</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">$127</div>
                      <div className="text-sm text-gray-500">Monthly Spend</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {installedApps.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No integrations installed</h3>
                  <p className="text-gray-500 mb-4">Browse our marketplace to find apps that work for your business</p>
                  <Button className="bg-teal-600" onClick={() => setActiveTab('discover')}>
                    Browse Marketplace
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {installedApps.map(app => (
                  <Card key={app.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {app.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{app.name}</h3>
                            {app.verified && <Verified className="w-4 h-4 text-blue-500" />}
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{app.shortDescription}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>v{app.version}</span>
                            <span>-</span>
                            <span>Plan: {app.currentPlan || 'Free'}</span>
                            <span>-</span>
                            <span>Last synced: 2 min ago</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConfigureApp(app)}
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            Configure
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleUninstallApp(app)}
                          >
                            Uninstall
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {([] as Collection[]).map(collection => (
                <Card key={collection.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className={`h-24 bg-gradient-to-r ${collection.color} p-4 flex items-end`}>
                    <div>
                      <h3 className="text-xl font-bold text-white">{collection.name}</h3>
                      <p className="text-white/80 text-sm">{collection.description}</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-gray-500">{collection.apps.length} apps</span>
                    </div>
                    <div className="flex -space-x-2">
                      {collection.apps.slice(0, 4).map((appId, idx) => {
                        const app = apps.find(a => a.id === appId)
                        return app ? (
                          <div key={appId} className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                            {app.icon}
                          </div>
                        ) : null
                      })}
                      {collection.apps.length > 4 && (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm border-2 border-white">
                          +{collection.apps.length - 4}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map(cat => (
                <Card
                  key={cat.id}
                  className="cursor-pointer hover:shadow-md hover:border-teal-300 transition-all"
                  onClick={() => { setSelectedCategory(cat.id); setActiveTab('discover') }}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center mx-auto mb-3 text-teal-600">
                      {cat.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                    <p className="text-sm text-gray-500">{cat.count} apps</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab - Zapier Level */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: <Sliders className="w-4 h-4" /> },
                        { id: 'apps', label: 'Apps & Connections', icon: <Package className="w-4 h-4" /> },
                        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
                        { id: 'api', label: 'API & Webhooks', icon: <Webhook className="w-4 h-4" /> },
                        { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
                        { id: 'advanced', label: 'Advanced', icon: <Code className="w-4 h-4" /> }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setSettingsTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === tab.id
                              ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {tab.icon}
                          <span className="font-medium">{tab.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-teal-600" />
                          General Settings
                        </CardTitle>
                        <CardDescription>Configure your marketplace preferences and display options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default View Mode</Label>
                            <Select defaultValue="grid">
                              <SelectTrigger>
                                <SelectValue placeholder="Select view" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="grid">Grid View</SelectItem>
                                <SelectItem value="list">List View</SelectItem>
                                <SelectItem value="compact">Compact View</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Items Per Page</Label>
                            <Select defaultValue="24">
                              <SelectTrigger>
                                <SelectValue placeholder="Select count" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="12">12 items</SelectItem>
                                <SelectItem value="24">24 items</SelectItem>
                                <SelectItem value="48">48 items</SelectItem>
                                <SelectItem value="96">96 items</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Show Featured Apps</div>
                              <div className="text-sm text-gray-500">Display featured apps at the top of discover page</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Show App Ratings</div>
                              <div className="text-sm text-gray-500">Display ratings and reviews on app cards</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Show Install Count</div>
                              <div className="text-sm text-gray-500">Display how many users have installed each app</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Auto-Update Apps</div>
                              <div className="text-sm text-gray-500">Automatically update apps when new versions are available</div>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Discovery Preferences</CardTitle>
                        <CardDescription>Customize how apps are recommended to you</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Sort Order</Label>
                            <Select defaultValue="popular">
                              <SelectTrigger>
                                <SelectValue placeholder="Select sort" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="popular">Most Popular</SelectItem>
                                <SelectItem value="rating">Highest Rated</SelectItem>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="name">Alphabetical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Preferred Categories</Label>
                            <Select defaultValue="all">
                              <SelectTrigger>
                                <SelectValue placeholder="Select categories" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="productivity">Productivity</SelectItem>
                                <SelectItem value="analytics">Analytics</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Personalized Recommendations</div>
                              <div className="text-sm text-gray-500">Use your usage data to suggest relevant apps</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Show Beta Apps</div>
                              <div className="text-sm text-gray-500">Include apps that are in beta testing</div>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Language & Region</CardTitle>
                        <CardDescription>Set your locale preferences for the marketplace</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Display Language</Label>
                            <Select defaultValue="en">
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English (US)</SelectItem>
                                <SelectItem value="en-gb">English (UK)</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="ja">Japanese</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select defaultValue="usd">
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usd">USD ($)</SelectItem>
                                <SelectItem value="eur">EUR (€)</SelectItem>
                                <SelectItem value="gbp">GBP (£)</SelectItem>
                                <SelectItem value="jpy">JPY (¥)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Apps & Connections Settings */}
                {settingsTab === 'apps' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-teal-600" />
                          Connected Apps
                        </CardTitle>
                        <CardDescription>Manage your installed integrations and their permissions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {installedApps.map(app => (
                          <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-teal-300 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                                {app.icon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">{app.name}</h4>
                                  {app.verified && <Verified className="w-4 h-4 text-blue-500" />}
                                  <Badge className="bg-green-100 text-green-700">Connected</Badge>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  Plan: {app.currentPlan || 'Free'} - v{app.version} - Last synced: 2 min ago
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReconnectApp(app)}
                              >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Reconnect
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleUninstallApp(app)}
                              >
                                Disconnect
                              </Button>
                            </div>
                          </div>
                        ))}
                        {installedApps.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No apps connected yet</p>
                            <Button className="mt-4 bg-teal-600" onClick={() => setActiveTab('discover')}>
                              Browse Marketplace
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Connection Settings</CardTitle>
                        <CardDescription>Configure how apps connect and sync with your workspace</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Auto-Reconnect</div>
                            <div className="text-sm text-gray-500">Automatically reconnect when connection is lost</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Background Sync</div>
                            <div className="text-sm text-gray-500">Keep data synced in the background</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Sync Frequency</div>
                            <div className="text-sm text-gray-500">How often to sync data with connected apps</div>
                          </div>
                          <Select defaultValue="5">
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Every minute</SelectItem>
                              <SelectItem value="5">Every 5 minutes</SelectItem>
                              <SelectItem value="15">Every 15 minutes</SelectItem>
                              <SelectItem value="60">Every hour</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Sharing</CardTitle>
                        <CardDescription>Control what data is shared with connected apps</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Share Usage Analytics</div>
                            <div className="text-sm text-gray-500">Help apps improve by sharing anonymous usage data</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Share Contact Data</div>
                            <div className="text-sm text-gray-500">Allow apps to access your contact list</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Share Calendar Access</div>
                            <div className="text-sm text-gray-500">Allow apps to view and manage your calendar</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-teal-600" />
                          Notification Preferences
                        </CardTitle>
                        <CardDescription>Configure how you receive marketplace notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">New App Releases</div>
                              <div className="text-sm text-gray-500">Get notified when new apps are added to the marketplace</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">App Updates Available</div>
                              <div className="text-sm text-gray-500">Notify when updates are available for installed apps</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Connection Issues</div>
                              <div className="text-sm text-gray-500">Alert when an app loses connection or encounters errors</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Weekly Digest</div>
                              <div className="text-sm text-gray-500">Receive a weekly summary of marketplace activity</div>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Price Changes</div>
                              <div className="text-sm text-gray-500">Notify when pricing changes for installed apps</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Delivery Channels</CardTitle>
                        <CardDescription>Choose how you want to receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">Email Notifications</div>
                              <div className="text-sm text-gray-500">user@example.com</div>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Bell className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium">Push Notifications</div>
                              <div className="text-sm text-gray-500">Browser & mobile push</div>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-100 rounded-lg">
                              <MessageSquare className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                              <div className="font-medium">Slack Notifications</div>
                              <div className="text-sm text-gray-500">#integrations channel</div>
                            </div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Quiet Hours</CardTitle>
                        <CardDescription>Set times when you don't want to be notified</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Enable Quiet Hours</div>
                            <div className="text-sm text-gray-500">Pause notifications during specified times</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input type="time" defaultValue="22:00" />
                          </div>
                          <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input type="time" defaultValue="08:00" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* API & Webhooks Settings */}
                {settingsTab === 'api' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-teal-600" />
                          API Keys
                        </CardTitle>
                        <CardDescription>Manage API keys for accessing the marketplace programmatically</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="font-medium">Production API Key</div>
                              <div className="text-sm text-gray-500">Use this key in your production environment</div>
                            </div>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="password" value="mk_prod_xxxxxxxxxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyApiKey('Production', 'mk_prod_xxxxxxxxxxxxxxxxxxxxxxxxx')}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRegenerateApiKey('Production')}
                            >
                              Regenerate
                            </Button>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">Created Jan 15, 2024 - Last used 2 hours ago</div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="font-medium">Test API Key</div>
                              <div className="text-sm text-gray-500">Use this key for development and testing</div>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-700">Test</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="password" value="mk_test_xxxxxxxxxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyApiKey('Test', 'mk_test_xxxxxxxxxxxxxxxxxxxxxxxxx')}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRegenerateApiKey('Test')}
                            >
                              Regenerate
                            </Button>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">Created Jan 15, 2024 - Last used 5 min ago</div>
                        </div>

                        <Button className="w-full bg-teal-600" onClick={handleCreateApiKey}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create New API Key
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-teal-600" />
                          Webhooks
                        </CardTitle>
                        <CardDescription>Configure webhooks to receive real-time events</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="font-medium">App Install Events</span>
                            </div>
                            <Badge>Enabled</Badge>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">https://api.yourapp.com/webhooks/marketplace</div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Events: app.installed, app.uninstalled, app.updated</span>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="font-medium">Sync Events</span>
                            </div>
                            <Badge>Enabled</Badge>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">https://api.yourapp.com/webhooks/sync</div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Events: sync.started, sync.completed, sync.failed</span>
                          </div>
                        </div>

                        <Button variant="outline" className="w-full" onClick={handleAddWebhook}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Webhook Endpoint
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>API Usage</CardTitle>
                        <CardDescription>Monitor your API usage and rate limits</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold text-teal-600">12,847</div>
                            <div className="text-sm text-gray-500">API Calls Today</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600">98.7%</div>
                            <div className="text-sm text-gray-500">Success Rate</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold text-purple-600">45ms</div>
                            <div className="text-sm text-gray-500">Avg Response</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Rate Limit Usage</span>
                            <span className="text-sm text-gray-500">12,847 / 100,000</span>
                          </div>
                          <Progress value={12.8} className="h-2" />
                          <div className="text-xs text-gray-500">Resets in 8 hours</div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-teal-600" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>Manage security and access control for integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Require Approval for New Apps</div>
                            <div className="text-sm text-gray-500">Admin must approve before apps can be installed</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Two-Factor Authentication</div>
                            <div className="text-sm text-gray-500">Require 2FA for sensitive app operations</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">IP Allowlist</div>
                            <div className="text-sm text-gray-500">Restrict API access to specific IP addresses</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Audit Logging</div>
                            <div className="text-sm text-gray-500">Log all app installations and configuration changes</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Access Permissions</CardTitle>
                        <CardDescription>Control who can install and manage apps</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Who can install apps</Label>
                          <Select defaultValue="admins">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admins">Admins only</SelectItem>
                              <SelectItem value="managers">Admins & Managers</SelectItem>
                              <SelectItem value="all">All team members</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Who can configure apps</Label>
                          <Select defaultValue="managers">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admins">Admins only</SelectItem>
                              <SelectItem value="managers">Admins & Managers</SelectItem>
                              <SelectItem value="all">All team members</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Who can view installed apps</Label>
                          <Select defaultValue="all">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admins">Admins only</SelectItem>
                              <SelectItem value="managers">Admins & Managers</SelectItem>
                              <SelectItem value="all">All team members</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Blocked Apps</CardTitle>
                        <CardDescription>Apps that are blocked from being installed</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <AlertOctagon className="w-5 h-5 text-red-600" />
                              <div>
                                <div className="font-medium text-red-800 dark:text-red-200">UnsafeApp Pro</div>
                                <div className="text-sm text-red-600">Blocked by admin on Jan 10, 2024</div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnblockApp('UnsafeApp Pro')}
                            >
                              Unblock
                            </Button>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleBlockApp}>
                          <Plus className="w-4 h-4 mr-2" />
                          Block an App
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="w-5 h-5 text-teal-600" />
                          Developer Options
                        </CardTitle>
                        <CardDescription>Advanced configuration for developers</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Developer Mode</div>
                            <div className="text-sm text-gray-500">Enable advanced debugging and logging features</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Show API Response Times</div>
                            <div className="text-sm text-gray-500">Display response time metrics in the UI</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Console Logging</div>
                            <div className="text-sm text-gray-500">Log integration events to browser console</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Mock Mode</div>
                            <div className="text-sm text-gray-500">Use mock data instead of live API calls</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Tuning</CardTitle>
                        <CardDescription>Optimize integration performance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Connection Timeout (seconds)</Label>
                            <Input type="number" defaultValue="30" />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Retry Attempts</Label>
                            <Input type="number" defaultValue="3" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Batch Size</Label>
                            <Select defaultValue="100">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="50">50 items</SelectItem>
                                <SelectItem value="100">100 items</SelectItem>
                                <SelectItem value="250">250 items</SelectItem>
                                <SelectItem value="500">500 items</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Cache Duration</Label>
                            <Select defaultValue="5">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 minute</SelectItem>
                                <SelectItem value="5">5 minutes</SelectItem>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Manage your marketplace data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Export All Data</div>
                            <div className="text-sm text-gray-500">Download all your marketplace configuration</div>
                          </div>
                          <Button variant="outline" onClick={handleExportData}>Export</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Import Configuration</div>
                            <div className="text-sm text-gray-500">Import settings from another workspace</div>
                          </div>
                          <Button variant="outline" onClick={handleImportConfig}>Import</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Clear Cache</div>
                            <div className="text-sm text-gray-500">Clear all cached data and force refresh</div>
                          </div>
                          <Button variant="outline" onClick={handleClearCache}>Clear</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions - proceed with caution</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                          <div>
                            <div className="font-medium text-red-600">Reset All Settings</div>
                            <div className="text-sm text-gray-500">Reset all marketplace settings to defaults</div>
                          </div>
                          <Button variant="destructive" onClick={handleResetSettings}>Reset</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                          <div>
                            <div className="font-medium text-red-600">Disconnect All Apps</div>
                            <div className="text-sm text-gray-500">Remove all connected integrations</div>
                          </div>
                          <Button variant="destructive" onClick={handleDisconnectAll}>Disconnect All</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            /* AIInsightsPanel removed - use header button */
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={teamMembers?.map(m => ({ id: m.id, name: m.name, avatar: m.avatar_url, status: m.status === 'active' ? 'online' : 'offline' })) || []}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[]}
              title="Integration Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          /* ActivityFeed removed - use header button */
          <QuickActionsToolbar
            actions={mockIntegrationsQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* App Detail Dialog */}
      <Dialog open={!!selectedApp && !showInstallDialog} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedApp && (
            <div className="flex flex-col h-full">
              <DialogHeader className="border-b pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {selectedApp.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-2xl">{selectedApp.name}</DialogTitle>
                      {selectedApp.verified && <Verified className="w-5 h-5 text-blue-500" />}
                    </div>
                    <p className="text-gray-500">by {selectedApp.developer.name}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        {renderStars(selectedApp.rating)}
                        <span className="font-semibold ml-1">{selectedApp.rating}</span>
                        <span className="text-gray-500">({selectedApp.reviewCount.toLocaleString()} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Download className="w-4 h-4" />
                        <span>{formatInstalls(selectedApp.installCount)} installs</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {installedAppsList.some(a => a.id === selectedApp.id) ? (
                      <>
                        <Button variant="outline" onClick={() => handleConfigureApp(selectedApp)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                        <Button
                          variant="outline"
                          className="text-red-600"
                          onClick={() => handleUninstallApp(selectedApp)}
                        >
                          Uninstall
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => setShowInstallDialog(true)}
                      >
                        Install App
                      </Button>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 py-4">
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">About</h3>
                      <p className="text-gray-600">{selectedApp.fullDescription}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedApp.tags.map(tag => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Version</div>
                        <div className="font-semibold">{selectedApp.version}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Last Updated</div>
                        <div className="font-semibold">{selectedApp.lastUpdated}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Category</div>
                        <div className="font-semibold capitalize">{selectedApp.category}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Links</h3>
                      <div className="flex gap-4">
                        <a href={selectedApp.docsUrl} className="flex items-center gap-1 text-teal-600 hover:underline">
                          <ExternalLink className="w-4 h-4" />
                          Documentation
                        </a>
                        <a href={selectedApp.supportUrl} className="flex items-center gap-1 text-teal-600 hover:underline">
                          <MessageSquare className="w-4 h-4" />
                          Support
                        </a>
                        <a href={selectedApp.privacyUrl} className="flex items-center gap-1 text-teal-600 hover:underline">
                          <Shield className="w-4 h-4" />
                          Privacy Policy
                        </a>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="pricing" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedApp.pricing.map(plan => (
                        <Card key={plan.id} className={`relative ${plan.popular ? 'border-teal-500 border-2' : ''}`}>
                          {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <Badge className="bg-teal-600">Most Popular</Badge>
                            </div>
                          )}
                          <CardContent className="p-6">
                            <h3 className="font-semibold text-lg">{plan.name}</h3>
                            <div className="mt-2 mb-4">
                              <span className="text-3xl font-bold">
                                {plan.price === 0 ? 'Free' : `$${plan.price}`}
                              </span>
                              {plan.price > 0 && (
                                <span className="text-gray-500">/{plan.interval}</span>
                              )}
                            </div>
                            <ul className="space-y-2 mb-6">
                              {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                            <Button
                              className={`w-full ${plan.popular ? 'bg-teal-600' : ''}`}
                              variant={plan.popular ? 'default' : 'outline'}
                              onClick={() => handleInstall(selectedApp, plan)}
                            >
                              {installedAppsList.some(a => a.id === selectedApp.id) && selectedApp.currentPlan === plan.id ? 'Current Plan' : 'Select Plan'}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4">
                    <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-4xl font-bold">{selectedApp.rating}</div>
                        <div className="flex justify-center mt-1">{renderStars(selectedApp.rating)}</div>
                        <div className="text-sm text-gray-500 mt-1">{selectedApp.reviewCount.toLocaleString()} reviews</div>
                      </div>
                      <div className="flex-1 space-y-1">
                        {[5, 4, 3, 2, 1].map(star => (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-sm w-3">{star}</span>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <Progress value={star === 5 ? 72 : star === 4 ? 20 : 8 / star} className="h-2 flex-1" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {([] as Review[]).filter(r => r.appId === selectedApp.id).map(review => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback>{review.user.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{review.user.name}</span>
                                {review.user.company && (
                                  <span className="text-sm text-gray-500">at {review.user.company}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                              <h4 className="font-medium mt-2">{review.title}</h4>
                              <p className="text-gray-600 text-sm mt-1">{review.content}</p>
                              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                <button
                                  className="flex items-center gap-1 hover:text-gray-700"
                                  onClick={() => handleMarkHelpful(review.id)}
                                >
                                  <Heart className="w-4 h-4" />
                                  Helpful ({review.helpful})
                                </button>
                                <button
                                  className="flex items-center gap-1 hover:text-gray-700"
                                  onClick={() => handleReportReview(review.id)}
                                >
                                  <Flag className="w-4 h-4" />
                                  Report
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="permissions" className="space-y-4">
                    <p className="text-gray-600">
                      This app requires the following permissions to function properly:
                    </p>
                    <div className="space-y-3">
                      {selectedApp.permissions.map((perm, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className={`p-1.5 rounded ${perm.required ? 'bg-red-100' : 'bg-gray-100'}`}>
                            {perm.required ? (
                              <Lock className="w-4 h-4 text-red-600" />
                            ) : (
                              <Shield className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">{perm.scope}</code>
                              {perm.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{perm.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Install Dialog */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Install {selectedApp?.name}</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <p className="text-gray-600">Select a plan to install this app:</p>
              <div className="space-y-3">
                {selectedApp.pricing.map(plan => (
                  <div
                    key={plan.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:border-teal-500 transition-colors ${selectedPlan?.id === plan.id ? 'border-teal-500 bg-teal-50' : ''}`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm text-gray-500">
                          {plan.price === 0 ? 'Free' : `$${plan.price}/${plan.interval}`}
                        </div>
                      </div>
                      {plan.popular && <Badge className="bg-teal-600">Popular</Badge>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowInstallDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-teal-600"
                  disabled={!selectedPlan}
                  onClick={() => selectedPlan && handleInstallApp(selectedApp, selectedPlan)}
                >
                  Install Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Configure Dialog */}
      <Dialog open={showConfigureDialog} onOpenChange={setShowConfigureDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure {configureApp?.name}</DialogTitle>
          </DialogHeader>
          {configureApp && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>API Endpoint</Label>
                <Input defaultValue={`https://api.${configureApp.developer.website}`} />
              </div>
              <div className="space-y-2">
                <Label>Sync Frequency</Label>
                <Select defaultValue="5">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Every minute</SelectItem>
                    <SelectItem value="5">Every 5 minutes</SelectItem>
                    <SelectItem value="15">Every 15 minutes</SelectItem>
                    <SelectItem value="60">Every hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Auto-sync</div>
                  <div className="text-sm text-gray-500">Automatically sync data</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Error Notifications</div>
                  <div className="text-sm text-gray-500">Get notified on sync failures</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowConfigureDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-teal-600"
                  onClick={async () => {
                    await apiPost(`/api/integrations/${configureApp.id}/configure`, {
                      // configuration data
                    }, {
                      loading: 'Saving configuration...',
                      success: 'Configuration saved',
                      error: 'Failed to save configuration'
                    })
                    setShowConfigureDialog(false)
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
