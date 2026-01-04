/**
 * Kazi Workflows Service
 *
 * A comprehensive workflow automation service for the Kazi platform.
 * Provides action execution, trigger management, and workflow orchestration.
 */

import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

// Types
export interface KaziWorkflow {
  id: string
  user_id: string
  name: string
  description?: string
  trigger_type: KaziTriggerType
  trigger_config: KaziTriggerConfig
  actions: KaziAction[]
  is_active: boolean
  run_count: number
  success_rate: number
  last_run_at?: string
  next_run_at?: string
  tags: string[]
  category: KaziWorkflowCategory
  created_at: string
  updated_at: string
}

export type KaziTriggerType = 'manual' | 'schedule' | 'webhook' | 'event' | 'form' | 'record-change'
export type KaziWorkflowCategory = 'sales' | 'marketing' | 'operations' | 'support' | 'hr' | 'finance' | 'custom'
export type KaziActionType =
  | 'email'
  | 'notification'
  | 'create-task'
  | 'update-record'
  | 'api-call'
  | 'delay'
  | 'condition'
  | 'create-client'
  | 'create-project'
  | 'create-invoice'
  | 'send-sms'
  | 'slack-message'
  | 'assign-task'
  | 'move-file'

export interface KaziTriggerConfig {
  // Schedule
  schedule?: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'cron'
    cron?: string
    time?: string
    dayOfWeek?: number
    dayOfMonth?: number
    timezone?: string
  }
  // Event
  event?: {
    type: string
    source: string
    filters?: Record<string, any>
  }
  // Webhook
  webhook?: {
    path: string
    method: 'GET' | 'POST' | 'PUT'
    secret?: string
    allowedIps?: string[]
  }
  // Form
  form?: {
    formId: string
    fields?: string[]
  }
  // Record change
  recordChange?: {
    entity: string
    operation: 'create' | 'update' | 'delete'
    fields?: string[]
    conditions?: Record<string, any>
  }
}

export interface KaziAction {
  id: string
  type: KaziActionType
  name: string
  position: number
  config: Record<string, any>
  conditions?: KaziCondition[]
  onSuccess?: string
  onFailure?: string
  retryConfig?: {
    maxRetries: number
    delayMs: number
    exponentialBackoff: boolean
  }
  timeoutMs?: number
}

export interface KaziCondition {
  field: string
  operator: 'equals' | 'not-equals' | 'contains' | 'greater' | 'less' | 'exists' | 'not-exists' | 'matches'
  value: any
  logic?: 'and' | 'or'
}

export interface KaziExecutionContext {
  workflowId: string
  executionId: string
  userId: string
  triggerData: Record<string, any>
  variables: Record<string, any>
  previousResults: Record<string, any>
}

export interface KaziActionResult {
  success: boolean
  output?: Record<string, any>
  error?: string
  duration?: number
}

// Action Handlers Registry
type ActionHandler = (
  action: KaziAction,
  context: KaziExecutionContext
) => Promise<KaziActionResult>

const actionHandlers: Record<KaziActionType, ActionHandler> = {
  // Email Action
  'email': async (action, context) => {
    const config = resolveVariables(action.config, context)

    try {
      // Try to use Resend if configured
      const resendKey = process.env.RESEND_API_KEY
      if (resendKey) {
        const resend = new Resend(resendKey)
        await resend.emails.send({
          from: config.from || 'Kazi <noreply@kazi.app>',
          to: Array.isArray(config.to) ? config.to : [config.to],
          subject: config.subject,
          html: config.body,
          cc: config.cc,
          bcc: config.bcc
        })
      } else {
        // Log email action for development
        console.log('[Kazi Workflows] Email action:', config)
      }

      // Log the communication
      const supabase = await createClient()
      await supabase.from('communications').insert({
        user_id: context.userId,
        type: 'email',
        direction: 'outbound',
        subject: config.subject,
        content: config.body,
        recipient: config.to,
        status: 'sent',
        metadata: {
          workflow_id: context.workflowId,
          execution_id: context.executionId,
          automated: true
        }
      })

      return { success: true, output: { emailSent: true, to: config.to } }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Email failed' }
    }
  },

  // Notification Action
  'notification': async (action, context) => {
    const config = resolveVariables(action.config, context)
    const supabase = await createClient()

    const { data, error } = await supabase.from('notifications').insert({
      user_id: config.recipientId || context.userId,
      title: config.title,
      message: config.message,
      type: config.priority || 'info',
      category: 'workflow',
      read: false,
      metadata: {
        workflow_id: context.workflowId,
        execution_id: context.executionId,
        channels: config.channels || ['app']
      }
    }).select().single()

    if (error) return { success: false, error: error.message }
    return { success: true, output: { notification: data } }
  },

  // Create Task Action
  'create-task': async (action, context) => {
    const config = resolveVariables(action.config, context)
    const supabase = await createClient()

    // Calculate due date if relative
    let dueDate = config.dueDate
    if (typeof dueDate === 'string' && dueDate.startsWith('+')) {
      const match = dueDate.match(/\+(\d+)\s*(day|days|week|weeks|month|months)/)
      if (match) {
        const amount = parseInt(match[1])
        const unit = match[2]
        const date = new Date()
        if (unit.startsWith('day')) date.setDate(date.getDate() + amount)
        else if (unit.startsWith('week')) date.setDate(date.getDate() + amount * 7)
        else if (unit.startsWith('month')) date.setMonth(date.getMonth() + amount)
        dueDate = date.toISOString()
      }
    }

    const { data, error } = await supabase.from('tasks').insert({
      user_id: context.userId,
      title: config.title,
      description: config.description,
      status: 'pending',
      priority: config.priority || 'medium',
      project_id: config.projectId,
      assignee_id: config.assignee,
      due_date: dueDate,
      metadata: {
        created_by_workflow: context.workflowId,
        execution_id: context.executionId
      }
    }).select().single()

    if (error) return { success: false, error: error.message }
    return { success: true, output: { task: data } }
  },

  // Update Record Action
  'update-record': async (action, context) => {
    const config = resolveVariables(action.config, context)
    const supabase = await createClient()

    let fields = config.fields
    if (typeof fields === 'string') {
      try {
        fields = JSON.parse(fields)
      } catch {
        return { success: false, error: 'Invalid fields JSON' }
      }
    }

    const { data, error } = await supabase
      .from(config.entity)
      .update(fields)
      .eq('id', config.recordId)
      .eq('user_id', context.userId)
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, output: { record: data } }
  },

  // API Call Action
  'api-call': async (action, context) => {
    const config = resolveVariables(action.config, context)

    try {
      let headers = config.headers || {}
      let body = config.body

      if (typeof headers === 'string') {
        headers = JSON.parse(headers)
      }
      if (typeof body === 'string' && body.trim().startsWith('{')) {
        body = JSON.parse(body)
      }

      const response = await fetch(config.url, {
        method: config.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: config.method !== 'GET' ? JSON.stringify(body) : undefined
      })

      const responseData = await response.json().catch(() => null)

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` }
      }

      return {
        success: true,
        output: {
          status: response.status,
          data: responseData,
          headers: Object.fromEntries(response.headers.entries())
        }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'API call failed' }
    }
  },

  // Delay Action
  'delay': async (action, context) => {
    const config = resolveVariables(action.config, context)
    const duration = config.duration || 1
    const unit = config.unit || 'seconds'

    let delayMs = duration * 1000
    if (unit === 'minutes') delayMs = duration * 60 * 1000
    else if (unit === 'hours') delayMs = duration * 60 * 60 * 1000
    else if (unit === 'days') delayMs = duration * 24 * 60 * 60 * 1000

    // Cap at 5 minutes for immediate execution
    const cappedDelay = Math.min(delayMs, 5 * 60 * 1000)

    await new Promise(resolve => setTimeout(resolve, cappedDelay))

    return { success: true, output: { delayed: true, durationMs: cappedDelay } }
  },

  // Condition Action
  'condition': async (action, context) => {
    const config = resolveVariables(action.config, context)
    const fieldValue = getNestedValue(context.variables, config.field)

    let result = false
    switch (config.operator) {
      case 'equals':
        result = fieldValue === config.value
        break
      case 'not-equals':
        result = fieldValue !== config.value
        break
      case 'contains':
        result = String(fieldValue).includes(String(config.value))
        break
      case 'greater':
        result = Number(fieldValue) > Number(config.value)
        break
      case 'less':
        result = Number(fieldValue) < Number(config.value)
        break
      case 'exists':
        result = fieldValue !== undefined && fieldValue !== null
        break
      case 'not-exists':
        result = fieldValue === undefined || fieldValue === null
        break
      case 'matches':
        result = new RegExp(config.value).test(String(fieldValue))
        break
    }

    return {
      success: true,
      output: {
        conditionResult: result,
        branch: result ? 'true' : 'false',
        nextAction: result ? config.ifTrue : config.ifFalse
      }
    }
  },

  // Create Client Action
  'create-client': async (action, context) => {
    const config = resolveVariables(action.config, context)
    const supabase = await createClient()

    const { data, error } = await supabase.from('clients').insert({
      user_id: context.userId,
      name: config.name,
      email: config.email,
      phone: config.phone,
      company: config.company,
      status: 'active',
      metadata: {
        created_by_workflow: context.workflowId
      }
    }).select().single()

    if (error) return { success: false, error: error.message }
    return { success: true, output: { client: data } }
  },

  // Create Project Action
  'create-project': async (action, context) => {
    const config = resolveVariables(action.config, context)
    const supabase = await createClient()

    const { data, error } = await supabase.from('projects').insert({
      user_id: context.userId,
      title: config.title,
      description: config.description,
      client_id: config.clientId,
      status: 'active',
      budget: config.budget,
      start_date: config.startDate,
      end_date: config.endDate,
      metadata: {
        created_by_workflow: context.workflowId
      }
    }).select().single()

    if (error) return { success: false, error: error.message }
    return { success: true, output: { project: data } }
  },

  // Create Invoice Action
  'create-invoice': async (action, context) => {
    const config = resolveVariables(action.config, context)
    const supabase = await createClient()

    const invoiceNumber = `INV-${Date.now()}`
    const { data, error } = await supabase.from('invoices').insert({
      user_id: context.userId,
      client_id: config.clientId,
      project_id: config.projectId,
      invoice_number: invoiceNumber,
      amount: config.amount,
      tax_rate: config.taxRate || 0,
      status: 'draft',
      due_date: config.dueDate,
      items: config.items || [],
      metadata: {
        created_by_workflow: context.workflowId
      }
    }).select().single()

    if (error) return { success: false, error: error.message }
    return { success: true, output: { invoice: data } }
  },

  // Send SMS Action
  'send-sms': async (action, context) => {
    const config = resolveVariables(action.config, context)

    // Log SMS for now (would integrate with Twilio/similar)
    console.log('[Kazi Workflows] SMS action:', config)

    const supabase = await createClient()
    await supabase.from('communications').insert({
      user_id: context.userId,
      type: 'sms',
      direction: 'outbound',
      content: config.message,
      recipient: config.to,
      status: 'sent',
      metadata: {
        workflow_id: context.workflowId,
        execution_id: context.executionId
      }
    })

    return { success: true, output: { smsSent: true, to: config.to } }
  },

  // Slack Message Action
  'slack-message': async (action, context) => {
    const config = resolveVariables(action.config, context)

    if (!config.webhookUrl) {
      return { success: false, error: 'Slack webhook URL required' }
    }

    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: config.message,
          channel: config.channel,
          username: config.username || 'Kazi Workflows'
        })
      })

      if (!response.ok) {
        return { success: false, error: 'Slack message failed' }
      }

      return { success: true, output: { slackSent: true } }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Slack failed' }
    }
  },

  // Assign Task Action
  'assign-task': async (action, context) => {
    const config = resolveVariables(action.config, context)
    const supabase = await createClient()

    const { error } = await supabase.from('tasks')
      .update({ assignee_id: config.assigneeId })
      .eq('id', config.taskId)
      .eq('user_id', context.userId)

    if (error) return { success: false, error: error.message }

    // Create notification for assignee
    await supabase.from('notifications').insert({
      user_id: config.assigneeId,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${config.taskTitle || 'Task'}`,
      type: 'info',
      category: 'task',
      metadata: {
        task_id: config.taskId,
        assigned_by_workflow: context.workflowId
      }
    })

    return { success: true, output: { assigned: true, taskId: config.taskId } }
  },

  // Move File Action
  'move-file': async (action, context) => {
    const config = resolveVariables(action.config, context)
    const supabase = await createClient()

    const { error } = await supabase.from('files')
      .update({ folder_id: config.targetFolderId })
      .eq('id', config.fileId)
      .eq('user_id', context.userId)

    if (error) return { success: false, error: error.message }
    return { success: true, output: { moved: true, fileId: config.fileId } }
  }
}

// Helper: Resolve variables in config
function resolveVariables(config: Record<string, any>, context: KaziExecutionContext): Record<string, any> {
  const resolved: Record<string, any> = {}

  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string') {
      // Replace {{variable}} patterns
      resolved[key] = value.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const trimmedPath = path.trim()
        // Check trigger data first
        if (trimmedPath.startsWith('trigger.')) {
          return getNestedValue(context.triggerData, trimmedPath.slice(8)) || ''
        }
        // Check previous action results
        if (trimmedPath.startsWith('action_')) {
          return getNestedValue(context.previousResults, trimmedPath) || ''
        }
        // Check variables
        return getNestedValue(context.variables, trimmedPath) || ''
      })
    } else if (typeof value === 'object' && value !== null) {
      resolved[key] = resolveVariables(value, context)
    } else {
      resolved[key] = value
    }
  }

  return resolved
}

// Helper: Get nested value from object
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined
  }, obj)
}

// Kazi Workflow Service Class
export class KaziWorkflowService {
  private static instance: KaziWorkflowService

  static getInstance(): KaziWorkflowService {
    if (!KaziWorkflowService.instance) {
      KaziWorkflowService.instance = new KaziWorkflowService()
    }
    return KaziWorkflowService.instance
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflow: KaziWorkflow,
    triggerData: Record<string, any> = {}
  ): Promise<{
    executionId: string
    status: 'completed' | 'failed'
    results: Record<string, KaziActionResult>
    error?: string
    duration: number
  }> {
    const supabase = await createClient()
    const startTime = Date.now()

    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from('workflow_executions')
      .insert({
        workflow_id: workflow.id,
        user_id: workflow.user_id,
        status: 'running',
        trigger_type: workflow.trigger_type,
        trigger_data: triggerData,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (execError) throw new Error(`Failed to create execution: ${execError.message}`)

    const context: KaziExecutionContext = {
      workflowId: workflow.id,
      executionId: execution.id,
      userId: workflow.user_id,
      triggerData,
      variables: { ...triggerData, trigger: triggerData },
      previousResults: {}
    }

    const results: Record<string, KaziActionResult> = {}
    let finalStatus: 'completed' | 'failed' = 'completed'
    let errorMessage: string | undefined

    // Sort actions by position
    const sortedActions = [...workflow.actions].sort((a, b) => a.position - b.position)

    // Execute actions
    for (const action of sortedActions) {
      // Check conditions
      if (action.conditions?.length) {
        const shouldExecute = this.evaluateConditions(action.conditions, context.variables)
        if (!shouldExecute) {
          results[action.id] = { success: true, output: { skipped: true } }
          continue
        }
      }

      const actionStartTime = Date.now()
      let result: KaziActionResult

      try {
        const handler = actionHandlers[action.type]
        if (!handler) {
          result = { success: false, error: `Unknown action type: ${action.type}` }
        } else {
          // Execute with timeout
          const timeout = action.timeoutMs || 30000
          result = await Promise.race([
            handler(action, context),
            new Promise<KaziActionResult>((_, reject) =>
              setTimeout(() => reject(new Error('Action timeout')), timeout)
            )
          ])
        }
      } catch (error) {
        result = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }

        // Retry logic
        if (action.retryConfig && action.retryConfig.maxRetries > 0) {
          for (let retry = 0; retry < action.retryConfig.maxRetries; retry++) {
            const delay = action.retryConfig.exponentialBackoff
              ? action.retryConfig.delayMs * Math.pow(2, retry)
              : action.retryConfig.delayMs

            await new Promise(resolve => setTimeout(resolve, delay))

            try {
              const handler = actionHandlers[action.type]
              if (handler) {
                result = await handler(action, context)
                if (result.success) break
              }
            } catch (retryError) {
              result = { success: false, error: retryError instanceof Error ? retryError.message : 'Retry failed' }
            }
          }
        }
      }

      result.duration = Date.now() - actionStartTime
      results[action.id] = result

      // Store output for next actions
      if (result.output) {
        context.previousResults[action.id] = result.output
        context.variables[`action_${action.id}`] = result.output
      }

      // Log action
      await supabase.from('workflow_action_logs').insert({
        execution_id: execution.id,
        action_id: action.id,
        action_type: action.type,
        action_name: action.name,
        status: result.success ? 'success' : 'failed',
        input_data: action.config,
        output_data: result.output,
        error_message: result.error,
        execution_time_ms: result.duration,
        started_at: new Date(actionStartTime).toISOString(),
        completed_at: new Date().toISOString()
      })

      // Handle failure
      if (!result.success) {
        finalStatus = 'failed'
        errorMessage = result.error
        break
      }

      // Handle branching for condition actions
      if (action.type === 'condition' && result.output?.nextAction) {
        // Skip to the specified action (would need more complex logic for full branching)
      }
    }

    const duration = Date.now() - startTime

    // Update execution record
    await supabase.from('workflow_executions').update({
      status: finalStatus,
      completed_at: new Date().toISOString(),
      execution_time_ms: duration,
      error_message: errorMessage
    }).eq('id', execution.id)

    // Update workflow stats
    const newRunCount = workflow.run_count + 1
    const newSuccessRate = finalStatus === 'completed'
      ? ((workflow.success_rate * workflow.run_count) + 100) / newRunCount
      : ((workflow.success_rate * workflow.run_count) + 0) / newRunCount

    await supabase.from('workflow_templates').update({
      run_count: newRunCount,
      success_rate: Math.round(newSuccessRate * 100) / 100,
      last_run_at: new Date().toISOString()
    }).eq('id', workflow.id)

    return {
      executionId: execution.id,
      status: finalStatus,
      results,
      error: errorMessage,
      duration
    }
  }

  /**
   * Evaluate conditions
   */
  private evaluateConditions(conditions: KaziCondition[], variables: Record<string, any>): boolean {
    let result = true
    let logic: 'and' | 'or' = 'and'

    for (const condition of conditions) {
      const fieldValue = getNestedValue(variables, condition.field)
      let conditionResult = false

      switch (condition.operator) {
        case 'equals': conditionResult = fieldValue === condition.value; break
        case 'not-equals': conditionResult = fieldValue !== condition.value; break
        case 'contains': conditionResult = String(fieldValue).includes(String(condition.value)); break
        case 'greater': conditionResult = Number(fieldValue) > Number(condition.value); break
        case 'less': conditionResult = Number(fieldValue) < Number(condition.value); break
        case 'exists': conditionResult = fieldValue !== undefined && fieldValue !== null; break
        case 'not-exists': conditionResult = fieldValue === undefined || fieldValue === null; break
        case 'matches': conditionResult = new RegExp(condition.value).test(String(fieldValue)); break
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
   * Get workflow templates
   */
  async getTemplates(category?: KaziWorkflowCategory): Promise<KaziWorkflow[]> {
    const supabase = await createClient()

    let query = supabase
      .from('workflow_templates')
      .select('*')
      .eq('is_template', true)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query.order('usage_count', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Create workflow from template
   */
  async createFromTemplate(
    templateId: string,
    name: string,
    userId: string
  ): Promise<KaziWorkflow> {
    const supabase = await createClient()

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError) throw templateError

    // Create new workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflow_templates')
      .insert({
        user_id: userId,
        name,
        description: template.description,
        trigger_type: template.trigger_type,
        trigger_config: template.trigger_config,
        actions: template.actions,
        category: template.category,
        tags: template.tags,
        is_active: false,
        is_template: false
      })
      .select()
      .single()

    if (workflowError) throw workflowError

    // Increment template usage
    await supabase.rpc('increment_template_usage', { template_id: templateId })

    return workflow
  }
}

// Export singleton
export const kaziWorkflowService = KaziWorkflowService.getInstance()

// Export action types for UI
export const KAZI_ACTION_DEFINITIONS = {
  'email': {
    label: 'Send Email',
    icon: 'Mail',
    color: '#EC4899',
    description: 'Send an email to one or more recipients',
    category: 'communication'
  },
  'notification': {
    label: 'Send Notification',
    icon: 'Bell',
    color: '#06B6D4',
    description: 'Send in-app notification',
    category: 'communication'
  },
  'create-task': {
    label: 'Create Task',
    icon: 'FileText',
    color: '#84CC16',
    description: 'Create a new task',
    category: 'productivity'
  },
  'update-record': {
    label: 'Update Record',
    icon: 'Database',
    color: '#F97316',
    description: 'Update a database record',
    category: 'data'
  },
  'api-call': {
    label: 'API Call',
    icon: 'Globe',
    color: '#6366F1',
    description: 'Make an external API request',
    category: 'integration'
  },
  'delay': {
    label: 'Delay',
    icon: 'Timer',
    color: '#78716C',
    description: 'Wait before continuing',
    category: 'control'
  },
  'condition': {
    label: 'Condition',
    icon: 'GitBranch',
    color: '#EAB308',
    description: 'Branch based on conditions',
    category: 'control'
  },
  'create-client': {
    label: 'Create Client',
    icon: 'UserPlus',
    color: '#10B981',
    description: 'Create a new client',
    category: 'crm'
  },
  'create-project': {
    label: 'Create Project',
    icon: 'FolderPlus',
    color: '#3B82F6',
    description: 'Create a new project',
    category: 'productivity'
  },
  'create-invoice': {
    label: 'Create Invoice',
    icon: 'Receipt',
    color: '#8B5CF6',
    description: 'Create a new invoice',
    category: 'finance'
  },
  'send-sms': {
    label: 'Send SMS',
    icon: 'MessageSquare',
    color: '#14B8A6',
    description: 'Send SMS message',
    category: 'communication'
  },
  'slack-message': {
    label: 'Slack Message',
    icon: 'Hash',
    color: '#4A154B',
    description: 'Send Slack message',
    category: 'integration'
  },
  'assign-task': {
    label: 'Assign Task',
    icon: 'UserCheck',
    color: '#059669',
    description: 'Assign task to team member',
    category: 'productivity'
  },
  'move-file': {
    label: 'Move File',
    icon: 'FolderInput',
    color: '#0EA5E9',
    description: 'Move file to folder',
    category: 'data'
  }
}

export const KAZI_TRIGGER_DEFINITIONS = {
  'manual': {
    label: 'Manual Trigger',
    icon: 'Play',
    color: '#10B981',
    description: 'Start workflow manually'
  },
  'schedule': {
    label: 'Schedule',
    icon: 'Clock',
    color: '#3B82F6',
    description: 'Run on a schedule'
  },
  'webhook': {
    label: 'Webhook',
    icon: 'Webhook',
    color: '#8B5CF6',
    description: 'Triggered by HTTP request'
  },
  'event': {
    label: 'Event Trigger',
    icon: 'Zap',
    color: '#F59E0B',
    description: 'React to system events'
  },
  'form': {
    label: 'Form Submission',
    icon: 'FileInput',
    color: '#EC4899',
    description: 'Triggered when form is submitted'
  },
  'record-change': {
    label: 'Record Change',
    icon: 'Database',
    color: '#06B6D4',
    description: 'Triggered when data changes'
  }
}
