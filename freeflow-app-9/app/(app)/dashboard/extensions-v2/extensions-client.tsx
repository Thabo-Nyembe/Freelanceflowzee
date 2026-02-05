'use client'

import { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { apiPost, apiDelete, copyToClipboard, downloadAsJson } from '@/lib/button-handlers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Puzzle,
  Download,
  Star,
  Users,
  Shield,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Plus,
  Settings,
  RefreshCw,
  Trash2,
  ExternalLink,
  Code,
  Package,
  Layers,
  Grid3X3,
  List,
  Share2,
  Flag,
  Globe,
  Lock,
  Sparkles,
  Award,
  Verified,
  Store,
  Key,
  Database,
  Bell,
  BellRing,
  Mail,
  AlertOctagon,
  Copy,
  Archive,
  Layout,
  Gauge,
  Upload,
  History,
  Cpu,
  HardDrive,
  Fingerprint,
  ScanEye,
  Network,
  Unplug
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

import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Extension {
  id: string
  name: string
  description: string
  longDescription: string
  version: string
  developer: string
  developerVerified: boolean
  category: 'productivity' | 'developer' | 'social' | 'entertainment' | 'utilities' | 'themes' | 'shopping' | 'security'
  status: 'published' | 'pending' | 'rejected' | 'unlisted'
  installStatus: 'installed' | 'not_installed' | 'disabled'
  icon: string
  screenshots: string[]
  rating: number
  reviewCount: number
  installCount: number
  weeklyUsers: number
  size: string
  permissions: string[]
  features: string[]
  lastUpdated: string
  createdAt: string
  website?: string
  supportUrl?: string
  privacyPolicy?: string
  isFeatured: boolean
  isEditorsPick: boolean
  tags: string[]
}

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  content: string
  createdAt: string
  helpful: number
  developerReply?: string
}

interface ExtensionCategory {
  id: string
  name: string
  icon: string
  count: number
  color: string
}

// ============================================================================
// EMPTY DATA ARRAYS (no mock data)
// ============================================================================

const initialExtensions: Extension[] = []

const reviews: Review[] = []

const categories: ExtensionCategory[] = []

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getCategoryColor = (category: Extension['category']): string => {
  const colors: Record<Extension['category'], string> = {
    productivity: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    developer: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    social: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    entertainment: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    utilities: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    themes: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
    shopping: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    security: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  }
  return colors[category]
}

const getInstallStatusColor = (status: Extension['installStatus']): string => {
  const colors: Record<Extension['installStatus'], string> = {
    installed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    not_installed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    disabled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  }
  return colors[status]
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toString()
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ExtensionsClient() {
  const [activeTab, setActiveTab] = useState('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExtension, setSelectedExtension] = useState<Extension | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [settingsTab, setSettingsTab] = useState('general')
  const [extensions, setExtensions] = useState<Extension[]>(initialExtensions)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [configExtension, setConfigExtension] = useState<Extension | null>(null)

  // Team and activity data hooks
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()

  // ============================================================================
  // REAL API HANDLERS
  // ============================================================================

  // Install extension via API
  const handleInstallExtension = useCallback(async (ext: Extension) => {
    toast.loading(`Installing ${ext.name}...`)

    const result = await apiPost('/api/extensions/install', {
      extensionId: ext.id,
      name: ext.name,
      version: ext.version
    }, {
      loading: `Installing ${ext.name}...`,
      success: `${ext.name} installed successfully!`,
      error: `Failed to install ${ext.name}`
    })

    if (result.success) {
      setExtensions(prev => prev.map(e =>
        e.id === ext.id ? { ...e, installStatus: 'installed' } : e
      ))
      if (selectedExtension?.id === ext.id) {
        setSelectedExtension(prev => prev ? { ...prev, installStatus: 'installed' } : null)
      }
    }
  }, [selectedExtension])

  // Uninstall extension with confirmation
  const handleUninstallExtension = useCallback(async (ext: Extension) => {
    if (!confirm(`Are you sure you want to uninstall ${ext.name}? This will remove all extension data.`)) {
      return
    }

    toast.loading(`Removing ${ext.name}...`)

    const result = await apiDelete(`/api/extensions/${ext.id}`, {
      loading: `Removing ${ext.name}...`,
      success: `${ext.name} has been removed!`,
      error: `Failed to remove ${ext.name}`
    })

    if (result.success) {
      setExtensions(prev => prev.map(e =>
        e.id === ext.id ? { ...e, installStatus: 'not_installed' } : e
      ))
      if (selectedExtension?.id === ext.id) {
        setSelectedExtension(prev => prev ? { ...prev, installStatus: 'not_installed' } : null)
      }
    }
  }, [selectedExtension])

  // Enable extension
  const handleEnableExtension = useCallback(async (ext: Extension) => {
    toast.loading(`Enabling ${ext.name}...`)

    const result = await apiPost(`/api/extensions/${ext.id}/enable`, { enabled: true }, {
      loading: `Enabling ${ext.name}...`,
      success: `${ext.name} is now active`,
      error: `Failed to enable ${ext.name}`
    })

    if (result.success) {
      setExtensions(prev => prev.map(e =>
        e.id === ext.id ? { ...e, installStatus: 'installed' } : e
      ))
    }
  }, [])

  // Disable extension
  const handleDisableExtension = useCallback(async (ext: Extension) => {
    toast.loading(`Disabling ${ext.name}...`)

    const result = await apiPost(`/api/extensions/${ext.id}/disable`, { enabled: false }, {
      loading: `Disabling ${ext.name}...`,
      success: `${ext.name} has been disabled`,
      error: `Failed to disable ${ext.name}`
    })

    if (result.success) {
      setExtensions(prev => prev.map(e =>
        e.id === ext.id ? { ...e, installStatus: 'disabled' } : e
      ))
    }
  }, [])

  // Toggle extension enabled/disabled
  const handleToggleExtension = useCallback(async (ext: Extension) => {
    if (ext.installStatus === 'installed') {
      await handleDisableExtension(ext)
    } else if (ext.installStatus === 'disabled') {
      await handleEnableExtension(ext)
    }
  }, [handleEnableExtension, handleDisableExtension])

  // Open configure dialog
  const handleConfigureExtension = useCallback((ext: Extension) => {
    setConfigExtension(ext)
    setConfigDialogOpen(true)
    toast.info(`Opening ${ext.name} settings`)
  }, [])

  // Update extension
  const handleUpdateExtension = useCallback(async (ext: Extension) => {
    toast.loading(`Updating ${ext.name}...`)

    const result = await apiPost(`/api/extensions/${ext.id}/update`, {
      extensionId: ext.id
    }, {
      loading: `Updating ${ext.name}...`,
      success: `${ext.name} updated successfully!`,
      error: `Failed to update ${ext.name}`
    })

    if (result.success) {
      setExtensions(prev => prev.map(e =>
        e.id === ext.id ? { ...e, lastUpdated: new Date().toISOString().split('T')[0] } : e
      ))
    }
  }, [])

  // Check for updates
  const handleCheckUpdates = useCallback(async () => {
    toast.loading('Checking for updates...')

    const result = await apiPost('/api/extensions/check-updates', {
      extensionIds: extensions.filter(e => e.installStatus !== 'not_installed').map(e => e.id)
    }, {
      loading: 'Checking for extension updates...',
      success: 'All extensions are up to date!',
      error: 'Failed to check for updates'
    })

    return result.success
  }, [extensions])

  // Share extension link
  const handleShareExtension = useCallback(async (ext: Extension) => {
    const shareUrl = `${window.location.origin}/extensions/${ext.id}`
    await copyToClipboard(shareUrl, 'Extension link copied to clipboard!')
  }, [])

  // Report extension
  const handleReportExtension = useCallback(async (ext: Extension) => {
    const reason = prompt('Please describe the issue with this extension:')
    if (!reason) return

    const result = await apiPost('/api/extensions/report', {
      extensionId: ext.id,
      reason
    }, {
      loading: 'Submitting report...',
      success: 'Report submitted. Thank you for your feedback!',
      error: 'Failed to submit report'
    })

    return result.success
  }, [])

  // Clear cache
  const handleClearCache = useCallback(async () => {
    const result = await apiPost('/api/extensions/clear-cache', {}, {
      loading: 'Clearing extension cache...',
      success: 'Cache cleared successfully!',
      error: 'Failed to clear cache'
    })
    return result.success
  }, [])

  // Export extension data
  const handleExportData = useCallback(() => {
    const exportData = {
      extensions: extensions.filter(e => e.installStatus !== 'not_installed'),
      exportedAt: new Date().toISOString(),
      settings: { viewMode, categoryFilter }
    }
    downloadAsJson(exportData, 'extension-data.json')
  }, [extensions, viewMode, categoryFilter])

  // Import settings
  const handleImportSettings = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)
        toast.success('Settings imported successfully!')
      } catch {
        toast.error('Failed to import settings - invalid file format')
      }
    }
    input.click()
  }, [])

  // Export settings
  const handleExportSettings = useCallback(() => {
    const settings = {
      viewMode,
      categoryFilter,
      settingsTab,
      exportedAt: new Date().toISOString()
    }
    downloadAsJson(settings, 'extension-settings.json')
  }, [viewMode, categoryFilter, settingsTab])

  // Select folder for unpacked extension
  const handleSelectFolder = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.webkitdirectory = true
    input.onchange = async () => {
      toast.success('Folder selected! Loading unpacked extension...')
    }
    input.click()
  }, [])

  // Pack extension
  const handlePackExtension = useCallback(async () => {
    const result = await apiPost('/api/extensions/pack', {}, {
      loading: 'Packaging extension...',
      success: 'Extension packed successfully!',
      error: 'Failed to pack extension'
    })
    return result.success
  }, [])

  // Regenerate API key
  const handleRegenerateApiKey = useCallback(async () => {
    if (!confirm('Are you sure you want to regenerate your API key? The old key will be invalidated.')) {
      return
    }

    const result = await apiPost('/api/extensions/regenerate-key', {}, {
      loading: 'Regenerating API key...',
      success: 'New API key generated!',
      error: 'Failed to regenerate API key'
    })
    return result.success
  }, [])

  // Copy API key
  const handleCopyApiKey = useCallback(async () => {
    await copyToClipboard('ext_dev_sample_key_12345', 'API key copied to clipboard!')
  }, [])

  // View extension history
  const handleViewHistory = useCallback(async () => {
    const result = await apiPost('/api/extensions/history', {}, {
      loading: 'Loading extension history...',
      success: 'Extension history loaded!',
      error: 'Failed to load history'
    })
    return result.success
  }, [])

  // Disable all extensions
  const handleDisableAll = useCallback(async () => {
    if (!confirm('Are you sure you want to disable all extensions? They can be re-enabled later.')) {
      return
    }

    const result = await apiPost('/api/extensions/disable-all', {}, {
      loading: 'Disabling all extensions...',
      success: 'All extensions have been disabled!',
      error: 'Failed to disable extensions'
    })

    if (result.success) {
      setExtensions(prev => prev.map(e =>
        e.installStatus === 'installed' ? { ...e, installStatus: 'disabled' } : e
      ))
    }
  }, [])

  // Remove all extensions
  const handleRemoveAll = useCallback(async () => {
    if (!confirm('Are you sure you want to remove ALL extensions? This action cannot be undone.')) {
      return
    }

    const result = await apiDelete('/api/extensions/all', {
      loading: 'Removing all extensions...',
      success: 'All extensions have been removed!',
      error: 'Failed to remove extensions'
    })

    if (result.success) {
      setExtensions(prev => prev.map(e => ({ ...e, installStatus: 'not_installed' })))
    }
  }, [])

  // Reset to defaults
  const handleResetDefaults = useCallback(async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) {
      return
    }

    const result = await apiPost('/api/extensions/reset', {}, {
      loading: 'Resetting to defaults...',
      success: 'Settings reset to defaults!',
      error: 'Failed to reset settings'
    })

    if (result.success) {
      setViewMode('grid')
      setCategoryFilter('all')
      setSettingsTab('general')
    }
  }, [])

  // Open API documentation
  const handleOpenApiDocs = useCallback(() => {
    window.open('/docs/extensions-api', '_blank')
    toast.info('Opening API documentation...')
  }, [])

  // Submit new extension
  const handleSubmitExtension = useCallback(() => {
    window.open('/extensions/submit', '_blank')
    toast.info('Opening extension submission form...')
  }, [])

  // Open extension builder
  const handleOpenBuilder = useCallback(() => {
    window.open('/extensions/builder', '_blank')
    toast.info('Opening extension builder...')
  }, [])

  // Stats calculations
  const stats = useMemo(() => {
    const totalExtensions = extensions.length
    const installedCount = extensions.filter(e => e.installStatus === 'installed').length
    const totalInstalls = extensions.reduce((acc, e) => acc + e.installCount, 0)
    const featuredCount = extensions.filter(e => e.isFeatured).length
    const avgRating = extensions.reduce((acc, e) => acc + e.rating, 0) / totalExtensions
    const totalUsers = extensions.reduce((acc, e) => acc + e.weeklyUsers, 0)
    const editorsPickCount = extensions.filter(e => e.isEditorsPick).length
    const securityExtensions = extensions.filter(e => e.category === 'security').length

    return {
      totalExtensions,
      installedCount,
      totalInstalls,
      featuredCount,
      avgRating,
      totalUsers,
      editorsPickCount,
      securityExtensions
    }
  }, [extensions])

  // Filtered extensions
  const filteredExtensions = useMemo(() => {
    return extensions.filter(ext => {
      const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ext.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ext.developer.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || ext.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [extensions, searchQuery, categoryFilter])

  const installedExtensions = extensions.filter(e => e.installStatus === 'installed' || e.installStatus === 'disabled')
  const featuredExtensions = extensions.filter(e => e.isFeatured)
  const editorsPickExtensions = extensions.filter(e => e.isEditorsPick)

  // Empty arrays for competitive upgrade components (no mock data)
  const extensionsAIInsights: { id: string; type: 'success' | 'warning' | 'info' | 'error' | 'recommendation' | 'alert' | 'opportunity' | 'prediction'; title: string; description: string; priority: 'high' | 'medium' | 'low'; timestamp: string; category: string }[] = []

  // Transform team members to collaborators format
  const extensionsCollaborators = teamMembers.map(member => ({
    id: member.id,
    name: member.name,
    avatar: member.avatar_url || undefined,
    status: member.status === 'active' ? 'online' as const : member.status === 'on_leave' ? 'away' as const : 'offline' as const,
    role: member.role || 'Team Member'
  }))

  const extensionsPredictions: { id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down' | 'stable'; impact: string }[] = []

  // Transform activity logs to activities format
  const extensionsActivities = activityLogs.slice(0, 10).map(log => ({
    id: log.id,
    type: log.activity_type === 'create' ? 'create' as const : log.activity_type === 'update' ? 'update' as const : log.activity_type === 'delete' ? 'delete' as const : 'update' as const,
    title: log.action,
    user: {
      id: log.user_id || 'system',
      name: log.user_name || 'System',
      avatar: undefined
    },
    timestamp: log.created_at
  }))

  const extensionsQuickActions: { id: string; label: string; icon: React.ReactNode; action: () => void }[] = []

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50/30 to-blue-50/40 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Puzzle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Extensions</h1>
                <p className="text-sm text-muted-foreground">Chrome Web Store level marketplace</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search extensions..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex border rounded-lg">
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Button
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                onClick={handleSubmitExtension}
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit Extension
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Extensions', value: stats.totalExtensions.toString(), change: 12.5, icon: Puzzle, color: 'from-blue-500 to-cyan-500' },
            { label: 'Installed', value: stats.installedCount.toString(), change: 8.3, icon: Download, color: 'from-green-500 to-emerald-500' },
            { label: 'Total Installs', value: formatNumber(stats.totalInstalls), change: 25.0, icon: Users, color: 'from-purple-500 to-pink-500' },
            { label: 'Featured', value: stats.featuredCount.toString(), change: 5.0, icon: Star, color: 'from-yellow-500 to-orange-500' },
            { label: 'Avg Rating', value: stats.avgRating.toFixed(1), change: 2.5, icon: Award, color: 'from-orange-500 to-amber-500' },
            { label: 'Weekly Users', value: formatNumber(stats.totalUsers), change: 15.0, icon: TrendingUp, color: 'from-teal-500 to-cyan-500' },
            { label: 'Editor\'s Pick', value: stats.editorsPickCount.toString(), change: 10.0, icon: Verified, color: 'from-indigo-500 to-purple-500' },
            { label: 'Security', value: stats.securityExtensions.toString(), change: 8.0, icon: Shield, color: 'from-rose-500 to-pink-500' }
          ].map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger value="discover" className="gap-2">
              <Store className="w-4 h-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="installed" className="gap-2">
              <Download className="w-4 h-4" />
              Installed ({installedExtensions.length})
            </TabsTrigger>
            <TabsTrigger value="featured" className="gap-2">
              <Star className="w-4 h-4" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Layers className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="developer" className="gap-2">
              <Code className="w-4 h-4" />
              Developer
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            {/* Discover Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Extension Marketplace</h2>
                  <p className="text-violet-100">VS Code Marketplace-level extensibility</p>
                  <p className="text-violet-200 text-xs mt-1">Curated - Verified - Enterprise-ready</p>
                  <p className="text-violet-200 text-xs mt-1">Auto-updates - Sandboxed - Reviews</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{extensions.length}</p>
                    <p className="text-violet-200 text-sm">Extensions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{installedExtensions.length}</p>
                    <p className="text-violet-200 text-sm">Installed</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Button
                variant={categoryFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('all')}
              >
                All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={categoryFilter === cat.name.toLowerCase().replace(' & ', '_').replace(' ', '_') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(cat.name.toLowerCase().replace(' & ', '_').replace(' ', '_'))}
                  className="gap-1"
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </Button>
              ))}
            </div>

            {/* Editor's Picks */}
            {editorsPickExtensions.length > 0 && categoryFilter === 'all' && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Verified className="w-5 h-5 text-blue-500" />
                  Editor's Picks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {editorsPickExtensions.map((ext) => (
                    <Card key={ext.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedExtension(ext)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-2xl">
                            {ext.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <h3 className="font-semibold truncate">{ext.name}</h3>
                              {ext.developerVerified && <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{ext.developer}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{ext.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">{ext.rating}</span>
                            <span className="text-xs text-muted-foreground">({formatNumber(ext.reviewCount)})</span>
                          </div>
                          <Badge className={getInstallStatusColor(ext.installStatus)}>{ext.installStatus.replace('_', ' ')}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Extensions */}
            <div>
              <h2 className="text-xl font-bold mb-4">All Extensions</h2>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
                {filteredExtensions.map((ext) => (
                  <Card key={ext.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedExtension(ext)}>
                    <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-4 flex items-center gap-4'}>
                      <div className={`${viewMode === 'grid' ? 'flex items-start gap-3 mb-3' : 'flex items-center gap-3 flex-1'}`}>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-2xl flex-shrink-0">
                          {ext.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <h3 className="font-semibold truncate">{ext.name}</h3>
                            {ext.developerVerified && <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                            {ext.isFeatured && <Sparkles className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{ext.developer}</p>
                          {viewMode === 'list' && <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{ext.description}</p>}
                        </div>
                      </div>
                      {viewMode === 'grid' && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{ext.description}</p>
                      )}
                      <div className={`${viewMode === 'grid' ? '' : 'flex items-center gap-4'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getCategoryColor(ext.category)}>{ext.category}</Badge>
                          <span className="text-xs text-muted-foreground">{formatNumber(ext.installCount)} users</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">{ext.rating}</span>
                          </div>
                          {ext.installStatus === 'installed' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleConfigureExtension(ext)
                              }}
                            >
                              Manage
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleInstallExtension(ext)
                              }}
                            >
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Installed Tab */}
          <TabsContent value="installed" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Installed Extensions</h2>
                <p className="text-sm text-muted-foreground">Manage your installed extensions</p>
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleCheckUpdates}
              >
                <RefreshCw className="w-4 h-4" />
                Check for Updates
              </Button>
            </div>

            <div className="grid gap-4">
              {installedExtensions.map((ext) => (
                <Card key={ext.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-3xl">
                          {ext.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{ext.name}</h3>
                            {ext.developerVerified && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                            <Badge className={getInstallStatusColor(ext.installStatus)}>{ext.installStatus}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{ext.developer} - v{ext.version}</p>
                          <p className="text-sm text-muted-foreground mt-1">{ext.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{ext.size}</p>
                          <p className="text-xs text-muted-foreground">Updated {ext.lastUpdated}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={ext.installStatus === 'installed'}
                            onCheckedChange={() => handleToggleExtension(ext)}
                          />
                          <Button variant="ghost" size="icon" onClick={() => handleConfigureExtension(ext)}>
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600"
                            onClick={() => handleUninstallExtension(ext)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-2">
                        {ext.permissions.map((perm, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{perm}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Featured Tab */}
          <TabsContent value="featured" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredExtensions.map((ext) => (
                <Card key={ext.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedExtension(ext)}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-4xl">
                        {ext.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold">{ext.name}</h3>
                          {ext.developerVerified && <ShieldCheck className="w-5 h-5 text-blue-500" />}
                          {ext.isEditorsPick && <Badge className="bg-blue-100 text-blue-800">Editor's Pick</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{ext.developer}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{ext.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-xl font-bold">{formatNumber(ext.installCount)}</p>
                        <p className="text-xs text-muted-foreground">Users</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <p className="text-xl font-bold">{ext.rating}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatNumber(ext.reviewCount)} reviews</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-xl font-bold">{formatNumber(ext.weeklyUsers)}</p>
                        <p className="text-xs text-muted-foreground">Weekly</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {ext.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">#{tag}</Badge>
                        ))}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (ext.installStatus === 'installed') {
                            handleConfigureExtension(ext)
                          } else {
                            handleInstallExtension(ext)
                          }
                        }}
                      >
                        {ext.installStatus === 'installed' ? 'Manage' : 'Add to Chrome'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Card key={cat.id} className="cursor-pointer hover:shadow-md transition-shadow group">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                      {cat.icon}
                    </div>
                    <h3 className="font-semibold mb-1">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">{cat.count.toLocaleString()} extensions</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Developer Tab */}
          <TabsContent value="developer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Developer Dashboard
                  </CardTitle>
                  <CardDescription>Manage your published extensions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Published Extensions</p>
                  </div>
                  <Button
                    className="w-full gap-2"
                    onClick={handleOpenBuilder}
                  >
                    <Plus className="w-4 h-4" />
                    Create New Extension
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>Resources for extension developers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer"
                    onClick={() => window.open('/docs/extensions', '_blank')}
                  >
                    <span className="font-medium">Documentation</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer"
                    onClick={() => window.open('/docs/extensions-api', '_blank')}
                  >
                    <span className="font-medium">API Reference</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer"
                    onClick={() => window.open('/extensions/samples', '_blank')}
                  >
                    <span className="font-medium">Sample Extensions</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer"
                    onClick={() => window.open('/community/extensions', '_blank')}
                  >
                    <span className="font-medium">Developer Forum</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Extension Settings</h2>
                <p className="text-sm text-gray-500">Configure your extension platform preferences</p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Settings, label: 'General' },
                        { id: 'permissions', icon: Shield, label: 'Permissions' },
                        { id: 'notifications', icon: Bell, label: 'Notifications' },
                        { id: 'performance', icon: Gauge, label: 'Performance' },
                        { id: 'developer', icon: Code, label: 'Developer' },
                        { id: 'advanced', icon: Cpu, label: 'Advanced' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                            settingsTab === item.id
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
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
                          <Layout className="h-5 w-5" />
                          Display Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default View</Label>
                            <Select defaultValue="grid">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="grid">Grid View</SelectItem>
                                <SelectItem value="list">List View</SelectItem>
                                <SelectItem value="compact">Compact View</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Extensions Per Page</Label>
                            <Select defaultValue="20">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 extensions</SelectItem>
                                <SelectItem value="20">20 extensions</SelectItem>
                                <SelectItem value="50">50 extensions</SelectItem>
                                <SelectItem value="100">100 extensions</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show Ratings</div>
                            <div className="text-sm text-gray-500">Display star ratings on extension cards</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show Install Counts</div>
                            <div className="text-sm text-gray-500">Display user counts on extension cards</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show Verified Badges</div>
                            <div className="text-sm text-gray-500">Display developer verification badges</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Download className="h-5 w-5" />
                          Update Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Auto-update Extensions</div>
                            <div className="text-sm text-gray-500">Automatically install extension updates</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Update Check Frequency</Label>
                          <Select defaultValue="daily">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hourly">Every Hour</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="manual">Manual Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Pre-release Updates</div>
                            <div className="text-sm text-gray-500">Receive beta and pre-release updates</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          Regional Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Language</Label>
                            <Select defaultValue="en">
                              <SelectTrigger>
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
                          <div className="space-y-2">
                            <Label>Store Region</Label>
                            <Select defaultValue="us">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="us">United States</SelectItem>
                                <SelectItem value="uk">United Kingdom</SelectItem>
                                <SelectItem value="eu">Europe</SelectItem>
                                <SelectItem value="asia">Asia Pacific</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Permissions Settings */}
                {settingsTab === 'permissions' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Site Access Controls
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Click to Activate</div>
                            <div className="text-sm text-gray-500">Require manual activation on each site</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Site Access Warnings</div>
                            <div className="text-sm text-gray-500">Show warnings when accessing sensitive sites</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Block Extensions on Secure Sites</div>
                            <div className="text-sm text-gray-500">Disable extensions on banking and payment sites</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Default Site Access</Label>
                          <Select defaultValue="on_click">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all_sites">All Sites</SelectItem>
                              <SelectItem value="on_click">On Click Only</SelectItem>
                              <SelectItem value="specific">Specific Sites</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="h-5 w-5" />
                          Permission Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Review Permissions on Update</div>
                            <div className="text-sm text-gray-500">Show permission changes when extensions update</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Block High-Risk Permissions</div>
                            <div className="text-sm text-gray-500">Warn before installing extensions with sensitive permissions</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Incognito Mode Access</div>
                            <div className="text-sm text-gray-500">Allow extensions to run in incognito mode</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Fingerprint className="h-5 w-5" />
                          Privacy Controls
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Block Data Collection</div>
                            <div className="text-sm text-gray-500">Prevent extensions from collecting browsing data</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Extension Analytics</div>
                            <div className="text-sm text-gray-500">Share anonymous usage data to improve extensions</div>
                          </div>
                          <Switch />
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
                          <Bell className="h-5 w-5" />
                          Extension Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Update Available</div>
                            <div className="text-sm text-gray-500">Notify when extension updates are available</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Permission Changes</div>
                            <div className="text-sm text-gray-500">Alert when extensions request new permissions</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Security Alerts</div>
                            <div className="text-sm text-gray-500">Warn about compromised or malicious extensions</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">New Featured Extensions</div>
                            <div className="text-sm text-gray-500">Get notified about editor's picks</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          Email Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Weekly Store Digest</div>
                            <div className="text-sm text-gray-500">Receive weekly roundup of new extensions</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Developer Updates</div>
                            <div className="text-sm text-gray-500">News about your published extensions</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Review Responses</div>
                            <div className="text-sm text-gray-500">When developers reply to your reviews</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BellRing className="h-5 w-5" />
                          Push Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-3">
                            <BellRing className="h-6 w-6 text-purple-600" />
                            <div>
                              <div className="font-medium">Push Notifications</div>
                              <div className="text-sm text-gray-500">Enabled for this browser</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Critical Alerts Only</div>
                            <div className="text-sm text-gray-500">Only receive security-related notifications</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Performance Settings */}
                {settingsTab === 'performance' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cpu className="h-5 w-5" />
                          Resource Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">{installedExtensions.length}</div>
                            <div className="text-sm text-gray-500">Active</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">45 MB</div>
                            <div className="text-sm text-gray-500">Memory Used</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">12%</div>
                            <div className="text-sm text-gray-500">CPU Impact</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Lazy Loading</div>
                            <div className="text-sm text-gray-500">Only load extensions when needed</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Suspend Inactive Extensions</div>
                            <div className="text-sm text-gray-500">Pause extensions not used in 30 minutes</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Hardware Acceleration</div>
                            <div className="text-sm text-gray-500">Use GPU for extension rendering</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="h-5 w-5" />
                          Storage
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Extension Storage</span>
                            <span className="text-sm text-gray-500">156 MB of 500 MB</span>
                          </div>
                          <Progress value={31} className="h-2" />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleClearCache}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear Cache
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleExportData}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Export Data
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label>Storage Limit</Label>
                          <Select defaultValue="500">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100 MB</SelectItem>
                              <SelectItem value="250">250 MB</SelectItem>
                              <SelectItem value="500">500 MB</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Network className="h-5 w-5" />
                          Network
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Limit Background Data</div>
                            <div className="text-sm text-gray-500">Restrict extension network usage</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Offline Mode</div>
                            <div className="text-sm text-gray-500">Allow extensions to work without internet</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Developer Settings */}
                {settingsTab === 'developer' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          Developer Mode
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center gap-3">
                            <Code className="h-6 w-6 text-yellow-600" />
                            <div>
                              <div className="font-medium">Developer Mode</div>
                              <div className="text-sm text-gray-500">Load unpacked extensions</div>
                            </div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Load Unpacked</div>
                            <div className="text-sm text-gray-500">Load extensions from local directory</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectFolder}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Select Folder
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Pack Extension</div>
                            <div className="text-sm text-gray-500">Create distributable package</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePackExtension}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Pack
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ScanEye className="h-5 w-5" />
                          Debugging
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Service Worker Logging</div>
                            <div className="text-sm text-gray-500">Log background script activity</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Error Reporting</div>
                            <div className="text-sm text-gray-500">Show extension errors in console</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Network Inspection</div>
                            <div className="text-sm text-gray-500">Monitor extension network requests</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-5 w-5" />
                          API Access
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium">Developer API Key</div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRegenerateApiKey}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Regenerate
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white dark:bg-gray-900 px-3 py-2 rounded border text-sm">
                              ext_dev_sample_key_12345
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCopyApiKey}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleOpenApiDocs}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View API Documentation
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
                          <Database className="h-5 w-5" />
                          Data Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">{extensions.length}</div>
                            <div className="text-sm text-gray-500">Extensions</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">{installedExtensions.length}</div>
                            <div className="text-sm text-gray-500">Installed</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">156 MB</div>
                            <div className="text-sm text-gray-500">Storage</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleExportSettings}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export Settings
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleImportSettings}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Import Settings
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <History className="h-5 w-5" />
                          Extension History
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Keep Installation History</div>
                            <div className="text-sm text-gray-500">Track installed and removed extensions</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>History Retention</Label>
                          <Select defaultValue="90">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleViewHistory}
                        >
                          <History className="h-4 w-4 mr-2" />
                          View Full History
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Disable All Extensions</div>
                            <div className="text-sm text-gray-500">Temporarily disable all installed extensions</div>
                          </div>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={handleDisableAll}
                          >
                            <Unplug className="h-4 w-4 mr-2" />
                            Disable
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Remove All Extensions</div>
                            <div className="text-sm text-gray-500">Uninstall all extensions permanently</div>
                          </div>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={handleRemoveAll}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove All
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Reset to Defaults</div>
                            <div className="text-sm text-gray-500">Reset all extension settings to defaults</div>
                          </div>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={handleResetDefaults}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
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
            
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={extensionsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={extensionsPredictions}
              title="Extension Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          <QuickActionsToolbar
            actions={extensionsQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Extension Detail Dialog */}
      <Dialog open={!!selectedExtension} onOpenChange={() => setSelectedExtension(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl">{selectedExtension?.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  {selectedExtension?.name}
                  {selectedExtension?.developerVerified && <ShieldCheck className="w-5 h-5 text-blue-500" />}
                </div>
                <p className="text-sm font-normal text-muted-foreground">{selectedExtension?.developer}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selectedExtension && (
              <div className="space-y-6 p-4">
                <div className="flex items-center gap-3">
                  <Badge className={getCategoryColor(selectedExtension.category)}>{selectedExtension.category}</Badge>
                  <Badge className={getInstallStatusColor(selectedExtension.installStatus)}>{selectedExtension.installStatus.replace('_', ' ')}</Badge>
                  {selectedExtension.isFeatured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
                  {selectedExtension.isEditorsPick && <Badge className="bg-blue-100 text-blue-800">Editor's Pick</Badge>}
                </div>

                <p className="text-muted-foreground">{selectedExtension.longDescription}</p>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold">{formatNumber(selectedExtension.installCount)}</p>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <p className="text-2xl font-bold">{selectedExtension.rating}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatNumber(selectedExtension.reviewCount)} reviews</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold">{formatNumber(selectedExtension.weeklyUsers)}</p>
                    <p className="text-xs text-muted-foreground">Weekly Users</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold">{selectedExtension.size}</p>
                    <p className="text-xs text-muted-foreground">Size</p>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-semibold mb-3">Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                    {selectedExtension.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="font-semibold mb-3">Permissions</h3>
                  <div className="space-y-2">
                    {selectedExtension.permissions.map((perm, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{perm}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews */}
                <div>
                  <h3 className="font-semibold mb-3">Reviews</h3>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{review.userName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{review.userName}</p>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{review.createdAt}</span>
                        </div>
                        <p className="font-medium text-sm mb-1">{review.title}</p>
                        <p className="text-sm text-muted-foreground">{review.content}</p>
                        {review.developerReply && (
                          <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs font-medium mb-1">Developer Reply</p>
                            <p className="text-sm">{review.developerReply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  {selectedExtension.installStatus === 'installed' ? (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleConfigureExtension(selectedExtension)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Options
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-red-600"
                        onClick={() => handleUninstallExtension(selectedExtension)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="flex-1"
                      onClick={() => handleInstallExtension(selectedExtension)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Add to Chrome
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleShareExtension(selectedExtension)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReportExtension(selectedExtension)}
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Extension Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Settings className="w-5 h-5" />
              {configExtension?.name} Settings
            </DialogTitle>
          </DialogHeader>
          {configExtension && (
            <div className="space-y-6 p-4">
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <span className="text-3xl">{configExtension.icon}</span>
                <div>
                  <h3 className="font-semibold">{configExtension.name}</h3>
                  <p className="text-sm text-muted-foreground">v{configExtension.version}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium">Enable Extension</div>
                    <div className="text-sm text-gray-500">Turn this extension on or off</div>
                  </div>
                  <Switch
                    checked={configExtension.installStatus === 'installed'}
                    onCheckedChange={() => handleToggleExtension(configExtension)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium">Run in Incognito</div>
                    <div className="text-sm text-gray-500">Allow in private browsing mode</div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium">Site Access</div>
                    <div className="text-sm text-gray-500">Control which sites can use this extension</div>
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sites</SelectItem>
                      <SelectItem value="click">On Click</SelectItem>
                      <SelectItem value="specific">Specific Sites</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleUpdateExtension(configExtension)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check for Updates
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600"
                  onClick={() => {
                    handleUninstallExtension(configExtension)
                    setConfigDialogOpen(false)
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Uninstall
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
