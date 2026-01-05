'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending'
export type IntegrationCategory = 'crm' | 'communication' | 'storage' | 'analytics' | 'payment' | 'marketing' | 'productivity' | 'development'

export interface Integration {
  id: string
  name: string
  slug: string
  description: string
  category: IntegrationCategory
  iconUrl?: string
  status: IntegrationStatus
  connection: IntegrationConnection
  syncSettings: SyncSettings
  fieldMappings: FieldMapping[]
  webhooks: IntegrationWebhook[]
  lastSyncAt?: string
  lastErrorAt?: string
  lastError?: string
  syncCount: number
  errorCount: number
  createdAt: string
  updatedAt: string
}

export interface IntegrationConnection {
  type: 'oauth' | 'api_key' | 'basic_auth' | 'custom'
  accessToken?: string
  refreshToken?: string
  apiKey?: string
  baseUrl?: string
  expiresAt?: string
  scopes: string[]
  metadata: Record<string, any>
}

export interface SyncSettings {
  isEnabled: boolean
  direction: 'import' | 'export' | 'bidirectional'
  interval: number // minutes
  entities: string[]
  filters: SyncFilter[]
  conflictResolution: 'source_wins' | 'target_wins' | 'manual' | 'newest_wins'
}

export interface SyncFilter {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than'
  value: any
}

export interface FieldMapping {
  id: string
  sourceField: string
  targetField: string
  transform?: 'none' | 'uppercase' | 'lowercase' | 'date_format' | 'custom'
  transformConfig?: string
  isRequired: boolean
}

export interface IntegrationWebhook {
  id: string
  event: string
  url: string
  isEnabled: boolean
  lastTriggeredAt?: string
}

export interface IntegrationLog {
  id: string
  integrationId: string
  type: 'sync' | 'webhook' | 'error' | 'connection'
  action: string
  status: 'success' | 'failed' | 'pending'
  recordsProcessed?: number
  recordsFailed?: number
  details?: string
  error?: string
  duration: number
  timestamp: string
}

export interface AvailableIntegration {
  id: string
  name: string
  slug: string
  description: string
  longDescription?: string
  category: IntegrationCategory
  iconUrl?: string
  features: string[]
  authType: 'oauth' | 'api_key' | 'basic_auth' | 'custom'
  requiredScopes: string[]
  supportedEntities: string[]
  pricing?: 'free' | 'premium' | 'enterprise'
  setupGuideUrl?: string
  documentationUrl?: string
  isPopular: boolean
}

export interface IntegrationStats {
  totalIntegrations: number
  connectedIntegrations: number
  totalSyncs: number
  successfulSyncs: number
  failedSyncs: number
  recordsSynced: number
  syncsByIntegration: { integrationId: string; name: string; count: number }[]
  syncTrend: { date: string; success: number; failed: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockIntegrations: Integration[] = [
  {
    id: 'int-1',
    name: 'Salesforce',
    slug: 'salesforce',
    description: 'Sync contacts, leads, and opportunities with Salesforce CRM.',
    category: 'crm',
    iconUrl: '/integrations/salesforce.png',
    status: 'connected',
    connection: {
      type: 'oauth',
      accessToken: 'xxx',
      refreshToken: 'xxx',
      expiresAt: '2024-04-20T00:00:00Z',
      scopes: ['read', 'write', 'offline_access'],
      metadata: { instanceUrl: 'https://company.salesforce.com' }
    },
    syncSettings: {
      isEnabled: true,
      direction: 'bidirectional',
      interval: 15,
      entities: ['contacts', 'leads', 'opportunities'],
      filters: [],
      conflictResolution: 'newest_wins'
    },
    fieldMappings: [
      { id: 'fm-1', sourceField: 'name', targetField: 'Name', isRequired: true },
      { id: 'fm-2', sourceField: 'email', targetField: 'Email', isRequired: true },
      { id: 'fm-3', sourceField: 'phone', targetField: 'Phone', isRequired: false }
    ],
    webhooks: [
      { id: 'wh-1', event: 'contact.created', url: '/api/webhooks/salesforce', isEnabled: true }
    ],
    lastSyncAt: '2024-03-20T10:00:00Z',
    syncCount: 1250,
    errorCount: 12,
    createdAt: '2024-01-15',
    updatedAt: '2024-03-20'
  },
  {
    id: 'int-2',
    name: 'Slack',
    slug: 'slack',
    description: 'Send notifications and updates to Slack channels.',
    category: 'communication',
    iconUrl: '/integrations/slack.png',
    status: 'connected',
    connection: {
      type: 'oauth',
      accessToken: 'xoxb-xxx',
      scopes: ['chat:write', 'channels:read'],
      metadata: { teamId: 'T12345', teamName: 'Company Workspace' }
    },
    syncSettings: {
      isEnabled: true,
      direction: 'export',
      interval: 0,
      entities: ['notifications'],
      filters: [],
      conflictResolution: 'source_wins'
    },
    fieldMappings: [],
    webhooks: [],
    lastSyncAt: '2024-03-20T09:45:00Z',
    syncCount: 5420,
    errorCount: 8,
    createdAt: '2024-02-01',
    updatedAt: '2024-03-20'
  },
  {
    id: 'int-3',
    name: 'Google Drive',
    slug: 'google-drive',
    description: 'Sync files and documents with Google Drive.',
    category: 'storage',
    iconUrl: '/integrations/gdrive.png',
    status: 'error',
    connection: {
      type: 'oauth',
      accessToken: 'xxx',
      expiresAt: '2024-03-19T00:00:00Z',
      scopes: ['drive.file'],
      metadata: {}
    },
    syncSettings: {
      isEnabled: true,
      direction: 'bidirectional',
      interval: 30,
      entities: ['files'],
      filters: [],
      conflictResolution: 'manual'
    },
    fieldMappings: [],
    webhooks: [],
    lastSyncAt: '2024-03-19T08:00:00Z',
    lastErrorAt: '2024-03-19T08:30:00Z',
    lastError: 'Token expired. Please reconnect.',
    syncCount: 890,
    errorCount: 45,
    createdAt: '2024-01-20',
    updatedAt: '2024-03-19'
  }
]

const mockAvailableIntegrations: AvailableIntegration[] = [
  {
    id: 'avail-1',
    name: 'HubSpot',
    slug: 'hubspot',
    description: 'Connect with HubSpot CRM for contact and deal management.',
    category: 'crm',
    iconUrl: '/integrations/hubspot.png',
    features: ['Contact sync', 'Deal tracking', 'Email tracking', 'Forms integration'],
    authType: 'oauth',
    requiredScopes: ['contacts', 'deals'],
    supportedEntities: ['contacts', 'companies', 'deals'],
    pricing: 'free',
    isPopular: true
  },
  {
    id: 'avail-2',
    name: 'Stripe',
    slug: 'stripe',
    description: 'Process payments and sync subscription data.',
    category: 'payment',
    iconUrl: '/integrations/stripe.png',
    features: ['Payment processing', 'Subscription management', 'Invoice sync'],
    authType: 'api_key',
    requiredScopes: [],
    supportedEntities: ['payments', 'subscriptions', 'invoices'],
    pricing: 'free',
    isPopular: true
  },
  {
    id: 'avail-3',
    name: 'Mailchimp',
    slug: 'mailchimp',
    description: 'Sync contacts and manage email campaigns.',
    category: 'marketing',
    iconUrl: '/integrations/mailchimp.png',
    features: ['Audience sync', 'Campaign tracking', 'Automation triggers'],
    authType: 'oauth',
    requiredScopes: ['lists', 'campaigns'],
    supportedEntities: ['contacts', 'campaigns', 'automations'],
    pricing: 'free',
    isPopular: true
  }
]

const mockLogs: IntegrationLog[] = [
  { id: 'log-1', integrationId: 'int-1', type: 'sync', action: 'Full sync', status: 'success', recordsProcessed: 150, recordsFailed: 2, duration: 12500, timestamp: '2024-03-20T10:00:00Z' },
  { id: 'log-2', integrationId: 'int-2', type: 'webhook', action: 'Send notification', status: 'success', duration: 250, timestamp: '2024-03-20T09:45:00Z' },
  { id: 'log-3', integrationId: 'int-3', type: 'error', action: 'Token refresh', status: 'failed', error: 'Token expired', duration: 100, timestamp: '2024-03-19T08:30:00Z' }
]

const mockStats: IntegrationStats = {
  totalIntegrations: 12,
  connectedIntegrations: 8,
  totalSyncs: 45000,
  successfulSyncs: 44200,
  failedSyncs: 800,
  recordsSynced: 1250000,
  syncsByIntegration: [
    { integrationId: 'int-1', name: 'Salesforce', count: 15000 },
    { integrationId: 'int-2', name: 'Slack', count: 25000 }
  ],
  syncTrend: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    success: 600 + Math.floor(Math.random() * 100),
    failed: Math.floor(Math.random() * 20)
  }))
}

// ============================================================================
// HOOK
// ============================================================================

interface UseIntegrationsOptions {
  
}

export function useIntegrations(options: UseIntegrationsOptions = {}) {
  const {  } = options

  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [availableIntegrations, setAvailableIntegrations] = useState<AvailableIntegration[]>([])
  const [logs, setLogs] = useState<IntegrationLog[]>([])
  const [currentIntegration, setCurrentIntegration] = useState<Integration | null>(null)
  const [stats, setStats] = useState<IntegrationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchIntegrations = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/integrations')
      const result = await response.json()
      if (result.success) {
        setIntegrations(Array.isArray(result.integrations) ? result.integrations : [])
        setAvailableIntegrations(Array.isArray(result.available) ? result.available : [])
        setStats(result.stats || null)
        return result.integrations
      }
      setIntegrations([])
      return []
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch integrations'))
      setIntegrations([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const connectIntegration = useCallback(async (availableId: string, credentials?: Record<string, string>) => {
    setIsConnecting(true)
    try {
      const available = availableIntegrations.find(a => a.id === availableId)
      if (!available) return { success: false, error: 'Integration not found' }

      const integration: Integration = {
        id: `int-${Date.now()}`,
        name: available.name,
        slug: available.slug,
        description: available.description,
        category: available.category,
        iconUrl: available.iconUrl,
        status: 'connected',
        connection: {
          type: available.authType,
          scopes: available.requiredScopes,
          metadata: credentials || {}
        },
        syncSettings: {
          isEnabled: false,
          direction: 'bidirectional',
          interval: 15,
          entities: available.supportedEntities,
          filters: [],
          conflictResolution: 'newest_wins'
        },
        fieldMappings: [],
        webhooks: [],
        syncCount: 0,
        errorCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setIntegrations(prev => [integration, ...prev])
      return { success: true, integration }
    } finally {
      setIsConnecting(false)
    }
  }, [availableIntegrations])

  const disconnectIntegration = useCallback(async (integrationId: string) => {
    setIntegrations(prev => prev.map(i => i.id === integrationId ? {
      ...i,
      status: 'disconnected' as const,
      updatedAt: new Date().toISOString()
    } : i))
    return { success: true }
  }, [])

  const reconnectIntegration = useCallback(async (integrationId: string) => {
    setIsConnecting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIntegrations(prev => prev.map(i => i.id === integrationId ? {
        ...i,
        status: 'connected' as const,
        lastError: undefined,
        lastErrorAt: undefined,
        updatedAt: new Date().toISOString()
      } : i))
      return { success: true }
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const deleteIntegration = useCallback(async (integrationId: string) => {
    setIntegrations(prev => prev.filter(i => i.id !== integrationId))
    return { success: true }
  }, [])

  const triggerSync = useCallback(async (integrationId: string) => {
    setIsSyncing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      const success = Math.random() > 0.1

      const log: IntegrationLog = {
        id: `log-${Date.now()}`,
        integrationId,
        type: 'sync',
        action: 'Manual sync',
        status: success ? 'success' : 'failed',
        recordsProcessed: success ? Math.floor(Math.random() * 100) + 10 : 0,
        recordsFailed: success ? Math.floor(Math.random() * 5) : 0,
        error: success ? undefined : 'Sync failed due to connection error',
        duration: 5000 + Math.floor(Math.random() * 10000),
        timestamp: new Date().toISOString()
      }

      setLogs(prev => [log, ...prev])
      setIntegrations(prev => prev.map(i => i.id === integrationId ? {
        ...i,
        lastSyncAt: new Date().toISOString(),
        syncCount: i.syncCount + 1,
        errorCount: success ? i.errorCount : i.errorCount + 1,
        lastError: success ? undefined : log.error,
        lastErrorAt: success ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } : i))

      return { success, log }
    } finally {
      setIsSyncing(false)
    }
  }, [])

  const updateSyncSettings = useCallback(async (integrationId: string, settings: Partial<SyncSettings>) => {
    setIntegrations(prev => prev.map(i => i.id === integrationId ? {
      ...i,
      syncSettings: { ...i.syncSettings, ...settings },
      updatedAt: new Date().toISOString()
    } : i))
    return { success: true }
  }, [])

  const updateFieldMappings = useCallback(async (integrationId: string, mappings: FieldMapping[]) => {
    setIntegrations(prev => prev.map(i => i.id === integrationId ? {
      ...i,
      fieldMappings: mappings,
      updatedAt: new Date().toISOString()
    } : i))
    return { success: true }
  }, [])

  const addFieldMapping = useCallback(async (integrationId: string, mapping: Omit<FieldMapping, 'id'>) => {
    const newMapping: FieldMapping = {
      ...mapping,
      id: `fm-${Date.now()}`
    }
    setIntegrations(prev => prev.map(i => i.id === integrationId ? {
      ...i,
      fieldMappings: [...i.fieldMappings, newMapping],
      updatedAt: new Date().toISOString()
    } : i))
    return { success: true, mapping: newMapping }
  }, [])

  const removeFieldMapping = useCallback(async (integrationId: string, mappingId: string) => {
    setIntegrations(prev => prev.map(i => i.id === integrationId ? {
      ...i,
      fieldMappings: i.fieldMappings.filter(m => m.id !== mappingId),
      updatedAt: new Date().toISOString()
    } : i))
    return { success: true }
  }, [])

  const getLogsByIntegration = useCallback((integrationId: string) => {
    return logs.filter(l => l.integrationId === integrationId)
  }, [logs])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchIntegrations()
  }, [fetchIntegrations])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const connectedIntegrations = useMemo(() => integrations.filter(i => i.status === 'connected'), [integrations])
  const disconnectedIntegrations = useMemo(() => integrations.filter(i => i.status === 'disconnected'), [integrations])
  const errorIntegrations = useMemo(() => integrations.filter(i => i.status === 'error'), [integrations])
  const integrationsByCategory = useMemo(() => {
    const grouped: Record<IntegrationCategory, Integration[]> = {
      crm: [], communication: [], storage: [], analytics: [],
      payment: [], marketing: [], productivity: [], development: []
    }
    integrations.forEach(i => grouped[i.category].push(i))
    return grouped
  }, [integrations])
  const recentLogs = useMemo(() => logs.slice(0, 50), [logs])
  const failedLogs = useMemo(() => logs.filter(l => l.status === 'failed'), [logs])

  return {
    integrations, availableIntegrations, logs, currentIntegration, stats,
    connectedIntegrations, disconnectedIntegrations, errorIntegrations, integrationsByCategory,
    recentLogs, failedLogs,
    isLoading, isConnecting, isSyncing, error,
    refresh, connectIntegration, disconnectIntegration, reconnectIntegration, deleteIntegration,
    triggerSync, updateSyncSettings, updateFieldMappings, addFieldMapping, removeFieldMapping,
    getLogsByIntegration, setCurrentIntegration
  }
}

export default useIntegrations
