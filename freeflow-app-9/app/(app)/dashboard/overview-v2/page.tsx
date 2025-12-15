import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OverviewClient from './overview-client'

export const dynamic = 'force-dynamic'

/**
 * Dashboard Overview V2 - Groundbreaking 2025 Design
 * Server-side rendered with real-time client updates
 * All data fetched from database - no mock data
 */
export default async function DashboardOverviewV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let widgets: any[] = []
  let projects: any[] = []
  let activity: any[] = []
  let teamPerformance: any[] = []
  let stats = {
    revenue: { value: "$0", change: 0 },
    clients: { value: "0", change: 0 },
    projects: { value: "0", change: 0 },
    satisfaction: { value: "0%", change: 0 }
  }

  if (user) {
    // Fetch all data in parallel for performance
    const [
      widgetsResult,
      projectsResult,
      invoicesResult,
      clientsResult,
      teamResult,
      dashboardStatsResult
    ] = await Promise.all([
      supabase
        .from('dashboard_widgets')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true }),
      supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .is('archived_at', null)
        .order('updated_at', { ascending: false })
        .limit(10),
      supabase
        .from('invoices')
        .select('total, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('clients')
        .select('id, satisfaction_score')
        .eq('user_id', user.id),
      supabase
        .from('team_performance')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', 'monthly')
        .order('rank', { ascending: true })
        .limit(10),
      supabase
        .from('dashboard_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', 'monthly')
    ])

    widgets = widgetsResult.data || []
    projects = projectsResult.data || []
    teamPerformance = teamResult.data || []

    // Calculate real stats from database
    const invoices = invoicesResult.data || []
    const clients = clientsResult.data || []
    const dashboardStats = dashboardStatsResult.data || []

    // Calculate revenue
    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0)

    // Calculate previous period revenue for change %
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const currentPeriodRevenue = invoices
      .filter(i => i.status === 'paid' && new Date(i.created_at) > thirtyDaysAgo)
      .reduce((sum, i) => sum + (i.total || 0), 0)

    const previousPeriodRevenue = invoices
      .filter(i => i.status === 'paid' && new Date(i.created_at) > sixtyDaysAgo && new Date(i.created_at) <= thirtyDaysAgo)
      .reduce((sum, i) => sum + (i.total || 0), 0)

    const revenueChange = previousPeriodRevenue > 0
      ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
      : 0

    // Calculate satisfaction from clients
    const clientsWithScores = clients.filter(c => c.satisfaction_score > 0)
    const avgSatisfaction = clientsWithScores.length > 0
      ? clientsWithScores.reduce((sum, c) => sum + c.satisfaction_score, 0) / clientsWithScores.length
      : 0

    // Use dashboard_stats if available, otherwise calculate
    const revenueStat = dashboardStats.find(s => s.stat_type === 'revenue')
    const clientsStat = dashboardStats.find(s => s.stat_type === 'clients')
    const projectsStat = dashboardStats.find(s => s.stat_type === 'projects')
    const satisfactionStat = dashboardStats.find(s => s.stat_type === 'satisfaction')

    stats = {
      revenue: {
        value: `$${(revenueStat?.stat_value || totalRevenue).toLocaleString()}`,
        change: revenueStat?.change_percent || Math.round(revenueChange * 10) / 10
      },
      clients: {
        value: String(clientsStat?.stat_value || clients.length),
        change: clientsStat?.change_percent || 0
      },
      projects: {
        value: String(projectsStat?.stat_value || projects.length),
        change: projectsStat?.change_percent || 0
      },
      satisfaction: {
        value: `${satisfactionStat?.stat_value || Math.round(avgSatisfaction)}%`,
        change: satisfactionStat?.change_percent || 0
      }
    }

    // Generate activity from recent projects
    activity = projects.slice(0, 4).map(p => ({
      icon: null,
      title: `Project: ${p.name}`,
      description: `Status: ${p.status}`,
      time: new Date(p.updated_at).toLocaleDateString(),
      status: p.status === 'completed' ? 'success' : 'info'
    }))
  }

  return (
    <OverviewClient
      initialWidgets={widgets}
      initialStats={stats}
      initialProjects={projects}
      initialActivity={activity}
      initialTeamPerformance={teamPerformance}
    />
  )
}
