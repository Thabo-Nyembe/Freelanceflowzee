'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface Alert {
  id: string
  user_id: string
  alert_code: string
  title: string
  description: string | null
  severity: 'info' | 'warning' | 'error' | 'critical'
  category: 'performance' | 'security' | 'availability' | 'capacity' | 'compliance' | 'other'
  status: 'active' | 'acknowledged' | 'resolved' | 'snoozed' | 'escalated'
  priority: number
  source: string
  source_id: string | null
  source_type: string | null
  affected_systems: string[]
  impact: string | null
  assigned_to: string | null
  assigned_team: string | null
  escalation_level: number
  triggered_at: string
  acknowledged_at: string | null
  resolved_at: string | null
  snoozed_until: string | null
  occurrences: number
  response_time_minutes: number
  resolution_time_minutes: number
  notification_channels: string[]
  notifications_sent: number
  resolution: string | null
  root_cause: string | null
  ip_address: string | null
  user_agent: string | null
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseAlertsOptions {
  severity?: Alert['severity']
  status?: Alert['status']
  category?: Alert['category']
}

interface AlertStats {
  total: number
  active: number
  acknowledged: number
  resolved: number
  snoozed: number
  escalated: number
  critical: number
  avgResponseTime: number
  avgResolutionTime: number
}

export function useAlerts(initialAlerts: Alert[] = [], options: UseAlertsOptions = {}) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const stats: AlertStats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    snoozed: alerts.filter(a => a.status === 'snoozed').length,
    escalated: alerts.filter(a => a.status === 'escalated').length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    avgResponseTime: alerts.length > 0
      ? alerts.reduce((sum, a) => sum + a.response_time_minutes, 0) / alerts.length
      : 0,
    avgResolutionTime: alerts.filter(a => a.resolved_at).length > 0
      ? alerts.filter(a => a.resolved_at).reduce((sum, a) => sum + a.resolution_time_minutes, 0) / alerts.filter(a => a.resolved_at).length
      : 0
  }

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('alerts')
        .select('*')
        .is('deleted_at', null)
        .order('triggered_at', { ascending: false })

      if (options.severity) {
        query = query.eq('severity', options.severity)
      }
      if (options.status) {
        query = query.eq('status', options.status)
      }
      if (options.category) {
        query = query.eq('category', options.category)
      }

      const { data, error: fetchError } = await query.limit(200)

      if (fetchError) throw fetchError
      setAlerts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, options.severity, options.status, options.category])

  useEffect(() => {
    const channel = supabase
      .channel('alerts_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAlerts(prev => [payload.new as Alert, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setAlerts(prev => prev.map(a =>
              a.id === payload.new.id ? payload.new as Alert : a
            ))
          } else if (payload.eventType === 'DELETE') {
            setAlerts(prev => prev.filter(a => a.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    const { error } = await supabase
      .from('alerts')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId)

    if (error) throw error
    setAlerts(prev => prev.map(a =>
      a.id === alertId
        ? { ...a, status: 'acknowledged' as const, acknowledged_at: new Date().toISOString() }
        : a
    ))
  }, [supabase])

  const resolveAlert = useCallback(async (alertId: string, resolution?: string, rootCause?: string) => {
    const alert = alerts.find(a => a.id === alertId)
    const triggeredAt = alert ? new Date(alert.triggered_at).getTime() : Date.now()
    const resolutionTime = Math.floor((Date.now() - triggeredAt) / 60000)

    const { error } = await supabase
      .from('alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolution_time_minutes: resolutionTime,
        resolution: resolution || null,
        root_cause: rootCause || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId)

    if (error) throw error
    setAlerts(prev => prev.map(a =>
      a.id === alertId
        ? {
            ...a,
            status: 'resolved' as const,
            resolved_at: new Date().toISOString(),
            resolution_time_minutes: resolutionTime,
            resolution: resolution || null,
            root_cause: rootCause || null
          }
        : a
    ))
  }, [supabase, alerts])

  const escalateAlert = useCallback(async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId)
    if (!alert) return

    const { error } = await supabase
      .from('alerts')
      .update({
        status: 'escalated',
        escalation_level: alert.escalation_level + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId)

    if (error) throw error
    setAlerts(prev => prev.map(a =>
      a.id === alertId
        ? { ...a, status: 'escalated' as const, escalation_level: a.escalation_level + 1 }
        : a
    ))
  }, [supabase, alerts])

  const snoozeAlert = useCallback(async (alertId: string, minutes: number) => {
    const snoozeUntil = new Date(Date.now() + minutes * 60000).toISOString()

    const { error } = await supabase
      .from('alerts')
      .update({
        status: 'snoozed',
        snoozed_until: snoozeUntil,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId)

    if (error) throw error
    setAlerts(prev => prev.map(a =>
      a.id === alertId
        ? { ...a, status: 'snoozed' as const, snoozed_until: snoozeUntil }
        : a
    ))
  }, [supabase])

  const deleteAlert = useCallback(async (alertId: string) => {
    const { error } = await supabase
      .from('alerts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', alertId)

    if (error) throw error
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }, [supabase])

  const createAlert = useCallback(async (alertData: Partial<Omit<Alert, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const newAlert = {
      user_id: userData.user.id,
      alert_code: alertData.alert_code || `ALT-${Date.now()}`,
      title: alertData.title || 'New Alert',
      description: alertData.description || null,
      severity: alertData.severity || 'info',
      category: alertData.category || 'other',
      status: alertData.status || 'active',
      priority: alertData.priority || 1,
      source: alertData.source || 'manual',
      source_id: alertData.source_id || null,
      source_type: alertData.source_type || null,
      affected_systems: alertData.affected_systems || [],
      impact: alertData.impact || null,
      assigned_to: alertData.assigned_to || null,
      assigned_team: alertData.assigned_team || null,
      escalation_level: alertData.escalation_level || 0,
      triggered_at: alertData.triggered_at || new Date().toISOString(),
      acknowledged_at: alertData.acknowledged_at || null,
      resolved_at: alertData.resolved_at || null,
      snoozed_until: alertData.snoozed_until || null,
      occurrences: alertData.occurrences || 1,
      response_time_minutes: alertData.response_time_minutes || 0,
      resolution_time_minutes: alertData.resolution_time_minutes || 0,
      notification_channels: alertData.notification_channels || [],
      notifications_sent: alertData.notifications_sent || 0,
      resolution: alertData.resolution || null,
      root_cause: alertData.root_cause || null,
      ip_address: alertData.ip_address || null,
      user_agent: alertData.user_agent || null,
      tags: alertData.tags || [],
      metadata: alertData.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('alerts')
      .insert(newAlert)
      .select()
      .single()

    if (error) throw error
    if (data) {
      setAlerts(prev => [data as Alert, ...prev])
    }
    return data as Alert
  }, [supabase])

  const updateAlert = useCallback(async (alertId: string, updates: Partial<Alert>) => {
    const { error } = await supabase
      .from('alerts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId)

    if (error) throw error
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, ...updates, updated_at: new Date().toISOString() } : a
    ))
  }, [supabase])

  return {
    alerts,
    stats,
    isLoading,
    error,
    fetchAlerts,
    createAlert,
    updateAlert,
    acknowledgeAlert,
    resolveAlert,
    escalateAlert,
    snoozeAlert,
    deleteAlert
  }
}

export function getAlertSeverityColor(severity: Alert['severity']): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400'
    case 'error':
      return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400'
    case 'warning':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'info':
      return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

export function getAlertStatusColor(status: Alert['status']): string {
  switch (status) {
    case 'active':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'acknowledged':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'resolved':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'snoozed':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    case 'escalated':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

export function getAlertCategoryColor(category: Alert['category']): string {
  switch (category) {
    case 'performance':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'security':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'availability':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'capacity':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'compliance':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
  }
}

export function formatAlertTimestamp(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
