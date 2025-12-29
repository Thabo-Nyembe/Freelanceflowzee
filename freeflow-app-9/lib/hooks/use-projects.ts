'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSession } from 'next-auth/react'
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
  const supabase = createClientComponentClient()
  const { data: session } = useSession()

  // Get auth.users compatible ID (same pattern as useSupabaseMutation)
  const getUserId = useCallback(async (): Promise<string | null> => {
    // First try Supabase auth
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id) return user.id

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
      setProjects(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to fetch projects:', err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const createProject = async (project: Partial<Project>) => {
    try {
      const userId = await getUserId()
      if (!userId) {
        toast.error('You must be logged in to create a project')
        throw new Error('User not authenticated')
      }

      const projectData = {
        ...project,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single()

      if (error) throw error
      setProjects(prev => [data, ...prev])
      toast.success('Project created successfully')
      return data
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project')
      throw err
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setProjects(prev => prev.map(p => p.id === id ? data : p))
      toast.success('Project updated successfully')
      return data
    } catch (err: any) {
      toast.error(err.message || 'Failed to update project')
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete project')
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
  const supabase = createClientComponentClient()
  const { data: session } = useSession()

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
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err)
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task')
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task')
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete task')
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
