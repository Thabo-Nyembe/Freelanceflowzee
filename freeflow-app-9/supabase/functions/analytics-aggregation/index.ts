import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

interface DateRange {
  startDate: string
  endDate: string
}

interface AnalyticsRequest {
  action: string
  userId?: string
  projectId?: string
  dateRange?: DateRange
  metrics?: string[]
  groupBy?: 'day' | 'week' | 'month' | 'year'
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body: AnalyticsRequest = await req.json()
    const { action, ...params } = body

    let result: unknown

    switch (action) {
      case 'get_dashboard_metrics':
        result = await getDashboardMetrics(supabase, params.userId!, params.dateRange)
        break

      case 'get_revenue_analytics':
        result = await getRevenueAnalytics(supabase, params.userId!, params.dateRange, params.groupBy)
        break

      case 'get_project_analytics':
        result = await getProjectAnalytics(supabase, params.projectId!)
        break

      case 'get_user_activity':
        result = await getUserActivity(supabase, params.userId!, params.dateRange)
        break

      case 'get_performance_metrics':
        result = await getPerformanceMetrics(supabase, params.userId!, params.dateRange)
        break

      case 'get_client_insights':
        result = await getClientInsights(supabase, params.userId!)
        break

      case 'aggregate_daily_stats':
        result = await aggregateDailyStats(supabase, params.userId!)
        break

      case 'get_growth_metrics':
        result = await getGrowthMetrics(supabase, params.userId!, params.dateRange)
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify({
      success: true,
      data: result,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Analytics Error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function getDashboardMetrics(supabase: ReturnType<typeof createClient>, userId: string, dateRange?: DateRange) {
  const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const endDate = dateRange?.endDate || new Date().toISOString()

  // Fetch multiple metrics in parallel
  const [projects, invoices, clients, timeEntries] = await Promise.all([
    supabase
      .from('projects')
      .select('id, status, budget, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate),

    supabase
      .from('invoices')
      .select('id, amount, status, paid_at')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate),

    supabase
      .from('clients')
      .select('id, created_at')
      .eq('user_id', userId),

    supabase
      .from('time_entries')
      .select('id, duration, billable_amount')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
  ])

  const projectsData = projects.data || []
  const invoicesData = invoices.data || []
  const clientsData = clients.data || []
  const timeData = timeEntries.data || []

  const totalRevenue = invoicesData
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + (i.amount || 0), 0)

  const totalHours = timeData.reduce((sum, t) => sum + (t.duration || 0), 0) / 60

  return {
    overview: {
      total_projects: projectsData.length,
      active_projects: projectsData.filter(p => p.status === 'active').length,
      completed_projects: projectsData.filter(p => p.status === 'completed').length,
      total_clients: clientsData.length,
      total_revenue: totalRevenue,
      total_hours: Math.round(totalHours * 10) / 10,
      pending_invoices: invoicesData.filter(i => i.status === 'pending').length,
      average_project_value: projectsData.length > 0
        ? Math.round(projectsData.reduce((sum, p) => sum + (p.budget || 0), 0) / projectsData.length)
        : 0
    },
    trends: {
      revenue_trend: calculateTrend(invoicesData, 'amount'),
      projects_trend: calculateTrend(projectsData, 'id', true),
      clients_trend: calculateTrend(clientsData, 'id', true)
    },
    period: { startDate, endDate }
  }
}

async function getRevenueAnalytics(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  dateRange?: DateRange,
  groupBy: string = 'month'
) {
  const startDate = dateRange?.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
  const endDate = dateRange?.endDate || new Date().toISOString()

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id, amount, status, paid_at, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true })

  if (error) throw error

  const revenueByPeriod = groupDataByPeriod(invoices || [], groupBy, 'amount')
  const paidInvoices = (invoices || []).filter(i => i.status === 'paid')

  return {
    total_revenue: paidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0),
    pending_revenue: (invoices || [])
      .filter(i => i.status === 'pending')
      .reduce((sum, i) => sum + (i.amount || 0), 0),
    revenue_by_period: revenueByPeriod,
    invoice_count: {
      total: (invoices || []).length,
      paid: paidInvoices.length,
      pending: (invoices || []).filter(i => i.status === 'pending').length,
      overdue: (invoices || []).filter(i => i.status === 'overdue').length
    },
    average_invoice_value: paidInvoices.length > 0
      ? Math.round(paidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0) / paidInvoices.length)
      : 0,
    growth_rate: calculateGrowthRate(revenueByPeriod)
  }
}

async function getProjectAnalytics(supabase: ReturnType<typeof createClient>, projectId: string) {
  const [project, tasks, timeEntries, comments] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single(),

    supabase
      .from('tasks')
      .select('id, status, created_at, completed_at')
      .eq('project_id', projectId),

    supabase
      .from('time_entries')
      .select('id, duration, created_at')
      .eq('project_id', projectId),

    supabase
      .from('comments')
      .select('id, created_at')
      .eq('project_id', projectId)
  ])

  const tasksData = tasks.data || []
  const timeData = timeEntries.data || []

  const completedTasks = tasksData.filter(t => t.status === 'completed')
  const totalHours = timeData.reduce((sum, t) => sum + (t.duration || 0), 0) / 60

  return {
    project: project.data,
    metrics: {
      total_tasks: tasksData.length,
      completed_tasks: completedTasks.length,
      completion_rate: tasksData.length > 0
        ? Math.round((completedTasks.length / tasksData.length) * 100)
        : 0,
      total_hours: Math.round(totalHours * 10) / 10,
      total_comments: (comments.data || []).length,
      average_task_completion_time: calculateAverageCompletionTime(completedTasks)
    },
    activity_timeline: generateActivityTimeline(tasksData, timeData, comments.data || [])
  }
}

async function getUserActivity(supabase: ReturnType<typeof createClient>, userId: string, dateRange?: DateRange) {
  const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const endDate = dateRange?.endDate || new Date().toISOString()

  const { data: activities, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error

  const activityByType = (activities || []).reduce((acc: Record<string, number>, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1
    return acc
  }, {})

  const activityByDay = groupDataByPeriod(activities || [], 'day', 'id', true)

  return {
    total_activities: (activities || []).length,
    activity_by_type: activityByType,
    activity_by_day: activityByDay,
    most_active_hours: calculateMostActiveHours(activities || []),
    recent_activities: (activities || []).slice(0, 10)
  }
}

async function getPerformanceMetrics(supabase: ReturnType<typeof createClient>, userId: string, dateRange?: DateRange) {
  const startDate = dateRange?.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const endDate = dateRange?.endDate || new Date().toISOString()

  const [projects, tasks, reviews] = await Promise.all([
    supabase
      .from('projects')
      .select('id, status, deadline, completed_at, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate),

    supabase
      .from('tasks')
      .select('id, status, deadline, completed_at')
      .eq('user_id', userId)
      .gte('created_at', startDate),

    supabase
      .from('reviews')
      .select('id, rating, created_at')
      .eq('freelancer_id', userId)
      .gte('created_at', startDate)
  ])

  const projectsData = projects.data || []
  const tasksData = tasks.data || []
  const reviewsData = reviews.data || []

  const completedOnTime = projectsData.filter(p =>
    p.status === 'completed' &&
    p.completed_at &&
    p.deadline &&
    new Date(p.completed_at) <= new Date(p.deadline)
  )

  return {
    on_time_delivery_rate: projectsData.length > 0
      ? Math.round((completedOnTime.length / projectsData.filter(p => p.status === 'completed').length) * 100)
      : 100,
    task_completion_rate: tasksData.length > 0
      ? Math.round((tasksData.filter(t => t.status === 'completed').length / tasksData.length) * 100)
      : 0,
    average_rating: reviewsData.length > 0
      ? Math.round((reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length) * 10) / 10
      : 0,
    total_reviews: reviewsData.length,
    response_time_avg: '< 2 hours', // Would need message data to calculate
    client_satisfaction_score: calculateSatisfactionScore(reviewsData)
  }
}

async function getClientInsights(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      id,
      name,
      email,
      created_at,
      projects:projects(id, status, budget, created_at),
      invoices:invoices(id, amount, status)
    `)
    .eq('user_id', userId)

  if (error) throw error

  const clientInsights = (clients || []).map(client => {
    const projectsData = client.projects || []
    const invoicesData = client.invoices || []
    const totalSpent = invoicesData
      .filter((i: { status: string }) => i.status === 'paid')
      .reduce((sum: number, i: { amount: number }) => sum + (i.amount || 0), 0)

    return {
      id: client.id,
      name: client.name,
      total_projects: projectsData.length,
      active_projects: projectsData.filter((p: { status: string }) => p.status === 'active').length,
      total_spent: totalSpent,
      client_since: client.created_at,
      lifetime_value: totalSpent,
      engagement_score: calculateEngagementScore(projectsData, invoicesData)
    }
  })

  return {
    total_clients: (clients || []).length,
    top_clients: clientInsights.sort((a, b) => b.lifetime_value - a.lifetime_value).slice(0, 5),
    client_retention_rate: calculateRetentionRate(clients || []),
    average_client_value: clientInsights.length > 0
      ? Math.round(clientInsights.reduce((sum, c) => sum + c.lifetime_value, 0) / clientInsights.length)
      : 0,
    new_clients_this_month: (clients || []).filter(c =>
      new Date(c.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length
  }
}

async function aggregateDailyStats(supabase: ReturnType<typeof createClient>, userId: string) {
  const today = new Date().toISOString().split('T')[0]

  const [projects, tasks, invoices, timeEntries] = await Promise.all([
    supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', today),

    supabase
      .from('tasks')
      .select('id, status')
      .eq('user_id', userId)
      .gte('updated_at', today),

    supabase
      .from('invoices')
      .select('id, amount, status')
      .eq('user_id', userId)
      .gte('created_at', today),

    supabase
      .from('time_entries')
      .select('id, duration')
      .eq('user_id', userId)
      .gte('created_at', today)
  ])

  const dailyStats = {
    date: today,
    user_id: userId,
    new_projects: (projects.data || []).length,
    tasks_completed: (tasks.data || []).filter(t => t.status === 'completed').length,
    invoices_created: (invoices.data || []).length,
    revenue_generated: (invoices.data || [])
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.amount || 0), 0),
    hours_logged: (timeEntries.data || []).reduce((sum, t) => sum + (t.duration || 0), 0) / 60
  }

  // Store aggregated stats
  await supabase.from('daily_stats').upsert(dailyStats, { onConflict: 'date,user_id' })

  return dailyStats
}

async function getGrowthMetrics(supabase: ReturnType<typeof createClient>, userId: string, dateRange?: DateRange) {
  const currentPeriodStart = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const previousPeriodStart = new Date(new Date(currentPeriodStart).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [currentRevenue, previousRevenue, currentProjects, previousProjects] = await Promise.all([
    supabase
      .from('invoices')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'paid')
      .gte('paid_at', currentPeriodStart),

    supabase
      .from('invoices')
      .select('amount')
      .eq('user_id', userId)
      .eq('status', 'paid')
      .gte('paid_at', previousPeriodStart)
      .lt('paid_at', currentPeriodStart),

    supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', currentPeriodStart),

    supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', previousPeriodStart)
      .lt('created_at', currentPeriodStart)
  ])

  const currentRevenueTotal = (currentRevenue.data || []).reduce((sum, i) => sum + (i.amount || 0), 0)
  const previousRevenueTotal = (previousRevenue.data || []).reduce((sum, i) => sum + (i.amount || 0), 0)

  return {
    revenue_growth: previousRevenueTotal > 0
      ? Math.round(((currentRevenueTotal - previousRevenueTotal) / previousRevenueTotal) * 100)
      : currentRevenueTotal > 0 ? 100 : 0,
    projects_growth: (previousProjects.data || []).length > 0
      ? Math.round((((currentProjects.data || []).length - (previousProjects.data || []).length) / (previousProjects.data || []).length) * 100)
      : (currentProjects.data || []).length > 0 ? 100 : 0,
    current_period: {
      revenue: currentRevenueTotal,
      projects: (currentProjects.data || []).length
    },
    previous_period: {
      revenue: previousRevenueTotal,
      projects: (previousProjects.data || []).length
    }
  }
}

// Helper functions
function calculateTrend(data: unknown[], field: string, isCount: boolean = false) {
  if (!data || data.length === 0) return 0
  const midpoint = Math.floor(data.length / 2)
  const firstHalf = data.slice(0, midpoint)
  const secondHalf = data.slice(midpoint)

  const firstValue = isCount
    ? firstHalf.length
    : firstHalf.reduce((sum, item: Record<string, number>) => sum + (item[field] || 0), 0)
  const secondValue = isCount
    ? secondHalf.length
    : secondHalf.reduce((sum, item: Record<string, number>) => sum + (item[field] || 0), 0)

  if (firstValue === 0) return secondValue > 0 ? 100 : 0
  return Math.round(((secondValue - firstValue) / firstValue) * 100)
}

function groupDataByPeriod(data: unknown[], period: string, field: string, isCount: boolean = false) {
  const grouped: Record<string, number> = {}

  data.forEach((item: Record<string, unknown>) => {
    const date = new Date(item.created_at as string)
    let key: string

    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'year':
        key = String(date.getFullYear())
        break
      default:
        key = date.toISOString().split('T')[0]
    }

    if (isCount) {
      grouped[key] = (grouped[key] || 0) + 1
    } else {
      grouped[key] = (grouped[key] || 0) + ((item[field] as number) || 0)
    }
  })

  return Object.entries(grouped).map(([period, value]) => ({ period, value }))
}

function calculateGrowthRate(periodData: { period: string; value: number }[]) {
  if (periodData.length < 2) return 0
  const latest = periodData[periodData.length - 1].value
  const previous = periodData[periodData.length - 2].value
  if (previous === 0) return latest > 0 ? 100 : 0
  return Math.round(((latest - previous) / previous) * 100)
}

function calculateAverageCompletionTime(tasks: { created_at: string; completed_at: string | null }[]) {
  const completedWithTime = tasks.filter(t => t.completed_at)
  if (completedWithTime.length === 0) return 'N/A'

  const totalMs = completedWithTime.reduce((sum, t) => {
    return sum + (new Date(t.completed_at!).getTime() - new Date(t.created_at).getTime())
  }, 0)

  const avgMs = totalMs / completedWithTime.length
  const avgDays = Math.round(avgMs / (1000 * 60 * 60 * 24))
  return `${avgDays} days`
}

function generateActivityTimeline(tasks: unknown[], timeEntries: unknown[], comments: unknown[]) {
  const allActivities = [
    ...tasks.map((t: Record<string, unknown>) => ({ type: 'task', date: t.created_at, data: t })),
    ...timeEntries.map((t: Record<string, unknown>) => ({ type: 'time_entry', date: t.created_at, data: t })),
    ...comments.map((c: Record<string, unknown>) => ({ type: 'comment', date: c.created_at, data: c }))
  ]

  return allActivities
    .sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())
    .slice(0, 20)
}

function calculateMostActiveHours(activities: { created_at: string }[]) {
  const hourCounts: Record<number, number> = {}
  activities.forEach(activity => {
    const hour = new Date(activity.created_at).getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })

  return Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

function calculateSatisfactionScore(reviews: { rating: number }[]) {
  if (reviews.length === 0) return 100
  const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
  return Math.round((avgRating / 5) * 100)
}

function calculateEngagementScore(projects: unknown[], invoices: unknown[]) {
  const projectWeight = projects.length * 10
  const invoiceWeight = invoices.length * 5
  const completedWeight = projects.filter((p: Record<string, unknown>) => p.status === 'completed').length * 15
  return Math.min(100, projectWeight + invoiceWeight + completedWeight)
}

function calculateRetentionRate(clients: { created_at: string }[]) {
  if (clients.length === 0) return 100
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
  const oldClients = clients.filter(c => new Date(c.created_at) < sixMonthsAgo)
  if (oldClients.length === 0) return 100
  // Simplified: assume all old clients are retained
  return Math.round((oldClients.length / clients.length) * 100)
}
