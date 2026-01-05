'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'
export type LogSource = 'system' | 'api' | 'auth' | 'database' | 'worker' | 'integration'

export interface SystemLog {
  id: string
  timestamp: string
  level: LogLevel
  source: LogSource
  message: string
  details?: Record<string, unknown>
  userId?: string
  requestId?: string
  duration?: number
  statusCode?: number
  path?: string
  method?: string
  ip?: string
}

export interface LogStats {
  total: number
  byLevel: Record<LogLevel, number>
  bySource: Record<LogSource, number>
  errorRate: number
  avgResponseTime: number
}

export interface AuditLog {
  id: string
  action: string
  resource: string
  userId: string
  timestamp: string
  details?: Record<string, unknown>
}

export interface ActivityLog {
  id: string
  type: string
  action: string
  userId: string
  timestamp: string
}

export interface LogAlert {
  id: string
  level?: LogLevel
  source?: LogSource
  keyword?: string
  threshold: number
  windowMinutes: number
  notifyEmail?: string
  isActive: boolean
}

// ============================================================================
// MOCK DATA
// ============================================================================

const generateMockLogs = (): SystemLog[] => {
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'critical']
  const sources: LogSource[] = ['system', 'api', 'auth', 'database', 'worker', 'integration']
  const methods = ['GET', 'POST', 'PUT', 'DELETE']
  const paths = ['/api/users', '/api/projects', '/api/invoices', '/api/tasks', '/api/auth/login']

  const messages: Record<LogLevel, string[]> = {
    debug: ['Cache miss for key', 'Query executed', 'Processing request'],
    info: ['User logged in', 'Project created', 'Invoice generated', 'File uploaded'],
    warn: ['Rate limit approaching', 'Slow query detected', 'Memory usage high'],
    error: ['Failed to process request', 'Database error', 'Authentication failed'],
    critical: ['Service unavailable', 'Database connection lost', 'Memory exhausted']
  }

  const logs: SystemLog[] = []
  const now = Date.now()

  for (let i = 0; i < 30; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)]
    const source = sources[Math.floor(Math.random() * sources.length)]
    const messageOptions = messages[level]
    const message = messageOptions[Math.floor(Math.random() * messageOptions.length)]

    logs.push({
      id: `log-${i + 1}`,
      timestamp: new Date(now - i * 60000 * Math.random() * 10).toISOString(),
      level,
      source,
      message: `${message} [${source}]`,
      details: level === 'error' || level === 'critical' ? { stack: 'Error trace...' } : undefined,
      requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
      duration: Math.floor(Math.random() * 500) + 10,
      statusCode: level === 'error' ? 500 : 200,
      path: paths[Math.floor(Math.random() * paths.length)],
      method: methods[Math.floor(Math.random() * methods.length)]
    })
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

const mockLogs = generateMockLogs()

const mockStats: LogStats = {
  total: mockLogs.length,
  byLevel: {
    debug: mockLogs.filter(l => l.level === 'debug').length,
    info: mockLogs.filter(l => l.level === 'info').length,
    warn: mockLogs.filter(l => l.level === 'warn').length,
    error: mockLogs.filter(l => l.level === 'error').length,
    critical: mockLogs.filter(l => l.level === 'critical').length
  },
  bySource: {
    system: mockLogs.filter(l => l.source === 'system').length,
    api: mockLogs.filter(l => l.source === 'api').length,
    auth: mockLogs.filter(l => l.source === 'auth').length,
    database: mockLogs.filter(l => l.source === 'database').length,
    worker: mockLogs.filter(l => l.source === 'worker').length,
    integration: mockLogs.filter(l => l.source === 'integration').length
  },
  errorRate: 12.5,
  avgResponseTime: 145
}

// ============================================================================
// HOOK
// ============================================================================

interface UseSystemLogsOptions {
  
  autoRefresh?: boolean
  refreshInterval?: number
  level?: LogLevel
  source?: LogSource
  limit?: number
}

export function useSystemLogs(options: UseSystemLogsOptions = {}) {
  const {
    
    autoRefresh = false,
    refreshInterval = 10000,
    level,
    source,
    limit = 50,
  } = options

  // State
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [errorLogs, setErrorLogs] = useState<SystemLog[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch all logs
  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/logs?action=stats')
      const result = await response.json()
      if (result.success) {
        setStats(result.stats)
        return result.stats
      }
      setStats(null)
      return []
    } catch (err) {
      console.error('Error fetching stats:', err)
      setStats(null)
      return []
    }
  }, [])

  // Fetch error logs
  const fetchErrorLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/logs?action=errors&limit=20')
      const result = await response.json()
      if (result.success) {
        setErrorLogs(result.errors)
        return result.errors
      }
      return []
    } catch (err) {
      console.error('Error fetching error logs:', err)
      return []
    }
  }, [])

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/logs?action=audit&limit=20')
      const result = await response.json()
      if (result.success) {
        setAuditLogs(result.audit)
        return result.audit
      }
      return []
    } catch (err) {
      console.error('Error fetching audit logs:', err)
      return []
    }
  }, [])

  // Fetch activity logs
  const fetchActivityLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/logs?action=activity&limit=20')
      const result = await response.json()
      if (result.success) {
        setActivityLogs(result.activity)
        return result.activity
      }
      return []
    } catch (err) {
      console.error('Error fetching activity logs:', err)
      return []
    }
  }, [])

  // Search logs
  const search = useCallback(async (query: string) => {
    setSearchQuery(query)
  }, [])

  // Actions
  const createLog = useCallback(async (logData: {
    level: LogLevel
    source: LogSource
    message: string
    details?: Record<string, unknown>
  }) => {
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'log', ...logData }),
      })

      const result = await response.json()
      if (result.success) {
        await fetchLogs()
      }
      return result
    } catch (err) {
      console.error('Error creating log:', err)
      return { success: false, error: 'Failed to create log' }
    }
  }, [fetchLogs])

  const clearLogs = useCallback(async (options: { before?: string; level?: LogLevel } = {}) => {
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear', ...options }),
      })

      const result = await response.json()
      if (result.success) {
        await fetchLogs()
      }
      return result
    } catch (err) {
      console.error('Error clearing logs:', err)
      return { success: false, error: 'Failed to clear logs' }
    }
  }, [fetchLogs])

  const exportLogs = useCallback(async (options: {
    startDate?: string
    endDate?: string
    format?: 'json' | 'csv'
  } = {}) => {
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export', ...options }),
      })

      const result = await response.json()
      if (result.success) {
        // Trigger download
        const blob = new Blob(
          [typeof result.exportData.content === 'string'
            ? result.exportData.content
            : JSON.stringify(result.exportData.content, null, 2)],
          { type: result.exportData.format === 'csv' ? 'text/csv' : 'application/json' }
        )
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `logs-${new Date().toISOString().split('T')[0]}.${result.exportData.format}`
        a.click()
        URL.revokeObjectURL(url)
      }
      return result
    } catch (err) {
      console.error('Error exporting logs:', err)
      return { success: false, error: 'Failed to export logs' }
    }
  }, [])

  const createAlert = useCallback(async (alertData: {
    level?: LogLevel
    source?: LogSource
    keyword?: string
    threshold: number
    window: number
    notifyEmail?: string
  }) => {
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-alert', ...alertData }),
      })

      return await response.json()
    } catch (err) {
      console.error('Error creating alert:', err)
      return { success: false, error: 'Failed to create alert' }
    }
  }, [])

  // Refresh all data
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    await Promise.all([fetchLogs(), fetchStats(), fetchErrorLogs()])
  }, [fetchLogs, fetchStats, fetchErrorLogs])

  // Initial load
  useEffect(() => {
    refresh()
  }, [refresh])

  // Re-fetch when search changes
  useEffect(() => {
    fetchLogs()
  }, [searchQuery, fetchLogs])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(() => {
      fetchLogs()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchLogs])

  // Computed values
  const hasData = useMemo(() => logs.length > 0, [logs])

  const recentErrors = useMemo(() =>
    errorLogs.slice(0, 5),
  [errorLogs])

  const logsByLevel = useMemo(() => {
    const grouped: Record<LogLevel, SystemLog[]> = {
      debug: [], info: [], warn: [], error: [], critical: []
    }
    logs.forEach(log => {
      grouped[log.level].push(log)
    })
    return grouped
  }, [logs])

  const logsBySource = useMemo(() => {
    const grouped: Record<LogSource, SystemLog[]> = {
      system: [], api: [], auth: [], database: [], worker: [], integration: []
    }
    logs.forEach(log => {
      grouped[log.source].push(log)
    })
    return grouped
  }, [logs])

  return {
    // Data
    logs,
    stats,
    errorLogs,
    auditLogs,
    activityLogs,
    recentErrors,
    logsByLevel,
    logsBySource,

    // State
    isLoading,
    error,
    lastRefresh,
    hasData,
    searchQuery,

    // Fetch methods
    refresh,
    fetchLogs,
    fetchStats,
    fetchErrorLogs,
    fetchAuditLogs,
    fetchActivityLogs,
    search,

    // Actions
    createLog,
    clearLogs,
    exportLogs,
    createAlert,
  }
}

export default useSystemLogs
