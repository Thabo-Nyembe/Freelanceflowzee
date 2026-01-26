/**
 * Dashboard Statistics and Analytics
 *
 * Real-time dashboard data fetching from Supabase
 */

import { createClient } from './supabase/client'

/**
 * Raw project data from Supabase query with client join
 */
interface ProjectWithClient {
  id: string
  name: string
  status: string | null
  budget: number | null
  deadline: string | null
  progress: number | null
  priority: string | null
  category: string | null
  client_id: string | null
  clients: { id: string; name: string }[] | null
}

export interface DashboardStats {
  projects: {
    total: number
    active: number
    completed: number
    onHold: number
  }
  clients: {
    total: number
    active: number
    new: number
  }
  revenue: {
    total: number
    pending: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  tasks: {
    total: number
    completed: number
    inProgress: number
    overdue: number
  }
  files: {
    total: number
    size: number
  }
  team: {
    total: number
    active: number
  }
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = createClient()

  try {
    // Fetch all stats in parallel
    const [projects, clients, invoices, tasks, files, team] = await Promise.all([
      getProjectStats(userId, supabase),
      getClientStats(userId, supabase),
      getRevenueStats(userId, supabase),
      getTaskStats(userId, supabase),
      getFileStats(userId, supabase),
      getTeamStats(userId, supabase),
    ])

    const stats: DashboardStats = {
      projects,
      clients,
      revenue: invoices,
      tasks,
      files,
      team,
    }

    return stats
  } catch {
    // Silently return defaults when database is unavailable
    return {
      projects: { total: 0, active: 0, completed: 0, onHold: 0 },
      clients: { total: 0, active: 0, new: 0 },
      revenue: { total: 0, pending: 0, thisMonth: 0, lastMonth: 0, growth: 0 },
      tasks: { total: 0, completed: 0, inProgress: 0, overdue: 0 },
      files: { total: 0, size: 0 },
      team: { total: 0, active: 0 },
    }
  }
}

async function getProjectStats(userId: string, supabase: ReturnType<typeof createClient>) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, status')
      .eq('user_id', userId)

    if (error) {
      return { total: 0, active: 0, completed: 0, onHold: 0 }
    }

    const total = data?.length || 0
    const active = data?.filter((p) => p.status === 'active').length || 0
    const completed = data?.filter((p) => p.status === 'completed').length || 0
    const onHold = data?.filter((p) => p.status === 'on_hold').length || 0

    return { total, active, completed, onHold }
  } catch {
    return { total: 0, active: 0, completed: 0, onHold: 0 }
  }
}

async function getClientStats(userId: string, supabase: ReturnType<typeof createClient>) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id, status, created_at')
      .eq('user_id', userId)

    if (error) {
      return { total: 0, active: 0, new: 0 }
    }

    const total = data?.length || 0
    const active = data?.filter((c) => c.status === 'active').length || 0

    // New clients in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const newCount = data?.filter((c) => new Date(c.created_at) > thirtyDaysAgo).length || 0

    return { total, active, new: newCount }
  } catch {
    return { total: 0, active: 0, new: 0 }
  }
}

async function getRevenueStats(userId: string, supabase: ReturnType<typeof createClient>) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('total, status, created_at')
      .eq('user_id', userId)

    if (error) {
      return { total: 0, pending: 0, thisMonth: 0, lastMonth: 0, growth: 0 }
    }

    const total = data?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0
    const pending = data?.filter((inv) => inv.status === 'pending').reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

    // This month's revenue
    const now = new Date()
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const thisMonth = data?.filter((inv) =>
      new Date(inv.created_at) >= firstDayThisMonth && inv.status === 'paid'
    ).reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

    const lastMonth = data?.filter((inv) =>
      new Date(inv.created_at) >= firstDayLastMonth &&
      new Date(inv.created_at) < firstDayThisMonth &&
      inv.status === 'paid'
    ).reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

    return { total, pending, thisMonth, lastMonth, growth }
  } catch {
    return { total: 0, pending: 0, thisMonth: 0, lastMonth: 0, growth: 0 }
  }
}

async function getTaskStats(userId: string, supabase: ReturnType<typeof createClient>) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, status, due_date')
      .eq('user_id', userId)

    if (error) {
      return { total: 0, completed: 0, inProgress: 0, overdue: 0 }
    }

    const total = data?.length || 0
    const completed = data?.filter((t) => t.status === 'completed').length || 0
    const inProgress = data?.filter((t) => t.status === 'in_progress').length || 0

    // Overdue tasks
    const now = new Date()
    const overdue = data?.filter((t) =>
      t.due_date && new Date(t.due_date) < now && t.status !== 'completed'
    ).length || 0

    return { total, completed, inProgress, overdue }
  } catch {
    return { total: 0, completed: 0, inProgress: 0, overdue: 0 }
  }
}

async function getFileStats(userId: string, supabase: ReturnType<typeof createClient>) {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('id, size')
      .eq('user_id', userId)

    if (error) {
      return { total: 0, size: 0 }
    }

    const total = data?.length || 0
    const size = data?.reduce((sum, file) => sum + (file.size || 0), 0) || 0

    return { total, size }
  } catch {
    return { total: 0, size: 0 }
  }
}

async function getTeamStats(userId: string, supabase: ReturnType<typeof createClient>) {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('id, status')
      .eq('team_owner_id', userId)

    if (error) {
      return { total: 0, active: 0 }
    }

    const total = data?.length || 0
    const active = data?.filter((m) => m.status === 'active').length || 0

    return { total, active }
  } catch {
    return { total: 0, active: 0 }
  }
}

/**
 * Get recent projects with full details for dashboard display
 */
export async function getRecentProjects(userId: string, limit: number = 3) {
  const supabase = createClient()

  try {
    // Fetch projects, automation status, and collaboration count in parallel
    const [projectsResult, automationResult, collaborationResult] = await Promise.all([
      supabase
        .from('projects')
        .select(`
          id,
          name,
          status,
          budget,
          deadline,
          progress,
          priority,
          category,
          client_id,
          clients (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit),
      // Check if user has any active workflows/automations
      getActiveAutomationStatus(userId, supabase),
      // Get collaboration count (active team members)
      getCollaborationCount(userId, supabase),
    ])

    if (projectsResult.error) throw projectsResult.error

    const hasActiveAutomation = automationResult
    const collaborationCount = collaborationResult

    // Transform to match the expected format
    const projects = (projectsResult.data || []).map((project: ProjectWithClient) => ({
      id: project.id,
      name: project.name,
      client: project.clients?.[0]?.name || 'No Client',
      progress: project.progress || 0,
      status: project.status || 'active',
      value: project.budget || 0,
      priority: project.priority || 'medium',
      deadline: project.deadline || new Date().toISOString(),
      category: project.category || 'general',
      aiAutomation: hasActiveAutomation,
      collaboration: collaborationCount,
      estimatedCompletion: calculateEstimatedCompletion(project.progress || 0, project.deadline || '')
    }))

    return projects
  } catch {
    // Silently return empty array when database is unavailable
    return []
  }
}

/**
 * Check if user has any active AI automations/workflows
 */
async function getActiveAutomationStatus(
  userId: string,
  supabase: ReturnType<typeof createClient>
): Promise<boolean> {
  try {
    // Check workflows table for active automations
    const { data, error } = await supabase
      .from('workflows')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1)

    if (error) {
      // Fallback: try admin_workflows table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_workflows')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1)

      if (adminError) return false
      return (adminData?.length || 0) > 0
    }

    return (data?.length || 0) > 0
  } catch {
    return false
  }
}

/**
 * Get count of team collaborations for user
 */
async function getCollaborationCount(
  userId: string,
  supabase: ReturnType<typeof createClient>
): Promise<number> {
  try {
    // Check team_members table for active collaborators
    const { data, error } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_owner_id', userId)
      .eq('status', 'active')

    if (error) {
      // Fallback: try collaboration_teams table
      const { data: teamsData, error: teamsError } = await supabase
        .from('collaboration_teams')
        .select('member_count')
        .eq('user_id', userId)
        .eq('status', 'active')

      if (teamsError) return 0
      // Sum all member counts from active teams
      return teamsData?.reduce((sum, team) => sum + (team.member_count || 0), 0) || 0
    }

    return data?.length || 0
  } catch {
    return 0
  }
}

/**
 * Calculate estimated completion time based on progress and deadline
 */
function calculateEstimatedCompletion(progress: number, deadline: string): string {
  if (progress >= 100) return 'Completed'
  if (!deadline) return 'Unknown'

  const now = new Date()
  const deadlineDate = new Date(deadline)
  const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysRemaining < 0) return 'Overdue'
  if (daysRemaining === 0) return 'Today'
  if (daysRemaining === 1) return '1 day'
  if (daysRemaining < 7) return `${daysRemaining} days`
  if (daysRemaining < 30) return `${Math.ceil(daysRemaining / 7)} weeks`
  return `${Math.ceil(daysRemaining / 30)} months`
}

/**
 * Get recent activity for dashboard feed
 */
export async function getRecentActivity(userId: string, limit: number = 10) {
  const supabase = createClient()

  try {
    // Get recent projects, tasks, and files
    const [projects, tasks, files] = await Promise.all([
      supabase
        .from('projects')
        .select('id, name, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit),

      supabase
        .from('tasks')
        .select('id, title, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit),

      supabase
        .from('files')
        .select('id, name, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit),
    ])

    // Combine and sort by updated_at
    const activities = [
      ...(projects.data || []).map((p) => ({ ...p, type: 'project' })),
      ...(tasks.data || []).map((t) => ({ ...t, type: 'task' })),
      ...(files.data || []).map((f) => ({ ...f, type: 'file' })),
    ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, limit)

    return activities
  } catch {
    // Silently return empty array when database is unavailable
    return []
  }
}
