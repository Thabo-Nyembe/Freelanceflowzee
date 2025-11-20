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
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'welcome-email',
    name: 'Welcome New Client',
    description: 'Send automated welcome email when new client signs up',
    category: 'sales',
    icon: '👋',
    usageCount: 245,
    tags: ['email', 'onboarding', 'client'],
    trigger: {
      id: 'trigger-1',
      type: 'event',
      enabled: true,
      config: {
        event: {
          type: 'client.created',
          source: 'crm'
        }
      }
    },
    actions: [
      {
        id: 'action-1',
        type: 'email',
        position: 1,
        config: {
          email: {
            to: ['{{client.email}}'],
            subject: 'Welcome to {{company.name}}!',
            body: 'Hi {{client.name}}, welcome aboard!',
            template: 'welcome-email'
          }
        }
      },
      {
        id: 'action-2',
        type: 'create-task',
        position: 2,
        config: {
          task: {
            title: 'Follow up with {{client.name}}',
            description: 'Schedule onboarding call',
            priority: 'high',
            assignee: 'sales-team'
          }
        }
      }
    ]
  },
  {
    id: 'invoice-reminder',
    name: 'Invoice Reminder',
    description: 'Send reminder for overdue invoices',
    category: 'operations',
    icon: '💵',
    usageCount: 189,
    tags: ['invoice', 'payment', 'reminder'],
    trigger: {
      id: 'trigger-2',
      type: 'schedule',
      enabled: true,
      config: {
        schedule: {
          frequency: 'daily',
          time: '09:00',
          timezone: 'UTC'
        }
      }
    },
    actions: [
      {
        id: 'action-3',
        type: 'email',
        position: 1,
        config: {
          email: {
            to: ['{{client.email}}'],
            subject: 'Payment Reminder - Invoice {{invoice.number}}',
            body: 'Your invoice is overdue',
            template: 'invoice-reminder'
          }
        }
      }
    ]
  },
  {
    id: 'lead-nurture',
    name: 'Lead Nurture Sequence',
    description: 'Automated email sequence for new leads',
    category: 'marketing',
    icon: '🎯',
    usageCount: 312,
    tags: ['lead', 'nurture', 'email-sequence'],
    trigger: {
      id: 'trigger-3',
      type: 'event',
      enabled: true,
      config: {
        event: {
          type: 'lead.created',
          source: 'lead-generation'
        }
      }
    },
    actions: [
      {
        id: 'action-4',
        type: 'delay',
        position: 1,
        config: {
          delay: {
            duration: 1,
            unit: 'days'
          }
        }
      },
      {
        id: 'action-5',
        type: 'email',
        position: 2,
        config: {
          email: {
            to: ['{{lead.email}}'],
            subject: 'Day 1: Getting Started',
            body: 'Welcome to our nurture sequence'
          }
        }
      }
    ]
  },
  {
    id: 'support-ticket',
    name: 'Support Ticket Assignment',
    description: 'Auto-assign support tickets based on priority',
    category: 'support',
    icon: '🎫',
    usageCount: 156,
    tags: ['support', 'ticket', 'assignment'],
    trigger: {
      id: 'trigger-4',
      type: 'event',
      enabled: true,
      config: {
        event: {
          type: 'ticket.created',
          source: 'support'
        }
      }
    },
    actions: [
      {
        id: 'action-6',
        type: 'condition',
        position: 1,
        config: {
          condition: {
            conditions: [
              {
                field: 'priority',
                operator: 'equals',
                value: 'high'
              }
            ],
            logic: 'and'
          }
        }
      },
      {
        id: 'action-7',
        type: 'notification',
        position: 2,
        config: {
          notification: {
            recipients: ['support-lead@company.com'],
            title: 'High Priority Ticket',
            message: 'New high-priority ticket needs attention',
            priority: 'high',
            channels: ['app', 'email']
          }
        }
      }
    ]
  },
  {
    id: 'project-milestone',
    name: 'Project Milestone Alert',
    description: 'Notify team when project milestones are reached',
    category: 'operations',
    icon: '🎯',
    usageCount: 98,
    tags: ['project', 'milestone', 'notification'],
    trigger: {
      id: 'trigger-5',
      type: 'event',
      enabled: true,
      config: {
        event: {
          type: 'milestone.completed',
          source: 'projects'
        }
      }
    },
    actions: [
      {
        id: 'action-8',
        type: 'notification',
        position: 1,
        config: {
          notification: {
            recipients: ['{{project.team}}'],
            title: 'Milestone Completed! 🎉',
            message: '{{milestone.name}} has been completed',
            priority: 'medium',
            channels: ['app']
          }
        }
      }
    ]
  }
]

// Mock Workflows
export const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: 'workflow-1',
    name: 'Client Onboarding',
    description: 'Automated client onboarding process',
    status: 'active',
    trigger: WORKFLOW_TEMPLATES[0].trigger,
    actions: WORKFLOW_TEMPLATES[0].actions,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-20'),
    lastRun: new Date('2025-01-21'),
    nextRun: undefined,
    runCount: 45,
    successRate: 97.8
  },
  {
    id: 'workflow-2',
    name: 'Daily Invoice Check',
    description: 'Check and remind overdue invoices',
    status: 'active',
    trigger: WORKFLOW_TEMPLATES[1].trigger,
    actions: WORKFLOW_TEMPLATES[1].actions,
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-20'),
    lastRun: new Date('2025-01-21'),
    nextRun: new Date('2025-01-22'),
    runCount: 17,
    successRate: 100
  },
  {
    id: 'workflow-3',
    name: 'Lead Nurturing Campaign',
    description: '7-day email nurture sequence',
    status: 'active',
    trigger: WORKFLOW_TEMPLATES[2].trigger,
    actions: WORKFLOW_TEMPLATES[2].actions,
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-18'),
    lastRun: new Date('2025-01-20'),
    nextRun: undefined,
    runCount: 23,
    successRate: 95.7
  },
  {
    id: 'workflow-4',
    name: 'Support Ticket Router',
    description: 'Auto-route support tickets',
    status: 'paused',
    trigger: WORKFLOW_TEMPLATES[3].trigger,
    actions: WORKFLOW_TEMPLATES[3].actions,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-19'),
    lastRun: new Date('2025-01-19'),
    nextRun: undefined,
    runCount: 8,
    successRate: 87.5
  }
]

// Mock Executions
export const MOCK_EXECUTIONS: WorkflowExecution[] = [
  {
    id: 'exec-1',
    workflowId: 'workflow-1',
    startTime: new Date('2025-01-21T10:30:00'),
    endTime: new Date('2025-01-21T10:30:05'),
    status: 'success',
    triggeredBy: 'event:client.created',
    steps: [
      {
        actionId: 'action-1',
        actionType: 'email',
        startTime: new Date('2025-01-21T10:30:01'),
        endTime: new Date('2025-01-21T10:30:03'),
        status: 'success',
        duration: 2000
      },
      {
        actionId: 'action-2',
        actionType: 'create-task',
        startTime: new Date('2025-01-21T10:30:03'),
        endTime: new Date('2025-01-21T10:30:05'),
        status: 'success',
        duration: 2000
      }
    ],
    input: { clientId: 'client-123', clientName: 'Acme Corp' },
    output: { emailSent: true, taskCreated: true }
  },
  {
    id: 'exec-2',
    workflowId: 'workflow-2',
    startTime: new Date('2025-01-21T09:00:00'),
    endTime: new Date('2025-01-21T09:00:12'),
    status: 'success',
    triggeredBy: 'schedule:daily',
    steps: [
      {
        actionId: 'action-3',
        actionType: 'email',
        startTime: new Date('2025-01-21T09:00:00'),
        endTime: new Date('2025-01-21T09:00:12'),
        status: 'success',
        duration: 12000
      }
    ],
    input: { overdueInvoices: 3 },
    output: { remindersSent: 3 }
  },
  {
    id: 'exec-3',
    workflowId: 'workflow-3',
    startTime: new Date('2025-01-20T14:15:00'),
    endTime: new Date('2025-01-20T14:15:08'),
    status: 'failed',
    triggeredBy: 'event:lead.created',
    steps: [
      {
        actionId: 'action-4',
        actionType: 'delay',
        startTime: new Date('2025-01-20T14:15:00'),
        endTime: new Date('2025-01-20T14:15:01'),
        status: 'success',
        duration: 1000
      },
      {
        actionId: 'action-5',
        actionType: 'email',
        startTime: new Date('2025-01-20T14:15:01'),
        endTime: new Date('2025-01-20T14:15:08'),
        status: 'failed',
        error: 'Email server timeout',
        duration: 7000
      }
    ],
    input: { leadId: 'lead-456' },
    error: 'Failed to send email'
  }
]

// Automation Metrics
export const AUTOMATION_METRICS: AutomationMetrics = {
  totalWorkflows: 24,
  activeWorkflows: 18,
  totalExecutions: 1847,
  successRate: 96.2,
  averageExecutionTime: 3.4,
  automationsSaved: 245,
  mostUsedTrigger: 'Event',
  mostUsedAction: 'Email'
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
