/**
 * Projects Hub - Database Queries
 *
 * Real-time project management with Supabase
 * Full CRUD operations for Projects Hub feature
 */

import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from './logger'

const supabase = createClient()
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

// ============================================================================
// PROJECT TEMPLATES
// ============================================================================

export interface ProjectTemplate {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  thumbnail?: string
  tags: string[]
  featured: boolean
  downloads: number
  likes: number
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  author: string
  price: string
  rating: number
  tasks: number
  includes: string[]
  is_public: boolean
  created_at: string
  updated_at: string
}

/**
 * Get all templates (public + user's private templates)
 */
export async function getTemplates(
  userId?: string
): Promise<{ data: ProjectTemplate[]; error: any }> {
  logger.info('Fetching templates', { userId })

  try {
    let query = supabase
      .from('project_templates')
      .select('*')

    if (userId) {
      // Get public templates OR user's private templates
      query = query.or(`is_public.eq.true,user_id.eq.${userId}`)
    } else {
      // Only public templates
      query = query.eq('is_public', true)
    }

    query = query.order('featured', { ascending: false })
    query = query.order('downloads', { ascending: false })

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch templates', { error })
      return { data: [], error }
    }

    return { data: data || [], error: null }
  } catch (error) {
    logger.error('Exception fetching templates', { error })
    return { data: [], error }
  }
}

/**
 * Create a new template
 */
export async function createTemplate(
  userId: string,
  templateData: Partial<ProjectTemplate>
): Promise<{ data: ProjectTemplate | null; error: any }> {
  logger.info('Creating template', { userId, title: templateData.title })

  try {
    const { data, error } = await supabase
      .from('project_templates')
      .insert([
        {
          user_id: userId,
          title: templateData.title,
          description: templateData.description || '',
          category: templateData.category || 'other',
          thumbnail: templateData.thumbnail,
          tags: templateData.tags || [],
          featured: false,
          downloads: 0,
          likes: 0,
          duration: templateData.duration || '2-3 weeks',
          difficulty: templateData.difficulty || 'Intermediate',
          author: templateData.author || 'KAZI User',
          price: templateData.price || 'Free',
          rating: 0,
          tasks: templateData.tasks || 0,
          includes: templateData.includes || [],
          is_public: templateData.is_public !== false,
        },
      ])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create template', { error, userId })
      return { data: null, error }
    }

    logger.info('Template created successfully', { templateId: data?.id })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception creating template', { error, userId })
    return { data: null, error }
  }
}

/**
 * Duplicate a template
 */
export async function duplicateTemplate(
  userId: string,
  templateId: string
): Promise<{ data: ProjectTemplate | null; error: any }> {
  logger.info('Duplicating template', { userId, templateId })

  try {
    // Get the original template
    const { data: original, error: fetchError } = await supabase
      .from('project_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (fetchError || !original) {
      return { data: null, error: fetchError || new Error('Template not found') }
    }

    // Create a duplicate
    const { data, error } = await supabase
      .from('project_templates')
      .insert([
        {
          user_id: userId,
          title: `${original.title} (Copy)`,
          description: original.description,
          category: original.category,
          thumbnail: original.thumbnail,
          tags: original.tags,
          featured: false,
          downloads: 0,
          likes: 0,
          duration: original.duration,
          difficulty: original.difficulty,
          author: 'KAZI User',
          price: 'Free',
          rating: 0,
          tasks: original.tasks,
          includes: original.includes,
          is_public: false,
        },
      ])
      .select()
      .single()

    if (error) {
      logger.error('Failed to duplicate template', { error, userId, templateId })
      return { data: null, error }
    }

    logger.info('Template duplicated successfully', { newTemplateId: data?.id })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception duplicating template', { error, userId, templateId })
    return { data: null, error }
  }
}

/**
 * Like/unlike a template
 */
export async function toggleTemplateLike(
  userId: string,
  templateId: string,
  liked: boolean
): Promise<{ success: boolean; error: any }> {
  logger.info('Toggling template like', { userId, templateId, liked })

  try {
    if (liked) {
      // Add like
      await supabase
        .from('template_likes')
        .insert([{ user_id: userId, template_id: templateId }])

      // Increment likes count
      await supabase.rpc('increment_template_likes', { template_id: templateId })
    } else {
      // Remove like
      await supabase
        .from('template_likes')
        .delete()
        .eq('user_id', userId)
        .eq('template_id', templateId)

      // Decrement likes count
      await supabase.rpc('decrement_template_likes', { template_id: templateId })
    }

    return { success: true, error: null }
  } catch (error) {
    logger.error('Exception toggling template like', { error, userId, templateId })
    return { success: false, error }
  }
}

/**
 * Increment template downloads
 */
export async function incrementTemplateDownloads(
  templateId: string
): Promise<{ success: boolean; error: any }> {
  logger.info('Incrementing template downloads', { templateId })

  try {
    const { error } = await supabase.rpc('increment_template_downloads', {
      template_id: templateId,
    })

    if (error) {
      logger.error('Failed to increment downloads', { error, templateId })
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (error) {
    logger.error('Exception incrementing downloads', { error, templateId })
    return { success: false, error }
  }
}

// ============================================================================
// PROJECT IMPORTS
// ============================================================================

export interface ProjectImport {
  id: string
  user_id: string
  name: string
  source: string
  source_id?: string
  status: 'pending' | 'processing' | 'success' | 'failed'
  files_count: number
  total_size: number
  size_formatted: string
  type: string
  error_message?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface ImportSource {
  id: string
  user_id: string
  source_type: string
  name: string
  connected: boolean
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

/**
 * Get import history for a user
 */
export async function getImportHistory(
  userId: string,
  limit: number = 20
): Promise<{ data: ProjectImport[]; error: any }> {
  logger.info('Fetching import history', { userId, limit })

  try {
    const { data, error } = await supabase
      .from('project_imports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Failed to fetch import history', { error, userId })
      return { data: [], error }
    }

    return { data: data || [], error: null }
  } catch (error) {
    logger.error('Exception fetching import history', { error, userId })
    return { data: [], error }
  }
}

/**
 * Create an import record
 */
export async function createImport(
  userId: string,
  importData: Partial<ProjectImport>
): Promise<{ data: ProjectImport | null; error: any }> {
  logger.info('Creating import record', { userId, name: importData.name })

  try {
    const { data, error } = await supabase
      .from('project_imports')
      .insert([
        {
          user_id: userId,
          name: importData.name,
          source: importData.source,
          source_id: importData.source_id,
          status: 'pending',
          files_count: importData.files_count || 0,
          total_size: importData.total_size || 0,
          size_formatted: importData.size_formatted || '0 B',
          type: importData.type || 'files',
          metadata: importData.metadata || {},
        },
      ])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create import', { error, userId })
      return { data: null, error }
    }

    logger.info('Import record created', { importId: data?.id })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception creating import', { error, userId })
    return { data: null, error }
  }
}

/**
 * Update import status
 */
export async function updateImportStatus(
  importId: string,
  status: ProjectImport['status'],
  errorMessage?: string
): Promise<{ data: ProjectImport | null; error: any }> {
  logger.info('Updating import status', { importId, status })

  try {
    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'success') {
      updates.completed_at = new Date().toISOString()
    }

    if (errorMessage) {
      updates.error_message = errorMessage
    }

    const { data, error } = await supabase
      .from('project_imports')
      .update(updates)
      .eq('id', importId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update import status', { error, importId })
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    logger.error('Exception updating import status', { error, importId })
    return { data: null, error }
  }
}

/**
 * Retry a failed import
 */
export async function retryImport(
  userId: string,
  importId: string
): Promise<{ data: ProjectImport | null; error: any }> {
  logger.info('Retrying import', { userId, importId })

  try {
    // Reset status to pending
    const { data, error } = await supabase
      .from('project_imports')
      .update({
        status: 'processing',
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', importId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to retry import', { error, importId })
      return { data: null, error }
    }

    logger.info('Import retry initiated', { importId })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception retrying import', { error, importId })
    return { data: null, error }
  }
}

/**
 * Delete an import record
 */
export async function deleteImport(
  userId: string,
  importId: string
): Promise<{ success: boolean; error: any }> {
  logger.info('Deleting import', { userId, importId })

  try {
    const { error } = await supabase
      .from('project_imports')
      .delete()
      .eq('id', importId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete import', { error, importId })
      return { success: false, error }
    }

    logger.info('Import deleted successfully', { importId })
    return { success: true, error: null }
  } catch (error) {
    logger.error('Exception deleting import', { error, importId })
    return { success: false, error }
  }
}

/**
 * Get connected import sources for a user
 */
export async function getImportSources(
  userId: string
): Promise<{ data: ImportSource[]; error: any }> {
  logger.info('Fetching import sources', { userId })

  try {
    const { data, error } = await supabase
      .from('import_sources')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch import sources', { error, userId })
      return { data: [], error }
    }

    return { data: data || [], error: null }
  } catch (error) {
    logger.error('Exception fetching import sources', { error, userId })
    return { data: [], error }
  }
}

/**
 * Connect an import source
 */
export async function connectImportSource(
  userId: string,
  sourceData: Partial<ImportSource>
): Promise<{ data: ImportSource | null; error: any }> {
  logger.info('Connecting import source', { userId, sourceType: sourceData.source_type })

  try {
    const { data, error } = await supabase
      .from('import_sources')
      .upsert(
        [
          {
            user_id: userId,
            source_type: sourceData.source_type,
            name: sourceData.name,
            connected: true,
            access_token: sourceData.access_token,
            refresh_token: sourceData.refresh_token,
            token_expires_at: sourceData.token_expires_at,
            metadata: sourceData.metadata || {},
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'user_id,source_type' }
      )
      .select()
      .single()

    if (error) {
      logger.error('Failed to connect import source', { error, userId })
      return { data: null, error }
    }

    logger.info('Import source connected', { sourceType: sourceData.source_type })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception connecting import source', { error, userId })
    return { data: null, error }
  }
}

/**
 * Disconnect an import source
 */
export async function disconnectImportSource(
  userId: string,
  sourceType: string
): Promise<{ success: boolean; error: any }> {
  logger.info('Disconnecting import source', { userId, sourceType })

  try {
    const { error } = await supabase
      .from('import_sources')
      .update({
        connected: false,
        access_token: null,
        refresh_token: null,
        token_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('source_type', sourceType)

    if (error) {
      logger.error('Failed to disconnect import source', { error, userId, sourceType })
      return { success: false, error }
    }

    logger.info('Import source disconnected', { sourceType })
    return { success: true, error: null }
  } catch (error) {
    logger.error('Exception disconnecting import source', { error, userId, sourceType })
    return { success: false, error }
  }
}
