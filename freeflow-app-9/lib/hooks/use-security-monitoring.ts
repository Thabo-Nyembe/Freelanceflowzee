/**
 * Security Monitoring Hook
 *
 * React hook for security monitoring, alerts, and anomaly detection
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type AlertStatus = 'new' | 'investigating' | 'resolved' | 'false_positive'

export interface SecurityEvent {
  id: string
  user_id: string | null
  organization_id: string | null
  event_type: string
  ip_address: string
  user_agent: string
  location: {
    country?: string
    country_code?: string
    region?: string
    city?: string
  }
  metadata: Record<string, unknown>
  risk_score: number
  timestamp: string
}

export interface SecurityAlert {
  id: string
  user_id: string | null
  organization_id: string | null
  alert_type: string
  severity: AlertSeverity
  status: AlertStatus
  title: string
  description: string
  details: Record<string, unknown>
  related_events: string[]
  created_at: string
  resolved_at: string | null
  resolved_by: string | null
  user?: {
    id: string
    name: string
    email: string
    avatar_url: string | null
  }
  resolved_by_user?: {
    id: string
    name: string
    email: string
  }
}

export interface AnomalyRule {
  id: string
  organization_id: string | null
  name: string
  description: string
  rule_type: string
  conditions: Array<{
    field: string
    operator: string
    value: unknown
  }>
  actions: Array<{
    type: string
    config?: Record<string, unknown>
  }>
  severity: AlertSeverity
  is_active: boolean
  is_system: boolean
  cooldown_minutes: number
  created_at: string
}

export interface AlertStats {
  total_alerts: number
  new_alerts: number
  investigating_alerts: number
  resolved_alerts: number
  false_positive_alerts: number
  critical_alerts: number
  high_alerts: number
  medium_alerts: number
  low_alerts: number
}

export interface EventStats {
  total_events: number
  high_risk_events: number
  login_attempts: number
  login_failures: number
  suspicious_activities: number
  unique_ips: number
  unique_countries: number
}

interface UseSecurityMonitoringReturn {
  // Data
  events: SecurityEvent[]
  alerts: SecurityAlert[]
  rules: AnomalyRule[]
  alertStats: AlertStats | null
  eventStats: EventStats | null
  selectedAlert: SecurityAlert | null

  // State
  isLoading: boolean
  error: string | null

  // Event methods
  fetchEvents: (options?: EventQueryOptions) => Promise<void>
  recordEvent: (event: RecordEventData) => Promise<{ risk_score: number; anomalies: string[] } | null>

  // Alert methods
  fetchAlerts: (options?: AlertQueryOptions) => Promise<void>
  fetchAlert: (alertId: string) => Promise<void>
  updateAlertStatus: (alertId: string, status: AlertStatus, notes?: string) => Promise<boolean>
  createManualAlert: (alert: CreateAlertData) => Promise<string | null>

  // Rule methods
  fetchRules: (organizationId?: string) => Promise<void>
  createRule: (rule: CreateRuleData) => Promise<string | null>
  updateRule: (ruleId: string, updates: Partial<AnomalyRule>) => Promise<boolean>
  deleteRule: (ruleId: string) => Promise<boolean>

  // Utilities
  getSeverityColor: (severity: AlertSeverity) => string
  getStatusColor: (status: AlertStatus) => string
  clearError: () => void
}

interface EventQueryOptions {
  organizationId?: string
  userId?: string
  eventType?: string
  minRiskScore?: number
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

interface AlertQueryOptions {
  organizationId?: string
  status?: AlertStatus | 'open'
  severity?: AlertSeverity
  alertType?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

interface RecordEventData {
  event_type: string
  organization_id?: string
  user_id?: string
  metadata?: Record<string, unknown>
  endpoint?: string
  method?: string
}

interface CreateAlertData {
  organization_id?: string
  user_id?: string
  alert_type: string
  severity: AlertSeverity
  title: string
  description?: string
  details?: Record<string, unknown>
}

interface CreateRuleData {
  organization_id: string
  name: string
  description?: string
  rule_type: string
  conditions: Array<{ field: string; operator: string; value: unknown }>
  actions: Array<{ type: string; config?: Record<string, unknown> }>
  severity: AlertSeverity
  is_active?: boolean
  cooldown_minutes?: number
}

export function useSecurityMonitoring(): UseSecurityMonitoringReturn {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [rules, setRules] = useState<AnomalyRule[]>([])
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null)
  const [eventStats, setEventStats] = useState<EventStats | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Severity color mapping
  const getSeverityColor = useCallback((severity: AlertSeverity): string => {
    const colors: Record<AlertSeverity, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    }
    return colors[severity] || 'bg-gray-500'
  }, [])

  // Status color mapping
  const getStatusColor = useCallback((status: AlertStatus): string => {
    const colors: Record<AlertStatus, string> = {
      new: 'bg-red-100 text-red-800',
      investigating: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      false_positive: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100'
  }, [])

  // Fetch security events
  const fetchEvents = useCallback(async (options: EventQueryOptions = {}): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (options.organizationId) params.append('organizationId', options.organizationId)
      if (options.userId) params.append('userId', options.userId)
      if (options.eventType) params.append('eventType', options.eventType)
      if (options.minRiskScore) params.append('minRiskScore', options.minRiskScore.toString())
      if (options.startDate) params.append('startDate', options.startDate)
      if (options.endDate) params.append('endDate', options.endDate)
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.offset) params.append('offset', options.offset.toString())

      const response = await fetch(`/api/security/events?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch events')
      }

      setEvents(data.events || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch events'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Record a security event
  const recordEvent = useCallback(async (
    eventData: RecordEventData
  ): Promise<{ risk_score: number; anomalies: string[] } | null> => {
    try {
      const response = await fetch('/api/security/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record event')
      }

      return {
        risk_score: data.risk_score,
        anomalies: data.anomalies
      }
    } catch (err) {
      console.error('Record security event error:', err)
      return null
    }
  }, [])

  // Fetch security alerts
  const fetchAlerts = useCallback(async (options: AlertQueryOptions = {}): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (options.organizationId) params.append('organizationId', options.organizationId)
      if (options.status) params.append('status', options.status)
      if (options.severity) params.append('severity', options.severity)
      if (options.alertType) params.append('alertType', options.alertType)
      if (options.startDate) params.append('startDate', options.startDate)
      if (options.endDate) params.append('endDate', options.endDate)
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.offset) params.append('offset', options.offset.toString())

      const response = await fetch(`/api/security/alerts?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch alerts')
      }

      setAlerts(data.alerts || [])
      setAlertStats(data.stats || null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch alerts'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch single alert details
  const fetchAlert = useCallback(async (alertId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/security/alerts/${alertId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch alert')
      }

      setSelectedAlert(data.alert)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch alert'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update alert status
  const updateAlertStatus = useCallback(async (
    alertId: string,
    status: AlertStatus,
    notes?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/security/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update alert')
      }

      // Update local state
      setAlerts(prev => prev.map(a =>
        a.id === alertId ? { ...a, status, resolved_at: data.alert.resolved_at } : a
      ))

      if (selectedAlert?.id === alertId) {
        setSelectedAlert({ ...selectedAlert, status, resolved_at: data.alert.resolved_at })
      }

      toast.success('Alert status updated')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update alert'
      toast.error(message)
      return false
    }
  }, [selectedAlert])

  // Create manual alert
  const createManualAlert = useCallback(async (alert: CreateAlertData): Promise<string | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/security/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create alert')
      }

      toast.success('Alert created')
      return data.alertId
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create alert'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch anomaly rules
  const fetchRules = useCallback(async (organizationId?: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ includeSystem: 'true' })
      if (organizationId) params.append('organizationId', organizationId)

      const response = await fetch(`/api/security/rules?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch rules')
      }

      setRules(data.rules || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch rules'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create anomaly rule
  const createRule = useCallback(async (rule: CreateRuleData): Promise<string | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/security/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create rule')
      }

      setRules(prev => [...prev, data.rule])
      toast.success('Rule created')
      return data.rule.id
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create rule'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update anomaly rule
  const updateRule = useCallback(async (
    ruleId: string,
    updates: Partial<AnomalyRule>
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/security/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ruleId, ...updates })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update rule')
      }

      setRules(prev => prev.map(r => r.id === ruleId ? data.rule : r))
      toast.success('Rule updated')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update rule'
      toast.error(message)
      return false
    }
  }, [])

  // Delete anomaly rule
  const deleteRule = useCallback(async (ruleId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/security/rules?id=${ruleId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete rule')
      }

      setRules(prev => prev.filter(r => r.id !== ruleId))
      toast.success('Rule deleted')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete rule'
      toast.error(message)
      return false
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    events,
    alerts,
    rules,
    alertStats,
    eventStats,
    selectedAlert,
    isLoading,
    error,
    fetchEvents,
    recordEvent,
    fetchAlerts,
    fetchAlert,
    updateAlertStatus,
    createManualAlert,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    getSeverityColor,
    getStatusColor,
    clearError
  }
}

export default useSecurityMonitoring
