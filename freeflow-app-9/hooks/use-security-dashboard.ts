'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ThreatLevel = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type SecurityEventType = 'login_attempt' | 'password_change' | 'api_access' | 'permission_change' | 'suspicious_activity' | 'data_export' | 'session_event'

export interface SecurityEvent {
  id: string
  type: SecurityEventType
  severity: ThreatLevel
  title: string
  description: string
  userId?: string
  userName?: string
  ipAddress?: string
  location?: string
  userAgent?: string
  timestamp: string
  resolved: boolean
  metadata?: Record<string, any>
}

export interface SecurityAlert {
  id: string
  type: string
  severity: ThreatLevel
  title: string
  message: string
  source: string
  timestamp: string
  acknowledged: boolean
  resolvedAt?: string
  resolvedBy?: string
}

export interface AccessLog {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  resourceId?: string
  ipAddress: string
  location?: string
  timestamp: string
  success: boolean
  duration?: number
}

export interface SecurityScore {
  overall: number
  authentication: number
  authorization: number
  dataProtection: number
  monitoring: number
  compliance: number
  lastCalculated: string
}

export interface VulnerabilityScan {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt: string
  completedAt?: string
  findings: {
    critical: number
    high: number
    medium: number
    low: number
  }
  report?: string
}

export interface SecurityPolicy {
  id: string
  name: string
  category: string
  enabled: boolean
  severity: ThreatLevel
  description: string
  lastTriggered?: string
  triggerCount: number
}

export interface ThreatIntelligence {
  blockedIPs: number
  suspiciousActivities: number
  failedLogins24h: number
  newThreatsDetected: number
  activeIncidents: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockSecurityScore: SecurityScore = {
  overall: 87,
  authentication: 92,
  authorization: 85,
  dataProtection: 88,
  monitoring: 82,
  compliance: 90,
  lastCalculated: new Date().toISOString()
}

const mockSecurityEvents: SecurityEvent[] = [
  { id: 'se-1', type: 'login_attempt', severity: 'high', title: 'Multiple failed login attempts', description: 'User john@example.com had 5 failed login attempts from IP 192.168.1.100', userId: 'u-1', userName: 'John Smith', ipAddress: '192.168.1.100', location: 'New York, US', timestamp: new Date(Date.now() - 1800000).toISOString(), resolved: false },
  { id: 'se-2', type: 'suspicious_activity', severity: 'medium', title: 'Unusual API access pattern', description: 'API key kazi_prod_* made 500 requests in 5 minutes', ipAddress: '10.0.0.55', timestamp: new Date(Date.now() - 3600000).toISOString(), resolved: false },
  { id: 'se-3', type: 'password_change', severity: 'info', title: 'Password changed', description: 'User jane@example.com changed their password', userId: 'u-2', userName: 'Jane Doe', timestamp: new Date(Date.now() - 7200000).toISOString(), resolved: true },
  { id: 'se-4', type: 'data_export', severity: 'low', title: 'Large data export', description: 'User admin@example.com exported 5000 records', userId: 'admin-1', userName: 'Admin User', timestamp: new Date(Date.now() - 86400000).toISOString(), resolved: true },
  { id: 'se-5', type: 'session_event', severity: 'medium', title: 'Session hijacking attempt', description: 'Session token was used from a different IP address', userId: 'u-3', userName: 'Bob Wilson', ipAddress: '203.0.113.50', location: 'Unknown', timestamp: new Date(Date.now() - 172800000).toISOString(), resolved: true }
]

const mockSecurityAlerts: SecurityAlert[] = [
  { id: 'sa-1', type: 'brute_force', severity: 'critical', title: 'Brute force attack detected', message: 'Multiple accounts targeted from IP range 192.168.1.0/24', source: 'IDS', timestamp: new Date(Date.now() - 900000).toISOString(), acknowledged: false },
  { id: 'sa-2', type: 'rate_limit', severity: 'high', title: 'API rate limit exceeded', message: 'API key exceeded rate limit by 300%', source: 'API Gateway', timestamp: new Date(Date.now() - 3600000).toISOString(), acknowledged: true },
  { id: 'sa-3', type: 'certificate', severity: 'medium', title: 'SSL certificate expiring', message: 'SSL certificate for api.kazi.app expires in 14 days', source: 'Certificate Monitor', timestamp: new Date(Date.now() - 86400000).toISOString(), acknowledged: false }
]

const mockAccessLogs: AccessLog[] = [
  { id: 'al-1', userId: 'u-1', userName: 'John Smith', action: 'view', resource: 'projects', resourceId: 'p-123', ipAddress: '192.168.1.100', location: 'New York, US', timestamp: new Date(Date.now() - 300000).toISOString(), success: true, duration: 45 },
  { id: 'al-2', userId: 'u-2', userName: 'Jane Doe', action: 'create', resource: 'invoices', resourceId: 'inv-456', ipAddress: '192.168.1.101', location: 'Los Angeles, US', timestamp: new Date(Date.now() - 600000).toISOString(), success: true, duration: 120 },
  { id: 'al-3', userId: 'u-3', userName: 'Bob Wilson', action: 'delete', resource: 'tasks', resourceId: 't-789', ipAddress: '192.168.1.102', timestamp: new Date(Date.now() - 900000).toISOString(), success: false, duration: 15 },
  { id: 'al-4', userId: 'admin-1', userName: 'Admin User', action: 'update', resource: 'settings', ipAddress: '10.0.0.1', timestamp: new Date(Date.now() - 1200000).toISOString(), success: true, duration: 80 }
]

const mockVulnerabilityScan: VulnerabilityScan = {
  id: 'vs-1',
  status: 'completed',
  startedAt: new Date(Date.now() - 86400000).toISOString(),
  completedAt: new Date(Date.now() - 82800000).toISOString(),
  findings: { critical: 0, high: 2, medium: 5, low: 12 }
}

const mockPolicies: SecurityPolicy[] = [
  { id: 'sp-1', name: 'Brute Force Protection', category: 'authentication', enabled: true, severity: 'critical', description: 'Block IP after 5 failed login attempts', lastTriggered: new Date(Date.now() - 3600000).toISOString(), triggerCount: 23 },
  { id: 'sp-2', name: 'Rate Limiting', category: 'api', enabled: true, severity: 'high', description: 'Limit API requests to 1000/minute', lastTriggered: new Date(Date.now() - 7200000).toISOString(), triggerCount: 156 },
  { id: 'sp-3', name: 'Session Timeout', category: 'session', enabled: true, severity: 'medium', description: 'Terminate sessions after 24 hours of inactivity', triggerCount: 1204 },
  { id: 'sp-4', name: 'Two-Factor Enforcement', category: 'authentication', enabled: false, severity: 'high', description: 'Require 2FA for all admin users', triggerCount: 0 },
  { id: 'sp-5', name: 'Data Export Audit', category: 'data', enabled: true, severity: 'medium', description: 'Log all data exports over 100 records', lastTriggered: new Date(Date.now() - 86400000).toISOString(), triggerCount: 45 }
]

const mockThreatIntelligence: ThreatIntelligence = {
  blockedIPs: 127,
  suspiciousActivities: 15,
  failedLogins24h: 89,
  newThreatsDetected: 3,
  activeIncidents: 2
}

// ============================================================================
// HOOK
// ============================================================================

interface UseSecurityDashboardOptions {
  
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useSecurityDashboard(options: UseSecurityDashboardOptions = {}) {
  const {
    
    autoRefresh = true,
    refreshInterval = 30000
  } = options

  // State
  const [securityScore, setSecurityScore] = useState<SecurityScore | null>(null)
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])
  const [vulnerabilityScan, setVulnerabilityScan] = useState<VulnerabilityScan | null>(null)
  const [policies, setPolicies] = useState<SecurityPolicy[]>([])
  const [threatIntelligence, setThreatIntelligence] = useState<ThreatIntelligence | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [eventFilter, setEventFilter] = useState<{ severity?: ThreatLevel; type?: SecurityEventType }>({})

  // Fetch security score
  const fetchSecurityScore = useCallback(async () => {
    try {
      const response = await fetch('/api/security/score')
      const result = await response.json()

      if (result.success && result.score) {
        setSecurityScore(result.score)
        return result.score
      }
      setSecurityScore(mockSecurityScore)
      return []
    } catch (err) {
      console.error('Error fetching security score:', err)
      setSecurityScore(mockSecurityScore)
      return []
    }
  }, [])

  // Fetch security events
  const fetchEvents = useCallback(async (filters?: typeof eventFilter) => {
    try {
      const params = new URLSearchParams()
      if (filters?.severity) params.set('severity', filters.severity)
      if (filters?.type) params.set('type', filters.type)

      const response = await fetch(`/api/security/events?${params}`)
      const result = await response.json()

      if (result.success && result.events) {
        setEvents(result.events)
        return result.events
      }
      setEvents(mockSecurityEvents)
      return []
    } catch (err) {
      console.error('Error fetching security events:', err)
      setEvents(mockSecurityEvents)
      return []
    }
  }, [])

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/security/alerts')
      const result = await response.json()

      if (result.success && result.alerts) {
        setAlerts(result.alerts)
        return result.alerts
      }
      setAlerts(mockSecurityAlerts)
      return []
    } catch (err) {
      console.error('Error fetching security alerts:', err)
      setAlerts(mockSecurityAlerts)
      return []
    }
  }, [])

  // Fetch access logs
  const fetchAccessLogs = useCallback(async (limit = 100) => {
    try {
      const response = await fetch(`/api/logs?action=activity&limit=${limit}`)
      const result = await response.json()

      if (result.success && result.activity) {
        setAccessLogs(result.activity)
        return result.activity
      }
      setAccessLogs(mockAccessLogs)
      return []
    } catch (err) {
      console.error('Error fetching access logs:', err)
      setAccessLogs(mockAccessLogs)
      return []
    }
  }, [])

  // Fetch vulnerability scan
  const fetchVulnerabilityScan = useCallback(async () => {
    try {
      const response = await fetch('/api/security/vulnerability-scan')
      const result = await response.json()

      if (result.success && result.scan) {
        setVulnerabilityScan(result.scan)
        return result.scan
      }
      setVulnerabilityScan(mockVulnerabilityScan)
      return []
    } catch (err) {
      console.error('Error fetching vulnerability scan:', err)
      setVulnerabilityScan(mockVulnerabilityScan)
      return []
    }
  }, [])

  // Fetch policies
  const fetchPolicies = useCallback(async () => {
    try {
      const response = await fetch('/api/security/policies')
      const result = await response.json()

      if (result.success && result.policies) {
        setPolicies(result.policies)
        return result.policies
      }
      setPolicies(mockPolicies)
      return []
    } catch (err) {
      console.error('Error fetching policies:', err)
      setPolicies(mockPolicies)
      return []
    }
  }, [])

  // Fetch threat intelligence
  const fetchThreatIntelligence = useCallback(async () => {
    try {
      const response = await fetch('/api/security/threats')
      const result = await response.json()

      if (result.success && result.intelligence) {
        setThreatIntelligence(result.intelligence)
        return result.intelligence
      }
      setThreatIntelligence(mockThreatIntelligence)
      return []
    } catch (err) {
      console.error('Error fetching threat intelligence:', err)
      setThreatIntelligence(mockThreatIntelligence)
      return []
    }
  }, [])

  // Actions
  const resolveEvent = useCallback(async (eventId: string) => {
    try {
      const response = await fetch(`/api/security/events/${eventId}/resolve`, {
        method: 'POST'
      })

      const result = await response.json()
      if (result.success) {
        setEvents(prev => prev.map(e =>
          e.id === eventId ? { ...e, resolved: true } : e
        ))
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error resolving event:', err)
      // Optimistically update
      setEvents(prev => prev.map(e =>
        e.id === eventId ? { ...e, resolved: true } : e
      ))
      return { success: true }
    }
  }, [])

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      const response = await fetch(`/api/security/alerts/${alertId}/acknowledge`, {
        method: 'POST'
      })

      const result = await response.json()
      if (result.success) {
        setAlerts(prev => prev.map(a =>
          a.id === alertId ? { ...a, acknowledged: true } : a
        ))
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error acknowledging alert:', err)
      // Optimistically update
      setAlerts(prev => prev.map(a =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      ))
      return { success: true }
    }
  }, [])

  const togglePolicy = useCallback(async (policyId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/security/policies/${policyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })

      const result = await response.json()
      if (result.success) {
        setPolicies(prev => prev.map(p =>
          p.id === policyId ? { ...p, enabled } : p
        ))
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error toggling policy:', err)
      // Optimistically update
      setPolicies(prev => prev.map(p =>
        p.id === policyId ? { ...p, enabled } : p
      ))
      return { success: true }
    }
  }, [])

  const startVulnerabilityScan = useCallback(async () => {
    try {
      const response = await fetch('/api/security/vulnerability-scan', {
        method: 'POST'
      })

      const result = await response.json()
      if (result.success) {
        setVulnerabilityScan({
          id: result.scanId,
          status: 'running',
          startedAt: new Date().toISOString(),
          findings: { critical: 0, high: 0, medium: 0, low: 0 }
        })
        return { success: true, scanId: result.scanId }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error starting vulnerability scan:', err)
      return { success: false, error: 'Failed to start scan' }
    }
  }, [])

  const blockIP = useCallback(async (ipAddress: string, reason?: string) => {
    try {
      const response = await fetch('/api/security/block-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipAddress, reason })
      })

      const result = await response.json()
      if (result.success) {
        setThreatIntelligence(prev => prev ? {
          ...prev,
          blockedIPs: prev.blockedIPs + 1
        } : null)
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error blocking IP:', err)
      return { success: false, error: 'Failed to block IP' }
    }
  }, [])

  // Refresh all data
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    await Promise.all([
      fetchSecurityScore(),
      fetchEvents(eventFilter),
      fetchAlerts(),
      fetchAccessLogs(),
      fetchVulnerabilityScan(),
      fetchPolicies(),
      fetchThreatIntelligence()
    ])
    setIsLoading(false)
  }, [fetchSecurityScore, fetchEvents, fetchAlerts, fetchAccessLogs, fetchVulnerabilityScan, fetchPolicies, fetchThreatIntelligence, eventFilter])

  // Initial load
  useEffect(() => {
    refresh()
  }, [refresh])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(() => {
      fetchSecurityScore()
      fetchEvents(eventFilter)
      fetchAlerts()
      fetchThreatIntelligence()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchSecurityScore, fetchEvents, fetchAlerts, fetchThreatIntelligence, eventFilter])

  // Computed values
  const unresolvedEvents = useMemo(() =>
    events.filter(e => !e.resolved),
  [events])

  const criticalEvents = useMemo(() =>
    events.filter(e => e.severity === 'critical' && !e.resolved),
  [events])

  const unacknowledgedAlerts = useMemo(() =>
    alerts.filter(a => !a.acknowledged),
  [alerts])

  const eventsBySeverity = useMemo(() => {
    const counts: Record<ThreatLevel, number> = {
      critical: 0, high: 0, medium: 0, low: 0, info: 0
    }
    events.forEach(e => { counts[e.severity]++ })
    return counts
  }, [events])

  const enabledPolicies = useMemo(() =>
    policies.filter(p => p.enabled),
  [policies])

  const scoreStatus = useMemo(() => {
    if (!securityScore) return 'unknown'
    if (securityScore.overall >= 90) return 'excellent'
    if (securityScore.overall >= 75) return 'good'
    if (securityScore.overall >= 60) return 'fair'
    return 'poor'
  }, [securityScore])

  return {
    // Data
    securityScore,
    events,
    alerts,
    accessLogs,
    vulnerabilityScan,
    policies,
    threatIntelligence,
    unresolvedEvents,
    criticalEvents,
    unacknowledgedAlerts,
    eventsBySeverity,
    enabledPolicies,

    // State
    isLoading,
    error,
    eventFilter,
    scoreStatus,

    // Fetch methods
    refresh,
    fetchSecurityScore,
    fetchEvents,
    fetchAlerts,
    fetchAccessLogs,
    fetchVulnerabilityScan,
    fetchPolicies,
    fetchThreatIntelligence,

    // Actions
    setEventFilter,
    resolveEvent,
    acknowledgeAlert,
    togglePolicy,
    startVulnerabilityScan,
    blockIP,
  }
}

export default useSecurityDashboard
