'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

// Types
export interface MaintenanceWindow {
  id: string
  user_id: string
  window_code: string
  title: string
  description: string | null
  type: 'routine' | 'emergency' | 'upgrade' | 'patch' | 'inspection' | 'optimization'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'delayed'
  impact: 'low' | 'medium' | 'high' | 'critical'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  start_time: string
  end_time: string
  duration_minutes: number
  actual_start: string | null
  actual_end: string | null
  affected_systems: string[]
  downtime_expected: boolean
  assigned_to: string[]
  created_by: string | null
  notification_sent: boolean
  notification_sent_at: string | null
  notification_methods: string[]
  users_notified: number
  completion_rate: number
  notes: string | null
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface MaintenanceTask {
  id: string
  window_id: string
  name: string
  description: string | null
  task_order: number
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped'
  estimated_duration_minutes: number
  actual_duration_minutes: number | null
  started_at: string | null
  completed_at: string | null
  assigned_to: string[]
  completed_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MaintenanceStats {
  total: number
  scheduled: number
  inProgress: number
  completed: number
  cancelled: number
  delayed: number
  avgCompletionRate: number
  upcomingCount: number
  criticalCount: number
}

export function useMaintenance() {
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [windows, setWindows] = useState<MaintenanceWindow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch maintenance windows
  const fetchWindows = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('maintenance_windows')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('start_time', { ascending: true })

      if (error) throw error
      setWindows(data || [])
    } catch (err: any) {
      setError(err.message)
      toast({ title: 'Error', description: 'Failed to fetch maintenance windows', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  // Create maintenance window
  const createWindow = async (window: Partial<MaintenanceWindow>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('maintenance_windows')
        .insert([{ ...window, user_id: user.id, created_by: user.id }])
        .select()
        .single()

      if (error) throw error
      setWindows(prev => [...prev, data].sort((a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ))
      toast({ title: 'Success', description: 'Maintenance window scheduled' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Update maintenance window
  const updateWindow = async (id: string, updates: Partial<MaintenanceWindow>) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_windows')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setWindows(prev => prev.map(w => w.id === id ? data : w))
      toast({ title: 'Success', description: 'Maintenance window updated' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Delete maintenance window (soft delete)
  const deleteWindow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_windows')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      setWindows(prev => prev.filter(w => w.id !== id))
      toast({ title: 'Success', description: 'Maintenance window deleted' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Start maintenance
  const startMaintenance = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_windows')
        .update({
          status: 'in-progress',
          actual_start: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setWindows(prev => prev.map(w => w.id === id ? data : w))
      toast({ title: 'Success', description: 'Maintenance started' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Complete maintenance
  const completeMaintenance = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_windows')
        .update({
          status: 'completed',
          actual_end: new Date().toISOString(),
          completion_rate: 100
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setWindows(prev => prev.map(w => w.id === id ? data : w))
      toast({ title: 'Success', description: 'Maintenance completed' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Cancel maintenance
  const cancelMaintenance = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_windows')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setWindows(prev => prev.map(w => w.id === id ? data : w))
      toast({ title: 'Success', description: 'Maintenance cancelled' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Delay maintenance
  const delayMaintenance = async (id: string, newStartTime: string, newEndTime: string) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_windows')
        .update({
          status: 'delayed',
          start_time: newStartTime,
          end_time: newEndTime
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setWindows(prev => prev.map(w => w.id === id ? data : w))
      toast({ title: 'Success', description: 'Maintenance rescheduled' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Send notifications
  const sendNotifications = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_windows')
        .update({
          notification_sent: true,
          notification_sent_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setWindows(prev => prev.map(w => w.id === id ? data : w))
      toast({ title: 'Success', description: 'Notifications sent' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Calculate stats
  const getStats = useCallback((): MaintenanceStats => {
    const now = new Date()
    return {
      total: windows.length,
      scheduled: windows.filter(w => w.status === 'scheduled').length,
      inProgress: windows.filter(w => w.status === 'in-progress').length,
      completed: windows.filter(w => w.status === 'completed').length,
      cancelled: windows.filter(w => w.status === 'cancelled').length,
      delayed: windows.filter(w => w.status === 'delayed').length,
      avgCompletionRate: windows.length > 0
        ? windows.reduce((sum, w) => sum + w.completion_rate, 0) / windows.length
        : 0,
      upcomingCount: windows.filter(w =>
        w.status === 'scheduled' && new Date(w.start_time) > now
      ).length,
      criticalCount: windows.filter(w => w.impact === 'critical').length
    }
  }, [windows])

  // Real-time subscription
  useEffect(() => {
    fetchWindows()

    const channel = supabase
      .channel('maintenance-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_windows' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setWindows(prev => [...prev, payload.new as MaintenanceWindow].sort((a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          ))
        } else if (payload.eventType === 'UPDATE') {
          setWindows(prev => prev.map(w => w.id === payload.new.id ? payload.new as MaintenanceWindow : w))
        } else if (payload.eventType === 'DELETE') {
          setWindows(prev => prev.filter(w => w.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchWindows, supabase])

  return {
    windows,
    loading,
    error,
    fetchWindows,
    createWindow,
    updateWindow,
    deleteWindow,
    startMaintenance,
    completeMaintenance,
    cancelMaintenance,
    delayMaintenance,
    sendNotifications,
    getStats
  }
}

// Hook for maintenance tasks
export function useMaintenanceTasks(windowId: string) {
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<MaintenanceTask[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!windowId) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('window_id', windowId)
        .order('task_order', { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (err) {
      console.error('Failed to fetch maintenance tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [windowId, supabase])

  // Create task
  const createTask = async (task: Partial<MaintenanceTask>) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .insert([{ ...task, window_id: windowId }])
        .select()
        .single()

      if (error) throw error
      setTasks(prev => [...prev, data].sort((a, b) => a.task_order - b.task_order))
      toast({ title: 'Success', description: 'Task added' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Update task
  const updateTask = async (id: string, updates: Partial<MaintenanceTask>) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setTasks(prev => prev.map(t => t.id === id ? data : t))
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Complete task
  const completeTask = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: user?.id
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setTasks(prev => prev.map(t => t.id === id ? data : t))
      toast({ title: 'Success', description: 'Task completed' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Delete task
  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      setTasks(prev => prev.filter(t => t.id !== id))
      toast({ title: 'Success', description: 'Task removed' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  useEffect(() => {
    fetchTasks()

    if (windowId) {
      const channel = supabase
        .channel(`maintenance-tasks-${windowId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'maintenance_tasks',
          filter: `window_id=eq.${windowId}`
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [...prev, payload.new as MaintenanceTask].sort((a, b) => a.task_order - b.task_order))
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new as MaintenanceTask : t))
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id))
          }
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchTasks, windowId, supabase])

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    completeTask,
    deleteTask
  }
}
