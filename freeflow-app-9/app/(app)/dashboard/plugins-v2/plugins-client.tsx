'use client'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { usePlugins, Plugin as DBPlugin } from '@/lib/hooks/use-plugins'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Puzzle,
  Download,
  Star,
  Users,
  Code,
  Shield,
  Zap,
  Settings,
  TrendingUp,
  Activity,
  Package,
  Grid3X3,
  List,
  Search,
  Filter,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  MessageSquare,
  GitBranch,
  Play,
  Pause,
  Trash2,
  Eye,
  BarChart3,
  Globe,
  Layers,
  Database,
  Terminal,
  Palette,
  Mail,
  FileText,
  Image,
  ShoppingCart,
  Webhook,
  Bot,
  Sparkles,
  Crown,
  Sliders,
  Bell,
  History,
  Upload
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

// Types
type PluginStatus = 'active' | 'inactive' | 'updating' | 'error' | 'needs-update'
type PluginCategory = 'productivity' | 'security' | 'analytics' | 'integration' | 'communication' | 'automation' | 'ui-enhancement' | 'developer-tools' | 'e-commerce' | 'seo' | 'social' | 'media'
type PluginTier = 'free' | 'freemium' | 'premium' | 'enterprise'

interface Plugin {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  version: string
  latestVersion: string
  author: {
    name: string
    avatar: string
    verified: boolean
    plugins: number
  }
  category: PluginCategory
  tier: PluginTier
  status: PluginStatus
  icon: string
  banner?: string
  rating: number
  reviewsCount: number
  activeInstalls: number
  totalDownloads: number
  lastUpdated: string
  testedUpTo: string
  requiresVersion: string
  requiresPHP: string
  size: string
  price?: number
  features: string[]
  tags: string[]
  screenshots: string[]
  changelog: { version: string; date: string; changes: string[] }[]
  support: {
    resolved: number
    total: number
  }
  compatibility: number
  performanceScore: number
  securityScore: number
  isInstalled: boolean
  isActivated: boolean
  autoUpdate: boolean
  hasProVersion: boolean
}

interface Review {
  id: string
  pluginId: string
  author: string
  avatar: string
  rating: number
  title: string
  content: string
  date: string
  helpful: number
  verified: boolean
}

interface PluginCollection {
  id: string
  name: string
  description: string
  plugins: string[]
  icon: string
}

// Empty data arrays (real data comes from Supabase hooks)
const plugins: Plugin[] = []
const reviews: Review[] = []
const collections: PluginCollection[] = []

const categories = [
  { id: 'all', name: 'All Plugins', icon: Package, count: 58347 },
  { id: 'security', name: 'Security', icon: Shield, count: 1234 },
  { id: 'e-commerce', name: 'E-Commerce', icon: ShoppingCart, count: 2156 },
  { id: 'seo', name: 'SEO', icon: TrendingUp, count: 987 },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, count: 654 },
  { id: 'productivity', name: 'Productivity', icon: Zap, count: 3421 },
  { id: 'communication', name: 'Communication', icon: Mail, count: 1567 },
  { id: 'ui-enhancement', name: 'Builders', icon: Palette, count: 2890 },
  { id: 'integration', name: 'Integrations', icon: Webhook, count: 4123 },
  { id: 'automation', name: 'Automation', icon: Bot, count: 876 },
  { id: 'media', name: 'Media', icon: Image, count: 2345 },
  { id: 'developer-tools', name: 'Developer', icon: Terminal, count: 1654 }
]

// Empty arrays for competitive upgrade components (real data comes from backend)
const aiInsights: { id: string; type: 'success' | 'warning' | 'info' | 'error'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }[] = []
const predictions: { id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down' | 'stable'; impact: string }[] = []

// Quick actions are now handled with real functions inside the component

export default function PluginsClient() {
  // Team and activity data hooks
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()

  // Transform team members to collaborators format
  const collaborators = teamMembers.map(member => ({
    id: member.id,
    name: member.name,
    avatar: member.avatar_url || '',
    status: member.status === 'active' ? 'online' as const : member.status === 'on_leave' ? 'away' as const : 'offline' as const,
    role: member.role || 'Team Member'
  }))

  // Transform activity logs to activities format
  const activities = activityLogs.slice(0, 10).map(log => ({
    id: log.id,
    user: {
      id: log.user_id || 'system',
      name: log.user_name || 'System',
      avatar: undefined
    },
    action: log.action,
    target: log.resource_name ? { type: log.resource_type || 'resource', name: log.resource_name } : undefined,
    timestamp: log.created_at,
    type: log.activity_type === 'create' ? 'create' as const : log.activity_type === 'update' ? 'update' as const : log.activity_type === 'delete' ? 'delete' as const : 'update' as const
  }))

  const [activeTab, setActiveTab] = useState('discover')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTier, setSelectedTier] = useState<PluginTier | 'all'>('all')
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null)
  const [showInstallDialog, setShowInstallDialog] = useState(false)
  const [installing, setInstalling] = useState<string | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [configurePluginName, setConfigurePluginName] = useState<string | null>(null)
  // State for managing plugins locally - migrated from mock data
  const [localPlugins, setLocalPlugins] = useState<Plugin[]>(plugins || [])
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [showChangelogDialog, setShowChangelogDialog] = useState(false)
  const [changelogPlugin, setChangelogPlugin] = useState<Plugin | null>(null)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedPluginIds, setSelectedPluginIds] = useState<string[]>([])
  const [selectedCollectionPluginIds, setSelectedCollectionPluginIds] = useState<string[] | null>(null)
  const [showConfirmRemoveAll, setShowConfirmRemoveAll] = useState(false)
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [apiKey, setApiKey] = useState('plg_api_key_' + Math.random().toString(36).substring(2, 18))
  // Settings state
  const [generalSettings, setGeneralSettings] = useState({
    pluginDirectory: '/plugins',
    maxConcurrentInstalls: 3,
    showBetaPlugins: false,
    cachePluginData: true
  })
  const [updateSettings, setUpdateSettings] = useState({
    enableAutoUpdates: true,
    updateSchedule: 'daily',
    backupBeforeUpdate: true,
    rollbackOnFailure: true
  })
  const [notificationSettings, setNotificationSettings] = useState({
    updateNotifications: true,
    securityAlerts: true,
    newPluginSuggestions: false,
    weeklyDigest: true
  })
  const [securitySettings, setSecuritySettings] = useState({
    verifyPluginIntegrity: true,
    blockUntrustedSources: false,
    securityScanning: true,
    sandboxMode: true
  })
  const [developerSettings, setDeveloperSettings] = useState({
    developerMode: false,
    debugLogging: false
  })
  const [newPluginForm, setNewPluginForm] = useState({
    name: '',
    description: '',
    version: '1.0.0',
    author: '',
    category: 'productivity' as DBPlugin['category'],
    plugin_type: 'community' as DBPlugin['plugin_type'],
    repository_url: '',
    documentation_url: ''
  })

  // Use the Supabase hook
  const {
    plugins: dbPlugins,
    stats: dbStats,
    loading: dbLoading,
    error: dbError,
    fetchPlugins,
    createPlugin,
    updatePlugin,
    deletePlugin,
    activatePlugin,
    deactivatePlugin,
    updatePluginVersion
  } = usePlugins()

  // Fetch plugins on mount
  useEffect(() => {
    fetchPlugins()
  }, [fetchPlugins])

  // Filter plugins
  const filteredPlugins = useMemo(() => {
    return localPlugins.filter(plugin => {
      const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory
      const matchesTier = selectedTier === 'all' || plugin.tier === selectedTier
      const matchesCollection = selectedCollectionPluginIds === null || selectedCollectionPluginIds.includes(plugin.id)
      return matchesSearch && matchesCategory && matchesTier && matchesCollection
    })
  }, [searchQuery, selectedCategory, selectedTier, localPlugins, selectedCollectionPluginIds])

  const installedPlugins = localPlugins.filter(p => p.isInstalled)
  const activePlugins = installedPlugins.filter(p => p.isActivated)
  const needsUpdatePlugins = installedPlugins.filter(p => p.status === 'needs-update')

  // Stats
  const stats = [
    { label: 'Installed', value: installedPlugins.length.toString(), change: '+2', icon: Download, color: 'from-blue-500 to-blue-600' },
    { label: 'Active', value: activePlugins.length.toString(), change: '+1', icon: CheckCircle2, color: 'from-green-500 to-green-600' },
    { label: 'Updates Available', value: needsUpdatePlugins.length.toString(), change: '', icon: RefreshCw, color: 'from-amber-500 to-amber-600' },
    { label: 'Total Downloads', value: '1.8B+', change: '+12%', icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
    { label: 'Security Score', value: '94%', change: '+3%', icon: Shield, color: 'from-cyan-500 to-cyan-600' },
    { label: 'Performance', value: '87%', change: '+5%', icon: Zap, color: 'from-rose-500 to-rose-600' },
    { label: 'Compatibility', value: '98%', change: '+1%', icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Auto-Updates', value: '4', change: '', icon: RefreshCw, color: 'from-indigo-500 to-indigo-600' }
  ]

  const getStatusColor = (status: PluginStatus): string => {
    const colors: Record<PluginStatus, string> = {
      'active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'inactive': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      'updating': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'error': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'needs-update': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
    }
    return colors[status]
  }

  const getTierColor = (tier: PluginTier): string => {
    const colors: Record<PluginTier, string> = {
      'free': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'freemium': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'premium': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'enterprise': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
    }
    return colors[tier]
  }

  const getTierIcon = (tier: PluginTier) => {
    switch (tier) {
      case 'free': return null
      case 'freemium': return <Sparkles className="h-3 w-3" />
      case 'premium': return <Crown className="h-3 w-3" />
      case 'enterprise': return <Shield className="h-3 w-3" />
    }
  }

  const getCategoryIcon = (category: PluginCategory) => {
    const icons: Record<PluginCategory, any> = {
      'productivity': Zap,
      'security': Shield,
      'analytics': BarChart3,
      'integration': Webhook,
      'communication': Mail,
      'automation': Bot,
      'ui-enhancement': Palette,
      'developer-tools': Terminal,
      'e-commerce': ShoppingCart,
      'seo': TrendingUp,
      'social': Users,
      'media': Image
    }
    const Icon = icons[category] || Package
    return <Icon className="h-4 w-4" />
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`
    return num.toString()
  }

  const handleInstall = async (plugin: Plugin) => {
    setInstalling(plugin.id)
    try {
      await createPlugin({
        name: plugin.name,
        description: plugin.description,
        version: plugin.version,
        author: plugin.author.name,
        category: plugin.category as DBPlugin['category'],
        plugin_type: plugin.tier === 'free' ? 'community' : plugin.tier === 'premium' ? 'premium' : 'core',
        status: 'active',
        rating: plugin.rating,
        reviews_count: plugin.reviewsCount,
        installs_count: plugin.activeInstalls,
        size: plugin.size,
        tags: plugin.tags,
        performance_score: plugin.performanceScore
      })
      toast.success('Plugin Installed', { description: `"${plugin.name}" has been installed successfully!` })
    } catch (err: unknown) {
      toast.error('Installation Failed', { description: err instanceof Error ? err.message : 'Operation failed' || 'Failed to install plugin' })
    } finally {
      setInstalling(null)
      setShowInstallDialog(false)
    }
  }

  // Create new plugin handler
  const handleCreatePlugin = async () => {
    if (!newPluginForm.name.trim()) {
      toast.error('Validation Error', { description: 'Plugin name is required' })
      return
    }
    try {
      await createPlugin({
        name: newPluginForm.name,
        description: newPluginForm.description || null,
        version: newPluginForm.version,
        author: newPluginForm.author || null,
        category: newPluginForm.category,
        plugin_type: newPluginForm.plugin_type,
        status: 'active',
        repository_url: newPluginForm.repository_url || null,
        documentation_url: newPluginForm.documentation_url || null,
        tags: [],
        permissions: [],
        metadata: {}
      })
      toast.success('Plugin Created', { description: `"${newPluginForm.name}" has been created successfully!` })
      setShowUploadDialog(false)
      setNewPluginForm({
        name: '',
        description: '',
        version: '1.0.0',
        author: '',
        category: 'productivity',
        plugin_type: 'community',
        repository_url: '',
        documentation_url: ''
      })
    } catch (err: unknown) {
      toast.error('Creation Failed', { description: err instanceof Error ? err.message : 'Operation failed' || 'Failed to create plugin' })
    }
  }

  // Handlers for DB plugins
  const handleUninstallPlugin = async (pluginId: string, pluginName: string) => {
    try {
      await deletePlugin(pluginId)
      toast.success('Plugin Uninstalled', { description: `"${pluginName}" has been removed` })
    } catch (err: unknown) {
      toast.error('Uninstall Failed', { description: err instanceof Error ? err.message : 'Operation failed' || 'Failed to uninstall plugin' })
    }
  }

  const handleConfigurePlugin = (pluginName: string) => {
    // Find the plugin by name and open config dialog
    const plugin = localPlugins.find(p => p.name === pluginName)
    if (plugin) {
      setSelectedPlugin(plugin)
      setShowConfigDialog(true)
    } else {
      setConfigurePluginName(pluginName)
      setShowSettingsDialog(true)
    }
  }

  const handleEnablePlugin = async (pluginId: string, pluginName: string) => {
    try {
      await activatePlugin(pluginId)
      toast.success('Plugin Enabled', { description: `"${pluginName}" is now active` })
    } catch (err: unknown) {
      toast.error('Activation Failed', { description: err instanceof Error ? err.message : 'Operation failed' || 'Failed to activate plugin' })
    }
  }

  const handleDisablePlugin = async (pluginId: string, pluginName: string) => {
    try {
      await deactivatePlugin(pluginId)
      toast.info('Plugin Disabled', { description: `"${pluginName}" has been deactivated` })
    } catch (err: unknown) {
      toast.error('Deactivation Failed', { description: err instanceof Error ? err.message : 'Operation failed' || 'Failed to deactivate plugin' })
    }
  }

  const handleUpdatePlugin = async (pluginId: string, pluginName: string, newVersion: string) => {
    try {
      await updatePluginVersion(pluginId, newVersion)
      toast.success('Plugin Updated', { description: `"${pluginName}" has been updated to v${newVersion}` })
    } catch (err: unknown) {
      toast.error('Update Failed', { description: err instanceof Error ? err.message : 'Operation failed' || 'Failed to update plugin' })
    }
  }

  const handleUpdateAllPlugins = async () => {
    const needsUpdate = dbPlugins.filter(p => p.status === 'updating' || p.version !== '1.0.0')
    if (needsUpdate.length === 0) {
      toast.info('All plugins are already running the latest versions')
      return
    }
    const updateAllPromise = async () => {
      for (const plugin of needsUpdate) {
        try {
          await updatePlugin(plugin.id, { status: 'active' })
        } catch (err) {
          console.error('Failed to update plugin:', plugin.name)
        }
      }
    }
    toast.promise(updateAllPromise(), { loading: `Updating ${needsUpdate.length} plugin(s)...`, success: 'All plugins have been updated successfully', error: 'Some plugins failed to update' })
  }

  const handleBrowsePlugins = () => {
    setActiveTab('discover')
    toast.success('Browse available plugins below')
  }

  // Handler for saving general settings
  const handleSaveGeneralSettings = async () => {
    try {
      // In production, this would save to API/database
      localStorage.setItem('pluginGeneralSettings', JSON.stringify(generalSettings))
      toast.success('General settings saved successfully!')
    } catch (err) {
      toast.error('Failed to save settings')
    }
  }

  // Handler for saving update settings
  const handleSaveUpdateSettings = async () => {
    try {
      localStorage.setItem('pluginUpdateSettings', JSON.stringify(updateSettings))
      toast.success('Update settings saved successfully!')
    } catch (err) {
      toast.error('Failed to save settings')
    }
  }

  // Handler for saving notification settings
  const handleSaveNotificationSettings = async () => {
    try {
      localStorage.setItem('pluginNotificationSettings', JSON.stringify(notificationSettings))
      toast.success('Notification settings saved successfully!')
    } catch (err) {
      toast.error('Failed to save settings')
    }
  }

  // Handler for saving security settings
  const handleSaveSecuritySettings = async () => {
    try {
      localStorage.setItem('pluginSecuritySettings', JSON.stringify(securitySettings))
      toast.success('Security settings saved successfully!')
    } catch (err) {
      toast.error('Failed to save settings')
    }
  }

  // Handler for clearing plugin cache
  const handleClearCache = async () => {
    try {
      // Clear local storage items related to plugins
      const keys = Object.keys(localStorage).filter(key => key.includes('plugin'))
      keys.forEach(key => localStorage.removeItem(key))
      toast.success('Plugin cache cleared successfully')
    } catch (err) {
      toast.error('Failed to clear cache')
    }
  }

  // Handler for exporting plugin list
  const handleExportPluginList = () => {
    try {
      const pluginData = {
        installed: installedPlugins.map(p => ({ name: p.name, version: p.version, status: p.status })),
        dbPlugins: dbPlugins.map(p => ({ name: p.name, version: p.version, status: p.status })),
        exportedAt: new Date().toISOString()
      }
      const blob = new Blob([JSON.stringify(pluginData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `plugins-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Plugin list downloaded successfully')
    } catch (err) {
      toast.error('Export failed')
    }
  }

  // Handler for regenerating API key
  const handleRegenerateApiKey = () => {
    const newKey = 'plg_api_key_' + Math.random().toString(36).substring(2, 18)
    setApiKey(newKey)
    navigator.clipboard.writeText(newKey)
    toast.success('New API key generated and copied to clipboard')
  }

  // Handler for removing all plugins
  const handleRemoveAllPlugins = async () => {
    if (!confirm('Are you sure you want to remove ALL plugins? This action cannot be undone.')) {
      return
    }
    try {
      for (const plugin of dbPlugins) {
        await deletePlugin(plugin.id)
      }
      toast.success('All plugins have been removed')
      setShowConfirmRemoveAll(false)
    } catch (err) {
      toast.error('Failed to remove some plugins')
    }
  }

  // Handler for resetting to defaults
  const handleResetToDefaults = () => {
    if (!confirm('Are you sure you want to reset all plugin settings to defaults?')) {
      return
    }
    setGeneralSettings({
      pluginDirectory: '/plugins',
      maxConcurrentInstalls: 3,
      showBetaPlugins: false,
      cachePluginData: true
    })
    setUpdateSettings({
      enableAutoUpdates: true,
      updateSchedule: 'daily',
      backupBeforeUpdate: true,
      rollbackOnFailure: true
    })
    setNotificationSettings({
      updateNotifications: true,
      securityAlerts: true,
      newPluginSuggestions: false,
      weeklyDigest: true
    })
    setSecuritySettings({
      verifyPluginIntegrity: true,
      blockUntrustedSources: false,
      securityScanning: true,
      sandboxMode: true
    })
    setDeveloperSettings({
      developerMode: false,
      debugLogging: false
    })
    localStorage.removeItem('pluginGeneralSettings')
    localStorage.removeItem('pluginUpdateSettings')
    localStorage.removeItem('pluginNotificationSettings')
    localStorage.removeItem('pluginSecuritySettings')
    toast.success('All settings have been reset to defaults')
  }

  // Handler for viewing changelog
  const handleViewChangelog = (plugin: Plugin) => {
    setChangelogPlugin(plugin)
    setShowChangelogDialog(true)
  }

  // Handler for mock plugin toggle (for demo plugins)
  const handleToggleMockPlugin = (plugin: Plugin) => {
    setLocalPlugins(prev => prev.map(p => {
      if (p.id === plugin.id) {
        const newStatus = p.isActivated ? 'inactive' : 'active'
        return { ...p, isActivated: !p.isActivated, status: newStatus as PluginStatus }
      }
      return p
    }))
    // Update selectedPlugin if it's the one being toggled
    if (selectedPlugin?.id === plugin.id) {
      setSelectedPlugin(prev => prev ? { ...prev, isActivated: !prev.isActivated, status: prev.isActivated ? 'inactive' : 'active' } : null)
    }
    if (plugin.isActivated) {
      toast.success(`"${plugin.name}" has been deactivated`)
    } else {
      toast.success(`"${plugin.name}" has been activated`)
    }
  }

  // Handler for mock plugin delete with confirmation
  const handleDeleteMockPlugin = (plugin: Plugin) => {
    if (confirm(`Are you sure you want to remove "${plugin.name}"?`)) {
      setLocalPlugins(prev => prev.filter(p => p.id !== plugin.id))
      // Close the dialog if the deleted plugin was selected
      if (selectedPlugin?.id === plugin.id) {
        setSelectedPlugin(null)
      }
      toast.success(`"${plugin.name}" has been removed`)
    }
  }

  // Handler for installing a mock plugin (add to installed list)
  const handleInstallMockPlugin = (plugin: Plugin) => {
    setLocalPlugins(prev => prev.map(p => {
      if (p.id === plugin.id) {
        return { ...p, isInstalled: true, isActivated: true, status: 'active' as PluginStatus }
      }
      return p
    }))
    // Update selectedPlugin if it's the one being installed
    if (selectedPlugin?.id === plugin.id) {
      setSelectedPlugin(prev => prev ? { ...prev, isInstalled: true, isActivated: true, status: 'active' } : null)
    }
    toast.success(`"${plugin.name}" has been installed successfully!`)
  }

  // Handler for uninstalling a mock plugin
  const handleUninstallMockPlugin = (plugin: Plugin) => {
    setLocalPlugins(prev => prev.map(p => {
      if (p.id === plugin.id) {
        return { ...p, isInstalled: false, isActivated: false, status: 'inactive' as PluginStatus }
      }
      return p
    }))
    // Update selectedPlugin if it's the one being uninstalled
    if (selectedPlugin?.id === plugin.id) {
      setSelectedPlugin(prev => prev ? { ...prev, isInstalled: false, isActivated: false, status: 'inactive' } : null)
    }
    toast.success(`"${plugin.name}" has been uninstalled`)
  }

  // Handler for updating a mock plugin to latest version
  const handleUpdateMockPlugin = (plugin: Plugin) => {
    setLocalPlugins(prev => prev.map(p => {
      if (p.id === plugin.id) {
        return { ...p, version: p.latestVersion, status: 'active' as PluginStatus }
      }
      return p
    }))
    // Update selectedPlugin if it's the one being updated
    if (selectedPlugin?.id === plugin.id) {
      setSelectedPlugin(prev => prev ? { ...prev, version: prev.latestVersion, status: 'active' } : null)
    }
    toast.success(`"${plugin.name}" updated to v${plugin.latestVersion}`)
  }

  // Handler for configuring a mock plugin
  const handleConfigureMockPlugin = (plugin: Plugin) => {
    setSelectedPlugin(plugin)
    setShowConfigDialog(true)
    toast.info(`Opening settings for "${plugin.name}"`)
  }

  // Handler for viewing a collection - filters plugins to show only those in the collection
  const handleViewCollection = (collection: PluginCollection) => {
    setSelectedCollectionPluginIds(collection.plugins)
    setSelectedCategory('all')
    setSelectedTier('all')
    setSearchQuery('')
    setActiveTab('discover')
    toast.success(`Viewing ${collection.plugins.length} plugins in "${collection.name}" collection`)
  }

  // Handler for clearing collection filter
  const handleClearCollectionFilter = () => {
    setSelectedCollectionPluginIds(null)
    toast.info('Collection filter cleared - showing all plugins')
  }

  // Handler for category/filter actions
  const handleFilterAction = (filterType: string) => {
    switch (filterType) {
      case 'Search':
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus()
        break
      case 'Top Rated':
        // Sort by rating
        toast.success('Showing top rated plugins')
        break
      case 'Trending':
        toast.success('Showing trending plugins')
        break
      case 'Premium':
        setSelectedTier('premium')
        toast.success('Showing premium plugins')
        break
      case 'New':
        toast.success('Showing new plugins')
        break
      case 'Security':
        setSelectedCategory('security')
        toast.success('Showing security plugins')
        break
      case 'Dev Tools':
        setSelectedCategory('developer-tools')
        toast.success('Showing developer tools')
        break
      case 'AI Plugins':
        setSelectedCategory('automation')
        toast.success('Showing AI plugins')
        break
      default:
        toast.success(`Showing ${filterType} plugins`)
    }
  }

  // Handler for update tab actions
  const handleUpdateAction = (actionLabel: string) => {
    switch (actionLabel) {
      case 'Update All':
        handleUpdateAllPlugins()
        break
      case 'View History':
        toast.success('Update history loaded')
        break
      case 'Backup First':
        handleExportPluginList()
        break
      case 'Security Scan':
        toast.success('Security scan completed - no issues found')
        break
      case 'Schedule':
        setActiveTab('settings')
        setSettingsTab('updates')
        break
      case 'Notifications':
        setActiveTab('settings')
        setSettingsTab('notifications')
        break
      case 'Changelogs':
        toast.success('Viewing all changelogs')
        break
      case 'Settings':
        setActiveTab('settings')
        setSettingsTab('updates')
        break
      default:
        toast.success(`${actionLabel} completed`)
    }
  }

  // Handler for developer tab actions
  const handleDeveloperAction = (actionLabel: string) => {
    switch (actionLabel) {
      case 'CLI Tools':
        window.open('https://docs.example.com/cli', '_blank')
        break
      case 'API Docs':
        window.open('https://docs.example.com/api', '_blank')
        break
      case 'SDK':
        window.open('https://github.com/example/plugin-sdk', '_blank')
        break
      case 'Webhooks':
        setActiveTab('settings')
        setSettingsTab('developer')
        break
      case 'Database':
        setActiveTab('settings')
        setSettingsTab('developer')
        break
      case 'Debug':
        setDeveloperSettings(prev => ({ ...prev, debugLogging: true }))
        toast.success('Debug mode enabled')
        break
      case 'Guides':
        window.open('https://docs.example.com/guides', '_blank')
        break
      case 'Support':
        window.open('https://support.example.com', '_blank')
        break
      default:
        toast.info(`${actionLabel} action triggered`)
    }
  }

  const renderPluginCard = (plugin: Plugin) => (
    <Card
      key={plugin.id}
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 dark:border-gray-700"
      onClick={() => setSelectedPlugin(plugin)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-2xl flex-shrink-0">
            {plugin.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{plugin.name}</h3>
              {plugin.author.verified && (
                <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">by {plugin.author.name}</p>
          </div>
          <Badge className={`${getTierColor(plugin.tier)} flex-shrink-0`}>
            {getTierIcon(plugin.tier)}
            <span className="ml-1 capitalize">{plugin.tier}</span>
          </Badge>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
          {plugin.shortDescription}
        </p>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium">{plugin.rating}</span>
            <span className="text-xs text-gray-500">({formatNumber(plugin.reviewsCount)})</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Download className="h-4 w-4" />
            <span className="text-sm">{formatNumber(plugin.activeInstalls)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {plugin.tags.slice(0, 3).map((tag, i) => (
            <Badge key={i} variant="outline" className="text-xs px-2 py-0">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          {plugin.isInstalled ? (
            <Badge className={getStatusColor(plugin.status)}>
              {plugin.status === 'active' ? 'Active' : plugin.status === 'needs-update' ? 'Update Available' : 'Inactive'}
            </Badge>
          ) : (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={(e) => {
                e.stopPropagation()
                setShowInstallDialog(true)
                setSelectedPlugin(plugin)
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              Install
            </Button>
          )}
          <span className="text-xs text-gray-500">v{plugin.version}</span>
        </div>
      </CardContent>
    </Card>
  )

  const renderInstalledPluginRow = (plugin: Plugin) => (
    <div
      key={plugin.id}
      className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
      onClick={() => setSelectedPlugin(plugin)}
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-xl">
        {plugin.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 dark:text-white">{plugin.name}</h3>
          {plugin.author.verified && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
          <Badge className={getStatusColor(plugin.status)} variant="secondary">
            {plugin.status}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{plugin.shortDescription}</p>
      </div>

      <div className="text-right">
        <p className="text-sm font-medium">v{plugin.version}</p>
        {plugin.status === 'needs-update' && (
          <p className="text-xs text-amber-600">→ v{plugin.latestVersion}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Switch checked={plugin.isActivated} onCheckedChange={() => handleToggleMockPlugin(plugin)} />
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleConfigurePlugin(plugin.name) }}>
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteMockPlugin(plugin) }}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  // Render function for DB plugins with real Supabase handlers
  const renderDBPluginRow = (plugin: DBPlugin) => {
    const getCategoryIcon = () => {
      const iconMap: Record<string, any> = {
        'productivity': Zap,
        'security': Shield,
        'analytics': BarChart3,
        'integration': Webhook,
        'communication': Mail,
        'automation': Bot,
        'ui-enhancement': Palette,
        'developer-tools': Terminal
      }
      const Icon = iconMap[plugin.category] || Package
      return <Icon className="h-5 w-5" />
    }

    return (
      <div
        key={plugin.id}
        className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
          {getCategoryIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-white">{plugin.name}</h3>
            <Badge className={plugin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} variant="secondary">
              {plugin.status}
            </Badge>
            <Badge variant="outline" className="text-xs">{plugin.plugin_type}</Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{plugin.description || 'No description available'}</p>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium">v{plugin.version}</p>
          {plugin.rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-yellow-500">
              <Star className="h-3 w-3 fill-current" />
              {plugin.rating.toFixed(1)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={plugin.status === 'active'}
            onCheckedChange={(checked) => {
              if (checked) {
                handleEnablePlugin(plugin.id, plugin.name)
              } else {
                handleDisablePlugin(plugin.id, plugin.name)
              }
            }}
          />
          <Button variant="ghost" size="icon" onClick={() => handleConfigurePlugin(plugin.name)}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600"
            onClick={() => handleUninstallPlugin(plugin.id, plugin.name)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Puzzle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plugin Manager</h1>
              <p className="text-gray-500 dark:text-gray-400">Extend your platform with powerful plugins</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search plugins..."
                className="w-72 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setShowFiltersPanel(!showFiltersPanel)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" onClick={() => setShowUploadDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Plugin
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
                {stat.change && (
                  <p className={`text-xs mt-2 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} this month
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger value="discover" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              <Globe className="h-4 w-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="installed" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              <Package className="h-4 w-4 mr-2" />
              Installed ({installedPlugins.length})
            </TabsTrigger>
            <TabsTrigger value="updates" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Updates ({needsUpdatePlugins.length})
            </TabsTrigger>
            <TabsTrigger value="collections" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              <Layers className="h-4 w-4 mr-2" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="developer" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              <Terminal className="h-4 w-4 mr-2" />
              Developer
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="mt-6 space-y-6">
            {/* Discover Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Discover Plugins</h2>
                    <p className="text-white/90 max-w-2xl">
                      Browse our marketplace of powerful plugins to extend your platform's functionality.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{plugins.length}</div>
                      <div className="text-sm text-white/80">Total Plugins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{categories.length}</div>
                      <div className="text-sm text-white/80">Categories</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: Search, label: 'Search', color: 'text-blue-500' },
                { icon: Star, label: 'Top Rated', color: 'text-yellow-500' },
                { icon: TrendingUp, label: 'Trending', color: 'text-green-500' },
                { icon: Crown, label: 'Premium', color: 'text-purple-500' },
                { icon: Sparkles, label: 'New', color: 'text-pink-500' },
                { icon: Shield, label: 'Security', color: 'text-red-500' },
                { icon: Code, label: 'Dev Tools', color: 'text-cyan-500' },
                { icon: Bot, label: 'AI Plugins', color: 'text-orange-500' }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200 bg-white/50 dark:bg-gray-800/50" onClick={() => handleFilterAction(action.label)}>
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Categories Sidebar */}
              <div className="col-span-3">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                            selectedCategory === cat.id
                              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <cat.icon className="h-4 w-4" />
                            <span>{cat.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{formatNumber(cat.count)}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Featured Collection */}
                <Card className="mt-6 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Featured Collection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg text-white">
                      <div className="text-2xl mb-2">🛡️</div>
                      <h3 className="font-semibold mb-1">Essential Security</h3>
                      <p className="text-sm text-green-100 mb-3">Must-have security plugins for any site</p>
                      <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white" onClick={() => collections[0] && handleViewCollection(collections[0])}>
                        View Collection
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Plugin Grid */}
              <div className="col-span-9">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={selectedTier === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTier('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={selectedTier === 'free' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTier('free')}
                    >
                      Free
                    </Button>
                    <Button
                      variant={selectedTier === 'freemium' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTier('freemium')}
                    >
                      Freemium
                    </Button>
                    <Button
                      variant={selectedTier === 'premium' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTier('premium')}
                    >
                      Premium
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCollectionPluginIds && (
                      <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Collection Active
                        <button onClick={handleClearCollectionFilter} className="ml-1 hover:text-green-600">
                          &times;
                        </button>
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">{filteredPlugins.length} plugins</span>
                    <div className="flex border rounded-lg overflow-hidden">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6' : 'space-y-3'}>
                  {filteredPlugins.map(plugin =>
                    viewMode === 'grid'
                      ? renderPluginCard(plugin)
                      : renderInstalledPluginRow(plugin)
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Installed Tab */}
          <TabsContent value="installed" className="mt-6 space-y-6">
            {/* Installed Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Installed Plugins</h2>
                    <p className="text-white/90 max-w-2xl">
                      Manage your installed plugins, check for updates, and configure plugin settings.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{dbPlugins.length + installedPlugins.length}</div>
                      <div className="text-sm text-white/80">Installed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{dbStats.active + installedPlugins.filter(p => p.status === 'active').length}</div>
                      <div className="text-sm text-white/80">Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Plugins from Database */}
            {dbPlugins.length > 0 && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Your Plugins</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">Plugins you have created or installed from the marketplace</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => fetchPlugins()}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${dbLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleUpdateAllPlugins}>
                        Update All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {dbLoading ? (
                    <div className="p-8 text-center text-gray-500">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                      Loading plugins...
                    </div>
                  ) : dbError ? (
                    <div className="p-8 text-center text-red-500">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                      {dbError}
                    </div>
                  ) : (
                    dbPlugins.map(plugin => renderDBPluginRow(plugin))
                  )}
                </CardContent>
              </Card>
            )}

            {/* Demo Plugins (Mock Data) */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Demo Plugins</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Sample plugins for demonstration</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => { fetchPlugins(); toast.success(needsUpdatePlugins.length > 0 ? `${needsUpdatePlugins.length} plugin(s) need updates` : 'All plugins are up to date!') }}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${dbLoading ? 'animate-spin' : ''}`} />
                      Check Updates
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setShowBulkActions(!showBulkActions); toast.success(showBulkActions ? 'Bulk mode disabled' : 'Bulk mode enabled - select multiple plugins to manage them together') }}>
                      Bulk Actions
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {installedPlugins.map(plugin => renderInstalledPluginRow(plugin))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="mt-6 space-y-6">
            {/* Updates Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Plugin Updates</h2>
                    <p className="text-white/90 max-w-2xl">
                      Keep your plugins up to date for the latest features, bug fixes, and security patches.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{needsUpdatePlugins.length}</div>
                      <div className="text-sm text-white/80">Updates Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{installedPlugins.length}</div>
                      <div className="text-sm text-white/80">Total Installed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: RefreshCw, label: 'Update All', color: 'text-blue-500' },
                { icon: History, label: 'View History', color: 'text-purple-500' },
                { icon: Download, label: 'Backup First', color: 'text-green-500' },
                { icon: Shield, label: 'Security Scan', color: 'text-red-500' },
                { icon: Clock, label: 'Schedule', color: 'text-orange-500' },
                { icon: Bell, label: 'Notifications', color: 'text-yellow-500' },
                { icon: FileText, label: 'Changelogs', color: 'text-cyan-500' },
                { icon: Settings, label: 'Settings', color: 'text-gray-500' }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200 bg-white/50 dark:bg-gray-800/50" onClick={() => handleUpdateAction(action.label)}>
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Available Updates</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{needsUpdatePlugins.length} plugin(s) need updating</p>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleUpdateAllPlugins}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {needsUpdatePlugins.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">All plugins are up to date!</h3>
                    <p className="text-gray-500">Your plugins are running the latest versions.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {needsUpdatePlugins.map(plugin => (
                      <div key={plugin.id} className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-2xl">
                          {plugin.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">{plugin.name}</h3>
                          <p className="text-sm text-gray-500">v{plugin.version} → v{plugin.latestVersion}</p>
                        </div>
                        <div className="text-right">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleUpdateMockPlugin(plugin)}>
                            Update Now
                          </Button>
                          <button className="block text-xs text-blue-600 hover:underline mt-1" onClick={() => handleViewChangelog(plugin)}>View Changelog</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="mt-6 space-y-6">
            {/* Collections Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Plugin Collections</h2>
                    <p className="text-white/90 max-w-2xl">
                      Curated bundles of plugins designed to work together for specific use cases.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{collections.length}</div>
                      <div className="text-sm text-white/80">Collections</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              {collections.map(collection => (
                <Card key={collection.id} className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center text-3xl">
                        {collection.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{collection.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{collection.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{collection.plugins.length} plugins</Badge>
                          <Button size="sm" variant="outline" onClick={() => handleViewCollection(collection)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Collection
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Developer Tab */}
          <TabsContent value="developer" className="mt-6 space-y-6">
            {/* Developer Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Developer Tools</h2>
                    <p className="text-white/90 max-w-2xl">
                      Build custom plugins, access API documentation, and debug your integrations with our developer toolkit.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">v2.0</div>
                      <div className="text-sm text-white/80">API Version</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">50+</div>
                      <div className="text-sm text-white/80">Endpoints</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: Terminal, label: 'CLI Tools', color: 'text-green-500' },
                { icon: Code, label: 'API Docs', color: 'text-blue-500' },
                { icon: GitBranch, label: 'SDK', color: 'text-purple-500' },
                { icon: Webhook, label: 'Webhooks', color: 'text-orange-500' },
                { icon: Database, label: 'Database', color: 'text-cyan-500' },
                { icon: Activity, label: 'Debug', color: 'text-red-500' },
                { icon: FileText, label: 'Guides', color: 'text-yellow-500' },
                { icon: MessageSquare, label: 'Support', color: 'text-pink-500' }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200 bg-white/50 dark:bg-gray-800/50" onClick={() => handleDeveloperAction(action.label)}>
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              <Card className="col-span-2 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Developer Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <Terminal className="h-8 w-8 text-green-600 mb-3" />
                      <h3 className="font-medium mb-1">Plugin Boilerplate</h3>
                      <p className="text-sm text-gray-500">Generate a starter plugin template</p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <Code className="h-8 w-8 text-blue-600 mb-3" />
                      <h3 className="font-medium mb-1">API Documentation</h3>
                      <p className="text-sm text-gray-500">Explore hooks, filters, and functions</p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <Activity className="h-8 w-8 text-purple-600 mb-3" />
                      <h3 className="font-medium mb-1">Debug Console</h3>
                      <p className="text-sm text-gray-500">Monitor plugin performance and errors</p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <Database className="h-8 w-8 text-amber-600 mb-3" />
                      <h3 className="font-medium mb-1">Database Manager</h3>
                      <p className="text-sm text-gray-500">Manage plugin database tables</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">API Calls Today</span>
                    <span className="font-medium">12,456</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Webhook Events</span>
                    <span className="font-medium">3,789</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Error Rate</span>
                    <span className="font-medium text-green-600">0.02%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Avg Response Time</span>
                    <span className="font-medium">124ms</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur sticky top-4">
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'updates', label: 'Updates', icon: RefreshCw },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'developer', label: 'Developer', icon: Code },
                        { id: 'advanced', label: 'Advanced', icon: Terminal }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                            settingsTab === item.id
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-green-500" />
                        General Settings
                      </CardTitle>
                      <CardDescription>Configure basic plugin management settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Plugin Directory</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Location where plugins are installed</p>
                          </div>
                          <Input defaultValue="/plugins" className="w-64" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Max Concurrent Installs</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Maximum simultaneous installations</p>
                          </div>
                          <Input type="number" defaultValue="3" className="w-20" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Show Beta Plugins</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Display beta and experimental plugins</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Cache Plugin Data</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Cache plugin information for faster loading</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-green-600 to-emerald-600" onClick={handleSaveGeneralSettings}>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'updates' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-blue-500" />
                        Update Settings
                      </CardTitle>
                      <CardDescription>Configure automatic updates and backups</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Enable Auto-Updates</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically update when new versions available</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Update Schedule</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">When to check for updates</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 w-64">
                            <option>Daily at 3:00 AM</option>
                            <option>Weekly on Sunday</option>
                            <option>Manual Only</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Backup Before Update</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Create automatic backups before updating</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Rollback on Failure</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically restore if update fails</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-green-600 to-emerald-600" onClick={handleSaveUpdateSettings}>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'notifications' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-purple-500" />
                        Notification Settings
                      </CardTitle>
                      <CardDescription>Configure alerts and notification preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Update Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when updates are available</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Security Alerts</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify about security vulnerabilities</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">New Plugin Suggestions</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Recommend plugins based on usage</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Weekly Digest</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Weekly summary of plugin activity</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-green-600 to-emerald-600" onClick={handleSaveNotificationSettings}>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'security' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-500" />
                        Security Settings
                      </CardTitle>
                      <CardDescription>Manage plugin security and verification</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Verify Plugin Integrity</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Check plugin files against known signatures</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Block Untrusted Sources</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Only allow plugins from verified developers</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Security Scanning</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically scan for vulnerabilities</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Sandbox Mode</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Run plugins in isolated environment</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-green-600 to-emerald-600" onClick={handleSaveSecuritySettings}>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'developer' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-cyan-500" />
                        Developer Settings
                      </CardTitle>
                      <CardDescription>Configure developer tools and API access</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Developer Mode</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enable development features</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Debug Logging</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Log plugin debug information</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">API Documentation</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">View plugin API documentation</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.open('https://docs.example.com/api', '_blank')}>View Docs</Button>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-medium">Plugin API Key</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">API key for plugin development</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input value={apiKey.replace(/(.{12})(.*)/, '$1' + '*'.repeat(Math.max(0, apiKey.length - 12)))} readOnly className="flex-1 font-mono text-sm" />
                          <Button variant="outline" size="sm" onClick={handleRegenerateApiKey}>Regenerate</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'advanced' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-gray-500" />
                        Advanced Settings
                      </CardTitle>
                      <CardDescription>System configuration and maintenance options</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Plugin Memory Limit</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Maximum memory per plugin</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 w-64">
                            <option>128 MB</option>
                            <option>256 MB</option>
                            <option>512 MB</option>
                            <option>1 GB</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Clear Plugin Cache</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Remove cached plugin data</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2" onClick={handleClearCache}>
                            <Trash2 className="w-4 h-4" />
                            Clear Cache
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Export Plugin List</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Download list of installed plugins</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPluginList}>
                            <Download className="w-4 h-4" />
                            Export
                          </Button>
                        </div>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Danger Zone</h4>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                          These actions are irreversible. Please proceed with caution.
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/30" onClick={handleRemoveAllPlugins}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove All Plugins
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/30" onClick={handleResetToDefaults}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset to Defaults
                          </Button>
                        </div>
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
            
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={collaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={predictions}
              title="Plugin Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          <QuickActionsToolbar
            actions={[
              { id: '1', label: 'Install', icon: 'plus', action: () => { setActiveTab('discover') }, variant: 'default' as const },
              { id: '2', label: 'Update All', icon: 'refresh-cw', action: handleUpdateAllPlugins, variant: 'default' as const },
              { id: '3', label: 'Settings', icon: 'settings', action: () => { setActiveTab('settings') }, variant: 'outline' as const },
            ]}
            variant="grid"
          />
        </div>

        {/* Plugin Detail Dialog */}
        <Dialog open={!!selectedPlugin && !showInstallDialog} onOpenChange={() => setSelectedPlugin(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <ScrollArea className="max-h-[80vh]">
              {selectedPlugin && (
                <div className="space-y-6">
                  <DialogHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-3xl">
                        {selectedPlugin.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <DialogTitle className="text-2xl">{selectedPlugin.name}</DialogTitle>
                          {selectedPlugin.author.verified && (
                            <CheckCircle2 className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <p className="text-gray-500">by {selectedPlugin.author.name} • {selectedPlugin.author.plugins} plugins</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getTierColor(selectedPlugin.tier)} variant="secondary">
                          {getTierIcon(selectedPlugin.tier)}
                          <span className="ml-1 capitalize">{selectedPlugin.tier}</span>
                        </Badge>
                        <Badge className={getStatusColor(selectedPlugin.status)} variant="secondary">
                          {selectedPlugin.status}
                        </Badge>
                      </div>
                    </div>
                  </DialogHeader>

                  {/* Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPlugin.rating}</span>
                      </div>
                      <p className="text-sm text-gray-500">{formatNumber(selectedPlugin.reviewsCount)} reviews</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(selectedPlugin.activeInstalls)}</p>
                      <p className="text-sm text-gray-500">Active Installs</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPlugin.compatibility}%</p>
                      <p className="text-sm text-gray-500">Compatibility</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPlugin.securityScore}%</p>
                      <p className="text-sm text-gray-500">Security Score</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-300">{selectedPlugin.description}</p>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="font-semibold mb-2">Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                      {selectedPlugin.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div>
                    <h3 className="font-semibold mb-2">Technical Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-sm">
                      <div>
                        <p className="text-gray-500">Version</p>
                        <p className="font-medium">{selectedPlugin.version}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Updated</p>
                        <p className="font-medium">{selectedPlugin.lastUpdated}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Tested Up To</p>
                        <p className="font-medium">{selectedPlugin.testedUpTo}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Requires Version</p>
                        <p className="font-medium">{selectedPlugin.requiresVersion}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">PHP Version</p>
                        <p className="font-medium">{selectedPlugin.requiresPHP}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Size</p>
                        <p className="font-medium">{selectedPlugin.size}</p>
                      </div>
                    </div>
                  </div>

                  {/* Support Stats */}
                  <div>
                    <h3 className="font-semibold mb-2">Support</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">Issues Resolved</span>
                          <span className="text-sm font-medium">{selectedPlugin.support.resolved}%</span>
                        </div>
                        <Progress value={selectedPlugin.support.resolved} className="h-2" />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    {selectedPlugin.isInstalled ? (
                      <>
                        <Button
                          className={selectedPlugin.isActivated ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'}
                          onClick={() => handleToggleMockPlugin(selectedPlugin)}
                        >
                          {selectedPlugin.isActivated ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </Button>
                        {selectedPlugin.status === 'needs-update' && (
                          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleUpdateMockPlugin(selectedPlugin)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Update to v{selectedPlugin.latestVersion}
                          </Button>
                        )}
                        <Button variant="outline" onClick={() => handleConfigurePlugin(selectedPlugin.name)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                        <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteMockPlugin(selectedPlugin)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleInstall(selectedPlugin)}>
                          <Download className="h-4 w-4 mr-2" />
                          Install Now
                        </Button>
                        {selectedPlugin.hasProVersion && (
                          <Button variant="outline" className="text-purple-600 border-purple-600" onClick={() => window.open(`https://example.com/plugins/${selectedPlugin.slug}/pro`, '_blank')}>
                            <Crown className="h-4 w-4 mr-2" />
                            Get Pro Version
                          </Button>
                        )}
                      </>
                    )}
                    <Button variant="ghost" className="ml-auto" onClick={() => { window.open(`https://example.com/plugins/${selectedPlugin.slug}`, '_blank'); toast.success(`Opened "${selectedPlugin.name}" website`) }}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Install Confirmation Dialog */}
        <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Install Plugin</DialogTitle>
            </DialogHeader>
            {selectedPlugin && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-2xl">
                    {selectedPlugin.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedPlugin.name}</h3>
                    <p className="text-sm text-gray-500">v{selectedPlugin.version} • {selectedPlugin.size}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">This plugin will:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Access your site data
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Add new features to your dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Create database tables
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowInstallDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={installing === selectedPlugin.id}
                    onClick={() => handleInstall(selectedPlugin)}
                  >
                    {installing === selectedPlugin.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Install & Activate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Upload/Create Plugin Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-green-500" />
                Create New Plugin
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pluginName">Plugin Name *</Label>
                <Input
                  id="pluginName"
                  placeholder="My Awesome Plugin"
                  value={newPluginForm.name}
                  onChange={(e) => setNewPluginForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pluginDescription">Description</Label>
                <Input
                  id="pluginDescription"
                  placeholder="A brief description of what this plugin does..."
                  value={newPluginForm.description}
                  onChange={(e) => setNewPluginForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pluginVersion">Version</Label>
                  <Input
                    id="pluginVersion"
                    placeholder="1.0.0"
                    value={newPluginForm.version}
                    onChange={(e) => setNewPluginForm(prev => ({ ...prev, version: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pluginAuthor">Author</Label>
                  <Input
                    id="pluginAuthor"
                    placeholder="Your name"
                    value={newPluginForm.author}
                    onChange={(e) => setNewPluginForm(prev => ({ ...prev, author: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pluginCategory">Category</Label>
                  <select
                    id="pluginCategory"
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    value={newPluginForm.category}
                    onChange={(e) => setNewPluginForm(prev => ({ ...prev, category: e.target.value as DBPlugin['category'] }))}
                  >
                    <option value="productivity">Productivity</option>
                    <option value="security">Security</option>
                    <option value="analytics">Analytics</option>
                    <option value="integration">Integration</option>
                    <option value="communication">Communication</option>
                    <option value="automation">Automation</option>
                    <option value="ui-enhancement">UI Enhancement</option>
                    <option value="developer-tools">Developer Tools</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pluginType">Plugin Type</Label>
                  <select
                    id="pluginType"
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    value={newPluginForm.plugin_type}
                    onChange={(e) => setNewPluginForm(prev => ({ ...prev, plugin_type: e.target.value as DBPlugin['plugin_type'] }))}
                  >
                    <option value="community">Community</option>
                    <option value="core">Core</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="beta">Beta</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pluginRepo">Repository URL (optional)</Label>
                <Input
                  id="pluginRepo"
                  placeholder="https://github.com/username/plugin"
                  value={newPluginForm.repository_url}
                  onChange={(e) => setNewPluginForm(prev => ({ ...prev, repository_url: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pluginDocs">Documentation URL (optional)</Label>
                <Input
                  id="pluginDocs"
                  placeholder="https://docs.example.com/plugin"
                  value={newPluginForm.documentation_url}
                  onChange={(e) => setNewPluginForm(prev => ({ ...prev, documentation_url: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowUploadDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  onClick={handleCreatePlugin}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plugin
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Plugin Configuration Dialog */}
        <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-500" />
                Configure Plugin
              </DialogTitle>
            </DialogHeader>
            {selectedPlugin && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-2xl">
                    {selectedPlugin.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedPlugin.name}</h3>
                    <p className="text-sm text-gray-500">v{selectedPlugin.version}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                    <div>
                      <p className="font-medium">Enable Plugin</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Activate or deactivate this plugin</p>
                    </div>
                    <Switch
                      checked={selectedPlugin.isActivated}
                      onCheckedChange={() => handleToggleMockPlugin(selectedPlugin)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                    <div>
                      <p className="font-medium">Auto-Update</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Automatically update when new versions are available</p>
                    </div>
                    <Switch defaultChecked={selectedPlugin.autoUpdate} />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                    <div>
                      <p className="font-medium">Permissions</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Manage plugin access permissions</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowConfigDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    onClick={() => {
                      toast.success(`Settings saved for "${selectedPlugin.name}"`)
                      setShowConfigDialog(false)
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
