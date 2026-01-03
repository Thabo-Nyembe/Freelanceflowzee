'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface MyDayTask {
  id: string
  user_id: string
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  due_date: string | null
  due_time: string | null
  estimated_minutes: number | null
  actual_minutes: number | null
  category: string | null
  tags: string[]
  project_id: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface FocusSession {
  id: string
  user_id: string
  task_id: string | null
  start_time: string
  end_time: string | null
  duration_minutes: number | null
  session_type: 'focus' | 'break' | 'meeting'
  notes: string | null
  created_at: string
}

export function useMyDayTasks(initialTasks: MyDayTask[] = []) {
  const [tasks, setTasks] = useState<MyDayTask[]>(initialTasks)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchTasks = useCallback(async (date?: string) => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('my_day_tasks')
        .select('*')
        .order('priority', { ascending: false })
        .order('due_time', { ascending: true, nullsFirst: false })

      if (date) {
        query = query.eq('due_date', date)
      }

      const { data, error } = await query

      if (error) throw error
      setTasks(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const createTask = async (task: Partial<MyDayTask>) => {
    const { data, error } = await supabase
      .from('my_day_tasks')
      .insert([task])
      .select()
      .single()

    if (error) throw error
    setTasks(prev => [data, ...prev])
    return data
  }

  const updateTask = async (id: string, updates: Partial<MyDayTask>) => {
    const { data, error } = await supabase
      .from('my_day_tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setTasks(prev => prev.map(t => t.id === id ? data : t))
    return data
  }

  const completeTask = async (id: string) => {
    return updateTask(id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('my_day_tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  useEffect(() => {
    const channel = supabase
      .channel('my_day_tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'my_day_tasks' },
        () => fetchTasks()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchTasks])

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    highPriority: tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length
  }

  return {
    tasks,
    stats,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    completeTask,
    deleteTask
  }
}

export function useFocusSessions(initialSessions: FocusSession[] = []) {
  const [sessions, setSessions] = useState<FocusSession[]>(initialSessions)
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const startSession = async (taskId?: string, type: FocusSession['session_type'] = 'focus') => {
    const { data, error } = await supabase
      .from('focus_sessions')
      .insert([{
        task_id: taskId,
        session_type: type,
        start_time: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    setActiveSession(data)
    setSessions(prev => [data, ...prev])
    return data
  }

  const endSession = async (notes?: string) => {
    if (!activeSession) return

    const endTime = new Date()
    const startTime = new Date(activeSession.start_time)
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)

    const { data, error } = await supabase
      .from('focus_sessions')
      .update({
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        notes
      })
      .eq('id', activeSession.id)
      .select()
      .single()

    if (error) throw error
    setActiveSession(null)
    setSessions(prev => prev.map(s => s.id === data.id ? data : s))
    return data
  }

  const fetchTodaySessions = async () => {
    setIsLoading(true)
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .gte('start_time', `${today}T00:00:00`)
      .order('start_time', { ascending: false })

    if (error) throw error
    setSessions(data || [])

    const active = data?.find(s => !s.end_time)
    setActiveSession(active || null)
    setIsLoading(false)
  }

  const totalFocusMinutes = sessions
    .filter(s => s.session_type === 'focus' && s.duration_minutes)
    .reduce((sum, s) => sum + (s.duration_minutes || 0), 0)

  return {
    sessions,
    activeSession,
    isLoading,
    totalFocusMinutes,
    startSession,
    endSession,
    fetchTodaySessions
  }
}
