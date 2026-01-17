import type {
  Workflow,
  WorkflowTemplate,
  WorkflowExecution,
  AutomationMetrics,
  WorkflowStatus,
  TriggerType,
  ActionType,
  ExecutionStatus
} from './automation-types'

// Workflow Templates
// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = []

// Mock Workflows
// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const MOCK_WORKFLOWS: Workflow[] = []

// Mock Executions
// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const MOCK_EXECUTIONS: WorkflowExecution[] = []

// Automation Metrics
// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const AUTOMATION_METRICS: AutomationMetrics = {
  totalWorkflows: 0,
  activeWorkflows: 0,
  totalExecutions: 0,
  successRate: 0,
  averageExecutionTime: 0,
  automationsSaved: 0,
  mostUsedTrigger: '',
  mostUsedAction: ''
}

// Helper Functions
export function getStatusColor(status: WorkflowStatus | ExecutionStatus): string {
  const colors: Record<WorkflowStatus | ExecutionStatus, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    error: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    running: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    skipped: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
  }
  return colors[status]
}

export function getTriggerIcon(type: TriggerType): string {
  const icons: Record<TriggerType, string> = {
    schedule: '⏰',
    event: '⚡',
    webhook: '🔗',
    manual: '👆',
    'form-submit': '📝',
    'record-change': '📊'
  }
  return icons[type]
}

export function getActionIcon(type: ActionType): string {
  const icons: Record<ActionType, string> = {
    email: '📧',
    notification: '🔔',
    'create-task': '✅',
    'update-record': '📝',
    'api-call': '🔌',
    delay: '⏱️',
    condition: '🔀'
  }
  return icons[type]
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

export function calculateSuccessRate(executions: WorkflowExecution[]): number {
  if (executions.length === 0) return 0
  const successful = executions.filter(e => e.status === 'success').length
  return (successful / executions.length) * 100
}

export function getWorkflowsByStatus(status: WorkflowStatus): Workflow[] {
  return MOCK_WORKFLOWS.filter(w => w.status === status)
}

export function getTemplatesByCategory(category: string): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter(t => t.category === category)
}

export function exportWorkflow(workflow: Workflow): string {
  return JSON.stringify(workflow, null, 2)
}

export function importWorkflow(json: string): Workflow | null {
  try {
    return JSON.parse(json) as Workflow
  } catch {
    return null
  }
}
