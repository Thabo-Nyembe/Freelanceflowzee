'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical'
export type SecurityEventType = 'intrusion' | 'malware' | 'phishing' | 'unauthorized_access' | 'data_breach' | 'policy_violation'

export interface SecurityEvent {
  id: string
  type: SecurityEventType
  severity: ThreatLevel
  title: string
  description: string
  source: string
  sourceIp?: string
  targetResource?: string
  userId?: string
  userName?: string
  status: 'detected' | 'investigating' | 'mitigated' | 'resolved' | 'false_positive'
  detectedAt: string
  mitigatedAt?: string
  resolvedAt?: string
  actions: SecurityAction[]
  indicators: ThreatIndicator[]
  relatedEvents: string[]
  metadata: Record<string, any>
}

export interface SecurityAction {
  id: string
  type: 'block_ip' | 'disable_user' | 'revoke_session' | 'alert_sent' | 'quarantine' | 'custom'
  description: string
  performedBy: string
  performedByName: string
  performedAt: string
  automated: boolean
}

export interface ThreatIndicator {
  type: 'ip' | 'domain' | 'hash' | 'email' | 'url' | 'file_path'
  value: string
  confidence: number
  source: string
}

export interface SecuritySetting {
  id: string
  category: string
  name: string
  description: string
  value: any
  type: 'boolean' | 'number' | 'string' | 'select' | 'multiselect'
  options?: { label: string; value: any }[]
  isEnabled: boolean
  lastModifiedBy: string
  lastModifiedAt: string
}

export interface UserSession {
  id: string
  userId: string
  userName: string
  userEmail: string
  ipAddress: string
  userAgent: string
  device: string
  browser: string
  os: string
  location?: { country: string; city: string }
  startedAt: string
  lastActiveAt: string
  expiresAt: string
  isCurrent: boolean
  mfaVerified: boolean
}

export interface AccessRule {
  id: string
  name: string
  description?: string
  type: 'allow' | 'deny'
  conditions: AccessCondition[]
  action: string
  priority: number
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface AccessCondition {
  field: 'ip' | 'country' | 'time' | 'user_role' | 'resource' | 'method'
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in' | 'range'
  value: any
}

export interface SecurityStats {
  threatScore: number
  totalEvents: number
  criticalEvents: number
  activeThreats: number
  blockedAttempts: number
  activeSessions: number
  suspiciousActivities: number
  eventsByType: Record<SecurityEventType, number>
  eventsBySeverity: Record<ThreatLevel, number>
  eventTrend: { date: string; count: number }[]
  topThreats: { type: string; count: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockEvents: SecurityEvent[] = [
  { id: 'evt-1', type: 'unauthorized_access', severity: 'high', title: 'Multiple failed login attempts detected', description: 'Over 50 failed login attempts from a single IP address in the last hour.', source: 'auth-service', sourceIp: '45.33.32.156', status: 'mitigated', detectedAt: '2024-03-20T09:00:00Z', mitigatedAt: '2024-03-20T09:05:00Z', actions: [{ id: 'act-1', type: 'block_ip', description: 'IP address blocked for 24 hours', performedBy: 'system', performedByName: 'Automated', performedAt: '2024-03-20T09:05:00Z', automated: true }, { id: 'act-2', type: 'alert_sent', description: 'Alert sent to security team', performedBy: 'system', performedByName: 'Automated', performedAt: '2024-03-20T09:00:00Z', automated: true }], indicators: [{ type: 'ip', value: '45.33.32.156', confidence: 95, source: 'internal' }], relatedEvents: [], metadata: { attemptCount: 52, targetAccount: 'admin@example.com' } },
  { id: 'evt-2', type: 'policy_violation', severity: 'medium', title: 'Sensitive data access outside business hours', description: 'User accessed customer PII data at 2:00 AM local time.', source: 'data-access-monitor', userId: 'user-5', userName: 'Mike Johnson', status: 'investigating', detectedAt: '2024-03-20T02:15:00Z', actions: [{ id: 'act-3', type: 'alert_sent', description: 'Alert sent to data protection officer', performedBy: 'system', performedByName: 'Automated', performedAt: '2024-03-20T02:15:00Z', automated: true }], indicators: [], relatedEvents: [], metadata: { dataType: 'customer_pii', accessTime: '02:00', normalHours: '09:00-18:00' } },
  { id: 'evt-3', type: 'phishing', severity: 'medium', title: 'Phishing email reported', description: 'Employee reported receiving a phishing email impersonating IT support.', source: 'user-report', status: 'resolved', detectedAt: '2024-03-19T14:30:00Z', resolvedAt: '2024-03-19T15:00:00Z', actions: [{ id: 'act-4', type: 'custom', description: 'Email sender domain added to blocklist', performedBy: 'user-1', performedByName: 'Alex Chen', performedAt: '2024-03-19T14:45:00Z', automated: false }], indicators: [{ type: 'domain', value: 'secure-it-support.xyz', confidence: 100, source: 'user_report' }, { type: 'email', value: 'support@secure-it-support.xyz', confidence: 100, source: 'user_report' }], relatedEvents: [], metadata: { reportedBy: 'user-3', emailSubject: 'Urgent: Password Reset Required' } }
]

const mockSettings: SecuritySetting[] = [
  { id: 'set-1', category: 'Authentication', name: 'Require MFA', description: 'Require multi-factor authentication for all users', value: true, type: 'boolean', isEnabled: true, lastModifiedBy: 'user-1', lastModifiedAt: '2024-03-15' },
  { id: 'set-2', category: 'Authentication', name: 'Session Timeout', description: 'Automatically log out inactive users after specified minutes', value: 30, type: 'number', isEnabled: true, lastModifiedBy: 'user-1', lastModifiedAt: '2024-03-10' },
  { id: 'set-3', category: 'Authentication', name: 'Password Policy', description: 'Minimum password requirements', value: 'strong', type: 'select', options: [{ label: 'Basic', value: 'basic' }, { label: 'Strong', value: 'strong' }, { label: 'Very Strong', value: 'very_strong' }], isEnabled: true, lastModifiedBy: 'user-1', lastModifiedAt: '2024-03-01' },
  { id: 'set-4', category: 'Access Control', name: 'IP Allowlist', description: 'Only allow access from specified IP addresses', value: false, type: 'boolean', isEnabled: false, lastModifiedBy: 'user-1', lastModifiedAt: '2024-02-15' },
  { id: 'set-5', category: 'Data Protection', name: 'Data Encryption at Rest', description: 'Encrypt all stored data', value: true, type: 'boolean', isEnabled: true, lastModifiedBy: 'user-1', lastModifiedAt: '2024-01-01' }
]

const mockSessions: UserSession[] = [
  { id: 'sess-1', userId: 'user-1', userName: 'Alex Chen', userEmail: 'alex@example.com', ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0 Chrome/120', device: 'Desktop', browser: 'Chrome', os: 'macOS', location: { country: 'United States', city: 'San Francisco' }, startedAt: '2024-03-20T09:00:00Z', lastActiveAt: '2024-03-20T11:30:00Z', expiresAt: '2024-03-20T12:00:00Z', isCurrent: true, mfaVerified: true },
  { id: 'sess-2', userId: 'user-1', userName: 'Alex Chen', userEmail: 'alex@example.com', ipAddress: '10.0.0.50', userAgent: 'Mozilla/5.0 Safari/17', device: 'Mobile', browser: 'Safari', os: 'iOS', location: { country: 'United States', city: 'San Francisco' }, startedAt: '2024-03-19T18:00:00Z', lastActiveAt: '2024-03-19T20:00:00Z', expiresAt: '2024-03-20T18:00:00Z', isCurrent: false, mfaVerified: true }
]

const mockRules: AccessRule[] = [
  { id: 'rule-1', name: 'Block Known Bad IPs', type: 'deny', conditions: [{ field: 'ip', operator: 'in', value: ['45.33.32.156', '192.0.2.1'] }], action: 'block', priority: 1, isEnabled: true, createdAt: '2024-01-01', updatedAt: '2024-03-20' },
  { id: 'rule-2', name: 'Admin Access Hours', type: 'deny', conditions: [{ field: 'user_role', operator: 'equals', value: 'admin' }, { field: 'time', operator: 'not_in', value: { start: '06:00', end: '22:00' } }], action: 'block', priority: 2, isEnabled: true, createdAt: '2024-02-01', updatedAt: '2024-02-01' }
]

const mockStats: SecurityStats = {
  threatScore: 85,
  totalEvents: 156,
  criticalEvents: 3,
  activeThreats: 2,
  blockedAttempts: 1250,
  activeSessions: 45,
  suspiciousActivities: 8,
  eventsByType: { intrusion: 5, malware: 2, phishing: 15, unauthorized_access: 45, data_breach: 0, policy_violation: 89 },
  eventsBySeverity: { low: 85, medium: 52, high: 16, critical: 3 },
  eventTrend: Array.from({ length: 7 }, (_, i) => ({ date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0], count: 15 + Math.floor(Math.random() * 10) })),
  topThreats: [{ type: 'Brute Force', count: 45 }, { type: 'Phishing', count: 15 }, { type: 'Policy Violation', count: 89 }]
}

// ============================================================================
// HOOK
// ============================================================================

interface UseSecurityOptions {
  
}

export function useSecurity(options: UseSecurityOptions = {}) {
  const {  } = options

  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [settings, setSettings] = useState<SecuritySetting[]>([])
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [rules, setRules] = useState<AccessRule[]>([])
  const [currentEvent, setCurrentEvent] = useState<SecurityEvent | null>(null)
  const [stats, setStats] = useState<SecurityStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSecurity = useCallback(async () => {
    }, [])

  const addSecurityAction = useCallback(async (eventId: string, action: Omit<SecurityAction, 'id'>) => {
    const newAction: SecurityAction = { id: `act-${Date.now()}`, ...action }
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      actions: [...e.actions, newAction]
    } : e))
    return { success: true, action: newAction }
  }, [])

  const updateSetting = useCallback(async (settingId: string, value: any) => {
    setSettings(prev => prev.map(s => s.id === settingId ? {
      ...s,
      value,
      lastModifiedBy: 'user-1',
      lastModifiedAt: new Date().toISOString()
    } : s))
    return { success: true }
  }, [])

  const toggleSetting = useCallback(async (settingId: string) => {
    setSettings(prev => prev.map(s => s.id === settingId ? {
      ...s,
      isEnabled: !s.isEnabled,
      lastModifiedBy: 'user-1',
      lastModifiedAt: new Date().toISOString()
    } : s))
    return { success: true }
  }, [])

  const revokeSession = useCallback(async (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    return { success: true }
  }, [])

  const revokeAllSessions = useCallback(async (userId: string, exceptCurrent = true) => {
    setSessions(prev => prev.filter(s => s.userId !== userId || (exceptCurrent && s.isCurrent)))
    return { success: true }
  }, [])

  const createRule = useCallback(async (data: Partial<AccessRule>) => {
    const rule: AccessRule = {
      id: `rule-${Date.now()}`,
      name: data.name || 'New Rule',
      type: data.type || 'deny',
      conditions: data.conditions || [],
      action: data.action || 'block',
      priority: data.priority || rules.length + 1,
      isEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    } as AccessRule
    setRules(prev => [...prev, rule].sort((a, b) => a.priority - b.priority))
    return { success: true, rule }
  }, [rules.length])

  const updateRule = useCallback(async (ruleId: string, updates: Partial<AccessRule>) => {
    setRules(prev => prev.map(r => r.id === ruleId ? {
      ...r,
      ...updates,
      updatedAt: new Date().toISOString()
    } : r))
    return { success: true }
  }, [])

  const deleteRule = useCallback(async (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId))
    return { success: true }
  }, [])

  const toggleRule = useCallback(async (ruleId: string) => {
    setRules(prev => prev.map(r => r.id === ruleId ? {
      ...r,
      isEnabled: !r.isEnabled,
      updatedAt: new Date().toISOString()
    } : r))
    return { success: true }
  }, [])

  const blockIp = useCallback(async (ip: string, reason: string, duration?: number) => {
    // Add to blocked IPs list
    return createRule({
      name: `Block IP: ${ip}`,
      description: reason,
      type: 'deny',
      conditions: [{ field: 'ip', operator: 'equals', value: ip }],
      action: 'block'
    })
  }, [createRule])

  const getSeverityColor = useCallback((severity: ThreatLevel): string => {
    switch (severity) {
      case 'low': return '#22c55e'
      case 'medium': return '#f59e0b'
      case 'high': return '#f97316'
      case 'critical': return '#ef4444'
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchSecurity()
  }, [fetchSecurity])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const activeEvents = useMemo(() => events.filter(e => !['resolved', 'false_positive'].includes(e.status)), [events])
  const criticalEvents = useMemo(() => events.filter(e => e.severity === 'critical' && e.status !== 'resolved'), [events])
  const recentEvents = useMemo(() => [...events].sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()).slice(0, 10), [events])
  const activeSessions = useMemo(() => sessions.filter(s => new Date(s.expiresAt) > new Date()), [sessions])
  const enabledRules = useMemo(() => rules.filter(r => r.isEnabled), [rules])
  const settingsByCategory = useMemo(() => {
    const grouped: Record<string, SecuritySetting[]> = {}
    settings.forEach(s => {
      if (!grouped[s.category]) grouped[s.category] = []
      grouped[s.category].push(s)
    })
    return grouped
  }, [settings])

  return {
    events, settings, sessions, rules, currentEvent, stats,
    activeEvents, criticalEvents, recentEvents, activeSessions, enabledRules, settingsByCategory,
    isLoading, error,
    refresh, updateEventStatus, addSecurityAction,
    updateSetting, toggleSetting,
    revokeSession, revokeAllSessions,
    createRule, updateRule, deleteRule, toggleRule, blockIp,
    getSeverityColor, setCurrentEvent
  }
}

export default useSecurity
