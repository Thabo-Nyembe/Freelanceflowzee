'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import' | 'permission_change' | 'settings_change'
export type AuditCategory = 'authentication' | 'user_management' | 'data_access' | 'system_config' | 'security' | 'billing' | 'api'

export interface AuditLog {
  id: string
  timestamp: string
  action: AuditAction
  category: AuditCategory
  userId: string
  userName: string
  userEmail: string
  userRole: string
  ipAddress: string
  userAgent: string
  resourceType: string
  resourceId?: string
  resourceName?: string
  description: string
  changes?: AuditChange[]
  metadata: Record<string, any>
  status: 'success' | 'failure'
  errorMessage?: string
  sessionId?: string
  location?: GeoLocation
}

export interface AuditChange {
  field: string
  oldValue: any
  newValue: any
}

export interface GeoLocation {
  country: string
  region: string
  city: string
  latitude?: number
  longitude?: number
}

export interface AuditFilter {
  startDate?: string
  endDate?: string
  actions?: AuditAction[]
  categories?: AuditCategory[]
  userId?: string
  resourceType?: string
  status?: 'success' | 'failure'
  ipAddress?: string
  searchQuery?: string
}

export interface AuditStats {
  totalLogs: number
  logsToday: number
  failedAttempts: number
  uniqueUsers: number
  byAction: Record<AuditAction, number>
  byCategory: Record<AuditCategory, number>
  topUsers: { userId: string; userName: string; count: number }[]
  activityTrend: { date: string; count: number }[]
  securityEvents: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockAuditLogs: AuditLog[] = [
  { id: 'log-1', timestamp: '2024-03-20T10:30:00Z', action: 'login', category: 'authentication', userId: 'user-1', userName: 'Alex Chen', userEmail: 'alex@example.com', userRole: 'admin', ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0 Chrome/120', resourceType: 'session', description: 'User logged in successfully', metadata: { mfaUsed: true }, status: 'success', sessionId: 'sess-123', location: { country: 'United States', region: 'California', city: 'San Francisco' } },
  { id: 'log-2', timestamp: '2024-03-20T10:25:00Z', action: 'update', category: 'user_management', userId: 'user-1', userName: 'Alex Chen', userEmail: 'alex@example.com', userRole: 'admin', ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0 Chrome/120', resourceType: 'user', resourceId: 'user-5', resourceName: 'Lisa Chen', description: 'Updated user role', changes: [{ field: 'role', oldValue: 'member', newValue: 'admin' }], metadata: {}, status: 'success', sessionId: 'sess-123' },
  { id: 'log-3', timestamp: '2024-03-20T10:20:00Z', action: 'export', category: 'data_access', userId: 'user-2', userName: 'Sarah Miller', userEmail: 'sarah@example.com', userRole: 'manager', ipAddress: '192.168.1.105', userAgent: 'Mozilla/5.0 Firefox/121', resourceType: 'report', resourceId: 'rep-12', resourceName: 'Monthly Sales Report', description: 'Exported report to PDF', metadata: { format: 'pdf', recordCount: 1500 }, status: 'success' },
  { id: 'log-4', timestamp: '2024-03-20T10:15:00Z', action: 'login', category: 'authentication', userId: 'unknown', userName: 'unknown', userEmail: 'hacker@evil.com', userRole: 'none', ipAddress: '45.33.32.156', userAgent: 'Python/3.9', resourceType: 'session', description: 'Failed login attempt - invalid credentials', metadata: { attemptedEmail: 'admin@example.com' }, status: 'failure', errorMessage: 'Invalid email or password', location: { country: 'Russia', region: 'Moscow', city: 'Moscow' } },
  { id: 'log-5', timestamp: '2024-03-20T10:10:00Z', action: 'delete', category: 'data_access', userId: 'user-3', userName: 'Mike Johnson', userEmail: 'mike@example.com', userRole: 'member', ipAddress: '192.168.1.110', userAgent: 'Mozilla/5.0 Safari/17', resourceType: 'document', resourceId: 'doc-45', resourceName: 'Q4 Budget Draft', description: 'Deleted document', metadata: { permanentDelete: false }, status: 'success' },
  { id: 'log-6', timestamp: '2024-03-20T10:05:00Z', action: 'settings_change', category: 'system_config', userId: 'user-1', userName: 'Alex Chen', userEmail: 'alex@example.com', userRole: 'admin', ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0 Chrome/120', resourceType: 'settings', description: 'Updated security settings', changes: [{ field: 'mfaRequired', oldValue: false, newValue: true }], metadata: {}, status: 'success' }
]

const mockStats: AuditStats = {
  totalLogs: 15420,
  logsToday: 245,
  failedAttempts: 18,
  uniqueUsers: 85,
  byAction: { create: 2500, read: 8000, update: 3200, delete: 450, login: 890, logout: 820, export: 320, import: 120, permission_change: 80, settings_change: 40 },
  byCategory: { authentication: 1710, user_management: 580, data_access: 11200, system_config: 120, security: 250, billing: 380, api: 1180 },
  topUsers: [{ userId: 'user-1', userName: 'Alex Chen', count: 2450 }, { userId: 'user-2', userName: 'Sarah Miller', count: 1820 }, { userId: 'user-3', userName: 'Mike Johnson', count: 1560 }],
  activityTrend: Array.from({ length: 7 }, (_, i) => ({ date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0], count: 200 + Math.floor(Math.random() * 100) })),
  securityEvents: 45
}

// ============================================================================
// HOOK
// ============================================================================

interface UseAuditLogsOptions {
  
  pageSize?: number
}

export function useAuditLogs(options: UseAuditLogsOptions = {}) {
  const {  pageSize = 50 } = options

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [currentLog, setCurrentLog] = useState<AuditLog | null>(null)
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [filters, setFilters] = useState<AuditFilter>({})
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      if (filters.startDate) params.set('startDate', filters.startDate)
      if (filters.endDate) params.set('endDate', filters.endDate)
      if (filters.actions?.length) params.set('actions', filters.actions.join(','))
      if (filters.categories?.length) params.set('categories', filters.categories.join(','))
      if (filters.userId) params.set('userId', filters.userId)
      if (filters.status) params.set('status', filters.status)
      if (filters.searchQuery) params.set('search', filters.searchQuery)

      const response = await fetch(`/api/audit-logs?${params}`)
      const result = await response.json()
      if (result.success) {
        setLogs(Array.isArray(result.logs) ? result.logs : [])
        setStats(result.stats || null)
        setTotalPages(result.totalPages || 1)
        return result.logs
      }
      setLogs([])
      return []
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch audit logs'))
      setLogs([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, filters])

  const getLogsByUser = useCallback((userId: string) => {
    return logs.filter(l => l.userId === userId)
  }, [logs])

  const getLogsByResource = useCallback((resourceType: string, resourceId?: string) => {
    return logs.filter(l => l.resourceType === resourceType && (!resourceId || l.resourceId === resourceId))
  }, [logs])

  const getSecurityEvents = useCallback(() => {
    return logs.filter(l => l.category === 'security' || (l.action === 'login' && l.status === 'failure') || l.action === 'permission_change')
  }, [logs])

  const getRecentActivity = useCallback((userId: string, limit = 10) => {
    return logs.filter(l => l.userId === userId).slice(0, limit)
  }, [logs])

  const getActionColor = useCallback((action: AuditAction): string => {
    switch (action) {
      case 'create': return '#22c55e'
      case 'read': return '#3b82f6'
      case 'update': return '#f59e0b'
      case 'delete': return '#ef4444'
      case 'login': return '#10b981'
      case 'logout': return '#6b7280'
      case 'export': return '#8b5cf6'
      case 'import': return '#06b6d4'
      case 'permission_change': return '#ec4899'
      case 'settings_change': return '#f97316'
    }
  }, [])

  const formatTimestamp = useCallback((timestamp: string): string => {
    return new Date(timestamp).toLocaleString()
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchAuditLogs()
  }, [fetchAuditLogs])

  useEffect(() => { refresh() }, [refresh])

  // Apply filters
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false
      if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) return false
      if (filters.actions?.length && !filters.actions.includes(log.action)) return false
      if (filters.categories?.length && !filters.categories.includes(log.category)) return false
      if (filters.userId && log.userId !== filters.userId) return false
      if (filters.resourceType && log.resourceType !== filters.resourceType) return false
      if (filters.status && log.status !== filters.status) return false
      if (filters.ipAddress && log.ipAddress !== filters.ipAddress) return false
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        if (!log.description.toLowerCase().includes(query) &&
            !log.userName.toLowerCase().includes(query) &&
            !log.resourceName?.toLowerCase().includes(query)) return false
      }
      return true
    })
  }, [logs, filters])

  // Computed values
  const failedLogins = useMemo(() => logs.filter(l => l.action === 'login' && l.status === 'failure'), [logs])
  const todayLogs = useMemo(() => {
    const today = new Date().toDateString()
    return logs.filter(l => new Date(l.timestamp).toDateString() === today)
  }, [logs])
  const securityEvents = useMemo(() => getSecurityEvents(), [getSecurityEvents])

  return {
    logs: filteredLogs, currentLog, stats, filters,
    page, totalPages, failedLogins, todayLogs, securityEvents,
    isLoading, isExporting, error,
    refresh, filterLogs, clearFilters, searchLogs, exportLogs,
    getLogsByUser, getLogsByResource, getSecurityEvents, getRecentActivity,
    getActionColor, formatTimestamp,
    setPage, setCurrentLog
  }
}

export default useAuditLogs
