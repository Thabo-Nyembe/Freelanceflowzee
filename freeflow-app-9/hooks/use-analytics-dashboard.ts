'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type Period = 'day' | 'week' | 'month' | 'quarter' | 'year'
export type Granularity = 'day' | 'week' | 'month'

export interface AnalyticsOverview {
  projects: {
    total: number
    active: number
    completed: number
    totalValue: number
  }
  clients: {
    total: number
    active: number
    newInPeriod: number
  }
  revenue: {
    totalInvoiced: number
    totalPaid: number
    pending: number
    invoiceCount: number
    paidCount: number
  }
  tasks: {
    total: number
    created: number
    completed: number
    completionRate: number
  }
  period: {
    start: string
    end: string
  }
}

export interface RevenueAnalytics {
  summary: {
    totalInvoiced: number
    totalPaid: number
    pending: number
    invoiceCount: number
    paidCount: number
  }
  byMonth: Array<{
    month: string
    invoiced: number
    paid: number
    count: number
  }>
  topClients: Array<{
    clientId: string
    total: number
    count: number
  }>
  averageInvoiceValue: number
}

export interface ProjectAnalytics {
  total: number
  byStatus: Array<{ status: string; count: number }>
  byCategory: Array<{ category: string; count: number }>
  averageCompletionDays: number
  totalBudget: number
  onTimeRate: number
}

export interface ClientAnalytics {
  total: number
  active: number
  topClients: Array<{
    id: string
    name: string
    totalRevenue: number
    projectCount: number
    activeProjects: number
    invoiceCount: number
    status: string
  }>
  averageLifetimeValue: number
  retentionRate: number
}

export interface TaskAnalytics {
  total: number
  byStatus: Array<{ status: string; count: number }>
  byPriority: Array<{ priority: string; count: number }>
  completionTrend: Array<{ date: string; completed: number }>
  averageTimeToComplete: number
}

export interface ProductivityAnalytics {
  tasksCompleted: number
  totalHours: number
  billableHours: number
  billableRate: number
  productivityScore: number
  focusTime: number
}

export interface TimeTrackingAnalytics {
  totalHours: number
  entriesCount: number
  byProject: Array<{
    projectId: string
    projectName: string
    hours: number
  }>
  byDay: Array<{ date: string; hours: number }>
  averageSessionLength: number
}

export interface TeamAnalytics {
  teamSize: number
  members: Array<{
    id: string
    userId: string
    role: string
    tasksAssigned: number
    tasksCompleted: number
    completionRate: number
  }>
  teamProductivity: number
}

export interface TrendData {
  labels: string[]
  datasets: {
    tasksCreated: number[]
    tasksCompleted: number[]
    revenue: number[]
  }
}

export interface ComparisonData {
  current: AnalyticsOverview
  previous: AnalyticsOverview
  changes: {
    revenue: { value: number; percentage: number }
    projects: { value: number; percentage: number }
    clients: { value: number; percentage: number }
    tasks: { value: number; percentage: number }
  }
}

export interface ForecastData {
  monthlyAverage: number
  growthRate: number
  forecasts: Array<{
    month: string
    predictedRevenue: number
    confidence: number
  }>
}

export interface TopPerformers {
  topClients: Array<{
    clientId: string
    name: string
    total: number
  }>
  topProjects: Array<{
    id: string
    name: string
    budget: number
    status: string
  }>
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockOverview: AnalyticsOverview = {
  projects: { total: 45, active: 12, completed: 28, totalValue: 2450000 },
  clients: { total: 24, active: 18, newInPeriod: 3 },
  revenue: { totalInvoiced: 485000, totalPaid: 412500, pending: 72500, invoiceCount: 42, paidCount: 35 },
  tasks: { total: 156, created: 45, completed: 38, completionRate: 84 },
  period: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString() }
}

const mockProductivity: ProductivityAnalytics = {
  tasksCompleted: 38,
  totalHours: 168,
  billableHours: 142,
  billableRate: 85,
  productivityScore: 94,
  focusTime: 112
}

const mockRevenueAnalytics: RevenueAnalytics = {
  summary: { totalInvoiced: 485000, totalPaid: 412500, pending: 72500, invoiceCount: 42, paidCount: 35 },
  byMonth: [
    { month: '2025-10', invoiced: 125000, paid: 118000, count: 12 },
    { month: '2025-11', invoiced: 145000, paid: 138000, count: 14 },
    { month: '2025-12', invoiced: 158000, paid: 148500, count: 16 },
  ],
  topClients: [
    { clientId: 'c1', total: 125000, count: 8 },
    { clientId: 'c2', total: 95000, count: 6 },
    { clientId: 'c3', total: 72000, count: 5 },
  ],
  averageInvoiceValue: 11550
}

const mockProjectAnalytics: ProjectAnalytics = {
  total: 45,
  byStatus: [
    { status: 'active', count: 12 },
    { status: 'completed', count: 28 },
    { status: 'on_hold', count: 5 },
  ],
  byCategory: [
    { category: 'web_development', count: 18 },
    { category: 'mobile_app', count: 12 },
    { category: 'branding', count: 15 },
  ],
  averageCompletionDays: 45,
  totalBudget: 2450000,
  onTimeRate: 87
}

const mockTrends: TrendData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: {
    tasksCreated: [8, 12, 10, 15, 11, 4, 2],
    tasksCompleted: [6, 9, 11, 12, 10, 3, 1],
    revenue: [15000, 22000, 18000, 28000, 25000, 5000, 2000]
  }
}

// ============================================================================
// HOOK
// ============================================================================

interface UseAnalyticsDashboardOptions {
  period?: Period
  
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useAnalyticsDashboard(options: UseAnalyticsDashboardOptions = {}) {
  const {
    period = 'month',
    
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  const supabase = createClient()

  // State
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null)
  const [projectAnalytics, setProjectAnalytics] = useState<ProjectAnalytics | null>(null)
  const [clientAnalytics, setClientAnalytics] = useState<ClientAnalytics | null>(null)
  const [taskAnalytics, setTaskAnalytics] = useState<TaskAnalytics | null>(null)
  const [productivityAnalytics, setProductivityAnalytics] = useState<ProductivityAnalytics | null>(null)
  const [timeTracking, setTimeTracking] = useState<TimeTrackingAnalytics | null>(null)
  const [teamAnalytics, setTeamAnalytics] = useState<TeamAnalytics | null>(null)
  const [trends, setTrends] = useState<TrendData | null>(null)
  const [comparisons, setComparisons] = useState<ComparisonData | null>(null)
  const [forecasts, setForecasts] = useState<ForecastData | null>(null)
  const [topPerformers, setTopPerformers] = useState<TopPerformers | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Fetch comprehensive analytics
  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch all analytics data
      const response = await fetch(`/api/analytics/comprehensive?period=${period}`)
      const result = await response.json()
      if (result.success) {
        setOverview(result.overview || null)
        setRevenue(result.revenue || null)
        setComparisons(result.comparisons || null)
        setForecasts(result.forecasts || null)
        setTopPerformers(result.topPerformers || null)
      }
      return result
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'))
      return null
    } finally {
      setIsLoading(false)
      setLastRefresh(new Date())
    }
  }, [period])

  const fetchRevenue = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/comprehensive?action=revenue&period=${period}`)
      const result = await response.json()
      if (result.success) {
        setRevenueAnalytics(result.revenue)
      }
      return result.revenue
    } catch (err) {
      console.error('Error fetching revenue:', err)
      return []
    }
  }, [period])

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/comprehensive?action=projects&period=${period}`)
      const result = await response.json()
      if (result.success) {
        setProjectAnalytics(result.projects)
      }
      return result.projects
    } catch (err) {
      console.error('Error fetching projects:', err)
      return []
    }
  }, [period])

  const fetchClients = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/comprehensive?action=clients&period=${period}`)
      const result = await response.json()
      if (result.success) {
        setClientAnalytics(result.clients)
      }
      return result.clients
    } catch (err) {
      console.error('Error fetching clients:', err)
      return null
    }
  }, [period])

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/comprehensive?action=tasks&period=${period}`)
      const result = await response.json()
      if (result.success) {
        setTaskAnalytics(result.tasks)
      }
      return result.tasks
    } catch (err) {
      console.error('Error fetching tasks:', err)
      return null
    }
  }, [period])

  const fetchProductivity = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/comprehensive?action=productivity&period=${period}`)
      const result = await response.json()
      if (result.success) {
        setProductivityAnalytics(result.productivity)
      }
      return result.productivity
    } catch (err) {
      console.error('Error fetching productivity:', err)
      return []
    }
  }, [period])

  const fetchTimeTracking = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/comprehensive?action=time-tracking&period=${period}`)
      const result = await response.json()
      if (result.success) {
        setTimeTracking(result.timeTracking)
      }
      return result.timeTracking
    } catch (err) {
      console.error('Error fetching time tracking:', err)
      return null
    }
  }, [period])

  const fetchTeam = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/comprehensive?action=team&period=${period}`)
      const result = await response.json()
      if (result.success) {
        setTeamAnalytics(result.team)
      }
      return result.team
    } catch (err) {
      console.error('Error fetching team:', err)
      return null
    }
  }, [period])

  const fetchTrends = useCallback(async (granularity: Granularity = 'day') => {
    try {
      const response = await fetch(`/api/analytics/comprehensive?action=trends&period=${period}&granularity=${granularity}`)
      const result = await response.json()
      if (result.success) {
        setTrends(result.trends)
      }
      return result.trends
    } catch (err) {
      console.error('Error fetching trends:', err)
      return []
    }
  }, [period])

  const fetchComparisons = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/comprehensive?action=comparisons&period=${period}`)
      const result = await response.json()
      if (result.success) {
        setComparisons(result.comparisons)
      }
      return result.comparisons
    } catch (err) {
      console.error('Error fetching comparisons:', err)
      return null
    }
  }, [period])

  const fetchForecasts = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/comprehensive?action=forecasts`)
      const result = await response.json()
      if (result.success) {
        setForecasts(result.forecasts)
      }
      return result.forecasts
    } catch (err) {
      console.error('Error fetching forecasts:', err)
      return null
    }
  }, [])

  const fetchTopPerformers = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/comprehensive?action=top-performers&period=${period}`)
      const result = await response.json()
      if (result.success) {
        setTopPerformers(result.topPerformers)
      }
      return result.topPerformers
    } catch (err) {
      console.error('Error fetching top performers:', err)
      return null
    }
  }, [period])

  // Actions
  const generateReport = useCallback(async (reportOptions: {
    type: string
    period: string
    format?: string
    includeCharts?: boolean
  }) => {
    try {
      const response = await fetch('/api/analytics/comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-report', ...reportOptions }),
      })

      const result = await response.json()
      return result
    } catch (err) {
      console.error('Error generating report:', err)
      return { success: false, error: 'Failed to generate report' }
    }
  }, [])

  const scheduleReport = useCallback(async (scheduleOptions: {
    type: string
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
    format?: string
  }) => {
    try {
      const response = await fetch('/api/analytics/comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'schedule-report', ...scheduleOptions }),
      })

      const result = await response.json()
      return result
    } catch (err) {
      console.error('Error scheduling report:', err)
      return { success: false, error: 'Failed to schedule report' }
    }
  }, [])

  const exportData = useCallback(async (exportOptions: {
    dataTypes: string[]
    period: string
    format?: 'csv' | 'json' | 'excel'
  }) => {
    try {
      const response = await fetch('/api/analytics/comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export-data', ...exportOptions }),
      })

      const result = await response.json()
      return result
    } catch (err) {
      console.error('Error exporting data:', err)
      return { success: false, error: 'Failed to export data' }
    }
  }, [])

  const createGoal = useCallback(async (goalOptions: {
    type: string
    target: number
    period: string
    description?: string
  }) => {
    try {
      const response = await fetch('/api/analytics/comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-goal', ...goalOptions }),
      })

      const result = await response.json()
      return result
    } catch (err) {
      console.error('Error creating goal:', err)
      return { success: false, error: 'Failed to create goal' }
    }
  }, [])

  const trackEvent = useCallback(async (eventOptions: {
    eventType: string
    eventData?: Record<string, unknown>
    metadata?: Record<string, unknown>
  }) => {
    try {
      const response = await fetch('/api/analytics/comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'track-event', ...eventOptions }),
      })

      const result = await response.json()
      return result
    } catch (err) {
      console.error('Error tracking event:', err)
      return { success: false, error: 'Failed to track event' }
    }
  }, [])

  // Refresh all data
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    await fetchAll()
  }, [fetchAll])

  // Initial load
  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(() => {
      fetchAll()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchAll])

  // Computed values
  const hasData = useMemo(() =>
    overview !== null || revenueAnalytics !== null || projectAnalytics !== null,
  [overview, revenueAnalytics, projectAnalytics])

  const summary = useMemo(() => {
    if (!overview) return null
    return {
      totalRevenue: overview.revenue.totalPaid,
      pendingRevenue: overview.revenue.pending,
      activeProjects: overview.projects.active,
      completedProjects: overview.projects.completed,
      totalClients: overview.clients.total,
      newClients: overview.clients.newInPeriod,
      taskCompletionRate: overview.tasks.completionRate,
    }
  }, [overview])

  return {
    // Data
    overview,
    revenueAnalytics,
    projectAnalytics,
    clientAnalytics,
    taskAnalytics,
    productivityAnalytics,
    timeTracking,
    teamAnalytics,
    trends,
    comparisons,
    forecasts,
    topPerformers,
    summary,

    // State
    isLoading,
    error,
    lastRefresh,
    hasData,
    period,

    // Fetch methods
    refresh,
    fetchOverview,
    fetchRevenue,
    fetchProjects,
    fetchClients,
    fetchTasks,
    fetchProductivity,
    fetchTimeTracking,
    fetchTeam,
    fetchTrends,
    fetchComparisons,
    fetchForecasts,
    fetchTopPerformers,

    // Actions
    generateReport,
    scheduleReport,
    exportData,
    createGoal,
    trackEvent,
  }
}

export default useAnalyticsDashboard
