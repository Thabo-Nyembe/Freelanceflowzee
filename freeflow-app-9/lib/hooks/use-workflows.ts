'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// =====================================================
// TYPES
// =====================================================

export interface Workflow {
  id: string
  user_id: string
  workflow_code: string
  name: string
  description: string | null
  type: 'approval' | 'review' | 'processing' | 'integration' | 'notification' | 'data-sync'
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  total_steps: number
  current_step: number
  steps_config: any[]
  approvals_required: number
  approvals_received: number
  completion_rate: number
  started_at: string | null
  estimated_completion: string | null
  actual_completion: string | null
  assigned_to: string[]
  dependencies: string[]
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface WorkflowStep {
  id: string
  workflow_id: string
  name: string
  description: string | null
  step_order: number
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
  assigned_to: string[]
  completed_by: string | null
  started_at: string | null
  completed_at: string | null
  due_date: string | null
  action_type: 'approve' | 'review' | 'process' | 'notify' | 'wait' | null
  action_config: Record<string, any>
  requires_approval: boolean
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface WorkflowStats {
  total: number
  active: number
  completed: number
  draft: number
  paused: number
  failed: number
  avgCompletionRate: number
  totalSteps: number
  completedSteps: number
}

// =====================================================
// WORKFLOWS HOOK
// =====================================================

export function useWorkflows(initialWorkflows: Workflow[] = [], initialStats?: WorkflowStats) {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<WorkflowStats>(initialStats || {
    total: 0,
    active: 0,
    completed: 0,
    draft: 0,
    paused: 0,
    failed: 0,
    avgCompletionRate: 0,
    totalSteps: 0,
    completedSteps: 0
  })

  const supabase = createClient()

  // Calculate stats from workflows
  const calculateStats = useCallback((workflowsList: Workflow[]): WorkflowStats => {
    if (workflowsList.length === 0) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        draft: 0,
        paused: 0,
        failed: 0,
        avgCompletionRate: 0,
        totalSteps: 0,
        completedSteps: 0
      }
    }

    return {
      total: workflowsList.length,
      active: workflowsList.filter(w => w.status === 'active').length,
      completed: workflowsList.filter(w => w.status === 'completed').length,
      draft: workflowsList.filter(w => w.status === 'draft').length,
      paused: workflowsList.filter(w => w.status === 'paused').length,
      failed: workflowsList.filter(w => w.status === 'failed').length,
      avgCompletionRate: workflowsList.reduce((sum, w) => sum + w.completion_rate, 0) / workflowsList.length,
      totalSteps: workflowsList.reduce((sum, w) => sum + w.total_steps, 0),
      completedSteps: workflowsList.reduce((sum, w) => sum + w.current_step, 0)
    }
  }, [])

  // Fetch workflows
  const fetchWorkflows = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: fetchError } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const workflowsList = data || []
      setWorkflows(workflowsList)
      setStats(calculateStats(workflowsList))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflows')
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  // Create workflow
  const createWorkflow = useCallback(async (workflow: Partial<Workflow>) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: createError } = await supabase
        .from('workflows')
        .insert({
          ...workflow,
          user_id: user.id
        })
        .select()
        .single()

      if (createError) throw createError

      setWorkflows(prev => {
        const updated = [data, ...prev]
        setStats(calculateStats(updated))
        return updated
      })

      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create workflow'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  // Update workflow
  const updateWorkflow = useCallback(async (id: string, updates: Partial<Workflow>) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase
        .from('workflows')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setWorkflows(prev => {
        const updated = prev.map(w => w.id === id ? data : w)
        setStats(calculateStats(updated))
        return updated
      })

      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update workflow'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  // Delete workflow (soft delete)
  const deleteWorkflow = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('workflows')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (deleteError) throw deleteError

      setWorkflows(prev => {
        const updated = prev.filter(w => w.id !== id)
        setStats(calculateStats(updated))
        return updated
      })

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete workflow'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  // Start workflow
  const startWorkflow = useCallback(async (id: string) => {
    return updateWorkflow(id, {
      status: 'active',
      started_at: new Date().toISOString()
    })
  }, [updateWorkflow])

  // Pause workflow
  const pauseWorkflow = useCallback(async (id: string) => {
    return updateWorkflow(id, { status: 'paused' })
  }, [updateWorkflow])

  // Resume workflow
  const resumeWorkflow = useCallback(async (id: string) => {
    return updateWorkflow(id, { status: 'active' })
  }, [updateWorkflow])

  // Archive workflow
  const archiveWorkflow = useCallback(async (id: string) => {
    return updateWorkflow(id, { status: 'archived' })
  }, [updateWorkflow])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('workflows-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workflows' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setWorkflows(prev => {
              const updated = [payload.new as Workflow, ...prev]
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setWorkflows(prev => {
              const updated = prev.map(w => w.id === payload.new.id ? payload.new as Workflow : w)
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setWorkflows(prev => {
              const updated = prev.filter(w => w.id !== payload.old.id)
              setStats(calculateStats(updated))
              return updated
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, calculateStats])

  return {
    workflows,
    loading,
    error,
    stats,
    fetchWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    startWorkflow,
    pauseWorkflow,
    resumeWorkflow,
    archiveWorkflow
  }
}

// =====================================================
// WORKFLOW STEPS HOOK
// =====================================================

export function useWorkflowSteps(workflowId: string, initialSteps: WorkflowStep[] = []) {
  const [steps, setSteps] = useState<WorkflowStep[]>(initialSteps)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch steps
  const fetchSteps = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_order', { ascending: true })

      if (fetchError) throw fetchError

      setSteps(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch steps')
    } finally {
      setLoading(false)
    }
  }, [supabase, workflowId])

  // Add step
  const addStep = useCallback(async (step: Partial<WorkflowStep>) => {
    setLoading(true)
    setError(null)

    try {
      const maxOrder = steps.length > 0 ? Math.max(...steps.map(s => s.step_order)) : 0

      const { data, error: createError } = await supabase
        .from('workflow_steps')
        .insert({
          ...step,
          workflow_id: workflowId,
          step_order: step.step_order ?? maxOrder + 1
        })
        .select()
        .single()

      if (createError) throw createError

      setSteps(prev => [...prev, data].sort((a, b) => a.step_order - b.step_order))
      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add step'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase, workflowId, steps])

  // Update step
  const updateStep = useCallback(async (id: string, updates: Partial<WorkflowStep>) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase
        .from('workflow_steps')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setSteps(prev => prev.map(s => s.id === id ? data : s))
      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update step'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Delete step
  const deleteStep = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('workflow_steps')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setSteps(prev => prev.filter(s => s.id !== id))
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete step'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Complete step
  const completeStep = useCallback(async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()

    return updateStep(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by: user?.id
    })
  }, [supabase, updateStep])

  // Start step
  const startStep = useCallback(async (id: string) => {
    return updateStep(id, {
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
  }, [updateStep])

  // Approve step
  const approveStep = useCallback(async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()

    return updateStep(id, {
      approved_at: new Date().toISOString(),
      approved_by: user?.id
    })
  }, [supabase, updateStep])

  // Skip step
  const skipStep = useCallback(async (id: string) => {
    return updateStep(id, { status: 'skipped' })
  }, [updateStep])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`workflow-steps-${workflowId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workflow_steps', filter: `workflow_id=eq.${workflowId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSteps(prev => [...prev, payload.new as WorkflowStep].sort((a, b) => a.step_order - b.step_order))
          } else if (payload.eventType === 'UPDATE') {
            setSteps(prev => prev.map(s => s.id === payload.new.id ? payload.new as WorkflowStep : s))
          } else if (payload.eventType === 'DELETE') {
            setSteps(prev => prev.filter(s => s.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, workflowId])

  return {
    steps,
    loading,
    error,
    fetchSteps,
    addStep,
    updateStep,
    deleteStep,
    completeStep,
    startStep,
    approveStep,
    skipStep
  }
}
