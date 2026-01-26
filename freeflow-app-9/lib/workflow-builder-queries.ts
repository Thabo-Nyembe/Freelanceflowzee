/**
 * Workflow Builder Query Library
 *
 * Visual workflow builder interface queries.
 * This module provides builder-specific helpers that extend the core automation system.
 *
 * Architecture:
 * - Feature #86 (Automation): Core backend system (workflows, actions, executions, templates)
 * - Feature #87 (Workflow Builder): Visual UI interface for creating/editing workflows
 *
 * Database: Uses automation system tables (workflows, workflow_actions, workflow_templates, etc.)
 */

import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'
import type {
  Workflow,
  WorkflowAction,
  WorkflowTemplate,
  TriggerType,
  ActionType,
  WorkflowStatus
} from './automation-types'

// ============================================================================
// BUILDER-SPECIFIC TYPES
// ============================================================================

/**
 * Condition for workflow action branching
 */
export interface ActionCondition {
  field: string
  operator: string
  value: JsonValue
}

/**
 * Test execution step result
 */
export interface TestExecutionStep {
  action: string
  status: 'success' | 'failed'
  output?: Record<string, JsonValue>
  error?: string
}

// Re-export core automation queries for convenience
export {
  getWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  toggleWorkflowStatus,
  getWorkflowTemplates,
  createWorkflowFromTemplate,
  getAutomationMetrics,
  exportWorkflow
} from './automation-queries'

// ============================================================================
// BUILDER-SPECIFIC QUERIES
// ============================================================================

/**
 * Get workflow builder dashboard stats
 */
export async function getBuilderStats(): Promise<{
  activeWorkflows: number
  totalRuns: number
  timeSaved: number
  successRate: number
}> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: workflows } = await supabase
    .from('workflows')
    .select('status, run_count, success_rate')
    .eq('user_id', user.id)

  if (!workflows) {
    return {
      activeWorkflows: 0,
      totalRuns: 0,
      timeSaved: 0,
      successRate: 0
    }
  }

  const activeWorkflows = workflows.filter(w => w.status === 'active').length
  const totalRuns = workflows.reduce((sum, w) => sum + (w.run_count || 0), 0)
  const avgSuccessRate = workflows.length > 0
    ? workflows.reduce((sum, w) => sum + (w.success_rate || 0), 0) / workflows.length
    : 0

  // Estimate time saved: each successful run saves ~5 minutes
  const timeSaved = Math.round(totalRuns * 5 / 60) // hours

  return {
    activeWorkflows,
    totalRuns,
    timeSaved,
    successRate: Math.round(avgSuccessRate)
  }
}

/**
 * Get workflows for builder list view
 */
export async function getWorkflowsForBuilder(filters?: {
  search?: string
  status?: WorkflowStatus
  category?: string
}): Promise<Array<Workflow & { actionCount: number }>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('workflows')
    .select('*, workflow_actions(count)')
    .eq('user_id', user.id)

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  query = query.order('updated_at', { ascending: false })

  const { data, error } = await query

  if (error) throw error

  return (data || []).map(workflow => ({
    ...workflow,
    actionCount: workflow.workflow_actions?.[0]?.count || 0
  }))
}

/**
 * Get templates for builder with filtering
 */
export async function getTemplatesForBuilder(filters?: {
  search?: string
  category?: string
  complexity?: 'simple' | 'moderate' | 'advanced'
}): Promise<WorkflowTemplate[]> {
  const supabase = createClient()

  let query = supabase
    .from('workflow_templates')
    .select('*')
    .eq('is_verified', true)
    .order('usage_count', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) throw error

  // Filter by complexity if specified (complexity stored in tags)
  if (filters?.complexity && data) {
    return data.filter(t => t.tags?.includes(filters.complexity!))
  }

  return data || []
}

/**
 * Save workflow draft (auto-save)
 */
export async function saveWorkflowDraft(
  workflowId: string | null,
  data: {
    name: string
    description?: string
    trigger_type: TriggerType
    trigger_config: Record<string, JsonValue>
    category?: string
  }
): Promise<string> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  if (workflowId) {
    // Update existing draft
    const { error } = await supabase
      .from('workflows')
      .update({
        ...data,
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', workflowId)
      .eq('user_id', user.id)

    if (error) throw error
    return workflowId
  } else {
    // Create new draft
    const { data: workflow, error } = await supabase
      .from('workflows')
      .insert({
        ...data,
        user_id: user.id,
        status: 'draft',
        trigger_enabled: true
      })
      .select()
      .single()

    if (error) throw error
    return workflow.id
  }
}

/**
 * Add action to workflow
 */
export async function addWorkflowAction(
  workflowId: string,
  action: {
    action_type: ActionType
    position: number
    config: Record<string, JsonValue>
    conditions?: ActionCondition[]
  }
): Promise<WorkflowAction> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workflow_actions')
    .insert({
      workflow_id: workflowId,
      ...action
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update action in workflow
 */
export async function updateWorkflowAction(
  actionId: string,
  updates: {
    position?: number
    config?: Record<string, JsonValue>
    conditions?: ActionCondition[]
    on_success_action_id?: string | null
    on_failure_action_id?: string | null
  }
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('workflow_actions')
    .update(updates)
    .eq('id', actionId)

  if (error) throw error
}

/**
 * Delete action from workflow
 */
export async function deleteWorkflowAction(actionId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('workflow_actions')
    .delete()
    .eq('id', actionId)

  if (error) throw error
}

/**
 * Reorder workflow actions
 */
export async function reorderWorkflowActions(
  workflowId: string,
  actionIds: string[]
): Promise<void> {
  const supabase = createClient()

  // Update positions in order
  const updates = actionIds.map((id, index) =>
    supabase
      .from('workflow_actions')
      .update({ position: index })
      .eq('id', id)
      .eq('workflow_id', workflowId)
  )

  await Promise.all(updates)
}

/**
 * Validate workflow before activation
 */
export async function validateWorkflow(workflowId: string): Promise<{
  isValid: boolean
  errors: string[]
  warnings: string[]
}> {
  const supabase = createClient()

  // Get workflow with actions
  const [workflowResult, actionsResult] = await Promise.all([
    supabase.from('workflows').select('*').eq('id', workflowId).single(),
    supabase.from('workflow_actions').select('*').eq('workflow_id', workflowId).order('position')
  ])

  if (workflowResult.error) throw workflowResult.error

  const workflow = workflowResult.data
  const actions = actionsResult.data || []

  const errors: string[] = []
  const warnings: string[] = []

  // Basic validations
  if (!workflow.name || workflow.name.trim() === '') {
    errors.push('Workflow name is required')
  }

  if (!workflow.trigger_type) {
    errors.push('Trigger type is required')
  }

  if (actions.length === 0) {
    errors.push('At least one action is required')
  }

  // Validate trigger config
  if (!workflow.trigger_config || Object.keys(workflow.trigger_config).length === 0) {
    errors.push('Trigger configuration is incomplete')
  }

  // Validate actions
  actions.forEach((action, index) => {
    if (!action.config || Object.keys(action.config).length === 0) {
      errors.push(`Action ${index + 1} configuration is incomplete`)
    }

    // Warn about missing error handling
    if (!action.on_failure_action_id && index < actions.length - 1) {
      warnings.push(`Action ${index + 1} has no failure handler`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Activate workflow (publish)
 */
export async function activateWorkflow(workflowId: string): Promise<void> {
  const supabase = createClient()

  // First validate
  const validation = await validateWorkflow(workflowId)
  if (!validation.isValid) {
    throw new Error(`Cannot activate: ${validation.errors.join(', ')}`)
  }

  // Update status to active
  const { error } = await supabase
    .from('workflows')
    .update({
      status: 'active',
      trigger_enabled: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', workflowId)

  if (error) throw error
}

/**
 * Pause workflow
 */
export async function pauseWorkflow(workflowId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('workflows')
    .update({
      status: 'paused',
      trigger_enabled: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', workflowId)

  if (error) throw error
}

/**
 * Test workflow execution (dry run)
 */
export async function testWorkflow(
  workflowId: string,
  testInput?: Record<string, JsonValue>
): Promise<{
  success: boolean
  steps: TestExecutionStep[]
}> {
  const supabase = createClient()

  // Get workflow actions
  const { data: actions } = await supabase
    .from('workflow_actions')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('position')

  if (!actions || actions.length === 0) {
    return {
      success: false,
      steps: []
    }
  }

  // Simulate execution
  const steps = actions.map(action => ({
    action: action.action_type,
    status: 'success' as const,
    output: { simulated: true, action_type: action.action_type }
  }))

  return {
    success: true,
    steps
  }
}

/**
 * Clone workflow as template
 */
export async function saveAsTemplate(
  workflowId: string,
  templateData: {
    name: string
    description: string
    category: string
    icon?: string
    tags?: string[]
  }
): Promise<string> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Get workflow with actions
  const [workflowResult, actionsResult] = await Promise.all([
    supabase.from('workflows').select('*').eq('id', workflowId).single(),
    supabase.from('workflow_actions').select('*').eq('workflow_id', workflowId).order('position')
  ])

  if (workflowResult.error) throw workflowResult.error

  const workflow = workflowResult.data
  const actions = actionsResult.data || []

  // Create template
  const { data: template, error } = await supabase
    .from('workflow_templates')
    .insert({
      ...templateData,
      trigger_type: workflow.trigger_type,
      trigger_config: workflow.trigger_config,
      actions: actions.map(a => ({
        action_type: a.action_type,
        position: a.position,
        config: a.config,
        conditions: a.conditions
      })),
      created_by: user.id,
      is_verified: false
    })
    .select()
    .single()

  if (error) throw error
  return template.id
}

/**
 * Get workflow execution history for builder
 */
export async function getWorkflowHistory(
  workflowId: string,
  limit: number = 20
): Promise<Array<{
  id: string
  started_at: string
  completed_at: string | null
  status: string
  duration_ms: number | null
  steps_completed: number
  steps_total: number
  error_message: string | null
}>> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workflow_executions')
    .select('id, started_at, completed_at, status, duration_ms, steps_completed, steps_total, error_message')
    .eq('workflow_id', workflowId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Get available trigger types with metadata
 */
export function getTriggerTypes(): Array<{
  type: TriggerType
  label: string
  description: string
  icon: string
  configFields: Array<{
    name: string
    label: string
    type: 'text' | 'number' | 'select' | 'datetime'
    required: boolean
    options?: string[]
  }>
}> {
  return [
    {
      type: 'schedule',
      label: 'Schedule',
      description: 'Run on a recurring schedule (cron)',
      icon: 'Calendar',
      configFields: [
        { name: 'cron', label: 'Cron Expression', type: 'text', required: true },
        { name: 'timezone', label: 'Timezone', type: 'select', required: true, options: ['UTC', 'America/New_York', 'Europe/London'] }
      ]
    },
    {
      type: 'event',
      label: 'Event',
      description: 'Triggered by system events',
      icon: 'Bell',
      configFields: [
        { name: 'event_type', label: 'Event Type', type: 'select', required: true, options: ['project.created', 'invoice.paid', 'client.added'] }
      ]
    },
    {
      type: 'webhook',
      label: 'Webhook',
      description: 'Triggered by external HTTP requests',
      icon: 'GitBranch',
      configFields: [
        { name: 'method', label: 'HTTP Method', type: 'select', required: true, options: ['POST', 'GET', 'PUT'] },
        { name: 'secret', label: 'Secret Key', type: 'text', required: false }
      ]
    },
    {
      type: 'manual',
      label: 'Manual',
      description: 'Run manually on demand',
      icon: 'Play',
      configFields: []
    },
    {
      type: 'form-submit',
      label: 'Form Submit',
      description: 'Triggered when a form is submitted',
      icon: 'FileText',
      configFields: [
        { name: 'form_id', label: 'Form ID', type: 'text', required: true }
      ]
    },
    {
      type: 'record-change',
      label: 'Record Change',
      description: 'Triggered when a database record changes',
      icon: 'Target',
      configFields: [
        { name: 'table', label: 'Table Name', type: 'text', required: true },
        { name: 'operation', label: 'Operation', type: 'select', required: true, options: ['INSERT', 'UPDATE', 'DELETE'] }
      ]
    }
  ]
}

/**
 * Get available action types with metadata
 */
export function getActionTypes(): Array<{
  type: ActionType
  label: string
  description: string
  icon: string
  category: string
  configFields: Array<{
    name: string
    label: string
    type: 'text' | 'textarea' | 'select' | 'number'
    required: boolean
    options?: string[]
  }>
}> {
  return [
    {
      type: 'email',
      label: 'Send Email',
      description: 'Send an email to recipients',
      icon: 'Mail',
      category: 'communication',
      configFields: [
        { name: 'to', label: 'To', type: 'text', required: true },
        { name: 'subject', label: 'Subject', type: 'text', required: true },
        { name: 'body', label: 'Body', type: 'textarea', required: true }
      ]
    },
    {
      type: 'notification',
      label: 'Send Notification',
      description: 'Send in-app notification',
      icon: 'Bell',
      category: 'communication',
      configFields: [
        { name: 'user_id', label: 'User ID', type: 'text', required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: true }
      ]
    },
    {
      type: 'create-task',
      label: 'Create Task',
      description: 'Create a new task',
      icon: 'CheckCircle2',
      category: 'project-management',
      configFields: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: false },
        { name: 'due_date', label: 'Due Date', type: 'text', required: false }
      ]
    },
    {
      type: 'update-record',
      label: 'Update Record',
      description: 'Update a database record',
      icon: 'Edit3',
      category: 'data',
      configFields: [
        { name: 'table', label: 'Table', type: 'text', required: true },
        { name: 'record_id', label: 'Record ID', type: 'text', required: true },
        { name: 'fields', label: 'Fields (JSON)', type: 'textarea', required: true }
      ]
    },
    {
      type: 'api-call',
      label: 'API Call',
      description: 'Make an HTTP API request',
      icon: 'GitBranch',
      category: 'integration',
      configFields: [
        { name: 'url', label: 'URL', type: 'text', required: true },
        { name: 'method', label: 'Method', type: 'select', required: true, options: ['GET', 'POST', 'PUT', 'DELETE'] },
        { name: 'headers', label: 'Headers (JSON)', type: 'textarea', required: false },
        { name: 'body', label: 'Body (JSON)', type: 'textarea', required: false }
      ]
    },
    {
      type: 'delay',
      label: 'Delay',
      description: 'Wait for a period of time',
      icon: 'Clock',
      category: 'control',
      configFields: [
        { name: 'duration', label: 'Duration (seconds)', type: 'number', required: true }
      ]
    },
    {
      type: 'condition',
      label: 'Condition',
      description: 'Conditional branching',
      icon: 'GitBranch',
      category: 'control',
      configFields: [
        { name: 'field', label: 'Field', type: 'text', required: true },
        { name: 'operator', label: 'Operator', type: 'select', required: true, options: ['equals', 'not-equals', 'contains', 'greater', 'less'] },
        { name: 'value', label: 'Value', type: 'text', required: true }
      ]
    }
  ]
}
