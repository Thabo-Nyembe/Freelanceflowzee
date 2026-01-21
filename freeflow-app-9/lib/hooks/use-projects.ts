'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface Project {
  id: string
  user_id: string
  project_code: string
  name: string
  description: string | null
  client_id: string | null
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  start_date: string | null
  end_date: string | null
  budget: number | null
  spent: number
  progress: number
  team_members: string[]
  tags: string[]
  cover_image: string | null
  color: string
  is_template: boolean
  template_id: string | null
  metadata: Record<string, any>
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface ProjectTask {
  id: string
  project_id: string
  user_id: string
  task_code: string | null
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee_id: string | null
  due_date: string | null
  estimated_hours: number | null
  actual_hours: number | null
  parent_task_id: string | null
  position: number
  tags: string[]
  attachments: string[]
  completed_at: string | null
  created_at: string
  updated_at: string
}

export function useProjects(initialProjects: Project[] = []) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(() => { })
  }, [])

  // Get auth.users compatible ID (same pattern as useSupabaseMutation)
  const getUserId = useCallback(async (): Promise<string | null> => {
    // First try Supabase auth - this is the most reliable method
    const { data: { user }, error } = await supabase.auth.getUser()
    if (user?.id) return user.id

    // If Supabase auth failed, try to refresh the session
    if (error) {
      const { data: { session: refreshedSession } } = await supabase.auth.getSession()
      if (refreshedSession?.user?.id) return refreshedSession.user.id
    }

    // Try authId from NextAuth session (set from profiles table)
    const authId = (session?.user as any)?.authId
    if (authId) return authId

    // Fallback to session user.id
    if (session?.user?.id) return session.user.id

    return null
  }, [supabase, session])

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Map DB fields to Project interface
      const mappedProjects = (data || []).map(p => ({
        ...p,
        name: p.title, // Map title -> name
        project_code: p.metadata?.project_code || '',
        team_members: p.metadata?.team_members || [],
        tags: p.metadata?.tags || [],
        color: p.metadata?.color || '#3b82f6',
        is_template: p.metadata?.is_template || false,
        cover_image: p.metadata?.cover_image || null,
        template_id: p.metadata?.template_id || null,
        archived_at: p.metadata?.archived_at || null
      }))

      setProjects(mappedProjects)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const createProject = async (project: Partial<Project>) => {
    try {
      const userId = await getUserId()
      if (!userId) {
        console.error('Authentication failed: No user ID found')
        console.log('Session state:', session)
        toast.error('Please sign in to create a project')
        throw new Error('User not authenticated. Please sign in and try again.')
      }

      // Only include essential fields - let database handle defaults
      // Map frontend fields to DB schema (MASTER_COMPLETE_SETUP.sql)
      const projectData: Record<string, any> = {
        title: project.name || 'Untitled Project', // Map name -> title
        user_id: userId,
        // Map "planning" to "active" as "planning" is not in the DB enum
        status: project.status === 'planning' ? 'active' : (project.status || 'active'),
        priority: project.priority || 'medium',
        progress: project.progress !== undefined ? project.progress : 0,
        spent: project.spent !== undefined ? project.spent : 0,
        // Store non-schema fields in metadata
        metadata: {
          ...project.metadata,
          team_members: project.team_members || [],
          tags: project.tags || [],
          color: project.color || '#3b82f6',
          is_template: project.is_template || false,
          cover_image: project.cover_image || null,
          project_code: project.project_code || `PRJ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
        }
      }

      // Add optional fields only if provided and they exist in schema
      if (project.description) projectData.description = project.description
      if (project.client_id) projectData.client_id = project.client_id
      if (project.start_date) projectData.start_date = project.start_date
      if (project.end_date) projectData.end_date = project.end_date
      if (project.budget) projectData.budget = project.budget

      console.log('Creating project with data:', projectData)

      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single()

      if (error) {
        console.error('Supabase Create Project Error:', error)
        throw error
      }

      // Map DB response back to frontend interface
      const mappedProject: Project = {
        ...data,
        name: data.title,
        project_code: data.metadata?.project_code || '',
        team_members: data.metadata?.team_members || [],
        tags: data.metadata?.tags || [],
        color: data.metadata?.color || '#3b82f6',
        is_template: data.metadata?.is_template || false,
        cover_image: data.metadata?.cover_image || null,
        template_id: data.metadata?.template_id || null,
        archived_at: data.metadata?.archived_at || null
      }

      setProjects(prev => [mappedProject, ...prev])
      toast.success('Project created successfully')
      return mappedProject
    } catch (err: unknown) {
      console.error('Project creation failed:', err)
      // Expose the specific error for debugging
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      const errorDetails = (err as any)?.details || (err as any)?.hint || ''
      toast.error(`Failed to create project: ${errorMessage} ${errorDetails ? `(${errorDetails})` : ''}`)
      throw err
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      // Find current project to merge metadata
      const currentProject = projects.find(p => p.id === id)

      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      }

      // Map fields
      if (updates.name) updateData.title = updates.name
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.status) updateData.status = updates.status
      if (updates.priority) updateData.priority = updates.priority
      if (updates.budget !== undefined) updateData.budget = updates.budget
      if (updates.spent !== undefined) updateData.spent = updates.spent
      if (updates.progress !== undefined) updateData.progress = updates.progress
      if (updates.start_date !== undefined) updateData.start_date = updates.start_date
      if (updates.end_date !== undefined) updateData.end_date = updates.end_date
      if (updates.client_id !== undefined) updateData.client_id = updates.client_id

      // Handle metadata fields
      const metadataFields = ['team_members', 'tags', 'color', 'is_template', 'cover_image', 'project_code', 'template_id', 'archived_at']
      const hasMetadataUpdate = metadataFields.some(field => field in updates)

      if (hasMetadataUpdate) {
        const currentMetadata = currentProject?.metadata || {}
        updateData.metadata = {
          ...currentMetadata,
          ...updates.metadata, // In case raw metadata is passed
        }

        // Update specific fields in metadata
        if (updates.team_members) updateData.metadata.team_members = updates.team_members
        if (updates.tags) updateData.metadata.tags = updates.tags
        if (updates.color) updateData.metadata.color = updates.color
        if (updates.is_template !== undefined) updateData.metadata.is_template = updates.is_template
        if (updates.cover_image !== undefined) updateData.metadata.cover_image = updates.cover_image
        if (updates.project_code) updateData.metadata.project_code = updates.project_code
        if (updates.template_id !== undefined) updateData.metadata.template_id = updates.template_id
        if (updates.archived_at !== undefined) updateData.metadata.archived_at = updates.archived_at
      }

      console.log('Updating project with data:', updateData)

      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const mappedProject: Project = {
        ...data,
        name: data.title,
        project_code: data.metadata?.project_code || '',
        team_members: data.metadata?.team_members || [],
        tags: data.metadata?.tags || [],
        color: data.metadata?.color || '#3b82f6',
        is_template: data.metadata?.is_template || false,
        cover_image: data.metadata?.cover_image || null,
        template_id: data.metadata?.template_id || null,
        archived_at: data.metadata?.archived_at || null
      }

      setProjects(prev => prev.map(p => p.id === id ? mappedProject : p))
      toast.success('Project updated successfully')
      return mappedProject
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update project')
      throw err
    }
  }

  const archiveProject = async (id: string) => {
    try {
      const result = await updateProject(id, { archived_at: new Date().toISOString() } as any)
      toast.success('Project archived')
      return result
    } catch (err) {
      throw err
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
      setProjects(prev => prev.filter(p => p.id !== id))
      toast.success('Project deleted')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete project')
      throw err
    }
  }

  useEffect(() => {
    const channel = supabase
      .channel('projects_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' },
        () => fetchProjects()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchProjects])

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold: projects.filter(p => p.status === 'on_hold').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    totalSpent: projects.reduce((sum, p) => sum + (p.spent || 0), 0),
    avgProgress: projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0
  }

  return {
    projects,
    stats,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    archiveProject,
    deleteProject
  }
}

export function useProjectTasks(projectId: string, initialTasks: ProjectTask[] = []) {
  const [tasks, setTasks] = useState<ProjectTask[]>(initialTasks)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(() => { })
  }, [])

  // Get auth.users compatible ID
  const getUserId = useCallback(async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id) return user.id
    const authId = (session?.user as any)?.authId
    if (authId) return authId
    if (session?.user?.id) return session.user.id
    return null
  }, [supabase, session])

  const fetchTasks = useCallback(async () => {
    if (!projectId) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (err: unknown) {
      // Error handled silently
    } finally {
      setIsLoading(false)
    }
  }, [supabase, projectId])

  const createTask = async (task: Partial<ProjectTask>) => {
    try {
      const userId = await getUserId()
      if (!userId) {
        toast.error('You must be logged in to create a task')
        throw new Error('User not authenticated')
      }

      const taskData = {
        ...task,
        project_id: projectId,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('project_tasks')
        .insert([taskData])
        .select()
        .single()

      if (error) throw error
      setTasks(prev => [...prev, data])
      toast.success('Task created')
      return data
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create task')
      throw err
    }
  }

  const updateTask = async (id: string, updates: Partial<ProjectTask>) => {
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setTasks(prev => prev.map(t => t.id === id ? data : t))
      toast.success('Task updated')
      return data
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update task')
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      setTasks(prev => prev.filter(t => t.id !== id))
      toast.success('Task deleted')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete task')
      throw err
    }
  }

  useEffect(() => {
    const channel = supabase
      .channel(`project_tasks_${projectId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_tasks',
        filter: `project_id=eq.${projectId}`
      }, () => fetchTasks())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, projectId, fetchTasks])

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    review: tasks.filter(t => t.status === 'review'),
    done: tasks.filter(t => t.status === 'done')
  }

  return {
    tasks,
    tasksByStatus,
    isLoading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
  }
}
