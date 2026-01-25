import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('business-intelligence')

// ============================================================================
// Business Intelligence API
// Provides comprehensive business metrics, profitability analysis,
// client value tracking, and revenue forecasting
// ============================================================================

// Demo user ID for unauthenticated access
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

export async function GET(request: Request) {
  try {
    // Use admin client (no cookie context needed)
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)

    const type = searchParams.get('type') || 'overview'
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const period = searchParams.get('period') || 'month' // day, week, month, quarter, year

    // Use provided userId or fallback to demo user for public access
    const targetUserId = userId || DEMO_USER_ID

    switch (type) {
      case 'overview':
        return await getBusinessOverview(supabase, targetUserId, period)
      case 'health':
        return await getBusinessHealth(supabase, targetUserId)
      case 'profitability':
        return await getProfitabilityAnalysis(supabase, targetUserId, startDate, endDate)
      case 'clients':
        return await getClientValueAnalysis(supabase, targetUserId)
      case 'forecast':
        return await getRevenueForecast(supabase, targetUserId)
      case 'kpis':
        return await getKPIDashboard(supabase, targetUserId)
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch business intelligence data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch business intelligence data' },
      { status: 500 }
    )
  }
}

// Get comprehensive business overview
async function getBusinessOverview(supabase: any, userId: string, period: string) {
  const now = new Date()
  let startDate: Date

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'quarter':
      startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
      break
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    default: // month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  // Fetch revenue data from invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('amount, status, created_at, paid_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  // Fetch expenses
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, category, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  // Fetch clients
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, created_at, status')
    .eq('user_id', userId)

  // Fetch projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, status, budget, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  // Fetch time entries for utilization
  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select('duration, billable, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  // Calculate metrics
  const totalRevenue = invoices?.filter((i: any) => i.status === 'paid')
    .reduce((sum: number, i: any) => sum + (i.amount || 0), 0) || 0

  const totalExpenses = expenses?.reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0
  const grossProfit = totalRevenue - totalExpenses
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  // Calculate recurring revenue (from retainer invoices)
  const recurringRevenue = invoices?.filter((i: any) => i.status === 'paid')
    .reduce((sum: number, i: any) => sum + (i.amount || 0) * 0.3, 0) || 0 // Estimate 30% as recurring

  // Client metrics
  const activeClients = clients?.filter((c: any) => c.status === 'active').length || 0
  const newClientsThisPeriod = clients?.filter((c: any) =>
    new Date(c.created_at) >= startDate
  ).length || 0

  // Utilization rate
  const totalHours = timeEntries?.reduce((sum: number, t: any) => sum + (t.duration || 0), 0) || 0
  const billableHours = timeEntries?.filter((t: any) => t.billable)
    .reduce((sum: number, t: any) => sum + (t.duration || 0), 0) || 0
  const utilizationRate = totalHours > 0 ? (billableHours / totalHours) * 100 : 0

  // Project metrics
  const completedProjects = projects?.filter((p: any) => p.status === 'completed').length || 0
  const activeProjects = projects?.filter((p: any) => p.status === 'active').length || 0

  // Calculate previous period for comparison
  const prevStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
  const { data: prevInvoices } = await supabase
    .from('invoices')
    .select('amount, status')
    .eq('user_id', userId)
    .gte('created_at', prevStartDate.toISOString())
    .lt('created_at', startDate.toISOString())

  const prevRevenue = prevInvoices?.filter((i: any) => i.status === 'paid')
    .reduce((sum: number, i: any) => sum + (i.amount || 0), 0) || 0

  const revenueGrowth = prevRevenue > 0
    ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
    : totalRevenue > 0 ? 100 : 0

  return NextResponse.json({
    revenue: {
      total: totalRevenue,
      recurring: recurringRevenue,
      projectBased: totalRevenue - recurringRevenue,
      growth: revenueGrowth
    },
    profitability: {
      grossProfit,
      grossMargin,
      netProfit: grossProfit * 0.85, // Estimate after taxes
      netMargin: grossMargin * 0.85
    },
    clients: {
      total: clients?.length || 0,
      active: activeClients,
      newThisPeriod: newClientsThisPeriod,
      averageValue: activeClients > 0 ? totalRevenue / activeClients : 0
    },
    projects: {
      total: projects?.length || 0,
      active: activeProjects,
      completed: completedProjects,
      averageBudget: projects?.length > 0
        ? projects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0) / projects.length
        : 0
    },
    efficiency: {
      utilizationRate,
      billableHours,
      totalHours,
      effectiveRate: billableHours > 0 ? totalRevenue / billableHours : 0
    },
    period,
    startDate: startDate.toISOString(),
    endDate: now.toISOString()
  })
}

// Get business health score
async function getBusinessHealth(supabase: any, userId: string) {
  const overview = await getBusinessOverview(supabase, userId, 'month')
  const data = await overview.json()

  const components = [
    {
      name: 'Revenue Health',
      score: Math.min(100, Math.max(0, 50 + data.revenue.growth)),
      weight: 0.25,
      description: 'Based on revenue growth and consistency'
    },
    {
      name: 'Profitability',
      score: Math.min(100, data.profitability.grossMargin * 2),
      weight: 0.25,
      description: 'Based on profit margins'
    },
    {
      name: 'Client Health',
      score: Math.min(100, (data.clients.active / Math.max(1, data.clients.total)) * 100),
      weight: 0.20,
      description: 'Based on client retention and growth'
    },
    {
      name: 'Operational Efficiency',
      score: Math.min(100, data.efficiency.utilizationRate * 1.3),
      weight: 0.15,
      description: 'Based on utilization and productivity'
    },
    {
      name: 'Project Performance',
      score: Math.min(100, (data.projects.completed / Math.max(1, data.projects.total)) * 100 + 30),
      weight: 0.15,
      description: 'Based on project completion rates'
    }
  ]

  const overallScore = Math.round(
    components.reduce((sum, c) => sum + c.score * c.weight, 0)
  )

  // Generate alerts based on metrics
  const alerts = []

  if (data.revenue.growth < 0) {
    alerts.push({
      severity: 'warning',
      title: 'Revenue Decline',
      message: `Revenue is down ${Math.abs(data.revenue.growth).toFixed(1)}% this period`
    })
  }

  if (data.profitability.grossMargin < 20) {
    alerts.push({
      severity: 'critical',
      title: 'Low Profit Margin',
      message: 'Profit margin is below healthy levels'
    })
  }

  if (data.efficiency.utilizationRate < 50) {
    alerts.push({
      severity: 'info',
      title: 'Low Utilization',
      message: 'Consider taking on more projects to improve utilization'
    })
  }

  // Generate recommendations
  const recommendations = []

  if (data.revenue.recurring < data.revenue.total * 0.3) {
    recommendations.push({
      id: 'increase-recurring',
      title: 'Increase Recurring Revenue',
      description: 'Consider converting project-based clients to retainers for predictable income',
      priority: 'high'
    })
  }

  if (data.clients.newThisPeriod < 2) {
    recommendations.push({
      id: 'client-acquisition',
      title: 'Focus on Client Acquisition',
      description: 'Invest in marketing or referral programs to grow client base',
      priority: 'medium'
    })
  }

  return NextResponse.json({
    overallScore,
    components,
    alerts,
    recommendations,
    status: overallScore >= 80 ? 'excellent' :
            overallScore >= 60 ? 'good' :
            overallScore >= 40 ? 'fair' : 'needs_attention'
  })
}

// Get profitability analysis
async function getProfitabilityAnalysis(supabase: any, userId: string, startDate?: string | null, endDate?: string | null) {
  const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1)
  const end = endDate ? new Date(endDate) : new Date()

  // Fetch projects with their invoices and time entries
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id, title, budget, status, client_id,
      clients (name),
      invoices (amount, status),
      time_entries (duration, billable)
    `)
    .eq('user_id', userId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())

  const projectProfitability = projects?.map((project: any) => {
    const revenue = project.invoices
      ?.filter((i: any) => i.status === 'paid')
      .reduce((sum: number, i: any) => sum + (i.amount || 0), 0) || 0

    const totalHours = project.time_entries
      ?.reduce((sum: number, t: any) => sum + (t.duration || 0), 0) || 0

    const billableHours = project.time_entries
      ?.filter((t: any) => t.billable)
      .reduce((sum: number, t: any) => sum + (t.duration || 0), 0) || 0

    // Estimate costs (labor cost per hour)
    const laborCostPerHour = 50 // Default hourly cost
    const laborCost = totalHours * laborCostPerHour
    const profit = revenue - laborCost
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0
    const effectiveRate = billableHours > 0 ? revenue / billableHours : 0

    return {
      projectId: project.id,
      projectName: project.title,
      clientName: project.clients?.name || 'Unknown',
      revenue,
      totalCosts: laborCost,
      profit,
      profitMargin,
      totalHours,
      billableHours,
      effectiveHourlyRate: effectiveRate,
      budget: project.budget || 0,
      budgetUtilization: project.budget > 0 ? (revenue / project.budget) * 100 : 0
    }
  }) || []

  // Aggregate by client
  const clientProfitability = projects?.reduce((acc: any, project: any) => {
    const clientId = project.client_id
    if (!acc[clientId]) {
      acc[clientId] = {
        clientId,
        clientName: project.clients?.name || 'Unknown',
        totalRevenue: 0,
        totalCosts: 0,
        totalProfit: 0,
        projectCount: 0,
        totalHours: 0
      }
    }

    const projectData = projectProfitability.find((p: any) => p.projectId === project.id)
    if (projectData) {
      acc[clientId].totalRevenue += projectData.revenue
      acc[clientId].totalCosts += projectData.totalCosts
      acc[clientId].totalProfit += projectData.profit
      acc[clientId].projectCount++
      acc[clientId].totalHours += projectData.totalHours
    }

    return acc
  }, {}) || {}

  const clientProfitabilityArray = Object.values(clientProfitability).map((client: any) => ({
    ...client,
    profitMargin: client.totalRevenue > 0 ? (client.totalProfit / client.totalRevenue) * 100 : 0,
    averageProjectValue: client.projectCount > 0 ? client.totalRevenue / client.projectCount : 0
  }))

  // Calculate trends
  const totalRevenue = projectProfitability.reduce((sum: number, p: any) => sum + p.revenue, 0)
  const totalProfit = projectProfitability.reduce((sum: number, p: any) => sum + p.profit, 0)
  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  return NextResponse.json({
    projectProfitability: projectProfitability.sort((a: any, b: any) => b.profit - a.profit),
    clientProfitability: clientProfitabilityArray.sort((a: any, b: any) => b.totalProfit - a.totalProfit),
    summary: {
      totalRevenue,
      totalProfit,
      overallMargin,
      projectCount: projectProfitability.length,
      clientCount: clientProfitabilityArray.length
    },
    period: {
      start: start.toISOString(),
      end: end.toISOString()
    }
  })
}

// Get client value analysis
async function getClientValueAnalysis(supabase: any, userId: string) {
  // Fetch clients with their history
  const { data: clients } = await supabase
    .from('clients')
    .select(`
      id, name, email, status, created_at,
      invoices (amount, status, created_at),
      projects (id, status, budget)
    `)
    .eq('user_id', userId)

  const clientMetrics = clients?.map((client: any) => {
    const paidInvoices = client.invoices?.filter((i: any) => i.status === 'paid') || []
    const totalRevenue = paidInvoices.reduce((sum: number, i: any) => sum + (i.amount || 0), 0)
    const projectCount = client.projects?.length || 0
    const completedProjects = client.projects?.filter((p: any) => p.status === 'completed').length || 0

    // Calculate tenure in months
    const createdAt = new Date(client.created_at)
    const tenureMonths = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000)))

    // Monthly revenue from this client
    const monthlyRevenue = totalRevenue / tenureMonths

    // Estimate LTV (assuming average 24 month lifespan)
    const avgLifespanMonths = 24
    const estimatedLTV = monthlyRevenue * avgLifespanMonths

    // Health score based on activity and revenue
    const lastInvoiceDate = paidInvoices.length > 0
      ? new Date(Math.max(...paidInvoices.map((i: any) => new Date(i.created_at).getTime())))
      : createdAt
    const daysSinceLastInvoice = Math.floor((Date.now() - lastInvoiceDate.getTime()) / (24 * 60 * 60 * 1000))

    let healthStatus: 'thriving' | 'healthy' | 'at_risk' | 'churning' | 'churned'
    if (client.status === 'inactive') {
      healthStatus = 'churned'
    } else if (daysSinceLastInvoice > 180) {
      healthStatus = 'churning'
    } else if (daysSinceLastInvoice > 90) {
      healthStatus = 'at_risk'
    } else if (monthlyRevenue > 500) {
      healthStatus = 'thriving'
    } else {
      healthStatus = 'healthy'
    }

    return {
      clientId: client.id,
      clientName: client.name,
      email: client.email,
      status: client.status,
      totalRevenue,
      monthlyRevenue,
      estimatedLTV,
      projectCount,
      completedProjects,
      tenureMonths,
      healthStatus,
      daysSinceLastActivity: daysSinceLastInvoice
    }
  }) || []

  // Calculate aggregates
  const totalClients = clientMetrics.length
  const activeClients = clientMetrics.filter((c: any) => c.status === 'active').length
  const atRiskClients = clientMetrics.filter((c: any) => c.healthStatus === 'at_risk' || c.healthStatus === 'churning').length
  const averageLTV = totalClients > 0
    ? clientMetrics.reduce((sum: number, c: any) => sum + c.estimatedLTV, 0) / totalClients
    : 0
  const averageMonthlyRevenue = totalClients > 0
    ? clientMetrics.reduce((sum: number, c: any) => sum + c.monthlyRevenue, 0) / totalClients
    : 0

  // Estimate CAC (Customer Acquisition Cost) - would need marketing data
  const estimatedCAC = 500 // Default estimate
  const ltvToCacRatio = averageLTV / estimatedCAC

  return NextResponse.json({
    clients: clientMetrics.sort((a: any, b: any) => b.estimatedLTV - a.estimatedLTV),
    summary: {
      totalClients,
      activeClients,
      atRiskClients,
      churnedClients: clientMetrics.filter((c: any) => c.healthStatus === 'churned').length,
      averageLTV,
      averageMonthlyRevenue,
      estimatedCAC,
      ltvToCacRatio,
      retentionRate: totalClients > 0 ? (activeClients / totalClients) * 100 : 0
    },
    insights: generateClientInsights(clientMetrics)
  })
}

// Generate client insights
function generateClientInsights(clients: any[]) {
  const insights = []

  // Top clients insight
  const topClients = clients.slice(0, 3)
  if (topClients.length > 0) {
    const topRevenue = topClients.reduce((sum: number, c: any) => sum + c.totalRevenue, 0)
    const totalRevenue = clients.reduce((sum: number, c: any) => sum + c.totalRevenue, 0)
    const percentage = totalRevenue > 0 ? (topRevenue / totalRevenue) * 100 : 0

    insights.push({
      type: 'concentration',
      title: 'Revenue Concentration',
      description: `Your top 3 clients account for ${percentage.toFixed(1)}% of total revenue`,
      impact: percentage > 70 ? 'negative' : 'neutral',
      recommendation: percentage > 70
        ? 'Consider diversifying your client base to reduce risk'
        : 'Good client distribution'
    })
  }

  // At-risk clients
  const atRiskClients = clients.filter((c: any) => c.healthStatus === 'at_risk')
  if (atRiskClients.length > 0) {
    insights.push({
      type: 'churn_risk',
      title: 'Clients at Risk',
      description: `${atRiskClients.length} clients haven't had activity in 90+ days`,
      impact: 'negative',
      recommendation: 'Schedule check-in calls with these clients'
    })
  }

  return insights
}

// Get revenue forecast
async function getRevenueForecast(supabase: any, userId: string) {
  // Fetch historical revenue data
  const { data: invoices } = await supabase
    .from('invoices')
    .select('amount, status, created_at')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .order('created_at', { ascending: true })

  // Group by month
  const monthlyRevenue: Record<string, number> = {}
  invoices?.forEach((invoice: any) => {
    const month = invoice.created_at.substring(0, 7) // YYYY-MM
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + invoice.amount
  })

  const months = Object.keys(monthlyRevenue).sort()
  const revenues = months.map(m => monthlyRevenue[m])

  // Calculate average and growth rate
  const avgRevenue = revenues.length > 0
    ? revenues.reduce((a, b) => a + b, 0) / revenues.length
    : 0

  let growthRate = 0
  if (revenues.length >= 2) {
    const recentMonths = revenues.slice(-6)
    const firstHalf = recentMonths.slice(0, 3).reduce((a, b) => a + b, 0) / 3
    const secondHalf = recentMonths.slice(-3).reduce((a, b) => a + b, 0) / 3
    growthRate = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0
  }

  // Generate forecasts for next 6 months
  const forecasts = []
  const currentMonth = new Date()

  for (let i = 1; i <= 6; i++) {
    const forecastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + i, 1)
    const monthStr = forecastMonth.toISOString().substring(0, 7)

    // Simple linear forecast with growth rate
    const baseRevenue = revenues.length > 0 ? revenues[revenues.length - 1] : avgRevenue
    const projected = baseRevenue * (1 + (growthRate / 100) * i)

    forecasts.push({
      month: monthStr,
      projected: Math.round(projected),
      optimistic: Math.round(projected * 1.2),
      pessimistic: Math.round(projected * 0.8),
      confidence: Math.max(50, 90 - (i * 5)) // Confidence decreases for further months
    })
  }

  // Fetch pipeline (pending invoices/proposals)
  const { data: pendingInvoices } = await supabase
    .from('invoices')
    .select('amount, status')
    .eq('user_id', userId)
    .in('status', ['pending', 'sent'])

  const pipelineRevenue = pendingInvoices?.reduce((sum: number, i: any) => sum + (i.amount || 0), 0) || 0

  return NextResponse.json({
    historical: {
      months,
      revenues,
      averageRevenue: avgRevenue,
      growthRate
    },
    forecasts,
    pipeline: {
      total: pipelineRevenue,
      pendingInvoices: pendingInvoices?.length || 0,
      weightedPipeline: pipelineRevenue * 0.7 // 70% probability estimate
    },
    scenarios: [
      {
        type: 'pessimistic',
        projectedRevenue: Math.round(avgRevenue * 6 * 0.8),
        growthRate: growthRate - 5,
        confidence: 0.85,
        description: 'Conservative estimate assuming reduced demand'
      },
      {
        type: 'realistic',
        projectedRevenue: Math.round(avgRevenue * 6),
        growthRate,
        confidence: 0.7,
        description: 'Based on current trends'
      },
      {
        type: 'optimistic',
        projectedRevenue: Math.round(avgRevenue * 6 * 1.3),
        growthRate: growthRate + 10,
        confidence: 0.5,
        description: 'Assumes strong market conditions and new clients'
      }
    ]
  })
}

// Get KPI Dashboard
async function getKPIDashboard(supabase: any, userId: string) {
  // Fetch KPI goals for user
  const { data: goals } = await supabase
    .from('kpi_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // If no goals exist, return empty dashboard with templates
  if (!goals || goals.length === 0) {
    return NextResponse.json({
      goals: [],
      dashboard: {
        totalGoals: 0,
        activeGoals: 0,
        achievedGoals: 0,
        atRiskGoals: 0,
        overallProgress: 0
      },
      templates: getKPITemplates(),
      message: 'No KPI goals set. Use templates to get started.'
    })
  }

  // Calculate dashboard metrics
  const activeGoals = goals.filter((g: any) => !['achieved', 'exceeded', 'abandoned'].includes(g.status))
  const achievedGoals = goals.filter((g: any) => ['achieved', 'exceeded'].includes(g.status))
  const atRiskGoals = goals.filter((g: any) => g.status === 'at_risk')

  const overallProgress = goals.reduce((sum: number, g: any) => {
    return sum + Math.min(100, (g.current_value / g.target_value) * 100)
  }, 0) / goals.length

  return NextResponse.json({
    goals,
    dashboard: {
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      achievedGoals: achievedGoals.length,
      atRiskGoals: atRiskGoals.length,
      overallProgress: Math.round(overallProgress)
    },
    templates: getKPITemplates()
  })
}

// KPI Templates
function getKPITemplates() {
  return [
    {
      id: 'monthly-revenue',
      name: 'Monthly Revenue Target',
      category: 'revenue',
      userType: ['freelancer', 'entrepreneur', 'agency', 'enterprise'],
      defaultTarget: 10000,
      unit: '$',
      frequency: 'monthly'
    },
    {
      id: 'client-retention',
      name: 'Client Retention Rate',
      category: 'retention',
      userType: ['freelancer', 'entrepreneur', 'agency', 'enterprise'],
      defaultTarget: 90,
      unit: '%',
      frequency: 'quarterly'
    },
    {
      id: 'profit-margin',
      name: 'Net Profit Margin',
      category: 'profitability',
      userType: ['freelancer', 'entrepreneur', 'agency', 'enterprise'],
      defaultTarget: 30,
      unit: '%',
      frequency: 'monthly'
    },
    {
      id: 'utilization-rate',
      name: 'Billable Utilization Rate',
      category: 'efficiency',
      userType: ['freelancer', 'entrepreneur', 'agency'],
      defaultTarget: 75,
      unit: '%',
      frequency: 'monthly'
    },
    {
      id: 'new-clients',
      name: 'New Client Acquisition',
      category: 'clients',
      userType: ['freelancer', 'entrepreneur', 'agency', 'enterprise'],
      defaultTarget: 3,
      unit: 'clients',
      frequency: 'monthly'
    }
  ]
}

// POST: Create or update KPI goals
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    // Use provided userId or demo user for unauthenticated access
    const userId = body.userId || DEMO_USER_ID

    const { action, ...data } = body

    switch (action) {
      case 'create_goal':
        const { data: newGoal, error: createError } = await supabase
          .from('kpi_goals')
          .insert({
            ...data,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) throw createError
        return NextResponse.json(newGoal)

      case 'update_goal':
        const { goalId, updates } = data
        const { data: updatedGoal, error: updateError } = await supabase
          .from('kpi_goals')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', goalId)
          .eq('user_id', userId)
          .select()
          .single()

        if (updateError) throw updateError
        return NextResponse.json(updatedGoal)

      case 'record_progress':
        const { goalId: progressGoalId, value, notes } = data

        // Get current goal
        const { data: currentGoal } = await supabase
          .from('kpi_goals')
          .select('*')
          .eq('id', progressGoalId)
          .eq('user_id', userId)
          .single()

        if (!currentGoal) {
          return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
        }

        // Update progress
        const progress = ((currentGoal.history || []) as any[])
        progress.push({
          date: new Date().toISOString().split('T')[0],
          value,
          percentComplete: (value / currentGoal.target_value) * 100,
          notes
        })

        // Determine new status
        let newStatus = currentGoal.status
        const percentComplete = (value / currentGoal.target_value) * 100
        if (percentComplete >= 100) {
          newStatus = value > currentGoal.target_value ? 'exceeded' : 'achieved'
        }

        const { data: progressedGoal, error: progressError } = await supabase
          .from('kpi_goals')
          .update({
            current_value: value,
            status: newStatus,
            history: progress,
            updated_at: new Date().toISOString()
          })
          .eq('id', progressGoalId)
          .eq('user_id', userId)
          .select()
          .single()

        if (progressError) throw progressError
        return NextResponse.json(progressedGoal)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process POST request', { error })
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
