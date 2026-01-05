'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type NodeType = 'trigger' | 'action' | 'condition' | 'delay' | 'loop' | 'transform' | 'integration'
export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'error' | 'archived'
export type TriggerType = 'manual' | 'scheduled' | 'webhook' | 'event' | 'form_submission' | 'email_received'

export interface Workflow {
  id: string
  name: string
  description?: string
  status: WorkflowStatus
  trigger: WorkflowTrigger
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  variables: WorkflowVariable[]
  createdAt: string
  updatedAt: string
  lastRunAt?: string
  runCount: number
  successCount: number
  failureCount: number
  version: number
}

export interface WorkflowTrigger {
  type: TriggerType
  config: Record<string, any>
}

export interface WorkflowNode {
  id: string
  type: NodeType
  name: string
  description?: string
  position: { x: number; y: number }
  config: Record<string, any>
  inputs: NodePort[]
  outputs: NodePort[]
}

export interface NodePort {
  id: string
  name: string
  type: 'data' | 'control'
  dataType?: string
}

export interface WorkflowEdge {
  id: string
  source: string
  sourcePort: string
  target: string
  targetPort: string
  condition?: string
}

export interface WorkflowVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  defaultValue?: any
  description?: string
}

export interface WorkflowRun {
  id: string
  workflowId: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: string
  completedAt?: string
  duration?: number
  nodeExecutions: NodeExecution[]
  input?: Record<string, any>
  output?: Record<string, any>
  error?: string
}

export interface NodeExecution {
  nodeId: string
  nodeName: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  startedAt?: string
  completedAt?: string
  input?: Record<string, any>
  output?: Record<string, any>
  error?: string
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'runCount' | 'successCount' | 'failureCount' | 'version'>
  usageCount: number
}

export interface NodeTemplate {
  type: NodeType
  name: string
  description: string
  icon: string
  category: string
  defaultConfig: Record<string, any>
  inputs: NodePort[]
  outputs: NodePort[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockNodeTemplates: NodeTemplate[] = [
  { type: 'trigger', name: 'Manual Trigger', description: 'Start workflow manually', icon: 'play', category: 'Triggers', defaultConfig: {}, inputs: [], outputs: [{ id: 'out', name: 'output', type: 'control' }] },
  { type: 'trigger', name: 'Schedule Trigger', description: 'Run on a schedule', icon: 'clock', category: 'Triggers', defaultConfig: { cron: '0 9 * * *' }, inputs: [], outputs: [{ id: 'out', name: 'output', type: 'control' }] },
  { type: 'trigger', name: 'Webhook Trigger', description: 'Receive webhook calls', icon: 'webhook', category: 'Triggers', defaultConfig: { method: 'POST' }, inputs: [], outputs: [{ id: 'out', name: 'output', type: 'control' }, { id: 'data', name: 'data', type: 'data' }] },
  { type: 'action', name: 'Send Email', description: 'Send an email', icon: 'mail', category: 'Actions', defaultConfig: { to: '', subject: '', body: '' }, inputs: [{ id: 'in', name: 'input', type: 'control' }], outputs: [{ id: 'out', name: 'output', type: 'control' }] },
  { type: 'action', name: 'HTTP Request', description: 'Make HTTP request', icon: 'globe', category: 'Actions', defaultConfig: { method: 'GET', url: '' }, inputs: [{ id: 'in', name: 'input', type: 'control' }], outputs: [{ id: 'out', name: 'output', type: 'control' }, { id: 'response', name: 'response', type: 'data' }] },
  { type: 'action', name: 'Create Task', description: 'Create a new task', icon: 'check-square', category: 'Actions', defaultConfig: { title: '', assignee: '' }, inputs: [{ id: 'in', name: 'input', type: 'control' }], outputs: [{ id: 'out', name: 'output', type: 'control' }] },
  { type: 'condition', name: 'If/Else', description: 'Branch based on condition', icon: 'git-branch', category: 'Logic', defaultConfig: { condition: '' }, inputs: [{ id: 'in', name: 'input', type: 'control' }], outputs: [{ id: 'true', name: 'true', type: 'control' }, { id: 'false', name: 'false', type: 'control' }] },
  { type: 'delay', name: 'Wait', description: 'Pause execution', icon: 'pause', category: 'Logic', defaultConfig: { duration: 60, unit: 'seconds' }, inputs: [{ id: 'in', name: 'input', type: 'control' }], outputs: [{ id: 'out', name: 'output', type: 'control' }] },
  { type: 'transform', name: 'Set Variable', description: 'Set workflow variable', icon: 'variable', category: 'Data', defaultConfig: { variable: '', value: '' }, inputs: [{ id: 'in', name: 'input', type: 'control' }], outputs: [{ id: 'out', name: 'output', type: 'control' }] },
  { type: 'integration', name: 'Slack Message', description: 'Send Slack message', icon: 'slack', category: 'Integrations', defaultConfig: { channel: '', message: '' }, inputs: [{ id: 'in', name: 'input', type: 'control' }], outputs: [{ id: 'out', name: 'output', type: 'control' }] }
]

const mockWorkflows: Workflow[] = [
  {
    id: 'wf-1', name: 'New Client Onboarding', description: 'Automated onboarding for new clients', status: 'active',
    trigger: { type: 'event', config: { event: 'client.created' } },
    nodes: [
      { id: 'n1', type: 'action', name: 'Send Welcome Email', position: { x: 100, y: 100 }, config: { template: 'welcome' }, inputs: [{ id: 'in', name: 'input', type: 'control' }], outputs: [{ id: 'out', name: 'output', type: 'control' }] },
      { id: 'n2', type: 'action', name: 'Create Project', position: { x: 300, y: 100 }, config: { template: 'onboarding' }, inputs: [{ id: 'in', name: 'input', type: 'control' }], outputs: [{ id: 'out', name: 'output', type: 'control' }] },
      { id: 'n3', type: 'integration', name: 'Notify Team', position: { x: 500, y: 100 }, config: { channel: '#new-clients' }, inputs: [{ id: 'in', name: 'input', type: 'control' }], outputs: [{ id: 'out', name: 'output', type: 'control' }] }
    ],
    edges: [
      { id: 'e1', source: 'trigger', sourcePort: 'out', target: 'n1', targetPort: 'in' },
      { id: 'e2', source: 'n1', sourcePort: 'out', target: 'n2', targetPort: 'in' },
      { id: 'e3', source: 'n2', sourcePort: 'out', target: 'n3', targetPort: 'in' }
    ],
    variables: [],
    createdAt: '2024-02-01', updatedAt: '2024-03-15', lastRunAt: '2024-03-20T10:00:00Z',
    runCount: 45, successCount: 43, failureCount: 2, version: 3
  },
  {
    id: 'wf-2', name: 'Invoice Follow-up', description: 'Send reminders for overdue invoices', status: 'active',
    trigger: { type: 'scheduled', config: { cron: '0 9 * * 1' } },
    nodes: [
      { id: 'n1', type: 'action', name: 'Check Overdue', position: { x: 100, y: 100 }, config: { days: 30 }, inputs: [{ id: 'in', name: 'input', type: 'control' }], outputs: [{ id: 'out', name: 'output', type: 'control' }] },
      { id: 'n2', type: 'condition', name: 'Has Overdue?', position: { x: 300, y: 100 }, config: { condition: 'count > 0' }, inputs: [{ id: 'in', name: 'input', type: 'control' }], outputs: [{ id: 'true', name: 'true', type: 'control' }, { id: 'false', name: 'false', type: 'control' }] },
      { id: 'n3', type: 'loop', name: 'For Each Invoice', position: { x: 500, y: 50 }, config: {}, inputs: [{ id: 'in', name: 'input', type: 'control' }], outputs: [{ id: 'out', name: 'output', type: 'control' }] }
    ],
    edges: [
      { id: 'e1', source: 'trigger', sourcePort: 'out', target: 'n1', targetPort: 'in' },
      { id: 'e2', source: 'n1', sourcePort: 'out', target: 'n2', targetPort: 'in' },
      { id: 'e3', source: 'n2', sourcePort: 'true', target: 'n3', targetPort: 'in' }
    ],
    variables: [],
    createdAt: '2024-01-15', updatedAt: '2024-03-10', lastRunAt: '2024-03-18T09:00:00Z',
    runCount: 12, successCount: 12, failureCount: 0, version: 2
  }
]

const mockWorkflowRuns: WorkflowRun[] = [
  {
    id: 'run-1', workflowId: 'wf-1', status: 'completed', startedAt: '2024-03-20T10:00:00Z', completedAt: '2024-03-20T10:00:15Z', duration: 15,
    nodeExecutions: [
      { nodeId: 'n1', nodeName: 'Send Welcome Email', status: 'completed', startedAt: '2024-03-20T10:00:01Z', completedAt: '2024-03-20T10:00:05Z' },
      { nodeId: 'n2', nodeName: 'Create Project', status: 'completed', startedAt: '2024-03-20T10:00:06Z', completedAt: '2024-03-20T10:00:10Z' },
      { nodeId: 'n3', nodeName: 'Notify Team', status: 'completed', startedAt: '2024-03-20T10:00:11Z', completedAt: '2024-03-20T10:00:15Z' }
    ]
  }
]

const mockWorkflowTemplates: WorkflowTemplate[] = [
  { id: 'tpl-1', name: 'Client Onboarding', description: 'Automate new client setup', category: 'Sales', thumbnail: '/templates/onboarding.png', workflow: mockWorkflows[0], usageCount: 1250 },
  { id: 'tpl-2', name: 'Invoice Reminder', description: 'Follow up on overdue invoices', category: 'Finance', thumbnail: '/templates/invoice.png', workflow: mockWorkflows[1], usageCount: 890 }
]

// ============================================================================
// HOOK
// ============================================================================

interface UseWorkflowBuilderOptions {
  
  workflowId?: string
}

export function useWorkflowBuilder(options: UseWorkflowBuilderOptions = {}) {
  const {  workflowId } = options

  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null)
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([])
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([])
  const [nodeTemplates, setNodeTemplates] = useState<NodeTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchWorkflows = useCallback(async () => {
    try {
      const response = await fetch('/api/workflows')
      const result = await response.json()
      if (result.success) {
        setWorkflows(Array.isArray(result.workflows) ? result.workflows : [])
        setTemplates(Array.isArray(result.templates) ? result.templates : [])
        setNodeTemplates(mockNodeTemplates)
        return result.workflows
      }
      setWorkflows([])
      setTemplates(mockWorkflowTemplates)
      setNodeTemplates(mockNodeTemplates)
      return []
    } catch (err) {
      setWorkflows([])
      setTemplates(mockWorkflowTemplates)
      setNodeTemplates(mockNodeTemplates)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ workflowId])

  const createWorkflow = useCallback(async (data: { name: string; description?: string; templateId?: string }) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        await fetchWorkflows()
        return { success: true, workflow: result.workflow }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newWorkflow: Workflow = {
        id: `wf-${Date.now()}`, name: data.name, description: data.description, status: 'draft',
        trigger: { type: 'manual', config: {} }, nodes: [], edges: [], variables: [],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        runCount: 0, successCount: 0, failureCount: 0, version: 1
      }
      setWorkflows(prev => [newWorkflow, ...prev])
      setCurrentWorkflow(newWorkflow)
      return { success: true, workflow: newWorkflow }
    }
  }, [fetchWorkflows])

  const updateWorkflow = useCallback(async (workflowId: string, updates: Partial<Workflow>) => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, ...updates, updatedAt: new Date().toISOString(), version: w.version + 1 } : w))
        if (currentWorkflow?.id === workflowId) {
          setCurrentWorkflow(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : prev)
        }
      }
      return result
    } catch (err) {
      setWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, ...updates } : w))
      if (currentWorkflow?.id === workflowId) {
        setCurrentWorkflow(prev => prev ? { ...prev, ...updates } : prev)
      }
      return { success: true }
    } finally {
      setIsSaving(false)
    }
  }, [currentWorkflow])

  const deleteWorkflow = useCallback(async (workflowId: string) => {
    try {
      await fetch(`/api/workflows/${workflowId}`, { method: 'DELETE' })
      setWorkflows(prev => prev.filter(w => w.id !== workflowId))
      if (currentWorkflow?.id === workflowId) setCurrentWorkflow(null)
      return { success: true }
    } catch (err) {
      setWorkflows(prev => prev.filter(w => w.id !== workflowId))
      return { success: true }
    }
  }, [currentWorkflow])

  const duplicateWorkflow = useCallback(async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId)
    if (workflow) {
      const newWorkflow: Workflow = {
        ...workflow,
        id: `wf-${Date.now()}`,
        name: `${workflow.name} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        runCount: 0, successCount: 0, failureCount: 0, version: 1
      }
      setWorkflows(prev => [newWorkflow, ...prev])
      return { success: true, workflow: newWorkflow }
    }
    return { success: false, error: 'Workflow not found' }
  }, [workflows])

  const addNode = useCallback((node: Omit<WorkflowNode, 'id'>) => {
    if (!currentWorkflow) return
    const newNode: WorkflowNode = { ...node, id: `n-${Date.now()}` }
    setCurrentWorkflow(prev => prev ? { ...prev, nodes: [...prev.nodes, newNode] } : prev)
  }, [currentWorkflow])

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    if (!currentWorkflow) return
    setCurrentWorkflow(prev => prev ? {
      ...prev,
      nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n)
    } : prev)
  }, [currentWorkflow])

  const deleteNode = useCallback((nodeId: string) => {
    if (!currentWorkflow) return
    setCurrentWorkflow(prev => prev ? {
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      edges: prev.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    } : prev)
  }, [currentWorkflow])

  const addEdge = useCallback((edge: Omit<WorkflowEdge, 'id'>) => {
    if (!currentWorkflow) return
    const newEdge: WorkflowEdge = { ...edge, id: `e-${Date.now()}` }
    setCurrentWorkflow(prev => prev ? { ...prev, edges: [...prev.edges, newEdge] } : prev)
  }, [currentWorkflow])

  const deleteEdge = useCallback((edgeId: string) => {
    if (!currentWorkflow) return
    setCurrentWorkflow(prev => prev ? {
      ...prev,
      edges: prev.edges.filter(e => e.id !== edgeId)
    } : prev)
  }, [currentWorkflow])

  const runWorkflow = useCallback(async (workflowId: string, input?: Record<string, any>) => {
    setIsRunning(true)
    try {
      const response = await fetch(`/api/workflows/${workflowId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      })
      const result = await response.json()
      if (result.success) {
        setWorkflowRuns(prev => [result.run, ...prev])
        setWorkflows(prev => prev.map(w =>
          w.id === workflowId ? { ...w, runCount: w.runCount + 1, lastRunAt: new Date().toISOString() } : w
        ))
      }
      return result
    } catch (err) {
      const newRun: WorkflowRun = {
        id: `run-${Date.now()}`, workflowId, status: 'completed',
        startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
        duration: 5, nodeExecutions: [], input
      }
      setWorkflowRuns(prev => [newRun, ...prev])
      return { success: true, run: newRun }
    } finally {
      setIsRunning(false)
    }
  }, [])

  const cancelRun = useCallback(async (runId: string) => {
    try {
      await fetch(`/api/workflows/runs/${runId}/cancel`, { method: 'POST' })
      setWorkflowRuns(prev => prev.map(r =>
        r.id === runId ? { ...r, status: 'cancelled' as const } : r
      ))
      return { success: true }
    } catch (err) {
      setWorkflowRuns(prev => prev.map(r =>
        r.id === runId ? { ...r, status: 'cancelled' as const } : r
      ))
      return { success: true }
    }
  }, [])

  const toggleWorkflow = useCallback(async (workflowId: string, status: 'active' | 'paused') => {
    try {
      await fetch(`/api/workflows/${workflowId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      setWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, status } : w))
      if (currentWorkflow?.id === workflowId) {
        setCurrentWorkflow(prev => prev ? { ...prev, status } : prev)
      }
      return { success: true }
    } catch (err) {
      setWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, status } : w))
      return { success: true }
    }
  }, [currentWorkflow])

  const saveWorkflow = useCallback(async () => {
    if (!currentWorkflow) return { success: false, error: 'No workflow loaded' }
    return updateWorkflow(currentWorkflow.id, {
      nodes: currentWorkflow.nodes,
      edges: currentWorkflow.edges,
      variables: currentWorkflow.variables,
      trigger: currentWorkflow.trigger
    })
  }, [currentWorkflow, updateWorkflow])

  const loadWorkflow = useCallback(async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`)
      const result = await response.json()
      if (result.success) {
        setCurrentWorkflow(result.workflow)
        const runsResponse = await fetch(`/api/workflows/${workflowId}/runs`)
        const runsResult = await runsResponse.json()
        if (runsResult.success) setWorkflowRuns(runsResult.runs || [])
      } else {
        const wf = workflows.find(w => w.id === workflowId)
        setCurrentWorkflow(wf || null)
      }
      return { success: true }
    } catch (err) {
      const wf = workflows.find(w => w.id === workflowId)
      setCurrentWorkflow(wf || null)
      setWorkflowRuns(mockWorkflowRuns.filter(r => r.workflowId === workflowId))
      return { success: true }
    }
  }, [workflows])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchWorkflows()
  }, [fetchWorkflows])

  useEffect(() => { refresh() }, [refresh])

  const activeWorkflows = useMemo(() => workflows.filter(w => w.status === 'active'), [workflows])
  const draftWorkflows = useMemo(() => workflows.filter(w => w.status === 'draft'), [workflows])
  const recentRuns = useMemo(() => [...workflowRuns].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()).slice(0, 10), [workflowRuns])
  const nodeCategories = useMemo(() => [...new Set(nodeTemplates.map(n => n.category))], [nodeTemplates])

  return {
    workflows, currentWorkflow, workflowRuns, templates, nodeTemplates,
    activeWorkflows, draftWorkflows, recentRuns, nodeCategories,
    isLoading, isSaving, isRunning, error,
    refresh, createWorkflow, updateWorkflow, deleteWorkflow, duplicateWorkflow,
    addNode, updateNode, deleteNode, addEdge, deleteEdge,
    runWorkflow, cancelRun, toggleWorkflow, saveWorkflow, loadWorkflow,
    setCurrentWorkflow
  }
}

export default useWorkflowBuilder
