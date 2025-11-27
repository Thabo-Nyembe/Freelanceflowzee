/**
 * Workflow Automation Query Library
 *
 * Complete workflow management system with:
 * - Visual workflow builder
 * - Trigger configuration
 * - Action execution
 * - Execution tracking
 * - Template management
 */

import { createClient } from '@/lib/supabase/client'
import type {
  Workflow,
  WorkflowAction,
  WorkflowExecution,
  ExecutionStep,
  WorkflowTemplate,
  AutomationMetrics,
  TriggerType,
  ActionType,
  WorkflowStatus,
  ExecutionStatus,
  ConditionOperator,
  WorkflowCategory
} from './automation-types'

// ============================================================================
// WORKFLOW MANAGEMENT MODULE
// ============================================================================

/**
 * Get user's workflows
 */
export async function getWorkflows(
  filters?: {
    status?: WorkflowStatus
    trigger_type?: TriggerType
    category?: WorkflowCategory
  },
  sortBy: 'recent' | 'name' | 'runs' | 'success_rate' = 'recent'
): Promise<Workflow[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('workflows')
    .select('*')
    .eq('user_id', user.id)

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.trigger_type) {
    query = query.eq('trigger_type', filters.trigger_type)
  }

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  // Sorting
  switch (sortBy) {
    case 'name':
      query = query.order('name', { ascending: true })
      break
    case 'runs':
      query = query.order('run_count', { ascending: false })
      break
    case 'success_rate':
      query = query.order('success_rate', { ascending: false })
      break
    default:
      query = query.order('updated_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Get single workflow with actions
 */
export async function getWorkflow(workflowId: string): Promise<Workflow & { actions: WorkflowAction[] }> {
  const supabase = createClient()

  const [workflowResult, actionsResult] = await Promise.all([
    supabase.from('workflows').select('*').eq('id', workflowId).single(),
    supabase.from('workflow_actions').select('*').eq('workflow_id', workflowId).order('position', { ascending: true })
  ])

  if (workflowResult.error) throw workflowResult.error

  return {
    ...workflowResult.data,
    actions: actionsResult.data || []
  }
}

/**
 * Create new workflow
 */
export async function createWorkflow(workflowData: {
  name: string
  description?: string
  trigger_type: TriggerType
  trigger_config: any
  category?: WorkflowCategory
  tags?: string[]
}): Promise<Workflow> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('workflows')
    .insert({
      ...workflowData,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update workflow
 */
export async function updateWorkflow(
  workflowId: string,
  updates: Partial<Workflow>
): Promise<Workflow> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workflows')
    .update(updates)
    .eq('id', workflowId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete workflow
 */
export async function deleteWorkflow(workflowId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', workflowId)

  if (error) throw error
}

/**
 * Toggle workflow status
 */
export async function toggleWorkflowStatus(
  workflowId: string,
  status: 'active' | 'paused'
): Promise<Workflow> {
  return updateWorkflow(workflowId, { status })
}

// ============================================================================
// WORKFLOW ACTIONS MODULE
// ============================================================================

/**
 * Get workflow actions
 */
export async function getWorkflowActions(workflowId: string): Promise<WorkflowAction[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workflow_actions')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('position', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Create workflow action
 */
export async function createWorkflowAction(actionData: {
  workflow_id: string
  action_type: ActionType
  position: number
  config: any
  conditions?: any[]
}): Promise<WorkflowAction> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workflow_actions')
    .insert(actionData)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update workflow action
 */
export async function updateWorkflowAction(
  actionId: string,
  updates: Partial<WorkflowAction>
): Promise<WorkflowAction> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workflow_actions')
    .update(updates)
    .eq('id', actionId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete workflow action
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

  // Update positions for all actions
  const updates = actionIds.map((id, index) =>
    supabase
      .from('workflow_actions')
      .update({ position: index })
      .eq('id', id)
  )

  await Promise.all(updates)
}

// ============================================================================
// WORKFLOW EXECUTIONS MODULE
// ============================================================================

/**
 * Get workflow executions
 */
export async function getWorkflowExecutions(
  workflowId: string,
  filters?: {
    status?: ExecutionStatus
    limit?: number
  }
): Promise<WorkflowExecution[]> {
  const supabase = createClient()

  let query = supabase
    .from('workflow_executions')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('started_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Get execution details with steps
 */
export async function getExecutionDetails(executionId: string): Promise<WorkflowExecution & { steps: ExecutionStep[] }> {
  const supabase = createClient()

  const [executionResult, stepsResult] = await Promise.all([
    supabase.from('workflow_executions').select('*').eq('id', executionId).single(),
    supabase.from('execution_steps').select('*').eq('execution_id', executionId).order('started_at', { ascending: true })
  ])

  if (executionResult.error) throw executionResult.error

  return {
    ...executionResult.data,
    steps: stepsResult.data || []
  }
}

/**
 * Create workflow execution
 */
export async function createWorkflowExecution(executionData: {
  workflow_id: string
  triggered_by?: string
  input?: any
}): Promise<WorkflowExecution> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workflow_executions')
    .insert(executionData)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update execution status
 */
export async function updateExecutionStatus(
  executionId: string,
  status: ExecutionStatus,
  output?: any,
  errorMessage?: string
): Promise<WorkflowExecution> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workflow_executions')
    .update({
      status,
      completed_at: status === 'success' || status === 'failed' ? new Date().toISOString() : null,
      output,
      error_message: errorMessage
    })
    .eq('id', executionId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Create execution step
 */
export async function createExecutionStep(stepData: {
  execution_id: string
  action_id: string
  action_type: ActionType
  input?: any
}): Promise<ExecutionStep> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('execution_steps')
    .insert(stepData)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update execution step
 */
export async function updateExecutionStep(
  stepId: string,
  status: ExecutionStatus,
  output?: any,
  errorMessage?: string
): Promise<ExecutionStep> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('execution_steps')
    .update({
      status,
      completed_at: status === 'success' || status === 'failed' ? new Date().toISOString() : null,
      output,
      error_message: errorMessage
    })
    .eq('id', stepId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// WORKFLOW TEMPLATES MODULE
// ============================================================================

/**
 * Get workflow templates
 */
export async function getWorkflowTemplates(
  filters?: {
    category?: WorkflowCategory
    tags?: string[]
  },
  sortBy: 'popular' | 'recent' | 'name' = 'popular'
): Promise<WorkflowTemplate[]> {
  const supabase = createClient()

  let query = supabase
    .from('workflow_templates')
    .select('*')

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags)
  }

  // Sorting
  switch (sortBy) {
    case 'name':
      query = query.order('name', { ascending: true })
      break
    case 'recent':
      query = query.order('created_at', { ascending: false })
      break
    default:
      query = query.order('usage_count', { ascending: false })
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Get single template
 */
export async function getWorkflowTemplate(templateId: string): Promise<WorkflowTemplate> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workflow_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) throw error
  return data
}

/**
 * Create workflow from template
 */
export async function createWorkflowFromTemplate(
  templateId: string,
  workflowName: string
): Promise<Workflow> {
  const template = await getWorkflowTemplate(templateId)

  // Create workflow
  const workflow = await createWorkflow({
    name: workflowName,
    description: template.description,
    trigger_type: template.trigger_type,
    trigger_config: template.trigger_config,
    category: template.category,
    tags: template.tags
  })

  // Create actions from template
  const actions = template.actions as any[]
  for (const action of actions) {
    await createWorkflowAction({
      workflow_id: workflow.id,
      action_type: action.type,
      position: action.position,
      config: action.config,
      conditions: action.conditions
    })
  }

  return workflow
}

// ============================================================================
// ANALYTICS MODULE
// ============================================================================

/**
 * Get automation metrics
 */
export async function getAutomationMetrics(): Promise<AutomationMetrics> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .rpc('get_workflow_metrics', { p_user_id: user.id })

  if (error) throw error

  const metrics = data?.[0] || {
    total_workflows: 0,
    active_workflows: 0,
    total_executions: 0,
    success_rate: 0,
    avg_execution_time: 0,
    automations_saved: 0
  }

  return {
    totalWorkflows: Number(metrics.total_workflows),
    activeWorkflows: Number(metrics.active_workflows),
    totalExecutions: Number(metrics.total_executions),
    successRate: Number(metrics.success_rate) || 0,
    averageExecutionTime: Number(metrics.avg_execution_time) || 0,
    automationsSaved: Number(metrics.automations_saved),
    mostUsedTrigger: 'schedule', // Would need additional query
    mostUsedAction: 'email' // Would need additional query
  }
}

/**
 * Get failing workflows
 */
export async function getFailingWorkflows(limit: number = 10): Promise<{
  id: string
  name: string
  error_rate: number
  last_error: string
  error_count: number
}[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .rpc('get_failing_workflows', {
      p_user_id: user.id,
      p_limit: limit
    })

  if (error) throw error
  return data || []
}

/**
 * Get execution timeline
 */
export async function getExecutionTimeline(
  workflowId: string,
  days: number = 30
): Promise<{
  date: string
  executions: number
  successes: number
  failures: number
}[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_execution_timeline', {
      p_workflow_id: workflowId,
      p_days: days
    })

  if (error) throw error
  return data || []
}

/**
 * Get workflow performance
 */
export async function getWorkflowPerformance(workflowId: string): Promise<{
  total_runs: number
  success_rate: number
  avg_duration: number
  fastest_run: number
  slowest_run: number
  recent_errors: string[]
}> {
  const supabase = createClient()

  const { data: executions, error } = await supabase
    .from('workflow_executions')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('started_at', { ascending: false })
    .limit(100)

  if (error) throw error

  const successful = executions.filter(e => e.status === 'success')
  const durations = executions.filter(e => e.duration_ms).map(e => e.duration_ms)
  const recentErrors = executions
    .filter(e => e.status === 'failed' && e.error_message)
    .slice(0, 5)
    .map(e => e.error_message)

  return {
    total_runs: executions.length,
    success_rate: executions.length > 0 ? (successful.length / executions.length) * 100 : 0,
    avg_duration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
    fastest_run: durations.length > 0 ? Math.min(...durations) : 0,
    slowest_run: durations.length > 0 ? Math.max(...durations) : 0,
    recent_errors: recentErrors
  }
}

// ============================================================================
// WORKFLOW LOGS MODULE
// ============================================================================

/**
 * Create workflow log
 */
export async function createWorkflowLog(logData: {
  workflow_id: string
  execution_id?: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  metadata?: any
}): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('workflow_logs')
    .insert(logData)

  if (error) throw error
}

/**
 * Get workflow logs
 */
export async function getWorkflowLogs(
  workflowId: string,
  filters?: {
    execution_id?: string
    level?: string
    limit?: number
  }
): Promise<any[]> {
  const supabase = createClient()

  let query = supabase
    .from('workflow_logs')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('created_at', { ascending: false })

  if (filters?.execution_id) {
    query = query.eq('execution_id', filters.execution_id)
  }

  if (filters?.level) {
    query = query.eq('level', filters.level)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

// ============================================================================
// SEARCH MODULE
// ============================================================================

/**
 * Search workflows
 */
export async function searchWorkflows(searchTerm: string): Promise<Workflow[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('user_id', user.id)
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}

// ============================================================================
// EXPORT MODULE
// ============================================================================

/**
 * Export workflow as JSON
 */
export async function exportWorkflow(workflowId: string): Promise<string> {
  const workflow = await getWorkflow(workflowId)

  const exportData = {
    version: '1.0',
    workflow: {
      name: workflow.name,
      description: workflow.description,
      trigger: {
        type: workflow.trigger_type,
        config: workflow.trigger_config
      },
      actions: workflow.actions.map(action => ({
        type: action.action_type,
        position: action.position,
        config: action.config,
        conditions: action.conditions
      }))
    },
    exported_at: new Date().toISOString()
  }

  return JSON.stringify(exportData, null, 2)
}
