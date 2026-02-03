'use client'

/**
 * Extended Projects Hooks
 * Tables: projects, project_members, project_tasks, project_milestones, project_files, project_comments, project_timelines, project_budgets
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useProject(projectId?: string) {
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('projects').select('*, project_members(*, users(*)), project_tasks(count), project_milestones(*), project_files(count), project_budgets(*)').eq('id', projectId).single(); setProject(data) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { project, isLoading, refresh: loadData }
}

export function useProjects(options?: { owner_id?: string; organization_id?: string; client_id?: string; status?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('projects').select('*, project_members(count), project_tasks(count), project_milestones(count)')
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.client_id) query = query.eq('client_id', options.client_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setProjects(data || [])
    } finally { setIsLoading(false) }
  }, [options?.owner_id, options?.organization_id, options?.client_id, options?.status, options?.is_active, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { projects, isLoading, refresh: loadData }
}

export function useProjectMembers(projectId?: string) {
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('project_members').select('*, users(*)').eq('project_id', projectId).order('joined_at', { ascending: true }); setMembers(data || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { members, isLoading, refresh: loadData }
}

export function useProjectTasks(projectId?: string, options?: { status?: string; assignee_id?: string; milestone_id?: string; priority?: string }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('project_tasks').select('*, users(*)').eq('project_id', projectId)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.assignee_id) query = query.eq('assignee_id', options.assignee_id)
      if (options?.milestone_id) query = query.eq('milestone_id', options.milestone_id)
      if (options?.priority) query = query.eq('priority', options.priority)
      const { data } = await query.order('created_at', { ascending: false })
      setTasks(data || [])
    } finally { setIsLoading(false) }
  }, [projectId, options?.status, options?.assignee_id, options?.milestone_id, options?.priority])
  useEffect(() => { loadData() }, [loadData])
  return { tasks, isLoading, refresh: loadData }
}

export function useProjectMilestones(projectId?: string) {
  const [milestones, setMilestones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('project_milestones').select('*, project_tasks(count)').eq('project_id', projectId).order('due_date', { ascending: true }); setMilestones(data || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { milestones, isLoading, refresh: loadData }
}

export function useProjectFiles(projectId?: string, options?: { folder_id?: string; type?: string }) {
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('project_files').select('*, users(*)').eq('project_id', projectId)
      if (options?.folder_id) query = query.eq('folder_id', options.folder_id)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false })
      setFiles(data || [])
    } finally { setIsLoading(false) }
  }, [projectId, options?.folder_id, options?.type])
  useEffect(() => { loadData() }, [loadData])
  return { files, isLoading, refresh: loadData }
}

export function useProjectComments(projectId?: string, options?: { task_id?: string; limit?: number }) {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('project_comments').select('*, users(*)').eq('project_id', projectId).is('parent_id', null)
      if (options?.task_id) query = query.eq('task_id', options.task_id)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setComments(data || [])
    } finally { setIsLoading(false) }
  }, [projectId, options?.task_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { comments, isLoading, refresh: loadData }
}

export function useMyProjects(userId?: string, options?: { status?: string; role?: string; limit?: number }) {
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('project_members').select('*, projects(*, project_tasks(count), project_milestones(count))').eq('user_id', userId)
      if (options?.role) query = query.eq('role', options.role)
      const { data } = await query.order('joined_at', { ascending: false }).limit(options?.limit || 50)
      let projects = data?.map(m => ({ ...m.projects, membership: m })) || []
      if (options?.status) projects = projects.filter(p => p.status === options.status)
      setProjects(projects)
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.role, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { projects, isLoading, refresh: loadData }
}

export function useProjectBudget(projectId?: string) {
  const [budget, setBudget] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('project_budgets').select('*').eq('project_id', projectId).single(); setBudget(data) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { budget, isLoading, refresh: loadData }
}

export function useProjectTimeline(projectId?: string) {
  const [timeline, setTimeline] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('project_timelines').select('*, users(*)').eq('project_id', projectId).order('created_at', { ascending: false }); setTimeline(data || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { timeline, isLoading, refresh: loadData }
}

export function useProjectStats(projectId?: string) {
  const [stats, setStats] = useState<{ totalTasks: number; completedTasks: number; progress: number; overdueTasks: number; memberCount: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [tasksRes, membersRes] = await Promise.all([
        supabase.from('project_tasks').select('status, due_date').eq('project_id', projectId),
        supabase.from('project_members').select('id', { count: 'exact' }).eq('project_id', projectId)
      ])
      const tasks = tasksRes.data || []
      const totalTasks = tasks.length
      const completedTasks = tasks.filter(t => t.status === 'completed').length
      const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date()).length
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      setStats({ totalTasks, completedTasks, progress, overdueTasks, memberCount: membersRes.count || 0 })
    } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useActiveProjects(options?: { organization_id?: string; limit?: number }) {
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('projects').select('*, project_tasks(count), project_members(count)').eq('is_active', true).in('status', ['planning', 'in_progress'])
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 20)
      setProjects(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { projects, isLoading, refresh: loadData }
}
