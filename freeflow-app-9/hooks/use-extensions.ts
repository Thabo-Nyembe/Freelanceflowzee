'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ExtensionStatus = 'active' | 'inactive' | 'pending' | 'error'
export type ExtensionType = 'browser' | 'desktop' | 'mobile' | 'api'

export interface Extension {
  id: string
  name: string
  slug: string
  description: string
  type: ExtensionType
  version: string
  latestVersion?: string
  author: string
  authorUrl?: string
  iconUrl?: string
  status: ExtensionStatus
  permissions: ExtensionPermission[]
  features: ExtensionFeature[]
  config: ExtensionConfig[]
  rating: number
  reviewCount: number
  installCount: number
  size: number
  lastUpdatedAt: string
  installedAt: string
  updatedAt: string
}

export interface ExtensionPermission {
  id: string
  name: string
  description: string
  isRequired: boolean
  isGranted: boolean
}

export interface ExtensionFeature {
  id: string
  name: string
  description: string
  isEnabled: boolean
}

export interface ExtensionConfig {
  id: string
  key: string
  label: string
  description?: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'json'
  value: any
  defaultValue: any
  options?: { label: string; value: any }[]
}

export interface ExtensionMarketplace {
  id: string
  name: string
  slug: string
  description: string
  longDescription?: string
  type: ExtensionType
  version: string
  author: string
  authorUrl?: string
  iconUrl?: string
  screenshots: string[]
  permissions: string[]
  features: string[]
  price: number
  currency: string
  isFree: boolean
  rating: number
  reviewCount: number
  installCount: number
  size: number
  releaseNotes?: string
  lastUpdatedAt: string
  createdAt: string
}

export interface ExtensionStats {
  totalInstalled: number
  activeExtensions: number
  pendingUpdates: number
  totalFromStore: number
  byType: { type: ExtensionType; count: number }[]
  popularExtensions: { id: string; name: string; installs: number }[]
  recentUpdates: { id: string; name: string; version: string; date: string }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockExtensions: Extension[] = [
  {
    id: 'ext-1',
    name: 'FreeFlow Browser Extension',
    slug: 'freeflow-browser',
    description: 'Quick access to FreeFlow features from your browser toolbar.',
    type: 'browser',
    version: '2.1.0',
    latestVersion: '2.2.0',
    author: 'FreeFlow',
    iconUrl: '/extensions/browser.png',
    status: 'active',
    permissions: [
      { id: 'perm-1', name: 'tabs', description: 'Access browser tabs', isRequired: true, isGranted: true },
      { id: 'perm-2', name: 'storage', description: 'Store local data', isRequired: true, isGranted: true },
      { id: 'perm-3', name: 'notifications', description: 'Show notifications', isRequired: false, isGranted: true }
    ],
    features: [
      { id: 'feat-1', name: 'Quick Add Task', description: 'Add tasks from any webpage', isEnabled: true },
      { id: 'feat-2', name: 'Time Tracker', description: 'Track time on any webpage', isEnabled: true },
      { id: 'feat-3', name: 'Screenshot Capture', description: 'Capture and annotate screenshots', isEnabled: false }
    ],
    config: [
      { id: 'cfg-1', key: 'theme', label: 'Theme', type: 'select', value: 'auto', defaultValue: 'auto', options: [{ label: 'Auto', value: 'auto' }, { label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }] },
      { id: 'cfg-2', key: 'showBadge', label: 'Show Badge Count', type: 'boolean', value: true, defaultValue: true }
    ],
    rating: 4.8,
    reviewCount: 1250,
    installCount: 45000,
    size: 2500000,
    lastUpdatedAt: '2024-03-10',
    installedAt: '2024-01-15',
    updatedAt: '2024-03-01'
  },
  {
    id: 'ext-2',
    name: 'FreeFlow Desktop App',
    slug: 'freeflow-desktop',
    description: 'Native desktop application with offline support and system integration.',
    type: 'desktop',
    version: '3.0.0',
    author: 'FreeFlow',
    iconUrl: '/extensions/desktop.png',
    status: 'active',
    permissions: [
      { id: 'perm-4', name: 'filesystem', description: 'Access local files', isRequired: true, isGranted: true },
      { id: 'perm-5', name: 'notifications', description: 'System notifications', isRequired: true, isGranted: true }
    ],
    features: [
      { id: 'feat-4', name: 'Offline Mode', description: 'Work without internet', isEnabled: true },
      { id: 'feat-5', name: 'System Tray', description: 'Quick access from system tray', isEnabled: true }
    ],
    config: [
      { id: 'cfg-3', key: 'startOnBoot', label: 'Start on Boot', type: 'boolean', value: true, defaultValue: false },
      { id: 'cfg-4', key: 'minimizeToTray', label: 'Minimize to Tray', type: 'boolean', value: true, defaultValue: true }
    ],
    rating: 4.9,
    reviewCount: 890,
    installCount: 28000,
    size: 85000000,
    lastUpdatedAt: '2024-03-15',
    installedAt: '2024-02-01',
    updatedAt: '2024-03-15'
  },
  {
    id: 'ext-3',
    name: 'FreeFlow Mobile App',
    slug: 'freeflow-mobile',
    description: 'Full-featured mobile app for iOS and Android.',
    type: 'mobile',
    version: '4.2.1',
    author: 'FreeFlow',
    iconUrl: '/extensions/mobile.png',
    status: 'active',
    permissions: [
      { id: 'perm-6', name: 'camera', description: 'Take photos and videos', isRequired: false, isGranted: true },
      { id: 'perm-7', name: 'location', description: 'Access location', isRequired: false, isGranted: false }
    ],
    features: [
      { id: 'feat-6', name: 'Push Notifications', description: 'Real-time notifications', isEnabled: true },
      { id: 'feat-7', name: 'Biometric Login', description: 'Face ID / Fingerprint', isEnabled: true }
    ],
    config: [
      { id: 'cfg-5', key: 'syncInterval', label: 'Sync Interval', type: 'select', value: '15', defaultValue: '15', options: [{ label: '5 min', value: '5' }, { label: '15 min', value: '15' }, { label: '30 min', value: '30' }] }
    ],
    rating: 4.7,
    reviewCount: 3200,
    installCount: 125000,
    size: 45000000,
    lastUpdatedAt: '2024-03-18',
    installedAt: '2024-01-01',
    updatedAt: '2024-03-18'
  }
]

const mockMarketplace: ExtensionMarketplace[] = [
  {
    id: 'mp-1',
    name: 'FreeFlow CLI',
    slug: 'freeflow-cli',
    description: 'Command-line interface for FreeFlow power users.',
    type: 'api',
    version: '1.5.0',
    author: 'FreeFlow',
    iconUrl: '/extensions/cli.png',
    screenshots: [],
    permissions: ['filesystem', 'network'],
    features: ['Task automation', 'Bulk operations', 'Scripting support'],
    price: 0,
    currency: 'USD',
    isFree: true,
    rating: 4.6,
    reviewCount: 180,
    installCount: 5200,
    size: 12000000,
    lastUpdatedAt: '2024-03-01',
    createdAt: '2023-06-01'
  }
]

const mockStats: ExtensionStats = {
  totalInstalled: 5,
  activeExtensions: 4,
  pendingUpdates: 1,
  totalFromStore: 25,
  byType: [
    { type: 'browser', count: 2 },
    { type: 'desktop', count: 1 },
    { type: 'mobile', count: 1 },
    { type: 'api', count: 1 }
  ],
  popularExtensions: [
    { id: 'ext-3', name: 'FreeFlow Mobile App', installs: 125000 },
    { id: 'ext-1', name: 'FreeFlow Browser Extension', installs: 45000 }
  ],
  recentUpdates: [
    { id: 'ext-3', name: 'FreeFlow Mobile App', version: '4.2.1', date: '2024-03-18' }
  ]
}

// ============================================================================
// HOOK
// ============================================================================

interface UseExtensionsOptions {
  
}

export function useExtensions(options: UseExtensionsOptions = {}) {
  const {  } = options

  const [extensions, setExtensions] = useState<Extension[]>([])
  const [marketplace, setMarketplace] = useState<ExtensionMarketplace[]>([])
  const [currentExtension, setCurrentExtension] = useState<Extension | null>(null)
  const [stats, setStats] = useState<ExtensionStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInstalling, setIsInstalling] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchExtensions = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/extensions')
      const result = await response.json()
      if (result.success) {
        setExtensions(Array.isArray(result.extensions) ? result.extensions : [])
        setMarketplace(Array.isArray(result.marketplace) ? result.marketplace : [])
        setStats(result.stats || null)
        return result.extensions
      }
      setExtensions([])
      return []
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch extensions'))
      setExtensions([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const installExtension = useCallback(async (itemId: string) => {
    setIsInstalling(true)
    try {
      const item = marketplace.find(m => m.id === itemId)
      if (!item) return { success: false, error: 'Extension not found' }

      const extension: Extension = {
        id: `ext-${Date.now()}`,
        name: item.name,
        slug: item.slug,
        description: item.description,
        type: item.type,
        version: item.version,
        author: item.author,
        authorUrl: item.authorUrl,
        iconUrl: item.iconUrl,
        status: 'active',
        permissions: item.permissions.map((p, i) => ({
          id: `perm-${Date.now()}-${i}`,
          name: p,
          description: `Access to ${p}`,
          isRequired: true,
          isGranted: true
        })),
        features: item.features.map((f, i) => ({
          id: `feat-${Date.now()}-${i}`,
          name: f,
          description: f,
          isEnabled: true
        })),
        config: [],
        rating: item.rating,
        reviewCount: item.reviewCount,
        installCount: item.installCount,
        size: item.size,
        lastUpdatedAt: item.lastUpdatedAt,
        installedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setExtensions(prev => [extension, ...prev])
      return { success: true, extension }
    } finally {
      setIsInstalling(false)
    }
  }, [marketplace])

  const uninstallExtension = useCallback(async (extensionId: string) => {
    setExtensions(prev => prev.filter(e => e.id !== extensionId))
    return { success: true }
  }, [])

  const activateExtension = useCallback(async (extensionId: string) => {
    setExtensions(prev => prev.map(e => e.id === extensionId ? { ...e, status: 'active' as const } : e))
    return { success: true }
  }, [])

  const deactivateExtension = useCallback(async (extensionId: string) => {
    setExtensions(prev => prev.map(e => e.id === extensionId ? { ...e, status: 'inactive' as const } : e))
    return { success: true }
  }, [])

  const updateExtension = useCallback(async (extensionId: string) => {
    setExtensions(prev => prev.map(e => e.id === extensionId ? { ...e, status: 'pending' as const } : e))
    await new Promise(resolve => setTimeout(resolve, 3000))
    setExtensions(prev => prev.map(e => e.id === extensionId ? {
      ...e,
      status: 'active' as const,
      version: e.latestVersion || e.version,
      latestVersion: undefined,
      updatedAt: new Date().toISOString()
    } : e))
    return { success: true }
  }, [])

  const toggleFeature = useCallback(async (extensionId: string, featureId: string) => {
    setExtensions(prev => prev.map(e => e.id === extensionId ? {
      ...e,
      features: e.features.map(f => f.id === featureId ? { ...f, isEnabled: !f.isEnabled } : f),
      updatedAt: new Date().toISOString()
    } : e))
    return { success: true }
  }, [])

  const updateConfig = useCallback(async (extensionId: string, configKey: string, value: any) => {
    setExtensions(prev => prev.map(e => e.id === extensionId ? {
      ...e,
      config: e.config.map(c => c.key === configKey ? { ...c, value } : c),
      updatedAt: new Date().toISOString()
    } : e))
    return { success: true }
  }, [])

  const grantPermission = useCallback(async (extensionId: string, permissionId: string) => {
    setExtensions(prev => prev.map(e => e.id === extensionId ? {
      ...e,
      permissions: e.permissions.map(p => p.id === permissionId ? { ...p, isGranted: true } : p),
      updatedAt: new Date().toISOString()
    } : e))
    return { success: true }
  }, [])

  const revokePermission = useCallback(async (extensionId: string, permissionId: string) => {
    setExtensions(prev => prev.map(e => e.id === extensionId ? {
      ...e,
      permissions: e.permissions.map(p => p.id === permissionId && !p.isRequired ? { ...p, isGranted: false } : p),
      updatedAt: new Date().toISOString()
    } : e))
    return { success: true }
  }, [])

  const searchMarketplace = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase()
    return marketplace.filter(e =>
      e.name.toLowerCase().includes(lowerQuery) ||
      e.description.toLowerCase().includes(lowerQuery)
    )
  }, [marketplace])

  const hasUpdate = useCallback((extensionId: string) => {
    const ext = extensions.find(e => e.id === extensionId)
    return ext?.latestVersion && ext.latestVersion !== ext.version
  }, [extensions])

  const formatSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchExtensions()
  }, [fetchExtensions])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const activeExtensions = useMemo(() => extensions.filter(e => e.status === 'active'), [extensions])
  const inactiveExtensions = useMemo(() => extensions.filter(e => e.status === 'inactive'), [extensions])
  const extensionsWithUpdates = useMemo(() => extensions.filter(e => e.latestVersion && e.latestVersion !== e.version), [extensions])
  const extensionsByType = useMemo(() => {
    const grouped: Record<ExtensionType, Extension[]> = { browser: [], desktop: [], mobile: [], api: [] }
    extensions.forEach(e => grouped[e.type].push(e))
    return grouped
  }, [extensions])

  return {
    extensions, marketplace, currentExtension, stats,
    activeExtensions, inactiveExtensions, extensionsWithUpdates, extensionsByType,
    isLoading, isInstalling, error,
    refresh, installExtension, uninstallExtension, activateExtension, deactivateExtension,
    updateExtension, toggleFeature, updateConfig, grantPermission, revokePermission,
    searchMarketplace, hasUpdate, formatSize, setCurrentExtension
  }
}

export default useExtensions
