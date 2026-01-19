/**
 * Directory Sync Hook
 *
 * React hook for managing directory sync connections and operations
 */

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

export type DirectoryProvider = 'azure_ad' | 'google_workspace' | 'okta' | 'onelogin' | 'ldap'

export interface DirectoryConnection {
  id: string
  organization_id: string
  provider: DirectoryProvider
  name: string
  config: Record<string, unknown>
  sync_options: {
    autoProvision: boolean
    autoDeprovision: boolean
    syncGroups: boolean
    syncInterval: number
  }
  is_active: boolean
  sync_status: 'idle' | 'syncing' | 'error'
  last_sync_started_at: string | null
  last_sync_completed_at: string | null
  last_sync_error: string | null
  total_users_synced: number
  total_groups_synced: number
  created_at: string
  updated_at: string
}

export interface SyncLog {
  id: string
  connection_id: string
  job_id: string | null
  operation: string
  status: 'success' | 'failure' | 'partial' | 'in_progress'
  users_synced: number
  users_created: number
  users_updated: number
  users_deprovisioned: number
  groups_synced: number
  duration_ms: number | null
  error_message: string | null
  details: Record<string, unknown>
  created_at: string
}

export interface AttributeMapping {
  id: string
  connection_id: string
  source_attribute: string
  target_attribute: string
  transform: string | null
  is_required: boolean
}

export interface SyncStats {
  total_syncs: number
  successful_syncs: number
  failed_syncs: number
  total_users_synced: number
  total_users_created: number
  total_users_updated: number
  total_users_deprovisioned: number
  total_groups_synced: number
  avg_duration_ms: number
}

interface UseDirectorySyncReturn {
  connections: DirectoryConnection[]
  selectedConnection: DirectoryConnection | null
  syncLogs: SyncLog[]
  attributeMappings: AttributeMapping[]
  stats: SyncStats | null
  isLoading: boolean
  isSyncing: boolean
  error: string | null

  // Connection management
  fetchConnections: (organizationId: string) => Promise<void>
  fetchConnection: (connectionId: string) => Promise<void>
  createConnection: (data: CreateConnectionData) => Promise<string | null>
  updateConnection: (connectionId: string, data: UpdateConnectionData) => Promise<boolean>
  deleteConnection: (connectionId: string) => Promise<boolean>

  // Sync operations
  triggerSync: (connectionId: string, syncType?: 'full' | 'incremental') => Promise<boolean>
  fetchSyncLogs: (connectionId: string, limit?: number) => Promise<void>

  // Attribute mappings
  fetchMappings: (connectionId: string) => Promise<void>
  updateMappings: (connectionId: string, mappings: Omit<AttributeMapping, 'id' | 'connection_id'>[]) => Promise<boolean>

  // Utilities
  getProviderLabel: (provider: DirectoryProvider) => string
  getProviderIcon: (provider: DirectoryProvider) => string
  clearError: () => void
}

interface CreateConnectionData {
  organizationId: string
  provider: DirectoryProvider
  name: string
  config: Record<string, unknown>
  syncOptions?: {
    autoProvision?: boolean
    autoDeprovision?: boolean
    syncGroups?: boolean
    syncInterval?: number
  }
}

interface UpdateConnectionData {
  name?: string
  config?: Record<string, unknown>
  syncOptions?: {
    autoProvision?: boolean
    autoDeprovision?: boolean
    syncGroups?: boolean
    syncInterval?: number
  }
  isActive?: boolean
}

export function useDirectorySync(): UseDirectorySyncReturn {
  const [connections, setConnections] = useState<DirectoryConnection[]>([])
  const [selectedConnection, setSelectedConnection] = useState<DirectoryConnection | null>(null)
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([])
  const [attributeMappings, setAttributeMappings] = useState<AttributeMapping[]>([])
  const [stats, setStats] = useState<SyncStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Provider display helpers
  const getProviderLabel = useCallback((provider: DirectoryProvider): string => {
    const labels: Record<DirectoryProvider, string> = {
      azure_ad: 'Microsoft Entra ID (Azure AD)',
      google_workspace: 'Google Workspace',
      okta: 'Okta',
      onelogin: 'OneLogin',
      ldap: 'LDAP / Active Directory'
    }
    return labels[provider] || provider
  }, [])

  const getProviderIcon = useCallback((provider: DirectoryProvider): string => {
    const icons: Record<DirectoryProvider, string> = {
      azure_ad: '🔷',
      google_workspace: '🔵',
      okta: '⚪',
      onelogin: '🟣',
      ldap: '📁'
    }
    return icons[provider] || '🔗'
  }, [])

  // Fetch all connections for organization
  const fetchConnections = useCallback(async (organizationId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/auth/directory/connections?organizationId=${organizationId}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch connections')
      }

      setConnections(data.connections || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch connections'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch single connection details
  const fetchConnection = useCallback(async (connectionId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/auth/directory/connections/${connectionId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch connection')
      }

      setSelectedConnection(data.connection)
      setStats(data.connection.stats || null)
      setAttributeMappings(data.connection.attributeMappings || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch connection'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create new connection
  const createConnection = useCallback(async (data: CreateConnectionData): Promise<string | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/directory/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create connection')
      }

      toast.success('Directory connection created')

      // Refresh connections list
      await fetchConnections(data.organizationId)

      return result.connectionId
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create connection'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [fetchConnections])

  // Update connection
  const updateConnection = useCallback(async (
    connectionId: string,
    data: UpdateConnectionData
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/auth/directory/connections/${connectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update connection')
      }

      setSelectedConnection(result.connection)
      toast.success('Connection updated')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update connection'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Delete connection
  const deleteConnection = useCallback(async (connectionId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/auth/directory/connections/${connectionId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete connection')
      }

      // Remove from local state
      setConnections(prev => prev.filter(c => c.id !== connectionId))
      if (selectedConnection?.id === connectionId) {
        setSelectedConnection(null)
      }

      toast.success('Connection deleted')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete connection'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [selectedConnection])

  // Trigger sync
  const triggerSync = useCallback(async (
    connectionId: string,
    syncType: 'full' | 'incremental' = 'incremental'
  ): Promise<boolean> => {
    setIsSyncing(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/directory/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, syncType })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to trigger sync')
      }

      toast.success(result.message || 'Sync started')

      // Update connection status
      setConnections(prev => prev.map(c =>
        c.id === connectionId
          ? { ...c, sync_status: 'syncing' }
          : c
      ))
      if (selectedConnection?.id === connectionId) {
        setSelectedConnection(prev => prev ? { ...prev, sync_status: 'syncing' } : null)
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to trigger sync'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setIsSyncing(false)
    }
  }, [selectedConnection])

  // Fetch sync logs
  const fetchSyncLogs = useCallback(async (
    connectionId: string,
    limit: number = 50
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/auth/directory/sync?connectionId=${connectionId}&limit=${limit}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sync logs')
      }

      setSyncLogs(data.logs || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sync logs'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch attribute mappings
  const fetchMappings = useCallback(async (connectionId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/auth/directory/mappings?connectionId=${connectionId}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch mappings')
      }

      setAttributeMappings(data.mappings || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch mappings'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update attribute mappings
  const updateMappings = useCallback(async (
    connectionId: string,
    mappings: Omit<AttributeMapping, 'id' | 'connection_id'>[]
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/directory/mappings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, mappings })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update mappings')
      }

      setAttributeMappings(result.mappings || [])
      toast.success('Attribute mappings updated')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update mappings'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Poll for sync status updates when syncing
  useEffect(() => {
    if (!selectedConnection || selectedConnection.sync_status !== 'syncing') {
      return
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/auth/directory/connections/${selectedConnection.id}`)
        const data = await response.json()

        if (response.ok && data.connection) {
          setSelectedConnection(data.connection)

          // If sync completed, refresh logs
          if (data.connection.sync_status !== 'syncing') {
            await fetchSyncLogs(selectedConnection.id)
          }
        }
      } catch {
        // Silently fail polling
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedConnection, fetchSyncLogs])

  return {
    connections,
    selectedConnection,
    syncLogs,
    attributeMappings,
    stats,
    isLoading,
    isSyncing,
    error,
    fetchConnections,
    fetchConnection,
    createConnection,
    updateConnection,
    deleteConnection,
    triggerSync,
    fetchSyncLogs,
    fetchMappings,
    updateMappings,
    getProviderLabel,
    getProviderIcon,
    clearError
  }
}

export default useDirectorySync
