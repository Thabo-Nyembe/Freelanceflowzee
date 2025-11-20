/**
 * Workflow Automation Types
 * Visual workflow builder with triggers, actions, and conditions
 */

export type TriggerType = 'schedule' | 'event' | 'webhook' | 'manual' | 'form-submit' | 'record-change'
export type ActionType = 'email' | 'notification' | 'create-task' | 'update-record' | 'api-call' | 'delay' | 'condition'
export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'error' | 'completed'
export type ConditionOperator = 'equals' | 'not-equals' | 'contains' | 'greater' | 'less' | 'exists' | 'not-exists'
export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped'

export interface Workflow {
  id: string
  name: string
  description: string
  status: WorkflowStatus
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
  createdAt: Date
  updatedAt: Date
  lastRun?: Date
  nextRun?: Date
  runCount: number
  successRate: number
}

export interface WorkflowTrigger {
  id: string
  type: TriggerType
  config: TriggerConfig
  enabled: boolean
}

export interface TriggerConfig {
  // Schedule triggers
  schedule?: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly'
    time?: string
    dayOfWeek?: number
    dayOfMonth?: number
    timezone: string
  }

  // Event triggers
  event?: {
    type: string
    source: string
    filters?: Condition[]
  }

  // Webhook triggers
  webhook?: {
    url: string
    secret?: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  }

  // Form triggers
  form?: {
    formId: string
    fields?: string[]
  }

  // Record change triggers
  recordChange?: {
    entity: string
    changeType: 'create' | 'update' | 'delete'
    fields?: string[]
  }
}

export interface WorkflowAction {
  id: string
  type: ActionType
  position: number
  config: ActionConfig
  conditions?: Condition[]
  onSuccess?: string // Next action ID
  onFailure?: string // Next action ID
}

export interface ActionConfig {
  // Email action
  email?: {
    to: string[]
    cc?: string[]
    bcc?: string[]
    subject: string
    body: string
    template?: string
    attachments?: string[]
  }

  // Notification action
  notification?: {
    recipients: string[]
    title: string
    message: string
    priority: 'low' | 'medium' | 'high'
    channels: ('app' | 'email' | 'sms')[]
  }

  // Task creation
  task?: {
    title: string
    description: string
    assignee?: string
    dueDate?: string
    priority: 'low' | 'medium' | 'high'
    project?: string
  }

  // Record update
  recordUpdate?: {
    entity: string
    recordId: string
    fields: Record<string, any>
  }

  // API call
  apiCall?: {
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    headers?: Record<string, string>
    body?: any
    responseMapping?: Record<string, string>
  }

  // Delay
  delay?: {
    duration: number
    unit: 'seconds' | 'minutes' | 'hours' | 'days'
  }

  // Conditional branching
  condition?: {
    conditions: Condition[]
    logic: 'and' | 'or'
    ifTrue?: string // Action ID
    ifFalse?: string // Action ID
  }
}

export interface Condition {
  field: string
  operator: ConditionOperator
  value: any
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: 'sales' | 'marketing' | 'operations' | 'support' | 'hr' | 'custom'
  icon: string
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
  tags: string[]
  usageCount: number
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  startTime: Date
  endTime?: Date
  status: ExecutionStatus
  triggeredBy: string
  steps: ExecutionStep[]
  input?: any
  output?: any
  error?: string
}

export interface ExecutionStep {
  actionId: string
  actionType: ActionType
  startTime: Date
  endTime?: Date
  status: ExecutionStatus
  input?: any
  output?: any
  error?: string
  duration: number
}

export interface AutomationMetrics {
  totalWorkflows: number
  activeWorkflows: number
  totalExecutions: number
  successRate: number
  averageExecutionTime: number
  automationsSaved: number
  mostUsedTrigger: string
  mostUsedAction: string
}
