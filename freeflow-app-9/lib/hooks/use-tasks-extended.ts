'use client'

/**
 * Extended Tasks Hooks
 * Tables: tasks, task_assignments, task_dependencies, task_comments, task_time_logs, task_checklists
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTask(taskId?: string) {
  const [task, setTask] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!taskId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tasks').select('*, task_assignments(*), task_dependencies(*), task_checklists(*), users(*), projects(*)').eq('id', taskId).single(); setTask(data) } finally { setIsLoading(false) }
  }, [taskId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { task, isLoading, refresh: fetch }
}

export function useTasks(options?: { project_id?: string; status?: string; priority?: string; assignee_id?: string; parent_id?: string | null; overdue?: boolean; search?: string; limit?: number }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('tasks').select('*, task_assignments(*), users(*), projects(*)')
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.priority) query = query.eq('priority', options.priority)
      if (options?.parent_id !== undefined) {
        if (options.parent_id === null) query = query.is('parent_id', null)
        else query = query.eq('parent_id', options.parent_id)
      }
      if (options?.overdue) query = query.lt('due_date', new Date().toISOString()).neq('status', 'done')
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      let result = data || []
      if (options?.assignee_id) {
        const { data: assignments } = await supabase.from('task_assignments').select('task_id').eq('user_id', options.assignee_id)
        const taskIds = assignments?.map(a => a.task_id) || []
        result = result.filter(t => taskIds.includes(t.id))
      }
      setTasks(result)
    } finally { setIsLoading(false) }
  }, [options?.project_id, options?.status, options?.priority, options?.assignee_id, options?.parent_id, options?.overdue, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tasks, isLoading, refresh: fetch }
}

export function useMyTasks(userId?: string, options?: { status?: string; priority?: string; limit?: number }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: assignments } = await supabase.from('task_assignments').select('task_id').eq('user_id', userId)
      const taskIds = assignments?.map(a => a.task_id) || []
      if (taskIds.length === 0) { setTasks([]); return }
      let query = supabase.from('tasks').select('*, task_assignments(*), projects(*)').in('id', taskIds)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.priority) query = query.eq('priority', options.priority)
      const { data } = await query.order('due_date', { ascending: true }).limit(options?.limit || 100)
      setTasks(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.priority, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tasks, isLoading, refresh: fetch }
}

export function useSubtasks(taskId?: string) {
  const [subtasks, setSubtasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!taskId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('tasks').select('*, task_assignments(*)').eq('parent_id', taskId).order('created_at', { ascending: true }); setSubtasks(data || []) } finally { setIsLoading(false) }
  }, [taskId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { subtasks, isLoading, refresh: fetch }
}

export function useTaskDependencies(taskId?: string) {
  const [dependencies, setDependencies] = useState<any[]>([])
  const [dependents, setDependents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!taskId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [depsRes, dependentsRes] = await Promise.all([
        supabase.from('task_dependencies').select('*, depends_on:depends_on_id(*)').eq('task_id', taskId),
        supabase.from('task_dependencies').select('*, task:task_id(*)').eq('depends_on_id', taskId)
      ])
      setDependencies(depsRes.data || [])
      setDependents(dependentsRes.data || [])
    } finally { setIsLoading(false) }
  }, [taskId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { dependencies, dependents, isLoading, refresh: fetch }
}

export function useTaskComments(taskId?: string, options?: { limit?: number }) {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!taskId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('task_comments').select('*, users(*)').eq('task_id', taskId).is('parent_id', null).order('created_at', { ascending: true }).limit(options?.limit || 100); setComments(data || []) } finally { setIsLoading(false) }
  }, [taskId, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { comments, isLoading, refresh: fetch }
}

export function useTaskTimeLogs(taskId?: string, options?: { user_id?: string; from_date?: string; to_date?: string }) {
  const [timeLogs, setTimeLogs] = useState<any[]>([])
  const [totalHours, setTotalHours] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!taskId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('task_time_logs').select('*, users(*)').eq('task_id', taskId)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.from_date) query = query.gte('logged_date', options.from_date)
      if (options?.to_date) query = query.lte('logged_date', options.to_date)
      const { data } = await query.order('logged_date', { ascending: false })
      const logs = data || []
      setTimeLogs(logs)
      setTotalHours(logs.reduce((sum, l) => sum + (l.hours || 0), 0))
    } finally { setIsLoading(false) }
  }, [taskId, options?.user_id, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { timeLogs, totalHours, isLoading, refresh: fetch }
}

export function useTaskChecklist(taskId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [progress, setProgress] = useState<{ completed: number; total: number; percentage: number }>({ completed: 0, total: 0, percentage: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!taskId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('task_checklists').select('*').eq('task_id', taskId).order('order_index', { ascending: true })
      const checklistItems = data || []
      setItems(checklistItems)
      const completed = checklistItems.filter(i => i.is_completed).length
      const total = checklistItems.length
      setProgress({ completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 })
    } finally { setIsLoading(false) }
  }, [taskId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { items, progress, isLoading, refresh: fetch }
}

export function useOverdueTasks(options?: { project_id?: string; assignee_id?: string; limit?: number }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('tasks').select('*, task_assignments(*), projects(*)').lt('due_date', new Date().toISOString()).neq('status', 'done')
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      const { data } = await query.order('due_date', { ascending: true }).limit(options?.limit || 50)
      let result = data || []
      if (options?.assignee_id) {
        const { data: assignments } = await supabase.from('task_assignments').select('task_id').eq('user_id', options.assignee_id)
        const taskIds = assignments?.map(a => a.task_id) || []
        result = result.filter(t => taskIds.includes(t.id))
      }
      setTasks(result)
    } finally { setIsLoading(false) }
  }, [options?.project_id, options?.assignee_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { tasks, isLoading, refresh: fetch }
}

export function useTaskStats(projectId?: string) {
  const [stats, setStats] = useState<{ total: number; todo: number; inProgress: number; done: number; overdue: number }>({ total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('tasks').select('status, due_date')
      if (projectId) query = query.eq('project_id', projectId)
      const { data } = await query
      const tasks = data || []
      const now = new Date().toISOString()
      setStats({
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        done: tasks.filter(t => t.status === 'done').length,
        overdue: tasks.filter(t => t.due_date && t.due_date < now && t.status !== 'done').length
      })
    } finally { setIsLoading(false) }
  }, [projectId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

