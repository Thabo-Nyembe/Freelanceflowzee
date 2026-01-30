'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

export interface ActivityLog {
  id: string
  user_id: string | null
  activity_code: string
  user_name: string | null
  user_email: string | null
  activity_type: string
  category: string
  status: string
  action: string
  resource_type: string | null
  resource_id: string | null
  resource_name: string | null
  changes: Array<{
    field: string
    oldValue: string
    newValue: string
  }>
  old_values: Record<string, JsonValue>
  new_values: Record<string, JsonValue>
  ip_address: string | null
  user_agent: string | null
  duration: number
  metadata: Record<string, JsonValue>
  created_at: string
}

interface ActivityLogFilters {
  status?: string
  activityType?: string
  category?: string
}

export function useActivityLogs(initialLogs: ActivityLog[] = [], filters: ActivityLogFilters = {}) {
  const supabase = createClient()
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const isDemo = isDemoModeEnabled()

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    // Demo mode: use API endpoint or fallback data
    if (isDemo) {
      try {
        const params = new URLSearchParams()
        params.set('demo', 'true')
        if (filters.status) params.set('status', filters.status)
        if (filters.category) params.set('category', filters.category)

        const response = await fetch(`/api/activity-logs?${params.toString()}`)
        const result = await response.json()

        if (result.data || result.logs) {
          setLogs(result.data || result.logs)
        } else {
          setLogs(getDemoActivityLogs())
        }
      } catch (err) {
        setLogs(getDemoActivityLogs())
      }
      setIsLoading(false)
      return
    }

    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.activityType) {
      query = query.eq('activity_type', filters.activityType)
    }
    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    const { data, error: fetchError } = await query.limit(200)
    if (fetchError) {
      setError(new Error(fetchError.message))
      if (isDemo) setLogs(getDemoActivityLogs())
    } else if (data) {
      setLogs(data)
    }
    setIsLoading(false)
  }, [supabase, filters.status, filters.activityType, filters.category, isDemo])

  useEffect(() => {
    if (initialLogs.length === 0) {
      fetchLogs()
    }
  }, [fetchLogs, initialLogs.length])

  // Real-time subscription (disabled in demo mode)
  useEffect(() => {
    if (isDemo) return

    const channel = supabase
      .channel('activity_logs_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
        setLogs(prev => [payload.new as ActivityLog, ...prev].slice(0, 200))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, isDemo])

  // Calculate stats
  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    failed: logs.filter(l => l.status === 'failed').length,
    pending: logs.filter(l => l.status === 'pending').length,
    creates: logs.filter(l => l.activity_type === 'create').length,
    updates: logs.filter(l => l.activity_type === 'update').length,
    deletes: logs.filter(l => l.activity_type === 'delete').length,
    avgDuration: logs.length > 0 ? logs.reduce((sum, l) => sum + l.duration, 0) / logs.length : 0,
    successRate: logs.length > 0 ? (logs.filter(l => l.status === 'success').length / logs.length) * 100 : 0
  }

  return { logs, stats, isLoading, error, refetch: fetchLogs }
}

export function getActivityStatusColor(status: string): string {
  switch (status) {
    case 'success': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
    case 'failed': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
}

export function getActivityTypeColor(type: string): string {
  switch (type) {
    case 'create': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
    case 'update': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    case 'delete': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    case 'view': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    case 'login': return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
    case 'logout': return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
    case 'export': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
    case 'import': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'user': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    case 'content': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    case 'settings': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
    case 'file': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
    case 'api': return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
    case 'admin': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
  }
}

export function formatActivityTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Demo activity logs fallback
function getDemoActivityLogs(): ActivityLog[] {
  const now = new Date()
  return [
    {
      id: 'demo-log-1',
      user_id: DEMO_USER_ID,
      activity_code: 'ACT-001',
      user_name: 'Alexandra Chen',
      user_email: 'alex@freeflow.io',
      activity_type: 'create',
      category: 'project',
      status: 'success',
      action: 'Created new project',
      resource_type: 'project',
      resource_id: 'proj-1',
      resource_name: 'Website Redesign',
      changes: [],
      old_values: {},
      new_values: { name: 'Website Redesign', status: 'active' },
      ip_address: '192.168.1.1',
      user_agent: 'Chrome/120',
      duration: 245,
      metadata: { source: 'dashboard' },
      created_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-log-2',
      user_id: DEMO_USER_ID,
      activity_code: 'ACT-002',
      user_name: 'Alexandra Chen',
      user_email: 'alex@freeflow.io',
      activity_type: 'update',
      category: 'invoice',
      status: 'success',
      action: 'Updated invoice status',
      resource_type: 'invoice',
      resource_id: 'inv-1',
      resource_name: 'INV-2024-001',
      changes: [{ field: 'status', oldValue: 'draft', newValue: 'sent' }],
      old_values: { status: 'draft' },
      new_values: { status: 'sent' },
      ip_address: '192.168.1.1',
      user_agent: 'Chrome/120',
      duration: 120,
      metadata: {},
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-log-3',
      user_id: DEMO_USER_ID,
      activity_code: 'ACT-003',
      user_name: 'Alexandra Chen',
      user_email: 'alex@freeflow.io',
      activity_type: 'login',
      category: 'user',
      status: 'success',
      action: 'User logged in',
      resource_type: 'session',
      resource_id: 'sess-1',
      resource_name: 'Session',
      changes: [],
      old_values: {},
      new_values: {},
      ip_address: '192.168.1.1',
      user_agent: 'Chrome/120',
      duration: 50,
      metadata: { device: 'Desktop' },
      created_at: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-log-4',
      user_id: DEMO_USER_ID,
      activity_code: 'ACT-004',
      user_name: 'Alexandra Chen',
      user_email: 'alex@freeflow.io',
      activity_type: 'export',
      category: 'file',
      status: 'success',
      action: 'Exported report to PDF',
      resource_type: 'report',
      resource_id: 'rep-1',
      resource_name: 'Q4 Revenue Report',
      changes: [],
      old_values: {},
      new_values: { format: 'pdf' },
      ip_address: '192.168.1.1',
      user_agent: 'Chrome/120',
      duration: 3500,
      metadata: { fileSize: 245000 },
      created_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-log-5',
      user_id: DEMO_USER_ID,
      activity_code: 'ACT-005',
      user_name: 'Alexandra Chen',
      user_email: 'alex@freeflow.io',
      activity_type: 'delete',
      category: 'content',
      status: 'success',
      action: 'Deleted draft task',
      resource_type: 'task',
      resource_id: 'task-old',
      resource_name: 'Old Draft Task',
      changes: [],
      old_values: { title: 'Old Draft Task' },
      new_values: {},
      ip_address: '192.168.1.1',
      user_agent: 'Chrome/120',
      duration: 80,
      metadata: { permanent: false },
      created_at: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString()
    }
  ]
}
