import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OverviewClient from './overview-client'

export const dynamic = 'force-dynamic'

/**
 * Dashboard Overview V2 - Groundbreaking 2025 Design
 * Server-side rendered with real-time client updates
 */
export default async function DashboardOverviewV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let widgets: any[] = []
  let projects: any[] = []
  let activity: any[] = []
  let stats = {
    revenue: { value: "$124,567", change: 12.5 },
    clients: { value: "127", change: 8.3 },
    projects: { value: "34", change: 5.2 },
    satisfaction: { value: "98%", change: 2.1 }
  }

  if (user) {
    // Fetch dashboard widgets
    const [widgetsResult, projectsResult, invoicesResult, clientsResult] = await Promise.all([
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
        .select('total, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
    ])

    widgets = widgetsResult.data || []
    projects = projectsResult.data || []

    // Calculate real stats
    const invoices = invoicesResult.data || []
    const clients = clientsResult.data || []
    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0)

    stats = {
      revenue: { value: `$${totalRevenue.toLocaleString()}`, change: 12.5 },
      clients: { value: String(clients.length), change: 8.3 },
      projects: { value: String(projects.length), change: 5.2 },
      satisfaction: { value: "98%", change: 2.1 }
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
    />
  )
}
