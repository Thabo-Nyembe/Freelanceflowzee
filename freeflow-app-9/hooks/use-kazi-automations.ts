'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface Automation {
  id: string
  name: string
  description: string
  trigger_type: 'manual' | 'schedule' | 'webhook' | 'event' | 'form' | 'record-change'
  trigger_config: Record<string, unknown>
  actions: {
    type: string
    config: Record<string, unknown>
  }[]
  status: 'active' | 'paused' | 'error' | 'draft'
  category: string
  tags: string[]
  icon: string
  color: string
  run_count: number
  success_count: number
  error_count: number
  success_rate: number
  time_saved: number
  last_triggered_at: string | null
  next_scheduled_at: string | null
  created_at: string
  updated_at: string
}

export interface AutomationStats {
  totalAutomations: number
  activeAutomations: number
  totalRuns: number
  successRate: number
  timeSaved: number
}

interface UseKaziAutomationsOptions {
  status?: string
  category?: string
}

// Mock data for demo/fallback
const mockAutomations: Automation[] = [
  {
    id: '1',
    name: 'Auto-assign new tasks',
    description: 'Automatically assign tasks to team members based on workload',
    trigger_type: 'event',
    trigger_config: { event: 'task.created' },
    actions: [
      { type: 'condition', config: { field: 'priority', operator: 'equals', value: 'high' } },
      { type: 'notification', config: { message: 'New high priority task assigned' } }
    ],
    status: 'active',
    category: 'productivity',
    tags: ['tasks', 'automation'],
    icon: 'Zap',
    color: 'amber',
    run_count: 234,
    success_count: 230,
    error_count: 4,
    success_rate: 98.3,
    time_saved: 120,
    last_triggered_at: new Date(Date.now() - 1800000).toISOString(),
    next_scheduled_at: null,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '2',
    name: 'Send invoice on project completion',
    description: 'Generate and send invoice when a project is marked complete',
    trigger_type: 'event',
    trigger_config: { event: 'project.completed' },
    actions: [
      { type: 'send-invoice', config: {} },
      { type: 'email', config: { template: 'invoice-sent' } }
    ],
    status: 'active',
    category: 'finance',
    tags: ['invoices', 'projects'],
    icon: 'Receipt',
    color: 'green',
    run_count: 45,
    success_count: 45,
    error_count: 0,
    success_rate: 100,
    time_saved: 90,
    last_triggered_at: new Date(Date.now() - 86400000).toISOString(),
    next_scheduled_at: null,
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: '3',
    name: 'Daily standup reminder',
    description: 'Send reminder to team 15 minutes before daily standup',
    trigger_type: 'schedule',
    trigger_config: { cron: '0 9 45 * * 1-5' },
    actions: [
      { type: 'slack-message', config: { channel: '#general', message: 'Standup in 15 minutes!' } }
    ],
    status: 'active',
    category: 'communication',
    tags: ['team', 'meetings'],
    icon: 'Clock',
    color: 'blue',
    run_count: 120,
    success_count: 118,
    error_count: 2,
    success_rate: 98.3,
    time_saved: 60,
    last_triggered_at: new Date(Date.now() - 3600000).toISOString(),
    next_scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: '4',
    name: 'Client health score alert',
    description: 'Alert when client health score drops below threshold',
    trigger_type: 'event',
    trigger_config: { event: 'client.health_updated' },
    actions: [
      { type: 'condition', config: { field: 'health_score', operator: 'less', value: 50 } },
      { type: 'notification', config: { message: 'Client health score is low' } },
      { type: 'create-task', config: { title: 'Follow up with client' } }
    ],
    status: 'active',
    category: 'sales',
    tags: ['clients', 'health'],
    icon: 'Heart',
    color: 'red',
    run_count: 12,
    success_count: 11,
    error_count: 1,
    success_rate: 91.7,
    time_saved: 30,
    last_triggered_at: new Date(Date.now() - 259200000).toISOString(),
    next_scheduled_at: null,
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: '5',
    name: 'Overdue task escalation',
    description: 'Escalate tasks that are overdue by more than 2 days',
    trigger_type: 'schedule',
    trigger_config: { cron: '0 0 8 * * *' },
    actions: [
      { type: 'condition', config: { field: 'days_overdue', operator: 'greater', value: 2 } },
      { type: 'notification', config: { message: 'Task escalated to manager' } },
      { type: 'update-status', config: { status: 'escalated' } }
    ],
    status: 'paused',
    category: 'productivity',
    tags: ['tasks', 'escalation'],
    icon: 'AlertTriangle',
    color: 'orange',
    run_count: 67,
    success_count: 65,
    error_count: 2,
    success_rate: 97.0,
    time_saved: 45,
    last_triggered_at: new Date(Date.now() - 604800000).toISOString(),
    next_scheduled_at: null,
    created_at: new Date(Date.now() - 86400000 * 120).toISOString(),
    updated_at: new Date(Date.now() - 604800000).toISOString()
  }
]

export function useKaziAutomations(options: UseKaziAutomationsOptions = {}) {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [stats, setStats] = useState<AutomationStats>({
    totalAutomations: 0,
    activeAutomations: 0,
    totalRuns: 0,
    successRate: 0,
    timeSaved: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [runningAutomations, setRunningAutomations] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Fetch automations
  const fetchAutomations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (options.status) params.set('status', options.status)
      if (options.category) params.set('category', options.category)

      const response = await fetch(`/api/kazi/automations?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch automations')
      }

      const { data } = await response.json()

      if (data && data.length > 0) {
        setAutomations(data)
        calculateStats(data)
      } else {
        setAutomations([])
        calculateStats([])
      }
    } catch (err) {
      console.error('Error fetching automations:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setAutomations([])
      calculateStats([])
    } finally {
      setIsLoading(false)
    }
  }, [options.status, options.category])

  // Calculate stats from automations
  const calculateStats = (data: Automation[]) => {
    const totalRuns = data.reduce((sum, a) => sum + a.run_count, 0)
    const totalSuccess = data.reduce((sum, a) => sum + a.success_count, 0)
    const totalTimeSaved = data.reduce((sum, a) => sum + a.time_saved, 0)

    setStats({
      totalAutomations: data.length,
      activeAutomations: data.filter(a => a.status === 'active').length,
      totalRuns,
      successRate: totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100) : 0,
      timeSaved: totalTimeSaved
    })
  }

  // Create automation
  const createAutomation = useCallback(async (automation: Partial<Automation>): Promise<Automation | null> => {
    try {
      const response = await fetch('/api/kazi/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(automation)
      })

      if (!response.ok) {
        throw new Error('Failed to create automation')
      }

      const { data } = await response.json()
      setAutomations(prev => [data, ...prev])
      toast({
        title: 'Automation Created',
        description: `"${data.name}" has been created successfully.`
      })
      return data
    } catch (err) {
      console.error('Error creating automation:', err)
      toast({
        title: 'Error',
        description: 'Failed to create automation.',
        variant: 'destructive'
      })
      return null
    }
  }, [toast])

  // Update automation
  const updateAutomation = useCallback(async (id: string, updates: Partial<Automation>): Promise<Automation | null> => {
    try {
      const response = await fetch(`/api/kazi/automations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Failed to update automation')
      }

      const { data } = await response.json()
      setAutomations(prev => prev.map(a => a.id === id ? data : a))
      toast({
        title: 'Automation Updated',
        description: 'Changes have been saved.'
      })
      return data
    } catch (err) {
      console.error('Error updating automation:', err)
      toast({
        title: 'Error',
        description: 'Failed to update automation.',
        variant: 'destructive'
      })
      return null
    }
  }, [toast])

  // Delete automation
  const deleteAutomation = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/kazi/automations/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete automation')
      }

      setAutomations(prev => prev.filter(a => a.id !== id))
      toast({
        title: 'Automation Deleted',
        description: 'The automation has been removed.'
      })
      return true
    } catch (err) {
      console.error('Error deleting automation:', err)
      toast({
        title: 'Error',
        description: 'Failed to delete automation.',
        variant: 'destructive'
      })
      return false
    }
  }, [toast])

  // Toggle automation status
  const toggleAutomation = useCallback(async (id: string): Promise<boolean> => {
    const automation = automations.find(a => a.id === id)
    if (!automation) return false

    const newStatus = automation.status === 'active' ? 'paused' : 'active'

    // Optimistic update
    setAutomations(prev => prev.map(a =>
      a.id === id ? { ...a, status: newStatus } : a
    ))

    try {
      const response = await fetch(`/api/kazi/automations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle automation')
      }

      toast({
        title: 'Status Updated',
        description: `Automation is now ${newStatus}.`
      })
      return true
    } catch (err) {
      // Revert on error
      setAutomations(prev => prev.map(a =>
        a.id === id ? { ...a, status: automation.status } : a
      ))
      console.error('Error toggling automation:', err)
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive'
      })
      return false
    }
  }, [automations, toast])

  // Run automation
  const runAutomation = useCallback(async (id: string, input?: Record<string, unknown>): Promise<boolean> => {
    setRunningAutomations(prev => new Set(prev).add(id))

    toast({
      title: 'Automation Started',
      description: 'Running automation...'
    })

    try {
      const response = await fetch(`/api/kazi/automations/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input || {} })
      })

      if (!response.ok) {
        throw new Error('Failed to run automation')
      }

      const result = await response.json()

      // Update automation stats
      setAutomations(prev => prev.map(a =>
        a.id === id
          ? {
            ...a,
            run_count: a.run_count + 1,
            success_count: result.success ? a.success_count + 1 : a.success_count,
            error_count: result.success ? a.error_count : a.error_count + 1,
            last_triggered_at: new Date().toISOString()
          }
          : a
      ))

      toast({
        title: result.success ? 'Automation Completed' : 'Automation Failed',
        description: result.success
          ? `Executed ${result.actions_completed} actions in ${result.duration_ms}ms`
          : 'One or more actions failed.',
        variant: result.success ? 'default' : 'destructive'
      })

      return result.success
    } catch (err) {
      console.error('Error running automation:', err)
      toast({
        title: 'Error',
        description: 'Failed to run automation.',
        variant: 'destructive'
      })
      return false
    } finally {
      setRunningAutomations(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }, [toast])

  // Duplicate automation
  const duplicateAutomation = useCallback(async (id: string): Promise<Automation | null> => {
    const automation = automations.find(a => a.id === id)
    if (!automation) return null

    const duplicate = {
      name: `${automation.name} (Copy)`,
      description: automation.description,
      trigger_type: automation.trigger_type,
      trigger_config: automation.trigger_config,
      actions: automation.actions,
      category: automation.category,
      tags: automation.tags,
      icon: automation.icon,
      color: automation.color,
      status: 'draft' as const
    }

    return createAutomation(duplicate)
  }, [automations, createAutomation])

  // Load automations on mount
  useEffect(() => {
    fetchAutomations()
  }, [fetchAutomations])

  return {
    automations,
    stats,
    isLoading,
    error,
    runningAutomations,
    fetchAutomations,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomation,
    runAutomation,
    duplicateAutomation
  }
}
