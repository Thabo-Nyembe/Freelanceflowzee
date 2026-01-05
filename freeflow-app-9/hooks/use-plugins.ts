'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type PluginStatus = 'active' | 'inactive' | 'error' | 'updating'

export interface Plugin {
  id: string
  name: string
  slug: string
  description: string
  version: string
  latestVersion?: string
  author: string
  authorUrl?: string
  iconUrl?: string
  status: PluginStatus
  category: string
  tags: string[]
  permissions: string[]
  settings: PluginSetting[]
  hooks: PluginHook[]
  dependencies: PluginDependency[]
  installCount: number
  rating: number
  reviewCount: number
  lastUpdatedAt: string
  installedAt: string
  updatedAt: string
}

export interface PluginSetting {
  id: string
  key: string
  label: string
  description?: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json'
  value: any
  defaultValue: any
  options?: { label: string; value: any }[]
  required: boolean
}

export interface PluginHook {
  name: string
  description: string
  priority: number
  isEnabled: boolean
}

export interface PluginDependency {
  pluginId: string
  pluginName: string
  minVersion?: string
  isInstalled: boolean
  isSatisfied: boolean
}

export interface PluginMarketplaceItem {
  id: string
  name: string
  slug: string
  description: string
  longDescription?: string
  version: string
  author: string
  authorUrl?: string
  iconUrl?: string
  screenshots: string[]
  category: string
  tags: string[]
  permissions: string[]
  price: number
  currency: string
  isFree: boolean
  installCount: number
  rating: number
  reviewCount: number
  reviews: PluginReview[]
  lastUpdatedAt: string
  createdAt: string
}

export interface PluginReview {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  version: string
  helpful: number
  createdAt: string
}

export interface PluginStats {
  totalInstalled: number
  activePlugins: number
  availableUpdates: number
  totalFromMarketplace: number
  popularPlugins: { id: string; name: string; installs: number }[]
  categoryBreakdown: { category: string; count: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockPlugins: Plugin[] = [
  { id: 'plugin-1', name: 'Google Analytics', slug: 'google-analytics', description: 'Track website analytics with Google Analytics integration.', version: '2.1.0', latestVersion: '2.2.0', author: 'FreeFlow', authorUrl: 'https://freeflow.com', iconUrl: '/plugins/ga.png', status: 'active', category: 'Analytics', tags: ['analytics', 'google', 'tracking'], permissions: ['read:users', 'write:settings'], settings: [{ id: 'set-1', key: 'tracking_id', label: 'Tracking ID', type: 'string', value: 'UA-XXXXX-Y', defaultValue: '', required: true }, { id: 'set-2', key: 'anonymize_ip', label: 'Anonymize IP', type: 'boolean', value: true, defaultValue: true, required: false }], hooks: [{ name: 'page_view', description: 'Track page views', priority: 10, isEnabled: true }], dependencies: [], installCount: 15420, rating: 4.8, reviewCount: 245, lastUpdatedAt: '2024-03-10', installedAt: '2024-01-15', updatedAt: '2024-03-01' },
  { id: 'plugin-2', name: 'Slack Integration', slug: 'slack-integration', description: 'Send notifications and updates to Slack channels.', version: '1.5.2', author: 'FreeFlow', iconUrl: '/plugins/slack.png', status: 'active', category: 'Communication', tags: ['slack', 'notifications', 'chat'], permissions: ['read:*', 'write:notifications'], settings: [{ id: 'set-3', key: 'webhook_url', label: 'Webhook URL', type: 'string', value: 'https://hooks.slack.com/xxx', defaultValue: '', required: true }], hooks: [{ name: 'task_completed', description: 'Notify on task completion', priority: 5, isEnabled: true }], dependencies: [], installCount: 12800, rating: 4.9, reviewCount: 189, lastUpdatedAt: '2024-03-15', installedAt: '2024-02-01', updatedAt: '2024-03-15' },
  { id: 'plugin-3', name: 'Advanced Reports', slug: 'advanced-reports', description: 'Generate custom reports with advanced filtering and charts.', version: '3.0.0', author: 'DataViz Inc', authorUrl: 'https://dataviz.example.com', iconUrl: '/plugins/reports.png', status: 'inactive', category: 'Reporting', tags: ['reports', 'charts', 'export'], permissions: ['read:projects', 'read:tasks', 'read:invoices'], settings: [], hooks: [], dependencies: [{ pluginId: 'plugin-1', pluginName: 'Google Analytics', isInstalled: true, isSatisfied: true }], installCount: 8500, rating: 4.5, reviewCount: 120, lastUpdatedAt: '2024-02-28', installedAt: '2024-03-01', updatedAt: '2024-03-01' }
]

const mockMarketplace: PluginMarketplaceItem[] = [
  { id: 'mp-1', name: 'Zapier Integration', slug: 'zapier-integration', description: 'Connect FreeFlow to 5000+ apps with Zapier.', version: '1.0.0', author: 'FreeFlow', iconUrl: '/plugins/zapier.png', screenshots: [], category: 'Integrations', tags: ['automation', 'zapier'], permissions: ['read:*', 'write:*'], price: 0, currency: 'USD', isFree: true, installCount: 5200, rating: 4.7, reviewCount: 85, reviews: [], lastUpdatedAt: '2024-03-01', createdAt: '2024-01-01' },
  { id: 'mp-2', name: 'Time Tracking Pro', slug: 'time-tracking-pro', description: 'Advanced time tracking with detailed reports.', version: '2.0.0', author: 'TimeTools', iconUrl: '/plugins/timetrack.png', screenshots: [], category: 'Productivity', tags: ['time', 'tracking', 'reports'], permissions: ['read:tasks', 'write:time_entries'], price: 9.99, currency: 'USD', isFree: false, installCount: 3800, rating: 4.6, reviewCount: 62, reviews: [], lastUpdatedAt: '2024-02-15', createdAt: '2023-10-01' }
]

const mockStats: PluginStats = {
  totalInstalled: 8,
  activePlugins: 6,
  availableUpdates: 2,
  totalFromMarketplace: 156,
  popularPlugins: [{ id: 'plugin-1', name: 'Google Analytics', installs: 15420 }, { id: 'plugin-2', name: 'Slack Integration', installs: 12800 }],
  categoryBreakdown: [{ category: 'Analytics', count: 3 }, { category: 'Communication', count: 2 }, { category: 'Reporting', count: 2 }, { category: 'Productivity', count: 1 }]
}

// ============================================================================
// HOOK
// ============================================================================

interface UsePluginsOptions {
  
}

export function usePlugins(options: UsePluginsOptions = {}) {
  const {  } = options

  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [marketplace, setMarketplace] = useState<PluginMarketplaceItem[]>([])
  const [currentPlugin, setCurrentPlugin] = useState<Plugin | null>(null)
  const [stats, setStats] = useState<PluginStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInstalling, setIsInstalling] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchPlugins = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/plugins')
      const result = await response.json()
      if (result.success) {
        setPlugins(Array.isArray(result.plugins) ? result.plugins : [])
        setMarketplace(Array.isArray(result.marketplace) ? result.marketplace : [])
        setStats(result.stats || null)
        return result.plugins
      }
      setPlugins([])
      return []
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch plugins'))
      setPlugins([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const installPlugin = useCallback(async (itemId: string) => {
    setIsInstalling(true)
    try {
      const marketplaceItem = marketplace.find(m => m.id === itemId)
      if (!marketplaceItem) return { success: false, error: 'Plugin not found' }

      const plugin: Plugin = {
        id: `plugin-${Date.now()}`,
        name: marketplaceItem.name,
        slug: marketplaceItem.slug,
        description: marketplaceItem.description,
        version: marketplaceItem.version,
        author: marketplaceItem.author,
        authorUrl: marketplaceItem.authorUrl,
        iconUrl: marketplaceItem.iconUrl,
        status: 'active',
        category: marketplaceItem.category,
        tags: marketplaceItem.tags,
        permissions: marketplaceItem.permissions,
        settings: [],
        hooks: [],
        dependencies: [],
        installCount: marketplaceItem.installCount,
        rating: marketplaceItem.rating,
        reviewCount: marketplaceItem.reviewCount,
        lastUpdatedAt: marketplaceItem.lastUpdatedAt,
        installedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setPlugins(prev => [plugin, ...prev])
      return { success: true, plugin }
    } finally {
      setIsInstalling(false)
    }
  }, [marketplace])

  const uninstallPlugin = useCallback(async (pluginId: string) => {
    setPlugins(prev => prev.filter(p => p.id !== pluginId))
    return { success: true }
  }, [])

  const activatePlugin = useCallback(async (pluginId: string) => {
    setPlugins(prev => prev.map(p => p.id === pluginId ? { ...p, status: 'active' as const } : p))
    return { success: true }
  }, [])

  const deactivatePlugin = useCallback(async (pluginId: string) => {
    setPlugins(prev => prev.map(p => p.id === pluginId ? { ...p, status: 'inactive' as const } : p))
    return { success: true }
  }, [])

  const updatePlugin = useCallback(async (pluginId: string) => {
    setPlugins(prev => prev.map(p => p.id === pluginId ? { ...p, status: 'updating' as const } : p))

    // Simulate update
    await new Promise(resolve => setTimeout(resolve, 3000))

    setPlugins(prev => prev.map(p => p.id === pluginId ? {
      ...p,
      status: 'active' as const,
      version: p.latestVersion || p.version,
      latestVersion: undefined,
      updatedAt: new Date().toISOString()
    } : p))

    return { success: true }
  }, [])

  const updatePluginSetting = useCallback(async (pluginId: string, settingKey: string, value: any) => {
    setPlugins(prev => prev.map(p => p.id === pluginId ? {
      ...p,
      settings: p.settings.map(s => s.key === settingKey ? { ...s, value } : s),
      updatedAt: new Date().toISOString()
    } : p))
    return { success: true }
  }, [])

  const toggleHook = useCallback(async (pluginId: string, hookName: string) => {
    setPlugins(prev => prev.map(p => p.id === pluginId ? {
      ...p,
      hooks: p.hooks.map(h => h.name === hookName ? { ...h, isEnabled: !h.isEnabled } : h),
      updatedAt: new Date().toISOString()
    } : p))
    return { success: true }
  }, [])

  const searchMarketplace = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase()
    return marketplace.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.tags.some(t => t.toLowerCase().includes(lowerQuery))
    )
  }, [marketplace])

  const filterMarketplace = useCallback((filters: { category?: string; isFree?: boolean; minRating?: number }) => {
    return marketplace.filter(p => {
      if (filters.category && p.category !== filters.category) return false
      if (filters.isFree !== undefined && p.isFree !== filters.isFree) return false
      if (filters.minRating && p.rating < filters.minRating) return false
      return true
    })
  }, [marketplace])

  const isInstalled = useCallback((slug: string) => {
    return plugins.some(p => p.slug === slug)
  }, [plugins])

  const hasUpdate = useCallback((pluginId: string) => {
    const plugin = plugins.find(p => p.id === pluginId)
    return plugin?.latestVersion && plugin.latestVersion !== plugin.version
  }, [plugins])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchPlugins()
  }, [fetchPlugins])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const activePlugins = useMemo(() => plugins.filter(p => p.status === 'active'), [plugins])
  const inactivePlugins = useMemo(() => plugins.filter(p => p.status === 'inactive'), [plugins])
  const pluginsWithUpdates = useMemo(() => plugins.filter(p => p.latestVersion && p.latestVersion !== p.version), [plugins])
  const categories = useMemo(() => [...new Set(marketplace.map(p => p.category))], [marketplace])

  return {
    plugins, marketplace, currentPlugin, stats, categories,
    activePlugins, inactivePlugins, pluginsWithUpdates,
    isLoading, isInstalling, error,
    refresh, installPlugin, uninstallPlugin, activatePlugin, deactivatePlugin, updatePlugin,
    updatePluginSetting, toggleHook, searchMarketplace, filterMarketplace,
    isInstalled, hasUpdate, setCurrentPlugin
  }
}

export default usePlugins
