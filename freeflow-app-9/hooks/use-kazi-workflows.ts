'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface WorkflowAction {
  id?: string
  action_type: string
  position: number
  config: Record<string, unknown>
  conditions?: Record<string, unknown>[]
}

export interface Workflow {
  id: string
  name: string
  description: string
  trigger_type: 'manual' | 'schedule' | 'event' | 'webhook' | 'form-submit' | 'record-change'
  trigger_config: Record<string, unknown>
  trigger_enabled: boolean
  status: 'draft' | 'active' | 'paused' | 'error' | 'completed'
  category: string | null
  tags: string[]
  is_template: boolean
  run_count: number
  success_count: number
  error_count: number
  success_rate: number
  last_run_at: string | null
  next_run_at: string | null
  workflow_actions?: WorkflowAction[]
  created_at: string
  updated_at: string
}

export interface WorkflowStats {
  totalWorkflows: number
  activeWorkflows: number
  totalRuns: number
  successRate: number
}

interface UseKaziWorkflowsOptions {
  status?: string
  category?: string
  useMockData?: boolean
}

// Mock data for demo/fallback
const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'New Client Onboarding',
    description: 'Complete onboarding process for new clients with document collection and welcome sequence',
    trigger_type: 'event',
    trigger_config: { event: 'client.created' },
    trigger_enabled: true,
    status: 'active',
    category: 'sales',
    tags: ['onboarding', 'clients'],
    is_template: false,
    run_count: 156,
    success_count: 152,
    error_count: 4,
    success_rate: 97.4,
    last_run_at: new Date(Date.now() - 3600000).toISOString(),
    next_run_at: null,
    workflow_actions: [
      { action_type: 'email', position: 0, config: { template: 'welcome' } },
      { action_type: 'create-task', position: 1, config: { title: 'Schedule intro call' } },
      { action_type: 'notification', position: 2, config: { message: 'New client added' } }
    ],
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '2',
    name: 'Project Delivery Pipeline',
    description: 'Automated workflow for project completion, review, and delivery to client',
    trigger_type: 'event',
    trigger_config: { event: 'project.status_changed', status: 'completed' },
    trigger_enabled: true,
    status: 'active',
    category: 'operations',
    tags: ['projects', 'delivery'],
    is_template: false,
    run_count: 89,
    success_count: 87,
    error_count: 2,
    success_rate: 97.8,
    last_run_at: new Date(Date.now() - 86400000).toISOString(),
    next_run_at: null,
    workflow_actions: [
      { action_type: 'condition', position: 0, config: { field: 'deliverables_ready', operator: 'equals', value: true } },
      { action_type: 'api-call', position: 1, config: { action: 'generate-report' } },
      { action_type: 'email', position: 2, config: { template: 'project-delivered' } },
      { action_type: 'update-record', position: 3, config: { status: 'delivered' } }
    ],
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: '3',
    name: 'Invoice Processing',
    description: 'Generate, send, and track invoices with automated reminders',
    trigger_type: 'schedule',
    trigger_config: { cron: '0 0 1 * *' },
    trigger_enabled: true,
    status: 'active',
    category: 'operations',
    tags: ['invoices', 'billing'],
    is_template: false,
    run_count: 24,
    success_count: 24,
    error_count: 0,
    success_rate: 100,
    last_run_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    next_run_at: new Date(Date.now() + 86400000 * 25).toISOString(),
    workflow_actions: [
      { action_type: 'api-call', position: 0, config: { action: 'generate-invoices' } },
      { action_type: 'email', position: 1, config: { template: 'invoice-batch' } },
      { action_type: 'notification', position: 2, config: { message: 'Monthly invoices sent' } }
    ],
    created_at: new Date(Date.now() - 86400000 * 180).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: '4',
    name: 'Team Weekly Review',
    description: 'Compile weekly stats and send summary to team leads every Friday',
    trigger_type: 'schedule',
    trigger_config: { cron: '0 17 * * 5' },
    trigger_enabled: true,
    status: 'active',
    category: 'hr',
    tags: ['team', 'reports'],
    is_template: false,
    run_count: 52,
    success_count: 50,
    error_count: 2,
    success_rate: 96.2,
    last_run_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    next_run_at: new Date(Date.now() + 86400000 * 5).toISOString(),
    workflow_actions: [
      { action_type: 'api-call', position: 0, config: { action: 'compile-weekly-stats' } },
      { action_type: 'email', position: 1, config: { template: 'weekly-review', to: 'team-leads' } }
    ],
    created_at: new Date(Date.now() - 86400000 * 365).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: '5',
    name: 'Support Ticket Escalation',
    description: 'Automatically escalate support tickets based on priority and response time',
    trigger_type: 'event',
    trigger_config: { event: 'ticket.updated' },
    trigger_enabled: false,
    status: 'paused',
    category: 'support',
    tags: ['support', 'escalation'],
    is_template: false,
    run_count: 234,
    success_count: 228,
    error_count: 6,
    success_rate: 97.4,
    last_run_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    next_run_at: null,
    workflow_actions: [
      { action_type: 'condition', position: 0, config: { field: 'response_time_hours', operator: 'greater', value: 24 } },
      { action_type: 'condition', position: 1, config: { field: 'priority', operator: 'equals', value: 'high' } },
      { action_type: 'notification', position: 2, config: { message: 'Ticket escalated', to: 'support-manager' } },
      { action_type: 'update-record', position: 3, config: { escalated: true } }
    ],
    created_at: new Date(Date.now() - 86400000 * 200).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 14).toISOString()
  }
]

export function useKaziWorkflows(options: UseKaziWorkflowsOptions = {}) {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [stats, setStats] = useState<WorkflowStats>({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalRuns: 0,
    successRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [runningWorkflows, setRunningWorkflows] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const { useMockData = false } = options

  // Fetch workflows
  const fetchWorkflows = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (options.status) params.set('status', options.status)
      if (options.category) params.set('category', options.category)

      const response = await fetch(`/api/kazi/workflows?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch workflows')
      }

      const { data } = await response.json()

      if (data && data.length > 0) {
        setWorkflows(data)
        calculateStats(data)
      } else if (useMockData) {
        setWorkflows(mockWorkflows)
        calculateStats(mockWorkflows)
      } else {
        setWorkflows([])
      }
    } catch (err) {
      console.error('Error fetching workflows:', err)
      if (useMockData) {
        setWorkflows(mockWorkflows)
        calculateStats(mockWorkflows)
      }
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [options.status, options.category, useMockData])

  // Calculate stats
  const calculateStats = (data: Workflow[]) => {
    const totalRuns = data.reduce((sum, w) => sum + w.run_count, 0)
    const totalSuccess = data.reduce((sum, w) => sum + w.success_count, 0)

    setStats({
      totalWorkflows: data.length,
      activeWorkflows: data.filter(w => w.status === 'active').length,
      totalRuns,
      successRate: totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100) : 0
    })
  }

  // Create workflow
  const createWorkflow = useCallback(async (workflow: Partial<Workflow> & { actions?: WorkflowAction[] }): Promise<Workflow | null> => {
    try {
      const response = await fetch('/api/kazi/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow)
      })

      if (!response.ok) {
        throw new Error('Failed to create workflow')
      }

      const { data } = await response.json()
      setWorkflows(prev => [data, ...prev])
      toast({
        title: 'Workflow Created',
        description: `"${data.name}" has been created successfully.`
      })
      return data
    } catch (err) {
      console.error('Error creating workflow:', err)
      toast({
        title: 'Error',
        description: 'Failed to create workflow.',
        variant: 'destructive'
      })
      return null
    }
  }, [toast])

  // Update workflow
  const updateWorkflow = useCallback(async (id: string, updates: Partial<Workflow> & { actions?: WorkflowAction[] }): Promise<Workflow | null> => {
    try {
      const response = await fetch(`/api/kazi/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Failed to update workflow')
      }

      const { data } = await response.json()
      setWorkflows(prev => prev.map(w => w.id === id ? data : w))
      toast({
        title: 'Workflow Updated',
        description: 'Changes have been saved.'
      })
      return data
    } catch (err) {
      console.error('Error updating workflow:', err)
      toast({
        title: 'Error',
        description: 'Failed to update workflow.',
        variant: 'destructive'
      })
      return null
    }
  }, [toast])

  // Delete workflow
  const deleteWorkflow = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/kazi/workflows/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete workflow')
      }

      setWorkflows(prev => prev.filter(w => w.id !== id))
      toast({
        title: 'Workflow Deleted',
        description: 'The workflow has been removed.'
      })
      return true
    } catch (err) {
      console.error('Error deleting workflow:', err)
      toast({
        title: 'Error',
        description: 'Failed to delete workflow.',
        variant: 'destructive'
      })
      return false
    }
  }, [toast])

  // Toggle workflow status
  const toggleWorkflow = useCallback(async (id: string): Promise<boolean> => {
    const workflow = workflows.find(w => w.id === id)
    if (!workflow) return false

    const newStatus = workflow.status === 'active' ? 'paused' : 'active'

    // Optimistic update
    setWorkflows(prev => prev.map(w =>
      w.id === id ? { ...w, status: newStatus } : w
    ))

    try {
      const response = await fetch(`/api/kazi/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle workflow')
      }

      toast({
        title: 'Status Updated',
        description: `Workflow is now ${newStatus}.`
      })
      return true
    } catch (err) {
      setWorkflows(prev => prev.map(w =>
        w.id === id ? { ...w, status: workflow.status } : w
      ))
      console.error('Error toggling workflow:', err)
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive'
      })
      return false
    }
  }, [workflows, toast])

  // Run workflow
  const runWorkflow = useCallback(async (id: string, input?: Record<string, unknown>): Promise<boolean> => {
    setRunningWorkflows(prev => new Set(prev).add(id))

    toast({
      title: 'Workflow Started',
      description: 'Running workflow...'
    })

    try {
      const response = await fetch(`/api/kazi/workflows/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input || {} })
      })

      if (!response.ok) {
        throw new Error('Failed to run workflow')
      }

      const result = await response.json()

      setWorkflows(prev => prev.map(w =>
        w.id === id
          ? {
            ...w,
            run_count: w.run_count + 1,
            success_count: result.success ? w.success_count + 1 : w.success_count,
            error_count: result.success ? w.error_count : w.error_count + 1,
            last_run_at: new Date().toISOString()
          }
          : w
      ))

      toast({
        title: result.success ? 'Workflow Completed' : 'Workflow Failed',
        description: result.success
          ? `Executed ${result.steps_completed} steps in ${result.duration_ms}ms`
          : 'One or more steps failed.',
        variant: result.success ? 'default' : 'destructive'
      })

      return result.success
    } catch (err) {
      console.error('Error running workflow:', err)
      toast({
        title: 'Error',
        description: 'Failed to run workflow.',
        variant: 'destructive'
      })
      return false
    } finally {
      setRunningWorkflows(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }, [toast])

  // Duplicate workflow
  const duplicateWorkflow = useCallback(async (id: string): Promise<Workflow | null> => {
    const workflow = workflows.find(w => w.id === id)
    if (!workflow) return null

    const duplicate = {
      name: `${workflow.name} (Copy)`,
      description: workflow.description,
      trigger_type: workflow.trigger_type,
      trigger_config: workflow.trigger_config,
      actions: workflow.workflow_actions?.map((a, i) => ({
        action_type: a.action_type,
        position: i,
        config: a.config,
        conditions: a.conditions
      })),
      category: workflow.category,
      tags: workflow.tags,
      status: 'draft' as const
    }

    return createWorkflow(duplicate)
  }, [workflows, createWorkflow])

  // Load workflows on mount
  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  return {
    workflows,
    stats,
    isLoading,
    error,
    runningWorkflows,
    fetchWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflow,
    runWorkflow,
    duplicateWorkflow
  }
}
