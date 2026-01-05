'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Project {
  id: string
  name: string
  description?: string
  clientId: string
  clientName: string
  status: ProjectStatus
  priority: ProjectPriority
  startDate: string
  endDate?: string
  dueDate: string
  budget: number
  spent: number
  progress: number
  tasks: ProjectTask[]
  team: ProjectMember[]
  tags: string[]
  milestones: ProjectMilestone[]
  thumbnail?: string
  createdAt: string
  updatedAt: string
}

export interface ProjectTask {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: ProjectPriority
  assigneeId?: string
  assigneeName?: string
  dueDate?: string
  completedAt?: string
  estimatedHours?: number
  actualHours?: number
}

export interface ProjectMember {
  id: string
  userId: string
  name: string
  email: string
  avatar?: string
  role: string
  hoursLogged: number
}

export interface ProjectMilestone {
  id: string
  title: string
  description?: string
  dueDate: string
  completedAt?: string
  isCompleted: boolean
}

export interface ProjectStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalBudget: number
  totalSpent: number
  onTrackCount: number
  atRiskCount: number
  averageProgress: number
}

// ============================================================================
// EMPTY DEFAULTS
// ============================================================================

const emptyStats: ProjectStats = {
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  totalBudget: 0,
  totalSpent: 0,
  onTrackCount: 0,
  atRiskCount: 0,
  averageProgress: 0
}

// ============================================================================
// HOOK
// ============================================================================

interface UseProjectsOptions {
  clientId?: string
  status?: ProjectStatus
}

export function useProjects(options: UseProjectsOptions = {}) {
  const { clientId, status } = options

  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchProjects = useCallback(async (filters?: { status?: string; clientId?: string; priority?: string; search?: string }) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters?.status || status) params.set('status', filters?.status || status || '')
      if (filters?.clientId || clientId) params.set('clientId', filters?.clientId || clientId || '')
      if (filters?.priority) params.set('priority', filters.priority)
      if (filters?.search) params.set('search', filters.search)

      const response = await fetch(`/api/projects?${params}`)
      const result = await response.json()
      if (result.success) {
        setProjects(Array.isArray(result.projects) ? result.projects : [])
        setStats(result.stats || emptyStats)
        return result.projects || []
      }
      setProjects([])
      setStats(emptyStats)
      return []
    } catch (err) {
      setProjects([])
      setStats(emptyStats)
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'))
      return []
    } finally {
      setIsLoading(false)
    }
  }, [clientId, status])

  const createProject = useCallback(async (data: Omit<Project, 'id' | 'spent' | 'progress' | 'tasks' | 'team' | 'milestones' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        await fetchProjects()
        return { success: true, project: result.project }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newProject: Project = { ...data, id: `proj-${Date.now()}`, spent: 0, progress: 0, tasks: [], team: [], milestones: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setProjects(prev => [newProject, ...prev])
      return { success: true, project: newProject }
    }
  }, [fetchProjects])

  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
        if (currentProject?.id === projectId) setCurrentProject(prev => prev ? { ...prev, ...updates } : prev)
      }
      return result
    } catch (err) {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p))
      return { success: true }
    }
  }, [currentProject])

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
      setProjects(prev => prev.filter(p => p.id !== projectId))
      if (currentProject?.id === projectId) setCurrentProject(null)
      return { success: true }
    } catch (err) {
      setProjects(prev => prev.filter(p => p.id !== projectId))
      return { success: true }
    }
  }, [currentProject])

  const addTask = useCallback(async (projectId: string, task: Omit<ProjectTask, 'id'>) => {
    const newTask: ProjectTask = { ...task, id: `task-${Date.now()}` }
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p))
    if (currentProject?.id === projectId) {
      setCurrentProject(prev => prev ? { ...prev, tasks: [...prev.tasks, newTask] } : prev)
    }
    return { success: true, task: newTask }
  }, [currentProject])

  const updateTask = useCallback(async (projectId: string, taskId: string, updates: Partial<ProjectTask>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) } : p))
    if (currentProject?.id === projectId) {
      setCurrentProject(prev => prev ? { ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) } : prev)
    }
    return { success: true }
  }, [currentProject])

  const addTeamMember = useCallback(async (projectId: string, member: Omit<ProjectMember, 'id' | 'hoursLogged'>) => {
    const newMember: ProjectMember = { ...member, id: `member-${Date.now()}`, hoursLogged: 0 }
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, team: [...p.team, newMember] } : p))
    return { success: true, member: newMember }
  }, [])

  const addMilestone = useCallback(async (projectId: string, milestone: Omit<ProjectMilestone, 'id' | 'isCompleted'>) => {
    const newMilestone: ProjectMilestone = { ...milestone, id: `ms-${Date.now()}`, isCompleted: false }
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, milestones: [...p.milestones, newMilestone] } : p))
    return { success: true, milestone: newMilestone }
  }, [])

  const completeMilestone = useCallback(async (projectId: string, milestoneId: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      milestones: p.milestones.map(m => m.id === milestoneId ? { ...m, isCompleted: true, completedAt: new Date().toISOString() } : m)
    } : p))
    return { success: true }
  }, [])

  const updateProgress = useCallback(async (projectId: string, progress: number) => {
    return updateProject(projectId, { progress: Math.min(100, Math.max(0, progress)) })
  }, [updateProject])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchProjects({ search: query })
  }, [fetchProjects])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchProjects()
  }, [fetchProjects])

  useEffect(() => { refresh() }, [refresh])

  const activeProjects = useMemo(() => projects.filter(p => p.status === 'in_progress'), [projects])
  const completedProjects = useMemo(() => projects.filter(p => p.status === 'completed'), [projects])
  const upcomingDeadlines = useMemo(() => [...projects].filter(p => p.status !== 'completed').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5), [projects])
  const overBudgetProjects = useMemo(() => projects.filter(p => p.spent > p.budget), [projects])
  const projectsByStatus = useMemo(() => {
    const grouped: Record<string, Project[]> = {}
    projects.forEach(p => {
      if (!grouped[p.status]) grouped[p.status] = []
      grouped[p.status].push(p)
    })
    return grouped
  }, [projects])
  const totalBudget = useMemo(() => projects.reduce((sum, p) => sum + p.budget, 0), [projects])
  const totalSpent = useMemo(() => projects.reduce((sum, p) => sum + p.spent, 0), [projects])

  return {
    projects, currentProject, stats, activeProjects, completedProjects, upcomingDeadlines, overBudgetProjects, projectsByStatus, totalBudget, totalSpent,
    isLoading, error, searchQuery,
    refresh, fetchProjects, createProject, updateProject, deleteProject, addTask, updateTask, addTeamMember, addMilestone, completeMilestone, updateProgress, search,
    setCurrentProject
  }
}

export default useProjects
