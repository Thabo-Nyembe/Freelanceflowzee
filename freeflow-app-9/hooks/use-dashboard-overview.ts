'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export interface DashboardMetric {
  id: string
  name: string
  value: number
  previousValue: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
  unit: string
  icon: string | null
  color: string | null
  isPositive: boolean
  target: number | null
  targetProgress: number | null
  category: string
  description: string | null
  lastUpdated: string
}

export interface DashboardStats {
  id: string
  earnings: number
  earningsTrend: number
  activeProjects: number
  activeProjectsTrend: number
  completedProjects: number
  completedProjectsTrend: number
  totalClients: number
  totalClientsTrend: number
  hoursThisMonth: number
  hoursThisMonthTrend: number
  revenueThisMonth: number
  revenueThisMonthTrend: number
  averageProjectValue: number
  averageProjectValueTrend: number
  productivityScore: number
  productivityScoreTrend: number
  pendingTasks: number
  overdueTasks: number
  upcomingMeetings: number
  unreadMessages: number
  lastUpdated: string
}

export interface DashboardNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  isRead: boolean
  createdAt: string
  actionUrl: string | null
  actionLabel: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

export interface RecentActivity {
  id: string
  type: 'project' | 'task' | 'file' | 'invoice'
  title: string
  status?: string
  amount?: number
  timestamp: string
  icon: string
}

export interface RecentProject {
  id: string
  name: string
  client: string
  progress: number
  status: string
  value: number
  priority: string
  deadline: string | null
  category: string
}

export interface QuickStats {
  tasksCompletedToday: number
  tasksCompletedThisWeek: number
  pendingInvoicesCount: number
  pendingInvoicesTotal: number
  unreadMessages: number
}

export interface AIInsight {
  id: string
  type: string
  title: string
  description: string
  impact: 'positive' | 'negative' | 'warning'
  confidence: number
  actionable?: boolean
  action?: string
}

export interface UpcomingDeadline {
  id: string
  type: 'project' | 'task'
  title: string
  deadline: string
  status: string
  priority?: string
}

export interface DashboardData {
  metrics: DashboardMetric[]
  stats: DashboardStats | null
  notifications: DashboardNotification[]
  recentActivity: RecentActivity[]
  recentProjects: RecentProject[]
  quickStats: QuickStats | null
  aiInsights: AIInsight[]
  upcomingDeadlines: UpcomingDeadline[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockMetrics: DashboardMetric[] = [
  { id: 'm1', name: 'revenue', value: 248500, previousValue: 215000, change: 33500, changePercent: 15.8, trend: 'up', unit: 'USD', icon: 'DollarSign', color: 'green', isPositive: true, target: 300000, targetProgress: 82.8, category: 'finance', description: 'Total revenue this month', lastUpdated: new Date().toISOString() },
  { id: 'm2', name: 'active_projects', value: 8, previousValue: 6, change: 2, changePercent: 33.3, trend: 'up', unit: '', icon: 'FolderOpen', color: 'blue', isPositive: true, target: 10, targetProgress: 80, category: 'projects', description: 'Currently active projects', lastUpdated: new Date().toISOString() },
  { id: 'm3', name: 'total_clients', value: 24, previousValue: 22, change: 2, changePercent: 9.1, trend: 'up', unit: '', icon: 'Users', color: 'purple', isPositive: true, target: 30, targetProgress: 80, category: 'clients', description: 'Total active clients', lastUpdated: new Date().toISOString() },
  { id: 'm4', name: 'productivity_score', value: 94, previousValue: 89, change: 5, changePercent: 5.6, trend: 'up', unit: '%', icon: 'TrendingUp', color: 'amber', isPositive: true, target: 100, targetProgress: 94, category: 'productivity', description: 'Team productivity score', lastUpdated: new Date().toISOString() },
]

const mockStats: DashboardStats = {
  id: 'stats-1',
  earnings: 248500,
  earningsTrend: 15.8,
  activeProjects: 8,
  activeProjectsTrend: 33.3,
  completedProjects: 45,
  completedProjectsTrend: 12.5,
  totalClients: 24,
  totalClientsTrend: 9.1,
  hoursThisMonth: 168,
  hoursThisMonthTrend: 5.2,
  revenueThisMonth: 42500,
  revenueThisMonthTrend: 18.3,
  averageProjectValue: 12500,
  averageProjectValueTrend: 8.7,
  productivityScore: 94,
  productivityScoreTrend: 5.6,
  pendingTasks: 12,
  overdueTasks: 2,
  upcomingMeetings: 5,
  unreadMessages: 8,
  lastUpdated: new Date().toISOString(),
}

const mockNotifications: DashboardNotification[] = [
  { id: 'n1', title: 'New Project Assigned', message: 'You have been assigned to "Website Redesign"', type: 'info', isRead: false, createdAt: new Date().toISOString(), actionUrl: '/dashboard/projects', actionLabel: 'View Project', priority: 'normal' },
  { id: 'n2', title: 'Invoice Overdue', message: 'Invoice #1234 is 5 days overdue', type: 'warning', isRead: false, createdAt: new Date(Date.now() - 86400000).toISOString(), actionUrl: '/dashboard/invoices', actionLabel: 'View Invoice', priority: 'high' },
  { id: 'n3', title: 'Task Completed', message: 'Sarah completed "Design mockups"', type: 'success', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString(), actionUrl: null, actionLabel: null, priority: 'low' },
]

const mockQuickStats: QuickStats = {
  tasksCompletedToday: 5,
  tasksCompletedThisWeek: 23,
  pendingInvoicesCount: 3,
  pendingInvoicesTotal: 15750,
  unreadMessages: 8,
}

const mockAIInsights: AIInsight[] = [
  { id: 'ai1', type: 'revenue', title: 'Revenue Growing', description: 'Your revenue grew by 15.8% this month. Great work!', impact: 'positive', confidence: 95 },
  { id: 'ai2', type: 'productivity', title: 'Overdue Tasks', description: 'You have 2 overdue tasks. Consider prioritizing these.', impact: 'warning', confidence: 100, actionable: true, action: 'View overdue tasks' },
]

// ============================================================================
// TRANSFORM FUNCTIONS
// ============================================================================

function transformDbMetric(record: Record<string, unknown>): DashboardMetric {
  return {
    id: record.id as string,
    name: record.name as string,
    value: record.value as number,
    previousValue: record.previous_value as number,
    change: record.change as number,
    changePercent: record.change_percent as number,
    trend: record.trend as 'up' | 'down' | 'stable',
    unit: record.unit as string,
    icon: record.icon as string | null,
    color: record.color as string | null,
    isPositive: record.is_positive as boolean,
    target: record.target as number | null,
    targetProgress: record.target_progress as number | null,
    category: record.category as string,
    description: record.description as string | null,
    lastUpdated: record.last_updated as string,
  }
}

function transformDbStats(record: Record<string, unknown>): DashboardStats {
  return {
    id: record.id as string,
    earnings: record.earnings as number,
    earningsTrend: record.earnings_trend as number,
    activeProjects: record.active_projects as number,
    activeProjectsTrend: record.active_projects_trend as number,
    completedProjects: record.completed_projects as number,
    completedProjectsTrend: record.completed_projects_trend as number,
    totalClients: record.total_clients as number,
    totalClientsTrend: record.total_clients_trend as number,
    hoursThisMonth: record.hours_this_month as number,
    hoursThisMonthTrend: record.hours_this_month_trend as number,
    revenueThisMonth: record.revenue_this_month as number,
    revenueThisMonthTrend: record.revenue_this_month_trend as number,
    averageProjectValue: record.average_project_value as number,
    averageProjectValueTrend: record.average_project_value_trend as number,
    productivityScore: record.productivity_score as number,
    productivityScoreTrend: record.productivity_score_trend as number,
    pendingTasks: record.pending_tasks as number,
    overdueTasks: record.overdue_tasks as number,
    upcomingMeetings: record.upcoming_meetings as number,
    unreadMessages: record.unread_messages as number,
    lastUpdated: record.last_updated as string,
  }
}

function transformDbNotification(record: Record<string, unknown>): DashboardNotification {
  return {
    id: record.id as string,
    title: record.title as string,
    message: record.message as string,
    type: record.type as 'info' | 'warning' | 'error' | 'success',
    isRead: record.is_read as boolean,
    createdAt: record.created_at as string,
    actionUrl: record.action_url as string | null,
    actionLabel: record.action_label as string | null,
    priority: record.priority as 'low' | 'normal' | 'high' | 'urgent',
  }
}

// ============================================================================
// HOOK
// ============================================================================

interface UseDashboardOverviewOptions {
  
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
}

export function useDashboardOverview(options: UseDashboardOverviewOptions = {}) {
  const {
    
    autoRefresh = true,
    refreshInterval = 30000,
  } = options

  const supabase = createClient()

  // State
  const [metrics, setMetrics] = useState<DashboardMetric[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [notifications, setNotifications] = useState<DashboardNotification[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null)
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Fetch metrics from Supabase
  const fetchMetrics = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMetrics(null)
        return []
      }

      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const transformed = (data || []).map(transformDbMetric)
      setMetrics(transformed.length > 0 ? transformed : mockMetrics)
      return transformed
    } catch (err) {
      console.error('Error fetching metrics:', err)
      setMetrics(null)
      return []
    }
  }, [supabase])

  // Fetch stats from Supabase
  const fetchStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setStats(null)
        return []
      }

      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      const transformed = data ? transformDbStats(data) : mockStats
      setStats(transformed)
      return transformed
    } catch (err) {
      console.error('Error fetching stats:', err)
      setStats(null)
      return []
    }
  }, [supabase])

  // Fetch notifications from Supabase
  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotifications([])
        return []
      }

      const { data, error } = await supabase
        .from('dashboard_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      const transformed = (data || []).map(transformDbNotification)
      setNotifications(transformed.length > 0 ? transformed : mockNotifications)
      return transformed
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setNotifications([])
      return []
    }
  }, [supabase])

  // Fetch comprehensive data from API route
  const fetchFromApi = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'API error')
      }

      const { data } = result

      if (data.activity) {
        setRecentActivity(data.activity)
      }
      if (data.projects) {
        setRecentProjects(data.projects)
      }
      if (data.quickStats) {
        setQuickStats(data.quickStats)
      }
      if (data.deadlines) {
        setUpcomingDeadlines(data.deadlines)
      }

      return data
    } catch (err) {
      console.error('Error fetching from API:', err)
      // Use mock data as fallback
      setQuickStats(mockQuickStats)
      setAiInsights(mockAIInsights)
      return null
    }
  }, [])

  // Fetch AI insights from API
  const fetchAIInsights = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard?action=ai-insights')
      if (!response.ok) {
        throw new Error('Failed to fetch AI insights')
      }

      const result = await response.json()
      if (result.success && result.insights) {
        setAiInsights(result.insights)
        return result.insights
      }

      setAiInsights(mockAIInsights)
      return []
    } catch (err) {
      console.error('Error fetching AI insights:', err)
      setAiInsights(mockAIInsights)
      return []
    }
  }, [])

  // Refresh all data
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await Promise.all([
        fetchMetrics(),
        fetchStats(),
        fetchNotifications(),
        fetchFromApi(),
        fetchAIInsights(),
      ])
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [fetchMetrics, fetchStats, fetchNotifications, fetchFromApi, fetchAIInsights])

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('dashboard_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      return true
    } catch (err) {
      console.error('Error marking notification read:', err)
      return false
    }
  }, [supabase])

  // Log activity
  const logActivity = useCallback(async (activityData: {
    type: string
    title: string
    description?: string
    entityType?: string
    entityId?: string
    metadata?: Record<string, unknown>
  }) => {
    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'log-activity', ...activityData }),
      })

      const result = await response.json()
      return result.success
    } catch (err) {
      console.error('Error logging activity:', err)
      return false
    }
  }, [])

  // Quick create actions
  const quickCreateProject = useCallback(async (projectData: {
    name: string
    clientId?: string
    budget?: number
    deadline?: string
  }) => {
    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quick-create-project', ...projectData }),
      })

      const result = await response.json()
      if (result.success) {
        await refresh()
      }
      return result
    } catch (err) {
      console.error('Error creating project:', err)
      return { success: false, error: 'Failed to create project' }
    }
  }, [refresh])

  const quickCreateTask = useCallback(async (taskData: {
    title: string
    projectId?: string
    priority?: string
    dueDate?: string
  }) => {
    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quick-create-task', ...taskData }),
      })

      const result = await response.json()
      if (result.success) {
        await refresh()
      }
      return result
    } catch (err) {
      console.error('Error creating task:', err)
      return { success: false, error: 'Failed to create task' }
    }
  }, [refresh])

  const quickCreateInvoice = useCallback(async (invoiceData: {
    clientId: string
    amount: number
    description?: string
    dueDate?: string
  }) => {
    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quick-create-invoice', ...invoiceData }),
      })

      const result = await response.json()
      if (result.success) {
        await refresh()
      }
      return result
    } catch (err) {
      console.error('Error creating invoice:', err)
      return { success: false, error: 'Failed to create invoice' }
    }
  }, [refresh])

  // Initial load
  useEffect(() => {
    refresh()
  }, [refresh])

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dashboard_metrics' }, () => {
        fetchMetrics()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dashboard_stats' }, () => {
        fetchStats()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dashboard_notifications' }, () => {
        fetchNotifications()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchMetrics, fetchStats, fetchNotifications])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(() => {
      refresh()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refresh])

  // Computed values
  const dashboardData: DashboardData = useMemo(() => ({
    metrics,
    stats,
    notifications,
    recentActivity,
    recentProjects,
    quickStats,
    aiInsights,
    upcomingDeadlines,
  }), [metrics, stats, notifications, recentActivity, recentProjects, quickStats, aiInsights, upcomingDeadlines])

  const hasData = useMemo(() =>
    metrics.length > 0 || stats !== null || notifications.length > 0,
  [metrics, stats, notifications])

  return {
    // Data
    ...dashboardData,

    // State
    isLoading,
    error,
    lastRefresh,
    hasData,

    // Actions
    refresh,
    markNotificationRead,
    logActivity,
    quickCreateProject,
    quickCreateTask,
    quickCreateInvoice,

    // Individual fetchers (for granular control)
    fetchMetrics,
    fetchStats,
    fetchNotifications,
    fetchAIInsights,
  }
}

export default useDashboardOverview
