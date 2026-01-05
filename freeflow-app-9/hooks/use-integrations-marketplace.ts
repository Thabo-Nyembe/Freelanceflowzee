'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type IntegrationCategory = 'productivity' | 'communication' | 'finance' | 'storage' | 'marketing' | 'design' | 'development' | 'analytics'
export type IntegrationStatus = 'available' | 'installed' | 'connected' | 'error' | 'pending'

export interface Integration {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  icon: string
  category: IntegrationCategory
  developer: string
  version: string
  rating: number
  reviewCount: number
  installCount: number
  pricing: 'free' | 'freemium' | 'paid'
  pricePerMonth?: number
  features: string[]
  permissions: string[]
  screenshots: string[]
  documentation?: string
  supportUrl?: string
  status: IntegrationStatus
  installedAt?: string
  connectedAt?: string
  config?: Record<string, any>
}

export interface InstalledIntegration extends Integration {
  isEnabled: boolean
  lastSynced?: string
  syncStatus: 'synced' | 'syncing' | 'error' | 'never'
  usage: {
    apiCalls: number
    dataTransferred: number
    lastUsed: string
  }
}

export interface IntegrationOAuthConfig {
  clientId: string
  redirectUri: string
  scopes: string[]
  authUrl: string
}

export interface IntegrationWebhook {
  id: string
  integrationId: string
  event: string
  url: string
  isActive: boolean
  lastTriggered?: string
  failureCount: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockIntegrations: Integration[] = [
  {
    id: 'int-1', name: 'Slack', slug: 'slack', description: 'Connect FreeFlow with Slack for real-time notifications and updates.', shortDescription: 'Team communication', icon: '/integrations/slack.svg', category: 'communication', developer: 'Slack Technologies', version: '2.4.0', rating: 4.8, reviewCount: 1250, installCount: 45000, pricing: 'free', features: ['Real-time notifications', 'Channel integration', 'Slash commands', 'Interactive messages'], permissions: ['Send messages', 'Read channel history'], screenshots: ['/screenshots/slack-1.png'], documentation: 'https://api.slack.com/docs', status: 'connected', installedAt: '2024-02-01', connectedAt: '2024-02-01'
  },
  {
    id: 'int-2', name: 'Google Drive', slug: 'google-drive', description: 'Sync files and documents with Google Drive for seamless collaboration.', shortDescription: 'Cloud storage', icon: '/integrations/gdrive.svg', category: 'storage', developer: 'Google', version: '3.1.0', rating: 4.7, reviewCount: 890, installCount: 38000, pricing: 'freemium', features: ['File sync', 'Folder sharing', 'Real-time collaboration', 'Version history'], permissions: ['Read files', 'Write files', 'Create folders'], screenshots: [], status: 'installed', installedAt: '2024-03-01'
  },
  {
    id: 'int-3', name: 'Stripe', slug: 'stripe', description: 'Process payments and manage subscriptions with Stripe integration.', shortDescription: 'Payment processing', icon: '/integrations/stripe.svg', category: 'finance', developer: 'Stripe', version: '4.0.0', rating: 4.9, reviewCount: 2100, installCount: 52000, pricing: 'paid', pricePerMonth: 29, features: ['Payment processing', 'Subscription management', 'Invoice generation', 'Revenue analytics'], permissions: ['Process payments', 'View transactions', 'Manage customers'], screenshots: [], status: 'connected', installedAt: '2024-01-15', connectedAt: '2024-01-15'
  },
  {
    id: 'int-4', name: 'Figma', slug: 'figma', description: 'Import designs and assets directly from Figma projects.', shortDescription: 'Design collaboration', icon: '/integrations/figma.svg', category: 'design', developer: 'Figma', version: '2.0.0', rating: 4.6, reviewCount: 560, installCount: 18000, pricing: 'free', features: ['Design import', 'Asset export', 'Comments sync', 'Version tracking'], permissions: ['Read designs', 'Export assets'], screenshots: [], status: 'available'
  },
  {
    id: 'int-5', name: 'QuickBooks', slug: 'quickbooks', description: 'Sync invoices and expenses with QuickBooks for accounting.', shortDescription: 'Accounting software', icon: '/integrations/quickbooks.svg', category: 'finance', developer: 'Intuit', version: '3.2.0', rating: 4.5, reviewCount: 780, installCount: 25000, pricing: 'freemium', features: ['Invoice sync', 'Expense tracking', 'Tax reporting', 'Financial reports'], permissions: ['Read transactions', 'Write invoices', 'Sync expenses'], screenshots: [], status: 'available'
  },
  {
    id: 'int-6', name: 'GitHub', slug: 'github', description: 'Connect repositories and track development progress.', shortDescription: 'Code collaboration', icon: '/integrations/github.svg', category: 'development', developer: 'GitHub', version: '2.8.0', rating: 4.8, reviewCount: 1100, installCount: 35000, pricing: 'free', features: ['Repository sync', 'Issue tracking', 'Pull request notifications', 'Commit linking'], permissions: ['Read repos', 'Read issues', 'Read pull requests'], screenshots: [], status: 'available'
  },
  {
    id: 'int-7', name: 'Mailchimp', slug: 'mailchimp', description: 'Sync contacts and automate email marketing campaigns.', shortDescription: 'Email marketing', icon: '/integrations/mailchimp.svg', category: 'marketing', developer: 'Mailchimp', version: '2.1.0', rating: 4.4, reviewCount: 450, installCount: 15000, pricing: 'freemium', features: ['Contact sync', 'Campaign automation', 'Analytics', 'Templates'], permissions: ['Read contacts', 'Manage campaigns', 'View reports'], screenshots: [], status: 'available'
  },
  {
    id: 'int-8', name: 'Notion', slug: 'notion', description: 'Sync tasks and documents with Notion workspaces.', shortDescription: 'Productivity workspace', icon: '/integrations/notion.svg', category: 'productivity', developer: 'Notion Labs', version: '1.5.0', rating: 4.7, reviewCount: 620, installCount: 22000, pricing: 'free', features: ['Page sync', 'Database integration', 'Task management', 'Document linking'], permissions: ['Read pages', 'Write pages', 'Manage databases'], screenshots: [], status: 'available'
  }
]

const mockInstalledIntegrations: InstalledIntegration[] = [
  {
    ...mockIntegrations[0],
    isEnabled: true,
    lastSynced: '2024-03-20T15:30:00Z',
    syncStatus: 'synced',
    usage: { apiCalls: 1250, dataTransferred: 5000000, lastUsed: '2024-03-20T15:30:00Z' }
  },
  {
    ...mockIntegrations[1],
    isEnabled: true,
    lastSynced: '2024-03-20T10:00:00Z',
    syncStatus: 'synced',
    usage: { apiCalls: 450, dataTransferred: 150000000, lastUsed: '2024-03-20T10:00:00Z' }
  },
  {
    ...mockIntegrations[2],
    isEnabled: true,
    lastSynced: '2024-03-20T16:00:00Z',
    syncStatus: 'synced',
    usage: { apiCalls: 89, dataTransferred: 500000, lastUsed: '2024-03-20T16:00:00Z' }
  }
]

// ============================================================================
// HOOK
// ============================================================================

interface UseIntegrationsMarketplaceOptions {
  
  category?: IntegrationCategory
}

export function useIntegrationsMarketplace(options: UseIntegrationsMarketplaceOptions = {}) {
  const {  category } = options

  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [installedIntegrations, setInstalledIntegrations] = useState<InstalledIntegration[]>([])
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInstalling, setIsInstalling] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchIntegrations = useCallback(async (filters?: { category?: string; search?: string; status?: string }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.category) params.set('category', filters.category)
      if (filters?.search) params.set('search', filters.search)
      if (filters?.status) params.set('status', filters.status)

      const response = await fetch(`/api/integrations/marketplace?${params}`)
      const result = await response.json()
      if (result.success) {
        setIntegrations(Array.isArray(result.integrations) ? result.integrations : [])
        setInstalledIntegrations(Array.isArray(result.installed) ? result.installed : [])
        return result.integrations
      }
      setIntegrations([])
      setInstalledIntegrations(mockInstalledIntegrations)
      return []
    } catch (err) {
      setIntegrations([])
      setInstalledIntegrations(mockInstalledIntegrations)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const installIntegration = useCallback(async (integrationId: string) => {
    setIsInstalling(true)
    try {
      const response = await fetch('/api/integrations/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId })
      })
      const result = await response.json()
      if (result.success) {
        setIntegrations(prev => prev.map(i =>
          i.id === integrationId ? { ...i, status: 'installed' as const, installedAt: new Date().toISOString() } : i
        ))
        await fetchIntegrations({ category })
      }
      return result
    } catch (err) {
      const integration = integrations.find(i => i.id === integrationId)
      if (integration) {
        const installed: InstalledIntegration = {
          ...integration,
          status: 'installed',
          installedAt: new Date().toISOString(),
          isEnabled: true,
          syncStatus: 'never',
          usage: { apiCalls: 0, dataTransferred: 0, lastUsed: new Date().toISOString() }
        }
        setInstalledIntegrations(prev => [...prev, installed])
        setIntegrations(prev => prev.map(i =>
          i.id === integrationId ? { ...i, status: 'installed' as const, installedAt: new Date().toISOString() } : i
        ))
      }
      return { success: true }
    } finally {
      setIsInstalling(false)
    }
  }, [integrations, fetchIntegrations, category])

  const uninstallIntegration = useCallback(async (integrationId: string) => {
    try {
      await fetch(`/api/integrations/${integrationId}`, { method: 'DELETE' })
      setInstalledIntegrations(prev => prev.filter(i => i.id !== integrationId))
      setIntegrations(prev => prev.map(i =>
        i.id === integrationId ? { ...i, status: 'available' as const, installedAt: undefined, connectedAt: undefined } : i
      ))
      return { success: true }
    } catch (err) {
      setInstalledIntegrations(prev => prev.filter(i => i.id !== integrationId))
      setIntegrations(prev => prev.map(i =>
        i.id === integrationId ? { ...i, status: 'available' as const } : i
      ))
      return { success: true }
    }
  }, [])

  const connectIntegration = useCallback(async (integrationId: string, credentials?: Record<string, string>) => {
    try {
      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId, credentials })
      })
      const result = await response.json()
      if (result.success) {
        setIntegrations(prev => prev.map(i =>
          i.id === integrationId ? { ...i, status: 'connected' as const, connectedAt: new Date().toISOString() } : i
        ))
        setInstalledIntegrations(prev => prev.map(i =>
          i.id === integrationId ? { ...i, status: 'connected' as const, connectedAt: new Date().toISOString() } : i
        ))
      }
      return result
    } catch (err) {
      setIntegrations(prev => prev.map(i =>
        i.id === integrationId ? { ...i, status: 'connected' as const, connectedAt: new Date().toISOString() } : i
      ))
      return { success: true }
    }
  }, [])

  const disconnectIntegration = useCallback(async (integrationId: string) => {
    try {
      await fetch(`/api/integrations/${integrationId}/disconnect`, { method: 'POST' })
      setIntegrations(prev => prev.map(i =>
        i.id === integrationId ? { ...i, status: 'installed' as const, connectedAt: undefined } : i
      ))
      setInstalledIntegrations(prev => prev.map(i =>
        i.id === integrationId ? { ...i, status: 'installed' as const, connectedAt: undefined } : i
      ))
      return { success: true }
    } catch (err) {
      setIntegrations(prev => prev.map(i =>
        i.id === integrationId ? { ...i, status: 'installed' as const, connectedAt: undefined } : i
      ))
      return { success: true }
    }
  }, [])

  const toggleIntegration = useCallback(async (integrationId: string, enabled: boolean) => {
    try {
      await fetch(`/api/integrations/${integrationId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })
      setInstalledIntegrations(prev => prev.map(i =>
        i.id === integrationId ? { ...i, isEnabled: enabled } : i
      ))
      return { success: true }
    } catch (err) {
      setInstalledIntegrations(prev => prev.map(i =>
        i.id === integrationId ? { ...i, isEnabled: enabled } : i
      ))
      return { success: true }
    }
  }, [])

  const syncIntegration = useCallback(async (integrationId: string) => {
    try {
      setInstalledIntegrations(prev => prev.map(i =>
        i.id === integrationId ? { ...i, syncStatus: 'syncing' as const } : i
      ))
      const response = await fetch(`/api/integrations/${integrationId}/sync`, { method: 'POST' })
      const result = await response.json()
      if (result.success) {
        setInstalledIntegrations(prev => prev.map(i =>
          i.id === integrationId ? { ...i, syncStatus: 'synced' as const, lastSynced: new Date().toISOString() } : i
        ))
      }
      return result
    } catch (err) {
      setInstalledIntegrations(prev => prev.map(i =>
        i.id === integrationId ? { ...i, syncStatus: 'synced' as const, lastSynced: new Date().toISOString() } : i
      ))
      return { success: true }
    }
  }, [])

  const updateConfig = useCallback(async (integrationId: string, config: Record<string, any>) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      const result = await response.json()
      if (result.success) {
        setIntegrations(prev => prev.map(i =>
          i.id === integrationId ? { ...i, config } : i
        ))
      }
      return result
    } catch (err) {
      setIntegrations(prev => prev.map(i =>
        i.id === integrationId ? { ...i, config } : i
      ))
      return { success: true }
    }
  }, [])

  const getOAuthUrl = useCallback(async (integrationId: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/oauth-url`)
      const result = await response.json()
      return result.success ? result.url : null
    } catch (err) {
      return null
    }
  }, [])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchIntegrations({ search: query, category })
  }, [fetchIntegrations, category])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchIntegrations({ category })
  }, [fetchIntegrations, category])

  useEffect(() => { refresh() }, [refresh])

  const categories = useMemo(() => ['productivity', 'communication', 'finance', 'storage', 'marketing', 'design', 'development', 'analytics'] as IntegrationCategory[], [])
  const featuredIntegrations = useMemo(() => integrations.filter(i => i.rating >= 4.7).slice(0, 6), [integrations])
  const popularIntegrations = useMemo(() => [...integrations].sort((a, b) => b.installCount - a.installCount).slice(0, 8), [integrations])
  const freeIntegrations = useMemo(() => integrations.filter(i => i.pricing === 'free'), [integrations])
  const connectedIntegrations = useMemo(() => installedIntegrations.filter(i => i.status === 'connected'), [installedIntegrations])
  const integrationsByCategory = useMemo(() => {
    const grouped: Record<string, Integration[]> = {}
    integrations.forEach(i => {
      if (!grouped[i.category]) grouped[i.category] = []
      grouped[i.category].push(i)
    })
    return grouped
  }, [integrations])

  return {
    integrations, installedIntegrations, selectedIntegration, categories,
    featuredIntegrations, popularIntegrations, freeIntegrations, connectedIntegrations, integrationsByCategory,
    isLoading, isInstalling, error, searchQuery,
    refresh, fetchIntegrations, installIntegration, uninstallIntegration,
    connectIntegration, disconnectIntegration, toggleIntegration, syncIntegration,
    updateConfig, getOAuthUrl, search, setSelectedIntegration
  }
}

export default useIntegrationsMarketplace
