/**
 * Projects Hub - Database Queries
 *
 * Real-time project management with Supabase
 * Full CRUD operations for Projects Hub feature
 */

import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from './logger'

const logger = createFeatureLogger('ProjectsHubQueries')

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  client: string
  client_id?: string
  status: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  progress: number
  budget: number
  spent: number
  value: number
  currency: string
  start_date: string
  deadline: string
  estimated_completion?: string
  tags: string[]
  is_starred: boolean
  is_pinned: boolean
  completed_tasks: number
  total_tasks: number
  hours_logged: number
  hours_estimated: number
  ai_automation: boolean
  collaboration: number
  created_at: string
  updated_at: string
}

export interface ProjectStats {
  total: number
  active: number
  completed: number
  onHold: number
  cancelled: number
  revenue: number
  totalBudget: number
  totalSpent: number
  efficiency: number
}

export interface ProjectFilters {
  status?: string[]
  priority?: string[]
  category?: string[]
  search?: string
  isStarred?: boolean
  isPinned?: boolean
}

export interface ProjectSortOptions {
  field: 'name' | 'deadline' | 'progress' | 'budget' | 'created_at' | 'updated_at'
  direction: 'asc' | 'desc'
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get all projects for a user with optional filtering and sorting
 */
export async function getProjects(
  userId: string,
  filters?: ProjectFilters,
  sort?: ProjectSortOptions,
  limit?: number,
  offset?: number
): Promise<{ data: Project[]; error: any; count: number }> {
  logger.info('Fetching projects', { userId, filters, sort, limit, offset })

  try {
    let query = supabase
      .from('dashboard_projects')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // Apply filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }
      if (filters.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority)
      }
      if (filters.category && filters.category.length > 0) {
        query = query.in('category', filters.category)
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,client.ilike.%${filters.search}%`)
      }
      if (filters.isStarred !== undefined) {
        query = query.eq('is_starred', filters.isStarred)
      }
      if (filters.isPinned !== undefined) {
        query = query.eq('is_pinned', filters.isPinned)
      }
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' })
    } else {
      // Default sort: pinned first, then by updated_at
      query = query.order('is_pinned', { ascending: false })
      query = query.order('updated_at', { ascending: false })
    }

    // Apply pagination
    if (limit) {
      query = query.limit(limit)
    }
    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      logger.error('Failed to fetch projects', { error, userId })
      return { data: [], error, count: 0 }
    }

    logger.info('Projects fetched successfully', { count: data?.length || 0, total: count })
    return { data: data || [], error: null, count: count || 0 }
  } catch (error) {
    logger.error('Exception fetching projects', { error, userId })
    return { data: [], error, count: 0 }
  }
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string): Promise<{ data: Project | null; error: any }> {
  logger.info('Fetching project', { projectId })

  try {
    const { data, error } = await supabase
      .from('dashboard_projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) {
      logger.error('Failed to fetch project', { error, projectId })
      return { data: null, error }
    }

    logger.info('Project fetched successfully', { projectId, name: data?.name })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception fetching project', { error, projectId })
    return { data: null, error }
  }
}

/**
 * Create a new project
 */
export async function createProject(
  userId: string,
  projectData: Partial<Project>
): Promise<{ data: Project | null; error: any }> {
  logger.info('Creating project', { userId, name: projectData.name })

  try {
    const { data, error } = await supabase
      .from('dashboard_projects')
      .insert([
        {
          user_id: userId,
          name: projectData.name,
          description: projectData.description || '',
          client: projectData.client || 'Unnamed Client',
          client_id: projectData.client_id,
          status: projectData.status || 'Not Started',
          priority: projectData.priority || 'medium',
          category: projectData.category || 'other',
          progress: projectData.progress || 0,
          budget: projectData.budget || 0,
          spent: projectData.spent || 0,
          value: projectData.value || projectData.budget || 0,
          currency: projectData.currency || 'USD',
          start_date: projectData.start_date || new Date().toISOString(),
          deadline: projectData.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          estimated_completion: projectData.estimated_completion,
          tags: projectData.tags || [],
          is_starred: projectData.is_starred || false,
          is_pinned: projectData.is_pinned || false,
          completed_tasks: projectData.completed_tasks || 0,
          total_tasks: projectData.total_tasks || 0,
          hours_logged: projectData.hours_logged || 0,
          hours_estimated: projectData.hours_estimated || 0,
          ai_automation: projectData.ai_automation || false,
          collaboration: projectData.collaboration || 0,
        },
      ])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create project', { error, userId, name: projectData.name })
      return { data: null, error }
    }

    logger.info('Project created successfully', { projectId: data?.id, name: data?.name })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception creating project', { error, userId, name: projectData.name })
    return { data: null, error }
  }
}

/**
 * Update an existing project
 */
export async function updateProject(
  projectId: string,
  updates: Partial<Project>
): Promise<{ data: Project | null; error: any }> {
  logger.info('Updating project', { projectId, updates: Object.keys(updates) })

  try {
    const { data, error } = await supabase
      .from('dashboard_projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update project', { error, projectId })
      return { data: null, error }
    }

    logger.info('Project updated successfully', { projectId, name: data?.name })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception updating project', { error, projectId })
    return { data: null, error }
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<{ success: boolean; error: any }> {
  logger.info('Deleting project', { projectId })

  try {
    const { error } = await supabase
      .from('dashboard_projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      logger.error('Failed to delete project', { error, projectId })
      return { success: false, error }
    }

    logger.info('Project deleted successfully', { projectId })
    return { success: true, error: null }
  } catch (error) {
    logger.error('Exception deleting project', { error, projectId })
    return { success: false, error }
  }
}

/**
 * Update project status
 */
export async function updateProjectStatus(
  projectId: string,
  status: Project['status']
): Promise<{ data: Project | null; error: any }> {
  logger.info('Updating project status', { projectId, status })

  return updateProject(projectId, { status })
}

/**
 * Toggle project star
 */
export async function toggleProjectStar(
  projectId: string,
  isStarred: boolean
): Promise<{ data: Project | null; error: any }> {
  logger.info('Toggling project star', { projectId, isStarred })

  return updateProject(projectId, { is_starred: isStarred })
}

/**
 * Toggle project pin
 */
export async function toggleProjectPin(
  projectId: string,
  isPinned: boolean
): Promise<{ data: Project | null; error: any }> {
  logger.info('Toggling project pin', { projectId, isPinned })

  return updateProject(projectId, { is_pinned: isPinned })
}

/**
 * Update project progress
 */
export async function updateProjectProgress(
  projectId: string,
  progress: number
): Promise<{ data: Project | null; error: any }> {
  logger.info('Updating project progress', { projectId, progress })

  // Auto-update status based on progress
  let status: Project['status'] = 'In Progress'
  if (progress === 0) status = 'Not Started'
  if (progress === 100) status = 'Completed'

  return updateProject(projectId, { progress, status })
}

/**
 * Get project statistics
 */
export async function getProjectStats(userId: string): Promise<ProjectStats> {
  logger.info('Fetching project stats', { userId })

  try {
    const { data, error } = await supabase
      .from('dashboard_projects')
      .select('status, budget, spent, value')
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to fetch project stats', { error, userId })
      throw error
    }

    const projects = data || []

    const stats: ProjectStats = {
      total: projects.length,
      active: projects.filter((p) => p.status === 'In Progress').length,
      completed: projects.filter((p) => p.status === 'Completed').length,
      onHold: projects.filter((p) => p.status === 'On Hold').length,
      cancelled: projects.filter((p) => p.status === 'Cancelled').length,
      revenue: projects.reduce((sum, p) => sum + (p.value || 0), 0),
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      totalSpent: projects.reduce((sum, p) => sum + (p.spent || 0), 0),
      efficiency: 0,
    }

    // Calculate efficiency (revenue / spent * 100)
    if (stats.totalSpent > 0) {
      stats.efficiency = Math.round((stats.revenue / stats.totalSpent) * 100)
    } else if (stats.revenue > 0) {
      stats.efficiency = 100
    }

    logger.info('Project stats calculated', { stats })
    return stats
  } catch (error) {
    logger.error('Exception calculating project stats', { error, userId })
    return {
      total: 0,
      active: 0,
      completed: 0,
      onHold: 0,
      cancelled: 0,
      revenue: 0,
      totalBudget: 0,
      totalSpent: 0,
      efficiency: 0,
    }
  }
}

/**
 * Search projects by name, description, or client
 */
export async function searchProjects(
  userId: string,
  searchTerm: string,
  limit: number = 10
): Promise<{ data: Project[]; error: any }> {
  logger.info('Searching projects', { userId, searchTerm, limit })

  return getProjects(
    userId,
    { search: searchTerm },
    { field: 'updated_at', direction: 'desc' },
    limit
  ).then(({ data, error }) => ({ data, error }))
}

/**
 * Get projects by status
 */
export async function getProjectsByStatus(
  userId: string,
  status: Project['status'][]
): Promise<{ data: Project[]; error: any }> {
  logger.info('Fetching projects by status', { userId, status })

  return getProjects(
    userId,
    { status },
    { field: 'updated_at', direction: 'desc' }
  ).then(({ data, error }) => ({ data, error }))
}

/**
 * Get recent projects (last updated)
 */
export async function getRecentProjects(
  userId: string,
  limit: number = 5
): Promise<{ data: Project[]; error: any }> {
  logger.info('Fetching recent projects', { userId, limit })

  return getProjects(
    userId,
    undefined,
    { field: 'updated_at', direction: 'desc' },
    limit
  ).then(({ data, error }) => ({ data, error }))
}
