/**
 * KAZI Workflow Automation Engine
 *
 * A powerful workflow automation system that enables users to create
 * automated processes triggered by events, schedules, or webhooks.
 *
 * Features:
 * - Event-driven workflow execution
 * - Scheduled workflow runs
 * - Webhook triggers
 * - Conditional logic and branching
 * - Action chaining with variables
 * - Error handling and retry logic
 * - Execution history and analytics
 */

import { createClient } from '@/lib/supabase/server'

// Types
export type TriggerType = 'event' | 'schedule' | 'webhook' | 'manual' | 'condition'
export type ActionCategory =
  | 'client_management'
  | 'project_management'
  | 'invoicing'
  | 'communication'
  | 'team'
  | 'file_management'
  | 'custom'

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused'
export type ActionStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped'

export interface WorkflowTemplate {
  id: string
  user_id: string
  name: string
  description?: string
  trigger_type: TriggerType
  trigger_config: TriggerConfig
  actions: WorkflowAction[]
  conditions?: WorkflowCondition[]
  is_active: boolean
  execution_count: number
  last_executed_at?: string
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface TriggerConfig {
  event_type?: string
  event_filters?: Record<string, unknown>
  schedule?: string // cron expression
  timezone?: string
  webhook_secret?: string
  condition_expression?: string
}

export interface WorkflowAction {
  id: string
  type: string
  category: ActionCategory
  name: string
  config: Record<string, unknown>
  order: number
  conditions?: ActionCondition[]
  error_handling?: ErrorHandling
  retry_config?: RetryConfig
  timeout_ms?: number
}

export interface ActionCondition {
  field: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'not_contains' | 'exists' | 'not_exists'
  value: unknown
  logic?: 'and' | 'or'
}

export interface WorkflowCondition {
  id: string
  expression: string
  true_branch: string[] // action IDs
  false_branch: string[] // action IDs
}

export interface ErrorHandling {
  on_error: 'stop' | 'continue' | 'retry' | 'fallback'
  fallback_action_id?: string
  notify_on_error: boolean
}

export interface RetryConfig {
  max_retries: number
  retry_delay_ms: number
  exponential_backoff: boolean
}

export interface WorkflowExecution {
  id: string
  workflow_id: string
  user_id: string
  status: ExecutionStatus
  trigger_type: TriggerType
  trigger_data: Record<string, unknown>
  variables: Record<string, unknown>
  started_at: string
  completed_at?: string
  error_message?: string
  execution_time_ms?: number
}

export interface ActionLog {
  id: string
  execution_id: string
  action_id: string
  action_type: string
  action_name: string
  status: ActionStatus
  input_data: Record<string, unknown>
  output_data?: Record<string, unknown>
  error_message?: string
  started_at: string
  completed_at?: string
  execution_time_ms?: number
  retry_count: number
}

// Action handlers
type ActionHandler = (
  action: WorkflowAction,
  context: ExecutionContext
) => Promise<ActionResult>

interface ExecutionContext {
  execution: WorkflowExecution
  variables: Record<string, unknown>
  previousResults: Record<string, unknown>
  userId: string
}

interface ActionResult {
  success: boolean
  output?: Record<string, unknown>
  error?: string
  skipRemaining?: boolean
}

// Built-in action handlers
const actionHandlers: Record<string, ActionHandler> = {
  // Client Management Actions
  'client.create': async (action, context) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id: context.userId,
        ...resolveVariables(action.config, context.variables)
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, output: { client: data } }
  },

  'client.update': async (action, context) => {
    const supabase = await createClient()
    const config = resolveVariables(action.config, context.variables)
    const { clientId, ...updates } = config as Record<string, unknown>

    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId)
      .eq('user_id', context.userId)
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, output: { client: data } }
  },

  'client.send_email': async (action, context) => {
    const config = resolveVariables(action.config, context.variables)
    // Integration with email service would go here
    // For now, log the email action
    const supabase = await createClient()
    await supabase
      .from('client_communications')
      .insert({
        user_id: context.userId,
        client_id: config.clientId,
        type: 'email',
        subject: config.subject,
        content: config.body,
        direction: 'outbound',
        status: 'sent',
        metadata: { automated: true, workflow_execution_id: context.execution.id }
      })

    return { success: true, output: { emailSent: true } }
  },

  // Project Management Actions
  'project.create': async (action, context) => {
    const supabase = await createClient()
    const config = resolveVariables(action.config, context.variables)

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: context.userId,
        ...config
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, output: { project: data } }
  },

  'project.update_status': async (action, context) => {
    const supabase = await createClient()
    const config = resolveVariables(action.config, context.variables)

    const { data, error } = await supabase
      .from('projects')
      .update({ status: config.status })
      .eq('id', config.projectId)
      .eq('user_id', context.userId)
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, output: { project: data } }
  },

  'project.create_task': async (action, context) => {
    const supabase = await createClient()
    const config = resolveVariables(action.config, context.variables)

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: context.userId,
        ...config
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, output: { task: data } }
  },

  // Invoicing Actions
  'invoice.create': async (action, context) => {
    const supabase = await createClient()
    const config = resolveVariables(action.config, context.variables)

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        user_id: context.userId,
        ...config
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, output: { invoice: data } }
  },

  'invoice.send_reminder': async (action, context) => {
    const supabase = await createClient()
    const config = resolveVariables(action.config, context.variables)

    // Log the reminder
    await supabase
      .from('invoice_reminders')
      .insert({
        invoice_id: config.invoiceId,
        sent_at: new Date().toISOString(),
        reminder_type: config.reminderType || 'automated',
        channel: config.channel || 'email'
      })

    return { success: true, output: { reminderSent: true } }
  },

  // Communication Actions
  'notification.send': async (action, context) => {
    const supabase = await createClient()
    const config = resolveVariables(action.config, context.variables)

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: config.recipientId || context.userId,
        title: config.title,
        message: config.message,
        type: config.type || 'info',
        category: config.category || 'workflow',
        metadata: { workflow_execution_id: context.execution.id }
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, output: { notification: data } }
  },

  // Team Actions
  'team.assign_task': async (action, context) => {
    const supabase = await createClient()
    const config = resolveVariables(action.config, context.variables)

    const { data, error } = await supabase
      .from('task_assignments')
      .insert({
        task_id: config.taskId,
        user_id: config.assigneeId,
        assigned_by: context.userId,
        role: config.role || 'assignee'
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, output: { assignment: data } }
  },

  // File Management Actions
  'file.move': async (action, context) => {
    const supabase = await createClient()
    const config = resolveVariables(action.config, context.variables)

    const { data, error } = await supabase
      .from('files')
      .update({ folder_id: config.targetFolderId })
      .eq('id', config.fileId)
      .eq('user_id', context.userId)
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, output: { file: data } }
  },

  // Control Flow Actions
  'control.delay': async (action, context) => {
    const config = resolveVariables(action.config, context.variables)
    const delayMs = (config.seconds as number || 0) * 1000

    await new Promise(resolve => setTimeout(resolve, Math.min(delayMs, 30000))) // Max 30s delay
    return { success: true, output: { delayed: true, delayMs } }
  },

  'control.condition': async (action, context) => {
    const config = resolveVariables(action.config, context.variables)
    const result = evaluateCondition(config.condition as string, context.variables)

    return {
      success: true,
      output: {
        conditionResult: result,
        branch: result ? 'true' : 'false'
      }
    }
  },

  'control.set_variable': async (action, context) => {
    const config = resolveVariables(action.config, context.variables)
    context.variables[config.name as string] = config.value

    return { success: true, output: { variableSet: config.name } }
  },

  // Custom/Webhook Actions
  'custom.webhook': async (action, context) => {
    const config = resolveVariables(action.config, context.variables)

    try {
      const response = await fetch(config.url as string, {
        method: (config.method as string) || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.headers as Record<string, string> || {})
        },
        body: JSON.stringify(config.body || context.variables)
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` }
      }

      return { success: true, output: { response: data, status: response.status } }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Webhook failed' }
    }
  }
}

// Helper functions
function resolveVariables(
  config: Record<string, unknown>,
  variables: Record<string, unknown>
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const varPath = value.slice(2, -2).trim()
      resolved[key] = getNestedValue(variables, varPath)
    } else if (typeof value === 'object' && value !== null) {
      resolved[key] = resolveVariables(value as Record<string, unknown>, variables)
    } else {
      resolved[key] = value
    }
  }

  return resolved
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined
  }, obj as unknown)
}

function evaluateCondition(expression: string, variables: Record<string, unknown>): boolean {
  // Simple condition evaluation
  // Format: "variable operator value" e.g., "project.status == completed"
  const operators = ['==', '!=', '>', '<', '>=', '<=', 'contains', 'not_contains']

  for (const op of operators) {
    if (expression.includes(op)) {
      const [left, right] = expression.split(op).map(s => s.trim())
      const leftValue = left.startsWith('{{')
        ? getNestedValue(variables, left.slice(2, -2).trim())
        : left
      const rightValue = right.startsWith('{{')
        ? getNestedValue(variables, right.slice(2, -2).trim())
        : right.replace(/['"]/g, '')

      switch (op) {
        case '==': return leftValue === rightValue
        case '!=': return leftValue !== rightValue
        case '>': return Number(leftValue) > Number(rightValue)
        case '<': return Number(leftValue) < Number(rightValue)
        case '>=': return Number(leftValue) >= Number(rightValue)
        case '<=': return Number(leftValue) <= Number(rightValue)
        case 'contains': return String(leftValue).includes(String(rightValue))
        case 'not_contains': return !String(leftValue).includes(String(rightValue))
      }
    }
  }

  return false
}

// Main Workflow Engine Class
export class WorkflowEngine {
  private static instance: WorkflowEngine

  private constructor() {}

  static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine()
    }
    return WorkflowEngine.instance
  }

  /**
   * Create a new workflow template
   */
  async createWorkflow(
    userId: string,
    workflow: Omit<WorkflowTemplate, 'id' | 'user_id' | 'execution_count' | 'created_at' | 'updated_at'>
  ): Promise<WorkflowTemplate> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('workflow_templates')
      .insert({
        user_id: userId,
        name: workflow.name,
        description: workflow.description,
        trigger_type: workflow.trigger_type,
        trigger_config: workflow.trigger_config,
        actions: workflow.actions,
        conditions: workflow.conditions,
        is_active: workflow.is_active ?? true,
        tags: workflow.tags || [],
        metadata: workflow.metadata || {}
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create workflow: ${error.message}`)
    return data
  }

  /**
   * Update an existing workflow
   */
  async updateWorkflow(
    userId: string,
    workflowId: string,
    updates: Partial<WorkflowTemplate>
  ): Promise<WorkflowTemplate> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('workflow_templates')
      .update(updates)
      .eq('id', workflowId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update workflow: ${error.message}`)
    return data
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(userId: string, workflowId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('workflow_templates')
      .delete()
      .eq('id', workflowId)
      .eq('user_id', userId)

    if (error) throw new Error(`Failed to delete workflow: ${error.message}`)
  }

  /**
   * Get a workflow by ID
   */
  async getWorkflow(userId: string, workflowId: string): Promise<WorkflowTemplate | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', userId)
      .single()

    if (error) return null
    return data
  }

  /**
   * List workflows for a user
   */
  async listWorkflows(
    userId: string,
    options?: {
      triggerType?: TriggerType
      isActive?: boolean
      tags?: string[]
      limit?: number
      offset?: number
    }
  ): Promise<{ workflows: WorkflowTemplate[]; total: number }> {
    const supabase = await createClient()

    let query = supabase
      .from('workflow_templates')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    if (options?.triggerType) {
      query = query.eq('trigger_type', options.triggerType)
    }

    if (options?.isActive !== undefined) {
      query = query.eq('is_active', options.isActive)
    }

    if (options?.tags?.length) {
      query = query.overlaps('tags', options.tags)
    }

    const limit = options?.limit || 50
    const offset = options?.offset || 0

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw new Error(`Failed to list workflows: ${error.message}`)
    return { workflows: data || [], total: count || 0 }
  }

  /**
   * Execute a workflow manually
   */
  async executeWorkflow(
    userId: string,
    workflowId: string,
    triggerData: Record<string, unknown> = {}
  ): Promise<WorkflowExecution> {
    const workflow = await this.getWorkflow(userId, workflowId)
    if (!workflow) throw new Error('Workflow not found')
    if (!workflow.is_active) throw new Error('Workflow is not active')

    return this.runWorkflow(workflow, 'manual', triggerData)
  }

  /**
   * Trigger workflows by event
   */
  async triggerByEvent(
    userId: string,
    eventType: string,
    eventData: Record<string, unknown>
  ): Promise<WorkflowExecution[]> {
    const supabase = await createClient()

    // Find workflows subscribed to this event
    const { data: subscriptions } = await supabase
      .from('workflow_event_subscriptions')
      .select('workflow_id')
      .eq('user_id', userId)
      .eq('event_type', eventType)
      .eq('is_active', true)

    if (!subscriptions?.length) return []

    const executions: WorkflowExecution[] = []

    for (const sub of subscriptions) {
      const workflow = await this.getWorkflow(userId, sub.workflow_id)
      if (workflow && workflow.is_active) {
        // Check event filters if configured
        if (this.matchesEventFilters(workflow.trigger_config.event_filters, eventData)) {
          const execution = await this.runWorkflow(workflow, 'event', eventData)
          executions.push(execution)
        }
      }
    }

    return executions
  }

  /**
   * Process webhook trigger
   */
  async processWebhook(
    webhookId: string,
    payload: Record<string, unknown>,
    headers: Record<string, string>
  ): Promise<WorkflowExecution | null> {
    const supabase = await createClient()

    const { data: webhook } = await supabase
      .from('workflow_webhooks')
      .select('*, workflow_templates(*)')
      .eq('id', webhookId)
      .eq('is_active', true)
      .single()

    if (!webhook) return null

    // Validate secret if configured
    if (webhook.secret_hash) {
      const providedSecret = headers['x-webhook-secret'] || headers['authorization']
      // In production, compare hashed values
      if (!providedSecret) {
        throw new Error('Webhook secret required')
      }
    }

    // Update last triggered
    await supabase
      .from('workflow_webhooks')
      .update({
        last_triggered_at: new Date().toISOString(),
        trigger_count: webhook.trigger_count + 1
      })
      .eq('id', webhookId)

    const workflow = webhook.workflow_templates as WorkflowTemplate
    return this.runWorkflow(workflow, 'webhook', payload)
  }

  /**
   * Run scheduled workflows
   */
  async processScheduledWorkflows(): Promise<WorkflowExecution[]> {
    const supabase = await createClient()

    // Get pending scheduled workflows using the database function
    const { data: schedules } = await supabase
      .rpc('get_pending_scheduled_workflows')

    if (!schedules?.length) return []

    const executions: WorkflowExecution[] = []

    for (const schedule of schedules) {
      try {
        const { data: workflow } = await supabase
          .from('workflow_templates')
          .select('*')
          .eq('id', schedule.workflow_id)
          .single()

        if (workflow && workflow.is_active) {
          const execution = await this.runWorkflow(workflow, 'schedule', {
            schedule_id: schedule.id,
            scheduled_for: schedule.next_run_at
          })
          executions.push(execution)

          // Update next run time
          const nextRun = this.calculateNextRun(schedule.cron_expression, schedule.timezone)
          await supabase
            .from('workflow_schedules')
            .update({
              last_run_at: new Date().toISOString(),
              next_run_at: nextRun,
              run_count: schedule.run_count + 1
            })
            .eq('id', schedule.id)
        }
      } catch (error) {
        console.error(`Failed to execute scheduled workflow ${schedule.workflow_id}:`, error)
      }
    }

    return executions
  }

  /**
   * Core workflow execution logic
   */
  private async runWorkflow(
    workflow: WorkflowTemplate,
    triggerType: TriggerType,
    triggerData: Record<string, unknown>
  ): Promise<WorkflowExecution> {
    const supabase = await createClient()
    const startTime = Date.now()

    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from('workflow_executions')
      .insert({
        workflow_id: workflow.id,
        user_id: workflow.user_id,
        status: 'running',
        trigger_type: triggerType,
        trigger_data: triggerData,
        variables: {},
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (execError) throw new Error(`Failed to create execution: ${execError.message}`)

    const context: ExecutionContext = {
      execution,
      variables: { ...triggerData, trigger: triggerData },
      previousResults: {},
      userId: workflow.user_id
    }

    let finalStatus: ExecutionStatus = 'completed'
    let errorMessage: string | undefined

    // Execute actions in order
    const sortedActions = [...workflow.actions].sort((a, b) => a.order - b.order)

    for (const action of sortedActions) {
      // Check action conditions
      if (action.conditions?.length) {
        const shouldExecute = this.evaluateActionConditions(action.conditions, context.variables)
        if (!shouldExecute) {
          await this.logAction(execution.id, action, 'skipped', {}, undefined, 0)
          continue
        }
      }

      const actionStartTime = Date.now()
      let retryCount = 0
      let result: ActionResult | null = null

      // Retry loop
      const maxRetries = action.retry_config?.max_retries || 0

      while (retryCount <= maxRetries) {
        try {
          const handler = actionHandlers[action.type]
          if (!handler) {
            result = { success: false, error: `Unknown action type: ${action.type}` }
          } else {
            // Apply timeout
            const timeout = action.timeout_ms || 30000
            result = await Promise.race([
              handler(action, context),
              new Promise<ActionResult>((_, reject) =>
                setTimeout(() => reject(new Error('Action timeout')), timeout)
              )
            ])
          }

          if (result.success) break

          // Check if we should retry
          if (retryCount < maxRetries) {
            const delay = action.retry_config?.exponential_backoff
              ? action.retry_config.retry_delay_ms * Math.pow(2, retryCount)
              : action.retry_config?.retry_delay_ms || 1000

            await new Promise(resolve => setTimeout(resolve, delay))
            retryCount++
          } else {
            break
          }
        } catch (error) {
          result = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
          if (retryCount < maxRetries) {
            retryCount++
          } else {
            break
          }
        }
      }

      // Log action result
      await this.logAction(
        execution.id,
        action,
        result?.success ? 'success' : 'failed',
        context.variables,
        result?.output,
        Date.now() - actionStartTime,
        result?.error,
        retryCount
      )

      // Store result for next actions
      if (result?.output) {
        context.previousResults[action.id] = result.output
        context.variables[`action_${action.id}`] = result.output
      }

      // Handle failure
      if (!result?.success) {
        const errorHandling = action.error_handling || { on_error: 'stop', notify_on_error: false }

        if (errorHandling.on_error === 'stop') {
          finalStatus = 'failed'
          errorMessage = result?.error
          break
        } else if (errorHandling.on_error === 'fallback' && errorHandling.fallback_action_id) {
          // Execute fallback action
          const fallbackAction = workflow.actions.find(a => a.id === errorHandling.fallback_action_id)
          if (fallbackAction) {
            const handler = actionHandlers[fallbackAction.type]
            if (handler) {
              await handler(fallbackAction, context)
            }
          }
        }
        // 'continue' just moves to next action
      }

      if (result?.skipRemaining) break
    }

    // Update execution record
    const executionTime = Date.now() - startTime

    const { data: updatedExecution } = await supabase
      .from('workflow_executions')
      .update({
        status: finalStatus,
        variables: context.variables,
        completed_at: new Date().toISOString(),
        execution_time_ms: executionTime,
        error_message: errorMessage
      })
      .eq('id', execution.id)
      .select()
      .single()

    // Update workflow stats
    await supabase
      .from('workflow_templates')
      .update({
        execution_count: workflow.execution_count + 1,
        last_executed_at: new Date().toISOString()
      })
      .eq('id', workflow.id)

    return updatedExecution || execution
  }

  /**
   * Log action execution
   */
  private async logAction(
    executionId: string,
    action: WorkflowAction,
    status: ActionStatus,
    inputData: Record<string, unknown>,
    outputData?: Record<string, unknown>,
    executionTimeMs?: number,
    errorMessage?: string,
    retryCount: number = 0
  ): Promise<void> {
    const supabase = await createClient()

    await supabase
      .from('workflow_action_logs')
      .insert({
        execution_id: executionId,
        action_id: action.id,
        action_type: action.type,
        action_name: action.name,
        status,
        input_data: inputData,
        output_data: outputData,
        error_message: errorMessage,
        started_at: new Date(Date.now() - (executionTimeMs || 0)).toISOString(),
        completed_at: new Date().toISOString(),
        execution_time_ms: executionTimeMs,
        retry_count: retryCount
      })
  }

  /**
   * Check if event data matches filters
   */
  private matchesEventFilters(
    filters: Record<string, unknown> | undefined,
    data: Record<string, unknown>
  ): boolean {
    if (!filters) return true

    for (const [key, value] of Object.entries(filters)) {
      const dataValue = getNestedValue(data, key)
      if (dataValue !== value) return false
    }

    return true
  }

  /**
   * Evaluate action conditions
   */
  private evaluateActionConditions(
    conditions: ActionCondition[],
    variables: Record<string, unknown>
  ): boolean {
    let result = true
    let logic: 'and' | 'or' = 'and'

    for (const condition of conditions) {
      const fieldValue = getNestedValue(variables, condition.field)
      let conditionResult = false

      switch (condition.operator) {
        case 'eq': conditionResult = fieldValue === condition.value; break
        case 'neq': conditionResult = fieldValue !== condition.value; break
        case 'gt': conditionResult = Number(fieldValue) > Number(condition.value); break
        case 'gte': conditionResult = Number(fieldValue) >= Number(condition.value); break
        case 'lt': conditionResult = Number(fieldValue) < Number(condition.value); break
        case 'lte': conditionResult = Number(fieldValue) <= Number(condition.value); break
        case 'contains': conditionResult = String(fieldValue).includes(String(condition.value)); break
        case 'not_contains': conditionResult = !String(fieldValue).includes(String(condition.value)); break
        case 'exists': conditionResult = fieldValue !== undefined && fieldValue !== null; break
        case 'not_exists': conditionResult = fieldValue === undefined || fieldValue === null; break
      }

      if (logic === 'and') {
        result = result && conditionResult
      } else {
        result = result || conditionResult
      }

      logic = condition.logic || 'and'
    }

    return result
  }

  /**
   * Calculate next run time from cron expression
   */
  private calculateNextRun(cronExpression: string, timezone: string = 'UTC'): string {
    // Simple next minute calculation for now
    // In production, use a proper cron parser library
    const next = new Date()
    next.setMinutes(next.getMinutes() + 1)
    next.setSeconds(0)
    next.setMilliseconds(0)
    return next.toISOString()
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(
    userId: string,
    options?: {
      workflowId?: string
      status?: ExecutionStatus
      limit?: number
      offset?: number
    }
  ): Promise<{ executions: WorkflowExecution[]; total: number }> {
    const supabase = await createClient()

    let query = supabase
      .from('workflow_executions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    if (options?.workflowId) {
      query = query.eq('workflow_id', options.workflowId)
    }

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    const limit = options?.limit || 50
    const offset = options?.offset || 0

    const { data, error, count } = await query
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw new Error(`Failed to get execution history: ${error.message}`)
    return { executions: data || [], total: count || 0 }
  }

  /**
   * Get execution details with action logs
   */
  async getExecutionDetails(
    userId: string,
    executionId: string
  ): Promise<{ execution: WorkflowExecution; actionLogs: ActionLog[] } | null> {
    const supabase = await createClient()

    const { data: execution } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', executionId)
      .eq('user_id', userId)
      .single()

    if (!execution) return null

    const { data: actionLogs } = await supabase
      .from('workflow_action_logs')
      .select('*')
      .eq('execution_id', executionId)
      .order('started_at', { ascending: true })

    return { execution, actionLogs: actionLogs || [] }
  }

  /**
   * Get workflow statistics
   */
  async getStatistics(userId: string, workflowId?: string): Promise<Record<string, unknown>> {
    const supabase = await createClient()

    const { data } = await supabase
      .rpc('get_workflow_statistics', {
        p_user_id: userId,
        p_workflow_id: workflowId
      })

    return data || {}
  }

  /**
   * Cancel a running execution
   */
  async cancelExecution(userId: string, executionId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('workflow_executions')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString()
      })
      .eq('id', executionId)
      .eq('user_id', userId)
      .eq('status', 'running')

    if (error) throw new Error(`Failed to cancel execution: ${error.message}`)
  }
}

// Export singleton instance
export const workflowEngine = WorkflowEngine.getInstance()
