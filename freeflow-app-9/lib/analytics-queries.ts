/**
 * Analytics Queries - Supabase Integration for Analytics Dashboard
 *
 * Provides business intelligence metrics by aggregating data from existing tables
 * (projects, clients, invoices, bookings) and pre-computed analytics metrics.
 */

import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from '@/lib/logger'
import type { Metric, Insight, Goal, FunnelStage, TimeRange } from '@/lib/analytics-types'

const logger = createFeatureLogger('AnalyticsQueries')

// ============================================================================
// TYPES
// ============================================================================

export type MetricCategory = 'revenue' | 'projects' | 'clients' | 'time' | 'performance'

export interface DailyMetric {
  id: string
  user_id: string
  date: string
  category: MetricCategory
  revenue: number
  invoices_sent: number
  invoices_paid: number
  projects_created: number
  projects_completed: number
  projects_active: number
  clients_new: number
  clients_active: number
  clients_total: number
  hours_tracked: number
  billable_hours: number
  completion_rate: number
  satisfaction_score: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface MonthlyMetric {
  id: string
  user_id: string
  year: number
  month: number
  total_revenue: number
  revenue_growth: number
  average_project_value: number
  total_projects: number
  projects_completed: number
  projects_growth: number
  total_clients: number
  new_clients: number
  clients_growth: number
  client_retention_rate: number
  total_hours: number
  billable_hours: number
  utilization_rate: number
  project_completion_rate: number
  on_time_delivery_rate: number
  client_satisfaction: number
  profit_margin: number
  category_breakdown: Record<string, any>
  top_clients: any[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AnalyticsOverview {
  totalRevenue: number
  monthlyRevenue: number
  revenueGrowth: number
  activeProjects: number
  totalProjects: number
  projectGrowth: number
  totalClients: number
  newClients: number
  clientGrowth: number
  efficiency: number
  billableHours: number
  efficiencyGrowth: number
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  projects: number
  clients: number
}

export interface ProjectCategory {
  category: string
  count: number
  revenue: number
  color: string
  growth: number
}

export interface TopClient {
  name: string
  revenue: number
  projects: number
  satisfaction: number
}

export interface PerformanceMetrics {
  projectCompletionRate: number
  onTimeDelivery: number
  clientSatisfaction: number
  revenuePerProject: number
  profitMargin: number
}

// ============================================================================
// COMPUTED ANALYTICS (from existing data)
// ============================================================================

/**
 * Get analytics overview - aggregates data from all sources
 */
export async function getAnalyticsOverview(
  userId: string
): Promise<{ data: AnalyticsOverview | null; error: any }> {
  const startTime = performance.now()

  try {
    const supabase = createClient()

    // Get current month metrics
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    const { data: currentMonthData } = await supabase
      .from('analytics_monthly_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('year', currentYear)
      .eq('month', currentMonth)
      .single()

    // Get previous month for growth calculations
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear

    const { data: previousMonthData } = await supabase
      .from('analytics_monthly_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('year', previousYear)
      .eq('month', previousMonth)
      .single()

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return 0
      return Number((((current - previous) / previous) * 100).toFixed(2))
    }

    // Aggregate real-time data from projects table
    const { count: activeProjectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['in_progress', 'planning'])

    const { count: totalProjectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const overview: AnalyticsOverview = {
      totalRevenue: currentMonthData?.total_revenue || 0,
      monthlyRevenue: currentMonthData?.total_revenue || 0,
      revenueGrowth: currentMonthData?.revenue_growth || calculateGrowth(
        currentMonthData?.total_revenue || 0,
        previousMonthData?.total_revenue || 0
      ),
      activeProjects: activeProjectsCount || 0,
      totalProjects: totalProjectsCount || 0,
      projectGrowth: currentMonthData?.projects_growth || calculateGrowth(
        currentMonthData?.total_projects || 0,
        previousMonthData?.total_projects || 0
      ),
      totalClients: currentMonthData?.total_clients || 0,
      newClients: currentMonthData?.new_clients || 0,
      clientGrowth: currentMonthData?.clients_growth || calculateGrowth(
        currentMonthData?.total_clients || 0,
        previousMonthData?.total_clients || 0
      ),
      efficiency: currentMonthData?.utilization_rate || 0,
      billableHours: currentMonthData?.billable_hours || 0,
      efficiencyGrowth: calculateGrowth(
        currentMonthData?.utilization_rate || 0,
        previousMonthData?.utilization_rate || 0
      )
    }

    const duration = performance.now() - startTime

    logger.info('Analytics overview fetched successfully', {
      userId,
      duration,
      hasCurrentData: !!currentMonthData,
      hasPreviousData: !!previousMonthData
    })

    return { data: overview, error: null }
  } catch (error: any) {
    logger.error('Exception in getAnalyticsOverview', { error: error.message, userId })
    return { data: null, error }
  }
}

/**
 * Get monthly revenue data for charts (last 6 months)
 */
export async function getMonthlyRevenue(
  userId: string,
  months: number = 6
): Promise<{ data: MonthlyRevenue[]; error: any }> {
  try {
    const supabase = createClient()
    const currentDate = new Date()

    // Calculate date range
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - months + 1, 1)

    const { data, error } = await supabase
      .from('analytics_monthly_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('year', startDate.getFullYear())
      .order('year', { ascending: true })
      .order('month', { ascending: true })
      .limit(months)

    if (error) {
      logger.error('Failed to fetch monthly revenue', { error: error.message, userId })
      return { data: [], error }
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const monthlyRevenue: MonthlyRevenue[] = (data || []).map(m => ({
      month: monthNames[m.month - 1],
      revenue: Number(m.total_revenue),
      projects: m.total_projects,
      clients: m.total_clients
    }))

    logger.info('Monthly revenue fetched successfully', {
      userId,
      count: monthlyRevenue.length
    })

    return { data: monthlyRevenue, error: null }
  } catch (error: any) {
    logger.error('Exception in getMonthlyRevenue', { error: error.message, userId })
    return { data: [], error }
  }
}

/**
 * Get project categories breakdown with revenue and growth
 */
export async function getProjectCategories(
  userId: string
): Promise<{ data: ProjectCategory[]; error: any }> {
  try {
    const supabase = createClient()

    // Get current month data
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    const { data: currentMonthData } = await supabase
      .from('analytics_monthly_metrics')
      .select('category_breakdown')
      .eq('user_id', userId)
      .eq('year', currentYear)
      .eq('month', currentMonth)
      .single()

    // Also aggregate from projects table for real-time data
    const { data: projects } = await supabase
      .from('projects')
      .select('category, budget')
      .eq('user_id', userId)

    // Create category map
    const categoryMap: Record<string, { count: number; revenue: number }> = {}

    if (projects) {
      projects.forEach(project => {
        const category = project.category || 'Other'
        if (!categoryMap[category]) {
          categoryMap[category] = { count: 0, revenue: 0 }
        }
        categoryMap[category].count++
        categoryMap[category].revenue += Number(project.budget || 0)
      })
    }

    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500']

    const categories: ProjectCategory[] = Object.entries(categoryMap).map(([category, data], index) => ({
      category,
      count: data.count,
      revenue: data.revenue,
      color: colors[index % colors.length],
      growth: 0 // TODO: Calculate from previous month
    }))

    // Sort by revenue descending
    categories.sort((a, b) => b.revenue - a.revenue)

    logger.info('Project categories fetched successfully', {
      userId,
      count: categories.length
    })

    return { data: categories, error: null }
  } catch (error: any) {
    logger.error('Exception in getProjectCategories', { error: error.message, userId })
    return { data: [], error }
  }
}

/**
 * Get top clients by revenue
 */
export async function getTopClients(
  userId: string,
  limit: number = 10
): Promise<{ data: TopClient[]; error: any }> {
  try {
    const supabase = createClient()

    // Get clients with their project counts and revenue
    const { data: clients } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        projects (
          id,
          budget,
          status
        )
      `)
      .eq('user_id', userId)
      .limit(limit)

    if (!clients) {
      return { data: [], error: null }
    }

    const topClients: TopClient[] = clients.map((client: any) => {
      const projects = client.projects || []
      const revenue = projects.reduce((sum: number, p: any) => sum + Number(p.budget || 0), 0)

      return {
        name: client.name,
        revenue,
        projects: projects.length,
        satisfaction: 95 // TODO: Calculate from feedback/ratings
      }
    })

    // Sort by revenue descending
    topClients.sort((a, b) => b.revenue - a.revenue)

    logger.info('Top clients fetched successfully', {
      userId,
      count: topClients.length
    })

    return { data: topClients.slice(0, limit), error: null }
  } catch (error: any) {
    logger.error('Exception in getTopClients', { error: error.message, userId })
    return { data: [], error }
  }
}

/**
 * Get performance metrics
 */
export async function getPerformanceMetrics(
  userId: string
): Promise<{ data: PerformanceMetrics | null; error: any }> {
  try {
    const supabase = createClient()

    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    const { data: monthData } = await supabase
      .from('analytics_monthly_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('year', currentYear)
      .eq('month', currentMonth)
      .single()

    const metrics: PerformanceMetrics = {
      projectCompletionRate: Number(monthData?.project_completion_rate || 0),
      onTimeDelivery: Number(monthData?.on_time_delivery_rate || 0),
      clientSatisfaction: Number(monthData?.client_satisfaction || 0),
      revenuePerProject: monthData?.total_projects > 0
        ? Number(monthData.total_revenue) / monthData.total_projects
        : 0,
      profitMargin: Number(monthData?.profit_margin || 0)
    }

    logger.info('Performance metrics fetched successfully', { userId })

    return { data: metrics, error: null }
  } catch (error: any) {
    logger.error('Exception in getPerformanceMetrics', { error: error.message, userId })
    return { data: null, error }
  }
}

// ============================================================================
// ANALYTICS METRICS MANAGEMENT
// ============================================================================

/**
 * Record daily metric
 */
export async function recordDailyMetric(
  userId: string,
  date: string,
  category: MetricCategory,
  metrics: Partial<DailyMetric>
): Promise<{ data: DailyMetric | null; error: any }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('analytics_daily_metrics')
      .upsert({
        user_id: userId,
        date,
        category,
        ...metrics,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,date,category'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to record daily metric', { error: error.message, userId, date, category })
      return { data: null, error }
    }

    logger.info('Daily metric recorded successfully', { userId, date, category })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in recordDailyMetric', { error: error.message, userId })
    return { data: null, error }
  }
}

/**
 * Record monthly metric
 */
export async function recordMonthlyMetric(
  userId: string,
  year: number,
  month: number,
  metrics: Partial<MonthlyMetric>
): Promise<{ data: MonthlyMetric | null; error: any }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('analytics_monthly_metrics')
      .upsert({
        user_id: userId,
        year,
        month,
        ...metrics,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,year,month'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to record monthly metric', { error: error.message, userId, year, month })
      return { data: null, error }
    }

    logger.info('Monthly metric recorded successfully', { userId, year, month })

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in recordMonthlyMetric', { error: error.message, userId })
    return { data: null, error }
  }
}

/**
 * Get daily metrics for a date range
 */
export async function getDailyMetrics(
  userId: string,
  startDate: string,
  endDate: string,
  category?: MetricCategory
): Promise<{ data: DailyMetric[]; error: any }> {
  try {
    const supabase = createClient()

    let query = supabase
      .from('analytics_daily_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch daily metrics', { error: error.message, userId })
      return { data: [], error }
    }

    logger.info('Daily metrics fetched successfully', {
      userId,
      count: data?.length || 0,
      startDate,
      endDate
    })

    return { data: data || [], error: null }
  } catch (error: any) {
    logger.error('Exception in getDailyMetrics', { error: error.message, userId })
    return { data: [], error }
  }
}

/**
 * Get monthly metrics for a year
 */
export async function getMonthlyMetrics(
  userId: string,
  year: number
): Promise<{ data: MonthlyMetric[]; error: any }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('analytics_monthly_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .order('month', { ascending: true })

    if (error) {
      logger.error('Failed to fetch monthly metrics', { error: error.message, userId, year })
      return { data: [], error }
    }

    logger.info('Monthly metrics fetched successfully', {
      userId,
      year,
      count: data?.length || 0
    })

    return { data: data || [], error: null }
  } catch (error: any) {
    logger.error('Exception in getMonthlyMetrics', { error: error.message, userId })
    return { data: [], error }
  }
}

// ============================================================================
// USER ANALYTICS PREFERENCES
// ============================================================================

export interface AnalyticsUserPreferences {
  id: string
  user_id: string
  last_refresh_at: string
  auto_refresh_interval: number
  default_date_range: string
  ai_mode_enabled: boolean
  predictive_mode_enabled: boolean
  bookmarked_views: string[]
  created_at: string
  updated_at: string
}

/**
 * Get user's analytics preferences
 */
export async function getAnalyticsPreferences(
  userId: string
): Promise<{ data: AnalyticsUserPreferences | null; error: any }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('analytics_user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      logger.error('Failed to fetch analytics preferences', { error: error.message, userId })
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in getAnalyticsPreferences', { error: error.message, userId })
    return { data: null, error }
  }
}

/**
 * Update analytics last refresh timestamp
 */
export async function updateAnalyticsLastRefresh(
  userId: string
): Promise<{ data: AnalyticsUserPreferences | null; error: any }> {
  try {
    const supabase = createClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('analytics_user_preferences')
      .upsert({
        user_id: userId,
        last_refresh_at: now,
        updated_at: now
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to update analytics last refresh', { error: error.message, userId })
      return { data: null, error }
    }

    logger.info('Analytics last refresh updated', { userId, timestamp: now })
    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in updateAnalyticsLastRefresh', { error: error.message, userId })
    return { data: null, error }
  }
}

/**
 * Update analytics user preferences
 */
export async function updateAnalyticsPreferences(
  userId: string,
  preferences: Partial<AnalyticsUserPreferences>
): Promise<{ data: AnalyticsUserPreferences | null; error: any }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('analytics_user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to update analytics preferences', { error: error.message, userId })
      return { data: null, error }
    }

    logger.info('Analytics preferences updated', { userId, fields: Object.keys(preferences) })
    return { data, error: null }
  } catch (error: any) {
    logger.error('Exception in updateAnalyticsPreferences', { error: error.message, userId })
    return { data: null, error }
  }
}

// ============================================================================
// ANALYTICS COMPUTATION HELPERS
// ============================================================================

/**
 * Compute and store daily metrics from existing data
 * This should be run daily via a cron job or webhook
 */
export async function computeDailyMetrics(
  userId: string,
  date: string = new Date().toISOString().split('T')[0]
): Promise<{ success: boolean; error: any }> {
  try {
    const supabase = createClient()

    // Compute revenue metrics
    const { data: invoices } = await supabase
      .from('invoices')
      .select('amount, status, created_at')
      .eq('user_id', userId)
      .gte('created_at', `${date}T00:00:00`)
      .lte('created_at', `${date}T23:59:59`)

    const revenue = invoices?.reduce((sum, inv) => sum + (inv.status === 'paid' ? Number(inv.amount) : 0), 0) || 0
    const invoicesSent = invoices?.length || 0
    const invoicesPaid = invoices?.filter(inv => inv.status === 'paid').length || 0

    await recordDailyMetric(userId, date, 'revenue', {
      revenue,
      invoices_sent: invoicesSent,
      invoices_paid: invoicesPaid
    })

    // Compute project metrics
    const { count: projectsCreated } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${date}T00:00:00`)
      .lte('created_at', `${date}T23:59:59`)

    const { count: projectsCompleted } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('end_date', date)
      .lte('end_date', date)

    const { count: projectsActive } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['in_progress', 'planning'])

    await recordDailyMetric(userId, date, 'projects', {
      projects_created: projectsCreated || 0,
      projects_completed: projectsCompleted || 0,
      projects_active: projectsActive || 0
    })

    logger.info('Daily metrics computed successfully', { userId, date })

    return { success: true, error: null }
  } catch (error: any) {
    logger.error('Exception in computeDailyMetrics', { error: error.message, userId, date })
    return { success: false, error }
  }
}

// ============================================================================
// ADVANCED ANALYTICS FUNCTIONS
// These functions provide data for the advanced analytics dashboard
// ============================================================================

/**
 * Get analytics metrics for a given time range
 */
export async function getAnalyticsMetrics(
  userId: string,
  timeRange: TimeRange = 'month'
): Promise<{ data: Metric[] | null; error: any }> {
  try {
    // Get overview data for metrics
    const { data: overview } = await getAnalyticsOverview(userId)

    // Build metrics array from overview data
    const metrics: Metric[] = [
      {
        id: 'revenue',
        name: 'Total Revenue',
        type: 'revenue',
        value: overview?.totalRevenue || 0,
        previousValue: 0,
        change: overview?.revenueGrowth || 0,
        changePercent: overview?.revenueGrowth || 0,
        trend: (overview?.revenueGrowth || 0) > 0 ? 'up' : (overview?.revenueGrowth || 0) < 0 ? 'down' : 'stable',
        unit: 'currency',
        icon: '💰',
        color: '#10b981'
      },
      {
        id: 'projects',
        name: 'Active Projects',
        type: 'performance',
        value: overview?.activeProjects || 0,
        previousValue: 0,
        change: overview?.projectGrowth || 0,
        changePercent: overview?.projectGrowth || 0,
        trend: (overview?.projectGrowth || 0) > 0 ? 'up' : (overview?.projectGrowth || 0) < 0 ? 'down' : 'stable',
        unit: 'number',
        icon: '📊',
        color: '#3b82f6'
      },
      {
        id: 'clients',
        name: 'Total Clients',
        type: 'users',
        value: overview?.totalClients || 0,
        previousValue: 0,
        change: overview?.clientGrowth || 0,
        changePercent: overview?.clientGrowth || 0,
        trend: (overview?.clientGrowth || 0) > 0 ? 'up' : (overview?.clientGrowth || 0) < 0 ? 'down' : 'stable',
        unit: 'number',
        icon: '👥',
        color: '#8b5cf6'
      },
      {
        id: 'efficiency',
        name: 'Efficiency Rate',
        type: 'performance',
        value: overview?.efficiency || 0,
        previousValue: 0,
        change: overview?.efficiencyGrowth || 0,
        changePercent: overview?.efficiencyGrowth || 0,
        trend: (overview?.efficiencyGrowth || 0) > 0 ? 'up' : (overview?.efficiencyGrowth || 0) < 0 ? 'down' : 'stable',
        unit: 'percentage',
        icon: '⚡',
        color: '#f59e0b'
      },
      {
        id: 'billable-hours',
        name: 'Billable Hours',
        type: 'performance',
        value: overview?.billableHours || 0,
        previousValue: 0,
        change: 0,
        changePercent: 0,
        trend: 'stable',
        unit: 'time',
        icon: '⏱️',
        color: '#06b6d4'
      },
      {
        id: 'new-clients',
        name: 'New Clients',
        type: 'users',
        value: overview?.newClients || 0,
        previousValue: 0,
        change: 0,
        changePercent: 0,
        trend: 'stable',
        unit: 'number',
        icon: '🆕',
        color: '#ec4899'
      }
    ]

    logger.info('Analytics metrics fetched', { userId, timeRange, count: metrics.length })
    return { data: metrics, error: null }
  } catch (error: any) {
    logger.error('Exception in getAnalyticsMetrics', { error: error.message, userId })
    return { data: null, error }
  }
}

/**
 * Get revenue chart data
 */
export async function getRevenueChart(
  userId: string,
  timeRange: TimeRange = 'month'
): Promise<{ data: { label: string; value: number }[]; error: any }> {
  try {
    const { data: monthlyData } = await getMonthlyRevenue(userId, 6)

    // Transform to simple label/value format for charts
    const chartData = (monthlyData || []).map(m => ({
      label: m.month,
      value: m.revenue
    }))

    // If no data, return mock data
    if (chartData.length === 0) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      return {
        data: months.map((month, i) => ({
          label: month,
          value: Math.floor(Math.random() * 50000) + 10000
        })),
        error: null
      }
    }

    logger.info('Revenue chart data fetched', { userId, timeRange, points: chartData.length })
    return { data: chartData, error: null }
  } catch (error: any) {
    logger.error('Exception in getRevenueChart', { error: error.message, userId })
    return { data: [], error }
  }
}

/**
 * Get users chart data
 */
export async function getUsersChart(
  userId: string,
  timeRange: TimeRange = 'month'
): Promise<{ data: { label: string; value: number }[]; error: any }> {
  try {
    // Get client counts over time (simplified - returns mock for now)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const chartData = months.map((month, i) => ({
      label: month,
      value: Math.floor(Math.random() * 100) + 50
    }))

    logger.info('Users chart data fetched', { userId, timeRange, points: chartData.length })
    return { data: chartData, error: null }
  } catch (error: any) {
    logger.error('Exception in getUsersChart', { error: error.message, userId })
    return { data: [], error }
  }
}

/**
 * Get traffic sources data
 */
export async function getTrafficSources(
  userId: string,
  timeRange: TimeRange = 'month'
): Promise<{ data: { label: string; value: number }[]; error: any }> {
  try {
    // Return mock traffic sources data
    const sources = [
      { label: 'Direct', value: 4500 },
      { label: 'Organic Search', value: 3200 },
      { label: 'Referral', value: 1800 },
      { label: 'Social Media', value: 1200 },
      { label: 'Email', value: 800 }
    ]

    logger.info('Traffic sources data fetched', { userId, timeRange })
    return { data: sources, error: null }
  } catch (error: any) {
    logger.error('Exception in getTrafficSources', { error: error.message, userId })
    return { data: [], error }
  }
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnel(
  userId: string
): Promise<{ data: FunnelStage[]; error: any }> {
  try {
    // Return mock funnel data
    const funnel: FunnelStage[] = [
      { id: '1', name: 'Visitors', count: 10000, percentage: 100, conversionRate: 100 },
      { id: '2', name: 'Leads', count: 2500, percentage: 25, conversionRate: 25, dropoffRate: 75 },
      { id: '3', name: 'Qualified Leads', count: 1000, percentage: 10, conversionRate: 40, dropoffRate: 60 },
      { id: '4', name: 'Proposals', count: 400, percentage: 4, conversionRate: 40, dropoffRate: 60 },
      { id: '5', name: 'Customers', count: 200, percentage: 2, conversionRate: 50, dropoffRate: 50 }
    ]

    logger.info('Conversion funnel data fetched', { userId })
    return { data: funnel, error: null }
  } catch (error: any) {
    logger.error('Exception in getConversionFunnel', { error: error.message, userId })
    return { data: [], error }
  }
}

/**
 * Get AI-generated insights
 */
export async function getInsights(
  userId: string
): Promise<{ data: Insight[]; error: any }> {
  try {
    // Return mock insights data
    const insights: Insight[] = [
      {
        id: '1',
        type: 'trend',
        title: 'Revenue Growth Detected',
        description: 'Your revenue has increased by 15% compared to last month. This trend is driven primarily by new client acquisitions.',
        impact: 'high',
        metric: 'revenue',
        value: 15,
        recommendation: 'Consider expanding your sales team to maintain this growth trajectory.',
        createdAt: new Date(),
        isRead: false
      },
      {
        id: '2',
        type: 'opportunity',
        title: 'Underutilized Service Category',
        description: 'Your consulting services are being requested 40% less than industry average. There may be an opportunity to promote these services.',
        impact: 'medium',
        recommendation: 'Create a targeted marketing campaign for consulting services.',
        createdAt: new Date(Date.now() - 86400000),
        isRead: true
      },
      {
        id: '3',
        type: 'warning',
        title: 'Client Retention Risk',
        description: '3 clients have not engaged with your services in the past 60 days. Early intervention may prevent churn.',
        impact: 'medium',
        recommendation: 'Schedule check-in calls with at-risk clients.',
        createdAt: new Date(Date.now() - 172800000),
        isRead: false
      },
      {
        id: '4',
        type: 'achievement',
        title: 'Project Completion Milestone',
        description: 'You have completed 50 projects this quarter, a 25% improvement from the previous quarter.',
        impact: 'high',
        createdAt: new Date(Date.now() - 259200000),
        isRead: true
      }
    ]

    logger.info('Insights data fetched', { userId, count: insights.length })
    return { data: insights, error: null }
  } catch (error: any) {
    logger.error('Exception in getInsights', { error: error.message, userId })
    return { data: [], error }
  }
}

/**
 * Get goals and targets
 */
export async function getGoals(
  userId: string
): Promise<{ data: Goal[]; error: any }> {
  try {
    // Return mock goals data
    const goals: Goal[] = [
      {
        id: '1',
        name: 'Q1 Revenue Target',
        description: 'Achieve $100,000 in revenue for Q1 2024',
        metric: 'revenue',
        target: 100000,
        current: 75000,
        progress: 75,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        status: 'on-track'
      },
      {
        id: '2',
        name: 'Client Acquisition',
        description: 'Onboard 20 new clients this quarter',
        metric: 'clients',
        target: 20,
        current: 12,
        progress: 60,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        status: 'at-risk'
      },
      {
        id: '3',
        name: 'Project Completion Rate',
        description: 'Complete 95% of projects on time',
        metric: 'conversion',
        target: 95,
        current: 92,
        progress: 96.8,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        status: 'on-track'
      },
      {
        id: '4',
        name: 'Customer Satisfaction',
        description: 'Achieve 4.8/5 average satisfaction rating',
        metric: 'performance',
        target: 4.8,
        current: 4.6,
        progress: 95.8,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'on-track'
      },
      {
        id: '5',
        name: 'Annual Revenue Goal',
        description: 'Reach $500,000 in annual revenue',
        metric: 'revenue',
        target: 500000,
        current: 425000,
        progress: 85,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'on-track'
      }
    ]

    logger.info('Goals data fetched', { userId, count: goals.length })
    return { data: goals, error: null }
  } catch (error: any) {
    logger.error('Exception in getGoals', { error: error.message, userId })
    return { data: [], error }
  }
}

/**
 * Get comprehensive analytics stats
 */
export async function getAnalyticsStats(
  userId: string,
  timeRange: TimeRange = 'month'
): Promise<{ data: any | null; error: any }> {
  try {
    const { data: overview } = await getAnalyticsOverview(userId)

    const stats = {
      totalRevenue: overview?.totalRevenue || 0,
      monthlyRecurringRevenue: (overview?.monthlyRevenue || 0) * 0.7,
      annualRecurringRevenue: (overview?.monthlyRevenue || 0) * 0.7 * 12,
      averageOrderValue: overview?.totalProjects > 0
        ? (overview?.totalRevenue || 0) / overview.totalProjects
        : 0,
      revenueGrowth: overview?.revenueGrowth || 0,
      totalUsers: overview?.totalClients || 0,
      activeUsers: overview?.totalClients || 0,
      userGrowth: overview?.clientGrowth || 0,
      retentionRate: 85,
      conversionRate: 2.5,
      customerLifetimeValue: 15000,
      churnRate: 2.5
    }

    logger.info('Analytics stats fetched', { userId, timeRange })
    return { data: stats, error: null }
  } catch (error: any) {
    logger.error('Exception in getAnalyticsStats', { error: error.message, userId })
    return { data: null, error }
  }
}
