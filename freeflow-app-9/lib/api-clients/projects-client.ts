/**
 * Projects API Client
 *
 * Typed client for project management features
 * Replaces setTimeout mock data with real API calls
 */

import { BaseApiClient, type ApiResponse, type PaginatedResponse, createPaginatedQuery } from './base-client'

export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  client_id: string | null
  status: 'active' | 'completed' | 'on-hold' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  budget: number | null
  spent: number | null
  progress: number
  start_date: string | null
  end_date: string | null
  deadline: string | null
  created_at: string
  updated_at: string
  metadata: Record<string, any> | null
}

export interface CreateProjectData {
  title: string
  description?: string
  client_id?: string
  status?: Project['status']
  priority?: Project['priority']
  budget?: number
  start_date?: string
  end_date?: string
  deadline?: string
  metadata?: Record<string, any>
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  progress?: number
  spent?: number
}

export interface ProjectFilters {
  status?: Project['status'][]
  priority?: Project['priority'][]
  client_id?: string
  search?: string
}

export class ProjectsClient extends BaseApiClient {
  /**
   * Get all projects (paginated)
   */
  async getProjects(
    page: number = 1,
    pageSize: number = 10,
    filters?: ProjectFilters
  ): Promise<ApiResponse<PaginatedResponse<Project>>> {
    const supabase = this.getSupabase()

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }

    if (filters?.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority)
    }

    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return {
        error: error.message,
        success: false
      }
    }

    return {
      data: {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        hasMore: (count || 0) > to + 1
      },
      success: true
    }
  }

  /**
   * Get single project by ID
   */
  async getProject(id: string): Promise<ApiResponse<Project>> {
    const supabase = this.getSupabase()

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return {
        error: error.message,
        success: false
      }
    }

    return {
      data,
      success: true
    }
  }

  /**
   * Create new project
   */
  async createProject(projectData: CreateProjectData): Promise<ApiResponse<Project>> {
    const supabase = this.getSupabase()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        error: 'User not authenticated',
        success: false
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        user_id: user.id,
        progress: 0
      })
      .select()
      .single()

    if (error) {
      return {
        error: error.message,
        success: false
      }
    }

    return {
      data,
      success: true
    }
  }

  /**
   * Update project
   */
  async updateProject(id: string, updates: UpdateProjectData): Promise<ApiResponse<Project>> {
    const supabase = this.getSupabase()

    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        error: error.message,
        success: false
      }
    }

    return {
      data,
      success: true
    }
  }

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<ApiResponse<void>> {
    const supabase = this.getSupabase()

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      return {
        error: error.message,
        success: false
      }
    }

    return {
      success: true
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(): Promise<ApiResponse<{
    total: number
    active: number
    completed: number
    onHold: number
    totalBudget: number
    totalSpent: number
  }>> {
    const supabase = this.getSupabase()

    const { data, error } = await supabase
      .from('projects')
      .select('status, budget, spent')

    if (error) {
      return {
        error: error.message,
        success: false
      }
    }

    const stats = {
      total: data.length,
      active: data.filter(p => p.status === 'active').length,
      completed: data.filter(p => p.status === 'completed').length,
      onHold: data.filter(p => p.status === 'on-hold').length,
      totalBudget: data.reduce((sum, p) => sum + (p.budget || 0), 0),
      totalSpent: data.reduce((sum, p) => sum + (p.spent || 0), 0)
    }

    return {
      data: stats,
      success: true
    }
  }
}

// Export singleton instance
export const projectsClient = new ProjectsClient()
