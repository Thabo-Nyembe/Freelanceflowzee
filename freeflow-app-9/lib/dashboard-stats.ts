/**
 * Dashboard Statistics and Analytics
 *
 * Real-time dashboard data fetching from Supabase
 */

import { supabase } from './supabase'
import { createFeatureLogger } from './logger'

const logger = createFeatureLogger('DashboardStats')

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
  logger.info('Fetching dashboard stats', { userId })

  try {
    // Fetch all stats in parallel
    const [projects, clients, invoices, tasks, files, team] = await Promise.all([
      getProjectStats(userId),
      getClientStats(userId),
      getRevenueStats(userId),
      getTaskStats(userId),
      getFileStats(userId),
      getTeamStats(userId),
    ])

    const stats: DashboardStats = {
      projects,
      clients,
      revenue: invoices,
      tasks,
      files,
      team,
    }

    logger.info('Dashboard stats fetched successfully', {
      projectCount: stats.projects.total,
      clientCount: stats.clients.total,
      revenue: stats.revenue.total,
    })

    return stats
  } catch (error) {
    logger.error('Failed to fetch dashboard stats', { error, userId })
    throw error
  }
}

async function getProjectStats(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('id, status')
    .eq('user_id', userId)

  if (error) throw error

  const total = data?.length || 0
  const active = data?.filter((p) => p.status === 'active').length || 0
  const completed = data?.filter((p) => p.status === 'completed').length || 0
  const onHold = data?.filter((p) => p.status === 'on_hold').length || 0

  return { total, active, completed, onHold }
}

async function getClientStats(userId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('id, status, created_at')
    .eq('user_id', userId)

  if (error) throw error

  const total = data?.length || 0
  const active = data?.filter((c) => c.status === 'active').length || 0

  // New clients in last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const newCount = data?.filter((c) => new Date(c.created_at) > thirtyDaysAgo).length || 0

  return { total, active, new: newCount }
}

async function getRevenueStats(userId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('total, status, created_at')
    .eq('user_id', userId)

  if (error) throw error

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
}

async function getTaskStats(userId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, status, due_date')
    .eq('user_id', userId)

  if (error) throw error

  const total = data?.length || 0
  const completed = data?.filter((t) => t.status === 'completed').length || 0
  const inProgress = data?.filter((t) => t.status === 'in_progress').length || 0

  // Overdue tasks
  const now = new Date()
  const overdue = data?.filter((t) =>
    t.due_date && new Date(t.due_date) < now && t.status !== 'completed'
  ).length || 0

  return { total, completed, inProgress, overdue }
}

async function getFileStats(userId: string) {
  const { data, error } = await supabase
    .from('files')
    .select('id, size')
    .eq('user_id', userId)

  if (error) throw error

  const total = data?.length || 0
  const size = data?.reduce((sum, file) => sum + (file.size || 0), 0) || 0

  return { total, size }
}

async function getTeamStats(userId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select('id, status')
    .eq('team_owner_id', userId)

  if (error) throw error

  const total = data?.length || 0
  const active = data?.filter((m) => m.status === 'active').length || 0

  return { total, active }
}

/**
 * Get recent activity for dashboard feed
 */
export async function getRecentActivity(userId: string, limit: number = 10) {
  logger.info('Fetching recent activity', { userId, limit })

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

    logger.info('Recent activity fetched', { count: activities.length })
    return activities
  } catch (error) {
    logger.error('Failed to fetch recent activity', { error, userId })
    throw error
  }
}
